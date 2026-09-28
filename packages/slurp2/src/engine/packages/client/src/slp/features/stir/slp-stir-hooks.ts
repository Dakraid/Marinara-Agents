import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { slpKeys } from "../../base/state/slp-query-keys";
import type {
  SlpActionPreview,
  SlpStirOrigin,
  SlpStirPlan,
  SlpStirPlay,
  SlpStirStep,
  SlpStirView,
} from "../../../../../shared/src/slp/slp-stir.js";

const base = "/slurp2/slurp/stir";
const viewKey = (personaId: string) => [...slpKeys.noodlerRoot(), "stir", personaId] as const;

/** Everything the Stir tab shows: what is in play, suggestions, recent plays, and the ids the cards pick from. */
export function useSlurpStir(personaId: string | null) {
  return useQuery({
    queryKey: viewKey(personaId ?? "none"),
    enabled: Boolean(personaId),
    queryFn: () => api.get<SlpStirView>(`${base}?personaId=${encodeURIComponent(personaId!)}`),
  });
}

/** Preview steps: who, what, when, cost, fit notes. Free and writes nothing. */
export function useSlurpStirPreview() {
  return useMutation({
    mutationFn: (steps: SlpStirStep[]) =>
      api.post<{ cards: SlpActionPreview[]; cant: string[] }>(`${base}/preview`, { steps }),
  });
}

/** Plain words → a plan of preview cards (one AI call on the "Plans" row). */
export function useSlurpStirPlan() {
  return useMutation({
    mutationFn: (request: { text: string; creatorId?: string; postId?: string }) =>
      api.post<SlpStirPlan>(`${base}/plan`, request),
  });
}

/**
 * Do it / Undo. A play can touch anything (ties, steering, events, storylines, posts), so every
 * Slurp read refreshes afterwards.
 */
export function useSlurpStirPlay() {
  const qc = useQueryClient();
  const refresh = () => void qc.invalidateQueries({ queryKey: slpKeys.noodlerRoot() });
  return {
    play: useMutation({
      mutationFn: (input: { steps: SlpStirStep[]; origin: SlpStirOrigin; supportMessageId?: string }) =>
        api.post<{ play: SlpStirPlay; results: { ok: boolean; error: string | null }[] }>(`${base}/play`, input),
      onSuccess: refresh,
    }),
    undo: useMutation({
      mutationFn: (id: string) => api.post<{ play: SlpStirPlay }>(`${base}/plays/${encodeURIComponent(id)}/undo`, {}),
      onSuccess: refresh,
    }),
  };
}
