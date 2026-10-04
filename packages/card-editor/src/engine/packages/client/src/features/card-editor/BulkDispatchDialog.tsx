import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { BulkSession, SaveMode } from "../../../../shared/src/features/agents/card-editor/schema.js";
import {
  createSession,
  getHostCharacter,
  listHostLorebooks,
  listLanguageConnections,
  type HostLorebook,
  type LanguageConnection,
} from "./api";
import { BehaviorCharacterSelect, type BehaviorSelection } from "./BehaviorCharacterSelect";
import { NumberField, RadioChoice, safeLocalStorage, useDialogFocusTrap } from "./dialog-controls";
import { DialogTargets, type DialogTarget } from "./DialogTargets";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";
import { isBundledPromptPreset, PROMPT_PRESET_TEMPLATES, type PromptPresetId } from "./presets";
import { estimateBulkCalls, loadStoredBulkConfig, normalizeBulkSessionConfig, storeBulkConfig } from "./session-config";

export function BulkDispatchDialog({
  localization,
  characterIds,
  onClose,
  onDispatched,
}: {
  localization?: CardEditorLocalizationContext;
  characterIds: string[];
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
  const [mode, setMode] = useState<"individual" | "batched">(storedConfig?.mode ?? "individual");
  const [batchSize, setBatchSize] = useState(storedConfig?.batchSize ?? 4);
  const [connectionId, setConnectionId] = useState<string | null>(storedConfig?.connectionId ?? null);
  const [presetId, setPresetId] = useState<PromptPresetId>(storedConfig?.presetId ?? "standard");
  const [customTemplate, setCustomTemplate] = useState(storedConfig?.customTemplate ?? "");
  const [globalInstruction, setGlobalInstruction] = useState(storedConfig?.globalInstruction ?? "");
  const [behavior, setBehavior] = useState<BehaviorSelection>({ kind: "none" });
  const [globalLorebookIds, setGlobalLorebookIds] = useState<string[]>(storedConfig?.globalLorebookIds ?? []);
  const [rebalance, setRebalance] = useState(storedConfig?.rebalance ?? false);
  const [providerRetries, setProviderRetries] = useState(storedConfig?.providerRetries ?? 2);
  const [refusalRetries, setRefusalRetries] = useState(storedConfig?.refusalRetries ?? 3);
  const [concurrency, setConcurrency] = useState(storedConfig?.concurrency ?? 1);
  const [saveMode, setSaveMode] = useState<SaveMode>(storedConfig?.saveMode ?? "confirm");
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const dialogRef = useDialogFocusTrap(true, () => dispatching, onClose);

  // Snapshot: the selection at dialog-open time is the dispatch target list.
  const [initialIds] = useState(() => [...new Set(characterIds)]);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setTargetsLoading(true);
    void Promise.allSettled(initialIds.map((id) => getHostCharacter(id, controller.signal))).then((results) => {
      if (cancelled) return;
      setTargets(
        results.map((result, index) => {
          const characterId = initialIds[index]!;
          if (result.status === "fulfilled") {
            return {
              characterId,
              name: result.value.name,
              avatarPath: result.value.avatarPath,
              note: "",
              style: { kind: "inherit" } as BehaviorSelection,
              loadError: false,
            };
          }
          return {
            characterId,
            name: characterId,
            avatarPath: null,
            note: "",
            style: { kind: "inherit" } as BehaviorSelection,
            loadError: true,
          };
        }),
      );
      setTargetsLoading(false);
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
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
    if (!remembered) return undefined;
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

  // Move focus to the first real control once the target rows arrive.
  useEffect(() => {
    if (targetsLoading) return;
    const dialog = dialogRef.current;
    const autofocus = dialog?.querySelector<HTMLElement>("[data-ce-autofocus]");
    if (!dialog || !autofocus) return;
    const activeElement = document.activeElement;
    const untouched =
      !activeElement ||
      activeElement === document.body ||
      (activeElement instanceof HTMLElement && activeElement.classList.contains("ce-dialog-close")) ||
      activeElement === dialog;
    if (untouched) autofocus.focus();
  }, [targetsLoading, dialogRef]);

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

  const visibleLorebooks = (lorebooks ?? []).filter(
    (lorebook) =>
      !lorebookFilter.trim() || lorebook.name.toLocaleLowerCase().includes(lorebookFilter.trim().toLocaleLowerCase()),
  );
  const estimate = estimateBulkCalls(targets.length, batchSize);

  const dispatch = async () => {
    if (dispatching || targets.length === 0) return;
    setDispatching(true);
    setDispatchError(null);
    const config = normalizeBulkSessionConfig({
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
    });
    try {
      const session = await createSession({
        targets: targets.map((target) => ({
          characterId: target.characterId,
          ...(target.note.trim() ? { note: target.note.trim() } : {}),
          ...(target.style.kind === "none"
            ? { behaviorOverride: null }
            : target.style.kind === "character"
              ? { behaviorOverride: target.style.id }
              : {}),
        })),
        config,
      });
      storeBulkConfig(config, safeLocalStorage());
      onDispatched(session);
    } catch (error) {
      setDispatchError(error instanceof Error ? error.message : String(error));
      setDispatching(false);
    }
  };

  return (
    <div
      className="ce-overlay"
      role="presentation"
      onClick={() => {
        if (!dispatching) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="ce-dialog ce-shell"
        role="dialog"
        aria-modal="true"
        aria-label={t("cardEditor.dialog.title")}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ce-dialog-head">
          <strong>{t("cardEditor.dialog.title")}</strong>
          <button
            type="button"
            className="ce-dialog-close"
            onClick={onClose}
            disabled={dispatching}
            aria-label={t("cardEditor.dialog.close")}
          >
            <X className="ce-icon" aria-hidden="true" />
          </button>
        </div>
        <div className="ce-dialog-body">
          <DialogTargets
            localization={localization}
            targets={targets}
            targetsLoading={targetsLoading}
            onUpdateTarget={updateTarget}
            onRemoveTarget={removeTarget}
          />

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
                <option value="standard">{t("cardEditor.dialog.model.presetStandard")}</option>
                <option value="strict">{t("cardEditor.dialog.model.presetStrict")}</option>
                <option value="rebalance">{t("cardEditor.dialog.model.presetRebalance")}</option>
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
                max={4}
                onChange={setConcurrency}
              />
            </div>
            <label className="ce-choice">
              <input type="checkbox" checked={rebalance} onChange={(event) => setRebalance(event.target.checked)} />
              <span className="ce-choice-copy">
                <strong>{t("cardEditor.dialog.processing.rebalance")}</strong>
                <small>{t("cardEditor.dialog.processing.rebalanceHint")}</small>
              </span>
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
              />
              <RadioChoice
                name="ce-save-mode"
                value="duplicate"
                checked={saveMode === "duplicate"}
                onChange={(value) => setSaveMode(value as SaveMode)}
                title={t("cardEditor.dialog.saving.duplicate")}
              />
            </div>
            <p className="ce-caption">{t("cardEditor.dialog.saving.caption")}</p>
          </fieldset>
        </div>
        <div className="ce-dialog-foot">
          {dispatchError ? (
            <div className="ce-status ce-status--error ce-foot-error" role="alert">
              {t("cardEditor.dialog.dispatchError", { message: dispatchError })}
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
            disabled={dispatching || targets.length === 0}
            onClick={() => void dispatch()}
          >
            {dispatching ? t("cardEditor.dialog.dispatching") : t("cardEditor.dialog.dispatch")}
          </button>
        </div>
      </section>
    </div>
  );
}
