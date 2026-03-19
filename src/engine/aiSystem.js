// AI decision system for Gods Of The Realms — War of Worlds
// Picks skill and target for enemy units. Framework-agnostic (Unity-portable).

import { SkillType, SkillTarget, DebuffType } from '../constants/enums';
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

  // Priority 2: Combo setup (debuff before nuke)
  const comboAction = considerCombo(unit, aliveEnemies, available);
  if (comboAction) return comboAction;

  // Priority 3: Support (cleanse > strip > heal > buff)
  const buffAction = considerSupportSkill(unit, aliveAllies, aliveEnemies, available);
  if (buffAction) return buffAction;

  // Priority 4: Highest multiplier damage/debuff skill
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

  // Priority 5: Fallback basic attack lowest HP target
  return {
    skill: unit.skills[0],
    targets: [pickBestTarget(aliveEnemies, unit)],
  };
}

function pickBestTarget(enemies, attacker, skill) {
  return enemies.reduce((best, e) => {
    const bestScore = scoreTarget(best, attacker, skill);
    const eScore = scoreTarget(e, attacker, skill);
    return eScore > bestScore ? e : best;
  });
}

function scoreTarget(target, attacker, skill) {
  let score = 0;

  // HP% priority (lower HP = higher score) — 40% weight
  score += (1 - target.currentHP / target.maxHP) * 0.4;

  // Element advantage — 20% weight
  if (attacker) {
    const { advantage } = getElementMultiplier(attacker.element, target.element);
    if (advantage === 'advantage' || advantage === 'mutual') score += 0.2;
    else if (advantage === 'disadvantage') score -= 0.1;
  }

  // Debuffed targets are juicier (defense break = more damage) — 15% weight
  if (target.debuffs.some(d => d.type === DebuffType.DEFENSE_BREAK)) score += 0.15;

  // Dangerous targets (high attack) — 15% weight
  const avgAttack = 800;
  score += Math.min(0.15, (target.attack / avgAttack - 1) * 0.15);

  // Support units are high priority — 10% weight
  if (target.role === 'Support') score += 0.1;

  return score;
}

function findKillable(unit, enemies, skills) {
  for (const enemy of enemies) {
    for (const skill of skills) {
      if (skill.target === SkillTarget.ALL_ENEMIES || skill.type === SkillType.HEAL || skill.type === SkillType.BUFF || skill.type === SkillType.CLEANSE || skill.type === SkillType.STRIP) continue;
      let estDamage = unit.attack * skill.multiplier * AI_KILL_ESTIMATE_FACTOR;
      // Account for defense break
      if (enemy.debuffs.some(d => d.type === DebuffType.DEFENSE_BREAK)) {
        estDamage *= 1.5;
      }
      // Account for multi-hit
      if (skill.hits > 1) {
        estDamage *= 1 + (skill.hits - 1) * 0.6;
      }
      if (estDamage >= enemy.currentHP) {
        return { skill, targets: [enemy] };
      }
    }
  }
  return null;
}

function considerCombo(unit, enemies, available) {
  // Check if we have a debuff skill (defense break) AND a nuke available
  const debuffSkill = available.find(s =>
    (s.type === SkillType.DEBUFF || (s.type === SkillType.DAMAGE && s.effectType === DebuffType.DEFENSE_BREAK))
    && s.target !== SkillTarget.ALL_ENEMIES
  );

  if (!debuffSkill) return null;

  // Find a target that doesn't already have defense break
  const target = enemies.find(e => !e.debuffs.some(d => d.type === DebuffType.DEFENSE_BREAK));
  if (target) {
    return { skill: debuffSkill, targets: [target] };
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
