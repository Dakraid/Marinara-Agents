// Calendar, prompts, debug, settings, cast, traits, crop actions
import { cropBox } from "../views/common.js";
import { emptyDraft, rolledDay } from "../views/creation.js";
import { S, act, call, notify } from "../state.js";
import { lookPath, refreshBackdrop, watchPaint } from "./phone.js";
import { draftPairs } from "./people.js";

const openCalendar = (offset = 0) =>
  act(async () => {
    const calendar = (await call(`/lives/${S.life.id}/calendar/${offset}`)).calendar;
    S.phone = false;
    S.cal = calendar;
    S.calDay = calendar.days.some((day) => day.d === calendar.today) ? calendar.today : calendar.days[0].d;
    S.noteOpen = false;
    S.view = "calendar";
  });
const calendarNote = (note) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/notes`, {
      method: "POST",
      body: {
        ...note,
        offset: S.cal?.offset ?? 0,
      },
    });
    S.life = res.life;
    S.cal = res.calendar;
    S.noteOpen = false;
  });
const settingsResources = () =>
  S.resources ? Promise.resolve(S.resources) : call("/resources").then((res) => (S.resources = res));
const settingsTab = (tab) => {
  S.settingsTab = ["look", "motion", "cast", "rules", "model", "prompts", "debug"].includes(tab) ? tab : "look";
  S.settingsBox = {};
  if (S.settingsTab === "model") {
    settingsResources()
      .then(notify)
      .catch(() => {});
  }
  if (S.settingsTab === "debug") {
    loadCalls();
  }
  if (S.settingsTab === "prompts") {
    loadPrompts();
  }
  notify();
};
const promptListeners = new Set();
const ipOverrides = () => {
  const prompts = S.prompts;
  return Object.fromEntries(
    Object.keys(prompts.defaults ?? {})
      .map((key) => [key, prompts.draft[key] ?? prompts.saved[key] ?? prompts.defaults[key]])
      .filter(([key, text]) => text.trim() !== prompts.defaults[key].trim()),
  );
};
const loadPrompts = () => {
  const prompts = S.prompts;
  prompts.error = "";
  prompts.tried = null;
  Promise.all([
    call("/image-prompts"),
    S.look ? null : call(lookPath()),
    S.life ? call(`/lives/${S.life.id}/album`) : null,
  ])
    .then(
      ([promptsRes, look, albumRes]) => (
        (prompts.defaults = promptsRes.defaults),
        (prompts.saved = {
          ...promptsRes.overrides,
        }),
        (prompts.draft = {}),
        (prompts.show = {}),
        look && (S.look = look),
        (prompts.album = albumRes?.album ?? []),
        (prompts.key ??=
          (S.look?.tiles ?? []).find((tile) => tile.url && tile.key === S.life?.backdrop?.key)?.key ??
          (S.look?.tiles ?? []).find((tile) => tile.url)?.key ??
          "park|day"),
        promptsPreview()
      ),
    )
    .catch((err) => {
      prompts.error = err.message;
    })
    .finally(notify);
};
let promptsTimer = null;
function promptsPreview() {
  const prompts = S.prompts;
  return !S.life || !prompts.defaults
    ? Promise.resolve()
    : call(`/lives/${S.life.id}/image-prompts/preview`, {
        method: "POST",
        body: {
          overrides: ipOverrides(),
          key: prompts.key,
          entry: prompts.entry,
        },
      })
        .then((preview) => {
          prompts.preview = preview;
          prompts.entry = preview.key?.entry ?? null;
          prompts.error = "";
        })
        .catch((err) => {
          prompts.error = err.message;
        })
        .finally(() => promptListeners.forEach((listener) => listener()));
}
const promptsLater = () => {
  clearTimeout(promptsTimer);
  promptsTimer = setTimeout(promptsPreview, 250);
};
const ipInput = (key, text) => {
  S.prompts.draft[key] = text;
  promptsLater();
};
const ipPick = (kind, value) => {
  if (kind === "key") {
    S.prompts.key = value;
  } else {
    S.prompts.entry = value;
  }
  S.prompts.tried = null;
  promptsPreview();
};
const ipFocus = (key) => {
  S.prompts.focus = key;
  notify();
};
const ipShowDefault = (key) => {
  S.prompts.show[key] = !S.prompts.show[key];
  notify();
};
const ipReset = (key) => {
  S.prompts.draft[key] = S.prompts.defaults[key];
  S.prompts.show[key] = false;
  notify();
  promptsPreview();
};
const ipDiscard = () => {
  S.prompts.draft = {};
  notify();
  promptsPreview();
};
async function ipStore(overrides) {
  const res = await call("/image-prompts", {
    method: "POST",
    body: {
      overrides: overrides,
    },
  });
  S.prompts.saved = {
    ...res.overrides,
  };
  S.prompts.draft = {};
}
const ipSave = () =>
  act(async () => {
    await ipStore(ipOverrides());
    await promptsPreview();
  });
const ipResetAll = () => {
  if (confirm("Put every image prompt back as it came?")) {
    return act(async () => {
      S.prompts.show = {};
      await ipStore({});
      await promptsPreview();
    });
  }
};
const ipTry = (kind) =>
  act(async () => {
    const prompts = S.prompts;
    if ((Object.keys(prompts.draft).length && (await ipStore(ipOverrides())), kind === "background")) {
      const tile = (S.look?.tiles ?? []).find(
        (candidateTile) => candidateTile.key === prompts.preview?.background?.key,
      );
      if (!tile) {
        return;
      }
      S.look = await call(`${lookPath()}/redo`, {
        method: "POST",
        body: {
          key: tile.key,
        },
      });
      prompts.tried = {
        kind: kind,
        key: tile.key,
        versions: tile.versions ?? 0,
        url: tile.url,
      };
      await refreshBackdrop();
    } else {
      const entry = prompts.album.find((albumEntry) => albumEntry.id === prompts.entry);
      if (!entry) {
        return;
      }
      const res = await call(`/lives/${S.life.id}/album/${encodeURIComponent(entry.id)}/redo`, {
        method: "POST",
        body: {},
      });
      if (res.album) {
        prompts.album = res.album;
      }
      if (res.paint) {
        S.life.paint = res.paint;
      }
      prompts.tried = {
        kind: kind,
        entry: entry.id,
        versions: entry.versions ?? 0,
        url: entry.url,
      };
    }
    watchPaint();
    await promptsPreview();
  });
const loadCalls = () => {
  const debug = S.debug;
  debug.loading = true;
  debug.error = "";
  const run = S.run;
  call(debug.scope === "all" || !S.life ? "/calls" : `/lives/${S.life.id}/calls`)
    .then((data) => {
      if (S.run === run) {
        debug.data = data;
      }
    })
    .catch((err) => {
      debug.error = err.message;
    })
    .finally(() => {
      debug.loading = false;
      notify();
    });
  notify();
};
const debugScope = (scope) => {
  S.debug.scope = scope === "all" ? "all" : "life";
  S.debug.data = null;
  loadCalls();
};
const debugOpen = (callId) => {
  const open = S.debug.open;
  if (open[callId]) {
    delete open[callId];
    notify();
    return;
  }
  open[callId] = {
    loading: true,
  };
  notify();
  call(`/calls/${encodeURIComponent(callId)}`)
    .then((res) => {
      if (open[callId]) {
        open[callId] = {
          call: res.call,
        };
      }
    })
    .catch((err) => {
      if (open[callId]) {
        open[callId] = {
          error: err.message,
        };
      }
    })
    .finally(notify);
};
const debugCopy = (callId, part) => {
  const callData = S.debug.open[callId]?.call;
  if (!callData) {
    return;
  }
  const text =
    part === "in"
      ? callData.in.map(
          (msg) => `[${msg.role}]
