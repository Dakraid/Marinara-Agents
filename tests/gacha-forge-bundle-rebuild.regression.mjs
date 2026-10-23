import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { rebuildGachaBundles } from "../scripts/gacha-forge-bundle-patches.mjs";

const directory = await mkdtemp(join(tmpdir(), "gacha-rebuild-"));
const root = pathToFileURL(directory + "/");
try {
  const sourceRoot = new URL("../packages/gacha-forge/", import.meta.url);
  for (const file of ["client.js", "server.mjs", "bundle-patches.json", "src"]) {
    await cp(new URL(file, sourceRoot), new URL(file, root), { recursive: true });
  }
  const originalClient = await readFile(new URL("client.js", root), "utf8");
  const originalServer = await readFile(new URL("server.mjs", root), "utf8");
  await rebuildGachaBundles(root);
  assert.equal(await readFile(new URL("client.js", root), "utf8"), originalClient, "clean replay is byte-identical");
  for (const name of ["browser-presentation", "player-choices-en", "player-choices-client", "player-choices-server"]) {
    const source = new URL(`src/${name}.mjs`, root);
    const bundle = name.endsWith("server") ? "server.mjs" : "client.js";
    const original = bundle === "server.mjs" ? originalServer : originalClient;
    const before = await readFile(source, "utf8");
    await writeFile(source, before + "\n// source rebuild proof\n");
    await rebuildGachaBundles(root);
    const regenerated = await readFile(new URL(bundle, root), "utf8");
    assert.ok(regenerated.includes("// source rebuild proof"), `${name} changes regenerate their own source marker`);
    await rebuildGachaBundles(root);
    assert.equal(await readFile(new URL(bundle, root), "utf8"), regenerated, `${name} replay is deterministic`);
    await writeFile(source, before);
    await rebuildGachaBundles(root);
    assert.equal(await readFile(new URL(bundle, root), "utf8"), original, `${name} restoring source restores bytes`);
  }
  assert.equal(await readFile(new URL("client.js", root), "utf8"), originalClient, "client sources stay independent");
  assert.equal(await readFile(new URL("server.mjs", root), "utf8"), originalServer, "server sources stay independent");
  await writeFile(new URL("client.js", root), originalClient + "\n// unknown bundle edit");
  await assert.rejects(rebuildGachaBundles(root), /Unrecognized Forge bundle client\.js/u);
  console.log("Forge bundle source rebuild regression passed.");
} finally {
  await rm(directory, { recursive: true, force: true });
}
