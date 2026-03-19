// Core battle engine for Gods Of The Realms — War of Worlds
// Turn meter, turn execution, game loop. Framework-agnostic (Unity-portable).

import { SkillType, LogType } from '../constants/enums';
import {
  TURN_METER_THRESHOLD,
  TURN_METER_TICK_RATE,
  TURN_METER_MAX_ITERATIONS,
} from '../constants/battleConstants';
import { calculateDamage, calculateHeal } from './damageSystem';
import { tryApplyEffect, applyBuff, tickEffects, isStunned, hasHealBlock, getEffectiveSpeed, formatEffect } from './effectSystem';

/**
 * Deep clone units from templates so originals stay clean.
 */
export function initUnits(templates) {
  return templates.map(t => JSON.parse(JSON.stringify(t)));
}

/**
 * Advance turn meters for all alive units. Returns the unit that reached threshold first.
 * Includes safety guard against infinite loops.
 */
export function advanceTurnMeters(allUnits) {
  const alive = allUnits.filter(u => u.alive);
  if (alive.length === 0) return null;

  const maxSpeed = Math.max(...alive.map(u => getEffectiveSpeed(u)));
  if (maxSpeed <= 0) return null; // Safety: no valid speed means no one can act

  let iterations = 0;

  while (iterations < TURN_METER_MAX_ITERATIONS) {
    iterations++;

    for (const unit of alive) {
      const spd = getEffectiveSpeed(unit);
      unit.turnMeter += (spd / maxSpeed) * TURN_METER_TICK_RATE;
    }

    // Check who hit threshold
    const ready = alive
      .filter(u => u.turnMeter >= TURN_METER_THRESHOLD)
      .sort((a, b) => {
        if (b.turnMeter !== a.turnMeter) return b.turnMeter - a.turnMeter;
        return getEffectiveSpeed(b) - getEffectiveSpeed(a);
      });

    if (ready.length > 0) {
      return ready[0];
    }
  }

  // Fallback: if we hit max iterations, pick the highest turn meter unit
  return alive.reduce((best, u) => u.turnMeter > best.turnMeter ? u : best);
}

/**
 * Execute a turn for a unit with a chosen skill and targets.
 * Returns an array of log entries.
 */
export function executeTurn(unit, skill, targets, allAllies, allEnemies) {
  const logs = [];

  // Reset turn meter
  unit.turnMeter = 0;

  // Tick effects at start of turn
  const expired = tickEffects(unit);
  for (const eff of expired) {
    logs.push({ type: LogType.EFFECT_EXPIRE, unit: unit.name, effect: formatEffect(eff) });
  }

  // Reduce cooldowns
  for (const skillDef of unit.skills) {
    if (unit.cooldowns[skillDef.id] > 0) {
      unit.cooldowns[skillDef.id]--;
    }
  }

  // Check stun
  if (isStunned(unit)) {
    logs.push({ type: LogType.STUNNED, unit: unit.name, message: `${unit.name} is stunned and cannot act!` });
    return logs;
  }

  // Set cooldown for used skill
  if (skill.cooldown > 0) {
    unit.cooldowns[skill.id] = skill.cooldown;
  }

  // Execute based on skill type
  switch (skill.type) {
    case SkillType.DAMAGE:
      logs.push(...executeDamageSkill(unit, skill, targets));
      break;
    case SkillType.HEAL:
      logs.push(...executeHealSkill(unit, skill, allAllies));
      break;
    case SkillType.BUFF:
      logs.push(...executeBuffSkill(unit, skill, allAllies));
      break;
    case SkillType.DEBUFF:
      logs.push(...executeDebuffSkill(unit, skill, targets));
      break;
    default:
      logs.push(...executeDamageSkill(unit, skill, targets));
  }

  return logs;
}

