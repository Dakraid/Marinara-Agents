import { useId, useState, type ReactNode } from "react";
import { ChevronDown, Handshake, Heart, X, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_PAGE_SCROLL_CLASS, SLP_TOP_BAR_CLASS, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpSparkleGlyph, SlpStirGlyph } from "../../base/chrome/SlpGlyphs";
import { formatUpcomingDay } from "../../base/ui/slp-date-time";
import { SlpButton, SlpChip } from "../../modules/chrome/SlpButton";
import { SlpUsesAiMark } from "../../modules/chrome/SlpAiMark";
import { SlpErrorState, SlpSkeleton } from "../../modules/chrome/SlpStateKit";
import { SLP_CARD_STACK_CLASS } from "../../modules/post/SlpPostHelpers";
import {
  SLP_STIR_CATEGORIES,
  type SlpActionName,
  type SlpStirCategory,
} from "../../../../../shared/src/slp/slp-actions.js";
import type {
  SlpActionPreview,
  SlpStirLive,
  SlpStirSuggestion,
  SlpStirView,
} from "../../../../../shared/src/slp/slp-stir.js";
import { SlpCollabsPanel, SlpRelationshipsPanel } from "../projects/slp-projects-contract";
import { useSlurpStir, useSlurpStirPreview } from "./slp-stir-hooks";
import { SlpStirBox } from "./SlpStirBox";
import { SlpStirPlanSheet } from "./SlpStirCards";
import { SlpStirPlaySheet } from "./SlpStirPlaySheet";
import { SLP_STIR_DECK, SLP_STIR_DECK_ORDER, SLP_STIR_SOON_CARDS } from "./slp-stir-deck";

const HINT_KEY = "slurp2:stir-hint-seen";

/** First visit: one short card that says what this place is (dismissed for good). */
function StirHint() {
  const { t } = useTranslation();
  const [shown, setShown] = useState(() => {
    try {
      return !window.localStorage.getItem(HINT_KEY);
    } catch {
      return true;
    }
  });
  if (!shown) return null;
  const hide = () => {
    setShown(false);
    try {
      window.localStorage.setItem(HINT_KEY, "1");
    } catch {
      // Private mode: it shows again next time, which is fine.
    }
  };
  return (
    <section
      data-slp-stir-hint
      className="relative rounded-3xl bg-[image:var(--slurp-nav-active)] p-4 pe-12 ring-1 ring-inset ring-[var(--noodle-accent)]/35"
    >
      <p className={cn(SLP_TYPE.title, "flex items-center gap-2")}>
        <SlpStirGlyph size={16} aria-hidden="true" className="text-[var(--slurp-ink)]" />
        {t("ui.slurp.stir.hint.title")}
      </p>
      <p className={cn(SLP_TYPE.body, "mt-1 text-[var(--slurp-text)]")}>{t("ui.slurp.stir.hint.body")}</p>
      <button
        type="button"
        onClick={hide}
        aria-label={t("ui.slurp.stir.hint.dismiss")}
        className="absolute end-1.5 top-1.5 flex size-11 items-center justify-center rounded-full text-[var(--slurp-muted)] hover:text-[var(--slurp-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)]"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </section>
  );
}

