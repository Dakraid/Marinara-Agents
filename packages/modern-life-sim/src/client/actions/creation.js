// Creation draft, presets, resources, startLife, card reading
import { emptyDraft, homeOfDraft, languageOf, matesOf, rolledDay, spreadHomes } from "../views/creation.js";
import { modDraftNeeds } from "../views/mods.js";
import { S, act, call, notify } from "../state.js";
import { forgetLife, reviewClothesIfDue } from "./title.js";
import { watchPaint } from "./phone.js";
import { draftPairs, mergePeople } from "./people.js";
import { TAG } from "../element.js";

function freshDraft(resources) {
  const draft = emptyDraft(),
    imageConnection =
      (resources.imageConnections ?? []).find((conn) => conn.isDefault) ?? resources.imageConnections?.[0];
  draft.look = {
    connectionId: imageConnection?.id ?? "",
    styleProfileId: resources.defaultStyleProfile ?? "",
    tags: "",
    mode: imageConnection ? "library" : "none",
  };
  return draft;
}
function restoreDraft(saved, resources) {
  const fresh = freshDraft(resources),
    draft = {
      ...fresh,
      ...saved,
      cast: saved.cast ?? {},
      rules: {
        ...fresh.rules,
        ...saved.rules,
      },
      show: {
        ...fresh.show,
        ...saved.show,
      },
      modules: saved.modules ?? {},
      settings: {
        ...fresh.settings,
        ...saved.settings,
      },
      skills: {
        ...fresh.skills,
        ...saved.skills,
      },
      look:
        saved.look?.connectionId !== undefined
          ? {
              ...fresh.look,
              ...saved.look,
            }
          : fresh.look,
      off: saved.off ?? {},
      renamed: saved.renamed ?? {},
      districtNames: saved.districtNames ?? {},
      pairs: saved.pairs ?? {},
      peek: {
        archetypes: {},
        weeks: {},
      },
      step: saved.step ?? 1,
      reached: saved.reached ?? saved.step ?? 1,
    };
  modDraftNeeds(draft, resources?.modules);
  return draft;
}
const openCreate = () =>
  act(async () => {
    draftReady = false;
    S.modOn = null;
    S.titleSaid = "";
    const [resources, draftRes] = await Promise.all([
      call("/resources"),
      call("/creation/draft").catch(() => ({
        draft: null,
      })),
    ]);
    S.resources = resources;
    S.draft = draftRes.draft
      ? {
          ...restoreDraft(draftRes.draft, resources),
          askResume: true,
        }
      : freshDraft(resources);
    draftSaved = JSON.stringify(draftRes.draft ?? null);
    draftReady = true;
    S.view = "create";
    resourcesAt = Date.now();
    countLibrary();
  });
