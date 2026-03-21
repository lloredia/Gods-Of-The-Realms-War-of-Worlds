'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { simulateSummon } from '../../data/summonPool';
import { heroRoster } from '../../data/units';
import { SFX, resumeAudio } from '../../utils/soundSystem';
import { loadSave, updateSave, addHero } from '../../utils/saveSystem';
import { checkSummonAchievements } from '../../utils/achievementTracker';
import AchievementToast from '../../components/AchievementToast';
import HeroPortrait from '../../components/HeroPortrait';

const STAR_COLORS = { 3: '#9E9E9E', 4: '#9B59B6', 5: '#FFD700' };
const GLOW_COLORS = { 3: '#9E9E9E', 4: '#9B59B6', 5: '#FFD700' };
const ELEMENT_COLORS = { Storm: '#6B5CE7', Ocean: '#2196F3', Underworld: '#8B0000', Sun: '#FF9800', Moon: '#9C27B0' };

const SUMMON_KEYFRAMES = `
@keyframes cardFlip {
  0%   { transform: rotateY(0deg); }
  50%  { transform: rotateY(180deg); }
  100% { transform: rotateY(360deg); }
}
@keyframes glowPulse3 {
  0%, 100% { box-shadow: 0 0 6px #9E9E9E40, 0 0 12px #9E9E9E20; }
  50%      { box-shadow: 0 0 16px #9E9E9E80, 0 0 30px #9E9E9E40; }
}
@keyframes glowPulse4 {
  0%, 100% { box-shadow: 0 0 6px #9B59B640, 0 0 12px #9B59B620; }
  50%      { box-shadow: 0 0 16px #9B59B680, 0 0 30px #9B59B640; }
}
@keyframes glowPulse5 {
  0%, 100% { box-shadow: 0 0 8px #FFD70060, 0 0 16px #FFD70030; }
  50%      { box-shadow: 0 0 24px #FFD700AA, 0 0 48px #FFD70060, 0 0 64px #FFD70030; }
}
@keyframes slideUp {
  0%   { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes sparkle {
  0%   { transform: rotate(0deg) scale(1); opacity: 1; }
  50%  { transform: rotate(180deg) scale(1.3); opacity: 0.6; }
  100% { transform: rotate(360deg) scale(1); opacity: 1; }
}
@keyframes burstIn {
  0%   { transform: scale(0.3); opacity: 0; }
  60%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes cardBackSwirl {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

let summonStylesInjected = false;
function injectSummonStyles() {
  if (summonStylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = SUMMON_KEYFRAMES;
  document.head.appendChild(style);
  summonStylesInjected = true;
}

export default function SummonPage() {
  const [results, setResults] = useState([]);
  const [latest, setLatest] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [save, setSave] = useState(null);
  const [totalSummons, setTotalSummons] = useState(0);
  const [toast, setToast] = useState(null);

  // Card reveal state
  const [pendingPulls, setPendingPulls] = useState(null);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [allRevealed, setAllRevealed] = useState(false);
  const revealTimers = useRef([]);

  useEffect(() => {
    injectSummonStyles();
    const s = loadSave();
    setSave(s);
    setTotalSummons(s.stats?.totalSummons || 0);
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => revealTimers.current.forEach(t => clearTimeout(t));
  }, []);

  const startRevealSequence = useCallback((pulls) => {
    // Clear old timers
    revealTimers.current.forEach(t => clearTimeout(t));
    revealTimers.current = [];

    setRevealedIndices(new Set());
    setAllRevealed(false);

    // After 600ms, start flipping cards one by one with 150ms stagger
    pulls.forEach((_, i) => {
      const timer = setTimeout(() => {
        setRevealedIndices(prev => {
          const next = new Set(prev);
          next.add(i);
          return next;
        });
        // Check if this is the last card
        if (i === pulls.length - 1) {
          setTimeout(() => setAllRevealed(true), 400);
        }
      }, 600 + i * 150);
      revealTimers.current.push(timer);
    });
  }, []);

  const doSummon = (count) => {
    const cost = count === 1 ? 1000 : 9000;
    if (!save || save.resources.gold < cost) return;

    // Deduct gold
    const newGold = save.resources.gold - cost;
    updateSave({ resources: { ...save.resources, gold: newGold } });
    setSave(prev => ({ ...prev, resources: { ...prev.resources, gold: newGold } }));

    resumeAudio();
    setAnimating(true);
    setLatest(null);
    setAllRevealed(false);
    SFX.summon();
    const pulls = [];
    for (let i = 0; i < count; i++) {
      const result = simulateSummon();
      const hero = heroRoster[result.heroId];
      if (hero) {
        pulls.push({ ...result, hero });
      }
    }

    // Show face-down cards immediately
    setPendingPulls(pulls);

    // Start reveal sequence
    startRevealSequence(pulls);

    // After all cards revealed + settle time, finalize
    const totalRevealTime = 600 + pulls.length * 150 + 600;
    setTimeout(() => {
      // Persist each pulled hero
      pulls.forEach(p => addHero(p.heroId));

      setLatest(pulls);
      setResults(prev => [...pulls, ...prev].slice(0, 50));
      setAnimating(false);
      setPendingPulls(null);
      const hasFiveStar = pulls.some(p => p.stars >= 5);
      if (hasFiveStar) {
        SFX.crit();
      } else {
        SFX.click();
      }

      // Track summon stats and achievements
      const newTotal = totalSummons + count;
      setTotalSummons(newTotal);
      const s = loadSave();
      updateSave({ stats: { ...s.stats, totalSummons: newTotal } });
      const unlocked = checkSummonAchievements(newTotal, hasFiveStar);
      if (unlocked.length > 0) setToast(unlocked[0]);
    }, totalRevealTime);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', color: '#eee', padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, color: '#FFD700', margin: 0 }}>DIVINE SUMMONING</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Call upon the gods to join your ranks</p>
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: '#FFD700', marginBottom: 8 }}>
        Gold: {save?.resources?.gold?.toLocaleString() || 0}
      </div>

      {/* Summon buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
        <button onClick={() => doSummon(1)} disabled={animating || !save || save.resources.gold < 1000} style={{
          padding: '12px 32px', fontSize: 14, fontWeight: 'bold',
          backgroundColor: (animating || !save || save.resources.gold < 1000) ? '#333' : '#FFD700',
          color: (animating || !save || save.resources.gold < 1000) ? '#666' : '#000',
          border: 'none', borderRadius: 8,
          cursor: (animating || !save || save.resources.gold < 1000) ? 'not-allowed' : 'pointer',
        }}>Summon x1 (1,000g)</button>
        <button onClick={() => doSummon(10)} disabled={animating || !save || save.resources.gold < 9000} style={{
          padding: '12px 32px', fontSize: 14, fontWeight: 'bold',
          backgroundColor: (animating || !save || save.resources.gold < 9000) ? '#333' : '#FF6B35',
          color: (animating || !save || save.resources.gold < 9000) ? '#666' : '#fff',
          border: 'none', borderRadius: 8,
          cursor: (animating || !save || save.resources.gold < 9000) ? 'not-allowed' : 'pointer',
        }}>Summon x10 (9,000g)</button>
      </div>

      {/* Card reveal animation */}
      {animating && pendingPulls && (
        <div style={{ maxWidth: 900, margin: '0 auto 24px' }}>
          <h3 style={{ textAlign: 'center', color: '#FFD700', fontSize: 14, marginBottom: 16, animation: 'glowPulse5 1.5s ease-in-out infinite' }}>
            {allRevealed
              ? (pendingPulls.length === 1 ? 'Summoned!' : `${pendingPulls.length} Heroes Summoned!`)
              : 'Summoning...'}
          </h3>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {pendingPulls.map((pull, i) => {
              const isRevealed = revealedIndices.has(i);
              const starColor = STAR_COLORS[pull.stars] || '#FFD700';
              const glowColor = GLOW_COLORS[pull.stars] || '#FFD700';
              const elemColor = ELEMENT_COLORS[pull.hero.element] || '#666';
              const isFiveStar = pull.stars >= 5;

              return (
                <div key={i} style={{
                  perspective: '800px',
                  width: 130,
                  height: 180,
                  animation: isRevealed ? `slideUp 0.3s ease-out forwards` : 'none',
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    animation: isRevealed ? 'cardFlip 0.5s ease-in-out forwards' : 'none',
                    transition: 'transform 0.1s',
                  }}>
                    {/* Card back (face-down) */}
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      borderRadius: 10,
                      backgroundColor: '#1a1a3e',
                      border: '2px solid #FFD70055',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #1a1a3e 0%, #2a1a4e 50%, #1a1a3e 100%)',
                    }}>
                      {/* Golden swirl pattern */}
                      <div style={{
                        position: 'absolute',
                        width: 80,
                        height: 80,
                        border: '2px solid #FFD70044',
                        borderRadius: '50%',
                        animation: 'cardBackSwirl 3s linear infinite',
                      }} />
                      <div style={{
                        position: 'absolute',
                        width: 50,
                        height: 50,
                        border: '2px solid #FFD70033',
                        borderRadius: '50%',
                        animation: 'cardBackSwirl 2s linear infinite reverse',
                      }} />
                      {/* Shimmer overlay */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 10,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.08) 30%, rgba(255,215,0,0.15) 50%, rgba(255,215,0,0.08) 70%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                      }} />
                      <span style={{ fontSize: 28, color: '#FFD70066', zIndex: 1 }}>✦</span>
                    </div>

                    {/* Card front (revealed) */}
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: 10,
                      backgroundColor: '#1a1a2e',
                      border: `2px solid ${starColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 10,
                      boxSizing: 'border-box',
                      animation: isRevealed ? `glowPulse${pull.stars} 1.5s ease-in-out 0.5s 3` : 'none',
                      overflow: 'hidden',
                    }}>
                      {/* 5-star sparkle effects */}
                      {isFiveStar && isRevealed && (
                        <>
                          <div style={{
                            position: 'absolute', top: 6, right: 8,
                            fontSize: 10, color: '#FFD700',
                            animation: 'sparkle 1s ease-in-out infinite',
                          }}>✦</div>
                          <div style={{
                            position: 'absolute', top: 20, left: 8,
                            fontSize: 8, color: '#FFD700',
                            animation: 'sparkle 1.3s ease-in-out 0.3s infinite',
                          }}>✦</div>
                          <div style={{
                            position: 'absolute', bottom: 10, right: 12,
                            fontSize: 9, color: '#FFD700',
                            animation: 'sparkle 1.1s ease-in-out 0.6s infinite',
                          }}>✦</div>
                          <div style={{
                            position: 'absolute', bottom: 24, left: 10,
                            fontSize: 7, color: '#FFD700',
                            animation: 'sparkle 1.4s ease-in-out 0.15s infinite',
                          }}>✦</div>
                        </>
                      )}

                      {/* Burst glow on reveal */}
                      {isRevealed && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 10,
                          background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
                          animation: 'burstIn 0.6s ease-out forwards',
                          pointerEvents: 'none',
                        }} />
                      )}

                      {/* Hero portrait */}
                      <div style={{ marginBottom: 6, zIndex: 1 }}>
                        <HeroPortrait
                          unitId={pull.heroId}
                          element={pull.hero.element}
                          faction={pull.hero.faction}
                          size={44}
                          isActive={isFiveStar && isRevealed}
                        />
                      </div>

                      {/* Hero name */}
                      <div style={{
                        fontSize: 12, fontWeight: 'bold', color: '#eee',
                        marginBottom: 3, textAlign: 'center',
                        zIndex: 1, lineHeight: 1.2,
                      }}>{pull.hero.name}</div>

                      {/* Star rating */}
                      <div style={{
                        fontSize: 11, color: starColor, marginBottom: 3, zIndex: 1,
                      }}>{'★'.repeat(pull.stars)}</div>

                      {/* Element badge */}
                      <div style={{
                        fontSize: 9, color: '#fff',
                        backgroundColor: elemColor,
                        padding: '1px 8px',
                        borderRadius: 8,
                        zIndex: 1,
                      }}>{pull.hero.element}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest results (shown after animation completes) */}
      {!animating && latest && latest.length > 0 && (
        <div style={{ maxWidth: 900, margin: '0 auto 24px' }}>
          <h3 style={{ textAlign: 'center', color: '#ccc', fontSize: 14, marginBottom: 12 }}>
            {latest.length === 1 ? 'Summoned!' : `${latest.length} Heroes Summoned!`}
          </h3>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {latest.map((pull, i) => {
              const starColor = STAR_COLORS[pull.stars] || '#FFD700';
              const elemColor = ELEMENT_COLORS[pull.hero.element] || '#666';
              const glowColor = GLOW_COLORS[pull.stars] || '#FFD700';
              const isFiveStar = pull.stars >= 5;
              return (
                <div key={i} style={{
                  width: 130, padding: 10, borderRadius: 10, backgroundColor: '#1a1a2e',
                  border: `2px solid ${starColor}`, textAlign: 'center',
                  boxShadow: isFiveStar ? `0 0 15px ${glowColor}40` : 'none',
                  animation: `slideUp 0.3s ease-out ${i * 50}ms both`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  {isFiveStar && (
                    <>
                      <div style={{
                        position: 'absolute', top: 4, right: 6,
                        fontSize: 9, color: '#FFD700',
                        animation: 'sparkle 1s ease-in-out infinite',
                      }}>✦</div>
                      <div style={{
                        position: 'absolute', bottom: 6, left: 8,
                        fontSize: 7, color: '#FFD700',
                        animation: 'sparkle 1.3s ease-in-out 0.4s infinite',
                      }}>✦</div>
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                    <HeroPortrait
                      unitId={pull.heroId}
                      element={pull.hero.element}
                      faction={pull.hero.faction}
                      size={40}
                      isActive={false}
                    />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#eee', marginBottom: 3 }}>{pull.hero.name}</div>
                  <div style={{ fontSize: 11, color: starColor, marginBottom: 3 }}>{'★'.repeat(pull.stars)}</div>
                  <div style={{
                    fontSize: 9, color: '#fff', display: 'inline-block',
                    backgroundColor: elemColor, padding: '1px 8px', borderRadius: 8,
                  }}>{pull.hero.element}</div>
                  <div style={{ fontSize: 9, color: '#888', marginTop: 3 }}>{pull.hero.faction}</div>
                  <div style={{ fontSize: 9, color: '#999', marginTop: 1 }}>{pull.hero.role}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summon rates info */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#555' }}>
          Rates: <span style={{ color: '#9E9E9E' }}>★★★ 65%</span> • <span style={{ color: '#FFD700' }}>★★★★ 28%</span> • <span style={{ color: '#FF4444' }}>★★★★★ 7%</span>
        </div>
      </div>

      {/* History */}
      {results.length > 0 && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h3 style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Summon History</h3>
          <div style={{ fontSize: 11, color: '#555' }}>
            {results.map((pull, i) => {
              const starColor = STAR_COLORS[pull.stars] || '#FFD700';
              return (
                <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #1a1a2e' }}>
                  <span style={{ color: starColor }}>{'★'.repeat(pull.stars)}</span>{' '}
                  <span style={{ color: '#aaa' }}>{pull.hero.name}</span>{' '}
                  <span style={{ color: '#555' }}>({pull.hero.element})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {toast && <AchievementToast achievementId={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
