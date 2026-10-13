// NPC money pleas (pay/lend/give), answers and undo, loans and asking for repayment
import { formatCalendarDate } from "../time/clock.mjs";
import { eventCast } from "../events/event-cast.mjs";
import { adjustBondAxis } from "../relationships/bonds.mjs";
import { earnMoney, spendMoney } from "./wallet.mjs";
import { bondOf, characterOf, logNote, nameFor } from "../game.mjs";

var LENT_DAY_MINUTES = 1440;
var PLEA_PAID = 3;
var PLEA_REFUSED = -1;
var LENT_WAIT_DAYS = 7;
var lentDateLabel = (life, minutes) =>
  formatCalendarDate(minutes, {
    from: life.startedAt,
  }).replace(/ · Year \d+$/, "");
function openPlea(life, characterId, ask, where = "scene") {
  if (!ask || life.plea) {
    return null;
  }
  let { who = null, ...rest } = ask,
    askerId = who && who !== characterId ? who : characterId;
  life.plea = {
    characterId: askerId,
    ...rest,
    where: where,
    at: life.minutes,
    ...(askerId !== characterId
      ? {
          host: characterId,
        }
      : {}),
  };
  characterId = askerId;
  logNote(
    life,
    `${nameFor(life, characterOf(life, characterId))} asked you for $${ask.amount}${ask.what ? ` (${ask.what})` : ""}`,
    "money",
  );
  return life.plea;
}
function stalePlea(life) {
  let plea = life.plea;
  if (!(
    !plea ||
    (plea.where === "outing"
      ? life.outing?.characterId === hostOf(plea) && !life.outing.summary?.fainted
      : life.scene &&
        !life.scene.done &&
        life.scene.characterId === hostOf(plea) &&
        eventCast(life.scene).includes(plea.characterId))
  )) {
    if (plea.where === "scene" && life.scene?.done) {
      pleaLeftInScene(life);
    }
    dropPlea(life);
  }
}
var pleaOpenIn = (life, where, hostId) =>
  life.plea?.where === where && hostOf(life.plea) === hostId ? life.plea : null;
