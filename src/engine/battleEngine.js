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
import { getState } from '../utils/random';
import { calculateDamage, calculateHeal } from './damageSystem';
import { tryApplyEffect, applyBuff, tickEffects, isStunned, hasHealBlock, getEffectiveSpeed, formatEffect } from './effectSystem';
import { applyTeamRelics } from './relicSystem';
import { applyTeamProgression } from './progressionSystem';
import { applyFactionBonuses } from './factionBonusSystem';

let _turnCounter = 0;
export function getTurnCounter() { return _turnCounter; }

/**
 * Deep clone units from templates so originals stay clean.
 * Applies progression → faction bonuses → relic bonuses after cloning.
 */
export function initUnits(templates) {
  _turnCounter = 0;
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
        logs.push({ type: LogType.PASSIVE, turn: _turnCounter, actingUnitId: unit.id, unit: unit.name, passive: p.name, message: `${unit.name}'s ${p.name}: healed ${healAmount} HP`, rngState: getState() });
      }
    }
    if (p.effect === 'cleanse_one') {
      if (unit.debuffs.length > 0) {
        const removed = unit.debuffs.shift();
        logs.push({ type: LogType.PASSIVE, turn: _turnCounter, actingUnitId: unit.id, unit: unit.name, passive: p.name, message: `${unit.name}'s ${p.name}: cleansed ${formatEffect(removed.type)}`, rngState: getState() });
      }
    }
  }

  return logs;
}

/**
 * COMBAT TIMING LAW — do not reorder without updating all documentation.
 *
 * Turn execution order (immutable after v0.2.0):
 * 1. RESET TURN METER — acting unit's meter goes to 0
 * 2. TICK EFFECTS — all buff/debuff durations decrease by 1, expired effects removed
 *    NOTE: A 1-turn stun expires HERE, meaning the unit CAN act this turn
 *    NOTE: A 1-turn buff expires HERE, meaning the unit CANNOT benefit this turn
 * 3. REDUCE COOLDOWNS — all skill cooldowns decrease by 1
 * 4. PROCESS PASSIVES — on_turn_start passives fire (self-heal, cleanse)
 * 5. STUN CHECK — if unit still has stun debuff, skip action phase
 * 6. EXECUTE SKILL — chosen skill resolves (damage/heal/buff/debuff/cleanse/strip)
 *
 * Design implication: A 1-turn stun applied on an enemy's turn will:
 * - Persist through their next turn start (step 2 ticks it to 0, removes it)
 * - NOT prevent action (stun was removed in step 2 before check in step 5)
 * - To stun for 1 full turn, apply with duration 2
 *
 * This matches Summoners War convention: effects tick at start, not end.
 */

/**
 * Execute a turn for a unit with a chosen skill and targets.
 * Returns an array of log entries.
 */
