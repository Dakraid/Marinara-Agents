import { BookmarkCheck, BookmarkPlus, MessageCircle } from "lucide-react";
import { useRef } from "react";
import { showConfirmDialog } from "../../../lib/app-dialogs";
import { SlurpCoinAmount, SlurpCoinBurst, SlpCoinText } from "../../modules/coin/SlpCoin";
import { SlpChip, SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { SlpSheet } from "../../modules/chrome/SlpSheet";
import { playSlpSpendMoment } from "../../modules/sparkle/SlpSparkle";
import { slurpSubscriptionPriceOf } from "./SlpHomeHelpers";
import type { StageProfileViewModel } from "./slp-profile-view-model";

/** What a visiting viewer can do on this Creator: subscribe, follow, message, tip. */
export function SlpProfileLeadingActions({ model }: { model: StageProfileViewModel }) {
  const {
    customTip,
    editing,
    followPending,
    localizeUi,
    offerMessaging,
    onOpenMessages,
    onToggleFollow,
    onToggleSubscription,
    profile,
    setCustomTip,
    setTipOpen,
    subscriptionPending,
    tipCreator,
    tipOpen,
    viewerAccount,
    viewerCreator,
    viewingOwnCreator,
  } = model;
  const tipButtonRef = useRef<HTMLButtonElement | null>(null);
  // The sheet closes on send, so the spend moment starts from the Tip button that opened it.
  const playTipMoment = () => {
    if (tipButtonRef.current) playSlpSpendMoment(tipButtonRef.current);
  };
  const sendTip = (amount: number) => {
    if (!viewerAccount?.entityId) return;
    tipCreator.mutate(
      {
        accountId: profile.id,
        personaId: viewerAccount.entityId,
        amount,
        requestId:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
      },
      { onSuccess: playTipMoment },
    );
    setTipOpen(false);
  };

  return !editing && !viewingOwnCreator && viewerCreator ? (
    <>
      {!viewerCreator.subscribed && (
        <button
          type="button"
          disabled={followPending}
          onClick={() => onToggleFollow(profile.id, viewerCreator.followed)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--noodle-divider)] text-[var(--noodle-accent-foreground)] transition-[background-color,opacity,transform] hover:bg-[var(--accent)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--noodle-accent)] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            viewerCreator.followed
              ? localizeUi("ui.noodle.connections.tabs.following")
              : localizeUi("ui.slurp.profile.follow")
          }
          aria-pressed={viewerCreator.followed}
          title={
            viewerCreator.followed
              ? localizeUi("ui.noodle.connections.tabs.following")
              : localizeUi("ui.slurp.profile.follow")
          }
        >
          {viewerCreator.followed ? <BookmarkCheck size={19} /> : <BookmarkPlus size={19} />}
        </button>
      )}
      {viewerCreator.subscribed ? (
        <button
          type="button"
          disabled={subscriptionPending}
          onClick={() =>
            void (async () => {
              // One click used to cancel a paid subscription with no warning.
              if (
                !(await showConfirmDialog({
                  title: localizeUi("ui.slurp.profile.cancelSubscription", {
                    defaultValue: "Cancel subscription?",
                  }),
                  message: localizeUi("ui.slurp.profile.cancelSubscriptionDetail", {
                    defaultValue:
                      "You keep subscriber access until the week you already paid for ends. It will not renew after that.",
                  }),
                  confirmLabel: localizeUi("ui.slurp.profile.cancelSubscriptionConfirm", {
                    defaultValue: "Cancel subscription",
                  }),
                  tone: "destructive",
                }))
              )
                return;
              await Promise.resolve(onToggleSubscription(profile.id, true)).catch(() => undefined);
            })()
          }
          className="relative inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--noodle-accent)]/50 bg-[var(--noodle-accent)]/10 px-5 text-sm font-bold text-[var(--noodle-accent-foreground)] transition-[background-color,opacity,transform] hover:bg-[var(--noodle-accent)]/15 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--noodle-accent)] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {localizeUi("ui.slurp.profile.subscribed")}
        </button>
      ) : (
        <SlpPrimaryButton
          disabled={subscriptionPending}
          onClick={(event) => {
            // One tap, no confirmation: the spend moment is the feedback (design language §7).
            const origin = event.currentTarget.getBoundingClientRect();
            void Promise.resolve(onToggleSubscription(profile.id, false)).then(
              () => playSlpSpendMoment(origin),
              () => undefined,
            );
          }}
        >
          <SlurpCoinBurst active={subscriptionPending} />
          {localizeUi("ui.slurp.profile.subscribe")}
          {" · "}
          <SlurpCoinAmount
            amount={slurpSubscriptionPriceOf(viewerCreator)}
            suffix={localizeUi("ui.slurp.unlocksheet.perWeek", { defaultValue: "/ week" })}
          />
        </SlpPrimaryButton>
      )}
      {!viewerCreator.subscribed && (
        <span className="max-w-52 text-[0.68rem] leading-4 text-[var(--muted-foreground)]">
          {localizeUi("ui.slurp.profile.subscribeBenefits", {
            defaultValue: "Faster replies · Free chat photos · Subscriber-only posts",
          })}
        </span>
      )}
      <button
        type="button"
        disabled={offerMessaging?.dmPolicy === "closed"}
        onClick={() => onOpenMessages(profile.id)}
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[var(--noodle-divider)] px-4 text-sm font-bold transition-[background-color,opacity,transform] hover:bg-[var(--accent)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--noodle-accent)] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <MessageCircle size={16} aria-hidden="true" />
        {offerMessaging?.dmPolicy === "paid" && !viewerCreator.subscribed && offerMessaging.requestFee > 0 ? (
          <SlpCoinText>
            {localizeUi("ui.slurp.profile.requestMessage", {
              defaultValue: "Request message · {{count}} <coin/>",
              count: offerMessaging.requestFee,
            })}
          </SlpCoinText>
        ) : offerMessaging?.dmPolicy === "closed" ? (
          localizeUi("ui.slurp.profile.messagingUnavailable", { defaultValue: "Messaging unavailable" })
        ) : (
          localizeUi("ui.slurp.profile.message", { defaultValue: "Message" })
        )}
      </button>
      <button
        ref={tipButtonRef}
        type="button"
        disabled={tipCreator.isPending}
        aria-haspopup="dialog"
        aria-expanded={tipOpen}
        onClick={() => setTipOpen((open) => !open)}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--noodle-divider)] px-4 text-sm font-bold transition-[background-color,opacity,transform] hover:bg-[var(--accent)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--noodle-accent)] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:opacity-50"
      >
        {localizeUi("ui.slurp.profile.tip", { defaultValue: "Tip" })}
      </button>
      <SlpSheet
        open={tipOpen}
        onClose={() => setTipOpen(false)}
        anchorRef={tipButtonRef}
        title={localizeUi("ui.slurp.profile.tipAmount", { defaultValue: "Tip amount" })}
      >
        <div className="px-3 pb-1 pt-2">
          {/* One tap sends: the price is on the chip, and the spend moment is the feedback. */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 10, 25].map((amount) => (
              <SlpChip key={amount} disabled={!viewerAccount?.entityId} onClick={() => sendTip(amount)}>
                <SlurpCoinAmount amount={amount} />
              </SlpChip>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              min={1}
              max={9999}
              value={customTip}
              onChange={(event) => setCustomTip(event.target.value)}
              aria-label={localizeUi("ui.slurp.profile.customTip", { defaultValue: "Custom tip amount" })}
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--noodle-divider)] bg-[var(--slurp-surface)] px-3 text-sm"
            />
            <SlpPrimaryButton
              disabled={!viewerAccount?.entityId || !Number.isInteger(Number(customTip)) || Number(customTip) < 1}
              onClick={() => {
                sendTip(Number(customTip));
                setCustomTip("");
              }}
              className="px-4"
            >
              {localizeUi("ui.slurp.profile.sendTip", { defaultValue: "Send" })}
            </SlpPrimaryButton>
          </div>
        </div>
      </SlpSheet>
    </>
  ) : null;
}
