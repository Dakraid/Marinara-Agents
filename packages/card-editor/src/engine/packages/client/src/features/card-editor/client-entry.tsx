import React, { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";

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

function BulkDispatchDialogPlaceholder({ props }: { props: CapabilityProps }) {
  const count = props.selectionCount ?? props.selectedCharacterIds?.length ?? 0;
  const t = (key: string, values?: Record<string, string | number>) =>
    translateCardEditor(props.localization, key, values);
  return (
    <div data-card-editor-view="selection-action" data-package-id={props.packageId ?? "card-editor"}>
      <button type="button">{t("cardEditor.title")}</button>
      <span>{t("cardEditor.dialog.placeholder", { count })}</span>
    </div>
  );
}

function RunsPanelPlaceholder({ props }: { props: CapabilityProps }) {
  const t = (key: string) => translateCardEditor(props.localization, key);
  return (
    <section data-card-editor-view="agent-panel" data-package-id={props.packageId ?? "card-editor"}>
      <h2>{t("cardEditor.title")}</h2>
      <p>{t("cardEditor.panel.empty")}</p>
    </section>
  );
}

function CapabilityRoot({ element }: { element: CardEditorElement }) {
  const props = element.capabilityProps ?? {};
  const view = element.getAttribute("view");
  if (view === "selection-action") return <BulkDispatchDialogPlaceholder props={props} />;
  if (view === "agent-panel") return <RunsPanelPlaceholder props={props} />;
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
