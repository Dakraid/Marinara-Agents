// Cast dropping by your home: daily roll, guest stay, seeing them out, guest spans
import { clockFromMinutes } from "../time/clock.mjs";
import { seededRandom, whereaboutsOf } from "../schedule/whereabouts.mjs";
import { JOB_AWAY_PLACE } from "../jobs/job-catalog.mjs";
import { isJobSpan } from "../jobs/job-week.mjs";
import { bondTier, hasMet } from "../relationships/bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { knobsOf } from "../romance/romantic-acts.mjs";
import { isPartner } from "../romance/jealousy.mjs";
import { workingHome } from "../cast/working-now.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import { bondOf, characterOf, logNote, nameFor, sharesYourDoor, whereOpts } from "../game.mjs";

var DROP_DAY_MINUTES = 1440;
var DROP_CHANCE = [0.03, 0.06, 0.1, 0.15];
var DROP_AGAIN_DAYS = 4;
var DROP_HOURS = [16, 22];
var GUEST_NIGHT_FROM = 21;
var GUEST_MINUTES = 150;
var GUEST_LATEST = 1410;
var DROP_WHY = {
  chat: "They were nearby and felt like seeing the player: no reason, just to talk.",
  bored: "They were bored at home and came over to hang out.",
  news: "They have something on their mind (a small piece of news from their own life) they wanted to tell the player in person.",
};
function dropsBy(life, bond) {
  if (!bond || !hasMet(bond)) {
    return false;
  }
  let person = characterOf(life, bond.characterId);
  return !person || person.away || sharesYourDoor(life, person)
    ? false
    : MILESTONE_COUPLE_STATUSES.includes(bond.status) || bondTier(bond, "friendship") >= 3;
}
function dropByDaily(life, day) {
  for (let bond of Object.values(life.bonds ?? {})) {
    if (bond.asks?.id === "drop-by" && bond.asks.until <= life.minutes) {
      bond.asks = null;
    }
  }
  if (
    !life.residence ||
    life.lodging ||
    life.dropDay === day ||
    Object.values(life.bonds ?? {}).some((bond) => bond.asks?.id === "drop-by") ||
    life.party ||
    (life.parties ?? []).some(
      (party) =>
        (party.host === "you" || party.home) && party.status === "set" && clockFromMinutes(party.at).dayIndex === day,
    )
  ) {
    return;
  }
  let hasPlanWith = (characterId) =>
      (life.plans ?? []).some(
        (plan) =>
          ["set", "on"].includes(plan.status) &&
          clockFromMinutes(plan.at).dayIndex === day &&
          [plan.characterId, ...(plan.with ?? [])].includes(characterId),
      ),
    candidates = Object.values(life.bonds ?? {}).filter(
      (bond) =>
        !bond.asks &&
        dropsBy(life, bond) &&
        !hasPlanWith(bond.characterId) &&
        (bond.droppedAt ?? -1 / 0) <= life.minutes - DROP_AGAIN_DAYS * DROP_DAY_MINUTES,
    );
  for (let bond of candidates) {
    let characterId = bond.characterId;
    if (
      seededRandom(life.seed, characterId, String(day), "drop-by") >=
      (DROP_CHANCE[Math.round(knobsOf(bond).initiative ?? 1)] ?? 0.06)
    ) {
      continue;
    }
    let due =
        day * DROP_DAY_MINUTES +
        DROP_HOURS[0] * 60 +
        Math.floor(
          seededRandom(life.seed, characterId, String(day), "drop-when") * (DROP_HOURS[1] - DROP_HOURS[0] - 1) * 60,
        ),
      reasons = Object.keys(DROP_WHY),
      why = reasons[Math.floor(seededRandom(life.seed, characterId, String(day), "drop-why") * reasons.length)];
    bond.asks = {
      id: "drop-by",
      at: life.minutes,
      due: Math.max(due, life.minutes),
      until: day * DROP_DAY_MINUTES + DROP_HOURS[1] * 60,
      home: true,
      about: {
        dropBy: true,
        why: why,
        text: DROP_WHY[why],
      },
    };
    bond.droppedAt = life.minutes;
    life.dropDay = day;
    return;
  }
}
var ringsOnly = (life, bond) =>
  !!bond?.home &&
  (life.at !== "home" ||
    life.visit ||
    life.guest ||
    life.party ||
    life.lodging ||
    clockFromMinutes(life.minutes).hour < DROP_HOURS[0] ||
    clockFromMinutes(life.minutes).hour >= DROP_HOURS[1]);
