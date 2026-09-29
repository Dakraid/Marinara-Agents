import { create } from "zustand";
import type { SlpStirOrigin, SlpStirPlan } from "../../../../../shared/src/slp/slp-stir.js";

/**
 * The Stir ✦ sheet (W), openable from anywhere: a profile, a post's ⋯, Creator tools, a storyline in
 * Creator settings, a suggestion. A store, like the Creator settings modal, because the doors live in
 * different trees (and different features). Nothing is persisted.
 */
export type SlpStirTarget = { creatorId: string; postId?: string };
export const useSlpStirSheet = create<{
  target: SlpStirTarget | null;
  open: (target: SlpStirTarget) => void;
  close: () => void;
}>((set) => ({
  target: null,
  open: (target) => set({ target }),
  close: () => set({ target: null }),
}));
export const openSlpStir = (target: SlpStirTarget) => useSlpStirSheet.getState().open(target);

/**
 * A plan that came back after the player left the box (task B: planning never holds them there).
 * Pulse's "Open" and the toast show it in one sheet the app keeps mounted.
 */
export type SlpStirReadyPlan = { plan: SlpStirPlan; origin: SlpStirOrigin; key: number };
export const useSlpStirReadyPlan = create<{ ready: SlpStirReadyPlan | null }>(() => ({ ready: null }));
export const openSlpStirReadyPlan = (plan: SlpStirPlan, origin: SlpStirOrigin) =>
  useSlpStirReadyPlan.setState({ ready: { plan, origin, key: Date.now() } });
