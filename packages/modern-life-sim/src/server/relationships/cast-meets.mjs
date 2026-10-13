// Daily cast meetups: partners straying, cast couples, hit-ons, being seen or told
import { seededRandom, whereaboutsOf } from "../schedule/whereabouts.mjs";
import { JOB_AWAY_PLACE } from "../jobs/job-catalog.mjs";
import { isJobSpan } from "../jobs/job-week.mjs";
import { isAttractedToGender, normalizeGender } from "../orientation/orientation.mjs";
import { adjustBondAxis, bondTier, hasMet, markTraitsSeen } from "./bonds.mjs";
import { DREAM_DATE_PLACES } from "./special-event-catalog.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { npcPairsOf } from "../network/town-facts.mjs";
import { isPlaceOpen, isResidencePlace, townPlace } from "../town/town-layout.mjs";
import { runModuleHook } from "../modules/module-registry.mjs";
import { rememberPair } from "./pair-memories.mjs";
import { approachDue } from "../romance/romantic-acts.mjs";
import { genderOf, likeEachOther } from "../romance/romanceability.mjs";
import { agreedFor, coupleOf, isPartner, learnYou, settledPair } from "../romance/jealousy.mjs";
import { workingHome } from "../cast/working-now.mjs";
import { bondOf, castInTown, characterOf, nameFor, traitsOf, whereOpts } from "../game.mjs";

var STRAY_WEEKLY = [3, 2, 1, 0.5];
var FAITHFUL_LOW = 3;
var FAITHFUL_HIGH = 9;
var CAST_WEEKLY = {
  couple: 2,
  romance: 1,
};
var CRUSH_AT = 40;
var MEET_HOURS = 2;
var MEET_EARLIEST_HOUR = 10;
var MEET_LATEST_HOUR = 21;
var HIT_CHANCE = (level) => 0.02 + 0.004 * level;
var TOLD_TRUST = 2;
var STAY_AWAY_DAYS = 21;
var LIE_FOUND = -6;
var MEETS_DAY_MINUTES = 1440;
var faithfulDial = (game, charId) => traitsOf(game, charId).dials.faithful;
var isUnattached = (game, charId) => !coupleOf(game, charId) && !isPartner(game, charId);
function loverOf(game, charId, day) {
  let lovers = npcPairsOf(game, charId)
    .filter(
      (pair) =>
        (pair.romance ?? 0) > 0 &&
        pair.kind !== "family" &&
        !agreedFor(game, charId, pair.other) &&
        characterOf(game, pair.other) &&
        !characterOf(game, pair.other).away &&
        likeEachOther(game, charId, pair.other) &&
        !isKeptAway(game, charId, pair.other),
    )
    .sort((a, b) => (b.romance ?? 0) - (a.romance ?? 0));
  if (lovers.length) {
    return lovers[0].other;
  }
  let crushes = npcPairsOf(game, charId).filter(
    (pair) =>
      pair.kind !== "family" &&
      pair.close > 0 &&
      characterOf(game, pair.other) &&
      !characterOf(game, pair.other).away &&
      isUnattached(game, pair.other) &&
      likeEachOther(game, charId, pair.other) &&
      !isKeptAway(game, charId, pair.other) &&
      !agreedFor(game, charId, pair.other),
  );
  return crushes.length
    ? crushes[Math.floor(seededRandom(game.seed, charId, String(day), "lover") * crushes.length)].other
    : null;
}
var isKeptAway = (game, a, b) => (npcPairBetween(game, a, b)?.keepAway ?? 0) > game.minutes;
var isMeetOn = (game, meet) =>
  !meet.off &&
  (meet.to <= game.minutes ||
    (!isKeptAway(game, meet.a, meet.b) &&
      (meet.kind === "stray" ? !!game.rules?.partnersStray : meet.kind === "cast" ? !!game.rules?.castCouples : true)));
