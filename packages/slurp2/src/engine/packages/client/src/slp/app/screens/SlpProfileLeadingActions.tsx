import { Check, HandCoins, MessageCircle, Pencil, Plus, UserCheck, UserPlus } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { showConfirmDialog } from "../../../lib/app-dialogs";
import { cn } from "../../../lib/utils";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import { formatUpcomingDay } from "../../base/ui/slp-date-time";
import { SLP_PROFILE_LAYOUT } from "../../features/creators/SlpProfileSurface";
import { SlurpCoin, SlurpCoinAmount, SlurpCoinBurst, SlpCoinText, slpCoinPlainText } from "../../modules/coin/SlpCoin";
import { SlpButton, SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { SlpSheet } from "../../modules/chrome/SlpSheet";
import { useSlpBalance } from "../../modules/chrome/SlpShell";
import { playSlpPop, playSlpSpendMoment } from "../../modules/sparkle/SlpSparkle";
import { slurpSubscriptionPriceOf } from "./SlpHomeHelpers";
import type { StageProfileViewModel } from "./slp-profile-view-model";

const TIP_AMOUNTS = [5, 10, 25, 50];

/**
 * The profile's action row (design step 3). Another Creator: Subscribe, then Follow · Message · Tip
 * (layout "pills": full-width Subscribe and three equal pills; "icons": Subscribe and three 44 px
 * round buttons). The own Creator: New post · Edit profile.
 */
export function SlpProfileLeadingActions({ model }: { model: StageProfileViewModel }) {
  const {
    editing,
    followPending,
    i18n,
    localizeUi,
    offerMessaging,
    onEdit,
    onOpenMessages,
    onToggleFollow,
    onToggleSubscription,
    openComposer,
    profile,
    subscriptionPending,
    subscriptionState,
    viewerCreator,
    viewingOwnCreator,
  } = model;
  const icons = SLP_PROFILE_LAYOUT.actions === "icons";
  if (editing) return null;
  if (viewingOwnCreator) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <SlpButton variant="quiet" onClick={openComposer} className="px-3">
          <Plus size={16} aria-hidden="true" />
          {localizeUi("ui.slurp.profile.newPost", { defaultValue: "New post" })}
        </SlpButton>
        <SlpButton variant="quiet" onClick={onEdit} className="px-3">
          <Pencil size={15} aria-hidden="true" />
          {localizeUi("ui.slurp.profile.editProfile", { defaultValue: "Edit profile" })}
        </SlpButton>
      </div>
    );
  }
  if (!viewerCreator) return null;

  const subscribed = viewerCreator.subscribed;
  const messaging =
    offerMessaging?.dmPolicy === "closed"
      ? ("closed" as const)
      : offerMessaging?.dmPolicy === "paid" && !subscribed && offerMessaging.requestFee > 0
        ? ("paid" as const)
        : ("open" as const);
  const requestFee = offerMessaging?.requestFee ?? 0;
  const day = (iso: string) => formatUpcomingDay(iso, i18n.language);

  const subscribeButton = (
    <SlpPrimaryButton
      disabled={subscriptionPending}
      className={cn("whitespace-nowrap", icons ? "min-w-0 flex-1 px-4" : "w-full")}
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
      {subscriptionState.kind === "ended"
        ? localizeUi("ui.slurp.profile.resubscribe", { defaultValue: "Resubscribe" })
        : localizeUi("ui.slurp.profile.subscribe")}
      <span aria-hidden="true">·</span>
      <SlurpCoinAmount
        amount={slurpSubscriptionPriceOf(viewerCreator)}
        suffix={localizeUi("ui.slurp.unlocksheet.perWeek", { defaultValue: "/ week" })}
      />
    </SlpPrimaryButton>
  );

  const cancelSubscription = async () => {
    const until = subscriptionState.kind === "active" ? subscriptionState.until : null;
    // One click used to cancel a paid subscription with no warning.
    const confirmed = await showConfirmDialog({
      title: localizeUi("ui.slurp.profile.cancelSubscription", { defaultValue: "Cancel subscription?" }),
      message: until
        ? localizeUi("ui.slurp.profile.cancelSubscriptionUntil", {
            defaultValue: "You keep subscriber access until {{day}}. It won't renew after that.",
            day: day(until),
          })
        : localizeUi("ui.slurp.profile.cancelSubscriptionDetail", {
            defaultValue:
              "You keep subscriber access until the week you already paid for ends. It will not renew after that.",
          }),
      confirmLabel: localizeUi("ui.slurp.profile.cancelSubscriptionConfirm", { defaultValue: "Cancel subscription" }),
      cancelLabel: localizeUi("ui.slurp.profile.keepSubscription", { defaultValue: "Keep subscription" }),
      tone: "destructive",
    });
    if (confirmed) await Promise.resolve(onToggleSubscription(profile.id, true)).catch(() => undefined);
  };
  const subscribedLabel = (
    <>
      <Check size={16} strokeWidth={2.5} aria-hidden="true" />
      {localizeUi("ui.slurp.profile.subscribed")}
    </>
  );
  // A cancelled subscription cannot be cancelled again (or resumed: the server keeps it cancelled),
  // so it is a label, and the line below says when it ends.
  const subscribedButton =
    subscriptionState.kind === "cancelled" ? (
      <span
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--slurp-tint)] px-3 text-[13px] font-bold text-[var(--slurp-text)] [&_svg]:!text-[var(--slurp-ink)]",
          icons && "min-w-0 flex-1",
        )}
      >
        {subscribedLabel}
      </span>
    ) : (
      <SlpButton
        disabled={subscriptionPending}
        onClick={() => void cancelSubscription()}
        className={cn("gap-1.5 whitespace-nowrap px-3 text-[13px]", icons && "min-w-0 flex-1 text-sm")}
        aria-haspopup="dialog"
      >
        {subscribedLabel}
      </SlpButton>
    );

  const followLabel = viewerCreator.followed
    ? localizeUi("ui.noodle.connections.tabs.following")
    : localizeUi("ui.slurp.profile.follow");
  // Follow gets a Pop; the capture phase runs it before the click toggles the state.
  const popOnFollow = (target: HTMLElement) => {
    if (!viewerCreator.followed) playSlpPop(target);
  };
  const messageName =
    messaging === "closed"
      ? localizeUi("ui.slurp.profile.messagingUnavailable", { defaultValue: "Messaging unavailable" })
      : messaging === "paid"
        ? slpCoinPlainText(
            localizeUi("ui.slurp.profile.requestMessage", {
              defaultValue: "Request message · {{count}} <coin/>",
              count: requestFee,
            }),
          )
        : localizeUi("ui.slurp.profile.message", { defaultValue: "Message" });

  const tip = <SlpTipSheet model={model} icon={icons} />;

  const statusLine: ReactNode =
    subscriptionState.kind === "active" ? (
      <SlpCoinText>
        {localizeUi("ui.slurp.profile.renewsOn", {
          defaultValue: "Subscribed · renews {{day}} · {{price}} <coin/> / week",
          day: day(subscriptionState.until),
          price: subscriptionState.price,
        })}
      </SlpCoinText>
    ) : subscriptionState.kind === "cancelled" ? (
      localizeUi("ui.slurp.profile.endsOn", {
        defaultValue: "Subscription ends {{day}} · it won't renew",
        day: day(subscriptionState.until),
      })
    ) : !subscribed ? (
      localizeUi("ui.slurp.profile.subscribeBenefits", {
        defaultValue: "Faster replies · Free chat photos · Subscriber-only posts",
      })
    ) : null;

  return (
    <div data-slurp-profile-actions={SLP_PROFILE_LAYOUT.actions} className="min-w-0 @min-[680px]:max-w-lg">
      {icons ? (
        <div className="flex items-center gap-1.5">
          {subscribed ? subscribedButton : subscribeButton}
          {!viewerCreator.subscribed && (
            <SlpButton
              variant="quiet"
              disabled={followPending}
              aria-pressed={viewerCreator.followed}
              aria-label={followLabel}
              title={followLabel}
              onClickCapture={(event) => popOnFollow(event.currentTarget)}
              onClick={() => onToggleFollow(profile.id, viewerCreator.followed)}
              className={cn("w-11 shrink-0 px-0", viewerCreator.followed && "bg-[var(--slurp-tint)]")}
            >
              {viewerCreator.followed ? <UserCheck size={18} /> : <UserPlus size={18} />}
            </SlpButton>
          )}
          <SlpButton
            variant="quiet"
            disabled={messaging === "closed"}
            onClick={() => onOpenMessages(profile.id)}
            aria-label={messageName}
            title={messageName}
            className="w-11 shrink-0 overflow-visible px-0"
          >
            <MessageCircle size={18} />
            {messaging === "paid" && (
              // The request fee rides on the icon, so the price is visible before the tap.
              <span
                aria-hidden="true"
                className="absolute -end-1.5 -top-1.5 inline-flex h-[18px] items-center gap-0.5 rounded-full bg-[var(--slurp-surface-raised)] px-1.5 text-[11px] font-bold tabular-nums text-[var(--slurp-text)] shadow-[var(--slurp-shadow-raised)] ring-1 ring-inset ring-[var(--noodle-divider)]"
              >
                {requestFee}
                <SlurpCoin size={10} />
              </span>
            )}
          </SlpButton>
          {tip}
        </div>
      ) : (
        <>
          {subscribed ? null : subscribeButton}
          <div
            className={cn(
              "grid gap-2",
              !subscribed && "mt-2",
              // A paid request names its price, so Message takes the room the others do not need.
              messaging === "paid"
                ? "grid-cols-[auto_minmax(0,1fr)_auto]"
                : // "Subscribed ✓" needs a little more room than Message and Tip.
                  subscribed
                  ? "grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]"
                  : "grid-cols-3",
            )}
          >
            {viewerCreator.subscribed && subscribedButton}
            {!viewerCreator.subscribed && (
              <SlpButton
                variant="quiet"
                disabled={followPending}
                aria-pressed={viewerCreator.followed}
                onClickCapture={(event) => popOnFollow(event.currentTarget)}
                onClick={() => onToggleFollow(profile.id, viewerCreator.followed)}
                className={cn(
                  "min-w-0 whitespace-nowrap px-3 text-[13px]",
                  viewerCreator.followed && "bg-[var(--slurp-tint)]",
                )}
              >
                {followLabel}
              </SlpButton>
            )}
            <SlpButton
              variant="quiet"
              disabled={messaging === "closed"}
              onClick={() => onOpenMessages(profile.id)}
              aria-label={messaging === "closed" ? messageName : undefined}
              title={messaging === "closed" ? messageName : undefined}
              className="min-w-0 whitespace-nowrap px-3 text-[13px]"
            >
              {messaging === "paid" ? (
                <SlpCoinText>
                  {localizeUi("ui.slurp.profile.requestMessage", {
                    defaultValue: "Request message · {{count}} <coin/>",
                    count: requestFee,
                  })}
                </SlpCoinText>
              ) : (
                localizeUi("ui.slurp.profile.message", { defaultValue: "Message" })
              )}
            </SlpButton>
            {tip}
          </div>
        </>
      )}
      {(statusLine || messaging === "closed") && (
        <p
          className={cn(
            SLP_TYPE.meta,
            "mt-2 text-center text-[var(--slurp-muted)] @min-[680px]:text-start",
            subscriptionState.kind === "active" && "font-semibold",
          )}
        >
          {statusLine}
          {messaging === "closed" && (
            <span className="block">
              {localizeUi("ui.slurp.profile.notTakingMessages", { defaultValue: "Not taking messages right now." })}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * Tip: a glass sheet with 5 / 10 / 25 / 50 © bubbles and a custom amount. One tap sends — no
 * confirmation (user decision); the bubble bursts and the coins fly to the balance chip.
 */
function SlpTipSheet({ model, icon }: { model: StageProfileViewModel; icon: boolean }) {
  const { customTip, localizeUi, profile, setCustomTip, setTipOpen, tipCreator, tipOpen, viewerAccount } = model;
  const tipButtonRef = useRef<HTMLButtonElement | null>(null);
  const coins = useSlpBalance();
  const [sentAmount, setSentAmount] = useState<number | null>(null);
  const custom = Number(customTip);
  const customValid = Number.isInteger(custom) && custom >= 1 && custom <= 9999;
  const canSend = (amount: number) =>
    Boolean(viewerAccount?.entityId) && !tipCreator.isPending && (coins === null || amount <= coins);
  const sendTip = (amount: number, origin: DOMRect) => {
    if (!viewerAccount?.entityId) return;
    setSentAmount(amount);
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
      {
        // The sheet stays open while the tip is in flight, so the Burst starts on the tapped bubble
        // as the sheet slides away and the coins fly to the balance chip.
        onSuccess: () => {
          setTipOpen(false);
          playSlpSpendMoment(origin);
          toast.success(
            <SlpCoinText>
              {localizeUi("ui.slurp.profile.tipSentAmount", {
                defaultValue: "Tip sent · {{amount}} <coin/>",
                amount,
              })}
            </SlpCoinText>,
          );
        },
        onError: () =>
          toast.error(
            localizeUi("ui.slurp.profile.tipFailed", {
              defaultValue: "The tip didn't go through. Your coins are safe.",
            }),
          ),
        onSettled: () => setSentAmount(null),
      },
    );
  };
  const label = localizeUi("ui.slurp.profile.tip", { defaultValue: "Tip" });
  return (
    <>
      <SlpButton
        ref={tipButtonRef}
        variant="quiet"
        disabled={tipCreator.isPending}
        aria-haspopup="dialog"
        aria-expanded={tipOpen}
        aria-label={icon ? label : undefined}
        title={icon ? label : undefined}
        onClick={() => setTipOpen((open) => !open)}
        className={icon ? "w-11 shrink-0 px-0" : "min-w-0 whitespace-nowrap px-3 text-[13px]"}
      >
        {icon ? <HandCoins size={18} /> : label}
      </SlpButton>
      <SlpSheet
        open={tipOpen}
        onClose={() => setTipOpen(false)}
        anchorRef={tipButtonRef}
        title={localizeUi("ui.slurp.profile.tipCreator", { defaultValue: "Tip {{name}}", name: profile.displayName })}
      >
        <div className="px-3 pb-2 pt-1" data-slurp-tip-sheet>
          {coins !== null && (
            <p className={cn(SLP_TYPE.meta, "mb-3 text-[var(--slurp-muted)]")}>
              <SlpCoinText>
                {localizeUi("ui.slurp.profile.tipBalance", {
                  defaultValue: "You have {{amount}} <coin/>",
                  amount: coins,
                })}
              </SlpCoinText>
            </p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {TIP_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                aria-busy={sentAmount === amount}
                disabled={!canSend(amount)}
                onClick={(event) => sendTip(amount, event.currentTarget.getBoundingClientRect())}
                aria-label={slpCoinPlainText(
                  localizeUi("ui.slurp.profile.tipSendAmount", { defaultValue: "Send {{amount}} <coin/>", amount }),
                )}
                className="relative isolate flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[image:var(--slurp-nav-active)] text-[var(--slurp-text)] shadow-[var(--slurp-highlight),0_8px_20px_-14px_var(--noodle-accent)] ring-1 ring-inset ring-[var(--noodle-accent)]/35 transition-[transform,filter] duration-[var(--slurp-motion-fast)] hover:brightness-110 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] disabled:cursor-not-allowed disabled:opacity-40 aria-busy:opacity-100 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <SlurpCoinBurst active={sentAmount === amount} />
                <span className="flex items-center gap-1 text-[17px] font-extrabold tabular-nums leading-5">
                  {amount}
                  <SlurpCoin size={15} />
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={9999}
              value={customTip}
              placeholder={localizeUi("ui.slurp.profile.customTipPlaceholder", { defaultValue: "Other amount" })}
              onChange={(event) => setCustomTip(event.target.value)}
              aria-label={localizeUi("ui.slurp.profile.customTip", { defaultValue: "Custom tip amount" })}
              className="min-h-11 min-w-0 flex-1 rounded-full bg-[var(--slurp-surface)] px-4 text-sm tabular-nums shadow-[inset_0_0_0_1px_var(--noodle-divider)] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--slurp-focus)]"
            />
            <SlpPrimaryButton
              disabled={!customValid || !canSend(custom)}
              onClick={(event) => {
                sendTip(custom, event.currentTarget.getBoundingClientRect());
                setCustomTip("");
              }}
              className="shrink-0 whitespace-nowrap px-4"
            >
              {customValid ? (
                <SlpCoinText>
                  {localizeUi("ui.slurp.profile.tipSendAmount", {
                    defaultValue: "Send {{amount}} <coin/>",
                    amount: custom,
                  })}
                </SlpCoinText>
              ) : (
                localizeUi("ui.slurp.profile.sendTip", { defaultValue: "Send" })
              )}
            </SlpPrimaryButton>
          </div>
          <p className={cn(SLP_TYPE.meta, "mt-3 text-center text-[var(--slurp-muted)]")}>
            {localizeUi("ui.slurp.profile.tipHint", { defaultValue: "One tap sends. A tip is a gift." })}
          </p>
        </div>
      </SlpSheet>
    </>
  );
}
