// Effect definitions for Gods Of The Realms — War of Worlds
// Data-driven effect registry. Engine reads multipliers from here.
// Unity port: maps to ScriptableObject effect assets.

import { BuffType, DebuffType } from '../constants/enums';

// --- Effect definitions ---
// Each effect: { type, isBuff, multiplier, stat, description }
// multiplier: how much the effect modifies the stat (1.5 = +50%, 0.3 = -70%)

const effects = {
  // BUFFS
  [BuffType.ATTACK_UP]: {
    type: BuffType.ATTACK_UP,
    isBuff: true,
    stat: 'attack',
    multiplier: 1.5,
    description: 'Increases Attack by 50%',
  },
  [BuffType.DEFENSE_UP]: {
    type: BuffType.DEFENSE_UP,
    isBuff: true,
    stat: 'defense',
    multiplier: 1.7,
    description: 'Increases Defense by 70%',
  },
  [BuffType.IMMUNITY]: {
    type: BuffType.IMMUNITY,
    isBuff: true,
    stat: null,
    multiplier: null,
    description: 'Blocks incoming debuffs',
  },
  [BuffType.SPEED_UP]: {
    type: BuffType.SPEED_UP,
    isBuff: true,
    stat: 'speed',
    multiplier: 1.3,
    description: 'Increases Speed by 30%',
  },

  // DEBUFFS
  [DebuffType.STUN]: {
    type: DebuffType.STUN,
    isBuff: false,
    stat: null,
    multiplier: null,
    description: 'Cannot act for 1 turn',
  },
  [DebuffType.DEFENSE_BREAK]: {
    type: DebuffType.DEFENSE_BREAK,
    isBuff: false,
    stat: 'defense',
    multiplier: 0.3,
    description: 'Reduces Defense by 70%',
  },
  [DebuffType.SLOW]: {
    type: DebuffType.SLOW,
    isBuff: false,
    stat: 'speed',
    multiplier: 0.7,
    description: 'Reduces Speed by 30%',
  },
  [DebuffType.HEAL_BLOCK]: {
    type: DebuffType.HEAL_BLOCK,
    isBuff: false,
    stat: null,
    multiplier: null,
    description: 'Prevents healing',
  },
};

/**
 * Look up an effect definition by type string.
 */
export function getEffect(effectType) {
  return effects[effectType] || null;
}

/**
 * Check if an effect type is a buff.
 */
export function isBuffEffect(effectType) {
  const effect = effects[effectType];
  return effect ? effect.isBuff : false;
}

/**
 * Check if an effect type is a debuff.
 */
export function isDebuffEffect(effectType) {
  const effect = effects[effectType];
  return effect ? !effect.isBuff : false;
}

/**
 * Get the stat multiplier for an effect. Returns null if effect has no stat modifier.
 */
export function getEffectMultiplier(effectType) {
  const effect = effects[effectType];
  return effect ? effect.multiplier : null;
}

export default effects;
