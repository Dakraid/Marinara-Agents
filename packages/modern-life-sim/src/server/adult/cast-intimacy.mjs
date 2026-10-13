// Per-character adult flag, card reads, ways/likes/limits sheet and how the player's choices touch them
import { eventCast } from "../events/event-cast.mjs";
import { BOND_AXES, bondTier } from "../relationships/bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { hurtBond } from "../romance/jealousy.mjs";
import { workingHome } from "../cast/working-now.mjs";
import { bondOf, characterOf, traitsOf } from "../game.mjs";
import { ADULT_ANSWERS, CLUB_PLACE, CLUB_TALK_MILESTONE, INTIMATE_ENERGY_COST } from "./tuning.mjs";
import { turnedDownHurt } from "./consent.mjs";
import { ATTRACTION_LABELS } from "../orientation/orientation.mjs";
import { ATTRACTION_OPTIONS } from "../orientation/attraction-options.mjs";
import {
  INTIMACY_DISPOSITIONS,
  INTIMACY_DISPOSITION_LABELS,
  INTIMACY_KINKS_MAX,
  INTIMACY_WAY_AXES,
  INTIMACY_WAY_LABELS,
  INTIMACY_WAY_OPTIONS,
  LEAN_NIGHTS_TO_SHIFT,
  LIMIT_PUSH_COST,
  LIMIT_STAGES,
  LIMIT_STAGE_LABELS,
  cleanIntimacyDisposition,
  cleanIntimacyKinks,
  cleanIntimacyLikes,
  cleanIntimacyLimits,
  cleanIntimacyWays,
  leanWayToward,
  limitResponse,
  nudgeLimitOpen,
  parseWayChoice,
  resolveIntimacyWays,
  thawLimits,
} from "./intimacy-ways.mjs";
import { INTIMATE_DAY_MINUTES, adultMarkOf, adultNameFor, consentFor, intimateBondOf } from "./intimate-milestone.mjs";
import { dropAdultFactsForCharacter, intimacyConsentWithSpecial } from "./sleep-together.mjs";
import { queueClubJealousyTalks } from "./club-jealousy.mjs";
import { INTIMATE_MILESTONE } from "./milestone-ids.mjs";

