// Contacts, sheet, gallery, pairs and news actions
import { pairName } from "../views/people.js";
import { S, act, call, notify } from "../state.js";
import { refreshBackdrop, watchPaint } from "./phone.js";

const sheetPath = (characterId) => `/lives/${S.life.id}/sheet/${encodeURIComponent(characterId)}`;
const openContacts = (characterId = null, { wide = true } = {}) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}`);
    S.life = res.life;
    S.view = "contacts";
    S.contactsMode = "list";
    S.contactsFind = "";
    S.sheetSaid = null;
    S.memEdit = null;
    S.memAdd = false;
    S.memWith = null;
    S.faceEdit = null;
    const sheetId = characterId ?? (wide ? (S.life.contacts?.find((contact) => contact.met)?.id ?? null) : null);
    S.sheet = sheetId ? (await call(sheetPath(sheetId))).sheet : null;
  });
const openChart = () =>
  act(async () => {
    S.chart = (await call(`/lives/${S.life.id}/chart`)).chart;
    S.chartSaid = "";
    S.chartFocus = null;
    S.contactsMode = "chart";
  });
const openGallery = () =>
  act(async () => {
    S.phone = false;
    S.albumOpen = null;
    S.gallery = {
      list: null,
      who: S.gallery?.who ?? "all",
    };
    S.view = "gallery";
    notify();
    S.gallery.list = (await call(`/lives/${S.life.id}/album`)).album;
  });
const galleryWho = (who) => {
  if (S.gallery) {
    S.gallery.who = who || "all";
    notify();
  }
};
const albumOpen = (albumId) => {
  S.albumOpen = albumId;
  notify();
};
const albumClose = () => {
  S.albumOpen = null;
  notify();
};
async function albumAgain(res) {
  if (S.gallery && res.album) {
    S.gallery.list = res.album;
  }
  if (res.paint) {
    S.life.paint = res.paint;
  }
}
const albumRedo = (albumId) =>
  act(async () => {
    await albumAgain(
      await call(`/lives/${S.life.id}/album/${encodeURIComponent(albumId)}/redo`, {
        method: "POST",
        body: {},
      }),
    );
    if (S.life?.scene || S.life?.outing) {
      await refreshBackdrop();
    }
    watchPaint();
  });
const albumPick = (albumId, version) =>
  act(async () => {
    await albumAgain(
      await call(`/lives/${S.life.id}/album/${encodeURIComponent(albumId)}/pick`, {
        method: "POST",
        body: {
          version: Number(version),
        },
      }),
    );
  });
const figureSave = (figure) =>
  act(async () => {
    const res = await call(`${sheetPath(S.sheet.id)}/figure`, {
      method: "POST",
      body: figure,
    });
    S.sheet = res.sheet;
    S.life = res.life;
    S.figureEdit = false;
  });
const openSheet = (characterId) =>
  act(async () => {
    S.sheet = (await call(sheetPath(characterId))).sheet;
    S.sheetSaid = null;
    S.memWith = null;
    S.faceEdit = null;
    S.memEdit = null;
    S.memAdd = false;
  });
const changeMemory = (change) =>
  act(async () => {
    const res = await call(`${sheetPath(S.sheet.id)}/memory`, {
      method: "POST",
      body: {
        ...change,
        ...(S.memWith
          ? {
              with: S.memWith,
            }
          : {}),
      },
    });
    S.sheet = res.sheet;
    S.life = res.life;
    S.memEdit = null;
    S.memAdd = false;
  });
const faceEditOpen = () => {
  if (S.sheet?.face) {
    S.faceEdit = {
      ...S.sheet.face,
    };
    notify();
  }
};
const faceEditCancel = () => {
  S.faceEdit = null;
  notify();
};
const faceEditReset = () => {
  if (S.faceEdit) {
    S.faceEdit = {
      x: 50,
      y: 24,
      zoom: 2,
    };
    notify();
  }
};
const faceEditSave = () =>
  act(async () => {
    const res = await call(`${sheetPath(S.sheet.id)}/face`, {
      method: "POST",
      body: S.faceEdit,
    });
    S.sheet = res.sheet;
    S.life = res.life;
    S.faceEdit = null;
  });
const setMemoryBudget = (tokens) =>
  act(async () => {
    const res = await call(`${sheetPath(S.sheet.id)}/memory-budget`, {
      method: "POST",
      body: {
        tokens: tokens,
        ...(S.memWith
          ? {
              with: S.memWith,
            }
          : {}),
      },
    });
    S.sheet = res.sheet;
    S.life = res.life;
  });
const setJustFriends = (on) =>
  act(async () => {
    const res = await call(`${sheetPath(S.sheet.id)}/just-friends`, {
      method: "POST",
      body: {
        on: on,
      },
    });
    S.sheet = res.sheet;
    S.life = res.life;
  });
const pairKeyOf = (idA, idB) => [idA, idB].sort().join("|");
const cardName = (cardId) => S.resources?.cards?.find((card) => card.id === cardId)?.name ?? "?";
function mergePeople(draft, cardId, people) {
  draft.pairs ??= {};
  for (const [pairKey, pair] of Object.entries(draft.pairs)) {
    if (
      pair.by === cardId &&
      pair.from === "card" &&
      !people.some((person) => pairKey === pairKeyOf(cardId, person.id))
    ) {
      delete draft.pairs[pairKey];
    }
  }
  for (const person of people) {
    const pairKey = pairKeyOf(cardId, person.id),
      existing = draft.pairs[pairKey],
      pair = {
        a: cardId,
        b: person.id,
        kind: person.kind,
        detail: person.detail ?? null,
        note: person.note ?? "",
        from: "card",
        by: cardId,
      };
    if (existing && existing.by !== cardId && (existing.kind !== pair.kind || existing.detail !== pair.detail)) {
      pair.changed = `${existing.from === "hand" ? "You had set" : `${cardName(existing.by)}'s card said`} ${pairName(existing)} \xB7 ${cardName(cardId)}'s card says ${pairName(pair)}`;
    }
    draft.pairs[pairKey] = pair;
  }
}
const draftPairs = (draft) =>
  Object.values(draft.pairs ?? {})
    .filter((pair) => draft.cast[pair.a]?.on && draft.cast[pair.b]?.on)
    .map(({ a: personA, b: personB, kind: kind, detail: detail, note: note, from: from }) => ({
      a: personA,
      b: personB,
      kind: kind,
      detail: detail,
      note: note,
      from: from,
    }));
