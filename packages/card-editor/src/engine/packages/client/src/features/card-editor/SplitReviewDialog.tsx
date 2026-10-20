import { useState } from "react";
import { X } from "lucide-react";
import type { BulkSession, SessionItem } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { decodeXmlEntities } from "../../../../shared/src/features/agents/card-editor/text.ts";
import { decideSessionItemSplit, type SplitDecision } from "./api";
import { useDialogFocusTrap } from "./dialog-controls";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";

const PREVIEW_CHARS = 600;

function excerpt(text: string): string {
  const decoded = decodeXmlEntities(text).trim();
  return decoded.length > PREVIEW_CHARS ? `${decoded.slice(0, PREVIEW_CHARS)}…` : decoded;
}

/**
 * Split review: one source came back as several characters. Accept creates one new card per
 * character (the source card is never changed); Retry as one re-runs only this source with the
 * single-card rule; Skip drops it from the run. Names can be corrected before accepting.
 */
export function SplitReviewDialog({
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
  const characters = item.characters ?? [];
  const [names, setNames] = useState(() => characters.map((character) => character.name));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useDialogFocusTrap(true, () => busy, onClose);
  const source = item.previousOutput ?? item.snapshots.description ?? "";

  const decide = async (decision: SplitDecision) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      onUpdated(
        await decideSessionItemSplit(
          session.id,
          item.itemId,
          decision,
          decision === "accept" ? names.map((name) => name.trim()) : undefined,
        ),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setBusy(false);
    }
  };

  return (
    <div className="ce-overlay" role="presentation" onClick={() => (!busy ? onClose() : undefined)}>
      <section
        ref={dialogRef}
        className="ce-dialog ce-shell ce-split-review"
        role="dialog"
        aria-modal="true"
        aria-label={t("cardEditor.split.title", { name: item.characterName })}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ce-dialog-head">
          <strong>{t("cardEditor.split.title", { name: item.characterName })}</strong>
          <button
            type="button"
            className="ce-dialog-close"
            onClick={onClose}
            disabled={busy}
            aria-label={t("cardEditor.split.close")}
          >
            <X className="ce-icon" aria-hidden="true" />
          </button>
        </div>
        <div className="ce-split-body">
          <div className="ce-split-source">
            <span className="ce-label-title">{t("cardEditor.split.source")}</span>
            <pre className="ce-split-source-text" tabIndex={0}>
              {excerpt(source) || t("cardEditor.split.sourceEmpty")}
            </pre>
          </div>
          <div className="ce-split-proposal">
            <div className="ce-notice" role="status">
              <span>
                <strong>{t("cardEditor.split.proposal", { count: characters.length })}</strong>
                {item.splitReason ? ` ${t("cardEditor.split.reason", { reason: item.splitReason })}` : ""}
              </span>
            </div>
            <ol className="ce-split-cards">
              {characters.map((character, index) => {
                const firstField = Object.values(character.fields)[0] ?? "";
                return (
                  <li className="ce-split-card" key={`${index}:${character.name}`}>
                    <label className="ce-label" htmlFor={`ce-split-name-${index}`}>
                      <span className="ce-label-title">{t("cardEditor.split.cardName", { index: index + 1 })}</span>
                      <input
                        id={`ce-split-name-${index}`}
                        className="mari-chrome-field ce-field"
                        value={names[index] ?? ""}
                        placeholder={character.name}
                        onChange={(event) =>
                          setNames((current) =>
                            current.map((name, position) => (position === index ? event.target.value : name)),
                          )
                        }
                      />
                    </label>
                    <pre className="ce-split-card-text">{excerpt(firstField)}</pre>
                    {character.issues?.length ? (
                      <small className="ce-item-failure">
                        {t("cardEditor.split.issues", { count: character.issues.length })}
                      </small>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <p className="ce-caption">{t("cardEditor.split.outcome", { count: characters.length })}</p>
          </div>
        </div>
        <div className="ce-dialog-foot">
          {error ? (
            <div className="ce-status ce-status--error ce-foot-error" role="alert">
              {error}
            </div>
          ) : null}
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busy}
            onClick={() => void decide("reject")}
          >
            {t("cardEditor.split.skip")}
          </button>
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--small"
            disabled={busy}
            onClick={() => void decide("retry-single")}
          >
            {t("cardEditor.split.retrySingle")}
          </button>
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
            disabled={busy}
            onClick={() => void decide("accept")}
          >
            {t("cardEditor.split.accept", { count: characters.length })}
          </button>
        </div>
      </section>
    </div>
  );
}
