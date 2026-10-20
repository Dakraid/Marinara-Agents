import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import {
  CARD_SCHEMA_FIELDS,
  parseSchemaText,
  promptSkeleton,
  serializeSchemaText,
  transformResponseJsonSchema,
  type CardSchema,
  type CardSchemaField,
  type SchemaNode,
} from "../../../../shared/src/features/agents/card-editor/card-schema.ts";
import { deleteCardSchema, listCardSchemas, saveCardSchema } from "./api";
import { useDialogFocusTrap } from "./dialog-controls";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";

type Path = number[];
type Preview = "markdown" | "xml" | "json" | "schema";

const PREVIEWS: readonly Preview[] = ["markdown", "xml", "json", "schema"];

function nodeAt(root: SchemaNode, path: Path): SchemaNode {
  return path.reduce((node, index) => node.children[index]!, root);
}

/** Immutable update of the node at `path`. */
function updateAt(root: SchemaNode, path: Path, update: (node: SchemaNode) => SchemaNode | null): SchemaNode {
  if (path.length === 0) return update(root) ?? root;
  const [head, ...rest] = path;
  const children = root.children.flatMap((child, index) => {
    if (index !== head) return [child];
    if (rest.length > 0) return [updateAt(child, rest, update)];
    const next = update(child);
    return next ? [next] : [];
  });
  return { ...root, children };
}

function attributesText(node: SchemaNode): string {
  return node.attributes
    .map((attribute) => `${attribute.name}=${[...attribute.values, ...(attribute.open ? ["etc."] : [])].join(" | ")}`)
    .join("\n");
}

function parseAttributesText(text: string): SchemaNode["attributes"] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawName = "", rawValues = ""] = line.split("=");
      const values = rawValues
        .split("|")
        .map((value) => value.trim().replace(/"/g, ""))
        .filter(Boolean);
      const open = values.length > 0 && /^etc\.?$/i.test(values[values.length - 1]!);
      return { name: rawName.trim(), values: open ? values.slice(0, -1) : values, ...(open ? { open: true } : {}) };
    });
}

