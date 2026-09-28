import { create } from "zustand";

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
