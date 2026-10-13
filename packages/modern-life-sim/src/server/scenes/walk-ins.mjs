// Walk-ins during talks (partner, jealous, fight, quieter place) and favour trips
import { clockFromMinutes } from "../time/clock.mjs";
import { charactersAtPlace, seededRandom } from "../schedule/whereabouts.mjs";
import { addToEventCast, eventCast } from "../events/event-cast.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import { adjustBondAxis, bondTier, hasMet, markTraitsSeen } from "../relationships/bonds.mjs";
import { maxFavourMinutes } from "../relationships/favours.mjs";
import { isLastSceneExchange } from "./scene-engine.mjs";
import { npcPairBetween } from "../network/npc-pairs.mjs";
import { personKnowsFact, recordTownFact } from "../network/town-facts.mjs";
import { isStreetPlace } from "../town/places.mjs";
import { isPlaceOpen, minutesUntilPlaceCloses, routeBetweenPlaces, townPlace } from "../town/town-layout.mjs";
import { firstModuleHook } from "../modules/module-registry.mjs";
import { HANG_WEIGHT } from "../outings/outing.mjs";
import { isAtActiveParty, partyGuestsAround } from "../parties/party.mjs";
import { introducablePeopleOf } from "../relationships/friend-perks.mjs";
import { PLACE_SIZE, SEEN_CHANCE, witnesses } from "../social/witnesses.mjs";
import { approachDue } from "../romance/romantic-acts.mjs";
import { hurtBond, isPartner, learnedFact } from "../romance/jealousy.mjs";
import { partnerMoodOf } from "../romance/multiple-partners.mjs";
import { workingHome, workingNow } from "../cast/working-now.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import { RIDE_STAYS, goingBy, travelFor } from "../travel/vehicles-rides.mjs";
import {
  advanceTime,
  bondOf,
  castInTown,
  characterOf,
  hasMet2,
  isNoFlirtBond,
  leavingAt,
  logNote,
  nameFor,
  toPlayerWords,
  traitsOf,
  whereOpts,
} from "../game.mjs";

var WALK_IN_CHANCE = 0.25;
var WALK_IN_TURNS = [2, 3, 4];
var WALK_IN_FRIEND = 2;
var WALK_IN_FEELS = 2;
var WALK_IN_EFFECTS = {
  known: {
    join: {
      friendship: 1,
    },
    bye: {},
  },
  partner: {
    join: {
      romance: 1,
    },
    bye: {},
    byeCost: {
      romance: -1,
    },
  },
  feels: {
    join: {
      romance: 1,
    },
    bye: {
      romance: -1,
    },
  },
  theirs: {
    join: {
      friendship: 1,
    },
    bye: {},
  },
  jealous: {
    go: {
      romance: -6,
      trust: -12,
      knew: -4,
    },
    stay: {
      trust: -8,
    },
    lie: {
      trust: -5,
    },
    worse: 3,
  },
};
var FIGHT_TEMPER = 8;
var FIGHT_PAIRS = {
  rivals: "they can't stand each other",
  ex: "they used to be together, and it ended badly",
};
var FIGHT_MOODS = {
  rivals: "they can't stand each other",
  tense: "things are tense between them",
};
var FIGHT_EFFECTS = {
  hers: {
    them: {
      friendship: 2,
    },
    other: {
      friendship: -2,
    },
  },
  other: {
    them: {
      friendship: -3,
      trust: -2,
    },
    other: {
      friendship: 2,
    },
  },
  calm: {
    them: {
      trust: 1,
    },
    other: {},
  },
};
var QUIETER_GAIN = {
  go: 2,
  stay: 0.5,
};
var QUIETER_PLACES = ["cafe", "restaurant", "bar", "library"];
var QUIETER_OPEN_MINUTES = 30;
var walkInByeEffects = (game, walkIn) =>
  walkIn.kind === "partner" && TRAIT_BEHAVIOURS.takesItHard(traitsOf(game, walkIn.id))
    ? WALK_IN_EFFECTS.partner.byeCost
    : WALK_IN_EFFECTS[walkIn.kind].bye;
var WALK_IN_KINDS = ["jealous", "fight", "partner", "feels", "known", "theirs"];
var atPartyHere = (game) => !!game.party && isAtActiveParty(game);
var walkInPossible = (game) => (atPartyHere(game) || (!game.visit && game.at !== "home")) && witnesses(game).length > 0;
function flirtedHere(game, scene) {
  return (scene.reads ?? []).includes("flirty")
    ? true
    : (game.facts ?? []).some(
        (fact) =>
          fact.with === scene.characterId &&
          fact.at >= scene.startedAt &&
          ["flirt", "kiss", "confess"].includes(fact.act),
      );
}
var knewOfPartner = (game, charId, otherId) =>
  (game.facts ?? []).some(
    (fact) =>
      ["dating", "partners", "living", "engaged", "married"].includes(fact.act) &&
      fact.with === otherId &&
      personKnowsFact(game, charId, fact.id),
  );
