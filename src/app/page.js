'use client';

import { useState, useEffect, useMemo } from 'react';
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

function getSummonerTitle(battlesWon) {
  if (battlesWon >= 51) return 'Divine Summoner';
  if (battlesWon >= 21) return 'Veteran Summoner';
  if (battlesWon >= 6) return 'Apprentice Summoner';
  return 'Novice Summoner';
}

function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${(i * 37 + 13) % 100}%`,
      top: `${(i * 53 + 7) % 100}%`,
      size: 1 + (i % 3),
      delay: `${(i * 0.4) % 5}s`,
      duration: `${2.5 + (i % 3)}s`,
    }));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {stars.map(star => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            backgroundColor: '#fff',
            opacity: 0.15,
            animation: `gotr-twinkle ${star.duration} ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [showDaily, setShowDaily] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achCount, setAchCount] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('gotr_tutorial_done')) {
      setShowTutorial(true);
    } else if (!hasClaimedToday()) {
      setShowDaily(true);
    }
    setAchCount(getUnlockedCount());

    const save = loadSave();
    const battlesWon = save.stats?.battlesWon || 0;
    setPlayerStats({
      level: Math.max(1, Math.floor(battlesWon / 3) + 1),
      heroesOwned: (save.ownedHeroes || []).length,
      campaignStage: Math.min(save.campaignProgress?.highestStage || 0, 10),
      battlesWon,
    });
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
      position: 'relative',
      zIndex: 1,
    }}>
      <style>{`
        @keyframes gotr-twinkle {
          0%, 100% { opacity: 0.08; transform: scale(0.8); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes gotr-hero-glow {
          0%, 100% { opacity: 0.35; background: radial-gradient(ellipse at center, rgba(255,215,0,0.25) 0%, transparent 70%); }
          50% { opacity: 0.7; background: radial-gradient(ellipse at center, rgba(255,180,0,0.35) 0%, transparent 70%); }
        }
        @keyframes gotr-card-sheen {
          0% { left: -60%; }
          100% { left: 130%; }
        }
      `}</style>

      <Starfield />

      {/* Hero Title Section */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        marginBottom: 12,
        padding: '20px 0',
      }}>
        {/* Animated glow behind title */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 420,
          height: 120,
          borderRadius: '50%',
          animation: 'gotr-hero-glow 4s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: -1,
        }} />
        <h1 style={{
          fontSize: 42,
          fontWeight: 900,
          background: 'linear-gradient(180deg, #FFD700, #B8860B)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: 3,
          margin: 0,
          textTransform: 'uppercase',
          filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))',
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

      {/* Player Stats Mini-Bar */}
      {playerStats && (
        <div style={{
          display: 'flex',
          gap: 24,
          marginBottom: 8,
          padding: '10px 28px',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,215,0,0.02) 100%)',
          border: '1px solid rgba(255,215,0,0.15)',
          borderRadius: 20,
        }}>
          {[
            { label: 'LEVEL', value: playerStats.level, color: '#FFD700' },
            { label: 'HEROES', value: playerStats.heroesOwned, color: '#4CAF50' },
            { label: 'STAGE', value: `${playerStats.campaignStage}/10`, color: '#42A5F5' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1.2,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 9,
                color: '#666',
                letterSpacing: 2,
                fontWeight: 600,
                marginTop: 2,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

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
            <div
              className="gotr-menu-card"
              style={{
                background: item.gradient,
                border: `1px solid ${item.border}44`,
                borderRadius: 10,
                padding: '24px 20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minHeight: 130,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = `1px solid ${item.border}`;
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                e.currentTarget.style.boxShadow = `0 8px 32px ${item.border}44, inset 0 1px 0 ${item.border}33`;
                const sheen = e.currentTarget.querySelector('.gotr-sheen');
                if (sheen) sheen.style.animation = 'gotr-card-sheen 0.6s ease forwards';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = `1px solid ${item.border}44`;
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                const sheen = e.currentTarget.querySelector('.gotr-sheen');
                if (sheen) sheen.style.animation = 'none';
              }}
            >
              {/* Sheen overlay */}
              <div
                className="gotr-sheen"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-60%',
                  width: '40%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                  transform: 'skewX(-15deg)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              {/* Inner top highlight */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${item.border}44, transparent)`,
                pointerEvents: 'none',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: 32 }}>{item.icon}</span>
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
                position: 'relative',
                zIndex: 2,
              }}>
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Daily Rewards & Achievements Row */}
      <div style={{
        display: 'flex',
        gap: 14,
        marginTop: 30,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          onClick={() => setShowDaily(true)}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #2e2a1a 0%, #1a170d 100%)',
            border: '1px solid #FFD70044',
            borderRadius: 10,
            color: '#FFD700',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: 160,
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#FFD700';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,215,0,0.15), inset 0 1px 0 rgba(255,215,0,0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#FFD70044';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ marginRight: 8 }}>{'🎁'}</span>
          Daily Rewards
        </button>

        <button
          onClick={() => setShowAchievements(true)}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #1a2e1a 0%, #0d1a0d 100%)',
            border: '1px solid #4CAF5044',
            borderRadius: 10,
            color: '#4CAF50',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: 160,
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#4CAF50';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(76,175,80,0.15), inset 0 1px 0 rgba(76,175,80,0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#4CAF5044';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ marginRight: 8 }}>{'🏅'}</span>
          Achievements ({achCount}/16)
        </button>
      </div>

      {/* Footer tag */}
      <p style={{
        marginTop: 30,
        fontSize: 10,
        color: '#444',
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        Choose your path, {playerStats ? getSummonerTitle(playerStats.battlesWon) : 'Summoner'}
      </p>

      {/* Tutorial / Modals */}
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
