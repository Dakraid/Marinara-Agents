import { CalendarHeart, EyeOff, Eye, HeartCrack, HeartHandshake, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { SlpButton } from "../../modules/chrome/SlpButton";
import { SlpHeartGlyph } from "../../base/chrome/SlpGlyphs";
import { formatRelativeTime, formatUpcomingDay } from "../../base/ui/slp-date-time";
import { useSlpStirDoIt, useSlurpStirPreview } from "../stir/slp-stir-contract";
import type { SlurpPlayerCouple } from "./slp-messages-contract";

type Steer = "date" | "official" | "patchUp" | "secret" | "public" | "breakUp" | "reunite";

const LADDER = ["sparks", "dating", "together"] as const;

/** An anniversary mark in words: a month, three months, half a year, then years. */
const markLabel = (t: (key: string, options?: Record<string, unknown>) => string, days: number) =>
  days === 30
    ? t("ui.slurp.youTwo.mark.month")
    : days === 90
      ? t("ui.slurp.youTwo.mark.threeMonths")
      : days === 180
        ? t("ui.slurp.youTwo.mark.halfYear")
        : t("ui.slurp.youTwo.mark.years", { count: Math.round(days / 365) });

/**
 * Details › You two (Drama, "your relationship"): in the player's thread with the Creator they are
 * with (or were), the two of them in place of a fan's standing: the stage, the dates that matter, and
 * the moves. Every move is a Stir play, so it is previewed, lands in Recent plays, and has Undo.
 */
export function SlpYouTwo({ couple, name }: { couple: SlurpPlayerCouple; name: string }) {
  const { t, i18n } = useTranslation();
  const preview = useSlurpStirPreview();
  const doIt = useSlpStirDoIt();
  const over = couple.stage === "split";
  const rocky = couple.stage === "rocky";
  const reached = rocky ? 2 : LADDER.indexOf(couple.stage as (typeof LADDER)[number]);
  const stageWord = over
    ? t(couple.ending === "fizzled" ? "ui.slurp.youTwo.stage.faded" : "ui.slurp.youTwo.stage.ex")
    : t(`ui.slurp.youTwo.stage.${couple.stage}`);

  const run = (steer: Steer) =>
    preview
      .mutateAsync([{ action: "steer-couple", input: { coupleId: couple.id, steer } }])
      .then(({ cards }) => (cards[0]?.error ? void toast.error(t("ui.slurp.youTwo.cant")) : doIt.run(cards, "sheet")))
      .catch(() => void toast.error(t("ui.slurp.youTwo.cant")));

  const moves: { steer: Steer; icon: ReactNode; show: boolean; quiet?: boolean }[] = [
    { steer: "reunite", icon: <SlpHeartGlyph size={15} aria-hidden="true" />, show: over },
    { steer: "patchUp", icon: <HeartHandshake size={15} aria-hidden="true" />, show: rocky },
    {
      steer: "official",
      icon: <Sparkles size={15} aria-hidden="true" />,
      show: couple.stage === "sparks" || couple.stage === "dating",
    },
    { steer: "date", icon: <CalendarHeart size={15} aria-hidden="true" />, show: !over && !rocky },
    { steer: "secret", icon: <EyeOff size={15} aria-hidden="true" />, show: !over && !couple.secret },
    { steer: "public", icon: <Eye size={15} aria-hidden="true" />, show: !over && couple.secret },
    { steer: "breakUp", icon: <HeartCrack size={15} aria-hidden="true" />, show: !over, quiet: true },
  ];

  const facts = [
    couple.togetherAt && !over
      ? t("ui.slurp.youTwo.since", { when: formatRelativeTime(couple.togetherAt, i18n.language) })
      : null,
    couple.nextAnniversary
      ? t("ui.slurp.youTwo.anniversary", {
          label: markLabel(t, couple.nextAnniversary.days),
          when: formatUpcomingDay(couple.nextAnniversary.at, i18n.language),
        })
      : null,
    couple.lastDate
      ? t("ui.slurp.youTwo.lastDate", {
          what: couple.lastDate.detail,
          when: formatRelativeTime(couple.lastDate.at, i18n.language),
        })
      : null,
    couple.lastFight && (rocky || over)
      ? t("ui.slurp.youTwo.lastFight", { what: couple.lastFight.detail || t("ui.slurp.youTwo.aFight") })
      : null,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <section aria-labelledby="slurp-you-two" className="border-b border-[var(--noodle-divider)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="slurp-you-two" className="text-xs font-semibold text-[var(--slurp-muted)]">
            {t("ui.slurp.youTwo.title", { name })}
          </h2>
          <p className="mt-0.5 text-xl font-extrabold leading-[26px]">{stageWord}</p>
          {rocky && <p className="mt-0.5 text-xs text-[var(--slurp-warning)]">{t("ui.slurp.youTwo.rocky")}</p>}
        </div>
        {couple.secret && !over && (
          <span className="inline-flex min-h-6 shrink-0 items-center gap-1 rounded-full bg-[var(--slurp-surface)] px-2 text-[11px] font-bold">
            <EyeOff size={12} aria-hidden="true" />
            {t("ui.slurp.youTwo.secretBadge")}
          </span>
        )}
      </div>

      {/* Crush → dating → together. After a breakup the ladder stays, faded: it is what you had. */}
      <ol className={cn("mt-4 grid grid-cols-3 gap-1.5", over && "opacity-50")}>
        {LADDER.map((stage, index) => (
          <li key={stage} className="min-w-0">
            <span
              aria-hidden="true"
              className={cn(
                "block h-1.5 rounded-full",
                index <= reached
                  ? rocky && index === 2
                    ? "bg-[var(--slurp-warning)]"
                    : "bg-[var(--noodle-accent)]"
                  : "bg-[var(--slurp-outline)]",
              )}
            />
            <span
              className={cn(
                "mt-1 block truncate text-[11px]",
                index === reached && !over ? "font-bold text-[var(--slurp-text)]" : "text-[var(--slurp-muted)]",
              )}
              aria-current={index === reached && !over ? "step" : undefined}
            >
              {t(`ui.slurp.youTwo.stage.${stage}`)}
            </span>
          </li>
        ))}
      </ol>

      {facts.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-[var(--slurp-muted)]">
          {facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {moves
          .filter((move) => move.show)
          .map((move) => (
            <SlpButton
              key={move.steer}
              variant={move.quiet ? "tertiary" : "secondary"}
              disabled={preview.isPending || doIt.pending}
              onClick={() => void run(move.steer)}
              className="min-h-11 px-4 text-sm"
            >
              {move.icon}
              {t(`ui.slurp.youTwo.move.${move.steer}`)}
            </SlpButton>
          ))}
      </div>
    </section>
  );
}
