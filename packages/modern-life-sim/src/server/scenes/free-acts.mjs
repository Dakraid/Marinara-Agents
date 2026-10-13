// Free player acts in scenes: outcome decisions, prompt blocks and parsing of did/ask/ride JSON
import { MILESTONE_COUPLE_STATUSES } from "../relationships/milestones.mjs";

var FREE_ACT_DESCRIPTIONS = {
  hug: "hugs them",
  hands: "takes their hand",
  kiss: "kisses them",
  "ask-out": "asks them out, or says they like them that way",
  partners: "asks them to be a couple: official, exclusive",
  "move-in": "asks them to move in together",
  propose: "asks them to marry",
  "break-up": "ends things with them",
  "ask-open": "asks whether it is fine to see someone else (and names who)",
  invite: "asks them to go out somewhere on a given day: a hang out or a date",
  party: "invites them to a party the player is throwing at home",
  "introduce-me": "asks them to introduce the player to someone they know",
  choose: "says who they choose, when they are made to choose between two people, or that they will not choose",
  "ask-money-back": "asks them to pay back money the player lent them",
  "ask-loan": "asks them for money, to borrow or to have (how much goes in `loan`)",
  "ask-birthday": "asks them when their birthday is",
  "happy-birthday": "wishes them a happy birthday",
  "take-step": "takes the moment this scene builds toward (THE MOMENT above), or asks for it right now",
};
var FREE_ACT_IDS = Object.keys(FREE_ACT_DESCRIPTIONS);
var CLAIM_DESCRIPTIONS = {
  dating: "are seeing each other / are together",
  kissed: "kissed",
  flirting: "are flirting",
  "broke-up": "broke up",
};
var CLAIM_IDS = Object.keys(CLAIM_DESCRIPTIONS);
var JOB_REQUEST_DESCRIPTIONS = {
  "day-off": "asks for a day off",
  quit: "says they quit the job",
  apply: "asks to be hired",
};
var MILESTONE_BANNER_LABELS = {
  "first-kiss": "FIRST KISS",
  dating: "DATING",
  partners: "PARTNERS",
};
var ROMANTIC_ACT_IDS = ["hands", "kiss", "ask-out", "partners"];
var EVENT_STEP_ACTS = {
  "ask-out": ["ask-out"],
  partners: ["partners"],
  "move-in": ["move-in"],
  propose: ["propose"],
  "first-kiss": ["kiss"],
  "tier-confess": ["ask-out", "partners"],
  "mate-in": ["move-in"],
  reconcile: ["ask-out", "partners"],
  "open-ask": ["ask-open"],
};
var eventStepCoversAct = (stepId, act) => !!EVENT_STEP_ACTS[stepId]?.includes(act);
var outcomeYes = (step = null) => ({
  how: "yes",
  ...(step
    ? {
        step: step,
      }
    : {}),
});
var outcomeSoft = (reason = "") => ({
  how: "soft",
  why: reason,
});
var outcomeNo = (reason) => ({
  how: "no",
  why: reason,
});
function decideFreeActOutcomes(ctx) {
  let isCouple = MILESTONE_COUPLE_STATUSES.includes(ctx.status),
    isBlocked = (blockKey) => (ctx.blocked?.[blockKey] ?? 0) > (ctx.at ?? 0),
    romanceBar =
      ctx.justFriends || ctx.romanceable === false
        ? "they are not open to that with the player"
        : ctx.couple && !isCouple && (ctx.stray ?? 0) < 1
          ? `they are with ${ctx.couple.name}`
          : "",
    romanceOutcome = (willing, step = null) =>
      romanceBar
        ? outcomeNo(romanceBar)
        : isBlocked("romance")
          ? outcomeNo("they already told the player no, days ago, and have not changed their mind")
          : willing && ctx.going
            ? outcomeYes(step)
            : ctx.romanceTier >= 1 || willing
              ? outcomeSoft("not yet")
              : outcomeNo("they do not feel that way about the player"),
    outcomes = {};
  if (ctx.event) {
    outcomes["take-step"] = ctx.stepAhead
      ? {
          how: "confirm",
        }
      : {
          how: "none",
        };
    outcomes.hug = ctx.friendshipTier >= 2 || ctx.romanceTier >= 1 || isCouple ? outcomeYes() : outcomeSoft();
    outcomes.hands = isCouple || ctx.romanceTier >= 2 ? outcomeYes() : outcomeSoft();
    outcomes.kiss =
      isCouple && ctx.firstKiss
        ? outcomeYes()
        : eventStepCoversAct(ctx.stepOf, "kiss")
          ? outcomes["take-step"]
          : outcomeSoft("not in this moment");
    for (let act of ["ask-out", "partners", "move-in", "propose"]) {
      outcomes[act] = eventStepCoversAct(ctx.stepOf, act) ? outcomes["take-step"] : outcomeSoft("not in this moment");
    }
    if (outcomes.partners.how === outcomes["ask-out"].how) {
      outcomes.partners = {
        ...outcomes.partners,
        as: "ask-out",
      };
    }
    outcomes["break-up"] = {
      how: "none",
    };
    outcomes["ask-open"] = eventStepCoversAct(ctx.stepOf, "ask-open")
      ? outcomes["take-step"]
      : {
          how: "none",
        };
    outcomes.invite = outcomeSoft("not in this moment");
    outcomes.choose = ctx.ultimatum
      ? {
          how: "confirm",
        }
      : {
          how: "none",
        };
    outcomes["introduce-me"] = outcomeSoft("not in this moment");
    outcomes["ask-money-back"] = moneyBackOutcomeFor(ctx);
    outcomes["ask-loan"] = ctx.outing
      ? loanOutcomeFor(ctx)
      : {
          ...outcomeSoft("not in this moment"),
          code: "moment",
        };
    Object.assign(outcomes, birthdayOutcomesFor(ctx));
    return applyKinOutcomeOverrides(ctx, outcomes);
  }
  outcomes.hug = ctx.friendshipTier >= 2 || ctx.romanceTier >= 1 || isCouple ? outcomeYes() : outcomeSoft();
  outcomes.hands = isCouple
    ? outcomeYes()
    : romanceBar
      ? outcomeSoft(romanceBar)
      : ctx.romanceTier >= 2
        ? outcomeYes()
        : outcomeSoft();
  outcomes.kiss = isCouple
    ? ctx.firstKiss
      ? outcomeYes()
      : ctx.firstKissOk && ctx.going
        ? outcomeYes("first-kiss")
        : outcomeSoft("not yet")
    : romanceOutcome(ctx.romanceTier >= 2, ctx.firstKiss ? null : "first-kiss");
  outcomes["ask-out"] = isCouple
    ? {
        how: "already",
      }
    : ctx.status === "ex"
      ? romanceBar
        ? outcomeSoft(romanceBar)
        : ctx.reconcile?.ok
          ? {
              how: "confirm",
            }
          : outcomeSoft(ctx.reconcile?.reason || "too soon")
      : ctx.datingWhy && !romanceBar
        ? outcomeSoft(ctx.datingWhy)
        : romanceOutcome(ctx.confession === "ready", "dating");
  outcomes.partners =
    ctx.status === "dating"
      ? ctx.partnersOk && ctx.going
        ? outcomeYes("partners")
        : outcomeSoft(ctx.partnersWhy || "not yet")
      : isCouple
        ? {
            how: "already",
          }
        : {
            ...outcomes["ask-out"],
            as: "ask-out",
          };
  outcomes["move-in"] = isCouple
    ? ctx.moveInOk
      ? {
          how: "confirm",
        }
      : outcomeSoft(ctx.moveInWhy || "not yet")
    : outcomeSoft("too soon");
  outcomes.propose = ctx.propose?.ok
    ? {
        how: "confirm",
      }
    : outcomeSoft(isCouple ? ctx.propose?.why || "not yet" : "too soon");
  outcomes["break-up"] = isCouple
    ? {
        how: "confirm",
      }
    : {
        how: "none",
      };
  outcomes["ask-open"] =
    isCouple && ctx.multiple
      ? {
          how: "confirm",
        }
      : isCouple
        ? outcomeSoft("they do not want to hear it")
        : {
            how: "none",
          };
  outcomes.invite = ctx.invite?.ok
    ? {
        how: "confirm",
      }
    : outcomeSoft(ctx.invite?.why || "not now");
  outcomes.party = ctx.party?.ok
    ? {
        how: "confirm",
      }
    : outcomeSoft(ctx.party?.why || "not now");
  outcomes.choose = {
    how: "none",
  };
  outcomes["introduce-me"] = ctx.introduce
    ? outcomeYes()
    : outcomeSoft("they do not know the player well enough for that, or there is nobody to introduce");
  outcomes["ask-money-back"] = moneyBackOutcomeFor(ctx);
  outcomes["ask-loan"] = loanOutcomeFor(ctx);
  Object.assign(outcomes, birthdayOutcomesFor(ctx));
  return applyKinOutcomeOverrides(ctx, outcomes);
}
function applyKinOutcomeOverrides(ctx, outcomes) {
  if (!ctx.kin) {
    return outcomes;
  }
  for (let act of ["kiss", "ask-out", "partners"]) {
    if (["no", "soft"].includes(outcomes[act]?.how)) {
      outcomes[act] = {
        how: "no",
        why: "they are family",
        free: true,
        ...(outcomes[act].as
          ? {
              as: outcomes[act].as,
            }
          : {}),
      };
    }
  }
  outcomes.hands = {
    how: "yes",
    free: true,
    take: "they take it as a gesture of affection, as family does: there is nothing romantic in it",
  };
  return outcomes;
}
var LOAN_REFUSAL_REASONS = {
  far: "they are not close enough to the player to lend them money",
  ex: "they are the player's ex",
  overdue: "the player owes them money that is past its day",
  full: "the player already owes them as much as they lend",
};
var loanOutcomeFor = (ctx) =>
  ctx.loan?.max > 0
    ? {
        how: "yes",
        max: ctx.loan.max,
        days: ctx.loan.days,
      }
    : {
        ...outcomeSoft(LOAN_REFUSAL_REASONS[ctx.loan?.why] ?? LOAN_REFUSAL_REASONS.far),
        code: LOAN_REFUSAL_REASONS[ctx.loan?.why] ? ctx.loan.why : "far",
      };
