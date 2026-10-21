import { useEffect, useRef, useState } from "react";
import type {
  BulkSession,
  CompletionMode,
  SaveMode,
} from "../../../../shared/src/features/agents/card-editor/schema.js";
import { computeDuplicateName } from "../../../../shared/src/features/agents/card-editor/text.ts";
import type { CardOutputFormat, CardSchema } from "../../../../shared/src/features/agents/card-editor/card-schema.ts";
import {
  behaviorCardMaterial,
  createSession,
  getAgentStructuredOutput,
  getBulkSettings,
  getHostCharacter,
  getHostCharacterCard,
  getHostLorebookEntries,
  listHostLorebooks,
  listCardSchemas,
  listLanguageConnections,
  type BulkSettings,
  type HostLorebook,
  type LanguageConnection,
} from "./api";
import { BehaviorCharacterSelect } from "./BehaviorCharacterSelect";
import { NumberField, RadioChoice, safeLocalStorage, WorkspacePane } from "./dialog-controls";
import { DialogTargets, type DialogTarget } from "./DialogTargets";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import { isBundledPromptPreset, PROMPT_PRESET_TEMPLATES, type PromptPresetId } from "./presets";
import { SchemaStudio } from "./SchemaStudio";
import {
  clearBulkDraft,
  deleteBulkPreset,
  estimateBulkCalls,
  loadBulkDraft,
  loadBulkPresets,
  loadStoredBulkConfig,
  normalizeBulkSessionConfig,
  saveBulkPreset,
  storeBulkConfig,
  storeBulkDraft,
  type BulkDraft,
  type BulkFormState,
} from "./session-config";
import { configFromDraft, draftFromConfig, TransformSettings } from "./TransformSettings";

/** Overlay dispatch prefill (unified "Process characters" entry — SPEC 2026-10-10 F5.2):
 *  initial values for exactly these fields; everything stays editable, and the remembered
 *  config continues to fill every field the prefill does not mention. */
export interface BulkDispatchPrefill {
  presetId?: PromptPresetId;
  globalInstruction?: string;
  saveMode?: SaveMode;
  duplicatePrefix?: string;
  combinedCardName?: string;
  label?: string;
  /** Transform task: the schema to start from and its output format. */
  schemaId?: string;
  format?: CardOutputFormat;
}

const PRESET_LABEL_KEYS: Record<PromptPresetId, string> = {
  standard: "cardEditor.dialog.model.presetStandard",
  strict: "cardEditor.dialog.model.presetStrict",
  rebalance: "cardEditor.dialog.model.presetRebalance",
  "xml-simple": "cardEditor.dialog.model.presetXmlSimple",
  "xml-complex": "cardEditor.dialog.model.presetXmlComplex",
  custom: "cardEditor.dialog.model.presetCustom",
  transform: "cardEditor.dialog.model.presetTransform",
};

