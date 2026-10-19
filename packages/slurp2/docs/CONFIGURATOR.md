# Slurp configurator: Basic + extensions

Status: concept v2, 2026-10-19, branch `slurpothon`, based on Slurp 0.3.47/0.3.48.
Nothing here is built. v2 folds in a code critique, an onboarding audit and a sweep of the
open Slurp concepts (storylines, drama, trends, Opening Day, the stopped module plan).

## Why

Backstage has 11 sections, 20 pages and 157 settings keys (about 32 of them on/off or a
mode with "off"), plus Spice and per-Creator content level in their own stores, plus a
7-tab Creator modal and four different save models. Many sub-settings stay editable while
their system is off. A newcomer cannot tell what matters; a tinkerer cannot tell which
knob belongs to which system.

Goal: Slurp works like a car configurator. Basic is a complete car. Extensions are a few
big packages, each one card with a sentence, a real sample, its status and its own page.
Depth is still there, but only where you open it.

## Rules taken from earlier rounds

From the stopped 2026-10-06 module plan (`conduct-your-welcome`, MODULE-SETUP.md) and the
2026-10-10/11 reviews:

- Three ideas are separate and go in this order: group settings, choose content at setup,
  switch whole systems. Each step must stand alone.
- "Slurp Basic and then extensions." Basic is a complete social app; never make ordinary
  parts (Messages, fans, pictures, coins) things you must "add". Few, big extensions.
- Slurp is about 70% of the target; polish toward 1.0, keep current enjoyment and
  configuration, no framework before it shows a benefit.
- Modules hold the verbs, packs hold the nouns (STORYLINES.md). Extensions are code that
  runs a system; packs are content an extension runs. Packs are never extensions.
- Plain names (no cute group names), pretty controls, raw fields only behind "More", no
  disclaimers or new guards; the AI cost note stays.

Verified facts that limit what a switch can promise today:

- Flags are not master gates. Manual runs bypass `fanActivityEnabled`; `walletEnabled:
false` keeps prices and locks on screen and only skips the charge; `supportDesk.tickets:
off` is not desk off; `messagesAwayRepliesEnabled` only stops away replies;
  `advanceSlurpTrends` has no flag; `tickProjects`/`rollAutoArc` ignore `worldActivity`;
  Stir has no flag.
- The world scheduler (`slp-world-scheduler-service.ts`) and catch-up on open
  (`workflows/slp-world-tick-workflow.ts`) call the systems from two lists that already
  differ (trends is only in the scheduler).
- `SLP_ACTION_META.category` is a deck category (life, love, drama, work, world, help,
  desk), not a system.
- Settings patches merge at the top level only. Creator settings save a full resolved
  object (no per-field "use Slurp default").

## Basic (always on)

Creators, feed and posts, pictures, Stories, fans and comments, DMs, coins (locked posts,
subscriptions, tips, PPV, paid requests), Discover, notifications, the Support thread,
Spice, Pause all. The story-state reader ("Right now" line, DM stance, picture look) is
Basic too; it returns nothing while Storylines is off.

Coins are Basic because the feed, DMs and the DM policy (`open|subscribers|paid|closed`)
are built around them (about 87 client files). Economy tuning (stipend, rewards, revenue
share, dynamic pricing) moves behind "More".

The Basic page, about 15 pretty controls:

| Group       | Controls                                                                                                   | Behind "More"                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Connections | Text model, image model or "no pictures"                                                                   | page, image-context and prompt models, AI budget               |
| How busy    | One pace choice (posts per day, quiet hours, Stories on/off; also caps parallel generation for local GPUs) | posts per day number, Story jobs, generation mode              |
| Crowd       | One crowd choice (`platformScale` + `worldActivity` + audience preset)                                     | fan types, archetype weights, reaction bank, simulation tuning |
| Pictures    | Pictures on posts, style, blur                                                                             | sizes, appearance and prompt options                           |
| Heat        | Slurp-wide Spice limit (same control as the Spice page)                                                    | tastes, never-list, language                                   |
| Messages    | One "How fast they answer" scale (drives the 10 delay fields), who can message                             | cooldowns, openers, request timing                             |
| Coins       | Unlock price, subscription price                                                                           | economy tuning                                                 |
| Safety net  | Pause all, Storage and backup                                                                              | autopurge detail                                               |

