// Place interior: talk, specials, gifts, events, sleep, doors, corridors, mall, walking
import { MAP, TOWN_SPOT, bgIcon, bondLine, colourFor, escape, frameImg, headOf, hours, placeHud } from "./common.js";
import { sceneErr } from "./scene.js";
import { newsFace } from "./people.js";
import { homeOptionsView, homePanelView } from "./home.js";
import { streetBox } from "./homes.js";
import {
  housePartyPanel,
  invitePanel,
  partyOverView,
  partyRunView,
  partyStripView,
  planStripView,
  planTagsView,
  specialDateRows,
} from "./outings.js";
import { NPC_TAG, modSpecialRows } from "./mods.js";
import { cardView } from "./cards.js";
import { S } from "../state.js";

function talkPanel(person, talk = {}, error = "", { door = null } = {}) {
  const errorHtml = error ? `<div class="mls-said bad mls-talk-error">${escape(error)}</div>` : "";
  if (person.met === false) {
    return introPanel(person, talk).replace('<div class="mls-talk">', `<div class="mls-talk">${errorHtml}`);
  }
  const bond = person.bond,
    applied = talk.applied ?? {},
    limits = talk.limits ?? {},
    eventsByAxis = Object.fromEntries((person.events?.list ?? []).map((ev) => [ev.axis, ev])),
    axisRow = (axis, label) => {
      const axisBond = bond[axis],
        delta = applied[axis] ?? 0,
        axisEvent = eventsByAxis[axis],
        limit = axisEvent ? null : limits[axis],
        capTag = axisEvent ? eventTag(axisEvent) : limit ? CAP_TAG[limit] : "";
      return `<div class="mls-bondrow ${delta > 0 ? "up" : delta < 0 ? "down" : ""}" data-axis="${axis}">
      <span class="label">${label}</span>
      <span class="num">${delta ? `<span class="delta">${delta > 0 ? "+" : ""}${Math.round(delta * 10) / 10}</span>` : ""}</span>
      <span class="bar"><i style="width:${Math.max(0, Math.min(100, axisBond.value))}%"></i></span>
      <span class="tier">${capTag ? `<b class="cap ${axisEvent?.status === "ready" ? "ready" : ""}">${capTag}</b>` : `${escape(axisBond.name)}${axis === "romance" && axisBond.frozen ? " \xB7 off" : ""}`}</span></div>`;
    },
    done = person.done ?? {},
    gone = person.gone === true,
    quickWhy = person.quickWhy || "",
    riskText = (risk) =>
      !risk || risk.chance < 0.12
        ? ""
        : `${risk.chance >= 0.3 ? "Risky" : "Can go wrong"}${risk.why ? ` \xB7 ${risk.why}` : ""}`,
    ice = person.ice ? escape(person.ice) : "",
    chatWhy = gone ? "They left" : quickWhy || ice || riskText(person.risk?.chat) || "A few words \xB7 10 minutes",
    flirtWhy = gone
      ? "They left"
      : quickWhy ||
        ice ||
        (person.onlyInto
          ? escape(person.onlyInto)
          : bond.romance.frozen
            ? "They are not open to it with you"
            : person.with
              ? `With ${escape(person.with.name)}`
              : riskText(person.risk?.flirt) || "Keep it light"),
    openWhy = gone
      ? "They left"
      : quickWhy ||
        ice ||
        (person.openUp
          ? riskText(person.risk?.open) || "Something of yours \xB7 10 minutes"
          : "Get to know them first"),
    optRow = (kind, label, detail, time, used, disabled) =>
      disabled
        ? `<div class="mls-opt off"><span class="n">${label}</span><span class="hours">${time}</span><span class="d">${detail}</span></div>`
        : `<button class="mls-opt ${used ? "used" : ""}" data-do="talk" data-kind="${kind}" data-character="${person.id}">
      <span class="n">${label}</span><span class="hours">${time}</span><span class="d">${detail}</span></button>`,
    offRow = (label, detail, time, isScene = false) => `
    <div class="mls-opt off ${isScene ? "vn" : ""}"><span class="n">${label}</span><span class="hours">${time}</span><span class="d">${detail}</span></div>`;
  return `
    <div class="mls-talk">
      ${errorHtml}
      <div class="who-head"><h2><button class="mls-namelink" data-do="sheet" data-character="${person.id}" title="Open their sheet">${escape(person.name.toUpperCase())}</button></h2>${person.with ? `<span class="mls-taken">WITH ${escape(person.with.name.toUpperCase())}</span>` : ""}${door ? '<span class="mls-where">AT THE DOOR</span>' : '<button data-do="talk-done">DONE</button>'}</div>
      <div class="mls-bondbox" style="--c:${colourFor(person.id)}">
        ${axisRow("friendship", "Friendship")}${axisRow("romance", "Romance")}${axisRow("trust", "Trust")}
      </div>
      ${gone || door ? "" : eventButton(person)}
      ${gone || door ? "" : stepButton(person)}
      ${gone || door || talk.special || !hasSpecial(person) ? "" : `<button class="mls-special" data-do="special-open" data-character="${person.id}">\u2605 SPECIAL ACTIONS</button>`}
      ${talk.stamp ? giftStamp(talk.stamp) : ""}
      ${door && !talk.picking ? door.answer : ""}
      ${
        talk.special && !gone
          ? specialMenu(person, talk)
          : talk.picking && !gone
            ? giftPicker(person, talk)
            : `
      <div class="sep">QUICK</div>
      ${optRow("quickChat", "Chat", chatWhy, "10m", done.chat, gone || !!quickWhy || !!ice)}
      ${person.noFlirt ? "" : optRow("flirt", "Flirt", flirtWhy, "10m", done.flirt, gone || !!quickWhy || !!ice)}
      ${optRow("openUp", "Open up", openWhy, "10m", done.open, gone || !!quickWhy || !!ice || !person.openUp)}
      ${giftOption(person, gone)}
      ${
        door
          ? `${door.said ? `<div class="mls-said">${escape(door.said)}</div>` : ""}<button class="mls-back flat mls-leave" data-do="visit-out">\u25C2 BACK TO THE CORRIDOR</button>`
          : `
      <div class="sep">LONGER</div>
      ${sitDown(person, gone)}`
      }`
      }
    </div>`;
}
function stepButton(person) {
  const step = person.step;
  if (!step?.asks) {
    return "";
  }
  const duration =
      step.minutes >= 60
        ? `${Math.floor(step.minutes / 60)}h${step.minutes % 60 ? ` ${step.minutes % 60}m` : ""}`
        : `${step.minutes}m`,
    titleHtml = `<span class="n">${step.asks ? `${escape(person.name.toUpperCase())} ${step.says ?? (["jealous", "talk", "stay-away", "reconcile", "where-were-you"].includes(step.id) ? "WANTS TO TALK" : "WANTS TO ASK YOU SOMETHING")}` : escape(step.title.toUpperCase())}</span>`;
  return step.room
    ? `<div class="mls-event mls-milestone later">${titleHtml}<span class="hours">${duration}</span><span class="d">Not enough time \xB7 ${escape(step.room)}</span></div>`
    : `<button class="mls-event mls-milestone" data-do="scene-start" data-kind="milestone" data-id="${escape(step.id)}" data-character="${person.id}">
      ${titleHtml}<span class="hours">Up to ${duration}</span></button>`;
}
const SPECIAL_GROUPS = [
  ["FAVOURS", ["couch", "suits", "introduce"]],
  ["MONEY", ["payBack", "askBack"]],
  ["PLANS", ["invite", "plan"]],
  ["HOME", ["mateIn", "mateOut"]],
  ["ABOUT YOUR PARTNER", ["talkOther"]],
  ["US", ["step", "propose", "reconcile", "talkItOut", "confront", "openAsk", "marryAsk", "breakUp"]],
];
const STEP_DOES = {
  "first-kiss": "Your first kiss",
  partners: "Official: the two of you, a couple",
  "move-in": "Live together, at yours or at theirs",
};
const stepDoes = (step) =>
  step.id === "move-in" && step.already ? "As a couple, in the home you already share" : (STEP_DOES[step.id] ?? "");
const greyRow = (label, gate) =>
  `<div class="mls-opt off"><span class="n">${label}</span><span class="hours">${gate.minutes ? `${gate.minutes}m` : ""}</span><span class="d">${escape((gate.why ?? "").replace(/\.$/, ""))}</span></div>`;
const isGrey = (action) => !!action && action.ok === false;
const hasSpecial = (person) =>
  SPECIAL_GROUPS.some(([, keys]) =>
    keys.some((key) =>
      key === "breakUp" ? !!(person.special?.breakUp?.ok || person.special?.breakUp?.tight) : !!person.special?.[key],
    ),
  ) || Object.keys(person.special?.modules ?? {}).length > 0;
