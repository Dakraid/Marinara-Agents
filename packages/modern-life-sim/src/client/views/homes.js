// Bills, wedding, homes, notices, eviction views and actions
import { escape, frameImg } from "./common.js";
import { newsFace } from "./people.js";
import { personOf } from "./career.js";
import { S, act, call, notify } from "../state.js";
import { goTo } from "../actions/town.js";

const dropAccepts = (zone, pile) => (zone === "bag" ? pile.list !== "bag" : pile.list === "bag" && zone === pile.home);
const DROP_WHY_NOT = {
  fridge: "it's not food: it goes on the shelf",
  shelf: "food goes in the fridge",
};
const usd = (amount) => `$${Math.round(amount ?? 0).toLocaleString("en-US")}`;
const billPickOf = (bill, cash) =>
  Math.max(0, Math.min(S.billPick?.[bill.id] ?? Math.min(bill.amount, 100), bill.amount));
function billsAppView({ life: life, said = "", error = "" }) {
  const bills = life?.bills ?? {
      cash: 0,
      list: [],
    },
    townName = (life?.townName || "Town").toUpperCase(),
    billCard = (bill) => {
      const pick = billPickOf(bill, bills.cash),
        most = Math.min(bill.amount, bills.cash),
        pic =
          bill.kind === "loan"
            ? `<span class="f">${frameImg(personOf(bill.characterId, bill.name))}</span>`
            : ({
                rent: "\u{1F3E2}",
                mortgage: "\u{1F3E6}",
                upkeep: "\u{1F3E0}",
                parking: "\u{1F697}",
                fine: "\u{1F4E2}",
              }[bill.kind] ?? "\u{1F3E5}");
      return `<div class="mls-home mls-bill" style="--c:${bill.kind === "rent" ? "var(--red)" : bill.kind === "loan" ? "#2bb3a3" : "#5c7a86"}">
      <div class="pic">${pic}</div>
      <div><h3>${escape(bill.name.toUpperCase())}</h3>
        <div class="sub">${escape(bill.what)}</div>
        <div class="sum"><span>You owe</span><b>${usd(bill.amount)}</b>${bill.due ? `<span>${bill.kind === "loan" ? "Pay back by" : bill.kind === "rent" ? "Still owing on" : "Pay by"}</span><b class="${bill.hard ? "hard" : ""}">${escape(bill.due)}</b>` : ""}</div>
        <div class="mls-bill-pick">
          <button data-do="bill-less" data-id="${escape(bill.id)}" ${pick <= 10 ? "disabled" : ""}>\u2212$50</button>
          <b>${usd(pick)}</b>
          <button data-do="bill-more" data-id="${escape(bill.id)}" ${pick >= most ? "disabled" : ""}>+$50</button>
          <button data-do="bill-all" data-id="${escape(bill.id)}" ${most <= 0 ? "disabled" : ""}>${most >= bill.amount ? "ALL" : "ALL I HAVE"}</button>
        </div>
        <button class="move" data-do="bill-pay" data-id="${escape(bill.id)}" ${pick > 0 && pick <= bills.cash && !S.busy ? "" : "disabled"}>${pick > bills.cash ? `YOU HAVE ${usd(bills.cash)}` : `PAY ${usd(pick)} \u25B8`}</button>
      </div></div>`;
    };
  return `<div class="mls-settings mls-portal mls-homes mls-bills">
    <div class="mls-portal-bar">
      <button class="mls-back flat" data-do="map">\u25C2 MAP</button>
      <span class="brand">${escape(townName)}<b>BILLS</b></span>
      <span class="search">CASH <b>${usd(bills.cash)}</b></span>
    </div>
    ${error || said ? `<div class="mls-said ${error ? "bad" : ""} mls-portal-said">${escape(error || said)}</div>` : ""}
    <div class="mls-homes-list">${bills.list.map(billCard).join("")}${owedToYou(bills.owedToYou ?? [])}${householdIncome(bills.household)}</div></div>`;
}
function householdIncome(household) {
  const list = household?.list ?? [];
  return list.length || household?.ubi
    ? `<div class="mls-bills-owed">HOUSEHOLD INCOME</div>${list
        .map(
          (member) => `
    <div class="mls-home mls-bill theirs"><div class="pic"><span class="f">${frameImg(personOf(member.characterId, member.name))}</span></div>
      <div><h3>${escape(member.name.toUpperCase())}</h3><div class="sub">${escape(member.title || "Works")} \xB7 lives with you</div>
        <div class="sum"><span>Pay a shift</span><b>${usd(member.pay)}</b><span>A week</span><b>${usd(member.pay * member.days)}</b></div>
        <div class="note">Paid into your cash at the end of each day they work.</div></div></div>`,
        )
        .join(
          "",
        )}${household.ubi ? `<div class="mls-home mls-bill theirs"><div class="pic">\u{1F4B5}</div><div><h3>BASIC INCOME</h3><div class="sub">${usd(household.ubi)} on day 1 of each season</div></div></div>` : ""}`
    : "";
}
function owedToYou(loans) {
  return loans.length
    ? `<div class="mls-bills-owed">OWED TO YOU</div>${loans
        .map(
          (loan) => `
    <div class="mls-home mls-bill theirs"><div class="pic"><span class="f">${frameImg(personOf(loan.characterId, loan.name))}</span></div>
      <div><h3>${escape(loan.name.toUpperCase())}</h3><div class="sub">Lent ${escape(loan.lent)}${loan.for ? ` \xB7 ${escape(loan.for)}` : ""}</div>
        <div class="sum"><span>Owes you</span><b>${usd(loan.amount)}</b><span>You can ask for it</span><b class="${loan.can ? "" : "soon"}">${loan.can ? "now" : loan.away ? "when they're back" : `from ${escape(loan.from)}`}</b></div>
        <div class="note">In their SPECIAL ACTIONS, or in your own words in any scene.</div></div></div>`,
        )
        .join("")}`
    : "";
}
const WEDDING_ICON = {
  park: "\u{1F333}",
  restaurant: "\u{1F377}",
  hall: "\u{1F3DB}",
  music: "\u{1F3BB}",
  photos: "\u{1F4F7}",
  cake: "\u{1F382}",
  flowers: "\u{1F490}",
  beach: "\u{1F3D6}",
  mountains: "\u{1F3D4}",
  city: "\u{1F306}",
};
function weddingAppView({ w: wedding, tab = "plan", said = "", error = "" }) {
  const header = (wedding2) => `<div class="mls-portal-bar">
      <button class="mls-back flat" data-do="map">\u25C2 MAP</button>
      <span class="brand">${escape((wedding2?.name ?? "").toUpperCase())} &amp; YOU<b>WEDDING</b></span>
      <span class="search">${wedding2?.when ? `${escape(wedding2.when.toUpperCase())} \xB7 <b>${wedding2.daysLeft} DAYS</b>` : "<b>PICK THE DAY</b>"}</span>
    </div>`;
  if (!wedding) {
    return `<div class="mls-settings mls-portal mls-homes mls-bills">${header(null)}<p class="hint">\u2026</p></div>`;
  }
  const card = ({
      icon: icon,
      title: title,
      tag = "",
      sub = "",
      sum = "",
      note = "",
      button = "",
      now = false,
      c: colour = "#b0356b",
    }) => `
    <div class="mls-home ${now ? "now" : ""}" style="--c:${now ? "var(--yellow)" : colour}"><div class="pic">${icon}</div>
      <div><h3>${escape(title.toUpperCase())}${tag ? `<span class="tag">${escape(tag)}</span>` : ""}</h3>${sub ? `<div class="sub">${escape(sub)}</div>` : ""}${sum}${note ? `<div class="note">${note}</div>` : ""}${button}</div></div>`,
    section = (text) => `<div class="mls-bills-owed">${escape(text)}</div>`,
    costRow = (label, price, yours) =>
      `<div class="sum"><span>${label}</span><b>${usd(price)}</b><span>Your part</span><b>${usd(yours)}</b></div>`,
    chooseButton = (what, id, chosen, label) =>
      `<button class="move" data-do="wedding-choose" data-what="${what}" data-id="${id}" ${S.busy ? "disabled" : ""}>${chosen ? "TAKE IT BACK" : label} \u25B8</button>`,
    tabs = `<div class="mls-inv-kinds" style="padding:0 16px"><button class="${tab === "plan" ? "on" : ""}" data-do="wedding-tab" data-id="plan"><b>THE PLAN</b></button><button class="${tab === "guests" ? "on" : ""}" data-do="wedding-tab" data-id="guests"><b>GUESTS</b><small>${wedding.guests.filter((guest) => guest.invited).length} of up to ${wedding.guestsMax}</small></button></div>`,
    planHtml = `
    ${section("THE PLACE")}
    ${wedding.venues
      .map((venue) =>
        card({
          icon: WEDDING_ICON[venue.id],
          title: venue.name,
          tag: wedding.venue === venue.id ? "CHOSEN" : "",
          now: wedding.venue === venue.id,
          sub: venue.about,
          sum: costRow("Booking", venue.price, venue.yours),
          button: wedding.venue === venue.id ? "" : chooseButton("venue", venue.id, false, "CHOOSE"),
        }),
      )
      .join("")}
    ${section("THE BANQUET \xB7 PER GUEST")}
    <div class="mls-home ${wedding.banquet ? "now" : ""}" style="--c:${wedding.banquet ? "var(--yellow)" : "#b0356b"}"><div class="pic">\u{1F37D}</div><div><h3>THE BANQUET</h3><div class="sub">For you two and every guest who comes \xB7 ${wedding.eaters} now</div>
      <div class="mls-inv-kinds">${wedding.banquets.map((banquet) => `<button class="${wedding.banquet === banquet.id ? "on" : ""}" data-do="wedding-choose" data-what="banquet" data-id="${banquet.id}"><b>${banquet.id.toUpperCase()}</b><small>${usd(banquet.price)} each${wedding.banquet === banquet.id ? ` \xB7 ${usd(wedding.banquetCost)}` : ""}</small></button>`).join("")}</div></div></div>
    ${section("THE DETAILS \xB7 EACH ONE ADDS TO THE NIGHT")}
    ${wedding.detailList
      .map((detail) =>
        card({
          icon: WEDDING_ICON[detail.id],
          title: detail.name,
          tag: wedding.details[detail.id] ? "CHOSEN" : "",
          now: !!wedding.details[detail.id],
          sub: detail.about,
          sum: costRow("Cost", detail.price, detail.yours),
          button: chooseButton("detail", detail.id, !!wedding.details[detail.id], "ADD"),
          note: detail.taste
            ? `${wedding.name ?? "They"} ${
                {
                  loved: "loves it",
                  liked: "likes it",
                  disliked: "doesn't like it",
                }[detail.taste]
              }`
            : "",
        }),
      )
      .join("")}
    ${section("IN PERSON")}
    ${card({
      icon: "\u{1F935}",
      title: "Your outfit",
      c: wedding.has.outfit ? "var(--yellow)" : "var(--red)",
      now: wedding.has.outfit,
      tag: wedding.has.outfit ? "READY" : "",
      sub: "Urban Threads \xB7 the WEDDING section",
      note: wedding.has.outfit ? "" : "Not yet \xB7 buy it in person",
    })}
    ${card({
      icon: "\u{1F48D}",
      title: "The wedding bands",
      c: wedding.has.bands ? "var(--yellow)" : "var(--red)",
      now: wedding.has.bands,
      tag: wedding.has.bands ? "READY" : "",
      sub: "Little Things \xB7 Rings",
      note: wedding.has.bands ? "" : "Not yet \xB7 buy them in person",
    })}
    ${section("HONEYMOON \xB7 OPTIONAL")}
    ${wedding.honeymoons
      .map((honeymoon) =>
        card({
          icon: WEDDING_ICON[honeymoon.id],
          title: honeymoon.name,
          tag: wedding.honeymoon === honeymoon.id ? "BOOKED" : "",
          now: wedding.honeymoon === honeymoon.id,
          sub: "3 days \xB7 a moment a day",
          sum: costRow("Trip", honeymoon.price, honeymoon.yours),
          button: chooseButton("honeymoon", honeymoon.id, wedding.honeymoon === honeymoon.id, "BOOK"),
        }),
      )
      .join("")}
    <div class="note" style="padding:0 16px 16px">The days off at work come with it.</div>`,
    answerMood = {
      going: ["good", "GOING"],
      maybe: ["none", "MAYBE"],
      no: ["rivals", "NO"],
    },
    guestsHtml = `
    ${section(`GUESTS \xB7 ${wedding.guests.filter((guest) => guest.invited).length} OF UP TO ${wedding.guestsMax}`)}
    <div class="mls-home" style="--c:#b0356b"><div class="pic">\u2709</div><div><h3>WHO YOU INVITE</h3><div class="sub">Whether they come depends on how close you are, and on what they are to ${escape(wedding.name)}.</div>
      <div class="mls-pairs">${wedding.guests
        .map((guest) => {
          const mood = guest.risk
            ? ["rivals", `RISK \xB7 ${guest.risk}`]
            : guest.answer
              ? answerMood[guest.answer]
              : guest.invited
                ? ["none", "INVITED"]
                : ["none", guest.likely ? `LIKELY ${answerMood[guest.likely][1]}` : ""];
          return `<div class="mls-pair"><span class="faces">${newsFace(guest)}</span><div><b>${escape(guest.name)}</b><small>${escape(guest.why)}</small></div><span class="mls-mood ${mood[0]}">${escape(mood[1])}</span>
          <button class="flat" data-do="wedding-invite" data-character="${guest.id}" data-on="${guest.invited ? "0" : "1"}">${guest.invited ? "\u2715" : "INVITE"}</button></div>`;
        })
        .join("")}</div>
      ${
        wedding.guests.some((guest) => guest.invited && guest.risk)
          ? `<div class="note warn">${wedding.guests
              .filter((guest) => guest.invited && guest.risk)
              .map((guest) => `${escape(guest.name)}: ${escape(guest.risk.toLowerCase())}.`)
              .join(" ")} Something may happen on the day.</div>`
          : ""
      }
      ${wedding.invitesSent ? '<div class="note">The invitations went out: each one answered.</div>' : `<button class="move" data-do="wedding-send" ${wedding.guests.some((guest) => guest.invited) && !S.busy ? "" : "disabled"}>SEND THE INVITATIONS \u25B8</button>`}</div></div>`,
    statusHtml = wedding.pickDay
      ? '<div class="mls-said bad mls-portal-said">Pick the day first.</div><button class="move" style="margin:0 16px" data-do="wedding-day">PICK THE DAY TOGETHER \u25B8</button>'
      : wedding.missing.length
        ? `<div class="mls-said bad mls-portal-said">Still missing: ${escape(wedding.missing.join(", "))}. Without them, it moves to the season after.</div>`
        : '<div class="mls-said mls-portal-said">Everything that has to be ready is ready.</div>';
  return `<div class="mls-settings mls-portal mls-homes mls-bills">${header(wedding)}
    ${error || said ? `<div class="mls-said ${error ? "bad" : ""} mls-portal-said">${escape(error || said)}</div>` : ""}
    ${statusHtml}
    <div class="mls-said mls-portal-said">So far you paid ${usd(wedding.spent)} \xB7 ${escape(wedding.name)} puts in ${wedding.share}% \xB7 cash ${usd(wedding.cash)}</div>
    ${tabs}
    <div class="mls-homes-list">${tab === "guests" ? guestsHtml : planHtml}</div></div>`;
}
function homesAppView({ homes: homes, life: life, said = "", error = "" }) {
  const townName = (life?.townName || "Town").toUpperCase(),
    header = `<div class="mls-portal-bar">
      <button class="mls-back flat" data-do="map">\u25C2 MAP</button>
      <span class="brand">${escape(townName)}<b>HOMES</b></span>
      <span class="search">\u{1F50D} <span>Homes to rent or buy in ${escape(life?.townName || "town")}</span></span>
    </div>`;
  if (!homes) {
    return `<div class="mls-settings mls-portal mls-homes">${header}<p class="hint">Loading\u2026</p></div>`;
  }
  const placeImage = (placeId) => life?.backdrop?.places?.[placeId] ?? "",
    placeNameOf = (placeId) => (life?.places ?? []).find((place) => place.id === placeId)?.name ?? "",
    slotNames = {
      bath: "a bathroom",
      console: "room for a console",
      garden: "a garden",
      garage: "a garage",
      gym: "a home gym",
      bar: "a bar",
      pool: "a pool",
    },
    slotsText = (slots) => {
      const names = slots.filter((slot) => slotNames[slot]).map((slot) => slotNames[slot]);
      return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : (names[0] ?? "");
    },
    listingCard = (listing) => {
      const firstRent = listing.first,
        needed = listing.owed + firstRent,
        affordable = !listing.now && listing.fits !== false && homes.cash + (homes.sale ?? 0) >= needed,
        partnerNames = listing.partners.length ? listing.partners.map((partner) => partner.name).join(", ") : "",
        whereName = placeNameOf(listing.where),
        isHouse = listing.where === "houses" || listing.where === "mansions",
        owned = listing.now && (homes.owns || homes.mortgage),
        mortgage = listing.mortgage,
        moveButton = (how, label, amount, why) =>
          `<button class="move ${how === "rent" ? "" : "alt"}" data-do="homes-move" data-id="${listing.id}" data-how="${how}" ${!why && !S.busy ? "" : "disabled"}>${label} \u25B8 ${usd(amount)}${why ? `<small>${escape(why)}</small>` : ""}</button>`,
        buyHtml = owned
          ? ""
          : `
        ${moveButton("cash", "BUY IT", listing.buy.cash.total, listing.buy.cash.why)}
        ${moveButton("mortgage", "MORTGAGE", listing.buy.mortgage.total, listing.buy.mortgage.why)}
        <div class="note">A mortgage: ${usd(mortgage.down)} down, then ${usd(mortgage.payment)} a season for ${mortgage.seasons} seasons (${usd(mortgage.total)} in all). Missing one is like missing the rent.</div>`;
      return `<div class="mls-home ${listing.now ? "now" : ""} ${listing.luxury ? "lux" : ""}" style="--c:${listing.now ? "var(--yellow)" : listing.luxury ? "#b8860b" : "#6d4c41"}">
      <div class="pic" style="${placeImage(listing.where) ? `background-image:url('${escape(placeImage(listing.where))}')` : ""}">${placeImage(listing.where) ? "" : listing.luxury ? (isHouse ? "\u{1F3F0}" : "\u{1F306}") : isHouse ? "\u{1F3E1}" : "\u{1F3E2}"}</div>
      <div><h3>${escape(listing.name.toUpperCase())}${listing.now ? `<span class="tag">${homes.owns ? "YOURS" : homes.mortgage ? "YOURS \xB7 ON A MORTGAGE" : "YOU LIVE HERE"}</span>` : ""}</h3>
        <div class="sub">${escape(isHouse ? `On ${whereName || "the street"}` : `In ${whereName || "the building"}`)} \xB7 ${usd(listing.rent)} a season to rent \xB7 ${usd(listing.price)} to buy</div>
        <div class="note">${slotsText(listing.slots) ? `With ${slotsText(listing.slots)}. ` : ""}Up to ${listing.guests} guests. Once it's yours, ${usd(listing.upkeep)} a season in bills.${listing.street ? ` No garage: your car stays on the street, ${usd(listing.street)} a season.` : ""}</div>
        ${listing.now && listing.paid ? `<div class="note">Who lives with you pays you ${usd(listing.paid)} a season for their rooms.</div>` : ""}
        ${
          listing.now
            ? `<div class="note">${homes.owns ? `It's yours: you pay ${usd(listing.share)} a season in bills.` : homes.mortgage ? `You pay ${usd(listing.share)} a season (the payment and the bills) \xB7 ${usd(homes.mortgage.left)} left, ${Math.ceil(homes.mortgage.left / homes.mortgage.payment)} payments to go.` : `You pay ${usd(listing.share)}${listing.share < listing.rent ? " \xB7 split with whoever lives with you" : ""} \xB7 due on day ${homes.rentDay} of each season.`}</div>
          ${roomsNote(listing)}
          ${owned && homes.sale ? `<div class="note">Move out and the bank buys it back for ${usd(homes.sale)}.</div>` : ""}
          ${buyHtml}`
            : `
        <div class="sum">
          ${listing.owed ? `<span>Owed</span><b>${usd(listing.owed)}</b>` : ""}
          <span>First rent${firstRent < listing.rent ? " \xB7 your share" : ""}</span><b>${usd(firstRent)}</b>
          ${homes.sale ? `<span>The bank buys yours back</span><b>+${usd(homes.sale)}</b>` : ""}
        </div>
        <div class="note">${homes.lodging === "home" ? "Your things come with you." : homes.held ? `Your things come back with the keys (${escape(homes.held.by)} has them${homes.held.free || homes.held.by === "The landlord" ? "" : " until you pay them back"}).` : "A place of your own again."}</div>
        ${partnerNames ? listing.partners.map((partner) => `<div class="note ${partner.comes ? "" : "warn"}">${escape(partner.name)} lives with you: ${partner.comes ? "they would come with you" : "they would stay, and you would stop living together"}.</div>`).join("") : ""}
        ${roomsNote(listing)}
        ${moveButton("rent", "RENT IT", needed, affordable ? "" : listing.fits === false ? "Not everyone coming fits" : `You need ${usd(needed - homes.cash - (homes.sale ?? 0))} more`)}
        ${buyHtml}`
        }
      </div></div>`;
    },
    mates = homes.mates ?? [],
    matesHtml = mates.length
      ? `<div class="mls-homes-who"><span class="lbl">WHO COMES WITH YOU</span>
      ${mates
        .map(
          (mate) =>
            `<button class="${mate.comes ? "on" : ""}" data-do="homes-stay" data-id="${escape(mate.id)}" ${S.busy ? "disabled" : ""}>${newsFace(
              {
                id: mate.id,
                name: mate.name,
              },
            )}<b>${escape(mate.name)}</b><small>${mate.comes ? "COMES" : "STAYS"}</small></button>`,
        )
        .join("")}</div>`
      : "",
    statusLine =
      homes.lodging === "street"
        ? `You have no home.${homes.owed ? ` You owe the landlord ${usd(homes.owed)}: pay that before you rent anywhere.` : ""} You have ${usd(homes.cash)}.`
        : homes.lodging === "couch"
          ? `On ${homes.couch.name}'s couch until ${homes.couch.until}. You have ${usd(homes.cash)}.`
          : "";
  return `<div class="mls-settings mls-portal mls-homes">${header}
    ${error || said || statusLine ? `<div class="mls-said ${error || homes.lodging === "street" ? "bad" : ""} mls-portal-said">${escape(error || said || statusLine)}</div>` : ""}
    ${matesHtml}
    <div class="mls-homes-list">${homes.listings.map(listingCard).join("")}</div></div>`;
}
function roomsNote(listing) {
  const people = (count) => (count === 1 ? "one person" : `${count} people`);
  return listing.now
    ? `<div class="note">Room for ${people(listing.rooms)} besides you${listing.taken ? ` \xB7 ${listing.taken >= listing.rooms ? "all taken" : `${listing.taken} taken`}` : ""}.</div>`
    : `<div class="note ${listing.fits ? "" : "warn"}">Room for ${people(listing.rooms)} besides you${listing.fits ? "." : ": not everyone coming fits. Pick who stays, above."}</div>`;
}
function keysView(keys, life) {
  const place = (life?.places ?? []).find((place2) => place2.id === keys.where),
    image = life?.backdrop?.places?.[keys.where] ?? "",
    stamp = keys.how === "cash" ? "SOLD TO YOU" : keys.how === "mortgage" ? "ON A MORTGAGE" : "RENTED",
    slotNames = {
      garden: "a garden",
      garage: "a garage",
      gym: "a home gym",
      bar: "a bar",
      pool: "a pool",
      console: "room for a console",
    },
    extras = keys.slots.filter((slot) => slotNames[slot]).map((slot) => slotNames[slot]),
    from =
      keys.how === "cash"
        ? `${usd(keys.share)} a season in bills`
        : keys.how === "mortgage" && keys.mortgage
          ? `${usd(keys.share)} a season \xB7 ${keys.mortgage.seasons} payments`
          : `${usd(keys.share)} a season in rent`;
  return `<div class="mls-keys-veil" data-do="keys-ok"><div class="mls-keys ${keys.luxury ? "lux" : ""} ${keys.fresh ? "fresh" : ""}">
    <div class="photo" style="${image ? `background-image:url('${escape(image)}')` : ""}">${image ? "" : `<span class="ic">${keys.luxury ? "\u{1F306}" : "\u{1F3E0}"}</span>`}<span class="stamp ${keys.how}">${stamp}</span></div>
    <span class="key">\u{1F511}</span>
    <div class="k">${keys.here ? "IT'S YOURS NOW" : "YOUR NEW HOME"}${place ? ` \xB7 ${escape(place.name.toUpperCase())}` : ""}</div>
    <h3>${escape(keys.name.toUpperCase())}${keys.door ? `<small> \xB7 ${escape(keys.door)}</small>` : ""}</h3>
    <div class="r"><span>Paid today</span><b>${usd(keys.paid)}</b></div>
    ${keys.sold ? `<div class="r good"><span>The bank bought your old home</span><b>+${usd(keys.sold)}</b></div>` : ""}
    <div class="r"><span>From now on</span><b>${escape(from)}</b></div>
    ${keys.rentDay ? `<div class="r"><span>Due on</span><b>day ${keys.rentDay} of each season</b></div>` : ""}
    <p>${extras.length ? `With ${extras.length > 1 ? `${extras.slice(0, -1).join(", ")} and ${extras.at(-1)}` : extras[0]}. ` : ""}Up to ${keys.guests} guests.${keys.back ? " Your things are back." : ""}</p>
    ${keys.came.length ? `<p>${escape(keys.came.join(" and "))} moved in with you.</p>` : ""}${keys.stayed.length ? `<p class="warn">${escape(keys.stayed.join(" and "))} stayed behind.</p>` : ""}
    <button class="ok" data-do="keys-ok">${life?.at === "home" ? "GO IN \u25B8" : "OK"}</button>
  </div></div>`;
}
function noticeView(notice) {
  const faceRow = (characterId, characterName) =>
      `<div class="face-row"><span class="f">${frameImg(personOf(characterId, characterName))}</span>`,
    noticeCard = (
      kicker,
      title,
      body,
    ) => `<div class="mls-notice-veil"><div class="mls-notice"><div class="k">${kicker}</div><h3>${title}</h3>${body}
    <button class="ok" data-do="notice-ok">OK \u25B8</button></div></div>`;
  return notice.id === "rent" && notice.kind === "mortgage"
    ? noticeCard(
        "PAYMENT DAY",
        "PAYMENT MISSED",
        `
    <div class="r"><span>Mortgage payment</span><b>${usd(notice.amount)}</b></div>
    <div class="r"><span>Late fee \xB7 10%</span><b>${usd(notice.fee)}</b></div>
    <div class="r total"><span>You owe the bank</span><b>${usd(notice.owed)}</b></div>
    <p>Pay it in BILLS, as much as you want, whenever you want.</p>
    <p class="warn">Next payment: day ${notice.nextDay} of next season. If you still owe by then, the bank takes your home.</p>`,
      )
    : notice.id === "rent" && notice.kind === "upkeep"
      ? noticeCard(
          "BILLS DAY",
          "YOUR HOME'S BILLS",
          `
    <div class="r"><span>This season</span><b>${usd(notice.amount)}</b></div>
    <div class="r"><span>Late fee \xB7 10%</span><b>${usd(notice.fee)}</b></div>
    <div class="r total"><span>You owe</span><b>${usd(notice.owed)}</b></div>
    <p>Pay it in BILLS whenever you can. If you sell your home first, it comes out of the sale.</p>`,
        )
      : notice.id === "rent"
        ? noticeCard(
            "RENT DAY",
            "RENT MISSED",
            `
    <div class="r"><span>Rent</span><b>${usd(notice.amount)}</b></div>
    <div class="r"><span>Late fee \xB7 10%</span><b>${usd(notice.fee)}</b></div>
    <div class="r total"><span>You owe the landlord</span><b>${usd(notice.owed)}</b></div>
    <p>Pay it in BILLS, as much as you want, whenever you want.</p>
    <p class="warn">Next rent: day ${notice.nextDay} of next season. If you still owe by then, you're out.</p>`,
          )
        : notice.id === "partner-covered"
          ? noticeCard(
              `${notice.kind === "mortgage" ? "PAYMENT" : notice.kind === "upkeep" ? "BILLS" : "RENT"} DAY \xB7 YOU LIVE TOGETHER`,
              `${escape(notice.name.toUpperCase())} COVERED YOUR PART`,
              `
    ${faceRow(notice.characterId, notice.name)}<em>${notice.kind === "mortgage" ? "They paid the bank your part." : notice.kind === "upkeep" ? "They paid your part of the home's bills." : "They paid the landlord your part."}</em></div>
    <div class="r lent"><span>${escape(notice.name)} paid</span><b>${usd(notice.amount)}</b></div>
    <div class="r"><span>Trust</span><b>${notice.trust}</b></div>
    <p>You owe ${escape(notice.name)} ${usd(notice.amount)}: two weeks to pay it back, in BILLS.</p>
    <p class="warn">If you still owe it at the next rent, you stop living together.</p>`,
            )
          : notice.id === "evict-warning"
            ? noticeCard(
                notice.why === "mortgage" ? "PAYMENT DAY" : "RENT DAY",
                notice.why === "partner"
                  ? "YOU HAVE TO MOVE OUT"
                  : notice.why === "mortgage"
                    ? "THE BANK TAKES YOUR HOME"
                    : "YOU'RE BEING EVICTED",
                `
    <div class="r total"><span>You owe ${escape(notice.who ?? "")}</span><b>${usd(notice.owed)}</b></div>
    <p>Pay all of it in BILLS before ${escape(notice.at ?? "08:00")} and you stay. Moving out stops it too.</p>
    <p class="warn">At ${escape(notice.at ?? "08:00")}, if you still owe it, you're out.</p>`,
              )
            : notice.id === "mate-left"
              ? noticeCard(
                  "AT HOME",
                  `${escape(String(notice.name ?? "").toUpperCase())} MOVED OUT`,
                  `
    ${faceRow(notice.characterId, notice.name)}<em>${notice.why === "partner" ? `To live with ${escape(notice.with ?? "their partner")}.` : "Things between you weren't the same."}</em></div>
    <p>${notice.why === "partner" ? "They took their things this morning. Their room at yours is free now." : "They packed up and found a place of their own. Their room at yours is free now."}</p>`,
                )
              : notice.id === "couch-over"
                ? noticeCard(
                    `${escape(notice.name.toUpperCase())}'S COUCH`,
                    notice.why === "nights" ? "YOUR NIGHTS ARE OVER" : "THEY ASKED YOU TO LEAVE",
                    `
    ${faceRow(notice.characterId, notice.name)}<em>${notice.why === "nights" ? "The week is up." : "It isn't working any more."}</em></div>
    <p>Back to your spot in the Park. HOMES on your phone to rent again.</p>`,
                  )
                : notice.id === "your-birthday"
                  ? noticeCard(
                      `TODAY \xB7 ${escape(String(notice.label ?? "").toUpperCase())}`,
                      "HAPPY BIRTHDAY",
                      `
    ${(notice.rows ?? []).map((row) => `<div class="r"><span>${escape(row.name)}</span><b>${row.gift ? `\u{1F381} ${escape(row.gift.name)}${row.gift.home ? " \xB7 on your shelf" : ""}` : "\u2709 a message"}</b></div>`).join("") || "<p>Nobody knows it yet.</p>"}
    ${notice.surprise ? `<div class="r"><span>${escape(notice.surprise.name)}</span><b>has plans for tonight</b></div>` : ""}
    <p>Whoever knows will wish you a happy birthday when they see you; close friends bring a present (it goes in your backpack).${notice.party ? " To throw your birthday party: AT HOME \xB7 PARTY." : ""}</p>`,
                    )
                  : notice.id === "birthday-today"
                    ? noticeCard(
                        `TODAY \xB7 ${escape(String(notice.label ?? "").toUpperCase())}`,
                        `${escape(notice.name.toUpperCase())}'S BIRTHDAY`,
                        `
    ${faceRow(notice.characterId, notice.name)}<em>Today is their day.</em></div>
    <div class="r"><span>A present today</span><b>counts \xD72</b></div>
    <p>Or wish them a happy birthday when you talk, or send a message from CONTACTS. Your partner or a Close friend will notice if the day goes by without a word.</p>`,
                      )
                    : notice.id === "birthday-missed"
                      ? noticeCard(
                          "YESTERDAY",
                          `${escape(notice.name.toUpperCase())}'S BIRTHDAY WENT BY`,
                          `
    ${faceRow(notice.characterId, notice.name)}<em>Not a word from you.</em></div>
    ${Object.entries(notice.cost ?? {})
      .map(
        ([stat, change]) =>
          `<div class="r"><span>${stat[0].toUpperCase()}${stat.slice(1)}</span><b>${change}</b></div>`,
      )
      .join("")}
    <p>You knew the day. A present, a word in a talk, a message or their party would have been enough.</p>`,
                        )
                      : notice.id === "collections"
                        ? noticeCard(
                            "THE HOSPITAL",
                            "IN COLLECTIONS",
                            `
    <div class="r total"><span>You owe</span><b>${usd(notice.amount)}</b></div>
    <p>The bill went past its thirty days: +20%. Collections take 25% of every shift until it is paid.</p>
    <p>Pay it off in BILLS to stop them.</p>`,
                          )
                        : "";
}
function evictView(evict) {
  const byPartner = evict.why === "partner",
    byBank = evict.why === "mortgage",
    sayLine = (
      text,
      speaker = "",
    ) => `<div class="say ${speaker ? "" : "narration"}" data-do="evict-next">${speaker ? `<span class="speaker">${escape(speaker)}</span>` : ""}
    <span class="text">${escape(text)}</span><span class="next">TAP \u25B8</span></div>`,
    offer = evict.offer;
  return `<div class="mls-faint evicted ${evict.step === 0 ? "dizzy" : ""}">
    <div class="scene"></div><div class="vignette"></div><div class="door"></div>
    <div class="clock"><b>${escape(String(S.life?.hud?.clock?.weekday ?? "").toUpperCase())}</b>${escape(S.life?.hud?.time ?? "")}</div>
    <h1>HOME</h1>
    ${evict.step === 0 ? sayLine(byPartner ? "Your things are in boxes by the door. You know before anyone says it." : byBank ? "Your key doesn't turn. The bank has changed the locks, and its notice is taped to the door." : "Your key doesn't turn. There's a new lock, and a notice taped at eye level.") : ""}
    ${evict.step === 1 ? (byBank ? sayLine("Two payments missed. The home is the bank's now, and what you paid into it goes with it. Your things will be sent on with your next keys.") : sayLine(byPartner ? "I can't keep carrying this. I love you \u2014 but you need your own place again." : "Two rents. I warned you. Your things stay with me until you pay \u2014 every dollar of it. Take your backpack.", byPartner ? evict.holder : "LANDLORD")) : ""}
    ${
      evict.step === 2
        ? `<div class="bill">
      <h3>${byPartner ? "MOVED OUT" : byBank ? "THE BANK TOOK YOUR HOME" : "EVICTED"}</h3>
      ${byBank ? "" : `<div class="r"><span>${byPartner ? `Owed to ${escape(evict.holder)}` : "Owed rent"}</span><b>${usd(evict.owed)}</b></div>`}
      <div class="r kept"><span>You keep</span><b>your backpack \xB7 what you wear</b></div>
      <div class="r held"><span>${byPartner ? escape(evict.holder) : byBank ? "The bank" : "The landlord"} holds</span><b>the furniture \xB7 the fridge \xB7 the rack</b></div>
      <small>${byBank ? "They come back with your next keys (the food will have gone off). HOMES on your phone to rent again." : `Pay the ${usd(evict.owed)} in BILLS and they come back with your next keys (the food will have gone off). HOMES on your phone to rent again.`}</small>
      ${
        offer
          ? `<div class="mls-offer"><div class="who"><span class="f">${frameImg(personOf(offer.characterId, offer.name))}</span><div><b>${escape(offer.name.toUpperCase())} \xB7 CLOSE FRIEND</b><em>\xABI heard. My couch is yours for a week \u2014 don't argue.\xBB</em></div></div>
        <div class="row"><button class="main" data-do="couch-go" data-character="${escape(offer.characterId)}">GO TO ${escape(offer.name.toUpperCase())}'S \u25B8 ${offer.nights} NIGHTS</button><button data-do="evict-park">THE PARK</button></div></div>`
          : '<button class="getup" data-do="evict-park">TO THE PARK \u25B8</button>'
      }
    </div>`
        : ""
    }
  </div>`;
}
function streetBox(life) {
  return life?.hud?.lodging?.kind !== "street" || !(life.activities ?? []).some((activity) => activity.rough)
    ? ""
    : '<div class="mls-street"><b>YOUR SPOT</b><small>A FLATTENED BOX UNDER THE TREES \xB7 <em>NO HOME</em> \xB7 HOMES ON YOUR PHONE</small></div>';
}
function rentLine(hud) {
  const lodging = hud.lodging ?? {
      kind: "home",
    },
    owes = hud.owes ?? {},
    owedTotal = (owes.hospital ?? 0) + (owes.loans ?? 0) + (owes.home ?? 0),
    debtLine =
      owedTotal > 0
        ? `<div class="mls-debt">${owes.collections ? "IN COLLECTIONS \xB7 " : ""}OWED ${usd(owedTotal)} \xB7 BILLS</div>`
        : "";
  if (lodging.kind === "street") {
    return `<div class="mls-rent street">NO HOME${owes.rent ? ` \xB7 OWED ${usd(owes.rent)}` : ""}</div>${debtLine}`;
  }
  if (lodging.kind === "couch") {
    return `<div class="mls-rent">${escape(lodging.name.toUpperCase())}'S COUCH \xB7 ${lodging.nights} NIGHT${lodging.nights === 1 ? "" : "S"} LEFT</div>${debtLine}`;
  }
  const evict = hud.evict;
  if (evict) {
    return `<div class="mls-rent owed">OWED ${usd(evict.owed)}<small>pay all of it in BILLS by ${escape(evict.by)} or ${evict.why === "partner" ? "you have to move out" : evict.why === "mortgage" ? "the bank takes your home" : "you're evicted"}</small></div>${debtLine}`;
  }
  if (owes.rent) {
    return `<div class="mls-rent owed">OWED RENT ${usd(owes.rent)}<small>pay it in BILLS or you're evicted in ${hud.rentIn} days</small></div>${debtLine}`;
  }
  if (owes.mortgage) {
    return `<div class="mls-rent owed">OWED TO THE BANK ${usd(owes.mortgage)}<small>pay it in BILLS or the bank takes your home in ${hud.rentIn} days</small></div>${debtLine}`;
  }
  const rentLabel =
    hud.rentKind === "mortgage" ? "Mortgage payment" : hud.rentKind === "upkeep" ? "Home's bills" : "Rent";
  return `${debtLine}<div class="mls-rent">${rentLabel} due in ${hud.rentIn} days \xB7 ${usd(hud.rent)}</div>`;
}
const openBills = () => {
  S.phone = false;
  S.view = "bills";
  S.billPick = {};
  S.said = "";
  S.error = "";
  notify();
};
const billNudge = (billId, direction) => {
  const bill = (S.life?.bills?.list ?? []).find((entry) => entry.id === billId);
  if (!bill) {
    return;
  }
  const cash = S.life.bills.cash,
    current = billPickOf(bill, cash),
    most = Math.min(bill.amount, cash);
  S.billPick = {
    ...(S.billPick ?? {}),
    [billId]:
      direction === "less" ? Math.max(10, current - 50) : direction === "more" ? Math.min(most, current + 50) : most,
  };
  notify();
};
const billPay = (billId) =>
  act(async () => {
    const bill = (S.life?.bills?.list ?? []).find((entry) => entry.id === billId);
    if (!bill) {
      return;
    }
    const amount = billPickOf(bill, S.life.bills.cash),
      res = await call(`/lives/${S.life.id}/bills/pay`, {
        method: "POST",
        body: {
          id: billId,
          amount: amount,
        },
      });
    S.life = res.life;
    S.billPick = {
      ...(S.billPick ?? {}),
      [billId]: undefined,
    };
    S.said = [
      res.paid.left
        ? `Paid ${usd(res.paid.paid)} to ${bill.name}: ${usd(res.paid.left)} left.`
        : `${bill.name}: paid off.`,
      res.paid.paidOff ? "That was the last payment: your home is yours." : "",
      res.paid.stopped ? "Paid in time: you get to stay." : "",
    ]
      .filter(Boolean)
      .join(" ");
  });
