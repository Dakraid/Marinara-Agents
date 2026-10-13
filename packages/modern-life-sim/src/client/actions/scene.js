// Scene, setup and wedding actions
import { heldForPicture } from "../views/scene.js";
import { openHouseParty, outingLines, outingPost, outingReread, partyStep } from "../views/outings.js";
import { hudSnap } from "../views/cards.js";
import { S, act, afterLifeCancel, call, notify, openOnServer } from "../state.js";
import { sceneWalk, startScene } from "./title.js";
import { openKitchenWith, watchPaint } from "./phone.js";
import { goTo, openRack, shutWhy } from "./town.js";
import { doTogether, reportEvents, stayNight } from "./talk.js";

const setYourGender = (gender) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/gender`, {
      method: "POST",
      body: {
        gender: gender,
      },
    });
    S.life = res.life;
  });
const setOrientation = (characterId, field, value) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/cast/orientation`, {
      method: "POST",
      body: {
        character: characterId,
        [field]: value,
      },
    });
    S.life = res.life;
  });
const setJobFor = (characterId, job, title = "") =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/cast/job`, {
      method: "POST",
      body: {
        character: characterId,
        job: job,
        title: title,
      },
    });
    S.life = res.life;
  });
const saveWorkOutfit = (characterId, outfit) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/sheet/${characterId}/work`, {
      method: "POST",
      body: {
        outfit: outfit,
      },
    });
    S.life = res.life;
    S.sheet = res.sheet;
    S.workEdit = null;
  });
const redoWorkSprite = (characterId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/sheet/${characterId}/work/redo`, {
      method: "POST",
      body: {},
    });
    S.life = res.life;
    S.sheet = res.sheet;
  }).then(() => watchPaint());
const saveSeasonOutfit = (characterId, season, outfit) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/sheet/${characterId}/season`, {
      method: "POST",
      body: {
        season: season,
        outfit: outfit,
      },
    });
    S.life = res.life;
    S.sheet = res.sheet;
    S.seasonEdit = null;
  });
const redoSeasonPicture = (characterId, season) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/sheet/${characterId}/season/redo`, {
      method: "POST",
      body: {
        season: season,
      },
    });
    S.life = res.life;
    S.sheet = res.sheet;
  }).then(() => watchPaint());
const setFrame = (frame) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/frame`, {
      method: "POST",
      body: {
        frame: frame,
      },
    });
    S.life = res.life;
  });
const setPictureSize = (size) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/size`, {
      method: "POST",
      body: {
        size: size,
      },
    });
    S.life = res.life;
  });
const setPortraitSize = (size) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/portrait-size`, {
      method: "POST",
      body: {
        size: size,
      },
    });
    S.life = res.life;
  });
