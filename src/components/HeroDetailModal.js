'use client';

import HeroPortrait from './HeroPortrait';
import relics from '../data/relics';
import factions from '../data/factions';
import lore from '../data/lore';
import { previewStats } from '../engine/progressionSystem';

const ELEMENT_COLORS = {
  Storm: '#6B5CE7', Ocean: '#2196F3', Underworld: '#8B0000', Sun: '#FF9800', Moon: '#9C27B0',
};
const ROLE_COLORS = {
  Attacker: '#F44336', Tank: '#2196F3', Support: '#4CAF50', Bruiser: '#FF9800', Debuffer: '#9C27B0',
};
const FACTION_KEY_MAP = {
  'The Pantheon': 'Pantheon',
  "The Allfather's Hall": 'Norse',
  'The Eternal Sands': 'Egyptian',
  'The Mist Realm': 'Celtic',
  'The Rising Sun': 'Japanese',
};

const ELEMENT_LORE = {
  Storm: 'Commands the fury of thunder and lightning.',
  Ocean: 'Wields the depths and tides of the sea.',
  Underworld: 'Channels the dark powers of death and shadow.',
  Sun: 'Radiates divine light and celestial fire.',
  Moon: 'Draws power from the mystic moonlight.',
};

const ROLE_DESC = {
  Attacker: 'Deals massive damage to enemies.',
  Tank: 'Absorbs damage and protects allies.',
  Support: 'Heals and buffs the team.',
  Bruiser: 'Balanced fighter with high survivability.',
  Debuffer: 'Weakens enemies with status effects.',
};

const SKILL_TYPE_COLORS = {
  damage: '#F44336',
  heal: '#4CAF50',
  buff: '#FFD700',
  debuff: '#9C27B0',
  cleanse: '#00BCD4',
  strip: '#FF9800',
};