function specialMenu(person, talk) {
  if (talk.invite) {
    return invitePanel(person);
  }
  if (talk.propose && person.special?.propose && !isGrey(person.special.propose)) {
    return proposePanel(person, talk);
  }
  const breakUp = person.special?.breakUp ?? {
      ok: false,
      why: "",
    },
    step = person.special?.step,
    stepRow = step
      ? isGrey(step)
        ? greyRow(escape(step.title), step)
        : `<button class="mls-opt" data-do="scene-start" data-kind="milestone" data-id="${escape(step.id)}" data-character="${person.id}"><span class="n">${escape(step.title)}</span><span class="hours">${step.minutes}m</span><span class="d">${stepDoes(step)}</span></button>`
      : "",
    breakUpRow = breakUp.ok
      ? talk.confirm
        ? `<div class="mls-special-confirm"><b>End it with ${escape(person.name)}?</b>
          <div class="row"><button class="main" data-do="scene-start" data-kind="milestone" data-id="break-up" data-character="${person.id}">END IT</button><button data-do="special-cancel" data-character="${person.id}">CANCEL</button></div></div>`
        : `<button class="mls-opt bad" data-do="special-break" data-character="${person.id}"><span class="n">Break up</span><span class="hours">${breakUp.minutes ?? 15}m</span><span class="d">It ends here</span></button>`
      : breakUp.tight
        ? greyRow("Break up", breakUp)
        : "",
    openAsk = person.special?.openAsk,
    openAskRow = openAsk
      ? isGrey(openAsk)
        ? greyRow("Ask to see someone else", openAsk)
        : talk.pickOpen
          ? `<div class="mls-special-confirm"><b>Ask ${escape(person.name)} if you can see\u2026</b>
          <div class="mls-pick-row">${openAsk.who.length ? openAsk.who.map((other) => `<button data-do="scene-start" data-kind="milestone" data-id="open-ask" data-character="${person.id}" data-with="${escape(other.id)}">${escape(other.name)}</button>`).join("") : '<span class="none">Nobody else you know</span>'}</div>
          <div class="row"><button data-do="special-cancel" data-character="${person.id}">CANCEL</button></div></div>`
          : `<button class="mls-opt" data-do="special-open-ask" data-character="${person.id}"><span class="n">Ask to see someone else</span><span class="hours">${openAsk.minutes}m</span><span class="d">You pick who \xB7 they may not take it well</span></button>`
      : "",
    marryAsk = person.special?.marryAsk,
    marryAskRow = marryAsk
      ? isGrey(marryAsk)
        ? greyRow("Ask to marry someone else", marryAsk)
        : talk.pickMarry
          ? `<div class="mls-special-confirm"><b>Ask ${escape(person.name)} if you can marry\u2026</b>
          <div class="mls-pick-row">${marryAsk.who.map((other) => `<button data-do="scene-start" data-kind="milestone" data-id="marry-ask" data-character="${person.id}" data-with="${escape(other.id)}">${escape(other.name)}</button>`).join("")}</div>
          <div class="row"><button data-do="special-cancel" data-character="${person.id}">CANCEL</button></div></div>`
          : `<button class="mls-opt" data-do="special-marry-ask" data-character="${person.id}"><span class="n">Ask to marry someone else</span><span class="hours">${marryAsk.minutes}m</span><span class="d">Before you can propose to ${escape(marryAsk.who.map((other) => other.name).join(" or "))}</span></button>`
      : "",
    confront = person.special?.confront,
    talkOther = person.special?.talkOther,
    talkOtherRow = isGrey(talkOther)
      ? greyRow(`Talk to ${escape(person.name)}`, talkOther)
      : talkOther
        ? `<button class="mls-opt" data-do="scene-start" data-kind="milestone" data-id="talk-other" data-character="${person.id}">
      <span class="n">Talk to ${escape(person.name)}</span><span class="hours">${talkOther.minutes}m</span><span class="d">About ${escape(talkOther.partner.name)} \xB7 ${talkOther.how === "seen" ? "you saw them together" : talkOther.how === "guessed" ? "you worked it out" : `${escape(talkOther.from || "someone")} told you`}</span></button>`
        : "",
    confrontRow = isGrey(confront)
      ? greyRow(`Confront ${escape(person.name)}`, confront)
      : confront
        ? `<button class="mls-opt" data-do="scene-start" data-kind="milestone" data-id="confront" data-character="${person.id}">
      <span class="n">Confront ${escape(person.name)}</span><span class="hours">${confront.minutes}m</span><span class="d">${confront.how === "seen" ? `You saw them with ${escape(confront.with.name)}` : confront.how === "guessed" ? `You worked it out: ${escape(confront.with.name)}` : `${escape(confront.from || "Someone")} told you about ${escape(confront.with.name)}`}</span></button>`
        : "",
    introduce = person.special?.introduce,
    introduceRow = introduce
      ? talk.pickIntro
        ? `<div class="mls-special-confirm"><b>Who should ${escape(person.name)} introduce you to?</b>
          <div class="mls-intro-pick">${introduce.who.map((other) => `<button data-do="introduce" data-character="${person.id}" data-with="${escape(other.id)}">${newsFace(other)}<b>${escape(other.name)}</b><small>${escape(other.rel)} \xB7 ${other.here ? "here, right now" : "when you cross paths"}</small></button>`).join("")}</div>
          <div class="row"><button data-do="special-cancel" data-character="${person.id}">CANCEL</button></div></div>`
        : `<button class="mls-opt" data-do="special-introduce" data-character="${person.id}"><span class="n">Introduce me to someone</span><span class="hours">${introduce.minutes}m</span><span class="d">Someone of ${escape(person.name)}'s you have not met</span></button>`
      : "",
    payBackInfo = person.special?.payBack,
    payBackRow = payBackInfo
      ? `<button class="mls-opt" data-do="debt-pay" data-character="${person.id}" ${payBackInfo.cash > 0 ? "" : "disabled"}><span class="n">Pay back $${payBackInfo.amount}</span><span class="hours">${payBackInfo.cash >= payBackInfo.amount ? "ALL" : `$${payBackInfo.cash}`}</span><span class="d">What ${escape(person.name)} lent you</span></button>`
      : "",
    reconcile = person.special?.reconcile,
    reconcileRow = isGrey(reconcile)
      ? greyRow("Ask to be together again", reconcile)
      : reconcile
        ? `<button class="mls-opt" data-do="scene-start" data-kind="milestone" data-id="reconcile" data-character="${person.id}"><span class="n">Ask to be together again</span><span class="hours">${reconcile.minutes}m</span><span class="d">Start over, dating</span></button>`
        : "",
    talkItOut = person.special?.talkItOut,
    talkItOutRow = isGrey(talkItOut)
      ? greyRow("Talk it out", talkItOut)
      : talkItOut
        ? `<button class="mls-opt" data-do="scene-start" data-kind="milestone" data-id="talk" data-character="${person.id}"><span class="n">Talk it out</span><span class="hours">${talkItOut.minutes}m</span><span class="d">Something's wrong between you \xB7 ${escape(person.name)} won't be the one to bring it up</span></button>`
        : "",
    couch = person.special?.couch,
    couchRow = couch
      ? `<button class="mls-opt" data-do="couch-go" data-character="${person.id}"><span class="n">Crash on ${escape(person.name)}'s couch</span><span class="hours">${couch.nights} nights</span><span class="d">You have no home \xB7 their place is yours for a week</span></button>`
      : "",
    propose = person.special?.propose,
    proposeRow = isGrey(propose)
      ? greyRow("Propose", propose)
      : propose
        ? `<button class="mls-opt" data-do="propose-open" data-character="${person.id}"><span class="n">Propose</span><span class="hours">up to ${propose.minutes}m</span><span class="d">With the ${escape(propose.ring.name)} in your backpack</span></button>`
        : "",
    mateIn = person.special?.mateIn,
    mateOut = person.special?.mateOut,
    mateInRow = isGrey(mateIn)
      ? greyRow(`Ask ${escape(person.name)} to move in`, mateIn)
      : mateIn
        ? `<button class="mls-opt" data-do="scene-start" data-kind="milestone" data-id="mate-in" data-character="${person.id}"><span class="n">Ask ${escape(person.name)} to move in</span><span class="hours">${mateIn.minutes}m</span><span class="d">As housemates \xB7 ${mateIn.rooms === 1 ? "one room" : `${mateIn.rooms} rooms`} free at yours \xB7 ${mateIn.pays ? `they pay you $${mateIn.pays} a season` : "you split the rent"}</span></button>`
        : "",
    mateOutRow = isGrey(mateOut)
      ? greyRow(`Ask ${escape(person.name)} to move out`, mateOut)
      : mateOut
        ? `<button class="mls-opt bad" data-do="scene-start" data-kind="milestone" data-id="mate-out" data-character="${person.id}"><span class="n">Ask ${escape(person.name)} to move out</span><span class="hours">${mateOut.minutes}m</span><span class="d">It will cost your friendship</span></button>`
        : "",
    rowsByKey = {
      step: stepRow,
      mateIn: mateInRow,
      mateOut: mateOutRow,
      propose: proposeRow,
      couch: couchRow,
      suits: suitsRow(person),
      introduce: introduceRow,
      payBack: payBackRow,
      askBack: askBackRow(person),
      invite: specialDateRows(person, talk),
      plan: "",
      reconcile: reconcileRow,
      talkItOut: talkItOutRow,
      confront: confrontRow,
      talkOther: talkOtherRow,
      openAsk: openAskRow,
      marryAsk: marryAskRow,
      breakUp: breakUpRow,
    },
    modRows = modSpecialRows(person, talk),
    groups = SPECIAL_GROUPS.map(([group, keys]) => [
      group,
      [...(modRows[group] ?? []), ...keys.map((key) => rowsByKey[key])].join(""),
    ]).filter(([, group]) => group.trim());
  return `<div class="mls-special-menu">
      <div class="head"><button class="mls-back flat" data-do="special-close" data-character="${person.id}">\u25C2 BACK</button><b>SPECIAL ACTIONS</b></div>
      ${groups.map(([group, rowsHtml]) => `<div class="sep">${group}</div>${rowsHtml}`).join("")}
    </div>`;
}
function suitsRow(person) {
  const suits = person.special?.suits;
  if (!suits) {
    return "";
  }
  const who = person.met === false ? `the ${suits.title.toLowerCase()}` : person.name;
  return `<button class="mls-opt" data-do="suits-ask" data-character="${person.id}"><span class="n">Ask ${escape(who)} what suits me</span><span class="hours">${suits.minutes}m</span><span class="d">What ${escape(person.met === false ? "they" : person.name)} would put you in \xB7 marked on the rack</span></button>`;
}
const RING_CARE_WORDS = ["the ring is not what matters", "a ring matters", "a ring matters a lot"];
function proposePanel(person, talk) {
  const propose = person.special.propose,
    howId = talk.how ?? propose.how.find((how) => how.liked)?.id ?? "simple",
    chosen = propose.how.find((how) => how.id === howId);
  return `<div class="mls-special-menu mls-invite">
    <div class="head"><button class="mls-back flat" data-do="special-cancel" data-character="${person.id}">\u25C2 BACK</button><b>HOW YOU ASK</b></div>
    <div class="mls-inv-lbl">THE MOMENT <small>it matters more to some</small></div>
    <div class="mls-inv-kinds">${propose.how.map((how) => `<button class="${how.id === howId ? "on" : ""}" data-do="propose-how" data-id="${how.id}" data-character="${person.id}"><b>${escape(how.name.toUpperCase())}</b>${how.liked ? `<small>${escape(person.name)} would love it</small>` : ""}</button>`).join("")}</div>
    <div class="mls-inv-lbl">THE RING <small>in your backpack</small></div>
    <div class="mls-inv-kinds"><button class="on" disabled><b>${escape(propose.ring.name.toUpperCase())}</b><small>$${propose.ring.price.toLocaleString("en-US")}${propose.ring.care !== null ? ` \xB7 ${RING_CARE_WORDS[propose.ring.care]}` : ""}</small></button></div>
    <div class="mls-inv-foot"><span>ONE WEDDING PLANNED AT A TIME</span>
      <button class="main" data-do="scene-start" data-kind="milestone" data-id="propose" data-how="${howId}" data-character="${person.id}">ASK \xB7 ${escape(chosen.name.toUpperCase())}<small>up to ${propose.minutes} min</small></button></div>
  </div>`;
}
function askBackRow(person) {
  const askBack = person.special?.askBack;
  return askBack
    ? `<button class="mls-opt" data-do="lent-ask" data-character="${person.id}" ${askBack.can ? "" : "disabled"}><span class="n">Ask for your money back</span><span class="hours">$${askBack.amount}</span><span class="d">${askBack.can ? "It has been a week or more" : `You can ask from ${escape(askBack.from)}`}</span></button>`
    : "";
}
function giftOption(person, gone) {
  const gift = person.gift ?? {
      ok: false,
      why: "",
      count: 0,
      minutes: 5,
    },
    detail = gone
      ? "They left"
      : gift.ok
        ? `${gift.count} gift${gift.count === 1 ? "" : "s"} in your backpack`
        : gift.why,
    inner = `<span class="n">Give a gift</span><span class="hours">${gift.minutes ?? 5}m</span><span class="d">${escape(detail)}</span>`;
  return !gone && gift.ok
    ? `<button class="mls-opt" data-do="gift-open" data-character="${person.id}">${inner}</button>`
    : `<div class="mls-opt off">${inner}</div>`;
}
const GIFT_KNOWN = {
  loved: ["good", "Loves it"],
  liked: ["good", "Likes it"],
  fine: ["", "Fine"],
  disliked: ["bad", "Didn't like it"],
};
function giftPicker(person, talk) {
  const items = person.gift?.items ?? [];
  return `<div class="mls-gift">
      <div class="head"><button class="mls-back flat" data-do="gift-close" data-character="${person.id}">\u25C2 BACK</button><b>GIVE ${escape(person.name.toUpperCase())} A GIFT</b></div>
      <div class="list">${items
        .map((item) => {
          const known = GIFT_KNOWN[item.known];
          return `<button class="row ${talk.giftPick === item.index ? "on" : ""}" data-do="gift-pick" data-character="${person.id}" data-id="${item.index}">
          <span class="ic">${escape(item.icon)}</span><span class="nm">${escape(item.name)}${item.n > 1 ? ` <small>\xD7${item.n}</small>` : ""}</span>
          <span class="tag">${escape(item.tag ?? "")}</span><span class="kn ${known ? known[0] : "q"}">${known ? known[1] : "?"}</span></button>`;
        })
        .join("")}</div>
      <button class="give" data-do="gift-give" data-character="${person.id}" ${talk.giftPick === null || talk.giftPick === undefined ? "disabled" : ""}>GIVE \xB7 ${person.gift?.minutes ?? 5} min</button>
    </div>`;
}
const giftStamp = (stamp) =>
  `<div class="mls-gift-stamp ${stamp.good ? "" : "bad"}">${stamp.icon ?? "\u{1F381}"} ${escape(stamp.text)}<small>${escape(stamp.name)}${stamp.tag && stamp.tag !== String(stamp.name).toLowerCase() ? ` \xB7 ${escape(stamp.tag)}` : ""}</small></div>`;
