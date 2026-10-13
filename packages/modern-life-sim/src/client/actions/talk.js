// Talk, visits, doors, sleep actions and event reporting
import { partyStep, sleepoverCardOf } from "../views/outings.js";
import { cardOf, faintOf, goodbyeCardOf, hudSnap, lunchCardOf } from "../views/cards.js";
import { S, act, afterLifeCancel, call, notify } from "../state.js";
import { doActivity, showCard, tellLater } from "./town.js";

const talkDone = () => {
  if (S.talkTo) {
    delete S.talk[S.talkTo];
  }
  S.talkTo = null;
  notify();
};
const talkTo = (personId, kind = "quickChat") => {
  if (S.busy) {
    return;
  }
  const person = S.life?.people?.find((candidate) => candidate.id === personId);
  S.talk[personId] = {
    ...(S.talk[personId] ?? {}),
    waiting: true,
    name: person?.name ?? S.talk[personId]?.name ?? "",
  };
  const before = hudSnap(S.life);
  return act(
    async (signal) => {
      try {
        const res = await call(`/lives/${S.life.id}/interact`, {
          method: "POST",
          body: {
            character: personId,
            kind: kind,
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
        const nowhereEvent = (res.events ?? []).find(
          (ev) => (ev.id === "not-into" || ev.id === "taken") && ev.characterId === personId,
        );
        if (nowhereEvent) {
          res.events = res.events.filter((ev) => ev !== nowhereEvent);
        }
        S.talk[personId] = {
          line: res.interacted.line,
          outcome: res.interacted.outcome,
          kind: kind,
          nowhere: nowhereEvent?.text ?? "",
          applied: res.interacted.applied ?? {},
          limits: res.interacted.limits ?? {},
          problem: res.interacted.lineProblem ?? "",
          waiting: false,
          seenBy: res.interacted.seenBy ?? [],
          name: S.talk[personId]?.name ?? "",
          bond: res.bond,
        };
        const closedEvent = (res.events ?? []).some((ev) => ev.id === "closed"),
          personName = S.talk[personId]?.name || "They";
        S.said = closedEvent && res.interacted.line ? `${personName}: \u201C${res.interacted.line}\u201D` : "";
        reportEvents(res.events);
        const interrupterId = res.interacted.interruptBy;
        if (interrupterId) {
          S.approachNext = {
            characterId: interrupterId,
            milestone: res.interacted.interruptFor || "jealous",
            name: (S.life.people ?? []).find((person2) => person2.id === interrupterId)?.name ?? "",
          };
        }
      } finally {
        if (S.talk[personId]) {
          S.talk[personId].waiting = false;
        }
      }
    },
    {
      cancel: afterLifeCancel,
    },
  );
};
const nameOfId = (personId) =>
  S.life?.people?.find((person) => person.id === personId)?.name ??
  Object.values(S.life?.corridors ?? {})
    .flatMap((corridor) => corridor.floors.flatMap((floor) => floor.doors.flatMap((door) => door.residents)))
    .find((resident) => resident.id === personId)?.name ??
  "They";
const moodStamp = (mood, applied = {}) => ({
  icon: "\u{1F634}",
  text: mood.name,
  good: mood.key === "fine" || mood.outcome === "fine",
  name:
    Object.entries(applied ?? {})
      .filter(([, value]) => value)
      .map(
        ([stat, delta]) =>
          `${delta > 0 ? "+" : "\u2212"}${Math.abs(Math.round(delta * 10) / 10)} ${stat[0].toUpperCase()}${stat.slice(1)}`,
      )
      .join(" \xB7 ") || "no harm done",
});
const wakeUp = (personId) =>
  act(
    async (signal) => {
      const before = hudSnap(S.life),
        res = await call(`/lives/${S.life.id}/wake`, {
          method: "POST",
          body: {
            character: personId,
          },
          signal: signal,
        });
      S.life = res.life;
      S.roll = {
        from: before,
        ms: 800,
      };
      S.talkTo = personId;
      S.talk[personId] = {
        ...lineOf(res),
        name: nameOfId(personId),
        bond: res.bond,
        applied: res.woke.applied ?? {},
        stamp: moodStamp(res.woke, res.woke.applied),
      };
      S.said = "";
      reportEvents(res.events);
    },
    {
      loading: "They are answering\u2026",
      cancel: afterLifeCancel,
    },
  );
const lineOf = (res) => ({
  line: res.line?.text ?? null,
  problem: res.line ? "" : "no line",
  waiting: false,
});
const knockDoor = (personId) =>
  act(
    async (signal) => {
      const before = hudSnap(S.life),
        personName = nameOfId(personId),
        res = await call(`/lives/${S.life.id}/knock`, {
          method: "POST",
          body: {
            character: personId,
          },
          signal: signal,
        });
      S.life = res.life;
      S.roll = {
        from: before,
        ms: 600,
      };
      S.talkTo = null;
      S.talk = {};
      const knocked = res.knocked;
      if (knocked.answer !== "door") {
        S.said =
          knocked.answer === "out"
            ? `Nobody answers: ${personName} is out.`
            : knocked.answer === "no-answer"
              ? `${personName} doesn't come to the door.`
              : "";
        S.view = "corridor";
        S.corridor = S.life.at;
        reportEvents(res.events);
        return;
      }
      S.said = "";
      S.view = "place";
      S.talk[personId] = {
        ...lineOf(res),
        name: personName,
        bond: S.life.people?.[0]?.bond,
        applied: knocked.applied ?? {},
        stamp: knocked.woke ? moodStamp(knocked.woke, knocked.applied) : null,
      };
      reportEvents(res.events);
    },
    {
      loading: "Knocking\u2026",
      cancel: afterLifeCancel,
    },
  );
const introduceMe = (personId, withId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/introduce`, {
      method: "POST",
      body: {
        character: personId,
        with: withId,
      },
    });
    S.life = res.life;
    S.talk[personId] = {
      ...(S.talk[personId] ?? {}),
      special: false,
      pickIntro: false,
    };
    S.said = res.introduced.said || "";
    reportEvents(res.events);
  });
const payBack = (personId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/debt/pay`, {
      method: "POST",
      body: {
        character: personId,
      },
    });
    S.life = res.life;
    const personName = nameOfId(personId);
    S.said = `Paid back $${res.paidBack.paid} to ${personName}${res.paidBack.left ? ` \xB7 $${res.paidBack.left} left` : ""}.`;
    if (S.view === "contacts" && S.sheet?.id === personId) {
      S.sheet = (await call(`/lives/${S.life.id}/sheet/${personId}`)).sheet;
      S.sheetSaid = {
        id: personId,
        text: S.said,
      };
    }
  });
const keyIn = (personId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/key`, {
      method: "POST",
      body: {
        character: personId,
      },
    });
    S.life = res.life;
    S.said = `You let yourself into ${nameOfId(personId)}'s place.`;
    S.view = "place";
    S.talkTo = null;
    S.talk = {};
    reportEvents(res.events);
  });
