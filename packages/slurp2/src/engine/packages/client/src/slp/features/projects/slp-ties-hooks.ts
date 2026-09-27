import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { slpKeys } from "../../base/state/slp-query-keys";

/** Collabs, rivalries and brand deals, as Studio shows them. Mirrors the server's `/slurp/ties`. */
export type SlurpTiesCreator = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  /** A page this persona runs. */
  own: boolean;
  /** Slurp writes this Creator's posts. */
  automatic: boolean;
};
export type SlurpTiesCollab = {
  id: string;
  hostId: string;
  partnerId: string;
  idea: string;
  hostShare: number;
  status: "asked" | "agreed" | "planned" | "posted" | "declined" | "blocked";
  origin: "world" | "player" | "rivalry" | "dm";
  askedAt: string;
  answeredAt: string | null;
  postId: string | null;
  decline: "busy" | "offBrand" | "noCollabs" | "noAnswer" | "player" | null;
};
export type SlurpTiesRivalry = {
  id: string;
  fromId: string;
  toId: string;
  cause: string;
  stage: "shade" | "feud" | "cooling" | "over";
  stageAt: string;
  ending: "made_up" | "fizzled" | "calmed" | null;
};
export type SlurpTiesDeal = {
  id: string;
  brand: string;
  product: string;
  copy: string;
  creatorId: string;
  fee: number;
  status: "offered" | "accepted" | "planned" | "done" | "declined";
  decline: "offBrand" | "noAds" | "notNow" | "noAnswer" | "player" | null;
  offeredAt: string;
  answeredAt: string | null;
};
export type SlurpTiesView = {
  creators: SlurpTiesCreator[];
  collabs: SlurpTiesCollab[];
  rivalries: SlurpTiesRivalry[];
  deals: SlurpTiesDeal[];
  blocked: string[];
};

const key = (personaId: string) => [...slpKeys.noodlerRoot(), "ties", personaId] as const;
const base = "/slurp2/slurp/ties";

export function useSlurpTies(personaId: string | null) {
  return useQuery({
    queryKey: key(personaId ?? "none"),
    enabled: Boolean(personaId),
    queryFn: () => api.get<SlurpTiesView>(`${base}?personaId=${encodeURIComponent(personaId!)}`),
  });
}

/** Every change answers with the whole view, which replaces the cached copy. */
export function useSlurpTiesMutations(personaId: string) {
  const qc = useQueryClient();
  const store = (view: SlurpTiesView) => qc.setQueryData(key(personaId), view);
  const post = (path: string, body: Record<string, unknown> = {}) =>
    api.post<SlurpTiesView>(`${base}${path}`, { personaId, ...body });
  return {
    push: useMutation({
      mutationFn: (id: string) => post(`/collabs/${encodeURIComponent(id)}/push`),
      onSuccess: store,
    }),
    decline: useMutation({
      mutationFn: (id: string) => post(`/collabs/${encodeURIComponent(id)}/decline`),
      onSuccess: store,
    }),
    block: useMutation({
      mutationFn: (id: string) => post(`/collabs/${encodeURIComponent(id)}/block`),
      onSuccess: store,
    }),
    unblock: useMutation({ mutationFn: (pair: string) => post("/unblock", { key: pair }), onSuccess: store }),
    suggest: useMutation({
      mutationFn: (pair: { aId: string; bId: string }) => post("/collabs", pair),
      onSuccess: store,
    }),
    cool: useMutation({
      mutationFn: (id: string) => post(`/rivalries/${encodeURIComponent(id)}/cool`),
      onSuccess: store,
    }),
    answerDeal: useMutation({
      mutationFn: (answer: { id: string; accept: boolean }) =>
        post(`/deals/${encodeURIComponent(answer.id)}/answer`, { accept: answer.accept }),
      onSuccess: (view) => {
        store(view);
        // A yes pays into the Creator's earnings: the Studio and Wallet cards read them.
        void qc.invalidateQueries({ queryKey: [...slpKeys.noodlerRoot(), "studio"] });
      },
    }),
  };
}
