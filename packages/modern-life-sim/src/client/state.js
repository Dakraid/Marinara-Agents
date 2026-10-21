// API base, shared state S, server call helpers, play loop
import { outingReread } from "./views/outings.js";
import { watchPaint } from "./actions/phone.js";
import { watchCounter } from "./actions/town.js";
import { reportEvents } from "./actions/talk.js";

const API = "/api/modern-life-sim";
const S = {
  view: "loading",
  corridor: null,
  afterWalk: null,
  picking: null,
  talkTo: null,
  talk: {},
  sceneSeg: 0,
  sceneWaiting: "",
  sceneAuto: false,
  sheet: null,
  you: null,
  contactsFind: "",
  memEdit: null,
  memAdd: false,
  faceEdit: null,
  crop: null,
  cooked: null,
  cooking: null,
  kitchenFor: null,
  kitchenPick: null,
  phone: false,
  settingsTab: "look",
  debug: {
    scope: "life",
    data: null,
    loading: false,
    error: "",
    open: {},
    copied: "",
  },
  prompts: {
    defaults: null,
    saved: {},
    draft: {},
    show: {},
    focus: "background",
    key: null,
    entry: null,
    preview: null,
    error: "",
    tried: null,
    album: [],
  },
  gallery: null,
  albumOpen: null,
  figureEdit: false,
  sceneHide: false,
  look: null,
  lookOptions: null,
  lookEdit: null,
  sceneLog: false,
  sceneBonds: false,
  lives: [],
  health: null,
  life: null,
  said: "",
  walk: null,
  roll: null,
  card: null,
  faint: null,
  faintAfterScene: null,
  talkFresh: null,
  focusEnter: false,
  shop: null,
  shopCart: {},
  shopTab: null,
  shopSendHome: false,
  shopCartOpen: false,
  shopFrom: "map",
  shopStore: null,
  things: null,
  thingsAt: null,
  thingPick: null,
  homePanel: null,
  sleep: null,
  bag: false,
  ask: null,
  cal: null,
  calDay: null,
  noteOpen: false,
  settingsBox: {},
  rack: null,
  rackPick: null,
  clothesReview: null,
  error: "",
  busy: false,
  run: 0,
  cancel: null,
  menuFor: null,
  resources: null,
  draft: null,
  listeners: new Set(),
};
S.saidCount = 0;
for (const prop of ["said", "error"]) {
  let value = S[prop];
  Object.defineProperty(S, prop, {
    enumerable: true,
    get: () => value,
    set: (next) => {
      value = next;
      if (next) {
        S.saidCount++;
      }
    },
  });
}
const notify = () => {
  S.listeners.forEach((listener) => listener());
  watchCounter();
};
function adminHeaders() {
  try {
    const secret = (localStorage.getItem("marinara_admin_secret") || "").trim();
    return secret
      ? {
          "X-Admin-Secret": secret,
        }
      : {};
  } catch {
    return {};
  }
}
// The Engine library search speaks the character query language (name:, tag:, -tag:, "phrases", typo~ …).
// Answers the matching card ids, or the Engine's message for a query that is not valid syntax.
// ponytail: one page of 1000 matches; page on hasMore if a search ever needs more.
async function searchLibraryIds(query) {
  const res = await fetch(`/api/characters/catalog?limit=1000&search=${encodeURIComponent(query)}`, {
    headers: { accept: "application/json", ...adminHeaders() },
    credentials: "same-origin",
  });
  const body = await res.json().catch(() => null);
  if (res.ok) {
    return { ids: new Set((body?.items ?? []).map((card) => card?.id).filter(Boolean)) };
  }
  if (body?.code === "query_syntax") {
    return { error: String(body.error ?? "invalid search") };
  }
  throw new Error(String(body?.error ?? res.statusText));
}
const openOnServer = (path) =>
  call(`${path}/open`, {
    method: "POST",
    body: {},
  });
