import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { BulkSession, SaveMode } from "../../../../shared/src/features/agents/card-editor/schema.js";
import { listSessions, type SessionIndexEntry } from "./api";
import { BulkDispatchDialog, type BulkDispatchPrefill } from "./BulkDispatchDialog";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import type { PromptPresetId } from "./presets";
import { useDialogFocusTrap } from "./dialog-controls";
import { RunsPanel } from "./RunsPanel";
import type { RunStage } from "./panel-status";
import { SessionDetail } from "./SessionDetail";
import { useVisiblePoll } from "./use-visible-poll";

/** Engine event bridge (capabilityApi 1.68): engine UI asks the package overlay to open/close. */
export const OVERLAY_EVENT = "marinara:capability-overlay";
export const OVERLAY_PACKAGE_ID = "card-editor";

export type CardEditorOverlayPayload = {
  sessionId?: string;
  dispatch?: { characterIds?: unknown; prefill?: unknown };
};

const PREFILL_PRESET_IDS = new Set([
  "standard",
  "strict",
  "rebalance",
  "xml-simple",
  "xml-complex",
  "custom",
  "transform",
]);
const PREFILL_FORMATS = new Set(["markdown", "xml", "json"]);
const PREFILL_SAVE_MODES = new Set(["confirm", "auto", "duplicate", "combined"]);

/**
 * The overlay payload crosses the engine↔package boundary (SPEC 2026-10-10 F5.2), so prefill
 * values are re-validated here: invalid enum values and non-string fields are dropped, and the
 * parse never throws — an unknown prefill simply leaves the dialog at its remembered defaults.
 */
export function parseDispatchPrefill(value: unknown): BulkDispatchPrefill | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const str = (key: string): string | undefined =>
    typeof source[key] === "string" ? (source[key] as string) : undefined;
  const presetId = str("presetId");
  const saveMode = str("saveMode");
  const prefill: BulkDispatchPrefill = {
    ...(presetId !== undefined && PREFILL_PRESET_IDS.has(presetId) ? { presetId: presetId as PromptPresetId } : {}),
    ...(str("globalInstruction") !== undefined ? { globalInstruction: str("globalInstruction") } : {}),
    ...(saveMode !== undefined && PREFILL_SAVE_MODES.has(saveMode) ? { saveMode: saveMode as SaveMode } : {}),
    ...(str("duplicatePrefix") !== undefined ? { duplicatePrefix: str("duplicatePrefix") } : {}),
    ...(str("combinedCardName") !== undefined ? { combinedCardName: str("combinedCardName") } : {}),
    ...(str("label") !== undefined ? { label: str("label") } : {}),
    ...(str("schemaId") !== undefined && /^[\w-]{1,80}$/.test(str("schemaId")!) ? { schemaId: str("schemaId") } : {}),
    ...(PREFILL_FORMATS.has(str("format") ?? "") ? { format: str("format") as "markdown" | "xml" | "json" } : {}),
  };
  return Object.keys(prefill).length > 0 ? prefill : undefined;
}

export function openCardEditorOverlay(payload?: CardEditorOverlayPayload) {
  window.dispatchEvent(
    new CustomEvent(OVERLAY_EVENT, {
      detail: { packageId: OVERLAY_PACKAGE_ID, action: "open", payload },
    }),
  );
}

type WorkspaceStage = "setup" | RunStage;
const STAGES: readonly WorkspaceStage[] = ["setup", "processing", "review", "finish"];
/** Inset from the editor body's edges, so the host chrome around it stays visible. */
const EDITOR_BODY_INSET = 16;