let draftReady = false;
let draftSaved = "null";
let draftTimer = null;
function setupOf(draft) {
  const resources = S.resources ?? {},
    names = {},
    persona = (resources.personas ?? []).find((persona2) => persona2.id === draft.personaId);
  if (persona) {
    names[persona.id] = persona.name;
  }
  for (const cardId of Object.keys(draft.cast ?? {})) {
    names[cardId] = (resources.cards ?? []).find((card) => card.id === cardId)?.name ?? "";
  }
  const connection = (resources.connections ?? []).find((conn) => conn.id === draft.settings?.connection);
  if (connection) {
    names[connection.id] = connection.name;
  }
  const imageConnection = (resources.imageConnections ?? []).find((conn) => conn.id === draft.look?.connectionId);
  if (imageConnection) {
    names[imageConnection.id] = imageConnection.name;
  }
  return {
    ...draft,
    names: names,
  };
}
function saveDraftNow() {
  clearTimeout(draftTimer);
  draftTimer = null;
  const draft = S.draft;
  if (!draftReady || !draft || draft.adding || S.view !== "create" || S.busy) {
    return;
  }
  const json = JSON.stringify(setupOf(draft));
  if (json !== draftSaved) {
    draftSaved = json;
    call("/creation/draft", {
      method: "POST",
      body: {
        draft: JSON.parse(json),
      },
    }).catch(() => {
      draftSaved = "null";
    });
  }
}
const saveDraftSoon = () => {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(saveDraftNow, 900);
};
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveDraftNow();
  }
});
addEventListener("pagehide", saveDraftNow);
function startOver() {
  S.draft = freshDraft(S.resources);
  S.modOn = null;
  draftSaved = "null";
  call("/creation/draft", {
    method: "POST",
    body: {
      draft: null,
    },
  }).catch(() => {});
  notify();
}
const presetsOpen = () => {
  if (S.draft) {
    S.presets = {
      list: null,
      name: S.draft.name ?? "",
      rename: null,
      renameText: "",
      del: null,
      taken: null,
      error: "",
    };
    S.draft.presetsOpen = true;
    notify();
    call("/creation/presets")
      .then((res) => {
        if (S.presets) {
          S.presets.list = res.presets;
          notify();
        }
      })
      .catch((err) => {
        if (S.presets) {
          S.presets.error = err.message;
          notify();
        }
      });
  }
};
const presetsClose = () => {
  if (S.draft) {
    S.draft.presetsOpen = false;
  }
  S.presets = null;
  notify();
};
async function presetsCall(path, body = null) {
  try {
    const res = await call(
      path,
      body
        ? {
            method: "POST",
            body: body,
          }
        : {},
    );
    if (res.presets && S.presets) {
      S.presets.list = res.presets;
    }
    if (S.presets) {
      S.presets.error = "";
    }
    return res;
  } catch (err) {
    if (S.presets) {
      S.presets.error = err.message;
    }
    return null;
  } finally {
    notify();
  }
}
async function presetSave(replace = false) {
  const presets = S.presets;
  if (!presets) {
    return;
  }
  const res = await presetsCall("/creation/presets", {
    name: presets.name,
    draft: setupOf(S.draft),
    replace: replace,
  });
  if (res) {
    presets.taken = res.taken ?? null;
    notify();
  }
}
async function presetRename(presetId) {
  if (
    (await presetsCall(`/creation/presets/${encodeURIComponent(presetId)}/rename`, {
      name: S.presets?.renameText ?? "",
    })) &&
    S.presets
  ) {
    S.presets.rename = null;
  }
}
async function presetDelete(presetId) {
  if ((await presetsCall(`/creation/presets/${encodeURIComponent(presetId)}/delete`, {})) && S.presets) {
    S.presets.del = null;
  }
}
async function presetLoad(presetId) {
  const res = await presetsCall(`/creation/presets/${encodeURIComponent(presetId)}`);
  if (res) {
    S.draft = {
      ...restoreDraft(res.draft, S.resources),
      ...(res.missing?.length
        ? {
            loadedMissing: {
              name: res.name,
              missing: res.missing,
            },
          }
        : {}),
    };
    for (const mod of Object.values(S.draft.modules ?? {})) {
      delete mod.confirmed;
      if (mod.on) {
        mod.fromPreset = true;
      }
    }
    S.modOn = null;
    S.presets = null;
    saveDraftNow();
    notify();
  }
}
const presetBlank = () => {
  S.presets = null;
  startOver();
};
const presetFromLife = (lifeId) =>
  act(async () => {
    S.menuFor = null;
    const res = await call(`/lives/${encodeURIComponent(lifeId)}/preset`, {
      method: "POST",
      body: {},
    });
    S.titleSaid = `Saved as the preset \xAB${res.saved}\xBB.`;
  });
