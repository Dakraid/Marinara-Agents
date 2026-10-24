import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { BulkSession, SessionItem } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import {
  cancelSession,
  cancelSessionItem,
  deleteSession,
  getHostCharacter,
  getSession,
  rerunSession,
  retrySessionItem,
  startSessionPhase2,
} from "./api";
import {
  approveSessionItem,
  rejectSessionItem,
  combineCollectedSession,
  duplicateAppliedSessionItems,
  executeCompletionEnforcement,
} from "./apply-ops";
import { AvatarStudio } from "./AvatarStudio";
import { EditRetryDialog } from "./EditRetryDialog";
import { FixJsonDialog } from "./FixJsonDialog";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import type { BulkRerun, BulkTargetDraft } from "./session-config";
import {
  deriveLiveStatus,
  inspectorTabs,
  isFailed,
  isReviewable,
  ITEM_GROUPS,
  itemGroup,
  runStage,
  isSplitChild,
  itemStatusLabelKey,
  itemStatusTone,
  summarizeItemChanges,
  transformCounts,
  type InspectorTab,
  type ItemGroup,
  type RunStage,
} from "./panel-status";
import { SplitReviewDialog } from "./SplitReviewDialog";
import { useVisiblePoll } from "./use-visible-poll";
import { VerdictQueue } from "./VerdictQueue";

function ItemSummary({
  item,
  t,
}: {
  item: SessionItem;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  if (isFailed(item) && item.failure) return <span className="ce-item-failure">{item.failure.message}</span>;
  if (item.status === "awaiting-split") {
    return (
      <span className="ce-item-result">
        {t("cardEditor.panel.detail.splitProposed", { count: item.characters?.length ?? 0 })}
      </span>
    );
  }
  if (item.status === "split") {
    return (
      <span className="ce-item-result">
        {t("cardEditor.panel.detail.splitInto", { count: item.characters?.length ?? 0 })}
      </span>
    );
  }
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
      {t("cardEditor.panel.detail.summary", { fields: summary.fields, added: summary.added, removed: summary.removed })}
    </span>
  );
}

