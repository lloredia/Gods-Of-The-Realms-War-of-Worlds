// Progression system for Gods Of The Realms — War of Worlds
// Handles level scaling, star ratings, and awakening bonuses.
// Framework-agnostic (Unity-portable).

/**
 * Stat growth per level. Each level adds a percentage of base stats.
 * Formula: stat = baseStat * (1 + (level - 1) * GROWTH_PER_LEVEL)
 */
const GROWTH_PER_LEVEL = 0.03; // 3% per level
const MAX_LEVEL = 40;

/**
 * Star multipliers — higher stars = stronger base.
 * Natural star rating determines base stat scaling.
 */
const STAR_MULTIPLIERS = {
  1: 0.60,
  2: 0.75,
  3: 0.90,
  4: 1.00,
  5: 1.15,
  6: 1.30,
};

/**
 * Awakening bonus — flat percentage boost to all stats.
 */
const AWAKENING_BONUS = 0.15; // 15% boost when awakened

/**
 * Apply progression scaling to a unit. Mutates unit in-place.
 * Called during battle initialization after cloning, before relics.
 *
 * Reads: unit.level (default 1), unit.stars (default 4), unit.awakened (default false)
 */
export function applyProgression(unit) {
  const level = unit.level || 1;
  const stars = unit.stars || 4;
  const awakened = unit.awakened || false;

  const starMult = STAR_MULTIPLIERS[stars] || 1.0;
  const levelMult = 1 + (level - 1) * GROWTH_PER_LEVEL;
  const awakenMult = awakened ? (1 + AWAKENING_BONUS) : 1.0;

  const totalMult = starMult * levelMult * awakenMult;

  // Scale combat stats
  unit.maxHP = Math.floor(unit.maxHP * totalMult);
  unit.currentHP = unit.maxHP;
  unit.attack = Math.floor(unit.attack * totalMult);
  unit.defense = Math.floor(unit.defense * totalMult);
  unit.speed = Math.floor(unit.speed * (1 + (level - 1) * GROWTH_PER_LEVEL * 0.5)); // Speed scales at half rate

  // Store resolved progression info for display
  unit._progressionInfo = {
    level,
    stars,
    awakened,
    starMult,
    levelMult: parseFloat(levelMult.toFixed(2)),
  };
}

/**
 * Apply progression to all units in a team.
 */
export function applyTeamProgression(units) {
  for (const unit of units) {
    applyProgression(unit);
  }
}

/**
 * Calculate stats preview for a unit at a given level/star/awakened state.
 * Non-mutating — returns a new stats object.
 */
export function previewStats(baseUnit, level, stars, awakened) {
  const clone = JSON.parse(JSON.stringify(baseUnit));
  clone.level = level;
  clone.stars = stars;
  clone.awakened = awakened;
  applyProgression(clone);
  return {
    maxHP: clone.maxHP,
    attack: clone.attack,
    defense: clone.defense,
    speed: clone.speed,
  };
}

export { MAX_LEVEL, STAR_MULTIPLIERS, GROWTH_PER_LEVEL, AWAKENING_BONUS };
