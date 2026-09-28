import { useState } from "react";
import { CircleAlert, Clock, Info, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpSparkleGlyph } from "../../base/chrome/SlpGlyphs";
import { SlpButton, SlpPrimaryButton, slpTagClass } from "../../modules/chrome/SlpButton";
import { SlpUsesAiMark, noteSlpAiUseOnce } from "../../modules/chrome/SlpAiMark";
import { SlpSheet } from "../../modules/chrome/SlpSheet";
import { playSlpBurst } from "../../modules/sparkle/SlpSparkle";
import { errorMessage } from "../../modules/settings/slp-backstage-format";
import type { SlpActionPreview, SlpStirOrigin } from "../../../../../shared/src/slp/slp-stir.js";
import { useSlurpStirPlay } from "./slp-stir-hooks";

type T = (key: string, options?: Record<string, unknown>) => string;

/** The card's "what" line, in the world's words, from the action and its few values. */
export function slpStirWhat(t: T, card: SlpActionPreview): string {
  const [a, b] = card.who;
  const names = { a: a?.name ?? "", b: b?.name ?? "", name: a?.name ?? "" };
  const d = card.detail;
  switch (card.action) {
    case "steer-creator": {
      const parts = [
        d.mood ? t("ui.slurp.stir.part.mood", { mood: t(`ui.slurp.steering.moods.${d.mood}`) }) : null,
        d.pace ? t("ui.slurp.stir.part.pace", { pace: t(`ui.slurp.steering.paces.${d.pace}`) }) : null,
        d.lifePhase ? t("ui.slurp.stir.part.life", { text: d.lifePhase }) : null,
        d.focus ? t("ui.slurp.stir.part.focus", { text: d.focus }) : null,
        d.push ? t("ui.slurp.stir.part.push", { text: d.push }) : null,
        d.avoid ? t("ui.slurp.stir.part.avoid", { text: d.avoid }) : null,
      ].filter(Boolean);
      return t("ui.slurp.stir.what.steer-creator", { ...names, parts: parts.join(" · ") });
    }
    case "set-spice":
      return t("ui.slurp.stir.what.set-spice", {
        ...names,
        level: d.level ? t(`ui.slurp.spice.levels.${d.level}`) : t("ui.slurp.stir.defaultLevel"),
      });
    case "steer-couple":
      return t(`ui.slurp.stir.what.steer-couple.${d.steer}`, names);
    case "steer-storyline":
      return t(`ui.slurp.stir.what.steer-storyline.${d.move}`, {
        ...names,
        title: d.title,
        chapter: d.chapter,
        next: d.next ?? "",
        text: d.text ?? "",
      });
    case "couple-page":
      return t(d.open ? "ui.slurp.stir.what.couple-page.open" : "ui.slurp.stir.what.couple-page.close", names);
    case "suggest-collab":
      return t(d.happen ? "ui.slurp.stir.what.suggest-collab.happen" : "ui.slurp.stir.what.suggest-collab.ask", {
        ...names,
        idea: d.idea ?? "",
      });
    case "set-up-couple":
      return t(
        d.stage === "together" ? "ui.slurp.stir.what.set-up-couple.together" : "ui.slurp.stir.what.set-up-couple",
        names,
      );
    case "add-idea":
      return t(d.story ? "ui.slurp.stir.what.add-idea.story" : "ui.slurp.stir.what.add-idea", {
        ...names,
        text: d.text,
      });
    case "write-post":
      return t(d.idea ? "ui.slurp.stir.what.write-post.idea" : "ui.slurp.stir.what.write-post", {
        ...names,
        idea: d.idea ?? "",
      });
    case "start-event":
      return t("ui.slurp.stir.what.start-event", { name: d.name, count: Number(d.days) || 1 });
    case "start-rivalry":
      return t("ui.slurp.stir.what.start-rivalry", { ...names, cause: d.cause ?? "" });
    default:
      return t(`ui.slurp.stir.what.${card.action}`, names);
  }
}

