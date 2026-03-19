'use client';

import { SkillTarget } from '../constants/enums';

const TARGET_LABELS = {
  [SkillTarget.ALL_ENEMIES]: 'AoE',
  [SkillTarget.ALL_ALLIES]: 'Team',
  [SkillTarget.SINGLE]: 'Single',
};

export default function SkillButtons({ unit, onSkillSelect, disabled }) {
  if (!unit) return null;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {unit.skills.map((skill, idx) => {
        const cd = unit.cooldowns[skill.id] || 0;
        const isOnCooldown = cd > 0;
        const isDisabled = disabled || isOnCooldown;

        return (
          <button
            key={skill.id}
            onClick={() => !isDisabled && onSkillSelect(skill)}
            disabled={isDisabled}
            title={skill.description}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: '1px solid #555',
              backgroundColor: isDisabled ? '#222' : '#2a2a4a',
              color: isDisabled ? '#666' : '#eee',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
              minWidth: 140,
              textAlign: 'center',
              transition: 'all 0.15s',
            }}
          >
            <div>{skill.name}</div>
            <div style={{ fontSize: 10, color: isDisabled ? '#444' : '#999', marginTop: 2 }}>
              {TARGET_LABELS[skill.target] || 'Single'}
              {skill.multiplier > 0 && ` • ${skill.multiplier}x`}
              {skill.effectType && ` • ${skill.effectType.replace(/_/g, ' ')}`}
            </div>
            {isOnCooldown && (
              <div style={{ fontSize: 10, color: '#F44336', marginTop: 2 }}>
                CD: {cd}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
