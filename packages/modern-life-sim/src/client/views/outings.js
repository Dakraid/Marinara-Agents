// House parties, invites, plans and outing screens
import { MAP, colourFor, escape, frameImg, paintIcon } from "./common.js";
import { CAP_WHY, STORE_LOOK, greyRow } from "./place.js";
import {
  BAD_READS,
  READ_WORDS,
  callChips,
  didStrip,
  hereStrip,
  hereTags,
  keyTools,
  leftLine,
  othersBonds,
  pleaCall,
  sceneErr,
  sceneLog,
} from "./scene.js";
import { newsFace } from "./people.js";
import { nextCardId } from "./cards.js";
import { S, act, afterLifeCancel, call, notify } from "../state.js";
import { startScene } from "../actions/title.js";
import { tellLater } from "../actions/town.js";
import { reportEvents } from "../actions/talk.js";

function housePartyPanel() {
  const party = S.hp,
    birthday = !!party?.info?.birthday,
    head = `<div class="head"><button class="mls-back flat" data-do="home-panel" data-id="">\u25C2 HOME</button><b>${birthday ? "YOUR BIRTHDAY PARTY" : "THROW A PARTY"}</b></div>`;
  if (!party?.info) {
    return `<div class="mls-special-menu mls-invite">${head}<p class="hint">\u2026</p></div>`;
  }
  const partyInfo = party.info,
    offer = partyInfo.offer ?? {},
    kinds =
      offer.birthday && !party.answer
        ? `<div class="mls-inv-kinds">
      <button class="${birthday ? "on" : ""}" data-do="hp-kind" data-id="birthday"><b>YOUR BIRTHDAY PARTY</b><small>Your guests bring presents</small></button>
      <button class="${birthday ? "" : "on"} ${offer.usual ? "off" : ""}" data-do="hp-kind" data-id="usual" ${offer.usual ? "disabled" : ""}><b>A PARTY</b>${offer.usual ? `<small>${escape(offer.usual)}</small>` : ""}</button></div>`
        : "";
  if (!partyInfo.ok) {
    return `<div class="mls-special-menu mls-invite">${head}${kinds}<p class="hint">${escape(partyInfo.why)}</p></div>`;
  }
  if (party.answer) {
    const answer = party.answer;
    return `<div class="mls-special-menu mls-invite">${head}
      <div class="mls-pairs">${answer.answers
        .map(
          (reply) =>
            `<div class="mls-pair"><span class="faces">${newsFace(
              partyInfo.people.find((person) => person.id === reply.id) ?? {
                id: reply.id,
                name: reply.name,
              },
            )}</span><div><b>${escape(reply.name)}</b>${reply.why ? `<small>${escape(reply.why)}</small>` : ""}</div><span class="mls-mood ${reply.yes ? "good" : "rivals"}">${reply.yes ? "COMING" : "NO"}</span></div>`,
        )
        .join("")}</div>
      ${answer.planned ? `<div class="mls-inv-stamp">ON FOR ${escape(answer.planned.when.toUpperCase())}<small>${escape(answer.planned.food.toUpperCase())}${answer.paid ? ` \xB7 PAID $${answer.paid}` : ""}</small></div>` : '<div class="mls-inv-foot"><span>NOBODY CAN MAKE IT THEN</span><button class="main" data-do="hp-again">TRY ANOTHER DAY</button></div>'}
    </div>`;
  }
  const day = partyInfo.days.find((entry) => entry.d === party.day),
    food = partyInfo.food.find((entry) => entry.id === party.food),
    foodCost = (food?.perGuest ?? 0) * party.with.length,
    ready =
      !!day &&
      party.hour !== null &&
      party.hour >= day.from &&
      party.until > party.hour &&
      party.with.length > 0 &&
      food?.ok,
    untilLabel = (hour) => (hour >= 24 ? `${hourOf(hour - 24)}<small>next day</small>` : hourOf(hour));
  return `<div class="mls-special-menu mls-invite">${head}
    ${S.error ? `<div class="mls-said bad">${escape(S.error)}</div>` : ""}
    ${party.words ? '<div class="mls-detected"><div><b>TAKEN AS: A PARTY AT YOUR PLACE</b><small>from what you wrote</small></div><button data-do="hp-close">NOT WHAT I MEANT</button></div>' : ""}
    ${kinds}
    <div class="mls-inv-lbl">WHEN${birthday && offer.birthday ? ` <small>your birthday is ${escape(offer.birthday.label)}</small>` : ""}</div>
    <div class="mls-inv-days">${partyInfo.days.map((day2) => `<button class="${day2.d === party.day ? "on" : ""}" data-do="hp-day" data-id="${day2.d}"><b>${day2.label}</b><small>${day2.n}${day2.yours ? " \xB7 YOURS" : ""}</small></button>`).join("")}</div>
    <div class="mls-inv-lbl">FROM</div>
    <div class="mls-inv-hours">${partyInfo.hours
      .filter((hour) => hour >= (day?.from ?? 0))
      .map(
        (hour) =>
          `<button class="${party.hour === hour ? "on" : ""}" data-do="hp-hour" data-id="${hour}"><b>${hourOf(hour)}</b></button>`,
      )
      .join("")}</div>
    <div class="mls-inv-lbl">UNTIL</div>
    <div class="mls-inv-hours">${partyInfo.until
      .filter((hour) => hour > party.hour)
      .map(
        (hour) =>
          `<button class="${party.until === hour ? "on" : ""}" data-do="hp-until" data-id="${hour}"><b>${untilLabel(hour)}</b></button>`,
      )
      .join("")}</div>
    <div class="mls-inv-lbl">WHO YOU INVITE <small>your home takes ${partyInfo.max}</small></div>
    <div class="mls-inv-who">${
      partyInfo.people
        .map((person) => {
          const invited = party.with.includes(person.id),
            full = !invited && party.with.length >= partyInfo.max;
          return `<button class="mls-inv-pick ${invited ? "on" : ""}" data-do="hp-with" data-id="${escape(person.id)}" ${full ? "disabled" : ""}>${newsFace(person)}<b>${escape(person.name)}</b><small>${escape(person.tier)}</small></button>`;
        })
        .join("") || '<span class="hint">Nobody you know well enough yet</span>'
    }</div>
    <div class="mls-inv-lbl">THE FOOD</div>
    <div class="mls-inv-kinds">${partyInfo.food.map((food2) => `<button class="${party.food === food2.id ? "on" : ""} ${food2.ok ? "" : "off"}" data-do="hp-food" data-id="${food2.id}" ${food2.ok ? "" : "disabled"}><b>${escape(food2.name.toUpperCase())}</b><small>${food2.perGuest ? `$${food2.perGuest} a guest` : food2.id === "cooked" ? `One portion for each guest and one for you, cooked within ${food2.keepsDays ?? 4} days of it` : ""}</small></button>`).join("")}</div>
    <div class="mls-inv-foot"><span>${party.with.length} INVITED${foodCost ? ` \xB7 UP TO $${foodCost} FOR THE FOOD` : ""}</span>
      <button class="main" data-do="hp-send" ${ready ? "" : "disabled"}>${ready ? "SEND THE INVITATIONS \u25B8" : day ? (party.hour === null || party.hour < day.from ? "PICK WHEN IT STARTS" : party.until > party.hour ? (party.with.length ? "PICK THE FOOD" : "INVITE SOMEONE") : "PICK WHEN IT ENDS") : "PICK A DAY"}</button></div>
  </div>`;
}
function partyStripView(life) {
  const plan = life.partyPlan;
  return !plan || life.party
    ? ""
    : `<div class="mls-party-next">
    <div><b>${plan.birthday ? "YOUR BIRTHDAY PARTY" : "YOUR PARTY"} \xB7 ${escape(plan.when.toUpperCase())}</b><small>${escape(plan.coming.join(", "))} \xB7 ${plan.cooking ? `You're cooking: ${plan.cooking.ready} of ${plan.cooking.need} portions ready` : escape(plan.food)}</small></div>
    ${plan.startable ? '<button data-do="party-start">START THE PARTY \u25B8</button>' : `<button data-do="party-cancel">${S.hpCancel ? "YES, CALL IT OFF \xB7 \u22121 FRIENDSHIP WITH EACH GUEST" : "CALL IT OFF"}</button>`}
  </div>`;
}
const PARTY_HOW = {
  great: "GOING GREAT",
  good: "GOING WELL",
  flat: "FALLING FLAT",
};
function partyRunView(party) {
  const room = party.rooms.find((candidate) => candidate.here),
    duration = (minutes) => (minutes >= 60 ? `${Math.round((minutes / 60) * 10) / 10}h` : `${minutes}m`);
  return `
    <div class="mls-acts-head"><h2>${party.hostName ? `${escape(party.hostName.toUpperCase())}'S PARTY` : "YOUR PARTY"}</h2></div>
    <div class="mls-party-meter ${party.how}"><b>${PARTY_HOW[party.how]}</b><span class="bar"><i style="width:${party.meter}%"></i></span></div>
    ${
      party.door0 || party.bye
        ? ((guest) => `<div class="mls-party-next mls-bell"><span class="faces">${newsFace(
            (party.rooms ?? []).flatMap((entry) => entry.people).find((entry) => entry.id === guest.characterId) ?? {
              id: guest.characterId,
              name: guest.name,
            },
          )}</span><div><b>${escape(guest.name.toUpperCase())} AT THE DOOR</b><small>${party.bye ? "To see you out" : "To let you in"}</small></div>
      <button data-do="party-door">${party.bye ? "SAY GOODBYE \u25B8" : "GO IN \u25B8"}</button></div>`)(
            party.door0 ?? party.bye,
          )
        : ""
    }
    ${
      party.door?.length
        ? `<div class="mls-party-next mls-neighbour mls-bell"><span class="faces">${party.door.map((guest) => newsFace(guest)).join("")}</span><div><b>THE DOORBELL</b><small>${escape(party.door.map((guest) => guest.name).join(" and "))}</small></div>
      <button data-do="party-letin">LET ${party.door.length > 1 ? "THEM" : escape(party.door[0].name.toUpperCase())} IN \u25B8</button></div>`
        : party.next
          ? `<button class="mls-activity two" data-do="party-wait"><span class="n">Wait for your guests</span><span class="hours">${escape(party.next)}<small>NEXT</small></span><span class="chips"><span class="chip">${party.coming} on their way</span></span></button>`
          : ""
    }
    ${
      party.neighbour
        ? `<div class="mls-party-next mls-neighbour"><div><b>A NEIGHBOUR AT YOUR DOOR</b><small>About the noise</small></div>
      <button data-do="party-neighbour" data-id="down">TURN IT DOWN</button><button data-do="party-neighbour" data-id="keep">KEEP GOING<small>$${party.neighbour.fine} fine</small></button></div>`
        : ""
    }
    <div class="mls-party-rooms">${party.rooms
      .map(
        (room2) => `
      <button class="room ${room2.here ? "here" : ""}" data-do="party-go" data-id="${room2.id}" ${room2.here ? "disabled" : ""}>
        <span class="ic">${room2.icon}</span><b>${escape(room2.name.toUpperCase())}</b>
        <span class="faces">${room2.people.map((person) => newsFace(person)).join("") || "<small>nobody</small>"}</span>
        ${room2.here ? "<em>YOU ARE HERE</em>" : ""}
      </button>`,
      )
      .join("")}</div>
    ${
      party.asleep?.length || party.aside?.length
        ? `<div class="mls-inv-lbl">${[
            party.asleep?.length
              ? `ASLEEP ON THE SOFA: ${escape(
                  party.asleep
                    .map((person) => person.name)
                    .join(", ")
                    .toUpperCase(),
                )}`
              : "",
            ...(party.aside ?? []).map((person) =>
              escape((person.words || `${person.name} is off somewhere`).toUpperCase()),
            ),
          ]
            .filter(Boolean)
            .join(" \xB7 ")}</div>`
        : ""
    }
    <div class="mls-acts-head"><h2>IN THE ${escape(room.name.toUpperCase())}</h2></div>
    ${party.fare ? `<div class="mls-inv-lbl">ON THE TABLE <small>${escape(party.fare)}</small></div>` : ""}
    ${room.acts
      .map(
        (activity) => `
      <button class="mls-activity two ${activity.ok ? "" : "off"} ${S.partyPick === activity.key ? "picked" : ""}" data-do="${activity.everyone ? "party-do" : "party-pick"}" data-id="${activity.key}" ${activity.ok && !S.busy ? "" : "disabled"}>
        <span class="n">${escape(activity.name)}</span><span class="hours">${duration(activity.minutes)}<small>TIME</small></span><span class="chips">${activity.everyone ? '<span class="chip">With everyone here</span>' : ""}</span>
        ${activity.ok ? "" : `<span class="why">${escape(activity.why)}</span>`}
      </button>${S.partyPick === activity.key && activity.ok ? withWhom(activity, room.people) : ""}`,
      )
      .join("")}
    ${(party.mods ?? [])
      .map(
        (mod) => `
      <button class="mls-activity two ${mod.who.some((who) => who.ok) ? "" : "off"} ${S.partyPick === mod.key ? "picked" : ""}" data-do="party-pick" data-id="${escape(mod.key)}" ${mod.who.length && !S.busy ? "" : "disabled"}>
        <span class="n">${escape(mod.name)}</span><span class="hours">\u25B8<small>CHOOSE</small></span><span class="chips">${mod.note ? `<span class="chip">${escape(mod.note)}</span>` : ""}</span>
      </button>${S.partyPick === mod.key ? modWhom(mod) : ""}`,
      )
      .join("")}
    ${party.pairs
      .map(
        ([first, second]) => `
      <button class="mls-activity two" data-do="party-introduce" data-id="${escape(first.id)}" data-character="${escape(second.id)}">
        <span class="n">Introduce ${escape(first.name)} to ${escape(second.name)}</span><span class="hours">5m<small>TIME</small></span><span class="chips"><span class="chip gain">They meet</span></span>
      </button>`,
      )
      .join("")}
    ${
      party.elsewhere.length && !S.partyPick
        ? `<div class="mls-inv-lbl">BRING SOMEONE OVER <small>5 min</small></div>
    <div class="mls-inv-who">${party.elsewhere.map((person) => `<button class="mls-inv-pick" data-do="party-bring" data-character="${escape(person.id)}">${newsFace(person)}<b>${escape(person.name)}</b><small>${escape(party.rooms.find((room2) => room2.people.some((guest) => guest.id === person.id))?.name ?? "")}</small></button>`).join("")}</div>`
        : ""
    }
    ${party.bye ? "" : `<button class="mls-activity two bye" data-do="party-end"><span class="n">${party.hostName && !party.home ? "Leave the party" : "Call it a night"}</span><span class="hours">\u25B8<small>${party.hostName && !party.home ? "GOODBYE" : "THE END"}</small></span><span class="chips"></span></button>`}`;
}
const partyActName = (key) =>
  [...(S.life?.party?.rooms ?? []).flatMap((entry) => entry.acts), ...(S.life?.party?.mods ?? [])].find(
    (entry) => entry.key === key,
  )?.name ?? "";
function withWhom(activity, people) {
  const you = {
    id: "you",
    name: S.life?.persona?.name || "You",
    avatar: S.life?.persona?.avatar ?? null,
    cut: S.life?.persona?.cut ?? null,
  };
  return `<div class="mls-inv-lbl">WITH WHOM</div>
    <div class="mls-inv-who">${people.map((person) => `<button class="mls-inv-pick" data-do="party-with" data-id="${escape(activity.key)}" data-character="${escape(person.id)}" ${S.busy ? "disabled" : ""}>${newsFace(person)}<b>${escape(person.name)}</b></button>`).join("")}
      <button class="mls-inv-pick" data-do="party-with" data-id="${escape(activity.key)}" data-character="" ${S.busy ? "disabled" : ""}>${newsFace(you)}<b>On your own</b></button></div>`;
}
function modWhom(mod) {
  const lead = mod.who.find((who) => who.id === S.partyWith) ?? null,
    chosenIds = lead ? [lead.id, ...(S.partyAlso ?? [])] : [],
    chosen = lead ? [lead, ...lead.also.filter((other) => chosenIds.includes(other.id))] : [],
    clashes = (who) =>
      chosen.some(
        (member) =>
          member.id !== who.id && ((member.not ?? []).includes(who.id) || (who.not ?? []).includes(member.id)),
      ),
    also = lead?.also ?? [];
  return `<div class="mls-inv-lbl">WITH WHOM</div>
    <div class="mls-inv-who">${mod.who.map((who) => `<button class="mls-inv-pick ${who.id === S.partyWith ? "on" : ""}" data-do="party-mod-with" data-character="${escape(who.id)}" ${who.ok && !S.busy ? "" : "disabled"}>${newsFace(who)}<b>${escape(who.name)}</b>${who.ok ? "" : `<small>${escape(who.why)}</small>`}</button>`).join("")}</div>
    ${
      also.length
        ? `<div class="mls-inv-lbl">WHO ELSE</div>
    <div class="mls-inv-who">${also
      .map((who) => {
        const on = chosenIds.includes(who.id),
          blocked = !who.ok || (!on && clashes(who));
        return `<button class="mls-inv-pick ${on ? "on" : ""}" data-do="party-mod-also" data-character="${escape(who.id)}" ${blocked || S.busy ? "disabled" : ""}>${newsFace(who)}<b>${escape(who.name)}</b>${who.ok ? (!on && clashes(who) ? `<small>Not with ${escape(chosen.find((member) => (member.not ?? []).includes(who.id) || (who.not ?? []).includes(member.id))?.name ?? "them")}</small>` : "") : `<small>${escape(who.why)}</small>`}</button>`;
      })
      .join("")}</div>`
        : ""
    }
    <div class="mls-inv-foot"><span></span><button class="main" data-do="party-mod-go" data-id="${escape(mod.key)}" ${lead && !S.busy ? "" : "disabled"}>${escape(mod.name.toUpperCase())} \u25B8</button></div>`;
}
function partyOverView(over) {
  const faceFor = (characterId, characterName) =>
      newsFace(
        (S.life?.contacts ?? []).find((contact) => contact.id === characterId) ?? {
          id: characterId,
          name: characterName,
        },
      ),
    rowNote = (row) =>
      row.host
        ? row.early
          ? "You left early"
          : row.helped
            ? "You helped it go well"
            : "Thanks for coming"
        : row.early
          ? "Went home early"
          : row.bed
            ? "Went home to bed"
            : row.sofa
              ? "Asleep on your sofa"
              : "",
    remember = over.remember?.pending
      ? `<div class="mls-inv-lbl">WHAT THEY'LL REMEMBER <small>\u2026</small></div>`
      : (over.remember?.rows ?? [])
          .map(
            (row) =>
              `<div class="mls-inv-lbl">WHAT ${escape(row.name.toUpperCase())} WILL REMEMBER</div><p class="hint">${escape(row.text)}</p>`,
          )
          .join("");
  return `<div class="mls-special-menu mls-invite mls-party-over">
    <div class="head"><b>${escape(over.theirs ? `${over.hostName.toUpperCase()}'S PARTY \xB7 ${over.how.toUpperCase()}` : over.how.toUpperCase())}</b></div>
    <div class="mls-pairs">${over.rows.map((row) => `<div class="mls-pair"><span class="faces">${faceFor(row.characterId, row.name)}</span><div><b>${escape(row.name)}</b>${rowNote(row) ? `<small>${escape(rowNote(row))}</small>` : ""}</div>${row.friendship ? `<span class="mls-mood ${row.friendship > 0 ? "good" : "rivals"}">${row.friendship > 0 ? "+" : ""}${row.friendship} FRIENDSHIP</span>` : ""}</div>`).join("")}</div>
    ${remember}
    <div class="mls-inv-foot"><span>${
      over.met?.length
        ? `MET TONIGHT: ${escape(
            over.met
              .slice(0, 3)
              .map((pair) => pair.join(" & "))
              .join(" \xB7 ")
              .toUpperCase(),
          )}${over.met.length > 3 ? ` \xB7 +${over.met.length - 3}` : ""}`
        : ""
    }</span><button class="main" data-do="party-seen">OK</button></div>
    ${over.sofa?.length ? `<p class="hint">${escape(over.sofa.join(" and "))} ${over.sofa.length > 1 ? "stay" : "stays"} the night.</p>` : ""}${over.fine ? `<p class="hint">${escape(over.fineBy ?? "The building")} fined you $${over.fine} for the noise.</p>` : ""}
  </div>`;
}
const theirPartyOverView = (over) => `<div class="mls-notice-veil mls-party-over-veil">${partyOverView(over)}</div>`;
const openHouseParty = ({
  with: guests = null,
  birthday = null,
  words = !!guests && !Array.isArray(guests),
  food = "snacks",
} = {}) =>
  act(async () => {
    const partyInfo = (
        await call(`/lives/${S.life.id}/party/info`, {
          method: "POST",
          body:
            birthday === null
              ? {}
              : {
                  birthday: birthday,
                },
        })
      ).party,
      invited = (Array.isArray(guests) ? guests : guests ? [guests] : []).filter((id) =>
        partyInfo.people?.some((person) => person.id === id),
      ),
      day = partyInfo.days?.find((day2) => day2.yours) ?? partyInfo.days?.[0],
      hour = Math.max(20, day?.from ?? 20);
    S.homePanel = "party";
    S.hp = {
      info: partyInfo,
      day: day?.d ?? null,
      hour: hour,
      until: Math.max(23, Math.min(hour + 3, partyInfo.until?.at(-1) ?? 23)),
      with: invited,
      food: food,
      answer: null,
      words: words,
    };
  });
const hpSend = () =>
  act(async () => {
    const plan = S.hp,
      res = await call(`/lives/${S.life.id}/party/plan`, {
        method: "POST",
        body: {
          day: plan.day,
          hour: plan.hour,
          until: plan.until,
          with: plan.with,
          food: plan.food,
          birthday: plan.info.birthday === true,
        },
      });
    S.life = res.life;
    plan.answer = {
      answers: res.answers,
      planned: res.planned,
      paid: res.paid,
    };
  });
const MOMENT_STEPS = ["do", "bring", "introduce"];
const partyStep = (step, body = {}) =>
  act(
    async (signal) => {
      S.partyPick = null;
      S.partyWith = null;
      S.partyAlso = [];
      const res = await call(`/lives/${S.life.id}/party/${step}`, {
        method: "POST",
        body: body,
        signal: signal,
      });
      if (((S.life = res.life), res.scene?.started && !res.scene.fainted)) {
        S.talk = {};
        S.talkTo = null;
        S.sceneSeg = 0;
        S.sceneLog = false;
        S.view = "scene";
        reportEvents(res.events);
        return;
      }
      if (step === "start") {
        S.homePanel = null;
        S.talkTo = null;
        S.talk = {};
      }
      if (res.arrived) {
        S.card = arrivalCardOf(res.arrived);
        tellLater(S.card);
      }
      if (step === "join") {
        S.view = "place";
        S.talkTo = null;
        S.talk = {};
      }
      S.said = [
        res.said,
        ...(res.presents ?? []).map((present) => `${present.who} gave you ${present.item.name.toLowerCase()}`),
      ]
        .filter(Boolean)
        .join(" \xB7 ");
      reportEvents(res.events);
    },
    MOMENT_STEPS.includes(step)
      ? {
          loading: `${partyActName(body.key) || "Just a moment"}\u2026`,
          cancel: afterLifeCancel,
          stuck: {
            again: () => partyStep(step, body),
            ...(String(body.key ?? "").startsWith("mod:")
              ? {}
              : {
                  skip: () =>
                    partyStep(step, {
                      ...body,
                      noLines: true,
                    }),
                }),
          },
        }
      : {},
  );
function arrivalCardOf(arrival) {
  const face = (S.life?.contacts ?? []).find((contact) => contact.id === arrival.characterId) ?? {
    id: arrival.characterId,
    name: arrival.names[0],
  };
  return {
    id: nextCardId(),
    activity: "arrive",
    name: `${arrival.names.join(" & ").toUpperCase()} ${arrival.names.length > 1 ? "ARRIVE" : "ARRIVES"}`,
    place: "Your party",
    sleep: false,
    worn: false,
    from: arrival.from,
    minutes: arrival.minutes,
    gains: [],
    levelled: [],
    notes: [],
    line: null,
    writing: true,
    face: face,
    did: [],
    hint: "TAP \xB7 CONTINUE",
    then: null,
    played: false,
    running: false,
    skip: false,
  };
}
function sleepoverCardOf(stay) {
  const face = (S.life?.contacts ?? []).find((contact) => contact.id === stay.characterId) ?? {
    id: stay.characterId,
    name: stay.names[0],
  };
  return {
    id: nextCardId(),
    activity: "sleepover",
    name: `${stay.names.join(" & ").toUpperCase()} STAYED OVER`,
    place: "Home",
    sleep: false,
    worn: false,
    from: stay.from,
    minutes: 0,
    gains: [],
    levelled: [],
    notes: [],
    line: null,
    writing: stay.line !== false,
    face: face,
    did: [],
    hint: "TAP \xB7 CONTINUE",
    then: null,
    played: false,
    running: false,
    skip: false,
  };
}
const hourOf = (hour) => `${String(hour % 24).padStart(2, "0")}:00`;
const TRIP_LOOK = {
  beach: {
    bg: "linear-gradient(170deg,#7fd3e0,#2a8fa8 55%,#e8d7a8)",
  },
  mountains: {
    bg: "linear-gradient(170deg,#9fb4c8,#4b6177 55%,#2c3a2f)",
  },
  city: {
    bg: "linear-gradient(170deg,#3a3050,#1d2233 60%,#e0a45a)",
  },
};
function invitePanel(person) {
  const invite = S.invite,
    head = `<div class="head"><button class="mls-back flat" data-do="invite-back" data-character="${person.id}">\u25C2 BACK</button><b>INVITE ${escape(person.name.toUpperCase())} OUT</b></div>`;
  if (!invite || invite.character !== person.id || !invite.info) {
    return `<div class="mls-special-menu mls-invite">${head}<p class="hint">\u2026</p></div>`;
  }
  if (invite.answer) {
    return `<div class="mls-special-menu mls-invite">${head}${inviteAnswerView(person, invite)}</div>`;
  }
  const inviteInfo = invite.info,
    kindsHtml = `
    <div class="mls-inv-lbl">WHAT</div>
    <div class="mls-inv-kinds">
      ${["hang", "date"].map((kind) => (inviteInfo.kinds[kind].ok ? `<button class="${invite.kind === kind ? "on" : ""}" data-do="invite-kind" data-id="${kind}"><b>${kind === "date" ? "DATE" : "HANG OUT"}</b></button>` : `<button class="off" disabled><b>${kind === "date" ? "DATE" : "HANG OUT"}</b><small>${escape(inviteInfo.kinds[kind].why)}</small></button>`)).join("")}
    </div>`,
    places = inviteInfo.places.filter((place2) => !(invite.kind === "date" && place2.hangOnly)),
    placesHtml = `
    <div class="mls-inv-lbl">WHERE</div>
    <div class="mls-inv-places">${places
      .map(
        (place2) => `
      <button class="mls-inv-place ${invite.place === place2.id ? "on" : ""}" data-do="invite-place" data-id="${place2.id}">
        <b>${escape(place2.name)}</b><small>${place2.open === 0 && place2.close === 24 ? "" : `${hourOf(place2.open)}\u2013${hourOf(place2.close)}`}</small>
        ${place2.tags.map(([tagText, tagCls]) => `<i class="${tagCls}">${escape(tagText)}</i>`).join("")}</button>`,
      )
      .join("")}</div>`,
    place = places.find((place2) => place2.id === invite.place);
  let whenHtml = "";
  if (place) {
    const dayIndex = inviteInfo.days.findIndex((day3) => day3.d === invite.day),
      day2 = inviteInfo.days[dayIndex] ?? inviteInfo.days[0],
      openHours = place.hours[Math.max(0, dayIndex)] ?? [];
    whenHtml = `
      <div class="mls-inv-lbl">WHEN</div>
      <div class="mls-inv-days">${inviteInfo.days.map((day3, index) => `<button class="${day3.d === day2.d ? "on" : ""} ${place.hours[index]?.length ? "" : "off"}" data-do="invite-day" data-id="${day3.d}" ${place.hours[index]?.length ? "" : "disabled"}><b>${day3.label}</b><small>${day3.n}</small></button>`).join("")}</div>
      <div class="mls-inv-hours">${
        openHours
          .map((hour) => {
            const theirs = day2.theirs[hour],
              yours = day2.yours[hour];
            return `<button class="${invite.hour === hour ? "on" : ""} ${theirs ? "busy" : ""} ${yours ? "yours" : ""}" data-do="invite-hour" data-id="${hour}"><b>${hourOf(hour)}</b>${theirs ? `<small>${escape(theirs.toUpperCase())}</small>` : yours ? `<small>${escape(yours.toUpperCase())}</small>` : ""}</button>`;
          })
          .join("") || '<span class="hint">Closed that day</span>'
      }</div>`;
  }
  const ready = place && invite.hour !== null && inviteInfo.days.some((day2) => day2.d === invite.day),
    day = inviteInfo.days.find((day2) => day2.d === invite.day),
    withIds = invite.with ?? [],
    groupHtml = inviteInfo.group?.length
      ? `
    <div class="mls-inv-lbl">WHO ELSE <small>up to ${inviteInfo.groupMax} of you \xB7 your partners with an agreement</small></div>
    <div class="mls-inv-who">
      ${inviteInfo.group
        .map((member) => {
          const on = withIds.includes(member.id),
            full = !on && withIds.length + 1 >= inviteInfo.groupMax,
            tense = member.mood === "tense" || member.mood === "rivals";
          return `<button class="mls-inv-pick ${on ? "on" : ""}" data-do="invite-with" data-id="${escape(member.id)}" ${full ? "disabled" : ""}>${newsFace(member)}<b>${escape(member.name)}</b><small class="${tense ? "warn" : ""}">${full ? `${inviteInfo.groupMax} already` : escape(`${WITH_MOOD[member.mood] ?? "with"} ${person.name}`)}</small></button>`;
        })
        .join("")}
    </div>`
      : "",
    pickUpHtml =
      !!inviteInfo.pickUp && !!place && inviteInfo.pickUp.places.includes(place.id)
        ? `
    <div class="mls-inv-lbl">HOW</div>
    <div class="mls-inv-kinds">
      <button class="${invite.pickUp ? "" : "on"}" data-do="invite-pickup" data-id="0"><b>MEET THERE</b></button>
      <button class="${invite.pickUp ? "on" : ""}" data-do="invite-pickup" data-id="1"><b>I'LL PICK YOU UP</b><small>${inviteInfo.pickUp.by === "car" ? "by car" : "on your motorbike"} \xB7 it starts better \xB7 you leave from ${escape(person.name)}'s</small></button>
    </div>`
        : "";
  return `<div class="mls-special-menu mls-invite">${head}
    ${S.error ? `<div class="mls-said bad">${escape(S.error)}</div>` : ""}
    ${groupHtml}${kindsHtml}${placesHtml}${whenHtml}${pickUpHtml}
    <div class="mls-inv-foot">
      <span>PLANS \xB7 ${inviteInfo.plans} OF ${inviteInfo.max}</span>
      <button class="main" data-do="invite-ask" data-character="${person.id}" ${ready ? "" : "disabled"}>${ready ? `ASK \xB7 ${invite.kind === "date" ? "DATE" : "HANG OUT"} \xB7 ${escape(place.name.toUpperCase())} \xB7 ${day.label} ${hourOf(invite.hour)}<small>${inviteInfo.minutes} min</small>` : "PICK A PLACE AND A TIME"}</button>
    </div></div>`;
}
function weddingDayView({ life: life, days: days, pick: pick, error = "" }) {
  const wedding = life?.wedding,
    list = days ?? [],
    picked = list.find((day) => day.d === pick);
  return `<div class="mls-settings">
    <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>YOUR WEDDING DAY</h1></div>
    <div class="mls-tab-body"><div class="box">
      <div class="mls-special-menu mls-invite">
        ${error ? `<div class="mls-said bad">${escape(error)}</div>` : ""}
        <div class="mls-inv-lbl">${escape((list[0]?.season ?? "").toUpperCase())} \xB7 NEXT SEASON <small>you and ${escape(wedding?.name ?? "them")} pick it together${list.some((day) => day.works) ? ` \xB7 ${escape(wedding?.name ?? "they")} works the days marked` : ""}</small></div>
        ${days === null ? '<p class="hint">\u2026</p>' : `<div class="mls-inv-days">${list.map((day) => `<button class="${day.d === pick ? "on" : ""}" data-do="wedding-day-pick" data-id="${day.d}"><b>${day.weekday}</b><small>${day.n}${day.works ? " \xB7 WORKS" : ""}</small></button>`).join("")}</div>`}
        <div class="mls-inv-foot"><span>ON BOTH CALENDARS</span>
          <button class="main" data-do="wedding-day-set" ${picked ? "" : "disabled"}>${picked ? `SET THE DATE \xB7 ${picked.weekday} ${picked.n} ${escape(picked.season.toUpperCase())}` : "PICK A DAY"}</button></div>
      </div></div></div></div>`;
}
const WITH_MOOD = {
  unmet: "has not met",
  none: "polite with",
  good: "gets along with",
  tense: "tension with",
  rivals: "rivals with",
  love: "in love with",
};
function inviteAnswerView(person, invite) {
  const answer = invite.answer,
    head =
      (answer.line
        ? `<div class="mls-inv-said">${frameFace(person)}<div><b>${escape(person.name.toUpperCase())}</b><p>\u201C${escape(answer.line)}\u201D</p></div></div>`
        : "") +
      (answer.group?.length
        ? `<div class="mls-pairs">${answer.group.map((member) => `<div class="mls-pair"><span class="faces">${newsFace(member)}</span><div><b>${escape(member.name)}</b>${member.why ? `<small>${escape(member.why)}</small>` : ""}</div><span class="mls-mood ${member.answer === "yes" ? "good" : "rivals"}">${member.answer === "yes" ? "YES" : "NO"}</span></div>`).join("")}</div>`
        : "");
  if (answer.answer === "yes" || answer.taken) {
    const plan = answer.plan;
    return `${head}
      <div class="mls-inv-stamp">ON YOUR CALENDAR<small>${escape(plan.kindName.toUpperCase())} \xB7 ${escape(plan.placeName.toUpperCase())} \xB7 ${escape(plan.when.toUpperCase())}</small></div>
      <div class="mls-inv-chips"><i>${plan.by === "them" ? "THEY PAY" : "YOU PAY"}</i>${plan.pickUp ? "<i>YOU PICK THEM UP</i>" : ""}${answer.yours ? `<i class="warn">${escape(answer.yours.toUpperCase())} THEN</i>` : ""}</div>
      <button class="mls-inv-done" data-do="invite-back" data-character="${person.id}">DONE</button>`;
  }
  return answer.answer === "counter"
    ? `${head}
    <div class="mls-inv-counter"><b>${escape(answer.counter.when.toUpperCase())} INSTEAD?</b>
      <div class="row"><button class="main" data-do="invite-counter" data-id="1" data-character="${person.id}">${escape(answer.counter.time)} IS FINE</button><button data-do="invite-counter" data-id="0" data-character="${person.id}">NOT THEN</button></div></div>`
    : `${head}
    <div class="mls-inv-no"><b>NOT THIS ONE</b><small>${escape(answer.why)}</small></div>
    <button class="mls-inv-done" data-do="invite-again">ANOTHER PLAN</button>`;
}
const frameFace = (person) =>
  `<span class="mls-inv-face" style="--c:${colourFor(person.id)}">${person.avatar ? frameImg(person) : escape((person.name ?? "?")[0])}</span>`;
const othersCost = (plan) =>
  plan.with?.length ? ` \xB7 \u22121 Friendship with ${plan.with.map((person) => person.name).join(", ")}` : "";
function specialDateRows(person, talk) {
  const special = person.special ?? {},
    inviteRow =
      special.invite?.ok === false
        ? greyRow("Invite them out", special.invite)
        : special.invite
          ? `<button class="mls-opt mls-inv-row" data-do="invite-open" data-character="${person.id}"><span class="n">Invite them out</span><span class="hours">${special.invite.minutes}m</span></button>`
          : "",
    plan = special.plan;
  if (!plan) {
    return inviteRow;
  }
  const cost = `${plan.day === S.life?.hud?.clock?.dayIndex ? `\u22123 Trust${plan.kind === "date" ? " \xB7 \u22122 Romance" : ""}` : "\u22121 Trust"}${othersCost(plan)}`,
    cancelRow = talk.cancelPlan
      ? `<div class="mls-special-confirm"><b>Cancel ${escape(plan.kindName)} \xB7 ${escape(plan.placeName)} \xB7 ${escape(plan.when)}?</b><small class="mls-inv-cost">${escape(cost)}</small>
        <div class="row"><button class="main" data-do="plan-cancel" data-id="${plan.id}">CANCEL IT</button><button data-do="special-cancel" data-character="${person.id}">KEEP IT</button></div></div>`
      : `<button class="mls-opt bad" data-do="plan-cancel-ask" data-character="${person.id}"><span class="n">Cancel our plan</span><span class="hours">${escape(plan.time)}</span><span class="d">${escape(plan.kindName)} \xB7 ${escape(plan.placeName)} \xB7 ${escape(plan.when)}</span></button>`;
  return inviteRow + cancelRow;
}
const inviteOpen = (characterId, prefill = null) =>
  act(async () => {
    S.talk[characterId] = {
      special: true,
      invite: true,
    };
    S.talkTo = characterId;
    const inviteInfo = (await call(`/lives/${S.life.id}/invite/${characterId}`)).invite,
      firstDay =
        inviteInfo.days.find(
          (day, dayIndex) => inviteInfo.places.find((place) => place.id === prefill?.place)?.hours[dayIndex]?.length,
        ) ??
        inviteInfo.days[1] ??
        inviteInfo.days[0];
    S.invite = {
      character: characterId,
      info: inviteInfo,
      kind:
        prefill?.kind && inviteInfo.kinds[prefill.kind]?.ok ? prefill.kind : inviteInfo.kinds.hang.ok ? "hang" : "date",
      place: prefill?.place ?? null,
      day: firstDay.d,
      hour: null,
      answer: null,
    };
  });
const inviteBack = (characterId) => {
  S.invite = null;
  S.talk[characterId] = {
    special: true,
  };
  S.error = "";
  notify();
};
const inviteAsk = (characterId) =>
  act(
    async () => {
      const invite = S.invite,
        pickUp = !!invite.pickUp && !!invite.info.pickUp?.places.includes(invite.place),
        res = await call(`/lives/${S.life.id}/invite`, {
          method: "POST",
          body: {
            character: characterId,
            kind: invite.kind,
            place: invite.place,
            day: invite.day,
            hour: invite.hour,
            with: invite.with ?? [],
            pickUp: pickUp,
          },
        });
      if (((S.life = res.life), res.invited?.fainted || res.invited?.cut)) {
        S.invite = null;
        reportEvents(res.events);
        return;
      }
      S.invite.answer = res.invited;
      reportEvents(res.events);
    },
    {
      loading: "They are answering\u2026",
      cancel: afterLifeCancel,
    },
  );
const inviteCounter = (characterId, take) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/invite/counter`, {
      method: "POST",
      body: {
        character: characterId,
        take: take,
      },
    });
    S.life = res.life;
    if (take && res.counter.plan) {
      S.invite.answer = {
        ...S.invite.answer,
        taken: true,
        plan: res.counter.plan,
        yours: res.counter.yours,
        group: res.counter.group ?? [],
      };
    } else {
      S.invite.answer = null;
      S.invite.hour = null;
    }
  });
