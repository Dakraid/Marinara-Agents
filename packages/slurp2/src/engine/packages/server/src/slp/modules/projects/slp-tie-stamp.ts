/**
 * What a post made for a collab, a brand deal or a rivalry carries in its metadata (`slurpTie`).
 * A leaf on purpose: the beat parser and the money paths read it without pulling in the tie rules.
 */
import { clampText } from "./slp-project.js";

export const SLURP_COLLAB_DEFAULT_SHARE = 50;

export const slurpClampShare = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(90, Math.max(10, Math.round(value)))
    : SLURP_COLLAB_DEFAULT_SHARE;

/** What a post stamped by a tie carries in its metadata (`slurpTie`). */
export type SlurpTieStamp = {
  kind: "collab" | "sponsor" | "rival";
  id: string;
  partnerId?: string;
  hostShare?: number;
  brand?: string;
  /** A post about a deal they turned down: no label, no fee. */
  declined?: boolean;
};

export function readSlurpTieStamp(metadata: Record<string, unknown> | null | undefined): SlurpTieStamp | null {
  const raw = metadata?.slurpTie;
  const value = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
  const kind = (["collab", "sponsor", "rival"] as const).find((entry) => entry === value?.kind);
  const id = clampText(value?.id, 64);
  if (!value || !kind || !id) return null;
  return {
    kind,
    id,
    ...(typeof value.partnerId === "string" ? { partnerId: value.partnerId } : {}),
    ...(typeof value.hostShare === "number" ? { hostShare: slurpClampShare(value.hostShare) } : {}),
    ...(typeof value.brand === "string" ? { brand: clampText(value.brand, 80) } : {}),
    ...(value.declined === true ? { declined: true } : {}),
  };
}
