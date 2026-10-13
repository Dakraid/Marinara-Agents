// Bag/fridge/shelf piles: eat, throw, move, recipes, cooking and the inventory view
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import {
  BAG_SLOTS,
  BAG_STACK_MAX,
  CLOTHES_STYLE_LABELS,
  FRIDGE_SPOIL_SLOWDOWN,
  HOME_SLOT_EFFECTS,
  HOME_SLOT_LABELS,
  ITEM_CATALOG,
  MINUTES_PER_DAY,
  clothesPerkText,
} from "../items/catalog.mjs";
import { RECIPES } from "../items/cooking.mjs";
import { READ_MINUTES, addToBag, addToPiles, itemDef, loanDueDay, readsLeft, storageFor } from "../items/inventory.mjs";
import { itemEffectChips } from "../shop/store-catalog.mjs";

var isHomeStorageList = (listName) => listName === "fridge" || listName === "shelf";
var isPileSpoiled = (pile) => pile.left !== null && pile.left <= 0;
function takeOneFromPile(things, listName, index) {
  let pile = things[listName]?.[index];
  return pile ? ((pile.n -= 1), pile.n <= 0 && things[listName].splice(index, 1), pile) : null;
}
function checkEatFromPile(things, listName, index, { atHome = false } = {}) {
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
  return item?.eat
    ? isPileSpoiled(pile)
      ? {
          ok: false,
          reason: "It has gone off. Throw it away.",
        }
      : {
          ok: true,
          item: item,
          eat: item.eat,
          minutes: item.minutes ?? 10,
          take: () => takeOneFromPile(things, listName, index),
        }
    : {
        ok: false,
        reason: item?.cook ? "Cook it at home first." : "You can't eat that.",
      };
}
function throwAwayFromPile(things, listName, index, count = null) {
  let pile = things[listName]?.[index];
  if (!pile) {
    return {
      ok: false,
      reason: "It is not there anymore.",
    };
  }
  let removed = Math.max(1, Math.min(pile.n, Math.floor(Number(count)) || (isPileSpoiled(pile) ? pile.n : 1)));
  pile.n -= removed;
  if (pile.n <= 0) {
    things[listName].splice(index, 1);
  }
  return {
    ok: true,
    pile: pile,
    n: removed,
  };
}
function movePileBetweenBagAndHome(things, listName, index, { atHome = false, n: count = null } = {}) {
  if (!atHome) {
    return {
      ok: false,
      reason: "Only at home.",
    };
  }
  let pile = things[listName]?.[index];
  if (!pile) {
    return {
      ok: false,
      reason: "It is not there anymore.",
    };
  }
  let moving = Math.max(1, Math.min(pile.n, Math.floor(Number(count)) || pile.n));
  if (listName === "bag") {
    let target = storageFor(things, pile.item);
    addToPiles(target, pile.item, moving, pile.left, {
      used: pile.used ?? 0,
    });
    pile.n -= moving;
    if (pile.n <= 0) {
      things.bag.splice(index, 1);
    }
    return {
      ok: true,
      to: target === things.fridge ? "fridge" : "shelf",
      n: moving,
    };
  }
  let bagCopy = things.bag.map((pile2) => ({
      ...pile2,
    })),
    leftOver = addToPiles(bagCopy, pile.item, moving, pile.left, {
      max: BAG_STACK_MAX,
      slots: BAG_SLOTS,
      used: pile.used ?? 0,
    }),
    fitted = moving - leftOver;
  return fitted
    ? (addToBag(things, pile.item, fitted, pile.left, pile.used ?? 0),
      (pile.n -= fitted),
      pile.n <= 0 && things[listName].splice(index, 1),
      {
        ok: true,
        to: "bag",
        n: fitted,
      })
    : {
        ok: false,
        reason: "Your backpack is full.",
      };
}
var INGREDIENT_UNIT_NAMES = {
  rice: ["rice", "rice"],
  eggs: ["egg", "eggs"],
  vegetables: ["vegetables", "vegetables"],
  chicken: ["chicken", "chicken"],
  pasta: ["pasta", "pasta"],
  cheese: ["slice of cheese", "slices of cheese"],
  fish: ["fish fillet", "fish fillets"],
  flour: ["cup of flour", "cups of flour"],
  fruit: ["piece of fruit", "pieces of fruit"],
};
var ingredientQuantityLabel = (itemId, count = 1) => {
  let unitNames = INGREDIENT_UNIT_NAMES[itemId] ?? [
    ITEM_CATALOG[itemId].name.toLowerCase(),
    ITEM_CATALOG[itemId].name.toLowerCase(),
  ];
  return count > 1 ? `${count} ${unitNames[1]}` : unitNames[0];
};
function listRecipesForKitchen(things, { kitchen = 0, atHome = false, level = 0 } = {}) {
  let haveCount = (itemId) =>
    [...things.fridge, ...things.bag]
      .filter((pileOrTotal) => pileOrTotal.item === itemId && !isPileSpoiled(pileOrTotal))
      .reduce((pileOrTotal, pile) => pileOrTotal + pile.n, 0);
  return RECIPES.map((recipe) => {
    let uses = Object.entries(recipe.uses).map(([itemId, count]) => ({
        id: itemId,
        n: count,
        name: ingredientQuantityLabel(itemId, count),
        have: Math.min(haveCount(itemId), 99),
        icon: ITEM_CATALOG[itemId].icon,
      })),
      missing = uses.filter((use) => use.have < use.n).map((use) => use.name),
      why =
        level < recipe.level
          ? `Needs Cooking ${recipe.level}`
          : atHome
            ? kitchen < recipe.kitchen
              ? recipe.kitchen >= 2
                ? "Needs a stove"
                : "Needs a kitchen"
              : missing.length
                ? `Missing: ${missing.join(", ")}`
                : ""
            : "Only at home",
      need = why
        ? level < recipe.level
          ? "level"
          : atHome
            ? kitchen < recipe.kitchen
              ? "kitchen"
              : "missing"
            : "home"
        : "";
    return {
      ...recipe,
      uses: uses,
      available: !why,
      locked: level < recipe.level,
      why: why,
      need: need,
    };
  });
}
function prepareRecipeCooking(things, recipeId, options) {
  let recipe = listRecipesForKitchen(things, options).find((entry) => entry.id === recipeId);
  return recipe
    ? recipe.available
      ? {
          ok: true,
          recipe: recipe,
          take: () => {
            for (let { id: itemId, n: count } of recipe.uses) {
              let needed = count;
              for (let listName of ["fridge", "bag"]) {
                let piles = things[listName]
                  .filter((pile) => pile.item === itemId && !isPileSpoiled(pile))
                  .sort((pile, otherPile) => pile.left - otherPile.left);
                for (let pile of piles) {
                  if (!needed) {
                    break;
                  }
                  let taken = Math.min(needed, pile.n);
                  pile.n -= taken;
                  needed -= taken;
                }
                things[listName] = things[listName].filter((pile) => pile.n > 0);
              }
            }
          },
        }
      : {
          ok: false,
          reason: recipe.why,
        }
    : {
        ok: false,
        reason: "No such recipe.",
      };
}
function checkChangeClothes(things, itemId, { atHome = false, wearing = null } = {}) {
  return atHome
    ? things.closet.includes(itemId)
      ? wearing === itemId
        ? {
            ok: false,
            reason: "You are wearing it.",
          }
        : {
            ok: true,
            item: itemDef(things, itemId),
          }
      : {
          ok: false,
          reason: "You don't have that.",
        }
    : {
        ok: false,
        reason: "You change at home, or in a clothes store's fitting room.",
      };
}
var freshnessBadge = (pile, item, inFridge) => {
  if (pile.left === null || !item?.fresh) {
    return {
      text: "KEEPS",
      share: 1,
      level: "keeps",
    };
  }
  if (pile.left <= 0) {
    return {
      text: "SPOILED",
      share: 0,
      level: "bad",
    };
  }
  let daysLeft = (pile.left / MINUTES_PER_DAY) * (inFridge ? FRIDGE_SPOIL_SLOWDOWN : 1),
    share = Math.min(1, pile.left / (item.fresh * MINUTES_PER_DAY));
  return {
    text: daysLeft < 1 ? "TODAY" : daysLeft < 2 ? "TOMORROW" : `${Math.floor(daysLeft)} DAYS`,
    share: share,
    level: daysLeft < 2 ? "soon" : "fine",
  };
};
var bookReadsBadge = (book) =>
  book.back
    ? {
        text: `BACK ${book.back.toUpperCase()}`,
        share: 1,
        level: book.back === "today" || book.back === "tomorrow" ? "soon" : "fine",
      }
    : {
        text: `${book.left} ${book.left === 1 ? "READ" : "READS"} LEFT`,
        share: book.left / book.of,
        level: book.left === 1 ? "soon" : "fine",
      };
