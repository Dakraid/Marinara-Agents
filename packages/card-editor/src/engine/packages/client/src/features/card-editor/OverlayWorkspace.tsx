import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { BulkSession } from "../../../../shared/src/features/agents/card-editor/schema.js";
import { listSessions, type SessionIndexEntry } from "./api";
import { BulkDispatchDialog } from "./BulkDispatchDialog";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import { RunsPanel } from "./RunsPanel";
import { useVisiblePoll } from "./use-visible-poll";

/** Engine event bridge (capabilityApi 1.68): engine UI asks the package overlay to open/close. */
export const OVERLAY_EVENT = "marinara:capability-overlay";
export const OVERLAY_PACKAGE_ID = "card-editor";

export type CardEditorOverlayPayload = {
  sessionId?: string;
  dispatch?: { characterIds?: unknown };
};

export function openCardEditorOverlay(payload?: CardEditorOverlayPayload) {
  window.dispatchEvent(
    new CustomEvent(OVERLAY_EVENT, {
      detail: { packageId: OVERLAY_PACKAGE_ID, action: "open", payload },
    }),
  );
}

/**
 * The whole bulk flow — dispatch dialog, session list, verdict review — lives in this
 * fixed workspace above the chat window. The engine mounts it permanently (contributions
 * .overlay); idle state renders nothing so the overlay never blocks the chat.
 */
export function OverlayWorkspace({ localization }: { localization?: CardEditorLocalizationContext }) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [dispatchIds, setDispatchIds] = useState<string[] | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        { packageId?: string; action?: string; payload?: CardEditorOverlayPayload } | undefined;
      if (!detail || detail.packageId !== OVERLAY_PACKAGE_ID) return;
      if (detail.action === "close") {
        setOpen(false);
        return;
      }
      if (detail.action !== "open") return;
      const payload = detail.payload;
      setDetailId(typeof payload?.sessionId === "string" && payload.sessionId ? payload.sessionId : null);
      const ids = payload?.dispatch?.characterIds;
      setDispatchIds(
        Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string" && id.length > 0) : null,
      );
      setOpen(true);
    };
    window.addEventListener(OVERLAY_EVENT, handler);
    return () => window.removeEventListener(OVERLAY_EVENT, handler);
  }, []);

  // Escape closes the workspace itself; while the dispatch dialog is open it owns Escape.
  useEffect(() => {
    if (!open || dispatchIds !== null) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dispatchIds]);

  if (!open) return null;

  const onDispatched = (session: BulkSession) => {
    setDispatchIds(null);
    setDetailId(session.id);
  };

  return (
    <div className="ce-overlay ce-workspace-overlay">
      <div
        className="ce-dialog ce-workspace"
        role="dialog"
        aria-modal="true"
        aria-label={t("cardEditor.workspace.title")}
      >
        <div className="ce-dialog-head">
          <span>{t("cardEditor.workspace.title")}</span>
          <button
            type="button"
            className="ce-dialog-close"
            aria-label={t("cardEditor.workspace.close")}
            onClick={() => setOpen(false)}
          >
            <X className="ce-icon" aria-hidden="true" />
          </button>
        </div>
        <div className="ce-workspace-body">
          <RunsPanel localization={localization} splitView detailId={detailId} onDetailIdChange={setDetailId} />
        </div>
        {dispatchIds !== null && dispatchIds.length > 0 ? (
          <BulkDispatchDialog
            localization={localization}
            characterIds={dispatchIds}
            onClose={() => setDispatchIds(null)}
            onDispatched={onDispatched}
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * Agent-panel view: a compact status summary plus the workspace launcher. The full
 * runs/verdict review moved into the overlay workspace (capabilityApi 1.68).
 */
export function AgentPanelSummary({
  localization,
  agentName,
}: {
  localization?: CardEditorLocalizationContext;
  agentName?: string;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [sessions, setSessions] = useState<SessionIndexEntry[] | null>(null);

  const refresh = useCallback(() => {
    listSessions()
      .then((list) => setSessions(Array.isArray(list) ? list : []))
      .catch(() => setSessions([]));
  }, []);
  const pollRef = useVisiblePoll(refresh, 5000, true);

  const active = sessions?.filter((entry) => entry.status === "active").length ?? 0;
  const recent = sessions?.filter((entry) => entry.status !== "active").length ?? 0;

  return (
    <section
      className="ce-shell ce-panel"
      data-card-editor-view="agent-panel"
      ref={pollRef}
      aria-label={agentName ? t("cardEditor.panel.titleWithAgent", { agent: agentName }) : t("cardEditor.panel.title")}
    >
      <div className="ce-panel-head">
        <strong className="ce-panel-heading">{t("cardEditor.panel.title")}</strong>
      </div>
      <p className="ce-caption">{t("cardEditor.panel.summaryCounts", { active: active, recent: recent })}</p>
      <button type="button" className="mari-chrome-control" onClick={() => openCardEditorOverlay()}>
        {t("cardEditor.panel.openWorkspace")}
      </button>
    </section>
  );
}
