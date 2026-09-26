import type { ComponentProps } from "react";
import { cn } from "../../../lib/utils";
import { playSlpPop, SlpGlint } from "../sparkle/SlpSparkle";

/**
 * The primary call to action (design language §7): Slurp pink fill, pink glow, a glint on appear,
 * a Pop on press, plum text, pill, at least 44 px. One per screen; say the outcome in the label.
 * (The hero gradient is kept for signature cards and Story rings; as a button it read as a second
 * brand colour.)
 */
export function SlpPrimaryButton({
  className,
  children,
  onClick,
  type = "button",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type={type}
      {...props}
      onClick={(event) => {
        playSlpPop(event.currentTarget, { bounce: false });
        onClick?.(event);
      }}
      data-slp-primary-button=""
      className={cn(
        "relative isolate inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold bg-[var(--noodle-accent)] text-[var(--slurp-on-accent)] shadow-[var(--slurp-glow),var(--slurp-highlight)] transition-[transform,filter,box-shadow] duration-[var(--slurp-motion-fast)] ease-[var(--slurp-ease)] hover:brightness-110 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:!text-[var(--slurp-on-accent)]",
        className,
      )}
    >
      <SlpGlint />
      {children}
    </button>
  );
}
