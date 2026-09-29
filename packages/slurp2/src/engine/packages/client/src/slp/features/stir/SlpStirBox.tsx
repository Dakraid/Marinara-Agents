import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpStirGlyph } from "../../base/chrome/SlpGlyphs";
import { SlpChip, SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { SlpUsesAiMark, noteSlpAiUseOnce } from "../../modules/chrome/SlpAiMark";
import { errorMessage } from "../../modules/settings/slp-backstage-format";
import { SLP_STIR_TEXT_MAX, type SlpStirPlan } from "../../../../../shared/src/slp/slp-stir.js";
import { useSlurpStirPlan } from "./slp-stir-hooks";
import { SlpStirPlanSheet } from "./SlpStirCards";
import { startSlpTask } from "../../base/state/slp-task-store";
import { openSlpStirReadyPlan, useSlpStirReadyPlan } from "../../base/state/slp-stir-sheet-store";

/** Real examples from this world: the placeholder rotates through them, the chips fill the box. */
function useExamples(fullNames: string[], aboutName?: string) {
  const { t } = useTranslation();
  // First names read like something you would say ("make Mira and Kai flirt").
  const first = (name: string) => name.trim().split(/\s+/u)[0] ?? name;
  const names = fullNames.map(first);
  const about = aboutName ? first(aboutName) : undefined;
  const [a = "Mira", b = "Kai"] = names;
  if (about)
    return [
      t("ui.slurp.stir.example.about.idea", { name: about }),
      t("ui.slurp.stir.example.about.break", { name: about }),
      t("ui.slurp.stir.example.about.crush", { name: about, other: names.find((name) => name !== about) ?? b }),
    ];
  return [
    t("ui.slurp.stir.example.flirt", { a, b }),
    t("ui.slurp.stir.example.collab", { a: b, b: a }),
    t("ui.slurp.stir.example.drama", { a, b }),
    t("ui.slurp.stir.example.event"),
  ];
}

/**
 * "What should we stir up?": plain words in, a plan of preview cards out (one AI call on the Plans
 * row), edit or remove, then "Do it". On a Creator's ✦ sheet it is about them ("What should Mira do?").
 */
export function SlpStirBox({
  names,
  about,
  postId,
  onPlan,
}: {
  /** Inside another sheet, the plan opens there (one Slurp sheet at a time closes the one below). */
  onPlan?: (plan: SlpStirPlan) => void;
  /** Creator names for the examples. */
  names: string[];
  /** The ✦ sheet's Creator. */
  about?: { id: string; name: string };
  postId?: string;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const examples = useExamples(names, about?.name);
  const [text, setText] = useState("");
  const [tick, setTick] = useState(0);
  const [plan, setPlan] = useState<{ plan: SlpStirPlan; key: number } | null>(null);
  const planner = useSlurpStirPlan();
  const [planning, setPlanning] = useState(false);
  // Planning is a Pulse task (B): the player may leave; a plan that comes back to an empty screen
  // opens from its toast or from Pulse instead of being lost.
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );
  useEffect(() => {
    if (text) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 4000);
    return () => window.clearInterval(timer);
  }, [text]);
  const submit = () => {
    const words = text.trim();
    if (words.length < 2 || planning) return;
    noteSlpAiUseOnce(t);
    setPlanning(true);
    const origin = about ? "sheet" : "words";
    const openHere = (answer: SlpStirPlan) => {
      if (onPlan) {
        setText("");
        onPlan(answer);
      } else setPlan({ plan: answer, key: Date.now() });
    };
    void startSlpTask({
      kind: "stir-plan",
      label: t("ui.slurp.stir.taskPlan", { words: words.length > 48 ? `${words.slice(0, 47)}…` : words }),
      accountIds: about ? [about.id] : [],
      // The button says "Planning…" while the box is on screen; the toast only when the player left.
      startedToast: false,
      doneToast: false,
      run: () =>
        planner.mutateAsync({ text: words, ...(about ? { creatorId: about.id } : {}), ...(postId ? { postId } : {}) }),
      done: (answer) => {
        const open = { label: t("ui.slurp.stir.openPlan"), run: () => openSlpStirReadyPlan(answer, origin) };
        if (mounted.current) {
          setPlanning(false);
          openHere(answer);
        } else
          toast.success(t("ui.slurp.stir.planReady"), {
            description: words,
            action: { label: open.label, onClick: open.run },
          });
        return { result: t("ui.slurp.stir.planCards", { count: answer.cards.length }), open };
      },
    }).then(() => {
      if (mounted.current) setPlanning(false);
    });
  };
  return (
    <section
      data-slp-stir-box
      aria-labelledby={`${inputId}-label`}
      className="relative isolate overflow-hidden rounded-3xl bg-[var(--slurp-surface-raised)] p-4 shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]"
    >
      {/* A soft pink wash in the corner: the box is the fun way in, so it gets the one warm glow. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-16 -top-20 -z-10 size-56 rounded-full bg-[var(--noodle-accent)] opacity-[0.14] blur-3xl"
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="space-y-3"
      >
        <label id={`${inputId}-label`} htmlFor={inputId} className="flex items-center gap-2">
          <SlpStirGlyph size={18} aria-hidden="true" className="shrink-0 text-[var(--slurp-ink)]" />
          <span className={cn(SLP_TYPE.title)}>
            {about ? t("ui.slurp.stir.boxAbout", { name: about.name }) : t("ui.slurp.stir.box")}
          </span>
        </label>
        <textarea
          id={inputId}
          value={text}
          rows={2}
          maxLength={SLP_STIR_TEXT_MAX}
          placeholder={examples[tick % examples.length]}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          className="block min-h-[4.5rem] w-full resize-none rounded-2xl bg-[var(--slurp-canvas)] px-3.5 py-3 text-base leading-6 outline-none ring-1 ring-inset ring-[var(--slurp-outline)] transition-shadow placeholder:text-[var(--slurp-muted)] focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--noodle-accent)_22%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--noodle-accent)] sm:text-sm"
        />
        <div
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]"
          aria-label={t("ui.slurp.stir.examples")}
        >
          {/* The chips are the examples the placeholder is not showing right now. */}
          {examples
            .filter((_, index) => index !== tick % examples.length)
            .slice(0, 3)
            .map((example) => (
              <SlpChip key={example} onClick={() => setText(example)} className="shrink-0 whitespace-nowrap">
                {example}
              </SlpChip>
            ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={cn(SLP_TYPE.meta, "flex items-center gap-1.5 text-[var(--slurp-muted)]")}>
            <SlpUsesAiMark />
            {t("ui.slurp.stir.boxCost")}
          </p>
          <SlpPrimaryButton type="submit" disabled={text.trim().length < 2 || planning}>
            {planning ? t("ui.slurp.stir.planning") : t("ui.slurp.stir.plan")}
          </SlpPrimaryButton>
        </div>
        {planner.error && !planning && (
          <p role="alert" className={cn(SLP_TYPE.meta, "text-[var(--slurp-danger)]")}>
            {errorMessage(planner.error)}
          </p>
        )}
      </form>
      <SlpStirPlanSheet
        key={plan?.key ?? 0}
        open={Boolean(plan)}
        onClose={() => {
          setPlan(null);
          setText("");
        }}
        onChangeWords={() => setPlan(null)}
        cards={plan?.plan.cards ?? []}
        cant={plan?.plan.cant ?? []}
        question={plan?.plan.question ?? null}
        origin={about ? "sheet" : "words"}
      />
    </section>
  );
}

/** A plan that came back after the player left its box (task B), opened from its toast or Pulse. */
export function SlpStirReadyPlanHost() {
  const ready = useSlpStirReadyPlan((state) => state.ready);
  return (
    <SlpStirPlanSheet
      key={ready?.key ?? 0}
      open={Boolean(ready)}
      onClose={() => useSlpStirReadyPlan.setState({ ready: null })}
      cards={ready?.plan.cards ?? []}
      cant={ready?.plan.cant ?? []}
      question={ready?.plan.question ?? null}
      origin={ready?.origin ?? "words"}
    />
  );
}
