const relics = {
  wrath: {
    id: 'wrath',
    name: 'Wrath',
    color: '#F44336',
    description: 'Forged in divine fury.',
    twoPiece: { stat: 'attack', type: 'percent', value: 0.35 },
    fourPiece: { effect: 'crit_rate_up', value: 0.12, description: '+12% Crit Rate' },
  },
  fortress: {
    id: 'fortress',
    name: 'Fortress',
    color: '#607D8B',
    description: 'Stone of the ancient walls.',
    twoPiece: { stat: 'defense', type: 'percent', value: 0.35 },
    fourPiece: { effect: 'damage_reduction', value: 0.15, description: '15% damage reduction' },
  },
  tempest: {
    id: 'tempest',
    name: 'Tempest',
    color: '#00BCD4',
    description: 'Charged with storm essence.',
    twoPiece: { stat: 'speed', type: 'percent', value: 0.25 },
    fourPiece: { effect: 'turn_meter_boost', value: 20, description: '+20% Turn Meter at battle start' },
  },
  precision: {
    id: 'precision',
    name: 'Precision',
    color: '#FF9800',
    description: 'Honed to lethal perfection.',
    twoPiece: { stat: 'critRate', type: 'flat', value: 0.12 },
    fourPiece: { effect: 'crit_damage_up', value: 0.25, description: '+25% Crit Damage' },
  },
  vitality: {
    id: 'vitality',
    name: 'Vitality',
    color: '#4CAF50',
    description: 'Pulsing with life force.',
    twoPiece: { stat: 'maxHP', type: 'percent', value: 0.25 },
    fourPiece: { effect: 'heal_bonus', value: 0.20, description: '+20% healing received' },
  },
  resolve: {
    id: 'resolve',
    name: 'Resolve',
    color: '#9C27B0',
    description: 'Unwavering against corruption.',
    twoPiece: { stat: 'resistance', type: 'flat', value: 0.20 },
    fourPiece: { effect: 'debuff_duration_reduce', value: 1, description: 'Reduce debuff duration by 1 turn' },
  },
};

export function getRelic(relicId) {
  return relics[relicId] || null;
}

export default relics;