${msg.content}`,
        ).join(`

`)
      : callData.out;
  Promise.resolve(navigator.clipboard?.writeText(text)).catch(() => {});
  S.debug.copied = `${callId}:${part}`;
  notify();
  setTimeout(() => {
    if (S.debug.copied === `${callId}:${part}`) {
      S.debug.copied = "";
      notify();
    }
  }, 1200);
};
const settingsSave = (path, body, boxName) =>
  act(async () => {
    try {
      const res = await call(`/lives/${S.life.id}/${path}`, {
        method: "POST",
        body: body,
      });
      S.life = res.life;
      S.settingsBox = {
        saved: {
          name: boxName,
          at: Date.now(),
        },
      };
      setTimeout(() => {
        if (S.settingsBox.saved?.name === boxName) {
          notify();
        }
      }, 1700);
    } catch (err) {
      S.settingsBox = {
        error: String(err.message || err),
      };
    }
  });
const saveRule = (key, value, boxName) =>
  settingsSave(
    "rules",
    {
      rules: {
        [key]: value,
      },
    },
    boxName,
  );
const saveModule = (moduleId, key, value) => (
  (S.guideBook = null),
  settingsSave(
    "modules",
    {
      module: moduleId,
      [key]: value,
    },
    "rules",
  )
);
const moduleCast = (moduleId, characterId, key, value) =>
  settingsSave(
    `modules/${encodeURIComponent(moduleId)}/character`,
    {
      character: characterId,
      key: key,
      value: value,
    },
    "cast",
  );
const moduleCharacter = (moduleId, key, value) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/modules/${encodeURIComponent(moduleId)}/character`, {
      method: "POST",
      body: {
        character: S.sheet?.id,
        key: key,
        value: value,
      },
    });
    S.life = res.life;
    S.sheet = res.sheet;
  });
