// Starting things, piles, bag/fridge storage, reading/library loans, deliveries and season stock
import { SEASON_NAMES, clockFromMinutes } from "../time/clock.mjs";
import {
  BAG_SLOTS,
  BAG_STACK_MAX,
  EVENING_DELIVERY_HOUR,
  FRIDGE_SPOIL_SLOWDOWN,
  ITEM_CATALOG,
  MINUTES_PER_DAY,
  ONLINE_DELIVERY_HOUR,
} from "./catalog.mjs";
import { isHomeStorageList, isPileSpoiled } from "../inventory/piles-and-cooking.mjs";

function createStartingThings(homeKind = "apartment", slots = ["bed", "kitchen", "desk", "sofa", "tv"]) {
  let home = {};
  for (let slot of slots) {
    home[slot] =
      {
        bed: "futon",
        kitchen: "hot-plate",
        sofa: "old-sofa",
        bath: "shower",
      }[slot] ?? null;
  }
  let things = {
    bag: [],
    fridge: [],
    shelf: [],
    closet: ["casual"],
    home: home,
    orders: [],
    vehicles: [],
    news: null,
  };
  for (let [itemId, count] of [
    ["rice", 10],
    ["eggs", 6],
    ["vegetables", 2],
    ["bento", 2],
    ["noodles", 3],
  ]) {
    addToPiles(things.fridge, itemId, count, itemFreshMinutes(itemId));
  }
  return things;
}
function itemDef(things, itemId) {
  return (
    ITEM_CATALOG[itemId] ?? things?.news?.items?.find((item) => item.id === itemId) ?? things?.known?.[itemId] ?? null
  );
}
var itemFreshMinutes = (itemId, things) => {
  let item = itemDef(things, itemId);
  return item?.fresh ? item.fresh * MINUTES_PER_DAY : null;
};
function addToPiles(piles, itemId, count, freshLeft = null, { max = 1 / 0, slots = 1 / 0, used = 0 } = {}) {
  let remaining = count;
  for (let pile of piles) {
    if (remaining <= 0) {
      break;
    }
    if (
      pile.item !== itemId ||
      pile.n >= max ||
      (pile.used ?? 0) !== used ||
      (pile.left === null) != (freshLeft === null) ||
      (freshLeft !== null && Math.abs(pile.left - freshLeft) > MINUTES_PER_DAY)
    ) {
      continue;
    }
    let added = Math.min(remaining, max - pile.n);
    pile.n += added;
    remaining -= added;
  }
  for (; remaining > 0 && piles.length < slots;) {
    let added = Math.min(remaining, max);
    piles.push({
      item: itemId,
      n: added,
      left: freshLeft,
      ...(used
        ? {
            used: used,
          }
        : {}),
    });
    remaining -= added;
  }
  return remaining;
}
var addToBag = (things, itemId, count, freshLeft, used = 0) =>
  addToPiles(things.bag, itemId, count, freshLeft, {
    max: BAG_STACK_MAX,
    slots: BAG_SLOTS,
    used: used,
  });