var activeMeets = (game) => (game.meets ?? []).filter((meet) => isMeetOn(game, meet));
function isFreeToMeet(game, character, from, to, opts) {
  for (let minute = from; minute < to; minute += 60) {
    let where = whereaboutsOf(character, minute, opts);
    if (
      !where.place ||
      where.sleep ||
      where.place === JOB_AWAY_PLACE ||
      isJobSpan(character, where) ||
      workingHome(game, character, minute, opts) ||
      where.doing === "meeting someone"
    ) {
      return false;
    }
  }
  return true;
}
function findMeetSlot(game, day, aId, bId) {
  let opts = whereOpts(game),
    first = characterOf(game, aId),
    second = characterOf(game, bId),
    places = DREAM_DATE_PLACES.map((place) => townPlace(game.town, place)).filter(
      (place) => place && !(game.town.off ?? []).includes(place.id),
    ),
    offset = Math.floor(
      seededRandom(game.seed, aId, bId, String(day), "hour") * (MEET_LATEST_HOUR - MEET_EARLIEST_HOUR),
    );
  for (let i = 0; i <= MEET_LATEST_HOUR - MEET_EARLIEST_HOUR; i++) {
    let hour = MEET_EARLIEST_HOUR + ((offset + i) % (MEET_LATEST_HOUR - MEET_EARLIEST_HOUR + 1)),
      from = day * MEETS_DAY_MINUTES + hour * 60,
      to = from + MEET_HOURS * 60;
    if (!isFreeToMeet(game, first, from, to, opts) || !isFreeToMeet(game, second, from, to, opts)) {
      continue;
    }
    let open = places.filter((place) => isPlaceOpen(place, from) && isPlaceOpen(place, to - 1));
    if (open.length) {
      return {
        from: from,
        to: to,
        place: open[Math.floor(seededRandom(game.seed, aId, bId, String(day), "place") * open.length)].id,
      };
    }
  }
  return null;
}
function planMeets(game, day) {
  if (game.meetsDay === day) {
    return;
  }
  game.meetsDay = day;
  game.meets = (game.meets ?? []).filter((meet) => meet.day >= day - 1);
  game.hits = (game.hits ?? []).filter((hit) => !hit.done && hit.at >= game.minutes - MEETS_DAY_MINUTES);
  let booked = new Set(),
    book = (aId, bId, kind) => {
      if (booked.has(aId) || booked.has(bId)) {
        return;
      }
      let slot = findMeetSlot(game, day, aId, bId);
      if (!slot) {
        return;
      }
      let meet = {
        id: `m${day}-${aId}-${bId}`,
        day: day,
        a: aId,
        b: bId,
        kind: kind,
        ...slot,
      };
      game.meets.push(meet);
      booked.add(aId);
      booked.add(bId);
      runModuleHook(game, "castMeet", meet);
    };
  if (game.rules?.partnersStray) {
    for (let bond of Object.values(game.bonds ?? {})) {
      let charId = bond.characterId;
      if (!isPartner(game, charId) || characterOf(game, charId)?.away) {
        continue;
      }
      let faithful = faithfulDial(game, charId);
      if (
        faithful > FAITHFUL_LOW ||
        seededRandom(game.seed, charId, String(day), "stray") >= STRAY_WEEKLY[faithful] / 7
      ) {
        continue;
      }
      let lover = loverOf(game, charId, day);
      if (lover) {
        book(charId, lover, "stray");
      }
    }
  }
  if (game.rules?.castCouples) {
    for (let pair of Object.values(game.pairs ?? {})) {
      if (
        isPartner(game, pair.a) ||
        isPartner(game, pair.b) ||
        characterOf(game, pair.a)?.away ||
        characterOf(game, pair.b)?.away
      ) {
        continue;
      }
      let chance =
        pair.kind === "couple"
          ? CAST_WEEKLY.couple
          : (pair.romance ?? 0) >= CRUSH_AT && isUnattached(game, pair.a) && isUnattached(game, pair.b)
            ? CAST_WEEKLY.romance
            : 0;
      if (!(
        !chance ||
        isKeptAway(game, pair.a, pair.b) ||
        seededRandom(game.seed, pair.a, pair.b, String(day), "meet") >= chance / 7
      )) {
        book(pair.a, pair.b, "cast");
      }
    }
  }
  for (let bond of Object.values(game.bonds ?? {})) {
    let charId = bond.characterId;
    if (!(!isPartner(game, charId) || characterOf(game, charId)?.away || faithfulDial(game, charId) < FAITHFUL_HIGH)) {
      for (let pair of npcPairsOf(game, charId)) {
        let otherId = pair.other,
          other = characterOf(game, otherId);
        if (
          !other ||
          other.away ||
          pair.kind === "family" ||
          pair.close <= 0 ||
          !(isUnattached(game, otherId) || faithfulDial(game, otherId) <= FAITHFUL_LOW) ||
          !isAttractedToGender(other.into, genderOf(game, charId)) ||
          seededRandom(game.seed, otherId, charId, String(day), "hit") >=
            HIT_CHANCE(traitsOf(game, otherId).dials.initiative)
        ) {
          continue;
        }
        let opts = whereOpts(game);
        for (let hour = MEET_EARLIEST_HOUR; hour <= MEET_LATEST_HOUR; hour++) {
          let minute = day * MEETS_DAY_MINUTES + hour * 60 + 20,
            otherWhere = whereaboutsOf(other, minute, opts),
            partnerWhere = whereaboutsOf(characterOf(game, charId), minute, opts);
          if (
            otherWhere.place &&
            otherWhere.place === partnerWhere.place &&
            !otherWhere.sleep &&
            otherWhere.place !== "home" &&
            !isResidencePlace(otherWhere.place)
          ) {
            game.hits.push({
              x: otherId,
              p: charId,
              at: minute,
              place: otherWhere.place,
              done: false,
            });
            break;
          }
        }
        break;
      }
    }
  }
}
function meetSpans(game) {
  let spans = {};
  for (let meet of activeMeets(game)) {
    for (let [who, withId] of [
      [meet.a, meet.b],
      [meet.b, meet.a],
    ]) {
      let withName = nameFor(
        game,
        characterOf(game, withId) ?? {
          id: withId,
          name: "someone",
        },
      );
      (spans[who] ??= []).push({
        from: meet.from,
        to: meet.to,
        place: meet.place,
        doing: meet.kind === "stray" ? `flirting with ${withName}` : `with ${withName}`,
        meet: meet.id,
      });
    }
  }
  return spans;
}
var meetNow = (game, charId) =>
  activeMeets(game).find(
    (meet) => (meet.a === charId || meet.b === charId) && meet.from <= game.minutes && game.minutes < meet.to,
  ) ?? null;