const saveSetting = (key, value) =>
  settingsSave(
    "settings",
    {
      [key]: value,
    },
    key.startsWith("image") ? "images" : "model",
  );
const SPOIL_OPEN = {
  hidden: 0,
  found: 1,
  always: 2,
};
function setSpoiler(key, value) {
  if ((SPOIL_OPEN[value] ?? 0) > (SPOIL_OPEN[S.life.rules?.[key]] ?? 0)) {
    S.settingsBox = {
      warn: {
        key: key,
        value: value,
      },
    };
    notify();
    return;
  }
  return saveRule(key, value, "spoilers");
}
const castAway = (characterId, away) =>
  act(async () => {
    S.settingsBox = {};
    const res = await call(`/lives/${S.life.id}/cast/away`, {
      method: "POST",
      body: {
        character: characterId,
        away: away,
      },
    });
    S.life = res.life;
    S.settingsBox = {
      said: `${res.moved.name} ${away ? "moved away." : "is back in town."}`,
    };
  });
const castRename = (characterId, newName) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/cast/rename`, {
      method: "POST",
      body: {
        character: characterId,
        name: newName,
      },
    });
    S.life = res.life;
    S.settingsBox = {
      said: res.renamed.name === res.renamed.was ? "" : `${res.renamed.was} is now ${res.renamed.name}.`,
    };
  });
const castRefresh = (characterId) =>
  act(
    async () => {
      S.settingsBox = {};
      const res = await call(`/lives/${S.life.id}/cast/refresh`, {
        method: "POST",
        body: {
          character: characterId,
        },
      });
      S.life = res.life;
      const refreshed = res.refreshed;
      S.settingsBox = {
        said: [
          refreshed.changed.length
            ? `${refreshed.name}: updated from the card (${refreshed.changed.join(", ")}).`
            : `${refreshed.name}'s card has not changed.`,
          refreshed.traitsSaid,
        ]
          .filter(Boolean)
          .join(" "),
      };
    },
    {
      loading: "Reading their card\u2026",
    },
  );
