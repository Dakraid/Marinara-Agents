import type { CardOutputFormat, CardSchema } from "../../../../shared/src/features/agents/card-editor/card-schema.ts";
import type {
  MultiCharacterMode,
  TransformConfig,
  TransformOutputMode,
} from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { RadioChoice } from "./dialog-controls";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";

export interface TransformDraft {
  schemaId: string;
  format: CardOutputFormat;
  outputMode: TransformOutputMode;
  multiCharacter: MultiCharacterMode;
  phase2Enabled: boolean;
  phase2Instruction: string;
  phase2AllowSplits: boolean;
  /** null = same schema / format as phase 1. */
  phase2SchemaId: string | null;
  phase2Format: CardOutputFormat | null;
}

export const DEFAULT_TRANSFORM_DRAFT: TransformDraft = {
  schemaId: "simple",
  format: "xml",
  outputMode: "structured",
  multiCharacter: "split",
  phase2Enabled: false,
  phase2Instruction: "",
  phase2AllowSplits: false,
  phase2SchemaId: null,
  phase2Format: null,
};

const FORMATS: readonly CardOutputFormat[] = ["markdown", "xml", "json"];

export function draftFromConfig(config: TransformConfig | undefined): TransformDraft {
  if (!config) return { ...DEFAULT_TRANSFORM_DRAFT };
  return {
    schemaId: config.schema.id,
    format: config.format,
    outputMode: config.outputMode,
    multiCharacter: config.multiCharacter,
    phase2Enabled: config.phase2?.enabled === true,
    phase2Instruction: config.phase2?.instruction ?? "",
    phase2AllowSplits: config.phase2?.allowSplits === true,
    phase2SchemaId: config.phase2?.override?.schema.id ?? null,
    phase2Format: config.phase2?.override?.format ?? null,
  };
}

/** The dispatch config's transform block. The schema travels as a snapshot of the library entry. */
export function configFromDraft(draft: TransformDraft, schemas: readonly CardSchema[], structuredOutput: boolean) {
  const schema = schemas.find((entry) => entry.id === draft.schemaId) ?? schemas[0];
  if (!schema) return null;
  const overrideSchema = draft.phase2SchemaId ? schemas.find((entry) => entry.id === draft.phase2SchemaId) : undefined;
  const override =
    draft.phase2SchemaId || draft.phase2Format
      ? { schema: overrideSchema ?? schema, format: draft.phase2Format ?? draft.format }
      : undefined;
  return {
    schema,
    format: draft.format,
    outputMode: draft.outputMode,
    multiCharacter: draft.multiCharacter,
    structuredOutput,
    ...(draft.phase2Enabled
      ? {
          phase2: {
            enabled: true,
            instruction: draft.phase2Instruction,
            allowSplits: draft.phase2AllowSplits,
            ...(override ? { override } : {}),
          },
        }
      : {}),
  };
}

