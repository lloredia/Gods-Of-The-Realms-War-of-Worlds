// Unit templates for Gods Of The Realms — War of Worlds
// Data-driven definitions. Each unit gets deep-cloned at battle start.

import { Element } from '../constants/enums';
import { DEFAULT_UNIT_STATS } from '../constants/battleConstants';
import skills from './skills';

function makeUnit(overrides) {
  return {
    ...DEFAULT_UNIT_STATS,
    currentHP: overrides.maxHP || DEFAULT_UNIT_STATS.maxHP,
    buffs: [],
    debuffs: [],
    cooldowns: {},
    turnMeter: 0,
    alive: true,
    ...overrides,
  };
}

// --- TEAM A (Player) ---
export const teamATemplates = [
  makeUnit({
    id: 'zeus',
    name: 'Zeus',
    element: Element.STORM,
    attack: 900,
    speed: 110,
    critRate: 0.25,
    critDamage: 1.7,
    skills: [skills.thunderStrike, skills.stormBreaker, skills.lightningChain],
  }),
  makeUnit({
    id: 'poseidon',
    name: 'Poseidon',
    element: Element.OCEAN,
    maxHP: 12000,
    currentHP: 12000,
    attack: 750,
    defense: 600,
    speed: 95,
    skills: [skills.tidalSlash, skills.healingWave, skills.abyssalCrush],
  }),
  makeUnit({
    id: 'hades',
    name: 'Hades',
    element: Element.UNDERWORLD,
    attack: 850,
    defense: 450,
    speed: 105,
    critRate: 0.20,
    accuracy: 0.95,
    skills: [skills.soulRend, skills.deathMark, skills.plagueSpreader],
  }),
  makeUnit({
    id: 'apollo',
    name: 'Apollo',
    element: Element.SUN,
    attack: 880,
    speed: 115,
    critRate: 0.30,
    critDamage: 1.8,
    skills: [skills.solarFlare, skills.radiantBlessing, skills.divineSmite],
  }),
];

// --- TEAM B (AI) ---
export const teamBTemplates = [
  makeUnit({
    id: 'thor',
    name: 'Thor',
    element: Element.STORM,
    attack: 870,
    speed: 108,
    critRate: 0.22,
    critDamage: 1.65,
    skills: [skills.thunderStrike, skills.stormBreaker, skills.lightningChain],
  }),
  makeUnit({
    id: 'artemis',
    name: 'Artemis',
    element: Element.MOON,
    attack: 820,
    speed: 120,
    critRate: 0.28,
    critDamage: 1.6,
    skills: [skills.moonBeam, skills.lunarShield, skills.eclipseStrike],
  }),
  makeUnit({
    id: 'anubis',
    name: 'Anubis',
    element: Element.UNDERWORLD,
    attack: 830,
    defense: 550,
    speed: 100,
    accuracy: 0.90,
    skills: [skills.soulRend, skills.deathMark, skills.plagueSpreader],
  }),
  makeUnit({
    id: 'ra',
    name: 'Ra',
    element: Element.SUN,
    maxHP: 11000,
    currentHP: 11000,
    attack: 780,
    defense: 520,
    speed: 102,
    skills: [skills.solarFlare, skills.immunityAura, skills.divineSmite],
  }),
];
