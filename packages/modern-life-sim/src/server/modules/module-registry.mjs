// Capability module hook contract, registration, safe hook dispatch, settings and migration
var MODULE_HOOK_DOCS = {
  state: "the state it keeps in life.modules[id] when it is switched on: (life) => object",
  cleanIn: "the state a new life starts with, from the creation's choices: (raw, life) => object | null",
  set: "a change from SETTINGS or the creation: (life, state, patch) => { ok, reason? }",
  migrate: "its own migration, on every read: (state, life) => state",
  view: "what the screens get: (life, state) => object",
  dayTick:
    "once each time the clock crosses into a new day, with the day it lands on (a jump of several days, a sleep over two midnights, calls it once, not once per day): (life, state, dayIndex, events) => void",
  tick: "after any time passes: (life, state, { from, to, asleep, walking }, events) => void (walking: on the way somewhere, not there yet)",
  arrived:
    "you got somewhere on your own (a walk or a drive, a ride you gave), with no outing and no scene open (diseno/club-after-dark-a-la-vista.md): (life, state, { place }, events) => void",
  spans:
    "where a module puts people for a while, after the core's own (plans, guests, meetings win): (life, state) => { characterId: [{ from, to, place, doing }] }",
  castMeet:
    'a meeting two of the cast have today, planned once a day (core/game-meets.mjs): (life, state, meet) => void; meet = { id, day, a, b, kind "stray"|"cast", from, to, place }',
  partyTick:
    "every half hour of a party, yours or theirs (0.3.0): (life, state, party, events) => void; a guest set `party.guests[id].aside = { with, words }` is off somewhere (out of the rooms, `words` on the panel) until the module clears it",
  partyActs:
    "its own moments in the room you are in at a party (diseno/fiesta-vivida.md), shown with the core's: (life, state, { room, here }) => [{ id, label, note, who: [{ id, ok, why, also?: [{ id, ok, why, not: [ids] }] }] }]; `here` is who is up and about in that room (the same list \xABwith whom\xBB uses); `also`: who may come along with that one, `not`: who they cannot be with at the same time; no \xABOn your own\xBB",
  partyActChosen:
    'one of its party moments picked, asked of the module that offered it after the core checked `with` and `also` against what it offered: (life, state, { id, with, also, room }) => { milestone, how, about? } | null; with an object the core opens that scene (beginScene with `how: "party"` and `with: also`), with null nothing happens (\xABNot now.\xBB)',
  specials: "rows of SPECIAL ACTIONS with someone: (life, state, characterId) => { key: row }",
  sheet: "toggles on someone's sheet: (life, state, characterId) => [row]",
  setCharacter: "a toggle of the sheet: (life, state, characterId, key, value) => { ok, reason? }",
  sceneBlocks: "text for the scene prompts: (life, state, scene, character) => { system, user } | null",
  content:
    "the line that replaces \xABnon-explicit\xBB in outings, visits and party moments: (life, state, characterId, { with }) => string | null; `with`: everyone in it besides the player, that one first (review 0.3)",
  pictureGuidance: "a line of direction for a key image: (life, state, scene) => string | null",
  stayWhy:
    'whether you can stay the night at theirs: (life, state, bond, { turnsIn }) => { why } ("" = yes) | undefined (the core decides)',
  factWeight: "what a fact of the network adds to jealousy: (life, state, fact) => number",
  shutTo: "why you cannot go into a place now (thrown out): (life, state, placeId) => string | undefined",
  keepsOut:
    "whether someone of the cast is never taken to one of its places by the core's own ways (the day's detour, a ride you give them, coming to find you there; SonaGate 2-oct: nobody who is not of age): (life, state, placeId, characterId) => boolean",
  places:
    "which of its own places (town.addPlace) are on the map and in ITS PLACES now: (life, state) => [placeId] | undefined (undefined: all of them once every option its catalog marks `required` is set; review 0.3)",
  farewellAsk:
    "a line for the goodbye's short scene (they bring something up): (life, state, characterId) => string | null",
  goodbye:
    "options of a date's goodbye: (life, state, outing) => [option] (one with `ask`: theirs, in place of the rest)",
  goodbyeWords:
    "what the goodbye tells the model happened, for a module's choice: (life, state, choice) => string | null",
  goodbyeChosen:
    "a goodbye was chosen (what it does before the date is settled): (life, state, choice, outing) => void",
  stayHere:
    "staying the night with them right where you are, not on a visit: (life, state, characterId) => { place, words } | null",
  tonight: "more ways for the proposal's night to end: (life, state, scene) => [{ id, label, note, chips }]",
  tonightChosen:
    "one of its ways picked: (life, state, scene, choice) => { line, next: { milestone, how, label } } | null",
  weddingNight:
    "the night after the wedding, before the morning: (life, state, characterId) => { milestone, how } | null",
  tripNight: "a night of the honeymoon, after the day's moment: (life, state, outing) => [{ id, label, note }] | null",
  tripNightChosen:
    "one of its ways picked: (life, state, outing, choice) => { milestone, how } | null (null: just sleep)",
  extraOf:
    "someone who is not of the cast, by id (an NPC of the module): (life, state, id) => the live object | null (null too for one it set aside); only asked with the NPCs rule on (game.npcsOn)",
  isNpc:
    "whether an id is one of its NPCs, found or set aside, rule on or off (by its id, never by extraOf): (life, state, id) => boolean",
  extraName:
    "what to call one of its NPCs who is set aside (the rule off, or set aside by the module), where a name is printed: (life, state, id) => string | null (the core says \xABsomeone\xBB)",
  hasNpcs:
    "for a life from before the NPCs rule (save.migrate): whether it has, or will have, NPCs of this module: (life, state) => boolean",
  activities: "more things to do where you are: (life, state) => [activity] (one with `route` opens its own scene)",
  backdrops: "the backgrounds this life asks for besides the core's (subjects): (life, state) => [subject]",
  backdropHere:
    "the background of where you stand now, over the place's (a scene somewhere of its own): (life, state) => subject | null",
  freeActs:
    "acts and claims the player may do in words: (life, state, scene) => { acts: { id: { says, how, why, take } }, claims: [ids] } | null",
  freeJump: "an act that goes to its call: (life, state, plan, did, scene) => { milestone, about, act } | null",
  freeApply: "what a module act or claim did: (life, state, f, did) => void",
  owns: "whether a scene is this module's: (scene) => boolean",
  sceneReply: "the player's words in its own scene: async (kit, life, state, answer) => answer | undefined",
  sceneDecide: "the player's call in its own scene: async (kit, life, state, choice) => answer | undefined",
  sceneEnd: "END SCENE in its own scene: async (kit, life, state) => answer | undefined",
  faintMemory:
    "you collapsed in its own scene (diseno/desmayo-recuerdo.md), asked of the scene's module only: (life, state, scene) => null (nothing is kept, no call) | undefined (the core's own) | string (what the scene was, a line for the prompt) | { line, each } (each: true, the others in it write their own too, remember_each)",
  faintKept:
    "what they keep of its scene you collapsed in, once kept: (life, state, scene, { remember, each }) => void (each: { id: text }; its own NPCs, by extraOf)",
  background: "calls it makes for the open life, in the background: async (kit, life) => void",
  cardFields: "fields for the card's reading, in the same call: (life, state) => [{ key, shape, rule, clean }]",
  castRead: "what the reading gave, when the cast is made or added to: (life, state, entries) => void",
  cardReread:
    "UPDATE FROM THE CARD, after the core's own reread: (life, state, characterId) => void (what it read of them, to read again)",
  jobWhy: `why someone may not have a job (SETTINGS \xB7 CAST, the card's reading): (life, state, characterId, job { id, place, title }) => string ("" or nothing = they may)`,
  routes: 'its own routes, under /lives/:id/mod/<id>/: (kit) => { "POST name": handler }',
  guide: "its articles for the GUIDE: (life, state) => { categories: [{ id, name }], articles: [...] }",
  changelog: `its lines for each version closed for a PR, as the core's are written: { "0.2.0": [line] }`,
  catalog:
    "how the Modules group shows it: { name, about, confirm?, options: [...] } (confirm: an extra line for the one switch-on confirmation)",
  covered: "its decisions for free text (freeplay.COVERED): { kind: { id: why } }",
};
var MODULE_ID_PATTERN = /^[a-z][a-z0-9-]{1,30}$/;
var registeredModules = [];
var modulesEnabled = true;
function registerModule(mod) {
  if (!mod || typeof mod != "object") {
    throw new Error("A module has to be an object.");
  }
  if (!MODULE_ID_PATTERN.test(mod.id ?? "")) {
    throw new Error(`A module needs an id of lowercase letters: ${mod.id}.`);
  }
  if (registeredModules.some((registered) => registered.id === mod.id)) {
    throw new Error(`The module ${mod.id} is registered twice.`);
  }
  if (!mod.catalog?.name || !mod.catalog?.about) {
    throw new Error(`The module ${mod.id} needs a name and a line about it.`);
  }
  for (let key of Object.keys(mod)) {
    if (key !== "id" && !MODULE_HOOK_DOCS[key]) {
      throw new Error(`The module ${mod.id} has \xAB${key}\xBB, which is no hook.`);
    }
  }
  let options = mod.catalog.options ?? [];
  for (let option of options) {
    if (option.needsRule && !MODULE_RULES[option.needsRule]) {
      throw new Error(
        `The module ${mod.id}: \xAB${option.key}\xBB needs a rule the core does not have (${option.needsRule}).`,
      );
    }
    if (option.needsOption && !options.some((other) => other.key === option.needsOption && other !== option)) {
      throw new Error(
        `The module ${mod.id}: \xAB${option.key}\xBB needs an option it does not have (${option.needsOption}).`,
      );
    }
  }
  registeredModules.push(
    Object.freeze({
      ...mod,
    }),
  );
  return mod;
}
var MODULE_RULES = {
  npcs: {
    name: "NPCs",
    unset: true,
  },
};
var withOptionRuleName = (option) =>
  option.needsRule
    ? {
        ...option,
        ruleName: MODULE_RULES[option.needsRule].name,
      }
    : option;
