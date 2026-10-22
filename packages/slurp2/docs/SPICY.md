# Spicy: more adult, more OnlyFans, more fun (concept, 2026-10-22)

Status: concept for approval. Nothing here is built yet.

Slurp is an OnlyFans simulator. The player is a fan of AI Creators (DMs, tips, PPV, customs) and can run a
page with fans of their own. This update makes both sides spicier and gives the player more reasons to come
back. Everything stays in-universe: no disclaimers, no new guards; the existing spice levels, turn-ons and
hard-nos decide how far anybody goes.

The user picked eight features (2026-10-22). Each section says what the player sees, what it builds on in the
code today, and the smallest version that is still fun. "Later" lists what the first version leaves out.

## 1. Intimacy ladder (per Creator and player)

**What the player sees.** Each Creator remembers how close she is with you. A small ladder on her profile and in
the DM header: Stranger → Regular → Favourite → Close → Yours. Each step opens more: teasing → lingerie and
nudes in DMs → explicit customs and sexting → private things only you get. She says when you reach a step
("ok you're officially my favourite 🙈").

**How it works.** One number per Creator and player pair, stored next to her spice state
(`data/creators/slp-spice-storage.ts`, `SlpSpiceState` in `shared/src/slp/slp-spice.ts:93`). Points come from
what already happens: tips, PPV unlocks, customs, subscribing, replies (wallet entries `slp-wallet.ts:89`,
payment reactions `features/economy/slp-payment-reaction.ts:40`). Points fade slowly when you go quiet. The step
caps the DM spice level: today `slurpDmSpiceLevel` (`features/messages/slp-message-operation.ts:450-458`) picks
the level from price, partner status and whether you asked; the ladder becomes one more input, never above the
Creator's own spice level or past a hard-no. Partner/crush (`SLP_RELATIONS_TO_PLAYER`) start higher.

**First version.** Score + five steps, the cap in DM spice, the header chip, the step-up line.
**Later.** Per-step perks chosen by the Creator; ladder for NPC fans on the player's own page.

## 2. Paid sexting sessions

**What the player sees.** In a Creator's DM: "Sext with me – 20 min for 30 coins". During the session a timer
runs in the thread header, she replies faster and hotter, the heat rises in three phases (warm-up, heated,
finish), and she offers a PPV picture inside the session ("want to see what I'm doing right now? 12 🪙").
At the end: a short afterglow line and a tip prompt.

