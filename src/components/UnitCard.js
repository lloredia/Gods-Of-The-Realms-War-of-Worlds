'use client';

import { useState } from 'react';
import { Element } from '../constants/enums';
import factions from '../data/factions';
import { formatEffect } from '../engine/effectSystem';
import HeroPortrait from './HeroPortrait';
import HeroDetailModal from './HeroDetailModal';

const FACTION_KEY_MAP = {
  'The Pantheon': 'Pantheon',
  "The Allfather's Hall": 'Norse',
  'The Eternal Sands': 'Egyptian',
  'The Mist Realm': 'Celtic',
  'The Rising Sun': 'Japanese',
};

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

const EFFECT_ICONS = {
  attack_up: { icon: '⚔', color: '#F44336', label: 'ATK Up' },
  defense_up: { icon: '🛡', color: '#2196F3', label: 'DEF Up' },
  immunity: { icon: '✦', color: '#FFD700', label: 'Immune' },
  speed_up: { icon: '💨', color: '#00BCD4', label: 'SPD Up' },
  stun: { icon: '💫', color: '#FF9800', label: 'Stun' },
  defense_break: { icon: '🔥', color: '#F44336', label: 'DEF Break' },
  slow: { icon: '🐌', color: '#9C27B0', label: 'Slow' },
  heal_block: { icon: '🚫', color: '#E91E63', label: 'No Heal' },
};