var FINISH_FIRST_REASON = "Finish what you're doing first.";
var moduleToggleBusyReason = (life) => (life?.scene || life?.outing ? FINISH_FIRST_REASON : "");
var lifeRuleOn = (life, rule) =>
  typeof life?.rules?.[rule] == "boolean" ? life.rules[rule] : !!MODULE_RULES[rule]?.unset;
function moduleOptionBlockedReason(options, option, life, values) {
  return option.needsRule && !lifeRuleOn(life, option.needsRule)
    ? `Turn on ${MODULE_RULES[option.needsRule].name} in RULES first.`
    : option.needsOption && !values[option.needsOption]
      ? `Turn on ${options.find((other) => other.key === option.needsOption)?.title ?? "the option it needs"} first.`
      : "";
}
function cascadeModuleOptionsOff(options, current, patch) {
  let values = {
    ...patch,
  };
  for (let changed = true; changed;) {
    changed = false;
    for (let option of options) {
      if (
        option.needsOption &&
        values[option.needsOption] === false &&
        (values[option.key] ?? current?.[option.key]) === true
      ) {
        values[option.key] = false;
        changed = true;
      }
    }
  }
  return values;
}
var modulesInLife = (life) => allModules().filter((mod) => life?.modules?.[mod.id]);
var isModuleNpc = (life, id) =>
  !!id &&
  modulesInLife(life).some((mod) =>
    mod.isNpc
      ? safeModuleCall(mod, "isNpc", () => mod.isNpc(life, moduleState(life, mod.id), id) === true, false)
      : mod.extraOf
        ? safeModuleCall(mod, "extraOf", () => !!mod.extraOf(life, moduleState(life, mod.id), id)?.npc, false)
        : false,
  );