const planCancel = (planId, { free = false } = {}) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/plans/cancel`, {
      method: "POST",
      body: {
        plan: planId,
        ...(free
          ? {
              free: free,
            }
          : {}),
      },
    });
    S.life = res.life;
    S.said = res.cancelled.text;
    for (const talkId of Object.keys(S.talk)) {
      if (S.talk[talkId]?.cancelPlan) {
        S.talk[talkId] = {
          special: true,
        };
      }
    }
    if (S.view === "contacts" && S.sheet) {
      S.sheet = (await call(`/lives/${S.life.id}/sheet/${S.sheet.id}`)).sheet;
      S.sheetSaid = {
        id: S.sheet.id,
        text: res.cancelled.text,
      };
    }
  });
function planStripView(life, { where = "map", bare = false } = {}) {
  const plans = (life.plansToday ?? []).filter((plan) => plan.big !== false);
  if (!plans.length) {
    return "";
  }
  const html = plans
      .map((plan) => {
        if (plan.party && plan.yours) {
          return `<div class="mls-plan"><b>YOUR PARTY TODAY \xB7 ${escape(plan.time)}</b><span>${plan.birthday ? "Your birthday \xB7 " : ""}At home</span></div>`;
        }
        if (plan.party) {
          return plan.canStart
            ? `<button class="mls-plan ready" data-do="party-join" data-id="${escape(plan.id)}"><b>${escape(plan.name.toUpperCase())}'S PARTY \xB7 ${plan.home ? "JOIN IN" : "GO IN"} \u25B8</b><span>${plan.birthday ? "Their birthday \xB7 " : ""}${escape(plan.placeName)}</span></button>`
            : plan.canWait
              ? `<button class="mls-plan" data-do="party-wait-theirs" data-id="${escape(plan.id)}"><b>WAIT FOR ${escape(plan.name.toUpperCase())}'S PARTY \xB7 ${escape(plan.time)} \u25B8</b><span>${escape(plan.placeName)}</span></button>`
              : `<div class="mls-plan"><b>${escape(plan.name.toUpperCase())}'S PARTY \xB7 ${escape(plan.time)}</b><span>${plan.birthday ? "Their birthday \xB7 " : ""}${escape(plan.placeName)}${plan.home ? "" : " \xB7 go to their door"}</span></div>`;
        }
        const names = escape([plan.name, ...(plan.with ?? []).map((guest) => guest.name)].join(" & ").toUpperCase()),
          kindLabel = plan.kind === "date" ? "DATE" : "HANG OUT";
        if (plan.canStart) {
          return `<button class="mls-plan ${plan.state === "late" ? "late" : "ready"}" data-do="outing-start" data-id="${plan.id}"><b>${plan.state === "late" ? `LATE \xB7 ${names} LEAVES AT ${escape(plan.leavesAt)}` : `${names} IS HERE`} \u25B8</b><span>${kindLabel} \xB7 ${escape(plan.placeName)}</span></button>`;
        }
        if (plan.canWait) {
          return `<button class="mls-plan" data-do="plan-wait" data-id="${plan.id}"><b>WAIT FOR ${names} \xB7 ${escape(plan.time)} \u25B8</b><span>${kindLabel} \xB7 ${escape(plan.placeName)}</span></button>`;
        }
        const pickUpLine =
          plan.pickUpBy && plan.state !== "late"
            ? `Pick ${plan.name} up \xB7 leave by ${plan.pickUpBy.leaveBy} \xB7 ${plan.placeName}`
            : "";
        return `<div class="mls-plan ${plan.state === "late" ? "late" : ""}"><b>${plan.state === "late" ? `${names} IS WAITING` : `${kindLabel} TODAY \xB7 ${escape(plan.time)}`}</b><span>${escape(plan.state === "late" ? `${plan.placeName} \xB7 leaves at ${plan.leavesAt}` : pickUpLine || `${plan.name} \xB7 ${plan.placeName} \xB7 on time until ${plan.onTimeUntil}`)}</span></div>`;
      })
      .join(""),
    errorHtml =
      typeof S < "u" && S.stuck?.plan && plans.some((plan) => plan.id === S.stuck.plan)
        ? sceneErr(S.error, S.stuck, {
            float: true,
          })
        : "";
  return bare ? errorHtml + html : `${errorHtml}<div class="mls-plan-strip ${where}">${html}</div>`;
}
function planTagsView(life) {
  const tags = (life.plansToday ?? []).filter((plan) => plan.big === false);
  return tags.length
    ? `<div class="mls-plan-tags">${tags
        .map((plan) => {
          const names = [plan.name, ...(plan.with ?? []).map((guest) => guest.name)].join(" & "),
            label = plan.party
              ? plan.yours
                ? "Your party"
                : `${plan.name}'s party`
              : plan.pickUpBy
                ? `Pick ${names} up`
                : `${plan.kind === "date" ? "Date" : "Hang out"} with ${names}`;
          return `<span class="mls-plan-tag ${plan.kind === "date" ? "date" : ""}">${escape(label)} \xB7 ${escape(plan.placeName)} \xB7 <b>${escape(plan.time)}</b></span>`;
        })
        .join("")}</div>`
    : "";
}
const planWait = (planId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/plans/wait`, {
      method: "POST",
      body: {
        plan: planId,
      },
    });
    S.life = res.life;
    reportEvents(res.events);
  }).then(() => {
    const plan = (S.life?.plansToday ?? []).find((candidate) => candidate.id === planId && candidate.canStart);
    if (plan && !S.life.outing) {
      return outingStart(plan.id);
    }
  });