let resourcesAt = 0;
async function refreshResources({ soon = false } = {}) {
  if (!(!S.draft || !S.resources || S.busy || S.refreshingResources) && !(soon && Date.now() - resourcesAt < 8e3)) {
    S.refreshingResources = true;
    resourcesAt = Date.now();
    try {
      const res = await call("/resources");
      if (!S.draft || !S.resources) {
        return;
      }
      const castIds = S.draft.adding ? new Set((S.life?.contacts ?? []).map((contact) => contact.id)) : null,
        cards = castIds ? res.cards.filter((card) => !castIds.has(card.id)) : res.cards,
        sig = (list) =>
          JSON.stringify(
            (list ?? []).map((item) => [item.id, item.name, item.avatar ?? "", item.description?.length ?? 0]),
          );
      if (sig(cards) === sig(S.resources.cards) && sig(res.personas) === sig(S.resources.personas)) {
        return;
      }
      S.resources = {
        ...S.resources,
        ...res,
        cards: cards,
        ...(castIds
          ? {
              maxCast: S.resources.maxCast,
            }
          : {}),
      };
      notify();
    } catch {
      // Best effort: nothing to do when this fails.
    } finally {
      S.refreshingResources = false;
    }
  }
}
if (typeof document < "u") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshResources();
    }
  });
  window.addEventListener("focus", () => refreshResources());
}
async function countLibrary() {
  const draft = S.draft;
  if (draft) {
    try {
      const res = await call("/backdrops/available", {
        method: "POST",
        body: {
          home: draft.home,
          off: placesOff(draft),
        },
      });
      draft.libraryHave = res;
      const el = document.querySelector(`${TAG} #mls-look-have`);
      if (el) {
        el.textContent = `${res.have} / ${res.total}`;
      }
    } catch {
      // Best effort: nothing to do when this fails.
    }
  }
}
const startLife = () =>
  act(async () => {
    const draft = S.draft;
    draft.askStart = false;
    const pending = (S.resources?.modules ?? []).find(
      (mod) => draft.modules?.[mod.id]?.on && !draft.modules[mod.id].confirmed,
    );
    if (pending) {
      S.modOn = {
        id: pending.id,
        name: pending.name,
        confirm: pending.confirm,
        where: "start",
        preset: !!draft.modules[pending.id].fromPreset,
      };
      return;
    }
    clearTimeout(draftTimer);
    const cast = Object.entries(draft.cast)
        .filter(([, entry]) => entry.on)
        .map(([cardId, entry]) => ({
          cardId: cardId,
          main: entry.main || "grounded",
          second: entry.second || null,
          romanceable: entry.romanceable !== false,
          ...(typeof entry.castRomance == "boolean"
            ? {
                castRomance: entry.castRomance,
              }
            : {}),
          traits: entry.traits ?? null,
          thing: entry.thing || null,
          livesIn: entry.livesIn || null,
          settled: Number.isInteger(entry.settled) ? entry.settled : null,
          birthday: {
            ...(entry.birthday ?? rolledDay(cardId)),
            from: entry.birthdayFrom ?? "rolled",
          },
          gender: entry.gender || null,
          into: entry.into || "both",
          knows: entry.knows || "no",
          kin: entry.kin || null,
          tastes: entry.tastes ?? null,
          clothesTaste: entry.clothesTaste ?? null,
          dateTastes: entry.dateTastes ?? null,
          grid: entry.grid ?? null,
          job: entry.job || null,
          jobTitle: entry.jobTitle || "",
          workOutfit: entry.workOutfit || "",
          modules: entry.modules ?? null,
        })),
      res = await call("/lives", {
        method: "POST",
        body: {
          name: draft.name.trim(),
          personaId: draft.personaId,
          cast: cast,
          home: homeOfDraft(draft),
          housemates: matesOf(draft),
          birthday: draft.birthday ?? null,
          gender: draft.gender || null,
          savings: draft.savings,
          startingSkills: draft.skills,
          townOptions: {
            off: Object.entries(draft.off)
              .filter(([, off]) => off)
              .map(([placeId]) => placeId),
            renamed: renamedOf(draft),
            districtNames: Object.fromEntries(
              Object.entries(draft.districtNames ?? {})
                .map(([districtId, districtName]) => [districtId, String(districtName).trim()])
                .filter(([, districtName]) => districtName),
            ),
          },
          townName: draft.townName ?? "",
          rules: {
            ...draft.rules,
            ...draft.show,
          },
          modules: draft.modules ?? {},
          settings: {
            connection: draft.settings.connection || null,
            effort: draft.settings.effort,
            language: languageOf(draft),
          },
          scenario: draft.scenario,
          pairs: draftPairs(draft),
          look: draft.look?.connectionId ? draft.look : {},
          pictures: draft.pictures ?? {},
          frame: draft.frame === "cut" ? "cut" : "framed",
          size: draft.size ?? "16:9",
          portraitSize: draft.portraitSize ?? "2:3",
          startAt: {
            year: 1,
            season: draft.season ?? "Autumn",
            day: 1,
            hour: 7,
            minute: 30,
          },
          seed: String(Date.now()),
        },
      });
    forgetLife();
    S.life = res.life;
    S.said = ["A new life starts.", ...(res.dropped ?? [])].join(" ");
    S.view = "map";
    if (res.life.paint?.pending) {
      S.look = await call(`/lives/${res.life.id}/look`).catch(() => null);
      S.view = "painting";
      watchPaint();
    }
    reviewClothesIfDue();
  });
