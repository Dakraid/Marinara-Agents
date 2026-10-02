import React, { useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PokedexLocalizationProvider, translatePokedex, usePokedexTranslation } from "./localization";
import { PokedexSettings } from "./PokedexSettings";
import { PokedexToolbar } from "./PokedexToolbar";
import { PokedexTrackerPanel } from "./PokedexTrackerPanel";
import { POKEDEX_STYLES } from "./styles";
import type { CapabilityElement } from "./types";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 1000 } },
});

class PokedexErrorBoundary extends React.Component<
  { element: CapabilityElement; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    const message =
      error.message || translatePokedex(this.props.element.capabilityProps?.localization, "pokedex.error.interface");
    this.props.element.capabilityRuntimeError = message;
    this.props.element.dispatchEvent(
      new CustomEvent("marinara-capability-runtime-error", { detail: { message }, bubbles: true }),
    );
    console.error("Pokédex client capability stopped", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <PokedexError
        onRetry={() => {
          this.props.element.capabilityRuntimeError = null;
          this.setState({ error: null });
        }}
      />
    );
  }
}

function PokedexError({ onRetry }: { onRetry: () => void }) {
  const { t } = usePokedexTranslation();
  return (
    <div className="pd-shell pd-panel pd-stack" role="alert">
      <strong>{t("pokedex.error.interface")}</strong>
      <button type="button" className="mari-chrome-control mari-chrome-control--small" onClick={onRetry}>
        {t("pokedex.error.retry")}
      </button>
    </div>
  );
}

function CapabilityRoot({ element }: { element: CapabilityElement }) {
  const props = element.capabilityProps ?? {};
  const view = element.getAttribute("view");
  if (view === "settings") return <PokedexSettings props={props} />;
  if (view === "toolbar") return <PokedexToolbar props={props} />;
  if (view === "tracker") return <PokedexTrackerPanel props={props} />;
  return null;
}

function LocalizedRoot({ element }: { element: CapabilityElement }) {
  const [, redraw] = useState(0);
  useEffect(() => {
    const update = () => redraw((value) => value + 1);
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);
  return (
    <PokedexLocalizationProvider localization={element.capabilityProps?.localization}>
      <style>{POKEDEX_STYLES}</style>
      <PokedexErrorBoundary element={element}>
        <CapabilityRoot element={element} />
      </PokedexErrorBoundary>
    </PokedexLocalizationProvider>
  );
}

class PokedexElement extends HTMLElement {
  __root: ReturnType<typeof createRoot> | null = null;
  capabilityProps?: CapabilityElement["capabilityProps"];
  capabilityRuntimeError?: string | null;

  static observedAttributes = ["view"];

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === "view" && oldValue !== newValue && this.__root) this.render();
  }

  render() {
    this.__root?.render(
      <QueryClientProvider client={queryClient}>
        <LocalizedRoot element={this} />
      </QueryClientProvider>,
    );
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

const tag = "marinara-capability-pokedex";
if (!customElements.get(tag)) customElements.define(tag, PokedexElement);