function guestStayUntil(life, person) {
  let today = clockFromMinutes(life.minutes).dayIndex,
    until = Math.min(life.minutes + GUEST_MINUTES, today * DROP_DAY_MINUTES + GUEST_LATEST),
    opts = whereOpts(life);
  for (let at = (Math.floor(life.minutes / 60) + 1) * 60; at < until; at += 60) {
    let where = whereaboutsOf(person, at, opts);
    if (
      where.sleep ||
      isJobSpan(person, where) ||
      where.place === JOB_AWAY_PLACE ||
      workingHome(life, person, at, opts)
    ) {
      until = at;
      break;
    }
  }
  return Math.max(until, life.minutes + 30);
}
var dropUntil = (life, characterId) => {
  let person = characterOf(life, characterId);
  return person ? guestStayUntil(life, person) : life.minutes;
};
function startGuest(life, characterId, { why = "drop-by" } = {}) {
  let person = characterOf(life, characterId);
  return person
    ? ((life.guest = {
        characterId: characterId,
        since: life.minutes,
        until: guestStayUntil(life, person),
        did: [],
        why: why,
        wasTogether: isPartner(life, characterId),
      }),
      logNote(life, `${nameFor(life, person)} stays a while at your place`, "social"),
      life.guest)
    : null;
}
function guestView(life) {
  let guest = life.guest;
  if (!guest) {
    return null;
  }
  let person = characterOf(life, guest.characterId);
  return person
    ? {
        characterId: guest.characterId,
        name: nameFor(life, person),
        since: guest.since,
        until: guest.until,
      }
    : null;
}
function guestGoodbye(state, guest, why) {
  let character = characterOf(state, guest.characterId),
    endedAt = why === "you" ? state.minutes : Math.min(state.minutes, guest.until),
    showMoment = !state.moment || state.moment.at < state.minutes - 30;
  if (showMoment) {
    state.moment = {
      kind: "goodbye",
      characterId: guest.characterId,
      why: why,
      since: guest.since,
      did: guest.did ?? [],
      at: endedAt,
      yours: true,
    };
  }
  return {
    characterId: guest.characterId,
    name: character ? nameFor(state, character) : "",
    why: why,
    from: guest.since,
    minutes: endedAt - guest.since,
    did: guest.did ?? [],
    yours: true,
    line: showMoment,
  };
}
function seeGuestOut(state) {
  let guest = state.guest;
  if (!guest) {
    return {
      ok: false,
      reason: "Nobody is over.",
    };
  }
  if (state.scene && !state.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  let goodbye = guestGoodbye(state, guest, "you");
  state.guest = null;
  logNote(state, `Saw ${goodbye.name} out`, "social");
  return {
    ok: true,
    goodbye: goodbye,
  };
}
function guestOver(state, { goodbye: withGoodbye = true, left: leftHome = false } = {}) {
  let guest = state.guest;
  if (!guest || guest.staying) {
    return null;
  }
  let wentOut = leftHome || state.at !== "home" || !!state.visit;
  if (!wentOut && bondOf(state, guest.characterId)?.status === "ex" && guest.wasTogether) {
    state.guest = null;
    return {
      id: "guest-over",
      characterId: guest.characterId,
      goodbye: null,
      text: `${nameFor(state, characterOf(state, guest.characterId))} left.`,
    };
  }
  if (!wentOut && state.minutes < guest.until && !isAsleep(state, guest.characterId)) {
    return null;
  }
  let goodbye = withGoodbye && !wentOut ? guestGoodbye(state, guest, wentOut ? "you" : "out") : null;
  state.guest = null;
  let guestName = nameFor(
    state,
    characterOf(state, guest.characterId) ?? {
      id: guest.characterId,
      name: "They",
    },
  );
  return {
    id: "guest-over",
    characterId: guest.characterId,
    goodbye: goodbye,
    text: wentOut ? `${guestName} headed home when you went out.` : `${guestName} went home.`,
  };
}
var guestDid = (state, characterId, deed) => {
  if (state.guest?.characterId === characterId) {
    state.guest.did = [...(state.guest.did ?? []), deed];
  }
};
var guestWords = (state, characterId) =>
  state.guest?.characterId === characterId ? "they are over at the player's home, visiting" : "";
var guestHere = (state) => (state.guest && state.at === "home" && !state.visit ? state.guest : null);
function guestSpans(state) {
  let guest = state.guest;
  return guest
    ? {
        [guest.characterId]: [
          {
            from: guest.since,
            to: guest.staying ? guest.until + DROP_DAY_MINUTES : guest.until,
            place: "home",
            host: "you",
            doing: "at the player's place",
          },
        ],
      }
    : {};
}

export {
  DROP_AGAIN_DAYS,
  DROP_CHANCE,
  DROP_HOURS,
  DROP_WHY,
  GUEST_LATEST,
  GUEST_MINUTES,
  GUEST_NIGHT_FROM,
  dropByDaily,
  dropUntil,
  dropsBy,
  guestDid,
  guestHere,
  guestOver,
  guestSpans,
  guestView,
  guestWords,
  ringsOnly,
  seeGuestOut,
  startGuest,
};
