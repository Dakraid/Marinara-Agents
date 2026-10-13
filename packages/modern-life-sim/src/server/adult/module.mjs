// Adult life-module definition (options, hooks, routes, changelog) and registration
import { allModules, registerModule } from "../modules/module-registry.mjs";
import {
  ADULT_CARD_RULE,
  CLUB_DANCE_MILESTONE,
  CLUB_PLACE,
  CLUB_TALK_MILESTONE,
  DEFAULT_INTIMACY_DETAIL,
  DEFAULT_PICTURE_FREQUENCY,
  INTIMACY_DETAIL_LEVELS,
  PICTURE_FREQUENCIES,
} from "./tuning.mjs";
import { cleanAdultSettings, defaultAdultState } from "./settings.mjs";
import {
  INTIMACY_DISPOSITION_RULE,
  INTIMACY_KINKS_RULE,
  INTIMACY_LIKES_RULE,
  INTIMACY_LIMITS_RULE,
  INTIMACY_WAYS_RULE,
  INTIMACY_WAYS_SHAPE,
  cleanAdultAnswer,
  cleanIntimacyDisposition,
  cleanIntimacyKinks,
  cleanIntimacyLikes,
  cleanIntimacyLimits,
} from "./intimacy-ways.mjs";
import {
  clubNightSpans,
  darkActivities,
  darkPhoneView,
  onArrivedDark,
  partyTickDark,
  putOffDark,
  rollCastMeetDark,
  rollClubNights,
  rollHomeDark,
  tickDarkEntries,
} from "./after-dark.mjs";
import { seedIntimateHistory } from "./intimate-milestone.mjs";
import {
  adultFreeActs,
  adultFreeApply,
  adultFreeJump,
  adultSheetAdultToggle,
  adultSpecialActions,
  adultStayHere,
  adultStayWhy,
  adultTickInitiativeAsks,
  adultTonightChosen,
  adultTonightOptions,
  adultTripNightChosen,
  adultTripNightOptions,
  adultWeddingNight,
  setAdultCharacterOption,
} from "./sleep-together.mjs";
import {
  adultContentGuidance,
  adultFactWeight,
  adultPictureGuidance,
  adultSceneBlocks,
} from "./intimate-scene-guidance.mjs";
import { adultKeepsOut, adultShutTo } from "./intimacy-outcomes.mjs";
import {
  adultCardReread,
  adultCastOptionsView,
  adultDayTick,
  adultJobWhy,
  adultSheetIntimacyFacts,
  adultSheetPreferences,
  applyAdultCardRead,
} from "./cast-intimacy.mjs";
import { adultFarewellAsk, adultGoodbyeChosen, adultGoodbyeOptions, adultGoodbyeWords } from "./date-goodbye.mjs";
import { adultBackdropHere, adultBackdrops } from "./backdrops.mjs";
import { CLUB_VISIT_FACT } from "./club-jealousy.mjs";
import { adultFaintMemory, adultPartyActChosen, adultPartyActs, clubStaffList } from "./party-slip-away.mjs";
import {
  PRIVATE_DANCE_FACT,
  activeClubNpc,
  adultHasNpcs,
  clubNpcExtraName,
  clubRegularsList,
  isClubNpc,
  privateDanceActivities,
} from "./club-dance.mjs";
import { adultSceneDecideAndLeave, adultSceneReply } from "./intimate-scene-flow.mjs";
import { readAdultCards } from "./read-adult-cards.mjs";
import { endAdultSceneAndLeave, requestPrivateDance } from "./private-dance-flow.mjs";
import { ensureClubRegulars } from "./club-regulars.mjs";
import { ensureClubStaff } from "./club-staff.mjs";
import { adultGuide } from "./guide.mjs";
import {
  afterDarkSeenSceneBlocks,
  decideAfterDarkPeek,
  endAfterDarkPeekScene,
  prewriteAfterDarkScenes,
  startAfterDarkPeek,
  watchAfterDark,
  watchAfterDarkNow,
} from "./after-dark-scenes.mjs";
import { AFTER_DARK_MILESTONE, AFTER_DARK_PEEK_MILESTONE, INTIMATE_MILESTONE } from "./milestone-ids.mjs";

