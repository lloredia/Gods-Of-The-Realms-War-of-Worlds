'use client';

import { useState, useEffect } from 'react';
import { heroRoster } from '../../data/units';
import BattleUI from '../../components/BattleUI';
import { loadSave, updateSave } from '../../utils/saveSystem';
import { getTeamWithSave, getAllHeroesWithSave } from '../../utils/heroUtils';

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

export default function CampaignPage() {
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectingTeam, setSelectingTeam] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [highestCleared, setHighestCleared] = useState(0);

  // Persist campaign progress
  useEffect(() => {
    const save = loadSave();
    setHighestCleared(save.campaignProgress?.highestStage || 0);
  }, []);

  // =========================================================================
  // RENDER — Battle Phase
  // =========================================================================

  if (selectedStage && !selectingTeam) {
    const stage = STAGES.find(s => s.id === selectedStage);
    const enemyTemplates = getTeamWithSave(stage.enemies);

    const finalEnemies = stage.boss
      ? enemyTemplates.map(e => ({
          ...e,
          maxHP: Math.floor(e.maxHP * stage.boss.bonusHP),
          currentHP: Math.floor(e.maxHP * stage.boss.bonusHP),
          attack: Math.floor(e.attack * stage.boss.bonusATK),
          defense: Math.floor(e.defense * (stage.boss.bonusDEF || 1)),
        }))
      : enemyTemplates;

    const playerTeam = getTeamWithSave(selectedIds);

    return (
      <BattleUI
        playerTeam={playerTeam}
        enemyTeam={finalEnemies}
        onExit={(won) => {
          if (won) {
            const save = loadSave();
            const stageGold = selectedStage * 500;
            const newHighest = Math.max(save.campaignProgress?.highestStage || 0, selectedStage);
            updateSave({
              resources: { ...save.resources, gold: (save.resources.gold || 0) + stageGold },
              campaignProgress: { highestStage: newHighest },
              stats: { ...save.stats, battlesWon: (save.stats?.battlesWon || 0) + 1 },
            });
            setHighestCleared(newHighest);
          } else {
            const save = loadSave();
            updateSave({ stats: { ...save.stats, battlesLost: (save.stats?.battlesLost || 0) + 1 } });
          }
          setSelectedStage(null);
          setSelectingTeam(false);
          setSelectedIds([]);
        }}
        stageInfo={stage}
      />
    );
  }

  // =========================================================================
  // RENDER — Team Select Phase
  // =========================================================================

  if (selectingTeam && selectedStage) {
    const stage = STAGES.find(s => s.id === selectedStage);
    const diffColor = DIFFICULTY_COLORS[stage.difficulty] || '#888';
    const allHeroes = getAllHeroesWithSave();

    const toggleHero = (heroId) => {
      setSelectedIds(prev => {
        if (prev.includes(heroId)) return prev.filter(id => id !== heroId);
        if (prev.length >= 4) return prev;
        return [...prev, heroId];
      });
    };

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', color: '#eee', padding: 20 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, color: '#FFD700', margin: 0 }}>CAMPAIGN — SELECT YOUR TEAM</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
            Choose 4 heroes for <span style={{ color: diffColor, fontWeight: 'bold' }}>{stage.name}</span> ({selectedIds.length}/4)
          </p>
          <button
            onClick={() => { setSelectingTeam(false); setSelectedStage(null); setSelectedIds([]); }}
            style={{
              marginTop: 8,
              padding: '6px 20px',
              fontSize: 12,
              backgroundColor: '#333',
              color: '#ccc',
              border: '1px solid #555',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Back to Stages
          </button>
        </div>

        {/* Stage Info */}
        <div style={{
          maxWidth: 900,
          margin: '0 auto 16px',
          padding: 12,
          backgroundColor: '#111',
          borderRadius: 8,
          border: '1px solid #333',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#eee' }}>
              Stage {stage.id}: {stage.name}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 'bold', color: diffColor,
              border: `1px solid ${diffColor}`, borderRadius: 4, padding: '2px 8px',
            }}>
              {stage.difficulty}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#777', marginBottom: 6 }}>{stage.desc}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>ENEMIES:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stage.enemies.map(id => {
              const h = heroRoster[id];
              if (!h) return null;
              return (
                <span key={id} style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 4,
                  backgroundColor: '#1a1a2e',
                  color: ELEMENT_COLORS[h.element] || '#aaa',
                  border: `1px solid ${ELEMENT_COLORS[h.element] || '#333'}`,
                }}>
                  {h.name} ({h.role})
                </span>
              );
            })}
            {stage.boss && (
              <span style={{ fontSize: 10, color: '#F44336', border: '1px solid #F44336', borderRadius: 3, padding: '2px 6px', marginLeft: 'auto', alignSelf: 'center' }}>BOSS</span>
            )}
          </div>
        </div>

        {/* Hero Grid */}
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

        {/* Start Battle Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => { if (selectedIds.length === 4) setSelectingTeam(false); }}
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
              onClick={() => { if (isUnlocked) { setSelectedStage(stage.id); setSelectingTeam(true); setSelectedIds([]); } }}
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