function moduleExtraName(life, id) {
  for (let mod of modulesInLife(life)) {
    let extraName = mod.extraName
      ? safeModuleCall(mod, "extraName", () => mod.extraName(life, moduleState(life, mod.id), id), null)
      : null;
    if (typeof extraName == "string" && extraName.trim()) {
      return extraName.trim();
    }
  }
  return "";
}
function lifeHasModuleNpcs(life) {
  let mods = modulesInLife(life);
  return mods.some((mod) => !mod.hasNpcs)
    ? null
    : mods.some((mod) =>
        safeModuleCall(mod, "hasNpcs", () => mod.hasNpcs(life, moduleState(life, mod.id)) === true, false),
      );
}
var allModules = () => (modulesEnabled ? [...registeredModules] : []);
var moduleById = (id) => allModules().find((mod) => mod.id === id) ?? null;
var moduleCatalog = () =>
  allModules().map((mod) => ({
    id: mod.id,
    ...mod.catalog,
    options: (mod.catalog.options ?? []).map(withOptionRuleName),
  }));
var isModuleOn = (life, id) => modulesEnabled && !!life?.modules?.[id]?.on;
var activeModules = (life) =>
  modulesEnabled && life?.modules ? registeredModules.filter((mod) => life.modules[mod.id]?.on) : [];
