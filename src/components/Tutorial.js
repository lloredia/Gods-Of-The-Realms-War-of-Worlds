'use client';

import { useState, useEffect } from 'react';

const STEPS = [
  {
    icon: '\u{1F3DB}\uFE0F',
    title: 'Welcome, Summoner!',
    description:
      'You have been chosen to lead a pantheon of mythical gods and legendary warriors. Build your team, master the elements, and wage war across the realms to claim ultimate glory.',
  },
  {
    icon: '\uD83D\uDCDC',
    title: 'Build Your Team',
    description:
      'Visit your Collection to manage your roster. Every hero has a role — Attackers deal massive damage, Tanks absorb hits for allies, Supports heal and buff, and Controllers debuff enemies. A balanced team is the key to victory.',
  },
  {
    icon: '\u2694\uFE0F',
    title: 'Enter Battle',
    description:
      'Combat is turn-based and driven by a turn meter. When a hero\'s meter fills, they act. Use skills wisely — each has cooldowns and elemental affinities. Exploit elemental weaknesses to deal bonus damage and gain the upper hand.',
  },
  {
    icon: '\u2728',
    title: 'Summon Heroes',
    description:
      'Spend summoning crystals at the Divine Gate to recruit new heroes. Heroes range from 1-star commons to 5-star legendaries. Higher star ratings mean stronger base stats and unique abilities. Collect them all!',
  },
  {
    icon: '\uD83D\uDDFA\uFE0F',
    title: 'Conquer the Campaign',
    description:
      'Battle through mythic stages across multiple realms. Each stage drops gold, experience, and gear. Clear all stages in a realm to unlock the next and face ever-stronger foes. Boss stages yield the rarest rewards.',
  },
  {
    icon: '\uD83C\uDFC6',
    title: 'Rise in the Arena',
    description:
      'Test your team against other players in the PvP Arena. Climb the rankings to earn weekly rewards and exclusive titles. Study your opponents\' lineups and craft counter-strategies to dominate the leaderboard.',
  },
  {
    icon: '\uD83D\uDD25',
    title: 'Your Journey Begins!',
    description:
      'You are ready to carve your legend across the realms. Summon your first heroes, assemble your team, and march into battle. The gods await your command!',
  },
];

export default function Tutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const finish = () => {
    localStorage.setItem('gotr_tutorial_done', 'true');
    setVisible(false);
    setTimeout(() => onComplete(), 300);
  };

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setFadeKey((k) => k + 1);
      setStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: visible ? '#000000cc' : '#00000000',
        transition: 'background-color 0.3s ease',
        padding: 20,
      }}
    >
      <div
        key={fadeKey}
        style={{
          backgroundColor: '#12122a',
          border: '1px solid #FFD70044',
          borderRadius: 14,
          maxWidth: 480,
          width: '100%',
          padding: '36px 32px 28px',
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.08), 0 20px 60px rgba(0,0,0,0.6)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'tutorialStepFade 0.3s ease',
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: 44,
            marginBottom: 16,
            filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.3))',
          }}
        >
          {current.icon}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#FFD700',
            margin: '0 0 12px',
            letterSpacing: 1,
            textShadow: '0 0 20px rgba(255,215,0,0.25)',
          }}
        >
          {current.title}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: 13,
            color: '#b0b0c0',
            lineHeight: 1.7,
            margin: '0 0 28px',
            maxWidth: 400,
          }}
        >
          {current.description}
        </p>

        {/* Step counter */}
        <div
          style={{
            fontSize: 11,
            color: '#666',
            marginBottom: 18,
            letterSpacing: 2,
            fontWeight: 600,
          }}
        >
          {step + 1}/{STEPS.length}
        </div>

        {/* Next / Begin button */}
        <button
          onClick={goNext}
          style={{
            backgroundColor: '#FFD700',
            color: '#0a0a1a',
            border: 'none',
            borderRadius: 8,
            padding: '12px 48px',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 16px rgba(255,215,0,0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffe54c';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,215,0,0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFD700';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,215,0,0.25)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isLast ? 'Begin' : 'Next'}
        </button>

        {/* Skip link */}
        {!isLast && (
          <button
            onClick={finish}
            style={{
              background: 'none',
              border: 'none',
              color: '#555',
              fontSize: 11,
              marginTop: 18,
              cursor: 'pointer',
              letterSpacing: 1,
              transition: 'color 0.2s ease',
              padding: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#888';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#555';
            }}
          >
            Skip Tutorial
          </button>
        )}
      </div>

      {/* Keyframe animation injected via style tag */}
      <style>{`
        @keyframes tutorialStepFade {
          from { opacity: 0.4; transform: translateY(8px); }
          to   { opacity: 1;   transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