function pruneStaleAdultAsks(state) {
  for (let character of state.characters ?? []) {
    let bond = bondOf(state, character.id);
    if (
      bond?.asks?.id === CLUB_TALK_MILESTONE &&
      (!MILESTONE_COUPLE_STATUSES.includes(bond.status) ||
        !state.rules?.jealousy ||
        character.job?.place === CLUB_PLACE.id)
    ) {
      bond.asks = null;
      continue;
    }
    if (bond?.asks?.id === INTIMATE_MILESTONE) {
      if (intimacyConsentWithSpecial(state, character.id).how !== "yes" || workingHome(state, character)) {
        bond.asks = null;
        continue;
      }
      if (bond.asks.with?.length) {
        bond.asks.with = bond.asks.with.filter((id) => consentFor(state, id).how === "yes");
      }
    }
  }
}
function declineIntimacyOutcome(state, adult, scene) {
  let characterId = scene.characterId,
    bond = bondOf(state, characterId),
    before = {
      friendship: bond.friendship,
      romance: bond.romance,
      trust: bond.trust,
    };
  if (scene.by === "them" && !scene.about?.special && intimacyConsentWithSpecial(state, characterId).how !== "yes") {
    bond.asks = null;
  } else if (scene.by === "them" && !scene.about?.special) {
    let { days: days, ...hurt } = turnedDownHurt(traitsOf(state, characterId));
    hurtBond(bond, hurt);
    intimateBondOf(adult, characterId).retry = state.minutes + days * INTIMATE_DAY_MINUTES;
    bond.asks = null;
  }
  for (let axis of BOND_AXES) {
    scene.totals[axis] = Math.round((scene.totals[axis] + bond[axis] - before[axis]) * 10) / 10;
  }
  if (state.visit?.characterId === characterId) {
    state.visit.staying = false;
  }
  return scene.about?.special
    ? {
        headline: "You fell asleep together.",
        stamp: null,
      }
    : {
        headline: scene.by === "them" ? "Not now." : "You stopped it there.",
        stamp: null,
      };
}
function drainEnergyForIntimacy(state, hours) {
  let energy = state.needs.energy ?? 0;
  state.needs.energy = Math.max(Math.min(1, energy), energy - INTIMATE_ENERGY_COST * hours);
}
function adultJobWhy(state, adult, characterId, job) {
  return job?.place !== CLUB_PLACE.id
    ? ""
    : adult.youAdult
      ? adultMarkOf(adult, characterId) === "yes"
        ? ""
        : `Only an adult can work at the ${CLUB_PLACE.name}.`
      : `The ${CLUB_PLACE.name} is for adults only.`;
}
function adultCardReread(state, adult, characterId) {
  let castEntry = adult.cast?.[characterId];
  if (castEntry) {
    delete castEntry.read;
    delete castEntry.adult;
    delete castEntry.waysRead;
    delete castEntry.dispositionRead;
    pruneStaleAdultAsks(state);
  }
}
function applyAdultCardRead(state, adult, characterId, card) {
  let castEntry = (adult.cast[characterId] ??= {});
  if ((ADULT_ANSWERS.includes(card?.adult) && (castEntry.adult = card.adult), card?.adult === "no")) {
    for (let key of ["waysRead", "likes", "limits", "found", "dispositionRead", "kinks", "kinksOwn"]) {
      delete castEntry[key];
    }
    if (adultMarkOf(adult, characterId) !== "yes") {
      dropAdultFactsForCharacter(state, characterId);
    }
    castEntry.waysV = 2;
    castEntry.read = true;
    return;
  }
  if (card?.intimacy_ways && typeof card.intimacy_ways == "object") {
    castEntry.waysRead = cleanIntimacyWays(card.intimacy_ways);
  }
  castEntry.waysV = 2;
  if (Array.isArray(card?.intimacy_likes) && !castEntry.likes?.length) {
    castEntry.likes = cleanIntimacyLikes(card.intimacy_likes);
  }
  if (Array.isArray(card?.intimacy_limits) && !castEntry.limits?.length) {
    castEntry.limits = cleanIntimacyLimits(card.intimacy_limits);
  }
  if (card?.intimacy_disposition !== undefined) {
    castEntry.dispositionRead = cleanIntimacyDisposition(card.intimacy_disposition);
  }
  // Kinks the player set by hand stay theirs; the card only fills them in until then.
  if (Array.isArray(card?.intimacy_kinks) && !castEntry.kinksOwn) {
    castEntry.kinks = cleanIntimacyKinks(card.intimacy_kinks);
  }
  castEntry.read = true;
}
function intimacyWaysFor(state, adult, characterId) {
  let archetype = bondOf(state, characterId)?.archetype?.main ?? "grounded",
    traits = traitsOf(state, characterId),
    castEntry = adult.cast[characterId] ?? {};
  return resolveIntimacyWays(
    {
      ...(castEntry.waysRead ?? {}),
      ...(castEntry.ways ?? {}),
    },
    archetype,
    traits,
  );
}
var intimacyLikesFor = (adult, characterId) => adult.cast[characterId]?.likes ?? [];
var intimacyLimitsFor = (adult, characterId) => adult.cast[characterId]?.limits ?? [];
// The player's own pick (even "", unset) wins over what the card said.
var intimacyDispositionFor = (adult, characterId) => {
  let castEntry = adult.cast?.[characterId] ?? {};
  return cleanIntimacyDisposition(castEntry.disposition ?? castEntry.dispositionRead);
};
var intimacyKinksFor = (adult, characterId) => adult.cast?.[characterId]?.kinks ?? [];
var DISPOSITION_PROMPTS = {
  dominant: "dominant (they like to take control)",
  submissive: "submissive (they like to give up control)",
  switch: "a switch (they enjoy both taking and giving up control)",
};
function intimacyPreferenceLines(adult, ids, { byId = ids.length > 1 } = {}) {
  let who = (id) => (byId ? `${id}: ` : ""),
    dispositions = ids
      .filter((id) => intimacyDispositionFor(adult, id))
      .map((id) => `${who(id)}${DISPOSITION_PROMPTS[intimacyDispositionFor(adult, id)]}`),
    kinks = ids.flatMap((id) => intimacyKinksFor(adult, id).map((kink) => `${who(id)}${kink}`));
  return [
    dispositions.length
      ? `IN CONTROL OR NOT${byId ? " (by id)" : ""}: ${dispositions.join(" \xB7 ")}. Who leads and who yields follows this.`
      : "",
    kinks.length
      ? `THEIR KINKS AND FETISHES${byId ? " (id: what)" : ""}: ${kinks.join(" \xB7 ")}. They want these: bring them in where they fit the moment, never past a limit.`
      : "",
  ].filter(Boolean);
}
var trustForLimits = (state, characterId) => {
  let bond = bondOf(state, characterId);
  return bond ? bondTier(bond, "trust") : 0;
};
var hasSleptTogether = (adult, characterId) => (adult.bonds[characterId]?.times ?? 0) > 0;
var canShowIntimacySheet = (state, adult, characterId) =>
  !!adult.youAdult && adultMarkOf(adult, characterId) === "yes" && !bondOf(state, characterId)?.kin;
