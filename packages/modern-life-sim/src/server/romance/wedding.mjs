// Wedding planning, guests, the wedding day and incidents
import { clockFromMinutes } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { townJobById } from "../jobs/town-jobs.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import { adjustBondAxis, bondTier, setRelationshipStatus } from "../relationships/bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { ITEM_CATALOG } from "../items/catalog.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { recordTownFact } from "../network/town-facts.mjs";
import { clampOutingMood } from "../outings/outing-scoring.mjs";
import { giftTasteVerdict, visibleGiftTastes } from "../gifts/gift-tastes.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { earnMoney, spendMoney } from "../money/wallet.mjs";
import { townPlace } from "../town/town-layout.mjs";
import { firstModuleHook } from "../modules/module-registry.mjs";
import { openOuting, settleOuting } from "../outings/outing.mjs";
import { leaveTheirPartyIfAny } from "../parties/party.mjs";
import { knobsOf } from "./romantic-acts.mjs";
import { WEDDING_DAY_MINUTES, weddingOf } from "./proposal.mjs";
import { bondOf, castInTown, characterOf, hasMet2, logNote, nameFor, traitsOf } from "../game.mjs";

function weddingDays(state) {
  let wedding = weddingOf(state);
  if (!wedding) {
    return [];
  }
  let today = clockFromMinutes(state.minutes).dayIndex,
    seasonStart = (Math.floor(today / 30) + 1) * 30,
    partner = characterOf(state, wedding.characterId);
  return Array.from(
    {
      length: 30,
    },
    (unused, offset) => {
      let day = seasonStart + offset,
        clock = clockFromMinutes(day * WEDDING_DAY_MINUTES),
        works = !!partner?.job?.id && !!townJobById(state.town, partner.job.id)?.days?.includes(clock.weekdayIndex);
      return {
        d: day,
        weekday: clock.weekday.toUpperCase(),
        n: clock.day,
        season: clock.season,
        works: !!works,
      };
    },
  );
}
function setWeddingDay(state, dayInput) {
  let wedding = weddingOf(state);
  if (!wedding) {
    return {
      ok: false,
      reason: "There is no wedding to plan.",
    };
  }
  let option = weddingDays(state).find((option2) => option2.d === Number(dayInput));
  return option
    ? ((wedding.day = option.d),
      logNote(
        state,
        `The wedding with ${characterOf(state, wedding.characterId)?.name ?? "them"}: ${option.weekday} ${option.n} ${option.season}`,
        "social",
      ),
      {
        ok: true,
        when: `${option.weekday} ${option.n} ${option.season}`,
      })
    : {
        ok: false,
        reason: "Pick a day of next season.",
      };
}
function weddingView(state) {
  let wedding = weddingOf(state);
  if (!wedding) {
    return null;
  }
  let partner = characterOf(state, wedding.characterId),
    clock = wedding.day !== null ? clockFromMinutes(wedding.day * WEDDING_DAY_MINUTES) : null;
  return {
    characterId: wedding.characterId,
    name: partner ? nameFor(state, partner) : "?",
    day: wedding.day,
    when: clock ? `${clock.weekday} ${clock.day} ${clock.season}` : null,
    daysLeft: clock ? wedding.day - clockFromMinutes(state.minutes).dayIndex : null,
    pickDay: wedding.day === null,
  };
}
var WEDDING_VENUES = {
  park: {
    name: "The Park",
    price: 500,
    about: "Outdoors, under the trees",
  },
  restaurant: {
    name: "The Restaurant",
    price: 1500,
    about: "Tables, candles, a kitchen",
  },
  hall: {
    name: "The Grand Hall",
    price: 4e3,
    about: "Downtown, only for events: the big one",
  },
};
var BANQUET_PER_GUEST = {
  simple: 30,
  good: 60,
  luxury: 120,
};
var WEDDING_DETAILS = {
  music: {
    name: "Music",
    price: 400,
    about: "A trio for the ceremony, a DJ after",
  },
  photos: {
    name: "Photographer",
    price: 600,
    about: "More key images of the day",
  },
  cake: {
    name: "Cake",
    price: 250,
    about: "Three tiers",
  },
  flowers: {
    name: "Flowers",
    price: 200,
    about: "For the tables and the aisle",
  },
};
var HONEYMOONS = {
  beach: {
    name: "The beach",
    price: 1500,
  },
  mountains: {
    name: "The mountains",
    price: 3e3,
  },
  city: {
    name: "The city",
    price: 5e3,
  },
};
var GUESTS_MAX = 12;
var POSTPONE_TRUST = {
  hard: -6,
  light: -1,
  "": -3,
};
var WEDDING_PREREQUISITES = ["venue", "banquet", "outfit", "bands", "invites"];
var theirShare = (state, characterId) => TRAIT_BEHAVIOURS.weddingShare(traitsOf(state, characterId));
var yourShareOf = (state, price) => Math.round(price * (1 - theirShare(state, weddingOf(state).characterId)));
function weddingPlan(state) {
  let wedding = weddingOf(state);
  return wedding ? ((wedding.guests ??= {}), (wedding.details ??= {}), (wedding.paid ??= {}), wedding) : null;
}
var banquetEaters = (plan) =>
  2 + Object.values(plan.guests).filter((guest) => guest.invited && guest.answer !== "no").length;
