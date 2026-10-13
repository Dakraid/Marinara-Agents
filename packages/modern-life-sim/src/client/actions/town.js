// Life admin, movement, stores, rack, clothes, activities, gifts
import { onLunch } from "../views/place.js";
import { jobLine } from "../views/career.js";
import { outingStart } from "../views/outings.js";
import { cardOf, hudSnap, lunchCardOf, tellCard } from "../views/cards.js";
import { S, act, afterLifeCancel, call, notify, openOnServer } from "../state.js";
import { watchPaint } from "./phone.js";
import { reportEvents } from "./talk.js";
import { TAG } from "../element.js";

const renameLife = (lifeId, newName) =>
  act(async () => {
    await call(`/lives/${lifeId}`, {
      method: "PATCH",
      body: {
        name: newName,
      },
    });
    const livesRes = await call("/lives");
    S.lives = livesRes.lives;
  });
const duplicateLife = (lifeId) =>
  act(async () => {
    await call(`/lives/${lifeId}/duplicate`, {
      method: "POST",
      body: {},
    });
    const livesRes = await call("/lives");
    S.lives = livesRes.lives;
  });
const deleteLife = (lifeId, confirmText) =>
  act(async () => {
    await call(`/lives/${lifeId}`, {
      method: "DELETE",
      body: {
        confirm: confirmText,
      },
    });
    const livesRes = await call("/lives");
    S.lives = livesRes.lives;
  });
const shutWhy = (placeId) => {
  const place = S.life?.places?.find((candidate) => candidate.id === placeId);
  return place?.events && !place.isOpen
    ? `${place.name} only opens for events \xB7 a wedding is held here`
    : place && !place.residence && !place.isOpen
      ? `${place.name} is closed \xB7 it opens at ${String(place.open % 24).padStart(2, "0")}:00`
      : "";
};
const enterPlace = () => {
  const closedWhy = shutWhy(S.life?.at);
  if (closedWhy) {
    S.said = `${closedWhy}.`;
    notify();
    return;
  }
  S.view = "place";
  S.said = "";
  notify();
};
const backToMapFromAnywhere = () => {
  if (onLunch(S.life) && S.view === "place") {
    S.talkTo = null;
    S.talk = {};
    S.said = `You're on your lunch break: back at your desk at ${S.life.career.shift.lunch.until}.`;
    notify();
    return;
  }
  S.view = "map";
  S.town = false;
  S.corridor = null;
  S.talkTo = null;
  S.talk = {};
  S.said = "";
  notify();
};
const isResidence = (placeId) => {
  const place = S.life?.places?.find((candidate) => candidate.id === placeId);
  return !!(place?.residence || place?.hall);
};
const goTo = (placeId, { ride = false } = {}) =>
  act(async () => {
    S.talk = {};
    S.talkTo = null;
    S.hp = null;
    const before = hudSnap(S.life),
      res = await call(`/lives/${S.life.id}/${ride ? "ride/go" : "go"}`, {
        method: "POST",
        body: {
          place: placeId,
        },
      });
    S.roll = {
      from: before,
      linear: true,
      walk: true,
    };
    const route = res.moved.path ?? null,
      crossesTown = !!route && route.length > 1;
    S.walk = route
      ? {
          route: route,
          from: res.moved.from,
          to: res.moved.place,
          phase: crossesTown ? "town" : "inside",
          inside: !String(res.moved.place).startsWith("street:"),
          closing: crossesTown && !S.town,
        }
      : null;
    S.town = crossesTown;
    S.life = res.life;
    const closedWhy = shutWhy(placeId),
      verb =
        {
          car: "Drove",
          motorbike: "Rode",
        }[res.moved.by] ?? "Walked",
      placeName2 = res.life.hud.place?.name ?? placeId,
      summary = res.moved.with
        ? `${verb} ${res.moved.with.name} to ${placeName2}`
        : res.moved.picked
          ? `${verb} by ${res.moved.picked.name}'s and on to ${placeName2}`
          : `${verb} to ${placeName2}`;
    S.said = `${summary} \xB7 ${res.moved.minutes} min${closedWhy ? ` \xB7 ${closedWhy.replace(/^.* is closed/, "closed")}` : ""}`;
    if (isResidence(placeId) && !closedWhy) {
      S.afterWalk = () => openCorridor(placeId);
    }
    const plan = (S.life.plansToday ?? []).find((planItem) => planItem.canStart);
    if (plan && !closedWhy && !S.afterWalk) {
      S.afterWalk = () => outingStart(plan.id);
    }
    if (S.life.paint?.pending) {
      watchPaint();
    }
    reportEvents(res.events);
  });
