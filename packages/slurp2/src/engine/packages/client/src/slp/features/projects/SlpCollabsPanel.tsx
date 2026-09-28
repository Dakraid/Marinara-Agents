import { useState, type ReactNode } from "react";
import { Ban, Handshake, HeartHandshake, Zap } from "lucide-react";
import { SlpSparkleGlyph } from "../../base/chrome/SlpGlyphs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { Avatar, SLP_EYEBROW_CLASS, SLP_GROUP_CLASS, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpButton, SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { SlpCoinText } from "../../modules/coin/SlpCoin";
import { formatRelativeTime } from "../../base/ui/slp-date-time";
import { errorMessage } from "../../modules/settings/slp-backstage-format";
import {
  useSlurpTies,
  useSlurpTiesMutations,
  type SlurpTiesCollab,
  type SlurpTiesCreator,
  type SlurpTiesDeal,
  type SlurpTiesRivalry,
} from "./slp-ties-hooks";
import { SlpCouplesSection } from "./SlpCouples";

const rowClass = "flex flex-col gap-2 py-3";
// Inside Studio's group surface: rows and hairlines, no second box.
const listClass = "divide-y divide-[var(--noodle-divider)]";

/** Two overlapping avatars: who is in it. */
function Pair({ a, b }: { a?: SlurpTiesCreator; b?: SlurpTiesCreator }) {
  return (
    <span className="flex shrink-0 -space-x-2" aria-hidden="true">
      {[a, b].map((creator, index) =>
        creator ? (
          <Avatar
            key={creator.id}
            account={{ displayName: creator.name, avatarUrl: creator.avatarUrl }}
            size="sm"
            className={cn("ring-2 ring-[var(--slurp-surface-raised)]", index === 1 && "relative")}
          />
        ) : null,
      )}
    </span>
  );
}