const answerDoor = (open) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/door`, {
      method: "POST",
      body: {
        open: open,
      },
    });
    S.life = res.life;
    S.said = res.said || "";
    if (res.came) {
      S.approachNext = {
        ...res.came,
        loading: `${String(res.came.name).toUpperCase()} COMES IN\u2026`,
      };
    }
  });
const sceneNext = () => {
  const scene = S.life?.scene;
  if (!(!scene || S.sceneWaiting || heldForPicture(scene, S.sceneSeg))) {
    if (S.sceneSeg < scene.batch.length && (!scene.done || scene.endedBy !== "player" || scene.goodbye)) {
      S.sceneSeg++;
      notify();
    }
  }
};
const sceneSkip = () => {
  if (S.view === "outing" && S.life?.outing) {
    S.outSeg = outingLines(S.life.outing).length;
    notify();
    return;
  }
  const scene = S.life?.scene;
  if (!(!scene || S.sceneWaiting)) {
    S.sceneSeg = scene.batch.length;
    notify();
  }
};
const sceneAuto = () => {
  S.sceneAuto = !S.sceneAuto;
  notify();
};
const sceneLogToggle = () => {
  S.sceneLog = !S.sceneLog;
  notify();
};
const sceneReply = (text, { byGame = false } = {}) => {
  const reply = String(text ?? "").trim();
  if (!(!reply || S.sceneWaiting)) {
    S.sceneWaiting = reply;
    return act(
      async (signal) => {
        try {
          const res = await call(`/lives/${S.life.id}/scene/reply`, {
            method: "POST",
            body: {
              text: reply,
              ...(byGame
                ? {
                    byGame: byGame,
                  }
                : {}),
            },
            signal: signal,
          });
          S.life = res.life;
          S.sceneSeg = 0;
          reportEvents(res.events);
        } finally {
          S.sceneWaiting = "";
        }
      },
      {
        loading: "They are answering\u2026",
        cancel: afterLifeCancel,
        ...(byGame
          ? {
              stuck: {
                again: () =>
                  sceneReply(reply, {
                    byGame: byGame,
                  }),
              },
            }
          : {}),
      },
    );
  }
};
const sceneKey = (scene) => (scene ? `${scene.kind}|${scene.characterId}|${scene.startedAt}` : "");
const sceneDecide = (choice, { noLines = false } = {}) =>
  act(
    async (signal) => {
      const before = hudSnap(S.life),
        prevKey = sceneKey(S.life.scene),
        res = await call(`/lives/${S.life.id}/scene/decide`, {
          method: "POST",
          body: {
            choice: choice,
            ...(noLines
              ? {
                  noLines: noLines,
                }
              : {}),
          },
          signal: signal,
        });
      S.life = res.life;
      if (choice === "step" || choice === "wait" || S.life.scene?.milestone || sceneKey(S.life.scene) !== prevKey) {
        S.sceneSeg = 0;
      }
      sceneWalk(before);
      reportEvents(res.events);
    },
    {
      ...(choice === "step" || S.life?.scene?.milestone
        ? {
            loading: S.life?.scene?.tier?.favour ? "Doing them the favour\u2026" : "The moment\u2026",
            cancel: afterLifeCancel,
          }
        : choice === "wait"
          ? {
              loading: "They take it in\u2026",
              cancel: afterLifeCancel,
            }
          : {}),
      stuck: {
        again: () => sceneDecide(choice),
        skip: () =>
          sceneDecide(choice, {
            noLines: true,
          }),
      },
    },
  );
const pleaAnswer = (answer) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/plea`, {
      method: "POST",
      body: {
        answer: answer,
      },
    });
    S.life = res.life;
    if (res.plea.say && S.view === "scene") {
      setTimeout(
        () =>
          sceneReply(res.plea.say, {
            byGame: true,
          }),
        0,
      );
    } else {
      S.said = res.plea.tags.map((tag) => tag.text).join(" \xB7 ");
    }
    if (res.plea.say && S.view === "outing" && S.life.outing?.phase === "talk") {
      setTimeout(
        () =>
          outingPost(
            "say",
            {
              text: res.plea.say,
              byGame: true,
            },
            {
              lines: true,
              loading: "They are answering\u2026",
            },
          ),
        0,
      );
    }
    reportEvents(res.events);
  });
const walkInAnswer = (choice) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/scene/walk-in`, {
      method: "POST",
      body: {
        choice: choice,
      },
    });
    S.life = res.life;
    reportEvents(res.events);
    if (!S.life.scene?.done) {
      setTimeout(
        () =>
          sceneReply(res.walkIn.say, {
            byGame: true,
          }),
        0,
      );
    }
  });
const birthdayMessage = (characterId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/birthday/message`, {
      method: "POST",
      body: {
        character: characterId,
      },
    });
    S.life = res.life;
    S.sheet = res.sheet;
    S.said = [res.birthday.text, ...(res.birthday.tags ?? []).map((tag) => tag.text)].filter(Boolean).join(" \xB7 ");
  });
const rideAnswer = (answer) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/ride`, {
      method: "POST",
      body: {
        answer: answer,
      },
    });
    S.life = res.life;
    S.sceneSeg = S.life.scene?.batch?.length ?? 0;
    if (res.ride.say && S.view === "scene") {
      setTimeout(
        () =>
          sceneReply(res.ride.say, {
            byGame: true,
          }),
        0,
      );
    }
    reportEvents(res.events);
  });
const proposeTonight = (choice) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/propose/tonight`, {
      method: "POST",
      body: {
        choice: choice,
      },
    });
    S.life = res.life;
    S.sceneSeg = S.life.scene?.batch?.length ?? 0;
    reportEvents(res.events);
  });
