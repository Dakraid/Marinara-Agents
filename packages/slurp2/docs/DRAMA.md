# Slurp Drama (design)

Status: **proposal** for 0.3.8 (2026-09-30, branch `slurp2-drama-packs`). Nothing here is built yet.
This extends `WORLD-SIMULATION.md`: drama is one more source of beats and signals, not a second
planner.

Paths are relative to `packages/slurp2/src/engine/packages/server/src/slp/` unless stated.

## Why

Slurp is for arousal content. Its Creators already date, fight, collab and feud
(`modules/projects/slp-creator-couples.ts`, `slp-creator-ties.ts`), but every drama is hard-coded,
the player is never part of it, and the world has no friends, roommates or exes. Users want the
content to have a **reason and a charge**: who a set is for, who will see it, who took it, what it
costs someone.

## Rules

1. **Heat first.** Drama never replaces or tames a spicy post. It gives the post one line of _why_.
   A drama feature that does not make the content hotter does not ship.
2. **One line or nothing.** A post brief carries at most one drama line (about 200 characters). Most
   posts carry none; the drama level sets how many. No relation lists, no history, no infodumps.
3. **Code decides, the model writes.** Casting, stages, timing, choices and outcomes are seeded,
   pure code, like couples and ties today. The model never invents a plot step.
4. **Packs own the drama.** The engine has no genre words. Every drama, and every standing
   situation, is data in a Story Pack.
5. **The cast is alive.** Creators join, pause and leave at any time. Nothing breaks, and no brief
   names someone who left.
6. **Cheap channels first.** Most drama shows in comments, notifications, DMs and the Page, not in
   the post prompt. Comments come from the reaction bank (no model call).
7. **No new model calls for drama logic.** Beats ride existing post, DM and reply calls.
8. **Opt-in and undoable.** Every pack is off by default. Stir shows and undoes every step.

## Two kinds of pack entries

| Kind          | Stages            | Ends                                              | Examples                                                                         |
| ------------- | ----------------- | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Situation** | none; a beat deck | only by the player, a drama, or a Creator leaving | partner is a Creator, roommates, your ex is on Slurp, friend group               |
| **Drama**     | yes               | always (maximum length + exit)                    | rivals, top fan, love triangle, friends to lovers, corruption, open relationship |

A situation is the everyday: most days, Mia is only your girlfriend who does this job, or Lena and
Nora only share a flat. A drama is the rare event on top. A drama may **require** a situation (a
roommate drama needs roommates) and may **change** one (the audience finds out; a partner becomes
an ex). Most dramas need no player at all: they run between Creators and the player watches.

A regular couple where the girlfriend is a Creator needs **no drama pack**: her relation to the
player (below) makes the couples engine run dates, cameos and fights with the persona, and the
built-in situation adds the work side (fans, tips, "did you see my post?").

## Layers and where they live

No new top-level system. Each layer extends an existing part:

| Layer          | Existing home                                                            | Added                                                                                  |
| -------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Relations      | **Ties** (`slurp2.creator-ties`: collabs, rivals, couples, deals)        | friends, roommates, coworkers, exes; ties from cards; the player's persona as one side |
| Pack format    | **Story Packs** (`shared/src/slp/slp-story-engine.ts`)                   | optional `situations` and `dramas` arrays; old packs stay valid                        |
| Running dramas | **Arcs / projects**                                                      | an arc with a **cast**; stages are its chapters                                        |
| Choices        | **Arc choices** (fan polls, `modules/projects/slp-arc-progress.ts`)      | `asks`: fans, player or creator; the pack names the default                            |
| Who knows what | **Continuity** (one read gate, `slurpContinuityReadable`)                | a small `knownBy` for the few hidden facts packs need                                  |
| Post line      | **Beats planner** (`# This post` brief, `modules/feed/slp-tie-beats.ts`) | one drama slot with a heat angle                                                       |
| Pictures       | **Image pipeline** (visual plan)                                         | heat angle may set outfit, place, who is in frame, who shot it                         |
| Crowd          | **Reaction bank** (`modules/world/slp-reaction-bank.ts`)                 | pack comment styles                                                                    |
| Director       | **Stir** (`features/assist/slp-stir-*`)                                  | start, recast, push, pause, end, undo                                                  |

## The player

