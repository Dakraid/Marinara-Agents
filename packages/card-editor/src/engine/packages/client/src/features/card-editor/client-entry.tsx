import React, { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";

type CapabilityProps = {
  selectedCharacterIds?: string[];
  selectionCount?: number;
  agent?: { id?: string };
};

type CardEditorElement = HTMLElement & {
  capabilityProps?: CapabilityProps;
  __root?: Root | null;
};

function CapabilityRoot({ element }: { element: CardEditorElement }) {
  const props = element.capabilityProps ?? {};
  const view = element.getAttribute("view");
  if (view === "selection-action") {
    const selectionCount = props.selectionCount ?? props.selectedCharacterIds?.length ?? 0;
    return <div data-card-editor-view="selection-action" data-selection-count={selectionCount} />;
  }
  if (view === "agent-panel") {
    return <div data-card-editor-view="agent-panel" data-agent-id={props.agent?.id ?? ""} />;
  }
  return null;
}

function CardEditorRoot({ element }: { element: CardEditorElement }) {
  const [, redraw] = useState(0);
  useEffect(() => {
    const update = () => redraw((value) => value + 1);
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);
  return <CapabilityRoot element={element} />;
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
