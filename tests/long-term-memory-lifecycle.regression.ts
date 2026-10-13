import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { runRegressionToCompletion } from "./regression-helpers.ts";

// Each scenario runs in its own process: the browser lane resolves the vendored shared package through the
// regressions tsconfig, while the installation lane boots the real Engine server and needs plain tsx.
const scenarios = [
  ["tests/long-term-memory-browser.regression.ts", ["--tsconfig", "tests/tsconfig.regressions.json"]],
  ["tests/long-term-memory-installation.regression.ts", []],
] as const;

async function main() {
  const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
  for (const [lane, flags] of scenarios) {
    // A parent tsx passes its tsconfig down through TSX_* variables; each scenario picks its own.
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("TSX_")));
    const result = spawnSync(process.execPath, [tsxCli, ...flags, lane], { stdio: "inherit", env });
    if (result.status !== 0) throw new Error(`${lane} failed (exit ${result.status ?? result.signal})`);
  }
  console.log("Long-Term Memory lifecycle: browser and installation scenarios ok");
}

export const completion = runRegressionToCompletion("long-term-memory-lifecycle", main);
void completion.catch((error) => {
  process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
  process.exitCode = 1;
});