const openHomes = () =>
  act(async () => {
    S.phone = false;
    S.view = "homes";
    S.homes = null;
    S.homesStay = [];
    S.said = "";
    notify();
    S.homes = (await call(`/lives/${S.life.id}/homes`)).homes;
  });
const homesStay = (characterId) =>
  act(async () => {
    const staying = S.homesStay ?? [];
    S.homesStay = staying.includes(characterId)
      ? staying.filter((id) => id !== characterId)
      : [...staying, characterId];
    S.homes = (await call(`/lives/${S.life.id}/homes?stay=${encodeURIComponent(S.homesStay.join(","))}`)).homes;
  });
const homesMove = (kind, how = "rent") =>
  act(async () => {
    const before = S.homes?.listings?.find((listing2) => listing2.id === kind) ?? null,
      res = await call(`/lives/${S.life.id}/homes/move`, {
        method: "POST",
        body: {
          kind: kind,
          stay: S.homesStay ?? [],
          ...(how === "rent"
            ? {}
            : {
                buy: how,
              }),
        },
      });
    S.homesStay = [];
    S.life = res.life;
    S.homes = res.homes;
    const moved = res.moved,
      listing = res.homes?.listings?.find((entry) => entry.id === kind) ?? before;
    S.keys = {
      kind: kind,
      how: how,
      name: moved.home,
      door: moved.door,
      here: !!moved.here,
      paid: moved.paid,
      sold: moved.sold ?? 0,
      came: moved.came ?? [],
      stayed: moved.stayed ?? [],
      back: !!moved.back,
      where: listing?.where ?? "",
      guests: listing?.guests ?? 0,
      slots: listing?.slots ?? [],
      luxury: !!listing?.luxury,
      share: res.homes?.listings?.find((entry) => entry.now)?.share ?? listing?.rent ?? 0,
      mortgage: res.homes?.mortgage ?? null,
      rentDay: res.homes?.rentDay ?? null,
      fresh: true,
    };
    const boughtNote =
      moved.bought === "cash"
        ? "It's yours. "
        : moved.bought === "mortgage"
          ? "It's yours, on a mortgage: the payments come on rent day. "
          : "";
    S.said = (
      moved.here
        ? `You bought your ${moved.home.toLowerCase()}. ${boughtNote}`
        : `Moved into the ${moved.home.toLowerCase()} \xB7 ${moved.door}. ${boughtNote}${moved.sold ? `The bank bought your old home back for $${moved.sold.toLocaleString("en-US")}. ` : ""}${moved.back ? "Your things are back. " : ""}${moved.came.length ? `${moved.came.join(", ")} came with you. ` : ""}${moved.stayed.length ? `${moved.stayed.join(", ")} stayed behind. ` : ""}`
    ).trim();
  });
const couchGo = (characterId) =>
  act(async () => {
    const res = await call(`/lives/${S.life.id}/couch`, {
      method: "POST",
      body: {
        character: characterId,
      },
    });
    S.life = res.life;
    S.evict = null;
    S.talk = {};
    S.talkTo = null;
    S.said = `${res.couch.name}'s couch is yours until ${res.couch.until}. Home is their place for now.`;
  });
const evictNext = () => {
  if (S.evict) {
    S.evict.step = Math.min(2, S.evict.step + 1);
  }
  notify();
};
const evictPark = () => {
  if (((S.evict = null), S.life?.at !== "park" && (S.life?.places ?? []).some((place) => place.id === "park"))) {
    return goTo("park");
  }
  notify();
};

export {
  DROP_WHY_NOT,
  billNudge,
  billPay,
  billsAppView,
  couchGo,
  dropAccepts,
  evictNext,
  evictPark,
  evictView,
  homesAppView,
  homesMove,
  homesStay,
  keysView,
  noticeView,
  openBills,
  openHomes,
  rentLine,
  streetBox,
  weddingAppView,
};
