'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DailyRewards, { hasClaimedToday } from '@/components/DailyRewards';
import AchievementPanel from '@/components/AchievementPanel';
import Tutorial from '@/components/Tutorial';
import { loadSave, updateSave } from '@/utils/saveSystem';
import { getUnlockedCount } from '@/utils/achievementTracker';

const MENU_ITEMS = [
  {
    href: '/battle',
    title: 'BATTLE',
    desc: 'Assemble your team and clash against rival gods in real-time combat.',
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3d0c0c 100%)',
    border: '#8b0000',
    icon: '\u2694\uFE0F',
  },
  {
    href: '/collection',
    title: 'COLLECTION',
    desc: 'Browse your pantheon of heroes. Level up, awaken, and equip relics.',
    gradient: 'linear-gradient(135deg, #0a1a0a 0%, #0c3d1a 100%)',
    border: '#228B22',
    icon: '\uD83D\uDCDC',
  },
  {
    href: '/summon',
    title: 'SUMMON',
    desc: 'Call upon the divine gates to recruit legendary gods and warriors.',
    gradient: 'linear-gradient(135deg, #1a0a1a 0%, #3d0c3d 100%)',
    border: '#8b008b',
    icon: '\u2728',
  },
  {
    href: '/campaign',
    title: 'CAMPAIGN',
    desc: 'Conquer mythic stages across realms and earn powerful rewards.',
    gradient: 'linear-gradient(135deg, #0a0a1a 0%, #0c1a3d 100%)',
    border: '#1e3a8a',
    icon: '\uD83D\uDDFA\uFE0F',
  },
  {
    href: '/arena',
    title: 'ARENA',
    desc: 'Challenge rival summoners in ranked PvP combat.',
    gradient: 'linear-gradient(135deg, #1a0a1a 0%, #2e0c3d 100%)',
    border: '#9C27B0',
    icon: '🏆',
  },
  {
    href: '/endless',
    title: 'ENDLESS',
    desc: 'Survive endless waves of enemies. How far can you go?',
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3d1a0c 100%)',
    border: '#FF5722',
    icon: '♾️',
  },
  {
    href: '/faction-wars',
    title: 'FACTION WARS',
    desc: 'Champion your faction in the weekly war for supremacy.',
    gradient: 'linear-gradient(135deg, #0a1a1a 0%, #0c2e3d 100%)',
    border: '#00BCD4',
    icon: '⚔️',
  },
];

export default function Home() {
  const [showDaily, setShowDaily] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achCount, setAchCount] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('gotr_tutorial_done')) {
      setShowTutorial(true);
    } else if (!hasClaimedToday()) {
      setShowDaily(true);
    }
    setAchCount(getUnlockedCount());
  }, []);

  function handleClaimReward(reward) {
    const save = loadSave();
    const resources = { ...save.resources };
    for (const [key, amount] of Object.entries(reward)) {
      resources[key] = (resources[key] || 0) + amount;
    }
    updateSave({ resources });
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#080810',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px 40px',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h1 style={{
          fontSize: 42,
          fontWeight: 900,
          background: 'linear-gradient(180deg, #FFD700, #B8860B)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: 3,
          margin: 0,
          textTransform: 'uppercase',
          textShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
        }}>
          Gods Of The Realms
        </h1>
        <p style={{
          fontSize: 14,
          color: '#aaa',
          letterSpacing: 6,
          margin: '6px 0 0',
          fontWeight: 300,
          textTransform: 'uppercase',
        }}>
          War of Worlds
        </p>
      </div>

      {/* Decorative divider */}
      <div style={{
        width: 120,
        height: 1,
        background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
        margin: '20px 0 40px',
      }} />

      {/* Menu Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
        maxWidth: 960,
        width: '100%',
      }}>
        {MENU_ITEMS.map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: item.gradient,
              border: `1px solid ${item.border}44`,
              borderRadius: 10,
              padding: '24px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: 110,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.border = `1px solid ${item.border}`;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${item.border}33`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = `1px solid ${item.border}44`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#e0e0e0',
                  letterSpacing: 2,
                }}>
                  {item.title}
                </span>
              </div>
              <p style={{
                fontSize: 12,
                color: '#888',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Daily Rewards Button */}
      <button
        onClick={() => setShowDaily(true)}
        style={{
          marginTop: 30,
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #2e2a1a, #1a170d)',
          border: '1px solid #FFD70066',
          borderRadius: 8,
          color: '#FFD700',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#FFD700'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#FFD70066'; }}
      >
        Daily Rewards
      </button>

      {/* Achievements Button */}
      <button
        onClick={() => setShowAchievements(true)}
        style={{
          marginTop: 10,
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #1a2e1a, #0d1a0d)',
          border: '1px solid #4CAF5066',
          borderRadius: 8,
          color: '#4CAF50',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4CAF50'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#4CAF5066'; }}
      >
        Achievements ({achCount}/16)
      </button>

      {/* Footer tag */}
      <p style={{
        marginTop: 30,
        fontSize: 10,
        color: '#333',
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        Choose your path, Summoner
      </p>

      {/* Daily Rewards Modal */}
      {showTutorial && (
        <Tutorial onComplete={() => { setShowTutorial(false); if (!hasClaimedToday()) setShowDaily(true); }} />
      )}
      {showDaily && (
        <DailyRewards
          onClaim={handleClaimReward}
          onClose={() => setShowDaily(false)}
        />
      )}
      {showAchievements && (
        <AchievementPanel onClose={() => { setShowAchievements(false); setAchCount(getUnlockedCount()); }} />
      )}
    </div>
  );
}
