// HUD rolls, story cards, faint screens
import { colourFor, escape, frameImg } from "./common.js";
import { SKILL_NAME } from "./phone.js";
import { S } from "../state.js";

const pad2 = (value) => String(value).padStart(2, "0");
const hhmm = (minutes) => {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(wrapped / 60))}:${pad2(wrapped % 60)}`;
};
const easeOut = (progress) => 1 - Math.pow(1 - progress, 3);
const lengthLabel = (minutes) => (minutes >= 60 ? `${Math.round((minutes / 60) * 10) / 10} H` : `${minutes} MIN`);
const signed = (value) => `${value > 0 ? "+" : value < 0 ? "\u2212" : ""}${Math.abs(Math.round(value))}`;
const pct = (value, max) => Math.max(0, Math.min(100, (value / (max || 100)) * 100));
function hudSnap(life) {
  const hud = life?.hud;
  return hud
    ? {
        minutes: hud.clock.minutes,
        day: String(hud.clock.weekday ?? "").toUpperCase(),
        energy: hud.needs.energy,
        energyMax: hud.needs.energyMax,
        hunger: hud.needs.hunger,
        cash: hud.cash,
      }
    : null;
}
function rollHud(root, from, to, { ms = 1200, linear = false } = {}) {
  if (!from || !to || !root) {
    return Promise.resolve();
  }
  const find = (key) => [...root.querySelectorAll(`[data-hud="${key}"]`)],
    clocks = find("clock"),
    times = find("time"),
    days = find("day"),
    energyBars = find("energy"),
    hungerBars = find("hunger"),
    cashEls = find("cash");
  if (!times.length) {
    return Promise.resolve();
  }
  const dayStart = Math.floor(to.minutes / 1440) * 1440;
  clocks.forEach((el) => el.classList.add("running"));
  const paintAt = (progress) => {
    const minutes = from.minutes + (to.minutes - from.minutes) * progress;
    times.forEach((el) => {
      el.textContent = hhmm(minutes);
    });
    days.forEach((el) => {
      el.textContent = minutes >= dayStart ? to.day : from.day;
    });
    energyBars.forEach((el) => {
      el.style.width = `${pct(from.energy + (to.energy - from.energy) * progress, to.energyMax)}%`;
    });
    hungerBars.forEach((el) => {
      el.style.width = `${pct(from.hunger + (to.hunger - from.hunger) * progress, 100)}%`;
    });
    cashEls.forEach((el) => {
      el.textContent = `$${Math.round(from.cash + (to.cash - from.cash) * progress)}`;
    });
  };
  paintAt(0);
  const startedAt = performance.now();
  return new Promise((resolve) => {
    const frame = (now) => {
      const progress = Math.min(1, (now - startedAt) / ms);
      paintAt(linear ? progress : easeOut(progress));
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        clocks.forEach((el) => el.classList.remove("running"));
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
function floatFrom(root, anchor, text, cls = "") {
  if (!root || !anchor) {
    return;
  }
  const host = anchor.closest(".mls-place-screen, .mls-map, .mls-scene") ?? root,
    anchorRect = anchor.getBoundingClientRect(),
    hostRect = host.getBoundingClientRect(),
    el = document.createElement("div");
  el.className = `mls-float ${cls}`;
  el.textContent = text;
  el.style.left = `${anchorRect.left - hostRect.left + anchorRect.width / 2}px`;
  el.style.top = `${anchorRect.top - hostRect.top - 8}px`;
  host.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}
function typeInto(el, text, { speed = 18 } = {}) {
  if (!el) {
    return;
  }
  let shown = 0,
    done = false;
  el.textContent = "";
  el.classList.add("typing");
  const finish = () => {
    done = true;
    el.textContent = text;
    el.classList.remove("typing");
  };
  el.addEventListener("click", finish, {
    once: true,
  });
  const step = () => {
    if (!done) {
      if (el.isConnected) {
        shown = Math.min(text.length, shown + 1);
        el.textContent = text.slice(0, shown);
        if (shown < text.length) {
          setTimeout(step, speed);
        } else {
          finish();
        }
      }
    }
  };
  step();
}
let cardCount = 0;
function nextCardId() {
  return ++cardCount;
}
const closeHint = (card) => card.hint ?? (card.review ? "TAP FOR YOUR REVIEW" : "TAP TO CLOSE");
function cardOf(res, before, life) {
  const result = res.result ?? {},
    after = hudSnap(life),
    gains = [];
  for (const [skill, change] of Object.entries(result.skills ?? {})) {
    const gain = result.gains?.[skill];
    gains.push({
      kind: "skill",
      label: (SKILL_NAME[skill] ?? skill).toUpperCase(),
      value: gain ? `+${Math.round(gain)}` : "+",
      up: true,
      from: change.from.level === change.to.level ? change.from.progress : 0,
      to: change.to.progress,
      levelled: change.to.level > change.from.level,
    });
  }
  if (before && after) {
    const energyDelta = Math.round(after.energy - before.energy),
      hungerDelta = Math.round(after.hunger - before.hunger),
      cashDelta = Math.round(after.cash - before.cash);
    if (energyDelta) {
      gains.push({
        kind: "need",
        label: "ENERGY",
        value: signed(energyDelta),
        up: energyDelta > 0,
      });
    }
    if (hungerDelta) {
      gains.push({
        kind: "need",
        label: "HUNGER",
        value: signed(hungerDelta),
        up: hungerDelta > 0,
      });
    }
    if (cashDelta) {
      gains.push({
        kind: "cash",
        label: cashDelta > 0 ? "PAY" : "CASH",
        value: `${cashDelta > 0 ? "+" : "\u2212"}$${Math.abs(cashDelta)}`,
        up: cashDelta > 0,
      });
    }
  }
  for (const [bondKey, delta] of Object.entries(result.bond ?? {})) {
    if (delta) {
      gains.push({
        kind: "need",
        label: `${bondKey.toUpperCase()}${result.with?.name ? ` \xB7 ${result.with.name.toUpperCase()}` : ""}`,
        value: `${delta > 0 ? "+" : "\u2212"}${Math.abs(Math.round(delta * 10) / 10)}`,
        up: delta > 0,
      });
    }
  }
  if (result.performance !== null && result.performance !== undefined) {
    const delta = result.performanceDelta;
    gains.push({
      kind: "need",
      label: delta == null ? "PERFORMANCE" : `PERFORMANCE \xB7 ${Math.round(result.performance)}`,
      value:
        delta == null
          ? String(Math.round(result.performance))
          : `${delta >= 0 ? "+" : "\u2212"}${Math.abs(Math.round(delta * 10) / 10)}`,
      up: !(delta < 0),
    });
  }
  return {
    id: nextCardId(),
    activity: result.activity?.id,
    name: result.activity?.name ?? res.did,
    place: result.activity?.place ?? "",
    sleep: !!result.activity?.sleep,
    worn: !!result.worn,
    from: result.from ?? (after ? after.minutes - (result.minutes ?? 0) : 0),
    minutes: result.minutes ?? 0,
    gains: gains,
    levelled: result.levelled ?? [],
    notes: (res.events ?? []).map((ev) => ev.text).filter(Boolean),
    line: result.line ?? null,
    writing: !!result.writing,
    shift: result.activity?.id === "shift",
    speaker: result.speaker ?? null,
    review: result.review ?? null,
    overtime: result.overtime ?? null,
    played: false,
    running: false,
    skip: false,
  };
}
function lunchCardOf(lunch, phase = "lunch") {
  const back = phase === "back";
  return {
    id: nextCardId(),
    activity: back ? "lunch-over" : "lunch",
    name: back ? "BACK TO WORK" : "LUNCH BREAK",
    place: "Office",
    sleep: false,
    worn: false,
    from: lunch.from,
    minutes: lunch.minutes,
    gains: [],
    levelled: [],
    notes: [],
    line: null,
    writing: false,
    did: back
      ? lunch.skipped
        ? ["WORKED THROUGH LUNCH \xB7 +1 PERFORMANCE"]
        : []
      : [`UNTIL ${hhmm(lunch.from + lunch.minutes + 60)} \xB7 HERE AT THE OFFICE`],
    hint: back ? "TAP \xB7 THE AFTERNOON" : "TAP \xB7 YOUR HOUR",
    played: false,
    running: false,
    skip: false,
  };
}
function goodbyeCardOf(bye, { then = "corridor" } = {}) {
  const face = (S.life?.contacts ?? []).find((contact) => contact.id === bye.characterId) ?? {
      id: bye.characterId,
      name: bye.name,
    },
    upperName = (bye.name || face.name || "").toUpperCase();
  return {
    id: nextCardId(),
    activity: "goodbye",
    name: bye.yours
      ? bye.why === "you"
        ? `YOU SEE ${upperName} OUT`
        : `${upperName} HEADS HOME`
      : bye.why === "bed"
        ? `${upperName} IS OFF TO BED`
        : bye.why === "out"
          ? `${upperName} HAS TO HEAD OUT`
          : bye.why === "work"
            ? `${upperName} HAS TO WORK`
            : "YOU HEAD OUT",
    place: bye.yours ? "Home" : `At ${bye.name || face.name}'s`,
    sleep: false,
    worn: false,
    from: bye.from,
    minutes: bye.minutes,
    gains: [],
    levelled: [],
    notes: [],
    line: null,
    writing: bye.line !== false,
    face: face,
    did: bye.did ?? [],
    hint: bye.yours ? "TAP \xB7 CONTINUE" : "TAP \xB7 BACK TO THE CORRIDOR",
    then: then,
    played: false,
    running: false,
    skip: false,
  };
}
function cardView(card) {
  const gainHtml = (gain, idx) => `
    <div class="g ${gain.kind} ${gain.up ? "up" : "down"}" data-card-gain="${idx}"><small>${escape(gain.label)}</small><b>${escape(gain.value)}</b>
      ${gain.kind === "skill" ? `<span class="mini"><i style="width:${gain.levelled ? 100 : Math.round(gain.to * 100)}%" data-to="${gain.levelled ? 100 : Math.round(gain.to * 100)}" data-from="${Math.round(gain.from * 100)}"></i></span>` : ""}</div>`,
    levelUp = card.levelled[0],
    lineHtml = card.line
      ? escape(card.line)
      : card.writing
        ? '<span class="writing">WRITING WHAT HAPPENED<span class="dots"><i>.</i><i>.</i><i>.</i></span></span>'
        : "";
  return `
    <div class="mls-card-veil ${card.sleep ? "night" : ""}" data-do="card-next">
      <div class="mls-card">
        ${card.face ? `<span class="mls-bye-face" style="--c:${colourFor(card.face.id)}">${frameImg(card.face)}</span>` : ""}
        <div class="kicker"><b>${hhmm(card.from)}</b>${escape((card.place || "").toUpperCase())}${card.worn ? " \xB7 WORN OUT" : ""}</div>
        <div class="what">${escape(card.name.toUpperCase())}</div>
        <div class="clock"><span class="from">${hhmm(card.from)}</span><span class="arrow">\u25B8</span>
          <span class="to" data-card="to">${hhmm(card.from + card.minutes)}</span><span class="dur">${lengthLabel(card.minutes)}</span></div>
        <div class="track"><i data-card="track" style="width:100%"></i></div>
        ${card.speaker ? `<span class="mls-career-who">${escape(card.speaker.name.toUpperCase())} \xB7 ${escape(card.speaker.role)}</span>` : ""}
        <div class="line ${card.line || card.writing ? "" : "empty"}" data-card="line">${lineHtml}</div>
        ${card.gains.length ? `<div class="gains">${card.gains.map(gainHtml).join("")}</div>` : ""}
        ${card.notes.length ? `<div class="notes">${card.notes.map((note) => `<span>${escape(note)}</span>`).join("")}</div>` : ""}
        ${card.did?.length ? `<div class="mls-bye-did">${card.did.map((line) => `<span>${escape(line.toUpperCase())}</span>`).join("")}</div>` : ""}
        ${levelUp ? `<div class="level in" data-card="level"><small>LEVEL UP</small><b>${escape((SKILL_NAME[levelUp.skill] ?? levelUp.skill).toUpperCase())} ${levelUp.to}</b>${levelUp.opens ? `<span>${escape(levelUp.opens)}</span>` : ""}</div>` : ""}
        ${
          card.shift && card.overtime
            ? `<div class="mls-career-after">
          <button class="stay" data-do="career-stay" ${card.overtime.ok ? "" : "disabled"}>STAY LATE \u25B8<small>${card.overtime.ok ? `${Math.round(card.overtime.minutes / 60)} h more \xB7 +$${card.overtime.pay} \xB7 \u2212${card.overtime.energy} Energy \xB7 ${card.overtime.left} left this week` : escape(card.overtime.why)}</small></button>
          <button class="go" data-do="card-next">DONE<small>${card.review ? "your review comes next" : "done for today"}</small></button></div>`
            : ""
        }
        <div class="hint" data-card="hint">${closeHint(card)}</div>
      </div>
    </div>`;
}
function playCard(root, card) {
  if (!root.querySelector(".mls-card") || card.played) {
    return;
  }
  card.played = true;
  card.running = true;
  const duration = card.sleep ? 2400 : 1500,
    startedAt = performance.now();
  let cardEl = null,
    toEl,
    trackEl,
    hintEl,
    veilEl,
    lineEl;
  const grab = () => {
      if (((cardEl = root.querySelector(".mls-card")), !cardEl)) {
        return false;
      }
      toEl = cardEl.querySelector("[data-card=to]");
      trackEl = cardEl.querySelector("[data-card=track]");
      hintEl = cardEl.querySelector("[data-card=hint]");
      lineEl = cardEl.querySelector("[data-card=line]");
      veilEl = root.querySelector(".mls-card-veil");
      for (const gainEl of cardEl.querySelectorAll("[data-card-gain]")) {
        gainEl.classList.remove("in");
        const bar = gainEl.querySelector(".mini i");
        if (bar) {
          bar.style.width = `${bar.dataset.from}%`;
        }
      }
      cardEl.querySelector("[data-card=level]")?.classList.remove("in");
      if (card.line) {
        lineEl.textContent = "";
      }
      hintEl.textContent = "TAP TO SKIP";
      return true;
    },
    finish = () => {
      card.running = false;
      toEl.textContent = hhmm(card.from + card.minutes);
      trackEl.style.width = "100%";
      if (veilEl) {
        veilEl.style.background = "";
      }
      const gainEls = [...cardEl.querySelectorAll("[data-card-gain]")];
      gainEls.forEach((gainEl, idx) =>
        setTimeout(
          () => {
            gainEl.classList.add("in");
            const bar = gainEl.querySelector(".mini i");
            if (bar) {
              bar.style.width = `${bar.dataset.to}%`;
            }
          },
          card.skip ? 0 : idx * 200,
        ),
      );
      const levelEl = cardEl.querySelector("[data-card=level]");
      if (levelEl) {
        setTimeout(() => levelEl.classList.add("in"), card.skip ? 0 : gainEls.length * 200 + 200);
      }
      if (card.line) {
        if (card.skip) {
          lineEl.textContent = card.line;
        } else {
          typeInto(lineEl, card.line, {
            speed: 14,
          });
        }
      }
      hintEl.textContent = closeHint(card);
    },
    frame = (now) => {
      if (!cardEl?.isConnected && !grab()) {
        card.running = false;
        return;
      }
      const progress = card.skip ? 1 : Math.min(1, (now - startedAt) / duration);
      toEl.textContent = hhmm(card.from + card.minutes * easeOut(progress));
      trackEl.style.width = `${easeOut(progress) * 100}%`;
      if (card.sleep && veilEl) {
        veilEl.style.background =
          progress < 0.5 ? `rgba(6,8,20,${0.6 + progress * 0.6})` : `rgba(11,11,13,${0.9 - (progress - 0.5) * 0.6})`;
      }
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        finish();
      }
    };
  grab();
  requestAnimationFrame(frame);
}
function tellCard(root, card) {
  const lineEl = root?.querySelector(".mls-card [data-card=line]");
  if (lineEl) {
    if (!card.line) {
      lineEl.classList.add("empty");
      lineEl.textContent = "";
      return;
    }
    if ((lineEl.classList.remove("empty"), card.running)) {
      lineEl.textContent = card.line;
      return;
    }
    typeInto(lineEl, card.line, {
      speed: 14,
    });
  }
}
function faintOf(res, life) {
  return {
    step: 0,
    place: res.place || "",
    at: res.at ?? null,
    woke: res.woke ?? life?.hud?.clock?.minutes ?? null,
    bill: res.bill ?? {
      bill: 150,
      paid: 150,
      owed: 0,
    },
    energy: Math.round(life?.hud?.needs?.energy ?? 0),
    energyMax: life?.hud?.needs?.energyMax ?? 100,
    hunger: Math.round(life?.hud?.needs?.hunger ?? 0),
    day: String(life?.hud?.clock?.weekday ?? "").toUpperCase(),
    played: false,
  };
}
function faintLines(faint) {
  const atHome = faint.place === "home",
    placeLabel = atHome ? "" : faint.place;
  return [
    atHome
      ? "Your legs have been heavy for a while. The room tilts under you."
      : `Your legs have been heavy for a while. The ${placeLabel} tilts under you.`,
    "You reach for something to hold on to. You don't reach it.",
    atHome
      ? "There you are. A neighbour heard you fall and called it in. Nothing's broken \u2014 you just ran yourself empty. Eat something before you go, please."
      : `There you are. Someone found you at the ${placeLabel} and called it in. Nothing's broken \u2014 you just ran yourself empty. Eat something before you go, please.`,
  ];
}
function faintView(faint) {
  const lines = faintLines(faint),
    awake = faint.step >= 3,
    clockAt = awake ? faint.woke : faint.at,
    clockHtml =
      clockAt === null ? "" : `<div class="clock"><b>${escape(awake ? faint.day : "")}</b>${hhmm(clockAt)}</div>`,
    say = (text, speaker = "") => `
    <div class="say ${speaker ? "" : "narration"}" data-do="faint-next">${speaker ? `<span class="speaker">${escape(speaker)}</span>` : ""}
      <span class="text">${escape(text)}</span><span class="next">TAP \u25B8</span></div>`,
    bill = faint.bill;
  return `
    <div class="mls-faint ${awake ? "hospital" : faint.step < 2 ? "dizzy" : "dark"}">
      <div class="scene"></div><div class="vignette"></div>
      ${faint.step !== 2 ? clockHtml : ""}
      <h1>${escape(awake ? "HOSPITAL" : (faint.place === "home" ? "HOME" : faint.place || "").toUpperCase())}</h1>
      ${awake ? '<div class="nurse"></div>' : ""}
      ${faint.step === 0 ? say(lines[0]) : ""}
      ${faint.step === 1 ? say(lines[1]) : ""}
      ${faint.step === 2 ? `<div class="black"><div class="dots">\xB7 \xB7 \xB7</div><div class="t"><span data-faint="time">${hhmm(faint.at ?? 0)}</span><small>TIME PASSES</small></div></div>` : ""}
      ${faint.step === 3 ? say(lines[2], "NURSE") : ""}
      ${
        faint.step === 4
          ? `
        <div class="bill">
          <h3>HOSPITAL BILL</h3>
          <div class="r"><span>Overnight observation</span><b>$${bill.bill}</b></div>
          ${bill.helper ? `<div class="r helped"><span>${escape(bill.helper.name)} came \xB7 paid</span><b>\u2212$${bill.helper.paid}</b></div><small>You owe ${escape(bill.helper.name)} $${bill.helper.paid}: two weeks to pay it back.</small>` : ""}
          ${
            bill.owed
              ? `<div class="r debt"><span>To pay in BILLS</span><b>$${bill.owed}</b></div>
            <small>${bill.due ? `By ${escape(bill.due)}` : "Thirty days"} \xB7 past that, +20% and collections take 25% of every shift.</small>`
              : `<div class="r"><span>Paid</span><b>$${bill.paid}</b></div>`
          }
          <div class="r"><span>Energy</span><b>${faint.energy} / ${faint.energyMax}</b></div>
          <div class="r"><span>Hunger</span><b>${faint.hunger} \xB7 they fed you</b></div>
          <small>Out ${Math.round(((faint.woke ?? 0) - (faint.at ?? 0)) / 60)} hours \xB7 ${escape(faint.day)} ${faint.woke === null ? "" : hhmm(faint.woke)}</small>
          <button class="getup" data-do="faint-done">GET UP \u25B8</button>
        </div>`
          : ""
      }
    </div>`;
}
function playFaint(root, faint, done) {
  if (faint.step !== 2 || faint.played) {
    return;
  }
  faint.played = true;
  const timeEl = root.querySelector("[data-faint=time]"),
    from = faint.at ?? 0,
    to = faint.woke ?? from;
  setTimeout(() => {
    const startedAt = performance.now(),
      frame = (now) => {
        const progress = Math.min(1, (now - startedAt) / 2400);
        if (timeEl?.isConnected) {
          timeEl.textContent = hhmm(from + (to - from) * easeOut(progress));
        }
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          setTimeout(done, 500);
        }
      };
    requestAnimationFrame(frame);
  }, 900);
}

export {
  cardOf,
  cardView,
  faintOf,
  faintView,
  floatFrom,
  goodbyeCardOf,
  hudSnap,
  lunchCardOf,
  nextCardId,
  playCard,
  playFaint,
  rollHud,
  tellCard,
  typeInto,
};