const pairEdit = (cardId, fromId) => {
  const draft = S.draft,
    otherId = Object.entries(draft.cast).find(([id, member]) => member.on && id !== cardId)?.[0],
    pair = fromId ? draft.pairs?.[pairKeyOf(cardId, fromId)] : null;
  draft.pairEdit = {
    card: cardId,
    from: fromId || null,
    other: fromId || otherId,
    kind: pair?.kind ?? "friends",
    detail: pair?.detail ?? "siblings",
  };
  notify();
};
const pairSave = () => {
  const draft = S.draft,
    edit = draft.pairEdit;
  if (!edit?.other) {
    return;
  }
  if (edit.from && edit.from !== edit.other) {
    delete draft.pairs[pairKeyOf(edit.card, edit.from)];
  }
  const pairKey = pairKeyOf(edit.card, edit.other);
  draft.pairs[pairKey] = {
    a: edit.card,
    b: edit.other,
    kind: edit.kind,
    detail: edit.kind === "family" ? edit.detail : null,
    note: draft.pairs[pairKey]?.note ?? "",
    from: "hand",
    by: "you",
  };
  draft.pairEdit = null;
  notify();
};
const pairRemove = () => {
  const edit = S.draft.pairEdit;
  if (edit?.from) {
    delete S.draft.pairs[pairKeyOf(edit.card, edit.from)];
  }
  S.draft.pairEdit = null;
  notify();
};
const pairCancel = () => {
  S.draft.pairEdit = null;
  notify();
};
const openNews = (pop = false) =>
  act(async () => {
    if (
      ((S.phone = false),
      (S.news = {
        list: null,
        pick: 0,
        pop: pop,
      }),
      (S.view = "news"),
      notify(),
      (S.news.list = (await call(`/lives/${S.life.id}/news`)).news),
      S.life.news?.unseen)
    ) {
      const res = await call(`/lives/${S.life.id}/news/seen`, {
        method: "POST",
        body: {},
      });
      S.life = res.life;
    }
  });
const newsPick = (index) => {
  if (S.news?.list) {
    S.news.pick = Math.max(0, Math.min(S.news.list.length - 1, Number(index) || 0));
    notify();
  }
};
const newsMet = () => {
  if (S.news) {
    S.news.metOpen = !S.news.metOpen;
    notify();
  }
};
const newsAll = () => {
  if (S.news) {
    S.news.pop = false;
    S.newsAsked = false;
    notify();
  }
};
const newsOk = () => {
  S.news = null;
  S.newsAsked = false;
  S.view = S.life?.at && S.lastPlaceView ? S.lastPlaceView : "map";
  notify();
};
let newsTimer = null;
function watchNews() {
  if (newsTimer || !S.life?.news?.writing) {
    return;
  }
  const lifeId = S.life.id;
  let triesLeft = 30;
  newsTimer = setInterval(async () => {
    if (!S.life || S.life.id !== lifeId || triesLeft-- <= 0) {
      clearInterval(newsTimer);
      newsTimer = null;
      return;
    }
    try {
      const unseen = (await call(`/lives/${lifeId}/news`)).news.filter((item) => !item.seen).length;
      if (unseen && S.life?.id === lifeId) {
        S.life.news = {
          unseen: unseen,
          writing: false,
        };
        clearInterval(newsTimer);
        newsTimer = null;
        notify();
      }
    } catch {
      // Best effort: nothing to do when this fails.
    }
  }, 4e3);
}

export {
  albumClose,
  albumOpen,
  albumPick,
  albumRedo,
  changeMemory,
  draftPairs,
  faceEditCancel,
  faceEditOpen,
  faceEditReset,
  faceEditSave,
  figureSave,
  galleryWho,
  mergePeople,
  newsAll,
  newsMet,
  newsOk,
  newsPick,
  openChart,
  openContacts,
  openGallery,
  openNews,
  openSheet,
  pairCancel,
  pairEdit,
  pairRemove,
  pairSave,
  setJustFriends,
  setMemoryBudget,
  watchNews,
};