var birthdayOutcomesFor = (ctx) =>
  ctx.birthday
    ? {
        "ask-birthday": {
          how: "yes",
          date: ctx.birthday.label,
        },
        "happy-birthday": ctx.birthday.today
          ? {
              how: "yes",
            }
          : {
              how: "later",
              date: ctx.birthday.label,
            },
      }
    : {
        "ask-birthday": {
          how: "none",
        },
        "happy-birthday": {
          how: "none",
        },
      };
var moneyBackOutcomeFor = (ctx) =>
  ctx.lent?.can
    ? outcomeYes()
    : ctx.lent?.amount
      ? outcomeSoft(`it has not been a week yet: from ${ctx.lent.from}`)
      : outcomeNo("they owe the player nothing");
var FREE_ACT_REACTIONS = {
  "introduce-me": {
    yes: "they are glad to introduce the player to someone of theirs",
    soft: "not now, and they say why in their own way",
  },
  "ask-money-back": {
    yes: "they pay it all back now, in their own way",
    soft: "they ask for a few more days",
    no: "they owe the player nothing, and say so",
  },
  "ask-loan": {
    soft: "they do not lend the player any money, and say so in their own way",
  },
  hug: {
    yes: "they hug back",
    soft: "they go a little stiff, and let go soon",
  },
  hands: {
    yes: "they hold on",
    soft: "they let go after a moment",
  },
  kiss: {
    yes: "they kiss back",
    soft: "they pull back, gently",
    no: "they turn away and stop it",
  },
  "ask-out": {
    yes: "they say yes: from now on they are dating",
    soft: "they let the player down gently, and leave the door open",
    no: "they turn it down, clearly",
    already: "they are already together: it is sweet, nothing more",
  },
  partners: {
    yes: "they say yes: from now on they are a couple, official",
    soft: "not yet, and they say why in their own way",
    no: "they turn it down, clearly",
    already: "they already are: it is sweet, nothing more",
  },
  "move-in": {
    soft: "not yet, and they say why in their own way",
  },
  "ask-open": {
    soft: "they do not like the idea, and say so",
  },
  invite: {
    soft: "they do not settle a plan now, and say so in their own way",
  },
};
var CLAIM_PHRASES = {
  dating: (who) => `seeing ${who}`,
  kissed: (who) => `having kissed ${who}`,
  flirting: (who) => `flirting with ${who}`,
  "broke-up": (who) => `having broken up with ${who}`,
};
var UNSETTLED_REACTION_NOTE = "they react in the moment, but it is not settled: the player confirms it next";
var CONFIRM_ACT_NOTES = {
  invite:
    ". If the player names no day, or nowhere they could go, they say they would like to and ask when or where; nothing is settled yet",
  "ask-open": ". If the player does not say who, they ask who; nothing is settled yet",
};
function freeActsPromptBlock(acts, { name: npcName = "them" } = {}) {
  if (!acts) {
    return "";
  }
  let lines = [];
  for (let act of FREE_ACT_IDS) {
    let outcome = acts.outcomes[act];
    if (!outcome || outcome.how === "none") {
      continue;
    }
    let reaction = outcome.take
      ? outcome.take
      : outcome.how === "confirm"
        ? `${UNSETTLED_REACTION_NOTE}${CONFIRM_ACT_NOTES[act] ?? ""}`
        : act === "ask-birthday"
          ? `they tell the player: their birthday is on ${outcome.date}`
          : act === "ask-loan" && outcome.how === "yes"
            ? `it is a loan, to pay back within ${outcome.days} days, and they lend up to $${outcome.max}. With an amount said: they hand it over now, that amount, or $${outcome.max} when the player asks for more (then they say that is all they can lend). With no amount said: they ask how much, and lend nothing yet`
            : act === "happy-birthday"
              ? outcome.how === "yes"
                ? "it IS their birthday today: they are touched the player remembered, true to who they are"
                : `it is not their birthday today (it is on ${outcome.date}): they are puzzled, or laugh it off`
              : FREE_ACT_REACTIONS[act]?.[outcome.how];
    if (reaction) {
      lines.push(
        `- If the player ${FREE_ACT_DESCRIPTIONS[act]}: ${reaction}${outcome.why && outcome.how !== "yes" ? ` (${outcome.why})` : ""}.`,
      );
    }
  }
  for (let [act, extra] of Object.entries(acts.more?.acts ?? {})) {
    let reaction = acts.outcomes[act]?.how === "confirm" ? UNSETTLED_REACTION_NOTE : extra.take;
    if (reaction) {
      lines.push(
        `- If the player ${extra.says}: ${reaction}${extra.why && acts.outcomes[act]?.how !== "yes" ? ` (${extra.why})` : ""}.`,
      );
    }
  }
  lines.push(
    `- If the player says ${npcName} is seeing someone else: ${acts.confront ? UNSETTLED_REACTION_NOTE : "they answer it as they would, true to who they are"}.`,
  );
  if (acts.caught?.length) {
    lines.push(
      `- If the player denies ${acts.caught.map((claim) => CLAIM_PHRASES[claim.what](claim.name)).join(", or ")}: ${npcName} knows it is so (they saw it, or know it for sure), so they do not believe it, and it shows in how they answer.`,
    );
  }
  if (acts.boss) {
    lines.push(
      acts.boss.atWork
        ? `- If the player asks ${npcName}, their boss, for something of the job (${acts.boss.asks.map((ask) => JOB_REQUEST_DESCRIPTIONS[ask].replace(/^(asks|says they) /, "")).join(", ")}): ${UNSETTLED_REACTION_NOTE}.`
        : `- If the player asks ${npcName}, their boss, for something of the job (${acts.boss.employed ? "a day off, to stay late, or says they quit" : "to be hired"}): they do not settle it here \u2014 that is for the Office, during work \u2014 and they say so in their own way. Nothing changes.`,
    );
  }
  if (acts.boss?.employed) {
    lines.push(
      `- If the player asks ${npcName}, their boss, for a raise: at the Office the pay comes with the position, and only a promotion changes it. ${npcName} says so in their own way. Nothing changes.`,
    );
  }
  if (acts.rideOpen) {
    lines.push(
      `- ${npcName} asked the player for a ride to ${acts.rideOpen.placeName}. If the player's answer agrees, ${npcName} is glad and they head out together: this answer ends the scene. If it says no, they react true to who they are.`,
    );
  }
  if (acts.plea) {
    lines.push(
      `- ${acts.plea.name ?? npcName} asked the player for $${acts.plea.amount}${acts.plea.what ? ` (${acts.plea.what})` : ""}: ${acts.plea.kind === "lend" ? "a loan" : acts.plea.kind === "pay" ? "to pay for it" : "money, just because"}. The player has not answered yet. If the player's answer agrees, ${npcName} reacts to getting it (or to getting less, when the player offers less); if it says no, they react true to who they are.`,
    );
  }
  let moneyBlock = moneyBetweenBlock(acts, npcName);
  return [
    "WHAT THE PLAYER MAY DO IN THEIR OWN WORDS: the game has already decided how this person takes each of these. If the player's answer does one, their reaction follows it:",
    ...lines,
    ...(moneyBlock ? ["", moneyBlock] : []),
    "",
    "`did` is what the player's answer does, read from THE PLAYER ANSWERS line only (never from what this person says or does), in any language. Most answers do none of it: then leave every field empty.",
    `- \`acts\`: which of exactly these the player's answer plainly does or asks: ${[...FREE_ACT_IDS, ...Object.keys(acts.more?.acts ?? {})].join(", ")}.`,
    '- `open`: with ask-open, the id (from PEOPLE) of who they ask about; else "".',
    `- \`told\`: what the player's answer claims about people, each {"who":"\u2026","with":"\u2026","what":"\u2026","not":false}: \`who\` and \`with\` are "you" (the player) or ids from PEOPLE; \`what\` is exactly one of ${[...CLAIM_IDS, ...(acts.more?.claims ?? [])].join(", ")}; \`not\` is true when the player says it did NOT happen (\xABI'm not seeing anyone\xBB: who "you", with "", not true).`,
    acts.items.length
      ? '- `give`: the key of a thing from THE PLAYER HAS, if they hand it over now; else "".'
      : '- `give`: "" (the player has nothing to give them today).',
    "- `money`: money the player hands over now, a number; else 0.",
    "- `loan`: with ask-loan, the dollars the player asks THEM for, a number; 0 when the player names no amount. Money the player asks for is never `money`.",
    acts.here.length
      ? '- `introduce`: the id (from HERE) of someone the player introduces them to, or brings into the conversation; else "".'
      : '- `introduce`: "".',
    acts.together?.length
      ? '- `together`: the key of a thing from THINGS TO DO TOGETHER that the player proposes doing now; else "". One marked \xAByes\xBB: they agree, and the scene ends with this answer to go do it (then also write `remember`: what they keep of this scene, one or two sentences). One marked \xABnot now\xBB: they say why not, in their own words.'
      : '- `together`: "".',
    acts.boss?.atWork
      ? `- \`job\`: exactly one of ${acts.boss.asks.join(", ")} when the player's answer ${acts.boss.asks.map((ask) => `${JOB_REQUEST_DESCRIPTIONS[ask]} (${ask})`).join(", ")}; else "".`
      : '- `job`: "".',
    acts.outingsBlock
      ? `- \`outing\`: with invite, the plan the player proposes, read from THE PLAYER ANSWERS line: ${acts.outingsBlock}`
      : "- `outing`: {}.",
    acts.plea
      ? `- \`plea\`: their ask for $${acts.plea.amount} is still open. {"answer":"pay","amount":N} when the player's answer agrees and hands it over (N: what they give \u2014 the amount asked, unless they say another), {"answer":"refuse","amount":0} when it says no; else {"answer":"","amount":0}.`
      : '- `plea`: {"answer":"","amount":0}.',
    acts.rideOpen
      ? `- \`drive\`: their ask for a ride to ${acts.rideOpen.placeName} is still open: "yes" when the player's answer agrees to take them (then they go: write \`remember\` too, one or two sentences), "no" when it says no; else "".`
      : '- `drive`: "".',
    "",
    moneyAskPromptLine(acts, npcName),
    rideAskPromptLine(acts, npcName),
    ...(acts.payBack ? [payBackPromptLine(acts, npcName)] : []),
  ].join(`
`);
}
function moneyBetweenBlock(acts, npcName = "them") {
  let { lent = null, debt = null } = acts?.between ?? {};
  return !lent && !debt
    ? ""
    : [
        "MONEY BETWEEN THEM:",
        lent
          ? `The player lent ${npcName} $${lent.amount}${lent.for ? ` (${lent.for})` : ""}, not paid back yet; ${lent.can ? "a week has gone by since" : `it has not been a week (the player can ask for it back from ${lent.from})`}.`
          : "",
        debt
          ? `The player owes ${npcName} $${debt.amount}, due ${debt.due}${debt.overdue ? ": it is past its day, and they have not forgotten" : ""}.`
          : "",
        `${npcName} hands the player no money in this answer, except as this block says.`,
      ]
        .filter(Boolean)
        .join(" ");
}
var payBackPromptLine = (acts, npcName = "them") =>
  `\`payBack\` is ${npcName}'s, not the player's: the week has gone by, so if it is who they are, ${npcName} may pay the player back the $${acts.between?.lent?.amount ?? 0} in this answer, all of it \u2014 then \`payBack\` is true and their lines say it. Otherwise false.`;
