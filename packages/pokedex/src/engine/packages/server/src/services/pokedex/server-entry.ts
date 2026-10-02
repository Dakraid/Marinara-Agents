import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import type { FastifyPluginAsync } from "fastify";
import { pokedexAgentRuntime } from "./agent-runtime.js";
import { configurePokedexRuntime } from "./package-runtime.js";
import { contributePokedexContext } from "./prompt-context.js";
import { pokedexRoutes } from "./routes.js";
import { readPokedexVault } from "./vault.js";

type ActivationContext = {
  api: {
    runtime: CapabilityRuntimeHost;
    registerService(name: string, service: unknown): () => void;
    registerPromptContext(contributor: typeof contributePokedexContext): () => void;
    registerPrivilegedRoutes(routes: FastifyPluginAsync, options: { prefix: string }): Promise<() => void>;
  };
};

let ready = false;

export async function activate({ api }: ActivationContext) {
  const releases: Array<() => void> = [configurePokedexRuntime(api.runtime)];
  const unwind = () => {
    while (releases.length > 0) releases.pop()!();
  };
  try {
    releases.push(await api.registerPrivilegedRoutes(pokedexRoutes, { prefix: "/api/pokedex" }));
    releases.push(api.registerService("agent-runtime:pokedex", pokedexAgentRuntime));
    releases.push(api.registerPromptContext(contributePokedexContext));
    ready = true;
    return () => {
      ready = false;
      unwind();
    };
  } catch (error) {
    unwind();
    throw error;
  }
}

export async function selfCheck() {
  if (!ready) throw new Error("Pokédex did not initialize");
  await readPokedexVault("__marinara_capability_self_check__");
}