const goToCastStep = () => {
  if (S.draft && !S.draft.adding) {
    S.draft.step = 3;
  } else {
    S.view = "cast-review";
  }
  S.error = "";
  notify();
};
const placesOff = (draft) =>
  Object.entries(draft.off)
    .filter(([, off]) => off)
    .map(([placeId]) => placeId);
const renamedOf = (draft) =>
  Object.fromEntries(
    Object.entries(draft.renamed ?? {})
      .map(([placeId, newName]) => [placeId, String(newName).trim()])
      .filter(([, newName]) => newName),
  );
const goToWeekStep = () =>
  act(async () => {
    const draft = S.draft,
      cast = Object.entries(draft.cast).filter(([, entry]) => entry.on);
    draft.weekFor = draft.weekFor ?? cast[0]?.[0] ?? null;
    draft.weekDay = draft.weekDay ?? 0;
    if (draft.adding) {
      S.view = "week";
    } else {
      draft.step = "w";
      draft.reached = Math.max(draft.reached ?? 1, 7);
      draft.askStart = false;
    }
    for (const [idx, [, entry]] of cast.entries()) {
      if (entry.grid) {
        continue;
      }
      const res = await call("/week/template", {
        method: "POST",
        body: {
          template: "default",
          index: idx,
          off: placesOff(draft),
        },
      });
      entry.grid = res.grid;
    }
  });
const useTemplate = (cardId, template) =>
  act(async () => {
    const entry = S.draft.cast[cardId];
    if (!entry) {
      return;
    }
    const idx = Object.keys(S.draft.cast).indexOf(cardId),
      res = await call("/week/template", {
        method: "POST",
        body: {
          template: template,
          index: idx,
          off: placesOff(S.draft),
        },
      });
    entry.grid = res.grid;
    entry.fromModel = false;
    entry.note = "";
  });
