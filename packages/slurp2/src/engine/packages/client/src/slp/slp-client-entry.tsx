import { Component, useEffect, useState, type CSSProperties, type ErrorInfo, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18next from "i18next";
import { Toaster } from "sonner";
import { I18nextProvider, initReactI18next } from "react-i18next";
import english from "./locales/en.json";
import german from "./locales/de.json";
import korean from "./locales/ko.json";
import polish from "./locales/pl.json";
import { SlpApp } from "./app/SlpApp";
import { ApiError } from "../lib/api-client";
import { useSlurpUIStore } from "./base/state/slp-package-store";
import { configureSlurpPackageState } from "./base/state/slp-package-store";
import { ModalPortalContext } from "../components/ui/Modal";
import { AppDialogRenderer } from "../components/ui/AppDialogRenderer";
import { SLP_SPARKLE_STYLES } from "./modules/sparkle/slp-sparkle-styles";
import { BOTTOM_SAFE_INSET, getSlpAccentStyle, SLP_PINK, SlpAccentContext } from "./base/chrome/SlpChrome";
import { SlpErrorState } from "./modules/chrome/SlpStateKit";

const SLURP_ELEMENT_TAG = "marinara-capability-slurp2";
const SLURP_STYLE_ID = "marinara-capability-slurp2-styles";
// An Engine restart drops every request for a few seconds. With no retry, one poll landing in that
// window left the Hub on "Slurp could not be loaded." Network failures and 5xx retry with backoff
// (about 30s in total); a 4xx is a real answer and fails at once.
const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failures, error) => failures < 5 && !(error instanceof ApiError && error.status < 500),
    },
  },
});
const localization = i18next.createInstance();

void localization.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  lng: "en",
  resources: {
    de: { translation: german },
    en: { translation: english },
    ko: { translation: korean },
    pl: { translation: polish },
  },
});

type CapabilityElement = HTMLElement & {
  capabilityProps?: Record<string, unknown>;
  __root?: Root | null;
  __portal?: HTMLDivElement | null;
};

let slurpPackageStyles = "";

/**
 * With accent animation on, the Engine repaints every `svg` inside a chrome token scope to the
 * chrome accent colour. Slurp's shell is such a scope, so an icon on an accent-filled button was
 * painted accent-on-accent and vanished, leaving the gap its label was spaced for. Icons here
 * follow their own button's text colour instead.
 */
const SLURP_ICON_COLOR_FIX =
  "[data-marinara-accent-animation] .mari-chrome-token-scope svg:not(.mari-rgb-static-icon){color:inherit;stroke:currentColor;}" +
  // Icons on photos and scrims (carousel arrows, lock badges) sit in a `text-white` control. The
  // shell paints every icon in the pink ink, which is dark plum in light mode, so these follow
  // their control's white instead.
  ':is(marinara-capability-slurp2,[data-marinara-capability-scope="slurp2"]) .text-white svg:not([class*="text-"]){color:inherit;}';

// Scoped to Slurp's own toaster: the Engine's toaster lives in the same document.
const SLURP_TOAST_STYLES = `
  [data-slp-toaster] [data-sonner-toaster] {
    --width: min(380px, calc(100vw - 32px));
    z-index: 100;
    /* Sonner sets its own system font stack; Slurp toasts use the Engine font like the rest of Slurp. */
    font-family: inherit;
  }
  [data-sonner-toast].slp-toast {
    width: var(--width);
    min-height: 52px;
    padding: 12px 14px;
    border: 1px solid color-mix(in srgb, var(--slurp-outline, currentColor) 72%, transparent);
    border-radius: 16px;
    background: var(--slurp-surface-raised, var(--background));
    color: var(--slurp-text, var(--foreground));
    box-shadow: var(--slp-toast-bar, 0 0 #0000), 0 16px 40px color-mix(in srgb, #000 24%, transparent), 0 0 0 1px color-mix(in srgb, #fff 5%, transparent) inset;
    backdrop-filter: blur(16px);
  }
  [data-sonner-toast].slp-toast [data-title] { font-weight: 700; line-height: 1.25; }
  [data-sonner-toast].slp-toast [data-description] { color: var(--slurp-muted, var(--muted-foreground)); line-height: 1.35; }
  [data-sonner-toast].slp-toast [data-button] {
    border-radius: 999px;
    background: var(--noodle-accent, var(--slurp-accent, currentColor));
    color: var(--slurp-on-accent, var(--slurp-surface, var(--background)));
    font-weight: 700;
  }
  /* Token accents instead of Sonner's rich colours: a 3 px bar on the start edge and a tinted icon.
     Success is the good moment, so it gets the pink bar and a soft pink glint from the left. */
  [data-sonner-toast].slp-toast[data-type="success"] {
    --slp-toast-bar: inset 3px 0 0 var(--noodle-accent);
    background: linear-gradient(90deg, color-mix(in srgb, var(--noodle-accent) 16%, var(--slurp-surface-raised)), var(--slurp-surface-raised) 45%);
  }
  [data-sonner-toast].slp-toast[data-type="success"] [data-icon] { color: var(--slurp-ink); }
  [data-sonner-toast].slp-toast[data-type="error"] { --slp-toast-bar: inset 3px 0 0 var(--slurp-danger); }
  [data-sonner-toast].slp-toast[data-type="error"] [data-icon] { color: var(--slurp-danger); }
  [data-sonner-toast].slp-toast[data-type="warning"] { --slp-toast-bar: inset 3px 0 0 var(--slurp-warning); }
  [data-sonner-toast].slp-toast[data-type="warning"] [data-icon] { color: var(--slurp-warning); }
  [data-sonner-toast].slp-toast[data-type="info"] { --slp-toast-bar: inset 3px 0 0 var(--slurp-violet); }
  [data-sonner-toast].slp-toast[data-type="info"] [data-icon] { color: var(--slurp-violet); }
  /* Below 1024 px the floating nav owns the bottom edge: bottom toasts sit above it
     (56 px pill + 10 px gap + 10 px air), above the home indicator on iOS. */
  @media (max-width: 1023px) {
    [data-slp-toaster] [data-sonner-toaster][data-y-position="bottom"] {
      bottom: calc(76px + var(--slurp-bottom-safe-inset, 0px)) !important;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-sonner-toast].slp-toast { transition: none; }
  }
`;

