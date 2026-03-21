'use client';

import { useState, useEffect, useCallback } from 'react';
import achievements from '../data/achievements';

const STORAGE_KEY = 'gotr_achievements';
const CATEGORIES = ['All', 'Battle', 'Collection', 'Campaign', 'Summon', 'Arena'];

const REWARD_LABELS = {
  gold: 'Gold',
  essences: 'Essences',
  awakenStones: 'Awaken Stones',
};

function loadAchievementData() {
  if (typeof window === 'undefined') return { completed: [], claimedRewards: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], claimedRewards: [] };
    const parsed = JSON.parse(raw);
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      claimedRewards: Array.isArray(parsed.claimedRewards) ? parsed.claimedRewards : [],
    };
  } catch {
    return { completed: [], claimedRewards: [] };
  }
}

function saveAchievementData(data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatReward(reward) {
  return Object.entries(reward)
    .map(([key, val]) => `${val} ${REWARD_LABELS[key] || key}`)
    .join(', ');
}

export default function AchievementPanel({ onClose }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [data, setData] = useState({ completed: [], claimedRewards: [] });

  useEffect(() => {
    setData(loadAchievementData());
  }, []);

  const completedCount = data.completed.length;

  const filtered = activeCategory === 'All'
    ? achievements
    : achievements.filter(a => a.category === activeCategory);

  const handleClaim = useCallback((id) => {
    setData(prev => {
      const next = {
        completed: [...prev.completed],
        claimedRewards: [...prev.claimedRewards, id],
      };
      saveAchievementData(next);
      return next;
    });
  }, []);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.trophyIcon}>&#127942;</span>
            <h2 style={styles.title}>Achievements</h2>
          </div>
          <span style={styles.counter}>{completedCount}/{achievements.length} Achievements Unlocked</span>
          <button style={styles.closeBtn} onClick={onClose}>&#10005;</button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${(completedCount / achievements.length) * 100}%` }} />
        </div>

        {/* Category tabs */}
        <div style={styles.tabs}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={cat === activeCategory ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Achievement grid */}
        <div style={styles.grid}>
          {filtered.map(ach => {
            const isCompleted = data.completed.includes(ach.id);
            const isClaimed = data.claimedRewards.includes(ach.id);
            const canClaim = isCompleted && !isClaimed;

            return (
              <div
                key={ach.id}
                style={{
                  ...styles.card,
                  ...(isCompleted ? styles.cardCompleted : styles.cardLocked),
                }}
              >
                {/* Status indicator */}
                <div style={styles.cardTop}>
                  <span style={styles.categoryBadge}>{ach.category}</span>
                  {isCompleted && <span style={styles.checkmark}>&#10003;</span>}
                </div>

                <h3 style={{
                  ...styles.cardName,
                  color: isCompleted ? '#ffd700' : '#666',
                }}>{ach.name}</h3>

                <p style={{
                  ...styles.cardDesc,
                  color: isCompleted ? '#c0c0d0' : '#555',
                }}>{ach.desc}</p>

                {/* Reward */}
                <div style={styles.rewardRow}>
                  <span style={styles.rewardLabel}>Reward:</span>
                  <span style={{
                    ...styles.rewardValue,
                    color: isCompleted ? '#ffd700' : '#555',
                  }}>{formatReward(ach.reward)}</span>
                </div>

                {/* Claim button */}
                {canClaim && (
                  <button
                    style={styles.claimBtn}
                    onClick={() => handleClaim(ach.id)}
                  >
                    Claim Reward
                  </button>
                )}
                {isClaimed && (
                  <span style={styles.claimedTag}>Claimed</span>
                )}
                {!isCompleted && (
                  <span style={styles.lockedTag}>Locked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#12122a',
    borderRadius: 12,
    border: '1px solid #2a2a4a',
    width: '95vw',
    maxWidth: 960,
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  trophyIcon: {
    fontSize: 28,
  },
  title: {
    margin: 0,
    fontSize: 22,
    color: '#ffd700',
    fontWeight: 700,
    letterSpacing: 1,
  },
  counter: {
    color: '#a0a0c0',
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 20,
    cursor: 'pointer',
    padding: '4px 8px',
    marginLeft: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1a1a3a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  tabs: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  tab: {
    padding: '6px 16px',
    borderRadius: 6,
    border: '1px solid #2a2a4a',
    backgroundColor: '#1a1a3a',
    color: '#8888aa',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.15s ease',
  },
  tabActive: {
    backgroundColor: '#2a2a5a',
    color: '#ffd700',
    borderColor: '#ffd700',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 14,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    transition: 'all 0.2s ease',
  },
  cardCompleted: {
    backgroundColor: '#1a1a3a',
    border: '2px solid #ffd700',
  },
  cardLocked: {
    backgroundColor: '#14142a',
    border: '1px solid #222244',
    opacity: 0.6,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#6666aa',
    backgroundColor: '#1a1a40',
    padding: '2px 8px',
    borderRadius: 4,
  },
  checkmark: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 700,
  },
  cardName: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
  },
  cardDesc: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.4,
  },
  rewardRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  rewardLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: 600,
  },
  rewardValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  claimBtn: {
    marginTop: 4,
    padding: '8px 0',
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#ffd700',
    color: '#12122a',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    letterSpacing: 0.5,
  },
  claimedTag: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    color: '#4a4',
    fontWeight: 600,
  },
  lockedTag: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
    fontWeight: 600,
  },
};
