import { useMutation } from "@tanstack/react-query";
import type { SlpSceneTurnRequest, SlpSceneTurnResponse } from "../../../../../shared/src/slp/slp-scene.js";
import { api } from "../../../lib/api-client.js";

/** One exchange of the role-play sign-up: the next lines and a page patch. Nothing is saved. */
export function useSlpSceneTurn() {
  return useMutation({
    mutationFn: (input: SlpSceneTurnRequest) => {
      const controller = new AbortController();
      // ponytail: fixed 60s ceiling like the stage draft; raise if real turns routinely take longer.
      const timer = setTimeout(() => controller.abort(), 60_000);
      return api
        .post<SlpSceneTurnResponse>("/slurp2/slurp/onboarding/scene/turn", input, { signal: controller.signal })
        .finally(() => clearTimeout(timer));
    },
  });
}
