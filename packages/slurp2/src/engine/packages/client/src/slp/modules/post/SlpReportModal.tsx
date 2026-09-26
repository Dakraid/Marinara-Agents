import { useId, useState } from "react";
import { useTranslation as useUiTranslation } from "react-i18next";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlpButton } from "../chrome/SlpButton";
import { SlpRadioRow, SlpSheet } from "../chrome/SlpSheet";
import { SLP_REPORT_REASONS, useReportSlpContent, type SlpReportReason } from "./slp-post-action-hooks";

/**
 * The wording each reason carries. The list is the one a real social network offers, plus the
 * three that only exist here: a Creator passing themselves off as a real person, paid content
 * reposted for free, and a Creator who reads as underage.
 */
const REASON_LABELS: Record<SlpReportReason, string> = {
  spam: "Spam or misleading",
  scam: "Scam or fraud",
  misinformation: "False information",
  harassment: "Harassment or bullying",
  hate: "Hate speech or symbols",
  violence: "Violence or dangerous behaviour",
  self_harm: "Suicide or self-harm",
  adult: "Adult content in the wrong place",
  underage: "Creator looks underage",
  privacy: "Privacy or personal details",
  intellectual_property: "Intellectual property",
  impersonation: "Pretending to be a real person",
  leaked_paid: "Leaked paid content",
  illegal: "Illegal content",
  other: "Something else",
};

export function SlpReportModal({
  open,
  onClose,
  personaId,
  postId,
  targetType,
  targetId,
}: {
  open: boolean;
  onClose: () => void;
  personaId: string;
  postId: string;
  targetType: "post" | "reply";
  targetId: string;
}) {
  const { t: localizeUi } = useUiTranslation();
  const report = useReportSlpContent();
  const [reason, setReason] = useState<SlpReportReason>("spam");
  const [details, setDetails] = useState("");
  const canSubmit = reason !== "other" || details.trim().length > 0;
  const submit = () => {
    if (!canSubmit) return;
    void report.mutateAsync({ personaId, postId, targetType, targetId, reason, details }).catch(() => undefined);
  };
  const name = useId();
  return (
    <SlpSheet
      open={open}
      onClose={onClose}
      closeDisabled={report.isPending}
      title={localizeUi("ui.slurp.post.report", { defaultValue: "Report content" })}
    >
      {report.isSuccess ? (
        <p className="px-3 pb-2 pt-1 text-sm">
          {localizeUi("ui.slurp.post.reportSubmitted", { defaultValue: "Report submitted." })}
        </p>
      ) : (
        <div className="space-y-4 px-1 pt-1">
          {report.isError && (
            <p role="alert" className="px-2 text-sm text-[var(--slurp-danger)]">
              {report.error instanceof Error
                ? report.error.message
                : localizeUi("ui.slurp.post.reportFailed", { defaultValue: "The report could not be sent." })}
            </p>
          )}
          <fieldset className="min-w-0">
            <legend className={`${SLP_TYPE.meta} px-2 pb-1 text-[var(--slurp-muted)]`}>
              {localizeUi("ui.slurp.post.reportReason", { defaultValue: "Reason" })}
            </legend>
            {SLP_REPORT_REASONS.map((value) => (
              <SlpRadioRow key={value} name={name} checked={reason === value} onChange={() => setReason(value)}>
                {localizeUi(`ui.slurp.post.reportReasons.${value}`, { defaultValue: REASON_LABELS[value] })}
              </SlpRadioRow>
            ))}
          </fieldset>
          <label className="block space-y-1 px-2">
            <span className={`${SLP_TYPE.meta} block text-[var(--slurp-muted)]`}>
              {localizeUi("ui.slurp.post.reportDetails", { defaultValue: "Details" })}
            </span>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full rounded-xl border border-[var(--noodle-divider)] bg-[var(--slurp-surface)] p-3 text-sm"
            />
          </label>
          <div className="sticky bottom-0 flex justify-end gap-2 bg-[linear-gradient(to_top,var(--slurp-surface)_70%,transparent)] px-2 pb-1 pt-3">
            <SlpButton variant="tertiary" onClick={onClose} disabled={report.isPending}>
              {localizeUi("chat.delete.dialog.cancel")}
            </SlpButton>
            <SlpButton onClick={submit} disabled={!canSubmit || report.isPending}>
              {localizeUi("ui.slurp.post.reportSubmit", { defaultValue: "Submit report" })}
            </SlpButton>
          </div>
        </div>
      )}
    </SlpSheet>
  );
}