var partnerOpenTo = (game, charId, otherId) => {
  let openYou = bondOf(game, charId)?.open?.you;
  return !!openYou && (otherId in openYou || "*" in openYou);
};
function walkInWho(game, scene) {
  let charId = scene.characterId,
    around = (
      atPartyHere(game)
        ? partyGuestsAround(game, scene).map((id) => ({
            id: id,
          }))
        : charactersAtPlace(
            castInTown(game).filter((character) => !eventCast(scene).includes(character.id)),
            game.at,
            game.minutes,
            whereOpts(game),
          )
    ).filter((person) => !isAsleep(game, person.id) && !characterOf(game, person.id)?.away),
    known = around.filter((person) => hasMet2(game, person.id) && hasMet(bondOf(game, person.id))),
    partners = isPartner(game, charId) ? [] : known.filter((person) => isPartner(game, person.id)),
    jealousPartner = partners.find((person) => !partnerOpenTo(game, person.id, charId)),
    seen =
      !atPartyHere(game) ||
      seededRandom(game.seed, "walk-in", String(scene.startedAt), jealousPartner?.id ?? "", "party") <
        SEEN_CHANCE.party;
  if (
    jealousPartner &&
    seen &&
    flirtedHere(game, scene) &&
    bondOf(game, charId)?.romanceable !== false &&
    !isNoFlirtBond(bondOf(game, charId))
  ) {
    return {
      id: jealousPartner.id,
      kind: "jealous",
    };
  }
  let fight = fightWalkIn(game, charId, around);
  return (
    fight ||
    friendlyWalkIn(
      game,
      scene,
      known.filter((person) => !isPartner(game, person.id)),
      partners,
      around,
    )
  );
}
function fightWalkIn(game, charId, around) {
  if ((traitsOf(game, charId)?.dials?.temper ?? 0) < FIGHT_TEMPER) {
    return null;
  }
  for (let person of around) {
    let fight =
      FIGHT_PAIRS[npcPairBetween(game, charId, person.id)?.kind] ?? FIGHT_MOODS[partnerMoodOf(game, charId, person.id)];
    if (fight) {
      return {
        id: person.id,
        kind: "fight",
        why: fight,
      };
    }
  }
  return null;
}
function quieterFor(game, scene) {
  let charId = scene.characterId;
  if (
    atPartyHere(game) ||
    sceneCannotMove(game, scene) ||
    PLACE_SIZE[game.at] !== "big" ||
    !traitsOf(game, charId)?.flags?.includes("shy") ||
    bondOf(game, charId)?.quieterOn === clockFromMinutes(game.minutes).dayIndex
  ) {
    return null;
  }
  let quieter = QUIETER_PLACES.map((place) => ({
    id: place,
    place: townPlace(game.town, place),
    minutes: travelFor(game, game.at, place),
  }))
    .filter(
      (place) =>
        place.place &&
        place.minutes !== null &&
        isPlaceOpen(place.place, game.minutes + place.minutes + QUIETER_OPEN_MINUTES) &&
        !firstModuleHook(game, "shutTo", place.id),
    )
    .sort((a, b) => a.minutes - b.minutes)[0];
  return quieter
    ? {
        id: charId,
        kind: "quieter",
        place: quieter.id,
        minutes: quieter.minutes,
      }
    : null;
}
function friendlyWalkIn(game, scene, friends, partnerList, around) {
  let charId = scene.characterId,
    first = partnerList[0];
  if (first) {
    return {
      id: first.id,
      kind: "partner",
    };
  }
  let known = friends.find((person) => {
    let bond = bondOf(game, person.id);
    return bond.romanceable !== false && !bond.justFriends && bondTier(bond, "romance") >= WALK_IN_FEELS;
  });
  if (known) {
    return {
      id: known.id,
      kind: "feels",
    };
  }
  let friend = friends.find((person) => bondTier(bondOf(game, person.id), "friendship") >= WALK_IN_FRIEND);
  if (friend) {
    return {
      id: friend.id,
      kind: "known",
    };
  }
  let intro = introducablePeopleOf(game, charId).find((person) => around.some((other) => other.id === person.id));
  return intro
    ? {
        id: intro.id,
        kind: "theirs",
        rel: intro.rel,
      }
    : null;
}
function walkInNow(game, scene = game.scene) {
  if (
    !scene ||
    scene.kind !== "talk" ||
    scene.done ||
    scene.after ||
    scene.walkIn ||
    scene.approached === "door" ||
    game.plea ||
    game.ride ||
    eventCast(scene).length > 1 ||
    !walkInPossible(game)
  ) {
    return null;
  }
  let exchange = scene.exchange + 1;
  if (isLastSceneExchange(scene, game.minutes)) {
    return null;
  }
  let who = walkInWho(game, scene),
    turn =
      WALK_IN_TURNS[
        Math.floor(seededRandom(game.seed, "walk-in", String(scene.startedAt), "turn") * WALK_IN_TURNS.length)
      ],
    quieter = who?.kind !== "jealous" && exchange === turn ? quieterFor(game, scene) : null;
  return quieter
    ? ((bondOf(game, quieter.id).quieterOn = clockFromMinutes(game.minutes).dayIndex),
      (scene.walkIn = {
        ...quieter,
        phase: "lines",
        at: game.minutes,
      }),
      scene.walkIn)
    : !who ||
        (who.kind !== "jealous" &&
          (exchange !== turn || seededRandom(game.seed, "walk-in", String(scene.startedAt)) >= WALK_IN_CHANCE))
      ? null
      : ((scene.walkIn = {
          ...who,
          phase: "lines",
          at: game.minutes,
        }),
        scene.walkIn);
}
function walkInWords(game, scene = game.scene) {
  let walkIn = scene?.walkIn;
  if (!walkIn || walkIn.phase !== "lines") {
    return null;
  }
  let character = characterOf(game, walkIn.id),
    charName = nameFor(game, characterOf(game, scene.characterId)),
    otherName = character?.name ?? "someone",
    placeName = walkIn.place ? (townPlace(game.town, walkIn.place)?.name ?? "somewhere quieter") : "",
    words = {
      fight: `${otherName}${hasMet2(game, walkIn.id) ? "" : " (the player has never met them)"} is here too and comes over to ${charName}: ${walkIn.why}. ${charName} has a short temper, and they get into an argument right there, in front of the player, true to who they are.`,
      quieter: `${charName} is shy, and this place is big and full of people: ${charName} feels everyone can hear and asks the player to go somewhere quieter: ${placeWithArticle(game, walkIn.place)}.`,
      known: `${otherName} (${toPlayerWords(game, walkIn.id)}) is here too, recognises the player and walks over to say hello.`,
      partner: `${otherName}, the player's partner, is here too, sees the player and walks over, glad to find them.`,
      jealous: `${otherName}, the player's partner, is here too and has just seen the player flirting with ${charName}. ${otherName} walks over, hurt and jealous, true to who they are.`,
      feels: `${otherName}, ${feelingsRole(game, walkIn.id)}, is here too, sees the player close to ${charName} and walks over; it is awkward or tense for them, true to who they are.`,
      theirs: `${otherName}${walkIn.rel ? ` (${charName}'s ${walkIn.rel})` : ` (someone of ${charName}'s)`} is here too and comes over to ${charName}. The player has never met ${otherName}.`,
    }[walkIn.kind];
  return {
    id: walkIn.id,
    name: otherName,
    kind: walkIn.kind,
    description: character?.description ?? "",
    why: words,
    place: placeName,
  };
}
function walkInArrived(game, scene = game.scene) {
  let walkIn = scene?.walkIn;
  if (!walkIn || walkIn.phase !== "lines") {
    return false;
  }
  if (scene.done || scene.kind !== "talk" || game.plea || game.ride || scene.together) {
    scene.walkIn = null;
    return false;
  }
  if (((walkIn.phase = "call"), walkIn.kind === "quieter")) {
    markTraitsSeen(bondOf(game, walkIn.id), "shy");
    return true;
  }
  if (
    (addToEventCast(scene, walkIn.id, {
      at: game.minutes,
      why: "walked-over",
    }),
    walkIn.kind === "fight")
  ) {
    markTraitsSeen(bondOf(game, scene.characterId), "temper");
    let bond = bondOf(game, walkIn.id);
    if (bond && !hasMet2(game, walkIn.id)) {
      bond.met = true;
      bond.metAt = game.minutes;
      logNote(
        game,
        `You met ${characterOf(game, walkIn.id)?.name ?? "someone"}: they and ${characterOf(game, scene.characterId)?.name ?? "someone"} had words in front of you`,
        "social",
      );
    }
  }
  if (
    walkIn.kind === "jealous" &&
    !(game.facts ?? []).some(
      (line) =>
        line.with === scene.characterId &&
        line.at >= scene.startedAt &&
        personKnowsFact(game, walkIn.id, line.id) &&
        ["flirt", "kiss", "confess"].includes(line.act),
    )
  ) {
    recordTownFact(game, "flirt", {
      with: scene.characterId,
      place: game.at,
      witnesses: [walkIn.id],
    });
    learnedFact(game, [walkIn.id], game.facts.at(-1).id, "seen");
  }
  return true;
}
var signedDelta = (value) => `${value > 0 ? "+" : "\u2212"}${Math.abs(Math.round(value * 10) / 10)}`;
var statChips = (deltas, scale, bad = false) =>
  Object.entries(scale)
    .filter(([, value]) => typeof value == "number" && value)
    .map(([axis, value]) => ({
      text: `${deltas.toUpperCase()} ${signedDelta(value)} ${axis.toUpperCase()}`,
      ...(value < 0 || bad
        ? {
            bad: true,
          }
        : {}),
    }));
