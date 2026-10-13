// Phone, look/paint, shop, kitchen, backpack actions
import { outingPost } from "../views/outings.js";
import { cardOf, hudSnap } from "../views/cards.js";
import { fxOff, fxQuick } from "../motion.js";
import { S, act, call, notify, openOnServer } from "../state.js";
import { tellLater } from "./town.js";
import { settingsTab } from "./settings.js";
import { reportEvents } from "./talk.js";

const openPhone = () => {
  S.phone = true;
  notify();
};
const closePhone = () => {
  S.phone = false;
  notify();
};
const lookPath = () => `/lives/${S.life.id}/look`;
const openSettings = () =>
  act(async () => {
    S.phone = false;
    S.modOn = null;
    const [look, imageOptions] = await Promise.all([call(lookPath()), call("/image-options")]);
    S.look = look;
    S.lookOptions = imageOptions;
    S.lookEdit = null;
    S.view = "settings";
    S.debug.data = null;
    settingsTab(S.settingsTab);
    watchPaint();
  });
const lookSave = () =>
  act(async () => {
    S.look = await call(lookPath(), {
      method: "POST",
      body: S.lookEdit ?? {},
    });
    S.lookEdit = null;
  });
const lookRedo = (key, all = false) => {
  if (!(
    all &&
    !confirm(
      "Repaint every background of this life with the current connection, style and tags? The ones you have now stay in the library.",
    )
  )) {
    return act(async () => {
      S.look = await call(`${lookPath()}/redo`, {
        method: "POST",
        body: all
          ? {
              all: true,
            }
          : {
              key: key,
            },
      });
      await refreshBackdrop();
      watchPaint();
    });
  }
};
const lookPaintMissing = () =>
  act(async () => {
    S.look = await call(`${lookPath()}/redo`, {
      method: "POST",
      body: {
        missing: true,
      },
    });
    await refreshBackdrop();
    watchPaint();
  });
const lookPick = (key, version) =>
  act(async () => {
    S.look = await call(`${lookPath()}/pick`, {
      method: "POST",
      body: {
        key: key,
        version: version,
      },
    });
    await refreshBackdrop();
  });
const lookPause = (on) =>
  act(async () => {
    S.look = await call(`${lookPath()}/pause`, {
      method: "POST",
      body: {
        on: on,
      },
    });
    await refreshBackdrop();
    watchPaint();
  });
