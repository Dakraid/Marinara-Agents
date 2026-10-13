// Generating club regulars via LLM and painting NPC sprites with backoff
import { settingBlock } from "../scenes/scene-engine.mjs";
import { attractionSaid, normalizeAttraction, normalizeGender } from "../orientation/orientation.mjs";
import { settingNoteFor } from "../cast/read-card.mjs";
import { imageChoice } from "../game.mjs";
import { CLUB_NPC_FIELD_LIMITS, CLUB_PLACE } from "./tuning.mjs";
import { CLUB_REGULAR_ID_PREFIX, CLUB_REGULAR_SEXES } from "./after-dark.mjs";
import { activeClubNpc, clubRegularsEnabled, clubRegularsList } from "./club-dance.mjs";

var GENERATING_REGULARS_LIVES = new Set();
// A futanari NPC fills one of the women's slots
var slotSex = (gender) => (normalizeGender(gender) === "futanari" ? "female" : normalizeGender(gender));
function buildClubRegularsPrompt({ setting = "", language = "English" } = {}) {
  return [
    {
      role: "system",
      content: [
        "Task: club-regulars",
        "You write the regulars of a strip club, the Scarlet Club, in a modern life sim: four of its customers, all grown adults in their twenties to forties: two women, then two men.",
        'Answer with JSON only, exactly: {"regulars":[{"name":"\u2026","gender":"female","into":["men"],"body":"\u2026","outfit":"\u2026","trait":"\u2026"},{"name":"\u2026","gender":"female",\u2026},{"name":"\u2026","gender":"male",\u2026},{"name":"\u2026","gender":"male",\u2026}]}',
        "`into`: who they are attracted to, a list from women, men, futanari. `name`: a first name that fits the world. `body`: how they look, for an illustration, in English: build, height, skin, hair and face, with no clothes; an adult woman or an adult man with a mature face. Never words that read young (petite, small, round face, big eyes, cute, girlish, boyish). `outfit`: what they wear on a night out, in English, a short phrase. `trait`: one short sentence in English of how they are at the club.",
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
function parseClubRegulars(reply) {
  let regulars = Array.isArray(reply?.regulars) ? reply.regulars : [],
    clip = (value, max) => (typeof value == "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : ""),
    parsed = CLUB_REGULAR_SEXES.map((sex, index) => {
      let raw = regulars.filter((regular) => slotSex(regular?.gender) === sex)[
          CLUB_REGULAR_SEXES.slice(0, index).filter((sex2) => sex2 === sex).length
        ],
        regularName = clip(raw?.name, CLUB_NPC_FIELD_LIMITS.name),
        body = clip(raw?.body, CLUB_NPC_FIELD_LIMITS.body);
      if (!regularName || !body) {
        return null;
      }
      let trait = clip(raw?.trait, CLUB_NPC_FIELD_LIMITS.trait),
        rawSex = normalizeGender(raw?.gender) ?? sex,
        into = attractionSaid(raw?.into) ? normalizeAttraction(raw.into) : sex === "female" ? ["men"] : ["women"];
      return {
        id: `${CLUB_REGULAR_ID_PREFIX}${index + 1}`,
        npc: true,
        name: regularName,
        gender: rawSex,
        into: into,
        body: body,
        outfit: clip(raw?.outfit, CLUB_NPC_FIELD_LIMITS.outfit),
        trait: trait,
        about: `A regular at the ${CLUB_PLACE.name}.${trait ? ` ${trait}` : ""}`,
        appearance: body,
        description: `A regular customer at the ${CLUB_PLACE.name}. ${trait}`.trim(),
        figure: {
          sex: rawSex,
          body: body,
          outfit: clip(raw?.outfit, CLUB_NPC_FIELD_LIMITS.outfit),
          from: "model",
        },
        doing: "at the club",
        memories: [],
        avatar: null,
      };
    });
  return parsed.every(Boolean) ? parsed : null;
}
var NPC_PAINT_BACKOFF_MS = {
  first: 600 * 1e3,
  most: 1440 * 60 * 1e3,
};
var npcNeedsSprite = (npc, now = Date.now()) => !npc.avatar && (!npc.paintFailed || (npc.paintAgain ?? 0) <= now);
function markNpcPaintFailed(npc, err, now = Date.now()) {
  let tries = (npc.paintTries ?? 0) + 1;
  Object.assign(npc, {
    paintFailed: String(err?.message || err),
    paintTries: tries,
    paintAgain: now + Math.min(NPC_PAINT_BACKOFF_MS.most, NPC_PAINT_BACKOFF_MS.first * 2 ** (tries - 1)),
  });
}
var applyNpcSprite = (npc, picture) => {
  Object.assign(npc, {
    avatar: picture.clean?.url ?? picture.url,
    picture: picture,
  });
  delete npc.paintFailed;
  delete npc.paintTries;
  delete npc.paintAgain;
};
async function paintClubNpcSprites(ctx, state, npcs, { on: isEnabled, key: keyPrefix }) {
  for (let npc of npcs.filter((npc2) => npcNeedsSprite(npc2))) {
    if (!ctx.onScreen(state.id)) {
      break;
    }
    let life = ctx.readLife ? await ctx.readLife(state.id).catch(() => null) : state;
    if (!life?.modules?.adult || !isEnabled(life, life.modules.adult)) {
      break;
    }
    try {
      let picture = await ctx.paintSprite(state, {
        id: npc.id,
        key: `${keyPrefix}-${npc.id}`,
        name: npc.name,
        body: npc.body,
        outfit: npc.outfit,
        sex: npc.gender,
      });
      await ctx.withLife(state.id, (life2) => {
        let npc2 = activeClubNpc(life2, life2.modules?.adult, npc.id);
        if (npc2) {
          applyNpcSprite(npc2, picture);
        }
      });
    } catch (err) {
      if (err?.cancelled) {
        throw err;
      }
      if (err?.aside) {
        break;
      }
      await ctx.withLife(state.id, (life2) => {
        let npc2 = activeClubNpc(life2, life2.modules?.adult, npc.id);
        if (npc2) {
          markNpcPaintFailed(npc2, err);
        }
      });
    }
  }
}
async function ensureClubRegulars(ctx, state) {
  let adult = state.modules?.adult;
  if (!adult || !clubRegularsEnabled(state, adult) || GENERATING_REGULARS_LIVES.has(state.id)) {
    return;
  }
  let canPaint = !!ctx.paintSprite && !!imageChoice(state).connectionId;
  if (!(
    clubRegularsList(adult).length && !(canPaint && clubRegularsList(adult).some((regular) => npcNeedsSprite(regular)))
  )) {
    GENERATING_REGULARS_LIVES.add(state.id);
    try {
      if (!clubRegularsList(adult).length) {
        let { json: json } = await ctx.modelFor(state).askJson(
            buildClubRegularsPrompt({
              setting: settingNoteFor(state),
              language: state.settings?.language ?? "English",
            }),
            {
              maxTokens: 1200,
              task: "club-regulars",
              about: CLUB_PLACE.name,
            },
          ),
          regulars = parseClubRegulars(json);
        if (!regulars) {
          return;
        }
        let saved = false;
        if (
          (await ctx.withLife(state.id, (life) => {
            let adult2 = life.modules?.adult;
            if (adult2 && clubRegularsEnabled(life, adult2) && !clubRegularsList(adult2).length) {
              adult2.regulars = regulars;
              saved = true;
            }
          }),
          !saved || ((adult.regulars = regulars), !canPaint))
        ) {
          return;
        }
      }
      await paintClubNpcSprites(ctx, state, clubRegularsList(adult), {
        on: clubRegularsEnabled,
        key: "club-regular",
      });
    } finally {
      GENERATING_REGULARS_LIVES.delete(state.id);
    }
  }
}

export { ensureClubRegulars, npcNeedsSprite, paintClubNpcSprites, slotSex };
