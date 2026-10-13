// Jobs app, career cards, shift moments and job actions
import { colourFor, escape, frameImg } from "./common.js";
import { cardOf, hudSnap, lunchCardOf } from "./cards.js";
import { S, act, call, notify } from "../state.js";
import { tellLater } from "../actions/town.js";
import { reportEvents } from "../actions/talk.js";

const personOf = (id, fallbackName = "") =>
  (S.life?.contacts ?? []).find((contact) => contact.id === id) ?? {
    id: id,
    name: fallbackName,
  };
function jobsAppView({ jobs: jobs, error = "" }) {
  const app = jobs?.app;
  if (!app) {
    return '<div class="mls-settings mls-portal"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><p class="hint">Loading\u2026</p></div>';
  }
  const tab = jobs.tab ?? (app.employed ? "mine" : "posts"),
    townName = (app.town || "Town").toUpperCase(),
    posting = app.posting,
    officeImage = S.life?.backdrop?.places?.office ?? "",
    logo = `<span class="mls-portal-logo" ${officeImage ? `style="background-image:url('${escape(officeImage)}')"` : ""}>${officeImage ? "" : "\u{1F4BC}"}</span>`,
    posterCard = (poster, role) =>
      poster
        ? `<span class="mls-portal-poster"><span class="f">${poster.met ? frameImg(personOf(poster.id, poster.name)) : "?"}</span><span><b>${escape(poster.name)}</b><small>${escape(role)}</small></span></span>`
        : `<span class="mls-portal-poster"><span class="f none">?</span><span><b>The manager</b><small>${escape(posting?.place ?? "The Office")}</small></span></span>`,
    ladderPath = (ladder) =>
      `<div class="mls-portal-path">${ladder
        .map(
          (step, index) => `
    <div class="mls-portal-step ${step.now ? "now" : ""} ${index === 0 ? "first" : ""}"><b>${escape(step.name)}</b><em>$${step.pay}</em><small>${escape(step.needs || "where everyone starts")}</small></div>`,
        )
        .join("")}</div>`,
    header = `
    <div class="mls-portal-bar">
      <button class="mls-back flat" data-do="map">\u25C2 MAP</button>
      <span class="brand">${escape(townName)}<b>JOBS</b></span>
      <span class="search">\u{1F50D} <span>Search jobs in ${escape(app.town || "town")}</span></span>
    </div>
    <div class="mls-portal-tabs">
      <button class="${tab === "posts" ? "on" : ""}" data-do="jobs-tab" data-id="posts">JOBS <em>${posting ? 1 : 0}</em></button>
      ${app.employed ? `<button class="${tab === "mine" ? "on" : ""}" data-do="jobs-tab" data-id="mine">MY JOB</button>` : ""}
    </div>
    ${error || jobs.said ? `<div class="mls-said ${error ? "bad" : ""} mls-portal-said">${escape(error || jobs.said)}</div>` : ""}`;
  if (tab === "mine" && app.mine) {
    const mine = app.mine,
      weekStrip = mine.week
        .map(
          (day) =>
            `<span class="${day.state}"><b>${escape(day.day)}</b>${
              {
                done: "\u2713",
                late: "LATE",
                missed: "\u2717",
                off: "OFF",
                today: escape(mine.shift.split(" ")[1]?.split("\u2013")[0] ?? ""),
              }[day.state] ?? ""
            }</span>`,
        )
        .join("");
    return `
      <div class="mls-settings mls-portal">${header}
        <div class="mls-portal-mine">
          <div class="card me">${logo}
            <div><small>YOUR JOB${mine.startsOn ? ` \xB7 FROM ${escape(mine.startsOn)}` : ""}</small><h2>${escape(mine.position.toUpperCase())}</h2>
              <span>${escape(posting?.place ?? "The Office")} \xB7 $${mine.pay} a shift \xB7 ${escape(mine.shift)} \xB7 on time until ${escape(mine.onTimeUntil)}</span></div>
            ${posterCard(mine.boss, "Your boss")}
          </div>
          <div class="card"><h4>PERFORMANCE</h4>
            <div class="mls-portal-perf"><span class="bar"><i style="width:${Math.max(0, Math.min(100, mine.performance))}%"></i>${mine.mark !== null ? `<i class="mark" style="left:${mine.mark}%"></i>` : ""}</span><b>${mine.performance}</b>
              <small>${mine.mark !== null ? `the mark is what ${escape(mine.review?.next?.name ?? "the next position")} needs` : "the top of the ladder"} \xB7 ${mine.shifts} shift${mine.shifts === 1 ? "" : "s"} since ${escape(mine.since)}</small></div>
            <div class="mls-portal-flags">
              <span class="${mine.warnings ? "warn" : ""}">WARNINGS <b>${mine.warnings} of ${mine.warningsMax}</b><small>three and you're out</small></span>
              <span class="${mine.lates ? "warn" : ""}">LATE <b>${mine.lates} of ${mine.latesMax}</b><small>three lates = a warning</small></span>
              <span>DAYS OFF <b>${mine.daysOffLeft} left</b><small>this season</small></span>
            </div>
            <div class="mls-portal-week">${weekStrip}</div>
          </div>
          ${
            mine.review
              ? `<div class="card review"><h4>NEXT REVIEW \xB7 ${escape(mine.review.day)} \xB7 ${mine.review.inDays === 0 ? "TODAY" : `IN ${mine.review.inDays} DAY${mine.review.inDays === 1 ? "" : "S"}`}</h4>
            <div class="mls-portal-need"><b>${escape(mine.review.next.name.toUpperCase())}</b><span>$${mine.review.next.pay} a shift</span></div>
            <div class="mls-portal-checks">${mine.review.checks.map((check) => `<span class="${check.ok ? "yes" : "no"}">${check.ok ? "\u2713" : "\u2717"} ${escape(check.text)}</span>`).join("")}</div>
            <small>After your shift, with ${escape(mine.boss?.name ?? "the manager")}.</small></div>`
              : ""
          }
          <div class="card wide"><h4>THE CAREER</h4>${ladderPath(mine.ladder)}</div>
          <div class="card wide"><h4>ASK</h4>
            <div class="mls-portal-asks">
              <button class="mls-set-btn" data-do="jobs-dayoff-open" ${mine.dayOff.left ? "" : "disabled"}>DAY OFF<small>a day ahead \xB7 ${mine.dayOff.left} left this season</small></button>
              <button class="mls-set-btn soft" data-do="jobs-quit">QUIT<small>back to Intern if you return</small></button>
            </div>
            ${jobs.dayOffOpen ? `<div class="mls-portal-days">${mine.dayOff.options.map((option) => `<button data-do="jobs-dayoff" data-id="${option.day}">${escape(option.label)}</button>`).join("")}</div>` : ""}
          </div>
        </div>
      </div>`;
  }
  const detail = posting
    ? `
    <div class="mls-portal-detail">
      <div class="hero" ${officeImage ? `style="background-image:url('${escape(officeImage)}')"` : ""}><span class="where">${escape(posting.place.toUpperCase())}</span></div>
      <div class="head">
        <div><h2>${escape(posting.title.toUpperCase())}</h2><div class="sub">${escape(posting.place)} \xB7 Full-time \xB7 ${escape(posting.shift)}</div></div>
        <div class="paybox"><b>$${posting.pay}</b><small>A SHIFT</small></div>
      </div>
      ${posterCard(posting.boss, "The boss")}
      <div class="sec"><h4>THE ROLE</h4><p>Filing, reports, the phones and whatever lands on your desk. On time until ${escape(posting.onTimeUntil)}.</p></div>
      <div class="sec"><h4>THE CAREER</h4>${ladderPath(posting.ladder)}<p class="note">Reviews on the 1st and the 15th, after the shift.</p></div>
      <div class="sec"><h4>WHAT THEY LOOK AT</h4><div class="mls-portal-look"><span>Charm <b>${posting.look.charm}</b></span><span>Knowledge <b>${posting.look.knowledge}</b></span><small>at the interview: one question, three answers</small></div></div>
      <div class="apply ${posting.yours ? "done" : posting.apply.ok ? "" : "wait"}">
        ${posting.yours ? `<b>YOU WORK HERE</b><small>${escape(app.mine?.startsOn ? `from ${app.mine.startsOn}` : `since ${app.mine?.since ?? ""}`)}</small>` : posting.apply.ok ? `<b>APPLY IN PERSON</b><small>At ${escape(posting.place)}, ${escape(posting.hours)} \xB7 ${posting.minutes ? `${posting.minutes} min away \xB7 ` : "you are here \xB7 "}a short interview</small>` : `<b>NOT NOW</b><small>${escape(posting.apply.why)}</small>`}
      </div>
    </div>`
    : "";
  return `
    <div class="mls-settings mls-portal">${header}
      <div class="mls-portal-board">
        <div class="mls-portal-list"><div class="count">${posting ? "1 JOB \xB7 FULL-TIME" : "NO JOBS IN TOWN"}</div>
          ${
            posting
              ? `<button class="mls-portal-post on">${logo}
            <span class="t"><b>${escape(posting.title)}</b><span>${escape(posting.place)}${posting.minutes ? ` \xB7 ${posting.minutes} min away` : ""}</span>
              <span class="tags"><em class="pay">$${posting.pay} / shift</em><em>Full-time</em><em>${escape(posting.shift)}</em><em class="grow">Career \xB7 ${posting.ladder.length} positions</em></span></span>
            <span class="state">${posting.yours ? '<i class="yours">YOUR JOB</i>' : posting.apply.ok ? '<i class="new">HIRING</i>' : '<i class="wait">NOT NOW</i>'}</span>
          </button>`
              : ""
          }
        </div>
        ${detail}
      </div>
    </div>`;
}
const careerFace = (boss) =>
  boss
    ? `<div class="face">${frameImg(personOf(boss.id, boss.name))}</div>`
    : '<div class="face mls-career-nobody"><span>THE<br>MANAGER</span></div>';