function Row({
  a,
  b,
  title,
  detail,
}: {
  a?: SlurpTiesCreator;
  b?: SlurpTiesCreator;
  title: string;
  detail?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Pair a={a} b={b} />
      <span className="min-w-0 flex-1">
        <span className={cn(SLP_TYPE.body, "block font-semibold [overflow-wrap:anywhere]")}>{title}</span>
        {detail && (
          <span className={cn(SLP_TYPE.meta, "block text-[var(--slurp-muted)] [overflow-wrap:anywhere]")}>
            {detail}
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * Who works with whom, and who does not get along: collab requests between Creators (push one
 * through, block a pair, suggest a pairing), couples (set two up, steer their story, their shared
 * page), rivalries (cool one down) and brand deals. Studio,
 * after the Creators. Everything here happens in-world on its own; this is where the player steers.
 */
export function SlpCollabsPanel({ personaId }: { personaId: string }) {
  const { t, i18n } = useTranslation();
  const query = useSlurpTies(personaId);
  const actions = useSlurpTiesMutations(personaId);
  const [picked, setPicked] = useState<string[]>([]);
  const view = query.data;
  if (query.isError)
    return <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>{t("ui.slurp.ties.loadFailed")}</p>;
  if (!view) return <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>{t("ui.slurp.settings.loading")}</p>;

  const byId = new Map(view.creators.map((creator) => [creator.id, creator]));
  const name = (id: string) => byId.get(id)?.name ?? t("ui.slurp.ties.someone");
  const onError = (error: unknown) => toast.error(errorMessage(error));
  const busy = Object.values(actions).some((mutation) => mutation.isPending);
  const when = (at: string | null) => (at ? formatRelativeTime(at, i18n.language) : "");
  const openCollabs = view.collabs.filter((collab) => ["asked", "agreed", "planned"].includes(collab.status));
  const pastCollabs = view.collabs.filter((collab) => !openCollabs.includes(collab));
  const empty = !view.collabs.length && !view.rivalries.length && !view.deals.length && !view.couples.length;

  const collabTitle = (collab: SlurpTiesCollab) =>
    collab.status === "asked"
      ? t("ui.slurp.ties.collab.asked", { host: name(collab.hostId), partner: name(collab.partnerId) })
      : t("ui.slurp.ties.collab.together", { host: name(collab.hostId), partner: name(collab.partnerId) });
  const collabStatus = (collab: SlurpTiesCollab) => {
    const split =
      collab.hostShare === 50
        ? t("ui.slurp.ties.collab.splitEven")
        : t("ui.slurp.ties.collab.split", {
            host: name(collab.hostId),
            hostShare: collab.hostShare,
            partnerShare: 100 - collab.hostShare,
          });
    if (collab.status === "asked")
      return byId.get(collab.partnerId)?.own
        ? t("ui.slurp.ties.collab.waitingForYou")
        : t("ui.slurp.ties.collab.waiting", { partner: name(collab.partnerId) });
    if (collab.status === "agreed")
      return `${t("ui.slurp.ties.collab.agreed", { host: name(collab.hostId) })} · ${split}`;
    if (collab.status === "planned") return `${t("ui.slurp.ties.collab.planned")} · ${split}`;
    if (collab.status === "posted") return `${t("ui.slurp.ties.collab.posted")} · ${split}`;
    if (collab.status === "blocked") return t("ui.slurp.ties.collab.blocked");
    return t(`ui.slurp.ties.decline.${collab.decline ?? "offBrand"}`, { partner: name(collab.partnerId) });
  };
  const rivalryLine = (rivalry: SlurpTiesRivalry) =>
    rivalry.stage === "over"
      ? t(`ui.slurp.ties.rivalry.ended.${rivalry.ending ?? "fizzled"}`, {
          a: name(rivalry.fromId),
          b: name(rivalry.toId),
        })
      : t(`ui.slurp.ties.rivalry.${rivalry.stage}`, { a: name(rivalry.fromId), b: name(rivalry.toId) });
  const dealLine = (deal: SlurpTiesDeal) => {
    const who = name(deal.creatorId);
    if (deal.status === "offered")
      return t(byId.get(deal.creatorId)?.own ? "ui.slurp.ties.deal.offeredYou" : "ui.slurp.ties.deal.offered", {
        brand: deal.brand,
        name: who,
      });
    if (deal.status === "declined")
      return t(`ui.slurp.ties.deal.declined.${deal.decline ?? "offBrand"}`, { brand: deal.brand, name: who });
    const done = deal.postId ? "ui.slurp.ties.deal.done" : "ui.slurp.ties.deal.took";
    return t(deal.status === "done" ? done : "ui.slurp.ties.deal.accepted", {
      brand: deal.brand,
      name: who,
      count: deal.fee,
    });
  };

  // A couple's shared page is not a Creator to pair with.
  const suggestable = view.creators.filter((creator) => !creator.couplePage);
  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id].slice(-2),
    );
  const suggest = () =>
    picked.length === 2 &&
    actions.suggest.mutate(
      { aId: picked[0]!, bId: picked[1]! },
      {
        onSuccess: () => {
          setPicked([]);
          toast.success(t("ui.slurp.ties.suggested"));
        },
        onError,
      },
    );
  const setUp = () =>
    picked.length === 2 &&
    actions.setUp.mutate(
      { aId: picked[0]!, bId: picked[1]! },
      {
        onSuccess: () => {
          setPicked([]);
          toast.success(t("ui.slurp.ties.setUpDone"));
        },
        onError,
      },
    );

  return (
    <div data-slurp-ties className="flex flex-col gap-5">
      {empty && <p className={cn(SLP_TYPE.body, "text-[var(--slurp-muted)]")}>{t("ui.slurp.ties.empty")}</p>}

      {openCollabs.length > 0 && (
        <section className="space-y-2" aria-label={t("ui.slurp.ties.requests")}>
          <h4 className={cn(SLP_EYEBROW_CLASS, "px-1")}>{t("ui.slurp.ties.requests")}</h4>
          <ul className={listClass}>
            {openCollabs.map((collab) => {
              const toMe = collab.status === "asked" && byId.get(collab.partnerId)?.own;
              return (
                <li key={collab.id} className={rowClass} data-slurp-tie-collab={collab.status}>
                  <Row
                    a={byId.get(collab.hostId)}
                    b={byId.get(collab.partnerId)}
                    title={collabTitle(collab)}
                    detail={collab.idea ? `“${collab.idea}”` : undefined}
                  />
                  <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>{collabStatus(collab)}</p>
                  <div className="flex flex-wrap gap-2">
                    {collab.status === "asked" &&
                      (toMe ? (
                        <>
                          <SlpPrimaryButton
                            disabled={busy}
                            onClick={() => actions.push.mutate(collab.id, { onError })}
                            className="min-h-11 px-4 text-sm"
                          >
                            <Handshake size={16} aria-hidden="true" />
                            {t("ui.slurp.ties.accept")}
                          </SlpPrimaryButton>
                          <SlpButton
                            variant="quiet"
                            disabled={busy}
                            onClick={() => actions.decline.mutate(collab.id, { onError })}
                            className="min-h-11 px-4 text-sm"
                          >
                            {t("ui.slurp.ties.decline")}
                          </SlpButton>
                        </>
                      ) : (
                        <SlpButton
                          variant="secondary"
                          disabled={busy}
                          onClick={() => actions.push.mutate(collab.id, { onError })}
                          className="min-h-11 px-4 text-sm"
                        >
                          <Handshake size={16} aria-hidden="true" />
                          {t("ui.slurp.ties.push")}
                        </SlpButton>
                      ))}
                    <SlpButton
                      variant="tertiary"
                      disabled={busy}
                      onClick={() => actions.block.mutate(collab.id, { onError })}
                      aria-label={t("ui.slurp.ties.blockLabel", { a: name(collab.hostId), b: name(collab.partnerId) })}
                      className="min-h-11 text-sm"
                    >
                      <Ban size={15} aria-hidden="true" />
                      {t("ui.slurp.ties.block")}
                    </SlpButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="space-y-2" aria-label={t("ui.slurp.ties.suggestTitle")}>
        <h4 className={cn(SLP_EYEBROW_CLASS, "px-1")}>{t("ui.slurp.ties.suggestTitle")}</h4>
        <div className="space-y-3">
          <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>{t("ui.slurp.ties.suggestDetail")}</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("ui.slurp.ties.suggestTitle")}>
            {suggestable.map((creator) => {
              const on = picked.includes(creator.id);
              return (
                <button
                  key={creator.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(creator.id)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-full py-1 pe-3.5 ps-1 text-sm font-semibold ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] motion-reduce:transition-none",
                    on
                      ? "bg-[image:var(--slurp-nav-active)] text-[var(--slurp-text)] ring-[var(--noodle-accent)]/45"
                      : "bg-[var(--slurp-canvas)] text-[var(--slurp-muted)] ring-[var(--slurp-outline)] hover:text-[var(--slurp-text)]",
                  )}
                >
                  <Avatar account={{ displayName: creator.name, avatarUrl: creator.avatarUrl }} size="xs" />
                  <span className="max-w-[9rem] truncate">{creator.name}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SlpPrimaryButton
              disabled={picked.length !== 2 || busy}
              onClick={suggest}
              className="min-h-11 w-full px-4 text-sm sm:w-auto"
            >
              <SlpSparkleGlyph size={16} aria-hidden="true" />
              {picked.length === 2 ? t("ui.slurp.ties.suggestPair") : t("ui.slurp.ties.suggestPick")}
            </SlpPrimaryButton>
            {/* The same two can also be set up as a couple (7b-couples). */}
            {picked.length === 2 && (
              <SlpButton
                variant="secondary"
                disabled={busy}
                onClick={setUp}
                className="min-h-11 w-full px-4 text-sm sm:w-auto"
              >
                <HeartHandshake size={16} aria-hidden="true" />
                {t("ui.slurp.ties.setUp")}
              </SlpButton>
            )}
          </div>
        </div>
      </section>

      <SlpCouplesSection personaId={personaId} couples={view.couples} byId={byId} Row={Row} />

      {view.rivalries.length > 0 && (
        <section className="space-y-2" aria-label={t("ui.slurp.ties.rivalries")}>
          <h4 className={cn(SLP_EYEBROW_CLASS, "px-1")}>{t("ui.slurp.ties.rivalries")}</h4>
          <ul className={listClass}>
            {view.rivalries.map((rivalry) => (
              <li key={rivalry.id} className={rowClass} data-slurp-tie-rivalry={rivalry.stage}>
                <Row
                  a={byId.get(rivalry.fromId)}
                  b={byId.get(rivalry.toId)}
                  title={rivalryLine(rivalry)}
                  detail={
                    rivalry.stage === "over"
                      ? when(rivalry.stageAt)
                      : t("ui.slurp.ties.rivalry.cause", {
                          b: name(rivalry.toId),
                          // The cause is told to the one who started it ("…after you did").
                          cause: rivalry.cause
                            .replace(/\byours?\b/gu, `${name(rivalry.fromId)}'s`)
                            .replace(/\byou\b/gu, name(rivalry.fromId)),
                        })
                  }
                />
                {(rivalry.stage === "shade" || rivalry.stage === "feud") && (
                  <SlpButton
                    variant="secondary"
                    disabled={busy}
                    onClick={() => actions.cool.mutate(rivalry.id, { onError })}
                    className="min-h-11 self-start px-4 text-sm"
                  >
                    <Zap size={15} aria-hidden="true" />
                    {t("ui.slurp.ties.cool")}
                  </SlpButton>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(pastCollabs.length > 0 || view.deals.length > 0) && (
        <section className="space-y-2" aria-label={t("ui.slurp.ties.lately")}>
          <h4 className={cn(SLP_EYEBROW_CLASS, "px-1")}>{t("ui.slurp.ties.lately")}</h4>
          <ul className={listClass}>
            {view.deals.map((deal) => (
              <li key={deal.id} className={rowClass} data-slurp-tie-deal={deal.status}>
                <Row
                  a={byId.get(deal.creatorId)}
                  title={deal.brand}
                  detail={
                    <SlpCoinText>{`${dealLine(deal)}${deal.status === "done" || deal.status === "declined" ? ` · ${when(deal.answeredAt)}` : ""}`}</SlpCoinText>
                  }
                />
              </li>
            ))}
            {pastCollabs.map((collab) => (
              <li key={collab.id} className={rowClass} data-slurp-tie-collab={collab.status}>
                <Row
                  a={byId.get(collab.hostId)}
                  b={byId.get(collab.partnerId)}
                  title={t("ui.slurp.ties.collab.together", {
                    host: name(collab.hostId),
                    partner: name(collab.partnerId),
                  })}
                  detail={`${collabStatus(collab)} · ${when(collab.answeredAt ?? collab.askedAt)}`}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {view.blocked.length > 0 && (
        <section className="space-y-2" aria-label={t("ui.slurp.ties.blockedTitle")}>
          <h4 className={cn(SLP_EYEBROW_CLASS, "px-1")}>{t("ui.slurp.ties.blockedTitle")}</h4>
          <ul className={listClass}>
            {view.blocked.map((pair) => {
              const [a, b] = pair.split("|");
              return (
                <li key={pair} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1">
                    <Row
                      a={byId.get(a ?? "")}
                      b={byId.get(b ?? "")}
                      title={t("ui.slurp.ties.blockedPair", { a: name(a ?? ""), b: name(b ?? "") })}
                    />
                  </span>
                  <SlpButton
                    variant="tertiary"
                    disabled={busy}
                    onClick={() => actions.unblock.mutate(pair, { onError })}
                    className="min-h-11 shrink-0 text-sm"
                  >
                    {t("ui.slurp.ties.unblock")}
                  </SlpButton>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * Brand offers to a page the player runs, in that Creator's Studio right after the money: yes pays
 * the fee into their earnings now, no ends it.
 */
export function SlpBrandOffers({ personaId, creatorId }: { personaId: string; creatorId: string }) {
  const { t } = useTranslation();
  const { data } = useSlurpTies(personaId);
  const { answerDeal } = useSlurpTiesMutations(personaId);
  const offers = (data?.deals ?? []).filter((deal) => deal.creatorId === creatorId && deal.status === "offered");
  if (!offers.length) return null;
  const answer = (deal: SlurpTiesDeal, accept: boolean) =>
    answerDeal.mutate(
      { id: deal.id, accept },
      {
        onSuccess: () => accept && toast.success(t("ui.slurp.ties.deal.paid", { brand: deal.brand, count: deal.fee })),
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  return (
    <section className="space-y-2" aria-label={t("ui.slurp.ties.offers")} data-slurp-brand-offers>
      <h3 className={cn(SLP_EYEBROW_CLASS, "px-1")}>{t("ui.slurp.ties.offers")}</h3>
      <ul className={SLP_GROUP_CLASS}>
        {offers.map((deal) => (
          <li key={deal.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className={cn(SLP_TYPE.body, "min-w-0 font-semibold [overflow-wrap:anywhere]")}>
                {t("ui.slurp.ties.offerTitle", { brand: deal.brand, product: deal.product })}
              </span>
              <span className={cn(SLP_TYPE.body, "shrink-0 font-bold tabular-nums")}>
                <SlpCoinText>{t("ui.slurp.ties.fee", { count: deal.fee })}</SlpCoinText>
              </span>
            </div>
            {deal.copy && <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>“{deal.copy}”</p>}
            <div className="flex gap-2">
              <SlpPrimaryButton
                disabled={answerDeal.isPending}
                onClick={() => answer(deal, true)}
                className="min-h-11 flex-1 px-4 text-sm"
              >
                {t("ui.slurp.ties.offerYes")}
              </SlpPrimaryButton>
              <SlpButton
                variant="quiet"
                disabled={answerDeal.isPending}
                onClick={() => answer(deal, false)}
                className="min-h-11 flex-1 px-4 text-sm"
              >
                {t("ui.slurp.ties.offerNo")}
              </SlpButton>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
