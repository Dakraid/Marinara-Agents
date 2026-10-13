// Shop tabs, clothes racks, cart checkout and purchase application
import {
  CLOTHES_STYLE_LABELS,
  HOME_SLOT_EFFECTS,
  HOME_SLOT_LABELS,
  ITEM_CATALOG,
  MINUTES_PER_DAY,
  ON_FOOT_MINUTES_PER_DISTRICT,
  applyDiscount,
  clothesPerkText,
} from "../items/catalog.mjs";
import {
  addToBag,
  addToPiles,
  bagFitCheck,
  inSeason,
  itemDef,
  itemFreshMinutes,
  nextOnlineDeliveryAt,
  nextStoreDeliveryAt,
  seasonNewsItems,
  soldAt,
  storageFor,
} from "../items/inventory.mjs";

function buildShopCatalog(
  things,
  {
    mode = "store",
    homeSlots = [],
    season = null,
    place = "market",
    pics = {},
    off = 0,
    wedding = false,
    luxury = false,
  } = {},
) {
  let newItems = seasonNewsItems(things, season).filter((item) => soldAt(item, mode, place)),
    toEntry = (itemId, item, isNew = false) => {
      let ownedClothes = item.kind === "clothes" && things.closet.includes(itemId),
        inHome = item.kind === "furniture" && things.home[item.slot] === itemId,
        ownedVehicle = item.kind === "vehicle" && (things.vehicles ?? []).includes(itemId),
        fits = item.kind !== "furniture" || homeSlots.includes(item.slot),
        onItsWay =
          (things.orders ?? []).some((order) => order.item === itemId) &&
          (item.kind === "clothes" || item.kind === "furniture" || item.kind === "vehicle"),
        slotPending =
          item.kind === "furniture" &&
          !onItsWay &&
          (things.orders ?? []).some(
            (order) =>
              itemDef(things, order.item)?.kind === "furniture" && itemDef(things, order.item)?.slot === item.slot,
          ),
        why = ownedClothes
          ? "You have it"
          : ownedVehicle
            ? "Yours"
            : inHome
              ? "In your home already"
              : fits
                ? item.needs === "garage" && !homeSlots.includes("garage")
                  ? "You need a home with a garage: a house, a mansion or Skyline Tower"
                  : item.kind === "furniture" && item.luxury && !luxury
                    ? "Only fits a home on the hill"
                    : onItsWay
                      ? "Already on its way"
                      : slotPending
                        ? `Another ${HOME_SLOT_LABELS[item.slot].toLowerCase()} is on its way`
                        : ""
                : `Your home has no room for a ${HOME_SLOT_LABELS[item.slot].toLowerCase()}`;
      return {
        id: itemId,
        name: item.pack?.name ?? item.name,
        icon: item.icon,
        price: applyDiscount(item.price, off),
        ...(off
          ? {
              was: item.price,
            }
          : {}),
        kind: item.kind,
        isNew: isNew,
        tags: item.tags ?? [],
        line: item.line ?? "",
        chips: itemEffectChips(item, things),
        available: !why,
        why: why,
        unique: item.kind === "clothes" || item.kind === "furniture" || item.kind === "vehicle",
        ...(ownedVehicle
          ? {
              sell: Math.round(item.price / 2),
            }
          : {}),
        units: item.pack?.n ?? 1,
        fresh: item.fresh ? item.fresh * MINUTES_PER_DAY : null,
        pic: pics[itemId]?.url ?? null,
      };
    },
    catalog = Object.entries(ITEM_CATALOG).filter(
      ([, item]) => soldAt(item, mode, place, season) && (!item.wedding || wedding),
    ),
    tabs =
      mode === "online"
        ? [
            {
              id: "furniture",
              name: "Furniture",
              items: catalog.filter(([, item]) => item.kind === "furniture").map(([item, def]) => toEntry(item, def)),
            },
            {
              id: "vehicles",
              name: "Vehicles",
              items: catalog.filter(([, item]) => item.kind === "vehicle").map(([item, def]) => toEntry(item, def)),
            },
          ]
        : place === "market"
          ? [
              {
                id: "food",
                name: "Food",
                items: catalog
                  .filter(([, item]) => item.kind === "food" && !item.gift)
                  .map(([item, def]) => toEntry(item, def)),
              },
              {
                id: "gifts",
                name: "Gifts",
                items: catalog.filter(([, item]) => item.gift).map(([item, def]) => toEntry(item, def)),
              },
            ]
          : place === "gift-shop"
            ? [
                {
                  id: "gifts",
                  name: "Gifts",
                  items: catalog.filter(([, item]) => item.kind !== "ring").map(([item, def]) => toEntry(item, def)),
                },
                {
                  id: "rings",
                  name: "Rings",
                  items: catalog
                    .filter(([, item]) => item.kind === "ring" || item.kind === "bands")
                    .map(([item, def]) => toEntry(item, def)),
                },
              ]
            : [
                {
                  id: place,
                  name: "Furniture",
                  items: catalog.map(([itemId, def]) => toEntry(itemId, def)),
                },
              ];
  if (mode === "store" && place === "market") {
    tabs.push({
      id: "new",
      name: "New this season",
      isNew: true,
      items: newItems.map((item) => toEntry(item.id, item, true)),
    });
  }
  return {
    mode: mode,
    place: place,
    tabs: tabs,
  };
}
function buildClothesRack(
  things,
  store,
  { season = null, wearing = null, pics = {}, cash = 1 / 0, off = 0, wedding = false } = {},
) {
  let catalogRows = Object.entries(ITEM_CATALOG)
      .filter(
        ([, item]) =>
          item.kind === "clothes" && item.store === store && inSeason(item, season) && (!item.wedding || wedding),
      )
      .map(([itemId, item]) => [itemId, item, false]),
    newRows = seasonNewsItems(things, season)
      .filter((item) => item.kind === "clothes" && item.store === store)
      .map((item) => [item.id, item, true]),
    styleRank = (item) => CLOTHES_STYLE_LABELS.findIndex(([style]) => style === item.style);
  return [...catalogRows, ...newRows]
    .sort((a, b) => styleRank(a[1]) - styleRank(b[1]))
    .map(([itemId, item, isNew]) => {
      let owned = things.closet.includes(itemId),
        price = applyDiscount(item.price, off);
      return {
        id: itemId,
        name: item.name,
        icon: item.icon,
        price: price,
        ...(off
          ? {
              was: item.price,
            }
          : {}),
        text: item.text ?? item.line ?? item.name,
        isNew: isNew,
        owned: owned,
        wearing: wearing === itemId,
        section: item.style ?? "casual",
        effect: item.formal || item.sport ? clothesPerkText(item) : "",
        pic: pics[itemId]?.url ?? null,
        own: !!pics[itemId]?.own,
        canBuy: !owned && price <= cash,
        why: owned ? "You have it" : price > cash ? "Not enough cash" : "",
      };
    });
}
function checkClothesPurchase(things, store, itemId, { season = null, cash = 0, off = 0, wedding = false } = {}) {
  let item = itemDef(things, itemId);
  if (!(
    item?.kind === "clothes" &&
    item.store === store &&
    (!item.wedding || wedding) &&
    (ITEM_CATALOG[itemId]
      ? inSeason(item, season)
      : seasonNewsItems(things, season).some((newItem) => newItem.id === itemId))
  )) {
    return {
      ok: false,
      reason: "That is not on this rack.",
    };
  }
  if (things.closet.includes(itemId)) {
    return {
      ok: false,
      reason: "You have it already.",
    };
  }
  let price = applyDiscount(item.price, off);
  return price > cash
    ? {
        ok: false,
        reason: `You cannot afford it: $${price}.`,
      }
    : {
        ok: true,
        item: item,
        total: price,
      };
}
function addClothesToCloset(things, itemId) {
  let item = itemDef(things, itemId);
  if (item?.newKind) {
    (things.known ??= {})[itemId] = {
      ...item,
    };
  }
  if (!things.closet.includes(itemId)) {
    things.closet.push(itemId);
  }
}
function itemEffectChips(item, things = null) {
  let chips = [];
  if (
    (item.eat?.hunger &&
      chips.push({
        kind: "gain",
        text: `+${item.eat.hunger} Hunger`,
      }),
    item.eat?.energy &&
      chips.push({
        kind: "gain",
        text: `+${item.eat.energy} Energy`,
      }),
    item.cook &&
      chips.push({
        kind: "info",
        text: "Cook at home",
      }),
    item.pack?.n > 1 &&
      item.cook &&
      chips.push({
        kind: "info",
        text: `${item.pack.n} ${item.pack.n === 1 ? "portion" : "portions"}`,
      }),
    item.fresh &&
      !item.lent &&
      chips.push({
        kind: "fresh",
        text:
          item.fresh >= 30
            ? item.fresh >= 60
              ? "Keeps for ages"
              : "Keeps a season"
            : item.kind === "gift"
              ? `Wilts in ${item.fresh} days`
              : `Fresh ${item.fresh} day${item.fresh === 1 ? "" : "s"}`,
      }),
    item.kind === "clothes" &&
      chips.push({
        kind: item.formal || item.sport ? "gain" : "info",
        text: clothesPerkText(item),
      }),
    item.kind === "furniture")
  ) {
    let current = things?.home?.[item.slot];
    chips.push({
      kind: "gain",
      text: HOME_SLOT_EFFECTS[item.slot](item.level).text,
    });
    chips.push({
      kind: "info",
      text: `${HOME_SLOT_LABELS[item.slot]}${current ? `: replaces your ${(ITEM_CATALOG[current]?.name ?? current).toLowerCase()}` : ": you have none yet"}`,
    });
  }
  if (item.kind === "ring") {
    chips.push({
      kind: "info",
      text: "To propose",
    });
  }
  if (item.kind === "bands") {
    chips.push({
      kind: "info",
      text: "For the wedding",
    });
  }
  if (item.read) {
    chips.push({
      kind: "gain",
      text: `+${item.read} ${item.skill ? `${item.skill[0].toUpperCase()}${item.skill.slice(1)}` : "Knowledge"} a read`,
    });
    if (item.reads) {
      chips.push({
        kind: "info",
        text: `${item.reads} reads`,
        reads: true,
      });
    }
  }
  if (item.kind === "vehicle") {
    chips.push({
      kind: "gain",
      text: `${item.hop} min per district (${ON_FOOT_MINUTES_PER_DISTRICT} on foot)`,
    });
    chips.push({
      kind: "info",
      text: "Paid once \xB7 no costs after",
    });
  }
  if (item.gift) {
    chips.push({
      kind: "info",
      text: "Gift",
    });
  }
  return chips;
}
function checkoutShopCart(
  things,
  cart,
  {
    mode = "store",
    cash = 0,
    homeSlots = [],
    season = null,
    minutes = 0,
    sendHome = false,
    place = "market",
    off = 0,
    wedding = false,
    luxury = false,
  } = {},
) {
  let catalog = buildShopCatalog(things, {
      mode: mode,
      homeSlots: homeSlots,
      season: season,
      place: place,
      off: off,
      wedding: wedding,
      luxury: luxury,
    }),
    offers = new Map(catalog.tabs.flatMap((tab) => tab.items).map((tab) => [tab.id, tab])),
    lines = [];
  for (let entry of cart ?? []) {
    let count = Math.max(0, Math.min(20, Math.floor(Number(entry?.n) || 0))),
      offer = offers.get(entry?.id);
    if (!count) {
      continue;
    }
    if (!offer) {
      return {
        ok: false,
        reason: "That is not sold here.",
      };
    }
    if (!offer.available) {
      return {
        ok: false,
        reason: `${offer.name}: ${offer.why}.`,
      };
    }
    let slot = offer.kind === "furniture" ? itemDef(things, entry.id)?.slot : null;
    if (
      slot &&
      lines.some((line) => itemDef(things, line.id)?.kind === "furniture" && itemDef(things, line.id)?.slot === slot)
    ) {
      return {
        ok: false,
        reason: `Only one ${HOME_SLOT_LABELS[slot].toLowerCase()} fits.`,
      };
    }
    lines.push({
      id: entry.id,
      n: offer.unique ? 1 : count,
      price: offer.price,
    });
  }
  if (!lines.length) {
    return {
      ok: false,
      reason: "The cart is empty.",
    };
  }
  let total = lines.reduce((sum, line) => sum + line.price * line.n, 0);
  if (total > cash) {
    return {
      ok: false,
      reason: `You cannot afford it: $${total}.`,
    };
  }
  if (mode === "online") {
    return {
      ok: true,
      total: total,
      lines: lines,
      online: true,
      at: nextOnlineDeliveryAt(minutes),
    };
  }
  if (place === "furniture") {
    return {
      ok: true,
      total: total,
      lines: lines,
      online: true,
      tonight: true,
      at: nextStoreDeliveryAt(minutes),
    };
  }
  let units = lines.map((line) => ({
      id: line.id,
      n: line.n * (itemDef(things, line.id)?.pack?.n ?? 1),
    })),
    fit = bagFitCheck(things, units);
  return fit.over && !sendHome
    ? {
        ok: false,
        reason: `${fit.over} won't fit in your backpack.`,
        over: fit.over,
      }
    : {
        ok: true,
        total: total,
        lines: lines,
        units: units,
        over: fit.over,
      };
}
function applyShopPurchase(things, purchase) {
  for (let line of purchase.lines) {
    let item = itemDef(things, line.id);
    if (item?.newKind) {
      (things.known ??= {})[line.id] = {
        ...item,
      };
    }
  }
  if (purchase.online) {
    for (let line of purchase.lines) {
      things.orders.push({
        item: line.id,
        n: line.n,
        at: purchase.at,
      });
    }
    return {
      home: [],
      bag: [],
    };
  }
  let home = [];
  for (let unit of purchase.units) {
    let freshLeft = itemFreshMinutes(unit.id, things),
      overflow = addToBag(things, unit.id, unit.n, freshLeft);
    if (overflow > 0) {
      addToPiles(storageFor(things, unit.id), unit.id, overflow, freshLeft);
      home.push({
        id: unit.id,
        n: overflow,
      });
    }
  }
  return {
    sentHome: home,
  };
}

export {
  addClothesToCloset,
  applyShopPurchase,
  buildClothesRack,
  buildShopCatalog,
  checkClothesPurchase,
  checkoutShopCart,
  itemEffectChips,
};