const careerChip = (text, cls = "") => `<span class="chip ${cls}">${escape(text)}</span>`;
function careerLine(card) {
  return card.line
    ? `<span class="said">${escape(card.line)}</span>`
    : card.writing
      ? '<span class="said writing">WRITING<span class="dots"><i>.</i><i>.</i><i>.</i></span></span>'
      : "";
}
function careerCardView(card) {
  const time = escape(S.life?.hud?.time ?? ""),
    boss = card.boss ?? null,
    bossName = (boss?.name ?? "The manager").toUpperCase(),
    wrapCard = (inner, { bad = false, close: closable = true } = {}) => `
    <div class="mls-card-veil mls-career-veil" ${closable ? 'data-do="career-close"' : ""}>
      <div class="mls-card mls-career ${bad ? "bad" : ""}" style="--c:${bad ? "var(--red)" : colourFor(boss?.id ?? "office")}">${inner}
        ${closable ? '<div class="hint">TAP TO CLOSE</div>' : ""}</div></div>`;
  if (card.kind === "interview") {
    const view = card.view,
      boss2 = view.boss;
    return wrapCard(
      `
      <div class="kicker"><b>${escape(view.time)}</b>THE OFFICE \xB7 INTERVIEW</div>
      ${careerFace(boss2)}
      <div class="who">
        <span class="knock">${boss2 && !boss2.met ? "FIRST TIME YOU MEET" : boss2 ? "THE BOSS" : "THE OFFICE'S MANAGER"}</span>
        <div class="what">${escape((boss2?.name ?? "The manager").toUpperCase())}</div>
        <span class="said">\xAB${escape(view.question)}\xBB</span>
      </div>
      <div class="mls-career-answers">${view.answers
        .map(
          (answer) => `
        <button class="mls-career-ans" data-do="career-answer" data-id="${answer.tone}" ${view.available ? "" : "disabled"}><b>${escape(answer.label)}</b><span>\xAB${escape(answer.said)}\xBB</span><em>${answer.chance}%</em><small>${escape(answer.why)}</small></button>`,
        )
        .join("")}
        ${view.available ? "" : `<div class="mls-said bad">${escape(view.why)}</div>`}
        <button class="mls-career-leave" data-do="career-close">NOT NOW</button>
      </div>`,
      {
        close: false,
      },
    );
  }
  if (card.kind === "hired" || card.kind === "refused") {
    const hired = card.kind === "hired";
    return wrapCard(`
      <div class="kicker"><b>${time}</b>THE OFFICE \xB7 INTERVIEW</div>
      ${careerFace(boss)}
      <div class="who">
        <span class="knock">${hired ? "HIRED" : "NOT THIS TIME"}</span>
        <div class="what">${escape(hired ? card.position.toUpperCase() : bossName)}</div>
        ${careerLine(card)}
        <div class="chips">${hired ? careerChip(`$${card.pay} a shift`, "money") + careerChip(card.shift ?? "") + careerChip(`starts ${card.startsOn} ${card.from ?? ""}`) : careerChip(`You can try again on ${card.until}`)}${card.met && boss ? careerChip(`You met ${boss.name}`, "gain") : ""}</div>
      </div>`);
  }
  if (card.kind === "review") {
    const promoted = card.promoted;
    return wrapCard(`
      <div class="kicker"><b>${time}</b>THE OFFICE \xB7 REVIEW</div>
      ${careerFace(boss)}
      <div class="who">
        <span class="knock">${promoted ? "PROMOTED" : "NOT YET"}</span>
        <div class="what">${escape(promoted ? card.position.toUpperCase() : bossName)}</div>
        ${careerLine(card)}
        <div class="chips">${promoted ? careerChip(`$${card.pay} a shift \xB7 was $${card.was.pay}`, "money") + (card.next ? careerChip(`Next: ${card.next.name} \xB7 ${card.next.needs}`) : "") : card.missing.map((item) => careerChip(item)).join("") + careerChip(`Next review: ${card.day}`)}</div>
      </div>`);
  }
  if (card.kind === "notice") {
    const fired = card.notice === "fired",
      reason = {
        missed: "YOU MISSED WORK",
        lates: "LATE THREE TIMES",
        fired: "THE THIRD WARNING",
      }[card.notice];
    return wrapCard(
      `
      <div class="kicker"><b>${time}</b>THE OFFICE</div>
      ${careerFace(boss)}
      <div class="who"><span class="knock">${reason}</span><div class="what">${fired ? "FIRED" : `WARNING ${card.warnings} OF ${card.warningsMax}`}</div>
        ${careerLine(card)}
        <div class="chips">${fired ? careerChip("No job") + careerChip(`The Office will see you again on ${card.until}`) : (card.notice === "missed" ? careerChip("\u221212 Performance") : "") + careerChip("Three warnings and you're out") + careerChip("A warning is forgotten after 30 days")}</div></div>`,
      {
        bad: true,
      },
    );
  }
  return card.kind === "dayoff-done"
    ? wrapCard(`
      <div class="kicker"><b>${time}</b>THE OFFICE \xB7 A DAY OFF</div>
      ${careerFace(boss)}
      <div class="who"><span class="knock">A DAY OFF</span><div class="what">${escape(card.label)}</div>
        <div class="chips">${careerChip(`${card.left} left this season`)}</div></div>`)
    : card.kind === "quit-done"
      ? wrapCard(
          `
      <div class="kicker"><b>${time}</b>THE OFFICE</div>
      ${careerFace(boss)}
      <div class="who"><span class="knock">YOU QUIT</span><div class="what">NO JOB</div>
        <div class="chips">${careerChip("You can come back any time, from Intern")}</div></div>`,
          {
            bad: true,
          },
        )
      : card.kind === "quit"
        ? wrapCard(
            `
      <div class="kicker"><b>${time}</b>THE OFFICE</div>
      ${careerFace(boss)}
      <div class="who"><span class="knock">QUIT THE OFFICE?</span><div class="what">${escape(card.position.toUpperCase())}</div>
        <div class="chips">${careerChip("No more pay")}${careerChip("You can come back any time, from Intern")}</div></div>
      <div class="mls-career-answers two">
        <button class="mls-career-ans" data-do="jobs-quit-yes"><b>QUIT</b></button>
        <button class="mls-career-ans" data-do="career-close"><b>STAY</b></button>
      </div>`,
            {
              bad: true,
              close: false,
            },
          )
        : "";
}
function sceneJobCard(sceneJob) {
  const boss = sceneJob.boss,
    time = escape(S.life?.hud?.time ?? ""),
    takenAs = `<div class="mls-detected mls-career-read"><div><b>TAKEN AS: ${escape(sceneJob.act)}</b><small>from what you wrote</small></div>
      <button data-do="scene-job" data-id="undo">NOT WHAT I MEANT \u21A9</button></div>`;
  let whoHtml = "",
    answersHtml = "";
  if (sceneJob.ask === "day-off") {
    whoHtml = `<span class="knock">A DAY OFF</span><div class="what">WHICH DAY?</div>
      <div class="chips">${careerChip(`${sceneJob.dayOff?.left ?? 0} left this season \xB7 a day ahead`)}</div>`;
    answersHtml = (sceneJob.dayOff?.left ? sceneJob.dayOff.options : [])
      .map(
        (option) =>
          `<button class="mls-career-ans" data-do="scene-job" data-id="day-off" data-day="${option.day}"><b>${escape(option.label)}</b></button>`,
      )
      .join("");
  } else if (sceneJob.ask === "quit") {
    whoHtml = `<span class="knock">QUIT THE OFFICE?</span><div class="what">${escape((sceneJob.position ?? "").toUpperCase())}</div>
      <div class="chips">${careerChip("No more pay")}${careerChip("You can come back any time, from Intern")}</div>`;
    answersHtml = '<button class="mls-career-ans" data-do="scene-job" data-id="quit"><b>QUIT</b></button>';
  } else if (sceneJob.ask === "apply") {
    const interview = sceneJob.interview,
      canApply = interview.canApply ?? {
        ok: true,
        reason: "",
      };
    whoHtml = `<span class="knock">THE JOB \xB7 A FEW QUESTIONS</span><div class="what">${escape((boss?.name ?? "").toUpperCase())}</div><span class="said">\xAB${escape(interview.question)}\xBB</span>
      ${canApply.ok ? "" : `<div class="chips">${careerChip(canApply.reason)}</div>`}`;
    answersHtml = interview.answers
      .map(
        (answer) =>
          `<button class="mls-career-ans" data-do="scene-job" data-id="apply" data-tone="${answer.tone}" ${canApply.ok ? "" : "disabled"}><b>${escape(answer.label)}</b><span>\xAB${escape(answer.said)}\xBB</span><em>${answer.chance}%</em><small>${escape(answer.why)}</small></button>`,
      )
      .join("");
  }
  if (
    (sceneJob.ask === "day-off" && !sceneJob.dayOff?.left) ||
    (sceneJob.ask === "apply" && sceneJob.interview?.canApply?.ok === false)
  ) {
    answersHtml += '<button class="mls-career-leave" data-do="scene-job" data-id="undo">BACK TO THE TALK</button>';
  }
  return `
    <div class="mls-card-veil mls-career-veil">
      <div class="mls-card mls-career" style="--c:${colourFor(boss?.id ?? "office")}">
        <div class="kicker"><b>${time}</b>THE OFFICE</div>
        ${takenAs}
        ${careerFace(boss)}
        <div class="who">${whoHtml}</div>
        <div class="mls-career-answers ${sceneJob.ask === "day-off" ? "three" : ""}">${answersHtml}</div>
      </div>
    </div>`;
}
const sceneJobChoose = (choice, { day = null, tone = null } = {}) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/scene/job`, {
        method: "POST",
        body: {
          choice: choice,
          day: day === null ? null : Number(day),
          tone: tone,
        },
      }),
      boss = S.life.scene?.job?.boss ?? null;
    S.life = res.life;
    const result = res.sceneJob;
    if (result.undone) {
      return;
    }
    const out = result.out;
    S.jobCard =
      result.ask === "day-off"
        ? {
            kind: "dayoff-done",
            ...out,
            boss: boss,
          }
        : result.ask === "quit"
          ? {
              kind: "quit-done",
              boss: boss,
            }
          : {
              kind: out.hired ? "hired" : "refused",
              ...out,
              boss: boss,
            };
  });
function momentCardView(shift, moment) {
  const withPerson = moment.with,
    shiftMinutes = 360,
    [fromHour, fromMinute] = shift.from.split(":").map(Number),
    [atHour, atMinute] = moment.at.split(":").map(Number),
    progress = Math.max(
      0,
      Math.min(100, Math.round(((atHour * 60 + atMinute - (fromHour * 60 + fromMinute)) / shiftMinutes) * 100)),
    );
  return `
    <div class="mls-card-veil mls-career-veil">
      <div class="mls-card mls-career" style="--c:${colourFor(withPerson?.id ?? "office")}">
        <div class="kicker"><b>${escape(moment.at)}</b>THE OFFICE \xB7 YOUR SHIFT</div>
        <div class="clock"><span class="from">${escape(shift.from)}</span><span class="arrow">\u25B8</span><span class="to">${escape(moment.at)}</span><span class="dur">PAUSED</span></div>
        <div class="track"><i style="width:${progress}%"></i></div>
        ${withPerson ? careerFace(withPerson) : '<div class="face mls-career-nobody"><span>THE<br>OFFICE</span></div>'}
        <div class="who">
          <span class="knock">${escape(moment.title)}</span>
          <div class="what">${withPerson ? escape(withPerson.name.toUpperCase()) : "AT YOUR DESK"}</div>
          ${moment.line ? `<span class="said">${escape(moment.line)}</span>` : moment.writing ? '<span class="said writing">WRITING<span class="dots"><i>.</i><i>.</i><i>.</i></span></span>' : ""}
        </div>
        <div class="mls-career-answers ${moment.options.length === 2 ? "two" : "three"}">${moment.options
          .map(
            (option) => `
          <button class="mls-career-ans ${option.best ? "best" : ""} ${option.level ? "charm" : ""}" data-do="career-moment" data-index="${moment.index}" data-id="${option.id}" ${S.busy ? "disabled" : ""}><b>${escape(option.label)}</b>
            <small>${option.chips.map((chip) => careerChip(chip.text, chip.good ? "gain" : "")).join("")}</small>
            ${option.best ? `<span class="lv">\u2605 BEST FOR PERFORMANCE \xB7 ${escape(option.best)}</span>` : option.level ? `<span class="lv">${escape(option.level)}</span>` : ""}</button>`,
          )
          .join("")}
        </div>
      </div>
    </div>`;
}
const clockKey = () => `${S.life?.id}|${S.life?.hud?.date}|${S.life?.hud?.time}`;
function careerOverlay() {
  if (S.jobCard) {
    return careerCardView(S.jobCard);
  }
  const career = S.life?.career;
  if (!career) {
    return "";
  }
  const shift = career.shift;
  if (shift && S.view === "place" && S.life.at === "office") {
    const moment = shift.moments.find((candidate) => !(String(candidate.index) in (S.shiftPick ?? {})));
    if (moment) {
      if (moment.writing) {
        shiftMomentLine(moment.index);
      }
      return momentCardView(shift, moment);
    }
    if (shift.lunch && shift.stage === "afternoon" && !S.busy && !S.shiftEnding && S.shiftFailed !== clockKey()) {
      S.shiftEnding = true;
      setTimeout(() => finishShiftNow(), 0);
    }
  }
  return career.notice && !S.noticeSeen && ["map", "place"].includes(S.view) && !S.card && !S.faint
    ? ((S.jobCard = {
        ...career.notice,
        kind: "notice",
        notice: career.notice.kind,
        lineKind: "notice",
      }),
      S.jobCard.writing && setTimeout(() => jobLine(S.jobCard), 0),
      careerCardView(S.jobCard))
    : "";
}
const openJobs = () =>
  act(async () => {
    S.phone = false;
    S.jobs = {
      app: null,
      tab: null,
      dayOffOpen: false,
      said: "",
    };
    S.view = "jobs";
    notify();
    S.jobs.app = (await call(`/lives/${S.life.id}/jobs-app`)).app;
  });
const refreshJobs = async () => {
  if (S.view === "jobs" && S.jobs) {
    S.jobs.app = (await call(`/lives/${S.life.id}/jobs-app`)).app;
  }
};
const openInterview = () =>
  act(async () => {
    const interview = (await call(`/lives/${S.life.id}/job/interview`)).interview;
    S.jobCard = {
      kind: "interview",
      view: interview,
    };
  });
const answerInterview = (tone) =>
  act(async () => {
    const before = hudSnap(S.life),
      res = await call(`/lives/${S.life.id}/job/apply`, {
        method: "POST",
        body: {
          tone: tone,
        },
      });
    S.life = res.life;
    S.roll = {
      from: before,
      ms: 900,
    };
    const applied = res.applied;
    if (applied.fainted) {
      S.jobCard = null;
      reportEvents(res.events);
      return;
    }
    S.jobCard = {
      kind: applied.hired ? "hired" : "refused",
      ...applied,
      lineKind: "interview",
    };
    reportEvents(res.events);
    if (applied.writing) {
      jobLine(S.jobCard);
    }
  });
async function jobLine(card) {
  if (!card.asked) {
    card.asked = true;
    try {
      const res = await call(`/lives/${S.life.id}/job/line`, {
        method: "POST",
        body: {
          kind: card.lineKind,
        },
      });
      card.line = res.line?.text ?? null;
    } catch {
      card.line = null;
    }
    card.writing = false;
    notify();
  }
}
const momentAsked = new Set();
async function shiftMomentLine(index) {
  const key = `${S.life?.id}:${S.life?.hud?.clock?.dayIndex}:${index}`;
  if (!momentAsked.has(key)) {
    momentAsked.add(key);
    try {
      const res = await call(`/lives/${S.life.id}/shift/moment-line`, {
        method: "POST",
        body: {
          index: index,
        },
      });
      if (res.life) {
        S.life = res.life;
      }
    } catch {
      setTimeout(() => momentAsked.delete(key), 5e3);
    }
    notify();
  }
}
const pickMoment = (momentIndex, optionId) => {
  S.shiftPick = {
    ...(S.shiftPick ?? {}),
    [momentIndex]: optionId,
  };
  const shift = S.life?.career?.shift;
  if (shift && shift.moments.every((moment) => String(moment.index) in S.shiftPick)) {
    return shift.stage === "morning" ? startLunchNow() : finishShiftNow();
  }
  notify();
};
const startLunchNow = () =>
  act(async () => {
    const before = hudSnap(S.life),
      res = await call(`/lives/${S.life.id}/shift/lunch`, {
        method: "POST",
        body: {
          choices: S.shiftPick ?? {},
        },
      });
    S.shiftPick = {};
    S.life = res.life;
    if (res.shift) {
      S.card = {
        ...lunchCardOf(res.lunch, res.lunch?.over ? "back" : "lunch"),
        notes: (res.events ?? []).filter((ev) => ev.id === "work-moment").map((ev) => ev.text),
      };
      S.roll = {
        from: before,
        ms: 1200,
      };
    }
    reportEvents(res.events);
  });
const finishShiftNow = () =>
  act(async () => {
    const before = hudSnap(S.life),
      choices = S.shiftPick ?? {};
    let res;
    try {
      res = await call(`/lives/${S.life.id}/shift`, {
        method: "POST",
        body: {
          choices: choices,
        },
      });
    } catch (err) {
      S.shiftFailed = clockKey();
      throw err;
    } finally {
      S.shiftEnding = false;
    }
    if (((S.shiftPick = {}), (S.life = res.life), (res.events ?? []).some((ev) => ev.id === "fainted"))) {
      if (res.result?.review) {
        S.jobCard = {
          kind: "review",
          ...res.result.review,
          lineKind: "review",
        };
        if (res.result.review.writing) {
          jobLine(S.jobCard);
        }
      }
    } else {
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
  });
const stayLate = () =>
  act(async () => {
    const before = hudSnap(S.life),
      review = S.card?.review ?? null,
      res = await call(`/lives/${S.life.id}/job/overtime`, {
        method: "POST",
      });
    S.life = res.life;
    S.card = null;
    if ((res.events ?? []).some((ev) => ev.id === "fainted")) {
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
    } else {
      S.card = {
        ...cardOf(res, before, res.life),
        review: review,
      };
      S.roll = {
        from: before,
        ms: 1500,
      };
    }
    reportEvents(res.events);
  });
const askDayOff = (day) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/job/dayoff`, {
      method: "POST",
      body: {
        day: Number(day),
      },
    });
    S.life = res.life;
    await refreshJobs();
    S.jobs.dayOffOpen = false;
    S.jobs.said = `Day off on ${res.dayOff.label}. ${res.dayOff.left} left this season.`;
  });
const quitAsk = () => {
  const mine = S.jobs?.app?.mine;
  S.jobCard = {
    kind: "quit",
    position: mine?.position ?? "Intern",
    boss: mine?.boss?.met ? mine.boss : null,
  };
  notify();
};
const quitYes = () =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/job/quit`, {
      method: "POST",
    });
    S.life = res.life;
    S.jobCard = null;
    await refreshJobs();
    if (S.jobs) {
      S.jobs.tab = "posts";
      S.jobs.said = "You quit the Office.";
    }
  });
const closeJobCard = () => {
  const card = S.jobCard;
  if (((S.jobCard = null), card?.kind === "notice")) {
    S.noticeSeen = true;
    return act(async () => {
      try {
        const res = await call(`/lives/${S.life.id}/job/seen`, {
          method: "POST",
        });
        S.life = res.life;
      } finally {
        S.noticeSeen = false;
      }
    });
  }
  notify();
};

export {
  answerInterview,
  askDayOff,
  careerCardView,
  careerOverlay,
  closeJobCard,
  jobLine,
  jobsAppView,
  openInterview,
  openJobs,
  personOf,
  pickMoment,
  quitAsk,
  quitYes,
  sceneJobCard,
  sceneJobChoose,
  stayLate,
};
