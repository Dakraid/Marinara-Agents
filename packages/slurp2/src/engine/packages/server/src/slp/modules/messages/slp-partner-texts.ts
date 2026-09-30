/**
 * A Creator who is with the player texts like a partner (Drama, "the player as a partner"): a few
 * times a day, on her own, about her day, her work and the two of them. Pure: code decides when and
 * what about; the message itself is written by the follow-up writer as an opener, in her voice.
 *
 * - **Pace by stage.** Together: every five hours or so; dating: less; a crush: now and then; after
 *   a fight (rocky): rarely, and it shows. A pending message or an unanswered one comes first.
 * - **By the clock.** Morning, day, evening and late-night reasons, in the Creator's own hours.
 * - **Seeded.** The same pair at the same hour decides the same way.
 */
import { hash } from "../projects/slp-project.js";

export type SlurpPartnerStage = "sparks" | "dating" | "together" | "rocky";

/** Hours between her texts, and the percent chance once that long has passed (per hourly look). */
export const SLURP_PARTNER_TEXT_PACE: Record<SlurpPartnerStage, { gapHours: number; chance: number }> = {
  together: { gapHours: 5, chance: 35 },
  dating: { gapHours: 7, chance: 30 },
  sparks: { gapHours: 14, chance: 20 },
  rocky: { gapHours: 16, chance: 20 },
};

/** Written to the Creator, like the check-in reasons: "you" is her, "them" is her partner. */
const REASONS: Record<"morning" | "day" | "evening" | "night" | "rocky" | "sparks", readonly string[]> = {
  morning: [
    "You just woke up and your partner is the first thing on your mind. Send a good-morning text, short and warm.",
    "You had a dream about your partner last night. Tell them about it.",
    "Ask your partner how they slept, and say you miss waking up next to them.",
  ],
  day: [
    "Send your partner a little update about your day, the kind you only tell them.",
    "You are in the middle of work and thinking about your partner. Say so.",
    "Tease your partner about something you are about to post.",
    "Ask your partner if they have eaten, a little bossy and sweet.",
    "Something you saw reminded you of your partner. Tell them.",
  ],
  evening: [
    "Ask your partner what the two of you are doing tonight.",
    "Tell your partner you can't wait to see them.",
    "A long day is over. Send your partner something flirty.",
    "Tell your partner how your shoot went, and hint at the part you are keeping for them.",
  ],
  night: [
    "You can't sleep and you want to talk to your partner.",
    "A sleepy late-night text: you miss your partner.",
    "It is late and you feel bolder than in the daytime. Text your partner something you would not say at noon.",
  ],
  rocky: [
    "You are still a little hurt after your fight, but you reach out to your partner anyway.",
    "You want to talk things out with your partner. Start carefully.",
  ],
  sparks: ["Text your crush something flirty and pretend it is casual.", "Find an excuse to text your crush."],
};

const part = (hour: number) =>
  hour < 5 ? "night" : hour < 11 ? "morning" : hour < 17 ? "day" : hour < 22 ? "evening" : "night";

/**
 * Whether she texts now, and about what. Null: not now. `hour` is her local hour (0-23);
 * `hoursSinceLast` counts from her last text to the player or his last message, whichever is later.
 */
export function slurpPartnerText(input: {
  pairKey: string;
  stage: SlurpPartnerStage;
  hour: number;
  hoursSinceLast: number | null;
  /** Something is already planned for this chat, or she still owes an answer. */
  busy: boolean;
  /** The hour this look is for (a whole-hour number), so one hour decides once. */
  slot: number;
}): string | null {
  if (input.busy) return null;
  const pace = SLURP_PARTNER_TEXT_PACE[input.stage];
  if (input.hoursSinceLast !== null && input.hoursSinceLast < pace.gapHours) return null;
  if (hash(`${input.pairKey}:${input.slot}:partner-text`) % 100 >= pace.chance) return null;
  const pool =
    input.stage === "rocky" ? REASONS.rocky : input.stage === "sparks" ? REASONS.sparks : REASONS[part(input.hour)];
  return pool[hash(`${input.pairKey}:${input.slot}:partner-why`) % pool.length]!;
}