const outingStart = (planId) =>
  act(
    async (signal) => {
      const res = await call(`/lives/${S.life.id}/outing/start`, {
        method: "POST",
        body: {
          plan: planId,
        },
        signal: signal,
      });
      S.life = res.life;
      S.outSeg = 0;
      S.talkTo = null;
      S.talk = {};
      S.said = "";
      S.outWhere = null;
      S.view = "outing";
      reportEvents(res.events);
    },
    {
      loading: "Meeting them\u2026",
      cancel: afterLifeCancel,
      stuck: {
        plan: planId,
        again: () => outingStart(planId),
        skip: () =>
          planCancel(planId, {
            free: true,
          }),
        skipLabel: "CANCEL IT",
        note: "The plan still stands.",
      },
    },
  );
const outingReread = (prevOuting, nextOuting) => {
  if (
    nextOuting &&
    JSON.stringify(outingLines(nextOuting)) !== JSON.stringify(prevOuting ? outingLines(prevOuting) : null)
  ) {
    S.outSeg = 0;
  }
};
const CLOSES = ["goodbye", "end", "interrupt"];
const outingPost = (action, body = {}, { lines = false, loading = "" } = {}) =>
  act(
    async (signal) => {
      const prevOuting = S.life.outing,
        res = await call(`/lives/${S.life.id}/outing/${action}`, {
          method: "POST",
          body: body,
          signal: signal,
        });
      S.life = res.life;
      if (lines) {
        outingReread(prevOuting, S.life.outing);
      }
      reportEvents(res.events);
    },
    {
      ...(loading
        ? {
            loading: loading,
            cancel: afterLifeCancel,
          }
        : {}),
      ...(CLOSES.includes(action) ||
      (["say", "act"].includes(action) && ["wedding", "honeymoon"].includes(S.life?.outing?.kind)) ||
      (action === "act" && (S.life?.outing?.moment?.pay || S.life?.outing?.ending))
        ? {
            stuck: {
              again: () =>
                outingPost(action, body, {
                  lines: lines,
                  loading: loading,
                }),
              skip: () =>
                outingPost(
                  action,
                  {
                    ...body,
                    noLines: true,
                  },
                  {
                    lines: lines,
                    loading: loading,
                  },
                ),
            },
          }
        : {}),
    },
  );