This page replaces the Overview quick switches (one place, not two).

## Extensions

| Extension        | What you get                                                                                                   | Owns                                                                                    | Real gate today                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Brands & ads** | Inline ads, brand deals, ad pictures, brand packs                                                              | `inlineAds*`, `brandDealsPace`, Ads panel, ad refresh job, `offer-brand-deal`           | Almost: `inlineAdsEnabled` + `brandDealsPace`; check the lever |
| **Storylines**   | Arcs, polls, collabs, couples, rivalries, drama, polyamory; packs such as pregnancy, Spicy Firsts, Tip War     | `arc*`, `projectRate`, `arcLibrary`, `contentPacks`, `drama`, `polyamory`, state writer | No: projects ignore `worldActivity`; drama is off by default   |
| **Living world** | Holidays and site events, calendar, viral trends, deeper world simulation                                      | `platformEvents`, `storyAutomation`, `sharedWorldEvents`, trends scan                   | No: trends has no flag; events have no single flag             |
| **Stir**         | The lever deck tab, the planner, "In play", shady levers (rumour, throttle reach, cash favour)                 | Stir tab and sheet, lever deck                                                          | No flag                                                        |
| **Support desk** | The management game: tickets, trust, suspicion, offers, Creators leaving, perks, notices                       | `supportDesk`, desk tick, desk composer levers                                          | No master: `tickets` is a mode, the tick always runs           |
| **Engine link**  | Slurp in normal chats (carryover), DM to roleplay scenes, lorebook and agent flavour, later scene photo shoots | `carryover*`, scenes, `enableLorebookContext`, `flavourFromAgents`                      | Yes: opt-in or Engine-capability gated                         |

The Support thread stays in Basic: it hosts the sign-up scene. Only the desk _game_ is the
Support desk extension.

Packs carry `requires: [<extension>]` (for example a brand pack needs Brands & ads). A pack whose extension is off is hidden
and skipped. Spicy packs always obey the Basic Spice limit.

## Depth without a Tinker mode

No global expert switch. Every Basic group and every extension page shows its first
controls and one "More for <name>" expander that opens today's panel and Advanced groups
in place. Backstage search keeps finding every key (the placement table already gives
each key a home). Nothing is deleted.

## How a real switch works (slice 3 onward)

- Flat top-level booleans: `extAds`, `extStorylines`, `extWorld`, `extStir`,
  `extSupportDesk`, `extEngineLink`. One helper `slpExtensionOn(settings, id)`, shared by
  server and client.
- Every action in `SLP_ACTION_META` gets an `extension` field. The action runner and
  Mari's tool list refuse actions of an off extension; the Stir deck and the composer's
  "Add from Slurp" chips hide them.
- The extension's call is gated in both tick lists. One regression checks that the two
  lists name the same systems.
- Off hides the tab, page, Creator-modal blocks, Overview items and search hits; stops
  jobs and write routes; keeps all data and preferences; on again resumes without a
  backlog replay.
- Migration: one-time, marked so it never runs again. Existing installs get each switch
  from today's flags, generous side. Existing users therefore see the new layout, not
  fewer systems.

## Onboarding

