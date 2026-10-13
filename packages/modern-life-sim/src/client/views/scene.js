// Scene screen: clock, log, calls, milestone/tier summaries
import { MAP, bgIcon, colourFor, escape, frameImg, paintIcon } from "./common.js";
import { AXIS_NAME, CAP_TAG, CAP_WHY, tierLabel } from "./place.js";
import { newsFace } from "./people.js";
import { NPC_TAG } from "./mods.js";
import { S } from "../state.js";

const READ_WORDS = {
  warm: "warm",
  funny: "funny",
  curious: "curious",
  flirty: "flirty",
  awkward: "awkward",
  cold: "cold",
  rude: "rude",
};
const BAD_READS = new Set(["cold", "rude", "awkward"]);
const placeShut = (view) => {
  const place = view.places?.find((candidate) => candidate.id === view.at);
  return !view.outing && !!place && !place.residence && !place.isOpen;
};
const closingLeft = (talk, index) =>
  talk.done && (talk.endedBy !== "player" || talk.goodbye) && index < talk.batch.length;
function readingLine(talk, index, hidden) {
  return !talk || hidden ? false : talk.done ? closingLeft(talk, index) : index < talk.batch.length;
}
function hereStrip(here, view) {
  if (!here?.people.length) {
    return "";
  }
  const withContact = (person) => ({
      ...(view?.contacts ?? []).find((contact) => contact.id === person.id),
      ...person,
    }),
    cameIds = new Set(here.came.map((person) => person.id)),
    personRow = (person) =>
      `<div class="who ${person.why ? "care" : ""} ${cameIds.has(person.id) ? "came" : ""}">${newsFace(withContact(person))}<span class="n"><b>${person.met ? escape(person.name) : "???"}</b>${person.why ? `<small>${escape(person.why)}</small>` : ""}</span></div>`;
  return `<div class="mls-here">${[...here.people]
    .sort((left, right) => +!!right.why - +!!left.why)
    .map(personRow)
    .join("")}</div>`;
}
const hereTags = (here) => [
  ...(here?.came ?? []).map((person) => ({
    text: `\u2192 ${person.met ? person.name.toUpperCase() : "SOMEONE"} CAME IN${person.why ? ` \xB7 ${person.why.toUpperCase()}` : ""}`,
    bad: !!person.why,
    seen: !person.why,
  })),
  ...(here?.left ?? []).map((person) => ({
    text: `\u2190 ${person.met ? person.name.toUpperCase() : "SOMEONE"} LEFT`,
    seen: true,
  })),
];
const reachedPictures = (scene, index) =>
  (scene?.pictures ?? []).filter((pic) => pic.from == null || pic.from <= index);
function heldForPicture(scene, index) {
  const last = reachedPictures(scene, index).at(-1);
  return (
    !!last &&
    last.beat !== "passage" &&
    !last.url &&
    (last.status === "queued" || last.status === "painting") &&
    index < (scene.batch?.length ?? 0) &&
    !scene.batch[index].lead
  );
}
function keyTools(pic, hidden) {
  const busy = pic.status === "queued" || pic.status === "painting";
  return `<div class="mls-key-tools">
      <button class="mls-hide-text" data-do="scene-hide">${hidden ? "SHOW TEXT" : "HIDE TEXT"}</button>
      <button class="mls-key-redo" data-do="album-redo" data-id="${escape(pic.id)}" ${busy ? "disabled" : ""}>${busy ? '<span class="spin"></span>PAINTING AGAIN\u2026' : "\u21BB REDO"}</button>
    </div>`;
}
const autoDelay = (text) => Math.min(7e3, 1300 + String(text ?? "").length * 32);
function sceneClock(scene, hud, who) {
  const isTalk = scene.kind === "talk" || scene.kind === "tier",
    tier = scene.tier,
    pips = Array.from(
      {
        length: scene.max,
      },
      (_unused, i) => `<i class="${i < Math.min(scene.exchange + (scene.done ? 0 : 1), scene.max) ? "on" : ""}"></i>`,
    ).join(""),
    countText = scene.watching
      ? `Passage ${Math.min(scene.exchange + 1, scene.max)} of ${scene.max}`
      : `Exchange ${Math.min(scene.exchange + 1, scene.max)} of ${isTalk ? "up to " : ""}${scene.max}`;
  let leftText = scene.done ? (scene.watching ? "" : "Over") : countText;
  if (isTalk && !scene.done && scene.leaves) {
    const reason =
      scene.leaveReason === "closes"
        ? `it closes at ${escape(scene.leaves)}`
        : scene.leaveReason === "work"
          ? `${escape(who)} starts work at ${escape(scene.leaves)}`
          : scene.leaveReason === "lunch"
            ? `your break ends at ${escape(scene.leaves)}`
            : scene.leaveReason === "sleep"
              ? `${escape(who)} goes to bed at ${escape(scene.leaves)}`
              : `${escape(who)} leaves at ${escape(scene.leaves)}`;
    leftText = `${scene.minutesLeft} min left \xB7 <b>${reason}</b>`;
  }
  return `
    <div class="when ${tier ? "tier" : ""}">
      <div class="kind">${escape(scene.place)} \xB7 ${escape(tier ? AXIS_NAME[tier.axis] : scene.label)}</div>
      ${tier ? `<div class="step"><s>${escape(tierLabel(tier.fromName).toUpperCase())}</s> \u2192 <b>${escape(tier.toName.toUpperCase())}</b></div>` : ""}
      <div class="time">${escape(hud.time)}</div>
      <div class="left">${leftText}</div>
      ${
        isTalk
          ? `<div class="track"><i style="width:${Math.round((scene.progress ?? 0) * 100)}%"></i></div>
           ${scene.done || !scene.leaves ? "" : `<div class="count">${countText}</div>`}`
          : `<div class="steps">${pips}</div>`
      }
    </div>`;
}
const speakerName = (line, fallback) =>
  line?.by
    ? ((S.life?.contacts ?? []).find((contact) => contact.id === line.by)?.name ??
      S.life?.scene?.looks?.[line.by]?.name ??
      fallback)
    : fallback;
