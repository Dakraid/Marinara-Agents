import assert from "node:assert/strict";

import { slurp2Source } from "./slurp2-source";

const root = "packages/slurp2/src/engine/packages/";
const client = `${root}client/src/slp/`;
const read = (path: string) => slurp2Source(`${root}${path}`);
const homeState = read("client/src/slp/app/slp-home-state.ts");
const hub = read("client/src/slp/app/screens/SlpScreenHub.tsx");
const inputs = read("client/src/slp/modules/settings/SlpSettingsInputs.tsx");
const controls = read("client/src/slp/modules/settings/SlpSettingsControls.tsx");
const nav = read("client/src/slp/features/backstage/SlpBackstageNavigation.tsx");
const placement = read("client/src/slp/features/backstage/slp-backstage-placement.ts");
const scheduler = read("server/src/slp/features/world/slp-world-scheduler-service.ts");
const settings = read("server/src/slp/modules/settings/slp-settings.ts");
void client;

// 1. Fresh install: the age gate completes onboarding at once and the player lands on the empty
// feed; the welcome questions run only from "Run setup again".
const gate = homeState.slice(homeState.indexOf("const enterFromGate"), homeState.indexOf("const closeOnboarding"));
assert.match(gate, /setOnboardingState\("completed"\)/u);
assert.match(gate, /onboarding: "completed"/u);
assert.match(gate, /onNavigate\(\{ mode: "creator", view: "hub" \}\)/u);
assert.doesNotMatch(gate, /setOnboardingMode/u, "the gate opens no welcome questions");
assert.match(hub, /<SlpEmptyState/u, "the hub has an empty state for the first visit");

// 2. No text connection at the end of the first run: manual pace, and the finish is never blocked.
assert.match(gate, /api\s*\.get<.*>\("\/connections"\)/u);
assert.match(gate, /\.catch\(\(\) => false\)/u, "a failed lookup leaves the pace alone");
assert.match(gate, /slurpActivityPresetPatch\("manual"\)/u);

// 3. Spice is a page of its own with no SlurpSettings key, so search lists it as a page.
assert.match(placement, /SLP_BACKSTAGE_PAGE_PLACEMENT[\s\S]*spice: slurp\("spice"/u);
assert.match(nav, /\.\.\.SLP_BACKSTAGE_PAGE_PLACEMENT/u);

// 5. Accessibility: names that say what the control is.
assert.match(inputs, /role="switch"\s+aria-labelledby=\{labelId\}/u, "Own value switch is named by its field");
assert.match(controls, /aria-label=\{label \? `\$\{label\}: −1` : "−1"\}/u, "stepper buttons name their field");
assert.match(
  controls,
  /aria-labelledby=\{nameId\}[\s\S]*aria-describedby=/u,
  "toggle name is the label, not the detail",
);
assert.doesNotMatch(controls, /aria-label=\{title\}\s*>\s*<h3/u, "a settings group is not a landmark");
assert.match(inputs, /<fieldset disabled=\{off\} aria-describedby=/u, "choice detail and reason reach the group");

// 6. Wallet comment matches the default.
assert.match(settings, /walletEnabled: true/u);
assert.doesNotMatch(settings, /Wallet economy\. Off by default/u);

// 7. The trends tick never fails the world tick.
assert.match(scheduler, /advanceSlurpTrends\(app\.db, new Date\(\)\)\.catch\(/u);
console.log("slurp2 quick wins ok");
