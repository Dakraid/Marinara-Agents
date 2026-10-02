import type { CapabilityRuntimeHost } from "@marinara-engine/shared";

let runtime: CapabilityRuntimeHost | null = null;
let registration = 0;

export function configurePokedexRuntime(next: CapabilityRuntimeHost) {
  const token = ++registration;
  runtime = next;
  return () => {
    if (registration === token) runtime = null;
  };
}

export function getPokedexRuntime(): CapabilityRuntimeHost {
  if (!runtime) throw new Error("Pokédex runtime is not configured");
  return runtime;
}