const openWeddingDay = () =>
  act(async () => {
    if (S.life.scene) {
      const res = await call(`/lives/${S.life.id}/scene/close`, {
        method: "POST",
        body: {},
      });
      S.life = res.life;
    }
    const { days: days } = await call(`/lives/${S.life.id}/wedding/days`);
    S.weddingDay = {
      days: days,
      pick: days.find((day) => !day.works)?.d ?? days[0]?.d ?? null,
    };
    S.view = "wedding-day";
  });
const setWeddingDay = () =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/wedding/date`, {
      method: "POST",
      body: {
        day: S.weddingDay?.pick,
      },
    });
    S.life = res.life;
    S.weddingDay = null;
    S.view = "map";
    S.said = `Your wedding: ${res.date} \xB7 on your calendars`;
  });
const openWedding = () =>
  act(async () => {
    S.phone = false;
    S.wedding = (await call(`/lives/${S.life.id}/wedding`)).wedding;
    S.weddingTab ??= "plan";
    S.said = "";
    S.view = "wedding";
  });
const weddingCall = (action, body) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/wedding/${action}`, {
      method: "POST",
      body: body,
    });
    S.life = res.life;
    S.wedding = res.wedding;
    S.said = "";
  });
const weddingChoose = (what, id) =>
  weddingCall("choose", {
    what: what,
    id: id,
  });
const weddingInvite = (characterId, on) =>
  weddingCall("invite", {
    character: characterId,
    on: on,
  });
const weddingSend = () => weddingCall("send", {});
const vehicleSell = (itemId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/vehicles/sell`, {
      method: "POST",
      body: {
        item: itemId,
      },
    });
    S.life = res.life;
    S.shop = (await openOnServer(`/lives/${S.life.id}/shop/online`)).shop;
    S.said = `Sold your ${res.sold.name.toLowerCase()} \xB7 +$${res.sold.price.toLocaleString("en-US")}`;
  });
const pleaUndo = () =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/plea/undo`, {
      method: "POST",
      body: {},
    });
    S.life = res.life;
    S.sceneSeg = S.life.scene?.batch?.length ?? 0;
  });
const suitsAsk = async (characterId) => {
  let asked = false;
  await act(async () => {
    const res = await call(`/lives/${S.life.id}/suits`, {
      method: "POST",
      body: {
        character: characterId,
      },
    });
    S.life = res.life;
    delete S.talk[characterId];
    reportEvents(res.events);
    asked = true;
  });
  if (asked && S.view === "place") {
    openRack();
  }
};
const lentAsk = (characterId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/lent/ask`, {
      method: "POST",
      body: {
        character: characterId,
      },
    });
    S.life = res.life;
    S.talk[characterId] = {
      special: true,
    };
    S.said = res.back.text;
  });
const sceneUndetect = () =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/scene/undo-detect`, {
      method: "POST",
      body: {},
    });
    S.life = res.life;
    S.sceneSeg = S.life.scene?.batch?.length ?? 0;
  });
const sceneEnd = ({ noLines = false } = {}) =>
  act(
    async (signal) => {
      const logLength = S.life.scene?.log?.length ?? 0,
        plea = S.life.plea?.open,
        pleaSeen =
          !!plea &&
          plea.where === "scene" &&
          (plea.host ?? plea.characterId) === S.life.scene?.characterId &&
          (S.sceneSeg ?? 0) >= (S.life.scene?.batch?.length ?? 0),
        res = await call(`/lives/${S.life.id}/scene/end`, {
          method: "POST",
          body: {
            ...(plea
              ? {
                  pleaSeen: pleaSeen,
                }
              : {}),
            ...(noLines
              ? {
                  noLines: noLines,
                }
              : {}),
          },
          signal: signal,
        });
      S.life = res.life;
      if (S.life.scene?.goodbye) {
        S.sceneSeg = 0;
      }
      if (S.life.scene?.moment && (S.life.scene.log?.length ?? 0) > logLength) {
        S.sceneSeg = 0;
      }
    },
    S.life?.scene?.beat?.next === "moment"
      ? {
          loading: "The moment\u2026",
          cancel: afterLifeCancel,
        }
      : S.life?.scene?.kind === "tier"
        ? {}
        : {
            loading: "Saying goodbye\u2026",
            cancel: afterLifeCancel,
            stuck: {
              again: () => sceneEnd(),
              skip: () =>
                sceneEnd({
                  noLines: true,
                }),
            },
          },
  );
