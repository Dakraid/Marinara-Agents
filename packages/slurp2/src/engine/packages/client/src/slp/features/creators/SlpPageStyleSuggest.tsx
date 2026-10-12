import { useState, type ReactNode } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type {
  SlpCreatorManagedStageProfile,
  SlpPageStylePatch,
  SlpPageStyleSuggestion,
} from "../../../../../shared/src/slp/slp-social.types.js";
import { Field } from "../../modules/settings/SlpSettingsControls";
import { errorMessage } from "../../modules/settings/slp-backstage-format";
import { useSuggestCreatorPageStyle, useUpdateCreatorStrategy } from "./slp-creators-hooks";
import { accentButton, noteClass, quietButton } from "./slp-creator-classes";

type Key = keyof SlpPageStylePatch;
const KEYS: Key[] = ["style", "textOnlyRate", "intentWeights", "strategyText"];

/** Each intent's share of the drawn mix, in whole percent. */
function shares(weights: Record<string, number>): Record<string, number> {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0) || 1;
  return Object.fromEntries(
    Object.entries(weights).map(([intent, weight]) => [intent, Math.round((weight / total) * 100)]),
  );
}

/**
 * "Suggest page style": one tap reads the Character card and proposes how this Creator runs their
 * page, as changes to the controls below. Nothing is saved until the player applies it, and they
 * can leave out any single change.
 */
