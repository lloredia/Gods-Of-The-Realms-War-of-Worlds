// Faction bonus system for Gods Of The Realms — War of Worlds
// Grants team bonuses when multiple heroes share a faction.
// Framework-agnostic (Unity-portable).

/**
 * Faction set bonuses:
 * 2 heroes same faction: minor bonus
 * 3 heroes same faction: major bonus
 * 4 heroes same faction: ultimate bonus
 */
const FACTION_BONUSES = {
  'The Pantheon': {
    2: { stat: 'attack', type: 'percent', value: 0.10, label: '+10% ATK' },
    3: { stat: 'critRate', type: 'flat', value: 0.10, label: '+10% Crit Rate' },
    4: { stat: 'critDamage', type: 'flat', value: 0.20, label: '+20% Crit Damage' },
  },
  "The Allfather's Hall": {
    2: { stat: 'defense', type: 'percent', value: 0.10, label: '+10% DEF' },
    3: { stat: 'maxHP', type: 'percent', value: 0.15, label: '+15% HP' },
    4: { stat: 'resistance', type: 'flat', value: 0.20, label: '+20% Resistance' },
  },
  'The Eternal Sands': {
    2: { stat: 'accuracy', type: 'flat', value: 0.10, label: '+10% Accuracy' },
    3: { stat: 'speed', type: 'percent', value: 0.10, label: '+10% Speed' },
    4: { stat: 'attack', type: 'percent', value: 0.15, label: '+15% ATK' },
  },
  'The Mist Realm': {
    2: { stat: 'resistance', type: 'flat', value: 0.10, label: '+10% Resistance' },
    3: { stat: 'defense', type: 'percent', value: 0.15, label: '+15% DEF' },
    4: { stat: 'maxHP', type: 'percent', value: 0.20, label: '+20% HP' },
  },
  'The Rising Sun': {
    2: { stat: 'speed', type: 'percent', value: 0.08, label: '+8% Speed' },
    3: { stat: 'critRate', type: 'flat', value: 0.08, label: '+8% Crit Rate' },
    4: { stat: 'attack', type: 'percent', value: 0.20, label: '+20% ATK' },
  },
};

/**
 * Calculate which faction bonuses a team qualifies for.
 * Returns array of { faction, count, bonuses: [...] }
 */
export function calculateFactionBonuses(units) {
  // Count heroes per faction
  const factionCounts = {};
  for (const unit of units) {
    if (unit.faction) {
      factionCounts[unit.faction] = (factionCounts[unit.faction] || 0) + 1;
    }
  }

  const activeBonuses = [];

  for (const [faction, count] of Object.entries(factionCounts)) {
    if (count < 2) continue;
    const factionDef = FACTION_BONUSES[faction];
    if (!factionDef) continue;

    const bonuses = [];
    if (count >= 2 && factionDef[2]) bonuses.push(factionDef[2]);
    if (count >= 3 && factionDef[3]) bonuses.push(factionDef[3]);
    if (count >= 4 && factionDef[4]) bonuses.push(factionDef[4]);

    if (bonuses.length > 0) {
      activeBonuses.push({ faction, count, bonuses });
    }
  }

  return activeBonuses;
}

/**
 * Apply faction bonuses to all units on a team. Mutates units in-place.
 */
export function applyFactionBonuses(units) {
  const bonuses = calculateFactionBonuses(units);

  for (const { faction, bonuses: bonusList } of bonuses) {
    const factionUnits = units.filter(u => u.faction === faction);

    for (const bonus of bonusList) {
      for (const unit of factionUnits) {
        if (bonus.type === 'percent') {
          unit[bonus.stat] = Math.floor(unit[bonus.stat] * (1 + bonus.value));
          if (bonus.stat === 'maxHP') unit.currentHP = unit.maxHP;
        } else {
          unit[bonus.stat] += bonus.value;
        }
      }
    }
  }

  // Store active bonuses for display
  if (bonuses.length > 0) {
    for (const unit of units) {
      unit._factionBonuses = bonuses.filter(b => b.faction === unit.faction);
    }
  }

  return bonuses;
}

export { FACTION_BONUSES };
