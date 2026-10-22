/**
 * S — Slurp ships its own pictures: every `/api/capability-packages/slurp2/assets/…` the client
 * names is a file in the package and listed in the builder's `assetPaths` (a missing one 404s).
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PREFIX = "/api/capability-packages/slurp2/assets/";
const builder = readFileSync("scripts/build-feature-packages.mjs", "utf8");
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : /\.tsx?$/u.test(entry.name) ? [join(dir, entry.name)] : [],
  );
const used = new Set<string>();
for (const file of files("packages/slurp2/src/engine/packages/client/src/slp"))
  for (const match of readFileSync(file, "utf8").matchAll(/"\/api\/capability-packages\/slurp2\/assets\/([^"]+)"/gu))
    used.add(match[1]!);
assert.ok(used.size >= 3, `the onboarding pictures are named (${used.size})`);
for (const path of used) {
  assert.ok(existsSync(join("packages/slurp2", path)), `${PREFIX}${path} is in the package`);
  assert.ok(builder.includes(`"${path}"`), `${path} is in assetPaths`);
}
console.log("slurp2 bundled pictures: ok");
