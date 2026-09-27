import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api-client";
import { slpKeys } from "../../base/state/slp-query-keys";
import type { SlpCreatorSteering } from "../../../../../shared/src/slp/slp-creator-steering.js";

type SteeringAnswer = { steering: SlpCreatorSteering };

const key = (creatorId: string) => [...slpKeys.noodlerRoot(), "steering", creatorId] as const;
const path = (creatorId: string) => `/slurp2/slurp/accounts/${encodeURIComponent(creatorId)}/steering`;

export function useSlurpCreatorSteering(creatorId: string) {
  return useQuery({ queryKey: key(creatorId), queryFn: () => api.get<SteeringAnswer>(path(creatorId)) });
}

/** Every change answers with the whole steering, which replaces the cached copy. */
export function useSlurpCreatorSteeringMutations(creatorId: string) {
  const qc = useQueryClient();
  const store = (answer: SteeringAnswer) => qc.setQueryData(key(creatorId), answer);
  return {
    patch: useMutation({
      mutationFn: (patch: Partial<Omit<SlpCreatorSteering, "nudges">>) =>
        api.patch<SteeringAnswer>(path(creatorId), patch),
      onSuccess: store,
    }),
    addIdea: useMutation({
      mutationFn: (idea: { text: string; story: boolean }) =>
        api.post<SteeringAnswer>(`${path(creatorId)}/ideas`, idea),
      onSuccess: store,
    }),
    removeIdea: useMutation({
      mutationFn: (ideaId: string) =>
        api.delete<SteeringAnswer>(`${path(creatorId)}/ideas/${encodeURIComponent(ideaId)}`),
      onSuccess: store,
    }),
  };
}
