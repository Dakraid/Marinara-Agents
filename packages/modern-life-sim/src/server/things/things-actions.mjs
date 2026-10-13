// Home activities, cooking, reading, shopping and using inventory items
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { seededRandom } from "../schedule/whereabouts.mjs";
import { addSkillXp, skillLevelInfo } from "../skills/skill-levels.mjs";
import { COOKING_XP_BY_QUALITY, SKILL_PERKS } from "../skills/skill-perks.mjs";
import {
  BAG_SLOTS,
  BAG_STACK_MAX,
  CHANGE_CLOTHES_MINUTES,
  HOME_SLOT_EFFECTS,
  SHOP_BROWSE_MINUTES,
  SHOP_PLACES,
  isClothesStore,
} from "../items/catalog.mjs";
import { DISH_FRESH_DAYS, RECIPES, cookDishIntoFridge, dishItemFor } from "../items/cooking.mjs";
import {
  LIBRARY_LOAN_DAYS,
  addToPiles,
  bagFitCheck,
  borrowedLibraryBook,
  itemDef,
  loanDueLabel,
  nextOnlineDeliveryAt,
  nextReadablePile,
  nextStoreDeliveryAt,
  readsLeft,
  startReading,
} from "../items/inventory.mjs";
import { applyShopPurchase, buildShopCatalog, checkoutShopCart } from "../shop/store-catalog.mjs";
import {
  buildInventoryView,
  checkChangeClothes,
  checkEatFromPile,
  isHomeStorageList,
  listRecipesForKitchen,
  movePileBetweenBagAndHome,
  prepareRecipeCooking,
  throwAwayFromPile,
} from "../inventory/piles-and-cooking.mjs";
import { seasonKeyAt } from "../shop/new-arrivals.mjs";
import { knownGiftVerdict } from "../gifts/gift-tastes.mjs";
import { spendMoney } from "../money/wallet.mjs";
import { checkEnergyFor, drainNeeds, maxEnergyFor, refillNeeds, sleepNeeds } from "../needs/needs.mjs";
import { isPlaceOpen, townPlace } from "../town/town-layout.mjs";
import {
  bedQualityOf,
  furnitureLevel,
  homeFurnitureSlots,
  isClothesRuleOn,
  isLuxuryHome,
  personaAvatar,
  wearingItem,
} from "../home/furniture-and-wardrobe.mjs";
import { ringChips } from "../romance/proposal.mjs";
import { discountHere } from "../shop/store-counter.mjs";
import {
  advanceTime,
  characterOf,
  closingWhy,
  collapseIfSpent,
  hasFaintedEvent,
  hasMet2,
  logNote,
  skillLevelsOf,
  traitsOf,
} from "../game.mjs";

function homeActivityDetails(state, activity) {
  if (activity.sleep) {
    let hours = activity.minutes / 60,
      maxEnergy = maxEnergyFor(skillLevelsOf(state).fitness),
      slept = sleepNeeds(state.needs, activity.minutes, {
        bedQuality: bedQualityOf(state),
        fitness: skillLevelsOf(state).fitness,
      });
    return {
      ...activity,
      sleepEnergy: Math.round(slept.energy - state.needs.energy),
      sleepHunger: Math.round(state.needs.hunger - slept.hunger),
      energyFull: state.needs.energy >= maxEnergy,
      fills: slept.energy >= maxEnergy,
      hours: hours,
    };
  }
  if (activity.desk) {
    let deskLevel = furnitureLevel(state, "desk");
    return deskLevel
      ? {
          ...activity,
          gives: {
            knowledge: HOME_SLOT_EFFECTS.desk(deskLevel).study,
          },
        }
      : null;
  }
  if (activity.slot) {
    let level = homeFurnitureSlots(state).includes(activity.slot) ? furnitureLevel(state, activity.slot) : 0;
    if (!level) {
      return null;
    }
    let effect = HOME_SLOT_EFFECTS[activity.slot](level);
    return {
      ...activity,
      ...(effect.name
        ? {
            name: effect.name,
          }
        : {}),
      ...(effect.minutes
        ? {
            minutes: effect.minutes,
          }
        : {}),
      ...(effect.rest
        ? {
            restEnergy: effect.rest,
          }
        : {}),
      ...(effect.study
        ? {
            gives: {
              knowledge: effect.study,
            },
          }
        : effect.train
          ? {
              gives: {
                fitness: effect.train,
              },
            }
          : {}),
    };
  }
  if (activity.id === "rest" && state.at === "home" && homeFurnitureSlots(state).includes("sofa")) {
    let sofaLevel = furnitureLevel(state, "sofa");
    return {
      ...activity,
      restEnergy: sofaLevel ? HOME_SLOT_EFFECTS.sofa(sofaLevel).rest : 6,
      name: sofaLevel ? "Rest on the sofa" : "Rest on the floor",
    };
  }
  return activity;
}
var readingGainFor = (state, book) => book.read * SKILL_PERKS.readingMultiplier(skillLevelsOf(state).knowledge);
var bookSkillOf = (book) => book?.skill ?? "knowledge";
var cookingLevelOf = (state) => skillLevelsOf(state).cooking ?? 0;
var recipesAvailable = (state, atHome = state.at === "home") =>
  listRecipesForKitchen(state.things, {
    kitchen: furnitureLevel(state, "kitchen"),
    atHome: atHome,
    level: cookingLevelOf(state),
  });
