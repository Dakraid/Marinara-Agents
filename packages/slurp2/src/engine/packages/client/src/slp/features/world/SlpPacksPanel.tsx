import { BackstagePageHeader } from "../../modules/settings/SlpSettingsKit";
import type { SlpBackstagePageProps } from "../backstage/slp-backstage-contract";
import { SlpContentPacksSection } from "./SlpContentPacksSection";
import { SlpStoryPacksPanel } from "./SlpStoryPacksPanel";

export function SlpPacksPanel({ settings, update }: SlpBackstagePageProps) {
  return (
    <div className="space-y-8">
      <BackstagePageHeader detail="Switch packs on for more events, dates and storylines. Each Creator only joins what fits them." />
      <SlpContentPacksSection toggles={settings.contentPacks ?? {}} onChange={(next) => update("contentPacks", next)} />
      <SlpStoryPacksPanel arcs={settings.arcLibrary} events={settings.platformEvents} />
    </div>
  );
}