async function refreshBackdrop() {
  if (!S.life?.id) {
    return false;
  }
  const res = await call(`/lives/${S.life.id}/backdrop`),
    before = JSON.stringify(S.life.backdrop ?? null) + JSON.stringify(S.life.paint ?? null);
  S.life.backdrop = res.backdrop;
  S.life.paint = res.paint;
  const picsBefore = JSON.stringify([S.life.scene?.pictures ?? null, S.life.outing?.pictures ?? null]);
  if (S.life.scene && Array.isArray(res.scenePictures)) {
    S.life.scene.pictures = res.scenePictures;
  }
  if (S.life.outing && Array.isArray(res.outingPictures)) {
    S.life.outing.pictures = res.outingPictures;
  }
  return (
    before !== JSON.stringify(res.backdrop) + JSON.stringify(res.paint) ||
    picsBefore !== JSON.stringify([S.life.scene?.pictures ?? null, S.life.outing?.pictures ?? null])
  );
}
let paintTimer = null;
function watchPaint() {
  if (!paintTimer) {
    paintTimer = setInterval(async () => {
      const pendingCount = () =>
        (S.life?.paint?.pending ?? 0) +
        (S.look?.queue?.pending ?? 0) +
        (S.life?.paint?.keys ?? 0) +
        (S.life?.paint?.people ?? 0);
      if (!S.life || !pendingCount()) {
        clearInterval(paintTimer);
        paintTimer = null;
        return;
      }
      if (!S.busy) {
        try {
          const lifeId = S.life.id;
          let changed = false;
          if (S.view === "settings" || S.view === "painting") {
            const look = await call(lookPath());
            if (S.life?.id !== lifeId) {
              return;
            }
            changed = JSON.stringify(look) !== JSON.stringify(S.look);
            S.look = look;
          }
          const peopleBefore = S.life.paint?.people ?? 0;
          if (
            ((changed = (await refreshBackdrop()) || changed),
            (S.life?.paint?.people ?? 0) < peopleBefore &&
              S.life?.id === lifeId &&
              !S.busy &&
              !["scene", "outing"].includes(S.view))
          ) {
            const runId = S.run,
              res = await call(`/lives/${lifeId}`);
            if (runId === S.run && !S.busy && S.life?.id === lifeId) {
              S.life = res.life;
              changed = true;
            }
          }
          if (
            (S.view === "gallery" &&
              S.gallery &&
              ((S.gallery.list = (await call(`/lives/${lifeId}/album`)).album), (changed = true)),
            S.view === "contacts" && S.sheet?.id)
          ) {
            const sheet = (await call(`/lives/${lifeId}/sheet/${encodeURIComponent(S.sheet.id)}`)).sheet;
            if (
              S.life?.id === lifeId &&
              S.sheet?.id === sheet?.id &&
              JSON.stringify(sheet) !== JSON.stringify(S.sheet)
            ) {
              S.sheet = sheet;
              changed = true;
            }
          }
          if (S.view === "settings" && S.settingsTab === "prompts" && S.prompts.tried?.kind === "key") {
            S.prompts.album = (await call(`/lives/${lifeId}/album`)).album;
            changed = true;
          }
          paintListeners.forEach((listener) =>
            listener({
              changed: changed,
            }),
          );
        } catch {
          // Best effort: nothing to do when this fails.
        }
      }
    }, 3e3);
  }
}
const paintListeners = new Set();
const paintingGo = () => {
  S.view = "map";
  notify();
};
const openYou = () =>
  act(async () => {
    S.you = (await call(`/lives/${S.life.id}/you`)).you;
    S.view = "you";
  });
const openShop = (mode = "store") =>
  act(async () => {
    const res = await openOnServer(`/lives/${S.life.id}/shop/${mode}`);
    S.till = null;
    if (S.view === "shop" && S.shop?.mode === "store" && mode === "online") {
      S.shopStore = {
        cart: S.shopCart,
        tab: S.shopTab,
        sendHome: S.shopSendHome,
        place: S.shop.place,
      };
    } else if (S.view !== "shop") {
      S.shopFrom = S.view === "place" ? "place" : "map";
      S.shopStore = null;
    }
    if (S.view !== "shop" || S.shop?.mode !== mode) {
      S.shopCart = {};
      S.shopTab = null;
      S.shopSendHome = false;
      S.said = "";
    }
    S.shop = res.shop;
    S.view = "shop";
    S.phone = false;
  });