function traitSet(path, value) {
  const [source, id, field, key] = path.split("|"),
    target = source === "draft" ? S.draft?.cast?.[id] : S.settingsBox?.traits?.id === id ? S.settingsBox.traits : null;
  if (!target) {
    return;
  }
  if (field === "thing") {
    target.thing = value;
    if (source === "draft") {
      target.thingBy = "you";
    }
    notify();
    return;
  }
  const baseTraits = target.traits ?? S.resources?.traits?.starts?.[target.main || "grounded"] ?? {},
    traits = {
      dials: {},
      flags: [],
      likes: {},
      ...baseTraits,
    };
  if (field === "dial") {
    traits.dials = {
      ...traits.dials,
      [key]: Number(value),
    };
  } else if (field === "like") {
    traits.likes = {
      ...traits.likes,
      [key]: value,
    };
  } else if (field === "flag") {
    traits.flags = traits.flags.includes(key) ? traits.flags.filter((flag) => flag !== key) : [...traits.flags, key];
  }
  target.traits = {
    ...traits,
    ...(source === "draft"
      ? {
          tone: "",
        }
      : {}),
    from: "own",
  };
  if (source === "draft") {
    target.traitsBy = "you";
  }
  notify();
}
const traitsOpen = (characterId) =>
  act(async () => {
    if (S.settingsBox?.traits?.id === characterId) {
      S.settingsBox = {};
      return;
    }
    const res = await call(`/lives/${S.life.id}/cast/${encodeURIComponent(characterId)}/traits`);
    S.settingsBox = {
      traits: {
        id: characterId,
        traits: res.traits,
        thing: res.thing,
        catalog: res.catalog,
      },
    };
  });
const traitsSave = () =>
  act(
    async () => {
      const box = S.settingsBox.traits;
      if (box) {
        try {
          const res = await call(`/lives/${S.life.id}/cast/${encodeURIComponent(box.id)}/traits`, {
            method: "POST",
            body: {
              traits: box.traits,
              thing: box.thing,
            },
          });
          S.life = res.life;
          S.settingsBox = {
            said: [`${res.saved.name}: saved.`, res.saved.toneSaid].filter(Boolean).join(" "),
          };
        } catch (err) {
          box.error = String(err.message || err);
        }
      }
    },
    {
      loading: "Writing how they come across\u2026",
    },
  );
const openAdding = () =>
  act(async () => {
    const resources = await call("/resources"),
      knownIds = new Set((S.life.contacts ?? []).map((contact) => contact.id)),
      draft = emptyDraft();
    draft.adding = S.life.name;
    draft.settings = {
      connection: S.life.settings?.connection ?? "",
      effort: S.life.settings?.effort ?? "low",
      language: S.life.settings?.language ?? "English",
    };
    draft.show = {
      showArchetypes: S.life.rules?.showArchetypes ?? "hidden",
      showSchedules: S.life.rules?.showSchedules ?? "found",
    };
    draft.townName = S.life.townName ?? "";
    draft.scenario = S.life.scenario ?? "";
    draft.pickerOpen = true;
    const inTown = (S.life.contacts ?? []).filter((contact) => !contact.away).length;
    S.resources = {
      ...resources,
      cards: resources.cards.filter((card) => !knownIds.has(card.id)),
      maxCast: Math.max(0, (S.life.maxInTown ?? 30) - inTown),
    };
    S.draft = draft;
  });
function addingPicked() {
  if (((S.draft.pickerOpen = false), !Object.values(S.draft.cast).some((entry) => entry.on))) {
    return closeAdding();
  }
  S.view = "cast-review";
  notify();
}
const closeAdding = (said = "") => {
  S.draft = null;
  S.resources = null;
  S.view = "settings";
  S.settingsTab = "cast";
  S.settingsBox = said
    ? {
        said: said,
      }
    : {};
  notify();
};
const addPeople = () =>
  act(
    async () => {
      const cast = Object.entries(S.draft.cast)
          .filter(([, entry]) => entry.on)
          .map(([cardId, pick]) => ({
            cardId: cardId,
            main: pick.main || "grounded",
            second: pick.second || null,
            romanceable: pick.romanceable !== false,
            ...(typeof pick.castRomance == "boolean"
              ? {
                  castRomance: pick.castRomance,
                }
              : {}),
            traits: pick.traits ?? null,
            thing: pick.thing || null,
            livesIn: pick.livesIn || null,
            birthday: {
              ...(pick.birthday ?? rolledDay(cardId)),
              from: pick.birthdayFrom ?? "rolled",
            },
            knows: pick.knows || "no",
            kin: pick.kin || null,
            gender: pick.gender || null,
            into: pick.into || null,
            tastes: pick.tastes ?? null,
            clothesTaste: pick.clothesTaste ?? null,
            dateTastes: pick.dateTastes ?? null,
            grid: pick.grid ?? null,
            job: pick.job || null,
            jobTitle: pick.jobTitle || "",
            workOutfit: pick.workOutfit || "",
            modules: pick.modules ?? null,
          })),
        res = await call(`/lives/${S.life.id}/cast`, {
          method: "POST",
          body: {
            cast: cast,
            pairs: draftPairs(S.draft),
          },
        });
      S.life = res.life;
      closeAdding([`${res.added.join(", ")} moved to town.`, ...(res.dropped ?? [])].join(" "));
    },
    {
      loading: "Moving in\u2026",
    },
  );
