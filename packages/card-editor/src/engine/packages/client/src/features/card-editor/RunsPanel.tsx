import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { BulkSession } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { getBulkSettings, getSession, listSessions, saveBulkSettings, type SessionIndexEntry } from "./api";
import { executeCompletionEnforcement } from "./apply-ops";
import { NumberField, safeLocalStorage } from "./dialog-controls";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import { deriveLiveStatus } from "./panel-status";
import { loadBulkDraftTargets } from "./session-config";
import { useVisiblePoll } from "./use-visible-poll";

/** Collapsible bulk settings: the agent-level parallel-call cap and the require-review toggle,
 *  persisted through the package's own /settings route (the same store the server enforces). */
function BulkSettingsSection({ localization }: { localization?: CardEditorLocalizationContext }) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [loaded, setLoaded] = useState(false);
  const [maxParallel, setMaxParallel] = useState(0);
  const [disableAuto, setDisableAuto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBulkSettings()
      .then((settings) => {
        if (cancelled) return;
        setMaxParallel(settings.maxParallelAgents ?? 0);
        setDisableAuto(settings.disableAutoVerdicts);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the bulk settings.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    if (busy || !loaded) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await saveBulkSettings({
        version: 1,
        maxParallelAgents: maxParallel > 0 ? maxParallel : null,
        disableAutoVerdicts: disableAuto,
      });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <details className="ce-settings" data-ce-section="bulk-settings">
      <summary className="ce-section-heading">{t("cardEditor.panel.settings.title")}</summary>
      <NumberField
        id="ce-settings-max-parallel"
        label={t("cardEditor.panel.settings.maxParallelAgents")}
        value={maxParallel}
        min={0}
        max={16}
        onChange={(next) => {
          setMaxParallel(next);
          setSaved(false);
        }}
      />
      <p className="ce-caption">{t("cardEditor.panel.settings.maxParallelAgentsHint")}</p>
      <label className="ce-choice">
        <input
          type="checkbox"
          checked={disableAuto}
          onChange={(event) => {
            setDisableAuto(event.target.checked);
            setSaved(false);
          }}
        />
        <span className="ce-choice-copy">
          <strong>{t("cardEditor.panel.settings.disableAutoVerdicts")}</strong>
          <small>{t("cardEditor.panel.settings.disableAutoVerdictsHint")}</small>
        </span>
      </label>
      <div className="ce-session-actions">
        <button
          type="button"
          className="mari-chrome-control mari-chrome-control--small"
          disabled={busy || !loaded}
          onClick={() => void save()}
        >
          {t("cardEditor.panel.settings.save")}
        </button>
        {saved ? <span className="ce-caption">{t("cardEditor.panel.settings.saved")}</span> : null}
      </div>
      {error ? (
        <div className="ce-status ce-status--error" role="alert">
          {t("cardEditor.panel.detail.actionError", { message: error })}
        </div>
      ) : null}
    </details>
  );
}

function LiveStatusLine({
  session,
  t,
}: {
  session: BulkSession;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const live = deriveLiveStatus(session);
  const text =
    live.kind === "batch"
      ? t("cardEditor.panel.live.batch", { index: live.batchIndex, count: live.batchCount }) +
        (live.batchAttempts > 1 ? t("cardEditor.panel.live.batchRetry", { attempt: live.batchAttempts }) : "")
      : live.kind === "items"
        ? t("cardEditor.panel.live.items", { running: live.runningItems, total: session.stats.total })
        : live.kind === "queued"
          ? t("cardEditor.panel.live.queued", { count: live.queuedItems })
          : t("cardEditor.panel.live.settling");
  return <span className="ce-caption ce-live-line">{text}</span>;
}

/**
 * The workspace rail: every run (active first), the New run entry and the bulk settings. It polls
 * the run index and resumes completion enforcement for runs that are not open in the main pane
 * (the open run's own poll drives those).
 */
export function RunsPanel({
  localization,
  detailId,
  setupActive,
  onSelect,
  onNewRun,
}: {
  localization?: CardEditorLocalizationContext;
  detailId: string | null;
  setupActive: boolean;
  onSelect: (sessionId: string) => void;
  onNewRun: () => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [sessions, setSessions] = useState<SessionIndexEntry[] | null>(null);
  const [activeDetails, setActiveDetails] = useState<Readonly<Record<string, BulkSession>>>({});
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [enforcementProgress, setEnforcementProgress] = useState<
    Readonly<Record<string, { done: number; total: number }>>
  >({});
  const enforcementInFlight = useRef(new Set<string>());

  // The index projection covers history; active sessions and completed sessions with enforcement
  // work fetch full details in the same cycle.
  const refresh = useCallback(() => {
    listSessions()
      .then(async (list) => {
        setSessions(Array.isArray(list) ? list : []);
        setLoadError(false);
        const detailEntries = (Array.isArray(list) ? list : []).filter(
          (entry) =>
            entry.status === "active" ||
            (entry.status === "completed" && (entry.pendingApplyCount > 0 || entry.enforcementPendingCount > 0)),
        );
        const details = await Promise.allSettled(detailEntries.map((entry) => getSession(entry.id)));
        const map: Record<string, BulkSession> = {};
        details.forEach((result, index) => {
          if (result.status === "fulfilled") map[detailEntries[index]!.id] = result.value;
        });
        setActiveDetails(map);
      })
      .catch(() => setLoadError(true));
  }, []);
  const pollRef = useVisiblePoll(refresh, 3000, true);

  useEffect(() => {
    for (const session of Object.values(activeDetails)) {
      if (session.id === detailId) continue;
      if (session.status !== "completed" || enforcementInFlight.current.has(session.id)) continue;
      const mode = session.config.completionMode ?? "ask";
      const count = session.items.filter(
        (item) => Array.isArray(item.pendingOps) || (mode === "apply" && item.status === "awaiting-review"),
      ).length;
      if (count === 0) continue;
      enforcementInFlight.current.add(session.id);
      void executeCompletionEnforcement(session, (done, total) =>
        setEnforcementProgress((current) => ({ ...current, [session.id]: { done, total } })),
      )
        .then((outcome) => {
          if (outcome.messages.length > 0) setActionError(outcome.messages[0]!);
        })
        .finally(() => {
          enforcementInFlight.current.delete(session.id);
          setEnforcementProgress((current) => {
            const { [session.id]: _done, ...rest } = current;
            return rest;
          });
          refresh();
        });
    }
  }, [activeDetails, detailId, refresh]);

  // Read on every render: the poll re-renders often enough to pick up the setup's auto-saves.
  const draft = loadBulkDraftTargets(safeLocalStorage());
  const list = sessions ?? [];
  const active = list.filter((entry) => entry.status === "active");
  const history = list.filter((entry) => entry.status !== "active");
  const row = (entry: SessionIndexEntry) => {
    const detail = activeDetails[entry.id];
    const done = entry.stats.total > 0 ? entry.stats.done / entry.stats.total : 0;
    return (
      <li key={entry.id}>
        <button
          type="button"
          className={`ce-run-row${entry.status === "active" ? " ce-run-row--active" : ""}`}
          aria-current={!setupActive && entry.id === detailId}
          onClick={() => onSelect(entry.id)}
        >
          <span className="ce-run-row-label">{entry.label}</span>
          <span className="ce-run-row-meta">
            {entry.status === "active" ? null : (
              <span className={`ce-chip ce-chip--${entry.status === "completed" ? "ok" : "muted"}`}>
                {t(`cardEditor.panel.sessionStatus.${entry.status}`)}
              </span>
            )}
            {entry.stats.failed > 0 ? (
              <span className="ce-chip ce-chip--danger">
                {t("cardEditor.panel.statsFailed", { count: entry.stats.failed })}
              </span>
            ) : null}
            <span className="ce-caption">
              {t("cardEditor.panel.progress", { done: entry.stats.done, total: entry.stats.total })}
            </span>
          </span>
          {entry.status === "active" ? (
            <span
              className="ce-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={entry.stats.total}
              aria-valuenow={entry.stats.done}
              aria-label={t("cardEditor.panel.progress", { done: entry.stats.done, total: entry.stats.total })}
            >
              <span className="ce-progress-fill" style={{ width: `${Math.round(done * 100)}%` }} />
            </span>
          ) : null}
          {detail && entry.status === "active" ? <LiveStatusLine session={detail} t={t} /> : null}
          {enforcementProgress[entry.id] ? (
            <span className="ce-caption ce-live-line">
              {t("cardEditor.panel.enforcementProgress", enforcementProgress[entry.id])}
            </span>
          ) : null}
        </button>
      </li>
    );
  };

  return (
    <nav className="ce-rail" ref={pollRef} aria-label={t("cardEditor.panel.title")} data-card-editor-view="runs">
      <div className="ce-rail-top">
        <button
          type="button"
          className="mari-chrome-control mari-chrome-control--primary"
          aria-current={setupActive}
          onClick={onNewRun}
        >
          <Plus className="ce-icon" aria-hidden="true" />
          {t("cardEditor.workspace.newRun")}
        </button>
      </div>
      <div className="ce-rail-runs">
        {draft ? (
          <div data-ce-section="draft">
            <ul className="ce-sessions">
              <li>
                <button type="button" className="ce-run-row" onClick={onNewRun}>
                  <span className="ce-run-row-label">{t("cardEditor.workspace.draft")}</span>
                  <span className="ce-run-row-meta">
                    <span className="ce-caption">
                      {t("cardEditor.workspace.draftCount", { count: draft.ids.length })}
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        ) : null}
        {loadError ? (
          <div className="ce-status ce-status--error" role="alert">
            {t("cardEditor.panel.loadError")}
          </div>
        ) : null}
        {actionError ? (
          <div className="ce-status ce-status--error" role="alert">
            {t("cardEditor.panel.detail.actionError", { message: actionError })}
          </div>
        ) : null}
        {sessions === null && !loadError ? (
          <div className="ce-status" role="status">
            {t("cardEditor.panel.loading")}
          </div>
        ) : null}
        {sessions !== null && list.length === 0 ? <p className="ce-caption">{t("cardEditor.panel.empty")}</p> : null}
        {active.length > 0 ? (
          <div data-ce-section="active">
            <span className="ce-rail-label">{t("cardEditor.panel.activeTitle")}</span>
            <ul className="ce-sessions">{active.map(row)}</ul>
          </div>
        ) : null}
        {history.length > 0 ? (
          <div data-ce-section="history">
            <span className="ce-rail-label">{t("cardEditor.panel.historyTitle")}</span>
            <ul className="ce-sessions">{history.map(row)}</ul>
          </div>
        ) : null}
      </div>
      <div className="ce-rail-foot">
        <BulkSettingsSection localization={localization} />
      </div>
    </nav>
  );
}
