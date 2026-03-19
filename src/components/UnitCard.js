'use client';

import { Element } from '../constants/enums';
import factions from '../data/factions';
import { formatEffect } from '../engine/effectSystem';

const ELEMENT_COLORS = {
  [Element.STORM]: '#6B5CE7',
  [Element.OCEAN]: '#2196F3',
  [Element.UNDERWORLD]: '#8B0000',
  [Element.SUN]: '#FF9800',
  [Element.MOON]: '#9C27B0',
};

const ROLE_COLORS = {
  Attacker: '#F44336',
  Tank: '#2196F3',
  Support: '#4CAF50',
  Bruiser: '#FF9800',
  Debuffer: '#9C27B0',
};

export default function UnitCard({ unit, isActive, onClick, elementHint }) {
  const hpPercent = (unit.currentHP / unit.maxHP) * 100;
  const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FF9800' : '#F44336';
  const elementColor = ELEMENT_COLORS[unit.element] || '#666';
  const faction = unit.faction ? Object.values(factions).find(f => f.name === unit.faction) : null;
  const factionColor = faction ? faction.color : '#666';
  const roleColor = unit.role && ROLE_COLORS[unit.role] ? ROLE_COLORS[unit.role] : null;

  return (
    <div
      onClick={onClick}
      style={{
        border: isActive ? '2px solid #FFD700' : '2px solid #333',
        borderLeft: roleColor ? `3px solid ${roleColor}` : (isActive ? '2px solid #FFD700' : '2px solid #333'),
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        backgroundColor: unit.alive ? '#1a1a2e' : '#0a0a15',
        opacity: unit.alive ? 1 : 0.4,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        boxShadow: isActive ? '0 0 12px rgba(255,215,0,0.4)' : 'none',
      }}
    >
      {/* Name + Faction + Role + Element */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 'bold', color: '#eee', fontSize: 14 }}>{unit.name}</span>
          {unit._progressionInfo && (
            <span style={{ fontSize: 9, color: '#FFD740' }}>
              {'★'.repeat(unit._progressionInfo.stars)}{unit._progressionInfo.awakened ? ' ✧' : ''} Lv{unit._progressionInfo.level}
            </span>
          )}
          {faction && (
            <span style={{ fontSize: 9, color: factionColor, opacity: 0.8 }}>{faction.name}</span>
          )}
          {unit.role && (
            <span style={{
              fontSize: 8,
              color: roleColor || '#888',
              backgroundColor: roleColor ? `${roleColor}22` : '#222',
              borderRadius: 3,
              padding: '1px 4px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {unit.role}
            </span>
          )}
        </div>
        <span style={{
          fontSize: 11,
          color: elementColor,
          border: `1px solid ${elementColor}`,
          borderRadius: 4,
          padding: '1px 6px',
        }}>
          {unit.element}
        </span>
      </div>

      {/* Relic set badge */}
      {unit._relicInfo && (
        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontSize: 9,
            color: unit._relicInfo.color || '#B0BEC5',
            backgroundColor: unit._relicInfo.color ? `${unit._relicInfo.color}1A` : 'rgba(176,190,197,0.1)',
            border: `1px solid ${unit._relicInfo.color || '#B0BEC5'}44`,
            borderRadius: 3,
            padding: '1px 5px',
          }}>
            {unit._relicInfo.name}
          </span>
        </div>
      )}

      {/* Element advantage hint during targeting */}
      {elementHint && (
        <div style={{
          fontSize: 10,
          color: elementHint === 'advantage' || elementHint === 'mutual' ? '#4CAF50' : '#F44336',
          textAlign: 'center',
          marginBottom: 2,
          fontWeight: 'bold',
        }}>
          {elementHint === 'advantage' ? '▲ Element Advantage' : elementHint === 'mutual' ? '⚡ Elemental Clash' : '▼ Element Disadvantage'}
        </div>
      )}

      {/* HP Bar */}
      <div style={{ backgroundColor: '#333', borderRadius: 4, height: 16, marginBottom: 4, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          width: `${hpPercent}%`,
          height: '100%',
          backgroundColor: hpColor,
          borderRadius: 4,
          transition: 'width 0.3s',
        }} />
        <span style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 11,
          color: '#fff',
          lineHeight: '16px',
          textShadow: '0 0 3px #000',
        }}>
          {unit.currentHP} / {unit.maxHP}
        </span>
      </div>

      {/* Turn Meter */}
      <div style={{ backgroundColor: '#222', borderRadius: 3, height: 6, marginBottom: 6, overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(100, unit.turnMeter)}%`,
          height: '100%',
          backgroundColor: '#00BCD4',
          borderRadius: 3,
          transition: 'width 0.2s',
        }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#999', marginBottom: 4 }}>
        <span>ATK {unit.attack}</span>
        <span>DEF {unit.defense}</span>
        <span>SPD {unit.speed}</span>
      </div>

      {/* Passive */}
      {unit.passive && (
        <div style={{
          fontSize: 9,
          color: unit.passive.usesLeft === 0 ? '#555' : '#80CBC4',
          marginBottom: 4,
          fontStyle: 'italic',
        }}
        title={unit.passive.description}
        >
          ✦ {unit.passive.name}{unit.passive.usesLeft === 0 ? ' (used)' : ''}
        </div>
      )}

      {/* Buffs & Debuffs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {unit.buffs.map((b, i) => (
          <span key={`buff-${i}`} style={{
            fontSize: 10,
            backgroundColor: '#1B5E20',
            color: '#A5D6A7',
            borderRadius: 3,
            padding: '1px 5px',
          }}>
            {formatEffect(b.type)} ({b.duration})
          </span>
        ))}
        {unit.debuffs.map((d, i) => (
          <span key={`debuff-${i}`} style={{
            fontSize: 10,
            backgroundColor: '#B71C1C',
            color: '#EF9A9A',
            borderRadius: 3,
            padding: '1px 5px',
          }}>
            {formatEffect(d.type)} ({d.duration})
          </span>
        ))}
      </div>

      {!unit.alive && (
        <div style={{
          color: '#F44336',
          fontSize: 12,
          fontWeight: 'bold',
          marginTop: 6,
          textAlign: 'center',
          backgroundColor: 'rgba(244, 67, 54, 0.15)',
          borderRadius: 4,
          padding: '3px 0',
          border: '1px solid rgba(244, 67, 54, 0.3)',
        }}>
          DEFEATED
        </div>
      )}
    </div>
  );
}
