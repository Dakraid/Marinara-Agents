import { z } from "zod";
/** Explicit capabilities: names and prose never grant interrupts or boss privileges. */
export const combatBossSchema = z.object({
    points: z.number().int().min(0).max(6),
    anticipation: z.boolean().default(true),
    attackCost: z.number().int().min(1).max(6).optional(),
    defendCost: z.number().int().min(1).max(6).optional(),
    moveCost: z.number().int().min(1).max(6).optional(),
});
export const combatInterruptFields = {
    projectile: z.boolean().optional(),
    requiresSight: z.boolean().optional(),
    spell: z.boolean().optional(),
    areaRadius: z.number().int().min(0).max(3).optional(),
    friendlyFire: z.boolean().optional(),
    targetScope: z.enum(["single", "all-enemies"]).optional(),
    reaction: z.enum(["counterspell", "guard"]).optional(),
    range: z.number().int().min(1).max(12).optional(),
    slotLevel: z.number().int().min(1).max(9).optional(),
    legendaryCost: z.number().int().min(1).max(6).optional(),
};
//# sourceMappingURL=combat-director.js.map