async function call(path, { method = "GET", body: body, signal: signal } = {}) {
  const res = await fetch(API + path, {
      method: method,
      signal: signal,
      headers: {
        accept: "application/json",
        ...(body
          ? {
              "content-type": "application/json",
            }
          : {}),
        ...adminHeaders(),
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
    data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error || `${method} ${path} \u2192 ${res.status}`), {
      status: res.status,
      model: !!data.model,
    });
  }
  return data;
}
async function act(task, { loading = "", cancel = null, stuck = null } = {}) {
  if (S.busy) {
    return;
  }
  const runId = ++S.run,
    controller = new AbortController();
  S.busy = true;
  S.loading = loading;
  S.cancel = cancel
    ? {
        controller: controller,
        then: cancel,
      }
    : null;
  S.error = "";
  S.stuck = null;
  notify();
  try {
    await task(controller.signal);
  } catch (err) {
    if (runId === S.run) {
      S.error = String(err.message || err);
    }
    if (runId === S.run && stuck && err.model) {
      S.stuck = stuck;
    }
  }
  if (runId === S.run) {
    if (S.life?.paint?.keys || S.life?.paint?.people) {
      watchPaint();
    }
    S.busy = false;
    S.loading = "";
    S.cancel = null;
    notify();
  }
}
async function cancelRunning() {
  const pending = S.cancel;
  if (pending) {
    S.run++;
    pending.controller.abort();
    S.loading = "";
    S.cancel = null;
    S.error = "";
    S.stuck = null;
    notify();
    try {
      await pending.then();
    } catch (err) {
      S.error = String(err.message || err);
    }
    S.busy = false;
    notify();
  }
}
async function afterLifeCancel() {
  const lifeId = S.life?.id;
  if (!lifeId) {
    return;
  }
  const logLength = S.life.scene?.log?.length ?? -1,
    prevOuting = S.view === "outing" ? S.life.outing : null,
    prevFaint = S.life.scene?.faint ?? S.life.outing?.summary?.faint ?? null;
  await call(`/lives/${lifeId}/cancel`, {
    method: "POST",
    body: {},
  }).catch(() => {});
  const res = await openOnServer(`/lives/${lifeId}`);
  S.life = res.life;
  S.sceneWaiting = "";
  for (const talk of Object.values(S.talk)) {
    talk.waiting = false;
  }
  const faint = S.life.scene?.faint ?? S.life.outing?.summary?.faint ?? null;
  if (faint && !prevFaint) {
    S.view = S.life.scene ? "scene" : "outing";
    if (S.life.scene) {
      S.sceneSeg = 0;
    } else {
      S.outSeg = 0;
    }
    S.said = "";
    const { events = [], ...faintEvent } = faint;
    reportEvents([faintEvent, ...events]);
    return;
  }
  if (S.life.scene) {
    if ((S.life.scene.log?.length ?? -1) !== logLength) {
      S.sceneSeg = 0;
    }
    S.view = "scene";
  } else if (S.life.outing) {
    if (prevOuting) {
      outingReread(prevOuting, S.life.outing);
    } else {
      S.outSeg = 0;
    }
    S.view = "outing";
  } else if (S.view === "scene" || S.view === "outing") {
    S.view = "place";
  }
  S.said = "Cancelled \xB7 nothing happened.";
}
const PLAY_STEP = 15e3;
const PLAY_SEND = 6e4;
const PLAY_IDLE = 3 * 6e4;
const play = {
  timer: null,
  life: null,
  ms: 0,
  input: Date.now(),
  el: null,
};
function playOnScreen() {
  if (document.visibilityState !== "visible" || !play.el?.isConnected) {
    return false;
  }
  const rect = play.el.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < innerHeight &&
    rect.left < innerWidth
  );
}
const playTouched = () => {
  play.input = Date.now();
};
function playSend() {
  const { life: lifeId, ms: ms } = play;
  play.ms = 0;
  return !lifeId || ms <= 0
    ? Promise.resolve()
    : call(`/lives/${lifeId}/playtime`, {
        method: "POST",
        body: {
          ms: ms,
        },
      }).catch(() => {});
}
function playTick() {
  const lifeId = S.life?.id ?? null;
  if (lifeId !== play.life) {
    playSend();
    play.life = lifeId;
  }
  if (lifeId) {
    if (playOnScreen() && Date.now() - play.input < PLAY_IDLE) {
      play.ms += PLAY_STEP;
    }
    if (play.ms >= PLAY_SEND) {
      playSend();
    }
  }
}
function playStart(el) {
  play.el = el;
  if (!play.timer) {
    play.timer = setInterval(playTick, PLAY_STEP);
  }
}
function playStop() {
  clearInterval(play.timer);
  play.timer = null;
  playSend();
}

export {
  S,
  act,
  afterLifeCancel,
  call,
  cancelRunning,
  notify,
  openOnServer,
  playSend,
  playStart,
  playStop,
  playTouched,
  searchLibraryIds,
};