const cropSize = (target) =>
  target.kind === "backdrop"
    ? (S.life?.pictureSize ?? {
        width: 1344,
        height: 768,
      })
    : (S.life?.portraitSize ?? {
        width: 832,
        height: 1216,
      });
const cropOpen = async (target, file) => {
  if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) {
    S.error = "Only PNG, JPEG or WebP pictures.";
    notify();
    return;
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("That picture could not be read."));
      image.src = objectUrl;
    });
    S.crop = {
      to: target,
      src: objectUrl,
      iw: img.naturalWidth,
      ih: img.naturalHeight,
      ...cropSize(target),
      zoom: 1,
      dx: 0,
      dy: 0,
    };
    S.error = "";
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    S.error = String(err.message || err);
  }
  notify();
};
const cropClose = () => {
  if (S.crop?.src) {
    URL.revokeObjectURL(S.crop.src);
  }
  S.crop = null;
  notify();
};
const cropSave = async () => {
  const crop = S.crop;
  if (!crop) {
    return;
  }
  const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("That picture could not be read."));
      image.src = crop.src;
    }),
    canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d"),
    box = cropBox(crop);
  ctx.drawImage(
    img,
    (box.left / 100) * crop.width,
    (box.top / 100) * crop.height,
    (box.w / 100) * crop.width,
    (box.h / 100) * crop.height,
  );
  const pixels = ctx.getImageData(0, 0, crop.width, crop.height).data;
  let hasAlpha = false;
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 250) {
      hasAlpha = true;
      break;
    }
  }
  const dataUrl = hasAlpha ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.9),
    target = crop.to;
  cropClose();
  const upload = {
    dataUrl: dataUrl,
    clear: hasAlpha,
  };
  await act(
    async () => {
      if (target.kind === "backdrop") {
        S.look = await call(`${lookPath()}/upload`, {
          method: "POST",
          body: {
            ...upload,
            key: target.key,
          },
        });
        return;
      }
      if (target.kind === "outfit") {
        const res2 = await call(`/lives/${S.life.id}/rack/upload`, {
          method: "POST",
          body: {
            ...upload,
            item: target.item,
          },
        });
        if (res2.rack) {
          S.rack = res2.rack;
        }
        if (res2.things) {
          S.things = res2.things;
        }
        return;
      }
      const res = await call(`/lives/${S.life.id}/sheet/${target.character}/${target.kind}/upload`, {
        method: "POST",
        body: {
          ...upload,
          season: target.season,
        },
      });
      S.sheet = res.sheet;
    },
    {
      loading: "Uploading your picture\u2026",
    },
  );
};
const uploadBackdrop = (key, file) =>
  cropOpen(
    {
      kind: "backdrop",
      key: key,
    },
    file,
  );

export {
  addPeople,
  addingPicked,
  calendarNote,
  castAway,
  castRefresh,
  castRename,
  closeAdding,
  cropClose,
  cropOpen,
  cropSave,
  debugCopy,
  debugOpen,
  debugScope,
  ipDiscard,
  ipFocus,
  ipInput,
  ipPick,
  ipReset,
  ipResetAll,
  ipSave,
  ipShowDefault,
  ipTry,
  loadCalls,
  moduleCast,
  moduleCharacter,
  openAdding,
  openCalendar,
  promptListeners,
  saveModule,
  saveRule,
  saveSetting,
  setSpoiler,
  settingsTab,
  traitSet,
  traitsOpen,
  traitsSave,
  uploadBackdrop,
};
