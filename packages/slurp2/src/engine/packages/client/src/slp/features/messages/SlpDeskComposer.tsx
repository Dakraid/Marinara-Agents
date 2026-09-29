import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Gift, Stamp, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import { focusRing } from "../../base/chrome/slp-focus";
import { SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { SlpSheetGroup } from "../../modules/chrome/SlpSheet";
import { errorMessage } from "../../modules/settings/slp-backstage-format";
import {
  SLP_DESK_NOW,
  SLP_DESK_OFFERABLE,
  type SlpActionName,
} from "../../../../../shared/src/slp/slp-actions.js";
import { SlpStirPlaySheet, slpStirWhat, useSlurpStir } from "../stir/slp-stir-contract";
import { useAddSlurpDeskNote } from "./slp-message-action-hooks";
import type { SlurpThreadViewModel } from "./slp-thread-actions";

/**
 * Slurp Support's composer tools (docs/SUPPORT-DESK.md): pick an Offer or a move, build it in the
 * Stir play sheet, and it rides the next line. The composer bar itself is unchanged.
 */
export function SlpDeskToolPanel({ model, onPicked }: { model: SlurpThreadViewModel; onPicked: () => void }) {
  const { t } = useTranslation();
  const { toolTab, setDeskPick, personaId, targetCreatorAccountId } = model;
  const note = useAddSlurpDeskNote();
  const [text, setText] = useState("");
  if (toolTab === "note")
    return (
      <form
        className="space-y-2 px-1"
        onSubmit={(event) => {
          event.preventDefault();
          if (!personaId || !targetCreatorAccountId || !text.trim()) return;
          note.mutate(
            { personaId, creatorAccountId: targetCreatorAccountId, text: text.trim() },
            {
              onSuccess: () => {
                setText("");
                onPicked();
              },
              onError: (error) => toast.error(errorMessage(error)),
            },
          );
        }}
      >
        <label htmlFor="slurp-desk-note" className={cn(SLP_TYPE.meta, "font-semibold")}>
          {t("ui.slurp.desk.noteLabel", { defaultValue: "A note for yourself. The Creator never sees it." })}
        </label>
        <textarea
          id="slurp-desk-note"
          value={text}
          rows={3}
          maxLength={1000}
          onChange={(event) => setText(event.target.value)}
          className={cn(
            "w-full resize-none rounded-xl bg-[var(--slurp-canvas)] px-3 py-2 text-base ring-1 ring-inset ring-[var(--slurp-outline)] sm:text-sm",
            focusRing,
          )}
        />
        <SlpPrimaryButton type="submit" className="w-full" disabled={!text.trim() || note.isPending}>
          {t("ui.slurp.desk.addNote", { defaultValue: "Add note" })}
        </SlpPrimaryButton>
      </form>
    );
  const mode = toolTab === "offer" ? "offer" : "now";
  const actions: readonly SlpActionName[] = mode === "offer" ? SLP_DESK_OFFERABLE : SLP_DESK_NOW;
  return (
    <SlpSheetGroup>
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          onClick={() => {
            setDeskPick({ action, mode });
            onPicked();
          }}
          className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-start transition-colors hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--slurp-focus)] motion-reduce:transition-none"
        >
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold leading-5">
              {t(`ui.slurp.stir.card.${action}.title`)}
            </span>
            <span className="block text-xs leading-4 text-[var(--slurp-muted)]">{t(`ui.slurp.stir.card.${action}.line`)}</span>
          </span>
        </button>
      ))}
    </SlpSheetGroup>
  );
}

/** The attached Offer or move, above the composer, one tap from removing it. */
export function SlpDeskComposerChip({ model }: { model: SlurpThreadViewModel }) {
  const { t } = useTranslation();
  const { composerDesk, setComposerDesk } = model;
  if (!composerDesk) return null;
  const Icon = composerDesk.mode === "offer" ? Stamp : Gift;
  return (
    <div className="slurp-bubble-in flex min-h-9 max-w-full items-center gap-2 self-start rounded-full bg-[var(--slurp-tint)] ps-3 pe-1 text-xs font-semibold text-[var(--slurp-text)]">
      <Icon size={14} aria-hidden="true" className="shrink-0" />
      <span className="min-w-0 truncate">
        {composerDesk.mode === "offer"
          ? t("ui.slurp.desk.offerAttached", { defaultValue: "Offer: {{what}}", what: slpStirWhat(t, composerDesk.card) })
          : t("ui.slurp.desk.moveAttached", { defaultValue: "With this line: {{what}}", what: slpStirWhat(t, composerDesk.card) })}
      </span>
      <button
        type="button"
        onClick={() => setComposerDesk(null)}
        aria-label={t("ui.slurp.desk.removeAttached", { defaultValue: "Remove" })}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)]"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/** The play sheet an Offer or a move is built in, outside the tools sheet (one overlay at a time). */
export function SlpDeskPlayHost({ model }: { model: SlurpThreadViewModel }) {
  const { t } = useTranslation();
  const { deskPick, setDeskPick, setComposerDesk, personaId, targetCreatorAccountId, draft, setDraft, composerRef } =
    model;
  const stir = useSlurpStir(deskPick ? personaId : null);
  return (
    <SlpStirPlaySheet
      action={deskPick?.action ?? null}
      view={stir.data}
      prefill={targetCreatorAccountId ? { who: [targetCreatorAccountId] } : undefined}
      onClose={() => setDeskPick(null)}
      useLabel={
        deskPick?.mode === "offer"
          ? t("ui.slurp.desk.attachOffer", { defaultValue: "Attach as offer" })
          : t("ui.slurp.desk.attachMove", { defaultValue: "Attach to my message" })
      }
      onUse={(card) => {
        if (!deskPick) return;
        setComposerDesk({ mode: deskPick.mode, card });
        // A warning or a rumour is the line itself: its words fill an empty box.
        const words =
          card.action === "warn-creator"
            ? String(card.input.reason ?? "")
            : card.action === "plant-rumour"
              ? String(card.input.text ?? "")
              : "";
        if (words && !draft.trim()) setDraft(words);
        composerRef.current?.focus();
      }}
    />
  );
}