- **Her relation to you.** A Creator setting, per persona: girlfriend, wife, partner, ex,
  roommate, friend, crush or none. Stored as a tie whose other side is the persona page. Mia can
  be persona A's girlfriend and a stranger to persona B.
- **Persona as a tie side.** A relation of `girlfriend`/`wife`/`partner` is a couple whose other
  side is the persona Creator, with `origin: "player"`. The couples engine runs it; the persona side
  never auto-posts (it is `automatic: false`). The audit below lists what must change for that.
- **Choices** arrive as a DM from the Creator with option buttons (the message action rows Support
  offers use). No answer by the timeout → the pack's default for that choice.
- **Your actions are signals.** Subscribe, tip, comment, go quiet: pack beats may react to them
  (`modules/continuity/slp-signals.ts`).
- An "anonymous fan" view is just a second persona with no relation. No own code.

## Pack format (sketch)

```ts
situations: [{
  id, name, description,
  roles: [{ key: "her", needs: { relationToPlayer: ["girlfriend", "wife", "partner"] } }],
  dials: [{ key: "audienceKnows", options: ["yes", "no", "rumoured"], default: "yes" }, ...],
  deck: [
    { role: "her", channel: "dm:player", seed: "a fan tipped big for the last set", perDay: 1 },
    { role: "crowd", channel: "comment", on: "her.post", style: "lucky-bf", when: { audienceKnows: "yes" } },
    { role: "her", channel: "dm:player", on: "player.tip", seed: "reacts to your tip" },
  ],
  caps: { dmPerDay: 2, postLineEvery: 5 },
}],
dramas: [{                                     // "Rivals": no player needed
  id, name, description,
  roles: [
    { key: "a", needs: { minSpice: 2 } },
    { key: "b", needs: { minSpice: 2, sharesNicheWith: "a" }, prefer: ["newcomer"] },
  ],
  start: { weight: 1, cooldownDays: 21 },
  maxDays: 21,
  stages: [
    { key: "spark", days: [1, 3], beats: [
      { role: "b", channel: "comment", on: "a.post", style: "backhanded-compliment" },
      { role: "a", channel: "notification", seed: "b copied your look" } ] },
    { key: "one-up", days: [3, 7],
      choice: { asks: "fans", question: "Who wore it better?",
                options: [{ label: "a", next: "a-wins" }, { label: "b", next: "b-wins" }],
                default: "a-wins", timeoutDays: 2 },
      beats: [
        { role: "a", channel: "post", heat: { for: "fans", line: "saw what someone posted. cute. anyway" } },
        { role: "b", channel: "post", heat: { for: "fans", line: "oh we're doing this? fine." } },
        { role: "crowd", channel: "comment", style: "picks-a-side" } ],
      outcomes: [{ tie: "rival", between: ["a", "b"], temperature: "tense" }] },
  ],
  exit: { role: "a", channel: "post", heat: { line: "truce. for now." } },
}]
```

Channels: `post` (one line + heat angle in that Creator's next plan), `dm:player`, `dm:<role>`,
`comment`, `notification`, `page` (People block). Seeds are short; the Creator writes the words.

`money` moves coins: between Creators' earnings, from the player's wallet to a Creator (an
allowance, like a recurring tip), or from a Creator to the player's wallet (a new `gift` ledger
entry in `slurp2.viewer.<id>.wallet`, `modules/economy/slp-wallet.ts`). Amounts are clamped by the
economy settings, every transfer shows in the ledger with its reason, and Stir can undo it.

Importer rules (errors, not warnings):

- a `post` beat must carry a `heat` block; a beat without one may only use other channels
- `minSpice` never exceeds the Creator's spice or the global ceiling; the engine clamps at runtime too
- every drama has `maxDays` and an `exit`
- text fields have hard length limits in the schema
- roles referenced by beats, choices and outcomes exist

## Runtime (one world tick)

1. **Start?** For each enabled drama: cooldown passed, required situation active, drama level has
   room, a cast can be found → seeded draw.
2. **Cast late.** Fill only the roles the current stage needs, from live Creators. `prefer: newcomer`
   favours Creators who joined in the last days.
3. **Advance.** Stage time passed and its choice settled (answered or timed out) → next stage.
4. **Queue beats** on their channels with their delays. A `post` beat claims that Creator's next
   non-commitment slot (due promises and campaign stages win, as in `POSTING.md`); if no slot comes
   within the stage, the beat drops.