function sceneLog(scene, who) {
  return `
    <div class="mls-scene-log">
      <div class="head"><h2>LOG</h2><button class="end-log" data-do="scene-log">CLOSE</button></div>
      ${scene.log.map((line) => (line.who === "you" ? `<div class="row you"><b>YOU</b>${escape(line.text)}</div>` : line.who === "narration" ? `<div class="row narration">${escape(line.text)}</div>` : `<div class="row"><b>${escape(speakerName(line, who).toUpperCase())}</b>${escape(line.text)}</div>`)).join("") || '<p class="row narration">Nothing has been said yet.</p>'}
    </div>`;
}
function tierCall(scene) {
  const tier = scene.tier,
    favour = tier.favour,
    canStep = tier.canStep ?? {
      ok: true,
    },
    favourAt = favour ? (tier.favourAt ?? null) : null,
    minutes = favour ? (favour.cost.minutes ?? 0) + (favourAt?.minutes ?? 0) : 0,
    costHtml = favour
      ? [
          favourAt ? `\u2192 ${escape(favourAt.name)}` : "",
          minutes
            ? [
                Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)} h` : "",
                minutes % 60 ? `${minutes % 60} min` : "",
              ]
                .filter(Boolean)
                .join(" ")
            : "",
          favour.cost.energy ? `\u2212${favour.cost.energy} Energy` : "",
          favour.cost.cash ? `$${favour.cost.cash}` : "",
        ]
          .filter(Boolean)
          .map((part) => `<i>${part}</i>`)
          .join("")
      : "",
    callById = Object.fromEntries((tier.call ?? []).map((opt) => [opt.id, opt])),
    stepLabel = callById.step?.label ?? (favour ? favour.what : tier.step);
  return `${detectedNote(tier)}
    <div class="speaker gold">YOUR CALL</div>
    <div class="mls-decide">
      <div class="lbl">${favour ? "THEY ASKED YOU FOR SOMETHING \xB7 IT HAPPENS NOW, IF YOU SAY YES" : "THE MOMENT IS HERE \xB7 WHAT DO YOU DO?"}</div>
      <button class="mls-choice step ${canStep.ok ? "" : "off"}" data-do="scene-decide" data-choice="step" ${canStep.ok ? "" : "disabled"}>
        <span class="ico">\u2197</span><b>${escape(stepLabel)}</b>
        <small>${canStep.ok ? escape(callById.step?.note ?? `Take the step to ${tier.toName} \xB7 ${favour ? "you do the favour right after this" : "unless the talk went badly"}`) : escape(callById.step?.why ?? `You can't right now: ${canStep.reason}`)}</small>
        ${costHtml ? `<span class="cost">${costHtml}</span>` : ""}</button>
      <button class="mls-choice wait" data-do="scene-decide" data-choice="wait">
        <span class="ico">\u2026</span><b>${escape(callById.wait?.label ?? (favour ? "Not today" : "Let it be, for now"))}</b>
        <small>${escape(callById.wait?.note ?? "Nothing lost \xB7 you can try again tomorrow")}</small></button>
    </div>`;
}
function keptPictures(scene) {
  const kept = (scene.pictures ?? []).filter((pic) => pic.url);
  return kept.length
    ? `<div class="mls-kept">${kept.map((pic) => `<span class="pic" style="background-image:url('${escape(pic.url)}')"></span>`).join("")}
    <div><b>${kept.length === 1 ? "THE PICTURE IS KEPT" : "THE PICTURES ARE KEPT"}</b><small>In the GALLERY, on your phone</small></div></div>`
    : "";
}
const seenLine = (names) =>
  names?.length ? `<span class="mls-seen">\u{1F441} ${escape(names.join(", ").toUpperCase())} SAW THAT</span>` : "";
const didStrip = (items = []) =>
  items.length
    ? `<div class="mls-did">${items.map((item) => `<span class="${item.bad ? "bad" : item.step ? "step" : item.seen ? "seen" : ""}">${escape(item.text)}</span>`).join("")}</div>`
    : "";
const leftLine = (unanswered) =>
  unanswered
    ? didStrip([
        {
          text: `${unanswered.name ? `LEFT ${unanswered.name.toUpperCase()} UNANSWERED` : "LEFT UNANSWERED"} \xB7 $${unanswered.amount}`,
          bad: true,
        },
      ])
    : "";
const detectedNote = (detection) =>
  detection?.detected
    ? `<div class="mls-detected"><div><b>TAKEN AS: ${escape(detection.detected.act.toUpperCase())}</b><small>from what you wrote</small></div>
      <button data-do="scene-undetect">NOT WHAT I MEANT \u21A9</button></div>`
    : "";
const PLEA_WORDS = {
  pay: "ASKS YOU TO PAY",
  lend: "ASKS YOU TO LEND",
  give: "ASKS YOU FOR",
};
const PLEA_VERB = {
  pay: "Pay",
  lend: "Lend",
  give: "Give",
};
function pleaCall(plea, { free = "scene" } = {}) {
  const freeHtml =
      free === "scene"
        ? '<div class="mls-turn"><div class="free"><input type="text" data-do="scene-free" maxlength="400" placeholder="Or answer in your own words\u2026"><button data-do="scene-send">SEND</button></div></div>'
        : "",
    optById = Object.fromEntries((plea.options ?? []).map((opt) => [opt.id, opt]));
  return `<div class="speaker gold">YOUR CALL</div>
    <div class="mls-decide">
      <div class="lbl">${plea.head?.[0]?.label ? escape(plea.head[0].label.toUpperCase()) : `${escape(plea.name.toUpperCase())} ${PLEA_WORDS[plea.kind] ?? "ASKS YOU FOR"}`}${plea.what ? ` \xB7 ${escape(plea.what.toUpperCase())}` : ""}</div>
      <button class="mls-choice step ${plea.can ? "" : "off"}" data-do="plea-pay" ${plea.can && !S.busy ? "" : "disabled"}>
        <span class="ico">\u2197</span><b>${escape(optById.pay?.label ?? `${PLEA_VERB[plea.kind] ?? "Give"} $${plea.amount}`)}</b>
        <small>${escape(plea.can ? (optById.pay?.note ?? (plea.kind === "lend" ? "You can ask for it back after a week" : "It's theirs")) : (optById.pay?.why ?? `You can't: you have $${plea.cash}`))}</small>
        ${plea.can ? `<span class="cost"><i>$${plea.amount}</i><i>+3 Friendship</i></span>` : ""}</button>
      <button class="mls-choice wait" data-do="plea-no" ${S.busy ? "disabled" : ""}>
        <span class="ico">\u2026</span><b>${escape(optById.no?.label ?? "Not now")}</b><small>${escape(optById.no?.note ?? "\u22121 Friendship")}</small></button>
    </div>${freeHtml}`;
}
function rideCall(ride) {
  const howText = ride.by === "car" ? "by car" : "on your motorbike",
    optById = Object.fromEntries((ride.options ?? []).map((opt) => [opt.id, opt]));
  return `<div class="speaker gold">YOUR CALL</div>
    <div class="mls-decide">
      <div class="lbl">${escape((ride.head?.[0]?.label ?? `${ride.name} asks you for a ride \xB7 to ${ride.home ? `${ride.placeName} \xB7 home` : ride.placeName}`).toUpperCase())}</div>
      <button class="mls-choice step" data-do="ride-drive" ${S.busy ? "disabled" : ""}>
        <span class="ico">\u2197</span><b>${escape(optById.drive?.label ?? "Take them there")}</b><small>${escape(optById.drive?.note ?? `You both head there now \xB7 ${ride.minutes} min ${howText}`)}</small>
        <span class="cost"><i>+3 Friendship</i></span></button>
      <button class="mls-choice wait" data-do="ride-no" ${S.busy ? "disabled" : ""}>
        <span class="ico">\u2026</span><b>${escape(optById.no?.label ?? "Not now")}</b><small>${escape(optById.no?.note ?? "\u22121 Friendship")}</small></button>
    </div>
    <div class="mls-turn"><div class="free"><input type="text" data-do="scene-free" maxlength="400" placeholder="Or answer in your own words\u2026"><button data-do="scene-send">SEND</button></div></div>`;
}
function walkInCall(walkIn) {
  return `<div class="speaker gold">YOUR CALL</div>
    <div class="mls-decide">
      <div class="lbl">${escape(walkIn.label)} \xB7 THE TALK IS ON HOLD</div>
      ${walkIn.options
        .map(
          (
            opt,
          ) => `<button class="mls-choice step" data-do="walk-in" data-choice="${escape(opt.id)}" ${S.busy ? "disabled" : ""}>
        <span class="ico">\u2197</span><b>${escape(opt.label)}</b><small>${escape(opt.note)}</small>${callChips(opt.chips)}</button>`,
        )
        .join("")}
    </div>`;
}
const pleaNote = (plea) =>
  plea
    ? `<div class="mls-detected"><div><b>TAKEN AS: ${plea.answer === "refuse" ? "YOU SAID NO" : `YOU ${plea.kind === "lend" ? "LENT" : plea.kind === "pay" ? "PAID" : "GAVE"} $${plea.paid}`}</b><small>from what you wrote${plea.paid && plea.paid !== plea.asked ? ` \xB7 they asked for $${plea.asked}; what you offered is what counts` : ""}</small></div>
    <button data-do="plea-undo">NOT WHAT I MEANT \u21A9</button></div>`
    : "";
const CALL_TITLE = {
  "partners-meet": "HOW YOU HANDLE IT",
  "her-or-me": "HER OR ME",
};
const callChips = (chips = []) =>
  chips.length
    ? `<span class="mls-call-chips">${chips.map((chip) => `<i class="${chip.roll ? "roll" : chip.bad ? "bad" : ""}">${escape(chip.text)}</i>`).join("")}</span>`
    : "";
function milestoneCall(scene) {
  const buttons = scene.milestone.options
      .map(
        (opt) => `
    <button class="mls-choice ${opt.id === "wait" ? "wait" : "step"} ${opt.ok ? "" : "off"}" data-do="scene-decide" data-choice="${escape(opt.id)}" ${opt.ok ? "" : "disabled"}>
      <span class="ico">${opt.id === "wait" ? "\u2026" : "\u2197"}</span><b>${escape(opt.label)}</b>${opt.ok ? (opt.note ? `<small>${escape(opt.note)}</small>` : "") : `<small>${escape(opt.why)}</small>`}${opt.ok ? callChips(opt.chips) : ""}</button>`,
      )
      .join(""),
    freeHtml = scene.milestone.free
      ? '<div class="mls-turn"><div class="free"><input type="text" data-do="scene-free" maxlength="400" placeholder="Or say what happens next\u2026"><button data-do="scene-send">SEND</button></div></div>'
      : "";
  return `${detectedNote(scene.milestone)}<div class="speaker gold">${CALL_TITLE[scene.milestone.id] ?? "YOUR CALL"}</div><div class="mls-decide">${buttons}</div>${freeHtml}`;
}
function tonightCall(options, title) {
  return `<div class="speaker gold">${escape(title || "TONIGHT")}</div><div class="mls-decide">${options
    .map(
      (opt) => `
    <button class="mls-choice step ${opt.ok === false ? "off" : ""}" data-do="propose-tonight" data-choice="${escape(opt.id)}" ${opt.ok === false || S.busy ? "disabled" : ""}>
      <span class="ico">\u2197</span><b>${escape(opt.label)}</b><small>${escape(opt.note)}</small>${callChips(opt.chips)}</button>`,
    )
    .join("")}</div>`;
}
const MOOD_CLASS = {
  good: "good",
  none: "none",
  tense: "tense",
  rivals: "rivals",
  love: "love",
  unmet: "none",
};
const pairRows = (pairs = []) =>
  pairs?.length
    ? `<div class="mls-pairs">${pairs
        .map(
          (pair) => `
  <div class="mls-pair"><span class="faces">${newsFace(pair.a)}${newsFace(pair.b)}</span><div><b>${escape(pair.a.name)} &amp; ${escape(pair.b.name)}</b></div><span class="mls-mood ${MOOD_CLASS[pair.mood] ?? ""}">${escape(pair.label)}</span></div>`,
        )
        .join("")}</div>`
    : "";
const answerRows = (answers = []) =>
  answers?.length
    ? `<div class="mls-pairs">${answers
        .map(
          (answer) => `
  <div class="mls-pair"><span class="faces">${newsFace(answer)}</span><div><b>${escape(answer.name)}</b>${answer.why ? `<small>${escape(answer.why)}</small>` : ""}</div><span class="mls-mood ${answer.bad || answer.tag === "NO" ? "rivals" : "good"}">${escape(answer.tag)}</span></div>`,
        )
        .join("")}</div>`
    : "";
function milestoneSummary(scene, life, who) {
  const milestone = scene.milestone,
    fainted = scene.endedBy === "fainted" && !milestone.verdict,
    accepted =
      !fainted &&
      (scene.endedBy === "accepted" || (!!milestone.verdict?.accepted && !["refused", "wait"].includes(scene.endedBy))),
    choice = milestone.choice ?? null,
    isJealous = milestone.id === "jealous",
    ended =
      !fainted &&
      ((milestone.id === "break-up" && accepted) ||
        (milestone.id === "talk" && !accepted) ||
        (isJealous && !!milestone.verdict?.ends)),
    stamp =
      milestone.verdict?.stamp ||
      (accepted && (milestone.to || milestone.flag) ? (milestone.to ?? "First kiss") : ended ? "Ex" : ""),
    headline = fainted
      ? "Everything goes dark."
      : ended
        ? "It's over."
        : milestone.verdict?.headline
          ? escape(milestone.verdict.headline)
          : isJealous
            ? milestone.verdict?.believed
              ? "They believe you. For now."
              : milestone.choice === "deny"
                ? "They know it's a lie."
                : accepted
                  ? "They let it go."
                  : "It still hurts."
            : milestone.id === "stay-away"
              ? milestone.choice === "back-off"
                ? "You back off."
                : milestone.choice === "refuse"
                  ? "You won't."
                  : milestone.verdict?.believed
                    ? "They believe you. For now."
                    : "They know it's a lie."
              : milestone.id === "talk"
                ? "Another chance."
                : milestone.id === "break-up"
                  ? "You take it back."
                  : accepted
                    ? milestone.to
                      ? `${escape(milestone.to)}.`
                      : milestone.flag === "firstKiss"
                        ? "Your first kiss."
                        : "It's done."
                    : scene.endedBy === "wait" || choice === "wait"
                      ? "Not yet."
                      : `${escape(who)} says not yet.`,
    totals = scene.totals ?? {},
    stats = ["friendship", "romance", "trust"]
      .filter((axis) => totals[axis])
      .map((axis) => {
        const delta = totals[axis];
        return `<div class="stat ${delta > 0 ? "gain" : "loss"}"><small>${axis.toUpperCase()}</small><b>${delta > 0 ? "+" : ""}${Math.round(delta * 10) / 10}</b></div>`;
      })
      .join(""),
    reads = scene.reads
      .map((read) => `<i class="${BAD_READS.has(read) ? "bad" : ""}">${escape(READ_WORDS[read] ?? read)}</i>`)
      .join(""),
    hereName = life.places.find((place) => place.id === life.at)?.name ?? "the place";
  return `
    ${stamp ? `<div class="mls-stamp ${ended ? "bad" : ""}"><div class="big">${escape(stamp.toUpperCase())}</div></div>` : ""}
    <div class="speaker ${accepted && !ended ? "gold" : ""}">${escape((scene.watching?.title || who).toUpperCase())}</div>
    <div class="mls-summary">
      <h3>${headline}</h3>${seenLine(scene.seenBy)}${leftLine(scene.unanswered)}
      ${pairRows(milestone.pairs)}${answerRows(milestone.answers)}
      <div class="mls-sum-stats">
        ${scene.watching ? "" : `<div class="stat"><small>TIME</small><b>${scene.minutes} min</b></div>`}
        ${stats}
        ${reads ? `<div class="stat"><small>HOW IT WENT</small><span class="reads">${reads}</span></div>` : ""}
      </div>
      ${keptPictures(scene)}
      ${
        scene.remembers?.length
          ? scene.remembers
              .map(
                (memory) => `<blockquote class="mls-memory" style="--c:${colourFor(memory.id)}">
        <small>WHAT ${escape(memory.name.toUpperCase())} WILL REMEMBER</small>\u201C${escape(memory.text)}\u201D</blockquote>`,
              )
              .join("")
          : scene.remember
            ? `<blockquote class="mls-memory" style="--c:${colourFor(scene.characterId)}">
        <small>WHAT ${escape(who.toUpperCase())} WILL REMEMBER</small>\u201C${escape(scene.remember)}\u201D</blockquote>`
            : ""
      }
      ${scene.kept ? `<div class="mls-kept"><div><b>${escape(scene.kept.title)}</b><small>${escape(scene.kept.line)}</small></div></div>` : ""}
      ${milestone.inviteAgain ? '<button class="mls-scene-back" data-do="scene-invite-again">PICK ANOTHER TIME \u25B8</button>' : ""}
      ${milestone.pickDay ? '<button class="mls-scene-back" data-do="wedding-day">PICK THE DAY TOGETHER \u25B8</button>' : ""}
      <button class="mls-scene-back" data-do="scene-close">${scene.stay ? "STAY THE NIGHT" : scene.next?.label ? escape(scene.next.label.toUpperCase()) : `BACK TO ${escape(hereName.toUpperCase())}`} \u25B8</button>
    </div>`;
}
function tierSummary(scene, life, who) {
  const tier = scene.tier,
    totals = scene.totals ?? {},
    hereName = life.places.find((place) => place.id === life.at)?.name ?? "the place",
    stats = ["friendship", "romance", "trust"]
      .filter((axis) => totals[axis])
      .map((axis) => {
        const delta = totals[axis];
        return `<div class="stat ${delta > 0 ? "gain" : "loss"}"><small>${axis.toUpperCase()}</small><b>${delta > 0 ? "+" : ""}${Math.round(delta * 10) / 10}</b></div>`;
      })
      .join(""),
    reads = scene.reads
      .map((read) => `<i class="${BAD_READS.has(read) ? "bad" : ""}">${escape(READ_WORDS[read] ?? read)}</i>`)
      .join(""),
    accepted = scene.endedBy === "accepted",
    waited = scene.endedBy === "wait",
    fainted = scene.endedBy === "fainted",
    takenBy = tier.verdict?.taken ?? "",
    headline = fainted
      ? "Everything goes dark."
      : accepted
        ? `${escape(tierLabel(tier.fromName))} \u2192 ${escape(tier.toName)}.`
        : waited
          ? "You let it be, for now."
          : takenBy
            ? `${escape(who)} says no.`
            : `${escape(who)} says not yet.`,
    why =
      accepted || waited || fainted
        ? ""
        : takenBy
          ? `${who} is with ${takenBy}, and wouldn't cheat on them.`
          : "More of the talk went badly than well. It's only about today.",
    favourMinutes = (tier.favour?.cost.minutes ?? 0) + (tier.favourWent?.minutes ?? 0),
    favourText =
      accepted && tier.favour
        ? [
            tier.favourWent ? `\u2192 ${escape(tier.favourWent.name)}` : "",
            favourMinutes
              ? [
                  Math.floor(favourMinutes / 60) ? `${Math.floor(favourMinutes / 60)} h` : "",
                  favourMinutes % 60 ? `${favourMinutes % 60} min` : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              : "",
            tier.favour.cost.energy ? `\u2212${tier.favour.cost.energy} Energy` : "",
            tier.favour.cost.cash ? `$${tier.favour.cost.cash}` : "",
          ]
            .filter(Boolean)
            .join(" \xB7 ")
        : "",
    backLabel =
      scene.endedBy === "closed" || placeShut(life) ? "BACK TO THE MAP" : `BACK TO ${escape(hereName.toUpperCase())}`;
  return `
    ${accepted ? `<div class="mls-stamp"><div class="up">${escape(AXIS_NAME[tier.axis].toUpperCase())}</div><div class="big">${escape(tier.toName.toUpperCase())}</div></div>` : ""}
    <div class="speaker ${accepted ? "gold" : ""}">${accepted ? `${escape(who.toUpperCase())} SAID YES` : waited ? "NOT YET" : escape(who.toUpperCase())}</div>
    <div class="mls-summary">
      <h3>${headline}</h3>${seenLine(scene.seenBy)}${leftLine(scene.unanswered)}
      <div class="mls-sum-stats">
        <div class="stat"><small>TIME</small><b>${scene.minutes} min</b></div>
        ${stats}
        ${favourText ? `<div class="stat"><small>THE FAVOUR</small><b>${escape(favourText)}</b></div>` : ""}
        ${accepted ? "" : `<div class="stat capped"><small>${escape(AXIS_NAME[tier.axis].toUpperCase())}</small><b>Stays where it is</b><em>try again in ${tier.retryDays || 1} day${(tier.retryDays || 1) === 1 ? "" : "s"}</em></div>`}
        ${reads ? `<div class="stat"><small>HOW IT WENT</small><span class="reads">${reads}</span></div>` : ""}
      </div>
      ${tier.perks?.length ? `<div class="mls-perks-new"><b>NEW WITH ${escape(who.toUpperCase())}</b>${tier.perks.map((perk) => `<div>${escape(perk)}</div>`).join("")}</div>` : ""}
      ${keptPictures(scene)}
      ${why ? `<blockquote class="mls-memory"><small>WHY</small>${escape(why)}</blockquote>` : ""}
      ${
        scene.remember
          ? `<blockquote class="mls-memory" style="--c:${colourFor(scene.characterId)}">
        <small>WHAT ${escape(who.toUpperCase())} WILL REMEMBER</small>\u201C${escape(scene.remember)}\u201D</blockquote>`
          : ""
      }
      <button class="mls-scene-back" data-do="scene-close">${backLabel} \u25B8</button>
    </div>`;
}
function sceneErr(error, stuck, { float = false } = {}) {
  return error
    ? stuck
      ? `<div class="mls-scene-err stuck ${float ? "float" : ""}"><b>THEY COULDN'T ANSWER</b><small>${escape(error)}</small><p>${escape(stuck.note ?? "What you chose still counts.")}</p>
    <span><button data-do="stuck-again">TRY AGAIN</button>${stuck.skip ? `<button data-do="stuck-skip">${escape(stuck.skipLabel ?? "GO ON WITHOUT IT")}</button>` : ""}</span></div>`
      : `<div class="mls-scene-err">${escape(error)}</div>`
    : "";
}
const bondRow = (axis, bond, totals) => {
  const delta = totals?.[axis] ?? 0;
  return `<div class="mls-bondrow ${delta > 0 ? "up" : delta < 0 ? "down" : ""}"><span class="label">${axis[0].toUpperCase()}${axis.slice(1)}</span>
    <span class="num">${delta ? `<span class="delta">${delta > 0 ? "+" : ""}${Math.round(delta * 10) / 10}</span>` : ""}</span>
    <span class="bar"><i style="width:${Math.max(0, Math.min(100, bond?.[axis]?.value ?? 0))}%"></i></span><span class="tier">${escape(bond?.[axis]?.name ?? "\u2014")}</span></div>`;
};
function othersBonds(others = []) {
  return (others ?? [])
    .map(
      (
        other,
      ) => `<div class="name" style="--c:${colourFor(other.id)}">${escape(String(other.name ?? "").toUpperCase())}</div>
    ${["friendship", "romance", "trust"].map((axis) => bondRow(axis, other.bond, other.totals)).join("")}`,
    )
    .join("");
}
function partyMomentEnd(scene, life) {
  const moment = scene.partyMoment,
    hereName = life.places?.find((place) => place.id === life.at)?.name ?? "the place";
  return `<div class="speaker">${escape(moment.name.toUpperCase())}</div>
    <div class="mls-summary">
      <h3>${escape(moment.headline)}</h3>
      ${didStrip(moment.chips ?? [])}${leftLine(scene.unanswered)}
      ${
        scene.remember
          ? `<blockquote class="mls-memory" style="--c:${colourFor(scene.characterId)}">
        <small>WHAT ${escape(String(scene.name ?? "").toUpperCase())} WILL REMEMBER</small>\u201C${escape(scene.remember)}\u201D</blockquote>`
          : ""
      }
      <button class="mls-scene-back" data-do="scene-close">${life.party ? "BACK TO THE PARTY" : `BACK TO ${escape(hereName.toUpperCase())}`} \u25B8</button>
    </div>`;
}
function sceneView({
  life: life,
  seg = 0,
  waiting = "",
  error = "",
  stuck = null,
  auto = false,
  showLog = false,
  showBonds = false,
  hideText = false,
}) {
  const scene = life.scene;
  if (!scene) {
    return "";
  }
  const look = MAP[life.at] ?? {
      bg: "linear-gradient(160deg,#54708e,#222d3a)",
    },
    hud = life.hud,
    who = scene.name,
    unmet = who === "???",
    isTalk = scene.kind === "talk",
    totals = scene.totals ?? {},
    bond = scene.bond ?? {},
    axisRow = (axis, label) => {
      const delta = totals[axis] ?? 0,
        value = bond[axis]?.value ?? 0,
        limit = scene.done ? null : scene.lastLimits?.[axis];
      return `<div class="mls-bondrow ${delta > 0 ? "up" : delta < 0 ? "down" : ""}">
      <span class="label">${label}</span>
      <span class="num">${delta ? `<span class="delta">${delta > 0 ? "+" : ""}${Math.round(delta * 10) / 10}</span>` : ""}</span>
      <span class="bar"><i style="width:${Math.max(0, Math.min(100, value))}%"></i></span>
      <span class="tier">${limit ? `<b class="cap">${CAP_TAG[limit]}</b>` : unmet ? "\u2014" : escape(bond[axis]?.name ?? "\u2014")}</span></div>`;
    },
    readHtml = scene.lastRead
      ? `<div class="mls-read">They took it as <b class="${BAD_READS.has(scene.lastRead) ? "bad" : ""}">${escape(READ_WORDS[scene.lastRead] ?? scene.lastRead)}</b></div>`
      : "",
    pictures = reachedPictures(scene, seg),
    keyPic = [...pictures].reverse().find((pic) => pic.url) ?? null,
    painting = pictures.some((pic) => pic.status === "queued" || pic.status === "painting"),
    keyed = !scene.batch?.[seg]?.lead && pictures.some((pic) => pic.url || pic.beat !== "passage"),
    lastPic = keyed ? null : (pictures.at(-1) ?? null),
    backdropUrl = keyed ? (keyPic?.url ?? life?.backdrop?.here ?? null) : (life?.backdrop?.here ?? null),
    line = seg < (scene.batch?.length ?? 0) && !waiting ? scene.batch[seg] : null,
    multiCast = (scene.cast ?? []).length > 1,
    spriteLight = (id) =>
      !multiCast || !line || line.who === "narration" ? "" : (line.by ?? scene.characterId) === id ? "lit" : "dim";
  let body;
  const tier = scene.tier,
    milestone = scene.milestone;
  if (scene.partyMoment && scene.done && !closingLeft(scene, seg)) {
    body = partyMomentEnd(scene, life);
  } else if (milestone && scene.done && !closingLeft(scene, seg)) {
    body = milestoneSummary(scene, life, who);
  } else if (milestone && milestone.phase === "decide" && !scene.done && !waiting && seg >= scene.batch.length) {
    body = milestoneCall(scene);
  } else if (milestone?.tonight && !scene.done && !waiting && seg >= scene.batch.length) {
    body = tonightCall(milestone.tonight, milestone.tonightTitle);
  } else if (tier && scene.done && !closingLeft(scene, seg)) {
    body = tierSummary(scene, life, who);
  } else if (tier && tier.phase === "decide" && !scene.done && !waiting && seg >= scene.batch.length) {
    body = tierCall(scene);
  } else if (scene.done && !closingLeft(scene, seg)) {
    const limits = scene.limits ?? {},
      axes = ["friendship", "romance", "trust"].filter((axis) => totals[axis] || limits[axis]),
      statsHtml = axes.length
        ? axes
            .map((axis) => {
              const delta = totals[axis] ?? 0;
              return `<div class="stat ${delta > 0 ? "gain" : delta < 0 ? "loss" : ""} ${limits[axis] ? "capped" : ""}"><small>${axis.toUpperCase()}</small>
          <b>${delta > 0 ? "+" : ""}${Math.round(delta * 10) / 10}</b>${limits[axis] ? `<em>${CAP_WHY[limits[axis]]}</em>` : ""}</div>`;
            })
            .join("")
        : '<div class="stat"><small>BOND</small><b>No change</b></div>',
      reads = scene.reads
        .map((read) => `<i class="${BAD_READS.has(read) ? "bad" : ""}">${escape(READ_WORDS[read] ?? read)}</i>`)
        .join(""),
      hereName = life.places.find((place) => place.id === life.at)?.name ?? "the place",
      headline =
        scene.endedBy === "fainted"
          ? "Everything goes dark."
          : scene.endedBy === "together" && scene.together
            ? `${escape(who)} is in: ${escape(scene.together.name)}.`
            : scene.endedBy === "ride" && scene.ride
              ? `${escape(who)} gets on: off to ${escape(scene.ride.name)}.`
              : scene.endedBy === "went-after" && scene.wentAfter
                ? `You go after ${escape(scene.wentAfter)}.`
                : scene.endedBy === "stormed-off"
                  ? `${escape(who)} storms off.`
                  : scene.endedBy === "went-with"
                    ? `${escape(who)} goes off with ${escape(scene.wentWith ?? "them")}.`
                    : scene.endedBy === "player"
                      ? "You say you should get going."
                      : scene.endedBy === "closed"
                        ? `${escape(scene.place)} is closing: you both head out.`
                        : scene.endedBy === "left"
                          ? `${escape(who)} has to go.`
                          : scene.endedBy === "lunch"
                            ? "Your break is over."
                            : scene.endedBy === "sleep"
                              ? `${escape(who)} is off to bed.`
                              : scene.endedBy === "work"
                                ? `${escape(who)} has to start work.`
                                : isTalk
                                  ? `${escape(who)} wraps it up.`
                                  : `${escape(who)} gets back to it.`;
    body = `
      <div class="speaker">${isTalk ? "SCENE OVER" : `YOU MET ${escape(who.toUpperCase())}`}</div>
      <div class="mls-summary">
        <h3>${headline}</h3>${seenLine(scene.seenBy)}${leftLine(scene.unanswered)}
        <div class="mls-sum-stats">
          <div class="stat"><small>TIME</small><b>${scene.minutes} min</b></div>
          ${statsHtml}
          ${reads ? `<div class="stat"><small>HOW IT WENT</small><span class="reads">${reads}</span></div>` : ""}
        </div>
        ${
          scene.remember
            ? `<blockquote class="mls-memory" style="--c:${colourFor(scene.characterId)}">
          <small>WHAT ${escape(who.toUpperCase())} WILL REMEMBER</small>\u201C${escape(scene.remember)}\u201D</blockquote>`
            : ""
        }
        <button class="mls-scene-back" data-do="scene-close">${scene.endedBy === "closed" ? "BACK TO THE MAP" : scene.together ? escape(scene.together.name.toUpperCase()) : scene.ride ? `TO ${escape(scene.ride.name.toUpperCase())}` : placeShut(life) ? "BACK TO THE MAP" : `BACK TO ${escape(hereName.toUpperCase())}`} \u25B8</button>
      </div>`;
  } else if (waiting) {
    body = `<div class="speaker you">YOU</div><div class="text">${escape(waiting)}</div><div class="mls-typing">\u2026</div>`;
  } else if (heldForPicture(scene, seg)) {
    body = `<div class="speaker none">\xB7</div><div class="mls-held"><span class="spin"></span>${keyPic ? "PAINTING WHAT HAPPENED\u2026" : "PAINTING THE MOMENT\u2026"}</div>`;
  } else if (seg < scene.batch.length) {
    const batchLine = scene.batch[seg];
    body = `
      ${pleaNote(life.plea?.read)}
      ${didStrip([...(scene.did ?? []), ...hereTags(scene.here)])}
      <div class="speaker ${batchLine.who === "narration" ? "none" : ""}">${escape(speakerName(batchLine, who).toUpperCase())}</div>
      <div class="text ${batchLine.who === "narration" ? "narration" : ""}">${escape(batchLine.text)}</div>
      <div class="next">\u25BC</div>`;
  } else if (scene.walkIn && !scene.done) {
    body = walkInCall(scene.walkIn);
  } else if (
    life.plea?.open?.where === "scene" &&
    (life.plea.open.host ?? life.plea.open.characterId) === scene.characterId
  ) {
    body = pleaCall(life.plea.open);
  } else if (life.ride && life.ride.characterId === scene.characterId) {
    body = rideCall(life.ride);
  } else {
    body = `
      <div class="speaker you">YOUR TURN</div>
      <div class="mls-turn">
        <div class="label">${scene.suggestions.length ? "SUGGESTED REPLIES \xB7 or write your own" : "NO SUGGESTIONS THIS TIME \xB7 write your own"}</div>
        ${scene.suggestions.map((text, index) => `<button class="mls-sug" data-do="scene-say" data-id="${index}">${escape(text)}<small>~5 min</small></button>`).join("")}
        <div class="free"><input type="text" data-do="scene-free" maxlength="400" placeholder="Say or do something\u2026"><button data-do="scene-send">SEND</button></div>
      </div>`;
  }
  const canSkip = readingLine(scene, seg, waiting),
    controls = `
    <div class="controls">
      <button class="${auto ? "on" : ""}" data-do="scene-auto" ${waiting ? "disabled" : ""}>AUTO</button>
      <button data-do="scene-skip" ${canSkip ? "" : "disabled"}>SKIP</button>
      <button data-do="scene-log">LOG</button>
    </div>`;
  return `
    <div class="mls-scene ${waiting ? "player" : ""} ${showBonds ? "show-bonds" : ""} ${keyed ? "keyed" : ""} ${keyed && hideText ? "hide-text" : ""}" style="--bg:${look.bg}" ${keyed && hideText ? 'data-do="scene-hide"' : ""}>
      <button class="mls-bonds-toggle" data-do="scene-bonds">${showBonds ? "\u2715 BONDS" : "\u2665 BONDS"}</button>
      ${hereStrip(scene.here, life)}
      <div class="backdrop ${backdropUrl ? "has-pic" : ""} ${keyed ? `key${keyPic ? "" : " waiting"}` : ""}" ${backdropUrl ? `style="background-image:url('${escape(backdropUrl)}')"` : ""}></div>
      ${
        keyed
          ? ""
          : lastPic
            ? paintIcon(
                lastPic.status === "failed" ? "failed" : lastPic.status === "manual" ? "missing" : lastPic.status,
                "album-redo",
                {
                  id: lastPic.id,
                },
                "scene",
              )
            : bgIcon(life?.backdrop?.wanted?.here, "scene")
      }
      ${
        keyed && !keyPic && !(painting && heldForPicture(scene, seg))
          ? `<div class="mls-key-wait">${
              painting
                ? `<span class="spin"></span>PAINTING THE MOMENT\u2026<small>the scene goes on when it's ready</small>`
                : paintIcon(
                    pictures.at(-1)?.status === "failed" ? "failed" : "missing",
                    "album-redo",
                    {
                      id: pictures.at(-1)?.id ?? "",
                    },
                    "big",
                  )
            }</div>`
          : ""
      }
      ${keyed && keyPic ? keyTools(keyPic, hideText) : ""}
      ${keyed || (scene.partyMoment && !scene.characterId) ? "" : `<div class="sprite ${unmet ? "stranger" : ""} ${scene.avatar ? "framed" : ""} ${spriteLight(scene.characterId)}" style="--c:${colourFor(scene.characterId)}">${frameImg(scene)}${scene.npc ? NPC_TAG : ""}</div>`}
      ${
        keyed
          ? ""
          : (scene.cast ?? [])
              .slice(1, 4)
              .map((id, index) => {
                const contact =
                    (life.contacts ?? []).find((contactItem) => contactItem.id === id) ??
                    (scene.looks?.[id]
                      ? {
                          id: id,
                        }
                      : null),
                  look2 = contact && {
                    ...contact,
                    ...scene.looks?.[id],
                  };
                return look2
                  ? `<div class="sprite framed second x${index} ${spriteLight(id)}" style="--c:${colourFor(id)}">${frameImg(look2)}</div>`
                  : "";
              })
              .join("")
      }
      ${sceneClock(scene, hud, who)}
      <div class="bonds" style="--c:${colourFor(scene.characterId)}">
        <div class="name">${escape((scene.watching?.title || (scene.partyMoment && !scene.partyMoment.with ? scene.partyMoment.name : who)).toUpperCase())}${scene.npc ? NPC_TAG : ""}</div>
        ${scene.watching ? `<div class="mls-npc-about">${escape(scene.watching.line)}</div>` : scene.partyMoment && !scene.partyMoment.with ? `<div class="mls-npc-about">${escape(scene.partyMoment.headline)}</div>` : scene.npc ? `<div class="mls-npc-about">${escape(scene.npc.about)}${scene.npc.remembers ? `<small>REMEMBERS</small>${escape(scene.npc.remembers)}` : ""}</div>` : `${axisRow("friendship", "Friendship")}${axisRow("romance", "Romance")}${axisRow("trust", "Trust")}`}
        ${scene.watching ? "" : othersBonds(scene.others)}
        ${readHtml}
      </div>
      ${sceneErr(error, stuck)}
      <div class="box ${((tier || milestone) && ((tier ?? milestone).phase === "decide" || (tier ?? milestone).phase === "result" || scene.endedBy === "accepted")) || ((life.plea?.open?.where === "scene" || scene.walkIn) && !waiting && seg >= scene.batch.length) ? "gold" : ""}" data-do="scene-next">
        ${scene.done || waiting || scene.tier?.phase === "decide" || (milestone?.phase === "decide" && !milestone.endable) || milestone?.tonight || scene.walkIn ? "" : '<button class="end" data-do="scene-end">END SCENE</button>'}
        ${controls}
        ${body}
      </div>
      ${showLog ? sceneLog(scene, who) : ""}
    </div>`;
}

export {
  BAD_READS,
  READ_WORDS,
  autoDelay,
  callChips,
  didStrip,
  heldForPicture,
  hereStrip,
  hereTags,
  keyTools,
  leftLine,
  othersBonds,
  pleaCall,
  readingLine,
  sceneErr,
  sceneLog,
  sceneView,
};