var storageFor = (things, itemId) => (itemDef(things, itemId)?.kind === "food" ? things.fridge : things.shelf);
function bagFitCheck(things, items) {
  let bagCopy = things.bag.map((pile) => ({
      ...pile,
    })),
    overflow = 0;
  for (let { id: itemId, n: count } of items) {
    overflow += addToPiles(bagCopy, itemId, count, itemFreshMinutes(itemId, things), {
      max: BAG_STACK_MAX,
      slots: BAG_SLOTS,
    });
  }
  return {
    used: things.bag.length,
    after: bagCopy.length,
    over: overflow,
    slots: BAG_SLOTS,
  };
}
function ageThingsAndDeliver(things, fromMinutes, toMinutes) {
  let elapsed = toMinutes - fromMinutes;
  if (!things || elapsed <= 0) {
    return [];
  }
  for (let [piles, rate] of [
    [things.bag, 1],
    [things.shelf, 1],
    [things.fridge, 1 / FRIDGE_SPOIL_SLOWDOWN],
  ]) {
    for (let pile of piles) {
      if (pile.left !== null) {
        pile.left = Math.max(0, pile.left - elapsed * rate);
      }
    }
  }
  let delivered = [];
  things.orders = (things.orders ?? []).filter((order) =>
    order.at > toMinutes ? true : (storeDelivered(things, order.item, order.n), delivered.push(order), false),
  );
  return delivered;
}
function returnExpiredLoans(things) {
  let returned = 0;
  for (let piles of [things.bag, things.shelf]) {
    for (let i = piles.length - 1; i >= 0; i--) {
      if (itemDef(things, piles[i].item)?.lent && piles[i].left !== null && piles[i].left <= 0) {
        returned += piles[i].n;
        piles.splice(i, 1);
      }
    }
  }
  return returned;
}
var READ_MINUTES = 60;
var READ_ENERGY = 5;
var LIBRARY_LOAN_DAYS = 7;
var WEEKDAY_NAMES2 = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};
function readsLeft(things, pile) {
  let item = itemDef(things, pile?.item);
  return item?.read ? (item.lent ? 1 / 0 : item.reads - (pile.used ?? 0)) : null;
}
var isGiftable = (things, pile) => !!itemDef(things, pile?.item)?.gift && !isPileSpoiled(pile) && !pile.used;
function loanDueDay(pile, now) {
  let dueAt = now + (pile.left ?? 0),
    daysLeft = clockFromMinutes(dueAt).dayIndex - clockFromMinutes(now).dayIndex;
  return daysLeft <= 0 ? "today" : daysLeft === 1 ? "tomorrow" : WEEKDAY_NAMES2[clockFromMinutes(dueAt).weekday];
}
function nextReadablePile(things) {
  let candidates = ["bag", "shelf"]
    .flatMap((listName) =>
      (things[listName] ?? []).map((pile, index) => ({
        list: listName,
        index: index,
        pile: pile,
        left: readsLeft(things, pile),
      })),
    )
    .filter((candidate) => candidate.left !== null && candidate.left > 0);
  candidates.sort((a, b) => (a.left === 1 / 0 ? -1 : b.left === 1 / 0 ? 1 : a.left - b.left));
  return candidates[0]
    ? {
        list: candidates[0].list,
        index: candidates[0].index,
      }
    : null;
}
var borrowedLibraryBook = (things) =>
  ["bag", "shelf"].flatMap((entry) => things[entry] ?? []).find((entry) => itemDef(things, entry.item)?.lent) ?? null;
