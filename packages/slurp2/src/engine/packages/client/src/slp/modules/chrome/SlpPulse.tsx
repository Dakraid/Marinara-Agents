import { Activity, CheckCircle2, ChevronDown, CircleAlert, Loader2 } from "lucide-react";
import { useMutationState, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation as useUiTranslation } from "react-i18next";
import i18next from "i18next";
import { formatRelativeTime } from "../../base/ui/slp-date-time";
import type { SlpAccount } from "../../../../../shared/src/slp/slp-social.types.js";
import { Avatar, SLP_EYEBROW_CLASS, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { api } from "../../../lib/api-client.js";
import { cn } from "../../../lib/utils";
import { sortSlpPulseScheduled } from "./slp-pulse-order";
import { SlpSheet } from "./SlpSheet";

export function SlpPulseCard({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  const { t } = useUiTranslation();
  const serverTasks = useSlpPulseTasks(false);
  const activeCount = serverTasks.data?.tasks.filter((task) => isActiveTask(task.status)).length ?? 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={open}
      aria-haspopup="dialog"
      className="group relative flex min-h-11 w-full items-center gap-2.5 overflow-hidden rounded-md bg-[color-mix(in_srgb,var(--noodle-accent)_9%,var(--slurp-surface-raised))] px-3 text-start ring-1 ring-inset ring-[var(--noodle-accent)]/18 transition-[background-color,transform,box-shadow] hover:bg-[var(--accent)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--noodle-accent)] motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center text-[var(--noodle-accent-foreground)]">
        <Activity size={17} strokeWidth={2.4} aria-hidden="true" />
        {/* A still live dot, not a looping ping (marinara-design §7: no decorative loops). */}
        {activeCount > 0 && (
          <span className="absolute end-0 top-0.5 size-2 rounded-full bg-[var(--noodle-accent)] ring-2 ring-[var(--slurp-surface-raised)]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold leading-5">
          {t("ui.slurp.pulse.title", { defaultValue: "Pulse" })}
        </span>
        {activeCount > 0 && (
          <span className="block truncate text-xs leading-4 text-[var(--muted-foreground)]">
            {activeCount} {t("ui.slurp.pulse.runningShort", { defaultValue: "running" })}
          </span>
        )}
      </span>
    </button>
  );
}

/**
 * Pulse: what Slurp is doing in the background and what just happened. A SlpSheet, so it never
 * stacks on the More sheet (B8): opening it closes that one. New plays start in Stir (W).
 */
export function SlpPulsePanel({
  open,
  onClose,
  accounts = [],
}: {
  open: boolean;
  onClose: () => void;
  accounts?: SlpAccount[];
}) {
  const { t } = useUiTranslation();
  const mutations = usePulseMutations();
  const serverTasks = useSlpPulseTasks(open);
  const tasks = mergePulseTasks(serverTasks.data?.tasks ?? [], mutations);
  const groups = groupPulseTasks(tasks);
  const queueSummary = pulseQueueSummary(tasks, t);
  const taskAccounts = [...accounts, ...(serverTasks.data?.accounts ?? [])].filter(
    (account, index, all) => all.findIndex((candidate) => candidate.id === account.id) === index,
  );
  const busy = groups.active.length > 0;
  const heading = (id: string, label: string, danger = false) => (
    <h3 id={id} className={cn(SLP_EYEBROW_CLASS, "px-1", danger && "text-[var(--slurp-danger)]")}>
      {label}
    </h3>
  );

  return (
    <SlpSheet open={open} onClose={onClose} title={t("ui.slurp.pulse.title", { defaultValue: "Pulse" })}>
      <div id="slurp-pulse-panel" className="space-y-6 px-2 pb-2">
        {/* One status line: working, queued and scheduled counts, or "All quiet". */}
        <p className={cn(SLP_TYPE.meta, "-mt-1 flex items-center gap-2 px-1 text-[var(--slurp-muted)]")}>
          {busy ? (
            <span className="size-2 shrink-0 rounded-full bg-[var(--noodle-accent)]" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={14} className="shrink-0 text-[var(--slurp-success)]" aria-hidden="true" />
          )}
          {queueSummary ||
            `${t("ui.slurp.pulse.quiet", { defaultValue: "All quiet" })} · ${t("ui.slurp.pulse.nothingScheduled", {
              defaultValue: "nothing scheduled",
            })}`}
        </p>

        {/* W: Pulse shows what runs and ran. "Generate posts" (only a link to Settings) is gone and
            "Run audience" is a Stir card ("Wake the fans"): a new plan never starts here. */}
        {busy && (
          <section aria-labelledby="slurp-pulse-now" className="space-y-2">
            {heading(
              "slurp-pulse-now",
              t("ui.slurp.pulse.runningCount", { defaultValue: "{{count}} running", count: groups.active.length }),
            )}
            <div className="space-y-2">
              {groups.active.map((group) => (
                <PulseGroupCard key={group.id} group={group} accounts={taskAccounts} t={t} />
              ))}
            </div>
          </section>
        )}

        {groups.attention.length > 0 && (
          <section aria-labelledby="slurp-pulse-attention" className="space-y-2">
            {heading("slurp-pulse-attention", t("ui.slurp.pulse.attention", { defaultValue: "Needs attention" }), true)}
            <div className="space-y-2">
              {groups.attention.map((group) => (
                <PulseGroupCard key={group.id} group={group} accounts={taskAccounts} t={t} attention />
              ))}
            </div>
          </section>
        )}

        {groups.scheduled.length > 0 && (
          <section aria-labelledby="slurp-pulse-scheduled" className="space-y-2">
            {heading("slurp-pulse-scheduled", t("ui.slurp.pulse.scheduled", { defaultValue: "Scheduled" }))}
            <div className="space-y-2">
              {groups.scheduled.map((group) => (
                <PulseGroupCard key={group.id} group={group} accounts={taskAccounts} t={t} />
              ))}
            </div>
          </section>
        )}

        {groups.recent.length > 0 && (
          <section aria-labelledby="slurp-pulse-recent" className="space-y-2">
            {heading("slurp-pulse-recent", t("ui.slurp.pulse.recent", { defaultValue: "Recent" }))}
            <div className="space-y-2">
              {groups.recent.slice(0, 5).map((group) => (
                <PulseGroupCard key={group.id} group={group} accounts={taskAccounts} t={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </SlpSheet>
  );
}

type PulseMutation = {
  id: number;
  key: string;
  status: "pending" | "success" | "error";
  submittedAt: number;
  variables: unknown;
};

type PulseServerTask = {
  id: string;
  kind: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  publishAt?: string;
  accountIds: string[];
  detail?: string | null;
  progress?: { completed: number; total: number } | null;
};

type PulseAccount = Pick<SlpAccount, "id" | "entityId" | "displayName" | "avatarUrl" | "avatarCrop">;

type PulseTask = PulseServerTask & { source: "server" | "client" };
type PulseGroup = {
  id: string;
  kind: string;
  tasks: PulseTask[];
  active: boolean;
  attention: boolean;
  scheduled: boolean;
  accountIds: string[];
};

type PulseTasksResponse = {
  tasks: PulseServerTask[];
  accounts: PulseAccount[];
};

function useSlpPulseTasks(active = false) {
  return useQuery({
    queryKey: ["slurp", "pulse", "tasks"],
    queryFn: () => api.get<PulseTasksResponse>("/slurp2/slurp/tasks"),
    refetchInterval: active ? 2_000 : 15_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

function usePulseMutations() {
  const mutations = useMutationState<PulseMutation>({
    filters: { mutationKey: ["slurp"] },
    select: (mutation) => ({
      id: mutation.mutationId,
      key: String(mutation.options.mutationKey?.[1] ?? "task"),
      status: mutation.state.status,
      submittedAt: mutation.state.submittedAt,
      variables: mutation.state.variables,
    }),
  });
  const sorted = [...mutations].sort((left, right) => right.submittedAt - left.submittedAt);
  return {
    active: sorted.filter((mutation) => mutation.status === "pending"),
    recent: sorted.filter((mutation) => mutation.status !== "pending"),
  };
}

function mergePulseTasks(
  serverTasks: PulseServerTask[],
  mutations: { active: PulseMutation[]; recent: PulseMutation[] },
) {
  const server = serverTasks.map((task) => ({ ...task, source: "server" as const }));
  const client = [...mutations.active, ...mutations.recent].map((mutation) => {
    const accountIds = readAccountIds(mutation.variables);
    return {
      id: `client:${mutation.id}`,
      kind: mutation.key,
      status: mutation.status,
      updatedAt: new Date(mutation.submittedAt).toISOString(),
      accountIds,
      detail: null,
      progress: null,
      source: "client" as const,
    };
  });
  const combined = [...server, ...client].sort(
    (left, right) =>
      Date.parse(right.updatedAt ?? right.createdAt ?? "") - Date.parse(left.updatedAt ?? left.createdAt ?? ""),
  );
  return {
    active: combined.filter((task) => isActiveTask(task.status)),
    scheduled: sortSlpPulseScheduled(combined.filter((task) => task.status === "scheduled")),
    recent: combined.filter((task) => isTerminalTask(task.status)),
  };
}

function groupPulseTasks(tasks: { active: PulseTask[]; scheduled: PulseTask[]; recent: PulseTask[] }) {
  const grouped = new Map<string, PulseGroup>();
  const add = (task: PulseTask) => {
    const kind = pulseGroupKind(task.kind);
    const id = `${kind}:${task.source}`;
    const current = grouped.get(id) ?? {
      id,
      kind,
      tasks: [],
      active: false,
      attention: false,
      scheduled: false,
      accountIds: [],
    };
    current.tasks.push(task);
    current.active ||= isActiveTask(task.status);
    current.attention ||= task.status === "error" || task.status === "failed" || task.status === "abandoned";
    current.scheduled ||= task.status === "scheduled";
    current.accountIds = [...new Set([...current.accountIds, ...task.accountIds])];
    grouped.set(id, current);
  };
  [...tasks.active, ...tasks.scheduled, ...tasks.recent].forEach(add);
  const values = [...grouped.values()].sort((left, right) => {
    if (left.scheduled && right.scheduled) {
      const nextPublish = Date.parse(left.tasks[0]?.publishAt ?? "") - Date.parse(right.tasks[0]?.publishAt ?? "");
      if (Number.isFinite(nextPublish) && nextPublish !== 0) return nextPublish;
    }
    return Date.parse(right.tasks[0]?.updatedAt ?? "") - Date.parse(left.tasks[0]?.updatedAt ?? "");
  });
  return {
    active: values.filter((group) => group.active && !group.attention),
    attention: values.filter((group) => group.attention),
    scheduled: values
      .filter((group) => group.scheduled && !group.active && !group.attention)
      .sort((left, right) => {
        const leftAt = Date.parse(left.tasks[0]?.publishAt ?? "");
        const rightAt = Date.parse(right.tasks[0]?.publishAt ?? "");
        if (Number.isFinite(leftAt) && Number.isFinite(rightAt) && leftAt !== rightAt) return leftAt - rightAt;
        if (Number.isFinite(leftAt) !== Number.isFinite(rightAt)) return Number.isFinite(leftAt) ? -1 : 1;
        return left.id.localeCompare(right.id);
      }),
    recent: values.filter((group) => !group.active && !group.attention && !group.scheduled),
  };
}

function pulseQueueSummary(
  tasks: { active: PulseTask[]; scheduled: PulseTask[]; recent: PulseTask[] },
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const queued = tasks.active.filter((task) => ["queued", "prepared"].includes(task.status)).length;
  const working = tasks.active.length - queued;
  const scheduled = tasks.scheduled.length;
  const recent = tasks.recent.length;
  if (working === 0 && queued === 0 && scheduled === 0) return "";
  return [
    working > 0 ? t("ui.slurp.pulse.queueWorking", { defaultValue: "{{count}} working", count: working }) : "",
    queued > 0 ? t("ui.slurp.pulse.queueQueued", { defaultValue: "{{count}} queued", count: queued }) : "",
    scheduled > 0 ? t("ui.slurp.pulse.queueScheduled", { defaultValue: "{{count}} scheduled", count: scheduled }) : "",
    recent > 0 ? t("ui.slurp.pulse.queueRecent", { defaultValue: "{{count}} recent", count: recent }) : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function isActiveTask(status: string) {
  return !isTerminalTask(status) && status !== "scheduled";
}

function pulseGroupKind(kind: string) {
  if (kind === "scheduled-post") return "scheduled-post";
  if (
    [
      "generate-post",
      "generate-posts",
      "generate-post-image",
      "generate-post-images",
      "create-post",
      "auto-post",
      "first-post",
    ].includes(kind)
  ) {
    return "post-production";
  }
  if (kind === "audience-activity") return "audience-activity";
  if (["conversation-schedule", "conversation-follow-up"].includes(kind)) return "conversation";
  if (kind === "creator-improvement") return "creator-improvement";
  if (kind === "commission") return "commission";
  return kind;
}

function isTerminalTask(status: string) {
  return new Set([
    "completed",
    "complete",
    "success",
    "failed",
    "error",
    "abandoned",
    "published",
    "discarded",
    "sent",
    "cancelled",
    // A fan run that found nothing to do ends as "skipped"; Pulse showed it "Working" forever (R1-103).
    "skipped",
  ]).has(status);
}

function PulseTaskRow({
  task,
  accounts,
  running = false,
  compact = false,
  stacked = false,
  t,
}: {
  task: PulseTask;
  accounts: PulseAccount[];
  running?: boolean;
  compact?: boolean;
  stacked?: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const accountId = task.accountIds[0] ?? null;
  const account = accountId ? accounts.find((item) => item.id === accountId || item.entityId === accountId) : undefined;
  const label = pulseTaskLabel(task.kind, t);
  const status = pulseTaskStatus(task.status, running, t);
  const scope =
    task.accountIds.length > 1
      ? t("ui.slurp.pulse.creatorCount", { defaultValue: "{{count}} Creators", count: task.accountIds.length })
      : (account?.displayName ?? t("ui.slurp.pulse.slurpTask", { defaultValue: "Slurp task" }));
  const progress =
    task.progress && task.progress.total > 0 ? `${task.progress.completed}/${task.progress.total}` : undefined;
  const elapsed = task.publishAt ? formatPulseUntil(task.publishAt) : formatPulseAge(task.updatedAt ?? task.createdAt);
  const detail =
    task.detail ||
    (progress ? t("ui.slurp.pulse.progress", { defaultValue: "{{progress}} complete", progress }) : status);
  return (
    <motion.div
      initial={running ? { scale: 0.985 } : false}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-3",
        stacked
          ? "min-h-11 px-2 py-2"
          : "rounded-xl bg-[var(--slurp-surface-raised)] ring-1 ring-inset ring-[var(--noodle-divider)]",
        stacked ? "" : compact ? "px-3 py-2" : "px-3 py-2.5",
      )}
    >
      {account ? (
        <Avatar account={account} size="xs" />
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--noodle-accent)]/12 text-[var(--noodle-accent-foreground)]">
          {running ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : task.status === "error" || task.status === "failed" ? (
            <CircleAlert size={15} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={15} aria-hidden="true" />
          )}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate font-semibold", compact ? "text-xs" : "text-sm")}>{label}</span>
        <span className="block truncate text-xs text-[var(--muted-foreground)]">
          {scope} {elapsed ? `· ${elapsed}` : ""}
        </span>
        <span className="block truncate text-xs text-[var(--muted-foreground)]">{detail}</span>
      </span>
      <span
        className={cn(
          "shrink-0 text-xs font-semibold",
          task.status === "error" || task.status === "failed"
            ? "text-[var(--slurp-danger)]"
            : "text-[var(--muted-foreground)]",
        )}
      >
        {status}
      </span>
    </motion.div>
  );
}

function PulseGroupCard({
  group,
  accounts,
  t,
  attention = false,
}: {
  group: PulseGroup;
  accounts: PulseAccount[];
  t: (key: string, options?: Record<string, unknown>) => string;
  attention?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const latest = group.tasks[0];
  const label = pulseGroupLabel(group.kind, t);
  const scope =
    group.accountIds.length > 1
      ? t("ui.slurp.pulse.creatorCount", { defaultValue: "{{count}} Creators", count: group.accountIds.length })
      : group.tasks.length > 1
        ? t("ui.slurp.pulse.taskCount", { defaultValue: "{{count}} items", count: group.tasks.length })
        : undefined;
  const running = group.active && !attention;
  const names = group.accountIds
    .map((id) => accounts.find((account) => account.id === id || account.entityId === id)?.displayName)
    .filter((name): name is string => Boolean(name));
  const nameSummary = names.length > 0 ? names.slice(0, 3).join(", ") + (names.length > 3 ? " …" : "") : null;
  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, x: group.tasks[0]?.source === "client" ? 24 : 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div
        className={cn(
          "relative rounded-xl ring-1 ring-inset",
          attention
            ? "bg-[var(--slurp-danger)]/7 ring-[var(--slurp-danger)]/25"
            : "bg-[var(--slurp-surface-raised)] ring-[var(--noodle-divider)]",
        )}
      >
        <button
          type="button"
          onClick={() => {
            if (expanded) setShowAllTasks(false);
            setExpanded(!expanded);
          }}
          aria-expanded={expanded}
          className="relative z-10 flex min-h-16 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--noodle-accent)]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--noodle-accent)]/10 text-[var(--noodle-accent-foreground)]">
            {attention ? (
              <CircleAlert size={16} aria-hidden="true" />
            ) : running ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 size={16} aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{label}</span>
            <span className="block truncate text-xs text-[var(--muted-foreground)]">
              {scope ?? nameSummary ?? taskSummary(group.tasks[0], t)}
            </span>
            {nameSummary && scope && (
              <span className="block truncate text-xs text-[var(--muted-foreground)]">{nameSummary}</span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
            {group.tasks.length > 1 && <span>{group.tasks.length}</span>}
            {group.tasks.length > 1 ? (
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={cn("transition-transform motion-reduce:transition-none", expanded && "rotate-180")}
              />
            ) : (
              pulseTaskStatus(latest.status, running, t)
            )}
          </span>
        </button>
      </div>
      {group.tasks.length > 1 && !expanded && (
        <div className="relative z-0 -mt-1 h-2 px-2" aria-hidden="true">
          <span className="absolute inset-x-1 top-0 h-2 rounded-b-lg bg-[var(--slurp-surface-raised)] ring-1 ring-inset ring-[var(--noodle-divider)]/60" />
          <span className="absolute inset-x-2 top-1 h-2 rounded-b-lg bg-[var(--slurp-surface-raised)] ring-1 ring-inset ring-[var(--noodle-divider)]/40" />
        </div>
      )}
      {expanded && group.tasks.length > 1 && (
        <div className="relative z-10 space-y-2 px-2 pb-2 pt-2">
          {(showAllTasks ? group.tasks : group.tasks.slice(0, 6)).map((task) => (
            <PulseTaskRow
              key={task.id}
              task={task}
              accounts={accounts}
              running={isActiveTask(task.status)}
              compact
              t={t}
            />
          ))}
          {group.tasks.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllTasks((value) => !value)}
              aria-expanded={showAllTasks}
              className="min-h-9 rounded-md px-2 text-start text-xs font-semibold text-[var(--noodle-accent-foreground)] hover:bg-[var(--noodle-accent)]/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--noodle-accent)]"
            >
              {showAllTasks
                ? t("ui.slurp.pulse.showFewer", { defaultValue: "Show fewer" })
                : t("ui.slurp.pulse.moreTasks", {
                    defaultValue: "+{{count}} more",
                    count: group.tasks.length - 6,
                  })}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function pulseGroupLabel(kind: string, t: (key: string, options?: Record<string, unknown>) => string) {
  const labels: Record<string, [string, string]> = {
    "post-production": ["ui.slurp.pulse.generatePosts", "Generate posts"],
    "audience-activity": ["ui.slurp.pulse.audienceActivity", "Audience activity"],
    conversation: ["ui.slurp.pulse.conversation", "Conversation work"],
    "creator-improvement": ["ui.slurp.pulse.creatorImprovement", "Creator improvements"],
    commission: ["ui.slurp.pulse.commission", "Commission work"],
    "scheduled-post": ["ui.slurp.pulse.scheduledPost", "Scheduled post"],
  };
  const [key, defaultValue] = labels[kind] ?? ["ui.slurp.pulse.task", "Slurp work"];
  return t(key, { defaultValue });
}

function taskSummary(task: PulseTask | undefined, t: (key: string, options?: Record<string, unknown>) => string) {
  if (!task) return "";
  if (task.publishAt)
    return `${t("ui.slurp.pulse.nextPublish", { defaultValue: "Next publish" })} · ${formatPulseUntil(task.publishAt)}`;
  const progress =
    task.progress && task.progress.total > 0 ? `${task.progress.completed}/${task.progress.total}` : null;
  return task.detail || progress || pulseTaskStatus(task.status, !isTerminalTask(task.status), t);
}

/** "in 5m", "in 2h", "in 3d", in the UI language. */
function formatPulseUntil(value: string) {
  const minutes = Math.max(0, Math.round((Date.parse(value) - Date.now()) / 60_000));
  const format = new Intl.RelativeTimeFormat(i18next.language, { style: "narrow" });
  if (minutes < 60) return format.format(minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return format.format(hours, "hour");
  return format.format(Math.floor(hours / 24), "day");
}

function pulseTaskStatus(
  taskStatus: string,
  running: boolean,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (running || taskStatus === "running" || taskStatus === "generating" || taskStatus === "applying") {
    return t("ui.slurp.pulse.working", { defaultValue: "Working" });
  }
  if (taskStatus === "scheduled") {
    return t("ui.slurp.pulse.scheduledStatus", { defaultValue: "Scheduled" });
  }
  if (["queued", "prepared"].includes(taskStatus)) {
    return t("ui.slurp.pulse.queued", { defaultValue: "Queued" });
  }
  if (taskStatus === "error" || taskStatus === "failed" || taskStatus === "abandoned") {
    return t("ui.slurp.pulse.failed", { defaultValue: "Failed" });
  }
  if (taskStatus === "waiting" || taskStatus === "connection_required") {
    return t("ui.slurp.pulse.waiting", { defaultValue: "Waiting" });
  }
  return t("ui.slurp.pulse.complete", { defaultValue: "Complete" });
}

/** The shared list timestamp ("now", "4m", "2h", …) in the UI language. */
function formatPulseAge(value?: string) {
  return value ? formatRelativeTime(value, i18next.language) : "";
}

function readAccountIds(variables: unknown): string[] {
  if (!variables || typeof variables !== "object") return [];
  const record = variables as Record<string, unknown>;
  if (Array.isArray(record.accountIds)) {
    return record.accountIds.filter((id): id is string => typeof id === "string");
  }
  for (const key of ["accountId", "targetAccountId", "creatorAccountId"]) {
    if (typeof record[key] === "string") return [record[key]];
  }
  return [];
}

function pulseTaskLabel(key: string, t: (key: string, options?: Record<string, unknown>) => string) {
  const labels: Record<string, [string, string]> = {
    "generate-post": ["ui.slurp.pulse.generatePost", "Generating post"],
    "generate-posts": ["ui.slurp.pulse.generatingPosts", "Generating posts"],
    "generate-post-image": ["ui.slurp.pulse.generateImage", "Generating image"],
    "generate-post-images": ["ui.slurp.pulse.generateImages", "Preparing post images"],
    "create-post": ["ui.slurp.pulse.createPostTask", "Publishing post"],
    "auto-post": ["ui.slurp.pulse.autoPost", "Running scheduled post"],
    "audience-activity": ["ui.slurp.pulse.audienceTask", "Running audience activity"],
    "conversation-schedule": ["ui.slurp.pulse.scheduleTask", "Refreshing conversation schedule"],
    "first-post": ["ui.slurp.pulse.firstPost", "Creating first post"],
    "creator-improvement": ["ui.slurp.pulse.improvingCreators", "Improving Creator profiles"],
    "conversation-follow-up": ["ui.slurp.pulse.followUp", "Preparing conversation follow-up"],
    commission: ["ui.slurp.pulse.preparingCommission", "Preparing commission"],
  };
  const [keyName, defaultValue] = labels[key] ?? ["ui.slurp.pulse.slurpTask", "Slurp task"];
  return t(keyName, { defaultValue });
}