function syncSlurpPackageStyles() {
  const existing = document.getElementById(SLURP_STYLE_ID);
  if (!document.querySelector(SLURP_ELEMENT_TAG) || !slurpPackageStyles) {
    existing?.remove();
    return;
  }

  const style = existing ?? document.createElement("style");
  style.id = SLURP_STYLE_ID;
  style.textContent = `${slurpPackageStyles}\n${SLURP_ICON_COLOR_FIX}\n${SLURP_TOAST_STYLES}\n${SLP_SPARKLE_STYLES}`;
  if (!existing) document.head.appendChild(style);
}

/** Supplies the package-scoped stylesheet generated by the catalog build. */
export function setSlurpPackageStyles(styleText: string) {
  slurpPackageStyles = styleText;
  syncSlurpPackageStyles();
}

function requestedLanguage(element: CapabilityElement) {
  const localizationContext = element.capabilityProps?.localization;
  if (!localizationContext || typeof localizationContext !== "object" || Array.isArray(localizationContext)) {
    return "en";
  }

  const locale = (localizationContext as Record<string, unknown>).locale;
  return typeof locale === "string" ? locale.split("-")[0] : "en";
}

/**
 * Without this, any render throw tears down the whole React root and leaves an empty panel next to
 * the Engine chrome, with nothing in the bug report to explain it.
 */
class SlurpErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[slurp2] render failed", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <SlpAccentContext.Provider value={SLP_PINK}>
        <div
          className="flex h-full flex-col items-center justify-center overflow-y-auto"
          style={getSlpAccentStyle(SLP_PINK)}
        >
          <SlpErrorState
            title={localization.t("ui.slurp.crash.title")}
            detail={localization.t("ui.slurp.crash.body")}
            onRetry={() => this.setState({ error: null })}
          />
          {/* The raw message helps a bug report but is not for reading, so it waits behind a disclosure. */}
          <details className="-mt-4 max-w-sm px-8 pb-8 text-center text-xs text-[var(--slurp-muted)]">
            <summary className="cursor-pointer">
              {localization.t("ui.slurp.crash.details", { defaultValue: "Show details" })}
            </summary>
            <pre className="mt-2 max-w-full overflow-auto whitespace-pre-wrap text-start">{error.message}</pre>
          </details>
        </div>
      </SlpAccentContext.Provider>
    );
  }
}

/**
 * The Engine's toast position ("top" | "bottom") from its persisted UI settings; read only, never written.
 * Engines older than the setting do not store it and always show toasts at the top, which is the default here.
 */
function engineToastPosition(): "top" | "bottom" {
  try {
    const stored = JSON.parse(localStorage.getItem("marinara-engine-ui") ?? "null") as {
      state?: { notificationPosition?: unknown };
    } | null;
    return stored?.state?.notificationPosition === "bottom" ? "bottom" : "top";
  } catch {
    return "top";
  }
}

const engineTheme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

