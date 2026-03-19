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
  faction: 'The Pantheon',
  element: Element.STORM,
  role: 'Attacker',
  level: 35,
  stars: 5,
  awakened: true,
  attack: 900,
  speed: 110,
  critRate: 0.25,
  critDamage: 1.7,
  skills: [skills.thunderStrike, skills.stormBreaker, skills.lightningChain],
  relicSet: 'wrath',
});

const poseidon = makeUnit({
  id: 'poseidon',
  name: 'Poseidon',
  faction: 'The Pantheon',
  element: Element.OCEAN,
  role: 'Tank',
  level: 35,
  stars: 4,
  awakened: true,
  maxHP: 12000,
  currentHP: 12000,
  attack: 750,
  defense: 600,
  speed: 95,
  skills: [skills.tidalSlash, skills.healingWave, skills.abyssalCrush],
  relicSet: 'vitality',
  passive: { id: 'tidalResilience', name: 'Tidal Resilience', trigger: 'on_turn_start', effect: 'self_heal', value: 0.05, description: 'Heals 5% max HP at the start of each turn.' },
});

const morganLeFay = makeUnit({
  id: 'morganLeFay',
  name: 'Morgan Le Fay',
  faction: 'The Mist Realm',
  element: Element.MOON,
  role: 'Support',
  level: 30,
  stars: 4,
  awakened: false,
  maxHP: 11000,
  currentHP: 11000,
  attack: 720,
  defense: 550,
  speed: 108,
  accuracy: 0.90,
  skills: [skills.mistBolt, skills.avalonRenewal, skills.enchantress],
  relicSet: 'resolve',
});

const susanoo = makeUnit({
  id: 'susanoo',
  name: 'Susanoo',
  faction: 'The Rising Sun',
  element: Element.OCEAN,
  role: 'Attacker',
  level: 35,
  stars: 5,
  awakened: true,
  attack: 860,
  speed: 112,
  critRate: 0.22,
  critDamage: 1.65,
  skills: [skills.tidalBlade, skills.tempestSlash, skills.twinTempest],
  relicSet: 'precision',
});

const thor = makeUnit({
  id: 'thor',
  name: 'Thor',
  faction: "The Allfather's Hall",
  element: Element.STORM,
  role: 'Bruiser',
  level: 35,
  stars: 5,
  awakened: true,
  attack: 870,
  speed: 108,
  critRate: 0.22,
  critDamage: 1.65,
  skills: [skills.thunderStrike, skills.stormBreaker, skills.lightningChain],
  relicSet: 'fortress',
});

const anubis = makeUnit({
  id: 'anubis',
  name: 'Anubis',
  faction: 'The Eternal Sands',
  element: Element.UNDERWORLD,
  role: 'Debuffer',
  level: 30,
  stars: 4,
  awakened: true,
  attack: 830,
  defense: 550,
  speed: 100,
  accuracy: 0.90,
  skills: [skills.soulRend, skills.deathMark, skills.plagueSpreader],
  relicSet: 'resolve',
});

const bastet = makeUnit({
  id: 'bastet',
  name: 'Bastet',
  faction: 'The Eternal Sands',
  element: Element.MOON,
  role: 'Attacker',
  level: 35,
  stars: 5,
  awakened: false,
  attack: 850,
  speed: 118,
  critRate: 0.28,
  critDamage: 1.7,
  skills: [skills.lunarClaw, skills.predatorStrike, skills.catReflexes],
  relicSet: 'tempest',
  passive: { id: 'nineLives', name: 'Nine Lives', trigger: 'on_receive_fatal', effect: 'revive', value: 0.20, usesLeft: 1, description: 'Revives once at 20% HP when receiving a fatal blow.' },
});

const amaterasu = makeUnit({
  id: 'amaterasu',
  name: 'Amaterasu',
  faction: 'The Rising Sun',
  element: Element.SUN,
  role: 'Support',
  level: 30,
  stars: 4,
  awakened: false,
  maxHP: 11000,
  currentHP: 11000,
  attack: 780,
  defense: 520,
  speed: 105,
  skills: [skills.sacredFlame, skills.sunriseBlessing, skills.divineRenewal],
  relicSet: 'vitality',
});

const hades = makeUnit({
  id: 'hades',
  name: 'Hades',
  faction: 'The Pantheon',
  element: Element.UNDERWORLD,
  role: 'Debuffer',
  level: 35,
  stars: 5,
  awakened: true,
  attack: 850,
  defense: 450,
  speed: 105,
  critRate: 0.20,
  accuracy: 0.95,
  skills: [skills.soulRend, skills.deathMark, skills.plagueSpreader],
  passive: { id: 'deathsEmbrace', name: "Death's Embrace", trigger: 'on_receive_fatal', effect: 'revive', value: 0.25, usesLeft: 1, description: 'Revives once at 25% HP when receiving a fatal blow.' },
});

const apollo = makeUnit({
  id: 'apollo',
  name: 'Apollo',
  faction: 'The Pantheon',
  element: Element.SUN,
  role: 'Attacker',
  level: 35,
  stars: 5,
  awakened: true,
  attack: 880,
  speed: 115,
  critRate: 0.30,
  critDamage: 1.8,
  skills: [skills.solarFlare, skills.radiantBlessing, skills.divineSmite],
});

const ra = makeUnit({
  id: 'ra',
  name: 'Ra',
  faction: 'The Eternal Sands',
  element: Element.SUN,
  role: 'Support',
  level: 30,
  stars: 4,
  awakened: false,
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
  faction: "The Allfather's Hall",
  element: Element.MOON,
  role: 'Support',
  level: 30,
  stars: 4,
  awakened: false,
  maxHP: 11500,
  currentHP: 11500,
  attack: 730,
  defense: 560,
  speed: 106,
  skills: [skills.frostTouch, skills.valkyrieBlessing, skills.purifyingLight],
  passive: { id: 'valkyriGrace', name: "Valkyrie's Grace", trigger: 'on_turn_start', effect: 'cleanse_one', description: 'Cleanses 1 debuff at the start of each turn.' },
});

const loki = makeUnit({
  id: 'loki',
  name: 'Loki',
  faction: "The Allfather's Hall",
  element: Element.UNDERWORLD,
  role: 'Debuffer',
  level: 35,
  stars: 5,
  awakened: false,
  attack: 840,
  defense: 460,
  speed: 114,
  critRate: 0.20,
  accuracy: 0.92,
  skills: [skills.shadowDagger, skills.trickstersCurse, skills.veilOfDeceit],
});

const cuChulainn = makeUnit({
  id: 'cuChulainn',
  name: 'Cú Chulainn',
  faction: 'The Mist Realm',
  element: Element.STORM,
  role: 'Attacker',
  level: 35,
  stars: 4,
  awakened: true,
  attack: 890,
  speed: 109,
  critRate: 0.26,
  critDamage: 1.75,
  skills: [skills.gaeBolg, skills.warpSpasm, skills.finalReckoning],
  passive: { id: 'warpFrenzy', name: 'Warp Frenzy', trigger: 'on_turn_start', effect: 'self_heal', value: 0.03, description: 'Battle rage heals 3% max HP each turn.' },
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
