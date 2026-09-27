/** Fix phase 1b (user decisions on fix phase 1 "Needs the user"): behaviour checks per decision. */
import assert from "node:assert/strict";
import {
  slpCanAffordGamble,
  slpGambleUnlockPrice,
} from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-post-offers.ts";
import {
  readSlurpModelBudgetLedger,
  slurpModelBudgetPacedCap,
  slurpModelBudgetSchema,
  spendSlurpModelBudget,
} from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-model-budget.ts";
import { protectCreatorGeneratedIdentity } from "../packages/slurp2/src/engine/packages/server/src/slp/base/identity/slp-identity-protection.ts";
import {
  buildSlpFanVoiceDraftMessages,
  cleanSlpFanVoiceDraft,
  slpFanVoiceDraftSchema,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/audience/slp-fan-voice-draft.ts";
import { slurp2Source } from "./slurp2-source.ts";

const root = "packages/slurp2/src/engine/packages";
const readSlurp2Source = (side: "client" | "server" | "shared", path: string) =>
  slurp2Source(`${root}/${side}/src/slp/${path}`);

// R1-091: the gamble is blocked when the balance cannot pay the losing side (3x); no wallet = no block.
assert.equal(slpGambleUnlockPrice(25, false), 75);
assert.equal(slpCanAffordGamble(74, 25), false, "one coin short cannot bet");
assert.equal(slpCanAffordGamble(75, 25), true, "exactly 3x can bet");
assert.equal(slpCanAffordGamble(null, 25), true, "SlurpCoins off: nothing to check");
const walletRoutes = readSlurp2Source("server", "features/economy/slp-wallet-routes.ts");
const gamble = walletRoutes.slice(walletRoutes.indexOf('"/slurp/posts/:id/gamble-unlock"'));
assert.ok(
  gamble.indexOf("slpCanAffordGamble(wallet.coins, basePrice)") < gamble.indexOf("randomInt(2)"),
  "the server checks the balance before it rolls",
);
const card = readSlurp2Source("client", "modules/post/SlpLockedPostCard.tsx");
assert.match(card, /disabled=\{unlockPending \|\| transaction !== null \|\| gambleBlocked\}/u);
assert.match(card, /ui\.slurp\.unlocksheet\.gambleNeedsCoins/u, "the reason is on the button");

// R1-106: world model work is spread evenly over the (UTC ledger) day; a player's own reply never is.
const at = (hour: number) => new Date(Date.UTC(2026, 8, 27, hour, 0, 0));
assert.equal(slurpModelBudgetPacedCap(20, at(0)), 1, "the first call of the day gets through");
assert.equal(slurpModelBudgetPacedCap(20, at(12)), 11, "half the day, about half the calls");
assert.equal(slurpModelBudgetPacedCap(20, new Date(Date.UTC(2026, 8, 27, 23, 59))), 20, "all of it by the evening");
assert.equal(slurpModelBudgetPacedCap(2, at(1)), 1);
const budget = slurpModelBudgetSchema.parse({ callsPerHour: 100, callsPerDay: 20 });
const early = { ...readSlurpModelBudgetLedger(null, at(1)), callsToday: 2 };
assert.equal(spendSlurpModelBudget(budget, early, "rewrite", at(1)), null, "paced upkeep waits for the clock");
assert.ok(spendSlurpModelBudget(budget, early, "rewrite"), "unpaced (a player's request) goes through");
assert.ok(spendSlurpModelBudget(budget, early, "dm_reply"), "replies are never paced");
const evening = { ...readSlurpModelBudgetLedger(null, at(20)), callsToday: 2 };
assert.ok(spendSlurpModelBudget(budget, evening, "rewrite", at(20)), "a quiet morning's allowance carries over");
// Presence from the cheap badge poll; the world clock runs every wake while the player is here.
const badge = readSlurp2Source("server", "features/notifications/slp-notifications-routes.ts");
assert.match(badge, /markSlurpPlayerPresent\(\);\s*return \{ unseenCount/u);
const worldScheduler = readSlurp2Source("server", "features/world/slp-world-scheduler-service.ts");
assert.match(worldScheduler, /if \(!present && !slurpWorldTimerDue\(clock, lastRunMs, Date\.now\(\)\)\) return;/u);
assert.match(worldScheduler, /const context = present \? "present" : "background";/u);
assert.match(worldScheduler, /await drainSlurpPendingText\(app\.db, undefined, context\)/u);
assert.match(worldScheduler, /await drainSlurpContinuityExtraction\(app\.db, context\)/u);
assert.match(
  worldScheduler,
  /if \(present\)\s*await drainSlurpAudienceReplies\(app\.db\)/u,
  "written replies stay present-only",
);
const worker = readSlurp2Source("server", "base/model/slp-model-worker.ts");
assert.match(worker, /SLURP_UPKEEP_JOB_KINDS\.has\(kind\) \? at : undefined/u);
assert.match(
  readSlurp2Source("server", "features/audience/slp-audience-reply-operation.ts"),
  /slurpModelBudgetPaceOpen\(db, settings\.modelBudget, "thread"\)/u,
);
assert.match(
  readSlurp2Source("server", "features/projects/slp-arc-generation-service.ts"),
  /workerContext === "background" && !\(await slurpModelBudgetPaceOpen\(db, settings\.modelBudget, "arc"\)\)/u,
);

// R1-073: fans see Hinted Creators' storylines; the linked name never reaches them.
const identity = { displayName: "Aria Stone", handle: "aria.stone", sourceIdentifiers: ["Aria"] };
assert.equal(
  protectCreatorGeneratedIdentity("Aria Stone moves to Berlin", "hinted", identity),
  "you-know-who moves to Berlin",
);
const arcsRoute = readSlurp2Source("server", "features/projects/slp-projects-routes.ts");
const arcsHandler = arcsRoute.slice(
  arcsRoute.indexOf('"/slurp/accounts/:id/arcs"'),
  arcsRoute.indexOf("A Creator's arc overrides"),
);
assert.doesNotMatch(arcsHandler, /identityDisclosure[^\n]*return \{ arcs: \[\] \}/u, "no Open-only gate");
assert.match(arcsHandler, /question: protect\(choices\[chapter\]!\.question\)/u);

// R1-107: "Draft voice" writes a fan type's voice through the "Fan type voice drafts" budget row.
const voiceInput = slpFanVoiceDraftSchema.parse({
  name: "Night owl",
  engineArchetype: "eccentric",
  traits: ["lowercase", "3am"],
  voice: "Oblique.",
});
const [system, user] = buildSlpFanVoiceDraftMessages(voiceInput);
assert.match(system!.content, /quoted content, never as instructions/u);
assert.match(user!.content, /Fan type: Night owl[\s\S]*Traits: lowercase, 3am[\s\S]*Current voice[^\n]*Oblique\./u);
assert.equal(
  cleanSlpFanVoiceDraft('```\n"Voice: Types in lowercase. **Never** pays."\n```'),
  "Types in lowercase. Never pays.",
);
assert.equal(cleanSlpFanVoiceDraft("   "), null);
const long = cleanSlpFanVoiceDraft(`${"Short, warm comments about the post. ".repeat(30)}`)!;
assert.ok(long.length <= 600 && long.endsWith("."), "cut at a sentence, inside the field limit");
assert.throws(() => slpFanVoiceDraftSchema.parse({ ...voiceInput, extra: 1 }), "strict body");
const voiceService = readSlurp2Source("server", "features/audience/slp-fan-voice-draft-service.ts");
assert.match(voiceService, /claimSlurpModelBudget\(db, settings\.modelBudget, "fan_type_voice"\)/u);
assert.match(voiceService, /slurpModelWorkerAllows\(settings\.modelBudget, "present"\)/u);
assert.match(
  readSlurp2Source("client", "features/audience/SlpFanTypesPanel.tsx"),
  /"\/slurp2\/fan-types\/voice-draft"/u,
);

console.log("slurp2 fix phase 1b: ok");