var banquetCost = (plan) => (plan.banquet ? BANQUET_PER_GUEST[plan.banquet] * banquetEaters(plan) : 0);
function payWeddingPart(state, key, price, label) {
  let plan = weddingPlan(state),
    share = price ? yourShareOf(state, price) : 0,
    alreadyPaid = plan.paid[key] ?? 0,
    due = share - alreadyPaid;
  if (due > 0) {
    let spent = spendMoney(state.wallet, due, `Wedding \xB7 ${label}`, state.minutes);
    if (!spent.ok) {
      return spent;
    }
  }
  if (due < 0) {
    earnMoney(state.wallet, -due, `Wedding \xB7 ${label} (back)`, state.minutes);
  }
  if (share) {
    plan.paid[key] = share;
  } else {
    delete plan.paid[key];
  }
  return {
    ok: true,
    paid: due,
  };
}
function weddingChoose(state, part, option) {
  let plan = weddingPlan(state);
  if (!plan) {
    return {
      ok: false,
      reason: "There is no wedding to plan.",
    };
  }
  if (part === "venue") {
    if (!WEDDING_VENUES[option]) {
      return {
        ok: false,
        reason: "Not a place for it.",
      };
    }
    let result = payWeddingPart(state, "venue", WEDDING_VENUES[option].price, WEDDING_VENUES[option].name);
    if (result.ok) {
      plan.venue = option;
    }
    return result;
  }
  if (part === "banquet") {
    if (!BANQUET_PER_GUEST[option]) {
      return {
        ok: false,
        reason: "Not a banquet.",
      };
    }
    let previous = plan.banquet;
    plan.banquet = option;
    let result = payWeddingPart(state, "banquet", banquetCost(plan), "banquet");
    if (!result.ok) {
      plan.banquet = previous;
    }
    return result;
  }
  if (part === "detail") {
    if (!WEDDING_DETAILS[option]) {
      return {
        ok: false,
        reason: "Not a detail.",
      };
    }
    let adding = !plan.details[option],
      result = payWeddingPart(
        state,
        `detail:${option}`,
        adding ? WEDDING_DETAILS[option].price : 0,
        WEDDING_DETAILS[option].name,
      );
    if (result.ok) {
      if (adding) {
        plan.details[option] = true;
      } else {
        delete plan.details[option];
      }
    }
    return result;
  }
  if (part === "honeymoon") {
    if (option && !HONEYMOONS[option]) {
      return {
        ok: false,
        reason: "Not a trip.",
      };
    }
    let clearing = !option || plan.honeymoon === option,
      result = payWeddingPart(state, "honeymoon", clearing ? 0 : HONEYMOONS[option].price, "honeymoon");
    if (result.ok) {
      plan.honeymoon = clearing ? null : option;
    }
    return result;
  }
  return {
    ok: false,
    reason: "Not part of the plan.",
  };
}
function guestRisk(state, characterId) {
  let wedding = weddingOf(state),
    bond = bondOf(state, characterId);
  if (!bond || !wedding) {
    return null;
  }
  if (bond.status === "ex") {
    return "YOUR EX";
  }
  if (MILESTONE_COUPLE_STATUSES.includes(bond.status)) {
    return "YOUR PARTNER";
  }
  if (bondTier(bond, "romance") >= 1 && bond.romanceable !== false) {
    return (bond.flirted ?? 0) > 0 || bond.romance >= 20 ? "YOU FLIRTED" : "FEELINGS FOR YOU";
  }
  let pair = npcPairBetween(state, characterId, wedding.characterId);
  return pair && (pair.kind === "rivals" || pair.kind === "ex")
    ? `${pair.kind === "ex" ? "EX" : "RIVAL"} OF ${nameFor(state, characterOf(state, wedding.characterId)).toUpperCase()}`
    : null;
}
function guestAnswer(state, characterId) {
  let wedding = weddingOf(state),
    bond = bondOf(state, characterId),
    pair = npcPairBetween(state, characterId, wedding.characterId);
  if (pair?.kind === "rivals") {
    return {
      answer: "no",
      why: `Not with ${nameFor(state, characterOf(state, wedding.characterId))} there`,
    };
  }
  if (guestRisk(state, characterId)) {
    return {
      answer: "going",
      why: "They'll come",
    };
  }
  let friendshipTier = bondTier(bond, "friendship");
  return friendshipTier >= 2 || ["family", "close", "friends"].includes(pair?.kind)
    ? {
        answer: "going",
        why: "Wouldn't miss it",
      }
    : friendshipTier >= 1
      ? {
          answer: "maybe",
          why: "They might come",
        }
      : {
          answer: "no",
          why: "You barely know each other",
        };
}
function weddingInvite(state, characterId, invite = true) {
  let plan = weddingPlan(state);
  if (!plan) {
    return {
      ok: false,
      reason: "There is no wedding to plan.",
    };
  }
  if (characterId === plan.characterId || !hasMet2(state, characterId) || !characterOf(state, characterId)) {
    return {
      ok: false,
      reason: "Not someone you can invite.",
    };
  }
  let invitedCount = Object.values(plan.guests).filter((guest) => guest.invited).length;
  if (invite && !plan.guests[characterId]?.invited && invitedCount >= GUESTS_MAX) {
    return {
      ok: false,
      reason: `${GUESTS_MAX} guests at most.`,
    };
  }
  let previous = plan.guests[characterId];
  plan.guests[characterId] = invite
    ? {
        invited: true,
        ...(plan.invitesSent ? guestAnswer(state, characterId) : {}),
      }
    : {
        invited: false,
      };
  let payment = plan.banquet
    ? payWeddingPart(state, "banquet", banquetCost(plan), "banquet")
    : {
        ok: true,
      };
  return payment.ok
    ? {
        ok: true,
      }
    : ((plan.guests[characterId] = previous), payment);
}
function weddingSend(state) {
  let plan = weddingPlan(state);
  if (!plan) {
    return {
      ok: false,
      reason: "There is no wedding to plan.",
    };
  }
  if (!Object.values(plan.guests).some((guest) => guest.invited)) {
    return {
      ok: false,
      reason: "Invite someone first.",
    };
  }
  plan.invitesSent = true;
  for (let [characterId, guest] of Object.entries(plan.guests)) {
    if (guest.invited) {
      Object.assign(guest, guestAnswer(state, characterId));
    }
  }
  let payment = plan.banquet
    ? payWeddingPart(state, "banquet", banquetCost(plan), "banquet")
    : {
        ok: true,
      };
  logNote(state, "The wedding invitations went out", "social");
  return payment.ok
    ? {
        ok: true,
      }
    : payment;
}
function weddingReady(state) {
  let plan = weddingPlan(state);
  if (!plan) {
    return {
      ready: false,
      missing: [],
    };
  }
  let hasOutfit = (state.things?.closet ?? []).some((itemId) => ITEM_CATALOG[itemId]?.style === "wedding"),
    hasBands = [...(state.things?.bag ?? []), ...(state.things?.shelf ?? [])].some(
      (entry) => entry.item === "wedding-bands",
    ),
    has = {
      venue: !!plan.venue,
      banquet: !!plan.banquet,
      outfit: hasOutfit,
      bands: hasBands,
      invites: !!plan.invitesSent,
    },
    missing = WEDDING_PREREQUISITES.filter((key) => !has[key]);
  return {
    ready: !missing.length,
    missing: missing,
    has: has,
  };
}
var MISSING_WORDS = {
  venue: "the place",
  banquet: "the banquet",
  outfit: "your outfit",
  bands: "the wedding bands",
  invites: "the invitations",
  day: "the day itself",
};
function staleWedding(state) {
  let wedding = state.wedding;
  if (!wedding || state.outing?.kind === "wedding" || bondOf(state, wedding.characterId)?.status === "engaged") {
    return [];
  }
  state.wedding = null;
  let name = nameFor(
    state,
    characterOf(state, wedding.characterId) ?? {
      id: wedding.characterId,
      name: "them",
    },
  );
  logNote(state, `The wedding with ${name} is off`, "social");
  return [
    {
      id: "wedding-off",
      characterId: wedding.characterId,
      text: `The wedding with ${name} is off.`,
    },
  ];
}
var venueShut = (state, plan) =>
  !!plan?.venue && !!firstModuleHook(state, "shutTo", VENUE_PLACE[plan.venue] ?? plan.venue);