/** The editor body's box while it is big enough to host the workspace; null means use the viewport. */
function useEditorBodyBox(active: boolean) {
  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  useEffect(() => {
    if (!active) return undefined;
    const update = () => {
      const body = document.querySelector(".mari-editor-body");
      const rect = body?.getBoundingClientRect();
      const fits = rect && rect.width >= 640 && rect.height >= 420;
      setBox(
        fits
          ? {
              left: rect.left + EDITOR_BODY_INSET,
              top: rect.top + EDITOR_BODY_INSET,
              width: rect.width - EDITOR_BODY_INSET * 2,
              height: rect.height - EDITOR_BODY_INSET * 2,
            }
          : null,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    const body = document.querySelector(".mari-editor-body");
    if (body) observer.observe(body);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [active]);
  return box;
}

/**
 * The bulk workspace: one surface for setting up a run, watching it and reviewing every card,
 * laid over the editor body (or the viewport when no editor is open; a full sheet on phones).
 * The engine mounts it permanently (contributions.overlay); idle state renders nothing so the
 * overlay never blocks the chat.
 */
export function OverlayWorkspace({ localization }: { localization?: CardEditorLocalizationContext }) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  /** A run being set up: the library selection it starts from (possibly empty) and its prefill. */
  const [setup, setSetup] = useState<{ ids: string[]; prefill?: BulkDispatchPrefill; key: number } | null>(null);
  const [runInfo, setRunInfo] = useState<{ stage: RunStage; label: string } | null>(null);
  /** Phones show the rail or the main pane. */
  const [pane, setPane] = useState<"rail" | "main">("main");
  const box = useEditorBodyBox(open);
  const close = useCallback(() => setOpen(false), []);
  // Typing in a long field never loses it to Escape; everything else closes the workspace.
  const workspaceRef = useDialogFocusTrap(open, () => document.activeElement instanceof HTMLTextAreaElement, close);
  const onStage = useCallback((stage: RunStage, label: string) => setRunInfo({ stage, label }), []);

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
      const ids = payload?.dispatch?.characterIds;
      const dispatchIds = Array.isArray(ids)
        ? ids.filter((id): id is string => typeof id === "string" && id.length > 0)
        : null;
      const sessionId = typeof payload?.sessionId === "string" && payload.sessionId ? payload.sessionId : null;
      setDetailId(sessionId);
      setRunInfo(null);
      setSetup(
        dispatchIds && dispatchIds.length > 0
          ? { ids: dispatchIds, prefill: parseDispatchPrefill(payload?.dispatch?.prefill), key: Date.now() }
          : null,
      );
      setPane("main");
      setOpen(true);
    };
    window.addEventListener(OVERLAY_EVENT, handler);
    return () => window.removeEventListener(OVERLAY_EVENT, handler);
  }, []);

  if (!open) return null;

  const stage: WorkspaceStage | null = setup ? "setup" : detailId ? (runInfo?.stage ?? null) : null;
  const subtitle = setup
    ? t("cardEditor.workspace.newRunCount", { count: setup.ids.length })
    : detailId
      ? (runInfo?.label ?? "")
      : t("cardEditor.workspace.pickRun");
  const showMain = (id: string | null) => {
    setDetailId(id);
    setRunInfo(null);
    setSetup(null);
    setPane("main");
  };

  return (
    <div className="ce-overlay ce-workspace-overlay" role="presentation">
      <section
        ref={workspaceRef}
        className="ce-shell ce-workspace"
        role="dialog"
        aria-modal="true"
        aria-label={t("cardEditor.workspace.title")}
        tabIndex={-1}
        data-pane={pane}
        data-placement={box ? "editor" : "viewport"}
        style={box ?? undefined}
      >
        <header className="ce-workspace-head">
          <div className="ce-workspace-title">
            <strong>{t("cardEditor.workspace.title")}</strong>
            <span className="ce-caption">{subtitle}</span>
          </div>
          {stage ? (
            <ol className="ce-steps" aria-label={t("cardEditor.workspace.stages")}>
              {STAGES.map((name, index) => {
                const current = STAGES.indexOf(stage);
                const state = index < current ? "done" : index === current ? "current" : "todo";
                return (
                  <li
                    key={name}
                    className={`ce-step ce-step--${state}`}
                    aria-current={state === "current" ? "step" : undefined}
                  >
                    <span className="ce-step-dot" aria-hidden="true">
                      {state === "done" ? "✓" : index + 1}
                    </span>
                    {t(`cardEditor.workspace.stage.${name}`)}
                  </li>
                );
              })}
            </ol>
          ) : null}
          <button
            type="button"
            className="ce-dialog-close"
            aria-label={t("cardEditor.workspace.close")}
            onClick={close}
          >
            <X className="ce-icon" aria-hidden="true" />
          </button>
        </header>
        <div className="ce-workspace-switch" role="tablist" aria-label={t("cardEditor.workspace.title")}>
          <button type="button" role="tab" aria-selected={pane === "rail"} onClick={() => setPane("rail")}>
            {t("cardEditor.workspace.runs")}
          </button>
          <button type="button" role="tab" aria-selected={pane === "main"} onClick={() => setPane("main")}>
            {setup ? t("cardEditor.workspace.stage.setup") : t("cardEditor.workspace.run")}
          </button>
        </div>
        <div className="ce-workspace-body">
          <RunsPanel
            localization={localization}
            detailId={detailId}
            setupActive={setup !== null}
            onSelect={showMain}
            onNewRun={() => {
              setSetup({ ids: [], key: Date.now() });
              setPane("main");
            }}
          />
          <div className="ce-workspace-main">
            {setup ? (
              <BulkDispatchDialog
                key={setup.key}
                localization={localization}
                characterIds={setup.ids}
                prefill={setup.prefill}
                onClose={() => setSetup(null)}
                onDispatched={(session: BulkSession) => showMain(session.id)}
              />
            ) : detailId ? (
              <SessionDetail
                key={detailId}
                localization={localization}
                sessionId={detailId}
                onBack={() => setPane("rail")}
                onDeleted={() => showMain(null)}
                onRerun={showMain}
                onStage={onStage}
              />
            ) : (
              <div className="ce-workspace-empty">
                <p className="ce-caption">{t("cardEditor.workspace.pickRun")}</p>
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--primary"
                  onClick={() => setSetup({ ids: [], key: Date.now() })}
                >
                  {t("cardEditor.workspace.newRun")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
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