export default function HeroDetailModal({ hero, onClose }) {
  if (!hero) return null;

  const elemColor = ELEMENT_COLORS[hero.element] || '#666';
  const roleColor = ROLE_COLORS[hero.role] || '#888';
  const faction = hero.faction ? Object.values(factions).find(f => f.name === hero.faction) : null;
  const factionColor = faction ? faction.color : '#666';
  const relic = hero.relicSet ? relics[hero.relicSet] : null;
  const heroLore = lore[hero.id];
  const stars = hero.stars || 4;
  const level = hero.level || 1;

  // Get projected stats at current level
  let projectedStats = null;
  if (typeof previewStats === 'function') {
    try {
      projectedStats = previewStats(hero, level, stars, hero.awakened || false);
    } catch { /* not critical */ }
  }

  const displayStats = projectedStats || {
    maxHP: hero.maxHP, attack: hero.attack, defense: hero.defense, speed: hero.speed,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
        animation: 'modalFadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#12122a',
          border: `1px solid ${elemColor}44`,
          borderRadius: 12,
          maxWidth: 420,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'modalSlideUp 0.25s ease-out',
        }}
      >
        {/* Header — Portrait + Name + Element */}
        <div style={{
          background: `linear-gradient(135deg, ${factionColor}22, ${elemColor}11, #12122a)`,
          borderRadius: '12px 12px 0 0',
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${elemColor}33`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <HeroPortrait
              unitId={hero.id}
              element={hero.element}
              faction={FACTION_KEY_MAP[hero.faction]}
              size={64}
              isActive={true}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>{hero.name}</span>
                <span style={{
                  fontSize: 10, color: elemColor,
                  border: `1px solid ${elemColor}`,
                  borderRadius: 4, padding: '1px 6px',
                }}>{hero.element}</span>
              </div>
              <div style={{ fontSize: 12, color: '#FFD740', marginBottom: 3 }}>
                {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 6 - stars))}
                {hero.awakened ? ' ✧ Awakened' : ''}
                <span style={{ color: '#888', marginLeft: 8 }}>Lv {level}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {faction && (
                  <span style={{ fontSize: 11, color: factionColor }}>{faction.name}</span>
                )}
                <span style={{
                  fontSize: 9, color: roleColor,
                  backgroundColor: `${roleColor}22`,
                  borderRadius: 3, padding: '1px 6px',
                  fontWeight: 'bold', textTransform: 'uppercase',
                }}>{hero.role}</span>
              </div>
            </div>
          </div>
          {/* Lore line */}
          <div style={{ fontSize: 11, color: '#777', marginTop: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
            {ELEMENT_LORE[hero.element] || ''} {ROLE_DESC[hero.role] || ''}
          </div>
        </div>

        {heroLore && (
          <div style={{ padding: '12px 20px 0' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              {heroLore.title}
            </div>
            <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, marginBottom: 8 }}>
              {heroLore.lore}
            </div>
            <div style={{ fontSize: 11, color: '#FFD740', fontStyle: 'italic', marginBottom: 4 }}>
              {heroLore.quote}
            </div>
          </div>
        )}

        {/* Stats Panel */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Combat Stats
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <StatBar label="HP" value={displayStats.maxHP} max={20000} color="#4CAF50" />
            <StatBar label="ATK" value={displayStats.attack} max={1500} color="#F44336" />
            <StatBar label="DEF" value={displayStats.defense} max={1000} color="#2196F3" />
            <StatBar label="SPD" value={displayStats.speed} max={200} color="#00BCD4" />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: '#999' }}>
            <span>Crit Rate: <span style={{ color: '#FF9800' }}>{Math.round((hero.critRate || 0.15) * 100)}%</span></span>
            <span>Crit Dmg: <span style={{ color: '#FF9800' }}>{Math.round((hero.critDamage || 1.5) * 100)}%</span></span>
            <span>Accuracy: <span style={{ color: '#FF9800' }}>{Math.round((hero.accuracy || 0.85) * 100)}%</span></span>
          </div>
        </div>

        {/* Skills */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Skills
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hero.skills.map((skill, i) => {
              const typeColor = SKILL_TYPE_COLORS[skill.type] || '#888';
              return (
                <div key={skill.id || i} style={{
                  backgroundColor: '#1a1a35',
                  border: `1px solid ${typeColor}33`,
                  borderRadius: 6,
                  padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 'bold', color: '#eee' }}>{skill.name}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 9, color: typeColor,
                        backgroundColor: `${typeColor}22`,
                        borderRadius: 3, padding: '1px 5px',
                        textTransform: 'uppercase', fontWeight: 'bold',
                      }}>{skill.type}</span>
                      {skill.cooldown > 0 && (
                        <span style={{ fontSize: 9, color: '#F44336' }}>CD {skill.cooldown}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.5, marginBottom: 4 }}>
                    {skill.description}
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 9, color: '#777' }}>
                    <span>Target: {skill.target === 'single' ? 'Single' : skill.target === 'all' ? 'All Enemies' : 'All Allies'}</span>
                    {skill.multiplier > 0 && <span>Multiplier: {skill.multiplier}x</span>}
                    {skill.hits > 1 && <span>Hits: {skill.hits}x</span>}
                    {skill.effectChance > 0 && (
                      <span>Effect: {Math.round(skill.effectChance * 100)}% chance</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Passive */}
        {hero.passive && (
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Passive Ability
            </div>
            <div style={{
              backgroundColor: '#1a2a2a',
              border: '1px solid #80CBC444',
              borderRadius: 6,
              padding: '10px 12px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#80CBC4', marginBottom: 4 }}>
                ✦ {hero.passive.name}
              </div>
              <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.5 }}>
                {hero.passive.description}
              </div>
              <div style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
                Trigger: {hero.passive.trigger === 'on_turn_start' ? 'Every Turn Start'
                  : hero.passive.trigger === 'on_receive_fatal' ? 'On Fatal Damage'
                  : hero.passive.trigger === 'on_deal_damage' ? 'On Deal Damage'
                  : hero.passive.trigger}
                {hero.passive.usesLeft !== undefined && ` • Uses: ${hero.passive.usesLeft}`}
              </div>
            </div>
          </div>
        )}

        {/* Relic */}
        {relic && (
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Equipped Relic
            </div>
            <div style={{
              backgroundColor: '#1a1a30',
              border: `1px solid ${relic.color}44`,
              borderRadius: 6,
              padding: '10px 12px',
              borderLeft: `3px solid ${relic.color}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: relic.color, marginBottom: 4 }}>
                ◈ {relic.name} Set
              </div>
              <div style={{ fontSize: 10, color: '#aaa', fontStyle: 'italic', marginBottom: 6 }}>{relic.description}</div>
              <div style={{ fontSize: 10, color: '#999' }}>
                <div>2-piece: {relic.twoPiece.stat} +{Math.round(relic.twoPiece.value * 100)}%</div>
                <div>4-piece: {relic.fourPiece.description}</div>
              </div>
            </div>
          </div>
        )}

        {/* Faction info */}
        {faction && (
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Faction
            </div>
            <div style={{
              backgroundColor: '#1a1a30',
              border: `1px solid ${factionColor}33`,
              borderRadius: 6,
              padding: '10px 12px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: factionColor, marginBottom: 2 }}>
                {faction.name} — {faction.title}
              </div>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{faction.mythology} Mythology</div>
              <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.5 }}>{faction.description}</div>
              <div style={{ fontSize: 9, color: '#666', marginTop: 4 }}>Playstyle: {faction.playstyle}</div>
            </div>
          </div>
        )}

        {/* Close button */}
        <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 32px',
              fontSize: 12,
              fontWeight: 'bold',
              backgroundColor: '#333',
              color: '#ccc',
              border: '1px solid #555',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, max, color }) {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div style={{ backgroundColor: '#222', borderRadius: 3, height: 6, overflow: 'hidden' }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 3,
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  );
}
