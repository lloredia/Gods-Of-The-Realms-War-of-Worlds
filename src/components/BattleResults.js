'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import HeroPortrait from './HeroPortrait';
import { loadSave, updateSave } from '../utils/saveSystem';
import { checkBattleAchievements } from '../utils/achievementTracker';

// Inject keyframes once
let resultsStylesInjected = false;
function injectResultsStyles() {
  if (resultsStylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `
@keyframes br-goldenGlow {
  0%, 100% { text-shadow: 0 0 20px #FFD700, 0 0 40px #FFA500, 0 0 60px #FF8C00; }
  50% { text-shadow: 0 0 30px #FFD700, 0 0 60px #FFA500, 0 0 90px #FF8C00, 0 0 120px #FFD70044; }
}
@keyframes br-redGlow {
  0%, 100% { text-shadow: 0 0 20px #F44336, 0 0 40px #D32F2F, 0 0 60px #B71C1C; }
  50% { text-shadow: 0 0 30px #F44336, 0 0 60px #D32F2F, 0 0 90px #B71C1C, 0 0 120px #F4433644; }
}
@keyframes br-slideUp {
  from { transform: translateY(60px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes br-fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes br-overlayFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
  `;
  document.head.appendChild(style);
  resultsStylesInjected = true;
}

function computeStats(logs, teamA, teamB) {
  const teamAIds = new Set(teamA.map(u => u.id));
  const teamBIds = new Set(teamB.map(u => u.id));

  let playerDamage = 0;
  let playerHeals = 0;
  let playerCrits = 0;
  let enemyDamage = 0;

  for (const log of logs) {
    if (log.type === 'damage' || log.type === 'multi_hit') {
      const dmg = log.damage || 0;
      if (teamAIds.has(log.attackerId)) {
        playerDamage += dmg;
        if (log.isCrit) playerCrits += 1;
      }
      if (teamBIds.has(log.attackerId)) {
        enemyDamage += dmg;
      }
    }
    if (log.type === 'heal' && teamAIds.has(log.attackerId)) {
      playerHeals += (log.healAmount || log.amount || 0);
    }
  }

  const surviving = teamA.filter(u => u.alive);
  const lost = teamA.filter(u => !u.alive);

  return { playerDamage, playerHeals, playerCrits, enemyDamage, surviving, lost };
}

function computeRewards(turnCount, isVictory) {
  if (!isVictory) return { gold: 0, xp: 0 };
  const baseGold = 200;
  const baseXP = 150;
  // Bonus for quick battles — fewer turns = bigger bonus
  const speedBonus = Math.max(1, 2 - (turnCount / 40));
  return {
    gold: Math.round(baseGold * speedBonus),
    xp: Math.round(baseXP * speedBonus),
  };
}

export default function BattleResults({ winner, teamA, teamB, logs, turnCount, onClose }) {
  const [visible, setVisible] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    injectResultsStyles();
    // Trigger entrance after mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Persist rewards and battle stats to save data exactly once
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const save = loadSave();
    if (winner === 'Team A') {
      const rewards = computeRewards(turnCount, true);
      save.resources.gold = (save.resources.gold || 0) + rewards.gold;
      save.stats.battlesWon = (save.stats.battlesWon || 0) + 1;
    } else {
      save.stats.battlesLost = (save.stats.battlesLost || 0) + 1;
    }
    updateSave(save);
    checkBattleAchievements(winner === 'Team A', save.stats);
  }, []);

  const isVictory = winner === 'Team A';
  const stats = useMemo(() => computeStats(logs || [], teamA || [], teamB || []), [logs, teamA, teamB]);
  const rewards = useMemo(() => computeRewards(turnCount, isVictory), [turnCount, isVictory]);

  const victors = isVictory ? stats.surviving : (teamB || []).filter(u => u.alive);

  const statLines = [
    { label: 'Turns Taken', value: turnCount },
    { label: 'Damage Dealt', value: stats.playerDamage.toLocaleString() },
    { label: 'Healing Done', value: stats.playerHeals.toLocaleString() },
    { label: 'Critical Hits', value: stats.playerCrits },
    { label: 'Heroes Surviving', value: stats.surviving.length },
    { label: 'Heroes Lost', value: stats.lost.length },
    { label: 'Enemy Damage Taken', value: stats.enemyDamage.toLocaleString() },
  ];

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    background: isVictory
      ? 'radial-gradient(ellipse at center, rgba(255,215,0,0.15) 0%, rgba(10,10,26,0.95) 70%)'
      : 'radial-gradient(ellipse at center, rgba(139,0,0,0.2) 0%, rgba(10,10,26,0.97) 70%)',
    animation: 'br-overlayFade 0.4s ease-out forwards',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s ease',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#eee',
    padding: 20,
    overflow: 'auto',
  };

  const titleStyle = {
    fontSize: 64,
    fontWeight: 900,
    letterSpacing: 8,
    margin: 0,
    animation: isVictory ? 'br-goldenGlow 2s ease-in-out infinite' : 'br-redGlow 2s ease-in-out infinite',
    color: isVictory ? '#FFD700' : '#F44336',
    textTransform: 'uppercase',
    userSelect: 'none',
  };

  const panelStyle = {
    animation: visible ? 'br-slideUp 0.6s ease-out forwards' : 'none',
    backgroundColor: isVictory ? 'rgba(255,215,0,0.06)' : 'rgba(244,67,54,0.06)',
    border: `1px solid ${isVictory ? 'rgba(255,215,0,0.25)' : 'rgba(244,67,54,0.2)'}`,
    borderRadius: 12,
    padding: '24px 32px',
    marginTop: 24,
    maxWidth: 500,
    width: '100%',
  };

  const muted = !isVictory;

  return (
    <div style={overlayStyle}>
      {/* Title */}
      <h1 style={titleStyle}>
        {isVictory ? 'VICTORY' : 'DEFEAT'}
      </h1>

      {/* Subtitle */}
      <div style={{
        fontSize: 14,
        color: isVictory ? '#FFA500' : '#D32F2F',
        letterSpacing: 3,
        marginTop: 8,
        textTransform: 'uppercase',
        opacity: 0.8,
      }}>
        {isVictory ? 'The gods smile upon you' : 'The enemy prevails'}
      </div>

      {/* Victors portraits */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginTop: 28,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {victors.map((unit) => (
          <div key={unit.id} style={{ textAlign: 'center' }}>
            <HeroPortrait
              unitId={unit.id}
              element={unit.element}
              faction={unit.faction}
              size={56}
              isActive={isVictory}
            />
            <div style={{
              fontSize: 11,
              color: isVictory ? '#FFD700' : '#F44336',
              marginTop: 6,
              maxWidth: 64,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {unit.name}
            </div>
          </div>
        ))}
      </div>

      {/* Stats panel */}
      <div style={panelStyle}>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: isVictory ? '#FFD700' : '#F44336',
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          Battle Statistics
        </div>

        {statLines.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: i < statLines.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              animation: visible ? `br-fadeIn 0.4s ease-out ${0.3 + i * 0.08}s both` : 'none',
              opacity: muted ? 0.7 : 1,
            }}
          >
            <span style={{ color: '#aaa', fontSize: 13 }}>{stat.label}</span>
            <span style={{
              color: isVictory ? '#FFD700' : '#F44336',
              fontSize: 14,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {stat.value}
            </span>
          </div>
        ))}

        {/* Rewards (victory only) */}
        {isVictory && (
          <div style={{
            marginTop: 20,
            padding: '14px 0 0',
            borderTop: '1px solid rgba(255,215,0,0.15)',
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            animation: visible ? 'br-fadeIn 0.4s ease-out 1s both' : 'none',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#FFD700' }}>
                {rewards.gold}
              </div>
              <div style={{ fontSize: 11, color: '#BFA24B', letterSpacing: 1, textTransform: 'uppercase' }}>
                Gold
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#64B5F6' }}>
                {rewards.xp}
              </div>
              <div style={{ fontSize: 11, color: '#5C99C9', letterSpacing: 1, textTransform: 'uppercase' }}>
                XP
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={onClose}
        style={{
          marginTop: 28,
          padding: '14px 48px',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          backgroundColor: isVictory ? '#FFD700' : '#F44336',
          color: isVictory ? '#000' : '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          animation: visible ? 'br-fadeIn 0.5s ease-out 1.2s both' : 'none',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          boxShadow: isVictory
            ? '0 0 20px rgba(255,215,0,0.3), 0 4px 12px rgba(0,0,0,0.3)'
            : '0 0 20px rgba(244,67,54,0.3), 0 4px 12px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isVictory ? 'Continue' : 'Try Again'}
      </button>
    </div>
  );
}