var CHEF_KITCHEN_BONUS = {
  level: 3,
  burnt: 0.5,
  great: 0.15,
};
function rollDishQuality(state, recipeId) {
  let level = cookingLevelOf(state),
    chefKitchen = furnitureLevel(state, "kitchen") >= CHEF_KITCHEN_BONUS.level,
    burntChance = SKILL_PERKS.burntChance(level) * (chefKitchen ? CHEF_KITCHEN_BONUS.burnt : 1),
    greatChance = Math.min(0.9, SKILL_PERKS.greatChance(level) + (chefKitchen ? CHEF_KITCHEN_BONUS.great : 0)),
    roll = seededRandom(state.seed, "cook", recipeId, String(state.minutes));
  return roll < burntChance ? "burnt" : roll >= 1 - greatChance ? "great" : "fine";
}
function cookingHandOf(state, characterId) {
  let tastes = characterOf(state, characterId)?.tastes;
  return tastes?.loves?.includes("cooking")
    ? 3
    : tastes?.likes?.includes("cooking")
      ? 2
      : (traitsOf(state, characterId)?.dials?.caring ?? 0) >= 8
        ? 1
        : 0;
}
var COOKING_HANDS = {
  1: {
    level: 4,
    burnt: 0.1,
    great: 0.2,
  },
  2: {
    level: 6,
    burnt: 0.05,
    great: 0.4,
  },
  3: {
    level: 9,
    burnt: 0,
    great: 0.65,
  },
};
function theirDish(state, characterId, { likes = null, dislikes = null, salt = "", atYours = false } = {}) {
  let hand = COOKING_HANDS[cookingHandOf(state, characterId)] ?? COOKING_HANDS[1],
    kitchenRecipes = atYours
      ? listRecipesForKitchen(state.things, {
          kitchen: furnitureLevel(state, "kitchen"),
          atHome: true,
          level: hand.level,
        }).filter((recipe2) => recipe2.available)
      : null;
  if (atYours && !kitchenRecipes.length) {
    return null;
  }
  let pool = kitchenRecipes ?? RECIPES.filter((recipe2) => recipe2.level <= hand.level),
    liked = pool.filter((recipe2) => recipe2.taste === likes),
    ranked = (liked.length ? liked : pool.filter((first) => first.taste !== dislikes)).sort(
      (first, second) => second.level - first.level,
    ),
    recipe = ranked[seededRandom(state.seed, "their-dish", characterId, salt) < 0.7 ? 0 : 1] ?? ranked[0] ?? pool[0],
    roll = seededRandom(state.seed, "their-dish-came-out", characterId, salt),
    quality = roll < hand.burnt ? "burnt" : roll >= 1 - hand.great ? "great" : "fine",
    take = atYours
      ? prepareRecipeCooking(state.things, recipe.id, {
          kitchen: furnitureLevel(state, "kitchen"),
          atHome: true,
          level: hand.level,
        }).take
      : null;
  return {
    recipe: recipe,
    quality: quality,
    dish: dishItemFor(recipe, quality),
    ...(take
      ? {
          take: take,
        }
      : {}),
  };
}
function eatDish(state, dish) {
  state.needs = refillNeeds(state.needs, {
    ...dish.eat,
    fitness: skillLevelsOf(state).fitness,
  });
  if (dish.wellFed) {
    state.wellFedUntil = Math.max(state.wellFedUntil ?? 0, state.minutes + dish.wellFed * 60);
  }
}
function planCookFor(state, recipeId, { minutesLeft = 1 / 0 } = {}) {
  let prep = prepareRecipeCooking(state.things, recipeId, {
    kitchen: furnitureLevel(state, "kitchen"),
    atHome: state.at === "home",
    level: cookingLevelOf(state),
  });
  return prep.ok
    ? prep.recipe.minutes > minutesLeft
      ? {
          ok: false,
          reason: "Not enough time for that one.",
        }
      : {
          ok: true,
          recipe: prep.recipe,
          quality: rollDishQuality(state, prep.recipe.id),
          take: prep.take,
        }
    : prep;
}
function serveCookedDish(state, recipe, quality, { eaters = 1 } = {}) {
  let youEat = recipe.portions >= eaters + 1,
    keptPortions = Math.max(0, recipe.portions - eaters - (youEat ? 1 : 0)),
    dish = keptPortions
      ? cookDishIntoFridge(state.things, recipe, quality, keptPortions)
      : dishItemFor(recipe, quality);
  if (youEat) {
    eatDish(state, dish);
  }
  let levelled = addSkillXp(state.skills, {
    cooking: COOKING_XP_BY_QUALITY[quality],
  });
  return {
    dish: dish,
    youEat: youEat,
    kept: keptPortions,
    levelled: levelled,
  };
}
function packTheirDish(state, recipe, quality) {
  let dish = dishItemFor(recipe, quality);
  state.things.known = {
    ...(state.things.known ?? {}),
    [dish.id]: dish,
  };
  return addToPiles(state.things.bag, dish.id, 1, DISH_FRESH_DAYS * 24 * 60, {
    max: BAG_STACK_MAX,
    slots: BAG_SLOTS,
  })
    ? null
    : dish;
}
function noBookWords(state) {
  let library = townPlace(state.town, "library"),
    giftShop = townPlace(state.town, "gift-shop"),
    mall = townPlace(state.town, "mall"),
    options = [
      library ? `borrow one at the ${library.name}` : "",
      giftShop ? `buy one at ${giftShop.name}${mall ? ` in the ${mall.name}` : ""}` : "",
    ]
      .filter(Boolean)
      .join(" or ");
  return options ? `You have no book. ${options[0].toUpperCase()}${options.slice(1)}.` : "You have no book.";
}
function studyActivityDetails(state, activity) {
  if (activity.book) {
    let pick = nextReadablePile(state.things);
    if (!pick) {
      return activity.available
        ? {
            ...activity,
            available: false,
            why: noBookWords(state),
          }
        : activity;
    }
    let pile = state.things[pick.list][pick.index],
      book = itemDef(state.things, pile.item),
      readsLeftCount = readsLeft(state.things, pile);
    return {
      ...activity,
      gives: {
        [bookSkillOf(book)]: readingGainFor(state, book),
      },
      bookPick: pick,
      bookName: `${book.icon} ${book.name} \xB7 ${readsLeftCount === 1 / 0 ? `back ${loanDueLabel(pile, state.minutes)}` : `${readsLeftCount} ${readsLeftCount === 1 ? "read" : "reads"} left`}`,
    };
  }
  if (activity.borrow && activity.available) {
    let borrowed = borrowedLibraryBook(state.things);
    return borrowed
      ? {
          ...activity,
          available: false,
          why: `You still have the one you borrowed. It goes back ${loanDueLabel(borrowed, state.minutes)}.`,
        }
      : state.things.bag.length >= BAG_SLOTS
        ? {
            ...activity,
            available: false,
            why: "Your backpack is full.",
          }
        : {
            ...activity,
            lends: LIBRARY_LOAN_DAYS,
          };
  }
  if (activity.upTo) {
    let levels = skillLevelsOf(state),
      ceiling = Object.entries(activity.upTo).map(([skill, cap]) => ({
        skill: skill,
        level: cap,
        past: (levels[skill] ?? 0) >= cap,
      })),
      maxedSkills = new Set(ceiling.filter((row) => row.past).map((row) => row.skill));
    return {
      ...activity,
      ceiling: ceiling,
      gives: Object.fromEntries(Object.entries(activity.gives ?? {}).filter(([skill]) => !maxedSkills.has(skill))),
    };
  }
  return activity;
}
function readBook(state, list, index, { activity = null } = {}) {
  let atHome = state.at === "home",
    reading = startReading(state.things, list, Number(index), {
      atHome: atHome,
    });
  if (!reading.ok) {
    return reading;
  }
  let closingReason = atHome ? "" : closingWhy(state, reading.minutes);
  if (closingReason) {
    return {
      ok: false,
      reason: closingReason,
    };
  }
  let energyCheck = checkEnergyFor(state.needs, {
    energy: reading.energy,
  });
  if (!energyCheck.ok) {
    return {
      ok: false,
      reason: energyCheck.reason,
    };
  }
  let levels = skillLevelsOf(state),
    gains = {
      [bookSkillOf(reading.item)]: readingGainFor(state, reading.item),
    },
    { finished: finished } = reading.take(),
    { events: events } = advanceTime(state, reading.minutes);
  if (hasFaintedEvent(events)) {
    return {
      ok: true,
      did: "read",
      name: reading.item.name,
      activity: activity ?? {
        id: "read",
        name: `Read ${reading.item.name}`,
        minutes: reading.minutes,
      },
      minutes: reading.minutes,
      gains: {},
      levelled: [],
      needs: state.needs,
      events: events,
      fainted: true,
    };
  }
  state.needs = drainNeeds(state.needs, 0, {
    extraEnergy: reading.energy,
    fitness: levels.fitness,
  });
  events.push(...collapseIfSpent(state));
  if (finished) {
    events.push({
      id: "book-finished",
      text: `You finished the ${reading.item.name.toLowerCase()}.`,
    });
  }
  let levelled = addSkillXp(state.skills, gains);
  logNote(state, `Read ${reading.item.name} (${reading.minutes} min)`, "activity");
  return {
    ok: true,
    did: "read",
    name: reading.item.name,
    activity: activity ?? {
      id: "read",
      name: `Read ${reading.item.name}`,
      minutes: reading.minutes,
    },
    minutes: reading.minutes,
    gains: gains,
    levelled: levelled,
    needs: state.needs,
    events: events,
  };
}
var seasonNow = (state) => seasonKeyAt(state.minutes);
function shopFor(state, mode = "store") {
  let shopPlace = SHOP_PLACES.includes(state.at) ? state.at : null;
  if (mode === "store") {
    if (!shopPlace) {
      return {
        ok: false,
        reason: "There is no shop here.",
      };
    }
    if (!isPlaceOpen(townPlace(state.town, shopPlace), state.minutes)) {
      return {
        ok: false,
        reason: `${townPlace(state.town, shopPlace)?.name ?? "The shop"} is closed.`,
      };
    }
  }
  let discount = mode === "store" ? discountHere(state).off : 0,
    catalog = buildShopCatalog(state.things, {
      mode: mode,
      homeSlots: homeFurnitureSlots(state),
      season: seasonNow(state),
      place: shopPlace ?? "market",
      pics: isClothesRuleOn(state) ? (state.clothes.pics ?? {}) : {},
      off: discount,
      wedding: !!state.wedding,
      luxury: isLuxuryHome(state),
    }),
    showArchetypes = state.rules?.showArchetypes ?? "found",
    metCast = state.characters.filter((character) => hasMet2(state, character.id));
  for (let item of catalog.tabs.flatMap((tab) => tab.items)) {
    for (let character of item.tags?.length ? metCast : []) {
      let verdict = knownGiftVerdict(character, state.bonds[character.id], item.tags[0], showArchetypes);
      if (verdict === "loved" || verdict === "liked") {
        item.chips.push({
          kind: "likes",
          text: `${character.name} ${verdict === "loved" ? "loves" : "likes"} this`,
        });
      } else if (verdict === "disliked") {
        item.chips.push({
          kind: "dis",
          text: `${character.name} didn't like it`,
        });
      }
    }
  }
  let ringsTab = catalog.tabs.find((tab) => tab.id === "rings");
  if (ringsTab) {
    let chips = ringChips(state);
    for (let item of ringsTab.items) {
      item.chips.push(...chips);
    }
  }
  let bagFit = bagFitCheck(state.things, []),
    delivers = mode === "online" || catalog.place === "furniture";
  return {
    ok: true,
    ...catalog,
    cash: state.wallet.cash,
    bag: {
      used: bagFit.used,
      slots: bagFit.slots,
      piles: state.things.bag.map((pile) => ({
        item: pile.item,
        n: pile.n,
        left: pile.left,
      })),
    },
    deliveryAt: mode === "online" ? nextOnlineDeliveryAt(state.minutes) : nextStoreDeliveryAt(state.minutes),
    delivers: delivers,
    where: mode === "store" ? shopPlace : null,
    place: mode === "store" ? (townPlace(state.town, shopPlace)?.name ?? "Supermarket") : null,
  };
}
function buyShopItems(state, cart, { mode = "store", sendHome = false } = {}) {
  if ((sendHome || mode === "online") && (state.lodging || !state.residence)) {
    return {
      ok: false,
      reason: "You have no home to send it to.",
    };
  }
  let shop = shopFor(state, mode);
  if (!shop.ok) {
    return shop;
  }
  if (mode === "store") {
    let closingReason = closingWhy(state, SHOP_BROWSE_MINUTES);
    if (closingReason) {
      return {
        ok: false,
        reason: closingReason,
      };
    }
  }
  let checkout = checkoutShopCart(state.things, cart, {
    mode: mode,
    cash: state.wallet.cash,
    homeSlots: homeFurnitureSlots(state),
    season: seasonNow(state),
    minutes: state.minutes,
    sendHome: sendHome,
    place: shop.where ?? "market",
    off: mode === "store" ? discountHere(state).off : 0,
    wedding: !!state.wedding,
    luxury: isLuxuryHome(state),
  });
  if (!checkout.ok) {
    return checkout;
  }
  let payment = spendMoney(
    state.wallet,
    checkout.total,
    mode === "online" ? "Online order" : "Shopping",
    state.minutes,
  );
  if (!payment.ok) {
    return {
      ok: false,
      reason: payment.reason,
    };
  }
  let applied = applyShopPurchase(state.things, checkout),
    summary = checkout.lines
      .map((line) => `${itemDef(state.things, line.id)?.name ?? line.id}${line.n > 1 ? ` \xD7${line.n}` : ""}`)
      .join(", ");
  logNote(state, `${mode === "online" ? "Ordered" : "Bought"} ${summary} ($${checkout.total})`, "money");
  let { events: events } =
    mode === "store"
      ? advanceTime(state, SHOP_BROWSE_MINUTES)
      : {
          events: [],
        };
  return {
    ok: true,
    total: checkout.total,
    online: mode === "online",
    tonight: !!checkout.tonight,
    at: checkout.at ?? null,
    when: checkout.at ? `${clockFromMinutes(checkout.at).weekday} ${formatClockTime(checkout.at)}` : "",
    sentHome: applied.sentHome ?? [],
    minutes: mode === "store" ? SHOP_BROWSE_MINUTES : 0,
    events: events,
  };
}
function thingsView(state) {
  let atHome = state.at === "home";
  return {
    ...buildInventoryView(state.things, {
      atHome: atHome,
      wearing: state.wearing,
      homeSlots: homeFurnitureSlots(state),
      minutes: state.minutes,
      clothes: isClothesRuleOn(state)
        ? {
            own: personaAvatar(state),
            pics: state.clothes.pics ?? {},
            failed: state.clothes.failed ?? {},
          }
        : null,
    }),
    kitchen: furnitureLevel(state, "kitchen"),
    recipes: recipesAvailable(state, atHome),
    cooking: cookingLevelOf(state),
    cookingNow: {
      ...skillLevelInfo(state.skills.cooking ?? 0),
      burnt: SKILL_PERKS.burntChance(cookingLevelOf(state)),
      great: SKILL_PERKS.greatChance(cookingLevelOf(state)),
    },
    wearingName: wearingItem(state)?.name ?? "",
    clothes: isClothesRuleOn(state),
    place: atHome ? "Home" : (townPlace(state.town, state.at)?.name ?? ""),
  };
}
function useThing(
  state,
  { action: action, list: list, index: index, recipe: recipe, item: item, n: count = null } = {},
) {
  if (state.scene && !state.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  let atHome = state.at === "home",
    levels = skillLevelsOf(state),
    pileIndex = Number(index);
  if (action === "throw") {
    if (isHomeStorageList(list) && !atHome) {
      return {
        ok: false,
        reason: "That is at home.",
      };
    }
    let result = throwAwayFromPile(state.things, list, pileIndex, count);
    if (result.ok) {
      logNote(state, `Threw away ${itemDef(state.things, result.pile.item)?.name ?? result.pile.item}`, "things");
    }
    return {
      ...result,
      minutes: 0,
      events: [],
    };
  }
  if (action === "move") {
    return {
      ...movePileBetweenBagAndHome(state.things, list, pileIndex, {
        atHome: atHome,
        n: count,
      }),
      minutes: 0,
      events: [],
    };
  }
  if (action === "eat") {
    let check = checkEatFromPile(state.things, list, pileIndex, {
      atHome: atHome,
    });
    if (!check.ok) {
      return check;
    }
    let closingReason = state.at === "home" ? "" : closingWhy(state, check.minutes);
    if (closingReason) {
      return {
        ok: false,
        reason: closingReason,
      };
    }
    check.take();
    let { events: events } = advanceTime(state, check.minutes);
    state.needs = refillNeeds(state.needs, {
      ...check.eat,
      fitness: levels.fitness,
    });
    if (check.item.wellFed) {
      state.wellFedUntil = Math.max(state.wellFedUntil ?? 0, state.minutes + check.item.wellFed * 60);
    }
    logNote(state, `Ate ${check.item.name}`, "things");
    return {
      ok: true,
      did: "eat",
      name: check.item.name,
      gains: check.eat,
      minutes: check.minutes,
      events: events,
      ...(check.item.wellFed
        ? {
            wellFed: check.item.wellFed,
          }
        : {}),
    };
  }
  if (action === "read") {
    return readBook(state, list, pileIndex);
  }
  if (action === "cook") {
    let prep = prepareRecipeCooking(state.things, recipe, {
      kitchen: furnitureLevel(state, "kitchen"),
      atHome: atHome,
      level: cookingLevelOf(state),
    });
    if (!prep.ok) {
      return prep;
    }
    let energyCheck = checkEnergyFor(state.needs, {
      energy: 0,
    });
    if (!energyCheck.ok) {
      return {
        ok: false,
        reason: energyCheck.reason,
      };
    }
    let quality = rollDishQuality(state, prep.recipe.id),
      { events: events } = advanceTime(state, prep.recipe.minutes);
    if (hasFaintedEvent(events)) {
      return {
        ok: true,
        did: "cook",
        name: prep.recipe.name,
        gains: {},
        levelled: [],
        minutes: prep.recipe.minutes,
        events: events,
        fainted: true,
      };
    }
    prep.take();
    let dish = cookDishIntoFridge(state.things, prep.recipe, quality),
      levelled = addSkillXp(state.skills, {
        cooking: COOKING_XP_BY_QUALITY[quality],
      });
    logNote(
      state,
      `Cooked ${dish.name} (${prep.recipe.portions} ${prep.recipe.portions === 1 ? "portion" : "portions"})`,
      "things",
    );
    return {
      ok: true,
      did: "cook",
      name: dish.name,
      recipe: prep.recipe.id,
      quality: quality,
      dish: dish.id,
      portions: prep.recipe.portions,
      eat: dish.eat,
      wellFed: dish.wellFed ?? 0,
      gains: {
        cooking: COOKING_XP_BY_QUALITY[quality],
      },
      levelled: levelled,
      minutes: prep.recipe.minutes,
      events: events,
    };
  }
  if (action === "wear") {
    let check = checkChangeClothes(state.things, item, {
      atHome: atHome || isClothesStore(state.at),
      wearing: state.wearing,
    });
    if (!check.ok) {
      return check;
    }
    let { events: events } = advanceTime(state, CHANGE_CLOTHES_MINUTES);
    return hasFaintedEvent(events)
      ? {
          ok: true,
          did: "wear",
          name: check.item?.name ?? item,
          minutes: CHANGE_CLOTHES_MINUTES,
          events: events,
          fainted: true,
        }
      : ((state.wearing = item),
        logNote(state, `Changed into ${check.item?.name ?? item}`, "things"),
        {
          ok: true,
          did: "wear",
          name: check.item?.name ?? item,
          minutes: CHANGE_CLOTHES_MINUTES,
          events: events,
        });
  }
  return {
    ok: false,
    reason: "That is not something you can do with it.",
  };
}

export {
  CHEF_KITCHEN_BONUS,
  COOKING_HANDS,
  buyShopItems,
  cookingHandOf,
  cookingLevelOf,
  eatDish,
  homeActivityDetails,
  packTheirDish,
  planCookFor,
  readBook,
  recipesAvailable,
  rollDishQuality,
  seasonNow,
  serveCookedDish,
  shopFor,
  studyActivityDetails,
  theirDish,
  thingsView,
  useThing,
};
