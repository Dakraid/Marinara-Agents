// Home kinds (apartment, house, luxury, mansion) with rent, price, slots and mortgage terms
import { homeKindOf } from "../money/wallet.mjs";

var BASE_HOME_SLOTS = ["bed", "kitchen", "desk", "sofa", "tv", "bath"];
var HOUSE_SLOTS = [...BASE_HOME_SLOTS, "console", "garden", "garage"];
var LUXURY_FLAT_SLOTS = [...BASE_HOME_SLOTS, "console", "garage", "gym", "bar"];
var MANSION_SLOTS = [...BASE_HOME_SLOTS, "console", "garden", "garage", "gym", "bar", "pool"];
var HOME_KINDS = {
  apartment: {
    id: "apartment",
    name: "Apartment",
    rent: 650,
    price: 8e3,
    upkeep: 80,
    guests: 4,
    rooms: 1,
    beds: 1,
    bedQuality: 0.7,
    where: "apartments",
    slots: BASE_HOME_SLOTS,
  },
  house: {
    id: "house",
    name: "House",
    rent: 1100,
    price: 14e3,
    upkeep: 150,
    guests: 8,
    rooms: 2,
    beds: 2,
    bedQuality: 1,
    where: "houses",
    slots: HOUSE_SLOTS,
  },
  luxury: {
    id: "luxury",
    name: "Luxury apartment",
    rent: 2400,
    price: 32e3,
    upkeep: 400,
    guests: 8,
    rooms: 2,
    beds: 2,
    bedQuality: 1.1,
    where: "tower",
    slots: LUXURY_FLAT_SLOTS,
    luxury: true,
  },
  mansion: {
    id: "mansion",
    name: "Mansion",
    rent: 3800,
    price: 55e3,
    upkeep: 700,
    guests: 15,
    rooms: 4,
    beds: 4,
    bedQuality: 1.2,
    where: "mansions",
    slots: MANSION_SLOTS,
    luxury: true,
  },
};
var MORTGAGE_TERMS = {
  down: 0.2,
  seasons: 12,
  interest: 0.1,
};
var HOME_RESALE_SHARE = 0.9;
function mortgageQuoteFor(homeKind) {
  let kind = homeKindOf(homeKind),
    down = Math.round(kind.price * MORTGAGE_TERMS.down),
    total = Math.round((kind.price - down) * (1 + MORTGAGE_TERMS.interest));
  return {
    down: down,
    total: total,
    payment: Math.ceil(total / MORTGAGE_TERMS.seasons),
    seasons: MORTGAGE_TERMS.seasons,
  };
}

export { HOME_KINDS, HOME_RESALE_SHARE, MORTGAGE_TERMS, mortgageQuoteFor };
