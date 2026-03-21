'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { heroRoster } from '../../data/units';
import BattleUI from '../../components/BattleUI';
import { loadSave, updateSave } from '../../utils/saveSystem';
import { checkArenaAchievements, checkBattleAchievements } from '../../utils/achievementTracker';
import AchievementToast from '../../components/AchievementToast';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPPONENT_NAMES = [
  'Shadowlord', 'Divine Crusader', 'Storm Herald', 'Voidwalker', 'Sun Champion',
  'Moonblade', 'Deathwhisper', 'Ironguard', 'Flamecaller', 'Frostweaver',
  'Tidecaller', 'Duskbringer', 'Starforger', 'Earthshaker', 'Windrunner',
  'Soulreaper', 'Lightbringer', 'Nightstalker', 'Thunderborn', 'Wraithking',
];

const TIER_COLORS = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#00BCD4',
  Legend: '#FF4444',
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTier(points) {
  if (points >= 4000) return 'Legend';
  if (points >= 3000) return 'Platinum';
  if (points >= 2000) return 'Gold';
  if (points >= 1000) return 'Silver';
  return 'Bronze';
}

function getTeamPower(team) {
  return team.reduce((sum, h) => sum + h.attack + h.defense + h.speed + h.maxHP / 100, 0);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateOpponent() {
  const name = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)];
  const allHeroes = Object.values(heroRoster);
  const team = shuffleArray(allHeroes).slice(0, 4);
  const power = getTeamPower(team);

  let difficulty, reward;
  if (power < 3200) {
    difficulty = 'Easy';
    reward = 15;
  } else if (power < 3600) {
    difficulty = 'Medium';
    reward = 20;
  } else {
    difficulty = 'Hard';
    reward = 25;
  }

  return { name, team, power: Math.round(power), difficulty, reward, id: Math.random().toString(36).slice(2) };
}

function generateOpponents() {
  return [generateOpponent(), generateOpponent(), generateOpponent()];
}

const DIFFICULTY_COLORS = {
  Easy: '#4CAF50',
  Medium: '#FF9800',
  Hard: '#F44336',
};

// ---------------------------------------------------------------------------
// Arena Page
// ---------------------------------------------------------------------------

