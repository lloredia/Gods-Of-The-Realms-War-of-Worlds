'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { heroRoster } from '../../data/units';
import BattleUI from '../../components/BattleUI';
import { loadSave, updateSave } from '../../utils/saveSystem';
import { getTeamWithSave } from '../../utils/heroUtils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENDLESS_BEST_KEY = 'gotr_endless_best';

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

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadBestWave() {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(ENDLESS_BEST_KEY), 10) || 0;
  } catch {
    return 0;
  }
}

function saveBestWave(wave) {
  if (typeof window === 'undefined') return;
  try {
    const current = loadBestWave();
    if (wave > current) {
      localStorage.setItem(ENDLESS_BEST_KEY, String(wave));
    }
  } catch {
    // Storage unavailable
  }
}

function scaleEnemies(templates, wave) {
  const hpMult = 1 + wave * 0.15;
  const atkMult = 1 + wave * 0.10;
  const defMult = 1 + wave * 0.08;

  return templates.map(unit => {
    const scaledMaxHP = Math.round((unit.maxHP || 10000) * hpMult);
    return {
      ...unit,
      maxHP: scaledMaxHP,
      currentHP: scaledMaxHP,
      attack: Math.round((unit.attack || 800) * atkMult),
      defense: Math.round((unit.defense || 500) * defMult),
    };
  });
}

function generateWaveEnemies(wave, playerIds) {
  const allHeroes = Object.values(heroRoster);
  const available = allHeroes.filter(u => !playerIds.has(u.id));
  const pool = available.length >= 4 ? available : allHeroes;
  const picked = shuffleArray(pool).slice(0, 4);
  return scaleEnemies(picked, wave);
}

function calculateGoldReward(wavesCleared) {
  return wavesCleared * 500;
}

function getWaveGlowColor(wave) {
  if (wave >= 20) return '#ff0000';
  if (wave >= 15) return '#ff3300';
  if (wave >= 10) return '#ff6600';
  if (wave >= 5) return '#ff9900';
  return '#FFD700';
}

function getWaveTitle(wave) {
  if (wave >= 25) return 'APOCALYPTIC';
  if (wave >= 20) return 'MYTHICAL';
  if (wave >= 15) return 'LEGENDARY';
  if (wave >= 10) return 'EPIC';
  if (wave >= 5) return 'HARD';
  return 'NORMAL';
}

// ---------------------------------------------------------------------------
// Endless Survival Page
// ---------------------------------------------------------------------------

