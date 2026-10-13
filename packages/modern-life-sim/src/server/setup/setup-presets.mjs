// Saved setup presets: sanitize, name, summarize, reconcile missing refs, build from a life
import { SEASON_NAMES, clockFromMinutes } from "../time/clock.mjs";
import { normalizeStartingRelation } from "../relationships/starting-relations.mjs";
import { moduleById } from "../modules/module-registry.mjs";

var MAX_SETUP_PRESETS = 30;
var PRESET_NAME_MAX_LENGTH = 40;
var PRESET_SETUP_MAX_BYTES = 4e5;
var PRESET_SETUP_KEYS = [
  "name",
  "personaId",
  "home",
  "savings",
  "season",
  "skills",
  "cast",
  "roommate",
  "housemates",
  "off",
  "rules",
  "pairs",
  "show",
  "settings",
  "languageOther",
  "townName",
  "renamed",
  "districtNames",
  "birthday",
  "gender",
  "scenario",
  "step",
  "reached",
  "frame",
  "size",
  "portraitSize",
  "look",
  "pictures",
  "names",
  "modules",
];
var PRESET_CAST_ENTRY_KEYS = [
  "on",
  "main",
  "second",
  "romanceable",
  "castRomance",
  "gender",
  "genderBy",
  "into",
  "intoBy",
  "intoSaid",
  "livesIn",
  "livesBy",
  "settled",
  "rich",
  "knows",
  "kin",
  "tastes",
  "clothesTaste",
  "dateTastes",
  "grid",
  "fromModel",
  "note",
  "why",
  "weekProblem",
  "job",
  "jobTitle",
  "workOutfit",
  "proposed",
  "birthday",
  "birthdayFrom",
  "modules",
  "traits",
  "thing",
  "traitsBy",
  "thingBy",
];
var isPlainPresetObject = (value) => !!value && typeof value == "object" && !Array.isArray(value);
var pickDefinedKeys = (source, keys) =>
  Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));
var jsonByteLength = (value) => JSON.stringify(value).length;
var normalizePresetName = (rawName) =>
  String(rawName ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, PRESET_NAME_MAX_LENGTH);
