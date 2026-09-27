/**
 * 7b-s: Slurp Support is one account with one thread per Creator, shared by every persona. Older
 * data kept Support's lines inside persona chats; the migration moves them (no loss, idempotent,
 * also after a restore). What Support says may change the Creator (mood, focus, plans, memory),
 * never a persona's relationship. Runs the real rules on an in-memory store; wiring pins at the end.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applySlurpSupportTalk,
  migrateSlurpSupportLines,
  readSlurpSupportTakeaway,
  slurpSupportMessageIds,
  slurpSupportSteeringPatch,
  type SlurpSupportMigrationStore,
  type SlurpSupportTalkStore,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-support.ts";
import {
  slurpDmRoleHeader,
  slurpDmTranscript,
  type SlurpDmLine,
} from "../packages/slurp2/src/engine/packages/server/src/slp/modules/messages/slp-dm-roles.ts";
import { slpSceneThreadMessages } from "../packages/slurp2/src/engine/packages/server/src/slp/modules/onboarding/slp-scene-thread.ts";
import { SLURP_SUPPORT_ACCOUNT_ID } from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-support.ts";
import {
  SLP_DEFAULT_STEERING,
  type SlpCreatorSteering,
} from "../packages/slurp2/src/engine/packages/shared/src/slp/slp-creator-steering.ts";

type Line = SlurpDmLine & { threadId: string };
let clock = Date.parse("2026-09-27T10:00:00.000Z");
let serial = 0;
function line(threadId: string, role: "viewer" | "creator", content: string, extra: Partial<SlurpDmLine> = {}): Line {
  clock += 60_000;
  serial += 1;
  return {
    id: `m${serial}`,
    threadId,
    role,
    kind: "text",
    content,
    price: 0,
    unlockedAt: null,
    metadata: {},
    createdAt: new Date(clock).toISOString(),
    ...extra,
  };
}
const supportLine = (threadId: string, content: string) =>
  line(threadId, "viewer", content, { metadata: { sceneSpeaker: "Desk Dana", supportVoice: true } });

/** Threads and messages in memory, moved exactly like the storage adapter moves them. */
function memoryStore(creators: Set<string>) {
  const threads: { id: string; viewerAccountId: string; creatorAccountId: string }[] = [];
  const messages: Line[] = [];
  const store: SlurpSupportMigrationStore = {
    listThreads: async () => threads.map((thread) => ({ ...thread })),
    listMessages: async (threadId) => messages.filter((message) => message.threadId === threadId).reverse(),
    openSupportThread: async (creatorAccountId) => {
      if (!creators.has(creatorAccountId)) return null;
      const found = threads.find(
        (thread) => thread.viewerAccountId === SLURP_SUPPORT_ACCOUNT_ID && thread.creatorAccountId === creatorAccountId,
      );
      if (found) return found.id;
      const id = `support-${creatorAccountId}`;
      threads.push({ id, viewerAccountId: SLURP_SUPPORT_ACCOUNT_ID, creatorAccountId });
      return id;
    },
    moveMessages: async (source, target, ids) => {
      for (const message of messages)
        if (message.threadId === source && ids.includes(message.id)) message.threadId = target;
    },
  };
  const snapshot = () =>
    JSON.stringify({
      threads: [...threads].sort((a, b) => a.id.localeCompare(b.id)),
      messages: messages.map((message) => [message.id, message.threadId]).sort(),
    });
  const idsIn = (threadId: string) =>
    messages
      .filter((message) => message.threadId === threadId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((message) => message.id);
  return { threads, messages, store, snapshot, idsIn };
}

async function main() {
  // 1. The migration: Support's lines leave two personas' chats for ONE Support thread per Creator.
  {
    const { threads, messages, store, snapshot, idsIn } = memoryStore(new Set(["mira", "kai"]));
    threads.push(
      { id: "anna-mira", viewerAccountId: "persona-anna", creatorAccountId: "mira" },
      { id: "ben-mira", viewerAccountId: "persona-ben", creatorAccountId: "mira" },
      { id: "ben-kai", viewerAccountId: "persona-ben", creatorAccountId: "kai" },
      { id: "ben-gone", viewerAccountId: "persona-ben", creatorAccountId: "deleted-creator" },
    );
    // Anna: the kept Support sign-up chat (step 10), then Anna talks to Mira as herself.
    const keptAt = new Date(clock);
    const kept = slpSceneThreadMessages({
      preset: "support",
      hostName: "Desk Dana",
      lines: [
        { speaker: "host", text: "Welcome to Slurp! What should we call your page?" },
        { speaker: "newcomer", text: "Mira Vale, please." },
        { speaker: "host", text: "Lovely. Anything you never want to show?" },
        { speaker: "newcomer", text: "No face in the spicy sets." },
      ],
      now: keptAt,
    }).map((message) => line("anna-mira", message.role, message.content, { metadata: message.metadata }));
    clock += 10 * 60_000;
    const annaOwn = [line("anna-mira", "viewer", "hi Mira, huge fan"), line("anna-mira", "creator", "aww thank you!")];
    // Ben: talks to Mira, writes as Support once (7b-m, inside Ben's chat), Mira answers Support, then a
    // broadcast and a PPV Ben bought arrive, and Ben talks again.
    const benBefore = [line("ben-mira", "viewer", "love your gym posts"), line("ben-mira", "creator", "haha thanks")];
    const benSupport = [
      supportLine("ben-mira", "Slurp Support here: your Friday streams do really well."),
      line("ben-mira", "creator", "oh nice, I'll do more of those!"),
    ];
    const benAfter = [
      line("ben-mira", "creator", "New set tonight!", { kind: "broadcast" }),
      line("ben-mira", "creator", "", { kind: "ppv", price: 40, unlockedAt: new Date(clock).toISOString() }),
      line("ben-mira", "viewer", "can't wait"),
    ];
    const benKai = [
      supportLine("ben-kai", "Hi Kai, quick check from Support."),
      line("ben-kai", "creator", "all good!"),
    ];
    const gone = [supportLine("ben-gone", "Hello?")];
    messages.push(...kept, ...annaOwn, ...benBefore, ...benSupport, ...benAfter, ...benKai, ...gone);
    const allIds = messages.map((message) => message.id).sort();

    // What moves out of Ben's chat: Support's line and Mira's answer; not the broadcast or the bought PPV.
    assert.deepEqual(
      slurpSupportMessageIds([...benBefore, ...benSupport, ...benAfter]),
      benSupport.map((message) => message.id),
    );
    // The whole kept Support sign-up chat moves, both sides; Anna's own lines stay.
    assert.deepEqual(
      slurpSupportMessageIds([...kept, ...annaOwn]),
      kept.map((message) => message.id),
    );
    // A seat or Friend sign-up is not Support.
    assert.deepEqual(
      slurpSupportMessageIds([
        line("x", "viewer", "hi", { metadata: { signUpScene: "seat", sceneSpeaker: "Kai Torres" } }),
        line("x", "creator", "hey", { metadata: { signUpScene: "seat" } }),
      ]),
      [],
    );

    const first = await migrateSlurpSupportLines(store);
    assert.deepEqual(first, { threads: 3, messages: kept.length + benSupport.length + benKai.length });
    // No line lost or doubled.
    assert.deepEqual(messages.map((message) => message.id).sort(), allIds);
    // ONE Support thread per Creator, fed from two personas, in time order.
    const supportThreads = threads.filter((thread) => thread.viewerAccountId === SLURP_SUPPORT_ACCOUNT_ID);
    assert.deepEqual(supportThreads.map((thread) => thread.creatorAccountId).sort(), ["kai", "mira"]);
    assert.deepEqual(
      idsIn("support-mira"),
      [...kept, ...benSupport].map((message) => message.id),
    );
    assert.deepEqual(
      idsIn("support-kai"),
      benKai.map((message) => message.id),
    );
    // The personas keep their own conversation, including the broadcast and the PPV Ben bought.
    assert.deepEqual(
      idsIn("anna-mira"),
      annaOwn.map((message) => message.id),
    );
    assert.deepEqual(
      idsIn("ben-mira"),
      [...benBefore, ...benAfter].map((message) => message.id),
    );
    // A Creator that no longer exists keeps its lines where they are.
    assert.deepEqual(
      idsIn("ben-gone"),
      gone.map((message) => message.id),
    );

    // Idempotent: a second run (the next start) changes nothing.
    const after = snapshot();
    assert.deepEqual(await migrateSlurpSupportLines(store), { threads: 0, messages: 0 });
    assert.equal(snapshot(), after);

    // An old backup restored on top: its Support lines join the SAME Support thread again.
    const restored = [
      supportLine("anna-mira", "Support again, from an old backup."),
      line("anna-mira", "creator", "hi!"),
    ];
    messages.push(...restored);
    assert.deepEqual(await migrateSlurpSupportLines(store), { threads: 1, messages: 2 });
    assert.deepEqual(
      idsIn("support-mira").slice(-2),
      restored.map((message) => message.id),
    );
    assert.equal(threads.filter((thread) => thread.viewerAccountId === SLURP_SUPPORT_ACCOUNT_ID).length, 2);
    assert.deepEqual(await migrateSlurpSupportLines(store), { threads: 0, messages: 0 });
  }

  // 2. The Support thread reads as Slurp's staff talking to the Creator, never as a fan.
  {
    const history = [
      ...slpSceneThreadMessages({
        preset: "support",
        hostName: "Slurp Support",
        lines: [
          { speaker: "host", text: "Welcome! Your page name?" },
          { speaker: "newcomer", text: "Mira Vale." },
        ],
        now: new Date(clock),
      }).map((message, index) => ({ id: `k${index}`, kind: "text", price: 0, unlockedAt: null, ...message })),
      {
        id: "s1",
        role: "viewer" as const,
        kind: "text",
        content: "Your Friday streams do well.",
        price: 0,
        unlockedAt: null,
        metadata: { sceneSpeaker: "Slurp Support", supportVoice: true },
        createdAt: new Date(clock + 60_000).toISOString(),
      },
    ];
    const input = {
      writer: "creator" as const,
      creator: { name: "Mira Vale", handle: "miravale" },
      viewer: { name: "Slurp Support", handle: "slurpsupport" },
      support: true,
    };
    const header = slurpDmRoleHeader({ ...input, history });
    assert.match(header, /This is your private chat with Slurp Support, Slurp's own staff team/u);
    assert.match(header, /Slurp Support is not a fan and not a customer/u);
    assert.match(header, /It never changes how you feel about any fan\./u);
    assert.match(header, /add "staff" to your JSON/u);
    assert.match(header, /"takeaway": one sentence you will remember, starting "Slurp Support told me"/u);
    assert.match(header, /Lines marked "Slurp Support \(during the sign-up\)" are Slurp Support signing you up\./u);
    assert.match(header, /In the data, "creator" is you and "fan" is Slurp Support, Slurp's staff/u);
    assert.doesNotMatch(header, /is a fan writing to you/u);
    assert.doesNotMatch(header, /not Slurp Support and not a fan/u, "no 'Support on the persona's side' framing");
    assert.doesNotMatch(header, /do not address Slurp Support/u);
    const transcript = slurpDmTranscript(history, input);
    assert.equal(transcript[0]!.from, "Slurp Support (during the sign-up)");
    assert.equal(transcript.at(-1)!.from, "Slurp Support (Slurp staff)");
    // A fan's chat never gets the staff instructions.
    assert.doesNotMatch(
      slurpDmRoleHeader({ ...input, viewer: { name: "Lena", handle: "lena" }, support: false, history: [] }),
      /"staff"/u,
    );
  }

  // 3. Reading the Creator's "staff" answer.
  {
    assert.equal(readSlurpSupportTakeaway(null), null);
    assert.equal(readSlurpSupportTakeaway("more streams"), null);
    assert.equal(readSlurpSupportTakeaway({ mood: "ecstatic", focus: "null", idea: "  " }), null, "nothing real");
    const read = readSlurpSupportTakeaway(
      { mood: "bright", focus: "Friday streams", more: "streams", takeaway: "my Friday streams do well" },
      "Desk Dana",
    );
    assert.deepEqual(read, {
      mood: "bright",
      focus: "Friday streams",
      idea: "",
      more: "streams",
      less: "",
      takeaway: "Desk Dana told me: my Friday streams do well",
    });
    assert.equal(
      readSlurpSupportTakeaway({ takeaway: "Slurp Support told me to rest more." })!.takeaway,
      "Slurp Support told me to rest more.",
    );
    // Topics move between the lists; a full list lets its oldest go.
    const current: SlpCreatorSteering = {
      ...SLP_DEFAULT_STEERING,
      push: ["gym", "cats", "a", "b", "c", "d"],
      avoid: ["streams"],
    };
    const patch = slurpSupportSteeringPatch(current, { ...read!, less: "gym" })!;
    assert.deepEqual(patch.push, ["cats", "a", "b", "c", "d", "streams"]);
    assert.deepEqual(patch.avoid, ["gym"]);
    assert.equal(patch.mood, "bright");
    assert.equal(
      slurpSupportSteeringPatch({ ...SLP_DEFAULT_STEERING, mood: "bright" }, { ...read!, focus: "", more: "" }),
      null,
      "no change, no write",
    );
  }

  // 4. The talk changes the Creator (steering, one idea, one memory) and Support's thread only.
  {
    type Write = { what: string; id: string; value?: unknown };
    const writes: Write[] = [];
    const memories = new Set<string>();
    let steering: SlpCreatorSteering = { ...SLP_DEFAULT_STEERING, push: ["gym"] };
    const store: SlurpSupportTalkStore<{ moodShift: string }> = {
      recordThreadOutcome: async (threadId, outcome) =>
        void writes.push({ what: "thread", id: threadId, value: outcome }),
      readSteering: async () => steering,
      patchSteering: async (creatorAccountId, patch) => {
        steering = { ...steering, ...patch };
        writes.push({ what: "steering", id: creatorAccountId, value: patch });
      },
      addIdea: async (creatorAccountId, text) => {
        writes.push({ what: "idea", id: creatorAccountId, value: text });
        return null;
      },
      // 7b-c: the note for Creator tools; covered by tests/slurp2-creator-ties.regression.ts.
      noteChange: async () => undefined,
      hasMemory: async (_creatorAccountId, sourceHash) => memories.has(sourceHash),
      addMemory: async (creatorAccountId, memory) => {
        memories.add(memory.sourceHash);
        writes.push({ what: "memory", id: creatorAccountId, value: memory });
      },
    };
    const staff = {
      mood: "restless",
      focus: "a Friday stream series",
      idea: "Friday stream announcement",
      more: "streams",
      less: null,
      takeaway: "Slurp Support told me my Friday streams do well.",
    };
    const talk = {
      thread: { id: "support-mira", viewerAccountId: SLURP_SUPPORT_ACCOUNT_ID, creatorAccountId: "mira" },
      trigger: { id: "s1", content: "Your Friday streams do well." },
      outcome: { moodShift: "up" },
      staff,
      supportName: "Slurp Support",
    };
    await applySlurpSupportTalk(store, talk);
    assert.equal(steering.mood, "restless");
    assert.equal(steering.focus, "a Friday stream series");
    assert.deepEqual(steering.push, ["gym", "streams"]);
    assert.deepEqual(
      writes.map((write) => `${write.what}:${write.id}`),
      ["thread:support-mira", "steering:mira", "idea:mira", "memory:mira"],
      "only Support's own thread and the Creator are written",
    );
    assert.equal((writes.at(-1)!.value as { threadId: string }).threadId, "support-mira");
    // A retried reply to the same Support line stores the memory once.
    writes.length = 0;
    await applySlurpSupportTalk(store, talk);
    assert.ok(!writes.some((write) => write.what === "memory"));
    // A persona's (fan's) thread is refused outright: nothing at all is written.
    writes.length = 0;
    await applySlurpSupportTalk(store, {
      ...talk,
      thread: { id: "ben-mira", viewerAccountId: "persona-ben", creatorAccountId: "mira" },
    });
    assert.deepEqual(writes, []);
  }

  // Wiring: one Support account end to end, the migration runs on start and after a restore, and the
  // persona's relationship is never touched by a reply to Support.
  {
    const root = join(fileURLToPath(new URL("..", import.meta.url)), "packages/slurp2/src/engine/packages");
    const read = (path: string) => readFileSync(join(root, path), "utf8");
    const store = read("server/src/slp/data/messages/slp-messages-storage-actions.ts");
    assert.match(store, /if \(options\.asSupport\) viewerAccountId = SLURP_SUPPORT_ACCOUNT_ID;/u);
    // Support never advances a tie or records fan engagement.
    assert.match(store, /if \(support\) \{\s+const thread = await context\.storage\.getThreadById/u);
    const threadRoutes = read("server/src/slp/features/messages/slp-messages-thread-routes.ts");
    assert.match(threadRoutes, /messages\.getThread\(parsed\.data\.support \? SLURP_SUPPORT_ACCOUNT_ID : viewer\.id/u);
    assert.match(threadRoutes, /messages\.listThreadsForViewer\(SLURP_SUPPORT_ACCOUNT_ID\)/u);
    assert.match(threadRoutes, /const side = thread \? await seatIn\(viewer\.id, thread\) : null;/u);
    const context = read("server/src/slp/features/messages/slp-messages-context.ts");
    assert.match(context, /return thread\.viewerAccountId === SLURP_SUPPORT_ACCOUNT_ID \? "viewer" : null;/u);
    const operation = read("server/src/slp/features/messages/slp-message-operation.ts");
    assert.match(operation, /if \(stored && support\) \{\s+await applySlurpSupportTalk\(/u);
    assert.match(operation, /if \(stored && trigger\.metadata\?\.supportVoice !== true\) \{/u);
    assert.match(operation, /if \(!support\)\s+await slurp\s+\.recordCreatorStateSignals/u);
    assert.match(operation, /if \(!support\)\s+await applyBoundary/u);
    const generation = read("server/src/slp/features/messages/slp-message-generation-service.ts");
    assert.match(generation, /const support = input\.viewer\.id === SLURP_SUPPORT_ACCOUNT_ID;/u);
    assert.match(generation, /slpResponseFormat\(input\.connection\.model, "noodler_dm", \{ staff: true \}\)/u);
    assert.match(
      read("server/src/slp/base/prompting/slp-response-format.ts"),
      /required: \[\.\.\.slpCreatorDmSchema\.required, "staff"\]/u,
    );
    assert.match(read("server/src/slp/slp-server-entry.ts"), /await migrateSlurpSupportThreads\(app\.db\);/u);
    assert.match(
      read("server/src/slp/features/maintenance/slp-backup-jobs.ts"),
      /importSlurpBackup\([\s\S]{0,200}await migrateSlurpSupportThreads\(app\.db\);/u,
    );
    assert.match(
      read("server/src/slp/features/onboarding/slp-scene-keep-service.ts"),
      /request\.preset === "support" \? SLURP_SUPPORT_ACCOUNT_ID : request\.viewerPersonaId/u,
    );
    const migration = read("server/src/slp/data/messages/slp-support-migration.ts");
    assert.match(migration, /await db\.transaction\(/u, "each move is one transaction");
    assert.doesNotMatch(migration, /tx\.delete\(slurpMessages\)/u, "the migration never deletes a message");
    assert.match(read("client/src/slp/features/messages/slp-messages-hooks.ts"), /&support=1/u);
    const model = read("client/src/slp/features/messages/slp-thread-view-model.ts");
    assert.match(model, /thread\.viewerAccountId === SLURP_SUPPORT_ACCOUNT_ID/u);
    assert.match(model, /onSwitchVoice\?\.\(targetCreatorAccountId, next\)/u);
    assert.match(read("client/src/slp/features/messages/SlpMessages.tsx"), /onSwitchVoice=\{/u);
  }

  console.log("slurp2 support thread regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