var moduleState = (life, id) => life?.modules?.[id] ?? null;
var activeModuleIds = (life) => activeModules(life).map((mod) => mod.id);
var moduleRequiredOptionsSet = (mod, values) =>
  (mod.catalog.options ?? []).every((option) => !option.required || !!values?.[option.key]);
function hiddenModulePlaces(life, places) {
  let hidden = [];
  for (let mod of activeModules(life)) {
    let ownPlaces = (places ?? []).filter((place) => place.module === mod.id).map((place) => place.id);
    if (!ownPlaces.length) {
      continue;
    }
    let state = moduleState(life, mod.id),
      shown = mod.places ? safeModuleCall(mod, "places", () => mod.places(life, state), undefined) : undefined,
      showing = Array.isArray(shown) ? shown : moduleRequiredOptionsSet(mod, state) ? ownPlaces : [];
    hidden.push(...ownPlaces.filter((placeId) => !showing.includes(placeId)));
  }
  return hidden;
}
var reportModuleFailure = () => {};
function setModuleFailureReporter(reporter) {
  reportModuleFailure = typeof reporter == "function" ? reporter : () => {};
}
var GUARDED_MODULE_HOOKS = new Set(["tick", "dayTick", "arrived", "partyTick", "castMeet"]);
function safeModuleCall(mod, hook, call, fallback) {
  try {
    return call();
  } catch (error) {
    try {
      reportModuleFailure(`the module ${mod.id} failed in ${hook}: ${error?.message ?? error}`);
    } catch {
      // Best effort: nothing to do when this fails.
    }
    return fallback;
  }
}
function runModuleHook(life, hook, ...args) {
  for (let mod of activeModules(life)) {
    if (GUARDED_MODULE_HOOKS.has(hook)) {
      safeModuleCall(mod, hook, () => mod[hook]?.(life, moduleState(life, mod.id), ...args));
    } else {
      mod[hook]?.(life, moduleState(life, mod.id), ...args);
    }
  }
}
function collectModuleHook(life, hook, ...args) {
  return activeModules(life)
    .map((mod) => mod[hook]?.(life, moduleState(life, mod.id), ...args))
    .filter((result) => result != null && result !== "");
}
var mergeModuleHook = (life, hook, ...args) =>
  Object.assign({}, ...collectModuleHook(life, hook, ...args).filter((result) => typeof result == "object"));
function moduleKeepsOut(life, placeId, characterId) {
  let moduleId = life?.town?.places?.find((place) => place.id === placeId)?.module,
    mod = moduleId ? activeModules(life).find((candidate) => candidate.id === moduleId) : null;
  return (
    !!mod?.keepsOut &&
    safeModuleCall(
      mod,
      "keepsOut",
      () => mod.keepsOut(life, moduleState(life, mod.id), placeId, characterId) === true,
      true,
    )
  );
}
var firstModuleHook = (life, hook, ...args) => collectModuleHook(life, hook, ...args)[0];
var sumModuleHook = (life, hook, ...args) =>
  collectModuleHook(life, hook, ...args).reduce((sum, value) => sum + (Number(value) || 0), 0);
var moduleCardFields = (life) =>
  activeModules(life).flatMap((mod) =>
    (mod.cardFields?.(life, moduleState(life, mod.id)) ?? []).map((field) => ({
      ...field,
      module: mod.id,
    })),
  );
var moduleOwningScene = (life, scene) =>
  scene ? (activeModules(life).find((mod) => mod.owns?.(scene)) ?? null) : null;
