import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPokedexState, patchPokedexSettings } from "./api";
import { usePokedexTranslation } from "./localization";
import { POKEDEX_DEFAULTS, type CapabilityProps, type PokedexSettings } from "./types";

const TOGGLE_FIELDS = [
  { key: "autoScan", label: "pokedex.settings.autoScan", help: "pokedex.settings.autoScanHelp" },
  {
    key: "injectTrackerContext",
    label: "pokedex.settings.injectTrackerContext",
    help: "pokedex.settings.injectTrackerContextHelp",
  },
  { key: "renderScanCards", label: "pokedex.settings.renderScanCards", help: "pokedex.settings.renderScanCardsHelp" },
] as const;

const MAX_RECENT_ENCOUNTERS_MIN = 3;
const MAX_RECENT_ENCOUNTERS_MAX = 25;

function clampSettings(settings: PokedexSettings): PokedexSettings {
  return {
    ...settings,
    maxRecentEncounters: Math.min(
      MAX_RECENT_ENCOUNTERS_MAX,
      Math.max(
        MAX_RECENT_ENCOUNTERS_MIN,
        Math.trunc(settings.maxRecentEncounters) || POKEDEX_DEFAULTS.maxRecentEncounters,
      ),
    ),
  };
}

export function PokedexSettings({ props }: { props: CapabilityProps }) {
  const { t } = usePokedexTranslation();
  const { onDirtyChange } = props;
  const chatId = props.chatId ?? "";
  const [settings, setSettings] = useState<PokedexSettings>({ ...POKEDEX_DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const hydratedChatId = useRef<string | null>(null);
  const settingsRef = useRef<PokedexSettings>({ ...POKEDEX_DEFAULTS });
  const editVersion = useRef(0);
  const state = useQuery({
    enabled: Boolean(chatId),
    queryKey: ["pokedex", "state", chatId],
    queryFn: () => fetchPokedexState(chatId),
  });

  useEffect(() => {
    if (!state.data || hydratedChatId.current === chatId) return;
    hydratedChatId.current = chatId;
    settingsRef.current = state.data.settings;
    editVersion.current = 0;
    setSettings(state.data.settings);
    onDirtyChange?.(false);
  }, [chatId, onDirtyChange, state.data]);

  const updateSettings = (patch: Partial<PokedexSettings>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    editVersion.current += 1;
    setSettings(next);
    setMessage("");
    onDirtyChange?.(true);
  };

  useEffect(() => {
    if (!chatId || hydratedChatId.current !== chatId || editVersion.current === 0) return;
    const version = editVersion.current;
    const timer = window.setTimeout(() => {
      const nextSettings = clampSettings(settingsRef.current);
      settingsRef.current = nextSettings;
      setSettings(nextSettings);
      setSaving(true);
      patchPokedexSettings(chatId, nextSettings)
        .then((saved) => {
          if (hydratedChatId.current === chatId && editVersion.current === version) {
            const savedSettings = saved.settings ?? nextSettings;
            settingsRef.current = savedSettings;
            editVersion.current = 0;
            setSettings(savedSettings);
            onDirtyChange?.(false);
          }
        })
        .catch((error) => setMessage(error instanceof Error ? error.message : String(error)))
        .finally(() => setSaving(false));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [chatId, onDirtyChange, settings]);

  if (!chatId || props.chatMode !== "roleplay") {
    return <div className="pd-shell pd-status">{t("pokedex.error.noChat")}</div>;
  }

  return (
    <section className="pd-shell pd-stack">
      {TOGGLE_FIELDS.map((field) => (
        <label className="pd-check" key={field.key}>
          <input
            type="checkbox"
            checked={settings[field.key]}
            disabled={saving}
            onChange={(event) => updateSettings({ [field.key]: event.target.checked } as Partial<PokedexSettings>)}
          />
          <span className="pd-check-copy">
            <strong>{t(field.label)}</strong>
            <small>{t(field.help)}</small>
          </span>
        </label>
      ))}
      <label className="pd-number-field">
        <span className="pd-number-copy">
          <strong>{t("pokedex.settings.maxRecentEncounters")}</strong>
          <small>{t("pokedex.settings.maxRecentEncountersHelp")}</small>
        </span>
        <input
          className="mari-chrome-field pd-field pd-number-input"
          type="number"
          min={MAX_RECENT_ENCOUNTERS_MIN}
          max={MAX_RECENT_ENCOUNTERS_MAX}
          step={1}
          disabled={saving}
          value={settings.maxRecentEncounters}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            if (Number.isFinite(parsed)) updateSettings({ maxRecentEncounters: parsed });
          }}
          onBlur={() => updateSettings({ maxRecentEncounters: clampSettings(settingsRef.current).maxRecentEncounters })}
        />
      </label>
      {message ? (
        <div className="pd-status" role="status">
          {message}
        </div>
      ) : null}
    </section>
  );
}
