// Core battle engine for Gods Of The Realms — War of Worlds
// Turn meter, turn execution, game loop. Framework-agnostic (Unity-portable).

import { SkillType, LogType, PassiveTrigger, ConditionType } from '../constants/enums';
import {
  TURN_METER_THRESHOLD,
  TURN_METER_TICK_RATE,
  TURN_METER_MAX_ITERATIONS,
  REVIVE_HP_PERCENT,
  PASSIVE_HEAL_PERCENT,
  EXECUTE_THRESHOLD,
  EXECUTE_BONUS_MULTIPLIER,
  MULTI_HIT_DECAY,
} from '../constants/battleConstants';
import { calculateDamage, calculateHeal } from './damageSystem';
import { tryApplyEffect, applyBuff, tickEffects, isStunned, hasHealBlock, getEffectiveSpeed, formatEffect } from './effectSystem';
import { applyTeamRelics } from './relicSystem';
import { applyTeamProgression } from './progressionSystem';
import { applyFactionBonuses } from './factionBonusSystem';

/**
 * Deep clone units from templates so originals stay clean.
 * Applies progression → faction bonuses → relic bonuses after cloning.
 */
export function initUnits(templates) {
  const units = templates.map(t => JSON.parse(JSON.stringify(t)));
  applyTeamProgression(units);
  applyFactionBonuses(units);
  applyTeamRelics(units);
  return units;
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
 * Process passive abilities based on trigger type.
 */
function processPassives(unit, trigger, context) {
  const logs = [];
  if (!unit.passive || !unit.alive) return logs;
  if (unit.passive.trigger !== trigger) return logs;
  if (unit.passive.usesLeft !== undefined && unit.passive.usesLeft <= 0) return logs;

  const p = unit.passive;

  if (trigger === PassiveTrigger.ON_TURN_START) {
    if (p.effect === 'self_heal') {
      const healAmount = Math.floor(unit.maxHP * (p.value || PASSIVE_HEAL_PERCENT));
      if (unit.currentHP < unit.maxHP) {
        unit.currentHP = Math.min(unit.maxHP, unit.currentHP + healAmount);
        logs.push({ type: LogType.PASSIVE, unit: unit.name, passive: p.name, message: `${unit.name}'s ${p.name}: healed ${healAmount} HP` });
      }
    }
    if (p.effect === 'cleanse_one') {
      if (unit.debuffs.length > 0) {
        const removed = unit.debuffs.shift();
        logs.push({ type: LogType.PASSIVE, unit: unit.name, passive: p.name, message: `${unit.name}'s ${p.name}: cleansed ${formatEffect(removed.type)}` });
      }
    }
  }

  return logs;
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

  // Process turn-start passives
  const passiveLogs = processPassives(unit, PassiveTrigger.ON_TURN_START, {});
  logs.push(...passiveLogs);

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
    case SkillType.CLEANSE:
      logs.push(...executeCleanseSkill(unit, skill, allAllies));
      break;
    case SkillType.STRIP:
      logs.push(...executeStripSkill(unit, skill, targets));
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
    const hits = skill.hits || 1;
    let totalDamage = 0;
    let lastCrit = false;
    let lastElementAdv = 'neutral';

    for (let h = 0; h < hits; h++) {
      const { damage, isCrit, elementAdvantage } = calculateDamage(attacker, target, skill);
      const hitDamage = h === 0 ? damage : Math.floor(damage * MULTI_HIT_DECAY);
      totalDamage += hitDamage;
      lastCrit = lastCrit || isCrit;
      lastElementAdv = elementAdvantage;
    }

    // Apply conditional bonus (execute mechanic)
    if (skill.condition && skill.condition.type === ConditionType.TARGET_BELOW_HP) {
      if (target.currentHP / target.maxHP < (skill.condition.threshold || EXECUTE_THRESHOLD)) {
        totalDamage = Math.floor(totalDamage * (skill.condition.bonusMultiplier || EXECUTE_BONUS_MULTIPLIER));
      }
    }

    target.currentHP = Math.max(0, target.currentHP - totalDamage);

    const damageLog = {
      type: LogType.DAMAGE,
      attacker: attacker.name,
      target: target.name,
      skill: skill.name,
      damage: totalDamage,
      isCrit: lastCrit,
      elementAdvantage: lastElementAdv,
      remainingHP: target.currentHP,
    };
    if (hits > 1) {
      damageLog.hits = hits;
    }
    logs.push(damageLog);

    if (target.currentHP <= 0) {
      target.alive = false;
      target.currentHP = 0;
      logs.push({ type: LogType.DEATH, unit: target.name, message: `${target.name} has been defeated!` });

      // Check for revive passive
      if (target.passive && target.passive.trigger === PassiveTrigger.ON_RECEIVE_FATAL && (target.passive.usesLeft === undefined || target.passive.usesLeft > 0)) {
        target.alive = true;
        target.currentHP = Math.floor(target.maxHP * REVIVE_HP_PERCENT);
        if (target.passive.usesLeft !== undefined) target.passive.usesLeft--;
        logs.push({ type: LogType.REVIVE, unit: target.name, passive: target.passive.name, message: `${target.name}'s ${target.passive.name} triggers! Revived at ${target.currentHP} HP!` });
      }
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

function executeCleanseSkill(caster, skill, allies) {
  const logs = [];
  const aliveAllies = (allies || []).filter(a => a.alive);
  const count = skill.cleanseCount || 1;

  for (const ally of aliveAllies) {
    let removed = 0;
    while (removed < count && ally.debuffs.length > 0) {
      const d = ally.debuffs.shift();
      logs.push({ type: LogType.CLEANSE, caster: caster.name, target: ally.name, effect: formatEffect(d.type), message: `${caster.name} cleanses ${formatEffect(d.type)} from ${ally.name}!` });
      removed++;
    }
  }
  return logs;
}

function executeStripSkill(caster, skill, targets) {
  const logs = [];
  const aliveTargets = (targets || []).filter(t => t.alive);
  const count = skill.stripCount || 1;

  for (const target of aliveTargets) {
    let removed = 0;
    while (removed < count && target.buffs.length > 0) {
      const b = target.buffs.shift();
      logs.push({ type: LogType.STRIP, caster: caster.name, target: target.name, effect: formatEffect(b.type), message: `${caster.name} strips ${formatEffect(b.type)} from ${target.name}!` });
      removed++;
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