const shopBack = () => {
  if (S.shop?.mode === "online" && S.shopStore) {
    const stored = S.shopStore;
    S.shopStore = null;
    return act(async () => {
      const res = await openOnServer(`/lives/${S.life.id}/shop/store`);
      S.shop = res.shop;
      S.shopCart = stored.cart;
      S.shopTab = stored.tab;
      S.shopSendHome = stored.sendHome;
      S.till = null;
      S.said = "";
    });
  }
  S.view = S.shopFrom === "place" && ["market", "gift-shop", "furniture"].includes(S.life?.at) ? "place" : "map";
  S.shopStore = null;
  S.shop = null;
  S.till = null;
  S.said = "";
  notify();
};
const shopItems = () => (S.shop?.tabs ?? []).flatMap((tab) => tab.items);
const cartAdd = (itemId) => {
  const item = shopItems().find((candidate) => candidate.id === itemId);
  if (item?.available) {
    S.shopCart[itemId] = item.unique ? 1 : (S.shopCart[itemId] || 0) + 1;
    notify();
  }
};
const cartDec = (itemId) => {
  S.shopCart[itemId] = Math.max(0, (S.shopCart[itemId] || 0) - 1);
  if (!S.shopCart[itemId]) {
    delete S.shopCart[itemId];
  }
  notify();
};
const shopPay = () =>
  act(async () => {
    const lines = Object.entries(S.shopCart)
        .filter(([, count]) => count > 0)
        .map(([id, count]) => ({
          id: id,
          n: count,
        })),
      res = await call(`/lives/${S.life.id}/buy`, {
        method: "POST",
        body: {
          mode: S.shop.mode,
          lines: lines,
          sendHome: S.shopSendHome,
        },
      });
    S.life = res.life;
    S.shopCart = {};
    S.shopSendHome = false;
    S.things = res.things;
    if (res.shop) {
      S.shop = res.shop;
    }
    const bought = res.bought;
    S.shopPaid = (S.shopPaid ?? 0) + 1;
    const arrival = bought.tonight
      ? `it arrives home ${bought.when}`
      : bought.sentHome.length
        ? "what did not fit went home"
        : "in your backpack";
    S.till = bought.till
      ? {
          ...bought.till,
          total: bought.total,
          off: bought.off,
          after: `5 min at the till \xB7 ${arrival}`,
        }
      : null;
    S.said = bought.tonight
      ? `Paid $${bought.total} \xB7 5 min at the till \xB7 it arrives home ${bought.when}.`
      : bought.online
        ? `Ordered \xB7 $${bought.total} \xB7 it arrives home tomorrow at 09:00.`
        : `Paid $${bought.total} \xB7 5 min at the till${bought.sentHome.length ? " \xB7 what did not fit went home" : ""}.`;
    reportEvents(res.events);
    if (!res.shop && S.view === "shop") {
      S.view = "map";
    }
  });
function loadThings({ force = false } = {}) {
  if (!S.life || (!force && S.thingsAt === S.life.hud?.time + S.life.hud?.date)) {
    return;
  }
  S.thingsAt = S.life.hud?.time + S.life.hud?.date;
  const lifeId = S.life.id;
  openOnServer(`/lives/${lifeId}/things`)
    .then((res) => {
      if (S.life?.id === lifeId) {
        S.things = res.things;
        if (!S.card) {
          notify();
        }
      }
    })
    .catch(() => {
      S.thingsAt = null;
    });
}
const openHomePanel = (panel) => {
  S.homePanel = panel || null;
  S.thingPick = null;
  S.said = "";
  S.error = "";
  notify();
};
const COOK_ANIM_MS = 1800;
let cookTimer = null;
const openKitchen = () =>
  act(async () => {
    if (!S.things) {
      S.things = (await call(`/lives/${S.life.id}/things`)).things;
    }
    Object.assign(S, {
      view: "kitchen",
      homePanel: null,
      kitchenFor: null,
      kitchenPick: null,
      cooked: null,
      thingPick: null,
      said: "",
      phone: false,
    });
  });
const kitchenBack = () => {
  clearTimeout(cookTimer);
  Object.assign(S, {
    view: S.kitchenFor && !S.kitchenFor.with ? "outing" : "place",
    kitchenFor: null,
    cooked: null,
    cooking: null,
    said: "",
    error: "",
  });
  notify();
};
const openKitchenFor = () =>
  act(async () => {
    S.things = (await call(`/lives/${S.life.id}/things`)).things;
    const outing = S.life.outing;
    Object.assign(S, {
      view: "kitchen",
      kitchenFor: {
        name: outing.name,
        ...outing.moment.cook,
      },
      kitchenPick: null,
      cooked: null,
      said: "",
      phone: false,
    });
  });
