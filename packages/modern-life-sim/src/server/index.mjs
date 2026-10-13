// activate: register privileged routes
import "./runtime/esbuild-runtime.mjs";
import "./relationships/archetypes.mjs";
import "./engine/engine-client.mjs";
import "./time/clock.mjs";
import "./schedule/week-grid.mjs";
import "./schedule/whereabouts.mjs";
import "./schedule/week-conversion.mjs";
import "./schedule/routines.mjs";
import "./schedule/model-week.mjs";
import "./jobs/job-catalog.mjs";
import "./jobs/town-jobs.mjs";
import "./jobs/job-week.mjs";
import "./housing/residence-places.mjs";
import "./housing/residence-units.mjs";
import "./housing/residences.mjs";
import "./events/event-registry.mjs";
import "./events/event-run.mjs";
import "./events/event-cast.mjs";
import "./skills/skill-levels.mjs";
import "./skills/skill-perks.mjs";
import "./orientation/attraction-options.mjs";
import "./orientation/orientation.mjs";
import "./traits/traits.mjs";
import "./relationships/bonds.mjs";
import "./relationships/special-event-catalog.mjs";
import "./relationships/special-events.mjs";
import "./relationships/milestones.mjs";
import "./relationships/milestone-steps.mjs";
import "./relationships/birthdays.mjs";
import "./scenes/text-helpers.mjs";
import "./relationships/tier-steps.mjs";
import "./relationships/favours.mjs";
import "./scenes/free-acts.mjs";
import "./relationships/kin.mjs";
import "./scenes/scene-config.mjs";
import "./relationships/starting-relations.mjs";
import "./scenes/scene-engine.mjs";
import "./items/catalog.mjs";
import "./items/cooking.mjs";
import "./items/inventory.mjs";
import "./shop/store-catalog.mjs";
import "./inventory/piles-and-cooking.mjs";
import "./shop/new-arrivals.mjs";
import "./network/npc-pairs.mjs";
import "./network/town-facts.mjs";
import "./network/week-news.mjs";
import "./outings/outing-rules.mjs";
import "./outings/date-tastes.mjs";
import "./outings/outing-places.mjs";
import "./outings/outing-scoring.mjs";
import "./outings/outing-schedule.mjs";
import "./outings/outing-prompts.mjs";
import "./gifts/gift-tastes.mjs";
import "./visits/home-visits.mjs";
import "./llm/model-client.mjs";
import "./cast/read-card.mjs";
import "./game/game-module-api.mjs";
import "./characters/season-outfits.mjs";
import "./characters/portrait-face.mjs";
import "./jobs/office-rules.mjs";
import "./jobs/office-job.mjs";
import "./jobs/interview.mjs";
import "./jobs/work-moments.mjs";
import "./home/home-kinds.mjs";
import "./money/wallet.mjs";
import "./needs/needs.mjs";
import "./town/places.mjs";
import "./town/town-layout.mjs";
import "./album/album.mjs";
import "./characters/figure.mjs";
import "./images/time-of-day.mjs";
import "./images/backgrounds.mjs";
import "./images/image-prompts.mjs";
import "./images/background-gallery.mjs";
import "./people/people-sheet.mjs";
import "./player/player-sheet.mjs";
import "./sleep/sleep-options.mjs";
import "./calendar/calendar-view.mjs";
import "./modules/module-registry.mjs";
import "./money/pleas-and-loans.mjs";
import "./social/rich-impressions.mjs";
import "./social/guest-visits.mjs";
import "./relationships/pair-memories.mjs";
import "./plans/plans.mjs";
import "./outings/outing.mjs";
import "./relationships/birthday-events.mjs";
import "./parties/house-party.mjs";
import "./parties/party.mjs";
import "./relationships/friend-perks.mjs";
import "./home/housemates.mjs";
import "./home/residence.mjs";
import "./home/furniture-and-wardrobe.mjs";
import "./things/things-actions.mjs";
import "./cast/network-env.mjs";
import "./relationships/rivals.mjs";
import "./social/witnesses.mjs";
import "./relationships/network-sheet.mjs";
import "./romance/romantic-acts.mjs";
import "./romance/romanceability.mjs";
import "./romance/jealousy.mjs";
import "./romance/multiple-partners.mjs";
import "./cast/working-now.mjs";
import "./cast/cast-jobs.mjs";
import "./cast/outfits.mjs";
import "./visits/door.mjs";
import "./bonds/own-moments.mjs";
import "./visits/staying-over.mjs";
import "./jobs/office.mjs";
import "./romance/proposal.mjs";
import "./romance/wedding.mjs";
import "./romance/wedding-morning.mjs";
import "./romance/honeymoon.mjs";
import "./romance/marriage-events.mjs";
import "./relationships/friend-opinion.mjs";
import "./relationships/extremes.mjs";
import "./milestones/milestone-availability.mjs";
import "./milestones/milestone-settle.mjs";
import "./relationships/cast-meets.mjs";
import "./scenes/walk-ins.mjs";
import "./llm/shop-lines.mjs";
import "./shop/store-counter.mjs";
import "./travel/vehicles-rides.mjs";
import "./scenes/free-talk.mjs";
import "./cast/schedule-drift.mjs";
import "./game.mjs";
import "./saves/life-save.mjs";
import "./adult/tuning.mjs";
import "./adult/consent.mjs";
import "./adult/settings.mjs";
import "./adult/intimacy-ways.mjs";
import "./adult/spots.mjs";
import "./adult/after-dark.mjs";
import "./adult/intimate-milestone.mjs";
import "./adult/sleep-together.mjs";
import "./adult/intimate-scene-guidance.mjs";
import "./adult/intimacy-outcomes.mjs";
import "./adult/cast-intimacy.mjs";
import "./adult/date-goodbye.mjs";
import "./adult/backdrops.mjs";
import "./adult/club-jealousy.mjs";
import "./adult/party-slip-away.mjs";
import "./adult/club-dance.mjs";
import "./adult/intimate-passage.mjs";
import "./adult/intimate-scene-flow.mjs";
import "./adult/read-adult-cards.mjs";
import "./adult/private-dance-flow.mjs";
import "./adult/club-regulars.mjs";
import "./adult/club-staff.mjs";
import "./adult/guide.mjs";
import "./adult/after-dark-scenes.mjs";
import "./adult/module.mjs";
import "./characters/split-look.mjs";
import "./encounters/quick-lines.mjs";
import "./parties/party-prompts.mjs";
import "./setup/setup-presets.mjs";
import "./llm/drift-words.mjs";
import "./narration/activity-lines.mjs";
import "./narration/help-lines.mjs";
import "./content/release-notes.mjs";
import "./content/welcome-notice.mjs";
import "./content/guide.mjs";
import "./i18n/call-words.mjs";
import "./parties/party-milestone-ids.mjs";
import "./adult/milestone-ids.mjs";
import {
  CALLS_KEPT,
  ID,
  MAX_CAST,
  SAVES_FROM,
  VERSION,
  createService,
  olderVersion,
  traitsCatalog,
} from "./service/create-service.mjs";

async function activate(ctx) {
  let service = createService({
      runtime: ctx.api.runtime,
      pretell: true,
      pictures: true,
    }),
    unregister = await ctx.api.registerPrivilegedRoutes(service.routes, {
      prefix: `/api/${ID}`,
    });
  ctx.api.runtime.logger?.info?.(`[${ID}] ready (${VERSION})`);
  return async () => {
    await unregister?.();
  };
}
export { CALLS_KEPT, ID, MAX_CAST, SAVES_FROM, VERSION, activate, createService, olderVersion, traitsCatalog };