const openCorridor = (placeId) => {
  const closedWhy = shutWhy(placeId);
  if (closedWhy) {
    S.view = "map";
    S.said = `${closedWhy}.`;
    notify();
    return;
  }
  S.view = "corridor";
  S.corridor = placeId;
  S.said = "";
  S.talkTo = null;
  S.talk = {};
  notify();
};
let goneTimer = null;
const fadeGone = () => {
  const talkId = S.talkTo,
    talkState = talkId ? S.talk[talkId] : null;
  if (!(!talkState?.bond || talkState.waiting || S.life?.people?.some((person) => person.id === talkId))) {
    if (goneTimer?.kept !== talkState) {
      clearTimeout(goneTimer?.timer);
      goneTimer = {
        kept: talkState,
        timer: setTimeout(() => {
          goneTimer = null;
          if (S.talk[talkId] === talkState) {
            delete S.talk[talkId];
            if (S.talkTo === talkId) {
              S.talkTo = null;
            }
            notify();
          }
        }, 4e3),
      };
    }
  }
};
const goIn = () => {
  if (S.life?.at === "home") {
    S.view = "place";
    notify();
    return;
  }
  return act(async () => {
    const res = await call(`/lives/${S.life.id}/go`, {
      method: "POST",
      body: {
        place: "home",
      },
    });
    S.life = res.life;
    S.said = "You are home.";
    S.view = "place";
    reportEvents(res.events);
  });
};
const toHall = () =>
  act(async () => {
    const hallId = S.life?.places?.find((candidate) => candidate.id === S.life.at)?.inside;
    if (!hallId) {
      return;
    }
    S.talk = {};
    S.talkTo = null;
    const res = await call(`/lives/${S.life.id}/go`, {
      method: "POST",
      body: {
        place: hallId,
      },
    });
    S.life = res.life;
    S.said = "";
    S.view = "corridor";
    S.corridor = hallId;
    reportEvents(res.events);
  });
const goInStore = (placeId) => {
  const closedWhy = shutWhy(placeId);
  if (closedWhy) {
    S.said = `${closedWhy}.`;
    notify();
    return;
  }
  if (S.life?.at === placeId) {
    S.view = "place";
    S.said = "";
    notify();
    return;
  }
  return act(async () => {
    S.talk = {};
    S.talkTo = null;
    const before = hudSnap(S.life),
      res = await call(`/lives/${S.life.id}/go`, {
        method: "POST",
        body: {
          place: placeId,
        },
      });
    S.life = res.life;
    S.roll = {
      from: before,
      linear: true,
    };
    S.said = "";
    S.view = "place";
    if (S.life.paint?.pending) {
      watchPaint();
    }
    reportEvents(res.events);
  });
};
const rackPath = () => `/lives/${S.life.id}/rack`;
const openRack = () =>
  act(async () => {
    S.rack = (await openOnServer(rackPath())).rack;
    S.rackPick = S.rack.outfits[0]?.id ?? null;
    S.said = "";
    S.till = null;
    S.view = "rack";
    watchRack();
  });
const rackBack = () => {
  S.view = "place";
  S.rack = null;
  S.said = "";
  S.till = null;
  notify();
};
const rackBuy = (itemId, wear = false) =>
  act(async () => {
    const res = await call(`${rackPath()}/buy`, {
      method: "POST",
      body: {
        item: itemId,
        wear: wear,
      },
    });
    S.life = res.life;
    S.rack = res.rack;
    S.thingsAt = null;
    S.said = `${res.bought.name} \xB7 $${res.bought.total}${res.bought.wore ? " \xB7 you changed into it" : " \xB7 it waits in your closet"}`;
    const bought = res.bought;
    S.till = bought.till
      ? {
          ...bought.till,
          total: bought.total,
          off: bought.off,
          item: bought.item,
          after: bought.wore ? "you changed into it" : "it waits in your closet",
        }
      : null;
    reportEvents(res.events);
    watchRack();
  });