function buildInventoryView(
  things,
  { atHome = false, wearing = "casual", homeSlots = [], clothes = null, minutes = 0 } = {},
) {
  let pileView = (listName) => (pile, index) => {
      let item = itemDef(things, pile.item),
        readsRemaining = readsLeft(things, pile),
        book =
          readsRemaining === null
            ? null
            : item.lent
              ? {
                  back: loanDueDay(pile, minutes),
                }
              : {
                  left: readsRemaining,
                  of: item.reads,
                },
        badge = book ? bookReadsBadge(book) : freshnessBadge(pile, item, listName === "fridge"),
        spoiled = !book && isPileSpoiled(pile),
        reachable = !isHomeStorageList(listName) || atHome,
        acts = [];
      if (item?.eat && !spoiled) {
        acts.push({
          act: "eat",
          text: `${item.kind === "food" && !item.eat.hunger ? "Drink" : "Eat"} \xB7 ${item.minutes ?? 10} min`,
          ok: reachable,
          why: reachable ? "" : "At home",
        });
      }
      if (book) {
        acts.push({
          act: "read",
          text: `Read \xB7 ${READ_MINUTES / 60} h`,
          ok: reachable,
          why: reachable ? "" : "At home",
        });
      }
      if (atHome) {
        acts.push({
          act: "move",
          text: listName === "bag" ? "Put away" : "Take with you",
          ok: true,
        });
      }
      if (!item?.lent) {
        acts.push({
          act: "throw",
          text: spoiled && pile.n > 1 ? `Throw away \xD7${pile.n}` : "Throw away",
          ok: reachable,
          why: reachable ? "" : "At home",
        });
      }
      return {
        list: listName,
        index: index,
        id: pile.item,
        name: item?.name ?? pile.item,
        icon: item?.icon ?? "\u{1F4E6}",
        n: pile.n,
        fresh: badge,
        spoiled: spoiled,
        home: item?.kind === "food" ? "fridge" : "shelf",
        ...(book
          ? {
              book: book,
            }
          : {}),
        chips: item
          ? itemEffectChips(item).filter(
              (chip) => chip.kind !== "fresh" && !chip.reads && !(pile.used && chip.text === "Gift"),
            )
          : [],
        acts: acts,
      };
    },
    home = Object.fromEntries(
      homeSlots.map((slot) => {
        let pieceId = things.home?.[slot] ?? null,
          piece = pieceId ? ITEM_CATALOG[pieceId] : null,
          order = (things.orders ?? []).find((pending) => ITEM_CATALOG[pending.item]?.slot === slot);
        return [
          slot,
          {
            slot: slot,
            name: HOME_SLOT_LABELS[slot],
            id: pieceId,
            piece: piece?.name ?? "Empty",
            icon: piece?.icon ?? "\xB7",
            level: piece?.level ?? 0,
            text: piece
              ? HOME_SLOT_EFFECTS[slot](piece.level).text
              : slot === "desk"
                ? "A desk lets you study at home"
                : slot === "tv"
                  ? "A TV lets you watch something with a guest"
                  : "",
            coming: order ? (ITEM_CATALOG[order.item]?.name ?? null) : null,
            comingWhen: order
              ? `${clockFromMinutes(order.at).dayIndex === clockFromMinutes(minutes).dayIndex ? "tonight" : "tomorrow"} at ${formatClockTime(order.at)}`
              : null,
          },
        ];
      }),
    );
  return {
    atHome: atHome,
    bag: {
      slots: BAG_SLOTS,
      piles: things.bag.map(pileView("bag")),
    },
    fridge: things.fridge.map(pileView("fridge")),
    shelf: things.shelf.map(pileView("shelf")),
    closet: (clothes
      ? ["own", ...things.closet.filter((itemId) => itemId !== "own")]
      : things.closet.filter((itemId) => itemId !== "own")
    ).map((itemId) => {
      let item = itemDef(things, itemId);
      return {
        id: itemId,
        name: item?.name ?? itemId,
        icon: item?.icon ?? "\u{1F455}",
        effect: clothesPerkText(item),
        wearing: itemId === wearing,
        style: itemId === "own" ? null : (CLOTHES_STYLE_LABELS.find(([style]) => style === item?.style)?.[1] ?? null),
        pic: clothes ? ((itemId === "own" ? clothes.own : clothes.pics?.[itemId]?.url) ?? null) : null,
        failed: !!clothes?.failed?.[itemId],
      };
    }),
    home: home,
    orders: [...(things.orders ?? [])]
      .sort((orderA, orderB) => orderA.at - orderB.at)
      .map((order) => ({
        id: order.item,
        name: itemDef(things, order.item)?.name ?? order.item,
        n: order.n,
        at: order.at,
        when: `${clockFromMinutes(order.at).weekday} ${formatClockTime(order.at)}`,
      })),
  };
}

export {
  buildInventoryView,
  checkChangeClothes,
  checkEatFromPile,
  isHomeStorageList,
  isPileSpoiled,
  listRecipesForKitchen,
  movePileBetweenBagAndHome,
  prepareRecipeCooking,
  takeOneFromPile,
  throwAwayFromPile,
};