const visitIn = () =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/visit`, {
      method: "POST",
      body: {
        action: "in",
      },
    });
    S.life = res.life;
    S.talkTo = null;
    S.talk = {};
    S.said = "";
    S.view = "place";
  });
const seeGuestOut = () =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/guest/bye`, {
      method: "POST",
      body: {},
    });
    S.life = res.life;
    S.talkTo = null;
    S.said = "";
    if (res.goodbye) {
      S.card = goodbyeCardOf(res.goodbye, {
        then: null,
      });
      tellLater(S.card);
    }
  });
const visitOut = (then = "corridor") =>
  S.life?.party && S.life?.visit?.party
    ? partyStep("end")
    : act(async () => {
        const res = await call(`/lives/${S.life.id}/visit`, {
          method: "POST",
          body: {
            action: "out",
          },
        });
        if (
          ((S.life = res.life),
          (S.talkTo = null),
          (S.talk = {}),
          (S.said = (res.events ?? [])
            .map((ev) => ev.text)
            .filter(Boolean)
            .join(" \xB7 ")),
          res.goodbye)
        ) {
          S.card = goodbyeCardOf(res.goodbye, {
            then: then,
          });
          tellLater(S.card);
          return;
        }
        if (then === "map") {
          S.view = "map";
          S.corridor = null;
          return;
        }
        S.view = "corridor";
        S.corridor = S.life.at;
      });
