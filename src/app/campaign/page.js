'use client';

import { useState } from 'react';
import { heroRoster } from '../../data/units';
import BattleUI from '../../components/BattleUI';

const STAGES = [
  { id: 1, name: 'Gates of Olympus', enemies: ['zeus', 'poseidon'], difficulty: 'Easy', desc: 'Face the lesser guardians.' },
  { id: 2, name: 'Frost Giant\'s Pass', enemies: ['thor', 'freya'], difficulty: 'Easy', desc: 'Norse warriors block the path.' },
  { id: 3, name: 'Tomb of the Pharaoh', enemies: ['anubis', 'ra', 'bastet'], difficulty: 'Normal', desc: 'The sands stir with ancient power.' },
  { id: 4, name: 'The Mist Veil', enemies: ['morganLeFay', 'cuChulainn', 'freya'], difficulty: 'Normal', desc: 'Celtic spirits defend their realm.' },
  { id: 5, name: 'Temple of the Sun', enemies: ['amaterasu', 'susanoo', 'ra'], difficulty: 'Normal', desc: 'The Rising Sun stands against you.', boss: { name: 'Titan Helios', bonusHP: 1.3, bonusATK: 1.2 } },
  { id: 6, name: 'Allfather\'s Trial', enemies: ['thor', 'freya', 'loki', 'anubis'], difficulty: 'Hard', desc: 'A true test of strength.' },
  { id: 7, name: 'Shadow of Hades', enemies: ['hades', 'anubis', 'loki', 'bastet'], difficulty: 'Hard', desc: 'Darkness gathers from all realms.' },
  { id: 8, name: 'Divine Convergence', enemies: ['zeus', 'amaterasu', 'thor', 'apollo'], difficulty: 'Very Hard', desc: 'The mightiest gods unite.', boss: { name: 'Primordial Chaos', bonusHP: 1.5, bonusATK: 1.3 } },
  { id: 9, name: 'Ragnarok\'s Edge', enemies: ['thor', 'loki', 'hades', 'susanoo'], difficulty: 'Very Hard', desc: 'The end of worlds approaches.' },
  { id: 10, name: 'War of Worlds', enemies: ['zeus', 'hades', 'apollo', 'poseidon'], difficulty: 'Legendary', desc: 'The final battle for supremacy.', boss: { name: 'Chronos, Father of Gods', bonusHP: 2.0, bonusATK: 1.5, bonusDEF: 1.3 } },
];

const DIFFICULTY_COLORS = {
  'Easy': '#4CAF50',
  'Normal': '#2196F3',
  'Hard': '#FF9800',
  'Very Hard': '#F44336',
  'Legendary': '#FFD700',
};

export default function CampaignPage() {
  const [selectedStage, setSelectedStage] = useState(null);
  const [highestCleared, setHighestCleared] = useState(0);

  if (selectedStage) {
    const stage = STAGES.find(s => s.id === selectedStage);
    const enemyTemplates = stage.enemies.map(id => heroRoster[id]).filter(Boolean);

    const finalEnemies = stage.boss
      ? enemyTemplates.map(e => ({
          ...e,
          maxHP: Math.floor(e.maxHP * stage.boss.bonusHP),
          currentHP: Math.floor(e.maxHP * stage.boss.bonusHP),
          attack: Math.floor(e.attack * stage.boss.bonusATK),
          defense: Math.floor(e.defense * (stage.boss.bonusDEF || 1)),
        }))
      : enemyTemplates;

    return (
      <BattleUI
        playerTeam={null}
        enemyTeam={finalEnemies}
        onExit={(won) => {
          if (won && selectedStage > highestCleared) {
            setHighestCleared(selectedStage);
          }
          setSelectedStage(null);
        }}
        stageInfo={stage}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', color: '#eee', padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, color: '#FFD700', margin: 0 }}>CAMPAIGN</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
          Stage {highestCleared}/{STAGES.length} cleared
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {STAGES.map(stage => {
          const isUnlocked = stage.id <= highestCleared + 1;
          const isCleared = stage.id <= highestCleared;
          const diffColor = DIFFICULTY_COLORS[stage.difficulty] || '#888';

          return (
            <div
              key={stage.id}
              onClick={() => isUnlocked && setSelectedStage(stage.id)}
              style={{
                padding: 14,
                marginBottom: 8,
                borderRadius: 8,
                backgroundColor: isCleared ? '#1a2e1a' : isUnlocked ? '#1a1a2e' : '#111',
                border: isCleared ? '1px solid #4CAF50' : isUnlocked ? '1px solid #333' : '1px solid #222',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : 0.4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.15s',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>Stage {stage.id}</span>
                  <span style={{ fontWeight: 'bold', fontSize: 14, color: '#eee' }}>{stage.name}</span>
                  {isCleared && <span style={{ fontSize: 10, color: '#4CAF50' }}>✓</span>}
                  {stage.boss && <span style={{ fontSize: 10, color: '#F44336', border: '1px solid #F44336', borderRadius: 3, padding: '1px 6px', marginLeft: 6 }}>BOSS</span>}
                </div>
                <div style={{ fontSize: 11, color: '#777' }}>{stage.desc}</div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
                  Enemies: {stage.enemies.map(id => heroRoster[id]?.name || id).join(', ')}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 'bold', color: diffColor,
                border: `1px solid ${diffColor}`, borderRadius: 4, padding: '2px 8px',
              }}>
                {stage.difficulty}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
