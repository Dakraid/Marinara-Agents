import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPokedexState } from "./api";
import { usePokedexTranslation } from "./localization";
import type { CapabilityProps } from "./types";

/** The engine's own tracker-panel toggle (rendered by RoleplayHUD while the panel is closed) and
 * the open panel's root. A capability package has no store access, so opening/focusing the engine
 * tracker panel goes through the same DOM affordances the engine itself exposes. */
const TRACKER_PANEL_TOGGLE_SELECTOR = '[data-tracker-panel-toggle="roleplay-hud"]';
const TRACKER_PANEL_ROOT_SELECTOR = '[data-component="TrackerDataSidebar"]';

function openTrackerPanel() {
  const toggle = document.querySelector<HTMLElement>(TRACKER_PANEL_TOGGLE_SELECTOR);
  if (toggle) {
    toggle.click();
    return;
  }
  // Toggle absent → the panel is already open (or unavailable); bring it into view and focus it.
  const panel = document.querySelector<HTMLElement>(TRACKER_PANEL_ROOT_SELECTOR);
  if (!panel) return;
  panel.scrollIntoView({ block: "nearest" });
  const focusTarget = panel.querySelector<HTMLElement>("button, [href], [tabindex]");
  focusTarget?.focus();
}

export function PokedexToolbar({ props }: { props: CapabilityProps }) {
  const { t } = usePokedexTranslation();
  const chatId = props.chatId ?? "";
  const enabled = props.chatMode === "roleplay" && Boolean(chatId);
  const [pulse, setPulse] = useState(false);
  const seenScanAt = useRef<string | null>(null);
  const state = useQuery({
    enabled,
    queryKey: ["pokedex", "state", chatId],
    queryFn: () => fetchPokedexState(chatId),
    refetchInterval: 2500,
  });
  const count = state.data ? Object.keys(state.data.dex).length : 0;
  const latestScanAt = state.data?.latestScan?.at ?? null;

  useEffect(() => {
    if (!latestScanAt) return;
    if (seenScanAt.current === null) {
      seenScanAt.current = latestScanAt;
      return;
    }
    if (seenScanAt.current === latestScanAt) return;
    seenScanAt.current = latestScanAt;
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 2600);
    return () => window.clearTimeout(timer);
  }, [latestScanAt]);

  if (!enabled) return null;
  return (
    <div className="pd-shell pd-toolbar">
      <button
        type="button"
        className={`${props.toolbarButtonClass ?? "mari-chrome-control mari-chrome-control--small pd-toolbar-button--fallback"} pd-toolbar-button${pulse ? " pd-toolbar-button--pulse" : ""}`}
        title={t("pokedex.toolbar.open")}
        aria-label={t("pokedex.toolbar.ariaLabel", { count })}
        onClick={openTrackerPanel}
      >
        <span className="pd-toolbar-label" aria-hidden="true">
          {t("pokedex.toolbar.label")}
        </span>
        {count > 0 ? (
          <span className="pd-toolbar-badge" aria-hidden="true">
            {count}
          </span>
        ) : null}
      </button>
    </div>
  );
}
