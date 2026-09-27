/**
 * What the player steers about one Creator: what is going on in their life right now, and one-off
 * ideas for the next posts. Steering decides WHAT happens; the Creator's own card and past posts
 * decide HOW they do it (see the server's `slp-creator-flavour.ts`).
 *
 * Every field is plain words the player typed or picked. Nothing here is a number the model sees.
 */

export const SLP_STEERING_MOODS = ["bright", "cozy", "restless", "low", "flirty", "stressed"] as const;
export type SlpSteeringMood = (typeof SLP_STEERING_MOODS)[number];

/** How often this Creator posts next to everybody else. `break` posts nothing on its own. */
export const SLP_STEERING_PACES = ["break", "quiet", "usual", "busy", "very_busy"] as const;
export type SlpSteeringPace = (typeof SLP_STEERING_PACES)[number];

/** Share of the usual posting rate per pace. */
export const SLP_STEERING_PACE_FACTOR: Record<SlpSteeringPace, number> = {
  break: 0,
  quiet: 0.5,
  usual: 1,
  busy: 1.6,
  very_busy: 2.4,
};

export const SLP_STEERING_TEXT_MAX = 160;
export const SLP_STEERING_TOPIC_MAX = 40;
export const SLP_STEERING_TOPICS_MAX = 6;
export const SLP_STEERING_NUDGE_MAX = 160;
export const SLP_STEERING_NUDGES_MAX = 6;

/** A one-off idea for one upcoming post ("gym post tonight"). Used once, then gone. */
export type SlpCreatorNudge = { id: string; text: string; story: boolean; createdAt: string };

export type SlpCreatorSteering = {
  /** What they are into or working on these days ("training for a competition"). */
  focus: string;
  /** Where their life is ("just moved to Berlin", "exam season"). */
  lifePhase: string;
  mood: SlpSteeringMood | null;
  /** Topics that come up more. */
  push: string[];
  /** Topics they leave alone for now. */
  avoid: string[];
  pace: SlpSteeringPace;
  nudges: SlpCreatorNudge[];
};

export const SLP_DEFAULT_STEERING: SlpCreatorSteering = {
  focus: "",
  lifePhase: "",
  mood: null,
  push: [],
  avoid: [],
  pace: "usual",
  nudges: [],
};

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, max).trim() : "";

function topics(value: unknown): string[] {
  const seen = new Set<string>();
  return (Array.isArray(value) ? value : [])
    .map((entry) => text(entry, SLP_STEERING_TOPIC_MAX))
    .filter((entry) => entry && !seen.has(entry.toLocaleLowerCase()) && seen.add(entry.toLocaleLowerCase()))
    .slice(0, SLP_STEERING_TOPICS_MAX);
}

export function normalizeSlpCreatorSteering(raw: unknown): SlpCreatorSteering {
  const value = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return {
    focus: text(value.focus, SLP_STEERING_TEXT_MAX),
    lifePhase: text(value.lifePhase, SLP_STEERING_TEXT_MAX),
    mood: SLP_STEERING_MOODS.includes(value.mood as SlpSteeringMood) ? (value.mood as SlpSteeringMood) : null,
    push: topics(value.push),
    avoid: topics(value.avoid),
    pace: SLP_STEERING_PACES.includes(value.pace as SlpSteeringPace) ? (value.pace as SlpSteeringPace) : "usual",
    nudges: (Array.isArray(value.nudges) ? value.nudges : [])
      .map((entry) => (entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {}))
      .map((entry) => ({
        id: text(entry.id, 64),
        text: text(entry.text, SLP_STEERING_NUDGE_MAX),
        story: entry.story === true,
        createdAt: text(entry.createdAt, 40),
      }))
      .filter((entry) => entry.id && entry.text)
      .slice(0, SLP_STEERING_NUDGES_MAX),
  };
}
