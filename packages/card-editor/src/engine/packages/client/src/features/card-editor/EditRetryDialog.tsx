import { useState } from "react";
import { X } from "lucide-react";
import type { BulkSession, SessionItem } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { editRetrySessionItem } from "./api";
import { useDialogFocusTrap } from "./dialog-controls";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";

/**
 * Edit & retry (DESIGN §3, SPEC F3.6): the exact rendered prompt of a failed item, editable;
 * retry re-dispatches that single item with the edited text as a single-card call.
 */
export function EditRetryDialog({
  localization,
  session,
  item,
  onClose,
  onRetried,
}: {
  localization?: CardEditorLocalizationContext;
  session: BulkSession;
  item: SessionItem;
  onClose: () => void;
  onRetried: (session: BulkSession) => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const rendered = item.failure?.renderedPrompt ?? null;
  const [system, setSystem] = useState(rendered?.system ?? "");
  const [user, setUser] = useState(rendered?.user ?? "");
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useDialogFocusTrap(true, () => retrying, onClose);

  const retry = async () => {
    if (retrying || !rendered) return;
    setRetrying(true);
    setError(null);
    try {
      onRetried(await editRetrySessionItem(session.id, item.itemId, { system, user }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setRetrying(false);
    }
  };

  return (
    <div
      className="ce-overlay"
      role="presentation"
      onClick={() => {
        if (!retrying) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="ce-dialog ce-shell ce-edit-retry"
        role="dialog"
        aria-modal="true"
        aria-label={t("cardEditor.editRetry.title", { name: item.characterName })}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ce-dialog-head">
          <strong>{t("cardEditor.editRetry.title", { name: item.characterName })}</strong>
          <button
            type="button"
            className="ce-dialog-close"
            onClick={onClose}
            disabled={retrying}
            aria-label={t("cardEditor.editRetry.close")}
          >
            <X className="ce-icon" aria-hidden="true" />
          </button>
        </div>
        <div className="ce-dialog-body">
          {rendered ? (
            <>
              <p className="ce-caption">{t("cardEditor.editRetry.hint")}</p>
              <label className="ce-label" htmlFor="ce-retry-system">
                <span className="ce-label-title">{t("cardEditor.editRetry.system")}</span>
                <textarea
                  id="ce-retry-system"
                  className="mari-chrome-field ce-field ce-textarea ce-template-textarea"
                  value={system}
                  data-ce-autofocus
                  onChange={(event) => setSystem(event.target.value)}
                />
              </label>
              <label className="ce-label" htmlFor="ce-retry-user">
                <span className="ce-label-title">{t("cardEditor.editRetry.user")}</span>
                <textarea
                  id="ce-retry-user"
                  className="mari-chrome-field ce-field ce-textarea ce-template-textarea"
                  value={user}
                  onChange={(event) => setUser(event.target.value)}
                />
              </label>
            </>
          ) : (
            <div className="ce-status" role="status">
              {t("cardEditor.editRetry.missing")}
            </div>
          )}
          {error ? (
            <div className="ce-status ce-status--error" role="alert">
              {t("cardEditor.editRetry.error", { message: error })}
            </div>
          ) : null}
        </div>
        <div className="ce-dialog-foot">
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={retrying}
            onClick={onClose}
          >
            {t("cardEditor.editRetry.cancel")}
          </button>
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
            disabled={retrying || !rendered}
            onClick={() => void retry()}
          >
            {retrying ? t("cardEditor.editRetry.retrying") : t("cardEditor.editRetry.retry")}
          </button>
        </div>
      </section>
    </div>
  );
}