const readers = new Map();
const stopReading = (cardId) => readers.get(cardId)?.abort();
function stopReadingAll() {
  if (S.draft) {
    S.draft.stopReading = true;
  }
  for (const controller of readers.values()) {
    controller.abort();
  }
  if (S.draft && !readers.size) {
    S.draft.reading = false;
    S.draft.stopReading = false;
    notify();
  }
}
async function readWholeCast() {
  const draft = S.draft,
    cardIds = Object.entries(draft.cast)
      .filter(([, entry]) => entry.on && !entry.reading)
      .map(([cardId]) => cardId);
  draft.reading = true;
  draft.stopReading = false;
  notify();
  try {
    for (const cardId of cardIds) {
      if (draft.stopReading) {
        break;
      }
      if (draft.cast[cardId]?.on) {
        await readCardWith(cardId).catch(() => {});
      }
    }
  } finally {
    draft.reading = false;
    draft.stopReading = false;
    notify();
  }
}
async function readCardWith(cardId) {
  const draft = S.draft;
  if (!draft?.cast[cardId]) {
    return;
  }
  draft.cast[cardId].reading = true;
  draft.cast[cardId].problem = "";
  const controller = new AbortController();
  readers.set(cardId, controller);
  notify();
  try {
    const res = await call("/read-card", {
      method: "POST",
      signal: controller.signal,
      body: {
        cardId: cardId,
        connection: draft.settings.connection || null,
        effort: draft.settings.effort,
        language: languageOf(draft),
        off: placesOff(draft),
        renamed: renamedOf(draft),
        townName: draft.townName ?? "",
        scenario: draft.scenario ?? "",
        others: Object.entries(draft.cast)
          .filter(([id, entry2]) => entry2.on && id !== cardId)
          .map(([id]) => ({
            id: id,
            name: S.resources?.cards?.find((card) => card.id === id)?.name ?? "",
          }))
          .filter((other) => other.name),
        couples: !!draft.rules.castCouples,
        taken: [
          ...Object.entries(draft.cast)
            .filter(
              ([id, entry2]) =>
                entry2.on && id !== cardId && entry2.job && !["out", "home", "none"].includes(entry2.job),
            )
            .map(([, entry2]) => entry2.job),
          ...(draft.adding ? (S.life?.jobs?.list ?? []).filter((job) => job.holder).map((job) => job.id) : []),
        ],
        modules: draft.adding ? (S.life?.modules ?? {}) : (draft.modules ?? {}),
      },
    });
    if (controller.signal.aborted) {
      return;
    }
    const entry = draft.cast[cardId];
    if (!entry?.on) {
      return;
    }
    entry.main = res.proposal.main;
    entry.second = res.proposal.second ?? "";
    if (entry.traitsBy !== "you") {
      entry.traits = res.proposal.traits ?? null;
    }
    if (entry.thingBy !== "you") {
      entry.thing = res.proposal.thing ?? "";
    }
    entry.romanceable = res.proposal.romanceable;
    entry.castRomance = res.proposal.castRomance;
    entry.why = res.proposal.why;
    entry.note = res.proposal.note ?? "";
    if (res.proposal.birthday && entry.birthdayFrom !== "you") {
      entry.birthday = {
        season: res.proposal.birthday.season,
        day: res.proposal.birthday.day,
      };
      entry.birthdayFrom = "card";
    }
    if (res.proposal.gender && entry.genderBy !== "you") {
      entry.gender = res.proposal.gender;
    }
    if (entry.intoBy !== "you") {
      entry.into = res.proposal.into ?? "both";
      entry.intoSaid = !!res.proposal.intoSaid;
    }
    if (res.proposal.livesIn && entry.livesBy !== "you") {
      entry.livesIn = res.proposal.livesIn;
      entry.livesBy = res.proposal.livesBy ?? "guess";
    }
    entry.rich = res.proposal.rich === true;
    entry.settled = res.proposal.settled ?? 1;
    if (res.proposal.knows) {
      entry.knows = res.proposal.knows;
      entry.kin = res.proposal.kin ?? null;
    }
    entry.tastes = res.proposal.tastes ?? null;
    entry.clothesTaste = res.proposal.clothesTaste ?? null;
    entry.dateTastes = res.proposal.dateTastes ?? null;
    entry.weekProblem = res.proposal.weekProblem ?? "";
    if (res.proposal.modules) {
      entry.modules = res.proposal.modules;
    }
    if (res.proposal.grid) {
      entry.grid = res.proposal.grid;
      entry.fromModel = true;
    }
    mergePeople(draft, cardId, res.proposal.people ?? []);
    entry.job = res.proposal.job?.id ?? (res.proposal.job?.out ? "out" : res.proposal.job?.home ? "home" : "none");
    entry.jobTitle = res.proposal.job?.home ? (res.proposal.job.title ?? "") : "";
    entry.workOutfit = res.proposal.workOutfit ?? "";
    entry.proposed = true;
    spreadHomes(draft);
  } catch (err) {
    if (draft.cast[cardId] && !controller.signal.aborted) {
      draft.cast[cardId].problem = String(err.message || err);
    }
  } finally {
    if (readers.get(cardId) === controller) {
      readers.delete(cardId);
    }
    if (draft.cast[cardId]) {
      draft.cast[cardId].reading = false;
    }
    notify();
  }
}

export {
  countLibrary,
  goToCastStep,
  goToWeekStep,
  openCreate,
  presetBlank,
  presetDelete,
  presetFromLife,
  presetLoad,
  presetRename,
  presetSave,
  presetsClose,
  presetsOpen,
  readCardWith,
  readWholeCast,
  refreshResources,
  saveDraftNow,
  saveDraftSoon,
  startLife,
  startOver,
  stopReading,
  stopReadingAll,
  useTemplate,
};