function migrateAdultCastWays(entry) {
  if (!entry || entry.waysV === 2) {
    return entry;
  }
  if (!entry.ways) {
    return {
      ...entry,
      waysV: 2,
    };
  }
  let { daring: daring, ...waysRead } = entry.ways,
    { ways: ways, ...rest } = entry;
  return {
    ...rest,
    waysRead: waysRead,
    waysV: 2,
  };
}
var ADULT_MODULE = {
  id: "adult",
  catalog: {
    name: "Adult",
    about: "Intimacy with adult characters, when the relationship allows it.",
    confirm: "Switching it on confirms that you are an adult.",
    options: [
      {
        group: "The scenes",
        key: "detail",
        kind: "pick",
        title: "How much is written",
        start: DEFAULT_INTIMACY_DETAIL,
        choices: [
          ["explicit", "Explicit", "The moment is written in full."],
          ["fade", "Fade out", "It fades out at the moment and picks up after."],
        ],
      },
      {
        group: "The scenes",
        key: "pictures",
        kind: "pick",
        title: "How many pictures",
        start: DEFAULT_PICTURE_FREQUENCY,
        choices: [
          ["one", "Just one", "At the best moment."],
          ["few", "A few", "Now and then, from start to finish."],
          ["every", "Lots", "All the way through."],
        ],
      },
      {
        group: "The cast",
        key: "afterDark",
        kind: "check",
        title: "After dark",
        why: "What the cast gets up to with each other. You can watch it, or be there.",
      },
      {
        group: "The club",
        key: "clubDancers",
        kind: "check",
        title: "The club's dancers",
        why: "The club's own dancers, who aren't in your cast. Without them, only someone you know who dances there.",
        needsRule: "npcs",
        holdsOff: true,
      },
      {
        group: "The club",
        key: "clubRegulars",
        kind: "check",
        title: "The club's regulars",
        why: "People who come to the club a lot, who aren't in your cast. Without them, only people you know.",
        needsRule: "npcs",
        needsOption: "afterDark",
        holdsOff: true,
      },
    ],
  },
  state: () => defaultAdultState(),
  cleanIn: (settings, life) => {
    let cleaned = cleanAdultSettings(settings);
    if (cleaned && life) {
      seedIntimateHistory(life, cleaned);
    }
    return cleaned;
  },
  set(life, adult, patch = {}) {
    if (INTIMACY_DETAIL_LEVELS.includes(patch.detail)) {
      adult.detail = patch.detail;
    }
    if (PICTURE_FREQUENCIES.includes(patch.pictures)) {
      adult.pictures = patch.pictures;
    }
    if (typeof patch.afterDark == "boolean") {
      adult.afterDark = patch.afterDark;
    }
    if (typeof patch.clubDancers == "boolean") {
      adult.clubDancers = patch.clubDancers;
    }
    if (typeof patch.clubRegulars == "boolean") {
      adult.clubRegulars = patch.clubRegulars;
    }
    if (patch.on === true && !adult.on) {
      seedIntimateHistory(life, adult);
      // Switching it on is the one confirmation that the player is an adult.
      adult.youAdult = true;
    }
    if (typeof patch.on == "boolean") {
      adult.on = patch.on;
    }
    if (patch.on === false && life.visit?.staying) {
      life.visit.staying = false;
    }
    if (patch.on === false) {
      for (let guest of Object.values(life.party?.guests ?? {})) {
        if (guest.aside?.dark) {
          delete guest.aside;
        }
      }
    }
    return {
      ok: true,
    };
  },
  migrate: (saved, life) => {
    let migrated = {
      ...defaultAdultState(),
      on: false,
      ...saved,
      bonds: saved.bonds ?? {},
      detail: INTIMACY_DETAIL_LEVELS.includes(saved.detail) ? saved.detail : DEFAULT_INTIMACY_DETAIL,
      pictures: PICTURE_FREQUENCIES.includes(saved.pictures) ? saved.pictures : DEFAULT_PICTURE_FREQUENCY,
      // Being on is the confirmation: older lives that never ticked "I'm an adult" count as confirmed.
      youAdult: true,
      cast: Object.fromEntries(
        Object.entries(saved.cast ?? {}).map(([id, castEntry]) => {
          let { marked: marked, ...rest } = castEntry ?? {};
          return [
            id,
            migrateAdultCastWays(
              marked && rest.mark === undefined
                ? {
                    ...rest,
                    mark: true,
                  }
                : rest,
            ),
          ];
        }),
      ),
    };
    if (migrated.on && !migrated.made && life?.bonds) {
      seedIntimateHistory(life, migrated, {
        fromStart: true,
      });
    }
    if (typeof saved.clubDancers != "boolean") {
      migrated.clubDancers = clubStaffList(saved).length > 0 || !!saved.on;
    }
    if (typeof saved.clubRegulars != "boolean") {
      migrated.clubRegulars = !!saved.afterDark && (clubRegularsList(saved).length > 0 || !!saved.on);
    }
    for (let character of life?.characters ?? []) {
      if (character.job?.id === "club-bartender" && character.job.place === CLUB_PLACE.id) {
        character.job = {
          ...character.job,
          id: "scarlet-bartender",
        };
      }
    }
    return migrated;
  },
  view: (life, adult) => ({
    detail: adult.detail,
    pictures: adult.pictures ?? DEFAULT_PICTURE_FREQUENCY,
    afterDark: !!adult.afterDark,
    clubDancers: !!adult.clubDancers,
    clubRegulars: !!adult.clubRegulars,
    ...darkPhoneView(life, adult),
    people: Object.fromEntries(
      (life.characters ?? [])
        .filter((character) => !character.away)
        .map((character) => [character.id, adultCastOptionsView(life, adult, character.id)]),
    ),
  }),
  tick: (life, adult, minutes, events) => {
    adultTickInitiativeAsks(life, adult, minutes, events);
    tickDarkEntries(life, adult, minutes);
  },
  arrived: onArrivedDark,
  partyActs: adultPartyActs,
  partyActChosen: adultPartyActChosen,
  dayTick: (life, adult) => {
    adultDayTick(life, adult);
    rollHomeDark(life, adult);
    rollClubNights(life, adult);
  },
  spans: clubNightSpans,
  castMeet: rollCastMeetDark,
  partyTick: partyTickDark,
  specials: adultSpecialActions,
  sheet: (life, adult, character) => [
    ...adultSheetAdultToggle(life, adult, character),
    ...adultSheetIntimacyFacts(life, adult, character),
    ...adultSheetPreferences(life, adult, character),
  ],
  setCharacter: setAdultCharacterOption,
  sceneBlocks: (life, adult, scene, options) =>
    afterDarkSeenSceneBlocks(life, scene) ?? adultSceneBlocks(life, adult, scene, options),
  content: adultContentGuidance,
  pictureGuidance: adultPictureGuidance,
  stayWhy: adultStayWhy,
  factWeight: adultFactWeight,
  shutTo: adultShutTo,
  keepsOut: adultKeepsOut,
  jobWhy: adultJobWhy,
  cardReread: adultCardReread,
  backdrops: adultBackdrops,
  backdropHere: adultBackdropHere,
  farewellAsk: adultFarewellAsk,
  goodbye: adultGoodbyeOptions,
  goodbyeWords: adultGoodbyeWords,
  goodbyeChosen: adultGoodbyeChosen,
  stayHere: adultStayHere,
  tonight: adultTonightOptions,
  tonightChosen: adultTonightChosen,
  weddingNight: adultWeddingNight,
  tripNight: adultTripNightOptions,
  tripNightChosen: adultTripNightChosen,
  freeActs: adultFreeActs,
  freeJump: adultFreeJump,
  freeApply: adultFreeApply,
  cardFields: (life, adult) =>
    adult?.on
      ? [
          {
            key: "adult",
            shape: '"yes, no or unsaid"',
            rule: ADULT_CARD_RULE,
            clean: (value) =>
              cleanAdultAnswer(
                String(value ?? "")
                  .trim()
                  .toLowerCase(),
              ),
          },
          {
            key: "intimacy_ways",
            shape: INTIMACY_WAYS_SHAPE,
            rule: INTIMACY_WAYS_RULE,
            clean: (value) => (value && typeof value == "object" ? value : {}),
          },
          {
            key: "intimacy_likes",
            shape: '["\u2026"]',
            rule: INTIMACY_LIKES_RULE,
            clean: (value) => cleanIntimacyLikes(value).map((like) => like.text),
          },
          {
            key: "intimacy_limits",
            shape: '[{"text":"\u2026","stage":"no or not yet"}]',
            rule: INTIMACY_LIMITS_RULE,
            clean: (value) =>
              cleanIntimacyLimits(value).map(({ text: text, stage: stage }) => ({
                text: text,
                stage: stage,
              })),
          },
          {
            key: "intimacy_disposition",
            shape: '"dominant, submissive, switch or unsaid"',
            rule: INTIMACY_DISPOSITION_RULE,
            clean: (value) => cleanIntimacyDisposition(value),
          },
          {
            key: "intimacy_kinks",
            shape: '["\u2026"]',
            rule: INTIMACY_KINKS_RULE,
            clean: (value) => cleanIntimacyKinks(value),
          },
        ]
      : [],
  castRead(life, adult, cast) {
    for (let entry of Array.isArray(cast) ? cast : []) {
      if (entry?.cardId && entry.modules?.adult) {
        applyAdultCardRead(life, adult, entry.cardId, entry.modules.adult);
      }
    }
  },
  guide: () => adultGuide(),
  changelog: {
    "0.2.0": [
      {
        text: "Intimacy between adult characters, when the relationship is there.",
        dev: "Some players want this and some don't want it anywhere near their game. So it's a module: nothing changes unless you switch it on.",
        items: [
          "Switch it on for a life: confirm you're an adult, and pick how much is written (in full, or fading out at the moment) and how many pictures.",
          "Only ever between adults. Every card is read for it, and you can mark someone yourself when their card doesn't say.",
          "It needs the relationship: dating and past your first kiss, or someone who isn't the faithful type once they're really into you.",
        ],
      },
      {
        text: "The night itself.",
        dev: "The first version was short and only got going at the very end. Now it takes its time.",
        items: [
          "You ask them right where you are, go there together, and it goes on there: your place, theirs, a hotel room, your car at night.",
          "Eight long parts, from the start to the moment itself and the after. After each one, pick how it goes on or write it yourself, and stop whenever you want.",
          "Its pictures follow the scene: where you are, and what everyone's still wearing.",
        ],
      },
      {
        text: "Everyone's different in bed.",
        items: [
          "Some like to lead, some take it slow; tender or playful, shy or sure of themselves, cautious or daring.",
          "Things they love and limits of their own, straight from their card. Limits can change with trust.",
          "You learn it all as you go, in their ADULT tab, and you can change any of it.",
        ],
      },
      {
        text: "More ways for it to happen.",
        items: [
          "They can bring it up themselves when you're alone somewhere private.",
          "Say it in your own words in a scene.",
          "A date that goes really well can end somewhere else, your idea or theirs.",
          {
            text: "With multiple relationships on, more than two: whoever's there, or someone you call over.",
            dev: "Everyone has to want it, and they all have to get along. No rivals, exes or family.",
          },
        ],
      },
      {
        text: "Riskier spots.",
        dev: "A bit of fun on the side: getting caught is rare, but it can happen.",
        items: [
          "Some places have a spot for it, like a bathroom or the gym's showers, each with its own background.",
          "Not everyone's up for it, and getting caught means a fine and a few days away from that place.",
        ],
      },
      "Its own section in the GUIDE, explaining all of it.",
    ],
    "0.2.4": [
      {
        text: "Staying over after a night together.",
        dev: "One of you ran into this: after sleeping with someone you're close to, you couldn't stay the night with them. Thanks for telling me!",
        items: [
          "Sleeping together earlier that day doesn't stop you from staying the night anymore.",
          "Anyone who'd sleep with you lets you stay over when they go to bed, not only someone you've been with for a while.",
        ],
      },
    ],
    "0.3.0": [
      {
        text: "The nights.",
        dev: "A night together used to end the moment it was over. Now there's a morning after, and the big days get a night of their own.",
        items: [
          "After a night together, stay where you are and wake up together.",
          "Someone else at home? You try to keep it quiet, and they might still hear you.",
          "Your engagement, your wedding night and every night of your honeymoon are their own nights.",
        ],
      },
      {
        text: "The Scarlet Club.",
        dev: "The town needed somewhere to go late at night. It's only there when the module is on and you've said you're an adult.",
        items: [
          "A club on the nightlife street, open at night. Go in and watch the show.",
          "Ask for a private dance in the VIP room, from the club's own dancers or from someone you know who works there.",
          "People from your cast can work there: dancing, behind the bar or at the door.",
          "If your partner finds out you went, they may want to talk about it. Not if they work there themselves.",
        ],
      },
      {
        text: "AFTER DARK: your cast has nights of their own.",
        dev: "The town doesn't stop when you're not looking. People who are drawn to each other get together, and sometimes you're close enough to notice.",
        items: [
          "Couples at home, two people who are into each other, a night at the club, two guests slipping away at a party.",
          "It all shows up in the AFTER DARK app on your phone, to read whenever you want.",
          "When it happens near you, you choose: take a look yourself, watch it from outside, or not now. Each one says what it does.",
          "Taking a look, you can walk away, let them see you, or join them if everyone would want that.",
          "If it's your partner, now you know, and you can confront them. Not if you agreed to see other people.",
          "Pictures come along as it goes, each one when you get to its part.",
          "The two of them remember it, and it changes things between them.",
          {
            text: "Only ever between adults, and never family.",
            dev: "Two people from the same family are family to each other too, and someone who stops being an adult is gone from it, pictures included.",
          },
        ],
      },
      {
        text: "Slipping away at a party.",
        items: [
          "At a party, take someone to a room of the house, or more than one if everyone's up for it.",
          "The music covers most of it, but someone might still hear.",
        ],
      },
      {
        text: "A few more things.",
        items: [
          "Once you switch it on for a life, it stays on for that life, and switching it on asks you twice.",
          "If you pass out in the middle of it, that's how they remember it.",
          "The scene's name follows the time of day: an afternoon is not a night.",
        ],
      },
      {
        text: "Fixes",
        items: [
          {
            text: "They don't come asking every single day anymore: after a night together, they take a day or three, depending on who they are.",
            dev: "In my own playtest, the same person came looking for me every day. It was a lot!",
          },
          "Until you tick \xABI'm an adult\xBB, the module does nothing at all, and its places aren't on the map.",
          "The ADULT tab and its options only show for adults who aren't your family.",
          "A couple that starts the game together, or was together before you switched it on, has already been together.",
          "Sleep together shows greyed out with the reason when it can't happen right now, instead of disappearing.",
          "Limits you set yourself stay the way you set them.",
          "A picture shows up when you get to its part of the scene, not before.",
          "What you write between parts stays in the scene, and everyone in it remembers the night.",
          "END SCENE between parts closes it properly, with an ending and a memory.",
          "Choices and notes are in your life's language.",
          "A breakup, or a relationship that cooled off, also ends a pending ask.",
          "Who else? leaves out anyone who's working, and the karaoke room is only for a date there.",
          "The hotel room is paid when you get there, a date's goodbye never switches where you go, and a place that closes shows you out.",
          "At work nobody takes you anywhere; on your lunch break, only right there, if it fits.",
          "If the model doesn't answer at the end of a scene, you can try again or go on without it.",
        ],
      },
    ],
    "0.3.1": [
      {
        text: "The club's own people are up to you.",
        dev: "Some of you don't want strangers showing up in your town out of nowhere. Now they only come if you ask for them.",
        items: [
          "Two new options: \xABThe club's dancers\xBB and \xABThe club's regulars\xBB. They need NPCs on in RULES, and the regulars need After dark too.",
          "Without them, the Scarlet Club is still there, with only your cast: the show, a private dance from someone you know who dances there, and AFTER DARK between people you know.",
          "Switch them off and those people step aside without being forgotten: switch them back on, and they come back remembering everything.",
          "A life from before keeps them as it had them.",
        ],
      },
      {
        text: "Fixes",
        items: [
          "At someone else's party, nobody slips away while you're saying goodbye, and never the host, so the goodbye can't leave you stuck at the door.",
          "Nobody asks you for a night together in the middle of a goodbye.",
          "Watching or taking a look at AFTER DARK, or asking for a private dance, waits until what's on screen is closed, so nothing that was ending gets lost.",
        ],
      },
    ],
    "0.3.2": [
      {
        text: "Fixes",
        items: [
          "Intimate scenes are longer and get to the point sooner. The same goes for taking a look at AFTER DARK.",
          "Characters who aren't adults never end up at the hotel or the club.",
        ],
      },
    ],
  },
  owns: (scene) =>
    [
      INTIMATE_MILESTONE,
      CLUB_TALK_MILESTONE,
      CLUB_DANCE_MILESTONE,
      AFTER_DARK_MILESTONE,
      AFTER_DARK_PEEK_MILESTONE,
      PRIVATE_DANCE_FACT,
      CLUB_VISIT_FACT,
    ].includes(scene?.milestone),
  sceneEnd: async (host, life, adult) =>
    (await endAfterDarkPeekScene(host, life, adult)) ?? endAdultSceneAndLeave(host, life, adult),
  extraOf: activeClubNpc,
  isNpc: isClubNpc,
  extraName: clubNpcExtraName,
  hasNpcs: adultHasNpcs,
  faintMemory: adultFaintMemory,
  activities: (life, adult) => [...privateDanceActivities(life, adult), ...darkActivities(life, adult)],
  routes: (host) => ({
    "POST dance": (life, adult, req) => requestPrivateDance(host, life, adult, String(req.body?.staff ?? "")),
    "POST dark": (life, adult, req) => watchAfterDark(host, life, adult, req.body?.id),
    "POST dark-later": (life, adult, req) => putOffDark(life, adult, String(req.body?.id ?? "")),
    "POST dark-now": (life, adult, req) => watchAfterDarkNow(host, life, adult, req.body?.id),
    "POST peek": (life, adult, req) => startAfterDarkPeek(host, life, adult, req.body?.id),
  }),
  sceneReply: adultSceneReply,
  sceneDecide: (host, life, adult, choice, { noLines = false } = {}) =>
    life.scene?.milestone === AFTER_DARK_PEEK_MILESTONE && !life.scene.done
      ? decideAfterDarkPeek(host, life, adult, choice, {
          sceneDecide: adultSceneDecideAndLeave,
          noLines: noLines,
        })
      : adultSceneDecideAndLeave(host, life, adult, choice, {
          noLines: noLines,
        }),
  background: async (host, life) => {
    for (let task of [readAdultCards, ensureClubStaff, ensureClubRegulars, prewriteAfterDarkScenes]) {
      try {
        await task(host, life);
      } catch (err) {
        if (err?.cancelled) {
          throw err;
        }
        host.log?.warn?.(`[adult] ${task.name}: ${err?.message ?? err}`);
      }
    }
  },
  covered: {
    events: {
      [AFTER_DARK_MILESTONE]: "AFTER DARK's scene you only watch: from its cut or its app, never in words",
      [AFTER_DARK_PEEK_MILESTONE]:
        "AFTER DARK, being right there: Follow them / Take a look, never in words (its call is its own)",
      [CLUB_DANCE_MILESTONE]:
        "A private dance \xB7 <name> in the Scarlet Club's list: its own scene (the club's staff are no cast: nothing in words reaches it)",
      [CLUB_TALK_MILESTONE]:
        "theirs to bring up (their partner found out the player went to the Scarlet Club, and minds): the call is its own",
      [INTIMATE_MILESTONE]:
        "act intimate, somewhere private (or this place's spot, when their daring allows it) and with the code's yes: to its call (THE ENGINE READ, with a way back); elsewhere they say not here; with more people in the scene, act intimate-all, the same for each one of them (else NOT ALL OF THEM); or SPECIAL ACTIONS \xB7 Sleep together (Who else?, Where?); or theirs to bring up, somewhere private, by their initiative, sometimes with whoever else is there; at the end of a date going this well, \xABSomewhere together\xBB in the goodbye, or theirs to ask (its places, or Not now)",
    },
    facts: {
      [PRIVATE_DANCE_FACT]: "a private dance happens at the club, never in words: words do not reach it",
      [CLUB_VISIT_FACT]:
        "going to the Scarlet Club happens on the map, never in words: words do not reach it (no claim about it yet)",
      [INTIMATE_MILESTONE]: "act intimate; claim slept (true, false or denied, as kissed)",
    },
  },
};
var BUILTIN_LIFE_MODULES = [ADULT_MODULE];
for (let mod of BUILTIN_LIFE_MODULES) {
  if (!allModules().some((registered) => registered.id === mod.id)) {
    registerModule(mod);
  }
}
