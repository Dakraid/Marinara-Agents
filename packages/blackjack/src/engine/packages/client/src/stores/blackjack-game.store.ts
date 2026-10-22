// ──────────────────────────────────────────────
// Zustand Store: Blackjack Table
// ──────────────────────────────────────────────
// Holds the live, per-viewer blackjack snapshot fetched from the game-agnostic
// /turn-games state resource. chatId-guarded so a background chat's game can
// never paint over the visible table. Synchronous only — all async lives in
// use-blackjack.ts.
import { create } from "zustand";
import type { BlackjackPublicView } from "../../../shared/src/features/turn-games/blackjack/types";

export type BlackjackBoardSnapshot = BlackjackPublicView & { chatId: string };

interface BlackjackGameStore {
  current: BlackjackBoardSnapshot | null;
  /** Replace the table with a fresh server snapshot for a chat. */
  setBlackjack: (view: BlackjackPublicView, chatId: string) => void;
  /** Clear the table (optionally only if it belongs to a given chat). */
  clearBlackjack: (chatId?: string) => void;
}

export const useBlackjackGameStore = create<BlackjackGameStore>((set) => ({
  current: null,
  setBlackjack: (view, chatId) => set({ current: { ...view, chatId } }),
  clearBlackjack: (chatId) => set((state) => (!chatId || state.current?.chatId === chatId ? { current: null } : {})),
}));
