// Title/life open actions, resume, scene start
import { openJobs } from "../views/career.js";
import { hudSnap } from "../views/cards.js";
import { S, act, afterLifeCancel, call, notify, openOnServer, playSend } from "../state.js";
import { watchPaint } from "./phone.js";
import { saveDraftNow } from "./creation.js";
import { openClothesReview } from "./town.js";
import { reportEvents } from "./talk.js";

const loadTitle = () =>
  act(async () => {
    saveDraftNow();
    await playSend();
    await call("/title", {
      method: "POST",
      body: {},
    }).catch(() => {});
    const [health, livesRes, changelogRes, welcomeRes] = await Promise.all([
      call("/health"),
      call("/lives"),
      call("/changelog").catch(() => ({
        changelog: [],
      })),
      call("/welcome").catch(() => ({
        welcome: null,
      })),
    ]);
    S.health = health;
    S.lives = livesRes.lives;
    S.changelogList = changelogRes.changelog ?? [];
    S.welcome = welcomeRes.welcome ?? null;
    S.life = null;
    forgetLife();
    S.said = "";
    S.view = "title";
  });
const firstDayDone = (next = null) =>
  act(async () => {
    await call(`/lives/${S.life.id}/first-day`, {
      method: "POST",
      body: {},
    });
    S.life = {
      ...S.life,
      firstDay: null,
    };
  }).then(() => (next === "jobs" ? openJobs() : next === "guide" ? openGuide() : null));
const openGuide = (at = null) =>
  act(async () => {
    S.phone = false;
    const lifeId = S.life?.id ?? "";
    if (!S.guideBook || S.guideFor !== lifeId) {
      S.guideBook = await call(`/guide${lifeId ? `?life=${encodeURIComponent(lifeId)}` : ""}`);
      S.guideFor = lifeId;
    }
    S.guideAt = at;
    S.guideBack = [];
    S.guideQuery = "";
    S.view = "guide";
  });
const acceptWelcome = () =>
  act(async () => {
    S.welcome = (
      await call("/welcome", {
        method: "POST",
        body: {
          id: S.welcome?.id,
        },
      })
    ).welcome;
    S.welcomeTicked = false;
  });
const seenChangelog = () => {
  try {
    return localStorage.getItem("mls-seen-changelog") ?? "";
  } catch {
    return "";
  }
};
const markChangelogSeen = (id) => {
  try {
    localStorage.setItem("mls-seen-changelog", id);
  } catch {
    // Best effort: nothing to do when this fails.
  }
};
const forgetLife = () =>
  Object.assign(S, {
    hp: null,
    homePanel: null,
    keys: null,
    kitchenFor: null,
    card: null,
    cardQueue: [],
    things: null,
    thingsAt: null,
    thingPick: null,
    afterWalk: null,
    gallery: null,
    newsAsked: false,
    shiftFailed: null,
    jobCard: null,
    noticeSeen: false,
    shiftPick: {},
    jobs: null,
    evict: null,
    notice: null,
    hpCancel: false,
    partyPick: null,
    partyWith: null,
    partyAlso: [],
    talk: {},
    talkTo: null,
    approachNext: null,
    weddingTab: null,
    guideBook: null,
    guideFor: null,
  });
const openLife = (lifeId, { anyway = false } = {}) =>
  act(async () => {
    S.modOn = null;
    const res = await openOnServer(`/lives/${lifeId}`);
    if (res.life.save?.compatible === false && !anyway) {
      S.oldSave = {
        id: lifeId,
        ...res.life.save,
      };
      return;
    }
    S.oldSave = null;
    S.life = res.life;
    S.said = "";
    forgetLife();
    Object.assign(S, resumeAt(S.life));
    S.outSeg = S.life.outing ? 99 : 0;
    S.sceneSeg = S.life.scene?.batch?.length ?? 0;
    S.sceneWalked = S.life.scene?.walk?.id ?? null;
    S.phone = false;
    if (S.life.paint?.pending || S.life.paint?.people) {
      watchPaint();
    }
    reviewClothesIfDue();
  });