export function SlpPageStyleSuggest({
  creator,
  onApplied,
}: {
  creator: SlpCreatorManagedStageProfile;
  onApplied: () => void;
}) {
  const { t } = useTranslation();
  const suggest = useSuggestCreatorPageStyle();
  const update = useUpdateCreatorStrategy();
  // Keyed by Creator so a suggestion never shows on the next Creator's settings.
  const [result, setResult] = useState<{ id: string; suggestion: SlpPageStyleSuggestion; skip: Key[] } | null>(null);
  const [error, setError] = useState<{ id: string; text: string } | null>(null);
  const shown = result?.id === creator.id ? result : null;
  const shownError = error?.id === creator.id ? error.text : null;
  const busy = suggest.isPending || update.isPending;
  const styleName = (style: string) => t(`ui.slurp.settings.creators.strategy.style.${style}`, { defaultValue: style });
  const intentName = (intent: string) => t(`ui.slurp.continuity.intent.${intent}`, { defaultValue: intent });

  const run = () => {
    setError(null);
    setResult(null);
    suggest.mutate(creator.id, {
      onSuccess: (suggestion) => setResult({ id: creator.id, suggestion, skip: [] }),
      onError: (failure) => setError({ id: creator.id, text: errorMessage(failure) }),
    });
  };

  const apply = () => {
    if (!shown) return;
    const { proposal, saved } = shown.suggestion;
    const keys = KEYS.filter((key) => proposal[key] !== undefined && !shown.skip.includes(key));
    if (!keys.length) return;
    const patch = Object.fromEntries(keys.map((key) => [key, proposal[key]]));
    const expect = Object.fromEntries(keys.map((key) => [key, saved[key] ?? null]));
    setError(null);
    update.mutate(
      { accountId: creator.id, ...patch, expect },
      {
        onSuccess: () => {
          setResult(null);
          onApplied();
          toast.success(t("ui.slurp.settings.creators.pageStyle.applied", { defaultValue: "Page style applied." }));
        },
        onError: (failure) => setError({ id: creator.id, text: errorMessage(failure) }),
      },
    );
  };

  const toggle = (key: Key) =>
    shown &&
    setResult({
      ...shown,
      skip: shown.skip.includes(key) ? shown.skip.filter((entry) => entry !== key) : [...shown.skip, key],
    });

  const rows = (suggestion: SlpPageStyleSuggestion) => {
    const { current, proposal } = suggestion;
    const out: { key: Key; label: string; change: ReactNode }[] = [];
    if (proposal.style !== undefined)
      out.push({
        key: "style",
        label: t("ui.slurp.settings.creators.strategy.styleLabel", { defaultValue: "Production style" }),
        change: `${styleName(current.style)} → ${styleName(proposal.style)}`,
      });
    if (proposal.textOnlyRate !== undefined)
      out.push({
        key: "textOnlyRate",
        label: t("ui.slurp.settings.creators.strategy.textLabel", { defaultValue: "Posts without pictures" }),
        change: `${current.textOnlyRate}% → ${proposal.textOnlyRate}%`,
      });
    if (proposal.intentWeights !== undefined) {
      const before = shares(current.intentWeights);
      const after = shares(proposal.intentWeights);
      const changed = Object.keys(after).filter((intent) => (before[intent] ?? 0) !== after[intent]);
      out.push({
        key: "intentWeights",
        label: t("ui.slurp.settings.creators.pageStyle.mixLabel", { defaultValue: "Post mix" }),
        change: (
          <ul className="space-y-0.5">
            {changed.map((intent) => (
              <li key={intent}>
                {intentName(intent)} {before[intent] ?? 0}% → {after[intent]}%
              </li>
            ))}
          </ul>
        ),
      });
    }
    if (proposal.strategyText !== undefined)
      out.push({
        key: "strategyText",
        label: t("ui.slurp.settings.creators.strategy.noteLabel", { defaultValue: "How they run their page" }),
        change: (
          <>
            {current.strategyText && <span className="block line-through opacity-70">{current.strategyText}</span>}
            <span className="block">{proposal.strategyText}</span>
          </>
        ),
      });
    return out;
  };

  const list = shown ? rows(shown.suggestion) : [];
  const chosen = list.filter((row) => !shown?.skip.includes(row.key)).length;

  return (
    <Field
      label={t("ui.slurp.settings.creators.pageStyle.label", { defaultValue: "Suggest page style" })}
      detail={t("ui.slurp.settings.creators.pageStyle.detail", {
        defaultValue:
          "Optional. Reads the Character card and proposes the settings below. Nothing changes until you apply it.",
      })}
      wide
    >
      <div className="space-y-3">
        <button type="button" className={quietButton} disabled={busy} onClick={run} aria-busy={suggest.isPending}>
          {suggest.isPending ? (
            <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Sparkles size={14} aria-hidden="true" />
          )}
          {suggest.isPending
            ? t("ui.slurp.settings.creators.pageStyle.loading", { defaultValue: "Reading the card…" })
            : shown || shownError
              ? t("ui.slurp.settings.creators.pageStyle.again", { defaultValue: "Suggest again" })
              : t("ui.slurp.settings.creators.pageStyle.action", { defaultValue: "Suggest" })}
        </button>
        {shownError && (
          <p role="alert" className="text-sm text-[var(--slurp-danger)] break-words">
            {shownError}
          </p>
        )}
        {shown && (
          <div className={`${noteClass} space-y-3`} aria-live="polite">
            {shown.suggestion.explanation && (
              <p className="text-sm leading-6 text-[var(--slurp-text)] break-words">{shown.suggestion.explanation}</p>
            )}
            {list.length === 0 ? (
              <p>
                {t("ui.slurp.settings.creators.pageStyle.fits", { defaultValue: "The current settings already fit." })}
              </p>
            ) : (
              <fieldset className="space-y-2">
                <legend className="sr-only">
                  {t("ui.slurp.settings.creators.pageStyle.changes", { defaultValue: "Changes to apply" })}
                </legend>
                {list.map((row) => (
                  <label key={row.key} className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 accent-[var(--noodle-accent)]"
                      checked={!shown.skip.includes(row.key)}
                      disabled={busy}
                      onChange={() => toggle(row.key)}
                    />
                    <span className="min-w-0 break-words">
                      <span className="block font-semibold text-[var(--slurp-text)]">{row.label}</span>
                      <span className="block tabular-nums">{row.change}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            <div className="flex flex-wrap gap-2">
              {list.length > 0 && (
                <button type="button" className={accentButton} disabled={busy || chosen === 0} onClick={apply}>
                  {update.isPending && (
                    <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  )}
                  {t("ui.slurp.settings.creators.pageStyle.apply", { defaultValue: "Apply" })}
                </button>
              )}
              <button type="button" className={quietButton} disabled={update.isPending} onClick={() => setResult(null)}>
                {list.length > 0
                  ? t("ui.slurp.settings.creators.pageStyle.keep", { defaultValue: "Keep current" })
                  : t("ui.slurp.settings.creators.pageStyle.close", { defaultValue: "Close" })}
              </button>
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}