const doTogether = (personId, key, route = "together", extra = {}) =>
  act(async () => {
    const before = hudSnap(S.life),
      res = await call(`/lives/${S.life.id}/${route}`, {
        method: "POST",
        body: {
          character: personId,
          key: key,
          ...extra,
        },
      });
    if (((S.life = res.life), (S.said = ""), !(res.events ?? []).some((ev) => ev.id === "fainted"))) {
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
    reportEvents(res.events);
  });
const stayNight = (personId, minutes = null) =>
  doTogether(personId, null, "stay", {
    minutes: minutes,
  });
const openSleep = (personId = null, activity = "sleep") =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/sleep${personId ? `/${encodeURIComponent(personId)}` : ""}`);
    S.sleep = {
      ...res.sleep,
      character: personId,
      activity: activity,
      minutes: res.sleep.pick,
      at: S.life.at,
      clock: S.life.minutes,
    };
    S.said = "";
  });
const sleepPick = (minutes) => {
  if (S.sleep?.options.some((option) => option.minutes === minutes)) {
    S.sleep.minutes = minutes;
  }
  notify();
};
const sleepClose = () => {
  S.sleep = null;
  notify();
};
const sleepGo = () => {
  const sleep = S.sleep;
  S.sleep = null;
  return sleep.character
    ? stayNight(sleep.character, sleep.minutes)
    : doActivity(sleep.activity ?? "sleep", {
        minutes: sleep.minutes,
      });
};
const sleepOpen = () => (S.sleep && S.sleep.at === S.life?.at && S.sleep.clock === S.life?.minutes ? S.sleep : null);
function reportEvents(events = []) {
  if (events.some((ev) => ev.id === "wedding-day") && S.life?.outing) {
    Object.assign(S, {
      view: "outing",
      outSeg: 0,
      talkTo: null,
      talk: {},
      walk: null,
      afterWalk: null,
      roll: null,
      card: null,
    });
  }
  const approach = [...events].reverse().find((ev) => ev.id === "approach");
  if (approach && !approach.door) {
    S.approachNext = approach;
  }
  const text = events
    .map((ev) => ev.text)
    .filter(Boolean)
    .join(" \xB7 ");
  if (text) {
    S.said = S.said ? `${S.said} \u2014 ${text}` : text;
  }
  const evicted = events.find((ev) => ev.id === "evicted");
  if (evicted) {
    S.evict = {
      ...evicted,
      step: 0,
    };
    S.notice = null;
    S.talkTo = null;
    S.talk = {};
  } else {
    const notice = events.find(
      (ev) =>
        (ev.id === "rent" && !ev.paid) ||
        [
          "partner-covered",
          "evict-warning",
          "couch-over",
          "collections",
          "your-birthday",
          "birthday-missed",
          "birthday-today",
          "mate-left",
        ].includes(ev.id),
    );
    if (notice) {
      S.notice = notice;
    }
  }
  const lunchOver = events.find((ev) => ev.id === "lunch-over");
  if (lunchOver) {
    if (S.card) {
      S.card.hint = "TAP \xB7 THE AFTERNOON";
    } else {
      S.card = lunchCardOf(lunchOver.backToWork, "back");
    }
  }
  const guestOver = events.find((ev) => ev.id === "guest-over");
  if (guestOver?.goodbye) {
    showCard(
      goodbyeCardOf(guestOver.goodbye, {
        then: null,
      }),
    );
  }
  const sleepoverMorning = events.find((ev) => ev.id === "sleepover-morning");
  if (sleepoverMorning) {
    showCard(sleepoverCardOf(sleepoverMorning));
  }
  if (events.some((ev) => ev.id === "party-start") && S.life?.party && S.life.at === "home" && S.view !== "scene") {
    Object.assign(S, {
      view: "place",
      talkTo: null,
      talk: {},
      homePanel: null,
    });
  }
  if (
    events.some((ev) => ev.id === "party-over" && ev.theirs && !ev.home) &&
    (S.view === "place" || S.view === "scene") &&
    !S.life?.visit
  ) {
    S.view = "corridor";
    S.corridor = S.life?.at;
    S.talkTo = null;
    S.talk = {};
  }
  const visitOver = events.find((ev) => ev.id === "visit-over");
  if (
    (visitOver &&
      ((S.talkTo = null),
      (S.talk = {}),
      visitOver.goodbye && !S.card && ((S.card = goodbyeCardOf(visitOver.goodbye)), tellLater(S.card)),
      S.card ? (S.card.then = "corridor") : S.view === "place" && ((S.view = "corridor"), (S.corridor = S.life?.at))),
    events.some((ev) => ev.id === "fainted"))
  ) {
    const fainted = events.find((ev) => ev.id === "fainted");
    S.said = fainted.text;
    if (S.view === "kitchen" && S.life?.outing) {
      Object.assign(S, {
        view: "outing",
        kitchenFor: null,
        cooked: null,
      });
    }
    if (S.view === "scene" || S.view === "outing") {
      S.faintAfterScene = faintOf(fainted, S.life);
    } else {
      S.faint = faintOf(fainted, S.life);
    }
    const onOuting = S.view === "outing" && !!S.life?.outing;
    S.card = null;
    S.afterWalk = null;
    S.roll = null;
    S.talkTo = null;
    S.talk = {};
    S.walk = null;
    if (S.view !== "scene" && !onOuting) {
      S.view = "place";
    }
    return;
  }
  if (events.some((ev) => ev.id === "closed") && (S.view === "place" || S.view === "corridor" || S.view === "shop")) {
    S.view = "map";
    S.talkTo = null;
    S.talk = {};
  }
}

export {
  doTogether,
  introduceMe,
  keyIn,
  knockDoor,
  openSleep,
  payBack,
  reportEvents,
  seeGuestOut,
  sleepClose,
  sleepGo,
  sleepOpen,
  sleepPick,
  stayNight,
  talkDone,
  talkTo,
  visitIn,
  visitOut,
  wakeUp,
};
