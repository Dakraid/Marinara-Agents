import { SlpSparkleGlyph } from "../../base/chrome/SlpGlyphs";
import { useTranslation as useUiTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import { SlurpCreatorProfileCard } from "../../modules/creator/SlpCreatorProfileCard";
import type { SlurpViewerCreator } from "./SlpHomeHelpers";

/** Suggested creators in the feed: a swipeable row of the same cards as Discover (open-only), no box around them. */
export function SlurpInlineSuggestedCreators({
  creators,
  onOpenProfile,
  storyCreatorIds,
}: {
  creators: SlurpViewerCreator[];
  onOpenProfile?: (accountId: string) => void;
  storyCreatorIds?: ReadonlySet<string>;
}) {
  const { t: localizeUi } = useUiTranslation();
  if (creators.length === 0) return null;
  return (
    <aside
      data-component="SlurpHome.InlineSuggestedCreators"
      aria-labelledby="slurp-inline-suggested-creators"
      className="py-1"
    >
      <div className="flex items-center gap-1.5 px-1 pb-2.5">
        <SlpSparkleGlyph size={16} className="shrink-0 text-[var(--slurp-ink)]" aria-hidden="true" />
        <h2 id="slurp-inline-suggested-creators" className={cn(SLP_TYPE.title)}>
          {localizeUi("ui.slurp.suggestedCreators")}
        </h2>
      </div>
      <div className="flex snap-x gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {creators.map((creator) => (
          <SlurpCreatorProfileCard
            key={creator.profile.id}
            creator={creator}
            onOpenProfile={onOpenProfile}
            storyRing={storyCreatorIds?.has(creator.profile.id)}
            className="w-44 shrink-0 snap-start"
          />
        ))}
      </div>
    </aside>
  );
}
