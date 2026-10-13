// Generating club dancer staff via LLM
import { settingBlock } from "../scenes/scene-engine.mjs";
import { normalizeGender } from "../orientation/orientation.mjs";
import { settingNoteFor } from "../cast/read-card.mjs";
import { imageChoice } from "../game.mjs";
import { CLUB_DANCER_SEXES, CLUB_NPC_FIELD_LIMITS, CLUB_NPC_ID_PREFIX, CLUB_PLACE } from "./tuning.mjs";
import { clubStaffList } from "./party-slip-away.mjs";
import { clubDancersEnabled } from "./club-dance.mjs";
import { npcNeedsSprite, paintClubNpcSprites, slotSex } from "./club-regulars.mjs";

var GENERATING_STAFF_LIVES = new Set();
function buildClubStaffPrompt({ setting = "", language = "English" } = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: club-staff",
        "You write the dancers of a strip club, the Scarlet Club, in a modern life sim. Four of them, all grown adults in their twenties or thirties: two women, then two men.",
        'Answer with JSON only, exactly: {"staff":[{"name":"\u2026","gender":"female","body":"\u2026","outfit":"\u2026","trait":"\u2026"},{"name":"\u2026","gender":"female",\u2026},{"name":"\u2026","gender":"male",\u2026},{"name":"\u2026","gender":"male",\u2026}]}',
        "`name`: a first name that fits the world. `body`: how they look, for an illustration, in English: build, height, skin, hair and face, with no clothes; an adult woman or an adult man with a mature face. Never words that read young (petite, small, round face, big eyes, cute, girlish, boyish). `outfit`: what they wear on stage at the club, in English, a short phrase. `trait`: one short sentence in English of how they are with customers.",
        `The four are different from each other. Names in the world's style; every other field in English, whatever the life's language (${language}).`,
      ].join(`
`),
    },
    {
      role: "user",
      content: settingBlock(setting) || "A modern city.",
    },
  ];
}
function parseClubStaff(reply) {
  let staff = Array.isArray(reply?.staff) ? reply.staff : [],
    clip = (value, max) => (typeof value == "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : ""),
    parsed = CLUB_DANCER_SEXES.map((sex, index) => {
      let raw = staff.filter((dancer) => slotSex(dancer?.gender) === sex)[
          CLUB_DANCER_SEXES.slice(0, index).filter((sex2) => sex2 === sex).length
        ],
        dancerName = clip(raw?.name, CLUB_NPC_FIELD_LIMITS.name),
        body = clip(raw?.body, CLUB_NPC_FIELD_LIMITS.body);
      if (!dancerName || !body) {
        return null;
      }
      let trait = clip(raw?.trait, CLUB_NPC_FIELD_LIMITS.trait),
        rawSex = normalizeGender(raw?.gender) ?? sex;
      return {
        id: `${CLUB_NPC_ID_PREFIX}${index + 1}`,
        npc: true,
        name: dancerName,
        gender: rawSex,
        body: body,
        outfit: clip(raw?.outfit, CLUB_NPC_FIELD_LIMITS.outfit),
        trait: trait,
        about: `Works at the ${CLUB_PLACE.name}.${trait ? ` ${trait}` : ""}`,
        appearance: body,
        description: `A dancer at the ${CLUB_PLACE.name}. ${trait}`.trim(),
        figure: {
          sex: rawSex,
          body: body,
          outfit: clip(raw?.outfit, CLUB_NPC_FIELD_LIMITS.outfit),
          from: "model",
        },
        doing: "working at the club",
        memories: [],
        avatar: null,
      };
    });
  return parsed.every(Boolean) ? parsed : null;
}
async function ensureClubStaff(ctx, state) {
  let adult = state.modules?.adult;
  if (!adult || !clubDancersEnabled(state, adult) || GENERATING_STAFF_LIVES.has(state.id)) {
    return;
  }
  let canPaint = !!ctx.paintSprite && !!imageChoice(state).connectionId;
  if (!(clubStaffList(adult).length && !(canPaint && clubStaffList(adult).some((dancer) => npcNeedsSprite(dancer))))) {
    GENERATING_STAFF_LIVES.add(state.id);
    try {
      if (!clubStaffList(adult).length) {
        let { json: json } = await ctx.modelFor(state).askJson(
            buildClubStaffPrompt({
              setting: settingNoteFor(state),
              language: state.settings?.language ?? "English",
            }),
            {
              maxTokens: 1200,
              task: "club-staff",
              about: CLUB_PLACE.name,
            },
          ),
          staff = parseClubStaff(json);
        if (!staff) {
          return;
        }
        let saved = false;
        if (
          (await ctx.withLife(state.id, (life) => {
            let adult2 = life.modules?.adult;
            if (adult2 && clubDancersEnabled(life, adult2) && !clubStaffList(adult2).length) {
              adult2.staff = staff;
              saved = true;
            }
          }),
          !saved || ((adult.staff = staff), !canPaint))
        ) {
          return;
        }
      }
      await paintClubNpcSprites(ctx, state, clubStaffList(adult), {
        on: clubDancersEnabled,
        key: "club-staff",
      });
    } finally {
      GENERATING_STAFF_LIVES.delete(state.id);
    }
  }
}

export { ensureClubStaff };
