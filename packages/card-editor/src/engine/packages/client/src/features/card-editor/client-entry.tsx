import React, { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SquarePen, X } from "lucide-react";
import type { BulkSession } from "../../../../shared/src/features/agents/card-editor/schema.js";
import { BulkDispatchDialog } from "./BulkDispatchDialog";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import { RunsPanel } from "./RunsPanel";
import { CARD_EDITOR_STYLES } from "./styles";

type CapabilityProps = {
  packageId?: string;
  localization?: CardEditorLocalizationContext;
  selectedCharacterIds?: string[];
  selectionCount?: number;
  onRequestClose?: () => void;
  agent?: { id?: string };
  package?: { id?: string; name?: string; version?: string };
  onClose?: () => void;
};

type CardEditorElement = HTMLElement & {
  capabilityProps?: CapabilityProps;
  __root?: Root | null;
};

const DISPATCH_TOAST_MS = 12_000;

function SelectionActionView({ props }: { props: CapabilityProps }) {
  const t = (key: string, values?: Record<string, string | number>) =>
    translateCardEditor(props.localization, key, values);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<{ count: number } | null>(null);

  const selectedCharacterIds = props.selectedCharacterIds ?? [];
  const selectionCount = props.selectionCount ?? selectedCharacterIds.length ?? 0;
  const canDispatch = selectionCount >= 1;

  useEffect(() => {
    if (!sessionNotice) return undefined;
    const handle = setTimeout(() => setSessionNotice(null), DISPATCH_TOAST_MS);
    return () => clearTimeout(handle);
  }, [sessionNotice]);

  const onDispatched = (session: BulkSession) => {
    setDialogOpen(false);
    setSessionNotice({ count: session.items.length || selectedCharacterIds.length || selectionCount });
    // Engine contract (capabilityApi 1.67): exit the characters selection mode once the
    // dispatch is underway so the selection action bar collapses behind the notice.
    props.onRequestClose?.();
  };

  return (
    <>
      {sessionNotice ? (
        <div className="ce-shell ce-toast" role="status">
          <span>{t("cardEditor.selection.sessionStarted", { count: sessionNotice.count })}</span>
          <button
            type="button"
            className="ce-notice-close"
            aria-label={t("cardEditor.selection.noticeDismiss")}
            onClick={() => setSessionNotice(null)}
          >
            <X className="ce-icon" aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="mari-chrome-control ce-selection-button"
        disabled={!canDispatch}
        onClick={() => {
          setSessionNotice(null);
          setDialogOpen(true);
        }}
      >
        <SquarePen className="ce-icon" aria-hidden="true" />
        {t("cardEditor.action.open")}
      </button>
      {dialogOpen ? (
        <BulkDispatchDialog
          localization={props.localization}
          characterIds={selectedCharacterIds}
          onClose={() => setDialogOpen(false)}
          onDispatched={onDispatched}
        />
      ) : null}
    </>
  );
}

function CapabilityRoot({ element }: { element: CardEditorElement }) {
  const props = element.capabilityProps ?? {};
  const view = element.getAttribute("view");
  if (view === "selection-action") return <SelectionActionView props={props} />;
  if (view === "agent-panel") return <RunsPanel localization={props.localization} agentName={props.agent?.name} />;
  return null;
}

function CardEditorRoot({ element }: { element: CardEditorElement }) {
  const [, redraw] = useState(0);
  useEffect(() => {
    const update = () => redraw((value) => value + 1);
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);
  const direction = element.capabilityProps?.localization?.direction === "rtl" ? "rtl" : "ltr";
  return (
    <div dir={direction} style={{ display: "contents" }}>
      <style>{CARD_EDITOR_STYLES}</style>
      <CapabilityRoot element={element} />
    </div>
  );
}

class CardEditorCapabilityElement extends HTMLElement {
  __root: Root | null = null;
  capabilityProps?: CapabilityProps;

  static observedAttributes = ["view"];

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === "view" && oldValue !== newValue && this.__root) this.render();
  }

  render() {
    this.__root?.render(<CardEditorRoot element={this} />);
  }

  connectedCallback() {
    if (!this.__root) this.__root = createRoot(this);
    this.render();
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (!this.isConnected && this.__root) {
        this.__root.unmount();
        this.__root = null;
      }
    });
  }
}

const tag = "marinara-capability-card-editor";
if (!customElements.get(tag)) customElements.define(tag, CardEditorCapabilityElement);