function Faces({ who }: { who: { id: string; name: string; avatarUrl: string | null }[] }) {
  if (!who.length) return <SlpSparkleGlyph size={20} aria-hidden="true" className="shrink-0 text-[var(--slurp-ink)]" />;
  return (
    <span className="flex shrink-0 -space-x-2" aria-hidden="true">
      {who.slice(0, 2).map((person) => (
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

/** "In play": what is going on in the world right now, one small card each; "See all" opens Pulse. */
function InPlay({ live, onSeeAll }: { live: SlpStirLive[]; onSeeAll?: () => void }) {
  const { t, i18n } = useTranslation();
  const label = (entry: SlpStirLive) => {
    const [a, b] = entry.who;
    const who = b ? t("ui.slurp.stir.pair", { a: a!.name, b: b.name }) : (a?.name ?? entry.label ?? "");
    const state =
      entry.kind === "ideas"
        ? t("ui.slurp.stir.live.ideas", { count: Number(entry.label) || 0 })
        : t(`ui.slurp.stir.live.${entry.kind}.${entry.state}`);
    return { who, state };
  };
  return (
    <section aria-labelledby="slp-stir-live" className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 id="slp-stir-live" className={SLP_TYPE.title}>
          {t("ui.slurp.stir.inPlay")}
        </h2>
        {onSeeAll && (
          <SlpButton variant="tertiary" onClick={onSeeAll} className="min-h-9 text-xs">
            {t("ui.slurp.stir.seeAll")}
          </SlpButton>
        )}
      </div>
      {live.length === 0 ? (
        <p className={cn(SLP_TYPE.meta, "px-1 text-[var(--slurp-muted)]")}>{t("ui.slurp.stir.inPlayEmpty")}</p>
      ) : (
        <ul className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] @min-[680px]:mx-0 @min-[680px]:px-0">
          {live.map((entry) => {
            const { who, state } = label(entry);
            return (
              <li
                key={entry.id}
                className="flex w-56 shrink-0 items-center gap-2.5 rounded-2xl bg-[var(--slurp-surface-raised)] px-3 py-2.5 shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]"
              >
                <Faces who={entry.who} />
                <span className="min-w-0 flex-1">
                  <span className={cn(SLP_TYPE.body, "block truncate font-semibold")}>{who}</span>
                  <span className={cn(SLP_TYPE.meta, "block truncate text-[var(--slurp-muted)]")}>
                    {entry.until
                      ? t("ui.slurp.stir.live.until", { state, day: formatUpcomingDay(entry.until, i18n.language) })
                      : state}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Up to three plays that fit what is going on. A ready step previews at once; the rest opens its card. */
function Suggested({
  suggestions,
  onPlay,
  pending,
}: {
  suggestions: SlpStirSuggestion[];
  onPlay: (suggestion: SlpStirSuggestion) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  if (!suggestions.length) return null;
  return (
    <section aria-labelledby="slp-stir-suggested" className="space-y-2">
      <h2 id="slp-stir-suggested" className={cn(SLP_TYPE.title, "px-1")}>
        {t("ui.slurp.stir.suggested")}
      </h2>
      <ul className={SLP_CARD_STACK_CLASS}>
        {suggestions.map((suggestion) => {
          const [a, b] = suggestion.who;
          return (
            <li
              key={suggestion.id}
              className="flex items-center gap-3 rounded-2xl bg-[var(--slurp-surface-raised)] p-3 shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]"
            >
              <Faces who={suggestion.who} />
              <p className={cn(SLP_TYPE.body, "min-w-0 flex-1 [overflow-wrap:anywhere]")}>
                {t(`ui.slurp.stir.suggest.${suggestion.kind}`, {
                  a: a?.name ?? "",
                  b: b?.name ?? "",
                  name: a?.name ?? "",
                  label: suggestion.label ?? "",
                  count: Number(suggestion.label) || 0,
                })}
              </p>
              <SlpButton
                disabled={pending}
                onClick={() => onPlay(suggestion)}
                className="min-h-10 shrink-0 px-4 text-xs"
              >
                {t("ui.slurp.stir.play")}
              </SlpButton>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The deck: a card per lever, by category. A card shows its icon, a name and one line. */
function Deck({ onPick }: { onPick: (action: SlpActionName) => void }) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<SlpStirCategory>("love");
  const cards = SLP_STIR_DECK_ORDER.filter((action) => SLP_STIR_DECK[action].category === category);
  const soon = SLP_STIR_SOON_CARDS.filter((card) => card.category === category);
  return (
    <section aria-labelledby="slp-stir-deck" className="space-y-3">
      <h2 id="slp-stir-deck" className={cn(SLP_TYPE.title, "px-1")}>
        {t("ui.slurp.stir.deck")}
      </h2>
      <div
        className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] @min-[680px]:mx-0 @min-[680px]:px-0"
        role="tablist"
      >
        {SLP_STIR_CATEGORIES.map((entry) => (
          <SlpChip
            key={entry}
            role="tab"
            aria-selected={category === entry}
            selected={category === entry}
            onClick={() => setCategory(entry)}
            className="shrink-0"
          >
            {t(`ui.slurp.stir.category.${entry}`)}
          </SlpChip>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-2.5 @min-[680px]:grid-cols-3" data-slp-stir-deck={category}>
        {cards.map((action) => {
          const card = SLP_STIR_DECK[action];
          const Icon = card.icon;
          return (
            <li key={action}>
              <button
                type="button"
                onClick={() => onPick(action)}
                className="group flex h-full min-h-32 w-full flex-col items-start gap-2 rounded-2xl bg-[var(--slurp-surface-raised)] p-3.5 text-start shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)] transition-[transform,box-shadow] duration-[var(--slurp-motion-fast)] hover:shadow-[var(--slurp-shadow-floating),var(--slurp-highlight)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <span className="flex w-full items-start justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-[image:var(--slurp-nav-active)] text-[var(--slurp-ink)] ring-1 ring-inset ring-[var(--noodle-accent)]/30 [&_svg]:!text-current">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  {card.ai && <SlpUsesAiMark />}
                </span>
                <span className={cn(SLP_TYPE.body, "font-bold")}>{t(`ui.slurp.stir.card.${action}.title`)}</span>
                <span className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>
                  {t(`ui.slurp.stir.card.${action}.line`)}
                </span>
              </button>
            </li>
          );
        })}
        {soon.map((card) => {
          const Icon = card.icon;
          return (
            <li key={card.id}>
              <div
                aria-disabled="true"
                className="flex h-full min-h-32 flex-col items-start gap-2 rounded-2xl p-3.5 ring-1 ring-inset ring-dashed ring-[var(--noodle-divider)]"
              >
                <span className="flex w-full items-start justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-2xl text-[var(--slurp-muted)] ring-1 ring-inset ring-[var(--noodle-divider)] [&_svg]:!text-current">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--slurp-muted)]">
                    {t("ui.slurp.stir.soon")}
                  </span>
                </span>
                <span className={cn(SLP_TYPE.body, "font-bold text-[var(--slurp-muted)]")}>
                  {t(`ui.slurp.stir.soonCard.${card.id}.title`)}
                </span>
                <span className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>
                  {t(`ui.slurp.stir.soonCard.${card.id}.line`)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Business and Relationships (U), moved from Studio: every tie between Creators, with its own buttons. */
function Group({
  icon: Icon,
  title,
  detail,
  children,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <section className="rounded-2xl bg-[var(--slurp-surface-raised)] shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-start text-[var(--slurp-muted)] transition-colors hover:text-[var(--slurp-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--slurp-focus)] [&_svg]:!text-current"
      >
        <Icon size={18} aria-hidden="true" className="shrink-0" />
        <span className="min-w-0 flex-1">
          <span className={cn(SLP_TYPE.body, "block font-semibold text-[var(--slurp-text)]")}>{title}</span>
          <span className={cn(SLP_TYPE.meta, "block truncate")}>{detail}</span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn("shrink-0 transition-transform motion-reduce:transition-none", open && "rotate-180")}
        />
      </button>
      <div id={id} hidden={!open} className="border-t border-[var(--noodle-divider)] px-4 pb-4 pt-3">
        {open && children}
      </div>
    </section>
  );
}

/**
 * The Stir tab (W): make things happen in the world. The box turns words into a plan, "In play"
 * shows what is going on, suggestions offer a next move, the deck holds every lever as a card, and
 * the full Business and Relationships lists sit at the end. Every play shows a preview first; plays
 * are free, only a card marked AI calls the AI connection.
 */
export function SlpStirScreen({
  personaId,
  onOpenPulse,
  onOpenDashboard,
}: {
  personaId: string | null;
  onOpenPulse?: () => void;
  /** An owed #ad post is your own page's business: its suggestion opens the Dashboard. */
  onOpenDashboard?: () => void;
}) {
  const { t } = useTranslation();
  const query = useSlurpStir(personaId);
  const view: SlpStirView | undefined = query.data;
  const [playing, setPlaying] = useState<{ action: SlpActionName; who?: string[] } | null>(null);
  const [suggested, setSuggested] = useState<{ cards: SlpActionPreview[]; cant: string[]; key: number } | null>(null);
  const preview = useSlurpStirPreview();
  const names = (view?.creators ?? [])
    .filter((creator) => creator.automatic && !creator.couplePage)
    .map((creator) => creator.name);
  const playSuggestion = (suggestion: SlpStirSuggestion) => {
    if (suggestion.step)
      preview.mutate([suggestion.step], { onSuccess: (answer) => setSuggested({ ...answer, key: Date.now() }) });
    else if (suggestion.kind === "quiet")
      setPlaying({ action: "add-idea", who: suggestion.who.map((entry) => entry.id) });
    else if (suggestion.kind === "owedAd") onOpenDashboard?.();
  };
  return (
    <div className="flex h-full min-h-0 flex-col" data-slp-stir>
      <header className={cn("flex h-14 shrink-0 items-center gap-2 px-4", SLP_TOP_BAR_CLASS)}>
        <SlpStirGlyph size={22} aria-hidden="true" className="text-[var(--slurp-ink)]" />
        <h1 className="slp-display min-w-0 flex-1 truncate text-xl leading-none">{t("ui.slurp.stir.title")}</h1>
      </header>
      <main className={cn("min-h-0 flex-1 overflow-y-auto", SLP_PAGE_SCROLL_CLASS)}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-5">
          <StirHint />
          <SlpStirBox names={names} />
          {query.isPending ? (
            <SlpSkeleton shape="card" count={2} label={t("ui.slurp.state.loading")} />
          ) : query.isError && !view ? (
            <SlpErrorState title={t("ui.slurp.stir.loadError")} onRetry={() => void query.refetch()} />
          ) : view ? (
            <>
              <InPlay live={view.live} onSeeAll={onOpenPulse} />
              <Suggested suggestions={view.suggestions} onPlay={playSuggestion} pending={preview.isPending} />
              <Deck onPick={(action) => setPlaying({ action })} />
              {personaId && (
                <div className={SLP_CARD_STACK_CLASS}>
                  <Group icon={Handshake} title={t("ui.slurp.ties.title")} detail={t("ui.slurp.ties.detail")}>
                    <SlpCollabsPanel personaId={personaId} />
                  </Group>
                  <Group icon={Heart} title={t("ui.slurp.ties.life.title")} detail={t("ui.slurp.ties.life.detail")}>
                    <SlpRelationshipsPanel personaId={personaId} />
                  </Group>
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
      <SlpStirPlaySheet
        action={playing?.action ?? null}
        prefill={playing?.who ? { who: playing.who } : undefined}
        view={view}
        onClose={() => setPlaying(null)}
      />
      <SlpStirPlanSheet
        key={suggested?.key ?? 0}
        open={Boolean(suggested)}
        onClose={() => setSuggested(null)}
        cards={suggested?.cards ?? []}
        cant={suggested?.cant ?? []}
        origin="suggested"
      />
    </div>
  );
}