function moveForShutVenue(state, plan, events) {
  let venue = plan.venue;
  plan.venue = null;
  plan.due = false;
  plan.day += 30;
  let clock = clockFromMinutes(plan.day * WEDDING_DAY_MINUTES);
  events.push({
    id: "wedding-postponed",
    characterId: plan.characterId,
    text: `You can't go into ${townPlace(state.town, VENUE_PLACE[venue] ?? venue)?.name ?? "the place"} any more: the wedding moved to ${clock.weekday} ${clock.day} ${clock.season}. Pick another place in WEDDING.`,
  });
  logNote(state, "The wedding was moved: its place is shut to you", "social");
}
function weddingDayTick(state, events) {
  let stale = staleWedding(state);
  if (stale.length) {
    events.push(...stale);
    return;
  }
  let wedding = weddingOf(state);
  if (!wedding || wedding.day === null) {
    return;
  }
  let dayIndex = clockFromMinutes(state.minutes).dayIndex;
  if (dayIndex < wedding.day || wedding.startedDay === wedding.day) {
    return;
  }
  if (dayIndex === wedding.day && venueShut(state, wedding)) {
    moveForShutVenue(state, wedding, events);
    return;
  }
  let readiness = weddingReady(state);
  if (dayIndex === wedding.day && readiness.ready) {
    wedding.due = true;
    return;
  }
  if (dayIndex > wedding.day) {
    wedding.due = false;
    readiness.missing = readiness.missing.length ? readiness.missing : ["day"];
  }
  let bond = bondOf(state, wedding.characterId),
    trustDelta = POSTPONE_TRUST[TRAIT_BEHAVIOURS.hurtByNo(traitsOf(state, wedding.characterId))];
  if (bond) {
    adjustBondAxis(bond, "trust", trustDelta, {
      at: state.minutes,
    });
  }
  wedding.day += 30;
  wedding.postponed = (wedding.postponed ?? 0) + 1;
  let clock = clockFromMinutes(wedding.day * WEDDING_DAY_MINUTES);
  events.push({
    id: "wedding-postponed",
    characterId: wedding.characterId,
    text: `The wedding moved to ${clock.weekday} ${clock.day} ${clock.season}: still missing ${readiness.missing.map((key) => MISSING_WORDS[key]).join(", ")}.`,
  });
  logNote(state, `The wedding was postponed to ${clock.weekday} ${clock.day} ${clock.season}`, "social");
}
function weddingPlanView(state) {
  let plan = weddingPlan(state);
  if (!plan) {
    return null;
  }
  let partner = characterOf(state, plan.characterId),
    view = weddingView(state),
    readiness = weddingReady(state),
    share = theirShare(state, plan.characterId),
    guests = castInTown(state)
      .filter((character) => character.id !== plan.characterId && hasMet2(state, character.id))
      .map((character) => {
        let guest = plan.guests[character.id] ?? {},
          likely = plan.invitesSent && guest.invited ? null : guestAnswer(state, character.id);
        return {
          id: character.id,
          name: nameFor(state, character),
          ...characterPortrait(character, state),
          invited: !!guest.invited,
          answer: guest.answer ?? null,
          why: guest.why ?? likely?.why ?? "",
          likely: likely?.answer ?? null,
          risk: guestRisk(state, character.id),
        };
      });
  return {
    ...view,
    cash: state.wallet.cash,
    share: Math.round(share * 100),
    spent: Object.values(plan.paid).reduce((sum, amount) => sum + amount, 0),
    venue: plan.venue ?? null,
    banquet: plan.banquet ?? null,
    details: {
      ...plan.details,
    },
    honeymoon: plan.honeymoon ?? null,
    eaters: banquetEaters(plan),
    banquetCost: banquetCost(plan),
    venues: Object.entries(WEDDING_VENUES).map(([id, venue]) => ({
      id: id,
      ...venue,
      yours: yourShareOf(state, venue.price),
    })),
    banquets: Object.entries(BANQUET_PER_GUEST).map(([id, price]) => ({
      id: id,
      price: price,
    })),
    detailList: Object.entries(WEDDING_DETAILS).map(([id, detail]) => {
      let tastes = visibleGiftTastes(partner, bondOf(state, plan.characterId), state.rules?.showArchetypes ?? "found"),
        taste = DETAIL_TASTE[id],
        verdict = tastes.loves.includes(taste)
          ? "loved"
          : tastes.likes.includes(taste)
            ? "liked"
            : tastes.dislikes.includes(taste)
              ? "disliked"
              : null;
      return {
        id: id,
        ...detail,
        yours: yourShareOf(state, detail.price),
        taste: verdict,
      };
    }),
    honeymoons: Object.entries(HONEYMOONS).map(([id, trip]) => ({
      id: id,
      ...trip,
      yours: yourShareOf(state, trip.price),
    })),
    ready: readiness.ready,
    missing: readiness.missing.map((key) => MISSING_WORDS[key]),
    has: readiness.has,
    invitesSent: !!plan.invitesSent,
    guests: guests,
    guestsMax: GUESTS_MAX,
    postponed: plan.postponed ?? 0,
    likes: partner?.tastes?.loves ?? [],
  };
}
var VENUE_PLACE = {
  park: "park",
  restaurant: "restaurant",
  hall: "hall",
};
var WEDDING_MINUTES = 300;
var WEDDING_NIGHT_START = 50;
var VENUE_MOOD = {
  park: 0,
  restaurant: 4,
  hall: 8,
};
var BANQUET_MOOD = {
  simple: 0,
  good: 3,
  luxury: 6,
};
var DETAIL_MOOD = 3;
var DETAIL_TASTE = {
  music: "music",
  photos: "art",
  cake: "sweets",
  flowers: "flowers",
};
var DETAIL_MOOD_BY = {
  loved: 6,
  liked: 4,
  fine: DETAIL_MOOD,
  disliked: 0,
};
var detailTasteOf = (state, plan, detail) =>
  giftTasteVerdict(characterOf(state, plan.characterId)?.tastes, [DETAIL_TASTE[detail]]);
