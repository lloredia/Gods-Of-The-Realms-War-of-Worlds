'use client';

import { SkillTarget, SkillType } from '../constants/enums';

const TARGET_LABELS = {
  [SkillTarget.ALL_ENEMIES]: 'AoE',
  [SkillTarget.ALL_ALLIES]: 'Team',
  [SkillTarget.SINGLE]: 'Single',
};

const SKILL_TYPE_TINTS = {
  [SkillType.DAMAGE]: { bg: 'rgba(244, 67, 54, 0.12)', border: 'rgba(244, 67, 54, 0.4)' },
  [SkillType.HEAL]: { bg: 'rgba(76, 175, 80, 0.12)', border: 'rgba(76, 175, 80, 0.4)' },
  [SkillType.BUFF]: { bg: 'rgba(33, 150, 243, 0.12)', border: 'rgba(33, 150, 243, 0.4)' },
  [SkillType.DEBUFF]: { bg: 'rgba(171, 71, 188, 0.12)', border: 'rgba(171, 71, 188, 0.4)' },
  [SkillType.CLEANSE]: { bg: 'rgba(0, 188, 212, 0.12)', border: 'rgba(0, 188, 212, 0.4)' },
  [SkillType.STRIP]: { bg: 'rgba(255, 128, 171, 0.12)', border: 'rgba(255, 128, 171, 0.4)' },
};

const DEFAULT_TINT = { bg: '#2a2a4a', border: '#555' };

export default function SkillButtons({ unit, onSkillSelect, disabled }) {
  if (!unit) return null;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {unit.skills.map((skill, idx) => {
        const cd = unit.cooldowns[skill.id] || 0;
        const isOnCooldown = cd > 0;
        const isDisabled = disabled || isOnCooldown;
        const tint = (!isDisabled && skill.type && SKILL_TYPE_TINTS[skill.type]) || null;

        return (
          <button
            key={skill.id}
            onClick={() => !isDisabled && onSkillSelect(skill)}
            disabled={isDisabled}
            title={skill.description}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: `1px solid ${isDisabled ? '#555' : (tint ? tint.border : DEFAULT_TINT.border)}`,
              backgroundColor: isDisabled ? '#222' : (tint ? tint.bg : DEFAULT_TINT.bg),
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
              {skill.hits > 1 && ` • ${skill.hits} hits`}
              {skill.effectType && ` • ${skill.effectType.replace(/_/g, ' ')}`}
            </div>
            {/* Condition display */}
            {skill.condition && (
              <div style={{ fontSize: 9, color: isDisabled ? '#444' : '#FFB74D', marginTop: 2 }}>
                {skill.condition}
              </div>
            )}
            {/* Cleanse count */}
            {skill.cleanseCount > 0 && (
              <div style={{ fontSize: 9, color: isDisabled ? '#444' : '#4DD0E1', marginTop: 2 }}>
                Cleanses {skill.cleanseCount} debuff{skill.cleanseCount > 1 ? 's' : ''}
              </div>
            )}
            {/* Strip count */}
            {skill.stripCount > 0 && (
              <div style={{ fontSize: 9, color: isDisabled ? '#444' : '#FF80AB', marginTop: 2 }}>
                Strips {skill.stripCount} buff{skill.stripCount > 1 ? 's' : ''}
              </div>
            )}
            {isOnCooldown && (
              <div style={{ fontSize: 10, color: '#F44336', marginTop: 2 }}>
                CD: {cd} turn{cd > 1 ? 's' : ''}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
