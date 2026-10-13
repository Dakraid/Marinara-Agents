// Background LLM read of character cards for adult status, ways, likes and limits with backoff
import { dropRefusedJobs } from "../cast/cast-jobs.mjs";
import {
  INTIMACY_LIKES_RULE,
  INTIMACY_LIMITS_RULE,
  INTIMACY_WAYS_RULE,
  INTIMACY_WAYS_SHAPE,
  cleanAdultAnswer,
  cleanIntimacyLikes,
  cleanIntimacyLimits,
} from "./intimacy-ways.mjs";
import { applyAdultCardRead } from "./cast-intimacy.mjs";

var READING_ADULTS_LIVES = new Set();
var ADULT_CARD_MAX_CHARS = 700;
function buildReadAdultsPrompt(people) {
  return [
    {
      role: "system",
      content: [
        "Task: read-adults",
        "For each person below, say from their character card whether they are an adult (18 or older).",
        "`yes`: the card makes clear they are an adult (an age of 18 or more, a job or a life only an adult has, being a parent, a university student\u2026).",
        "`no`: the card says or clearly shows they are under 18.",
        "`unsaid`: the card does not make it clear. When in doubt, `unsaid`.",
        "Then, for each one, what the card says about them in sex:",
        INTIMACY_WAYS_RULE.replace("`intimacy_ways`", "`ways`"),
        INTIMACY_LIKES_RULE.replace("`intimacy_likes`", "`likes`"),
        INTIMACY_LIMITS_RULE.replace("`intimacy_limits`", "`limits`"),
        `Answer with JSON only, exactly: {"people":{"<id>":{"adult":"yes|no|unsaid","ways":${INTIMACY_WAYS_SHAPE},"likes":["\u2026"],"limits":[{"text":"\u2026","stage":"no or not yet"}]}}} with every id given.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: people.map(
        (person) => `- ${person.id}: ${person.name}
  ${person.card}`,
      ).join(`
`),
    },
  ];
}
var READ_ADULTS_BACKOFF = new Map();
var READ_ADULTS_BACKOFF_MS = {
  first: 300 * 1e3,
  most: 1440 * 60 * 1e3,
};
var readAdultsBackoffKey = (state, characterId) => `${state.id}\0${characterId}`;
var isReadAdultsBackedOff = (state, characterId, now = Date.now()) =>
  (READ_ADULTS_BACKOFF.get(readAdultsBackoffKey(state, characterId))?.until ?? 0) > now;
function backOffReadAdults(state, characterIds, now = Date.now()) {
  for (let characterId of characterIds) {
    let tries = (READ_ADULTS_BACKOFF.get(readAdultsBackoffKey(state, characterId))?.tries ?? 0) + 1;
    READ_ADULTS_BACKOFF.set(readAdultsBackoffKey(state, characterId), {
      tries: tries,
      until: now + Math.min(READ_ADULTS_BACKOFF_MS.most, READ_ADULTS_BACKOFF_MS.first * 2 ** (tries - 1)),
    });
  }
}
async function readAdultCards(ctx, state) {
  let adult = state.modules?.adult;
  if (!adult?.on || !adult.youAdult || READING_ADULTS_LIVES.has(state.id)) {
    return;
  }
  let pending = (state.characters ?? [])
    .filter(
      (character) =>
        !character.away && !adult.cast?.[character.id]?.read && !isReadAdultsBackedOff(state, character.id),
    )
    .slice(0, 30);
  if (pending.length) {
    READING_ADULTS_LIVES.add(state.id);
    try {
      for (let start = 0; start < pending.length && ctx.onScreen(state.id); start += 10) {
        let batch = pending.slice(start, start + 10),
          people = [];
        for (let character of batch) {
          let card = await ctx.host.card(character.cardId ?? character.id).catch(() => null);
          people.push({
            id: character.id,
            name: character.name,
            card: [card?.description ?? character.description ?? "", card?.personality ?? "", card?.scenario ?? ""]
              .join(" ")
              .replace(/\s+/g, " ")
              .slice(0, ADULT_CARD_MAX_CHARS),
          });
        }
        let json;
        try {
          ({ json: json } = await ctx.modelFor(state).askJson(buildReadAdultsPrompt(people), {
            maxTokens: 1600,
            task: "read-adults",
            about: batch.map((character) => character.name).join(", "),
          }));
        } catch (err) {
          if (err?.cancelled || err?.statusCode === 499) {
            throw err;
          }
          backOffReadAdults(
            state,
            batch.map((character) => character.id),
          );
          ctx.log?.warn?.(`[adult] read-adults: ${err?.message ?? err}`);
          continue;
        }
        let people2 = json?.people && typeof json.people == "object" ? json.people : {};
        backOffReadAdults(
          state,
          batch
            .filter((character) => people2[character.id] === undefined || people2[character.id] === null)
            .map((character) => character.id),
        );
        await ctx.withLife(state.id, (life) => {
          let adult2 = life.modules?.adult;
          if (adult2) {
            for (let character of batch) {
              let answer = people2[character.id];
              if (answer == null) {
                continue;
              }
              let entry =
                typeof answer == "object" && answer
                  ? answer
                  : {
                      adult: answer,
                    };
              applyAdultCardRead(life, adult2, character.id, {
                adult: cleanAdultAnswer(
                  String(entry.adult ?? "")
                    .trim()
                    .toLowerCase(),
                ),
                intimacy_ways: entry.ways,
                intimacy_likes: cleanIntimacyLikes(entry.likes).map((like) => like.text),
                intimacy_limits: cleanIntimacyLimits(entry.limits).map(({ text: text, stage: stage }) => ({
                  text: text,
                  stage: stage,
                })),
              });
              dropRefusedJobs(life, [character.id]);
              READ_ADULTS_BACKOFF.delete(readAdultsBackoffKey(state, character.id));
            }
          }
        });
      }
    } finally {
      READING_ADULTS_LIVES.delete(state.id);
    }
  }
}

export { readAdultCards };