export function BulkDispatchDialog({
  localization,
  characterIds,
  prefill,
  onClose,
  onDispatched,
}: {
  localization?: CardEditorLocalizationContext;
  characterIds: string[];
  prefill?: BulkDispatchPrefill;
  onClose: () => void;
  onDispatched: (session: BulkSession) => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);

  const [targets, setTargets] = useState<DialogTarget[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [connections, setConnections] = useState<LanguageConnection[] | null>(null);
  const [connectionsError, setConnectionsError] = useState(false);
  const [lorebooks, setLorebooks] = useState<HostLorebook[] | null>(null);
  const [lorebooksError, setLorebooksError] = useState(false);
  const [lorebookFilter, setLorebookFilter] = useState("");

  // Read the remembered config once (lazy initializer); corrupt entries fall back to defaults.
  const [storedConfig] = useState(() => loadStoredBulkConfig(safeLocalStorage()));
  // SPEC 2026-10-10 §3: the chat-name prefill is only an editable suggestion in the prefix box.
  // Append prefix and suffix both apply (the old "prefix wins" rule is gone); blank boxes are
  // omitted from the dispatch config. The suffix starts at the " (Edited)" suggestion unless a
  // remembered config overrides it; the remove affixes start empty.
  const [defaultForm] = useState<BulkFormState>(() => ({
    mode: storedConfig?.mode ?? "individual",
    batchSize: storedConfig?.batchSize ?? 4,
    connectionId: storedConfig?.connectionId ?? null,
    presetId: prefill?.presetId ?? storedConfig?.presetId ?? "standard",
    customTemplate: storedConfig?.customTemplate ?? "",
    globalInstruction: prefill?.globalInstruction ?? storedConfig?.globalInstruction ?? "",
    behavior: { kind: "none" },
    globalLorebookIds: storedConfig?.globalLorebookIds ?? [],
    rebalance: storedConfig?.rebalance ?? false,
    providerRetries: storedConfig?.providerRetries ?? 2,
    refusalRetries: storedConfig?.refusalRetries ?? 3,
    concurrency: storedConfig?.concurrency ?? 1,
    completionMode: storedConfig?.completionMode ?? "ask",
    saveMode: prefill?.saveMode ?? storedConfig?.saveMode ?? "confirm",
    duplicatePrefix: prefill?.duplicatePrefix ?? storedConfig?.duplicatePrefix ?? "",
    duplicateSuffix: storedConfig?.duplicateSuffix ?? " (Edited)",
    duplicateRemovePrefix: storedConfig?.duplicateRemovePrefix ?? "",
    duplicateRemoveSuffix: storedConfig?.duplicateRemoveSuffix ?? "",
    combinedCardName:
      prefill?.combinedCardName ??
      (prefill?.label ? `${prefill.label} — Cast` : (storedConfig?.combinedCardName ?? "")),
    transformDraft: {
      ...draftFromConfig(storedConfig?.transform),
      ...(prefill?.schemaId ? { schemaId: prefill.schemaId } : {}),
      ...(prefill?.format ? { format: prefill.format } : {}),
    },
  }));
  // An unsent draft (auto-saved below) takes precedence over prefill and the remembered config: it is newer work.
  const [restoredDraft, setRestoredDraft] = useState(() => loadBulkDraft(safeLocalStorage(), defaultForm));
  const [initialForm] = useState(() => restoredDraft?.form ?? defaultForm);
  const [mode, setMode] = useState(initialForm.mode);
  const [batchSize, setBatchSize] = useState(initialForm.batchSize);
  const [connectionId, setConnectionId] = useState(initialForm.connectionId);
  const [presetId, setPresetId] = useState(initialForm.presetId);
  const [customTemplate, setCustomTemplate] = useState(initialForm.customTemplate);
  const [globalInstruction, setGlobalInstruction] = useState(initialForm.globalInstruction);
  const [behavior, setBehavior] = useState(initialForm.behavior);
  const [globalLorebookIds, setGlobalLorebookIds] = useState(initialForm.globalLorebookIds);
  const [rebalance, setRebalance] = useState(initialForm.rebalance);
  const [providerRetries, setProviderRetries] = useState(initialForm.providerRetries);
  const [refusalRetries, setRefusalRetries] = useState(initialForm.refusalRetries);
  const [concurrency, setConcurrency] = useState(initialForm.concurrency);
  const [completionMode, setCompletionMode] = useState(initialForm.completionMode);
  const [saveMode, setSaveMode] = useState(initialForm.saveMode);
  const [duplicatePrefix, setDuplicatePrefix] = useState(initialForm.duplicatePrefix);
  const [duplicateSuffix, setDuplicateSuffix] = useState(initialForm.duplicateSuffix);
  const [duplicateRemovePrefix, setDuplicateRemovePrefix] = useState(initialForm.duplicateRemovePrefix);
  const [duplicateRemoveSuffix, setDuplicateRemoveSuffix] = useState(initialForm.duplicateRemoveSuffix);
  const [combinedCardName, setCombinedCardName] = useState(initialForm.combinedCardName);
  const [transformDraft, setTransformDraft] = useState(initialForm.transformDraft);
  const [presets, setPresets] = useState(() => loadBulkPresets(safeLocalStorage(), defaultForm));
  const [presetName, setPresetName] = useState("");
  // Only user edits start auto-saving, so merely opening and closing never leaves a draft behind.
  const touched = useRef(restoredDraft !== null);
  const dispatched = useRef(false);
  const [schemas, setSchemas] = useState<CardSchema[] | null>(null);
  const [schemasError, setSchemasError] = useState(false);
  const [agentStructured, setAgentStructured] = useState<boolean | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [bulkSettings, setBulkSettings] = useState<BulkSettings | null>(null);

  const transform = presetId === "transform";

  useEffect(() => {
    if (!transform || schemas !== null) return undefined;
    const controller = new AbortController();
    listCardSchemas(controller.signal)
      .then((list) => {
        setSchemas(list);
        setTransformDraft((draft) =>
          list.some((schema) => schema.id === draft.schemaId) ? draft : { ...draft, schemaId: list[0]?.id ?? "simple" },
        );
      })
      .catch(() => setSchemasError(true));
    getAgentStructuredOutput(controller.signal)
      .then((result) => setAgentStructured(result.structuredOutput))
      .catch(() => undefined);
    return () => controller.abort();
  }, [transform, schemas]);

  // Snapshot: the selection at dialog-open time is the dispatch target list.
  const [initialIds] = useState(() => [...new Set(characterIds)]);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setTargetsLoading(true);
    void Promise.allSettled(initialIds.map((id) => getHostCharacterCard(id, controller.signal))).then((results) => {
      if (cancelled) return;
      setTargets(
        results.map((result, index) => {
          const characterId = initialIds[index]!;
          // Notes and styles come back for every target the draft knew; new targets start blank.
          const saved = restoredDraft?.targets[characterId] ?? { note: "", style: { kind: "inherit" } };
          if (result.status === "fulfilled") {
            return {
              characterId,
              name: result.value.name,
              avatarPath: result.value.avatarPath,
              card: result.value.fields,
              ...saved,
              loadError: false,
            };
          }
          return { characterId, name: characterId, avatarPath: null, card: null, ...saved, loadError: true };
        }),
      );
      setTargetsLoading(false);
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
    // The draft is read once at open; later draft changes must not reload the targets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIds]);

  useEffect(() => {
    const controller = new AbortController();
    listLanguageConnections(controller.signal)
      .then((list) => setConnections(list))
      .catch(() => setConnectionsError(true));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    listHostLorebooks(controller.signal)
      .then((list) => setLorebooks(list))
      .catch(() => setLorebooksError(true));
    return () => controller.abort();
  }, []);

  // Resolve the remembered behavior character's name; a vanished card falls back to None.
  useEffect(() => {
    const remembered = storedConfig?.behaviorCharacterId;
    if (!remembered || touched.current) return undefined;
    let cancelled = false;
    getHostCharacter(remembered)
      .then((character) => {
        if (!cancelled) {
          setBehavior({
            kind: "character",
            id: character.id,
            name: character.name,
            avatarPath: character.avatarPath,
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [storedConfig]);

  const choosePreset = (next: PromptPresetId) => {
    if (next === "custom" && presetId !== "custom") {
      const untouched = !customTemplate.trim() || Object.values(PROMPT_PRESET_TEMPLATES).includes(customTemplate);
      if (untouched && isBundledPromptPreset(presetId)) setCustomTemplate(PROMPT_PRESET_TEMPLATES[presetId]);
    }
    setPresetId(next);
  };

  const updateTarget = (characterId: string, patch: Partial<DialogTarget>) =>
    setTargets((current) =>
      current.map((target) => (target.characterId === characterId ? { ...target, ...patch } : target)),
    );
  const removeTarget = (characterId: string) =>
    setTargets((current) => current.filter((target) => target.characterId !== characterId));
  // A run started from the workspace (no library selection) collects its cards here.
  const addTarget = (picked: { id: string; name: string; avatarPath?: string | null }) => {
    touched.current = true;
    if (targets.some((target) => target.characterId === picked.id)) return;
    const pending: DialogTarget = {
      characterId: picked.id,
      name: picked.name,
      avatarPath: picked.avatarPath ?? null,
      card: null,
      note: "",
      style: { kind: "inherit" },
      loadError: false,
    };
    setTargets((current) => [...current, pending]);
    getHostCharacterCard(picked.id)
      .then((card) => updateTarget(picked.id, { name: card.name, avatarPath: card.avatarPath, card: card.fields }))
      .catch(() => updateTarget(picked.id, { loadError: true }));
  };

  const visibleLorebooks = (lorebooks ?? []).filter(
    (lorebook) =>
      !lorebookFilter.trim() || lorebook.name.toLocaleLowerCase().includes(lorebookFilter.trim().toLocaleLowerCase()),
  );
  const estimate = estimateBulkCalls(targets.length, batchSize);
  const unloadableTargets = targets.some((target) => target.loadError);
  const targetsPending = targets.some((target) => !target.loadError && !target.card);
  // Combined mode produces ONE new card — a name is mandatory (schema.ts enforces it too).
  const combinedNameMissing = saveMode === "combined" && combinedCardName.trim().length === 0;
  const transformBlocked = transform && (schemas === null || schemas.length === 0);
  // Live sample for the duplicate naming preview, computed exactly the way apply-ops will name
  // the copy (shared text.ts helper; blank affixes count as absent). The first target's name is
  // the sample base; a generic stand-in covers the loading/empty state.
  const duplicatePreviewName = computeDuplicateName(targets[0]?.name ?? "Character", {
    prefix: duplicatePrefix,
    suffix: duplicateSuffix,
    removePrefix: duplicateRemovePrefix,
    removeSuffix: duplicateRemoveSuffix,
  });

  // Agent-level bulk settings: the panel's parallel cap and the require-review toggle both
  // constrain this dialog. A load failure leaves them unset — the server still enforces them.
  useEffect(() => {
    let cancelled = false;
    getBulkSettings()
      .then((settings) => {
        if (!cancelled) setBulkSettings(settings);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const requireReview = bulkSettings?.disableAutoVerdicts === true;
  // Remembered auto choices from before the toggle was switched on coerce back to manual review.
  useEffect(() => {
    if (!requireReview) return;
    setSaveMode((current) => (current === "auto" ? "confirm" : current));
    setCompletionMode((current) => (current === "ask" ? current : "ask"));
  }, [requireReview]);

  // Concurrency ceiling: the selected connection's parallel agent-job limit (maxParallelJobs,
  // 1–16). The default chain has no row of its own, so it falls back to the connection marked
  // defaultForAgents (then isDefault); an unresolvable list keeps the previous ceiling of 4.
  const limitConnection =
    connections?.find((connection) => connection.id === connectionId) ??
    connections?.find((connection) => connection.defaultForAgents) ??
    connections?.find((connection) => connection.isDefault) ??
    null;
  const agentLimit = limitConnection?.maxParallelJobs;
  const concurrencyMax =
    typeof agentLimit === "number" && Number.isFinite(agentLimit)
      ? Math.min(16, Math.max(1, Math.trunc(agentLimit)))
      : 4;
  const settingsCap = bulkSettings?.maxParallelAgents ?? null;
  const parallelCap = settingsCap === null ? concurrencyMax : Math.min(concurrencyMax, settingsCap);
  // A remembered higher value only ever clamps down — never raises what the user picked.
  useEffect(() => {
    setConcurrency((current) => Math.min(current, parallelCap));
  }, [parallelCap]);
  // F2 (SPEC 2026-10-09): with no remembered concurrency the field starts at the effective cap
  // once the connection list settles; a later-arriving settings cap can only lower it, which the
  // clamp above already covers. Remembered values keep clamp-down-only behavior.
  const concurrencyRemembered = restoredDraft !== null || storedConfig?.concurrency !== undefined;
  const concurrencyInitializedFromCap = useRef(false);
  useEffect(() => {
    if (concurrencyRemembered || concurrencyInitializedFromCap.current) return;
    if (connections === null && !connectionsError) return;
    concurrencyInitializedFromCap.current = true;
    setConcurrency(parallelCap);
  }, [concurrencyRemembered, connections, connectionsError, parallelCap]);

  const form: BulkFormState = {
    mode,
    batchSize,
    connectionId,
    presetId,
    customTemplate,
    globalInstruction,
    behavior,
    globalLorebookIds,
    rebalance,
    providerRetries,
    refusalRetries,
    concurrency,
    completionMode,
    saveMode,
    duplicatePrefix,
    duplicateSuffix,
    duplicateRemovePrefix,
    duplicateRemoveSuffix,
    combinedCardName,
    transformDraft,
  };
  // Auto-save after every edit. Load-failed targets keep their notes too; they may load next time.
  const draftJson = JSON.stringify({
    form,
    targets: Object.fromEntries(
      targets.map((target) => [target.characterId, { note: target.note, style: target.style }]),
    ),
  });
  useEffect(() => {
    if (!touched.current || dispatched.current || targetsLoading) return;
    storeBulkDraft(JSON.parse(draftJson) as BulkDraft, safeLocalStorage());
  }, [draftJson, targetsLoading]);

  const applyForm = (next: BulkFormState) => {
    touched.current = true;
    setMode(next.mode);
    setBatchSize(next.batchSize);
    setConnectionId(next.connectionId);
    setPresetId(next.presetId);
    setCustomTemplate(next.customTemplate);
    setGlobalInstruction(next.globalInstruction);
    setBehavior(next.behavior);
    setGlobalLorebookIds(next.globalLorebookIds);
    setRebalance(next.rebalance);
    setProviderRetries(next.providerRetries);
    setRefusalRetries(next.refusalRetries);
    setConcurrency(Math.min(next.concurrency, parallelCap));
    setCompletionMode(requireReview ? "ask" : next.completionMode);
    setSaveMode(requireReview && next.saveMode === "auto" ? "confirm" : next.saveMode);
    setDuplicatePrefix(next.duplicatePrefix);
    setDuplicateSuffix(next.duplicateSuffix);
    setDuplicateRemovePrefix(next.duplicateRemovePrefix);
    setDuplicateRemoveSuffix(next.duplicateRemoveSuffix);
    setCombinedCardName(next.combinedCardName);
    setTransformDraft(next.transformDraft);
  };

  const discardDraft = () => {
    applyForm(defaultForm);
    setTargets((current) => current.map((target) => ({ ...target, note: "", style: { kind: "inherit" } })));
    touched.current = false;
    clearBulkDraft(safeLocalStorage());
    setRestoredDraft(null);
  };

  const savePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    setPresets((current) => saveBulkPreset(current, { name, form }, safeLocalStorage()));
  };
  const selectedPreset = presets.find((preset) => preset.name === presetName.trim());

  // The server never fetches engine data (coordinator decision 1): every prompt input travels
  // with the dispatch — target cards, per-target style-override cards (ANY library character),
  // the session-level behavior character, and the global lorebooks' entries.
  const dispatch = async () => {
    if (
      dispatching ||
      targets.length === 0 ||
      unloadableTargets ||
      targetsPending ||
      combinedNameMissing ||
      transformBlocked
    )
      return;
    setDispatching(true);
    setDispatchError(null);
    const config = normalizeBulkSessionConfig({
      ...(transform ? { transform: configFromDraft(transformDraft, schemas ?? [], agentStructured !== false) } : {}),
      mode,
      batchSize,
      connectionId,
      presetId,
      ...(presetId === "custom" ? { customTemplate } : {}),
      globalInstruction,
      behaviorCharacterId: behavior.kind === "character" ? behavior.id : null,
      globalLorebookIds,
      rebalance,
      providerRetries,
      refusalRetries,
      concurrency,
      saveMode,
      completionMode,
      // Blank affixes stay out (the schema rejects blank strings); affixes travel verbatim —
      // a trailing space the user typed is part of the name join (apply-ops concatenates raw).
      ...(duplicatePrefix.trim() ? { duplicatePrefix } : {}),
      ...(duplicateSuffix.trim() ? { duplicateSuffix } : {}),
      ...(duplicateRemovePrefix.trim() ? { duplicateRemovePrefix } : {}),
      ...(duplicateRemoveSuffix.trim() ? { duplicateRemoveSuffix } : {}),
      ...(saveMode === "combined" ? { combinedCardName: combinedCardName.trim() } : {}),
    });
    try {
      const overrideIds = [
        ...new Set(targets.flatMap((target) => (target.style.kind === "character" ? [target.style.id] : []))),
      ];
      const [overrideCards, sessionBehaviorCard, lorebookMaterials] = await Promise.all([
        Promise.all(overrideIds.map((id) => getHostCharacterCard(id))),
        behavior.kind === "character" ? getHostCharacterCard(behavior.id) : Promise.resolve(null),
        Promise.all(
          globalLorebookIds.map(async (id) => {
            const book = (lorebooks ?? []).find((candidate) => candidate.id === id);
            return { name: book?.name ?? id, entries: await getHostLorebookEntries(id) };
          }),
        ),
      ]);
      const overrideById = new Map(overrideCards.map((card, index) => [overrideIds[index]!, card]));
      const session = await createSession({
        targets: targets.map((target) => ({
          characterId: target.characterId,
          characterName: target.name,
          card: target.card!,
          ...(target.note.trim() ? { note: target.note.trim() } : {}),
          ...(target.style.kind === "none"
            ? { behaviorOverride: null }
            : target.style.kind === "character"
              ? {
                  behaviorOverride: target.style.id,
                  behaviorOverrideCard: behaviorCardMaterial(overrideById.get(target.style.id)!),
                }
              : {}),
        })),
        config,
        // Prefilled labels come from the unified "Process characters" entry ("Process: <chat>").
        ...(prefill?.label?.trim() ? { label: prefill.label.trim().slice(0, 200) } : {}),
        ...(lorebookMaterials.length > 0 ? { lorebooks: lorebookMaterials } : {}),
        ...(sessionBehaviorCard ? { behaviorCharacter: behaviorCardMaterial(sessionBehaviorCard) } : {}),
      });
      storeBulkConfig(config, safeLocalStorage());
      dispatched.current = true;
      clearBulkDraft(safeLocalStorage());
      onDispatched(session);
    } catch (error) {
      setDispatchError(error instanceof Error ? error.message : String(error));
      setDispatching(false);
    }
  };

  return (
    // The workspace's Setup stage. Clicks outside never discard it; the draft auto-saves.
    <WorkspacePane
      className="ce-setup"
      label={t("cardEditor.dialog.title")}
      busy={dispatching}
      closeOnEscape={!studioOpen}
      onClose={onClose}
      onChangeCapture={() => {
        touched.current = true;
      }}
      onClickCapture={(event) => {
        if ((event.target as Element).closest("button, input, select, label")) touched.current = true;
      }}
    >
      <div className="ce-setup-targets">
        <DialogTargets
          localization={localization}
          targets={targets}
          targetsLoading={targetsLoading}
          onUpdateTarget={updateTarget}
          onRemoveTarget={removeTarget}
          onAddTarget={addTarget}
        />
      </div>
      <div className="ce-setup-config">
        {studioOpen ? (
          <SchemaStudio
            localization={localization}
            initialSchemaId={transformDraft.schemaId}
            onClose={() => setStudioOpen(false)}
            onSchemasChanged={(list, selectedId) => {
              setSchemas(list);
              setTransformDraft((draft) => ({ ...draft, schemaId: selectedId }));
            }}
          />
        ) : (
          <>
            {restoredDraft ? (
              <div className="ce-status" role="status">
                <span>{t("cardEditor.dialog.draft.restored")}</span>{" "}
                <button type="button" className="mari-chrome-control mari-chrome-control--small" onClick={discardDraft}>
                  {t("cardEditor.dialog.draft.discard")}
                </button>
              </div>
            ) : null}

            <fieldset className="ce-section" data-ce-section="presets">
              <legend className="ce-section-heading">{t("cardEditor.dialog.presets.title")}</legend>
              <label className="ce-label" htmlFor="ce-settings-preset">
                <span className="ce-label-title">{t("cardEditor.dialog.presets.name")}</span>
                <input
                  id="ce-settings-preset"
                  type="text"
                  list="ce-settings-preset-list"
                  className="mari-chrome-field ce-field"
                  value={presetName}
                  placeholder={t("cardEditor.dialog.presets.namePlaceholder")}
                  onChange={(event) => setPresetName(event.target.value)}
                />
                <datalist id="ce-settings-preset-list">
                  {presets.map((preset) => (
                    <option key={preset.name} value={preset.name} />
                  ))}
                </datalist>
                <small>{t("cardEditor.dialog.presets.hint")}</small>
              </label>
              <div className="ce-preset-actions">
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--small"
                  disabled={!selectedPreset}
                  onClick={() => selectedPreset && applyForm(selectedPreset.form)}
                >
                  {t("cardEditor.dialog.presets.load")}
                </button>
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--small"
                  disabled={!presetName.trim()}
                  onClick={savePreset}
                >
                  {selectedPreset ? t("cardEditor.dialog.presets.overwrite") : t("cardEditor.dialog.presets.save")}
                </button>
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--small"
                  disabled={!selectedPreset}
                  onClick={() =>
                    selectedPreset &&
                    setPresets((current) => deleteBulkPreset(current, selectedPreset.name, safeLocalStorage()))
                  }
                >
                  {t("cardEditor.dialog.presets.delete")}
                </button>
              </div>
            </fieldset>

            <fieldset className="ce-section" data-ce-section="model">
              <legend className="ce-section-heading">{t("cardEditor.dialog.model.title")}</legend>
              <label className="ce-label" htmlFor="ce-connection">
                <span className="ce-label-title">{t("cardEditor.dialog.model.connection")}</span>
                <select
                  id="ce-connection"
                  className="mari-chrome-field ce-field"
                  value={connectionId ?? ""}
                  data-ce-autofocus
                  onChange={(event) => setConnectionId(event.target.value || null)}
                >
                  <option value="">{t("cardEditor.dialog.model.connectionDefault")}</option>
                  {(connections ?? []).map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.model ? `${connection.name} · ${connection.model}` : connection.name}
                    </option>
                  ))}
                </select>
              </label>
              {connections === null && !connectionsError ? (
                <p className="ce-caption">{t("cardEditor.dialog.model.connectionsLoading")}</p>
              ) : null}
              {connectionsError ? (
                <div className="ce-status ce-status--error" role="alert">
                  {t("cardEditor.dialog.model.connectionsError")}
                </div>
              ) : null}
              <label className="ce-label" htmlFor="ce-preset">
                <span className="ce-label-title">{t("cardEditor.dialog.model.preset")}</span>
                <select
                  id="ce-preset"
                  className="mari-chrome-field ce-field"
                  value={presetId}
                  onChange={(event) => choosePreset(event.target.value as PromptPresetId)}
                >
                  <option value="transform">{t("cardEditor.dialog.model.presetTransform")}</option>
                  <option value="standard">{t("cardEditor.dialog.model.presetStandard")}</option>
                  <option value="strict">{t("cardEditor.dialog.model.presetStrict")}</option>
                  <option value="rebalance">{t("cardEditor.dialog.model.presetRebalance")}</option>
                  <option value="xml-simple">{t("cardEditor.dialog.model.presetXmlSimple")}</option>
                  <option value="xml-complex">{t("cardEditor.dialog.model.presetXmlComplex")}</option>
                  <option value="custom">{t("cardEditor.dialog.model.presetCustom")}</option>
                </select>
              </label>
              {presetId === "custom" ? (
                <label className="ce-label" htmlFor="ce-custom-template">
                  <span className="ce-label-title">{t("cardEditor.dialog.model.customTemplate")}</span>
                  <textarea
                    id="ce-custom-template"
                    className="mari-chrome-field ce-field ce-textarea ce-template-textarea"
                    value={customTemplate}
                    onChange={(event) => setCustomTemplate(event.target.value)}
                  />
                  <small>{t("cardEditor.dialog.model.customTemplateHint")}</small>
                </label>
              ) : null}
            </fieldset>

            {transform ? (
              <TransformSettings
                localization={localization}
                draft={transformDraft}
                schemas={schemas}
                schemasError={schemasError}
                agentStructuredOutput={agentStructured}
                onChange={(patch) => setTransformDraft((draft) => ({ ...draft, ...patch }))}
                onEditSchemas={() => setStudioOpen(true)}
              />
            ) : null}

            <fieldset className="ce-section" data-ce-section="instructions">
              <legend className="ce-section-heading">{t("cardEditor.dialog.instructions.title")}</legend>
              <label className="ce-label" htmlFor="ce-global-instruction">
                <span className="ce-label-title">{t("cardEditor.dialog.instructions.global")}</span>
                <textarea
                  id="ce-global-instruction"
                  className="mari-chrome-field ce-field ce-textarea"
                  value={globalInstruction}
                  placeholder={t("cardEditor.dialog.instructions.globalPlaceholder")}
                  onChange={(event) => setGlobalInstruction(event.target.value)}
                />
              </label>
              <div className="ce-label">
                <span className="ce-label-title">{t("cardEditor.dialog.instructions.behavior")}</span>
                <BehaviorCharacterSelect
                  localization={localization}
                  selection={behavior}
                  onChange={setBehavior}
                  buttonLabel={t("cardEditor.dialog.instructions.behavior")}
                  noneLabel={t("cardEditor.dialog.instructions.behaviorNone")}
                />
                <small>{t("cardEditor.dialog.instructions.behaviorHint")}</small>
              </div>
              <div className="ce-label">
                <span className="ce-label-title">{t("cardEditor.dialog.instructions.lorebooks")}</span>
                <input
                  type="search"
                  className="mari-chrome-field ce-field"
                  value={lorebookFilter}
                  placeholder={t("cardEditor.dialog.instructions.lorebooksFilter")}
                  aria-label={t("cardEditor.dialog.instructions.lorebooksFilter")}
                  onChange={(event) => setLorebookFilter(event.target.value)}
                />
                {lorebooks === null && !lorebooksError ? (
                  <p className="ce-caption">{t("cardEditor.dialog.instructions.lorebooksLoading")}</p>
                ) : null}
                {lorebooksError ? (
                  <div className="ce-status ce-status--error" role="alert">
                    {t("cardEditor.dialog.instructions.lorebooksError")}
                  </div>
                ) : null}
                {lorebooks !== null && lorebooks.length === 0 ? (
                  <p className="ce-caption">{t("cardEditor.dialog.instructions.lorebooksEmpty")}</p>
                ) : null}
                {lorebooks !== null && lorebooks.length > 0 && visibleLorebooks.length === 0 ? (
                  <p className="ce-caption">{t("cardEditor.dialog.instructions.lorebooksNoneMatch")}</p>
                ) : null}
                {visibleLorebooks.length > 0 ? (
                  <div className="ce-lorebook-list">
                    {visibleLorebooks.map((lorebook) => (
                      <label className="ce-lorebook" key={lorebook.id}>
                        <input
                          type="checkbox"
                          checked={globalLorebookIds.includes(lorebook.id)}
                          onChange={(event) =>
                            setGlobalLorebookIds((current) =>
                              event.target.checked
                                ? [...new Set([...current, lorebook.id])]
                                : current.filter((id) => id !== lorebook.id),
                            )
                          }
                        />
                        <span className="ce-lorebook-name">{lorebook.name}</span>
                      </label>
                    ))}
                  </div>
                ) : null}
                <small>{t("cardEditor.dialog.instructions.lorebooksHint")}</small>
              </div>
            </fieldset>

            <fieldset className="ce-section" data-ce-section="processing">
              <legend className="ce-section-heading">{t("cardEditor.dialog.processing.title")}</legend>
              <div className="ce-choice-list">
                <RadioChoice
                  name="ce-mode"
                  value="individual"
                  checked={mode === "individual"}
                  onChange={() => setMode("individual")}
                  title={t("cardEditor.dialog.processing.modeIndividual")}
                />
                <RadioChoice
                  name="ce-mode"
                  value="batched"
                  checked={mode === "batched"}
                  onChange={() => setMode("batched")}
                  title={t("cardEditor.dialog.processing.modeBatched")}
                />
              </div>
              <div className="ce-number-grid">
                <NumberField
                  id="ce-batch-size"
                  label={t("cardEditor.dialog.processing.batchSize")}
                  value={batchSize}
                  min={1}
                  max={16}
                  onChange={setBatchSize}
                />
                <NumberField
                  id="ce-provider-retries"
                  label={t("cardEditor.dialog.processing.providerRetries")}
                  value={providerRetries}
                  min={0}
                  max={5}
                  onChange={setProviderRetries}
                />
                <NumberField
                  id="ce-refusal-retries"
                  label={t("cardEditor.dialog.processing.refusalRetries")}
                  value={refusalRetries}
                  min={0}
                  max={5}
                  onChange={setRefusalRetries}
                />
                <NumberField
                  id="ce-concurrency"
                  label={t("cardEditor.dialog.processing.concurrency")}
                  value={concurrency}
                  min={1}
                  max={parallelCap}
                  onChange={setConcurrency}
                />
              </div>
              {transform ? null : (
                <label className="ce-choice">
                  <input type="checkbox" checked={rebalance} onChange={(event) => setRebalance(event.target.checked)} />
                  <span className="ce-choice-copy">
                    <strong>{t("cardEditor.dialog.processing.rebalance")}</strong>
                    <small>{t("cardEditor.dialog.processing.rebalanceHint")}</small>
                  </span>
                </label>
              )}
              <label className="ce-label" htmlFor="ce-completion-mode">
                <span className="ce-label-title">{t("cardEditor.dialog.processing.completionMode")}</span>
                <select
                  id="ce-completion-mode"
                  className="mari-chrome-field ce-field"
                  value={completionMode}
                  onChange={(event) => setCompletionMode(event.target.value as CompletionMode)}
                >
                  <option value="ask">{t("cardEditor.dialog.processing.completionAsk")}</option>
                  <option value="apply" disabled={requireReview}>
                    {t("cardEditor.dialog.processing.completionApply")}
                  </option>
                  <option value="duplicate" disabled={requireReview}>
                    {t("cardEditor.dialog.processing.completionDuplicate")}
                  </option>
                </select>
                {requireReview ? (
                  <small>{t("cardEditor.dialog.processing.autoDisabledNote")}</small>
                ) : (
                  <small>{t("cardEditor.dialog.processing.completionCaption")}</small>
                )}
              </label>
              <p className="ce-caption">{t("cardEditor.dialog.processing.overflowCaption")}</p>
            </fieldset>

            <fieldset className="ce-section" data-ce-section="saving">
              <legend className="ce-section-heading">{t("cardEditor.dialog.saving.title")}</legend>
              <div className="ce-choice-list">
                <RadioChoice
                  name="ce-save-mode"
                  value="confirm"
                  checked={saveMode === "confirm"}
                  onChange={(value) => setSaveMode(value as SaveMode)}
                  title={t("cardEditor.dialog.saving.confirm")}
                />
                <RadioChoice
                  name="ce-save-mode"
                  value="auto"
                  checked={saveMode === "auto"}
                  onChange={(value) => setSaveMode(value as SaveMode)}
                  title={t("cardEditor.dialog.saving.auto")}
                  disabled={requireReview}
                />
                <RadioChoice
                  name="ce-save-mode"
                  value="duplicate"
                  checked={saveMode === "duplicate"}
                  onChange={(value) => setSaveMode(value as SaveMode)}
                  title={t("cardEditor.dialog.saving.duplicate")}
                />
                {saveMode === "duplicate" ? (
                  <>
                    <label className="ce-label" htmlFor="ce-duplicate-prefix">
                      <span className="ce-label-title">{t("cardEditor.dialog.saving.duplicatePrefix")}</span>
                      <input
                        id="ce-duplicate-prefix"
                        type="text"
                        className="mari-chrome-field ce-field"
                        value={duplicatePrefix}
                        placeholder={t("cardEditor.dialog.saving.duplicatePrefixPlaceholder")}
                        aria-label={t("cardEditor.dialog.saving.duplicatePrefix")}
                        onChange={(event) => setDuplicatePrefix(event.target.value)}
                      />
                      <small>{t("cardEditor.dialog.saving.duplicatePrefixHint")}</small>
                    </label>
                    <label className="ce-label" htmlFor="ce-duplicate-suffix">
                      <span className="ce-label-title">{t("cardEditor.dialog.saving.duplicateSuffix")}</span>
                      <input
                        id="ce-duplicate-suffix"
                        type="text"
                        className="mari-chrome-field ce-field"
                        value={duplicateSuffix}
                        placeholder={t("cardEditor.dialog.saving.duplicateSuffixPlaceholder")}
                        aria-label={t("cardEditor.dialog.saving.duplicateSuffix")}
                        onChange={(event) => setDuplicateSuffix(event.target.value)}
                      />
                    </label>
                    <p className="ce-divider-caption">{t("cardEditor.dialog.saving.duplicateRemoveGroup")}</p>
                    <label className="ce-label" htmlFor="ce-duplicate-remove-prefix">
                      <span className="ce-label-title">{t("cardEditor.dialog.saving.duplicateRemovePrefix")}</span>
                      <input
                        id="ce-duplicate-remove-prefix"
                        type="text"
                        className="mari-chrome-field ce-field"
                        value={duplicateRemovePrefix}
                        placeholder={t("cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder")}
                        aria-label={t("cardEditor.dialog.saving.duplicateRemovePrefix")}
                        onChange={(event) => setDuplicateRemovePrefix(event.target.value)}
                      />
                    </label>
                    <label className="ce-label" htmlFor="ce-duplicate-remove-suffix">
                      <span className="ce-label-title">{t("cardEditor.dialog.saving.duplicateRemoveSuffix")}</span>
                      <input
                        id="ce-duplicate-remove-suffix"
                        type="text"
                        className="mari-chrome-field ce-field"
                        value={duplicateRemoveSuffix}
                        placeholder={t("cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder")}
                        aria-label={t("cardEditor.dialog.saving.duplicateRemoveSuffix")}
                        onChange={(event) => setDuplicateRemoveSuffix(event.target.value)}
                      />
                    </label>
                    <p className="ce-caption">
                      {t("cardEditor.dialog.saving.duplicateNamePreview", { name: duplicatePreviewName })}
                    </p>
                  </>
                ) : null}
                <RadioChoice
                  name="ce-save-mode"
                  value="combined"
                  checked={saveMode === "combined"}
                  onChange={(value) => setSaveMode(value as SaveMode)}
                  title={t("cardEditor.dialog.saving.combined")}
                />
                {saveMode === "combined" ? (
                  <label className="ce-label" htmlFor="ce-combined-name">
                    <span className="ce-label-title">{t("cardEditor.dialog.saving.combinedName")}</span>
                    <input
                      id="ce-combined-name"
                      type="text"
                      className="mari-chrome-field ce-field"
                      value={combinedCardName}
                      placeholder={t("cardEditor.dialog.saving.combinedNamePlaceholder")}
                      aria-label={t("cardEditor.dialog.saving.combinedName")}
                      onChange={(event) => setCombinedCardName(event.target.value)}
                    />
                    <small>{t("cardEditor.dialog.saving.combinedCaption")}</small>
                  </label>
                ) : null}
              </div>
              {requireReview ? <p className="ce-caption">{t("cardEditor.dialog.saving.reviewRequiredHint")}</p> : null}
              <p className="ce-caption">{t("cardEditor.dialog.saving.caption")}</p>
            </fieldset>
          </>
        )}
      </div>
      <div className="ce-dialog-foot ce-setup-summary">
        <h3 className="ce-section-heading">{t("cardEditor.setup.summary")}</h3>
        <dl className="ce-summary-list">
          <dt>{t("cardEditor.setup.targets")}</dt>
          <dd>{targets.length}</dd>
          <dt>{t("cardEditor.dialog.model.preset")}</dt>
          <dd>{t(PRESET_LABEL_KEYS[presetId])}</dd>
          <dt>{t("cardEditor.dialog.saving.title")}</dt>
          <dd>{t(`cardEditor.panel.saveMode.${saveMode}`)}</dd>
          <dt>{t("cardEditor.dialog.processing.completionMode")}</dt>
          <dd>{t(`cardEditor.panel.completionMode.${completionMode}`)}</dd>
        </dl>
        {dispatchError ? (
          <div className="ce-status ce-status--error ce-foot-error" role="alert">
            {t("cardEditor.dialog.dispatchError", { message: dispatchError })}
          </div>
        ) : null}
        {unloadableTargets ? (
          <div className="ce-status ce-status--error ce-foot-error" role="alert">
            {t("cardEditor.dialog.targets.unloadableBlock")}
          </div>
        ) : null}
        {combinedNameMissing ? (
          <div className="ce-status ce-status--error ce-foot-error" role="alert">
            {t("cardEditor.dialog.saving.combinedNameRequired")}
          </div>
        ) : null}
        <span className="ce-estimate">
          {t("cardEditor.dialog.estimate", {
            batch: batchSize,
            batchedCalls: estimate.batched,
            individualCalls: estimate.individual,
          })}
        </span>
        <button
          type="button"
          className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
          disabled={
            dispatching ||
            targets.length === 0 ||
            unloadableTargets ||
            targetsPending ||
            combinedNameMissing ||
            transformBlocked
          }
          onClick={() => void dispatch()}
        >
          {dispatching ? t("cardEditor.dialog.dispatching") : t("cardEditor.dialog.dispatch")}
        </button>
        <button
          type="button"
          className="mari-chrome-control mari-chrome-control--small ce-setup-cancel"
          onClick={onClose}
          disabled={dispatching}
        >
          {t("cardEditor.dialog.close")}
        </button>
      </div>
    </WorkspacePane>
  );
}
