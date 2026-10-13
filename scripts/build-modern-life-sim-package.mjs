// Build the Modern Life Sim package: bundle client.js and server.mjs from the package's
// own src/ tree, re-derive its manifest hashes and English locale, write a reproducible
// artifact zip, and update the catalog family.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogArtworkUrl } from "./catalog-artwork.mjs";
import { readCatalogFamily, writeCatalogFamily } from "./catalog-lanes.mjs";
import { withPackageActivationGuidance } from "./catalog-package-guidance.mjs";
import { resolveContainedPortablePath } from "./catalog-path-safety.mjs";
import { writeEnglishPackageLocale } from "./package-locales.mjs";
import { createDeterministicZip } from "./deterministic-zip.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(repoRoot, "packages/modern-life-sim");
const artifactsDir = join(repoRoot, "artifacts");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

// esbuild's POSIX bin is a native executable; Windows ships a JS shim that needs node.
const esbuildBin = join(repoRoot, "node_modules/esbuild/bin/esbuild");
function bundle(entry, outfile, args) {
  const argv = [
    join(packageRoot, entry),
    "--bundle",
    "--format=esm",
    "--legal-comments=inline",
    "--log-level=warning",
    `--outfile=${join(packageRoot, outfile)}`,
    ...args,
  ];
  const result =
    process.platform === "win32"
      ? spawnSync(process.execPath, [esbuildBin, ...argv], { encoding: "utf8" })
      : spawnSync(esbuildBin, argv, { encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(result.stderr || result.stdout || result.error?.message || `esbuild failed for ${entry}`);
}
bundle("src/server/index.mjs", "server.mjs", ["--platform=node", "--minify"]);
// The client keeps its top-level names (as the original build did); only whitespace and syntax are minified.
bundle("src/client/element.js", "client.js", ["--platform=browser", "--minify-whitespace", "--minify-syntax"]);

const manifest = JSON.parse(await readFile(join(packageRoot, "manifest.json"), "utf8"));
manifest.description = withPackageActivationGuidance(manifest.id, manifest.description);

const agentDefinitions = JSON.parse(await readFile(join(packageRoot, "agents.json"), "utf8"));
const agentsBuffer = Buffer.from(`${JSON.stringify(agentDefinitions, null, 2)}\n`);
await writeFile(join(packageRoot, "agents.json"), agentsBuffer);

// The declared payload paths are the contract; their hashes and sizes are re-derived
// from the committed bytes so they can never drift from what actually ships.
const payloads = [];
for (const declared of manifest.files) {
  const path = await resolveContainedPortablePath(packageRoot, declared.path, `Payload for ${manifest.id}`);
  const buffer = declared.path === "agents.json" ? agentsBuffer : await readFile(path);
  payloads.push({ name: declared.path, buffer });
}
manifest.files = payloads.map(({ name, buffer }) => ({ path: name, sha256: sha256(buffer), bytes: buffer.byteLength }));

const manifestBuffer = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(join(packageRoot, "manifest.json"), manifestBuffer);
await writeEnglishPackageLocale(packageRoot, manifest, agentDefinitions);

const archive = createDeterministicZip([
  { name: "manifest.json", data: manifestBuffer },
  ...payloads.map(({ name, buffer }) => ({ name, data: buffer })),
]);
await mkdir(artifactsDir, { recursive: true });
const artifactPath = join(artifactsDir, `modern-life-sim-${manifest.version}.zip`);
await writeFile(artifactPath, archive);

const { catalog } = await readCatalogFamily(repoRoot);
catalog.packages = catalog.packages.filter((entry) => entry.manifest.id !== "modern-life-sim");
catalog.packages.push({
  manifest,
  category: "misc",
  iconUrl: catalogArtworkUrl("modern-life-sim"),
  artifact: {
    url: `https://raw.githubusercontent.com/Dakraid/Marinara-Agents/main/artifacts/${basename(artifactPath)}`,
    sha256: sha256(archive),
    bytes: archive.byteLength,
  },
  documentationUrl: "https://github.com/Dakraid/Marinara-Agents/blob/staging/packages/modern-life-sim/README.md",
});
catalog.packages.sort((left, right) => left.manifest.name.localeCompare(right.manifest.name));
// generatedAt is resolved centrally in writeCatalogFamily (preserved by
// default; refreshed only when MARINARA_CATALOG_STAMP_GENERATED_AT=1).
await writeCatalogFamily(repoRoot, catalog);

console.log(`built modern-life-sim ${manifest.version}`);
console.log(`  ${payloads.length} payload files, artifact ${archive.byteLength} bytes`);
