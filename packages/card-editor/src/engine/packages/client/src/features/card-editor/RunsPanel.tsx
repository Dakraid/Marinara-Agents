import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { BulkSession, BulkSettings } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import {
  cancelSession,
  deleteSession,
  getBulkSettings,
  getSession,
  listSessions,
  rerunSession,
  saveBulkSettings,
  type SessionIndexEntry,
} from "./api";
import { executeCompletionEnforcement } from "./apply-ops";
import { NumberField } from "./dialog-controls";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import { deriveLiveStatus } from "./panel-status";
import { SessionDetail } from "./SessionDetail";
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

function ModeChips({
  session,
  t,
}: {
  session: BulkSession;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  return (
    <span className="ce-session-chips">
      <span className="ce-chip">
        {session.config.mode === "batched"
          ? t("cardEditor.panel.modeBatched", { size: session.config.batchSize })
          : t("cardEditor.panel.modeIndividual")}
      </span>
      <span className="ce-chip">{t(`cardEditor.panel.saveMode.${session.config.saveMode}`)}</span>
      <span className="ce-chip">{t(`cardEditor.panel.completionMode.${session.config.completionMode ?? "ask"}`)}</span>
    </span>
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
  return (
    <p className="ce-caption ce-live-line" role="status">
      {text}
    </p>
  );
}

export function RunsPanel({
  localization,
  agentName,
  detailId: controlledDetailId,
  onDetailIdChange,
  splitView = false,
}: {
  localization?: CardEditorLocalizationContext;
  agentName?: string;
  /** Controlled detail selection (overlay workspace). Omit for the standalone panel. */
  detailId?: string | null;
  onDetailIdChange?: (sessionId: string | null) => void;
  /** Workspace layout: session list stays visible as a left rail next to the detail. */
  splitView?: boolean;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [sessions, setSessions] = useState<SessionIndexEntry[] | null>(null);
  const [activeDetails, setActiveDetails] = useState<Readonly<Record<string, BulkSession>>>({});
  const [loadError, setLoadError] = useState(false);
  const [internalDetailId, setInternalDetailId] = useState<string | null>(null);
  const isControlled = controlledDetailId !== undefined;
  const detailId = isControlled ? controlledDetailId : internalDetailId;
  const setDetailId = (id: string | null) => {
    if (isControlled) onDetailIdChange?.(id);
    else setInternalDetailId(id);
  };
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
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
  const pollRef = useVisiblePoll(refresh, 2000, detailId === null);

  useEffect(() => {
    if (detailId !== null) return;
    for (const session of Object.values(activeDetails)) {
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

  const runAction = async (id: string, work: () => Promise<unknown>) => {
    if (busyId) return;
    setBusyId(id);
    setActionError(null);
    try {
      await work();
      refresh();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusyId(null);
    }
  };

  const detailElement = detailId ? (
    <SessionDetail
      localization={localization}
      sessionId={detailId}
      onBack={() => {
        setDetailId(null);
        refresh();
      }}
      onDeleted={() => {
        setDetailId(null);
        setConfirmDeleteId(null);
        refresh();
      }}
      onRerun={(sessionId) => {
        setDetailId(sessionId);
        refresh();
      }}
    />
  ) : null;

  const list = sessions ?? [];
  const active = list.filter((entry) => entry.status === "active");
  const history = list.filter((entry) => entry.status !== "active");

  const listContent = (
    <>
      <div className="ce-panel-head">
        <strong className="ce-panel-heading">{t("cardEditor.panel.title")}</strong>
        <button
          type="button"
          className="mari-chrome-control mari-chrome-control--small ce-refresh-button"
          disabled={busyId !== null}
          onClick={refresh}
        >
          <RefreshCw className="ce-icon" aria-hidden="true" />
          {t("cardEditor.panel.refresh")}
        </button>
      </div>
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
      <BulkSettingsSection localization={localization} />
      {active.length > 0 ? (
        <div className="ce-panel-section" data-ce-section="active">
          <span className="ce-section-heading">{t("cardEditor.panel.activeTitle")}</span>
          <ul className="ce-sessions">
            {active.map((entry) => {
              const detail = activeDetails[entry.id];
              const done = entry.stats.total > 0 ? entry.stats.done / entry.stats.total : 0;
              return (
                <li className="ce-session ce-session--active" key={entry.id}>
                  <div className="ce-session-top">
                    <button type="button" className="ce-session-label" onClick={() => setDetailId(entry.id)}>
                      {entry.label}
                    </button>
                    {detail ? <ModeChips session={detail} t={t} /> : null}
                  </div>
                  <div
                    className="ce-progress"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={entry.stats.total}
                    aria-valuenow={entry.stats.done}
                    aria-label={t("cardEditor.panel.progress", { done: entry.stats.done, total: entry.stats.total })}
                  >
                    <div className="ce-progress-fill" style={{ width: `${Math.round(done * 100)}%` }} />
                  </div>
                  <span className="ce-caption">
                    {t("cardEditor.panel.progress", { done: entry.stats.done, total: entry.stats.total })}
                  </span>
                  {detail ? <LiveStatusLine session={detail} t={t} /> : null}
                  <div className="ce-session-actions">
                    <button
                      type="button"
                      className="mari-chrome-control mari-chrome-control--small"
                      disabled={busyId !== null}
                      onClick={() => void runAction(entry.id, () => cancelSession(entry.id))}
                    >
                      {t("cardEditor.panel.cancel")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {history.length > 0 ? (
        <div className="ce-panel-section" data-ce-section="history">
          <span className="ce-section-heading">{t("cardEditor.panel.historyTitle")}</span>
          <ul className="ce-sessions">
            {history.map((entry) => (
              <li className="ce-session" key={entry.id}>
                <button type="button" className="ce-session-label" onClick={() => setDetailId(entry.id)}>
                  {entry.label}
                </button>
                <span className="ce-session-meta">
                  <span className={`ce-chip ce-chip--${entry.status === "completed" ? "ok" : "muted"}`}>
                    {t(`cardEditor.panel.sessionStatus.${entry.status}`)}
                  </span>
                  <span className="ce-chip">{t(`cardEditor.panel.completionMode.${entry.completionMode}`)}</span>
                  <span className="ce-caption">
                    {t("cardEditor.panel.progress", { done: entry.stats.done, total: entry.stats.total })}
                  </span>
                  {entry.stats.failed > 0 ? (
                    <span className="ce-chip ce-chip--danger">
                      {t("cardEditor.panel.statsFailed", { count: entry.stats.failed })}
                    </span>
                  ) : null}
                  <span className="ce-caption ce-session-date">{new Date(entry.createdAt).toLocaleString()}</span>
                </span>
                {entry.status === "interrupted" ? (
                  <p className="ce-caption ce-session-note">{t("cardEditor.panel.interruptedNotice")}</p>
                ) : null}
                {enforcementProgress[entry.id] ? (
                  <p className="ce-caption ce-live-line" role="status">
                    {t("cardEditor.panel.enforcementProgress", enforcementProgress[entry.id])}
                  </p>
                ) : null}
                {entry.status === "completed" || entry.status === "canceled" ? (
                  <button
                    type="button"
                    className="mari-chrome-control mari-chrome-control--small"
                    disabled={busyId !== null}
                    onClick={() =>
                      void runAction(entry.id, async () => {
                        const created = await rerunSession(entry.id);
                        setDetailId(created.id);
                      })
                    }
                  >
                    {t("cardEditor.panel.runAgain")}
                  </button>
                ) : null}
                {confirmDeleteId === entry.id ? (
                  <span className="ce-confirm-strip" role="group" aria-label={t("cardEditor.panel.delete")}>
                    <span className="ce-caption">{t("cardEditor.panel.deleteConfirm")}</span>
                    <button
                      type="button"
                      className="mari-chrome-control mari-chrome-control--small ce-danger-button"
                      disabled={busyId !== null}
                      onClick={() =>
                        void runAction(entry.id, async () => {
                          await deleteSession(entry.id);
                          setConfirmDeleteId(null);
                        })
                      }
                    >
                      {t("cardEditor.panel.deleteYes")}
                    </button>
                    <button
                      type="button"
                      className="mari-chrome-control mari-chrome-control--small"
                      disabled={busyId !== null}
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      {t("cardEditor.panel.deleteNo")}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="mari-chrome-control mari-chrome-control--small ce-session-delete"
                    disabled={busyId !== null}
                    onClick={() => setConfirmDeleteId(entry.id)}
                  >
                    {t("cardEditor.panel.delete")}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );

  if (detailElement) {
    if (!splitView) return detailElement;
    return (
      <section
        className="ce-shell ce-panel ce-panel--workspace"
        data-card-editor-view="agent-panel"
        ref={pollRef}
        aria-label={
          agentName ? t("cardEditor.panel.titleWithAgent", { agent: agentName }) : t("cardEditor.panel.title")
        }
      >
        <div className="ce-workspace-split">
          <div className="ce-workspace-rail">{listContent}</div>
          <div className="ce-workspace-main">{detailElement}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="ce-shell ce-panel"
      data-card-editor-view="agent-panel"
      ref={pollRef}
      aria-label={agentName ? t("cardEditor.panel.titleWithAgent", { agent: agentName }) : t("cardEditor.panel.title")}
    >
      {listContent}
    </section>
  );
}
