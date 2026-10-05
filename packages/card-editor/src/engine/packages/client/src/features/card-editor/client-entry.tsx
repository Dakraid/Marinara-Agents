import React, { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SquarePen } from "lucide-react";
import { AgentPanelSummary, openCardEditorOverlay, OverlayWorkspace } from "./OverlayWorkspace";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
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

function SelectionActionView({ props }: { props: CapabilityProps }) {
  const t = (key: string, values?: Record<string, string | number>) =>
    translateCardEditor(props.localization, key, values);

  const selectedCharacterIds = props.selectedCharacterIds ?? [];
  const selectionCount = props.selectionCount ?? selectedCharacterIds.length ?? 0;
  const canDispatch = selectionCount >= 1;

  return (
    <button
      type="button"
      className="mari-chrome-control ce-selection-button"
      disabled={!canDispatch}
      onClick={() => {
        // capabilityApi 1.68: the overlay workspace hosts the whole bulk flow;
        // open it with the dispatch step prefilled and exit selection mode.
        openCardEditorOverlay({ dispatch: { characterIds: selectedCharacterIds } });
        props.onRequestClose?.();
      }}
    >
      <SquarePen className="ce-icon" aria-hidden="true" />
      {t("cardEditor.action.open")}
    </button>
  );
}

function CapabilityRoot({ element }: { element: CardEditorElement }) {
  const props = element.capabilityProps ?? {};
  const view = element.getAttribute("view");
  if (view === "selection-action") return <SelectionActionView props={props} />;
  if (view === "agent-panel")
    return <AgentPanelSummary localization={props.localization} agentName={props.agent?.name} />;
  if (view === "overlay") return <OverlayWorkspace localization={props.localization} />;
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