const sceneClose = async () => {
  const together = S.life?.scene?.together
      ? {
          character: S.life.scene.characterId,
          key: S.life.scene.together.key,
        }
      : null,
    ride = S.life?.scene?.ride ?? null,
    stayWith = S.life?.scene?.stay ? S.life.scene.characterId : null,
    next = S.life?.scene?.next
      ? {
          character: S.life.scene.characterId,
          ...S.life.scene.next,
        }
      : null,
    partyPlan = S.life?.scene?.partyPlan ?? null;
  await sceneCloseOnly();
  if (partyPlan && S.life && !S.life.scene) {
    await openHouseParty({
      with: partyPlan.with,
    });
  }
  const kitchen =
    together &&
    (S.life?.together ?? [])
      .find((entry) => entry.characterId === together.character)
      ?.items?.find((entry) => entry.key === together.key)?.kitchen;
  if (together && S.life && !S.life.scene && together.key.startsWith("party:")) {
    if (S.life.party) {
      await partyStep("do", {
        key: together.key.slice(6),
        with: together.character,
      });
    }
  } else if (together && S.life && !S.life.scene) {
    await (kitchen ? openKitchenWith(together.character) : doTogether(together.character, together.key));
  }
  if (ride && S.life && !S.life.scene) {
    await goTo(ride.place, {
      ride: true,
    });
  }
  if (stayWith && S.life && !S.life.scene) {
    await stayNight(stayWith);
  }
  if (next && S.life && !S.life.scene) {
    await startScene(next.character, "milestone", next.milestone, null, null, next.how ?? null);
  }
};
const sceneCloseOnly = ({ noLines = false } = {}) =>
  act(
    async () => {
      const closed = S.life?.scene?.endedBy === "closed" || !!shutWhy(S.life?.at),
        prevOuting = S.life?.outing,
        res = await call(`/lives/${S.life.id}/scene/close`, {
          method: "POST",
          body: noLines
            ? {
                noLines: noLines,
              }
            : {},
        });
      if (((S.life = res.life), (S.sceneLog = false), res.morning && S.life?.scene)) {
        S.view = "scene";
        S.sceneSeg = 0;
        S.outSeg = 0;
        reportEvents(res.events);
        return;
      }
      S.view = S.life?.outing ? "outing" : closed ? "map" : "place";
      if (S.life?.outing) {
        outingReread(prevOuting, S.life.outing);
      }
      reportEvents(res.events);
      if (S.faintAfterScene) {
        S.faint = S.faintAfterScene;
        S.faintAfterScene = null;
      }
    },
    {
      stuck: {
        again: () => sceneCloseOnly(),
        skip: () =>
          sceneCloseOnly({
            noLines: true,
          }),
      },
    },
  );

export {
  answerDoor,
  birthdayMessage,
  lentAsk,
  openWedding,
  openWeddingDay,
  pleaAnswer,
  pleaUndo,
  proposeTonight,
  redoSeasonPicture,
  redoWorkSprite,
  rideAnswer,
  saveSeasonOutfit,
  saveWorkOutfit,
  sceneAuto,
  sceneClose,
  sceneCloseOnly,
  sceneDecide,
  sceneEnd,
  sceneLogToggle,
  sceneNext,
  sceneReply,
  sceneSkip,
  sceneUndetect,
  setFrame,
  setJobFor,
  setOrientation,
  setPictureSize,
  setPortraitSize,
  setWeddingDay,
  setYourGender,
  suitsAsk,
  vehicleSell,
  walkInAnswer,
  weddingChoose,
  weddingInvite,
  weddingSend,
};