function applyCreationModules(life, choices) {
  if (!(!choices || typeof choices != "object")) {
    for (let mod of allModules()) {
      if (!choices[mod.id]) {
        continue;
      }
      let options = mod.catalog.options ?? [],
        values =
          choices[mod.id] && typeof choices[mod.id] == "object"
            ? {
                ...choices[mod.id],
              }
            : choices[mod.id];
      for (let changed = typeof values == "object"; changed;) {
        changed = false;
        for (let option of options) {
          if (values[option.key] === true && moduleOptionBlockedReason(options, option, life, values)) {
            values[option.key] = false;
            changed = true;
          }
        }
      }
      let state = mod.cleanIn
        ? mod.cleanIn(values, life)
        : {
            on: true,
          };
      if (state?.on) {
        (life.modules ??= {})[mod.id] = {
          ...(mod.state?.(life) ?? {}),
          ...state,
          on: true,
        };
      }
    }
  }
}
var MODULE_LOCKED_REASON = "Once it's on, it stays on in this life.";
function setModuleOptions(life, moduleId, patch = {}) {
  let mod = moduleById(moduleId);
  if (!mod) {
    return {
      ok: false,
      reason: "There is no module like that.",
    };
  }
  let current = life.modules?.[moduleId],
    options = mod.catalog.options ?? [],
    state = current ?? {
      ...(mod.state?.(life) ?? {}),
      on: false,
    },
    patchValues = cascadeModuleOptionsOff(options, state, patch);
  if (
    current?.on &&
    (patchValues.on === false ||
      options.some((option) => option.locks && current[option.key] === true && patchValues[option.key] === false))
  ) {
    return {
      ok: false,
      reason: MODULE_LOCKED_REASON,
    };
  }
  if (
    options.some((option) => option.holdsOff && state[option.key] === true && patchValues[option.key] === false) &&
    moduleToggleBusyReason(life)
  ) {
    return {
      ok: false,
      reason: moduleToggleBusyReason(life),
    };
  }
  let merged = {
    ...state,
    ...patchValues,
  };
  for (let option of options) {
    let blockedReason =
      patchValues[option.key] === true && state[option.key] !== true
        ? moduleOptionBlockedReason(options, option, life, merged)
        : "";
    if (blockedReason) {
      return {
        ok: false,
        reason: blockedReason,
      };
    }
  }
  let result = mod.set
    ? mod.set(life, state, patchValues)
    : typeof patchValues.on == "boolean"
      ? ((state.on = patchValues.on),
        {
          ok: true,
        })
      : {
          ok: false,
          reason: "Nothing to change.",
        };
  return result?.ok
    ? (((life.modules ??= {})[moduleId] = state),
      {
        ok: true,
        state: state,
      })
    : (result ?? {
        ok: false,
        reason: "Nothing changed.",
      });
}
function migrateModules(life) {
  if (!life?.modules) {
    return life;
  }
  for (let mod of allModules()) {
    if (life.modules[mod.id] && mod.migrate) {
      life.modules[mod.id] =
        safeModuleCall(mod, "migrate", () => mod.migrate(life.modules[mod.id], life), null) ?? life.modules[mod.id];
    }
  }
  clearInactiveModuleScenes(life);
  return life;
}
var milestoneOfInactiveModule = (life, milestone) =>
  !!milestone &&
  allModules().some(
    (mod) =>
      mod.owns?.({
        milestone: milestone,
      }) && !isModuleOn(life, mod.id),
  );
function clearInactiveModuleScenes(life) {
  if (allModules().some((mod) => life.modules[mod.id] && !isModuleOn(life, mod.id))) {
    for (let bond of Object.values(life.bonds ?? {})) {
      if (milestoneOfInactiveModule(life, bond?.asks?.id)) {
        bond.asks = null;
      }
    }
    if (life.approach && milestoneOfInactiveModule(life, life.approach.milestone)) {
      life.approach = null;
    }
    if (life.scene && milestoneOfInactiveModule(life, life.scene.milestone)) {
      if (life.afterWedding && life.scene.characterId === life.afterWedding.characterId) {
        life.afterWedding.now = true;
      }
      life.scene = null;
    }
  }
}
function modulesView(life) {
  return Object.fromEntries(
    allModules().map((mod) => [
      mod.id,
      {
        on: isModuleOn(life, mod.id),
        name: mod.catalog.name,
        about: mod.catalog.about,
        confirm: mod.catalog.confirm,
        options: (mod.catalog.options ?? []).map(withOptionRuleName),
        ...(moduleState(life, mod.id) && mod.view
          ? safeModuleCall(mod, "view", () => mod.view(life, moduleState(life, mod.id)), {})
          : {}),
      },
    ]),
  );
}

export {
  activeModuleIds,
  activeModules,
  allModules,
  applyCreationModules,
  collectModuleHook,
  firstModuleHook,
  hiddenModulePlaces,
  isModuleNpc,
  isModuleOn,
  lifeHasModuleNpcs,
  mergeModuleHook,
  migrateModules,
  milestoneOfInactiveModule,
  moduleById,
  moduleCardFields,
  moduleCatalog,
  moduleExtraName,
  moduleKeepsOut,
  moduleOwningScene,
  moduleState,
  moduleToggleBusyReason,
  modulesView,
  registerModule,
  runModuleHook,
  setModuleFailureReporter,
  setModuleOptions,
  sumModuleHook,
};
