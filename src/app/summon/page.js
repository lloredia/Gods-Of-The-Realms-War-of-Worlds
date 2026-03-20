'use client';

import { useState } from 'react';
import { simulateSummon } from '../../data/summonPool';
import { heroRoster } from '../../data/units';
import { SFX, resumeAudio } from '../../utils/soundSystem';

const STAR_COLORS = { 3: '#9E9E9E', 4: '#FFD700', 5: '#FF4444' };
const ELEMENT_COLORS = { Storm: '#6B5CE7', Ocean: '#2196F3', Underworld: '#8B0000', Sun: '#FF9800', Moon: '#9C27B0' };

export default function SummonPage() {
  const [results, setResults] = useState([]);
  const [latest, setLatest] = useState(null);
  const [animating, setAnimating] = useState(false);

  const doSummon = (count) => {
    resumeAudio();
    setAnimating(true);
    SFX.summon();
    const pulls = [];
    for (let i = 0; i < count; i++) {
      const result = simulateSummon();
      const hero = heroRoster[result.heroId];
      if (hero) {
        pulls.push({ ...result, hero });
      }
    }

    setTimeout(() => {
      setLatest(pulls);
      setResults(prev => [...pulls, ...prev].slice(0, 50));
      setAnimating(false);
      const hasFiveStar = pulls.some(p => p.stars >= 5);
      if (hasFiveStar) {
        SFX.crit();
      } else {
        SFX.click();
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', color: '#eee', padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, color: '#FFD700', margin: 0 }}>DIVINE SUMMONING</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Call upon the gods to join your ranks</p>
      </div>

      {/* Summon buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
        <button onClick={() => doSummon(1)} disabled={animating} style={{
          padding: '12px 32px', fontSize: 14, fontWeight: 'bold',
          backgroundColor: animating ? '#333' : '#FFD700', color: animating ? '#666' : '#000',
          border: 'none', borderRadius: 8, cursor: animating ? 'not-allowed' : 'pointer',
        }}>Summon x1</button>
        <button onClick={() => doSummon(10)} disabled={animating} style={{
          padding: '12px 32px', fontSize: 14, fontWeight: 'bold',
          backgroundColor: animating ? '#333' : '#FF6B35', color: animating ? '#666' : '#fff',
          border: 'none', borderRadius: 8, cursor: animating ? 'not-allowed' : 'pointer',
        }}>Summon x10</button>
      </div>

      {/* Animating state */}
      {animating && (
        <div style={{ textAlign: 'center', padding: 40, fontSize: 18, color: '#FFD700' }}>
          ✦ Summoning... ✦
        </div>
      )}

      {/* Latest results */}
      {!animating && latest && latest.length > 0 && (
        <div style={{ maxWidth: 800, margin: '0 auto 24px' }}>
          <h3 style={{ textAlign: 'center', color: '#ccc', fontSize: 14, marginBottom: 12 }}>
            {latest.length === 1 ? 'Summoned!' : `${latest.length} Heroes Summoned!`}
          </h3>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {latest.map((pull, i) => {
              const starColor = STAR_COLORS[pull.stars] || '#FFD700';
              const elemColor = ELEMENT_COLORS[pull.hero.element] || '#666';
              return (
                <div key={i} style={{
                  padding: 14, borderRadius: 8, backgroundColor: '#1a1a2e',
                  border: `2px solid ${starColor}`, minWidth: 150, textAlign: 'center',
                  boxShadow: pull.stars >= 5 ? `0 0 15px ${starColor}40` : 'none',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: '#eee', marginBottom: 4 }}>{pull.hero.name}</div>
                  <div style={{ fontSize: 12, color: starColor, marginBottom: 4 }}>{'★'.repeat(pull.stars)}</div>
                  <div style={{ fontSize: 10, color: elemColor }}>{pull.hero.element}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{pull.hero.faction}</div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{pull.hero.role}</div>
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
    </div>
  );
}