const outingClose = ({ noLines = false } = {}) =>
  act(
    async () => {
      const res = await call(`/lives/${S.life.id}/outing/close`, {
        method: "POST",
        body: noLines
          ? {
              noLines: noLines,
            }
          : {},
      });
      if (((S.life = res.life), res.morning && S.life.scene)) {
        S.view = "scene";
        S.sceneSeg = 0;
        S.sceneLog = false;
        S.outSeg = 0;
        reportEvents(res.events);
        return;
      }
      if (S.life.outing) {
        S.view = "outing";
      } else if (S.life.hud?.place?.residence) {
        S.view = "corridor";
        S.corridor = S.life.at;
      } else {
        S.view = "place";
      }
      S.outSeg = 0;
      reportEvents(res.events);
      if (res.milestone) {
        S.afterOuting = {
          character: res.character,
          milestone: res.milestone,
          how: res.how ?? null,
        };
      }
      if (S.faintAfterScene) {
        S.faint = S.faintAfterScene;
        S.faintAfterScene = null;
      }
    },
    S.life?.outing?.kind === "wedding"
      ? {
          loading: "The morning after\u2026",
          cancel: afterLifeCancel,
          stuck: {
            again: () => outingClose(),
            skip: () =>
              outingClose({
                noLines: true,
              }),
          },
        }
      : {},
  ).then(() => {
    const after = S.afterOuting;
    if (((S.afterOuting = null), after && S.life && !S.life.outing)) {
      return startScene(after.character, "milestone", after.milestone, null, null, after.how);
    }
  });