/**
 * Slurp's toaster, placed and themed like the Engine's (App.tsx), so a Slurp toast shows where the
 * user put their notifications. ponytail: the position is read from the Engine's persisted settings
 * when Slurp mounts, so a change made while Slurp is open applies on the next open; a host
 * capability prop would make it live.
 */
function SlpToaster() {
  const [position] = useState(engineToastPosition);
  const [theme, setTheme] = useState(engineTheme);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(engineTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return (
    <div
      data-slp-toaster=""
      className="contents"
      style={getSlpAccentStyle(SLP_PINK, { "--slurp-bottom-safe-inset": BOTTOM_SAFE_INSET } as CSSProperties)}
    >
      <Toaster
        position={position === "bottom" ? "bottom-center" : "top-center"}
        swipeDirections={["left", "right", position]}
        offset="4rem"
        theme={theme}
        closeButton
        toastOptions={{
          duration: 4000,
          classNames: { toast: "slp-toast" },
        }}
      />
    </div>
  );
}

function SlurpPackageRoot({ element }: { element: CapabilityElement }) {
  const [revision, redraw] = useState(0);
  const navigation = useSlurpUIStore((state) => state.navigation);
  const setNavigation = useSlurpUIStore((state) => state.setNavigation);
  const close = element.capabilityProps?.onClose;
  const onLeave = typeof close === "function" ? () => close() : undefined;

  useEffect(() => {
    // The host re-dispatches this event whenever capabilityProps change, so the store has to be
    // reconfigured as well. Redrawing alone left debugMode and reviewImagePromptsBeforeSend stuck
    // on their mount-time values until the tab was remounted.
    const update = () => {
      configureSlurpPackageState(element.capabilityProps ?? {});
      redraw((value) => value + 1);
    };
    configureSlurpPackageState(element.capabilityProps ?? {});
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);

  useEffect(() => {
    const language = requestedLanguage(element);
    const supportedLanguages = new Set(Object.keys(localization.options.resources ?? {}));
    void localization.changeLanguage(supportedLanguages.has(language) ? language : "en");
  }, [element, revision]);

  return (
    <I18nextProvider i18n={localization}>
      <QueryClientProvider client={client}>
        <ModalPortalContext.Provider value={element.__portal ?? element}>
          <div
            className="h-full min-h-0 overflow-hidden bg-[var(--background)] text-[var(--foreground)]"
            // Screens outside the Slurp shell (Backstage panels) still paint text on pink fills.
            style={{ "--slurp-on-accent": "#2a0a1b" } as CSSProperties}
          >
            <SlurpErrorBoundary>
              <SlpApp navigation={navigation} onNavigate={setNavigation} onLeave={onLeave} />
              <AppDialogRenderer />
              <SlpToaster />
            </SlurpErrorBoundary>
          </div>
        </ModalPortalContext.Provider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

class MarinaraSlurpElement extends HTMLElement {
  declare __root: Root | null;
  declare __portal: HTMLDivElement | null;

  connectedCallback() {
    syncSlurpPackageStyles();
    if (!this.__portal) {
      this.__portal = document.createElement("div");
      this.__portal.dataset.marinaraCapabilityScope = "slurp2";
      this.__portal.classList.add("mari-chrome-token-scope", "noodle-icon-scope");
      Object.assign(this.__portal.style, {
        inset: "0",
        pointerEvents: "none",
        position: "fixed",
        zIndex: "2147483000",
      });
      this.__portal.style.setProperty("--accent", "rgba(255, 126, 193, 0.14)");
      this.__portal.style.setProperty("--background", "#17121b");
      this.__portal.style.setProperty("--border", "rgba(255, 255, 255, 0.18)");
      this.__portal.style.setProperty("--foreground", "#fff7fc");
      this.__portal.style.setProperty("--muted-foreground", "#d8c9d4");
      this.__portal.style.setProperty("--noodle-accent", "#ff7ec1");
      // Pink ink (text/icons) on this dark portal; text *on* a pink fill uses --slurp-on-accent.
      this.__portal.style.setProperty("--noodle-accent-foreground", "#ff9bd0");
      this.__portal.style.setProperty("--slurp-on-accent", "#2a0a1b");
      document.body.appendChild(this.__portal);
    }
    this.__root ??= createRoot(this);
    this.__root.render(<SlurpPackageRoot element={this} />);
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (!this.isConnected && this.__root) {
        this.__root.unmount();
        this.__root = null;
      }
      if (!this.isConnected && this.__portal) {
        this.__portal.remove();
        this.__portal = null;
      }
      syncSlurpPackageStyles();
    });
  }
}

if (!customElements.get(SLURP_ELEMENT_TAG)) {
  customElements.define(SLURP_ELEMENT_TAG, MarinaraSlurpElement);
}