function walkInView(game, scene = game.scene) {
  let walkIn = scene?.walkIn;
  if (!walkIn || walkIn.phase !== "call") {
    return null;
  }
  let character = characterOf(game, walkIn.id),
    charName =
      walkIn.kind === "theirs" || walkIn.kind === "fight"
        ? (character?.name ?? "Someone")
        : nameFor(
            game,
            character ?? {
              id: walkIn.id,
              name: "Someone",
            },
          ),
    youName = nameFor(game, characterOf(game, scene.characterId));
  if (walkIn.kind === "jealous") {
    let knew = knewOfPartner(game, scene.characterId, walkIn.id),
      effects2 = WALK_IN_EFFECTS.jealous,
      weighted = (value) => value * HANG_WEIGHT;
    return {
      id: walkIn.id,
      name: charName,
      kind: walkIn.kind,
      label: `${charName.toUpperCase()} SAW YOU FLIRTING`,
      options: [
        {
          id: "go",
          label: `Go after ${charName}`,
          note: "The talk ends here \xB7 they have it out with you now",
          chips: [
            ...statChips(youName, {
              romance: weighted(effects2.go.romance),
              trust: weighted(knew ? effects2.go.knew : effects2.go.trust),
            }),
            {
              text: "THEIR JEALOUSY \xB7 NOW",
            },
          ],
        },
        {
          id: "stay",
          label: `Stay with ${youName}`,
          note: `${charName} leaves`,
          chips: [
            {
              text: "THEIR JEALOUSY COMES LATER \xB7 WORSE",
              bad: true,
            },
            ...(knew
              ? []
              : statChips(youName, {
                  trust: weighted(effects2.stay.trust),
                })),
          ],
        },
        {
          id: "lie",
          label: "\xABIt's not what it looks like\xBB",
          note: "A lie, to both of them",
          chips: [
            {
              text: "A LIE \xB7 TO BOTH",
              bad: true,
            },
            ...(knew
              ? []
              : statChips(youName, {
                  trust: weighted(effects2.lie.trust),
                })),
          ],
        },
      ],
    };
  }
  if (walkIn.kind === "fight") {
    let effects2 = FIGHT_EFFECTS;
    return {
      id: walkIn.id,
      name: charName,
      kind: walkIn.kind,
      label: `${charName.toUpperCase()} SHOWED UP \xB7 THEY'RE AT IT`,
      options: [
        {
          id: "hers",
          label: `Take ${youName}'s side`,
          note: `${charName} leaves \xB7 the talk goes on`,
          chips: [...statChips(youName, effects2.hers.them), ...statChips(charName, effects2.hers.other)],
        },
        {
          id: "other",
          label: `Take ${charName}'s side`,
          note: `${youName} storms off \xB7 the talk ends here`,
          chips: [...statChips(youName, effects2.other.them), ...statChips(charName, effects2.other.other)],
        },
        {
          id: "calm",
          label: "Calm them down",
          note: `${charName} goes \xB7 ${youName} cools off`,
          chips: statChips(youName, effects2.calm.them),
        },
      ],
    };
  }
  if (walkIn.kind === "quieter") {
    let placeName = placeWithArticle(game, walkIn.place),
      place = townPlace(game.town, walkIn.place),
      canGo =
        !!place &&
        isPlaceOpen(place, game.minutes + walkIn.minutes + QUIETER_OPEN_MINUTES) &&
        !firstModuleHook(game, "shutTo", walkIn.place);
    return {
      id: walkIn.id,
      name: youName,
      kind: walkIn.kind,
      label: `${youName.toUpperCase()} WOULD RATHER GO SOMEWHERE QUIETER`,
      options: [
        ...(canGo
          ? [
              {
                id: "go",
                label: `Go to ${placeName}`,
                note: `You both head there \xB7 ${walkIn.minutes} min \xB7 the talk goes on there`,
                chips: [
                  {
                    text: `${youName.toUpperCase()} OPENS UP MORE`,
                  },
                ],
              },
            ]
          : []),
        {
          id: "stay",
          label: "Stay here",
          note: canGo ? "The talk goes on here" : `You can't go to ${placeName} now \xB7 the talk goes on here`,
          chips: [
            {
              text: `${youName.toUpperCase()} STAYS ON EDGE`,
              bad: true,
            },
          ],
        },
      ],
    };
  }
  let effects = WALK_IN_EFFECTS[walkIn.kind],
    byeEffects = walkInByeEffects(game, walkIn),
    labels = {
      known: [
        ["Pull up a chair", "The talk goes on with the three of you"],
        ["Catch you later", `${charName} heads off \xB7 no hard feelings`],
      ],
      partner: [
        ["Join us", "The talk goes on with the three of you"],
        ["We're almost done", `${charName} will see you later`],
      ],
      feels: [
        ["Pull up a chair", `It may be awkward: ${charName} likes you`],
        ["Catch you later", `${charName} takes it a little to heart`],
      ],
      theirs: [
        ["Nice to meet you", "You meet them \xB7 the talk goes on with them"],
        ["We were just finishing", `${youName} goes with them \xB7 the talk ends here`],
      ],
    }[walkIn.kind],
    options = [
      ...(walkIn.kind === "theirs"
        ? [
            {
              text: `YOU MEET ${charName.toUpperCase()}`,
            },
          ]
        : []),
      ...statChips(charName, effects.join),
      ...(walkIn.kind === "feels"
        ? [
            {
              text: "TENSE",
              bad: true,
            },
          ]
        : []),
    ];
  return {
    id: walkIn.id,
    name: charName,
    kind: walkIn.kind,
    label: `${walkIn.kind === "theirs" ? `${charName.toUpperCase()} \xB7 YOU HAVEN'T MET` : `${charName.toUpperCase()} WALKS OVER`}`,
    options: [
      {
        id: "join",
        label: labels[0][0],
        note: labels[0][1],
        chips: options,
      },
      {
        id: "bye",
        label: labels[1][0],
        note: labels[1][1],
        chips: statChips(charName, byeEffects),
      },
    ],
  };
}
var dropFromCast = (scene, charId) => {
  scene.cast = eventCast(scene).filter((id) => id !== charId);
};
var applyBondDelta = (game, charId, deltas) => {
  let bond = bondOf(game, charId);
  for (let [axis, delta] of Object.entries(deltas)) {
    if (typeof delta == "number" && delta) {
      if (delta > 0) {
        adjustBondAxis(bond, axis, delta, {
          at: game.minutes,
        });
      } else {
        hurtBond(bond, {
          [axis]: delta,
        });
      }
    }
  }
};
function walkInChoice(game, choice) {
  let scene = game.scene,
    walkIn = scene?.walkIn,
    view = walkInView(game, scene);
  if (!walkIn || !view || !view.options.some((option) => option.id === choice)) {
    return {
      ok: false,
      reason: "There is no call to make.",
    };
  }
  let otherName = view.name,
    youName = nameFor(game, characterOf(game, scene.characterId)),
    tags = [],
    say,
    what,
    ends = false,
    events = [];
  if (walkIn.kind === "jealous") {
    let bond = bondOf(game, scene.characterId),
      otherBond = bondOf(game, walkIn.id),
      knew = knewOfPartner(game, scene.characterId, walkIn.id),
      effects = WALK_IN_EFFECTS.jealous;
    if ((dropFromCast(scene, walkIn.id), choice === "go")) {
      hurtBond(bond, {
        romance: effects.go.romance * HANG_WEIGHT,
        trust: (knew ? effects.go.knew : effects.go.trust) * HANG_WEIGHT,
      });
      if (otherBond?.asks) {
        otherBond.asks.due = game.minutes;
      }
      ends = true;
      say = `(Goes after ${otherName}.)`;
      what = `${otherName}, the player's partner, saw the player flirting with ${youName} and walked off; the player leaves ${youName} there to go after ${otherName}. ${youName} ${knew ? "knew the player had a partner" : "just found out the player has a partner"}.`;
      tags.push(
        {
          text: `YOU WENT AFTER ${otherName.toUpperCase()}`,
          step: true,
        },
        {
          text: "THEIR JEALOUSY \xB7 NOW",
          bad: true,
        },
      );
    } else if (choice === "stay") {
      if (!knew) {
        hurtBond(bond, {
          trust: effects.stay.trust * HANG_WEIGHT,
        });
      }
      if (otherBond?.jealous) {
        otherBond.jealous.weight += effects.worse;
      }
      if (otherBond?.asks) {
        otherBond.asks.due = approachDue(otherBond, game.minutes);
      }
      hurtBond(otherBond, {
        trust: -effects.worse,
      });
      say = `(Lets ${otherName} go, and stays.)`;
      what = `${otherName}, the player's partner, saw the player flirting with ${youName} and walked off; the player stays with ${youName}. ${knew ? `${youName} knew the player had a partner: it hangs over them.` : `${youName} just found out the player has a partner: it is a shock.`}${!knew && TRAIT_BEHAVIOURS.takesItBadly(traitsOf(game, scene.characterId)) ? ` ${youName} is taking it badly.` : ""}`;
      tags.push(
        {
          text: "YOU STAYED",
          step: true,
        },
        {
          text: `${otherName.toUpperCase()} LEFT \xB7 THEIR JEALOUSY COMES LATER`,
          bad: true,
        },
      );
    } else {
      if (!knew) {
        hurtBond(bond, {
          trust: effects.lie.trust * HANG_WEIGHT,
        });
      }
      let lastFact = (game.facts ?? [])
        .filter((fact) => fact.with === scene.characterId && fact.at >= scene.startedAt)
        .at(-1);
      if (otherBond) {
        otherBond.lies = [
          ...(otherBond.lies ?? []),
          {
            fact: lastFact?.id ?? null,
            at: game.minutes,
          },
        ].slice(-20);
      }
      let partnerFact = (game.facts ?? [])
        .filter(
          (fact) =>
            ["dating", "partners", "living", "engaged", "married"].includes(fact.act) && fact.with === walkIn.id,
        )
        .at(-1);
      if (partnerFact && !knew) {
        bond.lies = [
          ...(bond.lies ?? []),
          {
            fact: partnerFact.id,
            at: game.minutes,
          },
        ].slice(-20);
      }
      say = "(\xABIt's not what it looks like.\xBB)";
      what = `${otherName}, the player's partner, saw the player flirting with ${youName}; the player says it is not what it looks like, a lie to both of them. ${otherName} leaves, not believing it. ${youName} does not really believe it either.`;
      tags.push({
        text: "A LIE \xB7 TO BOTH",
        bad: true,
      });
    }
  } else if (walkIn.kind === "fight") {
    let effects = FIGHT_EFFECTS[choice];
    applyBondDelta(game, scene.characterId, effects.them);
    applyBondDelta(game, walkIn.id, effects.other);
    dropFromCast(scene, walkIn.id);
    if (choice === "hers") {
      say = `(Takes ${youName}'s side.)`;
      what = `The player took ${youName}'s side against ${otherName}; ${otherName} leaves. The talk goes on between the two of them.`;
      tags.push({
        text: `YOU TOOK ${youName.toUpperCase()}'S SIDE`,
        step: true,
      });
    } else if (choice === "other") {
      ends = true;
      say = `(Takes ${otherName}'s side.)`;
      what = `The player took ${otherName}'s side; ${youName}, with that temper, storms off: the talk ends here, in ${youName}'s own words.`;
      tags.push({
        text: `YOU TOOK ${otherName.toUpperCase()}'S SIDE`,
        step: true,
      });
    } else {
      say = "(Steps in between them and calms things down.)";
      what = `The player stepped in and calmed them down; ${otherName} leaves, and ${youName} cools off. The talk goes on between the two of them.`;
      tags.push({
        text: "YOU CALMED THEM DOWN",
        step: true,
      });
    }
    tags.push(...statChips(youName, effects.them), ...statChips(otherName, effects.other));
  } else if (walkIn.kind === "quieter") {
    let placeName = placeWithArticle(game, walkIn.place);
    if (((scene.gainScale = QUIETER_GAIN[choice]), choice === "go")) {
      if (((events = goSomewhereTogether(game, scene, walkIn.place, walkIn.minutes)), scene.done)) {
        scene.walkIn = null;
        return {
          ok: true,
          say: "",
          ends: true,
          tags: [],
          events: events,
        };
      }
      say = `(\xABSure. Let's go to ${placeName}.\xBB)`;
      what = `The player said yes: they both went to ${placeName}, quieter, and sat down there. ${youName} is at ease now, and the talk goes on there.`;
      tags.push(
        {
          text: `YOU WENT TO ${placeName.toUpperCase()}`,
          step: true,
        },
        {
          text: `${youName.toUpperCase()} OPENS UP MORE`,
        },
      );
    } else {
      say = "(\xABLet's stay here.\xBB)";
      what = `The player would rather stay: ${youName} goes along with it, but stays on edge with so many people around.`;
      tags.push(
        {
          text: "YOU STAYED",
          step: true,
        },
        {
          text: `${youName.toUpperCase()} STAYS ON EDGE`,
          bad: true,
        },
      );
    }
  } else {
    let effects = WALK_IN_EFFECTS[walkIn.kind];
    if (choice === "join") {
      if (walkIn.kind === "theirs") {
        introducedBy(game, walkIn.id, scene.characterId);
      }
      applyBondDelta(game, walkIn.id, effects.join);
      say =
        walkIn.kind === "theirs"
          ? `(\xABNice to meet you, ${otherName}.\xBB)`
          : walkIn.kind === "partner"
            ? `(\xABJoin us, ${otherName}.\xBB)`
            : `(Pulls up a chair for ${otherName}.)`;
      what =
        walkIn.kind === "feels"
          ? `The player asked ${otherName} to join: ${otherName} stays, with feelings for the player and ${youName} right there; it is a little tense.`
          : `The player asked ${otherName} to join: ${otherName} stays, and the talk goes on with everyone here.`;
      tags.push(
        {
          text: `${otherName.toUpperCase()} JOINED`,
          step: true,
        },
        ...(walkIn.kind === "theirs"
          ? [
              {
                text: `YOU MET ${otherName.toUpperCase()}`,
                step: true,
              },
            ]
          : []),
        ...statChips(otherName, effects.join),
      );
    } else {
      dropFromCast(scene, walkIn.id);
      let byeEffects = walkInByeEffects(game, walkIn);
      applyBondDelta(game, walkIn.id, byeEffects);
      if (walkIn.kind === "theirs") {
        ends = true;
        say = "(\xABWe were just finishing.\xBB)";
        what = `${otherName}${walkIn.rel ? `, ${youName}'s ${walkIn.rel},` : ""} came for ${youName}; the player says they were just finishing, and ${youName} goes with ${otherName}.`;
      } else {
        say =
          walkIn.kind === "partner"
            ? `(\xABWe're almost done, ${otherName}.\xBB)`
            : `(\xABCatch you later, ${otherName}.\xBB)`;
        what = `The player saw ${otherName} off kindly: ${otherName} went on with their day${walkIn.kind === "feels" ? ", a little hurt" : ""}. The talk goes on between the two of them.`;
      }
      tags.push(
        {
          text: `${otherName.toUpperCase()} WENT ON`,
          step: true,
        },
        ...statChips(otherName, byeEffects),
      );
    }
  }
  walkIn.phase = "done";
  walkIn.choice = choice;
  walkIn.what = what;
  walkIn.ends = ends;
  walkIn.tags = tags;
  return {
    ok: true,
    say: say,
    ends: ends,
    tags: tags,
    events: events,
  };
}
function goSomewhereTogether(game, scene, placeId, minutes, { stays = RIDE_STAYS, why = ", somewhere quieter" } = {}) {
  let leavesAt = scene.leavesAt,
    { events: events } = advanceTime(game, minutes, {
      walking: true,
    });
  if (scene.done) {
    return events;
  }
  game.at = placeId;
  scene.place = placeId;
  let closesAt = game.minutes + minutesUntilPlaceCloses(townPlace(game.town, placeId), game.minutes);
  game.rides = [
    ...(game.rides ?? []).filter((ride) => ride.to > game.minutes && ride.characterId !== scene.characterId),
    {
      characterId: scene.characterId,
      place: placeId,
      from: game.minutes,
      to: Math.min(Math.max(leavesAt ?? 0, game.minutes + stays), closesAt),
    },
  ];
  let leaving = leavingAt(game, scene.characterId);
  scene.leavesAt = leaving.at;
  scene.leaveReason = leaving.reason;
  logNote(
    game,
    `Went with ${characterOf(game, scene.characterId)?.name ?? "someone"} to ${townPlace(game.town, placeId)?.name ?? "somewhere quieter"}${why} (${minutes} min)`,
    "move",
  );
  return events;
}
var sceneCannotMove = (game, scene) =>
  game.at === "office" ||
  game.at === "hospital" ||
  !!game.visit ||
  !!game.guest ||
  !!game.outing ||
  !!game.shiftNow ||
  (!!game.party && isAtActiveParty(game)) ||
  !!game.fitting ||
  !!game.suits ||
  !!game.ride ||
  !!game.rideDue ||
  workingNow(game, characterOf(game, scene.characterId)) ||
  workingHome(game, scene.characterId);