const outingNight = (choice) =>
  act(async () => {
    const prevOuting = S.life.outing,
      res = await call(`/lives/${S.life.id}/outing/night`, {
        method: "POST",
        body: {
          choice: choice,
        },
      });
    S.life = res.life;
    outingReread(prevOuting, S.life.outing);
    reportEvents(res.events);
    if (res.milestone) {
      S.afterOuting = {
        character: res.character,
        milestone: res.milestone,
        how: res.how ?? null,
      };
    }
  }).then(() => {
    const after = S.afterOuting;
    if (((S.afterOuting = null), after && S.life)) {
      return startScene(after.character, "milestone", after.milestone, null, null, after.how);
    }
  });
const nightCall = (choices) =>
  `<div class="speaker gold">TONIGHT</div><div class="mls-decide">${choices
    .map(
      (choice) => `
  <button class="mls-choice ${choice.id === "wait" ? "wait" : "step"}" data-do="out-night" data-id="${escape(choice.id)}" ${S.busy ? "disabled" : ""}><span class="ico">${choice.id === "wait" ? "\u2026" : "\u2197"}</span><b>${escape(choice.label)}</b>${choice.note ? `<small>${escape(choice.note)}</small>` : ""}</button>`,
    )
    .join("")}</div>`;
function outingHeld(outing, seg) {
  const lastPic = (outing?.pictures ?? []).at(-1);
  return (
    !!lastPic &&
    !lastPic.url &&
    (lastPic.status === "queued" || lastPic.status === "painting") &&
    seg < outingLines(outing).length
  );
}
const outingLines = (outing) =>
  outing.phase === "interrupt" && outing.interrupt
    ? [...(outing.batch ?? []), ...outing.interrupt.lines]
    : (outing.batch ?? []);
