// AI decision system for Gods Of The Realms — War of Worlds
// Picks skill and target for enemy units. Framework-agnostic (Unity-portable).

import { SkillType, SkillTarget } from '../constants/enums';
import { AI_HEAL_THRESHOLD, AI_BUFF_CHANCE, AI_KILL_ESTIMATE_FACTOR } from '../constants/battleConstants';
import { getElementMultiplier } from '../constants/elementTable';

/**
 * Decide an action for an AI-controlled unit.
 * Returns { skill, targets } where targets is an array of target units.
 */
export function decideAction(unit, allies, enemies) {
  const aliveEnemies = enemies.filter(e => e.alive);
  const aliveAllies = allies.filter(a => a.alive);

  if (aliveEnemies.length === 0) return null;
  if (!unit.skills || unit.skills.length === 0) return null;

  // Get available skills (not on cooldown)
  const available = unit.skills.filter(skill => {
    const cd = unit.cooldowns[skill.id] || 0;
    return cd <= 0;
  });

  if (available.length === 0) {
    return {
      skill: unit.skills[0],
      targets: [pickBestTarget(aliveEnemies, unit)],
    };
  }

  // Priority 1: Kill confirmation
  const killableTarget = findKillable(unit, aliveEnemies, available);
  if (killableTarget) return killableTarget;

  // Priority 2: Support (heal/buff)
  const buffAction = considerSupportSkill(unit, aliveAllies, aliveEnemies, available);
  if (buffAction) return buffAction;

  // Priority 3: Highest multiplier damage/debuff skill
  const bestDamageSkill = available
    .filter(s => s.type === SkillType.DAMAGE || s.type === SkillType.DEBUFF)
    .sort((a, b) => b.multiplier - a.multiplier)[0];

  if (bestDamageSkill) {
    if (bestDamageSkill.target === SkillTarget.ALL_ENEMIES) {
      return { skill: bestDamageSkill, targets: aliveEnemies };
    }
    return {
      skill: bestDamageSkill,
      targets: [pickBestTarget(aliveEnemies, unit)],
    };
  }

  // Fallback: basic attack lowest HP target
  return {
    skill: unit.skills[0],
    targets: [pickBestTarget(aliveEnemies, unit)],
  };
}

function pickBestTarget(enemies, attacker) {
  return enemies.reduce((best, e) => {
    const bestScore = scoreTarget(best, attacker);
    const eScore = scoreTarget(e, attacker);
    return eScore > bestScore ? e : best;
  });
}

function scoreTarget(target, attacker) {
  // Lower HP% = higher priority (70% weight)
  const hpScore = (1 - target.currentHP / target.maxHP) * 0.7;

  // Element advantage = bonus priority (30% weight)
  let elementScore = 0;
  if (attacker) {
    const { advantage } = getElementMultiplier(attacker.element, target.element);
    if (advantage === 'advantage' || advantage === 'mutual') elementScore = 0.3;
    else if (advantage === 'disadvantage') elementScore = -0.15;
  }

  return hpScore + elementScore;
}

function findKillable(unit, enemies, skills) {
  for (const enemy of enemies) {
    for (const skill of skills) {
      if (skill.target === SkillTarget.ALL_ENEMIES || skill.type === SkillType.HEAL || skill.type === SkillType.BUFF || skill.type === SkillType.CLEANSE || skill.type === SkillType.STRIP) continue;
      const estDamage = unit.attack * skill.multiplier * AI_KILL_ESTIMATE_FACTOR;
      if (estDamage >= enemy.currentHP) {
        return { skill, targets: [enemy] };
      }
    }
  }
  return null;
}

function considerSupportSkill(unit, allies, enemies, skills) {
  const supportSkills = skills.filter(s => s.type === SkillType.BUFF || s.type === SkillType.HEAL || s.type === SkillType.CLEANSE || s.type === SkillType.STRIP);
  if (supportSkills.length === 0) return null;

  // Use cleanse if any ally has debuffs
  const cleanseSkill = supportSkills.find(s => s.type === SkillType.CLEANSE);
  const anyDebuffed = allies.some(a => a.debuffs.length > 0);
  if (cleanseSkill && anyDebuffed) {
    return { skill: cleanseSkill, targets: allies };
  }

  // Use strip if any enemy has buffs
  const stripSkill = supportSkills.find(s => s.type === SkillType.STRIP);
  const anyBuffed = enemies.some(e => e.buffs.length > 0);
  if (stripSkill && anyBuffed) {
    return { skill: stripSkill, targets: enemies };
  }

  // Use heal if any ally is below threshold
  const healSkill = supportSkills.find(s => s.type === SkillType.HEAL);
  const anyLowHP = allies.some(a => a.currentHP / a.maxHP < AI_HEAL_THRESHOLD);
  if (healSkill && anyLowHP) {
    return { skill: healSkill, targets: allies };
  }

  // Chance to prioritize buff
  if (Math.random() < AI_BUFF_CHANCE) {
    const buffSkill = supportSkills.find(s => s.type === SkillType.BUFF);
    if (buffSkill) {
      return { skill: buffSkill, targets: allies };
    }
  }

  return null;
}
