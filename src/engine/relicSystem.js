// Relic system for Gods Of The Realms — War of Worlds
// Applies relic set bonuses to unit stats at battle start.
// Framework-agnostic (Unity-portable).

import { getRelic } from '../data/relics';

/**
 * Apply relic set bonuses to a unit. Mutates the unit in-place.
 * Called during battle initialization after deep cloning.
 *
 * unit.relicSet can be:
 *   - string id (e.g., 'wrath') — gets 4-piece bonus
 *   - { set: string, pieces: 2|4 } — gets specific bonus tier
 */
export function applyRelicBonuses(unit) {
  if (!unit.relicSet) return;

  const setId = typeof unit.relicSet === 'string' ? unit.relicSet : unit.relicSet.set;
  const pieces = typeof unit.relicSet === 'string' ? 4 : unit.relicSet.pieces;
  const relic = getRelic(setId);
  if (!relic) return;

  // Apply 2-piece bonus (always applies if pieces >= 2)
  if (pieces >= 2 && relic.twoPiece) {
    const { stat, type, value } = relic.twoPiece;
    if (type === 'percent') {
      unit[stat] = Math.floor(unit[stat] * (1 + value));
      // Keep currentHP in sync if maxHP changed
      if (stat === 'maxHP') {
        unit.currentHP = unit[stat];
      }
    } else {
      unit[stat] += value;
    }
  }

  // Apply 4-piece bonus
  if (pieces >= 4 && relic.fourPiece) {
    const { effect, value } = relic.fourPiece;
    switch (effect) {
      case 'crit_rate_up':
        unit.critRate += value;
        break;
      case 'crit_damage_up':
        unit.critDamage += value;
        break;
      case 'turn_meter_boost':
        unit.turnMeter += value;
        break;
      case 'damage_reduction':
        unit.damageReduction = (unit.damageReduction || 0) + value;
        break;
      case 'heal_bonus':
        unit.healBonus = (unit.healBonus || 0) + value;
        break;
      case 'debuff_duration_reduce':
        unit.debuffDurationReduce = (unit.debuffDurationReduce || 0) + value;
        break;
    }
  }

  // Store resolved relic info for display
  unit._relicInfo = { name: relic.name, color: relic.color, pieces };
}

/**
 * Apply relic bonuses to all units in a team.
 */
export function applyTeamRelics(units) {
  for (const unit of units) {
    applyRelicBonuses(unit);
  }
}