function seenWith(game, charId) {
  let meet = meetNow(game, charId);
  if (!meet || meet.kind !== "stray" || meet.place !== game.at || game.visit) {
    return null;
  }
  let otherId = meet.a === charId ? meet.b : meet.a;
  return isPartner(game, charId)
    ? {
        id: otherId,
        name: nameFor(
          game,
          characterOf(game, otherId) ?? {
            id: otherId,
            name: "someone",
          },
        ),
      }
    : null;
}
function meetsTick(game) {
  let now = game.minutes,
    sceneCharId = game.scene && !game.scene.done ? game.scene.characterId : null,
    unsettled = (pair) => {
      let partnerId = isPartner(game, pair?.a) ? pair.a : isPartner(game, pair?.b) ? pair.b : null;
      return !partnerId || settledPair(game, partnerId, partnerId === pair.a ? pair.b : pair.a);
    };
  for (let bond of Object.values(game.bonds ?? {})) {
    if (!(bond.asks?.id !== "tells-you" || bond.characterId === sceneCharId || !unsettled(bond.asks.about))) {
      bond.asks = null;
      if (game.approach?.characterId === bond.characterId && game.approach.milestone === "tells-you") {
        game.approach = null;
      }
    }
  }
  for (let meet of game.meets ?? []) {
    if (now < meet.to && !isMeetOn(game, meet)) {
      meet.off = true;
    }
  }
  for (let meet of activeMeets(game)) {
    if (now >= meet.to && !meet.kept) {
      meet.kept = true;
      let placeName = townPlace(game.town, meet.place)?.name ?? "town";
      rememberPair(game, meet.a, meet.b, {
        text:
          meet.kind === "stray" && !unsettled(meet)
            ? `Met up at the ${placeName}, the two of them, and kept it quiet.`
            : `Spent a couple of hours together at the ${placeName}.`,
        from: "met",
        at: meet.to,
      });
    }
    if (
      !(meet.kind !== "stray" || unsettled(meet)) &&
      (!meet.seen &&
        meet.from <= now &&
        now < meet.to &&
        meet.place === game.at &&
        !game.visit &&
        ((meet.seen = true),
        seenOrTold(game, meet.a, meet.b, {
          how: "seen",
          place: meet.place,
          at: now,
        })),
      now >= meet.to && !meet.seen && !meet.told)
    ) {
      meet.told = true;
      let midpoint = meet.from + (meet.to - meet.from) / 2,
        opts = whereOpts(game),
        tellers = castInTown(game).filter(
          (teller) =>
            teller.id !== meet.a &&
            teller.id !== meet.b &&
            !teller.away &&
            bondOf(game, teller.id) &&
            hasMet(bondOf(game, teller.id)) &&
            bondTier(bondOf(game, teller.id), "friendship") >= 2 &&
            !bondOf(game, teller.id).asks &&
            whereaboutsOf(teller, midpoint, opts).place === meet.place,
        );
      if (tellers.length) {
        let teller = tellers[Math.floor(seededRandom(game.seed, meet.id, "teller") * tellers.length)],
          tellerBond = bondOf(game, teller.id);
        tellerBond.asks = {
          id: "tells-you",
          at: now,
          due: approachDue(tellerBond, now),
          about: {
            a: meet.a,
            b: meet.b,
            place: meet.place,
            at: meet.from,
          },
        };
      }
    }
  }
  for (let hit of game.hits ?? []) {
    if (hit.done || now < hit.at) {
      continue;
    }
    hit.done = true;
    let bond = bondOf(game, hit.p);
    if (!bond || !isPartner(game, hit.p)) {
      continue;
    }
    markTraitsSeen(bond, "faithful");
    let scene = game.scene;
    if (scene && !scene.done && scene.characterId === hit.p && game.at === hit.place) {
      adjustBondAxis(bond, "trust", TOLD_TRUST, {
        at: now,
      });
      let upperName = (charId) =>
          nameFor(
            game,
            characterOf(game, charId) ?? {
              id: charId,
              name: "someone",
            },
          ).toUpperCase(),
        chip = {
          text: `${upperName(hit.x)} FLIRTED WITH ${upperName(hit.p)} \xB7 ${normalizeGender(genderOf(game, hit.p)) === "male" ? "HE" : "SHE"} SHUT IT DOWN`,
          step: true,
        };
      scene.did =
        scene.did && !Array.isArray(scene.did) && scene.did.exchange === scene.exchange
          ? {
              ...scene.did,
              tags: [...(scene.did.tags ?? []), chip],
            }
          : {
              exchange: scene.exchange,
              logAt: scene.log?.length ?? 0,
              tags: [chip],
            };
    } else if (!bond.asks) {
      bond.asks = {
        id: "hit-on",
        at: now,
        due: approachDue(bond, now),
        about: {
          with: hit.x,
          place: hit.place,
          at: hit.at,
        },
      };
    }
  }
}
function seenOrTold(game, aId, bId, { how: how, from = null, place = null, at = game.minutes, sure = false }) {
  let partnerId = isPartner(game, aId) ? aId : bId,
    bond = bondOf(game, partnerId),
    denied = bond?.denied?.with === (partnerId === aId ? bId : aId);
  learnYou(game, aId, bId, {
    how: how,
    from: from,
    place: place,
    at: at,
    sure: sure,
  });
  if (denied) {
    adjustBondAxis(bond, "trust", LIE_FOUND, {
      at: at,
    });
    bond.denied = {
      ...bond.denied,
      found: at,
    };
  }
  return denied;
}
var deniesIt = (game, charId, how) => how !== "seen" && faithfulDial(game, charId) <= FAITHFUL_LOW;

export {
  CAST_WEEKLY,
  CRUSH_AT,
  FAITHFUL_HIGH,
  FAITHFUL_LOW,
  HIT_CHANCE,
  LIE_FOUND,
  MEET_HOURS,
  STAY_AWAY_DAYS,
  STRAY_WEEKLY,
  TOLD_TRUST,
  deniesIt,
  loverOf,
  meetNow,
  meetSpans,
  meetsTick,
  planMeets,
  seenOrTold,
  seenWith,
};
