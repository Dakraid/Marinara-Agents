// Faint memory text and slipping away together at a party
import { characterOf, hasMet2, isNpc } from "../game.mjs";
import { ADULT_SLIP_ID, CLUB_DANCE_MILESTONE } from "./tuning.mjs";
import { groupCandidates, othersInScene } from "./intimate-milestone.mjs";
import { adultSleepTogetherAvailability } from "./sleep-together.mjs";
import { INTIMATE_MILESTONE } from "./milestone-ids.mjs";

var clubStaffList = (adult) => adult?.staff ?? [];
function adultFaintMemory(state, adult, scene) {
  if (scene?.milestone === CLUB_DANCE_MILESTONE) {
    return "they were giving the player a private dance, in the private room of the strip club where they work";
  }
  if (scene?.milestone !== INTIMATE_MILESTONE) {
    return;
  }
  let isGroup = othersInScene(scene).length > 0,
    who = isGroup ? "all of them" : "the two of them";
  if (scene.about?.go || scene.about?.pick) {
    return {
      line: `the player had asked to go somewhere private together, and ${who} were about to go there, or on their way; nothing had happened between them yet`,
      each: isGroup,
    };
  }
  let where = scene.about?.spot === "spot" ? "in a corner of a public place" : "somewhere private";
  return {
    line: `${who} were alone together, ${where}, and it was getting intimate between them`,
    each: isGroup,
  };
}
function partySlipAwayCandidates(state, adult, hereIds = []) {
  if (!adult?.on || !adult.youAdult) {
    return [];
  }
  let hereSet = new Set(hereIds);
  return hereIds
    .filter((id) => characterOf(state, id) && !isNpc(state, id) && hasMet2(state, id))
    .flatMap((id) => {
      let availability = adultSleepTogetherAvailability(state, adult, id, {
        place: false,
      });
      if (!availability.show) {
        return [];
      }
      let why = availability.why,
        also = why
          ? []
          : groupCandidates(state, id)
              .filter((candidate) => candidate.here && hereSet.has(candidate.id) && hasMet2(state, candidate.id))
              .map((candidate) => ({
                id: candidate.id,
                ok: true,
                why: "",
                not: (candidate.not ?? []).filter((id2) => hereSet.has(id2)),
              }));
      return [
        {
          id: id,
          ok: !why,
          why: why,
          ...(also.length
            ? {
                also: also,
              }
            : {}),
        },
      ];
    });
}
function adultPartyActs(state, adult, { here = [] } = {}) {
  let candidates = partySlipAwayCandidates(state, adult, here);
  return candidates.length
    ? [
        {
          id: ADULT_SLIP_ID,
          label: "Slip away together",
          note: "A room of the house",
          who: candidates,
        },
      ]
    : [];
}
function adultPartyActChosen(state, adult, { id: actId, with: withId, also = [] } = {}) {
  return actId !== ADULT_SLIP_ID ||
    !partySlipAwayCandidates(state, adult, [withId, ...also]).find((candidate) => candidate.id === withId)?.ok
    ? null
    : {
        milestone: INTIMATE_MILESTONE,
        how: "party",
      };
}

export { adultFaintMemory, adultPartyActChosen, adultPartyActs, clubStaffList, partySlipAwayCandidates };