const rackWear = (itemId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/things`, {
      method: "POST",
      body: {
        action: "wear",
        item: itemId,
      },
    });
    S.life = res.life;
    S.things = res.things;
    S.rack = (await openOnServer(rackPath())).rack;
    S.said = `You changed into ${res.done.name} \xB7 ${res.done.minutes} min`;
    reportEvents(res.events);
  });
const rackTry = (itemId) =>
  act(async () => {
    const res = await call(`${rackPath()}/try`, {
      method: "POST",
      body: {
        item: itemId,
      },
    });
    if (((S.life = res.life), (S.rack = res.rack), (S.till = null), !res.rack)) {
      reportEvents(res.events);
      return;
    }
    S.rackPick = itemId;
    reportEvents(res.events);
    setTimeout(rackTryLines, 0);
  });
async function rackTryLines() {
  try {
    const res = await call(`${rackPath()}/try/lines`, {
      method: "POST",
      body: {},
    });
    if (S.view !== "rack") {
      return;
    }
    S.life = res.life;
    S.rack = res.rack;
  } catch {
    if (S.rack?.fitting) {
      S.rack.fitting.writing = false;
    }
  }
  notify();
}
let counterTimer = null;
function watchCounter() {
  if (counterTimer || !S.life?.counter?.writing) {
    return;
  }
  let polls = 0;
  counterTimer = setInterval(async () => {
    if (((polls += 1), !S.life?.counter?.writing || polls > 20)) {
      clearInterval(counterTimer);
      counterTimer = null;
      return;
    }
    if (!S.busy) {
      try {
        const { counter: counter } = await call(`/lives/${S.life.id}/counter`);
        if (!S.life || JSON.stringify(counter) === JSON.stringify(S.life.counter)) {
          return;
        }
        S.life.counter = counter;
        if (S.rack) {
          S.rack.counter = counter;
        }
        if (S.shop?.mode === "store") {
          S.shop.counter = counter;
        }
        notify();
      } catch {
        // Best effort: nothing to do when this fails.
      }
    }
  }, 3e3);
}
const rackPaint = (itemId) =>
  act(async () => {
    const res = await call(`${rackPath()}/paint`, {
      method: "POST",
      body: {
        item: itemId,
      },
    });
    if (res.rack) {
      S.rack = res.rack;
      watchRack();
    }
    if (res.things) {
      S.things = res.things;
      (S.askedPaint ??= new Set()).add(itemId);
      watchCloset();
    }
  });
let closetTimer = null;
function watchCloset() {
  if (closetTimer) {
    return;
  }
  const deadline = Date.now() + 12e4;
  closetTimer = setInterval(async () => {
    const pending = [...(S.askedPaint ?? [])].filter(
      (itemId) => !S.things?.closet?.find((item) => item.id === itemId)?.pic,
    );
    if (!S.life || !pending.length || Date.now() > deadline) {
      clearInterval(closetTimer);
      closetTimer = null;
      S.askedPaint = new Set();
      notify();
      return;
    }
    try {
      S.things = (await call(`/lives/${S.life.id}/things`)).things;
      notify();
    } catch {
      // Best effort: nothing to do when this fails.
    }
  }, 4e3);
}
const pictureAsk = (ask) => {
  S.picturesAsk = ask;
  notify();
};
const setPictureMode = (system, mode) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/pictures`, {
      method: "POST",
      body: {
        system: system,
        mode: mode,
      },
    });
    S.life = {
      ...S.life,
      pictures: res.pictures,
    };
    S.picturesAsk = null;
  });
let rackTimer = null;
function watchRack() {
  if (!rackTimer) {
    rackTimer = setInterval(async () => {
      const painting = S.rack && (S.rack.paint?.painting || S.rack.paint?.queued?.length);
      if (S.view !== "rack" || !painting) {
        clearInterval(rackTimer);
        rackTimer = null;
        return;
      }
      if (!S.busy) {
        try {
          const rack = (await openOnServer(rackPath())).rack;
          if (S.view !== "rack") {
            return;
          }
          const changed = JSON.stringify(rack) !== JSON.stringify(S.rack);
          S.rack = rack;
          if (changed) {
            notify();
          }
        } catch {
          // Best effort: nothing to do when this fails.
        }
      }
    }, 4e3);
  }
}
function openClothesReview(from = "settings") {
  if (!S.life) {
    return;
  }
  S.clothesReview = {
    from: from,
    loading: true,
    appearance: "",
    wearing: "",
    empty: false,
    error: "",
  };
  notify();
  const lifeId = S.life.id;
  call(`/lives/${lifeId}/clothes/split`, {
    method: "POST",
  })
    .then((res) => {
      if (!(!S.clothesReview || S.life?.id !== lifeId)) {
        Object.assign(S.clothesReview, {
          loading: false,
          appearance: res.split.appearance,
          wearing: res.split.wearing,
          empty: !!res.empty,
        });
        notify();
      }
    })
    .catch((err) => {
      if (S.clothesReview) {
        Object.assign(S.clothesReview, {
          loading: false,
          error: `${String(err.message || err)} \xB7 you can write both parts yourself.`,
        });
        notify();
      }
    });
}
const clothesSave = () =>
  act(async () => {
    const review = S.clothesReview,
      res = await call(`/lives/${S.life.id}/clothes`, {
        method: "POST",
        body: {
          on: true,
          appearance: review.appearance,
          wearing: review.wearing,
        },
      });
    S.life = res.life;
    S.clothesReview = null;
    S.thingsAt = null;
    if (S.view === "settings") {
      S.settingsBox = {
        saved: {
          name: "rules",
          at: Date.now(),
        },
      };
    }
  });
