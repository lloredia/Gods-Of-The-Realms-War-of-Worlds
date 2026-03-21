'use client';

import { useEffect, useRef } from 'react';

const KEYFRAMES = `
@keyframes lightningFlash {
  0% { opacity: 0; transform: scaleY(0) rotate(-15deg); }
  20% { opacity: 1; transform: scaleY(1) rotate(-15deg); }
  60% { opacity: 1; transform: scaleY(1) rotate(-10deg); }
  100% { opacity: 0; transform: scaleY(1.2) rotate(-20deg); }
}
@keyframes waveSplash {
  0% { opacity: 0; transform: scaleX(0.3) scaleY(0.3); }
  30% { opacity: 1; transform: scaleX(1) scaleY(0.8); }
  70% { opacity: 0.8; transform: scaleX(1.3) scaleY(0.5); }
  100% { opacity: 0; transform: scaleX(1.5) scaleY(0.2); }
}
@keyframes darkPulse {
  0% { opacity: 0; transform: scale(0.2); }
  40% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.8); }
}
@keyframes solarFlare {
  0% { opacity: 0; transform: scale(0.1) rotate(0deg); }
  30% { opacity: 1; transform: scale(0.8) rotate(45deg); }
  70% { opacity: 0.9; transform: scale(1.2) rotate(90deg); }
  100% { opacity: 0; transform: scale(1.6) rotate(135deg); }
}
@keyframes crescentSlash {
  0% { opacity: 0; transform: rotate(-60deg) scale(0.3); }
  30% { opacity: 1; transform: rotate(-20deg) scale(1); }
  70% { opacity: 0.8; transform: rotate(10deg) scale(1.1); }
  100% { opacity: 0; transform: rotate(30deg) scale(0.8); }
}
@keyframes healRise {
  0% { opacity: 0; transform: translateY(20px) scale(0.5); }
  30% { opacity: 1; transform: translateY(0) scale(1); }
  70% { opacity: 0.8; transform: translateY(-30px) scale(0.8); }
  100% { opacity: 0; transform: translateY(-60px) scale(0.3); }
}
@keyframes buffSparkle {
  0% { opacity: 0; transform: translateY(30px) scale(0); }
  40% { opacity: 1; transform: translateY(0) scale(1); }
  70% { opacity: 0.7; transform: translateY(-25px) scale(0.6); }
  100% { opacity: 0; transform: translateY(-50px) scale(0); }
}
@keyframes debuffDescend {
  0% { opacity: 0; transform: translateY(-30px); }
  30% { opacity: 0.8; transform: translateY(0); }
  70% { opacity: 0.6; transform: translateY(20px); }
  100% { opacity: 0; transform: translateY(40px); }
}
@keyframes cleanseSpiral {
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  30% { opacity: 1; transform: scale(0.8) rotate(120deg); }
  70% { opacity: 0.8; transform: scale(1.2) rotate(270deg); }
  100% { opacity: 0; transform: scale(1.5) rotate(360deg); }
}
@keyframes shatterGlass {
  0% { opacity: 0; transform: scale(0.8) rotate(0deg); }
  20% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.9; transform: scale(1.1) rotate(5deg); }
  100% { opacity: 0; transform: scale(1.6) rotate(15deg) translateY(20px); }
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

function getPositionStyle(position) {
  return position === 'left'
    ? { left: '15%' }
    : { right: '15%' };
}

function buildEffect(skillType, element, position) {
  const posStyle = getPositionStyle(position);
  const base = { position: 'absolute', ...posStyle };

  if (skillType === 'damage') {
    if (element === 'Storm') {
      return [
        { ...base, top: '20%', width: 4, height: 80, background: 'linear-gradient(180deg, #6B5CE7, #fff, #6B5CE7)', transform: 'rotate(-15deg)', animation: 'lightningFlash 0.4s ease-out forwards', boxShadow: '0 0 20px #6B5CE7, 0 0 40px #6B5CE780' },
        { ...base, top: '28%', marginLeft: 20, width: 3, height: 60, background: 'linear-gradient(180deg, #8B7CF7, #fff, #4B3CD7)', transform: 'rotate(12deg)', animation: 'lightningFlash 0.4s 0.05s ease-out forwards', boxShadow: '0 0 15px #6B5CE7, 0 0 30px #6B5CE760', opacity: 0 },
        { ...base, top: '35%', marginLeft: -10, width: 3, height: 50, background: 'linear-gradient(180deg, #6B5CE7, #ddf, #6B5CE7)', transform: 'rotate(-25deg)', animation: 'lightningFlash 0.4s 0.1s ease-out forwards', boxShadow: '0 0 12px #6B5CE7, 0 0 25px #6B5CE750', opacity: 0 },
        { ...base, top: '25%', marginLeft: 8, width: 5, height: 70, background: 'linear-gradient(180deg, #9B8CF7, #fff, #5B4CE7)', transform: 'rotate(5deg)', animation: 'lightningFlash 0.45s 0.02s ease-out forwards', boxShadow: '0 0 25px #6B5CE7, 0 0 50px #6B5CE790', opacity: 0 },
      ];
    }
    if (element === 'Ocean') {
      return [
        { ...base, top: '40%', width: 120, height: 40, borderRadius: '50% 50% 0 0', background: 'linear-gradient(180deg, #1E90FF, #00BFFF80, transparent)', animation: 'waveSplash 0.5s ease-out forwards', boxShadow: '0 0 30px #1E90FF80' },
        { ...base, top: '35%', marginLeft: -15, width: 90, height: 30, borderRadius: '50% 50% 0 0', background: 'linear-gradient(180deg, #00BFFF, #1E90FF60, transparent)', animation: 'waveSplash 0.5s 0.08s ease-out forwards', opacity: 0 },
        { ...base, top: '45%', marginLeft: 20, width: 80, height: 25, borderRadius: '50% 50% 0 0', background: 'linear-gradient(180deg, #4169E1, #1E90FF40, transparent)', animation: 'waveSplash 0.5s 0.15s ease-out forwards', opacity: 0 },
      ];
    }
    if (element === 'Underworld') {
      return [
        { ...base, top: '30%', width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, #8B000080, #1a000060, transparent)', animation: 'darkPulse 0.5s ease-out forwards', boxShadow: '0 0 40px #8B000080, 0 0 80px #2a000060' },
        { ...base, top: '35%', marginLeft: 10, width: 70, height: 70, borderRadius: '50%', background: 'radial-gradient(circle, #4a0000a0, #000000a0, transparent)', animation: 'darkPulse 0.5s 0.1s ease-out forwards', opacity: 0 },
        { ...base, top: '25%', marginLeft: -15, width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle, #ff000040, #3a000080, transparent)', animation: 'darkPulse 0.5s 0.18s ease-out forwards', opacity: 0 },
      ];
    }
    if (element === 'Sun') {
      return [
        { ...base, top: '28%', width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, #FFD70090, #FF8C0060, #FF450030, transparent)', animation: 'solarFlare 0.5s ease-out forwards', boxShadow: '0 0 50px #FFD70080, 0 0 100px #FF8C0040' },
        { ...base, top: '32%', marginLeft: 15, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, #FFA50090, #FF6B0050, transparent)', animation: 'solarFlare 0.5s 0.08s ease-out forwards', opacity: 0 },
        { ...base, top: '24%', marginLeft: -10, width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle, #FFFF0070, #FFD70050, transparent)', animation: 'solarFlare 0.5s 0.15s ease-out forwards', opacity: 0 },
      ];
    }
    if (element === 'Moon') {
      return [
        { ...base, top: '30%', width: 100, height: 60, borderRadius: '50%', borderTop: '3px solid #9B59B6', borderLeft: '2px solid transparent', borderRight: '2px solid transparent', borderBottom: 'none', background: 'linear-gradient(180deg, #9B59B640, transparent)', animation: 'crescentSlash 0.45s ease-out forwards', boxShadow: '0 0 20px #9B59B680, 0 -5px 30px #8E44AD60' },
        { ...base, top: '35%', marginLeft: 10, width: 70, height: 40, borderRadius: '50%', borderTop: '2px solid #D2B4DE', borderLeft: '1px solid transparent', borderRight: '1px solid transparent', borderBottom: 'none', background: 'linear-gradient(180deg, #8E44AD30, transparent)', animation: 'crescentSlash 0.45s 0.08s ease-out forwards', opacity: 0 },
        { ...base, top: '28%', marginLeft: -8, width: 50, height: 30, borderRadius: '50%', borderTop: '2px solid #BB8FCE', borderLeft: '1px solid transparent', borderRight: '1px solid transparent', borderBottom: 'none', background: 'linear-gradient(180deg, #7D3C9820, transparent)', animation: 'crescentSlash 0.45s 0.14s ease-out forwards', opacity: 0 },
      ];
    }
    // Fallback: generic damage (no element / creature)
    return [
      { ...base, top: '30%', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, #ff444480, #88000060, transparent)', animation: 'darkPulse 0.4s ease-out forwards', boxShadow: '0 0 30px #ff444460' },
    ];
  }

  if (skillType === 'heal') {
    return [
      { ...base, top: '50%', width: 12, height: 12, borderRadius: '50%', background: '#4CAF50', animation: 'healRise 0.6s ease-out forwards', boxShadow: '0 0 10px #4CAF50, 0 0 20px #4CAF5060' },
      { ...base, top: '55%', marginLeft: 25, width: 10, height: 10, borderRadius: '50%', background: '#66BB6A', animation: 'healRise 0.6s 0.1s ease-out forwards', boxShadow: '0 0 8px #66BB6A', opacity: 0 },
      { ...base, top: '48%', marginLeft: -15, width: 14, height: 14, borderRadius: '50%', background: '#81C784', animation: 'healRise 0.6s 0.15s ease-out forwards', boxShadow: '0 0 12px #81C784', opacity: 0 },
      { ...base, top: '52%', marginLeft: 10, width: 8, height: 8, borderRadius: '50%', background: '#A5D6A7', animation: 'healRise 0.6s 0.2s ease-out forwards', boxShadow: '0 0 6px #A5D6A7', opacity: 0 },
      { ...base, top: '45%', marginLeft: 35, width: 16, height: 4, background: '#4CAF50', borderRadius: 2, animation: 'healRise 0.6s 0.05s ease-out forwards', boxShadow: '0 0 8px #4CAF50', opacity: 0 },
    ];
  }

  if (skillType === 'buff') {
    return [
      { ...base, top: '55%', width: 6, height: 6, borderRadius: '50%', background: '#FFD700', animation: 'buffSparkle 0.5s ease-out forwards', boxShadow: '0 0 10px #FFD700, 0 0 20px #FFD70060' },
      { ...base, top: '50%', marginLeft: 20, width: 5, height: 5, borderRadius: '50%', background: '#FFC107', animation: 'buffSparkle 0.5s 0.08s ease-out forwards', boxShadow: '0 0 8px #FFC107', opacity: 0 },
      { ...base, top: '58%', marginLeft: -10, width: 7, height: 7, borderRadius: '50%', background: '#FFEB3B', animation: 'buffSparkle 0.5s 0.14s ease-out forwards', boxShadow: '0 0 12px #FFEB3B', opacity: 0 },
      { ...base, top: '52%', marginLeft: 30, width: 4, height: 4, borderRadius: '50%', background: '#FFD700', animation: 'buffSparkle 0.5s 0.2s ease-out forwards', boxShadow: '0 0 6px #FFD700', opacity: 0 },
    ];
  }

  if (skillType === 'debuff') {
    return [
      { ...base, top: '25%', width: 60, height: 20, borderRadius: 10, background: 'linear-gradient(180deg, #9B59B660, #C0392B40, transparent)', animation: 'debuffDescend 0.5s ease-out forwards', boxShadow: '0 0 15px #9B59B640' },
      { ...base, top: '22%', marginLeft: 20, width: 45, height: 16, borderRadius: 8, background: 'linear-gradient(180deg, #8E44AD50, #E74C3C30, transparent)', animation: 'debuffDescend 0.5s 0.1s ease-out forwards', opacity: 0 },
      { ...base, top: '28%', marginLeft: -15, width: 50, height: 18, borderRadius: 9, background: 'linear-gradient(180deg, #7D3C9850, #C0392B30, transparent)', animation: 'debuffDescend 0.5s 0.18s ease-out forwards', opacity: 0 },
    ];
  }

  if (skillType === 'cleanse') {
    return [
      { ...base, top: '35%', width: 80, height: 80, borderRadius: '50%', border: '2px solid #ffffff90', background: 'radial-gradient(circle, #ffffff30, #ffffff10, transparent)', animation: 'cleanseSpiral 0.5s ease-out forwards', boxShadow: '0 0 25px #ffffff60, 0 0 50px #ffffff30' },
      { ...base, top: '38%', marginLeft: 10, width: 50, height: 50, borderRadius: '50%', border: '1px solid #ffffff70', background: 'radial-gradient(circle, #ffffff20, transparent)', animation: 'cleanseSpiral 0.5s 0.1s ease-out forwards', opacity: 0 },
      { ...base, top: '32%', marginLeft: -5, width: 35, height: 35, borderRadius: '50%', border: '1px solid #ffffff50', background: 'radial-gradient(circle, #ffffff15, transparent)', animation: 'cleanseSpiral 0.5s 0.18s ease-out forwards', opacity: 0 },
    ];
  }

  if (skillType === 'strip') {
    return [
      { ...base, top: '30%', width: 20, height: 20, background: 'linear-gradient(135deg, #5DADE2, #AED6F1)', transform: 'rotate(30deg)', animation: 'shatterGlass 0.5s ease-out forwards', boxShadow: '0 0 10px #5DADE260' },
      { ...base, top: '35%', marginLeft: 25, width: 14, height: 14, background: 'linear-gradient(135deg, #3498DB, #85C1E9)', transform: 'rotate(-15deg)', animation: 'shatterGlass 0.5s 0.05s ease-out forwards', opacity: 0 },
      { ...base, top: '28%', marginLeft: -10, width: 16, height: 10, background: 'linear-gradient(135deg, #2E86C1, #AED6F1)', transform: 'rotate(50deg)', animation: 'shatterGlass 0.5s 0.1s ease-out forwards', opacity: 0 },
      { ...base, top: '38%', marginLeft: 10, width: 12, height: 18, background: 'linear-gradient(135deg, #5DADE2, #D6EAF8)', transform: 'rotate(-40deg)', animation: 'shatterGlass 0.5s 0.15s ease-out forwards', opacity: 0 },
    ];
  }

  return [];
}

export default function SkillEffect({ skillType, element, position, onDone }) {
  const timerRef = useRef(null);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    const duration = skillType === 'heal' ? 600 : 500;
    timerRef.current = setTimeout(() => {
      if (onDone) onDone();
    }, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [skillType, element, position, onDone]);

  const elements = buildEffect(skillType, element || null, position);

  if (elements.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 500,
    }}>
      {elements.map((style, i) => (
        <div key={i} style={style} />
      ))}
    </div>
  );
}