var hostOf = (plea) => plea?.host ?? plea?.characterId ?? null;
function passPlea(life, where, hostId) {
  let plea = pleaOpenIn(life, where, hostId);
  if (plea) {
    plea.passed = true;
  }
  return !!plea;
}
function leavePleaUnanswered(life, { end = false } = {}) {
  let plea = life.plea;
  if (!plea || (!plea.passed && !end)) {
    return null;
  }
  let friendship = pleaFriendship(life, plea.characterId, PLEA_REFUSED);
  life.plea = null;
  life.pleaDone = null;
  logNote(life, `Left ${nameFor(life, characterOf(life, plea.characterId))} unanswered ($${plea.amount})`, "money");
  return {
    amount: plea.amount,
    friendship: friendship,
  };
}
function pleaLeftInScene(life, { end = false } = {}, scene = life.scene) {
  if (!scene || scene.endedBy === "fainted" || !pleaOpenIn(life, "scene", scene.characterId)) {
    return null;
  }
  let askerId = life.plea.characterId,
    left = leavePleaUnanswered(life, {
      end: end,
    });
  return left
    ? (askerId === scene.characterId &&
        (scene.totals.friendship = Math.round(((scene.totals.friendship ?? 0) + left.friendship) * 10) / 10),
      (scene.unanswered = {
        amount: left.amount,
        ...(askerId !== scene.characterId
          ? {
              name: nameFor(life, characterOf(life, askerId)),
            }
          : {}),
      }),
      left)
    : null;
}
function pleaLeftInOuting(life) {
  let outing = life.outing;
  return !outing || !pleaOpenIn(life, "outing", outing.characterId) ? null : leavePleaUnanswered(life);
}
function dropPlea(life, where = null) {
  if (life.plea && (!where || life.plea.where === where)) {
    life.plea = null;
  }
  life.pleaDone = null;
}
var PLEA_ASK_WORDS = {
  pay: "asks you to pay",
  lend: "asks you to lend",
  give: "asks you for",
};
var PLEA_PAY_LABELS = {
  pay: "Pay",
  lend: "Lend",
  give: "Give",
};
function pleaView(life) {
  let plea = life.plea,
    done = life.pleaDone,
    askerName = plea ? nameFor(life, characterOf(life, plea.characterId)) : "",
    canPay = !!plea && life.wallet.cash >= plea.amount;
  return {
    open: plea
      ? {
          characterId: plea.characterId,
          host: hostOf(plea),
          name: askerName,
          kind: plea.kind,
          what: plea.what,
          amount: plea.amount,
          where: plea.where,
          can: canPay,
          cash: life.wallet.cash,
          head: [
            {
              id: "head",
              label: `${askerName} ${PLEA_ASK_WORDS[plea.kind] ?? PLEA_ASK_WORDS.give}`,
            },
          ],
          options: [
            {
              id: "pay",
              label: `${PLEA_PAY_LABELS[plea.kind] ?? PLEA_PAY_LABELS.give} $${plea.amount}`,
              ...(canPay
                ? {
                    note: plea.kind === "lend" ? "You can ask for it back after a week" : "It's theirs",
                  }
                : {
                    why: `You can't: you have $${life.wallet.cash}`,
                  }),
            },
            {
              id: "no",
              label: "Not now",
              note: `\u2212${Math.abs(PLEA_REFUSED)} Friendship`,
            },
          ],
        }
      : null,
    read: done
      ? {
          answer: done.answer,
          paid: done.paid ?? 0,
          asked: done.amount,
          kind: done.kind,
        }
      : null,
  };
}
function pleaFriendship(life, characterId, delta) {
  let bond = bondOf(life, characterId);
  return bond
    ? adjustBondAxis(bond, "friendship", delta, {
        at: life.minutes,
      })
    : 0;
}
function answerPlea(life, answer, { amount = null, words = false } = {}) {
  let plea = life.plea;
  if (!plea) {
    return {
      ok: false,
      reason: "Nobody is asking you for anything.",
    };
  }
  let askerName = nameFor(life, characterOf(life, plea.characterId)),
    friendshipBefore = bondOf(life, plea.characterId)?.friendship ?? 0;
  if (answer === "refuse") {
    pleaFriendship(life, plea.characterId, PLEA_REFUSED);
    life.plea = null;
    life.pleaDone = words
      ? {
          ...plea,
          answer: answer,
          before: friendshipBefore,
        }
      : null;
    logNote(life, `Said no to ${askerName} ($${plea.amount})`, "money");
    return {
      ok: true,
      answer: answer,
      tags: [
        {
          text: `NOT NOW \xB7 ${PLEA_REFUSED} FRIENDSHIP`,
          bad: true,
          plea: true,
        },
      ],
    };
  }
  if (answer !== "pay") {
    return {
      ok: false,
      reason: "Pay, or not now.",
    };
  }
  let paid = amount === null ? plea.amount : Math.floor(Number(amount) || 0);
  if (paid <= 0) {
    return {
      ok: false,
      reason: "How much?",
    };
  }
  if (life.wallet.cash < paid) {
    return {
      ok: false,
      reason: `You have $${life.wallet.cash}.`,
    };
  }
  let label =
    plea.kind === "lend"
      ? `Lent to ${askerName}`
      : plea.kind === "pay"
        ? `Paid for ${askerName}${plea.what ? `: ${plea.what}` : ""}`
        : `Gave ${askerName}`;
  spendMoney(life.wallet, paid, label, life.minutes);
  let lentId = null;
  if (plea.kind === "lend") {
    life.lent ??= [];
    lentId = `lent-${life.minutes}-${life.lent.length}`;
    life.lent.push({
      id: lentId,
      characterId: plea.characterId,
      amount: paid,
      for: plea.what,
      at: life.minutes,
    });
  }
  pleaFriendship(life, plea.characterId, PLEA_PAID);
  life.plea = null;
  life.pleaDone = words
    ? {
        ...plea,
        answer: answer,
        paid: paid,
        before: friendshipBefore,
        lentId: lentId,
      }
    : null;
  logNote(life, `${label} ($${paid})`, "money");
  let verb = plea.kind === "lend" ? "LENT" : plea.kind === "pay" ? "PAID" : "GAVE";
  return {
    ok: true,
    answer: answer,
    paid: paid,
    tags: [
      {
        text: `${verb} $${paid}${paid !== plea.amount ? ` OF THE $${plea.amount}` : ""}${plea.what ? ` \xB7 ${plea.what.toUpperCase()}` : ""}`,
        plea: true,
      },
      {
        text: `+${PLEA_PAID} FRIENDSHIP`,
        step: true,
        plea: true,
      },
    ],
  };
}
function undoPlea(life) {
  let done = life.pleaDone;
  if (!done) {
    return {
      ok: false,
      reason: "There is nothing to undo.",
    };
  }
  if (done.paid) {
    life.wallet.cash += done.paid;
    life.wallet.ledger.push({
      at: life.minutes,
      amount: done.paid,
      label: `Undone \xB7 ${done.kind === "lend" ? "not lent" : "not paid"}`,
      balance: life.wallet.cash,
    });
  }
  if (done.lentId) {
    life.lent = (life.lent ?? []).filter((loan) => loan.id !== done.lentId);
  }
  let bond = bondOf(life, done.characterId);
  if (bond) {
    bond.friendship = done.before;
  }
  let { answer: answer, paid: paid, before: before, lentId: lentId, ...plea } = done;
  if (done.where === "outing" ? !life.outing || life.outing.phase === "summary" : !life.scene || life.scene.done) {
    delete plea.passed;
  }
  life.plea = plea;
  life.pleaDone = null;
  return {
    ok: true,
  };
}
function lendFor(life, characterId, amount, forWhat = "") {
  let lent = Math.min(amount, life.wallet.cash);
  if (lent <= 0) {
    return null;
  }
  spendMoney(life.wallet, lent, `Lent to ${nameFor(life, characterOf(life, characterId)) ?? "a friend"}`, life.minutes);
  life.lent ??= [];
  let loanId = `lent-${life.minutes}-${life.lent.length}`;
  life.lent.push({
    id: loanId,
    characterId: characterId,
    amount: lent,
    for: forWhat,
    at: life.minutes,
  });
  return loanId;
}
var openLoansTo = (life, characterId) =>
  (life.lent ?? []).filter((loan) => loan.characterId === characterId && loan.amount > 0);
