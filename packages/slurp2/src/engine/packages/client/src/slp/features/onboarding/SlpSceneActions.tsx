// The row above the scene's composer: move to the next moment, let the scene play by itself for a
// few turns, the preset's suggested actions, and the private direction note.
import { useState } from "react";
import { Compass, Play, Square } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import { SLP_SCENE_ACTIONS } from "../../../../../shared/src/slp/slp-scene.js";
import { cn } from "../../../lib/utils";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpButton, SlpChip, SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { SlpSheet } from "../../modules/chrome/SlpSheet";
import type { SlpSceneModel } from "./slp-scene-model";

/** Turns one "Let it play" press runs. */
export const SLP_SCENE_AUTOPILOT_TURNS = 3;

export function SlpSceneActions({ model }: { model: SlpSceneModel }) {
  const { t } = useUiTranslation();
  const [directionOpen, setDirectionOpen] = useState(false);
  const [draft, setDraft] = useState(model.direction);
  const running = model.autoLeft > 0;
  const next = model.moments[model.moments.indexOf(model.moment) + 1];
  const showNext = Boolean(next) && model.doneMoments.includes(model.moment) && model.setup.preset !== "support";
  const chip = "min-h-9 shrink-0 whitespace-nowrap px-3";
  return (
    <>
      <div
        role="toolbar"
        aria-label={t("ui.slurp.scene.actionsLabel")}
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pt-2 [scrollbar-width:none]"
      >
        {showNext && next && (
          <SlpChip selected className={chip} disabled={model.busy} onClick={() => model.goTo(next)}>
            {t("ui.slurp.scene.next", { moment: t(`ui.slurp.scene.moment.${next}`) })}
          </SlpChip>
        )}
        <SlpChip
          className={chip}
          title={running ? undefined : t("ui.slurp.scene.autopilotHint", { count: SLP_SCENE_AUTOPILOT_TURNS })}
          disabled={!running && model.busy}
          onClick={() => (running ? model.stopAutopilot() : void model.autopilot(SLP_SCENE_AUTOPILOT_TURNS))}
        >
          {running ? <Square size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
          {running ? t("ui.slurp.scene.autopilotStop", { count: model.autoLeft }) : t("ui.slurp.scene.autopilot")}
        </SlpChip>
        {SLP_SCENE_ACTIONS[model.setup.preset].map((id) => (
          <SlpChip
            key={id}
            className={chip}
            disabled={model.busy}
            onClick={() => void model.send({ kind: "suggest", id })}
          >
            {t(`ui.slurp.scene.action.${id}`)}
          </SlpChip>
        ))}
        <SlpChip
          className={chip}
          selected={Boolean(model.direction)}
          title={model.direction || undefined}
          onClick={() => {
            setDraft(model.direction);
            setDirectionOpen(true);
          }}
        >
          <Compass size={12} aria-hidden="true" />
          {t("ui.slurp.scene.direction")}
        </SlpChip>
      </div>
      <SlpSheet
        open={directionOpen}
        onClose={() => setDirectionOpen(false)}
        title={t("ui.slurp.scene.directionTitle")}
        footer={
          <div className="flex justify-end gap-2">
            {model.direction && (
              <SlpButton
                variant="tertiary"
                onClick={() => {
                  model.setDirection("");
                  setDirectionOpen(false);
                }}
              >
                {t("ui.slurp.scene.directionClear")}
              </SlpButton>
            )}
            <SlpPrimaryButton
              onClick={() => {
                model.setDirection(draft.trim());
                setDirectionOpen(false);
              }}
            >
              {t("ui.slurp.scene.directionSave")}
            </SlpPrimaryButton>
          </div>
        }
      >
        <div className="space-y-2 px-1 pb-2">
          <p className={cn(SLP_TYPE.body, "text-pretty text-[var(--slurp-muted)]")}>
            {t("ui.slurp.scene.directionHelp")}
          </p>
          <textarea
            aria-label={t("ui.slurp.scene.directionTitle")}
            value={draft}
            maxLength={300}
            rows={3}
            placeholder={t("ui.slurp.scene.directionPlaceholder")}
            onChange={(event) => setDraft(event.target.value)}
            className="w-full resize-y rounded-xl bg-[var(--slurp-canvas)] px-3 py-2 text-base text-[var(--slurp-text)] outline-none ring-1 ring-inset ring-[var(--noodle-divider)] placeholder:text-[var(--slurp-muted)] focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] sm:text-[13px]"
          />
        </div>
      </SlpSheet>
    </>
  );
}