const AXIS_NAME = {
  friendship: "Friendship",
  romance: "Romance",
  trust: "Trust",
};
const tierLabel = (tier) => (tier === "\u2014" ? "Nothing yet" : tier);
function eventTag(ev) {
  return ev.status === "ready"
    ? "MOMENT READY"
    : ev.status === "later"
      ? `AGAIN IN ${ev.daysLeft}D`
      : ev.needs?.off || ev.needs?.why
        ? "WAITING"
        : `NEEDS ${AXIS_NAME[ev.needs.axis].toUpperCase()}`;
}
function eventButton(person) {
  const events = person.events ?? {
      list: [],
      next: null,
    },
    next = events.next;
  if (next) {
    const fit = person.eventFit ?? {
        ok: true,
        needs: 40,
        why: "",
      },
      duration =
        fit.needs >= 60
          ? `${Math.floor(fit.needs / 60)}h${fit.needs % 60 ? ` ${fit.needs % 60}m` : ""}`
          : `${fit.needs}m`;
    return fit.ok
      ? `<button class="mls-event" data-do="scene-start" data-kind="tier" data-character="${person.id}">
      <span class="k">SOMETHING'S CHANGED BETWEEN YOU</span>
      <span class="n"><em>${escape(tierLabel(next.from).toUpperCase())} \u2192</em> <em>${escape(next.to.toUpperCase())}</em></span><span class="hours">up to ${duration}</span>
      <span class="d">A scene, then your call \xB7 ${AXIS_NAME[next.axis]} won't grow until you play it</span></button>`
      : `<div class="mls-event later"><span class="k">SOMETHING'S CHANGED BETWEEN YOU</span>
        <span class="n"><em>${escape(tierLabel(next.from).toUpperCase())} \u2192</em> <em>${escape(next.to.toUpperCase())}</em></span><span class="hours">${duration}</span>
        <span class="d">Not enough time \xB7 ${escape(fit.why)}</span></div>`;
  }
  const blocked = events.list.find((ev) => !ev.needs?.off);
  if (!blocked) {
    return "";
  }
  const detail =
    blocked.status === "later"
      ? `Not yet \xB7 the moment comes back in ${blocked.daysLeft} day${blocked.daysLeft === 1 ? "" : "s"}`
      : blocked.needs.why
        ? blocked.needs.why
        : `Waits for ${AXIS_NAME[blocked.needs.axis]}: ${blocked.needs.name} \xB7 build that and the moment comes`;
  return `<div class="mls-event later"><span class="k">${AXIS_NAME[blocked.axis].toUpperCase()} CAN'T GROW YET</span>
    <span class="n"><em>${escape(tierLabel(blocked.from).toUpperCase())} \u2192</em> <em>${escape(blocked.to.toUpperCase())}</em></span><span class="hours">\u2014</span>
    <span class="d">${escape(detail)}</span></div>`;
}
function sitDown(person, gone) {
  const sit = person.sit ?? {
      ok: false,
      why: "",
    },
    upTo = `up to ${sit.upTo ?? 40}m`;
  if (gone || !sit.ok) {
    return `<div class="mls-opt off vn"><span class="n">Sit down and talk</span><span class="hours">${gone ? "\u2014" : upTo}</span>
      <span class="d">${escape(gone ? "They left" : sit.why)}</span></div>`;
  }
  const detail =
    sit.leaveReason === "stays"
      ? "They are in no hurry"
      : sit.leaveReason === "closes"
        ? `Until it closes at ${sit.leaves}`
        : sit.leaveReason === "lunch"
          ? `Until ${sit.leaves}`
          : sit.leaveReason === "work"
            ? `Until they start work at ${sit.leaves}`
            : `They leave at ${sit.leaves}`;
  return `
    <button class="mls-intro talk" data-do="scene-start" data-kind="talk" data-character="${person.id}">
      <span class="n">SIT DOWN AND TALK</span><span class="hours">${upTo}</span>
      <span class="d">${escape(detail)} \xB7 a scene \xB7 once a day</span></button>`;
}
const yourGenderAsk = () => `<div class="mls-ask-veil"><div class="mls-ask">
    <b>Are you a woman, a man or futanari?</b>
    <small>Some people in town are only into women, men or futanari.</small>
    <div class="row"><button class="main" data-do="your-gender" data-id="female">A WOMAN</button><button class="main" data-do="your-gender" data-id="male">A MAN</button><button class="main" data-do="your-gender" data-id="futanari">FUTANARI</button></div>
  </div></div>`;