var lentTo = (life, characterId) => openLoansTo(life, characterId).reduce((sum, loan) => sum + loan.amount, 0);
var askBackFrom = (life, characterId) =>
  Math.max(...openLoansTo(life, characterId).map((loan) => loan.at)) + LENT_WAIT_DAYS * LENT_DAY_MINUTES;
var canAskBack = (life, characterId) => lentTo(life, characterId) > 0 && life.minutes >= askBackFrom(life, characterId);
function lentView(life) {
  return [...new Set((life.lent ?? []).filter((item) => item.amount > 0).map((item) => item.characterId))].map(
    (item) => {
      let loans = openLoansTo(life, item),
        away = !!characterOf(life, item)?.away;
      return {
        characterId: item,
        name: nameFor(
          life,
          characterOf(life, item) ?? {
            id: item,
            name: "Someone",
          },
        ),
        amount: lentTo(life, item),
        for: [...new Set(loans.map((loan) => loan.for).filter(Boolean))].join(", "),
        lent: lentDateLabel(life, loans[0].at),
        from: lentDateLabel(life, askBackFrom(life, item)),
        can: canAskBack(life, item) && !away,
        ...(away
          ? {
              away: true,
            }
          : {}),
      };
    },
  );
}
function askBack(life, characterId) {
  let owed = lentTo(life, characterId),
    debtorName = nameFor(life, characterOf(life, characterId));
  return owed
    ? canAskBack(life, characterId)
      ? (earnMoney(life.wallet, owed, `Paid back by ${debtorName}`, life.minutes),
        (life.lent = (life.lent ?? []).filter((loan) => loan.characterId !== characterId)),
        logNote(life, `${debtorName} paid you back $${owed}`, "money"),
        {
          ok: true,
          paid: owed,
          text: `${debtorName} paid you back $${owed}.`,
        })
      : {
          ok: true,
          paid: 0,
          soon: lentDateLabel(life, askBackFrom(life, characterId)),
          text: `${debtorName}: \xABGive me a few days.\xBB You can ask again from ${lentDateLabel(life, askBackFrom(life, characterId))}.`,
        }
    : {
        ok: false,
        reason: `${debtorName} owes you nothing.`,
      };
}

export {
  LENT_WAIT_DAYS,
  PLEA_PAID,
  PLEA_REFUSED,
  answerPlea,
  askBack,
  canAskBack,
  dropPlea,
  hostOf,
  lendFor,
  lentTo,
  lentView,
  openPlea,
  passPlea,
  pleaLeftInOuting,
  pleaLeftInScene,
  pleaOpenIn,
  pleaView,
  stalePlea,
  undoPlea,
};