export function executeTurn(unit, skill, targets, allAllies, allEnemies) {
  _turnCounter++;
  const logs = [];

  // Reset turn meter
  unit.turnMeter = 0;

  // Tick effects at start of turn
  const expired = tickEffects(unit);
  for (const eff of expired) {
    logs.push({ type: LogType.EFFECT_EXPIRE, turn: _turnCounter, actingUnitId: unit.id, unit: unit.name, effect: formatEffect(eff), rngState: getState() });
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
    logs.push({ type: LogType.STUNNED, turn: _turnCounter, actingUnitId: unit.id, unit: unit.name, message: `${unit.name} is stunned and cannot act!`, rngState: getState() });
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

    const preHP = target.currentHP;

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
      turn: _turnCounter,
      actingUnitId: attacker.id,
      attacker: attacker.name,
      attackerId: attacker.id,
      target: target.name,
      targetId: target.id,
      skill: skill.name,
      damage: totalDamage,
      isCrit: lastCrit,
      elementAdvantage: lastElementAdv,
      remainingHP: target.currentHP,
      preHP: preHP,
      rngState: getState(),
    };
    if (hits > 1) {
      damageLog.hits = hits;
    }
    logs.push(damageLog);

    if (target.currentHP <= 0) {
      target.alive = false;
      target.currentHP = 0;
      logs.push({ type: LogType.DEATH, turn: _turnCounter, actingUnitId: attacker.id, unit: target.name, targetId: target.id, message: `${target.name} has been defeated!`, rngState: getState() });

      // Check for revive passive
      if (target.passive && target.passive.trigger === PassiveTrigger.ON_RECEIVE_FATAL && (target.passive.usesLeft === undefined || target.passive.usesLeft > 0)) {
        target.alive = true;
        target.currentHP = Math.floor(target.maxHP * REVIVE_HP_PERCENT);
        if (target.passive.usesLeft !== undefined) target.passive.usesLeft--;
        logs.push({ type: LogType.REVIVE, turn: _turnCounter, actingUnitId: attacker.id, unit: target.name, targetId: target.id, passive: target.passive.name, message: `${target.name}'s ${target.passive.name} triggers! Revived at ${target.currentHP} HP!`, rngState: getState() });
      }
    }

    if (target.alive && skill.effectType) {
      const result = tryApplyEffect(skill, attacker, target);
      if (result.applied) {
        logs.push({
          type: LogType.DEBUFF_APPLIED,
          turn: _turnCounter,
          actingUnitId: attacker.id,
          target: target.name,
          targetId: target.id,
          effect: formatEffect(result.effectType),
          roll: result.roll,
          threshold: result.threshold,
          message: `${target.name} is now affected by ${formatEffect(result.effectType)}!`,
          rngState: getState(),
        });
      } else if (result.resisted) {
        logs.push({
          type: LogType.RESISTED,
          turn: _turnCounter,
          actingUnitId: attacker.id,
          target: target.name,
          targetId: target.id,
          effect: formatEffect(result.effectType),
          roll: result.roll,
          threshold: result.threshold,
          message: `${target.name} resisted ${formatEffect(result.effectType)}!`,
          rngState: getState(),
        });
      } else if (result.blocked) {
        logs.push({
          type: LogType.BLOCKED,
          turn: _turnCounter,
          actingUnitId: attacker.id,
          target: target.name,
          targetId: target.id,
          effect: formatEffect(result.effectType),
          message: `${target.name}'s Immunity blocked ${formatEffect(result.effectType)}!`,
          rngState: getState(),
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
        turn: _turnCounter,
        actingUnitId: caster.id,
        unit: ally.name,
        targetId: ally.id,
        message: `${ally.name}'s healing is blocked!`,
        rngState: getState(),
      });
      continue;
    }

    const healAmount = calculateHeal(caster, skill);
    const preHP = ally.currentHP;
    ally.currentHP = Math.min(ally.maxHP, ally.currentHP + healAmount);
    const actual = ally.currentHP - preHP;

    logs.push({
      type: LogType.HEAL,
      turn: _turnCounter,
      actingUnitId: caster.id,
      caster: caster.name,
      target: ally.name,
      targetId: ally.id,
      skill: skill.name,
      amount: actual,
      preHP: preHP,
      remainingHP: ally.currentHP,
      rngState: getState(),
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
      turn: _turnCounter,
      actingUnitId: caster.id,
      caster: caster.name,
      target: ally.name,
      targetId: ally.id,
      skill: skill.name,
      effect: formatEffect(skill.effectType),
      message: `${ally.name} gains ${formatEffect(skill.effectType)}!`,
      rngState: getState(),
    });
  }

  return logs;
}

function executeDebuffSkill(attacker, skill, targets) {
  const logs = [];
  const aliveTargets = (targets || []).filter(t => t.alive);

  for (const target of aliveTargets) {
    if (skill.multiplier > 0) {
      const preHP = target.currentHP;
      const { damage, isCrit, elementAdvantage } = calculateDamage(attacker, target, skill);
      target.currentHP = Math.max(0, target.currentHP - damage);
      logs.push({
        type: LogType.DAMAGE,
        turn: _turnCounter,
        actingUnitId: attacker.id,
        attacker: attacker.name,
        attackerId: attacker.id,
        target: target.name,
        targetId: target.id,
        skill: skill.name,
        damage,
        isCrit,
        elementAdvantage,
        preHP: preHP,
        remainingHP: target.currentHP,
        rngState: getState(),
      });

      if (target.currentHP <= 0) {
        target.alive = false;
        target.currentHP = 0;
        logs.push({ type: LogType.DEATH, turn: _turnCounter, actingUnitId: attacker.id, unit: target.name, targetId: target.id, rngState: getState() });
        continue;
      }
    }

    const result = tryApplyEffect(skill, attacker, target);
    if (result.applied) {
      logs.push({
        type: LogType.DEBUFF_APPLIED,
        turn: _turnCounter,
        actingUnitId: attacker.id,
        target: target.name,
        targetId: target.id,
        effect: formatEffect(result.effectType),
        roll: result.roll,
        threshold: result.threshold,
        message: `${target.name} is now affected by ${formatEffect(result.effectType)}!`,
        rngState: getState(),
      });
    } else if (result.resisted) {
      logs.push({
        type: LogType.RESISTED,
        turn: _turnCounter,
        actingUnitId: attacker.id,
        target: target.name,
        targetId: target.id,
        effect: formatEffect(result.effectType),
        roll: result.roll,
        threshold: result.threshold,
        rngState: getState(),
      });
    } else if (result.blocked) {
      logs.push({
        type: LogType.BLOCKED,
        turn: _turnCounter,
        actingUnitId: attacker.id,
        target: target.name,
        targetId: target.id,
        effect: formatEffect(result.effectType),
        rngState: getState(),
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
      logs.push({ type: LogType.CLEANSE, turn: _turnCounter, actingUnitId: caster.id, caster: caster.name, target: ally.name, effect: formatEffect(d.type), message: `${caster.name} cleanses ${formatEffect(d.type)} from ${ally.name}!`, rngState: getState() });
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
      logs.push({ type: LogType.STRIP, turn: _turnCounter, actingUnitId: caster.id, caster: caster.name, target: target.name, effect: formatEffect(b.type), message: `${caster.name} strips ${formatEffect(b.type)} from ${target.name}!`, rngState: getState() });
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
