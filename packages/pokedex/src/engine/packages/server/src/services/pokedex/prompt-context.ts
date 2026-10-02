import { buildPokedexTrackerContext } from "../../../../shared/src/features/agents/pokedex/card-html.js";
import { readPokedexVault } from "./vault.js";

type PromptContextRequest = {
  chatId: string;
  chatMeta: Record<string, unknown>;
  mode: string;
  targetCharacterIds?: string[];
  personaId?: string | null;
  placedAgentTypes?: string[];
};

function metadataRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function contributePokedexContext(request: PromptContextRequest) {
  if (request.mode !== "roleplay") return null;
  const metadata = metadataRecord(request.chatMeta);
  if (
    metadata.enableAgents !== true ||
    !Array.isArray(metadata.activeAgentIds) ||
    !metadata.activeAgentIds.includes("pokedex")
  ) {
    return null;
  }
  const vault = await readPokedexVault(request.chatId);
  if (!vault.settings.injectTrackerContext) return null;
  const tracker = escapeXml(buildPokedexTrackerContext(vault));
  if (request.placedAgentTypes?.includes("pokedex")) return tracker;
  return `<context>\n<pokedex_tracker>\n${tracker}\n</pokedex_tracker>\n</context>`;
}