function newSchemaId(): string {
  return `user-${globalThis.crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Schema studio: one schema, two editors. The builder edits the tree; the text view edits the XML
 * template form directly (parse errors block saving and switching back). Previews show exactly
 * what the model is asked for in each output format, plus the JSON Schema sent as structured output.
 */
export function SchemaStudio({
  localization,
  initialSchemaId,
  onClose,
  onSchemasChanged,
}: {
  localization?: CardEditorLocalizationContext;
  initialSchemaId?: string;
  onClose: () => void;
  onSchemasChanged: (schemas: CardSchema[], selectedId: string) => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [schemas, setSchemas] = useState<CardSchema[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState(initialSchemaId ?? "simple");
  const [name, setName] = useState("");
  const [root, setRoot] = useState<SchemaNode | null>(null);
  const [text, setText] = useState("");
  const [textErrors, setTextErrors] = useState<{ line: number; message: string }[]>([]);
  const [mode, setMode] = useState<"builder" | "text">("builder");
  const [selectedPath, setSelectedPath] = useState<Path>([]);
  const [preview, setPreview] = useState<Preview>("xml");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dialogRef = useDialogFocusTrap(true, () => busy, onClose);

  const load = (schema: CardSchema) => {
    setSelectedId(schema.id);
    setName(schema.name);
    setRoot(schema.root);
    setText(serializeSchemaText(schema.root));
    setTextErrors([]);
    setSelectedPath(schema.root.children.length > 0 ? [0] : []);
    setDirty(false);
    setConfirmDelete(false);
    setError(null);
  };

  useEffect(() => {
    const controller = new AbortController();
    listCardSchemas(controller.signal)
      .then((list) => {
        setSchemas(list);
        const first = list.find((schema) => schema.id === initialSchemaId) ?? list[0];
        if (first) load(first);
      })
      .catch(() => setLoadError(true));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once; later selections are explicit
  }, []);

  const current = schemas?.find((schema) => schema.id === selectedId) ?? null;
  const builtIn = current?.builtIn === true;
  const textValid = textErrors.length === 0;
  const working: CardSchema | null = root ? { id: selectedId, name: name || selectedId, root } : null;

  const previewText = !working
    ? ""
    : preview === "schema"
      ? JSON.stringify(transformResponseJsonSchema(working, "structured"), null, 2)
      : promptSkeleton(working, preview);

  const editRoot = (next: SchemaNode) => {
    setRoot(next);
    setText(serializeSchemaText(next));
    setDirty(true);
  };
  const editSelected = (patch: (node: SchemaNode) => SchemaNode | null) => {
    if (!root) return;
    editRoot(updateAt(root, selectedPath, patch));
  };
  const onText = (next: string) => {
    setText(next);
    setDirty(true);
    const parsed = parseSchemaText(next);
    if (parsed.ok) {
      setRoot(parsed.root);
      setTextErrors([]);
    } else {
      setTextErrors(parsed.errors);
    }
  };

  const addChild = (path: Path) => {
    if (!root) return;
    const parent = nodeAt(root, path);
    let key = "new-element";
    for (let index = 2; parent.children.some((child) => child.key === key); index++) key = `new-element-${index}`;
    editRoot(
      updateAt(root, path, (node) => ({
        ...node,
        children: [...node.children, { key, attributes: [], children: [] }],
      })),
    );
    setSelectedPath([...path, parent.children.length]);
  };
  const move = (path: Path, delta: -1 | 1) => {
    if (!root || path.length === 0) return;
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1]!;
    const target = index + delta;
    const parent = nodeAt(root, parentPath);
    if (target < 0 || target >= parent.children.length) return;
    editRoot(
      updateAt(root, parentPath, (node) => {
        const children = [...node.children];
        [children[index], children[target]] = [children[target]!, children[index]!];
        return { ...node, children };
      }),
    );
    setSelectedPath([...parentPath, target]);
  };
  const remove = (path: Path) => {
    if (!root || path.length === 0) return;
    editRoot(updateAt(root, path, () => null));
    setSelectedPath(path.slice(0, -1));
  };

  const persist = async (asNew: boolean) => {
    if (!root || !textValid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const id = asNew || builtIn ? newSchemaId() : selectedId;
      const schemaName = (asNew || builtIn ? t("cardEditor.schemas.copyName", { name: name }) : name).trim() || id;
      const saved = await saveCardSchema({ id, name: schemaName.slice(0, 120), text: serializeSchemaText(root) });
      const list = await listCardSchemas();
      setSchemas(list);
      load(list.find((schema) => schema.id === saved.id) ?? saved);
      onSchemasChanged(list, saved.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  const removeSchema = async () => {
    if (!current || builtIn || busy) return;
    setBusy(true);
    try {
      await deleteCardSchema(current.id);
      const list = await listCardSchemas();
      setSchemas(list);
      if (list[0]) load(list[0]);
      onSchemasChanged(list, list[0]?.id ?? "simple");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  const selected = root ? nodeAt(root, selectedPath) : null;
  const topLevel = selectedPath.length === 1;

  const renderNode = (node: SchemaNode, path: Path, depth: number) => {
    const isSelected = path.join(".") === selectedPath.join(".");
    const target = node.target ?? (depth === 1 ? "description" : null);
    return (
      <li
        key={path.join(".") || "root"}
        className="ce-schema-node"
        style={{ ["--ce-depth" as string]: Math.min(depth, 4) }}
      >
        <button
          type="button"
          className={`ce-schema-node-head${isSelected ? " ce-schema-node-head--selected" : ""}`}
          aria-pressed={isSelected}
          onClick={() => setSelectedPath(path)}
        >
          <code className="ce-schema-key">{`<${node.key}>`}</code>
          {node.children.length > 0 ? (
            <span className="ce-chip">{t("cardEditor.schemas.kindGroup")}</span>
          ) : node.attributes.some((attribute) => attribute.values.length > 0) ? (
            <span className="ce-chip">{t("cardEditor.schemas.kindVocab")}</span>
          ) : null}
          {node.repeat ? <span className="ce-chip">{t("cardEditor.schemas.kindRepeat")}</span> : null}
          {node.maxLength ? (
            <span className="ce-chip">{t("cardEditor.schemas.maxChip", { max: node.maxLength })}</span>
          ) : null}
          {target ? (
            <span className="ce-chip ce-chip--ok">{t("cardEditor.schemas.targetChip", { field: target })}</span>
          ) : null}
          {node.hint ? <span className="ce-schema-hint">{node.hint}</span> : null}
        </button>
        {node.children.length > 0 ? (
          <ul className="ce-schema-tree">
            {node.children.map((child, index) => renderNode(child, [...path, index], depth + 1))}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <div className="ce-overlay" role="presentation" onClick={() => (!busy ? onClose() : undefined)}>
      <section
        ref={dialogRef}
        className="ce-dialog ce-shell ce-studio"
        role="dialog"
        aria-modal="true"
        aria-label={t("cardEditor.schemas.title")}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ce-dialog-head">
          <strong>{t("cardEditor.schemas.title")}</strong>
          <button
            type="button"
            className="ce-dialog-close"
            onClick={onClose}
            disabled={busy}
            aria-label={t("cardEditor.schemas.close")}
          >
            <X className="ce-icon" aria-hidden="true" />
          </button>
        </div>
        {loadError ? (
          <div className="ce-status ce-status--error" role="alert">
            {t("cardEditor.schemas.loadError")}
          </div>
        ) : null}
        <div className="ce-studio-body">
          <nav className="ce-studio-list" aria-label={t("cardEditor.schemas.listLabel")}>
            {(schemas ?? []).map((schema) => (
              <button
                key={schema.id}
                type="button"
                className="ce-studio-list-item"
                aria-pressed={schema.id === selectedId}
                onClick={() => load(schema)}
              >
                <strong>{schema.name}</strong>
                <small>{schema.builtIn ? t("cardEditor.schemas.builtIn") : t("cardEditor.schemas.yours")}</small>
              </button>
            ))}
          </nav>

          <div className="ce-studio-edit">
            <div className="ce-studio-bar">
              <div className="ce-segmented" role="radiogroup" aria-label={t("cardEditor.schemas.modeLabel")}>
                <button
                  type="button"
                  role="radio"
                  className="ce-segment"
                  aria-checked={mode === "builder"}
                  disabled={!textValid}
                  onClick={() => setMode("builder")}
                >
                  {t("cardEditor.schemas.modeBuilder")}
                </button>
                <button
                  type="button"
                  role="radio"
                  className="ce-segment"
                  aria-checked={mode === "text"}
                  onClick={() => setMode("text")}
                >
                  {t("cardEditor.schemas.modeText")}
                </button>
              </div>
              <span className={`ce-caption${textValid ? "" : " ce-item-failure"}`} role="status">
                {textValid
                  ? t("cardEditor.schemas.valid")
                  : t("cardEditor.schemas.invalid", { line: textErrors[0]!.line, message: textErrors[0]!.message })}
              </span>
            </div>
            {mode === "text" ? (
              <textarea
                className="mari-chrome-field ce-field ce-studio-text"
                value={text}
                spellCheck={false}
                aria-label={t("cardEditor.schemas.textLabel")}
                onChange={(event) => onText(event.target.value)}
              />
            ) : root ? (
              <>
                <div className="ce-studio-tree">
                  <ul className="ce-schema-tree">{renderNode(root, [], 0)}</ul>
                </div>
                {selected ? (
                  <div className="ce-studio-inspector">
                    <label className="ce-label" htmlFor="ce-node-key">
                      <span className="ce-label-title">{t("cardEditor.schemas.nodeKey")}</span>
                      <input
                        id="ce-node-key"
                        className="mari-chrome-field ce-field"
                        value={selected.key}
                        onChange={(event) =>
                          editSelected((node) => ({
                            ...node,
                            key: event.target.value.replace(/[^\w.-]/g, "-") || "element",
                          }))
                        }
                      />
                    </label>
                    <label className="ce-label" htmlFor="ce-node-target">
                      <span className="ce-label-title">{t("cardEditor.schemas.nodeTarget")}</span>
                      <select
                        id="ce-node-target"
                        className="mari-chrome-field ce-field"
                        value={selected.target ?? ""}
                        disabled={!topLevel}
                        onChange={(event) =>
                          editSelected((node) => {
                            const { target: _target, ...rest } = node;
                            return event.target.value
                              ? { ...rest, target: event.target.value as CardSchemaField }
                              : rest;
                          })
                        }
                      >
                        <option value="">
                          {topLevel ? t("cardEditor.schemas.targetDefault") : t("cardEditor.schemas.targetInherit")}
                        </option>
                        {CARD_SCHEMA_FIELDS.filter((field) => field !== "description").map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="ce-label ce-studio-wide" htmlFor="ce-node-hint">
                      <span className="ce-label-title">{t("cardEditor.schemas.nodeHint")}</span>
                      <input
                        id="ce-node-hint"
                        className="mari-chrome-field ce-field"
                        value={selected.hint ?? ""}
                        placeholder={t("cardEditor.schemas.nodeHintPlaceholder")}
                        onChange={(event) =>
                          editSelected((node) => {
                            const { hint: _hint, ...rest } = node;
                            const hint = event.target.value.replace(/--/g, "–");
                            return hint ? { ...rest, hint } : rest;
                          })
                        }
                      />
                    </label>
                    <label className="ce-label ce-studio-wide" htmlFor="ce-node-attributes">
                      <span className="ce-label-title">{t("cardEditor.schemas.nodeAttributes")}</span>
                      <textarea
                        id="ce-node-attributes"
                        className="mari-chrome-field ce-field ce-textarea"
                        rows={2}
                        spellCheck={false}
                        defaultValue={attributesText(selected)}
                        key={`${selectedPath.join(".")}:${selectedId}`}
                        onBlur={(event) =>
                          editSelected((node) => ({ ...node, attributes: parseAttributesText(event.target.value) }))
                        }
                      />
                      <small>{t("cardEditor.schemas.nodeAttributesHint")}</small>
                    </label>
                    <label className="ce-label" htmlFor="ce-node-max">
                      <span className="ce-label-title">{t("cardEditor.schemas.nodeMax")}</span>
                      <input
                        id="ce-node-max"
                        type="number"
                        min={0}
                        className="mari-chrome-field ce-field ce-number-input"
                        value={selected.maxLength ?? ""}
                        disabled={selected.children.length > 0}
                        placeholder={t("cardEditor.schemas.nodeMaxNone")}
                        onChange={(event) =>
                          editSelected((node) => {
                            const { maxLength: _max, ...rest } = node;
                            const max = Math.trunc(Number(event.target.value));
                            return max > 0 ? { ...rest, maxLength: max } : rest;
                          })
                        }
                      />
                    </label>
                    <label className="ce-choice">
                      <input
                        type="checkbox"
                        checked={selected.repeat === true}
                        disabled={selectedPath.length === 0}
                        onChange={(event) =>
                          editSelected((node) => {
                            const { repeat: _repeat, ...rest } = node;
                            return event.target.checked ? { ...rest, repeat: true } : rest;
                          })
                        }
                      />
                      <span className="ce-choice-copy">
                        <strong>{t("cardEditor.schemas.nodeRepeat")}</strong>
                      </span>
                    </label>
                    <div className="ce-studio-node-actions ce-studio-wide">
                      <button
                        type="button"
                        className="mari-chrome-control mari-chrome-control--small"
                        onClick={() => addChild(selectedPath)}
                      >
                        <Plus className="ce-icon" aria-hidden="true" />
                        {t("cardEditor.schemas.addChild")}
                      </button>
                      <button
                        type="button"
                        className="mari-chrome-control mari-chrome-control--small"
                        disabled={selectedPath.length === 0}
                        aria-label={t("cardEditor.schemas.moveUp")}
                        onClick={() => move(selectedPath, -1)}
                      >
                        <ArrowUp className="ce-icon" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="mari-chrome-control mari-chrome-control--small"
                        disabled={selectedPath.length === 0}
                        aria-label={t("cardEditor.schemas.moveDown")}
                        onClick={() => move(selectedPath, 1)}
                      >
                        <ArrowDown className="ce-icon" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="mari-chrome-control mari-chrome-control--small ce-danger-button"
                        disabled={selectedPath.length === 0}
                        onClick={() => remove(selectedPath)}
                      >
                        <Trash2 className="ce-icon" aria-hidden="true" />
                        {t("cardEditor.schemas.removeNode")}
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="ce-studio-preview">
            <div className="ce-studio-bar">
              <div className="ce-segmented" role="radiogroup" aria-label={t("cardEditor.schemas.previewLabel")}>
                {PREVIEWS.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    role="radio"
                    className="ce-segment"
                    aria-checked={preview === entry}
                    onClick={() => setPreview(entry)}
                  >
                    {t(`cardEditor.schemas.preview.${entry}`)}
                  </button>
                ))}
              </div>
            </div>
            <pre className="ce-studio-pre" tabIndex={0} aria-label={t("cardEditor.schemas.previewLabel")}>
              {previewText}
            </pre>
            <p className="ce-caption">{t(`cardEditor.schemas.previewHint.${preview}`)}</p>
          </div>
        </div>
        <div className="ce-dialog-foot">
          {error ? (
            <div className="ce-status ce-status--error ce-foot-error" role="alert">
              {error}
            </div>
          ) : null}
          <label className="ce-label ce-studio-name" htmlFor="ce-schema-name">
            <span className="ce-sr-only">{t("cardEditor.schemas.name")}</span>
            <input
              id="ce-schema-name"
              className="mari-chrome-field ce-field"
              value={name}
              disabled={builtIn}
              placeholder={t("cardEditor.schemas.name")}
              onChange={(event) => {
                setName(event.target.value);
                setDirty(true);
              }}
            />
          </label>
          {!builtIn && current ? (
            confirmDelete ? (
              <span className="ce-confirm-strip" role="group" aria-label={t("cardEditor.schemas.delete")}>
                <span className="ce-caption">{t("cardEditor.schemas.deleteConfirm", { name: current.name })}</span>
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--small ce-danger-button"
                  disabled={busy}
                  onClick={() => void removeSchema()}
                >
                  {t("cardEditor.schemas.deleteYes")}
                </button>
                <button
                  type="button"
                  className="mari-chrome-control mari-chrome-control--small"
                  onClick={() => setConfirmDelete(false)}
                >
                  {t("cardEditor.schemas.deleteNo")}
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="mari-chrome-control mari-chrome-control--small"
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              >
                {t("cardEditor.schemas.delete")}
              </button>
            )
          ) : null}
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busy || !textValid || !root}
            onClick={() => void persist(true)}
          >
            {t("cardEditor.schemas.duplicate")}
          </button>
          {!builtIn ? (
            <button
              type="button"
              className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
              disabled={busy || !textValid || !root || !dirty}
              onClick={() => void persist(false)}
            >
              {t("cardEditor.schemas.save")}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
