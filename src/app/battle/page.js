'use client';

import { useState } from 'react';
import { heroRoster } from '../../data/units';
import BattleUI from '../../components/BattleUI';
import TeamPresets from '../../components/TeamPresets';

const ELEMENT_COLORS = {
  Storm: '#6B5CE7',
  Ocean: '#2196F3',
  Underworld: '#8B0000',
  Sun: '#FF9800',
  Moon: '#9C27B0',
};

const ROLE_COLORS = {
  Attacker: '#F44336',
  Tank: '#2196F3',
  Support: '#4CAF50',
  Bruiser: '#FF9800',
  Debuffer: '#9C27B0',
};

export default function BattlePage() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [inBattle, setInBattle] = useState(false);
  const allHeroes = Object.values(heroRoster);

  const toggleHero = (heroId) => {
    setSelectedIds(prev => {
      if (prev.includes(heroId)) return prev.filter(id => id !== heroId);
      if (prev.length >= 4) return prev;
      return [...prev, heroId];
    });
  };

  if (inBattle) {
    const selectedTemplates = selectedIds.map(id => heroRoster[id]);
    return <BattleUI playerTeam={selectedTemplates} onExit={() => setInBattle(false)} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', color: '#eee', padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, color: '#FFD700', margin: 0 }}>SELECT YOUR TEAM</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
          Choose 4 heroes for battle ({selectedIds.length}/4)
        </p>
      </div>

      <TeamPresets selectedIds={selectedIds} onLoadPreset={(ids) => setSelectedIds(ids)} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 10,
        maxWidth: 900,
        margin: '0 auto 20px',
      }}>
        {allHeroes.map(hero => {
          const isSelected = selectedIds.includes(hero.id);
          const elementColor = ELEMENT_COLORS[hero.element] || '#666';
          const roleColor = ROLE_COLORS[hero.role] || '#888';

          return (
            <div
              key={hero.id}
              onClick={() => toggleHero(hero.id)}
              style={{
                padding: 12,
                borderRadius: 8,
                borderTop: isSelected ? '2px solid #FFD700' : '2px solid #333',
                borderRight: isSelected ? '2px solid #FFD700' : '2px solid #333',
                borderBottom: isSelected ? '2px solid #FFD700' : '2px solid #333',
                borderLeft: `3px solid ${roleColor}`,
                backgroundColor: isSelected ? '#1a1a3e' : '#1a1a2e',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isSelected ? '0 0 10px rgba(255,215,0,0.3)' : 'none',
                opacity: !isSelected && selectedIds.length >= 4 ? 0.4 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 'bold', fontSize: 13, color: '#eee' }}>{hero.name}</span>
                <span style={{ fontSize: 10, color: elementColor, border: `1px solid ${elementColor}`, borderRadius: 3, padding: '1px 4px' }}>
                  {hero.element}
                </span>
              </div>
              <div style={{ fontSize: 9, color: '#FFD740', marginBottom: 3 }}>
                {'★'.repeat(hero.stars || 4)} Lv{hero.level || 1}
              </div>
              <div style={{ display: 'flex', gap: 6, fontSize: 10, color: '#999', marginBottom: 3 }}>
                <span>{hero.faction}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, fontSize: 10, color: '#777' }}>
                <span style={{ color: roleColor }}>{hero.role}</span>
                <span>ATK {hero.attack}</span>
                <span>SPD {hero.speed}</span>
              </div>
              {isSelected && (
                <div style={{ fontSize: 10, color: '#FFD700', marginTop: 4, textAlign: 'center', fontWeight: 'bold' }}>
                  SELECTED
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => selectedIds.length === 4 && setInBattle(true)}
          disabled={selectedIds.length !== 4}
          style={{
            padding: '12px 40px',
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: selectedIds.length === 4 ? '#FFD700' : '#333',
            color: selectedIds.length === 4 ? '#000' : '#666',
            border: 'none',
            borderRadius: 8,
            cursor: selectedIds.length === 4 ? 'pointer' : 'not-allowed',
          }}
        >
          START BATTLE
        </button>
      </div>
    </div>
  );
}
