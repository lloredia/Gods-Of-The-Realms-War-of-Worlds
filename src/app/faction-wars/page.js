'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import factions from '../../data/factions';
import { heroRoster } from '../../data/units';
import BattleUI from '../../components/BattleUI';
import { loadSave, updateSave } from '../../utils/saveSystem';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'gotr_faction_wars';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const FACTION_KEYS = ['thePantheon', 'theAllfathersHall', 'theEternalSands', 'theMistRealm', 'theRisingSun'];

const REWARD_TIERS = [
  { points: 100, label: '100 pts', reward: '2,000 Gold', icon: '\u2694' },
  { points: 250, label: '250 pts', reward: '15 Essences', icon: '\u2728' },
  { points: 500, label: '500 pts', reward: '5 Awaken Stones', icon: '\u26A1' },
];

const ROLE_COLORS = {
  Attacker: '#F44336',
  Tank: '#2196F3',
  Support: '#4CAF50',
  Bruiser: '#FF9800',
  Debuffer: '#9C27B0',
};

// Map faction names (as stored on units) to faction keys
const FACTION_NAME_TO_KEY = {};
FACTION_KEYS.forEach(k => {
  FACTION_NAME_TO_KEY[factions[k].name] = k;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaultState() {
  return {
    chosenFaction: null,
    factionPoints: {
      thePantheon: 0,
      theAllfathersHall: 0,
      theEternalSands: 0,
      theMistRealm: 0,
      theRisingSun: 0,
    },
    playerPoints: 0,
    lastReset: new Date().toISOString(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    // Weekly reset check
    const last = new Date(parsed.lastReset).getTime();
    if (Date.now() - last > WEEK_MS) {
      return getDefaultState();
    }
    return parsed;
  } catch {
    return getDefaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getHeroesByFaction(factionName) {
  return Object.values(heroRoster).filter(u => u.faction === factionName);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRivalTeams(chosenFactionKey) {
  const rivalKeys = FACTION_KEYS.filter(k => k !== chosenFactionKey);
  const picked = shuffleArray(rivalKeys).slice(0, 3);
  return picked.map(key => {
    const f = factions[key];
    const heroes = getHeroesByFaction(f.name);
    const team = shuffleArray(heroes).slice(0, 4);
    // Pad with random heroes from same faction if not enough
    while (team.length < 4 && heroes.length > team.length) {
      const remaining = heroes.filter(h => !team.some(t => t.id === h.id));
      if (remaining.length === 0) break;
      team.push(remaining[0]);
    }
    return { factionKey: key, faction: f, team };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FactionWarsPage() {
  const [state, setState] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | select_faction | select_team | battle | results
  const [rivalTeams, setRivalTeams] = useState([]);
  const [selectedRival, setSelectedRival] = useState(null);
  const [playerTeam, setPlayerTeam] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [wildcardHero, setWildcardHero] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  // Load state on mount
  useEffect(() => {
    const s = loadState();
    setState(s);
    setPhase(s.chosenFaction ? 'select_team' : 'select_faction');
  }, []);

  // Faction heroes
  const factionHeroes = useMemo(() => {
    if (!state?.chosenFaction) return [];
    return getHeroesByFaction(factions[state.chosenFaction].name);
  }, [state?.chosenFaction]);

  // All heroes not in chosen faction (for filling remaining slots)
  const otherHeroes = useMemo(() => {
    if (!state?.chosenFaction) return [];
    const fName = factions[state.chosenFaction].name;
    return Object.values(heroRoster).filter(u => u.faction !== fName);
  }, [state?.chosenFaction]);

  // Generate rivals when entering team select
  useEffect(() => {
    if (phase === 'select_team' && state?.chosenFaction && rivalTeams.length === 0) {
      setRivalTeams(generateRivalTeams(state.chosenFaction));
    }
  }, [phase, state?.chosenFaction, rivalTeams.length]);

  // --- Handlers ---

  const handleFactionSelect = useCallback((factionKey) => {
    const newState = { ...state, chosenFaction: factionKey };
    setState(newState);
    saveState(newState);
    setPhase('select_team');
    setRivalTeams(generateRivalTeams(factionKey));
  }, [state]);

  // Total selected count across faction + other heroes
  const totalSelected = selectedHeroes.length + (wildcardHero ? 1 : 0);
  const factionCount = selectedHeroes.length;

  const handleHeroToggle = useCallback((hero) => {
    setSelectedHeroes(prev => {
      const exists = prev.some(h => h.id === hero.id);
      if (exists) return prev.filter(h => h.id !== hero.id);
      // Allow up to 4 faction heroes, but total team (faction + wildcard) capped at 4
      const currentTotal = prev.length + (wildcardHero ? 1 : 0);
      if (currentTotal >= 4) return prev;
      return [...prev, hero];
    });
  }, [wildcardHero]);

  const handleWildcardSelect = useCallback((hero) => {
    setWildcardHero(prev => {
      if (prev?.id === hero.id) return null; // deselect
      // Check if adding would exceed 4 total
      const totalAfterAdd = selectedHeroes.length + 1;
      if (totalAfterAdd > 4) return prev; // can't exceed 4 total
      return hero;
    });
  }, [selectedHeroes.length]);

  const handleStartBattle = useCallback((rival) => {
    const team = [...selectedHeroes];
    if (wildcardHero) team.push(wildcardHero);
    if (team.length !== 4) return;
    // Validate at least 2 faction heroes
    const fName = factions[state.chosenFaction].name;
    const factionHeroCount = team.filter(h => h.faction === fName).length;
    if (factionHeroCount < 2) return;
    setPlayerTeam(team);
    setSelectedRival(rival);
    setPhase('battle');
  }, [selectedHeroes, wildcardHero, state?.chosenFaction]);

  const handleBattleExit = useCallback((playerWon) => {
    if (!state) return;
    const pointsEarned = playerWon ? 50 : 10;
    const newState = {
      ...state,
      playerPoints: state.playerPoints + pointsEarned,
      factionPoints: {
        ...state.factionPoints,
        [state.chosenFaction]: state.factionPoints[state.chosenFaction] + pointsEarned,
      },
    };
    setState(newState);
    saveState(newState);
    setBattleResult(playerWon ? 'victory' : 'defeat');
    setPhase('results');
  }, [state]);

  const handleBackToTeamSelect = useCallback(() => {
    setPhase('select_team');
    setBattleResult(null);
    setSelectedRival(null);
    setRivalTeams(prev => {
      if (state?.chosenFaction) return generateRivalTeams(state.chosenFaction);
      return prev;
    });
  }, [state?.chosenFaction]);

  const handleResetFaction = useCallback(() => {
    const newState = { ...state, chosenFaction: null };
    setState(newState);
    saveState(newState);
    setPhase('select_faction');
    setRivalTeams([]);
    setSelectedHeroes([]);
    setWildcardHero(null);
  }, [state]);

  // --- Loading ---
  if (phase === 'loading' || !state) {
    return (
      <div style={styles.page}>
        <div style={{ textAlign: 'center', paddingTop: 100, color: '#888' }}>Loading...</div>
      </div>
    );
  }

  // --- Battle Phase ---
  if (phase === 'battle') {
    return (
      <BattleUI
        playerTeam={playerTeam}
        enemyTeam={selectedRival?.team}
        onExit={handleBattleExit}
        stageInfo={{ name: `Faction Wars vs ${selectedRival?.faction.name}` }}
      />
    );
  }

  // --- Sorted leaderboard ---
  const leaderboard = FACTION_KEYS
    .map(k => ({ key: k, ...factions[k], points: state.factionPoints[k] }))
    .sort((a, b) => b.points - a.points);

  const chosenFaction = state.chosenFaction ? factions[state.chosenFaction] : null;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>FACTION WARS</h1>
        <div style={styles.subtitle}>Champion your faction. Battle for supremacy.</div>
        <div style={styles.weekInfo}>
          Weekly event resets {new Date(new Date(state.lastReset).getTime() + WEEK_MS).toLocaleDateString()}
        </div>
      </div>

      {/* Results Phase */}
      {phase === 'results' && (
        <div style={styles.resultsContainer}>
          <div style={{
            ...styles.resultBanner,
            borderColor: battleResult === 'victory' ? '#FFD700' : '#F44336',
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: battleResult === 'victory' ? '#FFD700' : '#F44336',
              marginBottom: 8,
            }}>
              {battleResult === 'victory' ? 'VICTORY' : 'DEFEAT'}
            </div>
            <div style={{ color: '#ccc', fontSize: 14, marginBottom: 4 }}>
              Points earned: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                {battleResult === 'victory' ? '+50' : '+10'}
              </span>
            </div>
            <div style={{ color: '#888', fontSize: 12 }}>
              Your total: {state.playerPoints} pts | {chosenFaction?.name}: {state.factionPoints[state.chosenFaction]} pts
            </div>
            <button onClick={handleBackToTeamSelect} style={styles.goldButton}>
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Faction Selection Phase */}
      {phase === 'select_faction' && (
        <div>
          <h2 style={styles.sectionTitle}>Choose Your Faction</h2>
          <div style={styles.factionGrid}>
            {FACTION_KEYS.map(key => {
              const f = factions[key];
              const heroCount = getHeroesByFaction(f.name).length;
              return (
                <button
                  key={key}
                  onClick={() => handleFactionSelect(key)}
                  style={{
                    ...styles.factionCard,
                    background: `linear-gradient(135deg, ${f.color}15 0%, ${f.color}08 50%, #0d0d1a 100%)`,
                    borderColor: `${f.color}66`,
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 'bold', color: f.color, marginBottom: 4 }}>
                    {f.name}
                  </div>
                  <div style={{ color: '#aaa', fontSize: 11, marginBottom: 8, letterSpacing: 1 }}>
                    {f.title} &middot; {f.mythology}
                  </div>
                  <div style={{ color: '#999', fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
                    {f.description}
                  </div>
                  <div style={{ color: '#666', fontSize: 11 }}>
                    {heroCount} heroes &middot; {f.playstyle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Selection Phase */}
      {phase === 'select_team' && chosenFaction && (
        <div>
          {/* Chosen faction header */}
          <div style={{
            textAlign: 'center',
            marginBottom: 24,
            padding: '16px 20px',
            background: `linear-gradient(135deg, ${chosenFaction.color}18 0%, transparent 100%)`,
            border: `1px solid ${chosenFaction.color}44`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: chosenFaction.color }}>
              Championing: {chosenFaction.name}
            </div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
              Your points: <span style={{ color: '#FFD700' }}>{state.playerPoints}</span> |
              Faction points: <span style={{ color: chosenFaction.color }}>{state.factionPoints[state.chosenFaction]}</span>
            </div>
            <button onClick={handleResetFaction} style={styles.smallButton}>
              Switch Faction
            </button>
          </div>

          {/* Select heroes */}
          <h2 style={styles.sectionTitle}>Select 4 heroes (at least 2 from your faction)</h2>

          {/* Faction heroes */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: chosenFaction.color, fontSize: 13, marginBottom: 8, letterSpacing: 1 }}>
              {chosenFaction.name} HEROES ({selectedHeroes.length} selected)
            </h3>
            <div style={styles.heroGrid}>
              {factionHeroes.map(hero => {
                const selected = selectedHeroes.some(h => h.id === hero.id);
                return (
                  <button
                    key={hero.id}
                    onClick={() => handleHeroToggle(hero)}
                    style={{
                      ...styles.heroCard,
                      borderColor: selected ? chosenFaction.color : '#333',
                      backgroundColor: selected ? `${chosenFaction.color}18` : '#111',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: selected ? chosenFaction.color : '#ddd' }}>
                      {hero.name}
                    </div>
                    <div style={{ fontSize: 10, color: ROLE_COLORS[hero.role] || '#888', marginTop: 2 }}>
                      {hero.role}
                    </div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                      Lv{hero.level} &middot; {hero.stars} stars
                    </div>
                    {selected && (
                      <div style={{ position: 'absolute', top: 4, right: 6, color: chosenFaction.color, fontSize: 12 }}>
                        &#10003;
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wildcard */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#FFD700', fontSize: 13, marginBottom: 8, letterSpacing: 1 }}>
              OTHER FACTIONS ({wildcardHero ? '1' : '0'} selected)
            </h3>
            <div style={styles.heroGrid}>
              {otherHeroes.map(hero => {
                const selected = wildcardHero?.id === hero.id;
                const heroFactionKey = FACTION_NAME_TO_KEY[hero.faction];
                const heroFaction = heroFactionKey ? factions[heroFactionKey] : null;
                return (
                  <button
                    key={hero.id}
                    onClick={() => handleWildcardSelect(hero)}
                    style={{
                      ...styles.heroCard,
                      borderColor: selected ? '#FFD700' : '#333',
                      backgroundColor: selected ? '#FFD70018' : '#111',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: selected ? '#FFD700' : '#ddd' }}>
                      {hero.name}
                    </div>
                    <div style={{ fontSize: 10, color: ROLE_COLORS[hero.role] || '#888', marginTop: 2 }}>
                      {hero.role}
                    </div>
                    <div style={{ fontSize: 10, color: heroFaction?.color || '#666', marginTop: 2 }}>
                      {hero.faction}
                    </div>
                    {selected && (
                      <div style={{ position: 'absolute', top: 4, right: 6, color: '#FFD700', fontSize: 12 }}>
                        &#10003;
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rival teams */}
          <h2 style={styles.sectionTitle}>Choose Your Opponent</h2>
          <div style={styles.rivalGrid}>
            {rivalTeams.map((rival, i) => (
              <div key={rival.factionKey} style={{
                ...styles.rivalCard,
                borderColor: `${rival.faction.color}66`,
                background: `linear-gradient(135deg, ${rival.faction.color}10 0%, #0d0d1a 100%)`,
              }}>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: rival.faction.color, marginBottom: 4 }}>
                  {rival.faction.name}
                </div>
                <div style={{ color: '#888', fontSize: 11, marginBottom: 10 }}>
                  {rival.faction.mythology} &middot; {rival.faction.playstyle}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {rival.team.map(hero => (
                    <span key={hero.id} style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 4,
                      backgroundColor: '#1a1a2e',
                      color: rival.faction.color,
                      border: `1px solid ${rival.faction.color}44`,
                    }}>
                      {hero.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleStartBattle(rival)}
                  disabled={totalSelected !== 4 || factionCount < 2}
                  style={{
                    ...styles.battleButton,
                    opacity: (totalSelected !== 4 || factionCount < 2) ? 0.4 : 1,
                    cursor: (totalSelected !== 4 || factionCount < 2) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {totalSelected !== 4
                    ? `BATTLE (${totalSelected}/4 selected)`
                    : factionCount < 2
                      ? `BATTLE (need ${2 - factionCount} more faction hero${2 - factionCount > 1 ? 'es' : ''})`
                      : 'BATTLE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Faction Leaderboard */}
      <div style={styles.leaderboardSection}>
        <h2 style={styles.sectionTitle}>Faction Leaderboard</h2>
        <div style={styles.leaderboard}>
          {leaderboard.map((f, i) => (
            <div key={f.key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: f.key === state.chosenFaction ? `${f.color}12` : '#0d0d1a',
              borderLeft: `3px solid ${f.color}`,
              borderRadius: 4,
              marginBottom: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#666', fontSize: 14, fontWeight: 'bold', width: 20 }}>
                  #{i + 1}
                </span>
                <span style={{ color: f.color, fontWeight: 'bold', fontSize: 14 }}>
                  {f.name}
                </span>
                {f.key === state.chosenFaction && (
                  <span style={{ fontSize: 10, color: '#FFD700', border: '1px solid #FFD70044', padding: '1px 6px', borderRadius: 3 }}>
                    YOU
                  </span>
                )}
              </div>
              <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 14 }}>
                {f.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Tiers */}
      <div style={styles.rewardsSection}>
        <h2 style={styles.sectionTitle}>Reward Tiers</h2>
        <div style={styles.rewardsGrid}>
          {REWARD_TIERS.map(tier => {
            const unlocked = state.playerPoints >= tier.points;
            const claimed = (state.claimedTiers || []).includes(tier.points);
            return (
              <div key={tier.points} style={{
                ...styles.rewardCard,
                borderColor: unlocked ? '#FFD700' : '#333',
                backgroundColor: unlocked ? '#FFD70010' : '#0d0d1a',
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{tier.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: unlocked ? '#FFD700' : '#666' }}>
                  {tier.label}
                </div>
                <div style={{ fontSize: 12, color: unlocked ? '#ccc' : '#555', marginTop: 4 }}>
                  {tier.reward}
                </div>
                {unlocked && claimed && (
                  <div style={{ fontSize: 10, color: '#4CAF50', marginTop: 6, fontWeight: 'bold' }}>CLAIMED</div>
                )}
                {unlocked && !claimed && (
                  <button onClick={() => {
                    const rewardMap = { 100: { gold: 2000 }, 250: { essences: 15 }, 500: { awakenStones: 5 } };
                    const reward = rewardMap[tier.points];
                    if (reward) {
                      const save = loadSave();
                      const res = { ...save.resources };
                      for (const [k, v] of Object.entries(reward)) res[k] = (res[k] || 0) + v;
                      updateSave({ resources: res });
                    }
                    const newState = { ...state, claimedTiers: [...(state.claimedTiers || []), tier.points] };
                    setState(newState);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
                  }} style={{
                    marginTop: 6, padding: '4px 12px', fontSize: 10, fontWeight: 'bold',
                    backgroundColor: '#FFD700', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer',
                  }}>
                    Claim
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0a1a',
    color: '#eee',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: '20px 20px 60px',
    maxWidth: 900,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    margin: 0,
    color: '#FFD700',
    letterSpacing: 3,
    textShadow: '0 0 20px #FFD70044',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 6,
    letterSpacing: 2,
  },
  weekInfo: {
    color: '#666',
    fontSize: 11,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 16,
    letterSpacing: 1,
    marginBottom: 14,
    textAlign: 'center',
  },
  factionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 14,
    marginBottom: 30,
  },
  factionCard: {
    padding: '20px 18px',
    border: '1px solid #333',
    borderRadius: 10,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
  },
  heroGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroCard: {
    position: 'relative',
    padding: '10px 14px',
    border: '1px solid #333',
    borderRadius: 6,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    minWidth: 120,
  },
  rivalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 14,
    marginBottom: 30,
  },
  rivalCard: {
    padding: '16px 14px',
    border: '1px solid #333',
    borderRadius: 8,
  },
  battleButton: {
    width: '100%',
    padding: '8px 0',
    fontSize: 13,
    fontWeight: 'bold',
    backgroundColor: '#FFD700',
    color: '#000',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    letterSpacing: 1,
    fontFamily: 'inherit',
  },
  goldButton: {
    marginTop: 16,
    padding: '10px 28px',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#FFD700',
    color: '#000',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    letterSpacing: 1,
    fontFamily: 'inherit',
  },
  smallButton: {
    marginTop: 8,
    padding: '4px 14px',
    fontSize: 11,
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #444',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  resultsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 30,
  },
  resultBanner: {
    textAlign: 'center',
    padding: '30px 40px',
    border: '2px solid #FFD700',
    borderRadius: 12,
    backgroundColor: '#111',
    minWidth: 300,
  },
  leaderboardSection: {
    marginTop: 30,
    marginBottom: 30,
  },
  leaderboard: {
    maxWidth: 500,
    margin: '0 auto',
  },
  rewardsSection: {
    marginBottom: 40,
  },
  rewardsGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  rewardCard: {
    padding: '18px 22px',
    border: '1px solid #333',
    borderRadius: 8,
    textAlign: 'center',
    minWidth: 140,
  },
};
