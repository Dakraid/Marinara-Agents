import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { BulkSession, SessionItem } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import type { ApplyOperation } from "./api";
import { approveSessionItem, rejectSessionItem } from "./apply-ops";
import { buildHunks, countWordChanges, countWords, diffLines, type DiffHunk } from "./diff";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import { isQueueItem, isReviewable, itemStatusLabelKey, itemStatusTone } from "./panel-status";

const HUNK_CONTEXT = 3;
/** DESIGN §3: a field preview shows about this many diff lines before the expander takes over. */
const PREVIEW_LINE_CAP = 8;

interface FieldPreview {
  field: string;
  newText: string;
  added: number;
  removed: number;
  wordCount: number;
  hunks: DiffHunk[];
}

function buildFieldPreviews(item: SessionItem): FieldPreview[] {
  return (item.updates ?? []).map((update) => {
    const oldText = item.snapshots[update.field] ?? update.oldText;
    const { added, removed } = countWordChanges(oldText, update.newText);
    const hunks = buildHunks(diffLines(oldText, update.newText), HUNK_CONTEXT);
    return {
      field: update.field,
      newText: update.newText,
      added,
      removed,
      wordCount: countWords(update.newText),
      hunks,
    };
  });
}

function FieldSection({
  preview,
  expanded,
  showAll,
  onToggle,
  onShowAll,
  t,
}: {
  preview: FieldPreview;
  expanded: boolean;
  showAll: boolean;
  onToggle: () => void;
  onShowAll: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  if (!expanded) {
    // Collapsed mini-row for additional fields (DESIGN §3: "▸ personality — +18/−4 words").
    return (
      <button type="button" className="ce-queue-minirow" onClick={onToggle}>
        <span className="ce-queue-minirow-caret" aria-hidden="true">
          ▸
        </span>
        <span className="ce-queue-minirow-field">{preview.field}</span>
        <span className="ce-queue-minirow-words">
          {t("cardEditor.queue.miniRowWords", { added: preview.added, removed: preview.removed })}
        </span>
      </button>
    );
  }
  let budget = showAll ? Number.POSITIVE_INFINITY : PREVIEW_LINE_CAP;
  let truncated = false;
  const visibleHunks: { lines: DiffHunk["lines"]; hidden: number }[] = [];
  for (const hunk of preview.hunks) {
    if (budget <= 0) {
      truncated = true;
      break;
    }
    let hidden = 0;
    if (hunk.hiddenBefore > 0) {
      hidden = hunk.hiddenBefore;
      budget -= 1;
    }
    const lines = hunk.lines.slice(0, Math.max(0, budget));
    if (lines.length < hunk.lines.length) truncated = true;
    budget -= lines.length;
    visibleHunks.push({ lines, hidden });
  }
  return (
    <section className="ce-queue-field">
      <header className="ce-queue-field-head">
        <strong className="ce-queue-field-name">{preview.field}</strong>
        <span className="ce-chip ce-chip--ok">{t("cardEditor.queue.chips.added", { count: preview.added })}</span>
        <span className="ce-chip ce-chip--danger">
          {t("cardEditor.queue.chips.removed", { count: preview.removed })}
        </span>
        <span className="ce-chip">{t("cardEditor.queue.chips.fieldWords", { count: preview.wordCount })}</span>
      </header>
      <div className="ce-diff" role="group" aria-label={preview.field}>
        {visibleHunks.map(({ lines, hidden }, hunkIndex) => (
          <div className="ce-diff-hunk" key={hunkIndex}>
            {hidden > 0 ? (
              <div className="ce-diff-line ce-diff-line--marker">
                {t("cardEditor.queue.hiddenLines", { count: hidden })}
              </div>
            ) : null}
            {lines.map((line, lineIndex) => (
              <div className={`ce-diff-line ce-diff-line--${line.kind}`} key={lineIndex}>
                <span className="ce-diff-sign" aria-hidden="true">
                  {line.kind === "add" ? "+" : line.kind === "del" ? "−" : " "}
                </span>
                <span className="ce-diff-text">{line.text}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {truncated ? (
        <button type="button" className="ce-queue-expander" onClick={onShowAll}>
          {t("cardEditor.queue.field.expand")}
        </button>
      ) : null}
      {showAll ? <pre className="ce-queue-fullfield">{preview.newText}</pre> : null}
    </section>
  );
}

export function VerdictQueue({
  localization,
  session,
  focusItemId,
  onRefresh,
  onClose,
}: {
  localization?: CardEditorLocalizationContext;
  session: BulkSession;
  focusItemId: string | null;
  onRefresh: () => void;
  onClose: () => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const queueItems = useMemo(() => session.items.filter(isQueueItem), [session.items]);
  const [currentId, setCurrentId] = useState<string | null>(focusItemId);
  const [busy, setBusy] = useState(false);
  const [holds, setHolds] = useState<ApplyOperation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyFailure, setApplyFailure] = useState<string | null>(null);
  // null = untouched for this card (the first field renders expanded); polls must not collapse
  // the reviewer's expansions, so only a card change resets the sets.
  const [expandedFields, setExpandedFields] = useState<ReadonlySet<string> | null>(null);
  const [fullFields, setFullFields] = useState<ReadonlySet<string>>(new Set());

  const currentIndex = queueItems.findIndex((item) => item.itemId === currentId);
  const current = currentIndex >= 0 ? queueItems[currentIndex]! : null;
  const previews = useMemo(() => (current ? buildFieldPreviews(current) : []), [current]);

  // Clamp navigation when the queue membership shifts (polls, verdicts): prefer the next
  // undecided item, then any remaining card; the empty state renders when nothing is left.
  useEffect(() => {
    if (current) return;
    const next = queueItems.find(isReviewable) ?? queueItems[0] ?? null;
    setCurrentId(next?.itemId ?? null);
  }, [current, queueItems]);

  // Reset per-card view state only when a different card lands on the review slot. Focus the
  // card region so keyboard and screen-reader users keep their place in the triage flow.
  const cardRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setHolds(null);
    setError(null);
    setApplyFailure(null);
    setExpandedFields(null);
    setFullFields(new Set());
    cardRef.current?.focus({ preventScroll: true });
  }, [currentId]);

  const isFieldExpanded = (field: string, index: number) =>
    expandedFields === null ? index === 0 : expandedFields.has(field);
  const toggleField = (field: string) =>
    setExpandedFields((current2) => {
      const next = new Set(current2 ?? new Set(previews[0] ? [previews[0].field] : []));
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });

  const reviewable = current !== null && isReviewable(current);

  const goTo = (index: number) => {
    const target = queueItems[index];
    if (target) setCurrentId(target.itemId);
  };

  const advance = (decidedId: string) => {
    const rest = queueItems.filter((item) => item.itemId !== decidedId);
    const next = rest.find(isReviewable) ?? null;
    setCurrentId(next?.itemId ?? decidedId);
  };

  const runApprove = async (force: boolean) => {
    if (!current || busy || !reviewable) return;
    setBusy(true);
    setError(null);
    setApplyFailure(null);
    const outcome = await approveSessionItem(session, current, { force });
    setBusy(false);
    if (outcome.kind === "needs-confirmation") {
      setHolds(outcome.holds);
      onRefresh();
      return;
    }
    if (outcome.kind === "applied") {
      const decidedId = current.itemId;
      onRefresh();
      advance(decidedId);
      return;
    }
    if (outcome.kind === "apply-failed") {
      setApplyFailure(outcome.message);
      onRefresh();
      return;
    }
    setError(outcome.message);
  };

  const runReject = async () => {
    if (!current || busy || !reviewable) return;
    setBusy(true);
    setError(null);
    setApplyFailure(null);
    const outcome = await rejectSessionItem(session, current);
    setBusy(false);
    if (outcome.kind === "rejected") {
      const decidedId = current.itemId;
      onRefresh();
      advance(decidedId);
      return;
    }
    setError(outcome.message);
  };

  const approveAllRemaining = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const pending = queueItems.filter(isReviewable);
    for (const item of pending) {
      // Holds land in needs-review and stay for manual triage (DESIGN §3: skipped = undecided).
      await approveSessionItem(session, item, { force: false });
    }
    setBusy(false);
    onRefresh();
    setCurrentId((id) => (queueItems.some((item) => item.itemId === id && isReviewable(item)) ? id : null));
  };

  // Keyboard triage (DESIGN §3): R reject, A approve, ←/→ navigate — never while typing.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (busy) return;
      if (event.key === "ArrowLeft") {
        if (currentIndex > 0) {
          event.preventDefault();
          goTo(currentIndex - 1);
        }
        return;
      }
      if (event.key === "ArrowRight") {
        if (currentIndex >= 0 && currentIndex < queueItems.length - 1) {
          event.preventDefault();
          goTo(currentIndex + 1);
        }
        return;
      }
      if (!reviewable || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        void runReject();
      } else if (event.key === "a" || event.key === "A") {
        event.preventDefault();
        void runApprove(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  const summary = previews.reduce(
    (totals, preview) => ({
      added: totals.added + preview.added,
      removed: totals.removed + preview.removed,
    }),
    { added: 0, removed: 0 },
  );
  const undecidedCount = queueItems.filter(isReviewable).length;

  return (
    <div className="ce-queue">
      <div className="ce-queue-head">
        <button type="button" className="mari-chrome-control ce-back-button" onClick={onClose}>
          <ChevronLeft className="ce-icon" aria-hidden="true" />
          {t("cardEditor.queue.close")}
        </button>
        <strong className="ce-panel-heading">{t("cardEditor.queue.title")}</strong>
        <span className="ce-caption">
          {queueItems.length === 0
            ? ""
            : t("cardEditor.queue.position", { index: currentIndex + 1, count: queueItems.length })}
        </span>
      </div>
      {queueItems.length > 0 ? (
        <div className="ce-queue-dots" role="group" aria-label={t("cardEditor.queue.dotsLabel")}>
          {queueItems.map((item, index) => {
            const verdict =
              item.status === "applied" || item.status === "duplicated"
                ? "approved"
                : item.status === "rejected"
                  ? "rejected"
                  : "pending";
            return (
              <button
                key={item.itemId}
                type="button"
                className={`ce-dot ce-dot--${verdict}${index === currentIndex ? " ce-dot--current" : ""}`}
                aria-label={t("cardEditor.queue.dotLabel", {
                  name: item.characterName,
                  status: t(itemStatusLabelKey(item.status)),
                })}
                aria-current={index === currentIndex}
                onClick={() => goTo(index)}
              />
            );
          })}
        </div>
      ) : null}
      {!current ? (
        <div className="ce-status" role="status">
          {t("cardEditor.queue.empty")}
        </div>
      ) : (
        <article className="ce-queue-card" ref={cardRef} tabIndex={-1} aria-label={current.characterName}>
          <header className="ce-queue-card-head">
            <h3 className="ce-queue-name">{current.characterName}</h3>
            <span className={`ce-chip ce-chip--${itemStatusTone(current.status)}`}>
              {t(itemStatusLabelKey(current.status))}
            </span>
          </header>
          <div className="ce-queue-chips">
            <span className="ce-chip">{t("cardEditor.queue.chips.fields", { count: previews.length })}</span>
            <span className="ce-chip ce-chip--ok">{t("cardEditor.queue.chips.added", { count: summary.added })}</span>
            <span className="ce-chip ce-chip--danger">
              {t("cardEditor.queue.chips.removed", { count: summary.removed })}
            </span>
          </div>
          {session.config.saveMode === "duplicate" ? (
            <p className="ce-caption">{t("cardEditor.queue.duplicateNote")}</p>
          ) : null}
          <div className="ce-queue-fields">
            {previews.map((preview, index) => (
              <FieldSection
                key={preview.field}
                preview={preview}
                expanded={isFieldExpanded(preview.field, index)}
                showAll={fullFields.has(preview.field)}
                onToggle={() => toggleField(preview.field)}
                onShowAll={() => setFullFields((current2) => new Set([...current2, preview.field]))}
                t={t}
              />
            ))}
          </div>
          {holds ? (
            <div className="ce-queue-stale" role="alert">
              <p>{t("cardEditor.queue.staleTitle", { count: holds.length })}</p>
              <div className="ce-queue-stale-actions">
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
                  disabled={busy}
                  onClick={() => void runApprove(true)}
                >
                  {t("cardEditor.queue.staleApply")}
                </button>
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--small"
                  disabled={busy}
                  onClick={() => setHolds(null)}
                >
                  {t("cardEditor.queue.staleSkip")}
                </button>
              </div>
            </div>
          ) : null}
          {applyFailure ? (
            <div className="ce-status ce-status--error" role="alert">
              {t("cardEditor.queue.applyFailed", { message: applyFailure })}
            </div>
          ) : null}
          {error ? (
            <div className="ce-status ce-status--error" role="alert">
              {t("cardEditor.queue.verdictError", { message: error })}
            </div>
          ) : null}
          <footer className="ce-queue-foot">
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--small"
              disabled={currentIndex <= 0}
              aria-label={t("cardEditor.queue.prev")}
              onClick={() => goTo(currentIndex - 1)}
            >
              <ChevronLeft className="ce-icon" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="mari-chrome-control ce-queue-reject"
              disabled={busy || !reviewable}
              onClick={() => void runReject()}
            >
              <X className="ce-icon" aria-hidden="true" />
              {t("cardEditor.queue.reject")}
              <kbd className="ce-key-hint">{t("cardEditor.queue.rejectHint")}</kbd>
            </button>
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--primary ce-queue-approve"
              disabled={busy || !reviewable}
              onClick={() => void runApprove(false)}
            >
              <Check className="ce-icon" aria-hidden="true" />
              {busy ? t("cardEditor.queue.working") : t("cardEditor.queue.approve")}
              <kbd className="ce-key-hint">{t("cardEditor.queue.approveHint")}</kbd>
            </button>
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--small"
              disabled={currentIndex < 0 || currentIndex >= queueItems.length - 1}
              aria-label={t("cardEditor.queue.next")}
              onClick={() => goTo(currentIndex + 1)}
            >
              <ChevronRight className="ce-icon" aria-hidden="true" />
            </button>
          </footer>
        </article>
      )}
      {undecidedCount > 0 ? (
        <button
          type="button"
          className="ce-queue-approve-all"
          disabled={busy}
          onClick={() => void approveAllRemaining()}
        >
          {busy ? t("cardEditor.queue.approveAllWorking") : t("cardEditor.queue.approveAll")}
        </button>
      ) : null}
    </div>
  );
}