function adultSheetIntimacyFacts(state, adult, characterId) {
  if (!canShowIntimacySheet(state, adult, characterId)) {
    return [];
  }
  let slept = hasSleptTogether(adult, characterId),
    ways = intimacyWaysFor(state, adult, characterId),
    castEntry = adult.cast[characterId] ?? {},
    unknownNote = "??? \xB7 after your first time together",
    likes = intimacyLikesFor(adult, characterId)
      .filter((like) => castEntry.found?.[like.key])
      .map((like) => ({
        text: like.text,
      })),
    limits = intimacyLimitsFor(adult, characterId)
      .filter((limit) => castEntry.found?.[limit.key] && limit.stage !== "open")
      .map((limit) => ({
        text: `${limit.text} \xB7 ${limit.stage}`,
        bad: true,
      }));
  return [
    ...INTIMACY_WAY_AXES.map((axis) => ({
      kind: "fact",
      title: axis.toUpperCase(),
      value: slept ? INTIMACY_WAY_LABELS[axis][ways[axis]] : "",
      unknown: unknownNote,
    })),
    {
      kind: "chips",
      title: "In bed \xB7 likes",
      items: likes,
      unknown: "???",
    },
    {
      kind: "chips",
      title: "In bed \xB7 limits",
      items: limits,
      unknown: "???",
    },
  ];
}
function adultSheetPreferences(state, adult, characterId) {
  if (!canShowIntimacySheet(state, adult, characterId)) {
    return [];
  }
  let into = characterOf(state, characterId)?.into ?? null;
  return [
    {
      kind: "pick",
      key: "disposition",
      title: "DISPOSITION",
      value: intimacyDispositionFor(adult, characterId),
      choices: ["", ...INTIMACY_DISPOSITIONS].map((value) => [value, INTIMACY_DISPOSITION_LABELS[value]]),
    },
    {
      kind: "tags",
      key: "kinks",
      title: "KINKS & FETISHES",
      items: intimacyKinksFor(adult, characterId),
      max: INTIMACY_KINKS_MAX,
    },
    {
      // The core's own orientation ("into"), set through its setter.
      kind: "orient",
      key: "into",
      title: "ORIENTATION",
      value: into,
      multi: Array.isArray(into),
      choices: ATTRACTION_OPTIONS.map((value) => [value, ATTRACTION_LABELS[value] ?? value]),
    },
  ];
}
function adultCastOptionsView(state, adult, characterId) {
  if (!canShowIntimacySheet(state, adult, characterId)) {
    return null;
  }
  let ways = intimacyWaysFor(state, adult, characterId),
    noneNote = "None read from their card yet";
  return {
    title: "Adult module options",
    sections: [
      {
        kind: "picks",
        items: INTIMACY_WAY_AXES.map((axis) => ({
          key: `way.${axis}`,
          title: axis.toUpperCase(),
          value: ways[axis],
          choices: INTIMACY_WAY_OPTIONS[axis].map((option) => [option, INTIMACY_WAY_LABELS[axis][option]]),
        })),
      },
      {
        kind: "chips",
        title: "LIKES",
        none: noneNote,
        items: intimacyLikesFor(adult, characterId).map((like) => ({
          key: `like.${like.key}`,
          text: like.text,
          remove: true,
        })),
      },
      {
        kind: "chips",
        title: "LIMITS",
        none: noneNote,
        bad: true,
        items: intimacyLimitsFor(adult, characterId).map((limit) => ({
          key: `limit.${limit.key}`,
          text: limit.text,
          value: limit.stage,
          choices: LIMIT_STAGES.map((stage) => [stage, LIMIT_STAGE_LABELS[stage]]),
        })),
      },
    ],
  };
}
function adultDayTick(state, adult) {
  if (
    (adult.bans &&
      (adult.bans = Object.fromEntries(Object.entries(adult.bans).filter(([, until]) => until > state.minutes))),
    !!adult.youAdult)
  ) {
    queueClubJealousyTalks(state, adult);
    for (let characterId of Object.keys(adult.cast ?? {})) {
      if (intimacyLimitsFor(adult, characterId).length) {
        thawLimits(intimacyLimitsFor(adult, characterId), trustForLimits(state, characterId));
      }
    }
  }
}
function intimacyWaysPrompt(state, adult, characterId, others = []) {
  let limitTake = (limit, trust) =>
      limitResponse(limit, trust) === "gentle"
        ? "they go along with it, a little unsure, and it goes well"
        : "they stop it, in their own way, and it goes on another way",
    waysLine = (ways) =>
      INTIMACY_WAY_AXES.map(
        (axis) => `${axis} ${ways[axis]} (${INTIMACY_WAY_LABELS[axis][ways[axis]].toLowerCase()})`,
      ).join(" \xB7 ");
  if (!others.length) {
    let trust = trustForLimits(state, characterId),
      likes2 = intimacyLikesFor(adult, characterId),
      limits2 = intimacyLimitsFor(adult, characterId).filter((limit) => limit.stage !== "open");
    return [
      `HOW THEY ARE IN THIS: ${waysLine(intimacyWaysFor(state, adult, characterId))}. Let the passage and the three ways on lean to how they are: it shapes how it goes, never whether it goes on.`,
      ...intimacyPreferenceLines(adult, [characterId]),
      likes2.length
        ? `WHAT THEY LIKE (id: what): ${likes2.map((like) => `${like.key}: ${like.text}`).join(" \xB7 ")}. If what the player chose is one of these, they love it, and it shows.`
        : "",
      limits2.length
        ? `THEIR LIMITS (id: what \xB7 if the player's choice touches it): ${limits2.map((limit) => `${limit.key}: ${limit.text} \xB7 ${limitTake(limit, trust)}`).join(" \xB7 ")}.`
        : "",
      '`took` is about how the player chose to go on (above), read from it only: `touch` is the id of the like or limit it touches, or ""; `fits` is true when it fits how they are; `lean` is the way it leans, as axis:value (e.g. confidence:sure), or "".',
    ].filter(Boolean).join(`
`);
  }
  let everyone = [characterId, ...others],
    likes = everyone.flatMap((id) => intimacyLikesFor(adult, id).map((like) => `${id}:${like.key}: ${like.text}`)),
    limits = everyone.flatMap((id) =>
      intimacyLimitsFor(adult, id)
        .filter((limit) => limit.stage !== "open")
        .map((limit) => `${id}:${limit.key}: ${limit.text} \xB7 ${limitTake(limit, trustForLimits(state, id))}`),
    );
  return [
    `HOW EACH ONE IS IN THIS (by id): ${everyone.map((id) => `${id}: ${waysLine(intimacyWaysFor(state, adult, id))}`).join(" \u2014 ")}. Let the passage and the three ways on lean to how each one is: it shapes how it goes, never whether it goes on; every one of them takes part.`,
    ...intimacyPreferenceLines(adult, everyone),
    likes.length
      ? `WHAT EACH ONE LIKES (id:key: what): ${likes.join(" \xB7 ")}. If what the player chose is one of these, that one loves it, and it shows.`
      : "",
    limits.length
      ? `THEIR LIMITS (id:key: what \xB7 if the player's choice touches it): ${limits.join(" \xB7 ")}.`
      : "",
    `\`took\` is about how the player chose to go on (above), read from it only: \`touch\` is the id:key of the like or limit it touches (e.g. ${characterId}:g1), or ""; \`fits\` is true when it fits how they are; \`lean\` is whose way it leans and how, as id:axis:value (e.g. ${characterId}:confidence:sure), or "".`,
  ].filter(Boolean).join(`
`);
}
function applyIntimacyTook(state, adult, scene, took) {
  let characterId = scene.characterId,
    cast = eventCast(scene),
    isGroup = cast.length > 1,
    adultTurn = scene.adult,
    notes = [];
  if (!took || typeof took != "object") {
    return notes;
  }
  adultTurn.each ??= {};
  let eachOf = (id) =>
    (adultTurn.each[id] ??= {
      liked: false,
      leans: [],
    });
  adultTurn.chosen = (adultTurn.chosen ?? 0) + 1;
  if (took.fits === true) {
    adultTurn.fits = (adultTurn.fits ?? 0) + 1;
  }
  let splitOwner = (parts) =>
      parts.length > 1 && cast.includes(parts[0]) ? [parts[0], parts.slice(1)] : [characterId, parts],
    [leanOwner, leanParts] = splitOwner(
      String(took.lean ?? "")
        .trim()
        .toLowerCase()
        .split(":"),
    ),
    lean = parseWayChoice(leanParts.join(":"));
  if (lean && cast.includes(leanOwner)) {
    eachOf(leanOwner).leans.push(lean);
  }
  let [touchOwner, [touchKey = ""]] = splitOwner(
    String(took.touch ?? "")
      .trim()
      .split(":")
      .map((part, index, parts) => (index === parts.length - 1 ? part.toLowerCase() : part)),
  );
  if (!cast.includes(touchOwner)) {
    return notes;
  }
  let ownerName = isGroup ? adultNameFor(state, touchOwner).toUpperCase() : "",
    castEntry = (adult.cast[touchOwner] ??= {}),
    like = intimacyLikesFor(adult, touchOwner).find((like2) => like2.key === touchKey);
  if (like) {
    eachOf(touchOwner).liked = true;
    notes.push({
      text: isGroup ? `\u2665 ${ownerName} LOVES THAT` : "\u2665 THEY LOVE THAT",
      step: true,
    });
    if (!castEntry.found?.[like.key]) {
      castEntry.found = {
        ...(castEntry.found ?? {}),
        [like.key]: true,
      };
      notes.push({
        text: isGroup ? `A LIKE \xB7 ON ${ownerName}'S SHEET` : "A LIKE \xB7 ON THEIR SHEET",
      });
    }
  }
  let limit = intimacyLimitsFor(adult, touchOwner).find((limit2) => limit2.key === touchKey && limit2.stage !== "open");
  if (limit) {
    let response = limitResponse(limit, trustForLimits(state, touchOwner));
    if (
      (castEntry.found?.[limit.key] ||
        ((castEntry.found = {
          ...(castEntry.found ?? {}),
          [limit.key]: true,
        }),
        notes.push({
          text: isGroup ? `A LIMIT \xB7 ON ${ownerName}'S SHEET` : "A LIMIT \xB7 ON THEIR SHEET",
        })),
      response === "stop")
    ) {
      let bond = bondOf(state, touchOwner),
        trustBefore = bond.trust;
      hurtBond(bond, LIMIT_PUSH_COST);
      if (touchOwner === characterId) {
        scene.totals.trust = Math.round((scene.totals.trust + bond.trust - trustBefore) * 10) / 10;
      }
      notes.unshift(
        {
          text: isGroup ? `\u2715 ${ownerName} STOPPED IT` : "\u2715 THEY STOPPED IT",
          bad: true,
        },
        {
          text: `${LIMIT_PUSH_COST.trust} TRUST${isGroup ? ` \xB7 ${ownerName}` : ""}`,
          bad: true,
        },
      );
    } else if (nudgeLimitOpen(limit, response).opened) {
      notes.unshift({
        text: isGroup ? `\u2605 ${ownerName} IS OPEN TO IT NOW` : "\u2605 OPEN TO IT NOW",
        step: true,
      });
    }
  }
  return notes;
}
function applyIntimacyLeans(state, adult, characterId, leans) {
  let intimateBond = intimateBondOf(adult, characterId),
    counts = {};
  for (let lean of leans) {
    counts[`${lean.axis}:${lean.value}`] = (counts[`${lean.axis}:${lean.value}`] ?? 0) + 1;
  }
  let topLean = Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
  if (
    ((intimateBond.lean =
      topLean && intimateBond.lean?.to === topLean
        ? {
            to: topLean,
            nights: intimateBond.lean.nights + 1,
          }
        : topLean
          ? {
              to: topLean,
              nights: 1,
            }
          : null),
    intimateBond.lean && intimateBond.lean.nights >= LEAN_NIGHTS_TO_SHIFT)
  ) {
    let [axis, value] = intimateBond.lean.to.split(":"),
      ways = intimacyWaysFor(state, adult, characterId);
    if (leanWayToward(ways, axis, value)) {
      adult.cast[characterId] = {
        ...(adult.cast[characterId] ?? {}),
        ways: {
          ...(adult.cast[characterId]?.ways ?? {}),
          [axis]: ways[axis],
        },
        waysV: 2,
      };
    }
    intimateBond.lean = null;
  }
}

export {
  adultCardReread,
  adultCastOptionsView,
  adultDayTick,
  adultJobWhy,
  adultSheetIntimacyFacts,
  adultSheetPreferences,
  applyAdultCardRead,
  applyIntimacyLeans,
  applyIntimacyTook,
  declineIntimacyOutcome,
  drainEnergyForIntimacy,
  intimacyDispositionFor,
  intimacyKinksFor,
  intimacyPreferenceLines,
  intimacyWaysFor,
  intimacyWaysPrompt,
  pruneStaleAdultAsks,
};
