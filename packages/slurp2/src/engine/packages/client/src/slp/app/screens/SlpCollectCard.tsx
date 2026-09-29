import { toast } from "sonner";
import { useTranslation as useUiTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { HelpTooltip } from "../../../components/ui/HelpTooltip";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import type { SlurpStudioCreator } from "../../features/economy/slp-economy-contract";
import { useSlurpPayout } from "../../features/economy/slp-economy-hooks";
import { SlpPrimaryButton } from "../../modules/chrome/SlpButton";
import { SlurpCoin, SlurpCoinAmount, SlpCoinText } from "../../modules/coin/SlpCoin";
import { playSlpBurst } from "../../modules/sparkle/SlpSparkle";
import { errorMessage } from "./SlpHomeHelpers";

/**
 * Creator earnings with one action, "Collect 340 ©" (design step 6). The same card sits under the
 * Wallet balance and in Studio, so collecting has one name and one look everywhere.
 *
 * Collect moves today's allowance into the Wallet, which is what connects the two seats the player
 * occupies: a Creator who does well funds their habit as a fan. `burst`: play a Burst from the
 * button when done. The Wallet leaves it off, because its balance card rains coins as it counts up.
 */
export function SlpCollectCard({
  creator,
  personaId,
  burst = false,
}: {
  creator: SlurpStudioCreator;
  personaId: string;
  burst?: boolean;
}) {
  const { t: localizeUi } = useUiTranslation();
  const payout = useSlurpPayout();
  const allowance = creator.payoutAllowance;
  const collect = (button: HTMLElement) => {
    const origin = button.getBoundingClientRect();
    payout.mutate(
      { creatorAccountId: creator.id, personaId, amount: allowance },
      {
        onSuccess: () => {
          if (burst) playSlpBurst(origin);
          toast.success(
            <SlpCoinText>
              {localizeUi("ui.slurp.wallet.collected", {
                defaultValue: "Collected {{amount}} <coin/> into your Wallet",
                amount: allowance,
              })}
            </SlpCoinText>,
          );
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  };
  return (
    <section
      aria-label={localizeUi("ui.slurp.wallet.creatorEarnings", { defaultValue: "Creator earnings" })}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 rounded-2xl bg-[var(--slurp-surface-raised)] p-4 shadow-[var(--slurp-shadow-raised),var(--slurp-highlight)]"
      data-slurp-collect-card
    >
      <div className="min-w-0">
        <p className={cn(SLP_TYPE.meta, "flex items-center gap-1.5 text-[var(--slurp-muted)]")}>
          <SlurpCoin size={14} />
          <span className="truncate">
            {localizeUi("ui.slurp.wallet.creatorEarnings", { defaultValue: "Creator earnings" })}
          </span>
          <HelpTooltip
            side="bottom"
            text={localizeUi("ui.slurp.wallet.creatorEarningsHelp", {
              defaultValue:
                "SlurpCoins earned through your creator page stay here until you collect them into your Wallet.",
            })}
          />
        </p>
        <SlurpCoinAmount
          amount={creator.earnings.coins}
          watchAmount={creator.earnings.coins}
          className="slp-display mt-1 text-[28px] leading-8 tabular-nums"
          size={22}
        />
        <p className={cn(SLP_TYPE.meta, "mt-0.5 text-[var(--slurp-muted)]")}>
          {allowance > 0 ? (
            <SlpCoinText>
              {localizeUi("ui.slurp.wallet.collectToday", {
                defaultValue: "{{amount}} <coin/> ready to collect today",
                amount: allowance,
              })}
            </SlpCoinText>
          ) : creator.earnings.coins <= 0 ? (
            // Nothing earned is not "all collected" (R1-087).
            localizeUi("ui.slurp.wallet.nothingToCollect", { defaultValue: "Nothing to collect yet." })
          ) : (
            localizeUi("ui.slurp.wallet.collectedToday", {
              defaultValue: "All collected for today. More after the daily reset.",
            })
          )}
        </p>
      </div>
      {allowance > 0 && (
        <SlpPrimaryButton
          disabled={payout.isPending}
          aria-busy={payout.isPending}
          onClick={(event) => collect(event.currentTarget)}
          className="whitespace-nowrap px-4"
        >
          <SlpCoinText>
            {localizeUi("ui.slurp.wallet.collectAmount", {
              defaultValue: "Collect {{amount}} <coin/>",
              amount: allowance,
            })}
          </SlpCoinText>
        </SlpPrimaryButton>
      )}
    </section>
  );
}