var detailMood = (state, plan, detail) => DETAIL_MOOD_BY[detailTasteOf(state, plan, detail)] ?? DETAIL_MOOD;
var GUESTS_MOOD_MAX = 4;
var WEDDING_REQUIRED = ["morning", "vows", "toast", "dance"];
var INCIDENT_CHOICES = ["walk", "tell", "stay"];
var INCIDENT_COST = {
  walk: {
    guest: -2,
    night: -5,
  },
  tell: {
    trust: 2,
    night: -10,
  },
  stay: {
    notices: 0.55,
    trust: -8,
    night: -15,
  },
};
var MARRIED_GAINS = {
  romance: 8,
  trust: 6,
};
var WEDDING_GUEST_GAIN = {
  good: 2,
  else: 1,
};
function weddingNightStart(state) {
  let plan = weddingPlan(state);
  if (!plan) {
    return WEDDING_NIGHT_START;
  }
  let goingCount = Object.values(plan.guests).filter((guest) => guest.invited && guest.answer === "going").length;
  return (
    WEDDING_NIGHT_START +
    (VENUE_MOOD[plan.venue] ?? 0) +
    (BANQUET_MOOD[plan.banquet] ?? 0) +
    Object.keys(plan.details).reduce((sum, detail) => sum + detailMood(state, plan, detail), 0) +
    Math.min(GUESTS_MOOD_MAX, goingCount)
  );
}
function weddingGoers(state) {
  let plan = weddingPlan(state);
  for (let characterId of Object.keys(plan.guests)) {
    if (characterOf(state, characterId)?.away) {
      delete plan.guests[characterId];
    }
  }
  return Object.entries(plan.guests)
    .filter(
      ([characterId, guest]) =>
        guest.invited &&
        characterOf(state, characterId) &&
        !characterOf(state, characterId).away &&
        (guest.answer === "going" ||
          (guest.answer === "maybe" && seededRandom(state.seed, characterId, String(plan.day), "wedding-maybe") < 0.5)),
    )
    .map(([characterId]) => characterId);
}
function bestFriendOf(state, ids) {
  return (
    [...ids].sort(
      (first, second) => (bondOf(state, second)?.friendship ?? 0) - (bondOf(state, first)?.friendship ?? 0),
    )[0] ?? null
  );
}
function weddingStartsNow(state, events = []) {
  let wedding = weddingOf(state);
  if (!wedding?.due || state.outing || (state.scene && !state.scene.done) || clockFromMinutes(state.minutes).hour < 8) {
    return false;
  }
  let dayIndex = clockFromMinutes(state.minutes).dayIndex;
  if (dayIndex !== wedding.day) {
    return false;
  }
  if (venueShut(state, wedding)) {
    moveForShutVenue(state, wedding, events);
    return false;
  }
  wedding.due = false;
  wedding.startedDay = wedding.day;
  if (state.job?.employed && !state.job.daysOff?.includes(dayIndex)) {
    (state.job.daysOff ??= []).push(dayIndex);
  }
  let goers = weddingGoers(state),
    best = bestFriendOf(state, goers),
    left = leaveTheirPartyIfAny(state);
  if (left) {
    events.push(left);
  }
  if (state.residence && !state.lodging) {
    state.at = "home";
  }
  state.visit = null;
  state.shiftNow = null;
  state.moment = null;
  state.outing = {
    planId: null,
    characterId: wedding.characterId,
    kind: "wedding",
    place: VENUE_PLACE[wedding.venue] ?? "restaurant",
    by: "you",
    startedAt: state.minutes,
    late: 0,
    used: 0,
    mood: clampOutingMood(weddingNightStart(state)),
    phase: "talk",
    arrive: {
      words: [],
    },
    done: [],
    moment: null,
    result: null,
    reads: [],
    log: [],
    batch: [],
    found: [],
    paid: true,
    spent: 0,
    covered: 0,
    interrupt: null,
    interrupted: false,
    leaving: false,
    dream: false,
    bye: null,
    summary: null,
    cast: [wedding.characterId, ...goers],
    guests: goers,
    best: best,
  };
  openOuting(state);
  events.push({
    id: "wedding-day",
    characterId: wedding.characterId,
    text: "Today is your wedding.",
  });
  logNote(state, `The wedding day with ${nameFor(state, characterOf(state, wedding.characterId))}`, "social");
  return true;
}
function incidentGuest(game, outing) {
  return (
    (outing.guests ?? []).find((guestId) => {
      let risk = guestRisk(game, guestId);
      return risk ? risk !== "YOUR PARTNER" || (knobsOf(bondOf(game, guestId)).jealousy ?? 1) >= 2 : false;
    }) ?? null
  );
}
function incidentWords(game, outing, guestId) {
  let guest = characterOf(game, guestId),
    spouse = characterOf(game, outing.characterId),
    risk = guestRisk(game, guestId) ?? "",
    reason =
      risk === "YOUR PARTNER"
        ? `${guest.name} is also the player's partner (they agreed to it), and watching the player marry someone else, the jealousy comes out`
        : risk === "YOUR EX"
          ? `${guest.name} is the player's ex`
          : risk.startsWith("RIVAL") || risk.startsWith("EX OF")
            ? `${guest.name} and ${spouse.name} do not get along`
            : `${guest.name} has had feelings for the player \u2014 they flirted`;
  return [
    `At the wedding of the player and ${spouse.name}, away from the music: ${reason}. A little too much to drink; they corner the player and it comes out, true to who they are.`,
    `${spouse.name} is across the room, for now.`,
  ];
}
function weddingIncident(game, choice) {
  let outing = game.outing,
    interrupt = outing?.interrupt;
  if (!interrupt || interrupt.kind !== "guest" || interrupt.phase !== "call" || !INCIDENT_CHOICES.includes(choice)) {
    return {
      ok: false,
      reason: "There is no call to make.",
    };
  }
  let spouseBond = bondOf(game, outing.characterId),
    guestBond = bondOf(game, interrupt.id),
    cost = INCIDENT_COST[choice],
    chips = [],
    upperName = (charId) => nameFor(game, characterOf(game, charId)).toUpperCase(),
    guestName = characterOf(game, interrupt.id)?.name ?? "the guest",
    spouseName = characterOf(game, outing.characterId)?.name ?? "their spouse",
    lines = [
      choice === "walk"
        ? `The player keeps it short with ${guestName} and walks away, back to the party.`
        : choice === "tell"
          ? `The player goes to ${spouseName} and tells them what just happened with ${guestName}.`
          : `The player lets ${guestName} talk.`,
    ];
  if (cost.guest && guestBond) {
    adjustBondAxis(guestBond, "friendship", cost.guest, {
      at: game.minutes,
    });
    chips.push({
      text: `${upperName(interrupt.id)} ${cost.guest} FRIENDSHIP`,
      bad: true,
    });
  }
  let nightCost = cost.night;
  if (
    (choice === "tell" &&
      (adjustBondAxis(spouseBond, "trust", cost.trust, {
        at: game.minutes,
      }),
      chips.push({
        text: `${upperName(outing.characterId)} +${cost.trust} TRUST`,
      })),
    choice === "stay")
  ) {
    let noticed = seededRandom(game.seed, outing.characterId, String(game.minutes), "incident") < cost.notices;
    if (noticed) {
      adjustBondAxis(spouseBond, "trust", cost.trust, {
        at: game.minutes,
      });
      chips.push({
        text: `${upperName(outing.characterId)} SAW IT \xB7 ${cost.trust} TRUST`,
        bad: true,
      });
    } else {
      nightCost = 0;
      chips.push({
        text: `${upperName(outing.characterId)} DIDN'T SEE IT`,
      });
    }
    lines.push(noticed ? `${spouseName} saw it.` : `${spouseName} did not see it.`);
  }
  outing.mood = clampOutingMood(outing.mood + nightCost);
  if (nightCost) {
    chips.push({
      text: `THE NIGHT ${nightCost}`,
      bad: true,
      mood: true,
    });
  }
  interrupt.phase = "done";
  interrupt.choice = choice;
  outing.result = {
    chips: chips,
    moment: "Something happens",
  };
  outing.phase = "talk";
  settleOuting(game);
  return {
    ok: true,
    chips: chips,
    words: lines,
  };
}
var leftEarly = (outing, guestId) => outing?.interrupt?.id === guestId && outing.interrupt.choice === "walk";
function settleWedding(game) {
  let outing = game.outing,
    wedding = weddingOf(game),
    bond = bondOf(game, outing.characterId);
  setRelationshipStatus(bond, "married", {
    at: game.minutes,
  });
  recordTownFact(game, "married", {
    with: outing.characterId,
    place: game.at,
  });
  adjustBondAxis(bond, "romance", MARRIED_GAINS.romance, {
    at: game.minutes,
  });
  adjustBondAxis(bond, "trust", MARRIED_GAINS.trust, {
    at: game.minutes,
  });
  let goodNight = outing.mood >= 62,
    guestGains = (outing.guests ?? []).map((guestId) => {
      let walked = leftEarly(outing, guestId),
        gain = walked ? 0 : goodNight ? WEDDING_GUEST_GAIN.good : WEDDING_GUEST_GAIN.else;
      if (gain) {
        adjustBondAxis(bondOf(game, guestId), "friendship", gain, {
          at: game.minutes,
        });
      }
      return {
        id: guestId,
        name: nameFor(game, characterOf(game, guestId)),
        tag: walked ? "LEFT EARLY" : goodNight ? `LOVED IT \xB7 +${gain} FRIENDSHIP` : `+${gain} FRIENDSHIP`,
      };
    });
  (game.weddings ??= []).push({
    characterId: outing.characterId,
    day: clockFromMinutes(game.minutes).dayIndex,
    venue: wedding?.venue ?? null,
    night: outing.mood,
    honeymoon: wedding?.honeymoon ?? null,
  });
  game.wedding = null;
  game.afterWedding = {
    characterId: outing.characterId,
    honeymoon: wedding?.honeymoon ?? null,
  };
  return {
    married: true,
    guests: guestGains,
    night: outing.mood,
  };
}

export {
  BANQUET_MOOD,
  BANQUET_PER_GUEST,
  DETAIL_MOOD,
  DETAIL_MOOD_BY,
  DETAIL_TASTE,
  GUESTS_MAX,
  HONEYMOONS,
  INCIDENT_CHOICES,
  INCIDENT_COST,
  MARRIED_GAINS,
  POSTPONE_TRUST,
  VENUE_MOOD,
  VENUE_PLACE,
  WEDDING_DETAILS,
  WEDDING_GUEST_GAIN,
  WEDDING_MINUTES,
  WEDDING_NIGHT_START,
  WEDDING_PREREQUISITES,
  WEDDING_REQUIRED,
  WEDDING_VENUES,
  detailMood,
  guestAnswer,
  guestRisk,
  incidentGuest,
  incidentWords,
  leftEarly,
  setWeddingDay,
  settleWedding,
  staleWedding,
  theirShare,
  weddingChoose,
  weddingDayTick,
  weddingDays,
  weddingIncident,
  weddingInvite,
  weddingNightStart,
  weddingPlanView,
  weddingReady,
  weddingSend,
  weddingStartsNow,
  weddingView,
};
