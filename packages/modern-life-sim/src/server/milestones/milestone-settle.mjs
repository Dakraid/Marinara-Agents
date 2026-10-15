// Milestone choice options, verdicts and per-milestone outcome settlers
import { clockFromMinutes, formatClockTime } from "../time/clock.mjs";
import { RESIDENCE_TO_HOME_KIND } from "../housing/residence-units.mjs";
import { advanceEventBeat } from "../events/event-run.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import {
  BOND_AXES,
  RELATIONSHIP_STATUS_LABELS,
  STATUS_STEPS,
  adjustBondAxis,
  applyBondAction,
  markTraitsSeen,
  resolveDrift,
  setRelationshipStatus,
  settleTierEvent,
} from "../relationships/bonds.mjs";
import { SPECIAL_OPTION_LABELS, SPECIAL_OPTION_NOTES, SPECIAL_STEP_OPTIONS } from "../relationships/special-events.mjs";
import {
  MILESTONES,
  MILESTONE_COUPLE_STATUSES,
  PARTNER_PAIR_MILESTONES,
  TALK_TRUST_FLOOR,
} from "../relationships/milestones.mjs";
import { judgeSceneReads, tierRetryAt } from "../relationships/tier-steps.mjs";
import { endScene } from "../scenes/scene-engine.mjs";
import { ITEM_CATALOG } from "../items/catalog.mjs";
import { cookDishIntoFridge } from "../items/cooking.mjs";
import { receiveItem } from "../items/inventory.mjs";
import { npcPairBetween, npcPairKey } from "../network/npc-pairs.mjs";
import { FACT_ACT_PHRASES, recordTownFact } from "../network/town-facts.mjs";
import { OUTING_KINDS } from "../outings/outing-rules.mjs";
import { characterPortrait } from "../characters/portrait-face.mjs";
import { dropUntil, startGuest } from "../social/guest-visits.mjs";
import {
  askPlanVerdict,
  createGroupPlan,
  partyThen,
  planPlaceName,
  planStillFits,
  takeTheirPlan,
  yourBusy,
} from "../plans/plans.mjs";
import { BDAY_INVITE, BDAY_SURPRISE } from "../relationships/birthday-events.mjs";
import { yourPartyOn } from "../parties/house-party.mjs";
import {
  answerTheirPartyInvite,
  settleFirstPartyGuestScene,
  settlePartyDoorScene,
  settlePartyEventAsk,
} from "../parties/party.mjs";
import { recordDebt } from "../relationships/friend-perks.mjs";
import {
  MATE_AGAIN_DAYS,
  MATE_IN_GAIN,
  MATE_MOMENTS,
  MATE_OUT_COST,
  addHomeMemory,
  agreesToMoveIn,
  breakUpWith,
  moveInWithYou,
  moveOutToOwnPlace,
} from "../home/housemates.mjs";
import { leaveOwnHome, returnHomeFromLodging } from "../home/residence.mjs";
import { eatDish, theirDish } from "../things/things-actions.mjs";
import { sawIt } from "../social/witnesses.mjs";
import { knownName } from "../relationships/network-sheet.mjs";
import { objectOf, pronounOf } from "../romance/romanceability.mjs";
import {
  agreesToMarry,
  agreesToOpen,
  hurtBond,
  isPartner,
  jealousOutcome,
  learnedFact,
  settledPair,
} from "../romance/jealousy.mjs";
import {
  AFTER_EXCHANGES,
  PARTNER_MOOD_LABEL,
  partnersChips,
  partnersNote,
  settleHerOrMe,
  settleMeetAsk,
  settlePartnersMeet,
  settleThree,
} from "../romance/multiple-partners.mjs";
import { workingHome } from "../cast/working-now.mjs";
import { DAY_MINUTES, ownVerdict, settleOwn } from "../bonds/own-moments.mjs";
import { proposalYes, settlePropose, tonightTitle, tonightView } from "../romance/proposal.mjs";
import { RING_VISIT } from "../romance/marriage-events.mjs";
import { opinionOptions, settleOpinion } from "../relationships/friend-opinion.mjs";
import { SURPRISE_ROMANCE } from "../relationships/extremes.mjs";
import {
  CONFESS_NO,
  CONFESS_RETRY_DAY_MINUTES,
  PLANNED_OUTING_ASKS,
  SPECIAL_MILESTONE_HANDLERS,
  TRIANGLE_MILESTONES,
  datingWhy,
  itemNameOf,
  plannedAskGone,
  roomFor,
} from "./milestone-availability.mjs";
import { STAY_AWAY_DAYS, TOLD_TRUST, seenOrTold } from "../relationships/cast-meets.mjs";
import {
  bondOf,
  characterOf,
  hasMet2,
  isCharacterHere,
  logNote,
  nameFor,
  rememberScene,
  sceneCallOpen,
  sharesYourDoor,
  traitsOf,
} from "../game.mjs";
import { PARTY_EVENT_MILESTONES } from "../parties/party-milestone-ids.mjs";