/** The Burst, the toast, and one Undo for everything that can be taken back. */
export function useSlpStirDoIt() {
  const { t } = useTranslation();
  const { play, undo } = useSlurpStirPlay();
  const run = (
    cards: SlpActionPreview[],
    origin: SlpStirOrigin,
    options: { from?: DOMRect; supportMessageId?: string; onDone?: () => void } = {},
  ) => {
    const steps = cards.filter((card) => !card.error).map((card) => ({ action: card.action, input: card.input }));
    if (!steps.length) return;
    if (cards.some((card) => card.cost === "ai")) noteSlpAiUseOnce(t);
    play.mutate(
      { steps, origin, supportMessageId: options.supportMessageId },
      {
        onSuccess: ({ play: done, results }) => {
          const failed = results.filter((result) => !result.ok);
          if (failed.length === results.length) {
            toast.error(failed[0]?.error ?? t("ui.slurp.stir.failed"));
            return;
          }
          if (options.from) playSlpBurst(options.from, 14);
          const undoAction = done.undoable
            ? {
                label: t("ui.slurp.wallet.undo", { defaultValue: "Undo" }),
                onClick: () =>
                  undo.mutate(done.id, {
                    onSuccess: () => toast(t("ui.slurp.stir.undone")),
                    onError: (error) => toast.error(errorMessage(error)),
                  }),
              }
            : undefined;
          toast.success(t("ui.slurp.stir.done", { count: results.length - failed.length }), {
            description: failed.length
              ? t("ui.slurp.stir.someFailed", { count: failed.length, reason: failed[0]?.error ?? "" })
              : t("ui.slurp.stir.doneDetail"),
            action: undoAction,
            duration: undoAction ? 8000 : 4000,
          });
          options.onDone?.();
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  };
  return { run, pending: play.isPending };
}

/** Two small avatars (who), or one. */
function Who({ card }: { card: SlpActionPreview }) {
  if (!card.who.length)
    return <SlpSparkleGlyph size={22} aria-hidden="true" className="shrink-0 text-[var(--slurp-ink)]" />;
  return (
    <span className="flex shrink-0 -space-x-2" aria-hidden="true">
      {card.who.slice(0, 2).map((person) => (
        <Avatar
          key={person.id}
          account={{ displayName: person.name, avatarUrl: person.avatarUrl }}
          size="sm"
          className="ring-2 ring-[var(--slurp-surface-raised)]"
        />
      ))}
    </span>
  );
}

/**
 * One preview card (design: Here is the plan): who, what, when, the cost, the Creator's own answer
 * where they may say no, fit notes from their cards, and why it cannot happen. ✕ takes it out.
 */
export function SlpStirCard({ card, onRemove }: { card: SlpActionPreview; onRemove?: () => void }) {
  const { t } = useTranslation();
  const [a] = card.who;
  // A fit note that already says they may say no makes the chip a repeat.
  const refusalNoted = card.notes.some((note) => note.kind === "mayDecline" || note.kind === "noCollabs");
  return (
    <li
      data-slp-stir-card={card.action}
      className={cn(
        "relative flex flex-col gap-2 rounded-2xl bg-[var(--slurp-surface-raised)] p-3.5 shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]",
        card.error && "opacity-70",
      )}
    >
      <div className="flex min-w-0 items-center gap-3 pe-9">
        <Who card={card} />
        {/* The "what" line names them already; the avatars carry the names for screen readers. */}
        <p className={cn(SLP_TYPE.body, "min-w-0 flex-1 font-semibold [overflow-wrap:anywhere]")}>
          {slpStirWhat(t, card)}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t("ui.slurp.stir.remove")}
          className="absolute end-1.5 top-1.5 flex size-11 items-center justify-center rounded-full text-[var(--slurp-muted)] hover:bg-[var(--accent)] hover:text-[var(--slurp-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)]"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
      {card.error ? (
        <p className={cn(SLP_TYPE.meta, "flex items-start gap-1.5 text-[var(--slurp-danger)]")}>
          <CircleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          {t(`ui.slurp.stir.cant.${card.error}`, {
            name: a?.name ?? "",
            defaultValue: t("ui.slurp.stir.cant.generic"),
          })}
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={slpTagClass(false)}>
            <Clock size={11} aria-hidden="true" />
            {t(`ui.slurp.stir.when.${card.when}`)}
          </span>
          {card.cost === "ai" ? (
            <SlpUsesAiMark />
          ) : (
            <span className={slpTagClass(true)}>{t("ui.slurp.stir.free")}</span>
          )}
          {card.refusable && !refusalNoted && (
            <span className={slpTagClass(false)}>{t("ui.slurp.stir.mayRefuse")}</span>
          )}
        </div>
      )}
      {!card.error &&
        card.notes.map((note) => (
          <p
            key={`${note.kind}:${note.name ?? ""}`}
            className={cn(SLP_TYPE.meta, "flex items-start gap-1.5 text-[var(--slurp-muted)]")}
          >
            <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            {t(`ui.slurp.stir.note.${note.kind}`, { name: note.name ?? "" })}
          </p>
        ))}
    </li>
  );
}

/**
 * "Here is the plan": the preview cards, with ✕ to take one out, the lines Slurp cannot do, a
 * question when the words were unclear, and "Do it". Nothing runs before the tap.
 */
export function SlpStirPlanSheet({
  open,
  onClose,
  cards: initial,
  cant = [],
  question = null,
  origin,
  onChangeWords,
  intro,
}: {
  open: boolean;
  onClose: () => void;
  cards: SlpActionPreview[];
  cant?: string[];
  question?: string | null;
  origin: SlpStirOrigin;
  /** Back to the words, kept (the box). */
  onChangeWords?: () => void;
  intro?: string;
}) {
  const { t } = useTranslation();
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const cards = initial.filter((_, index) => !removed.has(index));
  const playable = cards.filter((card) => !card.error);
  const doIt = useSlpStirDoIt();
  const close = () => {
    setRemoved(new Set());
    onClose();
  };
  return (
    <SlpSheet
      open={open}
      onClose={close}
      closeDisabled={doIt.pending}
      title={t("ui.slurp.stir.planTitle")}
      footer={
        <div className="flex gap-2 px-3 py-2">
          {onChangeWords && (
            <SlpButton variant="quiet" onClick={onChangeWords} disabled={doIt.pending} className="flex-1">
              {t("ui.slurp.stir.changeWords")}
            </SlpButton>
          )}
          <SlpPrimaryButton
            disabled={!playable.length || doIt.pending}
            onClick={(event) =>
              doIt.run(cards, origin, { from: event.currentTarget.getBoundingClientRect(), onDone: close })
            }
            className="flex-1"
          >
            <SlpSparkleGlyph size={16} aria-hidden="true" />
            {doIt.pending ? t("ui.slurp.stir.doing") : t("ui.slurp.stir.doIt")}
          </SlpPrimaryButton>
        </div>
      }
    >
      <div className="space-y-3 px-2 pb-2" data-slp-stir-plan>
        {intro && <p className={cn(SLP_TYPE.meta, "px-1 text-[var(--slurp-muted)]")}>{intro}</p>}
        {question && (
          <p className={cn(SLP_TYPE.body, "rounded-2xl bg-[var(--slurp-tint)] p-3 font-semibold")}>{question}</p>
        )}
        {initial.length > 0 ? (
          <ul className="space-y-2">
            {initial.map((card, index) =>
              removed.has(index) ? null : (
                <SlpStirCard
                  key={`${card.action}:${index}`}
                  card={card}
                  onRemove={() => setRemoved((current) => new Set(current).add(index))}
                />
              ),
            )}
          </ul>
        ) : (
          !question && (
            <p className={cn(SLP_TYPE.body, "px-1 text-[var(--slurp-muted)]")}>{t("ui.slurp.stir.noCards")}</p>
          )
        )}
        {cant.map((line) => (
          <p key={line} className={cn(SLP_TYPE.meta, "flex items-start gap-1.5 px-1 text-[var(--slurp-muted)]")}>
            <CircleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            {line}
          </p>
        ))}
        {playable.length > 0 && (
          <p className={cn(SLP_TYPE.caption, "px-1 text-[var(--slurp-muted)]")}>{t("ui.slurp.stir.nothingYet")}</p>
        )}
      </div>
    </SlpSheet>
  );
}
