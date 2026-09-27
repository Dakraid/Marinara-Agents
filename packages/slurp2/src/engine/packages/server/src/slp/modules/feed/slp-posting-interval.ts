const DAY_MS = 24 * 60 * 60 * 1000;

export function slurpCreatorPostingIntervalMs(postsPerDay: number): number {
  return DAY_MS / postsPerDay;
}

/** Return true when an existing post or active slot is too close to a candidate slot. */
export function hasSlurpCreatorPostingIntervalConflict(
  activityTimes: number[],
  candidatePublishAt: number,
  postsPerDay: number,
): boolean {
  const interval = slurpCreatorPostingIntervalMs(postsPerDay);
  return activityTimes.some((activityAt) => Math.abs(candidatePublishAt - activityAt) < interval);
}

/**
 * Posts per day for one Creator's own spacing, at the pace the player set for them (see
 * `SLP_STEERING_PACE_FACTOR`). A busier Creator may post again sooner, a quieter one waits longer.
 * A break (factor 0) is handled by the reserve, which gives that Creator no slot at all.
 */
export function slurpPacedPostsPerDay(postsPerDay: number, factor: number): number {
  return Math.min(96, Math.max(1, Math.round(postsPerDay * (factor > 0 ? factor : 1))));
}

/**
 * Who gets the next open slot: the Creator who has waited longest, with the wait scaled by their
 * pace, so a busier Creator is picked more often and a quieter one less. Never-posted Creators go
 * first. Ties go by id, so the choice is stable.
 */
export function slurpPickCreatorForSlot<T extends { id: string }>(
  candidates: readonly T[],
  lastActivity: (candidate: T) => number,
  pace: (candidate: T) => number,
  at: number,
): T | undefined {
  const score = (candidate: T) => {
    const last = lastActivity(candidate);
    return (last > 0 ? Math.max(0, at - last) : Number.MAX_SAFE_INTEGER / 4) * pace(candidate);
  };
  return [...candidates]
    .filter((candidate) => pace(candidate) > 0)
    .sort((left, right) => score(right) - score(left) || left.id.localeCompare(right.id))[0];
}