function milestoneOptions(game, scene) {
  let charName = nameFor(game, characterOf(game, scene.characterId)),
    room = roomFor(game, scene.characterId),
    title = MILESTONES[scene.milestone]?.title(charName) ?? "",
    byThem = scene.by === "them",
    labels = {
      step: {
        label: byThem ? "Yes" : scene.step || title,
      },
      wait: {
        label: "Not yet",
      },
      yours: {
        label: room.already ? "Live together as a couple" : `${charName} moves in with you`,
        ok: room.roomYours || room.already,
        why: "No room left at yours",
      },
      theirs: {
        label: `You move in with ${charName}`,
        ok: room.roomTheirs && !room.already,
        why: room.already ? "You already live together" : room.theirsWhy || "No room for two",
      },
      go: {
        label: scene.milestone === "talk" ? `Let ${charName} go` : "End it",
      },
      stay: {
        label: scene.milestone === "talk" ? (byThem ? `Ask ${charName} to stay` : "Make it right") : "Take it back",
      },
      ...(scene.milestone === "propose"
        ? byThem
          ? {
              step: {
                label: "Say yes",
              },
              wait: {
                label: "Not yet",
              },
            }
          : {
              step: {
                label: `Propose \xB7 the ${(itemNameOf(scene.about?.ring) || "ring").toLowerCase()}`,
              },
              wait: {
                label: "Not today",
              },
            }
        : {}),
      ...(scene.milestone === "open-ask"
        ? {
            step: {
              label: `Ask about ${nameFor(
                game,
                characterOf(game, scene.about?.with) ?? {
                  id: "",
                  name: "them",
                },
              )}`,
            },
            wait: {
              label: "Let it be",
            },
          }
        : {}),
      ...(scene.milestone === "their-confess"
        ? {
            step: {
              label: "Say yes",
            },
            wait: {
              label: "Not yet",
            },
          }
        : {}),
      show: {
        label: "Show it off \xB7 tell them everything",
      },
      modest: {
        label: "Keep it simple",
      },
      ...(scene.milestone === "marry-ask"
        ? {
            step: {
              label: `Ask about marrying ${nameFor(
                game,
                characterOf(game, scene.about?.with) ?? {
                  id: "",
                  name: "them",
                },
              )}`,
            },
            wait: {
              label: "Let it be",
            },
          }
        : {}),
      "back-off": {
        label: "Back off",
      },
      refuse: {
        label: "Refuse",
      },
      allow: {
        label: "Let it go on",
      },
      stop: {
        label: `Ask ${charName} to stop`,
      },
      end: {
        label: "Break up",
      },
      yes: {
        label: "Say yes",
      },
      no: {
        label: "Say no",
      },
      apologize: {
        label: "Apologize",
      },
      explain: {
        label: "Explain",
      },
      ...Object.fromEntries(
        Object.entries(SPECIAL_OPTION_LABELS).map(([optionId, label]) => [
          optionId,
          {
            label: label,
            ...(SPECIAL_OPTION_NOTES[optionId]
              ? {
                  note: SPECIAL_OPTION_NOTES[optionId],
                }
              : {}),
          },
        ]),
      ),
      ...(SPECIAL_STEP_OPTIONS[scene.milestone]
        ? Object.fromEntries(
            SPECIAL_STEP_OPTIONS[scene.milestone].map((option) => [
              option,
              {
                label: SPECIAL_OPTION_LABELS[option],
                ok: !datingWhy(game, bondOf(game, scene.characterId)),
                why: datingWhy(game, bondOf(game, scene.characterId)),
              },
            ]),
          )
        : {}),
      ...(scene.milestone === "tells-you" ? tellsYouLabels(game, scene) : {}),
      ...(scene.milestone === "talk-other"
        ? {
            "stay-away": {
              label: `Ask ${objectOf(game, scene.characterId)} to stay away from ${knownName(game, scene.about?.with)}`,
            },
            "let-be": {
              label: "Let it be",
            },
          }
        : {}),
      ...(["hit-on", "surprise"].includes(scene.milestone)
        ? {
            on: {
              label: "The talk goes on",
            },
          }
        : {}),
      ...(scene.milestone === "party-first"
        ? {
            on: {
              label: "Let the party begin",
            },
          }
        : {}),
      ...(scene.milestone === "money-help"
        ? {
            take: {
              label: `Take it \xB7 $${scene.about?.amount ?? 0}`,
              note: `A loan: you pay ${objectOf(game, scene.characterId)} back`,
            },
            decline: {
              label: "Thank them, but no",
            },
          }
        : {}),
      ...(scene.milestone === "who-was-that"
        ? {
            explain: {
              label: `Tell ${objectOf(game, scene.characterId)} who it was`,
            },
            brush: {
              label: "Brush it off",
            },
          }
        : {}),
      ...(scene.milestone === "open-offer"
        ? {
            yes: {
              label: "Say yes",
              note: "You can both see other people",
            },
            no: {
              label: "Say no",
            },
          }
        : {}),
      ...(scene.milestone === "missed-you"
        ? {
            stay: {
              label: `Stay with ${objectOf(game, scene.characterId)} a while`,
            },
            busy: {
              label: "Tell them you're busy",
            },
          }
        : {}),
      ...(scene.milestone === "party-invite"
        ? {
            yes: {
              label: "I'll be there",
              note: scene.about?.when ?? "",
              ...planClashBlock(game, scene.about?.plan?.at),
            },
            wait: {
              label: "I can't make it",
            },
          }
        : {}),
      ...(scene.milestone === "party-crush"
        ? {
            cheer: {
              label: "Cheer them on",
            },
            tease: {
              label: "Tease them about it",
            },
          }
        : {}),
      ...(scene.milestone === "party-fight"
        ? {
            calm: {
              label: "Calm them both down",
            },
            side: {
              label: `Take ${charName}'s side`,
            },
            out: {
              label: `Ask ${knownName(game, scene.about?.with)} to leave`,
            },
          }
        : {}),
      ...(scene.milestone === "party-stay"
        ? {
            yes: {
              label: "Of course",
            },
            no: {
              label: "Not tonight",
            },
          }
        : {}),
      ...(scene.milestone === "party-arrive"
        ? {
            in: {
              label: "Go in",
            },
          }
        : {}),
      ...(scene.milestone === "party-goodbye"
        ? {
            bye: {
              label: "Head home",
            },
          }
        : {}),
      ...(scene.milestone === "party-hit-off"
        ? {
            cheer: {
              label: "Cheer them on",
            },
            tease: {
              label: "Tease them about it",
            },
            leave: {
              label: "Leave them to it",
            },
          }
        : {}),
      ...(scene.milestone === "party-row"
        ? {
            calm: {
              label: "Calm them both down",
            },
            side: {
              label: `Take ${charName}'s side`,
            },
            leave: {
              label: "Stay out of it",
            },
          }
        : {}),
      ...(scene.milestone === "party-drunk"
        ? {
            care: {
              label: `Look after ${objectOf(game, scene.characterId)}`,
            },
            leave: {
              label: "Let it be",
            },
          }
        : {}),
      ...(scene.milestone === "party-toast"
        ? {
            glass: {
              label: "Raise your glass",
            },
            words: {
              label: "Say a few words yourself",
            },
          }
        : {}),
      ...(scene.milestone === "party-crasher"
        ? ((option) => ({
            welcome: {
              label: `Welcome ${option}`,
            },
            out: {
              label: `Ask ${option} to leave`,
            },
          }))(hasMet2(game, scene.about?.with) ? knownName(game, scene.about?.with) : `${charName}'s friend`)
        : {}),
      ...(scene.milestone === "mate-in"
        ? byThem
          ? {
              step: {
                label: "Say yes",
                note: "They move in with you",
              },
              wait: {
                label: "Not now",
              },
            }
          : {
              step: {
                label: `Ask ${objectOf(game, scene.characterId)} to move in`,
              },
              wait: {
                label: "Let it be",
              },
            }
        : {}),
      ...(scene.milestone === "mate-out"
        ? {
            go: {
              label: `Ask ${objectOf(game, scene.characterId)} to move out`,
              note: "It will cost your friendship",
            },
            stay: {
              label: `Let ${objectOf(game, scene.characterId)} stay`,
            },
          }
        : {}),
      ...(scene.milestone === "mate-moment" ? mateMomentLabels(scene) : {}),
      ...(scene.milestone === "drop-by"
        ? {
            stay: {
              label: `Have ${objectOf(game, scene.characterId)} stay a while`,
              note: `Until ${formatClockTime(dropUntil(game, scene.characterId))} at the latest`,
            },
            short: {
              label: "Keep it short",
              note: "Another day",
            },
          }
        : {}),
      deny: {
        label: "Deny it",
        note:
          scene.about?.how === "seen"
            ? `${pronounOf(game, scene.characterId)} saw it`
            : scene.about?.from
              ? `${nameFor(
                  game,
                  characterOf(game, scene.about.from) ?? {
                    id: scene.about.from,
                    name: "Someone",
                  },
                )} told ${objectOf(game, scene.characterId)}`
              : "",
      },
      ...(TRIANGLE_MILESTONES.includes(scene.milestone)
        ? {
            bring: {
              label: "Bring them together",
            },
            flow: {
              label: "Let it flow",
            },
            short: {
              label: "Keep it short",
            },
            yes: {
              label: "Yes, let's meet",
            },
            notyet: {
              label: "Not yet",
            },
            her: {
              label: `Choose ${charName}`,
            },
            other: {
              label: `Choose ${nameFor(
                game,
                characterOf(game, scene.about?.with) ?? {
                  id: "",
                  name: "the other",
                },
              )}`,
            },
            calm: {
              label: `Calm ${objectOf(game, scene.characterId)} down`,
            },
            refuse: {
              label: "Refuse to choose",
            },
          }
        : {}),
      ...(PARTNER_PAIR_MILESTONES.includes(scene.milestone) ? partnersSceneLabels(game, scene) : {}),
      ...(scene.milestone === "birthday-surprise"
        ? {
            yes: {
              label: "I'm in",
              note: outingLine(game, scene.about?.outing ?? {}),
              chips: [
                {
                  text: `+${BDAY_SURPRISE.yes.romance} ROMANCE`,
                },
                {
                  text: "THEIR TREAT",
                },
              ],
            },
            other: {
              label: "Another night?",
              note: "You set it together",
              chips: [
                {
                  text: `${BDAY_SURPRISE.no.romance} ROMANCE`,
                  bad: true,
                },
              ],
            },
          }
        : scene.milestone === "birthday-invite"
          ? {
              yes: {
                label: "I'll be there",
                note: `${outingLine(game, scene.about?.outing ?? {})}${
                  scene.about?.outing?.with?.length
                    ? ` \xB7 with ${scene.about.outing.with
                        .map((option) =>
                          nameFor(
                            game,
                            characterOf(game, option) ?? {
                              id: option,
                              name: "?",
                            },
                          ),
                        )
                        .join(", ")}`
                    : ""
                }`,
                chips: [
                  {
                    text: `+${BDAY_INVITE.yes.friendship} FRIENDSHIP`,
                  },
                  {
                    text: "TO PLANS",
                  },
                ],
                ...planClashBlock(game, scene.about?.outing?.at),
              },
              wait: {
                label: "I can't make it",
                note: "Tell them why in your own words",
                chips: [
                  {
                    text: `${BDAY_INVITE.no.friendship} FRIENDSHIP`,
                    bad: true,
                  },
                  {
                    text: "A PRESENT OR A MESSAGE STILL COUNTS",
                  },
                ],
              },
            }
          : scene.about?.outing
            ? {
                yes: {
                  label: "Sounds good",
                  note: outingLine(game, scene.about.outing),
                  ...planClashBlock(game, scene.about.outing.at, {
                    shift: false,
                  }),
                  ...outingClashBlock(game, scene),
                },
                other: {
                  label: "Another time",
                },
                wait: {
                  label: "Not this time",
                },
                step: {
                  label: scene.about.label ?? "Ask them",
                },
              }
            : {}),
    };
  if (scene.milestone === "friend-opinion") {
    return opinionOptions(game, scene);
  }
  if (SPECIAL_MILESTONE_HANDLERS[scene.milestone]?.options) {
    return SPECIAL_MILESTONE_HANDLERS[scene.milestone].options(game, scene);
  }
  let triangle = TRIANGLE_MILESTONES.includes(scene.milestone),
    allowed = (option) => !(option === "their-way" && !game.rules?.multipleRelationships);
  return (scene.beats?.find((option) => option.type === "choice")?.options ?? []).filter(allowed).map((option) => ({
    id: option,
    label: scene.labels?.[option] ?? labels[option]?.label ?? option,
    ...(scene.labels?.[option]
      ? {
          labelWritten: true,
        }
      : {}),
    ok: labels[option]?.ok ?? true,
    why: labels[option]?.ok === false ? labels[option].why : "",
    note: triangle ? partnersNote(game, scene, option) : (labels[option]?.note ?? ""),
    ...(triangle
      ? {
          chips: partnersChips(game, scene, option),
        }
      : labels[option]?.chips
        ? {
            chips: labels[option].chips,
          }
        : {}),
  }));
}
function callLabels(game, scene) {
  if (
    scene?.kind !== "milestone" ||
    !String(scene.milestone ?? "").startsWith("party-") ||
    (game.settings?.language ?? "English") === "English"
  ) {
    return null;
  }
  let options = milestoneOptions(game, scene);
  return options.length ? Object.fromEntries(options.map((option) => [option.id, option.label])) : null;
}
function partnersSceneLabels(game, scene) {
  let nameOfId = (charId) =>
      nameFor(
        game,
        characterOf(game, charId) ?? {
          id: "",
          name: "them",
        },
      ),
    charName = nameOfId(scene.characterId),
    withName = nameOfId(scene.about?.with),
    plan = scene.about?.plan;
  return {
    "partners-tease": {
      play: {
        label: "Play along",
      },
      turn: {
        label: "Turn it on them",
      },
    },
    "partners-compete": {
      a: {
        label: `Go to ${charName}`,
      },
      b: {
        label: `Go to ${withName}`,
      },
      share: {
        label: "Make room for both",
      },
    },
    "partners-argue": {
      a: {
        label: `Side with ${charName}`,
      },
      b: {
        label: `Side with ${withName}`,
      },
      calm: {
        label: "Calm them down",
      },
    },
    "partners-plan": {
      yes: {
        label: plan ? `Yes \xB7 ${outingLine(game, plan)}` : "Yes",
      },
      wait: {
        label: "Not this time",
      },
    },
  }[scene.milestone];
}
function planClashBlock(game, at, { shift = true } = {}) {
  let busy =
    Number.isFinite(at) && at > game.minutes
      ? yourBusy(game, at, {
          shift: shift,
        })
      : "";
  return busy
    ? {
        ok: false,
        why: `You have plans then: ${busy.toLowerCase().startsWith("your") ? busy.toLowerCase() : busy}`,
      }
    : {};
}
function outingClashBlock(game, scene) {
  let outing = scene.about?.outing;
  if (
    !Number.isFinite(outing?.at) ||
    outing.at <= game.minutes ||
    planClashBlock(game, outing.at, {
      shift: false,
    }).why
  ) {
    return {};
  }
  let party = partyThen(game, {
    ...outing,
    characterId: scene.characterId,
  });
  return party
    ? {
        ok: false,
        why: `${party[0].toUpperCase()}${party.slice(1)} is then`,
      }
    : {};
}
function settleBirthdayInvite({ game: game, scene: scene, bond: bond, choice: choice, at: at }) {
  let outing = scene.about?.outing;
  if (((bond.asks = null), outing && outing.at < game.minutes)) {
    scene.outcome = {
      headline: "It already happened.",
    };
  } else if (choice === "yes" && outing?.house) {
    answerTheirPartyInvite(
      game,
      bond,
      {
        host: bond.characterId,
        at: outing.at,
        guests: outing.with ?? [],
        place: characterOf(game, bond.characterId)?.residence?.place,
        ...(outing.home
          ? {
              home: true,
            }
          : {}),
      },
      true,
      {
        birthday: {
          of: bond.characterId,
        },
      },
    );
    adjustBondAxis(bond, "friendship", BDAY_INVITE.yes.friendship, {
      at: at,
    });
    scene.outcome = {
      headline: `On your plans \xB7 ${clockFromMinutes(outing.at).weekday} ${formatClockTime(outing.at)}`,
    };
  } else if (choice === "yes" && outing) {
    let plan = createGroupPlan(game, {
      characterId: bond.characterId,
      kind: outing.kind,
      place: outing.place,
      at: outing.at,
      by: "them",
      with: outing.with ?? [],
    });
    plan.birthday = {
      of: bond.characterId,
    };
    adjustBondAxis(bond, "friendship", BDAY_INVITE.yes.friendship, {
      at: at,
    });
    scene.outcome = calendarOutcome(game, outing);
  } else {
    hurtBond(bond, BDAY_INVITE.no);
    if (outing?.house) {
      answerTheirPartyInvite(
        game,
        bond,
        {
          host: bond.characterId,
          at: outing.at,
          guests: outing.with ?? [],
          place: characterOf(game, bond.characterId)?.residence?.place,
          ...(outing.home
            ? {
                home: true,
              }
            : {}),
        },
        false,
        {
          birthday: {
            of: bond.characterId,
          },
        },
      );
    }
    scene.outcome = {
      headline: "You can't make it.",
    };
  }
}
function settleBirthdaySurprise({ game: game, scene: scene, bond: bond, choice: choice, at: at }) {
  let outing = scene.about?.outing;
  if (((bond.asks = null), outing && outing.at < game.minutes)) {
    scene.outcome = {
      headline: "Too late for tonight.",
    };
  } else if (outing && yourPartyOn(game, Math.floor(outing.at / 1440))) {
    scene.outcome = {
      headline: "Your party is tonight.",
    };
  } else if (choice === "yes" && outing) {
    let plan = createGroupPlan(game, {
      characterId: bond.characterId,
      kind: outing.kind,
      place: outing.place,
      at: outing.at,
      by: "them",
    });
    plan.birthday = {
      of: "you",
    };
    adjustBondAxis(bond, "romance", BDAY_SURPRISE.yes.romance, {
      at: at,
    });
    scene.outcome = calendarOutcome(game, outing);
  } else {
    hurtBond(bond, BDAY_SURPRISE.no);
    scene.outcome = {
      headline: "Another night.",
      invite: outing
        ? {
            kind: outing.kind,
            place: outing.place,
          }
        : null,
    };
  }
}
var outingLine = (game, outing) =>
  `${OUTING_KINDS[outing.kind]?.name ?? ""} \xB7 ${planPlaceName(game, outing)} \xB7 ${clockFromMinutes(outing.at).weekday} ${clockFromMinutes(outing.at).day} \xB7 ${formatClockTime(outing.at)}`;
