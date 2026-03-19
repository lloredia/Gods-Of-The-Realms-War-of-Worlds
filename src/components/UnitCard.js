'use client';

import { Element } from '../constants/enums';
import { formatEffect } from '../engine/effectSystem';

const ELEMENT_COLORS = {
  [Element.STORM]: '#6B5CE7',
  [Element.OCEAN]: '#2196F3',
  [Element.UNDERWORLD]: '#8B0000',
  [Element.SUN]: '#FF9800',
  [Element.MOON]: '#9C27B0',
};

export default function UnitCard({ unit, isActive, onClick }) {
  const hpPercent = (unit.currentHP / unit.maxHP) * 100;
  const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FF9800' : '#F44336';
  const elementColor = ELEMENT_COLORS[unit.element] || '#666';

  return (
    <div
      onClick={onClick}
      style={{
        border: isActive ? '2px solid #FFD700' : '2px solid #333',
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
      {/* Name + Element */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontWeight: 'bold', color: '#eee', fontSize: 14 }}>{unit.name}</span>
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
        <div style={{ color: '#F44336', fontSize: 12, fontWeight: 'bold', marginTop: 4, textAlign: 'center' }}>
          DEFEATED
        </div>
      )}
    </div>
  );
}