function sanitizeSetupPreset(preset) {
  if (!isPlainPresetObject(preset)) {
    return null;
  }
  let setup = pickDefinedKeys(preset, PRESET_SETUP_KEYS);
  if (
    ((setup.cast = Object.fromEntries(
      Object.entries(isPlainPresetObject(preset.cast) ? preset.cast : {})
        .filter(([id, entry]) => /^[\w-]{1,80}$/.test(id) && isPlainPresetObject(entry) && entry.on)
        .map(([id, entry]) => [id, pickDefinedKeys(entry, PRESET_CAST_ENTRY_KEYS)]),
    )),
    setup.names !== undefined && !isPlainPresetObject(setup.names) && delete setup.names,
    setup.housemates !== undefined &&
      (setup.housemates = Array.isArray(setup.housemates)
        ? [...new Set(setup.housemates.filter((id) => typeof id == "string" && id in setup.cast))]
        : []),
    typeof setup.name == "string" && (setup.name = setup.name.slice(0, 60)),
    jsonByteLength(setup) > PRESET_SETUP_MAX_BYTES)
  ) {
    for (let entry of Object.values(setup.cast)) {
      delete entry.grid;
      delete entry.fromModel;
    }
  }
  return jsonByteLength(setup) > PRESET_SETUP_MAX_BYTES ? null : setup;
}
function uniquePresetName(rawName, taken) {
  let takenSet = new Set(taken.map((existing) => existing.toLowerCase())),
    base = normalizePresetName(rawName) || "My setup";
  if (!takenSet.has(base.toLowerCase())) {
    return base;
  }
  for (let suffix = 2; ; suffix++) {
    let candidate = `${base.slice(0, PRESET_NAME_MAX_LENGTH - String(suffix).length - 1)} ${suffix}`;
    if (!takenSet.has(candidate.toLowerCase())) {
      return candidate;
    }
  }
}
var summarizeSetupPreset = ({ id: id, name: presetName, at: at, setup: setup }) => {
  let castIds = Object.keys(setup?.cast ?? {});
  return {
    id: id,
    name: presetName,
    at: at,
    persona: setup?.names?.[setup?.personaId] ?? "",
    people: castIds.length,
    face: castIds[0] ?? null,
  };
};
function reconcilePresetWithAvailable(
  preset,
  { personas = null, cards = null, connections = null, imageConnections = null } = {},
) {
  let setup = structuredClone(preset ?? {}),
    names = setup.names ?? {},
    missing = [],
    has = (list, id) => list.some((item) => item.id === id);
  if (
    (personas &&
      setup.personaId &&
      !has(personas, setup.personaId) &&
      (missing.push({
        kind: "persona",
        name: names[setup.personaId] ?? "",
      }),
      (setup.personaId = "")),
    cards)
  ) {
    for (let id of Object.keys(setup.cast ?? {})) {
      if (!has(cards, id)) {
        missing.push({
          kind: "card",
          name: names[id] ?? "",
        });
        delete setup.cast[id];
        if (setup.roommate === id) {
          setup.roommate = "";
        }
        if (Array.isArray(setup.housemates)) {
          setup.housemates = setup.housemates.filter((id2) => id2 !== id);
        }
        for (let key of Object.keys(setup.pairs ?? {})) {
          if (key.split("|").includes(id)) {
            delete setup.pairs[key];
          }
        }
      }
    }
  }
  if (connections && setup.settings?.connection && !has(connections, setup.settings.connection)) {
    missing.push({
      kind: "connection",
      name: names[setup.settings.connection] ?? "",
    });
    setup.settings.connection = "";
  }
  if (imageConnections && setup.look?.connectionId && !has(imageConnections, setup.look.connectionId)) {
    missing.push({
      kind: "images",
      name: names[setup.look.connectionId] ?? "",
    });
    setup.look.connectionId = "";
  }
  return {
    setup: setup,
    missing: missing,
  };
}
function setupPresetFromLife(life, { gridOf = null } = {}) {
  let residence = life.residence ?? null,
    isPartnered = (id) => ["living", "engaged", "married"].includes(life.bonds?.[id]?.status),
    housemates = (life.characters ?? [])
      .filter(
        (character) =>
          !character.away &&
          residence &&
          character.residence &&
          character.residence.place === residence.place &&
          character.residence.unit === residence.unit &&
          (!isPartnered(character.id) || normalizeStartingRelation(character.knows) === "couple"),
      )
      .map((character) => character.id),
    home = ["house", "luxury", "mansion"].includes(life.wallet?.home) ? life.wallet.home : "studio",
    names = {
      [life.persona?.id ?? ""]: life.persona?.name ?? "",
    },
    cast = {};
  for (let character of life.characters ?? []) {
    if (!(!character?.id || character.away)) {
      names[character.id] = character.name ?? "";
      cast[character.id] = {
        on: true,
        proposed: true,
        main: character.archetype?.main ?? "grounded",
        second: character.archetype?.second ?? "",
        romanceable: character.romanceable !== false,
        ...(typeof character.castRomance == "boolean"
          ? {
              castRomance: character.castRomance,
            }
          : {}),
        ...(life.bonds?.[character.id]?.traits
          ? {
              traits: life.bonds[character.id].traits,
            }
          : {}),
        ...(character.theirThing
          ? {
              thing: character.theirThing,
            }
          : {}),
        ...(character.traitsBy
          ? {
              traitsBy: character.traitsBy,
            }
          : {}),
        ...(character.thingBy
          ? {
              thingBy: character.thingBy,
            }
          : {}),
        livesIn: character.residence?.place ?? "apartments",
        livesBy: "you",
        knows: character.knows ?? "no",
        ...(character.kin
          ? {
              kin: character.kin,
            }
          : {}),
        tastes: character.tastes ?? null,
        clothesTaste: character.clothesTaste ?? null,
        dateTastes: character.dateTastes ?? null,
        job: character.job?.id ?? (character.job?.out ? "out" : character.job?.home ? "home" : "none"),
        workOutfit: character.workOutfit ?? "",
        ...(character.job?.home
          ? {
              jobTitle: character.job.title ?? "",
            }
          : {}),
        ...(character.gender
          ? {
              gender: character.gender,
              genderBy: "you",
            }
          : {}),
        into: character.into ?? "both",
        intoBy: "you",
        ...(character.birthday
          ? {
              birthday: {
                season: character.birthday.season,
                day: character.birthday.day,
              },
              birthdayFrom: "card",
            }
          : {}),
        ...(gridOf && character.week
          ? {
              grid: gridOf(character.week),
              fromModel: true,
            }
          : {}),
      };
    }
  }
  let { showArchetypes = "hidden", showSchedules = "found", ...rules } = life.rules ?? {};
  return sanitizeSetupPreset({
    name: life.name,
    personaId: life.persona?.id ?? "",
    gender: life.gender ?? "",
    home: home,
    housemates: housemates,
    savings: "normal",
    season: SEASON_NAMES[clockFromMinutes(life.startedAt ?? life.minutes ?? 0).seasonIndex] ?? "Autumn",
    skills: {
      fitness: 0,
      charm: 0,
      knowledge: 0,
      cooking: 0,
    },
    cast: cast,
    off: [...(life.town?.off ?? [])].reduce(
      (acc, id) => ({
        ...acc,
        [id]: true,
      }),
      {},
    ),
    renamed: {
      ...(life.town?.renamed ?? {}),
    },
    districtNames: {
      ...(life.town?.districtNames ?? {}),
    },
    rules: rules,
    show: {
      showArchetypes: showArchetypes,
      showSchedules: showSchedules,
    },
    pairs: {},
    settings: {
      connection: life.settings?.connection ?? "",
      effort: life.settings?.effort ?? "low",
      language: life.settings?.language ?? "English",
    },
    townName: life.townName ?? "",
    scenario: life.scenario ?? "",
    birthday: life.birthday
      ? {
          season: life.birthday.season,
          day: life.birthday.day,
        }
      : undefined,
    look: life.look
      ? {
          connectionId: life.look.connectionId ?? "",
          styleProfileId: life.look.styleProfileId ?? "",
          tags: life.look.tags ?? "",
        }
      : undefined,
    pictures: {
      ...(life.pictures ?? {}),
    },
    frame: life.frame === "cut" ? "cut" : "framed",
    size: life.pictureSize ?? "16:9",
    portraitSize: life.portraitSize ?? "2:3",
    step: 7,
    reached: 7,
    names: names,
    modules: Object.fromEntries(
      Object.entries(life.modules ?? {})
        .filter(([, entry]) => entry?.on)
        .map(([id, settings]) => {
          let keys = new Set(["on", ...(moduleById(id)?.catalog?.options ?? []).map((option) => option.key)]);
          return [
            id,
            Object.fromEntries(
              Object.entries(settings).filter(
                ([key, value]) => keys.has(key) && ["string", "number", "boolean"].includes(typeof value),
              ),
            ),
          ];
        }),
    ),
  });
}

export {
  MAX_SETUP_PRESETS,
  normalizePresetName,
  reconcilePresetWithAvailable,
  sanitizeSetupPreset,
  setupPresetFromLife,
  summarizeSetupPreset,
  uniquePresetName,
};
