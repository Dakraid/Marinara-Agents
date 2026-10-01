export const TERRAIN_DATA = {
    plains: { moveCost: 1, defenseBonus: 0, avoidBonus: 0, label: "Plains" },
    forest: { moveCost: 2, defenseBonus: 1, avoidBonus: 15, label: "Forest" },
    mountain: { moveCost: 99, defenseBonus: 0, avoidBonus: 0, impassable: true, label: "Mountain" },
    ruin: { moveCost: 1, defenseBonus: 1, avoidBonus: 10, label: "Ruins" },
    water: { moveCost: 99, defenseBonus: 0, avoidBonus: 0, impassable: true, label: "Water" },
    wall: { moveCost: 99, defenseBonus: 0, avoidBonus: 0, impassable: true, label: "Wall" },
};
//# sourceMappingURL=types.js.map