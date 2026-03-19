// Damage calculation for Gods Of The Realms — War of Worlds
// Formula: ATK * multiplier * (BASE / (BASE + DEF * FACTOR)) * crit * variance
// All constants imported — no magic numbers.

import { random } from '../utils/random';
import { BuffType, DebuffType } from '../constants/enums';
import {
  DEF_SCALING_BASE,
  DEF_SCALING_FACTOR,
  DAMAGE_VARIANCE_MIN,
  DAMAGE_VARIANCE_RANGE,
  MIN_DAMAGE,
  MIN_HEAL,
} from '../constants/battleConstants';
import { getEffectMultiplier } from '../data/effects';
import { calculateElementModifier } from './elementSystem';

/**
 * Calculate damage dealt by an attacker to a target using a skill.
 * Returns { damage, isCrit, elementAdvantage }
 */
export function calculateDamage(attacker, target, skill) {
  const atk = getEffectiveAttack(attacker);
  const def = getEffectiveDefense(target);

  // Base damage
  let damage = atk * skill.multiplier;

  // Defense reduction
  const defFactor = DEF_SCALING_BASE / (DEF_SCALING_BASE + def * DEF_SCALING_FACTOR);
  damage *= defFactor;

  // Element advantage/disadvantage
  const elementMod = calculateElementModifier(attacker, target);
  damage *= elementMod.multiplier;

  // Crit check
  const isCrit = random() < attacker.critRate;
  if (isCrit) {
    damage *= attacker.critDamage;
  }

  // Random variance
  const variance = DAMAGE_VARIANCE_MIN + random() * DAMAGE_VARIANCE_RANGE;
  damage *= variance;

  // Floor
  damage = Math.max(MIN_DAMAGE, Math.floor(damage));

  return { damage, isCrit, elementAdvantage: elementMod.advantage };
}

/**
 * Calculate healing amount from a heal skill.
 */
export function calculateHeal(caster, skill) {
  const atk = getEffectiveAttack(caster);
  let heal = atk * skill.multiplier;

  // Variance
  heal *= DAMAGE_VARIANCE_MIN + random() * DAMAGE_VARIANCE_RANGE;
  return Math.max(MIN_HEAL, Math.floor(heal));
}

// --- Helpers ---

function getEffectiveAttack(unit) {
  let atk = unit.attack;
  if (unit.buffs.some(b => b.type === BuffType.ATTACK_UP)) {
    atk *= getEffectMultiplier(BuffType.ATTACK_UP);
  }
  return atk;
}

function getEffectiveDefense(unit) {
  let def = unit.defense;
  if (unit.debuffs.some(d => d.type === DebuffType.DEFENSE_BREAK)) {
    def *= getEffectMultiplier(DebuffType.DEFENSE_BREAK);
  }
  if (unit.buffs.some(b => b.type === BuffType.DEFENSE_UP)) {
    def *= getEffectMultiplier(BuffType.DEFENSE_UP);
  }
  return def;
}