function executeDamageSkill(attacker, skill, targets) {
  const logs = [];
  const aliveTargets = (targets || []).filter(t => t.alive);

  for (const target of aliveTargets) {
    const { damage, isCrit, elementAdvantage } = calculateDamage(attacker, target, skill);
    target.currentHP = Math.max(0, target.currentHP - damage);

    logs.push({
      type: LogType.DAMAGE,
      attacker: attacker.name,
      target: target.name,
      skill: skill.name,
      damage,
      isCrit,
      elementAdvantage,
      remainingHP: target.currentHP,
    });

    if (target.currentHP <= 0) {
      target.alive = false;
      target.currentHP = 0;
      logs.push({ type: LogType.DEATH, unit: target.name, message: `${target.name} has been defeated!` });
    }

    if (target.alive && skill.effectType) {
      const result = tryApplyEffect(skill, attacker, target);
      if (result.applied) {
        logs.push({
          type: LogType.DEBUFF_APPLIED,
          target: target.name,
          effect: formatEffect(result.effectType),
          message: `${target.name} is now affected by ${formatEffect(result.effectType)}!`,
        });
      } else if (result.resisted) {
        logs.push({
          type: LogType.RESISTED,
          target: target.name,
          effect: formatEffect(result.effectType),
          message: `${target.name} resisted ${formatEffect(result.effectType)}!`,
        });
      } else if (result.blocked) {
        logs.push({
          type: LogType.BLOCKED,
          target: target.name,
          effect: formatEffect(result.effectType),
          message: `${target.name}'s Immunity blocked ${formatEffect(result.effectType)}!`,
        });
      }
    }
  }

  return logs;
}

function executeHealSkill(caster, skill, allies) {
  const logs = [];
  const aliveAllies = (allies || []).filter(a => a.alive);

  for (const ally of aliveAllies) {
    if (hasHealBlock(ally)) {
      logs.push({
        type: LogType.HEAL_BLOCKED,
        unit: ally.name,
        message: `${ally.name}'s healing is blocked!`,
      });
      continue;
    }

    const healAmount = calculateHeal(caster, skill);
    const before = ally.currentHP;
    ally.currentHP = Math.min(ally.maxHP, ally.currentHP + healAmount);
    const actual = ally.currentHP - before;

    logs.push({
      type: LogType.HEAL,
      caster: caster.name,
      target: ally.name,
      skill: skill.name,
      amount: actual,
      remainingHP: ally.currentHP,
    });
  }

  return logs;
}

function executeBuffSkill(caster, skill, allies) {
  const logs = [];
  const aliveAllies = (allies || []).filter(a => a.alive);

  for (const ally of aliveAllies) {
    applyBuff(skill.effectType, skill.effectDuration, caster, ally);
    logs.push({
      type: LogType.BUFF_APPLIED,
      caster: caster.name,
      target: ally.name,
      skill: skill.name,
      effect: formatEffect(skill.effectType),
      message: `${ally.name} gains ${formatEffect(skill.effectType)}!`,
    });
  }

  return logs;
}

function executeDebuffSkill(attacker, skill, targets) {
  const logs = [];
  const aliveTargets = (targets || []).filter(t => t.alive);

  for (const target of aliveTargets) {
    if (skill.multiplier > 0) {
      const { damage, isCrit, elementAdvantage } = calculateDamage(attacker, target, skill);
      target.currentHP = Math.max(0, target.currentHP - damage);
      logs.push({
        type: LogType.DAMAGE,
        attacker: attacker.name,
        target: target.name,
        skill: skill.name,
        damage,
        isCrit,
        elementAdvantage,
        remainingHP: target.currentHP,
      });

      if (target.currentHP <= 0) {
        target.alive = false;
        target.currentHP = 0;
        logs.push({ type: LogType.DEATH, unit: target.name });
        continue;
      }
    }

    const result = tryApplyEffect(skill, attacker, target);
    if (result.applied) {
      logs.push({
        type: LogType.DEBUFF_APPLIED,
        target: target.name,
        effect: formatEffect(result.effectType),
        message: `${target.name} is now affected by ${formatEffect(result.effectType)}!`,
      });
    } else if (result.resisted) {
      logs.push({
        type: LogType.RESISTED,
        target: target.name,
        effect: formatEffect(result.effectType),
      });
    } else if (result.blocked) {
      logs.push({
        type: LogType.BLOCKED,
        target: target.name,
        effect: formatEffect(result.effectType),
      });
    }
  }

  return logs;
}

/**
 * Check if a team is defeated (all units dead).
 */
export function isTeamDefeated(team) {
  return team.every(u => !u.alive);
}

/**
 * Get turn order preview — returns units sorted by who acts next.
 */
export function getTurnOrder(allUnits) {
  return allUnits
    .filter(u => u.alive)
    .sort((a, b) => {
      const aTurns = (TURN_METER_THRESHOLD - a.turnMeter) / getEffectiveSpeed(a);
      const bTurns = (TURN_METER_THRESHOLD - b.turnMeter) / getEffectiveSpeed(b);
      return aTurns - bTurns;
    })
    .map(u => ({ id: u.id, name: u.name, element: u.element, turnMeter: Math.floor(u.turnMeter) }));
}