function resumeAt(life) {
  if (life.scene) {
    return {
      view: "scene",
    };
  }
  if (life.outing) {
    return {
      view: "outing",
    };
  }
  if (life.firstDay) {
    return {
      view: "map",
    };
  }
  if (life.visit) {
    return {
      view: "place",
      corridor: life.at,
    };
  }
  if (life.at === "home") {
    return {
      view: "place",
    };
  }
  const place = (life.places ?? []).find((candidate) => candidate.id === life.at);
  return place
    ? place.residence || place.hall
      ? {
          view: "corridor",
          corridor: place.id,
        }
      : {
          view: place.isOpen ? "place" : "map",
        }
    : {
        view: "map",
      };
}
function reviewClothesIfDue() {
  if (S.life?.clothes?.on && !S.life.clothes.ready && !S.clothesReview) {
    openClothesReview("start");
  }
}
function sceneWalk(before) {
  const walk = S.life?.scene?.walk;
  if (!walk || S.sceneWalked === walk.id) {
    return;
  }
  S.sceneWalked = walk.id;
  const crossTown = (walk.path?.length ?? 0) > 1;
  S.roll = {
    from: before,
    linear: true,
    walk: true,
  };
  S.walk = walk.path
    ? {
        route: walk.path,
        from: walk.from,
        to: walk.place,
        phase: crossTown ? "town" : "inside",
        inside: true,
        closing: false,
      }
    : null;
  S.town = crossTown;
  S.said = walk.said ?? "";
  S.view = "map";
  S.afterWalk = () => {
    S.view = "scene";
    S.sceneSeg = 0;
    S.sceneLog = false;
    notify();
  };
}
const startScene = (characterId, kind = "intro", milestone = null, loading = null, withIds = null, how = null) =>
  act(
    async (signal) => {
      delete S.talk[characterId];
      const before = hudSnap(S.life),
        res = await call(`/lives/${S.life.id}/scene/start`, {
          method: "POST",
          body: {
            character: characterId,
            kind: kind,
            ...(milestone
              ? {
                  milestone: milestone,
                }
              : {}),
            ...(withIds
              ? {
                  with: withIds,
                }
              : {}),
            ...(how
              ? {
                  how: how,
                }
              : {}),
          },
          signal: signal,
        });
      if (((S.life = res.life), (S.talk = {}), (S.talkTo = null), res.fainted)) {
        S.view = "place";
        reportEvents(res.events ?? []);
        return;
      }
      S.sceneSeg = 0;
      S.sceneLog = false;
      S.view = "scene";
      sceneWalk(before);
      reportEvents(res.events);
    },
    {
      loading: loading ?? (kind === "talk" ? "Sitting down with them\u2026" : "Walking up to them\u2026"),
      cancel: afterLifeCancel,
    },
  );
const approachScene = (approach) =>
  ["party-arrive", "party-goodbye"].includes(approach.milestone)
    ? partyDoor(approach)
    : startScene(
        approach.characterId,
        "milestone",
        approach.milestone,
        approach.loading ?? `${String(approach.name ?? "Someone").toUpperCase()} IS APPROACHING YOU\u2026`,
      );
const partyDoor = (approach, { noLines = false } = {}) =>
  act(
    async (signal) => {
      const res = await call(`/lives/${S.life.id}/scene/start`, {
        method: "POST",
        body: {
          character: approach.characterId,
          kind: "milestone",
          milestone: approach.milestone,
          ...(noLines
            ? {
                noLines: noLines,
              }
            : {}),
        },
        signal: signal,
      });
      if (((S.life = res.life), (S.talk = {}), (S.talkTo = null), res.quiet || res.fainted)) {
        S.view = "place";
        reportEvents(res.events ?? []);
        return;
      }
      S.sceneSeg = 0;
      S.sceneLog = false;
      S.view = "scene";
      reportEvents(res.events);
    },
    {
      loading:
        approach.milestone === "party-arrive"
          ? `${String(approach.name ?? "They").toUpperCase()} OPENS THE DOOR\u2026`
          : `${String(approach.name ?? "They").toUpperCase()} SEES YOU OUT\u2026`,
      cancel: afterLifeCancel,
      stuck: {
        again: () => partyDoor(approach),
        skip: () =>
          partyDoor(approach, {
            noLines: true,
          }),
      },
    },
  );
async function partyRemember() {
  const lifeId = S.life?.id;
  if (!(!lifeId || S.partyRemembering === lifeId)) {
    S.partyRemembering = lifeId;
    try {
      const res = await call(`/lives/${lifeId}/party/remember`, {
        method: "POST",
        body: {},
      });
      if (S.life?.id === lifeId) {
        S.life.partyMemoDue = false;
        if (S.life.partyOver) {
          S.life.partyOver.remember = res.remember ?? null;
        }
        notify();
      }
    } catch {
      if (S.life?.id === lifeId) {
        S.life.partyMemoDue = false;
        if (S.life.partyOver) {
          S.life.partyOver.remember = null;
        }
        notify();
      }
    } finally {
      S.partyRemembering = null;
    }
  }
}

export {
  acceptWelcome,
  approachScene,
  firstDayDone,
  forgetLife,
  loadTitle,
  markChangelogSeen,
  openGuide,
  openLife,
  partyRemember,
  reviewClothesIfDue,
  sceneWalk,
  seenChangelog,
  startScene,
};
