/**
 * The sign-up transcript as the new Creator's first DM thread.
 *
 * The newcomer's lines become the Creator's messages. The host's lines sit on the player's side;
 * when the player did not write them as themselves (Slurp Support, a helping Creator), each one
 * carries `sceneSpeaker` so the thread shows who said it and the DM model reads it as that
 * person, never as the fan. Times are spread back from now, oldest first.
 *
 * Pure, so the mapping runs in tests.
 */
import type { SlpSceneLine, SlpScenePreset } from "../../../../../shared/src/slp/slp-scene.js";

/** Seconds between two kept lines. */
const SLP_SCENE_THREAD_STEP_SECONDS = 20;

export function slpSceneThreadMessages(input: {
  preset: SlpScenePreset;
  hostName: string;
  lines: readonly SlpSceneLine[];
  now: Date;
}): { role: "viewer" | "creator"; content: string; metadata: Record<string, unknown>; createdAt: string }[] {
  const speaker = input.preset === "friend" ? "" : input.hostName.trim() || "Slurp Support";
  const start = input.now.getTime() - input.lines.length * SLP_SCENE_THREAD_STEP_SECONDS * 1000;
  return input.lines.map((line, index) => ({
    role: line.speaker === "newcomer" ? "creator" : "viewer",
    content: line.text,
    metadata: {
      signUpScene: input.preset,
      ...(line.speaker === "host" && speaker ? { sceneSpeaker: speaker } : {}),
    },
    createdAt: new Date(start + index * SLP_SCENE_THREAD_STEP_SECONDS * 1000).toISOString(),
  }));
}
