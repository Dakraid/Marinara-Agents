// Home kind to residence mapping and unit numbering
import { RESIDENCE_PLACES } from "./residence-places.mjs";

var RESIDENCE_UPGRADE = {
  apartments: "tower",
  houses: "mansions",
  tower: "tower",
  mansions: "mansions",
};
var HOME_KIND_TO_RESIDENCE = {
  apartment: "apartments",
  studio: "apartments",
  shared: "apartments",
  house: "houses",
  luxury: "tower",
  mansion: "mansions",
};
var residenceForHomeKind = (kind) => HOME_KIND_TO_RESIDENCE[kind] ?? "apartments";
var RESIDENCE_TO_HOME_KIND = {
  apartments: "apartment",
  houses: "house",
  tower: "luxury",
  mansions: "mansion",
};
var validResidencePlace = (place) => (RESIDENCE_PLACES.includes(place) ? place : null);
var apartmentUnitNumber = (index, firstFloor) =>
  `${Math.floor((index - 1) / 4) + firstFloor}${String(((index - 1) % 4) + 1).padStart(2, "0")}`;

export { RESIDENCE_TO_HOME_KIND, RESIDENCE_UPGRADE, apartmentUnitNumber, residenceForHomeKind, validResidencePlace };
