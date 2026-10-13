import { useState } from "react";
import { X } from "lucide-react";
import type { BulkSession, SessionItem } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { repairSessionItem, retrySessionItem } from "./api";
import { useDialogFocusTrap } from "./dialog-controls";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";

/**
 * Fix JSON: the raw response of an item that stayed unparseable after the server's auto-heal and
 * strict-JSON retry. Apply parses the edited text as the model's answer; Retry generation reruns the
 * item; Dismiss leaves it failed.
 */
export function FixJsonDialog({
  localization,
  session,
  item,
  onClose,
  onUpdated,
}: {
  localization?: CardEditorLocalizationContext;
  session: BulkSession;
  item: SessionItem;
  onClose: () => void;
  onUpdated: (session: BulkSession) => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [rawOutput, setRawOutput] = useState(item.failure?.rawOutput ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(item.failure?.message ?? null);
  const dialogRef = useDialogFocusTrap(true, () => busy, onClose);

  const run = async (action: () => Promise<BulkSession>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      onUpdated(await action());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setBusy(false);
    }
  };

  return (
    <div
      className="ce-overlay"
      role="presentation"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="ce-dialog ce-shell ce-edit-retry"
        role="dialog"
        aria-modal="true"
        aria-label={t("cardEditor.fixJson.title", { name: item.characterName })}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ce-dialog-head">
          <strong>{t("cardEditor.fixJson.title", { name: item.characterName })}</strong>
          <button
            type="button"
            className="ce-dialog-close"
            onClick={onClose}
            disabled={busy}
            aria-label={t("cardEditor.editRetry.close")}
          >
            <X className="ce-icon" aria-hidden="true" />
          </button>
        </div>
        <div className="ce-dialog-body">
          <p className="ce-caption">{t("cardEditor.fixJson.hint")}</p>
          <label className="ce-label" htmlFor="ce-fix-json">
            <span className="ce-label-title">{t("cardEditor.fixJson.response")}</span>
            <textarea
              id="ce-fix-json"
              className="mari-chrome-field ce-field ce-textarea ce-template-textarea"
              value={rawOutput}
              spellCheck={false}
              data-ce-autofocus
              onChange={(event) => setRawOutput(event.target.value)}
            />
          </label>
          {error ? (
            <div className="ce-status ce-status--error" role="alert">
              {error}
            </div>
          ) : null}
        </div>
        <div className="ce-dialog-foot">
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busy}
            onClick={onClose}
          >
            {t("cardEditor.fixJson.dismiss")}
          </button>
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busy}
            onClick={() => void run(() => retrySessionItem(session.id, item.itemId))}
          >
            {t("cardEditor.fixJson.regenerate")}
          </button>
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
            disabled={busy || !rawOutput.trim()}
            onClick={() => void run(() => repairSessionItem(session.id, item.itemId, rawOutput))}
          >
            {busy ? t("cardEditor.editRetry.retrying") : t("cardEditor.fixJson.apply")}
          </button>
        </div>
      </section>
    </div>
  );
}