**How it works.** A session is a thread state with a start, an end and a phase, next to `SlpThreadState`
(`modules/messages/slp-messaging.ts:112`). Paying uses a new wallet spend kind `session`. While a session runs,
reply pacing (`slp-messaging.ts:202`, `:286`) uses short delays, and the DM prompt gets the phase and a spice
floor (capped by the ladder and the Creator's spice). The in-session PPV reuses the DM PPV offer path.
The price comes from her pricing (`modules/economy/slp-creator-pricing.ts`) and her ladder step.

**First version.** Buy, timer, three phases, faster replies, one in-session PPV offer, end tip prompt.
**Later.** Session extensions, voice notes, Creators who offer a session on their own.

## 3. Spicier fan types and a top-fans board

**What the player sees.** On the player's own page: new fans who feel real – the simp who tips every post and
asks for nothing, the time-waster who haggles, asks for "just one free pic" and vanishes, the chargeback that
takes money back two days later, the demanding whale who pays well but wants things. A ranked Top fans board
(this week / all time) with badges ("💎 whale", "🐌 time-waster").

**How it works.** Four new built-in fan types in `SLURP_BUILTIN_FAN_TYPES` (`shared/src/slp/slp-fan-types.ts:113`)
using the existing schema (behaviour weights, spend, `tipChance`, `commissionBudget`). Two need small new
behaviour fields: haggle-and-leave (reuses `slurpFanHaggle`, `slp-creator-pricing.ts:83`) and chargeback
(reuses income reversal `slp-wallet.ts:413` / `slp-earnings.ts:295`, with a notification). The board ranks
`topFans` (`features/economy/slp-studio-routes.ts:130`) by spend in the window.

**First version.** Four types, chargeback + haggle-vanish behaviours, the board on the dashboard.
**Later.** Blocking and fan notes per type, fan-type rebalance hints.

## 4. Fan request board

**What the player sees.** A board of open requests on the player's page: "custom: you in the red set, 40 🪙",
"say my name in a video, 15 🪙". Take it, counter or decline; done requests become a locked post or a PPV.
On Creator pages the player can post a request of their own to the board.

**How it works.** Commissions are thread messages today (create, quote, counter, accept, deliver:
`features/messages/commissions/slp-commissions-routes.ts`, delivery `slp-commission-delivery-service.ts`). The
board is a view over open commissions, plus fans opening them on their own (fan type `commissionBudget`) and an
expiry (`slp-messaging.ts:39`, 5 days). No new entity in the first version.

**First version.** Board screen, fans post on their own, take/counter/decline from the board.
**Later.** Requests from fans to Creators shown publicly, upvotes.

## 5. Live shows

**What the player sees.** A Creator (or the player) goes live: a live badge on her avatar, a notification
("Mia is live 🔴"). The show is a text stream: she narrates, the crowd chats, tips pop up with reactions, a tip
goal bar fills, and when the goal is hit the show gets spicier for the finish (within her spice). Shows last
20–40 minutes; replays are not kept, only a recap post.

**How it works.** A live show is a scheduled session in the world tick (`features/world/slp-world-operation.ts`,
scheduler `slp-world-scheduler-service.ts`). Crowd lines come from the fan voice drafts
(`modules/audience/slp-fan-voice-draft.ts:30`) and fan types; tips use the `tip` spend and payment reactions;
the goal is new state on the show. The player sees a live screen that polls the show. Natural home:
`features/live` (server and client).

**First version.** Creators go live at random (more when trending), the live screen with chat, tips, goal and
finish, the recap post. The player can watch and tip.
**Later.** The player goes live on their own page; private shows; collab lives.

## 6. Streaks and rewards

**What the player sees.** A daily streak ("🔥 6 days"), and rewards for coming back and for milestones: free
coins, a new look for a Creator, a spicier post type, badges on the profile.

**How it works.** A day key exists (`slurpDayKey`, `modules/economy/slp-wallet.ts:143`; stipend `:350`) and
presence is tracked (`markSlpPlayerPresent`, `features/world/slp-world-tick-state.ts:50`). Milestones exist
(`modules/world/slp-milestones.ts:52`). The streak is one counter per day key; rewards are a small table.
Natural home: `features/rewards`.

**First version.** Streak, coin rewards on streak days, milestone badges.
**Later.** Look and post-type unlocks, Engine achievements.

## 7. Creator charts

**What the player sees.** Weekly charts: top earners, rising Creators, most tipped. Rivals climb past you; a drop
makes drama ("she fell out of the top 10 and she's NOT ok").

**How it works.** Earnings per Creator exist (`modules/economy/slp-earnings.ts:61`, `:162`), trends score
activity (`modules/discovery/slp-trends.ts:159`). A chart is a weekly snapshot over both. Rivalries
(`modules/projects/slp-creator-ties.ts:124`) and the rival post beat (`modules/feed/slp-post-beat.ts:116`)
give the drama hook. Natural home: `features/discovery`.

**First version.** Three charts, weekly snapshot, a Discover card, one drama beat on a big drop or climb.
**Later.** All-time charts, chart badges on profiles.

## 8. Kink theme packs

**What the player sees.** Packs in Storylines > Packs, off by default like Family: Lingerie week, Cosplay,
Feet, Dom/sub, Exhibition (and more later). Each brings storylines, occasions and looks that only reach
Creators whose turn-ons fit and who have no hard-no against it.

**How it works.** Pure pack data, built like the Family pack (`modules/world/events/slp-family-pack.ts`,
library `slp-content-pack-library.ts:123`): storylines (stages, looks via `add-look`, influences), occasions,
fit topic words (gated by hard-nos, `modules/feed/slp-occasion-beats.ts:106-111`) and `minSpice`. Turn-ons lean
who gets them (`slurpTasteWeight`, PR 5c). Topic switches per pack already exist (`<pack>:<topic>`).

**First version.** Five packs, each 2–3 storylines + a few occasions + looks.
**Later.** More packs, user-shared packs.

## Suggested order

1. **Kink theme packs** – pure data on the storyline engine, fast fun, no new systems.
2. **Intimacy ladder** – the base the next ones read.
3. **Paid sexting sessions** – uses the ladder.
4. **Spicier fan types + top fans**.
5. **Fan request board** – uses the new fan types.
6. **Live shows** – the biggest new system; uses fan types, tips, crowd voice.
7. **Streaks and rewards**.
8. **Creator charts**.

One PR per item, `merge --no-ff` into slurpothon, one patch bump each (0.3.61 onwards).

## Open decisions

- Order above, or a different first item.
- Ladder: visible to the player (chip + steps), or hidden and only felt.
- Live shows: Creators only first, or the player can go live in the first version.
- Kink packs: which five first.
