// Summon pool definitions for Gods Of The Realms — War of Worlds
// Defines rarity tiers and summon rates for future gacha system.

/**
 * Summon rarity tiers with pull rates.
 * Rates must sum to 1.0.
 */
export const SUMMON_RATES = Object.freeze({
  1: 0.30,   // 30% — 1-star creature
  2: 0.25,   // 25% — 2-star creature
  3: 0.25,   // 25% — 3-star hero
  4: 0.15,   // 15% — 4-star hero
  5: 0.05,   // 5% — 5-star legendary
});

/**
 * Summon pool — which heroes are available at each natural star rating.
 * Heroes summon at their natural star rating and can be evolved up to 6.
 */
export const SUMMON_POOL = {
  1: ['goblin', 'skeleton', 'slime', 'imp', 'bat'],
  2: ['wolf', 'serpent', 'wraith', 'harpy', 'golem', 'minotaur', 'chimera', 'hydra', 'phoenix_chick', 'shadow_sprite'],
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
