/**
 * #103: the persona browsing Slurp was kept per browser, so the host PC showed an empty Inbox while
 * the phone and a remote browser showed 87 unread for another persona. The pick now lives in the
 * Slurp settings, which every device reads.
 */
import assert from "node:assert/strict";
import { slurp2Source } from "./slurp2-source";

// The settings module needs the Engine's logger, so it is read, not imported.
const settings = slurp2Source("packages/slurp2/src/engine/packages/server/src/slp/modules/settings/slp-settings.ts");
assert.match(
  settings,
  /viewerPersonaId: z\.string\(\)\.max\(200\)\.nullable\(\),/u,
  "the settings keep the shared pick",
);
assert.match(settings, /viewerPersonaId: null,\n\};/u, "an install that never picked has no shared pick");

const homeState = slurp2Source("packages/slurp2/src/engine/packages/client/src/slp/app/slp-home-state.ts");
const switcher = homeState.slice(homeState.indexOf("const switchViewerPersona"));
assert.match(
  switcher.slice(0, switcher.indexOf("};")),
  /saveViewerPersona\(\{ viewerPersonaId: account\.entityId \}\)/u,
  "a pick in the account switcher is saved for every device",
);
assert.match(
  homeState,
  /if \(serverPersonaId\) setStoredPersonaId\(serverPersonaId\);\s*else if \(storedPersonaId\) saveViewerPersona/u,
  "a browser follows the shared pick, and saves its own older pick once",
);

const sceneHooks = slurp2Source(
  "packages/slurp2/src/engine/packages/client/src/slp/features/messages/scenes/slp-roleplay-scene-hooks.ts",
);
assert.match(sceneHooks, /api\.patch\("\/slurp2\/settings", \{ viewerPersonaId: origin\.personaId \}\)/u);

console.log("slurp2 viewer persona shared regression passed");
