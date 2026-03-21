'use client';

import { useState, useEffect } from 'react';
import { SFX, resumeAudio } from '../utils/soundSystem';

const STORAGE_KEY = 'gotr_daily_login';

const DAY_REWARDS = [
  { type: 'gold', amount: 1000, label: '1,000 Gold', icon: '\u{1FA99}' },
  { type: 'essences', amount: 5, label: '5 Essences', icon: '\u{1F48E}' },
  { type: 'gold', amount: 2000, label: '2,000 Gold', icon: '\u{1FA99}' },
  { type: 'essences', amount: 10, label: '10 Essences', icon: '\u{1F48E}' },
  { type: 'gold', amount: 5000, label: '5,000 Gold', icon: '\u{1FA99}' },
  { type: 'awakenStones', amount: 5, label: '5 Awaken Stones', icon: '\u{1F300}' },
  { type: 'gold', amount: 10000, label: '10,000 Gold', icon: '\u{1FA99}' },
];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function loadLoginData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLoginData(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable
  }
}

function isYesterday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
}

export function hasClaimedToday() {
  const data = loadLoginData();
  if (!data) return false;
  return data.lastClaim === getToday();
}

export default function DailyRewards({ onClaim, onClose }) {
  const [loginData, setLoginData] = useState(null);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    let data = loadLoginData();
    const today = getToday();

    if (!data) {
      data = { lastClaim: null, streak: 0, claimedDays: [] };
    }

    // If last claim was today, mark as already claimed
    if (data.lastClaim === today) {
      setClaimed(true);
    }
    // If last claim was NOT yesterday (and not today), reset streak
    else if (data.lastClaim && !isYesterday(data.lastClaim)) {
      data = { lastClaim: data.lastClaim, streak: 0, claimedDays: [] };
      saveLoginData(data);
    }

    setLoginData(data);
  }, []);

  function handleClaim() {
    if (!loginData || claimed) return;
    resumeAudio();
    SFX.dailyClaim();

    const today = getToday();
    const newStreak = (loginData.streak % 7) ; // current index in 7-day cycle
    const reward = DAY_REWARDS[newStreak];

    const newData = {
      lastClaim: today,
      streak: loginData.streak + 1,
      claimedDays: [...loginData.claimedDays, newStreak],
    };

    // If we completed the cycle, reset claimedDays for next cycle
    if (newData.streak % 7 === 0) {
      newData.claimedDays = [0, 1, 2, 3, 4, 5, 6];
    }

    saveLoginData(newData);
    setLoginData(newData);
    setClaimed(true);

    if (onClaim) {
      onClaim({ [reward.type]: reward.amount });
    }
  }

  if (!loginData) return null;

  const currentDayIndex = loginData.streak % 7;

  return (
    <>
      <style>{`
        @keyframes dailyPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(255, 215, 0, 0.4); }
          50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.3); }
        }
      `}</style>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)',
            border: '1px solid #FFD70044',
            borderRadius: 14,
            padding: '28px 24px 24px',
            maxWidth: 520,
            width: '90%',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 10,
              right: 14,
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            x
          </button>

          {/* Header */}
          <h2 style={{
            textAlign: 'center',
            margin: '0 0 6px',
            fontSize: 22,
            fontWeight: 800,
            background: 'linear-gradient(180deg, #FFD700, #B8860B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: 2,
          }}>
            DAILY REWARDS
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#777',
            fontSize: 12,
            margin: '0 0 20px',
          }}>
            Day {currentDayIndex + 1} of 7 &mdash; Streak: {loginData.streak}
          </p>

          {/* 7-day grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            marginBottom: 20,
          }}>
            {DAY_REWARDS.map((reward, i) => {
              const isClaimed = loginData.claimedDays.includes(i) && (i < currentDayIndex || (i === currentDayIndex && claimed));
              const isCurrent = i === currentDayIndex && !claimed;
              const isFuture = i > currentDayIndex;

              return (
                <div
                  key={i}
                  style={{
                    background: isClaimed
                      ? 'linear-gradient(180deg, #1a2e1a, #0d1a0d)'
                      : isCurrent
                        ? 'linear-gradient(180deg, #2e2a1a, #1a170d)'
                        : 'linear-gradient(180deg, #16162a, #0e0e1a)',
                    border: isCurrent
                      ? '1px solid #FFD700'
                      : isClaimed
                        ? '1px solid #228B2244'
                        : '1px solid #333',
                    borderRadius: 8,
                    padding: '10px 4px 8px',
                    textAlign: 'center',
                    position: 'relative',
                    animation: isCurrent ? 'dailyPulse 2s infinite' : 'none',
                    opacity: isFuture ? 0.5 : 1,
                  }}
                >
                  <div style={{ fontSize: 10, color: '#888', marginBottom: 4, fontWeight: 600 }}>
                    DAY {i + 1}
                  </div>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>
                    {reward.icon}
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: isCurrent ? '#FFD700' : '#aaa',
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}>
                    {reward.label}
                  </div>

                  {/* Checkmark overlay */}
                  {isClaimed && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      color: '#4ade80',
                    }}>
                      &#10003;
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Claim button */}
          <button
            onClick={handleClaim}
            disabled={claimed}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 0',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 2,
              cursor: claimed ? 'default' : 'pointer',
              background: claimed
                ? 'linear-gradient(135deg, #333, #222)'
                : 'linear-gradient(135deg, #FFD700, #B8860B)',
              color: claimed ? '#666' : '#000',
              transition: 'opacity 0.2s',
            }}
          >
            {claimed ? 'CLAIMED TODAY' : 'CLAIM REWARD'}
          </button>
        </div>
      </div>
    </>
  );
}
