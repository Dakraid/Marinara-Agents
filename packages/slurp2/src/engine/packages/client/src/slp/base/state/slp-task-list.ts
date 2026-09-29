/** The Pulse task list's one rule (task B), pure: newest first, one row per id, a day of history, 30 rows. */
export const SLP_TASKS_MAX = 30;
export const SLP_TASKS_KEEP_MS = 24 * 60 * 60_000;

export function slpPutTask<T extends { id: string; status: string; finishedAt?: number }>(
  tasks: readonly T[],
  task: T,
  now: number,
): T[] {
  const cutoff = now - SLP_TASKS_KEEP_MS;
  const others = tasks.filter(
    (entry) => entry.id !== task.id && (entry.status === "running" || (entry.finishedAt ?? 0) >= cutoff),
  );
  return [task, ...others].slice(0, SLP_TASKS_MAX);
}
