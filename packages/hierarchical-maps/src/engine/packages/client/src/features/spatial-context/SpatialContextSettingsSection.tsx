import { useState, type CSSProperties } from "react";
import { AlertTriangle, ChevronRight, MapPin } from "lucide-react";
import {
  parseAgentSettings,
  useSpatialAgentConfiguration,
  useSpatialContext,
  useUpdateSpatialAgentConfiguration,
} from "../../hooks/use-spatial-context";
import { useSpatialMapTranslation } from "./localization";

const MOVEMENT_ASSESSMENT_SETTING_KEYS = [
  "assessImpliedMovement",
  "assessmentDiscovery",
  "assessmentPersistTravel",
] as const;
type MovementAssessmentSettingKey = (typeof MOVEMENT_ASSESSMENT_SETTING_KEYS)[number];

interface SpatialContextSettingsSectionProps {
  chatId: string;
  style?: CSSProperties;
  enabledForChat: boolean;
  onEnabledForChatChange?: (enabled: boolean) => void | Promise<void>;
  onOpenEditor: () => void;
}

export function SpatialContextSettingsSection({
  chatId,
  style,
  enabledForChat,
  onEnabledForChatChange,
  onOpenEditor,
}: SpatialContextSettingsSectionProps) {
  const spatial = useSpatialContext(chatId);
  const { t } = useSpatialMapTranslation();
  const agentConfiguration = useSpatialAgentConfiguration();
  const updateAgentConfiguration = useUpdateSpatialAgentConfiguration();
  const [assessmentSavingKey, setAssessmentSavingKey] = useState<MovementAssessmentSettingKey | null>(null);
  const [assessmentOptimistic, setAssessmentOptimistic] = useState<{
    key: MovementAssessmentSettingKey;
    value: boolean;
  } | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [activationPending, setActivationPending] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const definition = spatial.data?.definition ?? null;
  const activeCount = definition?.locations.filter((location) => location.status === "active").length ?? 0;
  const archivedCount = definition?.locations.filter((location) => location.status === "archived").length ?? 0;
  const breadcrumb = spatial.data?.breadcrumb.map((item) => item.name).join(" / ") ?? "";
  const toggleForChat = async () => {
    if (!onEnabledForChatChange || activationPending) return;
    setActivationPending(true);
    setActivationError(null);
    try {
      await onEnabledForChatChange(!enabledForChat);
    } catch (error) {
      setActivationError(error instanceof Error ? error.message : "World Maps could not be updated for this chat.");
    } finally {
      setActivationPending(false);
    }
  };

  const configuration = agentConfiguration.data ?? null;
  const agentSettings = parseAgentSettings(configuration?.settings);
  const movementAssessmentValue = (key: MovementAssessmentSettingKey) =>
    assessmentOptimistic?.key === key ? assessmentOptimistic.value : agentSettings[key] !== false;
  const movementAssessmentDisabled =
    !configuration || assessmentSavingKey !== null || updateAgentConfiguration.isPending;

  const toggleMovementAssessment = async (key: MovementAssessmentSettingKey) => {
    if (!configuration || movementAssessmentDisabled) return;
    const next = !movementAssessmentValue(key);
    setAssessmentOptimistic({ key, value: next });
    setAssessmentSavingKey(key);
    setAssessmentError(null);
    try {
      await updateAgentConfiguration.mutateAsync({
        description: configuration.description,
        phase: "pre_generation",
        connectionId: configuration.connectionId,
        settings: {
          author:
            typeof agentSettings.author === "string" && agentSettings.author.trim()
              ? agentSettings.author
              : "Pasta Devs",
          [key]: next,
        },
      });
    } catch (error) {
      setAssessmentError(
        error instanceof Error ? error.message : t("ui.worldMaps.settings.movementAssessment.saveError"),
      );
    } finally {
      setAssessmentOptimistic(null);
      setAssessmentSavingKey(null);
    }
  };

  return (
    <div className="px-3 py-3" style={style}>
      <div className="mb-3 space-y-2">
        <button
          type="button"
          role="switch"
          aria-checked={enabledForChat}
          disabled={!onEnabledForChatChange || activationPending}
          onClick={() => void toggleForChat()}
          className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60 ${
            enabledForChat
              ? "bg-[var(--primary)]/10 ring-[var(--primary)]/30"
              : "bg-[var(--secondary)] ring-[var(--border)] hover:bg-[var(--accent)]"
          }`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-[var(--foreground)]">Enable World Maps</span>
            <span className="mt-0.5 block text-[0.625rem] leading-relaxed text-[var(--marinara-chat-chrome-accent)]">
              {enabledForChat
                ? "World Maps can provide location context during generation."
                : "Turn on Maps here before creating or editing this chat's map."}
            </span>
          </span>
          <span
            aria-hidden="true"
            data-settings-switch-track
            className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
              enabledForChat ? "bg-[var(--primary)]/70 mari-accent-animated" : "bg-[var(--border)]"
            }`}
          >
            <span
              data-settings-switch-thumb
              className={`pointer-events-none block h-4 w-4 shrink-0 rounded-full bg-[var(--background)] shadow-sm ring-1 ring-[var(--border)] transition-transform ${
                enabledForChat ? "translate-x-4" : ""
              }`}
            />
          </span>
        </button>
        {activationPending && (
          <p
            role="status"
            aria-live="polite"
            className="px-1 text-[0.625rem] text-[var(--marinara-chat-chrome-accent)]"
          >
            Updating World Maps…
          </p>
        )}
        {activationError && (
          <p
            role="alert"
            className="rounded-lg bg-[var(--destructive)]/10 px-3 py-2 text-[0.6875rem] text-[var(--destructive)]"
          >
            {activationError}
          </p>
        )}
      </div>
      <div className="mb-3 space-y-2 border-t border-[var(--border)] pt-3" data-settings-group="movement-assessment">
        <h4 className="px-1 text-[0.6875rem] font-semibold text-[var(--foreground)]">
          {t("ui.worldMaps.settings.movementAssessment.heading")}
        </h4>
        {MOVEMENT_ASSESSMENT_SETTING_KEYS.map((key) => {
          const checked = movementAssessmentValue(key);
          return (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={checked}
              data-settings-key={key}
              disabled={movementAssessmentDisabled}
              onClick={() => void toggleMovementAssessment(key)}
              className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60 ${
                checked
                  ? "bg-[var(--primary)]/10 ring-[var(--primary)]/30"
                  : "bg-[var(--secondary)] ring-[var(--border)] hover:bg-[var(--accent)]"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-[var(--foreground)]">
                  {t(`ui.worldMaps.settings.movementAssessment.${key}.label`)}
                </span>
                <span className="mt-0.5 block text-[0.625rem] leading-relaxed text-[var(--marinara-chat-chrome-accent)]">
                  {t(`ui.worldMaps.settings.movementAssessment.${key}.description`)}
                </span>
              </span>
              <span
                aria-hidden="true"
                data-settings-switch-track
                className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  checked ? "bg-[var(--primary)]/70 mari-accent-animated" : "bg-[var(--border)]"
                }`}
              >
                <span
                  data-settings-switch-thumb
                  className={`pointer-events-none block h-4 w-4 shrink-0 rounded-full bg-[var(--background)] shadow-sm ring-1 ring-[var(--border)] transition-transform ${
                    checked ? "translate-x-4" : ""
                  }`}
                />
              </span>
            </button>
          );
        })}
        {assessmentSavingKey && (
          <p
            role="status"
            aria-live="polite"
            className="px-1 text-[0.625rem] text-[var(--marinara-chat-chrome-accent)]"
          >
            {t("ui.worldMaps.settings.movementAssessment.saving")}
          </p>
        )}
        {assessmentError && (
          <p
            role="alert"
            className="rounded-lg bg-[var(--destructive)]/10 px-3 py-2 text-[0.6875rem] text-[var(--destructive)]"
          >
            {assessmentError}
          </p>
        )}
      </div>
      {!enabledForChat ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--secondary)]/35 px-3 py-4 text-center">
          <p className="text-xs font-medium text-[var(--foreground)]">Maps is ready to add</p>
          <p className="mt-1 text-[0.625rem] leading-relaxed text-[var(--marinara-chat-chrome-accent)]">
            Turn on “Enable World Maps” above to create a map or return to an existing one.
          </p>
        </div>
      ) : spatial.isLoading ? (
        <div className="space-y-2" aria-label="Loading world map summary">
          <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--muted)]" />
          <div className="h-12 animate-pulse rounded-lg bg-[var(--muted)]" />
        </div>
      ) : spatial.isError ? (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-300" role="alert">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size="0.8125rem" /> Map summary unavailable
          </div>
          <p className="mt-1 text-red-300/80">Open the editor to retry loading this chat&apos;s map.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/40 p-3">
            <MapPin size="0.875rem" className="mt-0.5 shrink-0 text-[var(--marinara-chat-chrome-accent)]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium">
                  {!definition ? "Not set up" : definition.enabled ? "Map enabled" : "Map disabled"}
                </span>
                {definition && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.625rem] font-medium ${
                      definition.enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"
                    }`}
                  >
                    {definition.enabled ? "Active" : "Off"}
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-[0.6875rem] text-[var(--marinara-chat-chrome-accent)]">
                {breadcrumb || (activeCount > 0 ? "No current location" : "Create a starting location")}
              </p>
              <p className="mt-1 text-[0.625rem] text-[var(--marinara-chat-chrome-accent)]">
                {activeCount} active{archivedCount > 0 ? `, ${archivedCount} archived` : ""}
              </p>
            </div>
          </div>
          {(spatial.data?.warnings.length ?? 0) > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[0.6875rem] text-amber-400">
              <AlertTriangle size="0.75rem" className="mt-0.5 shrink-0" />
              <span>{spatial.data!.warnings.length} map issue(s) need review.</span>
            </div>
          )}
          <button
            type="button"
            onClick={onOpenEditor}
            className="flex min-h-11 w-full items-center justify-between rounded-lg border border-[var(--border)] px-3 text-xs font-medium transition-colors duration-200 hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {definition ? "Edit world map" : "Set up world map"}
            <ChevronRight size="0.8125rem" />
          </button>
        </div>
      )}
    </div>
  );
}
