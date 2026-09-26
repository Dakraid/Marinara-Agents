import { Loader2, TriangleAlert } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";

/** Honest wait state: a spinner and a line of text, so a slow request never looks like an empty screen. */
export function LoadingState({ label }: { label?: string }) {
  const { t: localizeUi } = useUiTranslation();
  return (
    <div role="status" className="flex flex-col items-center gap-3 px-8 py-12 text-center">
      <Loader2
        size={24}
        className="animate-spin text-[var(--noodle-accent-foreground)] motion-reduce:animate-none"
        aria-hidden="true"
      />
      <p className="text-sm text-[var(--muted-foreground)]">
        {label ?? localizeUi("ui.slurp.state.loading", { defaultValue: "Loading…" })}
      </p>
    </div>
  );
}

/** Honest failure state: says what failed, that nothing was lost, and offers Try again. */
export function ErrorState({ title, onRetry }: { title?: string; onRetry: () => void }) {
  const { t: localizeUi } = useUiTranslation();
  return (
    <div role="alert" className="px-8 py-12 text-center">
      <TriangleAlert
        size={32}
        className="mx-auto text-[var(--slurp-warning,var(--muted-foreground))]"
        aria-hidden="true"
      />
      <p className="mt-4 font-bold">
        {title ?? localizeUi("ui.slurp.state.error", { defaultValue: "Could not load this" })}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
        {localizeUi("ui.slurp.state.errorDetail", {
          defaultValue: "Nothing was lost. Check your connection and try again.",
        })}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 rounded-lg border border-[var(--noodle-divider)] px-4 text-sm font-bold transition-[background-color,transform] hover:bg-[var(--accent)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        {localizeUi("capabilities.actions.tryAgain")}
      </button>
    </div>
  );
}