const clothesOff = () =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/clothes`, {
      method: "POST",
      body: {
        on: false,
      },
    });
    S.life = res.life;
    S.thingsAt = null;
    if (S.view === "settings") {
      S.settingsBox = {
        saved: {
          name: "rules",
          at: Date.now(),
        },
      };
    }
  });
const clothesCancel = () => {
  const from = S.clothesReview?.from;
  if (((S.clothesReview = null), from === "start")) {
    return clothesOff();
  }
  notify();
};
const deletePicked = (lifeIds) =>
  act(async () => {
    for (const id of lifeIds) {
      await call(`/lives/${id}`, {
        method: "DELETE",
        body: {
          confirm: id,
        },
      });
    }
    const livesRes = await call("/lives");
    S.lives = livesRes.lives;
    S.picking = null;
  });
const doActivity = (activity, options = {}) =>
  act(async () => {
    const before = hudSnap(S.life),
      res = await call(`/lives/${S.life.id}/activity`, {
        method: "POST",
        body: {
          activity: activity,
          options: options,
        },
      });
    if (((S.life = res.life), res.shift)) {
      S.shiftPick = {};
      if (res.lunch) {
        S.card = lunchCardOf(res.lunch);
        S.roll = {
          from: before,
          ms: 1200,
        };
        reportEvents(res.events);
      }
      return;
    }
    if (res.backToWork) {
      S.card = lunchCardOf(res.backToWork, "back");
      S.roll = {
        from: before,
        ms: 1500,
      };
      reportEvents((res.events ?? []).filter((ev) => ev.id !== "lunch-over"));
      return;
    }
    if (!(res.events ?? []).some((ev) => ev.id === "fainted")) {
      const card = cardOf(res, before, res.life);
      S.card = card;
      S.roll = {
        from: before,
        ms: card.sleep ? 2400 : 1500,
      };
      if (card.writing) {
        tellLater(card);
      }
    }
    const noFaint = !(res.events ?? []).some((ev) => ev.id === "fainted"),
      capitalize = (word) => `${word[0].toUpperCase()}${word.slice(1)}`,
      gainsText = Object.entries(res.result.gains ?? {})
        .filter(([, gain]) => gain > 0)
        .map(([skill, amount]) => `+${Math.round(amount)} ${capitalize(skill)}`)
        .join(", "),
      levelText = (res.result.levelled ?? [])
        .map((levelUp) => `${capitalize(levelUp.skill)} is now ${levelUp.to}`)
        .join(" \xB7 ");
    S.said = noFaint
      ? ""
      : [
          `${res.result.activity?.name ?? activity}: ${res.result.minutes} min`,
          gainsText,
          res.result.pay ? `$${res.result.pay}` : "",
          levelText,
        ]
          .filter(Boolean)
          .join(" \xB7 ");
    reportEvents(res.events);
  });
async function tellLater(card) {
  const lifeId = S.life?.id;
  try {
    const isMoment =
        String(card.activity ?? "").startsWith("together-") ||
        ["stay", "goodbye", "arrive", "sleepover"].includes(card.activity),
      res = card.speaker
        ? await call(`/lives/${lifeId}/job/line`, {
            method: "POST",
            body: {
              kind: "comment",
            },
          })
        : isMoment
          ? await call(`/lives/${lifeId}/moment-line`, {
              method: "POST",
            })
          : await call(`/lives/${lifeId}/activity-line`, {
              method: "POST",
              body: {
                activity: card.activity,
                worn: card.worn,
              },
            });
    card.line = card.speaker || isMoment ? (res.line ? `${res.line.text}` : null) : (res.line ?? null);
  } catch {
    card.line = null;
  }
  card.writing = false;
  if (S.card === card) {
    tellCard(document.querySelector(TAG), card);
  }
}
const showCard = (card) => {
  if (S.card) {
    (S.cardQueue ??= []).push(card);
  } else {
    S.card = card;
  }
  if (card.writing) {
    tellLater(card);
  }
};
const cardNext = () => {
  if (!S.card) {
    return;
  }
  if (S.card.running && !S.card.skip) {
    S.card.skip = true;
    return;
  }
  const then = S.card.then,
    review = S.card.review;
  if (((S.card = S.cardQueue?.length ? S.cardQueue.shift() : null), S.card)) {
    S.card.then ??= then;
    S.card.review ??= review;
    notify();
    return;
  }
  if (review) {
    S.jobCard = {
      kind: "review",
      ...review,
      lineKind: "review",
    };
    if (review.writing) {
      jobLine(S.jobCard);
    }
  }
  if (then === "corridor" && S.view === "place") {
    S.view = "corridor";
    S.corridor = S.life?.at;
  }
  if (then === "map") {
    S.view = "map";
    S.corridor = null;
  }
  notify();
};
const faintNext = () => {
  if (!(!S.faint || S.faint.step === 2 || S.faint.step >= 4)) {
    S.faint.step++;
    notify();
  }
};
const faintDone = () => {
  S.faint = null;
  S.view = S.life?.outing ? "outing" : "place";
  notify();
};
const pickPerson = (personId) => {
  S.talkTo = personId;
  S.said = "";
  S.focusEnter = true;
  notify();
};
const giftOpen = (personId) => {
  const person = S.life?.people?.find((candidate) => candidate.id === personId);
  S.talk[personId] = {
    name: person?.name ?? "",
    picking: true,
    giftPick: null,
  };
  S.error = "";
  notify();
};
const giftClose = (personId) => {
  delete S.talk[personId];
  notify();
};
const giftPick = (personId, giftIndex) => {
  const talk = S.talk[personId];
  if (talk?.picking) {
    talk.giftPick = talk.giftPick === giftIndex ? null : giftIndex;
    notify();
  }
};
const giveGift = (personId) => {
  const talk = S.talk[personId];
  if (S.busy || talk?.giftPick === null || talk?.giftPick === undefined) {
    return;
  }
  const giftIndex = talk.giftPick,
    personName = talk.name;
  S.talk[personId] = {
    name: personName,
    waiting: true,
    kind: "gift",
  };
  const before = hudSnap(S.life);
  return act(
    async (signal) => {
      try {
        const res = await call(`/lives/${S.life.id}/gift`, {
          method: "POST",
          body: {
            character: personId,
            index: giftIndex,
          },
          signal: signal,
        });
        S.life = res.life;
        S.roll = {
          from: before,
          ms: 1e3,
        };
        S.talkFresh = {
          id: personId,
          before: before,
        };
        const gave = res.gave;
        S.talk[personId] = {
          line: gave.line,
          outcome: gave.good ? "good" : "bad",
          kind: "gift",
          applied: gave.applied ?? {},
          limits: gave.limits ?? {},
          problem: gave.lineProblem ?? "",
          waiting: false,
          name: personName,
          bond: res.bond,
          stamp: {
            text: gave.stamp,
            good: gave.good,
            tag: gave.tag,
            name: gave.gift.name,
            icon: gave.gift.icon,
          },
          seenBy: gave.seenBy ?? [],
        };
        reportEvents(res.events);
      } catch (err) {
        S.talk[personId] = {
          name: personName,
          picking: true,
          giftPick: giftIndex,
        };
        throw err;
      }
    },
    {
      cancel: afterLifeCancel,
    },
  );
};

export {
  backToMapFromAnywhere,
  cardNext,
  clothesCancel,
  clothesOff,
  clothesSave,
  deleteLife,
  deletePicked,
  doActivity,
  duplicateLife,
  enterPlace,
  fadeGone,
  faintDone,
  faintNext,
  giftClose,
  giftOpen,
  giftPick,
  giveGift,
  goIn,
  goInStore,
  goTo,
  openClothesReview,
  openCorridor,
  openRack,
  pickPerson,
  pictureAsk,
  rackBack,
  rackBuy,
  rackPaint,
  rackTry,
  rackWear,
  renameLife,
  setPictureMode,
  showCard,
  shutWhy,
  tellLater,
  toHall,
  watchCounter,
};
