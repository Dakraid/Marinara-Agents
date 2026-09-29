import { create } from "zustand";
import { toast } from "sonner";
import i18next from "i18next";
import { slpPutTask } from "./slp-task-list";

/**
 * Long actions never lock the player (task B). A long action starts here instead of behind a busy
 * sheet: the caller closes its sheet at once, the task runs on, Pulse lists it (running, done or
 * failed with why and Try again) and a toast says how it went with "See in Pulse" or "Open".
 *
 * ponytail: kept in memory for this tab (a reload forgets finished client tasks; the server's own
 * jobs and Stir plays stay in Pulse from the tasks route). Persist it if players miss them.
 */

/** What a tap on a task opens: a Creator's page (and one post on it), or that Creator's chat with you. */
export type SlpPulseTarget = { accountId: string; postId?: string | null } | { chatCreatorId: string };

export type SlpTask = {
  id: string;
  kind: string;
  /** The player's words for it ("Mira's next post"), already translated. */
  label: string;
  accountIds: string[];
  status: "running" | "done" | "failed";
  startedAt: number;
  finishedAt?: number;
  /** Why it failed, in plain words. */
  error?: string;
  /** What came out ("Posted", "3 changes made"), already translated. */
  result?: string;
  target?: SlpPulseTarget;
  /** A result only its screen can show (a finished plan): opens it again. */
  open?: { label: string; run: () => void };
  retry?: () => void;
};

type SlpTaskState = {
  tasks: SlpTask[];
  /** Whether Pulse is open. Here, not in the shell, so a toast's "See in Pulse" can open it from anywhere. */
  pulseOpen: boolean;
};

export const useSlpTasks = create<SlpTaskState>(() => ({ tasks: [], pulseOpen: false }));

export const openSlpPulse = () => useSlpTasks.setState({ pulseOpen: true });
export const closeSlpPulse = () => useSlpTasks.setState({ pulseOpen: false });

function put(task: SlpTask) {
  useSlpTasks.setState((state) => ({ tasks: slpPutTask(state.tasks, task, Date.now()) }));
}

const seeInPulse = () => ({
  label: i18next.t("ui.slurp.pulse.seeInPulse", { defaultValue: "See in Pulse" }),
  onClick: openSlpPulse,
});

export function slpErrorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return i18next.t("ui.slurp.pulse.failedUnknown", { defaultValue: "Slurp could not finish it. Try again." });
}

export type SlpTaskStart<T> = {
  kind: string;
  label: string;
  accountIds?: string[];
  run: () => Promise<T>;
  /** The result line and where a tap goes once it worked. */
  done?: (value: T) => Pick<SlpTask, "result" | "target" | "open"> | void;
  /** The started toast, or false for none (the caller already shows the start). */
  startedToast?: string | false;
  /** The done toast; default "<label> is done". False: the caller shows its own (an Undo toast). */
  doneToast?: string | false;
};

/**
 * Start a long action as a Pulse task. Resolves with the value, or undefined when it failed (the
 * failure is in Pulse and a toast; nothing throws at the caller, whose sheet may be gone).
 */
export function startSlpTask<T>(input: SlpTaskStart<T>, retryOf?: string): Promise<T | undefined> {
  const id = retryOf ?? `task:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
  const base: SlpTask = {
    id,
    kind: input.kind,
    label: input.label,
    accountIds: input.accountIds ?? [],
    status: "running",
    startedAt: Date.now(),
  };
  const retry = () => void startSlpTask({ ...input, startedToast: false }, id);
  put(base);
  if (input.startedToast !== false)
    toast(input.startedToast ?? i18next.t("ui.slurp.pulse.started", { defaultValue: "Started. You can keep going." }), {
      description: input.label,
      action: seeInPulse(),
    });
  return input.run().then(
    (value) => {
      const outcome = input.done?.(value) ?? {};
      put({ ...base, ...outcome, status: "done", finishedAt: Date.now() });
      if (input.doneToast !== false) {
        const open = outcome.open;
        toast.success(
          input.doneToast ??
            i18next.t("ui.slurp.pulse.doneToast", { defaultValue: "{{label}}: done", label: input.label }),
          {
            description: outcome.result,
            action: open ? { label: open.label, onClick: open.run } : seeInPulse(),
          },
        );
      }
      return value;
    },
    (error: unknown) => {
      put({ ...base, status: "failed", finishedAt: Date.now(), error: slpErrorText(error), retry });
      toast.error(
        i18next.t("ui.slurp.pulse.failedToast", { defaultValue: "{{label}}: it did not work", label: input.label }),
        {
          description: slpErrorText(error),
          action: seeInPulse(),
        },
      );
      return undefined;
    },
  );
}

/** Forget a finished task (Pulse's ✕ on a failed one the player has seen). */
export function dismissSlpTask(id: string) {
  useSlpTasks.setState((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
}