export default function ArenaPage() {
  const [arenaPoints, setArenaPoints] = useState(500);
  const [toast, setToast] = useState(null);
  const [phase, setPhase] = useState('browse'); // 'browse' | 'select' | 'battle'
  const [opponents, setOpponents] = useState([]);
  const [chosenOpponent, setChosenOpponent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  // Load persisted arena points
  useEffect(() => {
    const save = loadSave();
    if (save.arenaPoints !== undefined) setArenaPoints(save.arenaPoints);
  }, []);

  // Generate opponents client-side only to avoid hydration mismatch
  useEffect(() => {
    setOpponents(generateOpponents());
  }, []);

  const tier = getTier(arenaPoints);
  const tierColor = TIER_COLORS[tier];
  const allHeroes = useMemo(() => Object.values(heroRoster), []);

  // --- Browse phase handlers ---

  const handleRefresh = useCallback(() => {
    setOpponents(generateOpponents());
  }, []);

  const handlePickOpponent = useCallback((opponent) => {
    setChosenOpponent(opponent);
    setSelectedIds([]);
    setPhase('select');
  }, []);

  // --- Select phase handlers ---

  const toggleHero = useCallback((heroId) => {
    setSelectedIds(prev => {
      if (prev.includes(heroId)) return prev.filter(id => id !== heroId);
      if (prev.length >= 4) return prev;
      return [...prev, heroId];
    });
  }, []);

  const handleStartBattle = useCallback(() => {
    if (selectedIds.length === 4) {
      setPhase('battle');
    }
  }, [selectedIds]);

  const handleBackToBrowse = useCallback(() => {
    setChosenOpponent(null);
    setSelectedIds([]);
    setPhase('browse');
  }, []);

  // --- Battle exit ---

  const handleBattleExit = useCallback((playerWon) => {
    if (playerWon) {
      const reward = chosenOpponent?.reward || 20;
      setArenaPoints(prev => prev + reward);
      setLastResult({ won: true, points: reward });
    } else {
      const loss = 10;
      setArenaPoints(prev => Math.max(0, prev - loss));
      setLastResult({ won: false, points: loss });
    }

    // Persist
    const newPoints = playerWon ? arenaPoints + (chosenOpponent?.reward || 20) : Math.max(0, arenaPoints - 10);
    updateSave({ arenaPoints: newPoints });

    // Track battle stats
    const save = loadSave();
    const newStats = { ...save.stats };
    if (playerWon) {
      newStats.battlesWon = (newStats.battlesWon || 0) + 1;
    } else {
      newStats.battlesLost = (newStats.battlesLost || 0) + 1;
    }
    updateSave({ stats: newStats });

    // Check achievements
    const battleUnlocked = checkBattleAchievements(playerWon, newStats);
    const arenaUnlocked = checkArenaAchievements(playerWon, newPoints);
    const allUnlocked = [...battleUnlocked, ...arenaUnlocked];
    if (allUnlocked.length > 0) setToast(allUnlocked[0]);

    setChosenOpponent(null);
    setSelectedIds([]);
    setOpponents(generateOpponents());
    setPhase('browse');
  }, [chosenOpponent, arenaPoints]);

  // =========================================================================
  // RENDER — Battle Phase
  // =========================================================================

  if (phase === 'battle') {
    const playerTeam = selectedIds.map(id => heroRoster[id]);
    const enemyTeam = chosenOpponent.team;
    return <BattleUI playerTeam={playerTeam} enemyTeam={enemyTeam} onExit={handleBattleExit} />;
  }

  // =========================================================================
  // RENDER — Team Select Phase
  // =========================================================================

  if (phase === 'select') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', color: '#eee', padding: 20 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, color: '#FFD700', margin: 0 }}>ARENA — SELECT YOUR TEAM</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
            Choose 4 heroes to face <span style={{ color: '#FF6B6B', fontWeight: 'bold' }}>{chosenOpponent.name}</span> ({selectedIds.length}/4)
          </p>
          <button
            onClick={handleBackToBrowse}
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
            Back to Opponents
          </button>
        </div>

        {/* Opponent Preview */}
        <div style={{
          maxWidth: 900,
          margin: '0 auto 16px',
          padding: 12,
          backgroundColor: '#111',
          borderRadius: 8,
          border: '1px solid #333',
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>OPPONENT TEAM:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {chosenOpponent.team.map(h => (
              <span key={h.id} style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: '#1a1a2e',
                color: ELEMENT_COLORS[h.element] || '#aaa',
                border: `1px solid ${ELEMENT_COLORS[h.element] || '#333'}`,
              }}>
                {h.name} ({h.role})
              </span>
            ))}
            <span style={{ fontSize: 11, color: DIFFICULTY_COLORS[chosenOpponent.difficulty], marginLeft: 'auto', alignSelf: 'center' }}>
              {chosenOpponent.difficulty} | +{chosenOpponent.reward} pts
            </span>
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
            onClick={handleStartBattle}
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

  // =========================================================================
  // RENDER — Browse Phase (default)
  // =========================================================================

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', color: '#eee', padding: 20 }}>
      {/* Arena Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, color: '#FFD700', margin: 0, letterSpacing: 2 }}>
          PVP ARENA
        </h1>
        <div style={{ color: '#999', fontSize: 14, marginTop: 4, letterSpacing: 4, textTransform: 'uppercase' }}>
          Gods of the Realms — War of Worlds
        </div>
      </div>

      {/* Rank / Tier Display */}
      <div style={{
        maxWidth: 500,
        margin: '0 auto 24px',
        padding: 20,
        backgroundColor: '#111',
        borderRadius: 12,
        border: `2px solid ${tierColor}`,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4, letterSpacing: 2 }}>YOUR RANK</div>
        <div style={{ fontSize: 36, fontWeight: 'bold', color: tierColor, letterSpacing: 2 }}>
          {tier.toUpperCase()}
        </div>
        <div style={{ fontSize: 16, color: '#ccc', marginTop: 4 }}>
          {arenaPoints} Arena Points
        </div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>
          Bronze 0 — Silver 1000 — Gold 2000 — Platinum 3000 — Legend 4000+
        </div>
      </div>

      {/* Last Result Banner */}
      {lastResult && (
        <div style={{
          maxWidth: 500,
          margin: '0 auto 16px',
          padding: 10,
          borderRadius: 8,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 'bold',
          backgroundColor: lastResult.won ? '#1a3a1a' : '#3a1a1a',
          color: lastResult.won ? '#4CAF50' : '#F44336',
          border: `1px solid ${lastResult.won ? '#4CAF50' : '#F44336'}`,
        }}>
          {lastResult.won
            ? `VICTORY! +${lastResult.points} Arena Points`
            : `DEFEAT! -${lastResult.points} Arena Points`
          }
        </div>
      )}

      {/* Opponents List */}
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, color: '#ddd', margin: 0 }}>CHOOSE AN OPPONENT</h2>
          <button
            onClick={handleRefresh}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 'bold',
              backgroundColor: '#1a1a2e',
              color: '#aaa',
              border: '1px solid #444',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Refresh Opponents
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {opponents.map((opp) => (
            <div
              key={opp.id}
              onClick={() => handlePickOpponent(opp)}
              style={{
                padding: 16,
                borderRadius: 10,
                backgroundColor: '#1a1a2e',
                border: '1px solid #333',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FFD700'; e.currentTarget.style.backgroundColor = '#1a1a3e'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.backgroundColor = '#1a1a2e'; }}
            >
              {/* Opponent Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#eee' }}>{opp.name}</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    color: DIFFICULTY_COLORS[opp.difficulty],
                    border: `1px solid ${DIFFICULTY_COLORS[opp.difficulty]}`,
                    fontWeight: 'bold',
                  }}>
                    {opp.difficulty}
                  </span>
                  <span style={{ fontSize: 13, color: '#FFD700', fontWeight: 'bold' }}>
                    +{opp.reward} pts
                  </span>
                </div>
              </div>

              {/* Opponent Team */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                {opp.team.map(h => (
                  <span key={h.id} style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 4,
                    backgroundColor: '#0d0d1a',
                    color: ELEMENT_COLORS[h.element] || '#aaa',
                    border: `1px solid ${ELEMENT_COLORS[h.element] || '#333'}`,
                  }}>
                    {h.name}
                    <span style={{ color: '#666', marginLeft: 4 }}>{h.role}</span>
                  </span>
                ))}
              </div>

              {/* Power */}
              <div style={{ fontSize: 11, color: '#666' }}>
                Team Power: {opp.power}
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast && <AchievementToast achievementId={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