export function TransformSettings({
  localization,
  draft,
  schemas,
  schemasError,
  agentStructuredOutput,
  onChange,
  onEditSchemas,
}: {
  localization?: CardEditorLocalizationContext;
  draft: TransformDraft;
  schemas: CardSchema[] | null;
  schemasError: boolean;
  /** The agent's Engine switch; null = not reported by this Engine. */
  agentStructuredOutput: boolean | null;
  onChange: (patch: Partial<TransformDraft>) => void;
  onEditSchemas: () => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const schemaOptions = (schemas ?? []).map((schema) => (
    <option key={schema.id} value={schema.id}>
      {schema.builtIn ? t("cardEditor.transform.schemaBuiltIn", { name: schema.name }) : schema.name}
    </option>
  ));
  const formatLabel = (format: CardOutputFormat) => t(`cardEditor.transform.format.${format}`);

  return (
    <fieldset className="ce-section" data-ce-section="transform">
      <legend className="ce-section-heading">{t("cardEditor.transform.title")}</legend>
      <div className="ce-transform-row">
        <label className="ce-label" htmlFor="ce-transform-schema">
          <span className="ce-label-title">{t("cardEditor.transform.schema")}</span>
          <span className="ce-inline-controls">
            <select
              id="ce-transform-schema"
              className="mari-chrome-field ce-field"
              value={draft.schemaId}
              disabled={!schemas}
              onChange={(event) => onChange({ schemaId: event.target.value })}
            >
              {schemaOptions}
            </select>
            <button type="button" className="mari-chrome-control mari-chrome-control--small" onClick={onEditSchemas}>
              {t("cardEditor.transform.editSchemas")}
            </button>
          </span>
        </label>
        <div className="ce-label">
          <span className="ce-label-title">{t("cardEditor.transform.formatLabel")}</span>
          <div className="ce-segmented" role="radiogroup" aria-label={t("cardEditor.transform.formatLabel")}>
            {FORMATS.map((format) => (
              <button
                key={format}
                type="button"
                role="radio"
                aria-checked={draft.format === format}
                className="ce-segment"
                onClick={() => onChange({ format })}
              >
                {formatLabel(format)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {schemasError ? (
        <div className="ce-status ce-status--error" role="alert">
          {t("cardEditor.transform.schemasError")}
        </div>
      ) : null}

      <div className="ce-label">
        <span className="ce-label-title">{t("cardEditor.transform.multiTitle")}</span>
        <div className="ce-choice-list">
          <RadioChoice
            name="ce-multi"
            value="merge"
            checked={draft.multiCharacter === "merge"}
            onChange={() => onChange({ multiCharacter: "merge" })}
            title={t("cardEditor.transform.multiMerge")}
          />
          <RadioChoice
            name="ce-multi"
            value="split"
            checked={draft.multiCharacter === "split"}
            onChange={() => onChange({ multiCharacter: "split" })}
            title={t("cardEditor.transform.multiSplit")}
          />
        </div>
        <small>
          {draft.multiCharacter === "split"
            ? t("cardEditor.transform.multiSplitHint")
            : t("cardEditor.transform.multiMergeHint")}
        </small>
      </div>

      <div className="ce-label">
        <span className="ce-label-title">{t("cardEditor.transform.outputModeTitle")}</span>
        <div className="ce-choice-list">
          <RadioChoice
            name="ce-output-mode"
            value="structured"
            checked={draft.outputMode === "structured"}
            onChange={() => onChange({ outputMode: "structured" })}
            title={t("cardEditor.transform.outputStructured")}
          />
          <RadioChoice
            name="ce-output-mode"
            value="document"
            checked={draft.outputMode === "document"}
            onChange={() => onChange({ outputMode: "document" })}
            title={t("cardEditor.transform.outputDocument")}
          />
        </div>
        <small>
          {draft.outputMode === "structured"
            ? t("cardEditor.transform.outputStructuredHint", { format: formatLabel(draft.format) })
            : t("cardEditor.transform.outputDocumentHint")}
        </small>
      </div>

      <p className="ce-caption" role="status">
        {agentStructuredOutput === null
          ? t("cardEditor.transform.providerJsonUnknown")
          : agentStructuredOutput
            ? t("cardEditor.transform.providerJsonOn")
            : t("cardEditor.transform.providerJsonOff")}
      </p>

      <label className="ce-choice">
        <input
          type="checkbox"
          checked={draft.phase2Enabled}
          onChange={(event) => onChange({ phase2Enabled: event.target.checked })}
        />
        <span className="ce-choice-copy">
          <strong>{t("cardEditor.transform.phase2")}</strong>
          <small>{t("cardEditor.transform.phase2Hint")}</small>
        </span>
      </label>
      {draft.phase2Enabled ? (
        <div className="ce-phase2-box">
          <label className="ce-label" htmlFor="ce-phase2-instruction">
            <span className="ce-label-title">{t("cardEditor.transform.phase2Instruction")}</span>
            <textarea
              id="ce-phase2-instruction"
              className="mari-chrome-field ce-field ce-textarea"
              value={draft.phase2Instruction}
              placeholder={t("cardEditor.transform.phase2InstructionPlaceholder")}
              onChange={(event) => onChange({ phase2Instruction: event.target.value })}
            />
          </label>
          <div className="ce-transform-row">
            <label className="ce-label" htmlFor="ce-phase2-schema">
              <span className="ce-label-title">{t("cardEditor.transform.phase2Schema")}</span>
              <select
                id="ce-phase2-schema"
                className="mari-chrome-field ce-field"
                value={draft.phase2SchemaId ?? ""}
                onChange={(event) => onChange({ phase2SchemaId: event.target.value || null })}
              >
                <option value="">{t("cardEditor.transform.sameAsPhase1")}</option>
                {schemaOptions}
              </select>
            </label>
            <label className="ce-label" htmlFor="ce-phase2-format">
              <span className="ce-label-title">{t("cardEditor.transform.formatLabel")}</span>
              <select
                id="ce-phase2-format"
                className="mari-chrome-field ce-field"
                value={draft.phase2Format ?? ""}
                onChange={(event) =>
                  onChange({ phase2Format: (event.target.value || null) as CardOutputFormat | null })
                }
              >
                <option value="">{t("cardEditor.transform.sameAsPhase1")}</option>
                {FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {formatLabel(format)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="ce-choice">
            <input
              type="checkbox"
              checked={draft.phase2AllowSplits}
              disabled={draft.multiCharacter !== "split"}
              onChange={(event) => onChange({ phase2AllowSplits: event.target.checked })}
            />
            <span className="ce-choice-copy">
              <strong>{t("cardEditor.transform.phase2AllowSplits")}</strong>
            </span>
          </label>
        </div>
      ) : null}
    </fieldset>
  );
}
