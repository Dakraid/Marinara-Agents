import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BulkSession, SessionItem } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { cancelSession, cancelSessionItem, deleteSession, getSession, retrySessionItem } from "./api";
import { approveSessionItem, combineCollectedSession, duplicateAppliedSessionItems } from "./apply-ops";
import { EditRetryDialog } from "./EditRetryDialog";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import {
  deriveLiveStatus,
  isFailed,
  isReviewable,
  itemStatusLabelKey,
  itemStatusTone,
  summarizeItemChanges,
} from "./panel-status";
import { useVisiblePoll } from "./use-visible-poll";
import { VerdictQueue } from "./VerdictQueue";

/** SPEC §5 edge: sessions with 200+ cards paginate at 50 items per page. */
const PAGE_SIZE = 50;

function ItemSummary({
  item,
  t,
}: {
  item: SessionItem;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  if (isFailed(item) && item.failure) return <span className="ce-item-failure">{item.failure.message}</span>;
  if (item.resultCardId) {
    return (
      <span className="ce-item-result">{t("cardEditor.panel.detail.copyCreated", { id: item.resultCardId })}</span>
    );
  }
  if (item.status === "applied" && (item.updates ?? []).length === 0) {
    return <span className="ce-item-result">{t("cardEditor.panel.detail.noChanges")}</span>;
  }
  const summary = summarizeItemChanges(item);
  if (!summary) return null;
  return (
    <span className="ce-item-result">
      {t("cardEditor.panel.detail.summary", {
        fields: summary.fields,
        added: summary.added,
        removed: summary.removed,
      })}
    </span>
  );
}

export function SessionDetail({
  localization,
  sessionId,
  onBack,
  onDeleted,
}: {
  localization?: CardEditorLocalizationContext;
  sessionId: string;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [session, setSession] = useState<BulkSession | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCombine, setConfirmCombine] = useState(false);
  const [autoApplyErrors, setAutoApplyErrors] = useState<Readonly<Record<string, string>>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [queueFocus, setQueueFocus] = useState<string | null | "closed">("closed");
  const [editRetryId, setEditRetryId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const autoApplyAttempts = useRef(new Set<string>());

  const refresh = useCallback(() => {
    getSession(sessionId)
      .then((fresh) => {
        setSession(fresh);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, [sessionId]);
  const pollRef = useVisiblePoll(refresh, 2000);

  // Auto-approve driver (DESIGN §3): auto-save items land in awaiting-review with autoApply —
  // the panel drives their verdict flow once per item; holds fall back to needs-review triage.
  useEffect(() => {
    if (!session) return;
    const candidates = session.items.filter(
      (item) =>
        item.status === "awaiting-review" && item.autoApply === true && !autoApplyAttempts.current.has(item.itemId),
    );
    if (candidates.length === 0) return;
    for (const item of candidates) autoApplyAttempts.current.add(item.itemId);
    void (async () => {
      for (const item of candidates) {
        const outcome = await approveSessionItem(session, item, { force: false });
        if (outcome.kind === "failed" || outcome.kind === "report-failed") {
          setAutoApplyErrors((current) => ({ ...current, [item.itemId]: outcome.message }));
        }
      }
      refresh();
    })();
  }, [session, refresh]);

  const runAction = async (key: string, work: () => Promise<BulkSession | void>) => {
    if (busyKey) return;
    setBusyKey(key);
    setActionError(null);
    try {
      const updated = await work();
      if (updated) setSession(updated);
      else refresh();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusyKey(null);
    }
  };

  const rerunAllFailed = () =>
    void runAction("rerun-all", async () => {
      const failed = (session?.items ?? []).filter(isFailed);
      for (const item of failed) {
        await retrySessionItem(sessionId, item.itemId);
      }
    });

  const removeSession = () =>
    void runAction("delete", async () => {
      await deleteSession(sessionId, { force: session?.status === "active" });
      onDeleted();
    });

  const combineCollected = () =>
    void runAction("combine", async () => {
      if (!session) return;
      const collected = session.items.filter((item) => item.status === "applied");
      const partial = collected.length < session.items.length;
      const outcome = await combineCollectedSession(session, ...(partial ? [{ confirmPartial: true }] : []));
      if (outcome.kind === "failed") throw new Error(outcome.message);
      setConfirmCombine(false);
      return outcome.session;
    });

  const duplicateApplied = (eligibleCount: number) =>
    void runAction("duplicate-applied", async () => {
      if (!session) return;
      const outcome = await duplicateAppliedSessionItems(session);
      if (outcome.failedCount > 0) {
        setActionError(
          t("cardEditor.panel.detail.duplicateAppliedPartial", {
            failed: outcome.failedCount,
            total: eligibleCount,
          }),
        );
      }
      return outcome.session;
    });

  if (loadError && !session) {
    return (
      <section className="ce-shell ce-panel" ref={pollRef}>
        <button type="button" className="mari-chrome-control ce-back-button" onClick={onBack}>
          <ChevronLeft className="ce-icon" aria-hidden="true" />
          {t("cardEditor.panel.back")}
        </button>
        <div className="ce-status ce-status--error" role="alert">
          {t("cardEditor.panel.detail.loadError")}
        </div>
      </section>
    );
  }
  if (!session) {
    return (
      <section className="ce-shell ce-panel" ref={pollRef}>
        <div className="ce-status" role="status">
          {t("cardEditor.panel.detail.loading")}
        </div>
      </section>
    );
  }

  if (queueFocus !== "closed") {
    return (
      <section className="ce-shell ce-panel" ref={pollRef}>
        <VerdictQueue
          localization={localization}
          session={session}
          focusItemId={queueFocus}
          onRefresh={refresh}
          onClose={() => setQueueFocus("closed")}
        />
      </section>
    );
  }

  const editRetryItem = editRetryId ? (session.items.find((item) => item.itemId === editRetryId) ?? null) : null;
  const reviewableCount = session.items.filter(isReviewable).length;
  const failedCount = session.items.filter(isFailed).length;
  const combinedMode = session.config.saveMode === "combined";
  const collectedCount = combinedMode ? session.items.filter((item) => item.status === "applied").length : 0;
  const combineAvailable = combinedMode && !session.combinedCardId && collectedCount > 0;
  const combinePartial = combineAvailable && collectedCount < session.items.length;
  // Duplicate-applied housekeeping action: applied items edited the original in place, so only
  // those without a result card (and with edits worth cloning) are eligible. Combined mode's
  // output is the combined card, so the action is hidden there.
  const duplicateAppliedCount = combinedMode
    ? 0
    : session.items.filter(
        (item) => item.status === "applied" && item.resultCardId === undefined && (item.updates ?? []).length > 0,
      ).length;
  const live = deriveLiveStatus(session);
  const pageCount = Math.max(1, Math.ceil(session.items.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const pageItems = session.items.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <section className="ce-shell ce-panel" ref={pollRef} data-card-editor-view="session-detail">
      <div className="ce-panel-head">
        <button type="button" className="mari-chrome-control ce-back-button" onClick={onBack}>
          <ChevronLeft className="ce-icon" aria-hidden="true" />
          {t("cardEditor.panel.back")}
        </button>
        <strong className="ce-panel-heading">{session.label}</strong>
        <span
          className={`ce-chip ce-chip--${session.status === "active" ? "live" : session.status === "completed" ? "ok" : "muted"}`}
        >
          {t(`cardEditor.panel.sessionStatus.${session.status}`)}
        </span>
      </div>
      {session.combinedCardId ? (
        <div className="ce-notice" role="status">
          <span>{t("cardEditor.panel.detail.combinedCreated", { id: session.combinedCardId })}</span>
        </div>
      ) : null}
      {session.status === "interrupted" ? (
        <div className="ce-notice" role="status">
          <span>{t("cardEditor.panel.interruptedNotice")}</span>
        </div>
      ) : null}
      {session.status === "active" ? (
        <p className="ce-caption" role="status">
          {live.kind === "batch"
            ? t("cardEditor.panel.live.batch", { index: live.batchIndex, count: live.batchCount }) +
              (live.batchAttempts > 1 ? t("cardEditor.panel.live.batchRetry", { attempt: live.batchAttempts }) : "")
            : live.kind === "items"
              ? t("cardEditor.panel.live.items", { running: live.runningItems, total: session.stats.total })
              : live.kind === "queued"
                ? t("cardEditor.panel.live.queued", { count: live.queuedItems })
                : t("cardEditor.panel.progress", { done: session.stats.done, total: session.stats.total })}
        </p>
      ) : null}
      {actionError ? (
        <div className="ce-status ce-status--error" role="alert">
          {t("cardEditor.panel.detail.actionError", { message: actionError })}
        </div>
      ) : null}
      <div className="ce-panel-actions">
        {combineAvailable ? (
          combinePartial && !confirmCombine ? (
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--small"
              disabled={busyKey !== null}
              onClick={() => setConfirmCombine(true)}
            >
              {t("cardEditor.panel.detail.combine", { count: collectedCount })}
            </button>
          ) : combinePartial && confirmCombine ? (
            <span className="ce-confirm-strip" role="group" aria-label={t("cardEditor.panel.detail.combine")}>
              <span className="ce-caption">
                {t("cardEditor.panel.detail.combinePartialConfirm", {
                  count: collectedCount,
                  total: session.items.length,
                })}
              </span>
              <button
                type="button"
                className="mari-chrome-control mari-chrome-control--small"
                disabled={busyKey !== null}
                onClick={combineCollected}
              >
                {t("cardEditor.panel.detail.combineYes", { count: collectedCount })}
              </button>
              <button
                type="button"
                className="mari-chrome-control mari-chrome-control--small"
                disabled={busyKey !== null}
                onClick={() => setConfirmCombine(false)}
              >
                {t("cardEditor.panel.detail.combineNo")}
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
              disabled={busyKey !== null}
              onClick={combineCollected}
            >
              {t("cardEditor.panel.detail.combine", { count: collectedCount })}
            </button>
          )
        ) : null}
        {duplicateAppliedCount > 0 ? (
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busyKey !== null}
            onClick={() => duplicateApplied(duplicateAppliedCount)}
          >
            {t("cardEditor.panel.detail.duplicateApplied", { count: duplicateAppliedCount })}
          </button>
        ) : null}
        {reviewableCount > 0 ? (
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
            onClick={() => setQueueFocus(null)}
          >
            {t("cardEditor.panel.detail.reviewQueue", { count: reviewableCount })}
          </button>
        ) : null}
        {session.status === "active" ? (
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busyKey !== null}
            onClick={() => void runAction("cancel-all", () => cancelSession(sessionId))}
          >
            {t("cardEditor.panel.detail.cancelAll")}
          </button>
        ) : null}
        {failedCount > 0 ? (
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busyKey !== null}
            onClick={rerunAllFailed}
          >
            {t("cardEditor.panel.detail.rerunFailed", { count: failedCount })}
          </button>
        ) : null}
        {confirmDelete ? (
          <span className="ce-confirm-strip" role="group" aria-label={t("cardEditor.panel.delete")}>
            <span className="ce-caption">
              {session.status === "active"
                ? t("cardEditor.panel.deleteConfirmActive")
                : t("cardEditor.panel.deleteConfirm")}
            </span>
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--small ce-danger-button"
              disabled={busyKey !== null}
              onClick={removeSession}
            >
              {session.status === "active" ? t("cardEditor.panel.deleteYesActive") : t("cardEditor.panel.deleteYes")}
            </button>
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--small"
              disabled={busyKey !== null}
              onClick={() => setConfirmDelete(false)}
            >
              {t("cardEditor.panel.deleteNo")}
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busyKey !== null}
            onClick={() => setConfirmDelete(true)}
          >
            {t("cardEditor.panel.detail.delete")}
          </button>
        )}
      </div>
      <ul className="ce-items">
        {pageItems.map((item) => {
          const canReview = isReviewable(item);
          const canRerun = isFailed(item);
          const canEditRetry = isFailed(item) && item.failure?.renderedPrompt !== undefined;
          const canCancel = item.status === "queued" && session.status === "active";
          return (
            <li className="ce-item" key={item.itemId}>
              <div className="ce-item-main">
                {/* No engine deep link to a character editor exists for packages — name only. */}
                <span className="ce-item-name">{item.characterName}</span>
                <span className={`ce-chip ce-chip--${itemStatusTone(item.status)}`}>
                  {t(itemStatusLabelKey(item.status))}
                </span>
              </div>
              <div className="ce-item-sub">
                <ItemSummary item={item} t={t} />
                {autoApplyErrors[item.itemId] ? (
                  <span className="ce-item-failure">
                    {t("cardEditor.panel.detail.autoApplyError", {
                      name: item.characterName,
                      message: autoApplyErrors[item.itemId]!,
                    })}
                  </span>
                ) : null}
              </div>
              {canReview || canRerun || canEditRetry || canCancel ? (
                <div className="ce-item-actions">
                  {canReview ? (
                    <button
                      type="button"
                      className="mari-chrome-control mari-chrome-control--small"
                      onClick={() => setQueueFocus(item.itemId)}
                    >
                      {t("cardEditor.panel.action.review")}
                    </button>
                  ) : null}
                  {canRerun ? (
                    <button
                      type="button"
                      className="mari-chrome-control mari-chrome-control--small"
                      disabled={busyKey !== null}
                      onClick={() =>
                        void runAction(`rerun-${item.itemId}`, () => retrySessionItem(sessionId, item.itemId))
                      }
                    >
                      {t("cardEditor.panel.action.rerun")}
                    </button>
                  ) : null}
                  {canEditRetry ? (
                    <button
                      type="button"
                      className="mari-chrome-control mari-chrome-control--small"
                      disabled={busyKey !== null}
                      onClick={() => setEditRetryId(item.itemId)}
                    >
                      {t("cardEditor.panel.action.editRetry")}
                    </button>
                  ) : null}
                  {canCancel ? (
                    <button
                      type="button"
                      className="mari-chrome-control mari-chrome-control--small"
                      disabled={busyKey !== null}
                      onClick={() =>
                        void runAction(`cancel-${item.itemId}`, () => cancelSessionItem(sessionId, item.itemId))
                      }
                    >
                      {t("cardEditor.panel.action.cancelItem")}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {pageCount > 1 ? (
        <div className="ce-pager">
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={clampedPage <= 0}
            aria-label={t("cardEditor.panel.detail.pagePrev")}
            onClick={() => setPage(clampedPage - 1)}
          >
            <ChevronLeft className="ce-icon" aria-hidden="true" />
          </button>
          <span className="ce-caption">
            {t("cardEditor.panel.detail.page", { page: clampedPage + 1, pages: pageCount })}
          </span>
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={clampedPage >= pageCount - 1}
            aria-label={t("cardEditor.panel.detail.pageNext")}
            onClick={() => setPage(clampedPage + 1)}
          >
            <ChevronRight className="ce-icon" aria-hidden="true" />
          </button>
        </div>
      ) : null}
      {editRetryItem ? (
        <EditRetryDialog
          localization={localization}
          session={session}
          item={editRetryItem}
          onClose={() => setEditRetryId(null)}
          onRetried={(updated) => {
            setSession(updated);
            setEditRetryId(null);
          }}
        />
      ) : null}
    </section>
  );
}