5. **Outcomes.** Write ties, continuity facts and arc effects (growth, earnings, loyalty).

Situations run the same tick with their deck and caps, no stages.

**Drama level** (install setting): `calm | lively | soap` sets how many dramas run at once and how
often a post carries a line. At most one main and one side drama per Creator.

## Join, pause, leave

| Event                                | Effect                                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| A side role leaves                   | recast for the next beat, or skip the beat                                                |
| The main role leaves                 | the drama ends; a Creator who is still there may post the exit beat                       |
| A Creator is paused (source deleted) | their dramas wait, then end after a limit                                                 |
| A Creator joins                      | ties from the card; can be cast as `newcomer`; knows no drama from before they joined     |
| Any brief                            | reads only live Creators; a fact about someone who left reads "someone who left" or drops |

## Ties (0.3.8 scope)

- New tie types beside collab, rival and couple: `friend`, `roommate`, `coworker`, `ex`.
- A level (`acquaintance → friend → close → best` for friends) and one **temperature** (warm, tense
  or cold) that events move and time cools.
- Caps per Creator: at most 2 best friends, 8 friends. Exes come from breakups (the couples engine
  already keeps "the ex" in briefs for a while; this makes it a lasting tie).
- **Ties from cards:** when a Creator is added or its card changes, card and linked lore text that
  names another Slurp Creator as friend, roommate, coworker or ex seeds that tie (`origin: "card"`),
  reusing the partner-word detection in `modules/creators/slp-spice.ts`.
- Feed use: cameos and tags in beats, friends' comments first, People block on the Page. Family
  ties are out of scope; when added, they never get romantic or explicit beats at any spice.

## Built-in content (0.3.8)

All off by default, enabled per pack in Backstage → Drama.

A starter set that proves the engine is general: some need the player, most do not.

| Entry                | Kind      | Player   | Charge                                                            |
| -------------------- | --------- | -------- | ----------------------------------------------------------------- |
| Partner is a Creator | situation | yes      | your partner's job, seen by everyone                              |
| Roommates            | situation | no       | shared flat, shared shots, the guest who stayed over              |
| Rivals               | drama     | no       | thirst-trap war between two Creators                              |
| Top Fan              | drama     | optional | content made for one person; the player can be that fan           |
| Friends to Lovers    | drama     | no       | duo content that turns into more                                  |
| Love Triangle        | drama     | optional | two admirers, one Creator teasing both                            |
| Corruption           | drama     | no       | a shy Creator gets bolder, stage by stage                         |
| Open Relationship    | drama     | yes      | partner sees someone else (open, secret or you are the other one) |

Later packs: The Ex (revenge-body posts), Secret Affair, Falling Out, Tip War, Sugar (both ways: she is spoiled, or she spoils you or another Creator), Girls'
Trip. Which of the starter set ship in 0.3.8 is decided when phase 5 starts.

Pack text is English at first; UI strings ship in en, de, ko and pl.

## Screens

- **Backstage → Drama:** packs on/off, drama level, global ceiling.
- **Creator settings:** relation to you (per persona), "never in dramas", allowed packs.
- **Stir:** running dramas with cast and stage; start, recast, push, pause, end; undo through plays.
- **Creator Page:** the People block shows friends, roommates, the partner, rivals and exes.
- **Notifications:** the hooks ("Mia was tagged in a post by Jake").

## Cost

| Thing                           | Cost                                         |
| ------------------------------- | -------------------------------------------- |
| Casting, stages, outcomes, ties | code only                                    |
| Post line                       | ~200 characters inside an existing post call |
| DM beats                        | an existing DM call; the seed is the prompt  |
| Comments, notifications         | reaction bank, no call                       |

## Tests

- **Simulation regression:** 12 seeded Creators, 90 simulated days, random joins and leaves. Every
  drama ends; no brief names a Creator who left; ceilings hold; tie caps hold; same seed → same
  world; at most one drama line per post brief.
- **Pack regression:** built-in packs import; each importer rule rejects a bad pack with a clear
  error; packs without the new fields import unchanged.
- **Architecture regression and typecheck** after each structural change.
- **Content check** on a dev box: about 20 posts and DMs with the packs on; read for lost heat,
  slop, repetition and leaks.

## Phases inside 0.3.8

