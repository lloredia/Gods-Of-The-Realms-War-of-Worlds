// Summon pool definitions for Gods Of The Realms — War of Worlds
// Defines rarity tiers and summon rates for future gacha system.

/**
 * Summon rarity tiers with pull rates.
 * Rates must sum to 1.0.
 */
export const SUMMON_RATES = Object.freeze({
  3: 0.65,   // 65% chance — 3-star (common)
  4: 0.28,   // 28% chance — 4-star (rare)
  5: 0.07,   // 7% chance  — 5-star (legendary)
});

/**
 * Summon pool — which heroes are available at each natural star rating.
 * Heroes summon at their natural star rating and can be evolved up to 6.
 */
export const SUMMON_POOL = {
  3: [
    'hermes', 'hephaestus', 'tyr', 'heimdall', 'sobek',
    'thoth', 'brigid', 'dianCecht', 'fujin', 'inari',
  ],
  4: [
    'zeus', 'poseidon', 'thor', 'freya', 'anubis', 'ra', 'morganLeFay', 'cuChulainn',
    'athena', 'isis', 'nimue', 'raijin', 'benzaiten',
  ],
  5: [
    'hades', 'apollo', 'loki', 'bastet', 'susanoo', 'amaterasu',
    'ares', 'odin', 'fenrir', 'set', 'merlin', 'tsukuyomi', 'izanami',
  ],
};

/**
 * Evolution costs — resources needed to increase star rating.
 * cost[fromStar] = { gold, essences, duplicates }
 */
export const EVOLUTION_COSTS = {
  3: { gold: 5000, essences: 10, duplicates: 0 },
  4: { gold: 20000, essences: 40, duplicates: 1 },
  5: { gold: 100000, essences: 150, duplicates: 2 },
};

/**
 * Awakening costs per star tier.
 */
export const AWAKENING_COSTS = {
  4: { gold: 50000, awakenStones: 20 },
  5: { gold: 150000, awakenStones: 50 },
  6: { gold: 500000, awakenStones: 100 },
};

/**
 * Simulate a single summon. Returns a hero id.
 */
export function simulateSummon() {
  const roll = Math.random();
  let cumulative = 0;

  for (const [star, rate] of Object.entries(SUMMON_RATES)) {
    cumulative += rate;
    if (roll < cumulative) {
      const pool = SUMMON_POOL[star];
      if (!pool || pool.length === 0) continue;
      return {
        heroId: pool[Math.floor(Math.random() * pool.length)],
        stars: parseInt(star),
      };
    }
  }

  // Fallback
  return { heroId: SUMMON_POOL[3]?.[0] || SUMMON_POOL[4][0], stars: 3 };
}
