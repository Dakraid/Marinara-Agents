// Store clerk counter, discounts, what-suits-you, fitting room state and views
import { clockFromMinutes } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { applyBondAction, bondTier } from "../relationships/bonds.mjs";
import { MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";
import { CLOTHES_STORES, CLOTHES_STYLE_LABELS, SHOP_PLACES, isClothesStore } from "../items/catalog.mjs";
import { itemDef } from "../items/inventory.mjs";
import { giftTastesRevealed } from "../gifts/gift-tastes.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { isPlaceOpen, townPlace } from "../town/town-layout.mjs";
import { workingLook, workingNow } from "../cast/working-now.mjs";
import { isAsleep } from "../visits/staying-over.mjs";
import { COUNTER_GREETINGS } from "../llm/shop-lines.mjs";
import {
  advanceTime,
  bondOf,
  characterOf,
  closingWhy,
  hasMet2,
  logNote,
  nameFor,
  sceneBusyReason,
  skillLevelsOf,
  whoIsHere,
} from "../game.mjs";

var COUNTER_PLACES = [...SHOP_PLACES, ...Object.keys(CLOTHES_STORES)];
var CLERK_DISCOUNT = {
  friend: 10,
  partner: 20,
};
var DISCOUNT_FRIEND_TIER = 2;
var TRY_MINUTES = 10;
var SUITS_MINUTES = 5;
var STORE_ACTS = ["discount", "try-on", "pay", "suits"];
function clerkHere(game) {
  return !COUNTER_PLACES.includes(game.at) || !isPlaceOpen(townPlace(game.town, game.at), game.minutes)
    ? null
    : (game.characters.find(
        (character) => !character.away && character.job?.place === game.at && workingNow(game, character),
      ) ?? null);
}
function discountOf(game, clerk) {
  let bond = clerk ? bondOf(game, clerk.id) : null;
  return !bond || !hasMet2(game, clerk.id)
    ? {
        off: 0,
        why: "",
      }
    : MILESTONE_COUPLE_STATUSES.includes(bond.status)
      ? {
          off: CLERK_DISCOUNT.partner,
          why: "partner",
        }
      : bondTier(bond, "friendship") >= DISCOUNT_FRIEND_TIER
        ? {
            off: CLERK_DISCOUNT.friend,
            why: "friend",
          }
        : {
            off: 0,
            why: "",
          };
}
var discountHere = (game) => discountOf(game, clerkHere(game));
function counterKey(game, charId) {
  let bond = bondOf(game, charId);
  return !bond || !hasMet2(game, charId)
    ? "stranger"
    : `${bond.status}|${bondTier(bond, "friendship")}|${bondTier(bond, "romance")}`;
}
function counterDue(game) {
  let clerk = clerkHere(game);
  if (!clerk) {
    return null;
  }
  let key = counterKey(game, clerk.id),
    counter = bondOf(game, clerk.id)?.counter,
    needsSuits = !!suitsSection(game, clerk) && !(counter && "suits" in counter),
    language = game.settings?.language;
  return counter?.key === key && !needsSuits && !(language && counter.lang && counter.lang !== language)
    ? null
    : {
        characterId: clerk.id,
        key: key,
      };
}
function suitsSection(game, clerk) {
  let likes = clerk?.clothesTaste?.likes;
  return !likes || !isClothesStore(game.at) ? "" : (CLOTHES_STYLE_LABELS.find(([style]) => style === likes)?.[1] ?? "");
}
function setCounterLines(game, charId, key, { greetings = [], pay = [], suits = null } = {}) {
  let bond = bondOf(game, charId);
  return !bond || !greetings.length
    ? false
    : ((bond.counter = {
        key: key,
        ...(game.settings?.language
          ? {
              lang: game.settings.language,
            }
          : {}),
        greetings: greetings.slice(0, COUNTER_GREETINGS),
        pay: pay,
        ...(suits !== null
          ? {
              suits: suits,
            }
          : {}),
        at: game.minutes,
      }),
      true);
}
function counterGreeting(game, bond) {
  let greetings = bond?.counter?.greetings ?? [];
  return greetings.length
    ? greetings[
        Math.floor(
          seededRandom(game.seed, "greeting", bond.characterId, String(clockFromMinutes(game.minutes).dayIndex)) *
            greetings.length,
        ) % greetings.length
      ]
    : "";
}
function payLine(game) {
  let clerk = clerkHere(game),
    lines = (clerk ? bondOf(game, clerk.id) : null)?.counter?.pay ?? [];
  if (!lines.length) {
    return null;
  }
  let line =
    lines[Math.floor(seededRandom(game.seed, "pay", clerk.id, String(game.minutes)) * lines.length) % lines.length];
  return {
    id: clerk.id,
    name: nameFor(game, clerk),
    text: line,
  };
}
function counterView(game) {
  let clerk = clerkHere(game);
  if (!clerk) {
    return null;
  }
  let bond = bondOf(game, clerk.id),
    due = counterDue(game),
    discount = discountOf(game, clerk),
    suits = game.suits?.characterId === clerk.id && game.suits.place === game.at ? (bond?.counter?.suits ?? "") : "";
  return {
    id: clerk.id,
    name: nameFor(game, clerk),
    met: hasMet2(game, clerk.id),
    ...characterPortrait(clerk, game),
    ...workingLook(game, clerk.id),
    greeting: due ? "" : suits || counterGreeting(game, bond),
    writing: !!due,
    discount: discount.off
      ? {
          off: discount.off,
          why: discount.why,
        }
      : null,
  };
}
function knownStyleOf(game, charId) {
  let likes = characterOf(game, charId)?.clothesTaste?.likes,
    bond = bondOf(game, charId);
  return !likes || !bond
    ? null
    : bond.clothesKnown?.likes ||
        (hasMet2(game, charId) && giftTastesRevealed(bond, game.rules?.showArchetypes ?? "found"))
      ? likes
      : null;
}
function suitsAsk(game, charId) {
  let clerk = clerkHere(game);
  return !clerk || clerk.id !== charId || !suitsSection(game, clerk) || knownStyleOf(game, charId)
    ? null
    : {
        ok: true,
        minutes: SUITS_MINUTES,
        title: clerk.job?.title ?? "Shop assistant",
      };
}
function askSuits(game, charId) {
  let busy = sceneBusyReason(game);
  if (busy) {
    return {
      ok: false,
      reason: busy,
    };
  }
  let clerk = suitsAsk(game, charId);
  if (!clerk) {
    return {
      ok: false,
      reason: "There is nobody at the counter to ask that.",
    };
  }
  let closing = closingWhy(game, SUITS_MINUTES);
  if (closing) {
    return {
      ok: false,
      reason: closing,
    };
  }
  let character = characterOf(game, charId),
    bond = bondOf(game, charId);
  bond.clothesKnown = {
    ...(bond.clothesKnown ?? {}),
    likes: true,
  };
  let { events: events } = advanceTime(game, SUITS_MINUTES);
  game.suits = {
    characterId: charId,
    place: game.at,
    at: game.minutes,
  };
  let charName = hasMet2(game, charId) ? nameFor(game, character) : `The ${clerk.title.toLowerCase()}`;
  logNote(
    game,
    `${charName} told you what suits you: ${suitsSection(game, character)} (${SUITS_MINUTES} min)`,
    "activity",
  );
  return {
    ok: true,
    style: character.clothesTaste.likes,
    section: suitsSection(game, character),
    minutes: SUITS_MINUTES,
    events: events,
  };
}
function styleMarks(game) {
  let clerk = clerkHere(game),
    marks = {};
  for (let character of game.characters) {
    let style = knownStyleOf(game, character.id),
      isClerk = character.id === clerk?.id;
    if (!style || (!isClerk && !hasMet2(game, character.id))) {
      continue;
    }
    let charName = hasMet2(game, character.id) ? nameFor(game, character) : (character.job?.title ?? "Shop assistant");
    (marks[style] ??= []).push({
      id: character.id,
      text: isClerk ? `${charName} recommends` : `${charName}'s style`,
      clerk: isClerk,
    });
  }
  for (let list of Object.values(marks)) {
    list.sort((a, b) => b.clerk - a.clerk);
  }
  return marks;
}
function verdictOn(character, style) {
  let taste = character?.clothesTaste;
  return taste?.likes === style ? "likes" : taste?.dislikes === style ? "dislikes" : "fine";
}
function fittingPeople(game) {
  let clerk = clerkHere(game),
    others = whoIsHere(game)
      .map((person) => characterOf(game, person.id))
      .filter((person) => person && hasMet2(game, person.id) && !isAsleep(game, person.id));
  return [...(clerk ? [clerk] : []), ...others.filter((person) => person.id !== clerk?.id)];
}
var fittingWho = (game) =>
  fittingPeople(game).map((person) => ({
    id: person.id,
    name: nameFor(game, person),
  }));
function tryOn(game, itemId) {
  let busy = sceneBusyReason(game);
  if (busy) {
    return {
      ok: false,
      reason: busy,
    };
  }
  if (!isClothesStore(game.at)) {
    return {
      ok: false,
      reason: "The fitting rooms are in the clothes store.",
    };
  }
  let item = itemDef(game.things, itemId);
  if (!(item?.kind === "clothes" && item.store === game.at)) {
    return {
      ok: false,
      reason: "That is not on this rack.",
    };
  }
  let people = fittingPeople(game);
  if (!people.length) {
    return {
      ok: false,
      reason: "There is nobody here to ask.",
    };
  }
  let closing = closingWhy(game, TRY_MINUTES);
  if (closing) {
    return {
      ok: false,
      reason: closing,
    };
  }
  let style = item.style ?? "casual",
    clerk = clerkHere(game),
    now = game.minutes,
    opinions = people.map((person) => {
      let bond = bondOf(game, person.id),
        verdict = verdictOn(person, style),
        met = hasMet2(game, person.id),
        again = !!bond.tried?.[itemId],
        effect = null;
      if (
        met &&
        !again &&
        ((bond.tried = {
          ...(bond.tried ?? {}),
          [itemId]: now,
        }),
        verdict !== "fine" &&
          (bond.clothesKnown = {
            ...(bond.clothesKnown ?? {}),
            [verdict]: true,
          }),
        verdict === "likes")
      ) {
        let romantic = bond.romanceable !== false && !bond.justFriends && bondTier(bond, "romance") >= 1;
        applyBondAction(
          bond,
          {
            action: "fitting",
            ...(romantic
              ? {
                  romance: 1,
                }
              : {
                  friendship: 1,
                }),
          },
          {
            at: now,
            charm: skillLevelsOf(game).charm,
            note: `liked ${item.name} on you`,
            today: false,
          },
        );
        effect = romantic ? "romance" : "friendship";
      }
      return {
        id: person.id,
        verdict: verdict,
        again: again,
        effect: effect,
        working: person.id === clerk?.id,
        line: "",
      };
    }),
    { events: events } = advanceTime(game, TRY_MINUTES);
  game.fitting = {
    item: itemId,
    place: game.at,
    at: now,
    opinions: opinions,
    writing: true,
  };
  logNote(game, `Tried on ${item.name} (${TRY_MINUTES} min)`, "activity");
  return {
    ok: true,
    minutes: TRY_MINUTES,
    events: events,
  };
}
function fittingTalk(game) {
  let fitting = game.fitting;
  if (!fitting?.writing) {
    return null;
  }
  let item = itemDef(game.things, fitting.item),
    opinions = fitting.opinions
      .map((opinion) => ({
        character: characterOf(game, opinion.id),
        bond: bondOf(game, opinion.id),
        met: hasMet2(game, opinion.id),
        verdict: opinion.verdict,
        again: opinion.again,
        working: opinion.working,
      }))
      .filter((opinion) => opinion.character && opinion.bond);
  return item && opinions.length
    ? {
        outfit: {
          name: item.name,
          text: item.text ?? item.line ?? item.name,
        },
        place: townPlace(game.town, fitting.place)?.name ?? "the store",
        people: opinions,
      }
    : null;
}
function setFittingLines(game, lines = {}) {
  let fitting = game.fitting;
  if (fitting) {
    for (let opinion of fitting.opinions) {
      opinion.line = String(lines[opinion.id] ?? opinion.line ?? "");
    }
    fitting.writing = false;
  }
}
function fittingView(game) {
  let fitting = game.fitting;
  return !fitting || fitting.place !== game.at
    ? null
    : {
        item: fitting.item,
        writing: !!fitting.writing,
        opinions: fitting.opinions
          .map((opinion) => {
            let character = characterOf(game, opinion.id);
            return character
              ? {
                  id: opinion.id,
                  name: nameFor(game, character),
                  ...characterPortrait(character, game),
                  verdict: opinion.verdict,
                  again: opinion.again,
                  effect: opinion.effect,
                  line: opinion.line,
                }
              : null;
          })
          .filter(Boolean),
      };
}
function clothesKnownOf(game, charId) {
  let character = characterOf(game, charId),
    bond = bondOf(game, charId);
  if (!character?.clothesTaste || !bond) {
    return null;
  }
  let revealed = giftTastesRevealed(bond, game.rules?.showArchetypes ?? "found"),
    styleLabel = (style) => CLOTHES_STYLE_LABELS.find(([key]) => key === style)?.[1] ?? style.toUpperCase();
  return {
    likes: revealed || bond.clothesKnown?.likes ? styleLabel(character.clothesTaste.likes) : null,
    dislikes: revealed || bond.clothesKnown?.dislikes ? styleLabel(character.clothesTaste.dislikes) : null,
  };
}

export {
  CLERK_DISCOUNT,
  COUNTER_PLACES,
  STORE_ACTS,
  SUITS_MINUTES,
  TRY_MINUTES,
  askSuits,
  clerkHere,
  clothesKnownOf,
  counterDue,
  counterKey,
  counterView,
  discountHere,
  discountOf,
  fittingTalk,
  fittingView,
  fittingWho,
  knownStyleOf,
  payLine,
  setCounterLines,
  setFittingLines,
  styleMarks,
  suitsAsk,
  suitsSection,
  tryOn,
  verdictOn,
};
