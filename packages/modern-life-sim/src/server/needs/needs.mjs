// Energy and hunger needs: drain, sleep, refill, status and checks
var NEEDS_MAX = 100;
var ENERGY_DRAIN_PER_HOUR = 4;
var HUNGER_DRAIN_PER_HOUR = 3;
var SLEEP_ENERGY_PER_HOUR = 12;
var SLEEP_HUNGER_PER_HOUR = 1.5;
var STARVING_ENERGY_FACTOR = 1;
var maxEnergyFor = (fitness = 0) => NEEDS_MAX + Math.max(0, Math.trunc(fitness)) * 3;
var clampNeed = (value, min, max) => Math.min(max, Math.max(min, value));
var roundNeed = (value) => Math.round(value * 10) / 10;
function createNeeds({ energy = 80, hunger = 70 } = {}) {
  return {
    energy: energy,
    hunger: hunger,
  };
}
function drainNeeds(needs, minutes, { extraEnergy = 0, extraHunger = 0, fitness = 0 } = {}) {
  let hours = Math.max(0, minutes) / 60,
    drainFactor = Math.max(0.5, 1 - Math.max(0, fitness) * 0.03),
    starvingHours = Math.max(0, hours - Math.max(0, needs.hunger) / HUNGER_DRAIN_PER_HOUR),
    energy = clampNeed(
      needs.energy -
        (hours * ENERGY_DRAIN_PER_HOUR + starvingHours * ENERGY_DRAIN_PER_HOUR * STARVING_ENERGY_FACTOR + extraEnergy) *
          drainFactor,
      0,
      maxEnergyFor(fitness),
    ),
    hunger = clampNeed(needs.hunger - (hours * HUNGER_DRAIN_PER_HOUR + extraHunger), 0, NEEDS_MAX);
  return {
    energy: roundNeed(energy),
    hunger: roundNeed(hunger),
  };
}
function sleepNeeds(needs, minutes, { bedQuality = 0.7, fitness = 0 } = {}) {
  let hours = Math.max(0, minutes) / 60,
    energy = clampNeed(needs.energy + hours * SLEEP_ENERGY_PER_HOUR * bedQuality, 0, maxEnergyFor(fitness)),
    hunger = clampNeed(needs.hunger - hours * SLEEP_HUNGER_PER_HOUR, 0, NEEDS_MAX);
  return {
    energy: roundNeed(energy),
    hunger: roundNeed(hunger),
  };
}
function refillNeeds(needs, { hunger = 0, energy = 0, fitness = 0 } = {}) {
  return {
    energy: roundNeed(clampNeed(needs.energy + energy, 0, maxEnergyFor(fitness))),
    hunger: roundNeed(clampNeed(needs.hunger + hunger, 0, NEEDS_MAX)),
  };
}
function needsStatus(needs, { fitness = 0 } = {}) {
  let energyShare = needs.energy / maxEnergyFor(fitness);
  return {
    energy: needs.energy,
    hunger: needs.hunger,
    energyMax: maxEnergyFor(fitness),
    energyLow: energyShare < 0.3,
    energyCritical: energyShare < 0.12,
    hungerLow: needs.hunger < 30,
    hungerCritical: needs.hunger < 12,
    exhausted: needs.energy <= 0,
  };
}
function checkEnergyFor(needs, { energy = 0, fitness = 0 } = {}) {
  return needs.energy <= 0
    ? {
        ok: false,
        reason: "You are about to drop. Go home and sleep.",
      }
    : energy > 0 && needs.energy < energy * 0.5
      ? {
          ok: false,
          reason: "You are too tired for that.",
        }
      : {
          ok: true,
          reason: "",
        };
}

export {
  ENERGY_DRAIN_PER_HOUR,
  HUNGER_DRAIN_PER_HOUR,
  NEEDS_MAX,
  SLEEP_ENERGY_PER_HOUR,
  checkEnergyFor,
  createNeeds,
  drainNeeds,
  maxEnergyFor,
  needsStatus,
  refillNeeds,
  sleepNeeds,
};