const speakerOf = (outing, who, byId = null) =>
  who === "narration"
    ? null
    : byId
      ? ([...(outing.group ?? []), ...(outing.guests ?? [])].find((person) => person.id === byId)?.name ?? outing.name)
      : who === "them" || who === outing.characterId
        ? outing.name
        : outing.interrupt?.id === who
          ? outing.interrupt.name
          : outing.name;
function outingScreen({ life: life, seg = 0, error = "", stuck = null }) {
  const outing = life.outing;
  if (!outing) {
    return "";
  }
  const backdropUrl =
      life.backdrop?.places?.[outing.place] ??
      (outing.place === "home" || outing.place === "their" ? life.backdrop?.here : null),
    look = MAP[outing.place] ??
      STORE_LOOK[outing.place] ??
      TRIP_LOOK[outing.trip] ?? {
        bg: "linear-gradient(160deg,#54708e,#222d3a)",
      },
    lines = outingLines(outing),
    reading = seg < lines.length,
    pictures = outing.pictures ?? [],
    shownPic = [...pictures].reverse().find((pic) => pic.url) ?? null,
    painting = pictures.some((pic) => pic.status === "queued" || pic.status === "painting"),
    keyed = pictures.length > 0,
    hideText = keyed && !!S.sceneHide;
  let box = "";
  const chips = didStrip([
      ...(outing.result
        ? (outing.result.chips ?? []).map((chip) => ({
            text: chip.text,
            bad: chip.bad,
            step: chip.found,
          }))
        : outing.exchange === 0
          ? [
              ...(outing.late
                ? [
                    {
                      text: `${outing.late} MIN LATE`,
                      bad: true,
                    },
                  ]
                : []),
              ...(outing.seenBy?.length
                ? [
                    {
                      text: `\u{1F441} ${outing.seenBy.join(", ").toUpperCase()} SAW YOU TWO`,
                      seen: true,
                    },
                  ]
                : []),
            ]
          : []),
      ...hereTags(outing.here),
    ]),
    pleaOpen = life.plea?.open?.where === "outing";
  if (reading && outingHeld(outing, seg)) {
    box =
      '<div class="speaker none">\xB7</div><div class="mls-held"><span class="spin"></span>PAINTING THE MOMENT\u2026</div>';
  } else if (reading) {
    const line2 = lines[seg],
      speaker = speakerOf(outing, line2.who, line2.by);
    box = `${seg === 0 ? chips : ""}<div class="speaker ${speaker ? "" : "none"}">${speaker ? escape(speaker.toUpperCase()) : "\xB7"}</div>
      <div class="text ${speaker ? "" : "narration"}">${escape(line2.text)}</div><div class="next">\u25BC</div>`;
  } else if (outing.night?.length && outing.phase === "talk") {
    box = nightCall(outing.night);
  } else if (pleaOpen && (outing.phase === "talk" || (outing.phase === "moment" && outing.moment))) {
    box = pleaCall(life.plea.open, {
      free: "none",
    });
  } else if (outing.phase === "talk") {
    box = `<div class="speaker you">YOUR TURN</div>
      <div class="mls-turn">
        <div class="label">${outing.suggestions?.length ? "SUGGESTED REPLIES \xB7 or write your own" : "NO SUGGESTIONS THIS TIME \xB7 write your own"}</div>
        ${(outing.suggestions ?? []).map((sug) => `<button class="mls-sug" data-do="out-say" data-text="${escape(sug)}">${escape(sug)}</button>`).join("")}
        <div class="free"><input type="text" data-do="out-say-free" maxlength="400" placeholder="Say or do something\u2026"><button data-do="out-say-send">SEND</button></div>
      </div>`;
  } else if (outing.phase === "moment" && outing.moment) {
    box = momentCall(outing);
  } else if (outing.phase === "interrupt" && outing.interrupt?.phase === "call" && outing.interrupt.kind === "guest") {
    const guestName = escape(outing.interrupt.name),
      partnerName = escape(outing.name);
    box = `<div class="speaker gold">YOUR CALL</div>
      <div class="mls-decide">
        <button class="mls-choice step" data-do="out-interrupt" data-id="walk"><span class="ico">\u2197</span><b>Keep it short and walk away</b><small>${guestName.toUpperCase()} \u22122 FRIENDSHIP \xB7 THE NIGHT \u22125</small></button>
        <button class="mls-choice step" data-do="out-interrupt" data-id="tell"><span class="ico">\u2197</span><b>Go tell ${partnerName} yourself</b><small>${partnerName.toUpperCase()} +2 TRUST \xB7 THE NIGHT \u221210</small></button>
        <button class="mls-choice step" data-do="out-interrupt" data-id="stay"><span class="ico">\u2197</span><b>Let ${guestName} talk</b><small>${partnerName.toUpperCase()} MAY NOTICE \xB7 55% \xB7 TRUST \u22128 IF SO</small></button>
      </div>`;
  } else if (outing.phase === "interrupt" && outing.interrupt?.phase === "call") {
    box = `<div class="speaker gold">YOUR CALL</div>
      <div class="mls-decide">
        <button class="mls-choice step" data-do="out-interrupt" data-id="go"><span class="ico">\u2197</span><b>Go after ${escape(outing.interrupt.name)}</b></button>
        <button class="mls-choice step" data-do="out-interrupt" data-id="stay"><span class="ico">\u2197</span><b>Stay with ${escape(outing.name)}</b></button>
        <button class="mls-choice step" data-do="out-interrupt" data-id="lie"><span class="ico">\u2197</span><b>\xABIt's not what it looks like\xBB</b></button>
      </div>`;
  } else if (outing.phase === "goodbye") {
    const leaving = outing.leaving && !["wedding", "honeymoon"].includes(outing.kind),
      options = outing.goodbye ?? [],
      ask = options.find((opt) => opt.ask)?.ask ?? "",
      under = !ask && S.outWhere && options.some((opt) => opt.under === S.outWhere) ? S.outWhere : null,
      shown = ask
        ? options
        : under
          ? options.filter((opt) => opt.under === under)
          : options.filter((opt) => !opt.under),
      button = (opt) =>
        `<button class="mls-choice ${opt.ok ? "step" : "off"}" ${opt.opens ? `data-do="out-where" data-id="${escape(opt.opens)}"` : `data-do="out-bye" data-id="${escape(opt.id)}"`} ${opt.ok ? "" : "disabled"}><span class="ico">${opt.milestone || opt.opens ? "\u2605" : opt.chips?.some((chip) => chip.bad) ? "\u2026" : opt.ok ? "\u2197" : "\xB7"}</span><b>${escape(opt.label)}</b>${opt.ok ? (opt.note ? `<small>${escape(opt.note)}</small>` : "") : `<small>${escape(opt.why)}</small>`}${opt.ok && opt.chips ? callChips(opt.chips) : ""}</button>`;
    box = `<div class="speaker gold">${ask ? escape(ask) : under ? "SAYING GOODBYE \xB7 WHERE?" : "SAYING GOODBYE"}</div>
      <div class="mls-decide">${outing.closing && !leaving ? `<div class="lbl">${escape(outing.placeName.toUpperCase())} IS CLOSING \xB7 AT THE DOOR</div>` : ""}${leaving ? `<button class="mls-choice step" data-do="out-bye" data-id="left"><span class="ico">\u2197</span><b>${escape(outing.name)} has to go</b></button>` : `${shown.map(button).join("")}${under ? '<button class="mls-choice step" data-do="out-where" data-id=""><span class="ico"></span><b>\u25C2 Back</b></button>' : ""}`}</div>`;
  } else if (outing.phase === "summary") {
    box = outingSummary(outing);
  }
  const moodRow = (
      id,
      personName,
      mood,
    ) => `<div class="mls-out-row" style="--c:${colourFor(id)}"><div class="name">${escape(personName.toUpperCase())}</div>
      <div class="mls-out-meter ${mood.kind}"><i style="width:${Math.max(3, Math.min(100, mood.value))}%"></i><b>${escape(mood.name)}</b></div></div>`,
    bondLine2 = (key, label) => {
      const total = outing.totals?.[key] ?? 0;
      return `<div class="mls-bondrow ${total > 0 ? "up" : total < 0 ? "down" : ""}"><span class="label">${label}</span>
      <span class="num">${total ? `<span class="delta">${total > 0 ? "+" : ""}${Math.round(total * 10) / 10}</span>` : ""}</span>
      <span class="bar"><i style="width:${Math.max(0, Math.min(100, outing.bond?.[key]?.value ?? 0))}%"></i></span><span class="tier">${escape(outing.bond?.[key]?.name ?? "\u2014")}</span></div>`;
    },
    moodBar = `<div class="mls-bondrow mood ${outing.mood.kind}"><span class="label">${escape(outing.meterName ?? outing.kindName)}</span><span class="num"></span>
      <span class="bar"><i style="width:${Math.max(3, Math.min(100, outing.mood.value))}%"></i></span><span class="tier">${escape(outing.mood.name)}</span></div>`,
    bonds = outing.group?.length
      ? `<div class="bonds mls-out-mood group">${moodRow(outing.characterId, outing.name, outing.mood)}${outing.group.map((member) => moodRow(member.id, member.name, member.mood)).join("")}
      ${
        outing.bond
          ? othersBonds([
              {
                id: outing.characterId,
                name: outing.name,
                bond: outing.bond,
                totals: outing.totals,
              },
              ...(outing.others ?? []),
            ])
          : ""
      }</div>`
      : `
    <div class="bonds" style="--c:${colourFor(outing.characterId)}">
      <div class="name">${escape(outing.name.toUpperCase())}</div>
      ${outing.bond ? `${bondLine2("friendship", "Friendship")}${bondLine2("romance", "Romance")}${bondLine2("trust", "Trust")}` : ""}
      ${outing.read ? `<div class="mls-read">They took it as <b class="${BAD_READS.has(outing.read) ? "bad" : ""}">${escape(READ_WORDS[outing.read] ?? outing.read)}</b></div>` : ""}
      ${moodBar}
      ${othersBonds(outing.others)}
    </div>`,
    exchangeText = `Exchange ${Math.min((outing.exchange ?? 0) + 1, outing.max)} of up to ${outing.max}`,
    whenBox = `
    <div class="when mls-out-when">
      <div class="kind">${escape(outing.placeName)} \xB7 ${escape(outing.kindName)}</div>
      <div class="time">${escape(outing.time)}</div>
      <div class="left">${outing.phase === "summary" ? "Over" : outing.leftText ? escape(outing.leftText) : `${outing.minutesLeft} min left`}</div>
      <div class="track"><i style="width:${Math.min(100, Math.round(((outing.exchange ?? 0) / outing.max) * 100))}%"></i></div>
      ${outing.phase === "summary" ? "" : `<div class="count">${exchangeText}</div>`}
    </div>`,
    canEnd =
      !outing.noEnd &&
      !outing.ending &&
      !reading &&
      !pleaOpen &&
      (outing.phase === "talk" || (outing.phase === "moment" && !outing.moment?.pay)) &&
      !outing.leaving &&
      !outing.closing,
    line = reading ? lines[seg] : null,
    multi = !!outing.group?.length || !!second0(outing),
    litClass = (id) =>
      !multi || !line || line.who === "narration"
        ? ""
        : (line.by ?? (line.who === "them" ? outing.characterId : line.who)) === id
          ? "lit"
          : "dim",
    sideSprites = second0(outing)
      ? `<div class="sprite framed second ${litClass(outing.interrupt.id)}" style="--c:${colourFor(outing.interrupt.id)}">${frameImg(outing.interrupt)}</div>`
      : (outing.group ?? [])
          .slice(0, 3)
          .map(
            (member, idx) =>
              `<div class="sprite framed second x${idx} ${litClass(member.id)}" style="--c:${colourFor(member.id)}">${frameImg(member)}</div>`,
          )
          .join("");
  return `
    <div class="mls-scene mls-outing ${keyed ? "keyed" : ""} ${hideText ? "hide-text" : ""} ${S.sceneBonds ? "show-bonds" : ""}" style="--bg:${look.bg}" ${hideText ? 'data-do="scene-hide"' : ""}>
      ${outing.group?.length ? "" : `<button class="mls-bonds-toggle" data-do="scene-bonds">${S.sceneBonds ? "\u2715 BONDS" : "\u2665 BONDS"}</button>`}
      ${hereStrip(outing.here, life)}
      <div class="backdrop ${(keyed ? (shownPic?.url ?? backdropUrl) : backdropUrl) ? "has-pic" : ""} ${keyed ? `key${shownPic ? "" : " waiting"}` : ""}" ${(keyed ? (shownPic?.url ?? backdropUrl) : backdropUrl) ? `style="background-image:url('${escape(keyed ? (shownPic?.url ?? backdropUrl) : backdropUrl)}')"` : ""}></div>
      ${
        keyed && !shownPic && !(painting && reading && outingHeld(outing, seg))
          ? `<div class="mls-key-wait">${
              painting
                ? `<span class="spin"></span>PAINTING THE MOMENT\u2026<small>it goes on when it's ready</small>`
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
      ${keyed && shownPic ? keyTools(shownPic, hideText) : ""}
      ${keyed ? "" : `<div class="sprite framed ${litClass(outing.characterId)}" style="--c:${colourFor(outing.characterId)}">${frameImg(outing)}</div>`}
      ${keyed ? "" : sideSprites}
      ${whenBox}
      ${bonds}
      ${sceneErr(error, stuck)}
      <div class="box ${!reading && ["goodbye", "summary", "moment", "interrupt"].includes(outing.phase) ? "gold" : ""}" ${reading ? 'data-do="out-next"' : ""}>
        ${canEnd ? '<button class="end" data-do="out-end">END SCENE</button>' : ""}
        ${
          outing.phase === "summary"
            ? ""
            : `<div class="controls">
          <button class="${S.sceneAuto ? "on" : ""}" data-do="scene-auto">AUTO</button>
          <button data-do="scene-skip" ${reading ? "" : "disabled"}>SKIP</button>
          <button data-do="scene-log">LOG</button>
        </div>`
        }
        ${box}
      </div>
      ${
        S.sceneLog
          ? sceneLog(
              {
                log: outing.log ?? [],
              },
              outing.name,
            )
          : ""
      }
    </div>`;
}
function momentCall(outing) {
  const moment = outing.moment;
  if (moment.cook) {
    return `<div class="speaker gold">${escape(moment.name.toUpperCase())}</div>
    <div class="mls-decide">
      <div class="lbl">WHAT DO YOU MAKE?</div>
      <button class="mls-choice step" data-do="out-kitchen" ${S.busy ? "disabled" : ""}><span class="ico">\u{1F373}</span><b>Go to the kitchen</b></button>
    </div>`;
  }
  const label = moment.pay
    ? `${outing.yourBirthday ? "IT'S YOUR BIRTHDAY" : outing.by === "you" ? "YOU ASKED THEM OUT" : `${escape(outing.name.toUpperCase())} ASKED YOU OUT`} \xB7 WHO PAYS?`
    : moment.served
      ? `${escape(outing.name.toUpperCase())} MADE ${escape(moment.served.name.toUpperCase())} ${escape(moment.served.icon ?? "")} \xB7 WHAT DO YOU DO?`
      : "WHAT DO YOU DO?";
  return `<div class="speaker gold">${escape(moment.name.toUpperCase())}</div>
    <div class="mls-decide">
      <div class="lbl">${label}</div>
      ${moment.options
        .map(
          (opt) =>
            `<button class="mls-choice step" data-do="out-act" data-id="${escape(opt.id)}" ${S.busy ? "disabled" : ""}><span class="ico">\u2197</span><b>${escape(opt.label)}</b>${
              opt.roll
                ? callChips([
                    {
                      text: opt.roll === "luck" ? "LUCK \xB7 50%" : `${opt.roll.toUpperCase()} ${opt.chance}%`,
                      roll: true,
                    },
                  ])
                : ""
            }</button>`,
        )
        .join("")}
    </div>
    ${moment.pay ? "" : '<div class="mls-turn"><div class="free"><input type="text" data-do="out-free" maxlength="400" placeholder="Or say what you do\u2026"><button data-do="out-send">SEND</button></div></div>'}`;
}
const second0 = (outing) => (outing.interrupt && outing.phase === "interrupt" ? outing.interrupt : null);
function outingSummary(outing) {
  const summary = outing.summary ?? {},
    totals = summary.totals ?? {},
    good = outing.mood.value >= 62 && !summary.ruined && !summary.left,
    headline = summary.fainted
      ? "Everything goes dark."
      : summary.ruined
        ? `You leave ${outing.name} there.`
        : summary.left
          ? `${outing.name} left early.`
          : outing.mood.value >= 80
            ? "A really good time."
            : good
              ? "A good time."
              : "It could have gone better.",
    stat = (label, value, cap = "") =>
      value || cap
        ? `<div class="stat ${value > 0 ? "gain" : value < 0 ? "loss" : ""} ${cap ? "capped" : ""}"><small>${label}</small><b>${value > 0 ? "+" : ""}${value ?? 0}</b>${cap ? `<em>${escape(CAP_WHY[cap] ?? "")}</em>` : ""}</div>`
        : "",
    limits = summary.limits ?? {},
    backLabel = summary.fainted
      ? "WAKE UP"
      : summary.married
        ? "HOME TOGETHER"
        : summary.home
          ? "BACK HOME"
          : summary.milestone
            ? `\u2605 ${escape(outing.goodbye?.find((opt) => opt.milestone === summary.milestone)?.label ?? "WHAT COMES NEXT")}`
            : summary.walkedTo
              ? `ON TO ${escape(summary.walkedTo.toUpperCase())}`
              : `BACK TO ${escape(outing.placeName.toUpperCase())}`;
  return `
    ${summary.married ? '<div class="mls-stamp"><div class="big">MARRIED</div></div>' : summary.ruined ? '<div class="mls-stamp bad"><div class="big">RUINED</div></div>' : summary.dream ? '<div class="mls-stamp"><div class="big">THEIR DREAM DATE</div></div>' : summary.fainted ? "" : `<div class="mls-stamp ${good ? "" : "bad"}"><div class="up">${escape((outing.meterName ?? outing.kindName).toUpperCase())}</div><div class="big">${escape(outing.mood.name)}</div></div>`}
    <div class="speaker ${good ? "gold" : ""}">${escape(outing.kindName.toUpperCase())} \xB7 OVER</div>
    <div class="mls-summary">
      <h3>${escape(headline)}</h3>${outing.kissSeenBy?.length ? `<span class="mls-seen">\u{1F441} ${escape(outing.kissSeenBy.join(", ").toUpperCase())} SAW THE KISS</span>` : ""}${leftLine(summary.unanswered)}
      <div class="mls-sum-stats">
        <div class="stat"><small>TIME</small><b>${Math.floor((summary.minutes ?? 0) / 60)} h ${(summary.minutes ?? 0) % 60} min</b></div>
        ${stat("FRIENDSHIP", totals.friendship, limits.friendship)}${stat("ROMANCE", totals.romance, limits.romance)}${stat("TRUST", totals.trust, limits.trust)}
        ${summary.spent ? `<div class="stat"><small>PAID</small><b>$${summary.spent}</b></div>` : ""}
        ${summary.covered ? `<div class="stat"><small>THEY PAID</small><b>$${summary.covered}</b></div>` : ""}
      </div>
      ${summary.found?.length ? `<div class="mls-out-found"><b>FOUND OUT</b>${summary.found.map((item) => `<i class="${item.verdict === "disliked" ? "bad" : ""}">${item.verdict === "liked" ? "\u2665" : "\u2715"} ${escape(item.value.toUpperCase())}</i>`).join("")}</div>` : ""}
      ${summary.guests?.length ? `<div class="mls-pairs">${summary.guests.map((guest) => `<div class="mls-pair"><span class="faces">${newsFace(guest)}</span><div><b>${escape(guest.name)}</b></div><span class="mls-mood ${guest.tag === "LEFT EARLY" ? "rivals" : "good"}">${escape(guest.tag)}</span></div>`).join("")}</div>` : ""}
      ${summary.remember ? `<blockquote class="mls-memory" style="--c:${colourFor(outing.characterId)}"><small>WHAT ${escape(outing.name.toUpperCase())} WILL REMEMBER</small>\u201C${escape(summary.remember)}\u201D</blockquote>` : ""}
      <button class="mls-scene-back" data-do="out-close">${backLabel} \u25B8</button>
    </div>`;
}

export {
  housePartyPanel,
  hpSend,
  inviteAsk,
  inviteBack,
  inviteCounter,
  inviteOpen,
  invitePanel,
  openHouseParty,
  othersCost,
  outingClose,
  outingHeld,
  outingLines,
  outingNight,
  outingPost,
  outingReread,
  outingScreen,
  outingStart,
  partyOverView,
  partyRunView,
  partyStep,
  partyStripView,
  planCancel,
  planStripView,
  planTagsView,
  planWait,
  sleepoverCardOf,
  specialDateRows,
  theirPartyOverView,
  weddingDayView,
};
