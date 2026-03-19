'use client';

import { useState } from 'react';
import { heroRoster } from '../../data/units';
import factions from '../../data/factions';
import { formatEffect } from '../../engine/effectSystem';

const ELEMENT_COLORS = {
  Storm: '#6B5CE7', Ocean: '#2196F3', Underworld: '#8B0000', Sun: '#FF9800', Moon: '#9C27B0',
};
const ROLE_COLORS = {
  Attacker: '#F44336', Tank: '#2196F3', Support: '#4CAF50', Bruiser: '#FF9800', Debuffer: '#9C27B0',
};

export default function CollectionPage() {
  const [filter, setFilter] = useState('All');
  const allHeroes = Object.values(heroRoster);
  const factionNames = ['All', ...Object.values(factions).map(f => f.name)];

  const filtered = filter === 'All' ? allHeroes : allHeroes.filter(h => h.faction === filter);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', color: '#eee', padding: 20 }}>
      <h1 style={{ textAlign: 'center', fontSize: 24, color: '#FFD700', margin: '0 0 16px' }}>HERO COLLECTION</h1>
      <p style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 16 }}>
        {allHeroes.length} Heroes Owned
      </p>

      {/* Faction filter */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        {factionNames.map(name => (
          <button key={name} onClick={() => setFilter(name)} style={{
            padding: '5px 12px', fontSize: 11, fontWeight: 'bold',
            backgroundColor: filter === name ? '#2a2a4a' : '#111',
            color: filter === name ? '#FFD700' : '#888',
            border: `1px solid ${filter === name ? '#FFD700' : '#333'}`,
            borderRadius: 4, cursor: 'pointer',
          }}>
            {name}
          </button>
        ))}
      </div>

      {/* Hero grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 12, maxWidth: 1000, margin: '0 auto',
      }}>
        {filtered.map(hero => {
          const elemColor = ELEMENT_COLORS[hero.element] || '#666';
          const roleColor = ROLE_COLORS[hero.role] || '#888';
          return (
            <div key={hero.id} style={{
              padding: 14, borderRadius: 8, backgroundColor: '#1a1a2e',
              border: '1px solid #333', borderLeft: `3px solid ${elemColor}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 'bold', fontSize: 14, color: '#eee' }}>{hero.name}</span>
                <span style={{ fontSize: 10, color: elemColor, border: `1px solid ${elemColor}`, borderRadius: 3, padding: '1px 4px' }}>{hero.element}</span>
              </div>
              <div style={{ fontSize: 9, color: '#FFD740', marginBottom: 3 }}>
                {'★'.repeat(hero.stars || 4)}{hero.awakened ? ' ✧' : ''} Lv{hero.level || 1}
              </div>
              <div style={{ fontSize: 10, color: '#999', marginBottom: 6 }}>
                {hero.faction} • <span style={{ color: roleColor }}>{hero.role}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, fontSize: 10, color: '#aaa', marginBottom: 6 }}>
                <span>HP {hero.maxHP}</span>
                <span>ATK {hero.attack}</span>
                <span>DEF {hero.defense}</span>
                <span>SPD {hero.speed}</span>
              </div>
              <div style={{ fontSize: 10, color: '#777', marginBottom: 4 }}>
                {hero.skills.map(s => s.name).join(' • ')}
              </div>
              {hero.passive && (
                <div style={{ fontSize: 9, color: '#80CBC4', fontStyle: 'italic' }}>✦ {hero.passive.name}</div>
              )}
              {hero.relicSet && (
                <div style={{ fontSize: 9, color: '#CE93D8', marginTop: 2 }}>◈ {hero.relicSet.charAt(0).toUpperCase() + hero.relicSet.slice(1)} Set</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
