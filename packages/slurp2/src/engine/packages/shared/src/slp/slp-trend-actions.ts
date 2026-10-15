/** The Stir lever that starts a trend (docs/TRENDS.md). Kept apart so `slp-actions.ts` stays under its size limit. */
import { z } from "zod";

export const SLP_TREND_ACTIONS = {
  "start-trend": {
    summary:
      "Start a trend on Slurp now (mirror selfies, a dance, a hashtag). The right Creators notice and join over the next days, each in their own way; it peaks and dies down.",
    inputs: { label: "The trend's name, a few words." },
    schema: z.object({ label: z.string().trim().min(1).max(60) }).strict(),
  },
} as const;