export default function EndlessPage() {
  const [phase, setPhase] = useState('select'); // 'select' | 'battle' | 'interstitial' | 'gameover'
  const [selectedIds, setSelectedIds] = useState([]);
  const [wave, setWave] = useState(1);
  const [bestWave, setBestWave] = useState(0);
  const [enemyTeam, setEnemyTeam] = useState(null);
  const [goldEarned, setGoldEarned] = useState(0);

  const allHeroes = useMemo(() => Object.values(heroRoster), []);

  // Load best wave on mount (client-side only)
  useEffect(() => {
    setBestWave(loadBestWave());
  }, []);

  // --- Select phase ---

  const toggleHero = useCallback((heroId) => {
    setSelectedIds(prev => {
      if (prev.includes(heroId)) return prev.filter(id => id !== heroId);
      if (prev.length >= 4) return prev;
      return [...prev, heroId];
    });
  }, []);

  const handleStartRun = useCallback(() => {
    if (selectedIds.length !== 4) return;
    const playerIds = new Set(selectedIds);
    const enemies = generateWaveEnemies(1, playerIds);
    setWave(1);
    setEnemyTeam(enemies);
    setGoldEarned(0);
    setPhase('battle');
  }, [selectedIds]);

  // --- Battle exit ---

  const handleBattleExit = useCallback((playerWon) => {
    if (playerWon) {
      // Wave cleared
      setPhase('interstitial');
    } else {
      // Player lost — game over
      const wavesCleared = wave - 1;
      const gold = calculateGoldReward(wavesCleared);
      setGoldEarned(gold);

      // Save best wave
      saveBestWave(wavesCleared);
      setBestWave(prev => Math.max(prev, wavesCleared));

      // Award gold to save
      if (gold > 0) {
        try {
          const save = loadSave();
          updateSave({
            resources: {
              ...save.resources,
              gold: (save.resources.gold || 0) + gold,
            },
          });
        } catch {
          // Save system unavailable
        }
      }

      setPhase('gameover');
    }
  }, [wave]);

  // --- Interstitial: continue or retreat ---

  const handleContinue = useCallback(() => {
    const nextWave = wave + 1;
    const playerIds = new Set(selectedIds);
    const enemies = generateWaveEnemies(nextWave, playerIds);
    setWave(nextWave);
    setEnemyTeam(enemies);
    setPhase('battle');
  }, [wave, selectedIds]);

  const handleRetreat = useCallback(() => {
    const wavesCleared = wave;
    const gold = calculateGoldReward(wavesCleared);
    setGoldEarned(gold);

    // Save best wave
    saveBestWave(wavesCleared);
    setBestWave(prev => Math.max(prev, wavesCleared));

    // Award gold to save
    if (gold > 0) {
      try {
        const save = loadSave();
        updateSave({
          resources: {
            ...save.resources,
            gold: (save.resources.gold || 0) + gold,
          },
        });
      } catch {
        // Save system unavailable
      }
    }

    setPhase('gameover');
  }, [wave]);

  // --- Return to team select ---

  const handleNewRun = useCallback(() => {
    setSelectedIds([]);
    setWave(1);
    setEnemyTeam(null);
    setGoldEarned(0);
    setPhase('select');
  }, []);

  // =========================================================================
  // RENDER — Battle Phase
  // =========================================================================

  if (phase === 'battle') {
    const hpScale = Math.max(0.3, 1 - (wave - 1) * 0.05);
    const playerTeam = getTeamWithSave(selectedIds).map(h => ({
      ...h,
      maxHP: Math.floor(h.maxHP * hpScale),
      currentHP: Math.floor(h.maxHP * hpScale),
    }));
    const glowColor = getWaveGlowColor(wave);

    return (
      <div>
        {/* Wave overlay banner */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          textAlign: 'center',
          padding: '8px 0',
          background: `linear-gradient(180deg, rgba(10,10,26,0.95) 0%, rgba(10,10,26,0) 100%)`,
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: glowColor,
            textShadow: wave >= 10 ? `0 0 12px ${glowColor}, 0 0 24px ${glowColor}` : 'none',
            letterSpacing: 3,
          }}>
            WAVE {wave}
          </span>
          <span style={{ color: '#666', fontSize: 11, marginLeft: 12 }}>
            Best: Wave {bestWave}
          </span>
          <span style={{
            color: '#888',
            fontSize: 10,
            marginLeft: 12,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}>
            {getWaveTitle(wave)}
          </span>
        </div>

        <BattleUI
          playerTeam={playerTeam}
          enemyTeam={enemyTeam}
          onExit={handleBattleExit}
          stageInfo={{ name: `Endless Survival — Wave ${wave}` }}
        />
      </div>
    );
  }

  // =========================================================================
  // RENDER — Interstitial (Wave Cleared)
  // =========================================================================

  if (phase === 'interstitial') {
    const glowColor = getWaveGlowColor(wave);
    const goldSoFar = calculateGoldReward(wave);

    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a1a',
        color: '#eee',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: 20,
      }}>
        {/* Victory glow */}
        <div style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor}33 0%, transparent 70%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <div style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: glowColor,
            textShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
          }}>
            {wave}
          </div>
        </div>

        <h1 style={{
          fontSize: 36,
          color: '#FFD700',
          margin: 0,
          letterSpacing: 4,
          textShadow: '0 0 10px rgba(255,215,0,0.5)',
        }}>
          WAVE {wave} CLEARED!
        </h1>

        <div style={{ color: '#888', fontSize: 14, marginTop: 8, letterSpacing: 2 }}>
          {getWaveTitle(wave + 1)} DIFFICULTY AHEAD
        </div>

        <div style={{
          marginTop: 24,
          padding: '12px 24px',
          backgroundColor: '#111',
          borderRadius: 8,
          border: '1px solid #333',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>GOLD EARNED SO FAR</div>
          <div style={{ fontSize: 24, color: '#FFD700', fontWeight: 'bold' }}>
            {goldSoFar.toLocaleString()} Gold
          </div>
        </div>

        <div style={{
          marginTop: 16,
          padding: '8px 20px',
          backgroundColor: '#1a1a2e',
          borderRadius: 6,
          border: '1px solid #333',
          fontSize: 12,
          color: '#aaa',
        }}>
          Next wave enemies: HP x{(1 + (wave + 1) * 0.15).toFixed(2)} | ATK x{(1 + (wave + 1) * 0.10).toFixed(2)} | DEF x{(1 + (wave + 1) * 0.08).toFixed(2)}
        </div>

        <div style={{
          marginTop: 10,
          padding: '6px 16px',
          backgroundColor: '#2a1a1a',
          borderRadius: 6,
          border: '1px solid #553333',
          fontSize: 12,
          color: '#F44336',
          textAlign: 'center',
        }}>
          Your team enters weakened (HP reduced by {Math.round(wave * 5)}%)
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
          <button
            onClick={handleContinue}
            style={{
              padding: '14px 40px',
              fontSize: 16,
              fontWeight: 'bold',
              backgroundColor: '#FFD700',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              letterSpacing: 1,
            }}
          >
            CONTINUE TO WAVE {wave + 1}
          </button>

          <button
            onClick={handleRetreat}
            style={{
              padding: '14px 32px',
              fontSize: 14,
              fontWeight: 'bold',
              backgroundColor: '#333',
              color: '#ccc',
              border: '1px solid #555',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            RETREAT (Save Score)
          </button>
        </div>

        <div style={{ color: '#555', fontSize: 11, marginTop: 16 }}>
          Retreating saves your progress and awards gold. Dying ends the run.
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER — Game Over
  // =========================================================================

  if (phase === 'gameover') {
    const wavesCleared = goldEarned / 500;
    const isNewBest = wavesCleared >= bestWave && wavesCleared > 0;
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a1a',
        color: '#eee',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: 20,
      }}>
        <h1 style={{
          fontSize: 42,
          color: '#F44336',
          margin: 0,
          letterSpacing: 4,
          textShadow: '0 0 20px rgba(244,67,54,0.5)',
        }}>
          RUN COMPLETE
        </h1>

        {isNewBest && (
          <div style={{
            marginTop: 12,
            padding: '6px 20px',
            backgroundColor: '#1a3a1a',
            border: '2px solid #FFD700',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '0 0 8px rgba(255,215,0,0.5)',
            letterSpacing: 2,
          }}>
            NEW PERSONAL BEST!
          </div>
        )}

        <div style={{
          marginTop: 24,
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {/* Waves Cleared */}
          <div style={{
            padding: '16px 32px',
            backgroundColor: '#111',
            borderRadius: 10,
            border: '1px solid #333',
            textAlign: 'center',
            minWidth: 140,
          }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6, letterSpacing: 2 }}>WAVES CLEARED</div>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: '#FFD700' }}>
              {wavesCleared}
            </div>
          </div>

          {/* Best Wave */}
          <div style={{
            padding: '16px 32px',
            backgroundColor: '#111',
            borderRadius: 10,
            border: '1px solid #333',
            textAlign: 'center',
            minWidth: 140,
          }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6, letterSpacing: 2 }}>PERSONAL BEST</div>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: '#00BCD4' }}>
              {bestWave}
            </div>
          </div>

          {/* Gold Earned */}
          <div style={{
            padding: '16px 32px',
            backgroundColor: '#111',
            borderRadius: 10,
            border: '1px solid #333',
            textAlign: 'center',
            minWidth: 140,
          }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6, letterSpacing: 2 }}>GOLD EARNED</div>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: '#FFD700' }}>
              {goldEarned.toLocaleString()}
            </div>
          </div>
        </div>

        <button
          onClick={handleNewRun}
          style={{
            marginTop: 40,
            padding: '14px 48px',
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: '#FFD700',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          NEW RUN
        </button>
      </div>
    );
  }

  // =========================================================================
  // RENDER — Team Select Phase (default)
  // =========================================================================

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a1a',
      color: '#eee',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: 20,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{
          fontSize: 32,
          color: '#F44336',
          margin: 0,
          letterSpacing: 4,
          textShadow: '0 0 15px rgba(244,67,54,0.4)',
        }}>
          ENDLESS SURVIVAL
        </h1>
        <div style={{
          color: '#999',
          fontSize: 14,
          marginTop: 4,
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}>
          Gods of the Realms — War of Worlds
        </div>
      </div>

      {/* Best Wave / Rules */}
      <div style={{
        maxWidth: 600,
        margin: '0 auto 24px',
        padding: 20,
        backgroundColor: '#111',
        borderRadius: 12,
        border: '2px solid #F44336',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4, letterSpacing: 2 }}>
          HIGHEST WAVE REACHED
        </div>
        <div style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: bestWave > 0 ? '#FFD700' : '#444',
          textShadow: bestWave >= 10 ? '0 0 15px rgba(255,215,0,0.5)' : 'none',
        }}>
          {bestWave > 0 ? bestWave : '---'}
        </div>

        <div style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: '#0a0a1a',
          borderRadius: 8,
          fontSize: 12,
          color: '#888',
          lineHeight: 1.8,
          textAlign: 'left',
        }}>
          <div style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>HOW IT WORKS</div>
          <div>Select 4 heroes and face endless waves of enemies.</div>
          <div>Each wave, enemies grow stronger (HP, ATK, DEF scale up).</div>
          <div>Win a wave to continue or retreat with your gold.</div>
          <div>Losing a battle ends the run immediately.</div>
          <div style={{ color: '#FFD700' }}>Reward: 500 gold per wave cleared.</div>
        </div>
      </div>

      {/* Team Selection Header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, color: '#ddd', margin: 0, letterSpacing: 2 }}>
          SELECT YOUR TEAM ({selectedIds.length}/4)
        </h2>
      </div>

      {/* Hero Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 10,
        maxWidth: 900,
        margin: '0 auto 24px',
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
                border: isSelected ? '2px solid #FFD700' : '2px solid #333',
                backgroundColor: isSelected ? '#1a1a3e' : '#1a1a2e',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderLeft: `3px solid ${roleColor}`,
                boxShadow: isSelected ? '0 0 10px rgba(255,215,0,0.3)' : 'none',
                opacity: !isSelected && selectedIds.length >= 4 ? 0.4 : 1,
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <span style={{ fontWeight: 'bold', fontSize: 13, color: '#eee' }}>
                  {hero.name}
                </span>
                <span style={{
                  fontSize: 10,
                  color: elementColor,
                  border: `1px solid ${elementColor}`,
                  borderRadius: 3,
                  padding: '1px 4px',
                }}>
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
                <div style={{
                  fontSize: 10,
                  color: '#FFD700',
                  marginTop: 4,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                  SELECTED
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Start Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleStartRun}
          disabled={selectedIds.length !== 4}
          style={{
            padding: '14px 48px',
            fontSize: 18,
            fontWeight: 'bold',
            backgroundColor: selectedIds.length === 4 ? '#F44336' : '#333',
            color: selectedIds.length === 4 ? '#fff' : '#666',
            border: 'none',
            borderRadius: 8,
            cursor: selectedIds.length === 4 ? 'pointer' : 'not-allowed',
            letterSpacing: 2,
            textShadow: selectedIds.length === 4 ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
            boxShadow: selectedIds.length === 4 ? '0 0 20px rgba(244,67,54,0.4)' : 'none',
          }}
        >
          BEGIN ENDLESS RUN
        </button>
      </div>
    </div>
  );
}