export function SessionDetail({
  localization,
  sessionId,
  onBack,
  onDeleted,
  onRerun,
  onRerunSelected,
  onStage,
}: {
  localization?: CardEditorLocalizationContext;
  sessionId: string;
  onBack: () => void;
  onDeleted: () => void;
  onRerun?: (sessionId: string) => void;
  /** Opens Setup with the chosen cards and this run's settings; the run itself stays unchanged. */
  onRerunSelected?: (rerun: BulkRerun) => void;
  /** Tells the workspace header which stage the run is in and what it is called. */
  onStage?: (stage: RunStage, label: string) => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [session, setSession] = useState<BulkSession | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCombine, setConfirmCombine] = useState(false);
  const [autoApplyErrors, setAutoApplyErrors] = useState<Readonly<Record<string, string>>>({});
  const [enforcementProgress, setEnforcementProgress] = useState<{ done: number; total: number } | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  /** The item the inspector shows; null until the list picks one. */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<InspectorTab | null>(null);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [filter, setFilter] = useState<ItemGroup | "all">("all");
  const [query, setQuery] = useState("");
  /** Phones show the list or the inspector, never both. */
  const [mobilePane, setMobilePane] = useState<"list" | "inspector">("list");
  const fixJsonShown = useRef(new Set<string>());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [phaseView, setPhaseView] = useState<1 | 2 | null>(null);
  const autoApplyAttempts = useRef(new Set<string>());
  const enforcementInFlight = useRef(false);

  const refresh = useCallback(() => {
    getSession(sessionId)
      .then((fresh) => {
        setSession(fresh);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, [sessionId]);
  const pollRef = useVisiblePoll(refresh, 2000);

  const selectItem = (itemId: string, nextTab: InspectorTab | null = null) => {
    setSelectedId(itemId);
    setTab(nextTab);
    setAvatarOpen(false);
    setMobilePane("inspector");
  };

  // Auto-heal and the strict-JSON retry already failed for these, so offer the manual fix once per
  // item, without taking the inspector away from a card the user is looking at.
  useEffect(() => {
    if (!session || selectedId !== null) return;
    const unparsed = session.items.find(
      (item) => item.status === "failed-parse" && item.failure?.rawOutput && !fixJsonShown.current.has(item.itemId),
    );
    if (!unparsed) return;
    fixJsonShown.current.add(unparsed.itemId);
    setSelectedId(unparsed.itemId);
    setTab("json");
  }, [selectedId, session]);

  const stage = session ? runStage(session) : null;
  const label = session?.label ?? "";
  useEffect(() => {
    if (stage) onStage?.(stage, label);
  }, [stage, label, onStage]);

  // The inspector opens on the most useful card: the first one waiting for a decision.
  useEffect(() => {
    if (!session || selectedId !== null) return;
    const first =
      session.items.find((item) => isReviewable(item) || item.status === "awaiting-split") ?? session.items[0];
    if (first) setSelectedId(first.itemId);
  }, [selectedId, session]);

  // Auto-approve driver (DESIGN §3): auto-save items land in awaiting-review with autoApply —
  // the panel drives their verdict flow once per item; holds fall back to needs-review triage.
  useEffect(() => {
    if (!session || (session.config.completionMode ?? "ask") !== "ask") return;
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

  // Queue-drain enforcement resumes from serialized pendingOps. Apply mode first sends the host's
  // current fields to server planning; stale cards land in needs-review without a write.
  useEffect(() => {
    if (!session || enforcementInFlight.current || session.status !== "completed") return;
    const completionMode = session.config.completionMode ?? "ask";
    const pendingCount = session.items.filter(
      (item) => Array.isArray(item.pendingOps) || (completionMode === "apply" && item.status === "awaiting-review"),
    ).length;
    if (pendingCount === 0) return;
    enforcementInFlight.current = true;
    void executeCompletionEnforcement(session, (done, total) => setEnforcementProgress({ done, total }))
      .then((outcome) => {
        // No setSession: skipped items leave the outcome on the pre-run snapshot, which would flash
        // approved cards back to awaiting review. The refresh below reads the true state.
        if (outcome.messages.length > 0) setActionError(outcome.messages[0]!);
      })
      .finally(() => {
        enforcementInFlight.current = false;
        setEnforcementProgress(null);
        refresh();
      });
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

  const runAgain = () =>
    void runAction("run-again", async () => {
      const created = await rerunSession(sessionId);
      onRerun?.(created.id);
      return created;
    });

  // One target per card: split children and Phase 2 items share their source card's id.
  const rerunSelected = (items: readonly SessionItem[]) =>
    void runAction("rerun-selected", async () => {
      if (!session) return;
      const unique = items.filter(
        (item, index) => items.findIndex((other) => other.characterId === item.characterId) === index,
      );
      const styleIds = [
        ...new Set(
          unique.flatMap((item) => (typeof item.behaviorOverride === "string" ? [item.behaviorOverride] : [])),
        ),
      ];
      // A style card that no longer loads falls back to the session style.
      const styles = new Map(
        (await Promise.allSettled(styleIds.map((id) => getHostCharacter(id)))).flatMap((result, index) =>
          result.status === "fulfilled" ? [[styleIds[index]!, result.value] as const] : [],
        ),
      );
      const targets: Record<string, BulkTargetDraft> = {};
      for (const item of unique) {
        const style = typeof item.behaviorOverride === "string" ? styles.get(item.behaviorOverride) : undefined;
        targets[item.characterId] = {
          note: item.note ?? "",
          style:
            item.behaviorOverride === null
              ? { kind: "none" }
              : style
                ? { kind: "character", ...style }
                : { kind: "inherit" },
        };
      }
      onRerunSelected?.({
        label: session.label,
        config: session.config,
        targets: { ids: unique.map((item) => item.characterId), targets },
      });
    });

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
          t("cardEditor.panel.detail.duplicateAppliedPartial", { failed: outcome.failedCount, total: eligibleCount }),
        );
      }
      return outcome.session;
    });

  if (loadError && !session) {
    return (
      <section className="ce-run ce-run--status" ref={pollRef}>
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
      <section className="ce-run ce-run--status" ref={pollRef}>
        <div className="ce-status" role="status">
          {t("cardEditor.panel.detail.loading")}
        </div>
      </section>
    );
  }

  const counts = session.config.transform ? transformCounts(session) : null;
  const visiblePhase = phaseView ?? counts?.phase ?? 1;
  const phaseItems = counts ? session.items.filter((item) => (item.phase ?? 1) === visiblePhase) : session.items;
  const groupCounts = new Map<ItemGroup, number>();
  for (const item of phaseItems) groupCounts.set(itemGroup(item), (groupCounts.get(itemGroup(item)) ?? 0) + 1);
  const needle = query.trim().toLocaleLowerCase();
  const listedItems = phaseItems.filter(
    (item) =>
      (filter === "all" || itemGroup(item) === filter) &&
      (!needle || item.characterName.toLocaleLowerCase().includes(needle)),
  );
  const resultItemCount = session.items.filter((item) => item.status !== "split" && item.status !== "staged").length;
  const reviewableItems = session.items.filter(isReviewable);
  const failedCount = session.items.filter(isFailed).length;
  const combinedMode = session.config.saveMode === "combined";
  const collectedCount = combinedMode ? session.items.filter((item) => item.status === "applied").length : 0;
  const combineAvailable = combinedMode && !session.combinedCardId && collectedCount > 0;
  const combinePartial = combineAvailable && collectedCount < resultItemCount;
  // Duplicate-applied housekeeping action: applied items edited the original in place, so only
  // those without a result card (and with edits worth cloning) are eligible. Combined mode's
  // output is the combined card, so the action is hidden there.
  const duplicateAppliedCount = combinedMode
    ? 0
    : session.items.filter(
        (item) => item.status === "applied" && item.resultCardId === undefined && (item.updates ?? []).length > 0,
      ).length;
  const live = deriveLiveStatus(session);
  const checkedItems = session.items.filter((item) => checked.has(item.itemId));
  const checkedReviewable = checkedItems.filter(isReviewable);
  const allListedChecked = listedItems.length > 0 && listedItems.every((item) => checked.has(item.itemId));
  const selected = session.items.find((item) => item.itemId === selectedId) ?? null;
  const tabs = selected ? inspectorTabs(selected) : [];
  const activeTab = tab && tabs.includes(tab) ? tab : (tabs[0] ?? null);

  const toggleChecked = (itemId: string) =>
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  const decideMany = (key: string, items: readonly SessionItem[], verdict: "approve" | "reject") =>
    void runAction(key, async () => {
      for (const item of items) {
        // Holds land in needs-review and stay for manual triage (DESIGN §3: skipped = undecided).
        const outcome =
          verdict === "approve"
            ? await approveSessionItem(session, item, { force: false })
            : await rejectSessionItem(session, item);
        if (outcome.kind === "failed" || outcome.kind === "report-failed") throw new Error(outcome.message);
      }
      setChecked(new Set());
    });
  const onPaneUpdated = (updated: BulkSession) => {
    setSession(updated);
    setTab(null);
  };

  const liveText =
    live.kind === "batch"
      ? t("cardEditor.panel.live.batch", { index: live.batchIndex, count: live.batchCount }) +
        (live.batchAttempts > 1 ? t("cardEditor.panel.live.batchRetry", { attempt: live.batchAttempts }) : "")
      : live.kind === "items"
        ? t("cardEditor.panel.live.items", { running: live.runningItems, total: session.stats.total })
        : live.kind === "queued"
          ? t("cardEditor.panel.live.queued", { count: live.queuedItems })
          : t("cardEditor.panel.progress", { done: session.stats.done, total: session.stats.total });

  const inspectorBody = avatarOpen ? (
    <AvatarStudio localization={localization} session={session} onClose={() => setAvatarOpen(false)} />
  ) : !selected ? (
    <p className="ce-caption ce-inspector-empty">{t("cardEditor.workspace.pickItem")}</p>
  ) : activeTab === "changes" ? (
    <VerdictQueue
      localization={localization}
      session={session}
      focusItemId={selected.itemId}
      onFocusChange={setSelectedId}
      onRefresh={refresh}
    />
  ) : activeTab === "split" && selected.status === "awaiting-split" ? (
    <SplitReviewDialog
      key={selected.itemId}
      localization={localization}
      session={session}
      item={selected}
      onClose={() => setTab("summary")}
      onUpdated={onPaneUpdated}
    />
  ) : activeTab === "json" && selected.status === "failed-parse" ? (
    <FixJsonDialog
      key={selected.itemId}
      localization={localization}
      session={session}
      item={selected}
      onClose={() => setTab("summary")}
      onUpdated={onPaneUpdated}
    />
  ) : activeTab === "retry" ? (
    <EditRetryDialog
      key={selected.itemId}
      localization={localization}
      session={session}
      item={selected}
      onClose={() => setTab("summary")}
      onRetried={onPaneUpdated}
    />
  ) : (
    <div className="ce-inspector-summary">
      <ItemSummary item={selected} t={t} />
      {autoApplyErrors[selected.itemId] ? (
        <span className="ce-item-failure">
          {t("cardEditor.panel.detail.autoApplyError", {
            name: selected.characterName,
            message: autoApplyErrors[selected.itemId]!,
          })}
        </span>
      ) : null}
      <div className="ce-item-actions">
        {isFailed(selected) ? (
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busyKey !== null}
            onClick={() =>
              void runAction(`rerun-${selected.itemId}`, () => retrySessionItem(sessionId, selected.itemId))
            }
          >
            {t("cardEditor.panel.action.rerun")}
          </button>
        ) : null}
        {selected.status === "queued" && session.status === "active" ? (
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busyKey !== null}
            onClick={() =>
              void runAction(`cancel-${selected.itemId}`, () => cancelSessionItem(sessionId, selected.itemId))
            }
          >
            {t("cardEditor.panel.action.cancelItem")}
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <section className="ce-run" ref={pollRef} data-card-editor-view="session-detail" data-mobile-pane={mobilePane}>
      <header className="ce-run-head">
        <div className="ce-run-title">
          <strong className="ce-panel-heading">{session.label}</strong>
          <span className="ce-caption" role="status">
            {session.status === "active"
              ? liveText
              : t("cardEditor.panel.progress", { done: session.stats.done, total: session.stats.total })}
          </span>
        </div>
        <span
          className={`ce-chip ce-chip--${session.status === "active" ? "live" : session.status === "completed" ? "ok" : "muted"}`}
        >
          {t(`cardEditor.panel.sessionStatus.${session.status}`)}
        </span>
        <span className="ce-chip">{t(`cardEditor.panel.saveMode.${session.config.saveMode}`)}</span>
        <span className="ce-chip">
          {t(`cardEditor.panel.completionMode.${session.config.completionMode ?? "ask"}`)}
        </span>
        {counts ? (
          <span className="ce-chip">
            {t("cardEditor.pipeline.count", { sources: counts.sources, results: counts.results })}
          </span>
        ) : null}
        {counts?.splitsPending ? (
          <span className="ce-chip ce-chip--review">
            {t("cardEditor.pipeline.splitsPending", { count: counts.splitsPending })}
          </span>
        ) : null}
      </header>
      {session.combinedCardId || session.status === "interrupted" || enforcementProgress || actionError ? (
        <div className="ce-run-notices">
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
          {enforcementProgress ? (
            <p className="ce-caption ce-live-line" role="status">
              {t("cardEditor.panel.enforcementProgress", enforcementProgress)}
            </p>
          ) : null}
          {actionError ? (
            <div className="ce-status ce-status--error" role="alert">
              {t("cardEditor.panel.detail.actionError", { message: actionError })}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="ce-run-body">
        <div className="ce-run-list">
          {session.config.transform?.phase2?.enabled && counts ? (
            <div className="ce-segmented" role="radiogroup" aria-label={t("cardEditor.pipeline.phaseLabel")}>
              {([1, 2] as const).map((phase) => (
                <button
                  key={phase}
                  type="button"
                  role="radio"
                  className="ce-segment"
                  aria-checked={visiblePhase === phase}
                  disabled={phase === 2 && counts.phase === 1}
                  onClick={() => setPhaseView(phase)}
                >
                  {t("cardEditor.pipeline.phase", { phase: phase })}
                </button>
              ))}
            </div>
          ) : null}
          <input
            type="search"
            className="mari-chrome-field ce-field"
            value={query}
            placeholder={t("cardEditor.workspace.filterItems")}
            aria-label={t("cardEditor.workspace.filterItems")}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="ce-filter-chips" role="group" aria-label={t("cardEditor.workspace.statusFilter")}>
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
              {t("cardEditor.workspace.group.all", { count: phaseItems.length })}
            </button>
            {ITEM_GROUPS.filter((group) => groupCounts.has(group)).map((group) => (
              <button key={group} type="button" aria-pressed={filter === group} onClick={() => setFilter(group)}>
                {t(`cardEditor.workspace.group.${group}`, { count: groupCounts.get(group) ?? 0 })}
              </button>
            ))}
          </div>
          <label className="ce-select-all">
            <input
              type="checkbox"
              checked={allListedChecked}
              disabled={listedItems.length === 0}
              onChange={() =>
                setChecked((current) => {
                  const next = new Set(current);
                  for (const item of listedItems) {
                    if (allListedChecked) next.delete(item.itemId);
                    else next.add(item.itemId);
                  }
                  return next;
                })
              }
            />
            <span>{t("cardEditor.workspace.selectListed", { count: listedItems.length })}</span>
          </label>
          <ul className="ce-items">
            {listedItems.map((item) => {
              const child = isSplitChild(item, session.items);
              const issueCount = (item.characters ?? []).reduce(
                (total, character) => total + (character.issues?.length ?? 0),
                0,
              );
              return (
                <li
                  className={`ce-item${child ? " ce-item--child" : ""}${item.itemId === selectedId ? " ce-item--selected" : ""}`}
                  key={item.itemId}
                >
                  <input
                    type="checkbox"
                    checked={checked.has(item.itemId)}
                    aria-label={t("cardEditor.workspace.selectItem", { name: item.characterName })}
                    onChange={() => toggleChecked(item.itemId)}
                  />
                  <button
                    type="button"
                    className="ce-item-open"
                    aria-current={item.itemId === selectedId}
                    onClick={() => selectItem(item.itemId)}
                  >
                    <span className="ce-item-main">
                      {/* No engine deep link to a character editor exists for packages — name only. */}
                      <span className="ce-item-name">{item.characterName}</span>
                      <span className={`ce-chip ce-chip--${itemStatusTone(item.status)}`}>
                        {t(itemStatusLabelKey(item.status))}
                      </span>
                    </span>
                    <span className="ce-item-sub">
                      {item.lineage?.splitGroupId ? (
                        <span className="ce-chip">
                          {t("cardEditor.panel.detail.lineage", {
                            index: item.lineage.splitIndex ?? 1,
                            count: item.lineage.splitCount ?? 1,
                            origin: item.lineage.originName,
                          })}
                        </span>
                      ) : null}
                      {issueCount > 0 ? (
                        <span
                          className="ce-chip ce-chip--review"
                          title={(item.characters ?? []).flatMap((character) => character.issues ?? []).join("\n")}
                        >
                          {t("cardEditor.panel.detail.issues", { count: issueCount })}
                        </span>
                      ) : null}
                      <ItemSummary item={item} t={t} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {listedItems.length === 0 ? <p className="ce-caption">{t("cardEditor.workspace.noItems")}</p> : null}
        </div>
        <div className="ce-inspector">
          {selected && !avatarOpen ? (
            <>
              <div className="ce-inspector-head">
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--small ce-mobile-only"
                  onClick={() => setMobilePane("list")}
                >
                  <ChevronLeft className="ce-icon" aria-hidden="true" />
                  {t("cardEditor.workspace.items")}
                </button>
                <h3 className="ce-queue-name">{selected.characterName}</h3>
                <span className={`ce-chip ce-chip--${itemStatusTone(selected.status)}`}>
                  {t(itemStatusLabelKey(selected.status))}
                </span>
              </div>
              <div className="ce-inspector-tabs" role="tablist" aria-label={selected.characterName}>
                {tabs.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === name}
                    onClick={() => setTab(name)}
                  >
                    {t(`cardEditor.workspace.tab.${name}`)}
                  </button>
                ))}
              </div>
            </>
          ) : null}
          <div className="ce-inspector-body" role={selected && !avatarOpen ? "tabpanel" : undefined}>
            {inspectorBody}
          </div>
        </div>
      </div>
      <footer className="ce-bulkbar">
        <span className="ce-caption ce-bulkbar-count">
          {t("cardEditor.workspace.selectedCount", { count: checkedItems.length })}
        </span>
        <div className="ce-bulkbar-actions">
          {checkedReviewable.length > 0 ? (
            <>
              <button
                type="button"
                className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
                disabled={busyKey !== null}
                onClick={() => decideMany("approve-selected", checkedReviewable, "approve")}
              >
                {t("cardEditor.workspace.approveSelected", { count: checkedReviewable.length })}
              </button>
              <button
                type="button"
                className="mari-chrome-control mari-chrome-control--small ce-danger-button"
                disabled={busyKey !== null}
                onClick={() => decideMany("reject-selected", checkedReviewable, "reject")}
              >
                {t("cardEditor.workspace.rejectSelected", { count: checkedReviewable.length })}
              </button>
            </>
          ) : null}
          {reviewableItems.length > 0 ? (
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--small"
              disabled={busyKey !== null}
              onClick={() => decideMany("approve-all", reviewableItems, "approve")}
            >
              {busyKey === "approve-all"
                ? t("cardEditor.queue.approveAllWorking")
                : t("cardEditor.workspace.approveAll", { count: reviewableItems.length })}
            </button>
          ) : null}
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
                    total: resultItemCount,
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
          {counts?.phase2Ready ? (
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
              disabled={busyKey !== null}
              onClick={() =>
                void runAction("phase2", async () => {
                  const updated = await startSessionPhase2(sessionId);
                  setPhaseView(2);
                  return updated;
                })
              }
            >
              {t("cardEditor.pipeline.startPhase2", { count: counts.results })}
            </button>
          ) : null}
          {onRerunSelected ? (
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--small"
              disabled={busyKey !== null || checkedItems.length === 0}
              onClick={() => rerunSelected(checkedItems)}
            >
              {t("cardEditor.workspace.rerunSelected", { count: checkedItems.length })}
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
          {counts || combinedMode ? (
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--small"
              aria-pressed={avatarOpen}
              onClick={() => {
                setAvatarOpen((open) => !open);
                setMobilePane("inspector");
              }}
            >
              {t("cardEditor.avatar.open")}
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
          {session.status === "completed" || session.status === "canceled" ? (
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--small"
              disabled={busyKey !== null}
              onClick={runAgain}
            >
              {t("cardEditor.panel.runAgain")}
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
      </footer>
    </section>
  );
}
