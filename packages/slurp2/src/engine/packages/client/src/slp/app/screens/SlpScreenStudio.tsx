import { useId, useState, type ReactNode } from "react";
import { BookOpen, ChevronDown, Handshake, Heart, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslation as useUiTranslation } from "react-i18next";
import type { SlurpStudioCreator } from "../../features/economy/slp-economy-contract";
import { useSetSlurpGoal, useSlurpStudio } from "../../features/economy/slp-economy-hooks";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_EYEBROW_CLASS, SLP_GROUP_CLASS, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpSparkleGlyph } from "../../base/chrome/SlpGlyphs";
import { SlpEmptyState, SlpErrorState, SlpSkeleton } from "../../modules/chrome/SlpStateKit";
import { SlpButton, SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { formatSlpNumber } from "../../base/ui/slp-number-format";
import { SlpCreatorFrame } from "./SlpHomeHelpers";
import { formatRelativeTime, formatTime } from "../../base/ui/slp-date-time";
import { BroadcastPanel } from "../../features/messages/SlpMessages";
import { SlurpProjectsPanel } from "../../features/projects/SlpProjectsBoard";
import { SlpBrandOffers, SlpCollabsPanel, SlpRelationshipsPanel } from "../../features/projects/SlpCollabsPanel";
import { SLP_CARD_STACK_CLASS } from "../../modules/post/SlpPostHelpers";
import { SlpCoinText } from "../../modules/coin/SlpCoin";
import { errorMessage } from "./SlpHomeHelpers";
import { SlpCollectCard } from "./SlpCollectCard";

function SlurpStudioView({
  personaId,
  onBack,
  onOpenProfile,
}: {
  personaId: string | null;
  onBack: () => void;
  onOpenProfile: (accountId: string) => void;
}) {
  const { t: localizeUi, i18n } = useUiTranslation();
  const studioQuery = useSlurpStudio(personaId, true, true);
  // Diegetic by default, optimisation behind a door.
  //
  // A Creator would check her earnings, her followers, and who keeps showing up — those are in
  // character. A milestone progress bar and a per-post reach breakdown are a game HUD, and
  // leaving them on screen invites playing the meta instead of the character. They stay one tap
  // away for when that is what you want.
  const [showPerformance, setShowPerformance] = useState(false);
  const creators = studioQuery.data?.creators ?? [];
  const since = studioQuery.data?.since ?? null;

  return (
    <SlpCreatorFrame onBack={onBack} title={localizeUi("ui.slurp.navigation.studio")} action={<span />}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-5">
        {creators.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>
              {since
                ? localizeUi("ui.slurp.studio.since", {
                    defaultValue: "Changes since {{date}}",
                    date: formatTime(since, i18n.language),
                  })
                : localizeUi("ui.slurp.studio.firstVisit", { defaultValue: "Trends start from your next visit" })}
            </p>
            <SlpButton
              variant="tertiary"
              onClick={() => setShowPerformance((open) => !open)}
              aria-expanded={showPerformance}
              className="min-h-9 text-xs"
            >
              {showPerformance
                ? localizeUi("ui.slurp.studio.hidePerformance", { defaultValue: "Hide performance" })
                : localizeUi("ui.slurp.studio.showPerformance", { defaultValue: "Show performance" })}
            </SlpButton>
          </div>
        )}

        {studioQuery.isPending ? (
          <SlpSkeleton
            shape="card"
            count={3}
            label={localizeUi("ui.slurp.studio.loading", { defaultValue: "Loading…" })}
          />
        ) : studioQuery.isError && !studioQuery.data ? (
          <SlpErrorState
            title={localizeUi("ui.slurp.studio.loadError", { defaultValue: "Could not load your Studio" })}
            onRetry={() => void studioQuery.refetch()}
          />
        ) : creators.length === 0 ? (
          <SlpEmptyState
            title={localizeUi("ui.slurp.studio.emptyTitle", { defaultValue: "No Creators yet" })}
            detail={localizeUi("ui.slurp.studio.emptyDetail", {
              defaultValue: "Make this persona a Creator to see how its posts are doing.",
            })}
          />
        ) : (
          creators.map((creator) => (
            <section
              key={creator.id}
              aria-labelledby={`slurp-studio-${creator.id}`}
              className="flex flex-col gap-4"
              data-slurp-studio-creator
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenProfile(creator.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1 py-1 text-start transition-colors hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)]"
                >
                  <Avatar account={{ displayName: creator.displayName, avatarUrl: creator.avatarUrl }} size="md" />
                  <span className="min-w-0">
                    <span id={`slurp-studio-${creator.id}`} className={cn(SLP_TYPE.title, "block truncate")}>
                      {creator.displayName}
                    </span>
                    <span className={cn(SLP_TYPE.meta, "block truncate text-[var(--slurp-muted)]")}>
                      @{creator.handle}
                    </span>
                  </span>
                </button>
                {personaId && (
                  <BroadcastPanel
                    creatorAccountId={creator.id}
                    personaId={personaId}
                    subscriberCount={creator.subscribers}
                    creator={{ displayName: creator.displayName, avatarUrl: creator.avatarUrl }}
                  />
                )}
              </div>

              {/* Money first: the same Creator earnings card as the Wallet, with Collect. */}
              {personaId && <SlpCollectCard creator={creator} personaId={personaId} burst />}
              {personaId && <SlpBrandOffers personaId={personaId} creatorId={creator.id} />}

              {/* Fans next: value first, a sentence-case label that wraps instead of overflowing
                  (B18), and a small trend under the value. */}
              <div className="grid grid-cols-3 gap-2">
                <SlpStudioStat
                  value={creator.subscribers}
                  label={localizeUi("ui.slurp.studio.subscribers", { defaultValue: "Subscribers" })}
                  trend={creator.subscribersDelta}
                />
                <SlpStudioStat
                  value={creator.followersDelta}
                  signed
                  label={localizeUi("ui.slurp.studio.newFans", { defaultValue: "New fans" })}
                  detail={localizeUi("ui.slurp.studio.followersTotal", {
                    defaultValue: "{{formatted}} followers",
                    count: creator.followers,
                    formatted: formatSlpNumber(creator.followers, i18n.language),
                  })}
                />
                <SlpStudioStat
                  value={creator.likes?.thisWeek ?? null}
                  label={localizeUi("ui.slurp.studio.likesThisWeek", { defaultValue: "Likes this week" })}
                  trend={creator.likes ? creator.likes.thisWeek - creator.likes.lastWeek : null}
                  trendLabel={localizeUi("ui.slurp.studio.vsLastWeek", { defaultValue: "vs last week" })}
                />
              </div>

              {creator.milestonesCrossed.length > 0 && (
                <p className={cn(SLP_TYPE.meta, "flex items-center gap-2 px-1 text-[var(--slurp-ink)]")}>
                  <SlpSparkleGlyph size={14} aria-hidden="true" />
                  {localizeUi("ui.slurp.studio.crossed", {
                    defaultValue: "Passed {{targets}} followers since your last visit.",
                    targets: creator.milestonesCrossed.map((value) => value.toLocaleString()).join(", "),
                  })}
                </p>
              )}

              {showPerformance && creator.milestone.next !== null && (
                <div className="px-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={cn(SLP_TYPE.body, "font-semibold")}>
                      {localizeUi("ui.slurp.studio.nextMilestone", {
                        defaultValue: "Next milestone: {{target}} followers",
                        target: creator.milestone.next.toLocaleString(),
                      })}
                    </p>
                    <p className={cn(SLP_TYPE.meta, "tabular-nums text-[var(--slurp-muted)]")}>
                      {localizeUi("ui.slurp.studio.remaining", {
                        defaultValue: "{{count}} to go",
                        count: creator.milestone.remaining.toLocaleString(),
                      })}
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--accent)]">
                    <div
                      className="h-full rounded-full bg-[var(--noodle-accent)] transition-[width] motion-reduce:transition-none"
                      style={{ width: `${Math.round(creator.milestone.progress * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <SlurpGoalEditor creator={creator} personaId={personaId} />

              {creator.topFans.length > 0 && (
                <div className="space-y-2">
                  <h3 className={cn(SLP_EYEBROW_CLASS, "px-1")}>
                    {localizeUi("ui.slurp.studio.topFans", { defaultValue: "Who is showing up" })}
                  </h3>
                  <ul className={SLP_GROUP_CLASS}>
                    {creator.topFans.map((fan) => (
                      <li key={fan.id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
                        <span className="min-w-0">
                          <span className={cn(SLP_TYPE.body, "block truncate font-semibold")}>
                            {fan.displayName}
                            {fan.handle && (
                              <span className="ms-1 font-normal text-[var(--slurp-muted)]">@{fan.handle}</span>
                            )}
                          </span>
                          {/* A name with no history is still wallpaper, so say what they have done. */}
                          <span className={cn(SLP_TYPE.meta, "block truncate text-[var(--slurp-muted)]")}>
                            <SlpCoinText>
                              {[
                                localizeUi(`ui.slurp.studio.stage.${fan.stage}`, { defaultValue: fan.stage }),
                                // Steady is the default and says nothing worth a line.
                                fan.audienceArc && fan.audienceArc !== "steady"
                                  ? localizeUi(`ui.slurp.studio.audienceArc.${fan.audienceArc}`)
                                  : null,
                                fan.spent > 0
                                  ? localizeUi("ui.slurp.studio.fanSpent", {
                                      defaultValue: "{{count}} <coin/>",
                                      count: fan.spent,
                                    })
                                  : null,
                                ...fan.traits,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </SlpCoinText>
                          </span>
                        </span>
                        <time
                          dateTime={fan.firstSeenAt}
                          title={formatTime(fan.firstSeenAt, i18n.language)}
                          className={cn(SLP_TYPE.meta, "shrink-0 tabular-nums text-[var(--slurp-muted)]")}
                        >
                          {formatRelativeTime(fan.firstSeenAt, i18n.language)}
                        </time>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {creator.posts.length > 0 && (
                <div className="space-y-2">
                  <h3 className={cn(SLP_EYEBROW_CLASS, "px-1")}>
                    {localizeUi("ui.slurp.studio.recentPosts", { defaultValue: "Recent posts" })}
                  </h3>
                  <ul className={SLP_GROUP_CLASS}>
                    {creator.posts.map((post) => (
                      <li key={post.id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
                        <span className="min-w-0">
                          <span className={cn(SLP_TYPE.body, "block truncate font-semibold")}>
                            {post.title || localizeUi("ui.slurp.studio.untitled", { defaultValue: "Untitled post" })}
                          </span>
                          <span className={cn(SLP_TYPE.meta, "block truncate text-[var(--slurp-muted)]")}>
                            {[
                              formatRelativeTime(post.createdAt, i18n.language),
                              post.locked ? localizeUi("ui.slurp.studio.locked", { defaultValue: "locked" }) : null,
                              post.hasImage ? localizeUi("ui.slurp.studio.withImage", { defaultValue: "image" }) : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                        <span className="shrink-0 text-end">
                          <span className={cn(SLP_TYPE.meta, "block font-semibold tabular-nums")}>
                            {localizeUi("ui.slurp.studio.likes", {
                              defaultValue: "{{count}} likes",
                              count: post.likeCount.toLocaleString(),
                            })}
                          </span>
                          <span className={cn(SLP_TYPE.meta, "block tabular-nums text-[var(--slurp-muted)]")}>
                            {[
                              localizeUi("ui.slurp.studio.comments", {
                                defaultValue: "{{count}} comments",
                                count: post.replyCount.toLocaleString(),
                              }),
                              // Reach and unlocks are the performance view's numbers.
                              showPerformance
                                ? localizeUi("ui.slurp.studio.reached", {
                                    defaultValue: "{{count}} reached",
                                    count: post.reach.toLocaleString(),
                                  })
                                : null,
                              showPerformance && post.unlockCount !== null
                                ? localizeUi("ui.slurp.studio.unlocks", {
                                    defaultValue: "{{count}} unlocks",
                                    count: post.unlockCount.toLocaleString(),
                                  })
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* The storyline is operator configuration: closed until asked for, after the fans. */}
              {personaId && (
                <SlpStudioStorylineGroup>
                  <SlurpProjectsPanel
                    personaId={personaId}
                    creatorAccountId={creator.id}
                    otherCreators={creators.filter((other) => other.id !== creator.id)}
                  />
                </SlpStudioStorylineGroup>
              )}
            </section>
          ))
        )}

        {/* Between all Creators, not one (U: collab = work, couple = life): Business (collabs, brand
            deals, rivalries, 7b-c) and Relationships (couples, crushes, exes, 7b-couples). */}
        {personaId && studioQuery.data && (
          <div className={SLP_CARD_STACK_CLASS}>
            <SlpStudioGroup
              icon={Handshake}
              title={localizeUi("ui.slurp.ties.title")}
              detail={localizeUi("ui.slurp.ties.detail")}
            >
              <SlpCollabsPanel personaId={personaId} />
            </SlpStudioGroup>
            <SlpStudioGroup
              icon={Heart}
              title={localizeUi("ui.slurp.ties.life.title")}
              detail={localizeUi("ui.slurp.ties.life.detail")}
            >
              <SlpRelationshipsPanel personaId={personaId} />
            </SlpStudioGroup>
          </div>
        )}
      </div>
    </SlpCreatorFrame>
  );
}

/** A Studio stat tile: the number first and large, a sentence-case label, then a small trend. */
function SlpStudioStat({
  value,
  label,
  trend = null,
  trendLabel,
  detail,
  signed = false,
}: {
  value: number | null;
  label: string;
  trend?: number | null;
  trendLabel?: string;
  detail?: string;
  /** The value is itself a change ("+42 new fans"). */
  signed?: boolean;
}) {
  const { i18n } = useUiTranslation();
  const format = (count: number, withSign: boolean) =>
    `${withSign && count > 0 ? "+" : ""}${formatSlpNumber(count, i18n.language)}`;
  return (
    <div className="flex min-w-0 flex-col rounded-2xl bg-[var(--slurp-surface-raised)] p-3 shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]">
      <span className="text-[22px] font-extrabold leading-7 tabular-nums">
        {value === null ? "–" : format(value, signed)}
      </span>
      <span className={cn(SLP_TYPE.meta, "mt-0.5 text-[var(--slurp-muted)] [overflow-wrap:anywhere]")}>{label}</span>
      {trend !== null && trend !== 0 ? (
        <span
          className={cn(
            SLP_TYPE.caption,
            "mt-1.5 inline-flex w-fit items-center gap-0.5 rounded-full px-1.5 py-0.5 tabular-nums",
            trend > 0
              ? "bg-[color-mix(in_srgb,var(--slurp-success)_14%,transparent)] text-[var(--slurp-success)]"
              : "bg-[var(--accent)] text-[var(--slurp-muted)]",
          )}
          title={trendLabel}
        >
          {trend > 0 ? (
            <TrendingUp size={12} aria-hidden="true" className="!text-current" />
          ) : (
            <TrendingDown size={12} aria-hidden="true" className="!text-current" />
          )}
          {format(trend, true)}
          {trendLabel && <span className="sr-only"> {trendLabel}</span>}
        </span>
      ) : detail ? (
        <span className={cn(SLP_TYPE.caption, "mt-1.5 truncate font-medium text-[var(--slurp-muted)]")}>{detail}</span>
      ) : null}
    </div>
  );
}

/** Operator settings in one collapsed group: a Creator's storyline, or collabs between Creators. */
function SlpStudioGroup({
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

/** The storyline settings, in one collapsed group at the end of a Creator's Studio. */
function SlpStudioStorylineGroup({ children }: { children: ReactNode }) {
  const { t: localizeUi } = useUiTranslation();
  return (
    <SlpStudioGroup
      icon={BookOpen}
      title={localizeUi("ui.slurp.studio.storyline", { defaultValue: "Storyline" })}
      detail={localizeUi("ui.slurp.studio.storylineDetail", {
        defaultValue: "What the posts are about, and where they go",
      })}
    >
      {children}
    </SlpStudioGroup>
  );
}

/**
 * The tip goal on the Creator home: show progress, or open one.
 *
 * A milestone is a target the player aims at privately. A tip goal is one the Creator shows the
 * audience, which is the only thing that gives anyone a reason to tip rather than just watch.
 * Progress is measured from the lifetime earnings recorded when the goal opened, so a payout
 * never drags the bar backwards.
 */
function SlurpGoalEditor({ creator, personaId }: { creator: SlurpStudioCreator; personaId: string | null }) {
  const { t: localizeUi } = useUiTranslation();
  const setGoal = useSetSlurpGoal();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(creator.goal?.label ?? "");
  const [target, setTarget] = useState(creator.goal?.target ?? 500);

  const submit = (nextLabel: string | null) => {
    if (!personaId) return;
    setGoal.mutate(
      { creatorAccountId: creator.id, personaId, label: nextLabel, target },
      {
        onSuccess: () => setEditing(false),
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  };

  if (!editing) {
    return creator.goal ? (
      <div className="rounded-2xl bg-[var(--slurp-surface-raised)] p-4 shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0">
            <span className={cn(SLP_TYPE.meta, "block text-[var(--slurp-muted)]")}>
              {localizeUi("ui.slurp.studio.tipGoal", { defaultValue: "Tip goal" })}
            </span>
            <span className={cn(SLP_TYPE.body, "block truncate font-semibold")}>{creator.goal.label}</span>
          </p>
          <SlpButton variant="tertiary" onClick={() => setEditing(true)} className="min-h-9 shrink-0 text-xs">
            {localizeUi("ui.slurp.studio.goalEdit", { defaultValue: "Edit" })}
          </SlpButton>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--accent)]">
          <div
            className="h-full rounded-full bg-[var(--noodle-accent)] transition-[width] motion-reduce:transition-none"
            style={{ width: `${Math.round(creator.goal.progress * 100)}%` }}
          />
        </div>
        <p className={cn(SLP_TYPE.meta, "mt-1.5 tabular-nums text-[var(--slurp-muted)]")}>
          {creator.goal.met ? (
            localizeUi("ui.slurp.studio.goalMet", { defaultValue: "Goal met." })
          ) : (
            <SlpCoinText>
              {localizeUi("ui.slurp.studio.goalProgress", {
                defaultValue: "{{raised}} of {{target}} <coin/>",
                raised: creator.goal.raised.toLocaleString(),
                target: creator.goal.target.toLocaleString(),
              })}
            </SlpCoinText>
          )}
        </p>
      </div>
    ) : (
      <SlpButton variant="secondary" onClick={() => setEditing(true)} className="self-start">
        {localizeUi("ui.slurp.studio.goalAdd", { defaultValue: "Set a tip goal" })}
      </SlpButton>
    );
  }

  const fieldClass =
    "h-11 rounded-xl bg-[var(--slurp-canvas,var(--background))] px-3 text-base outline-none ring-1 ring-inset ring-[var(--noodle-divider)] focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] sm:text-sm";
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[var(--slurp-surface-raised)] p-4 shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]">
      <label className="flex flex-col gap-1" htmlFor={`slurp-goal-label-${creator.id}`}>
        <span className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>
          {localizeUi("ui.slurp.studio.goalLabel", { defaultValue: "Goal" })}
        </span>
        <input
          id={`slurp-goal-label-${creator.id}`}
          value={label}
          maxLength={80}
          onChange={(event) => setLabel(event.target.value)}
          placeholder={localizeUi("ui.slurp.studio.goalPlaceholder", { defaultValue: "New set on Friday…" })}
          className={cn(fieldClass, "w-full")}
        />
      </label>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1" htmlFor={`slurp-goal-target-${creator.id}`}>
          <span className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>
            {localizeUi("ui.slurp.studio.goalTarget", { defaultValue: "Target" })}
          </span>
          <input
            id={`slurp-goal-target-${creator.id}`}
            type="number"
            inputMode="numeric"
            min={1}
            max={1_000_000}
            value={target}
            onChange={(event) => setTarget(Math.max(1, Math.floor(Number(event.target.value) || 0)))}
            className={cn(fieldClass, "w-28 tabular-nums")}
          />
        </label>
        <div className="ms-auto flex gap-2">
          {creator.goal && (
            <SlpButton variant="tertiary" disabled={setGoal.isPending} onClick={() => submit(null)}>
              {localizeUi("ui.slurp.studio.goalClear", { defaultValue: "Clear" })}
            </SlpButton>
          )}
          <SlpButton variant="tertiary" disabled={setGoal.isPending} onClick={() => setEditing(false)}>
            {localizeUi("chat.delete.dialog.cancel")}
          </SlpButton>
          <SlpPrimaryButton disabled={setGoal.isPending || !label.trim()} onClick={() => submit(label.trim())}>
            {localizeUi("ui.slurp.studio.goalSave", { defaultValue: "Save goal" })}
          </SlpPrimaryButton>
        </div>
      </div>
    </div>
  );
}

export { SlurpStudioView, SlurpGoalEditor };
