import { X } from "lucide-react";
import { BehaviorCharacterSelect, type BehaviorSelection } from "./BehaviorCharacterSelect";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";

export type DialogTarget = {
  characterId: string;
  name: string;
  avatarPath: string | null;
  note: string;
  style: BehaviorSelection;
  loadError: boolean;
};

/** Targets section: one row per card with avatar, name, per-card note, style override, and removal. */
export function DialogTargets({
  localization,
  targets,
  targetsLoading,
  onUpdateTarget,
  onRemoveTarget,
}: {
  localization?: CardEditorLocalizationContext;
  targets: DialogTarget[];
  targetsLoading: boolean;
  onUpdateTarget: (characterId: string, patch: Partial<DialogTarget>) => void;
  onRemoveTarget: (characterId: string) => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  return (
    <fieldset className="ce-section" data-ce-section="targets">
      <legend className="ce-section-heading">{t("cardEditor.dialog.targets.title", { count: targets.length })}</legend>
      {targetsLoading ? <div className="ce-status">{t("cardEditor.dialog.targets.loading")}</div> : null}
      {!targetsLoading && targets.length === 0 ? (
        <p className="ce-caption">{t("cardEditor.dialog.targets.empty")}</p>
      ) : null}
      <ul className="ce-targets">
        {targets.map((target, index) => (
          <li className="ce-target" key={target.characterId}>
            <div className="ce-target-identity">
              <span className="ce-target-avatar" aria-hidden="true">
                {target.avatarPath ? (
                  <img src={target.avatarPath} alt="" loading="lazy" />
                ) : (
                  target.name.trim().charAt(0) || "?"
                )}
              </span>
              <span className="ce-target-name">
                {target.name}
                {target.loadError ? (
                  <span className="ce-target-load-error"> {t("cardEditor.dialog.targets.loadFailed")}</span>
                ) : null}
              </span>
            </div>
            <div className="ce-target-controls">
              <input
                type="text"
                className="mari-chrome-field ce-field"
                value={target.note}
                placeholder={t("cardEditor.dialog.targets.notePlaceholder")}
                aria-label={t("cardEditor.dialog.targets.noteLabel", { name: target.name })}
                {...(index === 0 ? { "data-ce-autofocus": true } : {})}
                onChange={(event) => onUpdateTarget(target.characterId, { note: event.target.value })}
              />
              <BehaviorCharacterSelect
                localization={localization}
                selection={target.style}
                onChange={(style) => onUpdateTarget(target.characterId, { style })}
                allowInherit
                buttonLabel={t("cardEditor.dialog.targets.styleLabel", { name: target.name })}
                inheritLabel={t("cardEditor.dialog.targets.styleSession")}
                noneLabel={t("cardEditor.dialog.targets.styleNone")}
              />
            </div>
            <button
              type="button"
              className="ce-target-remove"
              aria-label={t("cardEditor.dialog.targets.remove", { name: target.name })}
              onClick={() => onRemoveTarget(target.characterId)}
            >
              <X className="ce-icon" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