function startReading(things, listName, index, { atHome = false } = {}) {
  let pile = things[listName]?.[index];
  if (!pile) {
    return {
      ok: false,
      reason: "It is not there anymore.",
    };
  }
  if (isHomeStorageList(listName) && !atHome) {
    return {
      ok: false,
      reason: "That is at home.",
    };
  }
  let item = itemDef(things, pile.item);
  if (!item?.read) {
    return {
      ok: false,
      reason: "You can't read that.",
    };
  }
  let splitCopy = !item.lent && pile.n > 1;
  return splitCopy && listName === "bag" && things.bag.length >= BAG_SLOTS
    ? {
        ok: false,
        reason: "Your backpack is full: put something away first.",
      }
    : {
        ok: true,
        item: item,
        read: item.read,
        minutes: READ_MINUTES,
        energy: READ_ENERGY,
        take: () => {
          if (item.lent) {
            return {
              finished: false,
            };
          }
          let copy = pile;
          if (splitCopy) {
            pile.n -= 1;
            copy = {
              item: pile.item,
              n: 1,
              left: pile.left,
              used: 0,
            };
            things[listName].push(copy);
          }
          copy.used = (copy.used ?? 0) + 1;
          let finished = copy.used >= item.reads;
          if (finished) {
            things[listName].splice(things[listName].indexOf(copy), 1);
          }
          return {
            finished: finished,
          };
        },
      };
}
function borrowLibraryBook(things, now) {
  let borrowed = borrowedLibraryBook(things);
  return borrowed
    ? {
        ok: false,
        reason: `You still have the one you borrowed. It goes back ${loanDueLabel(borrowed, now)}.`,
      }
    : addToPiles(
          things.bag.map((pile) => ({
            ...pile,
          })),
          "library-book",
          1,
          LIBRARY_LOAN_DAYS * MINUTES_PER_DAY,
          {
            max: BAG_STACK_MAX,
            slots: BAG_SLOTS,
          },
        )
      ? {
          ok: false,
          reason: "Your backpack is full.",
        }
      : (addToBag(things, "library-book", 1, LIBRARY_LOAN_DAYS * MINUTES_PER_DAY),
        {
          ok: true,
        });
}
var loanDueLabel = (pile, now) => {
  let day = loanDueDay(pile, now);
  return day === "today" || day === "tomorrow" ? day : `on ${day}`;
};
function receiveItem(things, itemId) {
  return itemDef(things, itemId)
    ? addToBag(things, itemId, 1, itemFreshMinutes(itemId, things)) === 0
      ? "bag"
      : (storeDelivered(things, itemId, 1), "home")
    : null;
}
function storeDelivered(things, itemId, count) {
  let item = itemDef(things, itemId);
  if (item) {
    if (item.kind === "clothes") {
      if (!things.closet.includes(itemId)) {
        things.closet.push(itemId);
      }
      return;
    }
    if (item.kind === "furniture") {
      if (item.luxury && things.offHill) {
        (things.stored ??= {})[item.slot] = itemId;
        return;
      }
      let current = things.home[item.slot];
      if (
        item.slot === "kitchen" &&
        item.luxury &&
        current &&
        !ITEM_CATALOG[current]?.luxury &&
        ITEM_CATALOG[current]?.price > 0
      ) {
        things.ownKitchen = current;
      }
      if (item.slot in things.home) {
        things.home[item.slot] = itemId;
      }
      return;
    }
    if (item.kind === "vehicle") {
      if (!(things.vehicles ??= []).includes(itemId)) {
        things.vehicles.push(itemId);
      }
      return;
    }
    addToPiles(storageFor(things, itemId), itemId, count * (item.pack?.n ?? 1), itemFreshMinutes(itemId, things));
  }
}
function nextOnlineDeliveryAt(minutes) {
  return (clockFromMinutes(minutes).dayIndex + 1) * MINUTES_PER_DAY + ONLINE_DELIVERY_HOUR * 60;
}
function nextStoreDeliveryAt(minutes) {
  let clock = clockFromMinutes(minutes);
  return clock.hour < EVENING_DELIVERY_HOUR - 1
    ? clock.dayIndex * MINUTES_PER_DAY + EVENING_DELIVERY_HOUR * 60
    : nextOnlineDeliveryAt(minutes);
}
var seasonNewsItems = (things, season) =>
  things.news && (season === null || things.news.season === season) ? things.news.items : [];
var seasonNameAt = (seasonIndex) => (seasonIndex == null ? null : SEASON_NAMES[seasonIndex % SEASON_NAMES.length]);
var inSeason = (item, seasonIndex) =>
  !item.season || !seasonNameAt(seasonIndex) || item.season === seasonNameAt(seasonIndex);
function soldAt(item, mode, place, seasonIndex = null) {
  return inSeason(item, seasonIndex)
    ? mode === "online"
      ? item.sold === "online"
      : place === "furniture"
        ? item.kind === "furniture" && item.store === place
        : item.sold === place
    : false;
}

export {
  LIBRARY_LOAN_DAYS,
  READ_MINUTES,
  addToBag,
  addToPiles,
  ageThingsAndDeliver,
  bagFitCheck,
  borrowLibraryBook,
  borrowedLibraryBook,
  createStartingThings,
  inSeason,
  isGiftable,
  itemDef,
  itemFreshMinutes,
  loanDueDay,
  loanDueLabel,
  nextOnlineDeliveryAt,
  nextReadablePile,
  nextStoreDeliveryAt,
  readsLeft,
  receiveItem,
  returnExpiredLoans,
  seasonNewsItems,
  soldAt,
  startReading,
  storageFor,
};