var didJsonShapeFor = (acts) => (acts?.payBack ? `${DID_JSON_TEMPLATE},"payBack":false` : DID_JSON_TEMPLATE);
function freeActsContextBlock(ctx) {
  return ctx
    ? [
        `PEOPLE (id: name): ${ctx.people.map((person) => `${person.id}: ${person.name}${person.self ? " (this person)" : ""}`).join(" \xB7 ") || "none"}`,
        ctx.here.length
          ? `HERE, NOT IN THE SCENE (id: name): ${ctx.here.map((person) => `${person.id}: ${person.name}`).join(" \xB7 ")}`
          : "",
        ctx.items.length
          ? `THE PLAYER HAS (key: thing \xB7 how they would take it): ${ctx.items.map((item) => `${item.key}: ${item.name} \xB7 ${GIFT_RESULT_PHRASES[item.result] ?? "fine"}`).join(" \xB7 ")}`
          : "",
        `THE PLAYER CARRIES: $${ctx.cash}; they cannot hand over more.`,
        ctx.together?.length
          ? `THINGS TO DO TOGETHER (key: thing \xB7 yes, or not now and why): ${ctx.together.map((activity) => `${activity.key}: ${activity.name} \xB7 ${activity.available ? "yes" : `not now (${activity.why})`}`).join(" \xB7 ")}`
          : "",
      ].filter(Boolean).join(`
`)
    : "";
}
var GIFT_RESULT_PHRASES = {
  loved: "they love it",
  liked: "they like it",
  fine: "it is nice enough",
  disliked: "not for them",
};
var DID_JSON_TEMPLATE =
  '"did":{"acts":[],"open":"","told":[],"give":"","money":0,"loan":0,"introduce":"","together":"","job":"","outing":{},"plea":{"answer":"","amount":0},"drive":""},"ask":{"kind":"","what":"","amount":0},"ride":""';