var characterChip = (game, charId) => {
  let character = characterOf(game, charId);
  return {
    id: charId,
    name: character ? nameFor(game, character) : "?",
    ...characterPortrait(character, game),
  };
};
function milestoneView(game, scene) {
  let milestone = MILESTONES[scene.milestone],
    charName = nameFor(game, characterOf(game, scene.characterId));
  return {
    id: scene.milestone,
    by: scene.by,
    title: milestone?.title(charName, scene) ?? "",
    phase: scene.phase,
    to: milestone?.to ? RELATIONSHIP_STATUS_LABELS[milestone.to] : null,
    flag: milestone?.flag ?? null,
    options: milestoneOptions(game, scene),
    choice: scene.choice ?? null,
    verdict: scene.verdict,
    detected:
      scene.detected && !scene.done
        ? {
            act: scene.detected.act,
          }
        : null,
    inviteAgain: scene.done && scene.outcome?.invite ? scene.outcome.invite : null,
    pairs:
      scene.done && scene.outcome?.pairs
        ? scene.outcome.pairs.map((pair) => ({
            a: characterChip(game, pair.a),
            b: characterChip(game, pair.b),
            mood: pair.mood,
            label: pair.label ?? PARTNER_MOOD_LABEL[pair.mood],
          }))
        : null,
    tonight: tonightView(game, scene),
    tonightTitle: tonightTitle(game, scene),
    pickDay:
      scene.done &&
      scene.milestone === "propose" &&
      !!game.wedding &&
      game.wedding.day === null &&
      game.wedding.characterId === scene.characterId,
    answers:
      scene.done && scene.outcome?.answers
        ? scene.outcome.answers.map((answer) => ({
            ...characterChip(game, answer.id),
            tag: answer.tag,
            why: answer.why ?? "",
            ...(answer.bad
              ? {
                  bad: true,
                }
              : {}),
          }))
        : null,
    free: !!SPECIAL_MILESTONE_HANDLERS[scene.milestone]?.free?.(game, scene),
    endable: !!SPECIAL_MILESTONE_HANDLERS[scene.milestone]?.endable?.(game, scene),
  };
}
function milestoneVerdict(game, optionId) {
  let scene = game.scene;
  if (!scene || scene.kind !== "milestone" || scene.done || !sceneCallOpen(scene, optionId)) {
    return {
      ok: false,
      reason: "There is no call to make.",
    };
  }
  let option = milestoneOptions(game, scene).find((opt) => opt.id === optionId);
  if (option && !option.ok) {
    return {
      ok: false,
      reason: option.why,
    };
  }
  if (optionId === "their-way" && !option) {
    return {
      ok: false,
      reason: "Switch on \xABMultiple relationships\xBB in RULES first.",
    };
  }
  let accepted = judgeSceneReads(scene.reads).accepted;
  if (scene.milestone === "break-up") {
    return {
      ok: true,
      accepted: optionId === "go",
    };
  }
  if (scene.milestone === "mate-in") {
    return {
      ok: true,
      accepted: optionId === "step" && (scene.by === "them" || agreesToMoveIn(game, scene, accepted)),
    };
  }
  if (scene.milestone === "mate-out") {
    return {
      ok: true,
      accepted: optionId === "go",
    };
  }
  if (scene.milestone === "mate-moment") {
    return {
      ok: true,
      accepted: true,
    };
  }
  if (scene.milestone === "talk") {
    return {
      ok: true,
      accepted: optionId === "stay" && accepted,
    };
  }
  if (scene.milestone === "where-were-you") {
    return {
      ok: true,
      accepted: accepted,
    };
  }
  if (scene.milestone === "open-ask") {
    return {
      ok: true,
      accepted: optionId === "step" && agreesToOpen(game, scene, accepted),
    };
  }
  if (scene.milestone === "marry-ask") {
    return {
      ok: true,
      accepted: optionId === "step" && agreesToMarry(game, scene, accepted),
    };
  }
  if (scene.milestone === "their-confess") {
    return {
      ok: true,
      accepted: optionId === "step",
    };
  }
  if (scene.milestone === "see-ring") {
    return {
      ok: true,
      accepted: true,
    };
  }
  if (scene.milestone === "friend-opinion") {
    return {
      ok: true,
      accepted: optionId === "agree",
    };
  }
  if (scene.milestone === "confront") {
    return {
      ok: true,
      accepted: true,
    };
  }
  if (scene.milestone === "stay-away") {
    return {
      ok: true,
      accepted: optionId === "deny" && scene.about?.how === "seen" ? false : accepted,
    };
  }
  if (scene.milestone === "open-them") {
    return {
      ok: true,
      accepted: optionId === "yes",
    };
  }
  let planGone =
    PLANNED_OUTING_ASKS.includes(scene.milestone) &&
    plannedAskGone(game, bondOf(game, scene.characterId), scene.milestone, scene.about?.outing);
  if (scene.milestone === "ask-you-out" || scene.milestone === "their-plan") {
    return {
      ok: true,
      accepted:
        optionId === "yes" &&
        !planGone &&
        planStillFits(game, {
          ...scene.about?.outing,
          characterId: scene.characterId,
        }),
    };
  }
  if (scene.milestone === "birthday-invite" || scene.milestone === "birthday-surprise") {
    return {
      ok: true,
      accepted: optionId === "yes" && !planGone,
    };
  }
  if (scene.milestone === "ask-plan") {
    return {
      ok: true,
      accepted: optionId === "step" && askPlanVerdict(game, scene).answer === "yes",
    };
  }
  if (
    scene.milestone === "partners-meet" ||
    scene.milestone === "her-or-me" ||
    PARTNER_PAIR_MILESTONES.includes(scene.milestone)
  ) {
    return {
      ok: true,
      accepted: true,
    };
  }
  if (scene.milestone === "meet-ask") {
    return {
      ok: true,
      accepted: optionId === "yes",
    };
  }
  if (MILESTONES[scene.milestone]?.own) {
    scene.ownOut = ownVerdict(game, scene, optionId);
    return {
      ok: true,
      accepted: scene.ownOut.accepted,
    };
  }
  if (scene.milestone === "propose") {
    return {
      ok: true,
      accepted: optionId === "wait" ? false : scene.by === "them" ? true : proposalYes(game, scene),
    };
  }
  if (scene.milestone === "jealous") {
    return {
      ok: true,
      accepted: optionId === "deny" && scene.about?.how === "seen" ? false : accepted,
    };
  }
  if (optionId === "wait") {
    return {
      ok: true,
      accepted: false,
    };
  }
  let defaultChoice = {
    "open-offer": "yes",
    "money-help": "take",
    "missed-you": "stay",
    "drop-by": "stay",
  };
  return PARTY_EVENT_MILESTONES.includes(scene.milestone)
    ? {
        ok: true,
        accepted: true,
      }
    : scene.milestone === "party-invite"
      ? {
          ok: true,
          accepted: optionId === "yes",
        }
      : scene.milestone === "party-first" || scene.milestone === "party-arrive" || scene.milestone === "party-goodbye"
        ? {
            ok: true,
            accepted: true,
          }
        : defaultChoice[scene.milestone]
          ? {
              ok: true,
              accepted: optionId === defaultChoice[scene.milestone],
            }
          : ["tells-you", "hit-on", "surprise"].includes(scene.milestone)
            ? {
                ok: true,
                accepted: true,
              }
            : scene.milestone === "who-was-that"
              ? {
                  ok: true,
                  accepted: optionId === "explain" && accepted,
                }
              : scene.milestone === "ice-over"
                ? {
                    ok: true,
                    accepted: accepted,
                  }
                : scene.milestone === "talk-other"
                  ? {
                      ok: true,
                      accepted: optionId === "stay-away" && accepted,
                    }
                  : {
                      ok: true,
                      accepted: scene.by === "them" ? true : accepted,
                    };
}
var brokeUpEvent = (charId, at) => ({
  id: "broke-up",
  characterId: charId.characterId,
  text: `You and ${at?.name ?? "them"} broke up.`,
});
function agreeOpenWith({ game: game, bond: bond, character: character, at: at, events: events }, withId, lines) {
  bond.open = {
    ...(bond.open ?? {}),
    them: {
      ...(bond.open?.them ?? {}),
      [withId]: at,
    },
  };
  if (lines) {
    lines.secret = false;
  }
  events.push({
    id: "open",
    characterId: bond.characterId,
    text: `${character?.name ?? "They"} can see ${knownName(game, withId)}: it is agreed now.`,
  });
}
function settleBreakUpOrTalk({
  game: game,
  scene: scene,
  bond: bond,
  character: character,
  accepted: accepted,
  at: at,
  events: events,
}) {
  if (scene.milestone === "break-up" ? accepted : !accepted) {
    events.push(brokeUpEvent(bond, character));
    breakUpWith(
      game,
      bond,
      {
        at: at,
      },
      events,
    );
    scene.seenBy = recordTownFact(game, "breakup", {
      with: bond.characterId,
      place: game.at,
      witnesses: sawIt(game, bond.characterId),
    });
  } else if (scene.milestone === "talk") {
    if (scene.by === "you") {
      markTraitsSeen(bond, "proud");
    }
    bond.trust = Math.max(bond.trust, TALK_TRUST_FLOOR + 5);
    bond.driftOwed = false;
    bond.lastSeen = at;
  } else {
    applyBondAction(
      bond,
      {
        action: "reliable",
        trust: -3,
      },
      {
        at: at,
        today: false,
        share: "event",
      },
    );
  }
}
function settleWhereWereYou({
  game: game,
  scene: scene,
  bond: bond,
  character: character,
  accepted: accepted,
  at: at,
  events: events,
}) {
  bond.driftOwed = true;
  scene.outcome = {
    headline: accepted ? "You made it up to them." : "You drifted apart a little.",
  };
  let drift = resolveDrift(bond, {
    repaired: accepted,
    at: at,
  });
  if (!accepted) {
    events.push({
      id: "drifted",
      characterId: bond.characterId,
      text: `You and ${character?.name ?? "them"} drifted apart a little.`,
    });
  }
  return drift;
}
var calendarOutcome = (game, plan) => {
  let clock = clockFromMinutes(plan.at);
  return {
    stamp: "ON YOUR CALENDAR",
    headline: `${OUTING_KINDS[plan.kind].name} \xB7 ${planPlaceName(game, plan)} \xB7 ${clock.weekday} ${clock.day} \xB7 ${formatClockTime(plan.at)}.`,
  };
};
function settleOutingAsk({ game: game, scene: scene, bond: bond, choice: choice, accepted: accepted, at: at }) {
  let outing = scene.about?.outing;
  if (scene.milestone === "ask-plan") {
    let verdict = accepted ? null : askPlanVerdict(game, scene);
    if (accepted) {
      takeTheirPlan(game, bond.characterId, outing, {
        by: "you",
      });
    }
    scene.outcome = accepted
      ? calendarOutcome(game, outing)
      : choice === "wait"
        ? {
            headline: "You let it be.",
          }
        : {
            headline: verdict?.answer === "counter" ? "Not then." : "Not this time.",
          };
    return;
  }
  if (choice === "yes") {
    let taken = takeTheirPlan(game, bond.characterId, outing, {
      by: "them",
    });
    scene.outcome = taken
      ? calendarOutcome(game, outing)
      : {
          headline: "It doesn't fit any more.",
        };
  } else if (choice === "other") {
    scene.outcome = {
      headline: "Another time.",
      invite: {
        kind: outing.kind,
        place: outing.place,
      },
    };
  } else {
    applyBondAction(
      bond,
      {
        action: outing.kind === "date" ? "flirt" : "time",
        [outing.kind === "date" ? "romance" : "friendship"]: -1,
      },
      {
        at: at,
        today: false,
        share: "event",
      },
    );
    bond.askedOutAt = at;
    scene.outcome = {
      headline: "Not this time.",
    };
  }
}
var MILESTONE_SETTLERS = {
  "partners-meet": settlePartnersMeet,
  "meet-ask": settleMeetAsk,
  "her-or-me": settleHerOrMe,
  propose: settlePropose,
  ...Object.fromEntries(PARTNER_PAIR_MILESTONES.map((milestoneId) => [milestoneId, settleThree])),
  "ask-you-out": settleOutingAsk,
  "birthday-invite": settleBirthdayInvite,
  "birthday-surprise": settleBirthdaySurprise,
  "their-plan": settleOutingAsk,
  "ask-plan": settleOutingAsk,
  "where-were-you": settleWhereWereYou,
  "mate-in": settleMateIn,
  "mate-out": settleMateOut,
  "mate-moment": settleMateMoment,
  "break-up": settleBreakUpOrTalk,
  talk: settleBreakUpOrTalk,
  "stay-away": ({ game: game, scene: scene, bond: bond, choice: choice, accepted: accepted, at: at }) => {
    let about = scene.about ?? {},
      pair = about.with ? npcPairBetween(game, bond.characterId, about.with) : null;
    if (choice === "back-off") {
      bond.promised = {
        with: about.with,
        at: at,
      };
      hurtBond(bond, {
        friendship: -1,
      });
    } else if (choice === "refuse") {
      hurtBond(bond, {
        friendship: -5,
        trust: -4,
      });
      if (pair) {
        pair.close = Math.max(0, pair.close - 6);
      }
    } else if (accepted) {
      bond.lies = [
        ...(bond.lies ?? []),
        {
          fact: about.fact ?? null,
          at: at,
        },
      ].slice(-20);
    } else {
      hurtBond(bond, {
        friendship: -3,
        trust: -6,
      });
    }
    scene.outcome = {
      believed: choice === "deny" && accepted,
      ends: false,
    };
    bond.stayAway = null;
  },
  confront: (ctx) => {
    let { game: game, scene: scene, bond: bond, character: character, choice: choice, at: at, events: events } = ctx,
      withId = scene.about?.with,
      pair = withId ? npcPairBetween(game, bond.characterId, withId) : null;
    for (let known of game.youKnow ?? []) {
      if (npcPairKey(known.a, known.b) === npcPairKey(bond.characterId, withId)) {
        known.confronted = true;
      }
    }
    if (scene.about?.denies) {
      bond.denied = {
        with: withId,
        at: at,
      };
    }
    scene.outcome = {
      headline: choice === "allow" ? "You let it go on." : choice === "stop" ? "You asked them to stop." : "It's over.",
    };
    if (choice === "allow") {
      agreeOpenWith(ctx, withId, pair);
    } else if (choice === "stop") {
      if (pair) {
        Object.assign(pair, {
          kind: pair.close >= 70 ? "close" : "friends",
          romance: Math.min(pair.romance ?? 0, 15),
          secret: false,
        });
      }
      applyBondAction(
        bond,
        {
          action: "reliable",
          trust: -2,
        },
        {
          at: at,
          today: false,
          share: "event",
        },
      );
    } else {
      if (pair) {
        pair.secret = false;
      }
      events.push(brokeUpEvent(bond, character));
      breakUpWith(
        game,
        bond,
        {
          at: at,
          how: "cheated",
        },
        events,
      );
    }
  },
  "who-was-that": ({ scene: scene, bond: bond, choice: choice, accepted: accepted, at: at }) => {
    markTraitsSeen(bond, "jealousy");
    if (choice === "explain") {
      hurtBond(bond, {
        trust: accepted ? 1 : -2,
      });
    } else {
      hurtBond(bond, {
        trust: -3,
      });
    }
    scene.outcome = {
      headline:
        choice !== "explain" ? "It doesn't sit well." : accepted ? "They believe you." : "They're not convinced.",
    };
  },
  "open-offer": ({
    game: game,
    scene: scene,
    bond: bond,
    character: character,
    choice: choice,
    at: at,
    events: events,
  }) => {
    markTraitsSeen(bond, "jealousy");
    scene.outcome = {
      headline: choice === "yes" ? "You can both see other people." : "Just the two of you.",
    };
    if (choice === "yes") {
      bond.open = {
        you: {
          ...(bond.open?.you ?? {}),
          "*": at,
        },
        them: {
          ...(bond.open?.them ?? {}),
          "*": at,
        },
      };
      events.push({
        id: "open",
        characterId: bond.characterId,
        text: `You and ${character?.name ?? "them"} can both see other people now.`,
      });
    }
  },
  surprise: ({ game: game, scene: scene, bond: bond, character: character, at: at, events: events }) => {
    markTraitsSeen(bond, "romantic");
    scene.outcome = {
      headline: "A little surprise.",
    };
    adjustBondAxis(bond, "romance", SURPRISE_ROMANCE, {
      at: at,
    });
    let itemId = scene.about?.item,
      received = itemId ? receiveItem(game.things, itemId) : null;
    if (received) {
      events.push({
        id: "surprise",
        characterId: bond.characterId,
        text: `${character?.name ?? "They"} gave you ${ITEM_CATALOG[itemId]?.name?.toLowerCase() ?? "something"}${received === "home" ? ": your backpack is full, it waits at home" : ""}.`,
      });
    }
  },
  "money-help": ({
    game: game,
    scene: scene,
    bond: bond,
    character: character,
    choice: choice,
    at: at,
    events: events,
  }) => {
    markTraitsSeen(bond, "caring");
    let amount = scene.about?.amount ?? 0;
    scene.outcome = {
      headline: choice === "take" && amount > 0 ? `A loan of $${amount}.` : "You thanked them, but no.",
    };
    if (!(choice !== "take" || amount <= 0)) {
      game.wallet.cash += amount;
      game.wallet.ledger.push({
        at: at,
        amount: amount,
        label: `Lent by ${character?.name ?? "someone"}`,
        balance: game.wallet.cash,
      });
      recordDebt(game, bond.characterId, amount, scene.about?.for ?? "rent");
      events.push({
        id: "helped",
        characterId: bond.characterId,
        text: `${character?.name ?? "They"} lent you $${amount}. You owe it back.`,
      });
    }
  },
  "ice-over": ({ scene: scene, bond: bond, accepted: accepted, at: at }) => {
    markTraitsSeen(bond, "forgiveness");
    bond.ice = null;
    if (accepted) {
      adjustBondAxis(bond, "trust", 2, {
        at: at,
      });
    }
    scene.outcome = {
      headline: accepted ? "It's behind you." : "Not quite over.",
    };
  },
  "missed-you": ({ game: game, scene: scene, bond: bond, choice: choice, at: at }) => {
    markTraitsSeen(bond, "attention");
    scene.outcome = {
      headline: choice === "stay" ? "You stayed a while." : "Another time.",
    };
    if (choice === "stay") {
      bond.lastSeen = at;
      bond.driftOwed = false;
      adjustBondAxis(bond, MILESTONE_COUPLE_STATUSES.includes(bond.status) ? "romance" : "friendship", 2, {
        at: at,
      });
    } else {
      bond.lastSeen = (bond.lastSeen ?? at) - 2 * DAY_MINUTES;
      hurtBond(bond, {
        friendship: -1,
      });
    }
  },
  "party-first": ({ game: game, scene: scene, bond: bond }) => {
    settleFirstPartyGuestScene(game, scene, bond);
  },
  "party-invite": ({ game: game, scene: scene, bond: bond, choice: choice, at: at }) => {
    let plan = bond.asks?.party ?? scene.about?.plan;
    bond.asks = null;
    let answer = answerTheirPartyInvite(game, bond, plan, choice === "yes");
    if (answer) {
      adjustBondAxis(bond, "friendship", 1, {
        at: at,
      });
    }
    scene.outcome = {
      headline: answer
        ? `On your plans \xB7 ${clockFromMinutes(answer.at).weekday} ${formatClockTime(answer.at)}`
        : plan && plan.at < game.minutes
          ? "It already happened."
          : "You can't make it.",
    };
  },
  ...Object.fromEntries(
    PARTY_EVENT_MILESTONES.map((milestoneId) => [
      milestoneId,
      ({ game: game, scene: scene, bond: bond, choice: choice, events: events }) => {
        events.push(...settlePartyEventAsk(game, scene, bond, choice));
      },
    ]),
  ),
  "party-arrive": ({ game: game, scene: scene, bond: bond }) => {
    settlePartyDoorScene(game, scene, bond);
  },
  "party-goodbye": ({ game: game, scene: scene, bond: bond }) => {
    settlePartyDoorScene(game, scene, bond);
  },
  "drop-by": ({
    game: game,
    scene: scene,
    bond: bond,
    character: character,
    choice: choice,
    at: at,
    events: events,
  }) => {
    if (
      ((bond.lastSeen = at),
      (bond.driftOwed = false),
      adjustBondAxis(
        bond,
        MILESTONE_COUPLE_STATUSES.includes(bond.status) ? "romance" : "friendship",
        choice === "stay" ? 2 : 1,
        {
          at: at,
        },
      ),
      choice !== "stay")
    ) {
      scene.outcome = {
        headline: "A quick hello.",
      };
      return;
    }
    let guest = startGuest(game, bond.characterId);
    scene.outcome = {
      headline: `${nameFor(game, character)} stays a while.`,
    };
    if (guest) {
      events.push({
        id: "guest",
        characterId: bond.characterId,
        text: `${nameFor(game, character)} stays until ${formatClockTime(guest.until)} at the latest.`,
      });
    }
  },
  "tells-you": ({ game: game, scene: scene, bond: bond, choice: choice, at: at, events: events }) => {
    let about = scene.about ?? {},
      partnerId = isPartner(game, about.a) ? about.a : about.b,
      otherId = partnerId === about.a ? about.b : about.a;
    seenOrTold(game, about.a, about.b, {
      how: "heard",
      from: bond.characterId,
      place: about.place ?? null,
      at: at,
    });
    scene.outcome = {
      headline: choice === "keep" ? "You keep it to yourself." : "Now you know.",
    };
    let fact = {
      confront: [partnerId, "confront"],
      other: [otherId, "talk-other"],
      breakup: [partnerId, "break-up"],
    }[choice];
    if (fact) {
      callToMilestone(game, fact[0], fact[1], events, at);
    }
  },
  "talk-other": ({
    game: game,
    scene: scene,
    bond: bond,
    choice: choice,
    accepted: accepted,
    at: at,
    events: events,
  }) => {
    let withId = scene.about?.with;
    if (
      ((scene.outcome = {
        headline: choice !== "stay-away" ? "You let it be." : accepted ? "They'll keep away." : "They won't.",
      }),
      choice !== "stay-away" || !withId)
    ) {
      return;
    }
    let pair = npcPairBetween(game, bond.characterId, withId);
    if (accepted && pair) {
      pair.keepAway = at + STAY_AWAY_DAYS * DAY_MINUTES;
      events.push({
        id: "stay-away-yes",
        characterId: bond.characterId,
        text: `${knownName(game, bond.characterId)} will keep away from ${knownName(game, withId)}.`,
      });
    }
  },
  "hit-on": ({ scene: scene, bond: bond, at: at }) => {
    scene.outcome = {
      headline: "They told you.",
    };
    adjustBondAxis(bond, "trust", TOLD_TRUST, {
      at: at,
    });
    markTraitsSeen(bond, "faithful");
  },
  "open-them": (ctx) => {
    let { game: game, scene: scene, bond: bond, accepted: accepted, at: at } = ctx,
      withId = scene.about?.with,
      pair = withId ? npcPairBetween(game, bond.characterId, withId) : null;
    if (accepted && withId) {
      agreeOpenWith(ctx, withId, pair);
    } else {
      if (pair) {
        pair.romance = Math.max(0, (pair.romance ?? 0) - 20);
      }
      applyBondAction(
        bond,
        {
          action: "flirt",
          romance: -1,
        },
        {
          at: at,
          today: false,
          share: "event",
        },
      );
    }
  },
  "open-ask": ({
    game: game,
    scene: scene,
    bond: bond,
    character: character,
    choice: choice,
    accepted: accepted,
    at: at,
    events: events,
  }) => {
    let withId = scene.about?.with;
    if (withId && choice === "step") {
      recordTownFact(game, "interested", {
        with: withId,
        hearer: bond.characterId,
        at: at,
      });
    }
    if (accepted && withId) {
      bond.open = {
        ...(bond.open ?? {}),
        you: {
          ...(bond.open?.you ?? {}),
          [withId]: at,
        },
      };
      events.push({
        id: "open",
        characterId: bond.characterId,
        text: `${character?.name ?? "They"} agreed: you can see ${nameFor(
          game,
          characterOf(game, withId) ?? {
            id: withId,
            name: "them",
          },
        )}.`,
      });
    } else if (choice === "step") {
      applyBondAction(
        bond,
        {
          action: "flirt",
          romance: -1,
        },
        {
          at: at,
          today: false,
          share: "event",
        },
      );
    }
  },
  "friend-opinion": settleOpinion,
  "see-ring": ({ bond: bond, choice: choice, at: at }) => {
    adjustBondAxis(bond, "friendship", RING_VISIT[choice] ?? 1, {
      at: at,
    });
  },
  "their-confess": ({
    game: game,
    scene: scene,
    bond: bond,
    character: character,
    accepted: accepted,
    at: at,
    events: events,
  }) => {
    let charName = character?.name ?? "them";
    if (accepted) {
      bond.romance = Math.max(bond.romance, STATUS_STEPS.dating.romance);
      bond.trust = Math.max(bond.trust, STATUS_STEPS.dating.trust);
      settleTierEvent(bond, "romance");
      if (bond.status === "single") {
        setRelationshipStatus(bond, "dating", {
          at: at,
        });
        events.push({
          id: "dating",
          characterId: bond.characterId,
          text: `You and ${charName} are dating now.`,
        });
        scene.seenBy = recordTownFact(game, "confess", {
          with: bond.characterId,
          place: game.at,
          witnesses: sawIt(game, bond.characterId),
        });
        learnedFact(game, scene.seenBy, game.facts.at(-1).id, "seen");
        recordTownFact(game, "dating", {
          with: bond.characterId,
          place: game.at,
        });
      }
      scene.outcome = {
        headline: "Dating.",
        stamp: "Dating",
        tags: [
          {
            text: "DATING",
            step: true,
          },
        ],
      };
      return;
    }
    let refusal = CONFESS_NO[TRAIT_BEHAVIOURS.hurtByNo(traitsOf(game, bond.characterId))],
      chips = [];
    for (let axis of ["romance", "trust"]) {
      if (refusal[axis]) {
        adjustBondAxis(bond, axis, refusal[axis], {
          at: at,
        });
        chips.push({
          text: `${axis.toUpperCase()} ${refusal[axis]}`,
          bad: true,
        });
      }
    }
    bond.milestoneRetry = {
      ...(bond.milestoneRetry ?? {}),
      "their-confess": at + refusal.days * CONFESS_RETRY_DAY_MINUTES,
    };
    scene.outcome = {
      headline: "Not yet.",
      tags: chips,
    };
  },
  "marry-ask": ({
    game: game,
    scene: scene,
    bond: bond,
    character: character,
    choice: choice,
    accepted: accepted,
    at: at,
    events: events,
  }) => {
    let withId = scene.about?.with;
    if (accepted && withId) {
      bond.open = {
        ...(bond.open ?? {}),
        marry: {
          ...(bond.open?.marry ?? {}),
          [withId]: at,
        },
      };
      events.push({
        id: "marry-agreed",
        characterId: bond.characterId,
        text: `${character?.name ?? "They"} agreed: you can marry ${nameFor(
          game,
          characterOf(game, withId) ?? {
            id: withId,
            name: "them",
          },
        )}.`,
      });
    } else if (choice === "step") {
      applyBondAction(
        bond,
        {
          action: "flirt",
          romance: -2,
        },
        {
          at: at,
          today: false,
          share: "event",
        },
      );
    }
  },
  jealous: ({
    game: game,
    scene: scene,
    bond: bond,
    character: character,
    choice: choice,
    accepted: accepted,
    at: at,
    events: events,
  }) => {
    let outcome = jealousOutcome(game, scene, choice, accepted);
    hurtBond(bond, {
      trust: outcome.trust,
      romance: outcome.romance,
      friendship: outcome.friendship ?? 0,
    });
    if (outcome.believed) {
      bond.lies = [
        ...(bond.lies ?? []),
        {
          fact: scene.about?.fact ?? null,
          at: at,
        },
      ].slice(-20);
    }
    if (outcome.opens) {
      bond.open = {
        ...(bond.open ?? {}),
        you: {
          ...(bond.open?.you ?? {}),
          [scene.about.with]: at,
        },
      };
      events.push({
        id: "open",
        characterId: bond.characterId,
        text: `${character?.name ?? "They"} can live with it: you can keep seeing ${knownName(game, scene.about.with)}.`,
      });
    }
    scene.outcome = outcome;
    if (scene.about?.with) {
      bond.talked = {
        ...(bond.talked ?? {}),
        [scene.about.with]: at,
      };
    }
    if (bond.jealous?.fact === scene.about?.fact) {
      bond.jealous = null;
    }
    markTraitsSeen(bond, "forgiveness");
  },
};
function settleStandardMilestone({
  game: game,
  scene: scene,
  bond: bond,
  character: character,
  m: milestone,
  choice: choice,
  accepted: accepted,
  at: at,
  events: events,
}) {
  if (accepted) {
    if (
      (milestone.to &&
        setRelationshipStatus(bond, milestone.to, {
          at: at,
        }),
      milestone.flag &&
        (bond.milestones = {
          ...(bond.milestones ?? {}),
          [milestone.flag]: at,
        }),
      milestone.flag === "firstKiss" &&
        ((scene.seenBy = recordTownFact(game, "kiss", {
          with: bond.characterId,
          place: game.at,
          witnesses: sawIt(game, bond.characterId),
        })),
        learnedFact(game, scene.seenBy, game.facts.at(-1).id, "seen")),
      FACT_ACT_PHRASES[milestone.to] &&
        recordTownFact(game, milestone.to, {
          with: bond.characterId,
          place: game.at,
        }),
      scene.milestone === "move-in")
    ) {
      let sharesDoor = choice !== "theirs" && sharesYourDoor(game, character);
      if (choice === "theirs") {
        leaveOwnHome(game);
        game.residence = {
          place: character.residence.place,
          unit: character.residence.unit,
        };
        game.town.homeAt = character.residence.place;
        game.wallet.home = RESIDENCE_TO_HOME_KIND[character.residence.place] ?? "apartment";
        returnHomeFromLodging(game);
      } else {
        moveInWithYou(game, character.id);
        addHomeMemory(game, character.id, (memory) =>
          sharesDoor
            ? `${memory} and I already lived together; now we live together as a couple.`
            : `I moved in with ${memory}: we live together now.`,
        );
      }
      game.wallet.flatmate = null;
      events.push({
        id: "moved-in",
        characterId: bond.characterId,
        text:
          choice === "theirs"
            ? `You moved in with ${character.name}.`
            : sharesDoor
              ? `You and ${character.name} live together as a couple now.`
              : `${character.name} moved in with you.`,
      });
    }
    return;
  }
  bond.milestoneRetry = {
    ...(bond.milestoneRetry ?? {}),
    [scene.milestone]: tierRetryAt(bond, at, {
      byPlayer: choice === "wait",
    }),
  };
  if (choice === "wait" && scene.by === "them") {
    applyBondAction(
      bond,
      {
        action: "flirt",
        romance: -1,
      },
      {
        at: at,
        today: false,
        share: "event",
      },
    );
  }
  if (choice !== "wait" && scene.by === "you") {
    applyBondAction(
      bond,
      {
        action: "flirt",
        romance: -1,
      },
      {
        at: at,
        today: false,
        share: "event",
      },
    );
  }
}
function settleMilestone(
  game,
  { choice: choice, accepted: accepted, lines = [], remember = "", each = null, afterWhat = "", ...rest },
) {
  let scene = game.scene,
    bond = bondOf(game, scene.characterId),
    character = characterOf(game, scene.characterId),
    milestone = MILESTONES[scene.milestone],
    before = {
      friendship: bond.friendship,
      romance: bond.romance,
      trust: bond.trust,
    },
    events = [],
    ctx = {
      game: game,
      scene: scene,
      bond: bond,
      character: character,
      m: milestone,
      choice: choice,
      accepted: accepted,
      at: game.minutes,
      events: events,
    };
  if (MILESTONE_SETTLERS[scene.milestone]) {
    MILESTONE_SETTLERS[scene.milestone](ctx);
  } else if (milestone?.own) {
    events.push(...settleOwn(game, scene, bond, choice, rest));
  } else {
    settleStandardMilestone(ctx);
  }
  if (
    (scene.by === "them" && scene.milestone !== "their-plan") ||
    (bond.asks?.mine && bond.asks.id === scene.milestone)
  ) {
    bond.asks = null;
  }
  for (let axis of BOND_AXES) {
    scene.totals[axis] = Math.round((scene.totals[axis] + bond[axis] - before[axis]) * 10) / 10;
  }
  scene.choice = choice;
  scene.verdict = {
    ...judgeSceneReads(scene.reads),
    accepted: accepted,
    ...(scene.outcome
      ? {
          ends: scene.outcome.ends,
          believed: scene.outcome.believed,
          headline: scene.outcome.headline ?? null,
          stamp: scene.outcome.stamp ?? null,
        }
      : {}),
  };
  advanceEventBeat(scene);
  scene.batch = lines;
  scene.log.push(
    ...lines.map((line) => ({
      ...line,
      exchange: scene.exchange + 1,
    })),
  );
  return milestone?.after === true
    ? ((scene.after = {
        choice: choice,
        what: afterWhat,
      }),
      (scene.phase = "after"),
      (scene.exchange += 1),
      (scene.max = scene.exchange + AFTER_EXCHANGES),
      (scene.suggestions = Array.isArray(rest.suggestions)
        ? rest.suggestions
            .map((line) =>
              String(line ?? "")
                .trim()
                .slice(0, 120),
            )
            .filter(Boolean)
            .slice(0, 3)
        : []),
      (scene.did = {
        exchange: scene.exchange,
        logAt: scene.log.length,
        tags: scene.outcome?.tags ?? [],
      }),
      remember && (scene.remember = remember),
      each &&
        Object.keys(each).length &&
        (scene.each = {
          ...(scene.each ?? {}),
          ...each,
        }),
      logNote(game, `${milestone.title(character?.name ?? "")}: ${scene.outcome?.headline ?? choice}`, "social"),
      {
        ok: true,
        events: events,
      })
    : (endScene(scene, bond, {
        endedBy: accepted ? "accepted" : choice === "wait" ? "wait" : "refused",
        remember: remember,
        each: each,
      }),
      rememberScene(game, scene),
      logNote(
        game,
        `${milestone?.title(character?.name ?? "") ?? "A step"}: ${accepted ? "yes" : "not now"}`,
        "social",
      ),
      {
        ok: true,
        events: events,
      });
}
function talkOtherOf(game, charId) {
  if (isPartner(game, charId)) {
    return null;
  }
  let known = (game.youKnow ?? []).find(
    (pair) =>
      (pair.a === charId || pair.b === charId) &&
      isPartner(game, pair.a === charId ? pair.b : pair.a) &&
      !settledPair(game, pair.a === charId ? pair.b : pair.a, charId),
  );
  return known
    ? {
        partner: known.a === charId ? known.b : known.a,
        how: known.how,
        from: known.from ?? null,
      }
    : null;
}
function callToMilestone(game, charId, milestoneId, about, opts) {
  let bond = bondOf(game, charId);
  if (!bond) {
    return;
  }
  let charName = knownName(game, charId);
  if (isCharacterHere(game, charId) && !workingHome(game, charId)) {
    about.push({
      id: "approach",
      characterId: charId,
      milestone: milestoneId,
      name: charName,
    });
    return;
  }
  if (bond.asks) {
    about.push({
      id: "later",
      characterId: charId,
      text: `${charName}: from their panel, when you see them.`,
    });
    return;
  }
  bond.asks = {
    id: milestoneId,
    mine: true,
    at: opts,
    due: opts + 60,
  };
  about.push({
    id: "called",
    characterId: charId,
    text: `You asked ${charName} to meet you.`,
  });
}
function tellsYouLabels(game, scene) {
  let about = scene.about ?? {},
    partnerId = isPartner(game, about.a) ? about.a : about.b,
    partnerName = knownName(game, partnerId),
    otherName = knownName(game, partnerId === about.a ? about.b : about.a);
  return {
    confront: {
      label: `Confront ${partnerName}`,
      note: `${partnerName} can deny it: you did not see it`,
    },
    other: {
      label: `Talk to ${otherName}`,
      note: `A talk with ${otherName} about what you heard`,
    },
    breakup: {
      label: `Break up with ${partnerName}`,
      note: "A scene: you end it",
    },
    keep: {
      label: "Keep it to yourself",
      note: `You say nothing \xB7 you can confront ${partnerName} later`,
    },
  };
}
function settleMateIn({
  game: game,
  scene: scene,
  bond: bond,
  character: character,
  choice: choice,
  accepted: accepted,
  at: at,
  events: events,
}) {
  let charName = nameFor(game, character);
  if (accepted && moveInWithYou(game, bond.characterId)) {
    adjustBondAxis(bond, "friendship", MATE_IN_GAIN, {
      at: at,
    });
    addHomeMemory(game, bond.characterId, (memory) =>
      scene.by === "them"
        ? `I asked ${memory} if I could move in, and ${memory} said yes: we live together now, as housemates.`
        : `${memory} asked me to move in, and I said yes: we live together now, as housemates.`,
    );
    scene.outcome = {
      headline: `${charName} is moving in.`,
      tags: [
        {
          text: "HOUSEMATES",
          step: true,
        },
      ],
    };
    events.push({
      id: "mate-in",
      characterId: bond.characterId,
      text: `${charName} moved in with you.`,
    });
    logNote(game, `${charName} moved in with you`, "move");
    return;
  }
  bond.milestoneRetry = {
    ...(bond.milestoneRetry ?? {}),
    "mate-in": at + MATE_AGAIN_DAYS * DAY_MINUTES,
  };
  bond.mateNoBy = scene.by === "them" ? "you" : "them";
  if (scene.by === "them" && choice === "wait") {
    hurtBond(bond, {
      friendship: -1,
    });
  }
  scene.outcome = {
    headline: scene.by === "them" ? "Not now." : `${charName} would rather not.`,
  };
}
function settleMateOut({
  game: game,
  scene: scene,
  bond: bond,
  character: character,
  choice: choice,
  at: at,
  events: events,
}) {
  let charName = nameFor(game, character);
  if (choice !== "go") {
    scene.outcome = {
      headline: `${charName} stays.`,
    };
    return;
  }
  hurtBond(bond, {
    friendship: judgeSceneReads(scene.reads).accepted ? MATE_OUT_COST.good : MATE_OUT_COST.bad,
  });
  moveOutToOwnPlace(game, bond.characterId);
  addHomeMemory(
    game,
    bond.characterId,
    (memory) => `${memory} asked me to move out of their place, and I did: I live on my own now.`,
  );
  scene.outcome = {
    headline: `${charName} is moving out.`,
  };
  events.push({
    id: "mate-out",
    characterId: bond.characterId,
    text: `${charName} moved out.`,
  });
  logNote(game, `${charName} moved out`, "move");
}
function settleMateMoment({
  game: game,
  scene: scene,
  bond: bond,
  character: character,
  choice: choice,
  at: at,
  events: events,
}) {
  let moment = MATE_MOMENTS[scene.about?.kind],
    call = moment ? Object.values(moment.calls)[choice === "a" ? 0 : 1] : null;
  if (call) {
    if (
      (call.friendship > 0
        ? adjustBondAxis(bond, "friendship", call.friendship, {
            at: at,
          })
        : call.friendship < 0 &&
          hurtBond(bond, {
            friendship: call.friendship,
          }),
      call.energy && (game.needs.energy = Math.max(0, game.needs.energy + call.energy)),
      call.eats || call.keeps)
    ) {
      let dish = theirDish(game, bond.characterId, {
        salt: String(at),
      });
      if (dish && call.eats) {
        eatDish(game, dish.dish);
      }
      if (dish && call.keeps) {
        cookDishIntoFridge(game.things, dish.recipe, dish.quality, 1);
        events.push({
          id: "mate-dish",
          text: `${dish.dish.name}: a portion in your fridge.`,
        });
      }
    }
    scene.outcome = {
      headline: call.said,
    };
    bond.lastSeen = at;
  }
}
function mateMomentLabels(scene) {
  let calls = Object.values(MATE_MOMENTS[scene.about?.kind]?.calls ?? {});
  return {
    a: {
      label: calls[0]?.label ?? "Yes",
      ...(calls[0]?.note
        ? {
            note: calls[0].note,
          }
        : {}),
    },
    b: {
      label: calls[1]?.label ?? "No",
      ...(calls[1]?.note
        ? {
            note: calls[1].note,
          }
        : {}),
    },
  };
}

export { callLabels, milestoneOptions, milestoneVerdict, milestoneView, settleMilestone, talkOtherOf };