function favourPlaces(game, scene = game.scene, { after = 0, takes = null } = {}) {
  if (!scene || scene.done || scene.kind !== "tier" || !scene.favour || sceneCannotMove(game, scene)) {
    return [];
  }
  let takes2 = takes ?? maxFavourMinutes(scene.favour.size);
  return (game.town.places ?? [])
    .filter(
      (place) =>
        place.id !== game.at &&
        place.id !== "home" &&
        place.id !== "office" &&
        !place.residence &&
        !place.hall &&
        !place.locked &&
        !place.events &&
        !place.module &&
        !isStreetPlace(place.id),
    )
    .filter((place) => !firstModuleHook(game, "shutTo", place.id))
    .map((place) => ({
      place: place,
      minutes: travelFor(game, game.at, place.id),
    }))
    .filter(
      (place) =>
        place.minutes !== null &&
        minutesUntilPlaceCloses(place.place, game.minutes + after + place.minutes) >= Math.max(1, takes2),
    )
    .map((place) => ({
      id: place.place.id,
      name: place.place.name,
      minutes: place.minutes,
    }));
}
function favourWay(game, scene = game.scene) {
  let placeId = scene?.favour?.place;
  return !placeId || !scene.favour.cost?.minutes
    ? null
    : (favourPlaces(game, scene, {
        takes: scene.favour.cost.minutes,
      }).find((way) => way.id === placeId) ?? null);
}
function favourGo(game) {
  let scene = game.scene,
    way = favourWay(game, scene);
  if (!way) {
    return {
      moved: null,
      events: [],
    };
  }
  let from = game.at,
    route = routeBetweenPlaces(game.town, from, way.id),
    character = characterOf(game, scene.characterId),
    events = goSomewhereTogether(game, scene, way.id, way.minutes, {
      stays: scene.favour.cost.minutes + RIDE_STAYS,
      why: ", for a favour",
    });
  return scene.done
    ? (game.faintMemo?.kind === "scene" &&
        (game.faintMemo.doing = `on the way to ${way.name}, for the favour they had asked the player for: ${scene.favour.what}`),
      {
        moved: null,
        events: events,
        fainted: true,
      })
    : ((scene.favourWent = {
        name: way.name,
        minutes: way.minutes,
      }),
      {
        moved: {
          place: way.id,
          name: way.name,
          minutes: way.minutes,
          from: from,
          path: route,
          by: goingBy(game),
          with: {
            id: scene.characterId,
            name: nameFor(game, character),
          },
        },
        events: events,
      });
}
function introducedBy(game, charId, otherId) {
  let bond = bondOf(game, charId);
  if (!(!bond || hasMet2(game, charId))) {
    bond.met = true;
    bond.metAt = game.minutes;
    logNote(
      game,
      `${nameFor(game, characterOf(game, otherId))} introduced you to ${characterOf(game, charId)?.name ?? "someone"}`,
      "social",
    );
  }
}
function walkInRole(game, scene, role) {
  let walkIn = scene?.walkIn;
  if (!walkIn || walkIn.id !== role || walkIn.choice !== "join") {
    return "";
  }
  let charName = nameFor(game, characterOf(game, scene.characterId));
  return (
    {
      known: toPlayerWords(game, role),
      partner: "the player's partner",
      feels: feelingsRole(game, role),
      theirs: walkIn.rel ? `${charName}'s ${walkIn.rel}` : `someone of ${charName}'s`,
    }[walkIn.kind] ?? ""
  );
}
var placeWithArticle = (game, placeId) => {
  let placeName = townPlace(game.town, placeId)?.name;
  return placeName ? (/^the\s|'s\b/i.test(placeName) ? placeName : `the ${placeName}`) : "somewhere quieter";
};
var feelingsRole = (game, charId) =>
  bondOf(game, charId)?.status === "ex"
    ? "the player's ex, who still has feelings for the player"
    : "who has feelings for the player (without being together)";
function walkInAfter(scene) {
  let walkIn = scene?.walkIn;
  return !walkIn || walkIn.phase !== "done" || walkIn.told
    ? null
    : ((walkIn.told = true),
      {
        what: walkIn.what,
        ends: !!walkIn.ends,
      });
}
function walkInTags(game, scene = game.scene) {
  let walkIn = scene?.walkIn;
  if (!walkIn?.tags) {
    return;
  }
  let tags = scene.did?.exchange === scene.exchange && scene.did.logAt === scene.log.length ? scene.did.tags : [];
  scene.did = {
    exchange: scene.exchange,
    logAt: scene.log.length,
    tags: [...walkIn.tags, ...tags],
  };
  if (scene.done && walkIn.choice === "go") {
    scene.endedBy = "went-after";
  } else if (scene.done && walkIn.ends) {
    scene.endedBy = walkIn.kind === "fight" ? "stormed-off" : walkIn.kind === "theirs" ? "went-with" : scene.endedBy;
  }
}
var WALK_IN_ACTS = ["walk-in"];

export {
  FIGHT_EFFECTS,
  FIGHT_MOODS,
  FIGHT_PAIRS,
  FIGHT_TEMPER,
  QUIETER_GAIN,
  QUIETER_PLACES,
  WALK_IN_ACTS,
  WALK_IN_CHANCE,
  WALK_IN_EFFECTS,
  WALK_IN_FEELS,
  WALK_IN_FRIEND,
  WALK_IN_KINDS,
  WALK_IN_TURNS,
  favourGo,
  favourPlaces,
  favourWay,
  flirtedHere,
  quieterFor,
  walkInAfter,
  walkInArrived,
  walkInChoice,
  walkInNow,
  walkInRole,
  walkInTags,
  walkInView,
  walkInWho,
  walkInWords,
};