var MONEY_ASK_KINDS = ["pay", "lend", "give"];
function normalizeMoneyAsk(raw, people = []) {
  if (!raw || typeof raw != "object") {
    return null;
  }
  let kind = String(raw.kind ?? "")
      .trim()
      .toLowerCase(),
    amount = Math.floor(Number(raw.amount) || 0);
  if (!MONEY_ASK_KINDS.includes(kind) || amount <= 0) {
    return null;
  }
  let what = String(raw.what ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80),
    who = people.some((person) => person.id === String(raw.who ?? "").trim()) ? String(raw.who).trim() : null;
  return {
    kind: kind,
    what: what,
    amount: amount,
    ...(who
      ? {
          who: who,
        }
      : {}),
  };
}
var ASK_JSON_TEMPLATE = '"ask":{"kind":"","what":"","amount":0}';
function moneyAskPromptLine(ctx, npcName = "them") {
  return ctx?.plea
    ? `\`ask\`: {} \u2014 ${ctx.plea.name ?? npcName} already asked the player for money and is waiting for the answer.`
    : ctx?.noAsks
      ? "`ask`: {} \u2014 nobody asks the player for money in this answer."
      : [
          ctx?.askers?.length
            ? `In this scene, the one who asks may also be one of the others: \`ask.who\` is their id (${ctx.askers.map((asker) => `${asker.id} (${asker.name})`).join(", ")}), or "" when it is ${npcName}. The same goes for each of them: only when it is who they are.`
            : "",
          `\`ask\` is ${npcName}'s, not the player's: only when it is who they are by their card (someone who has people pay for things, borrows, asks for money) and it comes naturally here, they may ask the player for money in this answer, and their lines say it.`,
          "`kind`: pay (the player pays for something of theirs), lend (the player lends them money: it comes back when the player asks for it, from a week on, so they promise no day) or give (money, just because); `what`: a few words of what for; `amount`: the dollars they ask for \u2014 whatever they would really ask, true to who they are: someone greedy or shameless may ask for far more than a thing costs. Things cost what they cost here (a T-shirt is about $45). Their lines say that same amount, in dollars.",
          ctx?.asksEasily
            ? `${npcName} is not the caring type: they ask others for things easily, and it may come up now and then even when their card does not say it.`
            : "Most people never do this: leave it {} unless their card makes it natural. Someone whose card is like that does it often.",
          ctx?.rich
            ? `${npcName} can see the player has money (their home, their clothes): someone who asks for things asks more often now, and for more.`
            : "",
        ].join(" ");
}
function rideAskPromptLine(ctx, npcName = "them") {
  return ctx?.rideOpen
    ? `\`ride\`: "" \u2014 ${npcName} already asked the player for a ride and is waiting for the answer.`
    : !ctx?.rides?.length || ctx.noAsks
      ? '`ride`: "".'
      : [
          `\`ride\` is ${npcName}'s, not the player's: ${npcName} knows the player has a ${ctx.vehicle === "car" ? "car" : "motorbike"}. Only when ${npcName} needs to get somewhere and it comes naturally here, they may ask the player to take them there in this answer, and their lines say it: the id of one of these places (id: name): ${ctx.rides.map((place) => `${place.id}: ${place.name}`).join(" \xB7 ")}.`,
          'Most answers leave it "".',
        ].join(" ");
}
var normalizeRideAsk = (raw, ctx) =>
  (ctx?.rides ?? []).find((place) => place.id === String(raw ?? "").trim())?.id ?? null;
