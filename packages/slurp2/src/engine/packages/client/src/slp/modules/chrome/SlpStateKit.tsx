import { Sparkles, TriangleAlert, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation as useUiTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpTwinkle } from "../sparkle/SlpSparkle";
import { SlpButton, slpButtonClass } from "./SlpButton";

// The state kit (design language §7): a wait looks like the content it waits for, a failure says what
// failed and offers Try again, and an empty list says what to do next.

/** After this long a wait says so, so a slow Engine never looks frozen. */
const STILL_CONNECTING_MS = 4000;

const BONE = "animate-pulse bg-[color-mix(in_srgb,var(--slurp-text)_9%,transparent)] motion-reduce:animate-none";

function Bone({ className }: { className: string }) {
  return <span aria-hidden="true" className={cn("block", BONE, className)} />;
}

/**
 * A skeleton shaped like the content it stands in for: `rows` (inbox, lists, followers), `thread`
 * (chat bubbles), `card` (wallet, Studio: a big block and rows) or `stories` (the Story shelf).
 */
export function SlpSkeleton({
  shape = "rows",
  count = 4,
  label,
}: {
  shape?: "rows" | "thread" | "card" | "stories";
  count?: number;
  label?: string;
}) {
  const { t: localizeUi } = useUiTranslation();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), STILL_CONNECTING_MS);
    return () => window.clearTimeout(timer);
  }, []);
  const items = Array.from({ length: count }, (_, index) => index);
  return (
    <div role="status" aria-busy="true" className={cn(shape === "stories" ? "flex items-center gap-2.5" : "px-4 py-4")}>
      <span className="sr-only">{label ?? localizeUi("ui.slurp.state.loading", { defaultValue: "Loading…" })}</span>
      {shape === "rows" &&
        items.map((index) => (
          <div key={index} className="flex items-center gap-3 py-2.5">
            <Bone className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className={cn("h-3 rounded-full", index % 2 ? "w-2/5" : "w-1/2")} />
              <Bone className={cn("h-3 rounded-full", index % 2 ? "w-4/5" : "w-3/5")} />
            </div>
          </div>
        ))}
      {shape === "thread" && (
        <div className="space-y-3">
          {items.map((index) => (
            <Bone
              key={index}
              className={cn(
                "h-10 rounded-2xl",
                index % 2 ? "ms-auto w-1/2 rounded-ee-md" : "w-3/5 rounded-es-md",
                index % 3 === 2 && "h-16",
              )}
            />
          ))}
        </div>
      )}
      {shape === "card" && (
        <div className="space-y-3">
          <Bone className="h-32 rounded-2xl" />
          {items.map((index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-1.5">
              <Bone className={cn("h-3 rounded-full", index % 2 ? "w-1/3" : "w-1/2")} />
              <Bone className="h-3 w-12 rounded-full" />
            </div>
          ))}
        </div>
      )}
      {shape === "stories" &&
        items.map((index) => (
          <Bone key={index} className="aspect-[3/4] w-[4.75rem] shrink-0 rounded-xl @min-[1024px]:w-[5.25rem]" />
        ))}
      {slow && (
        <p
          className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]", shape === "stories" ? "px-2" : "pt-3 text-center")}
        >
          {localizeUi("ui.slurp.state.stillConnecting", { defaultValue: "Still connecting…" })}
        </p>
      )}
    </div>
  );
}

// ponytail: the report link opens a prefilled GitHub issue; swap for an in-app report flow if one appears.
const BUG_REPORT_URL = "https://github.com/Pasta-Devs/Marinara-Agents/issues/new";
const bugReportHref = (cause: string) =>
  `${BUG_REPORT_URL}?${new URLSearchParams({
    title: `Slurp: ${cause}`,
    body: `What I was doing:\n\nWhat Slurp said: ${cause}\n`,
  }).toString()}`;

/** A failure: an icon, what failed, that nothing was lost, Try again, and a way to report it. */
export function SlpErrorState({
  title,
  detail,
  onRetry,
}: {
  title?: string;
  /** Replaces the default "Nothing was lost" line when the cause needs its own explanation. */
  detail?: string;
  onRetry: () => void;
}) {
  const { t: localizeUi } = useUiTranslation();
  const cause = title ?? localizeUi("ui.slurp.state.error", { defaultValue: "Could not load this" });
  return (
    <div role="alert" className="px-8 py-10 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-[color-mix(in_srgb,var(--slurp-warning)_14%,transparent)] text-[var(--slurp-warning)]">
        <TriangleAlert size={24} aria-hidden="true" className="!text-current" />
      </span>
      <p className={cn(SLP_TYPE.title, "mt-4")}>{cause}</p>
      <p className={cn(SLP_TYPE.body, "mx-auto mt-1.5 max-w-sm text-[var(--slurp-muted)]")}>
        {detail ??
          localizeUi("ui.slurp.state.errorDetail", {
            defaultValue: "Nothing was lost. Check your connection and try again.",
          })}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <SlpButton onClick={onRetry}>{localizeUi("capabilities.actions.tryAgain")}</SlpButton>
        <a href={bugReportHref(cause)} target="_blank" rel="noreferrer" className={slpButtonClass("tertiary")}>
          {localizeUi("ui.slurp.state.reportBug", { defaultValue: "Report bug" })}
        </a>
      </div>
    </div>
  );
}

/** An empty list: a twinkling icon, what is missing, and the next thing to do. */
export function SlpEmptyState({
  title,
  detail,
  action,
  onAction,
  icon: Icon = Sparkles,
}: {
  title: string;
  detail?: string;
  action?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <div className="px-8 py-8 text-center sm:py-14">
      <span className="relative isolate mx-auto grid size-20 place-items-center">
        <SlpTwinkle />
        <span className="grid size-14 place-items-center rounded-full bg-[var(--slurp-tint)] text-[var(--slurp-ink)] shadow-[var(--slurp-highlight)]">
          <Icon size={24} aria-hidden="true" className="!text-current" />
        </span>
      </span>
      <p className={cn(SLP_TYPE.title, "mt-3")}>{title}</p>
      {detail && <p className={cn(SLP_TYPE.body, "mx-auto mt-1.5 max-w-sm text-[var(--slurp-muted)]")}>{detail}</p>}
      {action && onAction && (
        <SlpButton onClick={onAction} className="mt-5">
          {action}
        </SlpButton>
      )}
    </div>
  );
}