Today (static code read, confirm on a fresh install): splash (G's screen), then the age
gate, which writes `onboarding: completed` at once, then an empty feed with "Add Creators".
The welcome questions, the tour and the scene lane exist, but only through "Run setup
again". Pace, nights, images and names are asked up to three times. A text connection
is never required. Setup saves in four separate writes. There is no Slurp-wide heat
question.

Target, about six taps on the recommended path:

1. G's splash and the age gate, unchanged. The age gate no longer writes `completed`.
2. **Basic screen.** One screen, pre-filled with recommended values. Each answer changes a
   real Slurp post card with fixed sample data:
   - Text connection, or "later". "Later" sets the pace to manual, as Opening Day did.
   - Pictures yes or no, and the image connection.
   - Heat.
   - How busy.
   - Crowd.
   - Names, open or hinted.
3. **Your first Creators.** Choose one way:
   - The sign-up scene with Support.
   - The Creator picker. Quick setup becomes only this picker. "Customize" goes away, and
     its fields move to Basic.
4. **Add extras.** One card per extension, with a sentence and a real sample component
   (an inline ad, a poll, a holiday banner, a lever card, a DM-to-scene card). The
   recommended pick is preselected. Until a real gate exists, a card can only write the
   existing flag, and it says what it turns on.
5. **Open the doors.** This is the one write. `completed` is written last, only after the
   other parts succeed. Then the first-post queue and artwork start.

After that, Support offers the extras that are still off, in-universe, as a normal
Support notice with "Add" and "Not now":

- after the first posts,
- after the first unlock,
- after a few days.

Support sends at most one offer a day, and none while Slurp is paused.

Opening Day (`conduct-your-welcome`) gives the stage, the reveal and the one-write
`slpRailStamp` rule ("write only the questions the player answered"). Do not reuse its
invented phone.

The other cases:

- **Existing installs.** They get a one-time "What's switched on" card in Backstage.
- **Run setup again.** It opens the Basic screen with the current values. It writes only
  the fields the player touched, and it never shows the age gate again.
- **Watchers.** The watcher exit writes `completed`.

## Slices

0. **Quick wins.** These do not depend on the configurator:
   - Verify the first-run finding.
   - Require a text connection, or set manual pace without one.
   - Show Spice in Backstage search.
   - Use one save model.
   - Fix the five accessibility problems from the settings audit.
1. **Grouping.** Add the Basic page, one page per extension built from existing panels,
   and "More" expanders. Extension cards show a true status line read from real flags
   (for example "Ads: on, 1 in 8 posts"), and an Open link. There are no switches yet.
   The Overview quick switches go away.
2. **Onboarding.** Add the Basic screen, the Creator step and the one write.
3. **Real gates.** Do them in this order:
   1. Brands & ads, the first switch on a card.
   2. Living world, with the trends flag.
   3. Stir and Support desk.
   4. Storylines, with `worldActivity` and both post planners.

   This slice also adds the `extension` field on actions, the tick-list regression and
   the migration.

4. **Add extras in onboarding** and the Support offers.
5. **Storylines engine.** This is STORYLINES.md PRs 2–10, packs v2 with `requires`, and
   the pregnancy pack. Build it on the Storylines gate, so the gate is built only once.

For each slice: one patch bump, all regressions green, and screenshots at 390, 768 and
1440 px. Plan to update these regressions for each slice:

- backstage, anchors, completion, safety
- settings overview, creator-settings safety, messaging settings
- stir

## Branches to salvage

- `the-plot-thickens-branch-out` (0.3.29). Take STORYLINES.md, the state reader
  `slp-story-state.ts`, the Life panel and their tests, and cherry-pick them onto fresh
  staging. Do not rebase this branch. Note: every gate must cover the classic post
  planner, which prod uses.
- `conduct-your-welcome` (0.3.18). Take the October feedback fixes as small PRs: family
  and never-together, Collect limit, commission asks, comment-reply memory, DM edit,
  delete and copy, ad sheet, B1–B3. Take the stage and the one-write rule for slice 2.
  Drop MODULE-SETUP.md, the nine-home map and the ticket welcome.
- `one-deck-to-bind-them` is already in staging. Nothing to take.

## Decided (2026-10-19)

- Six extensions: Brands & ads, Storylines, Living world, Stir, Support desk, Engine link.
- Coins stay in Basic. A later "coins off" option is not planned.
- Polyamory stays in Storylines.
- No code yet; work starts this week.

## Still open

- Order of slice 1 (grouping) and slice 2 (onboarding).
- Recommended pick on the "Add extras" screen.
