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

// ---------------------------------------------------------------------------
// Hero definitions — keyed by id for heroRoster, composed into teams below.
// ---------------------------------------------------------------------------

const zeus = makeUnit({
  id: 'zeus',
  name: 'Zeus',
  faction: 'Olympus',
  element: Element.STORM,
  role: 'Attacker',
  attack: 900,
  speed: 110,
  critRate: 0.25,
  critDamage: 1.7,
  skills: [skills.thunderStrike, skills.stormBreaker, skills.lightningChain],
});

const poseidon = makeUnit({
  id: 'poseidon',
  name: 'Poseidon',
  faction: 'Olympus',
  element: Element.OCEAN,
  role: 'Tank',
  maxHP: 12000,
  currentHP: 12000,
  attack: 750,
  defense: 600,
  speed: 95,
  skills: [skills.tidalSlash, skills.healingWave, skills.abyssalCrush],
});

const morganLeFay = makeUnit({
  id: 'morganLeFay',
  name: 'Morgan Le Fay',
  faction: 'Avalon',
  element: Element.MOON,
  role: 'Support',
  maxHP: 11000,
  currentHP: 11000,
  attack: 720,
  defense: 550,
  speed: 108,
  accuracy: 0.90,
  skills: [skills.mistBolt, skills.avalonRenewal, skills.enchantress],
});

const susanoo = makeUnit({
  id: 'susanoo',
  name: 'Susanoo',
  faction: 'Tengoku',
  element: Element.OCEAN,
  role: 'Attacker',
  attack: 860,
  speed: 112,
  critRate: 0.22,
  critDamage: 1.65,
  skills: [skills.tidalBlade, skills.tempestSlash, skills.stormGod],
});

const thor = makeUnit({
  id: 'thor',
  name: 'Thor',
  faction: 'Asgard',
  element: Element.STORM,
  role: 'Bruiser',
  attack: 870,
  speed: 108,
  critRate: 0.22,
  critDamage: 1.65,
  skills: [skills.thunderStrike, skills.stormBreaker, skills.lightningChain],
});

const anubis = makeUnit({
  id: 'anubis',
  name: 'Anubis',
  faction: 'Kemet',
  element: Element.UNDERWORLD,
  role: 'Debuffer',
  attack: 830,
  defense: 550,
  speed: 100,
  accuracy: 0.90,
  skills: [skills.soulRend, skills.deathMark, skills.plagueSpreader],
});

const bastet = makeUnit({
  id: 'bastet',
  name: 'Bastet',
  faction: 'Kemet',
  element: Element.MOON,
  role: 'Attacker',
  attack: 850,
  speed: 118,
  critRate: 0.28,
  critDamage: 1.7,
  skills: [skills.lunarClaw, skills.predatorStrike, skills.catReflexes],
});

const amaterasu = makeUnit({
  id: 'amaterasu',
  name: 'Amaterasu',
  faction: 'Tengoku',
  element: Element.SUN,
  role: 'Support',
  maxHP: 11000,
  currentHP: 11000,
  attack: 780,
  defense: 520,
  speed: 105,
  skills: [skills.sacredFlame, skills.sunriseBlessing, skills.heavenlyRadiance],
});

const hades = makeUnit({
  id: 'hades',
  name: 'Hades',
  faction: 'Olympus',
  element: Element.UNDERWORLD,
  role: 'Debuffer',
  attack: 850,
  defense: 450,
  speed: 105,
  critRate: 0.20,
  accuracy: 0.95,
  skills: [skills.soulRend, skills.deathMark, skills.plagueSpreader],
});

const apollo = makeUnit({
  id: 'apollo',
  name: 'Apollo',
  faction: 'Olympus',
  element: Element.SUN,
  role: 'Attacker',
  attack: 880,
  speed: 115,
  critRate: 0.30,
  critDamage: 1.8,
  skills: [skills.solarFlare, skills.radiantBlessing, skills.divineSmite],
});

const ra = makeUnit({
  id: 'ra',
  name: 'Ra',
  faction: 'Kemet',
  element: Element.SUN,
  role: 'Support',
  maxHP: 11000,
  currentHP: 11000,
  attack: 780,
  defense: 520,
  speed: 102,
  skills: [skills.solarFlare, skills.immunityAura, skills.divineSmite],
});

const freya = makeUnit({
  id: 'freya',
  name: 'Freya',
  faction: 'Asgard',
  element: Element.MOON,
  role: 'Support',
  maxHP: 11500,
  currentHP: 11500,
  attack: 730,
  defense: 560,
  speed: 106,
  skills: [skills.frostTouch, skills.valkyrieBlessing, skills.bifrostShatter],
});

const loki = makeUnit({
  id: 'loki',
  name: 'Loki',
  faction: 'Asgard',
  element: Element.UNDERWORLD,
  role: 'Debuffer',
  attack: 840,
  defense: 460,
  speed: 114,
  critRate: 0.20,
  accuracy: 0.92,
  skills: [skills.shadowDagger, skills.trickstersCurse, skills.chaosUnleashed],
});

const cuChulainn = makeUnit({
  id: 'cuChulainn',
  name: 'Cú Chulainn',
  faction: 'Avalon',
  element: Element.STORM,
  role: 'Attacker',
  attack: 890,
  speed: 109,
  critRate: 0.26,
  critDamage: 1.75,
  skills: [skills.gaeBolg, skills.warpSpasm, skills.riastrad],
});

// --- TEAM A (Player) ---
export const teamATemplates = [zeus, poseidon, morganLeFay, susanoo];

// --- TEAM B (AI) ---
export const teamBTemplates = [thor, anubis, bastet, amaterasu];

// --- Full hero roster (for future team selection) ---
export const heroRoster = {
  zeus,
  poseidon,
  morganLeFay,
  susanoo,
  thor,
  anubis,
  bastet,
  amaterasu,
  hades,
  apollo,
  ra,
  freya,
  loki,
  cuChulainn,
};