const openKitchenWith = (characterId) =>
  act(async () => {
    const together = (S.life.together ?? []).find((entry) => entry.characterId === characterId);
    if (together?.kitchen) {
      S.things = (await call(`/lives/${S.life.id}/things`)).things;
      Object.assign(S, {
        view: "kitchen",
        kitchenFor: {
          name: together.name,
          with: characterId,
          left: together.kitchen.left ?? 1 / 0,
          likes: together.kitchen.likes,
          dislikes: together.kitchen.dislikes,
        },
        kitchenPick: null,
        cooked: null,
        said: "",
        phone: false,
      });
    }
  });
const cookTogether = (recipeId) => {
  if (S.busy || S.cooking) {
    return;
  }
  const recipe = S.things?.recipes?.find((candidate) => candidate.id === recipeId),
    animMs = fxOff() ? 0 : fxQuick() ? 500 : COOK_ANIM_MS,
    { name: forName, with: withId } = S.kitchenFor ?? {},
    startedAt = Date.now(),
    other = {
      avatar: (S.life.people ?? []).find((person) => person.id === withId)?.avatar ?? null,
    };
  S.cooking = animMs
    ? {
        icon: recipe?.icon ?? "\u{1F37D}",
        name: recipe?.name ?? "",
        minutes: recipe?.minutes ?? 0,
        ms: animMs,
        phase: "cooking",
        avatar: S.life?.persona?.avatar ?? null,
        cut: S.life?.persona?.cut ?? null,
        forName: forName,
        together: true,
        other: other,
        done: null,
      }
    : null;
  notify();
  let dish = null;
  return act(async () => {
    const before = hudSnap(S.life),
      res = await call(`/lives/${S.life.id}/together`, {
        method: "POST",
        body: {
          character: withId,
          key: "cook",
          recipe: recipeId,
        },
      });
    S.life = res.life;
    dish = res.result?.dish ?? null;
    const finish = () => {
        if (
          ((S.cooking = null),
          Object.assign(S, {
            view: "place",
            kitchenFor: null,
            cooked: null,
            said: "",
          }),
          !(res.events ?? []).some((ev) => ev.id === "fainted"))
        ) {
          const card = cardOf(res, before, res.life);
          S.card = card;
          S.roll = {
            from: before,
            ms: 1500,
          };
          if (card.writing) {
            tellLater(card);
          }
        }
        reportEvents(res.events);
        notify();
      },
      reveal = () => {
        if (!S.cooking) {
          return finish();
        }
        S.cooking = {
          ...S.cooking,
          phase: "done",
          done: dish,
        };
        notify();
        clearTimeout(cookTimer);
        cookTimer = setTimeout(finish, fxQuick() ? 500 : COOK_DONE_MS);
      };
    if ((clearTimeout(cookTimer), !animMs || !dish)) {
      return finish();
    }
    cookTimer = setTimeout(reveal, Math.max(0, animMs - (Date.now() - startedAt)));
  }).then(() => {
    if (S.error && S.cooking) {
      S.cooking = null;
      notify();
    }
  });
};
const cookForThem = (recipeId) => {
  if (S.busy || S.cooking) {
    return;
  }
  const recipe = S.things?.recipes?.find((candidate) => candidate.id === recipeId),
    animMs = fxOff() ? 0 : fxQuick() ? 500 : COOK_ANIM_MS,
    forName = S.kitchenFor?.name ?? "",
    startedAt = Date.now();
  S.cooking = animMs
    ? {
        icon: recipe?.icon ?? "\u{1F37D}",
        name: recipe?.name ?? "",
        minutes: recipe?.minutes ?? 0,
        ms: animMs,
        phase: "cooking",
        avatar: S.life?.persona?.avatar ?? null,
        cut: S.life?.persona?.cut ?? null,
        forName: forName,
        other: {
          avatar: S.life?.outing?.avatar ?? null,
        },
        together: !!S.kitchenFor?.together,
        meal: S.kitchenFor?.meal ?? "dinner",
        done: null,
      }
    : null;
  notify();
  return outingPost(
    "act",
    {
      option: recipeId,
    },
    {
      lines: true,
    },
  ).then(() => {
    const dish = S.life?.outing?.result?.dish;
    if (S.error || !dish) {
      S.cooking = null;
      notify();
      return;
    }
    const finish = () => {
        S.cooking = null;
        Object.assign(S, {
          view: S.life?.outing ? "outing" : "place",
          kitchenFor: null,
          cooked: null,
          said: "",
        });
        notify();
      },
      reveal = () => {
        if (!S.cooking) {
          return finish();
        }
        S.cooking = {
          ...S.cooking,
          phase: "done",
          done: dish,
        };
        notify();
        clearTimeout(cookTimer);
        cookTimer = setTimeout(finish, fxQuick() ? 500 : COOK_DONE_MS);
      };
    if ((clearTimeout(cookTimer), !animMs)) {
      return finish();
    }
    cookTimer = setTimeout(reveal, Math.max(0, animMs - (Date.now() - startedAt)));
  });
};
const COOK_DONE_MS = 1500;
function cookServed() {
  if (S.cooking) {
    S.cooked = {
      ...S.cooking.done,
      fresh: true,
    };
    S.cooking = {
      ...S.cooking,
      phase: "done",
    };
    notify();
    clearTimeout(cookTimer);
    cookTimer = setTimeout(
      () => {
        S.cooking = null;
        notify();
      },
      fxQuick() ? 500 : COOK_DONE_MS,
    );
  }
}
const cookPopTap = () => {
  if (!S.cooking?.forName) {
    if (S.cooking?.phase === "cooking") {
      return cookServed();
    }
    clearTimeout(cookTimer);
    S.cooking = null;
    notify();
  }
};
const openBackpack = () => {
  S.bag = true;
  S.phone = false;
  S.thingPick = null;
  S.said = "";
  S.thingsAt = null;
  loadThings({
    force: true,
  });
  notify();
};
const closeBackpack = () => {
  S.bag = false;
  S.thingPick = null;
  S.ask = null;
  notify();
};
const pileAt = (list, index) => (list === "bag" ? S.things?.bag?.piles?.[index] : S.things?.[list]?.[index]);
function askThing(kind, list, index, zone = null) {
  const pile = pileAt(list, index);
  if (pile) {
    S.ask = {
      kind: kind,
      list: list,
      index: index,
      zone: zone,
      max: pile.n,
      n: kind === "throw" && !pile.spoiled ? 1 : pile.n,
      name: pile.name,
      icon: pile.icon,
      spoiled: pile.spoiled,
    };
    notify();
  }
}
const askCount = (step) => {
  const ask = S.ask;
  if (ask) {
    ask.n = step === "all" ? ask.max : step === "one" ? 1 : Math.max(1, Math.min(ask.max, ask.n + Number(step)));
    notify();
  }
};
const askNo = () => {
  S.ask = null;
  notify();
};
const askYes = () => {
  const ask = S.ask;
  if (ask) {
    S.ask = null;
    return thingDo(
      {
        action: ask.kind,
        list: ask.list,
        index: ask.index,
        n: ask.n,
      },
      ask,
    );
  }
};
const THING_SAID = {
  eat: (done) => `You ate ${done.name} (${done.minutes} min).`,
  cook: (done) => `You cooked ${done.name} (${done.minutes} min).`,
  wear: (done) => `You changed into ${done.name} (${done.minutes} min).`,
  read: (done) => `You read ${done.name} (${done.minutes} min).`,
  move: (done, ask) =>
    ask?.zone === "bag" || done.to === "bag"
      ? `${done.n > 1 ? `${done.n} ` : ""}in your backpack.`
      : `Put away${done.n > 1 ? ` ${done.n}` : ""} in the ${done.to ?? ask?.zone ?? "house"}.`,
  throw: (done, ask) => `Threw away ${done.n > 1 ? `${done.n} \xD7 ` : ""}${ask?.name ?? "it"}.`,
};
const thingDo = (body, ask = null) =>
  act(async () => {
    const before = hudSnap(S.life),
      res = await call(`/lives/${S.life.id}/things`, {
        method: "POST",
        body: body,
      });
    S.life = res.life;
    S.things = res.things;
    S.thingsAt = S.life.hud?.time + S.life.hud?.date;
    S.thingPick = null;
    const done = res.done;
    if (done.did === "cook" && !(res.events ?? []).some((ev) => ev.id === "fainted")) {
      const recipe = S.things?.recipes?.find((candidate) => candidate.id === done.recipe),
        dish = {
          ...done,
          icon: recipe?.icon ?? "\u{1F37D}",
        },
        animMs = fxOff() ? 0 : fxQuick() ? 500 : COOK_ANIM_MS;
      S.cooked = null;
      S.cooking = animMs
        ? {
            icon: dish.icon,
            name: recipe?.name ?? done.name,
            minutes: done.minutes,
            ms: animMs,
            phase: "cooking",
            avatar: S.life?.persona?.avatar ?? null,
            cut: S.life?.persona?.cut ?? null,
            done: dish,
          }
        : null;
      if (!animMs) {
        S.cooked = dish;
      }
      S.roll = {
        from: before,
        ms: animMs || 1500,
      };
      S.said = "";
      reportEvents(res.events);
      clearTimeout(cookTimer);
      if (animMs) {
        cookTimer = setTimeout(cookServed, animMs);
      }
      return;
    }
    if (
      (done.did === "eat" || done.did === "read") &&
      (S.view === "place" || S.view === "kitchen") &&
      !(res.events ?? []).some((ev) => ev.id === "fainted")
    ) {
      const placeLabel = S.life.at === "home" ? "Home" : (S.life.hud?.place?.name ?? ""),
        verb =
          {
            cook: "cooked and ate",
            read: "read",
          }[done.did] ?? "ate",
        card = cardOf(
          {
            result: {
              activity: {
                id: done.did,
                name: done.name,
                place: `${placeLabel} \xB7 ${verb}`,
              },
              minutes: done.minutes,
              from: done.from,
              gains: done.gains,
              skills: done.skills,
            },
            events: res.events,
          },
          before,
          res.life,
        );
      S.card = card;
      S.roll = {
        from: before,
        ms: 1500,
      };
      S.said = "";
      reportEvents(res.events);
      return;
    }
    const gainsText = done.gains
      ? [
          done.gains.hunger ? `Hunger\xA0+${done.gains.hunger}` : "",
          done.gains.energy ? `Energy\xA0+${done.gains.energy}` : "",
          done.gains.knowledge ? `Knowledge\xA0+${done.gains.knowledge}` : "",
        ]
          .filter(Boolean)
          .join(", ")
      : "";
    S.said = `${(THING_SAID[done.did] ?? (() => ""))(done, ask)}${gainsText ? ` ${gainsText}.` : ""}`;
    reportEvents(res.events);
  });

export {
  askCount,
  askNo,
  askThing,
  askYes,
  cartAdd,
  cartDec,
  closeBackpack,
  closePhone,
  cookForThem,
  cookPopTap,
  cookTogether,
  kitchenBack,
  loadThings,
  lookPaintMissing,
  lookPath,
  lookPause,
  lookPick,
  lookRedo,
  lookSave,
  openBackpack,
  openHomePanel,
  openKitchen,
  openKitchenFor,
  openKitchenWith,
  openPhone,
  openSettings,
  openShop,
  openYou,
  paintListeners,
  paintingGo,
  pileAt,
  refreshBackdrop,
  shopBack,
  shopPay,
  thingDo,
  watchPaint,
};
