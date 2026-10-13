// Town and district map views, place cards, phone button
import { DISTRICT_LINKS, MAP, TOWN_SPOT, bgIcon, districtSpots, escape, headOf, hours, isStreetId } from "./common.js";
import { rentLine } from "./homes.js";
import { planStripView, planTagsView } from "./outings.js";

const youAreAt = (view, placeId) =>
  view.at === placeId ||
  (view.at === "home" && placeId === view.homeAt) ||
  (view.places ?? []).some((place) => place.id === view.at && place.inside === placeId);
const districtHere = (view) =>
  (view.districts ?? []).find((district) => district.id === view.district) ??
  (view.districts ?? [])[0] ?? {
    id: "",
    name: "",
    places: [],
  };
const mapPlaces = (view) => {
  const district = districtHere(view);
  return (view.places ?? [])
    .filter((place) => !place.inside && district.places.includes(place.id))
    .sort((left, right) => district.places.indexOf(left.id) - district.places.indexOf(right.id));
};
function peopleInDistrict(view, district) {
  const placeIds = new Set(district.places);
  for (const place of view.places ?? []) {
    if (place.inside && placeIds.has(place.inside)) {
      placeIds.add(place.id);
    }
  }
  const seen = new Set();
  return [...placeIds]
    .flatMap((id) => view.peopleAt?.[id] ?? [])
    .filter((id) => id.met !== false && !seen.has(id.id) && seen.add(id.id));
}
function placeCard(place, view, compact, spot = [50, 50]) {
  const meta = {
      r: 0,
      icon: "\u{1F4CD}",
      bg: "#333",
      ...MAP[place.id],
      x: spot[0],
      y: spot[1],
    },
    here = youAreAt(view, place.id),
    people = view.peopleAt?.[place.id] ?? [],
    shown = people.slice(0, 3),
    more = people.length - shown.length,
    inHall = place.hall && view.at === place.id,
    action = place.residence ? (here ? "corridor" : "go") : inHall ? "corridor" : here ? "enter" : "go",
    tag = here
      ? '<span class="tag here-tag">YOU ARE HERE</span>'
      : place.id === view.homeAt && view.residence
        ? `<span class="tag">${view.hud?.lodging?.kind === "couch" ? "YOU SLEEP HERE" : "YOU LIVE HERE"}</span>`
        : place.id === "park" && view.hud?.lodging?.kind === "street"
          ? '<span class="tag">YOUR SPOT</span>'
          : place.id === "office"
            ? officeTag(view)
            : meta.tag
              ? `<span class="tag">${meta.tag}</span>`
              : "";
  return `<button class="mls-place ${here ? "here" : ""} ${place.isOpen ? "" : "closed"}" data-place="${place.id}"
      style="${compact ? "" : `left:${meta.x}%; top:${meta.y}%; `}--r:${meta.r}deg; --bg:${meta.bg}"
      data-do="${action}">
    ${tag}
    ${view.backdrop?.places?.[place.id] ? `<span class="photo has-pic" style="background-image:url('${escape(view.backdrop.places[place.id])}')"></span>` : `<span class="photo ${view.backdrop?.wanted?.places?.[place.id] ? "wants" : ""}"><span>${meta.icon}</span>${bgIcon(view.backdrop?.wanted?.places?.[place.id])}</span>`}
    <span class="name">${escape(place.name)}</span>
    <span class="hours">${place.residence ? `${view.corridors?.[place.id]?.people ?? 0} of your cast live here` : place.isOpen ? hours(place) : place.events ? "Only for events" : "Closed now"}</span>
    <span class="away">${here ? (place.residence ? "TAP FOR THE DOORS" : inHall ? "TAP FOR THE STORES" : "TAP TO GO IN") : place.minutes === null ? "no way through" : `${place.minutes} min away`}</span>
    ${shown.length ? `<span class="mls-who">${shown.map((person) => headOf(person, person.bang ? "bang" : "")).join("")}${more > 0 ? `<b class="more">+${more}</b>` : ""}</span>` : ""}
  </button>`;
}
function phonePlaces(view) {
  return `<div class="mls-phone-places">${mapPlaces(view)
    .map((place) => placeCard(place, view, true))
    .join("")}</div>`;
}
function districtHead(view, townOpen) {
  const district = districtHere(view);
  return `<div class="mls-district-head">
      ${townOpen ? `<button class="mls-sign back" data-do="town-close">\u25C2 ${escape(district.name.toUpperCase())}</button><h1>TOWN</h1>` : `<button class="mls-sign" data-do="town-open">\u25C2 TOWN</button><h1>${escape(district.name.toUpperCase())}</h1>${isStreetId(view.at) ? '<span class="sub">ON THE STREET</span>' : ""}`}
    </div>`;
}
const WHEELS_ICON = {
  motorbike: "\u{1F3CD}",
  car: "\u{1F697}",
};
function townView(view, narrow) {
  const districts = view.districts ?? [],
    ids = new Set(districts.map((district) => district.id)),
    lines = narrow
      ? ""
      : `<svg class="mls-town-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${DISTRICT_LINKS.filter(
          ([from, to]) => ids.has(from) && ids.has(to),
        )
          .map(
            ([from, to]) =>
              `<line data-pair="${from}|${to}" x1="${TOWN_SPOT[from][0]}" y1="${TOWN_SPOT[from][1]}" x2="${TOWN_SPOT[to][0]}" y2="${TOWN_SPOT[to][1]}" vector-effect="non-scaling-stroke"></line>`,
          )
          .join("")}</svg>`,
    cards = districts
      .map((district) => {
        const here = district.id === view.district,
          people = peopleInDistrict(view, district),
          backdrop = view.backdrop?.districts?.[district.id],
          placeList = district.places
            .map((placeId) => (view.places ?? []).find((place) => place.id === placeId))
            .filter(Boolean)
            .map((place) => `<i class="${place.isOpen || place.residence ? "" : "shut"}">${escape(place.name)}</i>`)
            .join("");
        return `<button class="mls-dcard ${here ? "here" : ""}" data-district="${district.id}" data-do="${here ? "town-close" : "district"}" style="${narrow ? "" : `left:${TOWN_SPOT[district.id]?.[0] ?? 50}%;top:${TOWN_SPOT[district.id]?.[1] ?? 50}%;`}">
      ${here ? '<span class="tag here-tag">YOU ARE HERE</span>' : ""}
      <span class="shot" ${backdrop ? `style="background-image:url('${escape(backdrop)}')"` : ""}>${backdrop ? "" : bgIcon(view.backdrop?.wanted?.districts?.[district.id])}</span>
      <span class="n">${escape(district.name)}</span>
      <span class="in">${placeList}</span>
      ${here || district.minutes === null ? "" : `<span class="far">${district.minutes} min away${WHEELS_ICON[view.wheels?.by] ? ` \xB7 ${WHEELS_ICON[view.wheels.by]}` : ""}${district.through ? ` \xB7 through ${escape(district.through)}` : ""}</span>`}
      ${
        people.length
          ? `<span class="mls-who">${people
              .slice(0, 4)
              .map((person) => headOf(person, person.bang ? "bang" : ""))
              .join("")}${people.length > 4 ? `<b class="more">+${people.length - 4}</b>` : ""}</span>`
          : ""
      }
    </button>`;
      })
      .join("");
  return `<div class="mls-town" id="mls-town">${lines}${cards}<div class="mls-walker" id="mls-town-walker" hidden></div></div>`;
}
const PHONE_ICON = '<span class="mls-phone-icon" aria-hidden="true"><i></i></span>';
function phoneButton(view) {
  const failed = (view.paint?.failed ?? 0) > 0,
    pending = view.paint?.pending ?? 0;
  return `<button class="mls-phone-fab ${pending ? "painting" : ""}" data-do="phone" title="Phone${pending ? ` \xB7 painting ${pending} backgrounds` : ""}">
    ${PHONE_ICON}${failed ? '<span class="dot">!</span>' : ""}</button>`;
}
function dutyBanner(view) {
  const duty = view.career?.duty;
  return !duty || duty.here
    ? ""
    : duty.late
      ? `<div class="mls-career-duty late"><b>YOU'RE LATE</b><span>The shift started at ${escape(duty.from)} \xB7 you can still go until ${escape(duty.until)} \xB7 late ${duty.lates} of ${duty.latesMax}</span></div>`
      : `<div class="mls-career-duty"><b>SHIFT TODAY \xB7 ${escape(duty.from)}</b><span>The Office${duty.minutes ? ` \xB7 ${duty.minutes} min away` : ""} \xB7 on time until ${escape(duty.until)}</span></div>`;
}
function officeTag(view) {
  const career = view.career;
  return career?.on
    ? career.duty
      ? career.duty.late
        ? '<span class="tag mls-career-tag late">LATE</span>'
        : `<span class="tag mls-career-tag">SHIFT ${escape(career.duty.from)}</span>`
      : career.employed
        ? '<span class="tag">WORK</span>'
        : ""
    : "";
}
function mapView({ life: life, said: said, error: error, phone: phone, job = "", town = false }) {
  const hud = life.hud,
    clock = hud.clock,
    needs = hud.needs;
  return `
    <div class="mls-map">
      ${dutyBanner(life)}
      ${(() => {
        const planStrip = planStripView(life, {
            bare: true,
          }),
          planTags = planTagsView(life);
        return planStrip || planTags
          ? `<div class="mls-plan-strip map ${planTags && !planStrip ? "tags" : ""} ${life.career?.duty && !life.career.duty.here ? "below" : ""}">${planStrip}${planTags}</div>`
          : "";
      })()}
      ${(() => {
        const backdropUrl = (!town && life.backdrop?.districts?.[life.district]) || life.backdrop?.map;
        return backdropUrl
          ? `<div class="backdrop has-pic" style="background-image:url('${escape(backdropUrl)}')"></div>`
          : '<div class="backdrop"></div><div class="skyline"></div>';
      })()}<div class="halftone"></div>

      <div class="mls-top">
      ${phone ? '<button class="mls-back" data-do="title">\u25C2 ALL LIVES</button>' : ""}
      <div class="mls-clock" data-hud="clock">
        <div class="top"><b data-hud="day">${escape(clock.weekday.toUpperCase())}</b><span>${escape(clock.slot)}</span></div>
        <div class="time" data-hud="time">${escape(hud.time)}</div>
        <div class="date">${escape(hud.date)}${life.townName ? ` \xB7 ${escape(life.townName)}` : ""}</div>
      </div>

      <div class="mls-needs">
        <div class="mls-need"><span class="label">Energy</span><span class="mls-bar ${needs.energyLow ? "low" : ""}"><i data-hud="energy" style="width:${Math.round((needs.energy / needs.energyMax) * 100)}%"></i></span></div>
        <div class="mls-need"><span class="label">Hunger</span><span class="mls-bar ${needs.hungerLow ? "low" : ""}"><i data-hud="hunger" style="width:${Math.round(needs.hunger)}%"></i></span></div>
        ${hud.wellFed ? `<div class="mls-wellfed" title="Hunger goes down at half the pace">Well fed until ${escape(hud.wellFed)}</div>` : ""}
      </div>

      <div class="mls-hud">
        ${phone ? "" : '<button class="mls-back" data-do="title">\u25C2 ALL LIVES</button>'}
        <div class="mls-money"><small>CASH</small><span data-hud="cash">$${hud.cash}</span></div>
        ${rentLine(hud)}
      </div>
      </div>

      <div class="mls-districtview ${town ? "is-town" : ""}">
      ${districtHead(life, town)}
      ${
        town
          ? townView(life, phone)
          : phone
            ? phonePlaces(life)
            : `
      <div class="mls-places" id="mls-places">
        <svg><g id="mls-links"></g></svg>
        <div class="mls-walker" id="mls-walker" hidden></div>
        <div class="mls-board" id="mls-board">
          ${((places) => places.map((place, index) => placeCard(place, life, phone, districtSpots(places.length)[index])).join(""))(mapPlaces(life))}
        </div>
      </div>`
      }
      </div>
      ${phoneButton(life)}
      ${job}
    </div>

`;
}

export { mapView, phoneButton };