/* Inject keyframes for the active-card gold shimmer once */
const SHIMMER_STYLE_ID = 'unit-card-shimmer-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(SHIMMER_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = SHIMMER_STYLE_ID;
  style.textContent = `
    @keyframes unitCardGoldShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export default function UnitCard({ unit, isActive, onClick, elementHint, animClass, damageNumber }) {
  const hpPercent = (unit.currentHP / unit.maxHP) * 100;
  const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FF9800' : '#F44336';
  const elementColor = ELEMENT_COLORS[unit.element] || '#666';
  const faction = unit.faction ? Object.values(factions).find(f => f.name === unit.faction) : null;
  const factionColor = faction ? faction.color : '#666';
  const roleColor = unit.role && ROLE_COLORS[unit.role] ? ROLE_COLORS[unit.role] : null;
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div
      className={animClass || ''}
      onClick={onClick}
      onDoubleClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
      style={{
        position: 'relative',
        borderTop: isActive ? '2px solid #FFD700' : '2px solid #333',
        borderRight: isActive ? '2px solid #FFD700' : '2px solid #333',
        borderBottom: isActive ? '2px solid #FFD700' : '2px solid #333',
        borderLeft: roleColor ? `3px solid ${roleColor}` : (isActive ? '2px solid #FFD700' : '2px solid #333'),
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        background: unit.alive
          ? `linear-gradient(145deg, ${elementColor}11 0%, #1a1a2e 30%, #12122a 100%)`
          : '#0a0a15',
        opacity: unit.alive ? 1 : 0.3,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        boxShadow: isActive
          ? '0 0 14px rgba(255,215,0,0.5), inset 0 0 20px rgba(255,215,0,0.06)'
          : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Floating damage number */}
      {damageNumber && (
        <div className="damage-number" style={{
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          color: damageNumber > 0 ? '#F44336' : '#4CAF50',
        }}>
          {damageNumber > 0 ? `-${damageNumber}` : `+${Math.abs(damageNumber)}`}
        </div>
      )}

      {/* Active shimmer overlay */}
      {isActive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 8,
          pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.07) 40%, rgba(255,215,0,0.13) 50%, rgba(255,215,0,0.07) 60%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'unitCardGoldShimmer 2.5s ease-in-out infinite',
          zIndex: 1,
        }} />
      )}

      {/* Defeated overlay — dramatic shatter */}
      {!unit.alive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 8,
          pointerEvents: 'none',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(244,67,54,0.15) 0%, rgba(10,10,21,0.6) 70%)',
          borderTop: '1px solid rgba(244,67,54,0.25)',
          borderBottom: '1px solid rgba(244,67,54,0.25)',
        }}>
          {/* Crack lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderLeft: '1px solid rgba(244,67,54,0.2)',
            borderRight: '1px solid rgba(244,67,54,0.15)',
            clipPath: 'polygon(45% 0%, 50% 35%, 55% 0%, 52% 40%, 65% 20%, 53% 45%, 75% 50%, 53% 55%, 65% 80%, 52% 60%, 55% 100%, 50% 65%, 45% 100%, 48% 60%, 35% 80%, 47% 55%, 25% 50%, 47% 45%, 35% 20%, 48% 40%)',
            backgroundColor: 'rgba(244,67,54,0.12)',
          }} />
          {/* Large skull / X overlay */}
          <span style={{
            fontSize: 40,
            color: 'rgba(244,67,54,0.35)',
            textShadow: '0 0 12px rgba(244,67,54,0.3)',
            fontWeight: 'bold',
            userSelect: 'none',
          }}>
            ☠
          </span>
        </div>
      )}

      {/* Name + Portrait + Faction + Role + Element */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Portrait with backdrop glow */}
          <div style={{
            position: 'relative',
            borderRadius: '50%',
            boxShadow: isActive
              ? `0 0 10px ${elementColor}88, 0 0 20px ${elementColor}44`
              : `0 0 6px ${elementColor}33`,
          }}>
            <HeroPortrait
              unitId={unit.id}
              element={unit.element}
              faction={FACTION_KEY_MAP[unit.faction]}
              size={36}
              isActive={isActive}
            />
          </div>
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
        <div style={{ marginBottom: 4, position: 'relative', zIndex: 3 }}>
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
          position: 'relative',
          zIndex: 3,
        }}>
          {elementHint === 'advantage' ? '▲ Element Advantage' : elementHint === 'mutual' ? '⚡ Elemental Clash' : '▼ Element Disadvantage'}
        </div>
      )}

      {/* HP Bar */}
      <div style={{
        backgroundColor: '#222',
        borderRadius: 5,
        height: 18,
        marginBottom: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
        zIndex: 3,
      }}>
        {/* HP fill */}
        <div style={{
          width: `${hpPercent}%`,
          height: '100%',
          backgroundColor: hpColor,
          borderRadius: 5,
          transition: 'width 0.3s',
          position: 'relative',
        }}>
          {/* Shine overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 5,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 50%, rgba(0,0,0,0.1) 100%)',
            pointerEvents: 'none',
          }} />
        </div>
        <span style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 11,
          color: '#fff',
          lineHeight: '18px',
          textShadow: '0 1px 3px #000, 0 0 6px rgba(0,0,0,0.8)',
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {Math.round(unit.currentHP)} / {unit.maxHP}
        </span>
      </div>

      {/* Turn Meter */}
      <div style={{
        backgroundColor: '#181828',
        borderRadius: 3,
        height: 6,
        marginBottom: 6,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 3,
        boxShadow: unit.turnMeter > 80 ? '0 0 6px #00BCD4' : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{
          width: `${Math.min(100, unit.turnMeter)}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #004D54 0%, #00BCD4 100%)',
          borderRadius: 3,
          transition: 'width 0.2s',
        }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#999', marginBottom: 4, position: 'relative', zIndex: 3 }}>
        <span title="Attack">⚔ {unit.attack}</span>
        <span title="Defense">🛡 {unit.defense}</span>
        <span title="Speed">💨 {unit.speed}</span>
      </div>

      {/* Passive */}
      {unit.passive && (
        <div style={{
          fontSize: 9,
          color: unit.passive.usesLeft === 0 ? '#555' : '#80CBC4',
          marginBottom: 4,
          fontStyle: 'italic',
          position: 'relative',
          zIndex: 3,
        }}
        title={unit.passive.description}
        >
          ✦ {unit.passive.name}{unit.passive.usesLeft === 0 ? ' (used)' : ''}
        </div>
      )}

      {/* Buffs & Debuffs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', position: 'relative', zIndex: 3 }}>
        {unit.buffs.map((b, i) => {
          const info = EFFECT_ICONS[b.type] || { icon: '?', color: '#888', label: formatEffect(b.type) };
          return (
            <span key={`buff-${i}`} title={info.label} style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              width: 22,
              height: 18,
              fontSize: 13,
              backgroundColor: `color-mix(in srgb, ${info.color} 25%, #1B5E20)`,
              color: '#fff',
              borderRadius: 9,
              boxShadow: `0 0 6px ${info.color}66`,
            }}>
              {info.icon}
              <span style={{ fontSize: 8, fontWeight: 'bold' }}>{b.duration}</span>
            </span>
          );
        })}
        {unit.debuffs.map((d, i) => {
          const info = EFFECT_ICONS[d.type] || { icon: '?', color: '#888', label: formatEffect(d.type) };
          return (
            <span key={`debuff-${i}`} title={info.label} style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              width: 22,
              height: 18,
              fontSize: 13,
              backgroundColor: `color-mix(in srgb, ${info.color} 25%, #B71C1C)`,
              color: '#fff',
              borderRadius: 9,
              boxShadow: `0 0 6px ${info.color}66`,
            }}>
              {info.icon}
              <span style={{ fontSize: 8, fontWeight: 'bold' }}>{d.duration}</span>
            </span>
          );
        })}
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
          position: 'relative',
          zIndex: 3,
        }}>
          DEFEATED
        </div>
      )}
      {showDetail && (
        <HeroDetailModal hero={unit} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}