function normalizeDidActs(raw, ctx) {
  let empty = {
    acts: [],
    open: null,
    told: [],
    give: null,
    money: 0,
    loan: 0,
    introduce: null,
    together: null,
    job: null,
    outing: null,
    plea: null,
    drive: null,
  };
  if (!ctx || !raw || typeof raw != "object") {
    return empty;
  }
  let peopleIds = new Set(ctx.people.map((person) => person.id)),
    resolveWho = (raw2) => {
      let id = String(raw2 ?? "").trim();
      return id === "you" || peopleIds.has(id) ? id : null;
    },
    acts = [
      ...new Set(
        (Array.isArray(raw.acts) ? raw.acts : [])
          .map((act) =>
            String(act ?? "")
              .trim()
              .toLowerCase(),
          )
          .filter((act) => FREE_ACT_DESCRIPTIONS[act] || ctx.more?.acts?.[act]),
      ),
    ];
  if (acts.includes("ask-out") && ctx.outcomes?.partners?.as === "ask-out") {
    acts = acts.filter((act) => act !== "partners");
  }
  let told = [];
  for (let claim of Array.isArray(raw.told) ? raw.told.slice(0, 4) : []) {
    let who = resolveWho(claim?.who),
      what = String(claim?.what ?? "")
        .trim()
        .toLowerCase(),
      withWho = String(claim?.with ?? "").trim() === "" ? "" : resolveWho(claim?.with);
    if (!(
      !who ||
      !(CLAIM_DESCRIPTIONS[what] || ctx.more?.claims?.includes(what)) ||
      withWho === null ||
      withWho === who
    )) {
      told.push({
        who: who,
        with: withWho,
        what: what,
        not: claim?.not === true,
      });
    }
  }
  let openWho = acts.includes("ask-open") ? resolveWho(raw.open) : null,
    give = ctx.items.find((item) => item.key === String(raw.give ?? "").trim())?.key ?? null,
    money = Math.max(0, Math.min(ctx.cash, Math.floor(Number(raw.money) || 0))),
    loan = acts.includes("ask-loan") ? Math.max(0, Math.floor(Number(raw.loan) || 0)) : 0,
    handed = loan > 0 && money === loan ? 0 : money,
    introduce = ctx.here.find((person) => person.id === String(raw.introduce ?? "").trim())?.id ?? null,
    together = (ctx.together ?? []).find((activity) => activity.key === String(raw.together ?? "").trim())?.key ?? null,
    jobRaw = String(raw.job ?? "")
      .trim()
      .toLowerCase(),
    job = ctx.boss?.atWork && ctx.boss.asks.includes(jobRaw) ? jobRaw : null,
    outing =
      acts.includes("invite") && raw.outing && typeof raw.outing == "object"
        ? {
            kind: raw.outing.kind,
            place: raw.outing.place,
            day: raw.outing.day,
            hour: raw.outing.hour,
          }
        : null,
    pleaAnswer = String(raw.plea?.answer ?? "")
      .trim()
      .toLowerCase(),
    pleaAmount = Math.floor(Number(raw.plea?.amount) || 0),
    plea = ctx.plea
      ? pleaAnswer === "refuse"
        ? {
            answer: pleaAnswer,
          }
        : pleaAnswer === "pay" && pleaAmount > 0 && pleaAmount <= ctx.cash
          ? {
              answer: pleaAnswer,
              amount: pleaAmount,
            }
          : pleaAnswer === "pay" && !(pleaAmount > 0) && ctx.plea.amount <= ctx.cash
            ? {
                answer: pleaAnswer,
                amount: ctx.plea.amount,
              }
            : null
      : null,
    driveRaw = String(raw.drive ?? "")
      .trim()
      .toLowerCase(),
    drive = ctx.rideOpen && (driveRaw === "yes" || driveRaw === "no") ? driveRaw : null;
  return {
    acts: acts,
    open: openWho === "you" ? null : openWho,
    told: told,
    give: give,
    money: handed,
    loan: loan,
    introduce: introduce,
    together: together,
    job: job,
    outing: outing,
    plea: plea,
    drive: drive,
    pleaTried: !!ctx.plea && (pleaAnswer === "pay" || pleaAnswer === "refuse"),
  };
}
function readFromActOutcomes(acts, did) {
  let hows = (did?.acts ?? []).filter((act) => !acts?.outcomes[act]?.free).map((act) => acts?.outcomes[act]?.how);
  return hows.includes("no")
    ? "cold"
    : hows.includes("soft") &&
        (did.acts ?? []).some((act) => ROMANTIC_ACT_IDS.includes(act) && acts.outcomes[act].how === "soft")
      ? "awkward"
      : null;
}

export {
  ASK_JSON_TEMPLATE,
  CLAIM_DESCRIPTIONS,
  CLAIM_PHRASES,
  DID_JSON_TEMPLATE,
  FREE_ACT_DESCRIPTIONS,
  MILESTONE_BANNER_LABELS,
  MONEY_ASK_KINDS,
  decideFreeActOutcomes,
  didJsonShapeFor,
  eventStepCoversAct,
  freeActsContextBlock,
  freeActsPromptBlock,
  moneyAskPromptLine,
  normalizeDidActs,
  normalizeMoneyAsk,
  normalizeRideAsk,
  readFromActOutcomes,
};
