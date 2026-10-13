// Assigning residences, building directories and free units
import { RESIDENCE_PLACES, isHousePlace } from "./residence-places.mjs";
import { apartmentUnitNumber, residenceForHomeKind, validResidencePlace } from "./residence-units.mjs";

var TOWER_FIRST_FLOOR = 20;
var apartmentUnitFor = (place, index) => apartmentUnitNumber(index, place === "tower" ? TOWER_FIRST_FLOOR : 1);
var houseNumberFor = (index) => `N\xBA ${2 * index}`;
var residencePromptLine = (where) =>
  where
    ? `Where they live: ${where}. That is how it is now: whatever their description says about looking for a place, moving out or having nowhere to live is behind them.`
    : "";
function assignResidences({ home = "studio", cast = [], roommate = null, housemates = [] } = {}) {
  let sharesHome = new Set([...housemates, ...(roommate && home === "shared" ? [roommate] : [])]),
    counters = Object.fromEntries(RESIDENCE_PLACES.map((place) => [place, 0])),
    nextUnit = (place) =>
      isHousePlace(place) ? houseNumberFor(++counters[place]) : apartmentUnitFor(place, ++counters[place]),
    playerPlace = residenceForHomeKind(home),
    player = {
      place: playerPlace,
      unit: nextUnit(playerPlace),
    },
    byId = {};
  for (let member of cast) {
    if (sharesHome.has(member.id)) {
      byId[member.id] = {
        place: player.place,
        unit: player.unit,
        withYou: true,
        from: validResidencePlace(member.livesIn) ?? "apartments",
      };
      continue;
    }
    let place = validResidencePlace(member.livesIn) ?? "apartments";
    byId[member.id] = {
      place: place,
      unit: nextUnit(place),
    };
  }
  return {
    player: player,
    byId: byId,
  };
}
function buildResidenceDirectory(
  place,
  { player: player, characters = [], inNow = [], youAreIn = false, name: buildingName = "" } = {},
) {
  let inNowSet = new Set(inNow),
    doors = new Map(),
    doorFor = (unit) =>
      doors.get(unit) ??
      doors
        .set(unit, {
          unit: unit,
          residents: [],
          inNow: [],
          mine: false,
          stranger: false,
        })
        .get(unit);
  if (player?.place === place) {
    let door = doorFor(player.unit);
    door.mine = true;
    door.residents.push({
      id: "you",
      name: "You",
    });
    if (youAreIn) {
      door.inNow.push("you");
    }
  }
  for (let character of characters) {
    let residence = character.residence;
    if (residence?.place !== place) {
      continue;
    }
    let door = doorFor(residence.unit);
    door.residents.push({
      id: character.id,
      name: character.name,
      bang: !!character.bang,
      met: character.met !== false,
      avatar: character.avatar ?? null,
      face: character.face ?? null,
    });
    if (inNowSet.has(character.id)) {
      door.inNow.push(character.id);
    }
  }
  let occupied = doors.size,
    target = isHousePlace(place) ? occupied + 2 : Math.ceil((occupied + 2) / 4) * 4,
    taken = new Set(doors.keys());
  for (let index = 1; doors.size < target && index < target + occupied + 50; index++) {
    let unit = isHousePlace(place) ? houseNumberFor(index) : apartmentUnitFor(place, index);
    if (!taken.has(unit)) {
      doorFor(unit).stranger = true;
    }
  }
  let sorted = [...doors.values()].sort((left, right) => unitSortValue(left.unit) - unitSortValue(right.unit)),
    floors = [];
  for (let door of sorted) {
    let label = isHousePlace(place) ? "" : `${Math.floor(unitSortValue(door.unit) / 100)}F`,
      floor = floors.at(-1);
    if (floor && floor.label === label) {
      floor.doors.push(door);
    } else {
      floors.push({
        label: label,
        doors: [door],
      });
    }
  }
  return {
    place: place,
    name: buildingName,
    floors: floors,
    people: characters.filter((character) => character.residence?.place === place).length,
  };
}
var unitSortValue = (unit) => Number(String(unit).replace(/\D/g, "")) || 0;
function nextFreeUnit(place, taken = []) {
  let takenSet = new Set(taken);
  for (let index = 1; index < 1e3; index++) {
    let unit = isHousePlace(place) ? houseNumberFor(index) : apartmentUnitFor(place, index);
    if (!takenSet.has(unit)) {
      return unit;
    }
  }
  return null;
}

export { assignResidences, buildResidenceDirectory, nextFreeUnit, residencePromptLine };