const CAP_TAG = {
  daily: "MAX TODAY",
  tier: "NEEDS A MOMENT",
  light: "KEPT LIGHT",
};
const CAP_WHY = {
  daily: "max for today",
  tier: "waits for its moment",
  light: "you kept it light",
};
function introPanel(person, talk = {}) {
  const offRow = (label, time) =>
    `<div class="mls-opt off"><span class="n">${label}</span><span class="hours">${time}</span><span class="d">Introduce yourself first</span></div>`;
  return `
    <div class="mls-talk">
      <div class="who-head"><h2>???</h2><button data-do="talk-done">DONE</button></div>
      <div class="mls-unmet">You don't know <b>their name</b> yet.
        </div>
      <button class="mls-intro" data-do="scene-start" data-character="${person.id}">
        <span class="n">INTRODUCE YOURSELF</span><span class="hours">up to 15m</span>
        <span class="d">A short scene \xB7 first impressions count</span></button>
      ${person.special?.suits ? (talk.special ? specialMenu(person, talk) : `<button class="mls-special" data-do="special-open" data-character="${person.id}">\u2605 SPECIAL ACTIONS</button>`) : ""}
      <div class="sep">QUICK</div>
      ${offRow("Chat", "10m")}${offRow("Flirt", "10m")}${offRow("Give a gift", "5m")}${offRow("Invite them out", "5m")}
      <div class="sep">LONGER</div>
      ${offRow("Sit down and talk", "up to 40m")}
    </div>`;
}
const onLunch = (view) => view?.career?.shift?.stage === "lunch" && view.at === "office";
function lunchBox(shift) {
  if (shift?.stage !== "lunch" || !shift.lunch) {
    return "";
  }
  const lunch = shift.lunch;
  return `<div class="mls-lunch"><b>LUNCH BREAK</b><small>UNTIL <em>${escape(lunch.until)}</em> \xB7 ${lunch.left} MIN LEFT \xB7 HERE AT THE OFFICE</small>
    <div class="mls-lunch-bar"><i style="width:${Math.round(((60 - Math.min(60, lunch.left)) / 60) * 100)}%"></i></div></div>`;
}
function sleepChoiceView(sleep, error = "") {
  const optionFor = (minutes) => sleep.options.find((opt) => opt.minutes === minutes),
    chosen = optionFor(sleep.minutes) ?? sleep.options[0],
    durationText = (minutes) => `${Math.floor(minutes / 60)} H${minutes % 60 ? " 30" : ""}`,
    wakeText = (opt) => `${opt.wake}${opt.day ? ` \xB7 ${opt.day}` : ""}`,
    chosenIndex = sleep.options.indexOf(chosen),
    stayLabel = sleep.stay
      ? `UNTIL ${sleep.stay.pronoun.toUpperCase()} ${sleep.stay.pronoun === "They" ? "GET" : "GETS"} UP`
      : "",
    presets = [
      sleep.presets.until !== null && [sleep.presets.until, stayLabel, "work"],
      sleep.presets.work !== null && [sleep.presets.work, "UP FOR WORK", "work"],
      sleep.presets.full !== null && [sleep.presets.full, "UNTIL FULL", ""],
      [sleep.presets.night, "8 H", ""],
      [sleep.presets.nap, "1 H", ""],
    ].filter(Boolean),
    workChip = {
      early: ["gain", `IN TIME FOR WORK \xB7 ${sleep.walk} min to the Office`],
      ontime: ["gain", `IN TIME FOR WORK \xB7 ${sleep.walk} min to the Office`],
      late: ["late", "LATE FOR WORK \xB7 on time until 10:00"],
      miss: ["late", "YOU'D MISS THE SHIFT"],
    }[chosen.work],
    chips = [
      chosen.energy > 0
        ? `<span class="mls-h-chip gain">+${chosen.energy} Energy${chosen.full ? " \xB7 full" : ""}</span>`
        : '<span class="mls-h-chip">Energy full</span>',
      chosen.hunger > 0 ? `<span class="mls-h-chip">\u2212${chosen.hunger} Hunger</span>` : "",
      chosen.hungry ? `<span class="mls-h-chip warn">YOU'LL WAKE UP HUNGRY</span>` : "",
      workChip ? `<span class="mls-h-chip ${workChip[0]}">${workChip[1]}</span>` : "",
    ].join("");
  return `<div class="mls-h-panel mls-sleep">
    <div class="mls-h-head">${sleep.stay ? `<button class="mls-back flat" data-do="sleep-close">\u25C2 BACK</button><h2>STAY THE NIGHT</h2><small>at ${escape(sleep.stay.name)}'s \xB7 as good as your bed \xB7 +${sleep.stay.romance} Romance \xB7 +${sleep.stay.trust} Trust</small>` : `<button class="mls-back flat" data-do="sleep-close">\u25C2 HOME</button><h2>SLEEP</h2><small>your bed gives about +${sleep.rate} energy an hour</small>`}</div>
    ${error ? `<div class="mls-said bad">${escape(error)}</div>` : ""}
    <div class="mls-sleep-dial">
      <button data-do="sleep-pick" data-minutes="${sleep.options[chosenIndex - 1]?.minutes ?? chosen.minutes}" ${chosenIndex > 0 ? "" : "disabled"}>\u2212</button>
      <div class="v"><b>${durationText(chosen.minutes)}</b><small>WAKE AT <em>${escape(chosen.wake)}</em>${chosen.day ? ` \xB7 ${chosen.day}` : ""}</small></div>
      <button data-do="sleep-pick" data-minutes="${sleep.options[chosenIndex + 1]?.minutes ?? chosen.minutes}" ${chosenIndex < sleep.options.length - 1 ? "" : "disabled"}>+</button>
    </div>
    <div class="mls-sleep-presets">${presets.map(([minutes, label, cls]) => `<button class="${cls} ${minutes === chosen.minutes ? "on" : ""}" data-do="sleep-pick" data-minutes="${minutes}">${label}<small>${escape(minutes === sleep.presets.nap ? "a nap" : wakeText(optionFor(minutes)))}</small></button>`).join("")}</div>
    <div class="mls-sleep-out">${chips}</div>
    <button class="mls-sleep-go" data-do="sleep-go">${sleep.stay ? "STAY" : "SLEEP"} ${durationText(chosen.minutes)} \u25B8<small>UNTIL ${escape(wakeText(chosen))}</small></button>
  </div>`;
}
function sleepPanel(person, error = "") {
  const wake = person.asleep.wake,
    offRow = (label, time) =>
      `<div class="mls-opt off"><span class="n">${label}</span><span class="hours">${time}</span><span class="d">They're asleep</span></div>`;
  return `
    <div class="mls-talk mls-sleeping">
      ${error ? `<div class="mls-said bad mls-talk-error">${escape(error)}</div>` : ""}
      <div class="who-head"><h2><button class="mls-namelink" data-do="sheet" data-character="${person.id}" title="Open their sheet">${escape(person.name.toUpperCase())}</button></h2><button data-do="talk-done">DONE</button></div>
      <div class="mls-asleep"><b>ASLEEP</b><span>until ${escape(person.asleep.until)}</span></div>
      <button class="mls-opt" data-do="wake" data-character="${person.id}"><span class="n">Wake them up</span><span class="hours">${wake.minutes}m</span>
        <span class="d">${escape([wake.hint, wake.why].filter(Boolean).join(" \xB7 "))}</span></button>
      <div class="sep">QUICK</div>
      ${offRow("Chat", "10m")}${offRow("Flirt", "10m")}${offRow("Give a gift", "5m")}
    </div>`;
}
function doorCard(view) {
  const door = view.door,
    visitor = (view.contacts ?? []).find((contact) => contact.id === door.characterId) ?? {
      id: door.characterId,
      name: door.name,
    },
    withFood = !!door.food;
  return `
    <div class="mls-card-veil">
      <div class="mls-card mls-bell" style="--c:${colourFor(visitor.id)}">
        <div class="kicker"><b>${escape(view.hud?.time ?? "")}</b>YOUR DOOR${door.unit ? ` \xB7 ${escape(door.unit)}` : ""}</div>
        <div class="face">${frameImg(visitor)}</div>
        <div class="who">
          <span class="knock">SOMEONE IS KNOCKING${withFood ? " \xB7 WITH FOOD" : ""}</span>
          <div class="what">${escape(door.name.toUpperCase())}</div>
          <span class="wants">${escape(door.name.toUpperCase())} ${escape(door.says)}</span>
          ${door.line ? `<span class="wants">\u201C${escape(door.line)}\u201D</span>` : ""}
        </div>
        <div class="opts">
          <button class="in" data-do="door-open">LET ${escape(door.name.toUpperCase())} IN \u25B8<small>${withFood ? "You eat together" : "The scene starts inside"}</small></button>
          <button class="out" data-do="door-shut">DON'T OPEN<small>${withFood ? `${escape(door.name)} leaves it at the door` : door.milestone === "drop-by" ? `${escape(door.name)} leaves` : `${escape(door.name)} leaves, and comes back another day`}</small></button>
        </div>
      </div>
    </div>`;
}
function doorPanel(person, talk, visit, { said = "", error = "" } = {}) {
  const invite = visit.invite ?? {
      yes: false,
      why: "",
    },
    answer = invite.yes
      ? `<div class="mls-answer yes"><b>\xABCome in.\xBB</b><small>${escape(visit.name.toUpperCase())} ASKS YOU IN \xB7 ${escape(invite.why)}</small>
        <button data-do="visit-in">GO IN \u25B8<small>${visit.until ? `until ${escape(visit.until)} \xB7 ${visit.reason === "sleep" ? "then bed" : visit.reason === "work" ? "then work" : "then they head out"}` : "no hurry"}</small></button></div>`
      : `<div class="mls-answer no"><b>NOT TODAY</b><small>${escape(invite.why)}</small></div>`;
  return talkPanel(person, talk, error, {
    door: {
      answer: answer,
      said: said,
    },
  });
}
function togetherView(together) {
  const chipsFor = (item) =>
      [
        item.food ? `<span class="chip gain">+${item.food} Hunger \xB7 both</span>` : "",
        item.uses ? `<span class="chip">uses ${escape(item.uses)}</span>` : "",
        item.rest ? `<span class="chip gain">+${item.rest} Energy</span>` : "",
        ...Object.entries(item.bonds).map(
          ([key, amount]) => `<span class="chip gain">+${amount} ${key[0].toUpperCase()}${key.slice(1)}</span>`,
        ),
        ...Object.entries(item.skills).map(
          ([key, amount]) => `<span class="chip gain">+${amount} ${key[0].toUpperCase()}${key.slice(1)}</span>`,
        ),
      ].join(""),
    durationText = (minutes) => (minutes >= 60 ? `${Math.round((minutes / 60) * 10) / 10}h` : `${minutes}m`),
    activityButton = (item) => `
    <button class="mls-activity two ${item.available ? "" : "off"} ${item.theirs ? "theirs" : ""} ${item.locked ? "locked" : ""}" data-do="${item.kitchen ? "together-kitchen" : "together"}" data-character="${together.characterId}" data-id="${item.key}" ${item.available ? "" : "disabled"}>
      <span class="n">${item.theirs && item.key !== "cooks" ? '<span class="mls-arch">\u2726 THEIR THING</span>' : ""}${item.locked ? "\u{1F512} " : ""}${escape(item.name)}</span>
      ${item.kitchen ? '<span class="hours">\u25B8<small>RECIPE</small></span>' : `<span class="hours">${durationText(item.minutes)}<small>TIME</small></span>`}
      <span class="chips">${
        item.kitchen
          ? `<span class="chip">in your kitchen</span>${Object.entries(item.bonds)
              .map(
                ([key, amount]) => `<span class="chip gain">+${amount} ${key[0].toUpperCase()}${key.slice(1)}</span>`,
              )
              .join("")}`
          : chipsFor(item)
      }</span>
      ${item.available ? "" : `<span class="why">${escape(item.why)}</span>`}
    </button>`,
    stayButton = together.stay
      ? `
    <button class="mls-activity two stay ${together.stay.ok ? "" : "off"} ${together.stay.why === "From partners" ? "locked" : ""}" data-do="stay" data-character="${together.characterId}" ${together.stay.ok ? "" : "disabled"}>
      <span class="n">${together.stay.why === "From partners" ? "\u{1F512} " : ""}Stay the night</span>
      <span class="hours">\u25B8<small>PICK</small></span>
      <span class="chips"><span class="chip gain">As good as your bed</span><span class="chip gain">+3 Romance</span><span class="chip gain">+3 Trust</span></span>
      ${together.stay.ok ? "" : `<span class="why">${escape(together.stay.why)}</span>`}
    </button>`
      : "",
    byeButton = together.guest
      ? `
    <button class="mls-activity two bye" data-do="guest-bye">
      <span class="n">See ${escape(together.name)} out</span>
      <span class="hours">\u25B8<small>GOODBYE</small></span>
      <span class="chips"></span>
    </button>`
      : "";
  return `
    <div class="mls-acts-head mls-with"><h2>WITH ${escape(together.name.toUpperCase())}</h2>
      <span class="until">${together.reason === "working" ? `working until ${escape(together.until)}` : together.until ? `until ${escape(together.until)} \xB7 ${together.guest ? "then they go home" : together.reason === "sleep" ? "then bed" : together.reason === "work" ? "then work" : "then they head out"}` : "no hurry"}</span></div>
    ${together.items.map(activityButton).join("")}${stayButton}${byeButton}`;
}
function counterStrip(clerk) {
  if (!clerk) {
    return "";
  }
  const discount = clerk.discount
    ? `<span class="mls-serve-off">${clerk.discount.why === "partner" ? "PARTNER" : "FRIEND"} DISCOUNT \xB7 \u2212${clerk.discount.off}%</span>`
    : "";
  return `<div class="mls-serve" style="--c:${colourFor(clerk.id)}">
      <span class="mls-serve-face">${clerk.met === false ? "?" : clerk.avatar ? frameImg(clerk) : escape((clerk.name ?? "?")[0])}</span>
      <div class="t"><b>${escape(clerk.name.toUpperCase())}</b>${discount}<small>${escape((clerk.work?.title ?? "Shop assistant").toUpperCase())}${clerk.work?.until ? ` \xB7 UNTIL ${escape(clerk.work.until)}` : ""}</small>
        ${clerk.greeting ? `<p>\u201C${escape(clerk.greeting)}\u201D</p>` : clerk.writing ? '<p class="writing">\u2026</p>' : ""}</div>
    </div>`;
}
function tillView(till) {
  return till
    ? `<div class="mls-till" style="--c:${colourFor(till.id)}">
      <div><b>${escape(till.name.toUpperCase())} \xB7 AT THE TILL</b>${till.text ? `<p>\u201C${escape(till.text)}\u201D</p>` : ""}
        <small>Paid $${till.total}${till.off ? ` \xB7 \u2212${till.off}% (${escape(till.name)})` : ""} \xB7 ${escape(till.after)}</small></div>
    </div>`
    : "";
}
function placeView({
  life: life,
  said: said,
  error: error,
  talkTo: talkToId = null,
  talk = {},
  busy = false,
  card = null,
  home = null,
  job = "",
  sleep = null,
}) {
  const hud = life.hud,
    atHome = life.at === "home",
    visit = life.visit ?? null;
  if (visit?.stage === "door") {
    talkToId = visit.characterId;
  }
  const place = visit
      ? {
          name: visit.stage === "door" ? `${visit.name}'s door` : `${visit.name}'s \xB7 ${visit.unit}`,
          isOpen: true,
          open: 0,
          close: 24,
        }
      : atHome
        ? {
            name: "Home",
            isOpen: true,
            open: 0,
            close: 24,
          }
        : (life.places.find((candidate) => candidate.id === life.at) ?? {
            name: "?",
            isOpen: true,
          }),
    look = atHome
      ? {
          icon: "\u{1F6CB}\uFE0F",
          bg: "linear-gradient(135deg,#6b4a3a,#2d1e19)",
        }
      : (MAP[life.at] ??
        STORE_LOOK[life.at] ?? {
          icon: "\u{1F4CD}",
          bg: "#333",
        }),
    hall = place.inside ? life.places.find((candidate) => candidate.id === place.inside) : null,
    people = life.people ?? [],
    activities = life.activities ?? [],
    picked = talkToId ? (people.find((person) => person.id === talkToId) ?? null) : null,
    talkState = talkToId ? talk[talkToId] : null,
    focus =
      picked ??
      (talkState?.bond && !talkState.waiting
        ? {
            id: talkToId,
            name: talkState.name || "They",
            met: true,
            bond: talkState.bond,
            done: {},
            gone: true,
          }
        : null),
    focusTalk = focus ? talk[focus.id] : null,
    lineHtml = focusTalk
      ? focusTalk.waiting
        ? "\u2026"
        : focusTalk.line
          ? escape(focusTalk.line)
          : focusTalk.problem
            ? "<i>No words this time, but it still counted.</i>"
            : ""
      : "",
    bubble =
      focus && lineHtml
        ? `<div class="mls-bubble ${focusTalk?.outcome === "bad" ? "flat" : ""} ${focusTalk?.waiting ? "waiting" : ""}"><b>${escape(focus.name.toUpperCase())}</b><span class="said">${lineHtml}</span>${focusTalk?.nowhere ? `<span class="left">${escape(focusTalk.nowhere)}</span>` : ""}${focusTalk?.seenBy?.length ? `<span class="mls-seen">\u{1F441} ${escape(focusTalk.seenBy.join(", ").toUpperCase())} SAW THAT</span>` : ""}${focus.gone ? `<span class="left">\u2026and then ${escape(focus.name)} had to go.</span>` : ""}</div>`
        : "",
    activityChips = (activity) =>
      [
        activity.bookName ? `<span class="chip">${escape(activity.bookName)}</span>` : "",
        activity.treat
          ? `<span class="chip treat">ON ${escape(activity.treat.name.toUpperCase())}</span>`
          : activity.costs
            ? `<span class="chip money">\u2212${activity.was ? `<s>$${activity.was}</s> ` : ""}$${activity.costs}</span>`
            : "",
        activity.discount
          ? `<span class="chip gain">\u2212${activity.discount.off}% \xB7 ${escape(activity.discount.name.toUpperCase())}</span>`
          : "",
        activity.energy ? `<span class="chip">\u2212${activity.energy} Energy</span>` : "",
        activity.hunger ? `<span class="chip">\u2212${activity.hunger} Hunger</span>` : "",
        activity.food?.hunger ? `<span class="chip gain">+${activity.food.hunger} Hunger</span>` : "",
        activity.food?.energy ? `<span class="chip gain">+${activity.food.energy} Energy</span>` : "",
        activity.restEnergy ? `<span class="chip gain">+${activity.restEnergy} Energy</span>` : "",
        ...Object.entries(activity.gives ?? {}).map(
          ([key, amount]) => `<span class="chip gain">+${amount} ${key[0].toUpperCase()}${key.slice(1)}</span>`,
        ),
        ...(activity.ceiling ?? []).map((cap) => {
          const skillName = `${cap.skill[0].toUpperCase()}${cap.skill.slice(1)}`;
          return `<span class="chip">${cap.past ? `Too easy for your ${skillName} now` : `Up to ${skillName} ${cap.level}`}</span>`;
        }),
        activity.lends ? `<span class="chip gain">A book for ${activity.lends} days</span>` : "",
        activity.sleep
          ? activity.energyFull
            ? '<span class="chip">Energy full</span>'
            : `<span class="chip gain">+${activity.sleepEnergy ?? 0} Energy${activity.fills ? " \xB7 full" : ""}</span>`
          : "",
        activity.sleep && activity.sleepHunger ? `<span class="chip">\u2212${activity.sleepHunger} Hunger</span>` : "",
        activity.job ? '<span class="chip money pay">Paid work</span>' : "",
        activity.job && activity.onTimeUntil && activity.available
          ? `<span class="chip gain">on time until ${escape(activity.onTimeUntil)}</span>`
          : "",
        activity.apply
          ? `<span class="chip">Interview with ${escape(activity.apply.with)}</span><span class="chip money pay">${escape(activity.apply.position)} \xB7 $${activity.apply.pay} a shift</span>`
          : "",
      ]
        .filter(Boolean)
        .join("");
  return `
    <div class="mls-place-screen ${focus ? "focus" : ""}" style="--bg:${look.bg}">
      ${life.backdrop?.here ? `<div class="scene has-pic" style="background-image:url('${escape(life.backdrop.here)}')"></div>` : `<div class="scene"><span class="big">${look.icon}</span></div>`}
      <div class="wash"></div>

      <div class="mls-place-title">
        <div class="mls-place-top">
          ${onLunch(life) ? (talkToId ? `<button class="mls-back flat" data-do="talk-done">\u25C2 ${escape((life.hud?.place?.name ?? "Office").toUpperCase())}</button>` : "") : '<button class="mls-back flat" data-do="map">\u25C2 MAP</button>'}
          ${atHome ? `<button class="mls-back flat" data-do="corridor" data-place="${life.homeAt}">\u25C2 ${escape((life.corridors?.[life.homeAt]?.name ?? "Outside").toUpperCase())}</button>` : ""}
          ${visit ? `<button class="mls-back flat" data-do="visit-out">\u25C2 ${escape((life.corridors?.[visit.place]?.name ?? "Outside").toUpperCase())}</button>` : ""}
          ${hall ? `<button class="mls-back flat" data-do="to-hall">\u25C2 ${escape(hall.name.toUpperCase())}</button>` : ""}
          ${placeHud(hud)}
        </div>
        ${
          focus && people.length > 1
            ? `<button class="mls-everyone" data-do="talk-done">\u25C2 EVERYONE<small>${people.length} people here</small></button>`
            : `<h1>${escape(life.party && (atHome || visit) ? (life.party.hostName ? `${life.party.hostName}'s party` : "Your party") : atHome ? `${place.name} \xB7 ${life.residence?.unit ?? ""}` : place.name)}</h1>
        <div class="meta">${life.party && (atHome || visit) ? escape(`${life.party.rooms.find((room) => room.here)?.name ?? ""} \xB7 until ${life.party.until}`) : visit ? (visit.stage === "door" ? `${escape(visit.door ?? (visit.house ? "House" : "Apartment"))} ${escape(visit.unit)}` : `Their home${visit.until ? ` \xB7 until ${escape(visit.until)}` : ""}`) : place.isOpen ? hours(place) : "Closed right now"}</div>
        ${atHome && !visit && home?.things?.orders?.length ? `<div class="meta deliv">Delivery \xB7 ${escape(home.things.orders[0].when)}</div>` : ""}
        ${bgIcon(life.backdrop?.wanted?.here, "big")}`
        }
      </div>

      ${bubble}
      ${typeof S < "u" && S.stuck && life.party ? sceneErr(error, S.stuck) : ""}
      <div class="mls-people ${focus ? "talking" : ""}">
        ${
          people.length
            ? people
                .map(
                  (person) => `
          <button class="mls-person ${person.id === talkToId ? "picked" : ""} ${person.met === false ? "stranger" : ""}${person.asleep ? " asleep" : ""}${person.seenWith ? " seen-with" : ""}" data-do="pick-person" data-character="${person.id}" style="--c:${colourFor(person.id)}">
            <span class="body ${person.avatar ? "framed" : ""}">${frameImg(person)}</span>
            ${person.avatar ? "" : '<span class="tap">PORTRAIT</span>'}
            ${person.events?.next && !person.asleep ? '<span class="mls-bang">!</span>' : ""}
            ${person.asleep ? '<span class="mls-zzz" aria-hidden="true">z<i>z</i><b>Z</b></span>' : ""}
            <span class="plate"><b>${escape(person.name)}</b><span>${escape(person.asleep ? `ASLEEP \xB7 until ${person.asleep.until}` : person.woken ? `up \xB7 back to bed at ${person.woken.back}` : person.work ? `${person.work.title.toUpperCase()}${person.work.until ? ` \xB7 until ${person.work.until}` : ""}` : person.doing || "here")}</span>
              <em>${person.met === false ? "You have not met" : escape(bondLine(person.bond))}</em></span>
          </button>`,
                )
                .join("")
            : ""
        }
      </div>

      ${
        focus?.asleep
          ? sleepPanel(focus, error)
          : focus && visit?.stage === "door"
            ? doorPanel(focus, talk[focus.id], visit, {
                said: said,
                error: error,
              })
            : focus
              ? talkPanel(focus, talk[focus.id], error)
              : sleep
                ? `<div class="mls-acts">${sleepChoiceView(sleep, error)}</div>`
                : visit && life.party
                  ? `
      <div class="mls-acts">${partyRunView(life.party)}</div>`
                  : visit
                    ? `
      <div class="mls-acts">
        ${planStripView(life, {
          where: "place",
        })}${planTagsView(life)}
        ${(life.together ?? []).map((together) => togetherView(together)).join("")}
      </div>`
                    : atHome && life.party
                      ? `
      <div class="mls-acts">${partyRunView(life.party)}</div>`
                      : atHome && life.partyOver && !life.partyOver.theirs
                        ? `
      <div class="mls-acts">${partyOverView(life.partyOver)}</div>`
                        : (atHome && home?.panel === "party") || (typeof S < "u" && S.hp?.words)
                          ? `
      <div class="mls-acts">${housePartyPanel()}</div>`
                          : atHome && home?.panel
                            ? `
      <div class="mls-acts">${homePanelView({
        panel: home.panel,
        things: home.things,
        pick: home.pick,
        said: said,
        error: error,
      })}</div>`
                            : `
      <div class="mls-acts">
        ${planStripView(life, {
          where: "place",
        })}${planTagsView(life)}
        ${atHome ? partyStripView(life) + homeOptionsView(home?.things ?? null) : ""}
        ${counterStrip(life.counter)}
        ${onLunch(life) ? lunchBox(life.career?.shift) : ""}
        ${streetBox(life)}
        ${
          atHome
            ? (life.together ?? [])
                .filter((together) => together.guest)
                .map((together) => togetherView(together))
                .join("")
            : ""
        }
        <div class="mls-acts-head">
          <h2>WHAT TO DO</h2>
        </div>
        ${
          activities.length
            ? activities
                .map(
                  (activity) => `
          <button class="mls-activity ${activity.available ? "" : "off"}" data-do="activity" data-activity="${activity.id}" ${activity.available ? "" : "disabled"}>
            <span class="n">${escape(activity.name)}${activity.npc ? NPC_TAG : ""}</span>
            <span class="hours">${activity.opens === "back" ? "\u25B8<small>NOW</small>" : activity.opens === "bag" ? "\u25B8<small>BACKPACK</small>" : activity.opens || activity.pick ? "\u25B8<small>OPEN</small>" : activity.minutes ? `${activity.minutes >= 60 ? `${Math.round((activity.minutes / 60) * 10) / 10}h` : `${activity.minutes}m`}<small>TIME</small>` : "\u25B8<small>NOW</small>"}</span>
            <span class="chips">${activityChips(activity)}${activity.opens && life.counter?.discount ? `<span class="chip gain">\u2212${life.counter.discount.off}% \xB7 ${escape(life.counter.name)}</span>` : ""}</span>
            ${activity.available ? "" : `<span class="why">${escape(activity.why)}</span>`}
          </button>`,
                )
                .join("")
            : '<div class="nobody">Nothing to do here.</div>'
        }
        ${
          atHome
            ? (life.together ?? [])
                .filter((together) => !together.guest)
                .map((together) => togetherView(together))
                .join("")
            : ""
        }
      </div>`
      }
      ${card ? cardView(card) : job || (life.door ? doorCard(life) : "")}
    </div>`;
}
const MANSION_COLOURS = [
  ["#efe7d8", "#5a5048"],
  ["#e6e1d6", "#3f4a55"],
  ["#f2ece2", "#6a5a44"],
  ["#e4dccd", "#4a4038"],
];
const HOUSE_COLOURS = [
  ["#e8dcc4", "#7a3b2e"],
  ["#c9d8c5", "#3e5a4a"],
  ["#d9b8a0", "#5a3a2a"],
  ["#b9c6d6", "#384a66"],
  ["#e3c9c9", "#6a3048"],
  ["#d8d0a8", "#4a4a2a"],
];
function corridorView({ life: life, placeId: placeId, said: said, error: error }) {
  const corridor = life.corridors?.[placeId],
    hud = life.hud;
  if (!corridor) {
    return '<div class="mls-corridor"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><p>There is nothing here.</p></div>';
  }
  const tilts = [-2, 2, -1.5, 1.5, -2.5],
    isStreet = placeId === "houses" || placeId === "mansions",
    doors = corridor.floors.flatMap((floor) => floor.doors),
    namesById = Object.fromEntries(doors.flatMap((door) => door.residents).map((door) => [door.id, door.name])),
    residentsById = Object.fromEntries(doors.flatMap((door) => door.residents).map((door) => [door.id, door])),
    residentNames = (door) => door.residents.map((resident) => resident.name).join(" & "),
    doorView = (door, index) => {
      const inside = door.inNow.filter((id) => id !== "you"),
        resting = [...(door.asleep ?? []), ...(door.quiet ?? [])],
        awake = inside.filter((id) => !resting.includes(id)),
        nameList = (ids) => ids.map((id) => escape(namesById[id] ?? "?")).join(", "),
        stateText = door.stranger
          ? "A neighbour you have not met"
          : door.mine
            ? awake.length
              ? `<em>${nameList(awake)}</em> is home${door.asleep?.length ? ` \xB7 <em>${nameList(door.asleep)}</em> asleep` : ""}`
              : door.asleep?.length
                ? `<em>${nameList(door.asleep)}</em> is asleep`
                : door.inNow.includes("you")
                  ? "You are in"
                  : inside.length
                    ? "Quiet"
                    : "Nobody is home"
            : door.knock?.working
              ? "<em>WORKING</em> \xB7 lights on"
              : awake.length
                ? "<em>Home right now</em> \xB7 lights on"
                : door.asleep?.length
                  ? "<em>Lights off</em> \xB7 asleep"
                  : door.quiet?.length
                    ? "Quiet"
                    : "Out right now",
        knock = door.knock,
        action = door.mine
          ? '<button class="mls-door-act go" data-do="go-in">GO IN \u25B8</button>'
          : door.stranger || !knock
            ? ""
            : knock.key && knock.working
              ? `<button class="mls-door-act later" disabled>GO IN<small>Working until ${escape(knock.working)}</small></button>
          <button class="mls-door-act go" data-do="knock" data-character="${escape(knock.character)}">KNOCK \u25B8<small>1 min</small></button>`
              : knock.key
                ? `<button class="mls-door-act go" data-do="key-in" data-character="${escape(knock.character)}">GO IN \u25B8<small>you have the key</small></button>`
                : knock.ok
                  ? `<button class="mls-door-act go" data-do="knock" data-character="${escape(knock.character)}">KNOCK \u25B8<small>${knock.wakes ? "it wakes them" : "1 min"}</small></button>`
                  : knock.why
                    ? `<button class="mls-door-act later" disabled>KNOCK<small>${escape(knock.why)}</small></button>`
                    : "",
        lit = awake.length || door.inNow.includes("you");
      return `
      <div class="mls-door ${door.mine ? "mine" : ""} ${door.stranger ? "stranger" : ""} ${lit ? "in" : ""} ${resting.length && !lit ? "dark" : ""}" data-unit="${escape(door.unit)}">
        ${door.residents.some((resident) => resident.bang) ? '<span class="mls-bang">!</span>' : ""}
        <div class="plate" style="--pc:${door.stranger ? "#2b2b30" : door.mine ? "var(--red)" : colourFor(door.residents[0]?.id)};--r:${tilts[index % 5]}deg">
          ${door.stranger ? "\u2014" : escape(residentNames(door).toUpperCase())}<small>${door.mine ? "YOUR DOOR \xB7 " : ""}${escape(door.unit)}</small></div>
        <div class="leaf"><span class="lit"></span><span class="win"></span><span class="no">${escape(door.unit)}</span></div>
        <div class="base"><span class="state">${stateText}</span>${action}</div>
        ${
          inside.length
            ? `<div class="heads">${inside
                .map((id) =>
                  headOf(
                    residentsById[id] ?? {
                      id: id,
                      name: namesById[id] ?? "?",
                    },
                    resting.includes(id) ? "asleep" : "",
                  ),
                )
                .join("")}</div>`
            : ""
        }
      </div>`;
    },
    houseView = (door, index) => {
      const inside = door.inNow.filter((id) => id !== "you"),
        resting = [...(door.asleep ?? []), ...(door.quiet ?? [])],
        awake = inside.filter((id) => !resting.includes(id)),
        nameList = (ids) => ids.map((id) => namesById[id] ?? "?").join(", "),
        lit = awake.length > 0 || door.inNow.includes("you"),
        dark = (door.asleep ?? []).length > 0 && !lit,
        stateText = door.stranger
          ? ""
          : door.mine
            ? awake.length
              ? `${nameList(awake)} is home`
              : door.inNow.includes("you")
                ? "You are in"
                : "Nobody home"
            : door.knock?.working
              ? "Working"
              : lit
                ? "Home"
                : dark
                  ? "Asleep"
                  : door.quiet?.length
                    ? "Quiet"
                    : "Out",
        knock = door.knock,
        action = door.mine
          ? '<button class="mls-house-tag go" data-do="go-in">GO IN \u25B8</button>'
          : door.stranger || !knock
            ? ""
            : knock.ok
              ? `<button class="mls-house-tag go" data-do="knock" data-character="${escape(knock.character)}">KNOCK \u25B8${knock.wakes ? "<small>it wakes them</small>" : ""}</button>`
              : knock.why
                ? `<span class="mls-house-tag off">KNOCK<small>${escape(knock.why)}</small></span>`
                : "",
        isMansion = placeId === "mansions",
        palette = isMansion ? MANSION_COLOURS : HOUSE_COLOURS,
        [wall, roof] = palette[index % palette.length],
        plateColour = door.stranger ? "#55555c" : door.mine ? "var(--red)" : colourFor(door.residents[0]?.id);
      return `
      <div class="mls-house ${isMansion ? "mansion" : ""} ${lit ? "lit" : ""} ${dark ? "dark" : ""} ${door.mine ? "mine" : ""} ${door.stranger ? "stranger" : ""}" data-unit="${escape(door.unit)}" style="--wall:${wall};--roof:${roof};--pc:${plateColour}">
        ${door.residents.some((resident) => resident.bang) ? '<span class="mls-bang">!</span>' : ""}
        <div class="roof"></div>
        <div class="front">
          <span class="win l">${dark ? "<i>z</i>" : ""}</span><span class="win r"></span>
          ${isMansion ? '<span class="win u l"></span><span class="win u r"></span><span class="win u m"></span><span class="col l"></span><span class="col r"></span><span class="pediment"></span><span class="lamp l2"></span><span class="lawn"></span><span class="fence l"></span><span class="fence r"></span>' : ""}
          <span class="lamp"></span><span class="step"></span>
          <span class="bush l"></span><span class="bush r"></span>
          <span class="plaque"><b>${door.stranger ? "\u2014" : escape(residentNames(door))}</b><small>${escape(door.unit)}${stateText ? ` \xB7 ${escape(stateText)}` : ""}</small></span>
          <span class="door"><i></i><em></em></span>
          ${action}
          ${
            inside.length
              ? `<div class="heads">${inside
                  .map((id) =>
                    headOf(
                      residentsById[id] ?? {
                        id: id,
                        name: namesById[id] ?? "?",
                      },
                      resting.includes(id) ? "asleep" : "",
                    ),
                  )
                  .join("")}</div>`
              : ""
          }
        </div>
      </div>`;
    };
  let doorIndex = 0;
  const rows = corridor.floors
    .map(
      (floor) => `
    ${floor.label ? `<div class="mls-floor" data-floor="${escape(floor.label)}">${escape(floor.label)}</div>` : ""}
    ${floor.doors.map((door) => (isStreet ? houseView(door, doorIndex++) : doorView(door, doorIndex++))).join("")}`,
    )
    .join("");
  return `
    <div class="mls-corridor ${isStreet ? "street" : "building"} ${placeId === "tower" || placeId === "mansions" ? `luxe ${placeId}` : ""}">
      <div class="top">
        <button class="mls-back flat" data-do="map">\u25C2 MAP</button>
        <h1>${escape(corridor.name.toUpperCase())}</h1>
        <span class="sub">${
          {
            tower: "Luxury tower",
            mansions: "Street of mansions",
          }[placeId] ?? (isStreet ? "Street of houses" : "Apartment building")
        }</span>
        ${planTagsView(life)}
        <div class="clock"><small>${escape(hud.clock.weekday.toUpperCase())}</small>${escape(hud.time)}</div>
      </div>
      ${planStripView(life, {
        where: "corridor",
      })}
      <div class="hall ${life.backdrop?.places?.[placeId] ? "has-pic" : ""}" id="mls-hall" data-drag-scroll
        ${life.backdrop?.places?.[placeId] ? `style="background-image:url('${escape(life.backdrop.places[placeId])}')"` : ""}><div class="row">${rows}</div></div>
    </div>`;
}
const STORE_LOOK = {
  "store-casual": {
    group: "CLOTHES",
    sub: "Clothes \xB7 every section",
    icon: "\u{1F455}",
    pc: "#5a5a60",
    bg: "linear-gradient(160deg,#6b6b6b,#2a2a2a)",
    line: "Casual, sport, formal, fashion",
  },
  furniture: {
    group: "HOME",
    sub: "Furniture",
    icon: "\u{1F6CB}\uFE0F",
    pc: "#6a5a8a",
    bg: "linear-gradient(160deg,#8a7aa8,#2a2438)",
    line: "Beds, sofas, desks",
  },
  "gift-shop": {
    group: "GIFTS & FOOD",
    sub: "Gifts",
    icon: "\u{1F381}",
    pc: "#00897b",
    bg: "linear-gradient(160deg,#4aa89a,#123a34)",
    line: "Books, music, tech, jewelry\u2026",
  },
  "food-court": {
    group: "GIFTS & FOOD",
    sub: "Eat",
    icon: "\u{1F35C}",
    pc: "#f57c00",
    bg: "linear-gradient(160deg,#c98a4a,#4b2d1a)",
    line: "Ramen, burgers, cr\xEApes",
  },
  cinema: {
    group: "FUN",
    sub: "Movies",
    icon: "\u{1F3AC}",
    pc: "#e5191c",
    bg: "linear-gradient(160deg,#6a2a2a,#1a0a0a)",
    line: "A movie, about two hours",
  },
  arcade: {
    group: "FUN",
    sub: "Games",
    icon: "\u{1F579}\uFE0F",
    pc: "#388e3c",
    bg: "linear-gradient(160deg,#3a8a5a,#0f2a1a)",
    line: "Rhythm games, claw machines",
  },
  karaoke: {
    group: "FUN",
    sub: "Singing",
    icon: "\u{1F3A4}",
    pc: "#8e24aa",
    bg: "linear-gradient(160deg,#6a3a8a,#1f1029)",
    line: "Private rooms",
  },
};
function mallView({ life: life, said: said, error: error }) {
  const mall = life.mall,
    hud = life.hud;
  if (!mall) {
    return '<div class="mls-corridor"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><p>There is nothing here.</p></div>';
  }
  const tilts = [-2, 2, -1.5, 1.5, -2.5],
    hourText = (hour) => String(hour % 24).padStart(2, "0");
  let lastGroup = "";
  const stores = mall.stores
      .map((store, index) => {
        const look = STORE_LOOK[store.id] ?? {
            group: "",
            sub: "",
            icon: "\u{1F3EC}",
            pc: "#3a3a40",
            bg: "#333",
            line: "",
          },
          groupHead =
            look.group && look.group !== lastGroup ? `<div class="mls-floor">${escape(look.group)}</div>` : "";
        lastGroup = look.group;
        const backdrop = life.backdrop?.places?.[store.id],
          names = store.people.map((person) => escape(person.met === false ? "Someone you have not met" : person.name));
        return `${groupHead}
      <div class="mls-door mls-store ${store.people.length ? "in" : ""} ${store.here ? "here" : ""}" data-unit="${escape(store.id)}">
        ${store.people.some((person) => person.bang) ? '<span class="mls-bang">!</span>' : ""}
        <div class="plate" style="--pc:${look.pc};--r:${tilts[index % 5]}deg">${escape(store.name.toUpperCase())}<small>${escape(look.sub.toUpperCase())}</small></div>
        <div class="leaf window ${backdrop ? "has-pic" : ""}" style="--bg:${look.bg}${backdrop ? `;background-image:url('${escape(backdrop)}')` : ""}">
          ${backdrop ? "" : `<span class="ic">${look.icon}</span>`}${store.news ? `<span class="new">${store.news} NEW \u2726</span>` : ""}
          ${store.isOpen ? "" : `<span class="shut">${mall.isOpen ? `OPENS ${hourText(store.open)}:00` : "CLOSED"}</span>`}</div>
        <div class="base"><span class="state">${names.length ? `<em>${names.join(", ")}</em> inside` : escape(look.line)}</span>
          <button class="mls-door-act go" data-do="store-in" data-place="${escape(store.id)}">${store.here ? "BACK IN \u25B8" : "GO IN \u25B8"}</button></div>
        ${store.people.length ? `<div class="heads">${store.people.map((person) => headOf(person)).join("")}</div>` : ""}
      </div>`;
      })
      .join(""),
    mallBackdrop = life.backdrop?.places?.mall ?? "";
  return `
    <div class="mls-corridor mls-mall building">
      <div class="top">
        <button class="mls-back flat" data-do="map">\u25C2 MAP</button>
        <h1>${escape(mall.name.toUpperCase())}</h1>
        <span class="sub">${mall.isOpen ? `Open ${hours(mall)}` : "Closed now"}</span>
        <div class="clock"><small>${escape(hud.clock.weekday.toUpperCase())}</small>${escape(hud.time)}</div>
      </div>
      <div class="hall ${mallBackdrop ? "has-pic" : ""}" id="mls-hall" data-drag-scroll ${mallBackdrop ? `style="background-image:url('${escape(mallBackdrop)}')"` : ""}><div class="row">${stores}</div></div>
    </div>`;
}
function centreOf(root, placeId) {
  const box = root.querySelector("#mls-places")?.getBoundingClientRect();
  if (!box) {
    return null;
  }
  if (placeId === "sign") {
    const sign = root.querySelector(".mls-district-head .mls-sign");
    if (!sign) {
      return null;
    }
    const rect2 = sign.getBoundingClientRect();
    return [rect2.left + rect2.width / 2 - box.left, rect2.bottom - box.top];
  }
  const card = root.querySelector(`#mls-board [data-place="${placeId}"]`);
  if (!card) {
    return null;
  }
  const rect = card.getBoundingClientRect();
  return [rect.left + rect.width / 2 - box.left, rect.top + rect.height / 2 - box.top];
}
function walkSpots(walker, points, pairs, lines, { initial = "", avatar = null, ms = 220, hold = ms } = {}) {
  return !walker || points.length < 2
    ? Promise.resolve()
    : (avatar
        ? ((walker.textContent = ""),
          (walker.style.backgroundImage = `url("${avatar}")`),
          walker.classList.add("has-face"))
        : ((walker.textContent = initial), (walker.style.backgroundImage = ""), walker.classList.remove("has-face")),
      (walker.hidden = false),
      (walker.style.transition = "none"),
      (walker.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px) translate(-50%, -50%)`),
      new Promise((resolve) => {
        let step = 0;
        const advance = () => {
          if (step >= points.length - 1) {
            setTimeout(() => {
              walker.hidden = true;
              resolve();
            }, hold);
            return;
          }
          const [from, to] = pairs[step] ?? [],
            line = lines.find(
              (lineEl) => lineEl.dataset.pair === `${from}|${to}` || lineEl.dataset.pair === `${to}|${from}`,
            );
          if (line) {
            line.classList.add("hot");
            setTimeout(() => line.classList.remove("hot"), ms * 2);
          }
          step++;
          setTimeout(() => {
            walker.style.transition = `transform ${ms}ms linear`;
            walker.style.transform = `translate(${points[step][0]}px, ${points[step][1]}px) translate(-50%, -50%)`;
            setTimeout(advance, ms);
          }, 20);
        };
        setTimeout(advance, 20);
      }));
}
function walkAlong(root, fromId, toId, opts = {}) {
  const start = fromId && root.querySelector(`#mls-board [data-place="${fromId}"]`) ? fromId : "sign",
    points = [centreOf(root, start), centreOf(root, toId)];
  return !points[0] || !points[1] || start === toId
    ? Promise.resolve()
    : walkSpots(
        root.querySelector("#mls-walker"),
        points,
        [[start, toId]],
        [...root.querySelectorAll("#mls-links line")],
        opts,
      );
}
function walkTown(root, route, opts = {}) {
  const town = root.querySelector("#mls-town");
  if (!town || !Array.isArray(route) || route.length < 2) {
    return Promise.resolve();
  }
  const width = town.clientWidth,
    height = town.clientHeight,
    points = route
      .map((districtId) => TOWN_SPOT[districtId])
      .filter(Boolean)
      .map(([x, y]) => [(x / 100) * width, (y / 100) * height]);
  return walkSpots(
    town.querySelector("#mls-town-walker"),
    points,
    route.slice(1).map((to, index) => [route[index], to]),
    [...town.querySelectorAll("line")],
    opts,
  );
}
function drawLinks(root) {
  const board = root.querySelector("#mls-board"),
    links = root.querySelector("#mls-links");
  if (!board || !links) {
    return;
  }
  const placeIds = [...board.querySelectorAll("[data-place]")].map((card) => card.dataset.place),
    lineHtml = (from, to) => {
      const fromPt = centreOf(root, from),
        toPt = centreOf(root, to);
      return fromPt && toPt
        ? `<line data-pair="${from}|${to}" x1="${fromPt[0]}" y1="${fromPt[1]}" x2="${toPt[0]}" y2="${toPt[1]}"></line>`
        : "";
    };
  links.innerHTML = [
    ...placeIds.map((placeId) => lineHtml("sign", placeId)),
    ...placeIds.slice(1).map((placeId, index) => lineHtml(placeIds[index], placeId)),
  ].join("");
}

export {
  AXIS_NAME,
  CAP_TAG,
  CAP_WHY,
  STORE_LOOK,
  corridorView,
  counterStrip,
  drawLinks,
  greyRow,
  mallView,
  onLunch,
  placeView,
  tierLabel,
  tillView,
  walkAlong,
  walkTown,
  yourGenderAsk,
};
