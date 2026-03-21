// Buff / Debuff system for Gods Of The Realms — War of Worlds
// Apply, tick, resist, and query effects. All multipliers from data/effects.js.

import { random } from '../utils/random';
import { BuffType, DebuffType } from '../constants/enums';
import { MIN_RESIST_CHANCE } from '../constants/battleConstants';
import { isBuffEffect, isDebuffEffect, getEffectMultiplier } from '../data/effects';

const BUFF_TYPES = new Set(Object.values(BuffType));
const DEBUFF_TYPES = new Set(Object.values(DebuffType));

/**
 * Try to apply an effect from a skill to a target.
 * Returns { applied, effectType } or { applied: false, resisted/blocked }
 */
export function tryApplyEffect(skill, caster, target) {
  if (!skill.effectType || skill.effectChance <= 0) {
    return { applied: false };
  }

  // Accuracy vs resistance check
  const hitChance = skill.effectChance * caster.accuracy;
  const resistChance = target.resistance;
  const finalChance = Math.max(MIN_RESIST_CHANCE, hitChance - resistChance);

  const roll = random();
  if (roll > finalChance) {
    return { applied: false, resisted: true, effectType: skill.effectType, roll, threshold: finalChance };
  }

  // Check immunity — only blocks debuffs
  if (DEBUFF_TYPES.has(skill.effectType) && target.buffs.some(b => b.type === BuffType.IMMUNITY)) {
    return { applied: false, blocked: true, effectType: skill.effectType };
  }

  const effect = {
    type: skill.effectType,
    duration: skill.effectDuration,
    source: caster.id,
  };

  if (BUFF_TYPES.has(skill.effectType)) {
    // Refresh duration if already exists, otherwise add
    const existing = target.buffs.findIndex(b => b.type === effect.type);
    if (existing >= 0) {
      target.buffs[existing].duration = effect.duration;
    } else {
      target.buffs.push(effect);
    }
  } else if (DEBUFF_TYPES.has(skill.effectType)) {
    const existing = target.debuffs.findIndex(d => d.type === effect.type);
    if (existing >= 0) {
      target.debuffs[existing].duration = effect.duration;
    } else {
      target.debuffs.push(effect);
    }
  }

  return { applied: true, effectType: skill.effectType, roll, threshold: finalChance };
}

/**
 * Apply a buff directly to a target (for buff-type skills).
 */
export function applyBuff(buffType, duration, caster, target) {
  const effect = { type: buffType, duration, source: caster.id };
  const existing = target.buffs.findIndex(b => b.type === buffType);
  if (existing >= 0) {
    target.buffs[existing].duration = duration;
  } else {
    target.buffs.push(effect);
  }
}

/**
 * Tick down all buff/debuff durations at the START of a unit's turn.
 * Removes expired effects. Returns list of expired effect type strings.
 */
export function tickEffects(unit) {
  const expired = [];

  unit.buffs = unit.buffs.filter(b => {
    b.duration--;
    if (b.duration <= 0) {
      expired.push(b.type);
      return false;
    }
    return true;
  });

  unit.debuffs = unit.debuffs.filter(d => {
    d.duration--;
    if (d.duration <= 0) {
      expired.push(d.type);
      return false;
    }
    return true;
  });

  return expired;
}

/**
 * Check if a unit is stunned.
 */
export function isStunned(unit) {
  return unit.debuffs.some(d => d.type === DebuffType.STUN);
}

/**
 * Check if a unit has heal block.
 */
export function hasHealBlock(unit) {
  return unit.debuffs.some(d => d.type === DebuffType.HEAL_BLOCK);
}

/**
 * Get effective speed considering buffs/debuffs.
 * Reads multipliers from data/effects.js — not hardcoded.
 */
export function getEffectiveSpeed(unit) {
  let spd = unit.speed;
  if (unit.buffs.some(b => b.type === BuffType.SPEED_UP)) {
    spd *= getEffectMultiplier(BuffType.SPEED_UP);
  }
  if (unit.debuffs.some(d => d.type === DebuffType.SLOW)) {
    spd *= getEffectMultiplier(DebuffType.SLOW);
  }
  return Math.floor(spd);
}

/**
 * Format effect type string for display.
 */
export function formatEffect(type) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
