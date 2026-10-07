import { setSeed, clearSeed } from '../src/utils/random.js';

export function makeUnit(overrides = {}) {
  return {
    id: 'unit',
    name: 'Unit',
    element: 'Storm',
    faction: null,
    role: 'Attacker',
    maxHP: 5000,
    currentHP: 5000,
    attack: 800,
    defense: 400,
    speed: 100,
    critRate: 0,
    critDamage: 1.5,
    accuracy: 1,
    resistance: 0,
    level: 1,
    stars: 4,
    awakened: false,
    buffs: [],
    debuffs: [],
    cooldowns: {},
    turnMeter: 100,
    alive: true,
    skills: [],
    ...overrides,
  };
}

export function withSeed(seed, fn) {
  setSeed(seed);
  try {
    return fn();
  } finally {
    clearSeed();
  }
}