1. Pack format + importer rules + simulation harness (pure).
2. Ties: new types, levels, temperature, from cards, People block.
3. Persona as a tie side + relation to you + choice DMs (fix the audit holes).
4. Drama runtime: casting, stages, channels, drama level, join/leave.
5. Built-in situation and three dramas; Backstage and Stir screens; locales.
6. Content check, then release.

Later: named fans with ties and memory, leaks, deleted posts, the chat-context line, places and
gatherings, live.

## Open decisions

- Drama level default (`lively` proposed).
- Per-persona relations: stored on the tie, with the persona page as its other side; the Creator
  setting is a view of it. The audit shows ties are already keyed by the persona page's account id.
- May a drama end a player relation (partner → ex), or only change situation dials?

## Persona audit (2026-09-30, on `origin/staging` 0.3.7)

Paths under `packages/slurp2/src/engine/packages/`.

**Works already.** A persona page is a tie side today, with `automatic: false`:

- `loadSlurpTieCreators` includes persona pages (`server/src/slp/features/projects/slp-creator-ties-service.ts:65-104`).
- `slurpSetUpCouple` refuses only two non-automatic sides (`modules/projects/slp-creator-couples.ts:683`);
  the route and the Stir action do not filter personas, and the Stir pair picker lists them.
- The world never starts a couple with a persona (`slp-creator-couples.ts:632`).
- Collab requests to a persona wait for the player, then lapse (`slp-creator-ties.ts:384-387`); the
  automatic side hosts. Rivalries need only the automatic "from" side.
- Couple beats run only in the automatic side's post call; the persona page never auto-posts.
- The brief's relationship line names the partner (`slp-flavour-source.ts:304-321`); the fan thread
  resolves the persona page and `slurpCoupleDmPage` adds `partner: true`
  (`slp-creator-couples-service.ts:202-217`); pictures resolve the persona via `castIds`.

**Holes to fix in phase 3:**

1. Jealousy moments can take the persona as `fromId` (`slp-creator-couples.ts:379-393`, `:480-492`),
   so only the persona could "post" them. Use the automatic side.
2. A player set-up starts at "sparks" and can fizzle (`:463-465`, `:683-706`). "Girlfriend" needs a
   start stage of `together` and no fizzle.
3. The card-couple loop includes persona pages (`:584-591`): persona text that names a Creator makes
   a couple with no player action. Decide: entry path or skip `!automatic`. (Proposed: skip; the
   relation setting is the one entry path.)
4. Persona pages have no `profile.gender`, so a card orientation reads as a misfit and the brief says
   "awkward" (`:165-171`, `slp-couple-words.ts:55-58`). Skip the orientation check for a persona side.
5. The persona card is read as a character card for misfit checks. Skip `slurpCoupleMisfitOf` for a
   persona side.
6. The world clock moves the couple alone, up to a breakup (`:593-603`). With a persona side: no
   automatic breakup; stage changes only from the player or a drama.
7. Couple posts use the persona's spice and hard noes (`slp-post-spice.ts:55-68`,
   `slp-spice-storage.ts:158-172`), which the player cannot set (`slp-action-runner.ts:50`). Let
   hard noes be set on own pages, or use the automatic side's spice.
8. Couples ignore `identityDisclosure` (crossovers check it, `slp-projects-storage-2.ts:215-216`). A
   concealed persona page must not be named in public posts.
9. A shared couple page with a persona side has no owner who can post. Keep the page action off.
10. Stir picker lists couple pages (404) and other personas' pages. Filter by the flags
    `slp-stir-service.ts:295-302` already sets.
11. The steer section is hidden for persona Creators (`client/src/slp/features/stir/SlpStirCreatorSheet.tsx:132`);
    the relation setting belongs on the automatic Creator's settings instead.

**Open questions from the audit:**

- Couples are global (`slurp2.creator-ties`), keyed by the persona page's account id. That already
  scopes a relation to one persona; persona B sees A's couple only as public posts. Proposed: keep.
- Couple moments never DM the partner. Situation decks add that for the persona side.
- Money between partners (subscriptions, tips, DM paywall) is not traced. Proposed: unchanged; the
  partner pays like any fan, which the situation uses on purpose.
- Canon anchors may never be built for persona pages, so persona `cardPartners` stays empty. Check
  in phase 3.
