// Shared by the browser and server bundle; persisted settings contain no provider credentials.
export function normalizeForgeAudio(value) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const bounded = (number, fallback, maximum = 1) => {
    if ((typeof number !== "number" && typeof number !== "string") || number === "") return fallback;
    const parsed = Number(number);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(maximum, parsed)) : fallback;
  };
  return {
    tts: input.tts === true,
    generate: input.generate === true,
    audioConnectionId: typeof input.audioConnectionId === "string" ? input.audioConnectionId.trim().slice(0, 200) : "",
    muted: input.muted === true,
    musicVolume: bounded(input.musicVolume, 0.5),
    dialogueVolume: bounded(input.dialogueVolume, 1),
    sfxVolume: bounded(input.sfxVolume, 0.5),
    autoplayPauseSeconds: bounded(input.autoplayPauseSeconds, 3, 30),
  };
}

export function normalizeForgeMusicMood(value) {
  return ["happy", "tense", "sad"].includes(value) ? value : "happy";
}
