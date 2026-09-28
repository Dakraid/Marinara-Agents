import {
  CalendarHeart,
  Flame,
  Handshake,
  HeartHandshake,
  Lightbulb,
  Megaphone,
  PartyPopper,
  PenLine,
  Snowflake,
  Store,
  SunMoon,
  Zap,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { SlpSparkleGlyph } from "../../base/chrome/SlpGlyphs";
import {
  SLP_ACTION_META,
  SLP_ACTION_NAMES,
  type SlpActionName,
  type SlpStirCategory,
} from "../../../../../shared/src/slp/slp-actions.js";

/**
 * The deck, fed from the action catalog: a card per deck lever (`SLP_ACTION_META`), in its category,
 * with its icon. A new action with `deck: true` is a new card; only its icon and words are added here.
 */
const ICONS: Partial<Record<SlpActionName, LucideIcon>> = {
  "set-up-couple": HeartHandshake,
  "steer-couple": CalendarHeart,
  "couple-page": Store,
  "suggest-collab": Handshake,
  "push-collab": Zap,
  "start-rivalry": Flame,
  "cool-rivalry": Snowflake,
  "add-idea": Lightbulb,
  "write-post": PenLine,
  "steer-creator": SunMoon,
  "set-spice": SlpSparkleGlyph as LucideIcon,
  "start-event": PartyPopper,
  "steer-storyline": BookOpen,
  "run-audience": Megaphone,
};

export type SlpStirDeckCard = {
  action: SlpActionName;
  category: SlpStirCategory;
  targets: (typeof SLP_ACTION_META)[SlpActionName]["targets"];
  icon: LucideIcon;
  ai: boolean;
};

export const SLP_STIR_DECK = Object.fromEntries(
  SLP_ACTION_NAMES.filter((name) => SLP_ACTION_META[name].deck).map((name) => [
    name,
    {
      action: name,
      category: SLP_ACTION_META[name].category as SlpStirCategory,
      targets: SLP_ACTION_META[name].targets,
      icon: ICONS[name] ?? (SlpSparkleGlyph as LucideIcon),
      ai: SLP_ACTION_META[name].ai,
    },
  ]),
) as Record<SlpActionName, SlpStirDeckCard>;

/** The order cards show in, per category (the most fun first). */
export const SLP_STIR_DECK_ORDER: SlpActionName[] = [
  "set-up-couple",
  "steer-couple",
  "couple-page",
  "suggest-collab",
  "push-collab",
  "start-rivalry",
  "cool-rivalry",
  "add-idea",
  "write-post",
  "steer-creator",
  "set-spice",
  "start-event",
  "steer-storyline",
  "run-audience",
];

/** A card that waits for another slice (brands and products, R): shown as "soon", not playable. */
export const SLP_STIR_SOON_CARDS: { id: string; category: SlpStirCategory; icon: LucideIcon }[] = [
  { id: "brand-deal", category: "work", icon: Store },
];
