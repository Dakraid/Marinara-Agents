// Recipes, dish qualities and cooked dish items
import { MINUTES_PER_DAY } from "./catalog.mjs";
import { addToPiles } from "./inventory.mjs";

var RECIPES = [
  {
    id: "rice-egg",
    taste: "comfort",
    name: "Rice with egg",
    icon: "\u{1F373}",
    uses: {
      rice: 1,
      eggs: 1,
    },
    level: 0,
    kitchen: 1,
    minutes: 20,
    portions: 1,
    eat: {
      hunger: 40,
      energy: 3,
    },
  },
  {
    id: "omelette",
    taste: "healthy",
    name: "Vegetable omelette",
    icon: "\u{1F95A}",
    uses: {
      eggs: 2,
      vegetables: 1,
    },
    level: 0,
    kitchen: 1,
    minutes: 20,
    portions: 1,
    eat: {
      hunger: 35,
      energy: 5,
    },
  },
  {
    id: "pancakes",
    taste: "sweet",
    name: "Pancakes",
    icon: "\u{1F95E}",
    uses: {
      flour: 1,
      eggs: 1,
    },
    level: 1,
    kitchen: 1,
    minutes: 25,
    portions: 2,
    eat: {
      hunger: 25,
      energy: 4,
    },
    sweet: true,
  },
  {
    id: "fried-rice",
    taste: "savory",
    name: "Fried rice",
    icon: "\u{1F35A}",
    uses: {
      rice: 1,
      vegetables: 1,
      eggs: 1,
    },
    level: 2,
    kitchen: 1,
    minutes: 30,
    portions: 2,
    eat: {
      hunger: 40,
      energy: 4,
    },
  },
  {
    id: "pasta-cheese",
    taste: "comfort",
    name: "Pasta with cheese",
    icon: "\u{1F9C0}",
    uses: {
      pasta: 2,
      cheese: 1,
    },
    level: 2,
    kitchen: 1,
    minutes: 25,
    portions: 2,
    eat: {
      hunger: 40,
      energy: 4,
    },
  },
  {
    id: "soup",
    taste: "healthy",
    name: "Vegetable soup",
    icon: "\u{1F372}",
    uses: {
      vegetables: 2,
    },
    level: 3,
    kitchen: 1,
    minutes: 40,
    portions: 3,
    eat: {
      hunger: 30,
      energy: 5,
    },
  },
  {
    id: "stir-fry",
    taste: "savory",
    name: "Chicken stir-fry",
    icon: "\u{1F958}",
    uses: {
      rice: 1,
      vegetables: 1,
      chicken: 1,
    },
    level: 4,
    kitchen: 2,
    minutes: 40,
    portions: 2,
    eat: {
      hunger: 50,
      energy: 6,
    },
  },
  {
    id: "fish-rice",
    taste: "healthy",
    name: "Grilled fish with rice",
    icon: "\u{1F41F}",
    uses: {
      fish: 1,
      rice: 2,
    },
    level: 5,
    kitchen: 2,
    minutes: 35,
    portions: 2,
    eat: {
      hunger: 50,
      energy: 7,
    },
  },
  {
    id: "curry",
    taste: "spicy",
    name: "Chicken curry",
    icon: "\u{1F35B}",
    uses: {
      chicken: 1,
      rice: 2,
      vegetables: 1,
    },
    level: 6,
    kitchen: 2,
    minutes: 60,
    portions: 4,
    eat: {
      hunger: 45,
      energy: 6,
    },
  },
  {
    id: "lasagna",
    taste: "comfort",
    name: "Lasagna",
    icon: "\u{1F35D}",
    uses: {
      pasta: 2,
      cheese: 2,
      vegetables: 1,
    },
    level: 7,
    kitchen: 2,
    minutes: 90,
    portions: 4,
    eat: {
      hunger: 50,
      energy: 7,
    },
  },
  {
    id: "fruit-tart",
    taste: "sweet",
    name: "Fruit tart",
    icon: "\u{1F967}",
    uses: {
      flour: 2,
      eggs: 1,
      fruit: 2,
    },
    level: 8,
    kitchen: 2,
    minutes: 90,
    portions: 4,
    eat: {
      hunger: 25,
      energy: 6,
    },
    sweet: true,
  },
  {
    id: "roast",
    taste: "fancy",
    name: "Roast chicken dinner",
    icon: "\u{1F357}",
    uses: {
      chicken: 2,
      vegetables: 2,
    },
    level: 9,
    kitchen: 2,
    minutes: 120,
    portions: 4,
    eat: {
      hunger: 60,
      energy: 10,
    },
  },
];
var DISH_QUALITIES = {
  burnt: {
    name: (dishName) => `Burnt ${dishName.toLowerCase()}`,
    hunger: 0.5,
    energy: 0,
  },
  fine: {
    name: (dishName) => dishName,
    hunger: 1,
    energy: 1,
  },
  great: {
    name: (dishName) => `Delicious ${dishName.toLowerCase()}`,
    hunger: 1,
    energy: 1.5,
  },
};
var WELL_FED_HOURS = 4;
var WELL_FED_HUNGER_SLOWDOWN = 0.5;
var DISH_FRESH_DAYS = 2;
var DISH_EAT_MINUTES = 15;
function dishItemFor(recipe, quality = "fine") {
  let qualitySpec = DISH_QUALITIES[quality] ?? DISH_QUALITIES.fine;
  return {
    id: `dish-${recipe.id}-${quality}`,
    name: qualitySpec.name(recipe.name),
    kind: "food",
    icon: recipe.icon,
    price: 0,
    sold: null,
    fresh: DISH_FRESH_DAYS,
    minutes: DISH_EAT_MINUTES,
    eat: {
      hunger: Math.round(recipe.eat.hunger * qualitySpec.hunger),
      ...(recipe.eat.energy * qualitySpec.energy
        ? {
            energy: Math.round(recipe.eat.energy * qualitySpec.energy),
          }
        : {}),
    },
    ...(quality === "great"
      ? {
          wellFed: WELL_FED_HOURS,
        }
      : {}),
    gift: true,
    tags: [recipe.sweet ? "sweets" : "cooking"],
    homemade: {
      recipe: recipe.id,
      quality: quality,
      taste: recipe.taste,
    },
  };
}
function cookDishIntoFridge(things, recipe, quality, portions = recipe.portions) {
  let dish = dishItemFor(recipe, quality);
  things.known = {
    ...(things.known ?? {}),
    [dish.id]: dish,
  };
  addToPiles(things.fridge, dish.id, portions, DISH_FRESH_DAYS * MINUTES_PER_DAY);
  return dish;
}

export {
  DISH_FRESH_DAYS,
  DISH_QUALITIES,
  RECIPES,
  WELL_FED_HOURS,
  WELL_FED_HUNGER_SLOWDOWN,
  cookDishIntoFridge,
  dishItemFor,
};
