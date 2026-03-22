'use client';

import { useMemo, useEffect } from 'react';

// ─── COLOR CONSTANTS ─────────────────────────────────────────────────────────

const ELEMENT_COLORS = {
  Storm: '#6B5CE7',
  Ocean: '#2196F3',
  Underworld: '#8B0000',
  Sun: '#FF9800',
  Moon: '#9C27B0',
};

const FACTION_COLORS = {
  Pantheon: '#FFD700',
  Norse: '#4FC3F7',
  Egyptian: '#CE93D8',
  Celtic: '#81C784',
  Japanese: '#FF8A65',
};

const FACTION_GRADIENTS = {
  Pantheon: ['#FFD700', '#1a1000'],
  Norse: ['#4FC3F7', '#001a2e'],
  Egyptian: ['#CE93D8', '#1a001e'],
  Celtic: ['#81C784', '#001a00'],
  Japanese: ['#FF8A65', '#1a0a00'],
};

const DEFAULT_GRADIENT = ['#666', '#111'];

// ─── HERO_DATA (backward compat) ────────────────────────────────────────────

const HERO_DATA = {
  zeus:        { element: 'Storm',      faction: 'Pantheon' },
  poseidon:    { element: 'Ocean',      faction: 'Pantheon' },
  hades:       { element: 'Underworld', faction: 'Pantheon' },
  apollo:      { element: 'Sun',        faction: 'Pantheon' },
  ares:        { element: 'Storm',      faction: 'Pantheon' },
  athena:      { element: 'Moon',       faction: 'Pantheon' },
  hermes:      { element: 'Storm',      faction: 'Pantheon' },
  hephaestus:  { element: 'Sun',        faction: 'Pantheon' },
  thor:        { element: 'Storm',      faction: 'Norse' },
  freya:       { element: 'Moon',       faction: 'Norse' },
  odin:        { element: 'Sun',        faction: 'Norse' },
  loki:        { element: 'Underworld', faction: 'Norse' },
  fenrir:      { element: 'Underworld', faction: 'Norse' },
  tyr:         { element: 'Storm',      faction: 'Norse' },
  heimdall:    { element: 'Sun',        faction: 'Norse' },
  anubis:      { element: 'Underworld', faction: 'Egyptian' },
  ra:          { element: 'Sun',        faction: 'Egyptian' },
  bastet:      { element: 'Moon',       faction: 'Egyptian' },
  isis:        { element: 'Ocean',      faction: 'Egyptian' },
  set:         { element: 'Storm',      faction: 'Egyptian' },
  sobek:       { element: 'Ocean',      faction: 'Egyptian' },
  thoth:       { element: 'Moon',       faction: 'Egyptian' },
  morganLeFay: { element: 'Moon',       faction: 'Celtic' },
  merlin:      { element: 'Sun',        faction: 'Celtic' },
  nimue:       { element: 'Ocean',      faction: 'Celtic' },
  cuChulainn:  { element: 'Storm',      faction: 'Celtic' },
  amaterasu:   { element: 'Sun',        faction: 'Japanese' },
  susanoo:     { element: 'Ocean',      faction: 'Japanese' },
  raijin:      { element: 'Storm',      faction: 'Japanese' },
  tsukuyomi:   { element: 'Moon',       faction: 'Japanese' },
  izanami:     { element: 'Underworld', faction: 'Japanese' },
  benzaiten:   { element: 'Ocean',      faction: 'Japanese' },
};

// ─── KEYFRAME INJECTION ──────────────────────────────────────────────────────

const SVG_PULSE_KEYFRAMES = `
@keyframes svgGlowPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes svgRingPulse {
  0%, 100% { stroke-width: 3; }
  50% { stroke-width: 5; }
}
@keyframes particleFloat {
  0% { opacity: 0; transform: translateY(0); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-8px); }
}
`;

let stylesInjected = false;

function injectKeyframes() {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = SVG_PULSE_KEYFRAMES;
  document.head.appendChild(style);
  stylesInjected = true;
}

// ─── SVG HELPER: shared background + ring ────────────────────────────────────

function portraitBase(uid, elemColor, gradColors, isActive) {
  return (
    <>
      <defs>
        <radialGradient id={`bg-${uid}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={gradColors[0]} stopOpacity="0.2" />
          <stop offset="40%" stopColor={gradColors[0]} stopOpacity="0.09" />
          <stop offset="100%" stopColor={gradColors[1]} stopOpacity="1" />
        </radialGradient>
        <filter id={`glow-${uid}`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`vignette-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
        </radialGradient>
        <radialGradient id={`sheen-${uid}`} cx="30%" cy="25%" r="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill={`url(#bg-${uid})`} />
      {/* Border ring with glow */}
      <circle
        cx="50" cy="50" r="46"
        fill="none"
        stroke={elemColor}
        strokeWidth={isActive ? 4 : 3}
        filter={`url(#glow-${uid})`}
        opacity={isActive ? 1 : 0.8}
        style={isActive ? { animation: 'svgRingPulse 2s ease-in-out infinite' } : undefined}
      />
    </>
  );
}

function portraitOverlay(uid) {
  return (
    <>
      <circle cx="50" cy="50" r="46" fill={`url(#vignette-${uid})`} />
      <circle cx="50" cy="50" r="46" fill={`url(#sheen-${uid})`} />
    </>
  );
}

// ─── ELEMENT PARTICLES ───────────────────────────────────────────────────────

function elementParticles(element, elemColor) {
  switch (element) {
    case 'Storm':
      return (
        <>
          {/* Lightning sparks */}
          <path d="M 18 15 L 20 20 L 17 20 L 19 26" stroke={elemColor} strokeWidth="1.2" fill="none" opacity="0.7" />
          <path d="M 78 12 L 80 17 L 77 17 L 79 23" stroke={elemColor} strokeWidth="1.2" fill="none" opacity="0.6" />
          <circle cx="14" cy="30" r="1" fill={elemColor} opacity="0.5" />
          <circle cx="86" cy="28" r="1" fill={elemColor} opacity="0.4" />
        </>
      );
    case 'Ocean':
      return (
        <>
          {/* Water drops */}
          <circle cx="16" cy="22" r="1.5" fill={elemColor} opacity="0.5" />
          <circle cx="82" cy="18" r="1.2" fill={elemColor} opacity="0.4" />
          <circle cx="20" cy="78" r="1" fill={elemColor} opacity="0.6" />
          <path d="M 75 75 Q 78 72 81 75" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.5" />
        </>
      );
    case 'Underworld':
      return (
        <>
          {/* Dark wisps */}
          <path d="M 18 80 Q 16 70 20 65" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M 80 78 Q 82 68 78 62" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.35" />
          <circle cx="15" cy="60" r="1" fill={elemColor} opacity="0.3" />
        </>
      );
    case 'Sun':
      return (
        <>
          {/* Sun rays / sparks */}
          <line x1="14" y1="18" x2="18" y2="22" stroke={elemColor} strokeWidth="0.8" opacity="0.5" />
          <line x1="84" y1="16" x2="80" y2="20" stroke={elemColor} strokeWidth="0.8" opacity="0.4" />
          <circle cx="12" cy="40" r="1" fill={elemColor} opacity="0.4" />
          <circle cx="88" cy="38" r="1" fill={elemColor} opacity="0.35" />
        </>
      );
    case 'Moon':
      return (
        <>
          {/* Moon motes */}
          <circle cx="16" cy="20" r="1.5" fill={elemColor} opacity="0.4" />
          <circle cx="84" cy="24" r="1" fill={elemColor} opacity="0.3" />
          <circle cx="18" cy="75" r="0.8" fill={elemColor} opacity="0.35" />
          <circle cx="80" cy="72" r="1.2" fill={elemColor} opacity="0.25" />
        </>
      );
    default:
      return null;
  }
}

// ─── GREEK HERO PORTRAITS ────────────────────────────────────────────────────

function zeusPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`bolt-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FFE44D" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
      </defs>
      {/* Cape flowing behind */}
      <path
        d="M 32 42 Q 25 50 22 70 Q 28 68 35 72 Q 30 55 35 45 Z"
        fill="#1a1a3a" opacity="0.7"
      />
      <path
        d="M 68 42 Q 75 50 78 70 Q 72 68 65 72 Q 70 55 65 45 Z"
        fill="#1a1a3a" opacity="0.7"
      />
      {/* Body - broad shoulders, heroic torso */}
      <path
        d="M 38 45 L 32 48 L 30 65 L 36 80 L 42 82 L 50 84 L 58 82 L 64 80 L 70 65 L 68 48 L 62 45 L 55 42 L 45 42 Z"
        fill="#1a1a2e"
      />
      {/* Chest / armor detail */}
      <path
        d="M 42 48 L 50 46 L 58 48 L 56 60 L 50 62 L 44 60 Z"
        fill="#2a2a4a" opacity="0.6"
      />
      {/* Head */}
      <ellipse cx="50" cy="32" rx="9" ry="10" fill="#1a1a2e" />
      {/* Beard flowing */}
      <path
        d="M 42 36 Q 44 45 50 48 Q 56 45 58 36 Q 55 42 50 44 Q 45 42 42 36 Z"
        fill="#2a2a3e"
      />
      {/* Laurel crown */}
      <path
        d="M 40 26 Q 42 22 46 23 Q 44 20 48 20 Q 50 18 52 20 Q 56 20 54 23 Q 58 22 60 26"
        stroke="#FFD700" strokeWidth="1.5" fill="none"
      />
      <circle cx="50" cy="20" r="1.5" fill="#FFD700" />
      {/* Raised arm */}
      <path
        d="M 60 46 L 65 38 L 68 28 L 66 26 L 63 36 L 58 44 Z"
        fill="#1a1a2e"
      />
      {/* Lightning bolt - the weapon */}
      <path
        d="M 66 12 L 62 22 L 67 22 L 60 34 L 65 34 L 56 48 L 60 36 L 55 36 L 62 24 L 57 24 Z"
        fill={`url(#bolt-${uid})`}
        filter={`url(#glow-${uid})`}
      />
      {/* Left arm down */}
      <path
        d="M 40 46 L 34 52 L 30 60 L 33 62 L 36 54 L 42 48 Z"
        fill="#1a1a2e"
      />
      {elementParticles('Storm', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function poseidonPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`trident-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4DD0E1" />
          <stop offset="100%" stopColor="#00838F" />
        </linearGradient>
      </defs>
      {/* Flowing hair behind */}
      <path
        d="M 42 24 Q 35 28 30 40 Q 33 38 36 36 Q 34 32 40 26 Z"
        fill="#1a2a3e" opacity="0.7"
      />
      <path
        d="M 58 24 Q 65 28 70 40 Q 67 38 64 36 Q 66 32 60 26 Z"
        fill="#1a2a3e" opacity="0.7"
      />
      {/* Body - strong stance */}
      <path
        d="M 36 46 L 30 50 L 28 66 L 34 80 L 42 84 L 50 86 L 58 84 L 66 80 L 72 66 L 70 50 L 64 46 L 56 43 L 44 43 Z"
        fill="#1a1a2e"
      />
      {/* Scale armor detail */}
      <path d="M 42 52 Q 46 50 50 52 Q 54 50 58 52 L 56 58 L 50 60 L 44 58 Z" fill="#1a3a4e" opacity="0.5" />
      <path d="M 40 60 Q 45 58 50 60 Q 55 58 60 60 L 58 66 L 50 68 L 42 66 Z" fill="#1a3a4e" opacity="0.4" />
      {/* Head */}
      <ellipse cx="50" cy="32" rx="9" ry="10" fill="#1a1a2e" />
      {/* Coral crown */}
      <path
        d="M 41 25 L 43 18 L 45 24 L 47 16 L 50 23 L 53 16 L 55 24 L 57 18 L 59 25"
        stroke="#FF6B6B" strokeWidth="1.2" fill="none"
      />
      {/* Beard */}
      <path
        d="M 43 36 Q 46 44 50 46 Q 54 44 57 36 Q 54 40 50 42 Q 46 40 43 36 Z"
        fill="#2a2a3e"
      />
      {/* Extended arm with trident */}
      <path
        d="M 64 46 L 72 40 L 76 34 L 74 32 L 70 38 L 62 44 Z"
        fill="#1a1a2e"
      />
      {/* Trident */}
      <line x1="74" y1="14" x2="74" y2="38" stroke={`url(#trident-${uid})`} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M 68 18 L 74 10 L 80 18 M 71 16 L 74 8 L 77 16"
        stroke={`url(#trident-${uid})`} strokeWidth="1.8" fill="none" strokeLinecap="round"
      />
      {/* Wave effects at feet */}
      <path d="M 24 80 Q 32 76 40 80 Q 48 84 56 80 Q 64 76 72 80" stroke={elemColor} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M 28 84 Q 36 80 44 84 Q 52 88 60 84 Q 68 80 76 84" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.3" />
      {/* Left arm */}
      <path
        d="M 36 46 L 30 54 L 28 60 L 31 62 L 34 56 L 38 48 Z"
        fill="#1a1a2e"
      />
      {elementParticles('Ocean', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function hadesPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`scepter-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B71C1C" />
          <stop offset="100%" stopColor="#4A0000" />
        </linearGradient>
      </defs>
      {/* Dark robes - tall flowing shape */}
      <path
        d="M 30 35 Q 24 50 22 72 L 26 86 L 40 90 L 50 92 L 60 90 L 74 86 L 78 72 Q 76 50 70 35 L 60 30 L 50 28 L 40 30 Z"
        fill="#0e0e1a"
      />
      {/* Robe folds */}
      <path d="M 38 50 Q 40 65 38 80" stroke="#1a1a30" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M 50 45 Q 50 65 50 85" stroke="#1a1a30" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 62 50 Q 60 65 62 80" stroke="#1a1a30" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Hood */}
      <path
        d="M 36 32 Q 34 20 42 14 Q 50 10 58 14 Q 66 20 64 32 Q 60 28 50 26 Q 40 28 36 32 Z"
        fill="#0e0e1a"
      />
      {/* Face shadow under hood */}
      <ellipse cx="50" cy="30" rx="7" ry="6" fill="#0a0a14" />
      {/* Glowing eyes */}
      <circle cx="46" cy="29" r="1.5" fill={elemColor} opacity="0.9" />
      <circle cx="54" cy="29" r="1.5" fill={elemColor} opacity="0.9" />
      {/* Arm holding scepter */}
      <path
        d="M 62 42 L 68 38 L 72 30 L 70 28 L 66 36 L 60 40 Z"
        fill="#0e0e1a"
      />
      {/* Scepter / bident */}
      <line x1="70" y1="18" x2="70" y2="50" stroke={`url(#scepter-${uid})`} strokeWidth="2.5" strokeLinecap="round" />
      {/* Bident prongs */}
      <path d="M 66 22 L 70 12 L 74 22" stroke={`url(#scepter-${uid})`} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Skull on scepter */}
      <circle cx="70" cy="14" r="3" fill="#3a1a1a" />
      <circle cx="68.5" cy="13.5" r="0.8" fill={elemColor} opacity="0.7" />
      <circle cx="71.5" cy="13.5" r="0.8" fill={elemColor} opacity="0.7" />
      <path d="M 68.5 15.5 L 70 16 L 71.5 15.5" stroke={elemColor} strokeWidth="0.5" fill="none" opacity="0.6" />
      {/* Dark smoke wisps */}
      <path d="M 30 75 Q 26 60 30 50" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M 70 75 Q 74 60 72 48" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.25" />
      <path d="M 50 85 Q 48 75 52 68" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.2" />
      {elementParticles('Underworld', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function apolloPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`bow-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
        <radialGradient id={`sunray-${uid}`} cx="50%" cy="40%" r="45%">
          <stop offset="0%" stopColor={elemColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Sun rays radiating behind */}
      <circle cx="50" cy="38" r="36" fill={`url(#sunray-${uid})`} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + Math.cos(rad) * 18;
        const y1 = 38 + Math.sin(rad) * 18;
        const x2 = 50 + Math.cos(rad) * 30;
        const y2 = 38 + Math.sin(rad) * 30;
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={elemColor} strokeWidth="0.8" opacity={0.2 + (i % 2) * 0.1}
          />
        );
      })}
      {/* Athletic body in archer pose */}
      <path
        d="M 40 46 L 34 50 L 32 66 L 36 80 L 44 84 L 50 86 L 56 84 L 62 80 L 66 66 L 64 50 L 58 46 L 54 43 L 44 43 Z"
        fill="#1a1a2e"
      />
      {/* Head */}
      <ellipse cx="50" cy="32" rx="8" ry="9" fill="#1a1a2e" />
      {/* Flowing hair */}
      <path
        d="M 42 28 Q 40 32 36 36 Q 38 34 42 30 Q 44 26 50 24 Q 56 26 58 30 Q 62 34 64 36 Q 60 32 58 28"
        stroke="#2a2a3e" strokeWidth="1.5" fill="none" opacity="0.6"
      />
      {/* Drawing arm - pulled back */}
      <path
        d="M 58 46 L 66 42 L 72 38 L 74 36 L 72 34 L 66 38 L 58 44 Z"
        fill="#1a1a2e"
      />
      {/* Front arm extended - holding bow */}
      <path
        d="M 40 46 L 32 44 L 24 40 L 22 42 L 30 46 L 38 48 Z"
        fill="#1a1a2e"
      />
      {/* Bow */}
      <path
        d="M 24 28 Q 18 40 24 54"
        stroke={`url(#bow-${uid})`} strokeWidth="2" fill="none" strokeLinecap="round"
      />
      {/* Bowstring */}
      <line x1="24" y1="28" x2="24" y2="54" stroke="#FFE082" strokeWidth="0.6" />
      {/* Arrow of light */}
      <line x1="24" y1="40" x2="72" y2="36" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.9" />
      <path d="M 72 36 L 74 34 L 76 36 L 74 38 Z" fill="#FFFFFF" opacity="0.9" />
      {/* Arrow glow */}
      <line x1="24" y1="40" x2="72" y2="36" stroke={elemColor} strokeWidth="2.5" opacity="0.3" />
      {elementParticles('Sun', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function aresPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`sword-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="100%" stopColor="#757575" />
        </linearGradient>
        <linearGradient id={`shield-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B0000" />
          <stop offset="100%" stopColor="#4A0000" />
        </linearGradient>
      </defs>
      {/* Heavy body - aggressive forward stance */}
      <path
        d="M 36 44 L 28 48 L 24 62 L 28 78 L 36 84 L 50 88 L 64 84 L 72 78 L 76 62 L 72 48 L 64 44 L 56 40 L 44 40 Z"
        fill="#1a1a2e"
      />
      {/* Chest plate armor */}
      <path
        d="M 40 48 L 50 44 L 60 48 L 58 60 L 50 64 L 42 60 Z"
        fill="#2a2a3e" opacity="0.6"
      />
      <path d="M 50 44 L 50 64" stroke="#3a3a4e" strokeWidth="0.8" opacity="0.5" />
      <path d="M 42 52 L 58 52" stroke="#3a3a4e" strokeWidth="0.8" opacity="0.5" />
      {/* Head with helmet */}
      <ellipse cx="50" cy="30" rx="8" ry="9" fill="#1a1a2e" />
      {/* Helmet */}
      <path
        d="M 40 28 Q 40 18 50 16 Q 60 18 60 28 L 58 32 L 42 32 Z"
        fill="#2a2a3e"
      />
      {/* Helmet plume */}
      <path
        d="M 50 16 Q 52 8 50 6 Q 48 8 46 12 Q 44 16 42 22 Q 44 18 48 14 Q 50 12 52 14 Q 56 18 58 22 Q 56 16 54 12 Q 52 8 50 6"
        fill="#8B0000" opacity="0.8"
      />
      {/* Eye slit */}
      <rect x="42" y="27" width="16" height="3" rx="1" fill="#0a0a14" />
      <circle cx="46" cy="28.5" r="1" fill={elemColor} opacity="0.6" />
      <circle cx="54" cy="28.5" r="1" fill={elemColor} opacity="0.6" />
      {/* Right arm - raised with sword */}
      <path
        d="M 62 44 L 68 36 L 72 26 L 70 24 L 66 34 L 60 42 Z"
        fill="#1a1a2e"
      />
      {/* Sword blade */}
      <path
        d="M 70 8 L 72 10 L 70 28 L 68 28 Z"
        fill={`url(#sword-${uid})`}
      />
      {/* Sword handle */}
      <rect x="66" y="28" width="8" height="2" rx="1" fill="#8B6914" />
      <rect x="68.5" y="30" width="3" height="4" rx="0.5" fill="#5D4037" />
      {/* Left arm - shield */}
      <path
        d="M 38 44 L 30 48 L 26 54 L 28 56 L 32 50 L 38 46 Z"
        fill="#1a1a2e"
      />
      {/* Round shield */}
      <circle cx="24" cy="54" r="10" fill={`url(#shield-${uid})`} />
      <circle cx="24" cy="54" r="7" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.5" />
      <circle cx="24" cy="54" r="3" fill="#FFD700" opacity="0.3" />
      {/* Battle scar across chest */}
      <path d="M 44 50 L 56 58" stroke={elemColor} strokeWidth="0.8" opacity="0.4" />
      {elementParticles('Storm', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function athenaPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`spear-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="100%" stopColor="#9E9E9E" />
        </linearGradient>
        <linearGradient id={`aegis-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      {/* Body - regal standing pose */}
      <path
        d="M 38 44 L 32 48 L 30 64 L 34 80 L 42 86 L 50 88 L 58 86 L 66 80 L 70 64 L 68 48 L 62 44 L 56 42 L 44 42 Z"
        fill="#1a1a2e"
      />
      {/* Draped cloth detail */}
      <path d="M 42 50 Q 44 62 40 76" stroke="#2a2a4e" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M 58 50 Q 56 62 60 76" stroke="#2a2a4e" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="8" ry="9" fill="#1a1a2e" />
      {/* Plumed helmet */}
      <path
        d="M 42 28 Q 42 18 50 14 Q 58 18 58 28 L 56 30 L 44 30 Z"
        fill="#2a2a40"
      />
      {/* Helmet plume - tall and elegant */}
      <path
        d="M 50 14 Q 52 6 50 4 Q 48 6 46 10 Q 44 14 42 20"
        stroke={elemColor} strokeWidth="2" fill="none" opacity="0.7"
      />
      <path
        d="M 50 14 Q 52 6 54 10 Q 56 14 58 20"
        stroke={elemColor} strokeWidth="1.5" fill="none" opacity="0.5"
      />
      {/* Face detail - eyes visible */}
      <circle cx="47" cy="28" r="1" fill={elemColor} opacity="0.5" />
      <circle cx="53" cy="28" r="1" fill={elemColor} opacity="0.5" />
      {/* Right arm holding spear */}
      <path
        d="M 60 44 L 66 40 L 68 36 L 66 34 L 64 38 L 58 42 Z"
        fill="#1a1a2e"
      />
      {/* Spear - long vertical */}
      <line x1="66" y1="8" x2="66" y2="70" stroke={`url(#spear-${uid})`} strokeWidth="2" strokeLinecap="round" />
      {/* Spear tip */}
      <path d="M 63 12 L 66 4 L 69 12 Z" fill="#E0E0E0" />
      {/* Left arm holding shield */}
      <path
        d="M 38 44 L 30 48 L 26 54 L 28 56 L 32 52 L 38 46 Z"
        fill="#1a1a2e"
      />
      {/* Aegis shield - large */}
      <ellipse cx="24" cy="55" rx="10" ry="12" fill={`url(#aegis-${uid})`} opacity="0.8" />
      <ellipse cx="24" cy="55" rx="7" ry="9" fill="none" stroke="#FFD700" strokeWidth="0.6" opacity="0.5" />
      {/* Owl emblem on shield */}
      <circle cx="24" cy="53" r="3" fill="#1a1a2e" opacity="0.6" />
      <circle cx="22.5" cy="52" r="1" fill="#FFD700" opacity="0.7" />
      <circle cx="25.5" cy="52" r="1" fill="#FFD700" opacity="0.7" />
      <path d="M 22 54 L 24 55.5 L 26 54" stroke="#FFD700" strokeWidth="0.6" fill="none" opacity="0.6" />
      {elementParticles('Moon', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function hermesPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`cad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      {/* Speed lines */}
      <line x1="10" y1="50" x2="22" y2="48" stroke={elemColor} strokeWidth="0.6" opacity="0.3" />
      <line x1="12" y1="56" x2="24" y2="54" stroke={elemColor} strokeWidth="0.5" opacity="0.25" />
      <line x1="10" y1="62" x2="20" y2="60" stroke={elemColor} strokeWidth="0.6" opacity="0.2" />
      {/* Body - running/flying dynamic pose, leaning forward */}
      <path
        d="M 44 44 L 38 48 L 36 58 L 34 72 L 38 78 L 44 76 L 48 68 L 52 68 L 56 76 L 62 78 L 66 72 L 64 58 L 62 48 L 56 44 L 52 42 L 46 42 Z"
        fill="#1a1a2e"
      />
      {/* Leg extended back - running */}
      <path
        d="M 36 72 L 28 80 L 24 86 L 28 88 L 34 82 L 38 76 Z"
        fill="#1a1a2e"
      />
      {/* Front leg forward */}
      <path
        d="M 64 72 L 72 78 L 76 86 L 72 88 L 66 80 L 62 76 Z"
        fill="#1a1a2e"
      />
      {/* Winged sandal back */}
      <path d="M 22 86 L 18 82 L 14 84 L 18 86 L 22 88" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M 20 84 L 16 80 L 12 82" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Winged sandal front */}
      <path d="M 76 86 L 80 82 L 84 84 L 80 86 L 76 88" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M 78 84 L 82 80 L 86 82" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Head */}
      <ellipse cx="50" cy="32" rx="7" ry="8" fill="#1a1a2e" />
      {/* Winged helmet */}
      <path
        d="M 44 28 Q 44 22 50 20 Q 56 22 56 28"
        fill="#2a2a3e"
      />
      {/* Wings on helmet */}
      <path d="M 42 24 L 34 18 L 36 22 L 30 16 L 34 22 L 38 26" fill={elemColor} opacity="0.6" />
      <path d="M 58 24 L 66 18 L 64 22 L 70 16 L 66 22 L 62 26" fill={elemColor} opacity="0.6" />
      {/* Arm carrying caduceus */}
      <path
        d="M 56 44 L 62 38 L 66 32 L 64 30 L 60 36 L 54 42 Z"
        fill="#1a1a2e"
      />
      {/* Caduceus staff */}
      <line x1="64" y1="10" x2="64" y2="40" stroke={`url(#cad-${uid})`} strokeWidth="2" strokeLinecap="round" />
      {/* Caduceus wings */}
      <path d="M 60 14 L 54 10 L 56 14 L 52 12" stroke="#FFD700" strokeWidth="0.8" fill="none" />
      <path d="M 68 14 L 74 10 L 72 14 L 76 12" stroke="#FFD700" strokeWidth="0.8" fill="none" />
      {/* Caduceus snakes */}
      <path d="M 62 28 Q 60 24 62 20 Q 64 16 66 20 Q 68 24 66 28" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.7" />
      <path d="M 66 28 Q 68 24 66 20 Q 64 16 62 20 Q 60 24 62 28" stroke="#B8860B" strokeWidth="0.8" fill="none" opacity="0.6" />
      {/* Caduceus orb */}
      <circle cx="64" cy="10" r="2" fill="#FFD700" opacity="0.8" />
      {elementParticles('Storm', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function hephaestusPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`hammer-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9E9E9E" />
          <stop offset="100%" stopColor="#616161" />
        </linearGradient>
        <radialGradient id={`forge-${uid}`} cx="30%" cy="80%" r="30%">
          <stop offset="0%" stopColor={elemColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Forge glow at base */}
      <circle cx="34" cy="82" r="20" fill={`url(#forge-${uid})`} />
      {/* Stocky, broad body - slightly hunched */}
      <path
        d="M 34 42 L 24 48 L 20 62 L 24 78 L 34 86 L 50 90 L 66 86 L 76 78 L 80 62 L 76 48 L 66 42 L 58 40 L 42 40 Z"
        fill="#1a1a2e"
      />
      {/* Apron */}
      <path
        d="M 38 52 L 36 72 L 40 82 L 50 84 L 60 82 L 64 72 L 62 52 Z"
        fill="#2a1a0a" opacity="0.6"
      />
      <path d="M 40 56 L 60 56" stroke="#3a2a1a" strokeWidth="0.8" opacity="0.4" />
      <path d="M 38 64 L 62 64" stroke="#3a2a1a" strokeWidth="0.8" opacity="0.4" />
      {/* Head - slightly forward (hunched) */}
      <ellipse cx="50" cy="32" rx="9" ry="10" fill="#1a1a2e" />
      {/* Bushy beard */}
      <path
        d="M 41 36 Q 42 48 50 50 Q 58 48 59 36 Q 56 44 50 46 Q 44 44 41 36 Z"
        fill="#2a2a3e"
      />
      {/* Heavy brow */}
      <path d="M 42 26 L 50 24 L 58 26" stroke="#2a2a3e" strokeWidth="2" fill="none" />
      {/* Eyes - determined */}
      <circle cx="46" cy="28" r="1.2" fill={elemColor} opacity="0.5" />
      <circle cx="54" cy="28" r="1.2" fill={elemColor} opacity="0.5" />
      {/* Massive raised arm with hammer */}
      <path
        d="M 64 42 L 72 34 L 76 24 L 74 22 L 70 32 L 62 40 Z"
        fill="#1a1a2e"
      />
      {/* Hammer handle */}
      <line x1="74" y1="10" x2="74" y2="30" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" />
      {/* Hammer head - large */}
      <rect x="66" y="6" width="16" height="10" rx="2" fill={`url(#hammer-${uid})`} />
      <rect x="68" y="8" width="12" height="6" rx="1" fill="none" stroke="#BDBDBD" strokeWidth="0.5" opacity="0.4" />
      {/* Other arm at side */}
      <path
        d="M 34 42 L 26 50 L 22 58 L 25 60 L 28 52 L 36 44 Z"
        fill="#1a1a2e"
      />
      {/* Forge fire sparks */}
      <circle cx="28" cy="78" r="1.5" fill={elemColor} opacity="0.6" />
      <circle cx="34" cy="74" r="1" fill="#FF5722" opacity="0.5" />
      <circle cx="24" cy="74" r="0.8" fill="#FFAB40" opacity="0.4" />
      <path d="M 30 80 Q 28 74 32 70" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.3" />
      {elementParticles('Sun', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

// ─── EGYPTIAN HERO PORTRAITS ────────────────────────────────────────────────

function anubisPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`scales-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id={`ankh-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      {/* Body - tall, lean, wrapped in dark linen */}
      <path
        d="M 38 46 L 32 50 L 30 66 L 34 80 L 42 84 L 50 86 L 58 84 L 66 80 L 70 66 L 68 50 L 62 46 L 56 42 L 44 42 Z"
        fill="#0e0e1a"
      />
      {/* Egyptian collar/necklace */}
      <path
        d="M 38 46 Q 44 44 50 43 Q 56 44 62 46 L 60 50 Q 55 48 50 47 Q 45 48 40 50 Z"
        fill="#FFD700" opacity="0.6"
      />
      <path d="M 40 48 Q 50 46 60 48" stroke="#B8860B" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M 39 47 Q 50 45 61 47" stroke="#FFD700" strokeWidth="0.4" fill="none" opacity="0.4" />
      {/* Jackal head - pointed ears, long snout */}
      <path
        d="M 42 36 L 40 28 Q 42 18 50 16 Q 58 18 60 28 L 58 36 Q 56 38 50 40 Q 44 38 42 36 Z"
        fill="#1a1a2e"
      />
      {/* Tall pointed ears */}
      <path d="M 42 28 L 38 14 L 44 24 Z" fill="#1a1a2e" />
      <path d="M 58 28 L 62 14 L 56 24 Z" fill="#1a1a2e" />
      <path d="M 40 16 L 42 22" stroke="#2a2a3e" strokeWidth="0.6" opacity="0.5" />
      <path d="M 60 16 L 58 22" stroke="#2a2a3e" strokeWidth="0.6" opacity="0.5" />
      {/* Long snout */}
      <path
        d="M 46 32 L 44 38 L 42 42 L 46 40 L 50 38 L 54 40 L 58 42 L 56 38 L 54 32"
        fill="#12122a"
      />
      <path d="M 42 42 L 44 43 L 46 42" stroke="#2a2a3e" strokeWidth="0.5" fill="none" />
      {/* Eyes - glowing */}
      <circle cx="46" cy="28" r="1.5" fill={elemColor} opacity="0.8" />
      <circle cx="54" cy="28" r="1.5" fill={elemColor} opacity="0.8" />
      {/* Left arm holding ankh staff */}
      <path
        d="M 38 46 L 30 52 L 26 60 L 29 62 L 32 54 L 40 48 Z"
        fill="#0e0e1a"
      />
      {/* Ankh staff */}
      <line x1="26" y1="28" x2="26" y2="68" stroke={`url(#ankh-${uid})`} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="26" cy="24" rx="4" ry="5" fill="none" stroke={`url(#ankh-${uid})`} strokeWidth="1.8" />
      <line x1="22" y1="32" x2="30" y2="32" stroke={`url(#ankh-${uid})`} strokeWidth="1.8" strokeLinecap="round" />
      {/* Right arm holding scales */}
      <path
        d="M 62 46 L 68 40 L 72 34 L 70 32 L 66 38 L 60 44 Z"
        fill="#0e0e1a"
      />
      {/* Scales of judgment */}
      <line x1="72" y1="18" x2="72" y2="36" stroke={`url(#scales-${uid})`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="64" y1="22" x2="80" y2="22" stroke={`url(#scales-${uid})`} strokeWidth="1.2" strokeLinecap="round" />
      {/* Scale pans */}
      <path d="M 62 22 L 64 22 L 63 28 L 61 28 Z" stroke={`url(#scales-${uid})`} strokeWidth="0.6" fill="none" />
      <path d="M 66 26 Q 63 28 60 26" stroke={`url(#scales-${uid})`} strokeWidth="0.8" fill="none" />
      <path d="M 80 22 L 82 22 L 81 28 L 79 28 Z" stroke={`url(#scales-${uid})`} strokeWidth="0.6" fill="none" />
      <path d="M 84 26 Q 81 28 78 26" stroke={`url(#scales-${uid})`} strokeWidth="0.8" fill="none" />
      {/* Chains from crossbar to pans */}
      <line x1="64" y1="22" x2="63" y2="26" stroke="#B8860B" strokeWidth="0.5" opacity="0.6" />
      <line x1="80" y1="22" x2="81" y2="26" stroke="#B8860B" strokeWidth="0.5" opacity="0.6" />
      {elementParticles('Underworld', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function raPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`sundisc-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#FFD700" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#FF9800" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`was-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      {/* Sun disc glow behind head */}
      <circle cx="50" cy="14" r="12" fill={`url(#sundisc-${uid})`} filter={`url(#glow-${uid})`} />
      {/* Sun rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + Math.cos(rad) * 8;
        const y1 = 14 + Math.sin(rad) * 8;
        const x2 = 50 + Math.cos(rad) * 14;
        const y2 = 14 + Math.sin(rad) * 14;
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#FFD700" strokeWidth="0.8" opacity={0.3 + (i % 2) * 0.15}
          />
        );
      })}
      {/* Royal robes - broad */}
      <path
        d="M 36 46 L 28 52 L 26 68 L 30 82 L 40 86 L 50 88 L 60 86 L 70 82 L 74 68 L 72 52 L 64 46 L 56 42 L 44 42 Z"
        fill="#1a1a2e"
      />
      {/* Robe detail - royal sash */}
      <path d="M 50 44 L 50 86" stroke="#FFD700" strokeWidth="1" opacity="0.3" />
      <path d="M 42 52 L 58 52" stroke="#FFD700" strokeWidth="0.6" opacity="0.25" />
      {/* Egyptian collar */}
      <path
        d="M 38 46 Q 44 43 50 42 Q 56 43 62 46 L 60 52 Q 55 50 50 49 Q 45 50 40 52 Z"
        fill="#FFD700" opacity="0.5"
      />
      <path d="M 39 48 Q 50 45 61 48" stroke="#FF9800" strokeWidth="0.5" fill="none" opacity="0.4" />
      {/* Falcon head */}
      <path
        d="M 42 36 Q 42 24 50 20 Q 58 24 58 36 Q 55 38 50 40 Q 45 38 42 36 Z"
        fill="#1a1a2e"
      />
      {/* Sharp beak */}
      <path
        d="M 48 34 L 46 40 L 50 44 L 54 40 L 52 34"
        fill="#8B6914"
      />
      <path d="M 50 38 L 50 44" stroke="#6B4F12" strokeWidth="0.5" />
      {/* Falcon eyes - fierce */}
      <circle cx="46" cy="30" r="1.8" fill={elemColor} opacity="0.9" />
      <circle cx="54" cy="30" r="1.8" fill={elemColor} opacity="0.9" />
      {/* Eye of Ra markings */}
      <path d="M 44 31 L 40 34" stroke={elemColor} strokeWidth="0.8" opacity="0.5" />
      <path d="M 56 31 L 60 34" stroke={elemColor} strokeWidth="0.8" opacity="0.5" />
      {/* Right arm holding was scepter */}
      <path
        d="M 62 46 L 68 40 L 72 32 L 70 30 L 66 38 L 60 44 Z"
        fill="#1a1a2e"
      />
      {/* Was scepter */}
      <line x1="72" y1="16" x2="72" y2="52" stroke={`url(#was-${uid})`} strokeWidth="2" strokeLinecap="round" />
      {/* Was scepter - animal head top */}
      <path d="M 70 16 Q 68 12 70 10 L 72 8 L 74 10 Q 76 12 74 16" fill="#8B6914" />
      <path d="M 68 12 L 66 10" stroke="#8B6914" strokeWidth="1" strokeLinecap="round" />
      {/* Was scepter - forked bottom */}
      <path d="M 70 52 L 72 56 L 74 52" stroke="#8B6914" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Left arm at side */}
      <path
        d="M 38 46 L 32 54 L 28 62 L 31 64 L 34 56 L 40 48 Z"
        fill="#1a1a2e"
      />
      {elementParticles('Sun', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function bastetPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`sistrum-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      {/* Sleek body - lithe, feminine */}
      <path
        d="M 40 44 L 34 48 L 32 62 L 34 76 L 40 82 L 50 84 L 60 82 L 66 76 L 68 62 L 66 48 L 60 44 L 56 42 L 44 42 Z"
        fill="#1a1a2e"
      />
      {/* Graceful waist */}
      <path
        d="M 42 54 Q 46 52 50 52 Q 54 52 58 54 L 56 62 L 50 64 L 44 62 Z"
        fill="#2a2a3e" opacity="0.4"
      />
      {/* Egyptian collar */}
      <path
        d="M 40 44 Q 45 42 50 41 Q 55 42 60 44 L 58 48 Q 54 46 50 45 Q 46 46 42 48 Z"
        fill="#FFD700" opacity="0.5"
      />
      {/* Cat head - pointed ears */}
      <path
        d="M 42 34 Q 42 24 50 22 Q 58 24 58 34 Q 56 38 50 40 Q 44 38 42 34 Z"
        fill="#1a1a2e"
      />
      {/* Tall pointed cat ears */}
      <path d="M 42 26 L 38 12 L 46 22 Z" fill="#1a1a2e" />
      <path d="M 58 26 L 62 12 L 54 22 Z" fill="#1a1a2e" />
      {/* Inner ear */}
      <path d="M 41 20 L 39 14 L 44 22" fill="#2a1a2e" opacity="0.5" />
      <path d="M 59 20 L 61 14 L 56 22" fill="#2a1a2e" opacity="0.5" />
      {/* Cat eyes - almond shaped, glowing */}
      <ellipse cx="46" cy="30" rx="2.5" ry="1.5" fill={elemColor} opacity="0.8" />
      <ellipse cx="54" cy="30" rx="2.5" ry="1.5" fill={elemColor} opacity="0.8" />
      {/* Slit pupils */}
      <ellipse cx="46" cy="30" rx="0.6" ry="1.5" fill="#000" opacity="0.7" />
      <ellipse cx="54" cy="30" rx="0.6" ry="1.5" fill="#000" opacity="0.7" />
      {/* Small nose and whisker lines */}
      <path d="M 49 34 L 50 35 L 51 34" fill="#2a2a3e" />
      <path d="M 42 34 L 36 32" stroke="#2a2a3e" strokeWidth="0.4" opacity="0.4" />
      <path d="M 42 35 L 36 36" stroke="#2a2a3e" strokeWidth="0.4" opacity="0.4" />
      <path d="M 58 34 L 64 32" stroke="#2a2a3e" strokeWidth="0.4" opacity="0.4" />
      <path d="M 58 35 L 64 36" stroke="#2a2a3e" strokeWidth="0.4" opacity="0.4" />
      {/* Left arm - claws extended */}
      <path
        d="M 40 44 L 32 40 L 26 36 L 28 34 L 34 38 L 42 42 Z"
        fill="#1a1a2e"
      />
      {/* Claws */}
      <path d="M 26 36 L 22 32" stroke={elemColor} strokeWidth="0.8" opacity="0.6" />
      <path d="M 26 36 L 22 35" stroke={elemColor} strokeWidth="0.8" opacity="0.6" />
      <path d="M 26 36 L 24 38" stroke={elemColor} strokeWidth="0.8" opacity="0.6" />
      {/* Right arm holding sistrum */}
      <path
        d="M 60 44 L 68 38 L 72 30 L 70 28 L 66 36 L 58 42 Z"
        fill="#1a1a2e"
      />
      {/* Sistrum (rattle) */}
      <line x1="72" y1="14" x2="72" y2="32" stroke={`url(#sistrum-${uid})`} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="72" cy="12" rx="4" ry="6" fill="none" stroke={`url(#sistrum-${uid})`} strokeWidth="1.2" />
      {/* Sistrum crossbars */}
      <line x1="69" y1="10" x2="75" y2="10" stroke="#B8860B" strokeWidth="0.6" />
      <line x1="69" y1="12" x2="75" y2="12" stroke="#B8860B" strokeWidth="0.6" />
      <line x1="69" y1="14" x2="75" y2="14" stroke="#B8860B" strokeWidth="0.6" />
      {elementParticles('Moon', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function isisPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`magic-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={elemColor} stopOpacity="0.6" />
          <stop offset="60%" stopColor={elemColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`wing-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4DD0E1" />
          <stop offset="50%" stopColor="#1a1a3e" />
          <stop offset="100%" stopColor="#0e0e2a" />
        </linearGradient>
      </defs>
      {/* Wings spread wide */}
      <path
        d="M 36 44 L 24 36 L 14 30 L 10 34 L 8 42 L 12 50 L 18 56 L 26 58 L 34 54 Z"
        fill={`url(#wing-${uid})`} opacity="0.7"
      />
      <path
        d="M 64 44 L 76 36 L 86 30 L 90 34 L 92 42 L 88 50 L 82 56 L 74 58 L 66 54 Z"
        fill={`url(#wing-${uid})`} opacity="0.7"
      />
      {/* Wing feather details */}
      <path d="M 14 30 L 18 38 M 10 34 L 16 42 M 8 42 L 16 48" stroke={elemColor} strokeWidth="0.4" opacity="0.3" />
      <path d="M 86 30 L 82 38 M 90 34 L 84 42 M 92 42 L 84 48" stroke={elemColor} strokeWidth="0.4" opacity="0.3" />
      {/* Flowing robes */}
      <path
        d="M 38 44 L 34 50 L 32 66 L 34 80 L 42 86 L 50 88 L 58 86 L 66 80 L 68 66 L 66 50 L 62 44 L 56 42 L 44 42 Z"
        fill="#1a1a2e"
      />
      {/* Robe draping */}
      <path d="M 40 50 Q 42 68 40 82" stroke="#2a2a3e" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 60 50 Q 58 68 60 82" stroke="#2a2a3e" strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Egyptian collar */}
      <path
        d="M 38 44 Q 44 42 50 41 Q 56 42 62 44 L 60 48 Q 55 46 50 45 Q 45 46 40 48 Z"
        fill="#4DD0E1" opacity="0.4"
      />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="8" ry="9" fill="#1a1a2e" />
      {/* Flowing hair */}
      <path d="M 42 28 Q 38 34 36 40" stroke="#2a2a3e" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 58 28 Q 62 34 64 40" stroke="#2a2a3e" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Throne headdress */}
      <rect x="46" y="16" width="8" height="8" fill="#2a2a3e" />
      <rect x="47" y="14" width="6" height="4" fill="#1a1a2e" />
      <path d="M 47 14 L 50 10 L 53 14" fill="#2a2a3e" />
      <rect x="48" y="18" width="4" height="4" fill="none" stroke={elemColor} strokeWidth="0.5" opacity="0.5" />
      {/* Eyes */}
      <circle cx="46" cy="30" r="1.2" fill={elemColor} opacity="0.7" />
      <circle cx="54" cy="30" r="1.2" fill={elemColor} opacity="0.7" />
      {/* Magical orb between hands */}
      <circle cx="50" cy="68" r="6" fill={`url(#magic-${uid})`} filter={`url(#glow-${uid})`} />
      <circle cx="50" cy="68" r="3" fill={elemColor} opacity="0.3" />
      <circle cx="50" cy="68" r="1.5" fill={elemColor} opacity="0.5" />
      {/* Ankh floating in orb */}
      <ellipse cx="50" cy="66" rx="1.5" ry="2" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
      <line x1="48.5" y1="68.5" x2="51.5" y2="68.5" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
      <line x1="50" y1="68.5" x2="50" y2="72" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
      {elementParticles('Ocean', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function setPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`setstaff-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B0000" />
          <stop offset="100%" stopColor="#4A0000" />
        </linearGradient>
        <radialGradient id={`chaos-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={elemColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Swirling chaos/sand effects behind */}
      <circle cx="50" cy="50" r="40" fill={`url(#chaos-${uid})`} />
      <path d="M 18 70 Q 24 60 20 50 Q 16 40 22 32" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M 82 68 Q 76 58 80 48 Q 84 38 78 30" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M 30 80 Q 38 72 34 62" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.15" />
      <path d="M 70 82 Q 62 74 66 64" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.15" />
      {/* Sand particles */}
      <circle cx="20" cy="44" r="0.8" fill={elemColor} opacity="0.3" />
      <circle cx="80" cy="40" r="0.6" fill={elemColor} opacity="0.25" />
      <circle cx="16" cy="58" r="0.5" fill={elemColor} opacity="0.2" />
      <circle cx="84" cy="56" r="0.7" fill={elemColor} opacity="0.2" />
      {/* Muscular body - aggressive stance */}
      <path
        d="M 34 44 L 26 48 L 22 62 L 26 78 L 36 84 L 50 88 L 64 84 L 74 78 L 78 62 L 74 48 L 66 44 L 58 40 L 42 40 Z"
        fill="#1a1a2e"
      />
      {/* Chest muscle detail */}
      <path d="M 44 48 L 50 46 L 56 48 L 54 56 L 50 58 L 46 56 Z" fill="#2a2a3e" opacity="0.4" />
      {/* Set animal head - square ears, curved snout */}
      <path
        d="M 42 36 Q 42 24 50 20 Q 58 24 58 36 Q 56 38 50 40 Q 44 38 42 36 Z"
        fill="#1a1a2e"
      />
      {/* Distinctive tall square-tipped ears */}
      <path d="M 42 26 L 36 8 L 38 8 L 44 22 Z" fill="#1a1a2e" />
      <path d="M 58 26 L 64 8 L 62 8 L 56 22 Z" fill="#1a1a2e" />
      {/* Square ear tips */}
      <rect x="35" y="6" width="4" height="3" rx="0.5" fill="#1a1a2e" />
      <rect x="62" y="6" width="4" height="3" rx="0.5" fill="#1a1a2e" />
      {/* Curved snout - longer and distinctive */}
      <path
        d="M 46 32 L 44 36 Q 42 42 44 44 L 48 42 L 50 40 L 52 42 L 56 44 Q 58 42 56 36 L 54 32"
        fill="#12122a"
      />
      <path d="M 44 44 Q 48 46 50 44 Q 52 46 56 44" stroke="#2a2a3e" strokeWidth="0.5" fill="none" />
      {/* Eyes - fierce, red tinted */}
      <circle cx="46" cy="28" r="1.8" fill={elemColor} opacity="0.9" />
      <circle cx="54" cy="28" r="1.8" fill={elemColor} opacity="0.9" />
      {/* Right arm raised with was scepter */}
      <path
        d="M 64 44 L 72 34 L 76 24 L 74 22 L 70 32 L 62 42 Z"
        fill="#1a1a2e"
      />
      {/* Was scepter with forked end */}
      <line x1="76" y1="10" x2="76" y2="44" stroke={`url(#setstaff-${uid})`} strokeWidth="2.5" strokeLinecap="round" />
      {/* Was scepter animal head */}
      <path d="M 74 10 Q 72 6 74 4 L 76 2 L 78 4 Q 80 6 78 10" fill="#4A0000" />
      <path d="M 72 6 L 70 4" stroke="#4A0000" strokeWidth="1" strokeLinecap="round" />
      {/* Forked bottom */}
      <path d="M 74 44 L 76 50 L 78 44" stroke="#4A0000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Left arm clenched */}
      <path
        d="M 34 44 L 26 50 L 22 56 L 25 58 L 28 52 L 36 46 Z"
        fill="#1a1a2e"
      />
      {elementParticles('Storm', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function sobekPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`spear-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="100%" stopColor="#757575" />
        </linearGradient>
      </defs>
      {/* Muscular body - armored warrior */}
      <path
        d="M 34 44 L 26 48 L 22 62 L 26 78 L 36 86 L 50 88 L 64 86 L 74 78 L 78 62 L 74 48 L 66 44 L 58 40 L 42 40 Z"
        fill="#1a1a2e"
      />
      {/* Egyptian armor - scale pattern hints */}
      <path d="M 40 50 Q 45 48 50 50 Q 55 48 60 50" stroke="#2a3a2e" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 38 54 Q 44 52 50 54 Q 56 52 62 54" stroke="#2a3a2e" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 36 58 Q 43 56 50 58 Q 57 56 64 58" stroke="#2a3a2e" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 38 62 Q 44 60 50 62 Q 56 60 62 62" stroke="#2a3a2e" strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Chest plate */}
      <path
        d="M 42 46 L 50 44 L 58 46 L 56 54 L 50 56 L 44 54 Z"
        fill="#2a3a2e" opacity="0.5"
      />
      {/* Egyptian collar */}
      <path
        d="M 38 44 Q 44 42 50 41 Q 56 42 62 44 L 60 48 Q 55 46 50 45 Q 45 46 40 48 Z"
        fill="#FFD700" opacity="0.4"
      />
      {/* Crocodile head - long snout, open jaws */}
      <path
        d="M 42 34 Q 42 24 50 20 Q 58 24 58 34 Q 56 36 50 38 Q 44 36 42 34 Z"
        fill="#1a2a1e"
      />
      {/* Long snout / upper jaw */}
      <path
        d="M 44 30 L 40 34 L 36 40 L 34 42 L 40 42 L 50 38 L 60 42 L 66 42 L 64 40 L 60 34 L 56 30"
        fill="#1a2a1e"
      />
      {/* Open jaw - lower */}
      <path
        d="M 36 42 L 34 44 L 38 46 L 50 44 L 62 46 L 66 44 L 64 42"
        fill="#12201a"
      />
      {/* Teeth */}
      <path d="M 36 42 L 38 44 L 40 42 L 42 44 L 44 42 L 46 44 L 48 42" stroke="#ddd" strokeWidth="0.5" fill="none" opacity="0.6" />
      <path d="M 52 42 L 54 44 L 56 42 L 58 44 L 60 42 L 62 44 L 64 42" stroke="#ddd" strokeWidth="0.5" fill="none" opacity="0.6" />
      {/* Crocodile eyes - menacing */}
      <circle cx="46" cy="26" r="2" fill="#8B0000" opacity="0.8" />
      <circle cx="54" cy="26" r="2" fill="#8B0000" opacity="0.8" />
      <circle cx="46" cy="26" r="0.8" fill="#000" opacity="0.6" />
      <circle cx="54" cy="26" r="0.8" fill="#000" opacity="0.6" />
      {/* Bumpy texture on head */}
      <circle cx="44" cy="22" r="0.8" fill="#2a3a2e" opacity="0.4" />
      <circle cx="50" cy="20" r="0.8" fill="#2a3a2e" opacity="0.4" />
      <circle cx="56" cy="22" r="0.8" fill="#2a3a2e" opacity="0.4" />
      {/* Right arm holding spear */}
      <path
        d="M 64 44 L 72 36 L 76 28 L 74 26 L 70 34 L 62 42 Z"
        fill="#1a1a2e"
      />
      {/* Spear */}
      <line x1="76" y1="8" x2="76" y2="48" stroke={`url(#spear-${uid})`} strokeWidth="2" strokeLinecap="round" />
      {/* Spear head */}
      <path d="M 74 8 L 76 2 L 78 8 Z" fill="#E0E0E0" />
      <path d="M 76 3 L 76 10" stroke="#BDBDBD" strokeWidth="0.3" opacity="0.5" />
      {/* Left arm with fist */}
      <path
        d="M 34 44 L 26 50 L 22 58 L 25 60 L 28 52 L 36 46 Z"
        fill="#1a1a2e"
      />
      {elementParticles('Ocean', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function thothPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`scroll-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D4C5A0" />
          <stop offset="50%" stopColor="#F5E6C8" />
          <stop offset="100%" stopColor="#D4C5A0" />
        </linearGradient>
        <radialGradient id={`moondisc-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="50%" stopColor={elemColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Moon disc above head */}
      <circle cx="50" cy="12" r="7" fill={`url(#moondisc-${uid})`} filter={`url(#glow-${uid})`} />
      <circle cx="50" cy="12" r="4" fill={elemColor} opacity="0.2" />
      {/* Robed body - scholarly, slightly hunched */}
      <path
        d="M 38 46 L 32 50 L 30 66 L 34 80 L 42 86 L 50 88 L 58 86 L 66 80 L 70 66 L 68 50 L 62 46 L 56 42 L 44 42 Z"
        fill="#1a1a2e"
      />
      {/* Robe folds */}
      <path d="M 40 52 Q 42 66 40 80" stroke="#2a2a3e" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 50 46 Q 50 66 50 84" stroke="#2a2a3e" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M 60 52 Q 58 66 60 80" stroke="#2a2a3e" strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Egyptian collar */}
      <path
        d="M 38 46 Q 44 43 50 42 Q 56 43 62 46 L 60 50 Q 55 48 50 47 Q 45 48 40 50 Z"
        fill="#9C27B0" opacity="0.35"
      />
      {/* Ibis head - long curved beak */}
      <path
        d="M 42 34 Q 42 24 50 20 Q 58 24 58 34 Q 56 36 50 38 Q 44 36 42 34 Z"
        fill="#1a1a2e"
      />
      {/* Long curved ibis beak */}
      <path
        d="M 48 32 Q 46 36 42 42 Q 40 46 38 48 Q 40 48 42 44 Q 44 40 46 36 L 50 34"
        fill="#2a2a3e" stroke="#3a3a4e" strokeWidth="0.5"
      />
      <path d="M 50 34 L 52 32" stroke="#2a2a3e" strokeWidth="1" />
      {/* Eyes - wise */}
      <circle cx="46" cy="28" r="1.5" fill={elemColor} opacity="0.7" />
      <circle cx="54" cy="28" r="1.5" fill={elemColor} opacity="0.7" />
      {/* Left arm - hunched over, holding scroll */}
      <path
        d="M 38 46 L 30 52 L 26 58 L 29 60 L 32 54 L 40 48 Z"
        fill="#1a1a2e"
      />
      {/* Scroll - unrolled */}
      <rect x="18" y="52" width="18" height="14" rx="1" fill={`url(#scroll-${uid})`} opacity="0.8" />
      {/* Scroll roll ends */}
      <ellipse cx="18" cy="59" rx="1.5" ry="7" fill="#C4B590" opacity="0.7" />
      <ellipse cx="36" cy="59" rx="1.5" ry="7" fill="#C4B590" opacity="0.7" />
      {/* Hieroglyphic text lines on scroll */}
      <line x1="21" y1="55" x2="33" y2="55" stroke="#8B7355" strokeWidth="0.4" opacity="0.5" />
      <line x1="21" y1="57" x2="33" y2="57" stroke="#8B7355" strokeWidth="0.4" opacity="0.5" />
      <line x1="21" y1="59" x2="33" y2="59" stroke="#8B7355" strokeWidth="0.4" opacity="0.5" />
      <line x1="21" y1="61" x2="33" y2="61" stroke="#8B7355" strokeWidth="0.4" opacity="0.5" />
      <line x1="21" y1="63" x2="30" y2="63" stroke="#8B7355" strokeWidth="0.4" opacity="0.5" />
      {/* Right arm holding reed pen */}
      <path
        d="M 62 46 L 68 42 L 72 36 L 70 34 L 66 40 L 60 44 Z"
        fill="#1a1a2e"
      />
      {/* Reed pen / stylus */}
      <line x1="70" y1="28" x2="74" y2="42" stroke="#8B6914" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 70 28 L 69 26 L 71 26 Z" fill="#8B6914" />
      {/* Ink glow at pen tip */}
      <circle cx="70" cy="27" r="1.5" fill={elemColor} opacity="0.4" />
      {elementParticles('Moon', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

// ─── CELTIC HERO PORTRAITS ──────────────────────────────────────────────────

function morganLeFayPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`orb-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor={elemColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Flowing dark robes - wide and misty */}
      <path
        d="M 28 50 Q 22 60 20 78 Q 30 82 40 84 L 50 86 L 60 84 Q 70 82 80 78 Q 78 60 72 50 Q 65 44 58 42 L 50 40 L 42 42 Q 35 44 28 50 Z"
        fill="#0d0d1a"
      />
      {/* Robe mist effects at hem */}
      <path d="M 22 76 Q 28 72 34 76 Q 40 80 46 76" stroke="#81C784" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M 54 76 Q 60 80 66 76 Q 72 72 78 76" stroke="#81C784" strokeWidth="0.6" fill="none" opacity="0.25" />
      {/* Hood */}
      <path
        d="M 38 38 Q 36 28 40 22 Q 44 16 50 14 Q 56 16 60 22 Q 64 28 62 38 L 58 42 L 42 42 Z"
        fill="#0d0d1a"
      />
      {/* Face shadow under hood */}
      <ellipse cx="50" cy="32" rx="7" ry="8" fill="#1a1a2e" />
      {/* Glowing eyes */}
      <circle cx="47" cy="30" r="1" fill={elemColor} opacity="0.7" />
      <circle cx="53" cy="30" r="1" fill={elemColor} opacity="0.7" />
      {/* Raised arms with orbs */}
      <path
        d="M 38 44 L 30 36 L 26 28 L 28 26 L 32 34 L 40 42 Z"
        fill="#0d0d1a"
      />
      <path
        d="M 62 44 L 70 36 L 74 28 L 72 26 L 68 34 L 60 42 Z"
        fill="#0d0d1a"
      />
      {/* Left orb */}
      <circle cx="26" cy="26" r="5" fill={`url(#orb-${uid})`} filter={`url(#glow-${uid})`} />
      <circle cx="26" cy="26" r="3" fill={elemColor} opacity="0.3" style={{ animation: 'svgGlowPulse 2s ease-in-out infinite' }} />
      {/* Right orb */}
      <circle cx="74" cy="26" r="5" fill={`url(#orb-${uid})`} filter={`url(#glow-${uid})`} />
      <circle cx="74" cy="26" r="3" fill={elemColor} opacity="0.3" style={{ animation: 'svgGlowPulse 2s ease-in-out infinite 0.5s' }} />
      {/* Crescent moon behind hood */}
      <path
        d="M 44 10 Q 40 6 44 2 Q 50 4 54 2 Q 58 6 54 10"
        stroke={elemColor} strokeWidth="1.5" fill="none" opacity="0.6"
      />
      <circle cx="49" cy="4" r="1" fill={elemColor} opacity="0.5" />
      {elementParticles('Moon', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function merlinPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`crystal-${uid}`} cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor={elemColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Starry robe - long flowing */}
      <path
        d="M 32 46 Q 26 56 24 72 Q 28 80 38 84 L 50 86 L 62 84 Q 72 80 76 72 Q 74 56 68 46 Q 62 42 56 40 L 50 38 L 44 40 Q 38 42 32 46 Z"
        fill="#0d0d2a"
      />
      {/* Robe star details */}
      <circle cx="36" cy="60" r="0.8" fill={elemColor} opacity="0.4" />
      <circle cx="42" cy="72" r="0.6" fill={elemColor} opacity="0.3" />
      <circle cx="58" cy="65" r="0.7" fill={elemColor} opacity="0.35" />
      <circle cx="64" cy="74" r="0.5" fill={elemColor} opacity="0.3" />
      <circle cx="48" cy="68" r="0.6" fill={elemColor} opacity="0.25" />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="8" ry="9" fill="#1a1a2e" />
      {/* Pointed wizard hat */}
      <path
        d="M 40 28 L 42 18 L 50 4 L 58 18 L 60 28 L 56 30 L 44 30 Z"
        fill="#0d0d2a"
      />
      {/* Hat brim */}
      <path d="M 38 28 Q 44 32 50 30 Q 56 32 62 28" stroke="#2a2a4a" strokeWidth="1.5" fill="none" />
      {/* Hat star accent */}
      <circle cx="52" cy="14" r="1" fill={elemColor} opacity="0.5" />
      {/* Long beard */}
      <path
        d="M 44 36 Q 42 44 44 54 Q 46 58 50 60 Q 54 58 56 54 Q 58 44 56 36 Q 54 40 50 42 Q 46 40 44 36 Z"
        fill="#2a2a3e"
      />
      {/* Staff in left hand */}
      <path
        d="M 38 42 L 30 48 L 26 54 L 28 56 L 32 50 L 38 44 Z"
        fill="#0d0d2a"
      />
      <line x1="24" y1="10" x2="24" y2="72" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" />
      {/* Crystal orb at staff top */}
      <circle cx="24" cy="10" r="5" fill={`url(#crystal-${uid})`} filter={`url(#glow-${uid})`} />
      <circle cx="24" cy="10" r="3" fill={elemColor} opacity="0.4" style={{ animation: 'svgGlowPulse 3s ease-in-out infinite' }} />
      {elementParticles('Sun', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function nimuePortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`excalibur-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E0E0E0" />
          <stop offset="100%" stopColor="#90CAF9" />
        </linearGradient>
      </defs>
      {/* Water surface at waist */}
      <path
        d="M 16 56 Q 24 52 32 56 Q 40 60 50 56 Q 60 52 68 56 Q 76 60 84 56 L 84 90 L 16 90 Z"
        fill="#1a3a5e" opacity="0.5"
      />
      <path
        d="M 16 58 Q 26 54 36 58 Q 46 62 56 58 Q 66 54 76 58 Q 84 62 84 58"
        stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.4"
      />
      {/* Upper body emerging from water */}
      <path
        d="M 40 56 L 36 48 L 38 42 L 44 38 L 50 36 L 56 38 L 62 42 L 64 48 L 60 56 Z"
        fill="#1a2a3e"
      />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="7" ry="8" fill="#1a2a3e" />
      {/* Long flowing hair */}
      <path
        d="M 42 26 Q 36 30 32 42 Q 34 40 38 36 Z"
        fill="#1a3a4e" opacity="0.7"
      />
      <path
        d="M 58 26 Q 64 30 68 42 Q 66 40 62 36 Z"
        fill="#1a3a4e" opacity="0.7"
      />
      <path d="M 40 28 Q 34 34 30 46" stroke="#1a3a4e" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 60 28 Q 66 34 70 46" stroke="#1a3a4e" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Raised arm holding Excalibur */}
      <path
        d="M 56 38 L 60 32 L 62 24 L 60 22 L 58 30 L 54 36 Z"
        fill="#1a2a3e"
      />
      {/* Excalibur blade */}
      <path d="M 60 6 L 62 10 L 62 24 L 60 24 Z" fill={`url(#excalibur-${uid})`} filter={`url(#glow-${uid})`} />
      <path d="M 59 6 L 61 2 L 63 6 Z" fill="#FFFFFF" opacity="0.8" />
      {/* Sword crossguard */}
      <rect x="57" y="24" width="8" height="2" rx="1" fill="#FFD700" opacity="0.7" />
      {/* Water droplets around */}
      <circle cx="30" cy="48" r="1.2" fill={elemColor} opacity="0.5" />
      <circle cx="72" cy="50" r="1" fill={elemColor} opacity="0.4" />
      <circle cx="24" cy="44" r="0.8" fill={elemColor} opacity="0.35" />
      <circle cx="76" cy="44" r="0.8" fill={elemColor} opacity="0.3" />
      {/* Mist wisps */}
      <path d="M 20 52 Q 26 48 32 52" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M 68 50 Q 74 46 80 50" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.25" />
      {elementParticles('Ocean', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function cuChulainnPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`gaeBolg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF4444" />
          <stop offset="50%" stopColor="#CC0000" />
          <stop offset="100%" stopColor="#880000" />
        </linearGradient>
      </defs>
      {/* Hound silhouette behind */}
      <path
        d="M 14 70 Q 12 62 16 56 Q 18 52 22 54 Q 20 50 22 46 L 26 44 L 24 48 Q 26 50 28 52 L 24 56 Q 20 60 22 68 L 18 72 Z"
        fill="#1a1a2e" opacity="0.5"
      />
      {/* Hound ear */}
      <path d="M 22 46 L 20 40 L 26 44 Z" fill="#1a1a2e" opacity="0.4" />
      {/* Aggressive crouching body */}
      <path
        d="M 36 50 L 28 54 L 26 68 L 32 80 L 42 84 L 50 86 L 58 84 L 66 80 L 72 68 L 70 54 L 62 50 L 56 46 L 44 46 Z"
        fill="#1a1a2e"
      />
      {/* Head - forward lean */}
      <ellipse cx="52" cy="34" rx="8" ry="9" fill="#1a1a2e" />
      {/* Wild spiked hair - warp spasm */}
      <path d="M 46 28 L 42 16 L 48 24 Z" fill="#2a1a1a" />
      <path d="M 50 26 L 50 12 L 54 22 Z" fill="#2a1a1a" />
      <path d="M 54 28 L 58 14 L 56 24 Z" fill="#2a1a1a" />
      <path d="M 58 30 L 64 18 L 60 26 Z" fill="#2a1a1a" />
      <path d="M 44 30 L 38 20 L 46 26 Z" fill="#2a1a1a" />
      {/* Fierce eyes */}
      <circle cx="49" cy="32" r="1.2" fill={elemColor} opacity="0.8" />
      <circle cx="55" cy="32" r="1.2" fill={elemColor} opacity="0.8" />
      {/* Right arm thrusting spear forward */}
      <path
        d="M 62 50 L 70 42 L 76 36 L 74 34 L 68 40 L 60 48 Z"
        fill="#1a1a2e"
      />
      {/* Gae Bolg - barbed spear */}
      <line x1="74" y1="8" x2="74" y2="38" stroke={`url(#gaeBolg-${uid})`} strokeWidth="2" strokeLinecap="round" />
      {/* Barbed spear tip */}
      <path d="M 71 12 L 74 4 L 77 12 L 74 10 Z" fill="#CC0000" />
      {/* Barbs along spear */}
      <path d="M 72 16 L 70 14 M 76 18 L 78 16 M 72 22 L 70 20 M 76 24 L 78 22" stroke="#CC0000" strokeWidth="0.8" fill="none" />
      {/* Warp spasm distortion lines */}
      <path d="M 36 28 Q 32 32 34 38" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 64 26 Q 68 30 66 36" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 38 40 Q 34 44 36 48" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M 66 40 Q 70 44 68 50" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M 42 22 Q 38 18 40 14" stroke={elemColor} strokeWidth="0.5" fill="none" opacity="0.25" />
      {elementParticles('Storm', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function brigidPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`flame-${uid}`} cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#FFAB40" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Simple flowing robes */}
      <path
        d="M 36 46 Q 30 54 28 70 Q 32 78 40 82 L 50 84 L 60 82 Q 68 78 72 70 Q 70 54 64 46 Q 58 42 54 40 L 50 38 L 46 40 Q 42 42 36 46 Z"
        fill="#1a1a2e"
      />
      {/* Flower/spring details on robe */}
      <circle cx="38" cy="66" r="1.5" fill="#81C784" opacity="0.4" />
      <circle cx="62" cy="70" r="1.2" fill="#81C784" opacity="0.35" />
      <path d="M 44 74 Q 46 72 48 74" stroke="#81C784" strokeWidth="0.6" fill="none" opacity="0.3" />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="7" ry="8" fill="#1a1a2e" />
      {/* Gentle hair */}
      <path
        d="M 42 26 Q 40 22 44 18 Q 48 16 50 16 Q 52 16 56 18 Q 60 22 58 26"
        fill="#2a1a1a" opacity="0.7"
      />
      <path d="M 42 26 Q 38 32 36 42" stroke="#2a1a1a" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 58 26 Q 62 32 64 42" stroke="#2a1a1a" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Right arm raised, palm up */}
      <path
        d="M 60 44 L 66 38 L 70 32 L 72 32 L 70 36 L 64 42 Z"
        fill="#1a1a2e"
      />
      {/* Open palm */}
      <ellipse cx="72" cy="30" rx="3" ry="2.5" fill="#1a1a2e" />
      {/* Sacred flame hovering above palm */}
      <path
        d="M 72 18 Q 69 22 70 26 Q 71 28 72 28 Q 73 28 74 26 Q 75 22 72 18 Z"
        fill={`url(#flame-${uid})`} filter={`url(#glow-${uid})`}
      />
      <path
        d="M 72 20 Q 71 23 71.5 25 Q 72 26 72.5 25 Q 73 23 72 20 Z"
        fill="#FFFFFF" opacity="0.6"
      />
      {/* Warm glow effect around flame */}
      <circle cx="72" cy="24" r="8" fill={elemColor} opacity="0.1" style={{ animation: 'svgGlowPulse 2.5s ease-in-out infinite' }} />
      {elementParticles('Sun', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function dianCechtPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`silver-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="50%" stopColor="#B0B0B0" />
          <stop offset="100%" stopColor="#808080" />
        </linearGradient>
      </defs>
      {/* Healer robes */}
      <path
        d="M 36 46 Q 30 54 28 70 Q 32 78 40 82 L 50 84 L 60 82 Q 68 78 72 70 Q 70 54 64 46 Q 58 42 54 40 L 50 38 L 46 40 Q 42 42 36 46 Z"
        fill="#1a2a1a"
      />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="8" ry="9" fill="#1a1a2e" />
      {/* Wise face, short beard */}
      <path
        d="M 44 36 Q 46 40 50 42 Q 54 40 56 36 Q 54 38 50 39 Q 46 38 44 36 Z"
        fill="#2a2a3e"
      />
      {/* Hair */}
      <path d="M 42 26 Q 44 20 50 18 Q 56 20 58 26" fill="#2a2a3e" opacity="0.6" />
      {/* Left arm - silver hand */}
      <path
        d="M 38 44 L 30 50 L 26 56 L 28 58 L 32 52 L 38 46 Z"
        fill="#1a2a1a"
      />
      {/* Silver metallic hand */}
      <ellipse cx="26" cy="58" rx="4" ry="3" fill={`url(#silver-${uid})`} />
      <path d="M 23 56 L 22 53 M 25 55 L 24 52 M 27 55 L 27 52 M 29 56 L 30 53" stroke="#C0C0C0" strokeWidth="0.8" fill="none" opacity="0.7" />
      {/* Metallic sheen on silver hand */}
      <ellipse cx="25" cy="57" rx="2" ry="1.5" fill="#FFFFFF" opacity="0.15" />
      {/* Right arm carrying herbs/bag */}
      <path
        d="M 62 44 L 68 50 L 72 56 L 70 58 L 66 52 L 60 46 Z"
        fill="#1a2a1a"
      />
      {/* Herb bag */}
      <path
        d="M 68 56 Q 72 54 76 58 Q 76 64 72 66 Q 68 64 68 56 Z"
        fill="#2a3a1a" opacity="0.7"
      />
      {/* Herbs poking out */}
      <path d="M 70 54 L 68 48 M 72 54 L 74 48 M 74 56 L 78 50" stroke="#81C784" strokeWidth="0.8" fill="none" opacity="0.6" />
      {/* Well of healing at feet */}
      <ellipse cx="50" cy="82" rx="12" ry="4" fill={elemColor} opacity="0.15" />
      <ellipse cx="50" cy="82" rx="8" ry="2.5" fill="none" stroke={elemColor} strokeWidth="0.6" opacity="0.3" style={{ animation: 'svgGlowPulse 3s ease-in-out infinite' }} />
      {elementParticles('Ocean', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

// ─── JAPANESE HERO PORTRAITS ────────────────────────────────────────────────

function amaterasuPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`sunburst-${uid}`} cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="30%" stopColor="#FFD700" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF9800" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Massive sun rays behind */}
      <circle cx="50" cy="28" r="22" fill={`url(#sunburst-${uid})`} />
      {/* Sun ray lines */}
      <line x1="50" y1="6" x2="50" y2="12" stroke="#FFD700" strokeWidth="1" opacity="0.4" />
      <line x1="62" y1="10" x2="58" y2="16" stroke="#FFD700" strokeWidth="1" opacity="0.35" />
      <line x1="70" y1="20" x2="64" y2="22" stroke="#FFD700" strokeWidth="1" opacity="0.3" />
      <line x1="38" y1="10" x2="42" y2="16" stroke="#FFD700" strokeWidth="1" opacity="0.35" />
      <line x1="30" y1="20" x2="36" y2="22" stroke="#FFD700" strokeWidth="1" opacity="0.3" />
      {/* Elegant kimono body */}
      <path
        d="M 36 44 Q 30 54 28 70 Q 32 78 40 84 L 50 86 L 60 84 Q 68 78 72 70 Q 70 54 64 44 Q 58 40 54 38 L 50 36 L 46 38 Q 42 40 36 44 Z"
        fill="#1a0a00"
      />
      {/* Kimono collar V */}
      <path d="M 44 40 L 50 52 L 56 40" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* Kimono sash (obi) */}
      <rect x="38" y="58" width="24" height="5" rx="2" fill="#8B0000" opacity="0.6" />
      {/* Flowing kimono sleeves */}
      <path d="M 36 44 Q 28 48 22 56 Q 24 60 30 58 Q 32 54 36 50 Z" fill="#1a0a00" opacity="0.8" />
      <path d="M 64 44 Q 72 48 78 56 Q 76 60 70 58 Q 68 54 64 50 Z" fill="#1a0a00" opacity="0.8" />
      {/* Head */}
      <ellipse cx="50" cy="28" rx="7" ry="8" fill="#1a1a2e" />
      {/* Elegant hair up-do */}
      <path
        d="M 42 24 Q 40 18 44 14 Q 48 12 50 12 Q 52 12 56 14 Q 60 18 58 24"
        fill="#0d0d1a"
      />
      {/* Hair ornaments */}
      <circle cx="44" cy="16" r="1" fill="#FFD700" opacity="0.6" />
      <circle cx="56" cy="16" r="1" fill="#FFD700" opacity="0.6" />
      {/* Holding ornate mirror (Yata no Kagami) */}
      <path
        d="M 36 44 L 28 48 L 24 44 L 26 42 L 30 46 L 36 42 Z"
        fill="#1a0a00"
      />
      <ellipse cx="22" cy="42" rx="6" ry="7" fill="none" stroke="#FFD700" strokeWidth="1.2" opacity="0.7" />
      <ellipse cx="22" cy="42" rx="4" ry="5" fill="#FFFFFF" opacity="0.15" />
      <circle cx="21" cy="40" r="2" fill="#FFFFFF" opacity="0.1" />
      {/* Mirror handle */}
      <line x1="22" y1="49" x2="22" y2="56" stroke="#FFD700" strokeWidth="1.5" opacity="0.6" />
      {/* Divine light particles */}
      <circle cx="16" cy="30" r="1" fill="#FFD700" opacity="0.4" style={{ animation: 'svgGlowPulse 2s ease-in-out infinite' }} />
      <circle cx="84" cy="26" r="0.8" fill="#FFD700" opacity="0.35" />
      {elementParticles('Sun', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function susanooPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`kusanagi-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#81D4FA" />
          <stop offset="100%" stopColor="#0288D1" />
        </linearGradient>
      </defs>
      {/* Storm clouds behind */}
      <path d="M 12 18 Q 20 12 28 18 Q 34 14 40 18" stroke={elemColor} strokeWidth="1.2" fill="none" opacity="0.25" />
      <path d="M 60 14 Q 68 8 76 14 Q 82 10 88 14" stroke={elemColor} strokeWidth="1.2" fill="none" opacity="0.2" />
      {/* Wind swirl effects */}
      <path d="M 14 40 Q 18 36 24 38" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M 78 36 Q 82 32 86 34" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.25" />
      {/* Powerful warrior body - aggressive forward lean */}
      <path
        d="M 34 48 L 26 52 L 24 68 L 30 80 L 40 86 L 52 88 L 62 86 L 70 80 L 74 68 L 72 52 L 64 48 L 56 44 L 44 44 Z"
        fill="#1a1a2e"
      />
      {/* Japanese armor shoulder pads */}
      <path d="M 34 48 L 28 44 L 26 48 L 32 52 Z" fill="#2a2a3e" opacity="0.7" />
      <path d="M 64 48 L 70 44 L 72 48 L 66 52 Z" fill="#2a2a3e" opacity="0.7" />
      {/* Armor chest plate */}
      <path d="M 42 50 L 50 48 L 58 50 L 56 60 L 50 62 L 44 60 Z" fill="#2a2a4a" opacity="0.5" />
      {/* Head */}
      <ellipse cx="50" cy="32" rx="8" ry="9" fill="#1a1a2e" />
      {/* Fierce samurai hair/topknot */}
      <path d="M 42 28 Q 44 20 50 18 Q 56 20 58 28" fill="#0d0d1a" />
      <path d="M 50 18 Q 52 12 56 10 Q 58 12 56 16" fill="#0d0d1a" opacity="0.8" />
      {/* Fierce eyes */}
      <line x1="45" y1="30" x2="49" y2="31" stroke={elemColor} strokeWidth="1" opacity="0.7" />
      <line x1="51" y1="31" x2="55" y2="30" stroke={elemColor} strokeWidth="1" opacity="0.7" />
      {/* Right arm wielding Kusanagi */}
      <path
        d="M 62 46 L 70 38 L 76 28 L 74 26 L 68 36 L 60 44 Z"
        fill="#1a1a2e"
      />
      {/* Kusanagi katana blade */}
      <path d="M 74 8 L 76 12 L 76 28 L 74 28 Z" fill={`url(#kusanagi-${uid})`} filter={`url(#glow-${uid})`} />
      <path d="M 73 8 L 75 4 L 77 8 Z" fill="#FFFFFF" opacity="0.7" />
      {/* Katana tsuba (guard) */}
      <ellipse cx="75" cy="30" rx="3" ry="1.5" fill="#FFD700" opacity="0.6" />
      {/* Katana handle */}
      <line x1="75" y1="30" x2="75" y2="38" stroke="#2a1a00" strokeWidth="2" strokeLinecap="round" />
      {elementParticles('Ocean', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function raijinPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`drum-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B4513" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4a2500" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      {/* Ring of drums behind - arc arrangement */}
      <ellipse cx="20" cy="30" rx="6" ry="6" fill={`url(#drum-${uid})`} stroke="#A0522D" strokeWidth="0.8" />
      <ellipse cx="80" cy="30" rx="6" ry="6" fill={`url(#drum-${uid})`} stroke="#A0522D" strokeWidth="0.8" />
      <ellipse cx="14" cy="50" rx="5" ry="5" fill={`url(#drum-${uid})`} stroke="#A0522D" strokeWidth="0.8" />
      <ellipse cx="86" cy="50" rx="5" ry="5" fill={`url(#drum-${uid})`} stroke="#A0522D" strokeWidth="0.8" />
      <ellipse cx="22" cy="68" rx="5" ry="5" fill={`url(#drum-${uid})`} stroke="#A0522D" strokeWidth="0.8" />
      <ellipse cx="78" cy="68" rx="5" ry="5" fill={`url(#drum-${uid})`} stroke="#A0522D" strokeWidth="0.8" />
      {/* Lightning between drums */}
      <path d="M 26 30 L 30 34 L 28 34 L 34 40" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 74 30 L 70 34 L 72 34 L 66 40" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 27 68 L 32 64 L 30 64 L 36 58" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.4" />
      <path d="M 73 68 L 68 64 L 70 64 L 64 58" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.4" />
      {/* Muscular oni body */}
      <path
        d="M 36 48 L 30 52 L 28 66 L 34 80 L 42 84 L 50 86 L 58 84 L 66 80 L 72 66 L 70 52 L 64 48 L 56 44 L 44 44 Z"
        fill="#1a1a2e"
      />
      {/* Muscular chest detail */}
      <path d="M 44 52 L 50 50 L 56 52 L 54 58 L 50 60 L 46 58 Z" fill="#2a2a3e" opacity="0.4" />
      {/* Oni head */}
      <ellipse cx="50" cy="32" rx="9" ry="10" fill="#1a1a2e" />
      {/* Oni horns */}
      <path d="M 42 26 L 36 14 L 40 22 Z" fill="#8B0000" opacity="0.7" />
      <path d="M 58 26 L 64 14 L 60 22 Z" fill="#8B0000" opacity="0.7" />
      {/* Fierce oni face */}
      <circle cx="46" cy="30" r="1.5" fill={elemColor} opacity="0.7" />
      <circle cx="54" cy="30" r="1.5" fill={elemColor} opacity="0.7" />
      {/* Oni fangs/mouth */}
      <path d="M 46 36 L 48 38 L 50 36 L 52 38 L 54 36" stroke="#8B0000" strokeWidth="0.8" fill="none" opacity="0.6" />
      {/* Arms raised with drumsticks */}
      <path d="M 36 48 L 28 40 L 24 34 L 26 32 L 30 38 L 38 46 Z" fill="#1a1a2e" />
      <path d="M 64 48 L 72 40 L 76 34 L 74 32 L 70 38 L 62 46 Z" fill="#1a1a2e" />
      {/* Drumsticks */}
      <line x1="22" y1="28" x2="26" y2="34" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" />
      <line x1="78" y1="28" x2="74" y2="34" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" />
      {/* Drumstick tips */}
      <circle cx="22" cy="28" r="1.5" fill="#A0522D" />
      <circle cx="78" cy="28" r="1.5" fill="#A0522D" />
      {elementParticles('Storm', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function tsukuyomiPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`moonGlow-${uid}`} cx="50%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Moon glow backdrop */}
      <circle cx="50" cy="20" r="18" fill={`url(#moonGlow-${uid})`} />
      {/* Crescent moon halo/crown */}
      <path
        d="M 40 12 Q 38 4 44 2 Q 50 0 56 2 Q 62 4 60 12"
        stroke={elemColor} strokeWidth="1.5" fill="none" opacity="0.6"
      />
      <path
        d="M 42 10 Q 44 6 50 4 Q 56 6 58 10"
        fill={elemColor} opacity="0.15"
      />
      {/* Scattered stars */}
      <circle cx="20" cy="16" r="1" fill={elemColor} opacity="0.4" />
      <circle cx="78" cy="12" r="0.8" fill={elemColor} opacity="0.35" />
      <circle cx="16" cy="40" r="0.6" fill={elemColor} opacity="0.3" />
      <circle cx="84" cy="36" r="0.7" fill={elemColor} opacity="0.25" />
      <circle cx="24" cy="60" r="0.5" fill={elemColor} opacity="0.3" />
      <circle cx="76" cy="58" r="0.6" fill={elemColor} opacity="0.2" />
      <circle cx="30" cy="22" r="0.4" fill="#FFFFFF" opacity="0.3" />
      <circle cx="72" cy="20" r="0.5" fill="#FFFFFF" opacity="0.25" />
      {/* Flowing pale robes - serene */}
      <path
        d="M 36 44 Q 28 54 26 72 Q 30 80 40 84 L 50 86 L 60 84 Q 70 80 74 72 Q 72 54 64 44 Q 58 40 54 38 L 50 36 L 46 38 Q 42 40 36 44 Z"
        fill="#1a1a30"
      />
      {/* Robe flowing details */}
      <path d="M 34 60 Q 30 68 28 76" stroke="#2a2a4e" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 66 60 Q 70 68 72 76" stroke="#2a2a4e" strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Long flowing sleeves */}
      <path d="M 36 44 Q 26 50 20 60 Q 22 64 28 62 Q 30 58 36 52 Z" fill="#1a1a30" opacity="0.8" />
      <path d="M 64 44 Q 74 50 80 60 Q 78 64 72 62 Q 70 58 64 52 Z" fill="#1a1a30" opacity="0.8" />
      {/* Head */}
      <ellipse cx="50" cy="28" rx="7" ry="8" fill="#1a1a2e" />
      {/* Elegant hair */}
      <path d="M 42 24 Q 42 18 46 14 Q 50 12 54 14 Q 58 18 58 24" fill="#0d0d1a" />
      {/* Serene closed eyes */}
      <path d="M 45 27 Q 47 28 49 27" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M 51 27 Q 53 28 55 27" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.5" />
      {/* Hands in calm pose */}
      <path d="M 44 56 Q 46 60 50 62 Q 54 60 56 56" stroke="#1a1a30" strokeWidth="1" fill="none" opacity="0.5" />
      {elementParticles('Moon', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function izanamiPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`yomi-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a0000" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1a0000" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {/* Torii gate behind */}
      <line x1="22" y1="12" x2="22" y2="80" stroke="#8B0000" strokeWidth="2.5" opacity="0.5" />
      <line x1="78" y1="12" x2="78" y2="80" stroke="#8B0000" strokeWidth="2.5" opacity="0.5" />
      <path d="M 18 14 Q 50 8 82 14" stroke="#8B0000" strokeWidth="2.5" fill="none" opacity="0.5" />
      <line x1="20" y1="22" x2="80" y2="22" stroke="#8B0000" strokeWidth="1.5" opacity="0.4" />
      {/* Ghostly figure body - partially translucent */}
      <path
        d="M 38 44 Q 32 54 30 68 Q 34 76 42 80 L 50 82 L 58 80 Q 66 76 70 68 Q 68 54 62 44 Q 56 40 52 38 L 50 36 L 48 38 Q 44 40 38 44 Z"
        fill="#1a0a0a" opacity="0.8"
      />
      {/* Skeletal/ghostly lower body fade */}
      <path d="M 38 68 Q 40 74 44 78" stroke="#3a1a1a" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 62 68 Q 60 74 56 78" stroke="#3a1a1a" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 44 72 L 44 80 M 50 72 L 50 82 M 56 72 L 56 80" stroke="#3a1a1a" strokeWidth="0.5" fill="none" opacity="0.3" />
      {/* Head - half ghostly */}
      <ellipse cx="50" cy="30" rx="7" ry="8" fill="#1a0a0a" />
      {/* Half-skeletal face detail */}
      <circle cx="47" cy="28" r="1.2" fill={elemColor} opacity="0.6" />
      <circle cx="53" cy="28" r="1.2" fill={elemColor} opacity="0.6" />
      {/* Skeletal cheek on one side */}
      <path d="M 54 30 Q 56 32 56 35" stroke="#3a1a1a" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M 56 30 Q 58 32 57 34" stroke="#3a1a1a" strokeWidth="0.5" fill="none" opacity="0.4" />
      {/* Long disheveled hair */}
      <path d="M 42 26 Q 36 32 32 44" stroke="#1a0a0a" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M 58 26 Q 64 32 68 44" stroke="#1a0a0a" strokeWidth="2" fill="none" opacity="0.6" />
      {/* One hand reaching forward */}
      <path
        d="M 38 44 L 30 40 L 24 36 L 22 38 L 28 42 L 36 46 Z"
        fill="#1a0a0a"
      />
      {/* Bony reaching fingers */}
      <path d="M 22 38 L 18 36 M 22 36 L 18 33 M 24 36 L 20 32" stroke="#3a1a1a" strokeWidth="0.7" fill="none" opacity="0.5" />
      {/* Spiritual wisps/flames */}
      <path d="M 28 62 Q 26 56 28 52 Q 30 56 28 62 Z" fill={elemColor} opacity="0.2" />
      <path d="M 72 58 Q 70 52 72 48 Q 74 52 72 58 Z" fill={elemColor} opacity="0.15" />
      <path d="M 34 72 Q 32 66 34 62 Q 36 66 34 72 Z" fill={elemColor} opacity="0.15" />
      <circle cx="26" cy="54" r="1.5" fill={elemColor} opacity="0.2" style={{ animation: 'svgGlowPulse 3s ease-in-out infinite' }} />
      <circle cx="74" cy="50" r="1" fill={elemColor} opacity="0.15" style={{ animation: 'svgGlowPulse 3s ease-in-out infinite 1s' }} />
      {elementParticles('Underworld', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function benzaitenPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Water flowing around feet */}
      <path
        d="M 16 76 Q 24 72 32 76 Q 40 80 50 76 Q 60 72 68 76 Q 76 80 84 76 L 84 90 L 16 90 Z"
        fill="#1a2a4e" opacity="0.3"
      />
      <path d="M 18 78 Q 28 74 38 78 Q 48 82 58 78 Q 68 74 78 78" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.3" />
      {/* Seated graceful body */}
      <path
        d="M 36 50 Q 32 58 30 68 Q 34 74 42 78 L 50 80 L 58 78 Q 66 74 70 68 Q 68 58 64 50 Q 58 46 54 44 L 50 42 L 46 44 Q 42 46 36 50 Z"
        fill="#1a1a2e"
      />
      {/* Seated pose - crossed legs suggested */}
      <path d="M 38 68 Q 42 72 50 74 Q 58 72 62 68" stroke="#2a2a3e" strokeWidth="1" fill="none" opacity="0.4" />
      {/* Elegant kimono details */}
      <path d="M 44 46 L 50 54 L 56 46" stroke="#FFD700" strokeWidth="0.6" fill="none" opacity="0.4" />
      {/* Sash */}
      <path d="M 38 58 Q 50 62 62 58" stroke="#FF8A65" strokeWidth="2" fill="none" opacity="0.5" />
      {/* Head */}
      <ellipse cx="50" cy="34" rx="7" ry="8" fill="#1a1a2e" />
      {/* Elegant hair with ornaments */}
      <path d="M 42 30 Q 42 22 46 18 Q 50 16 54 18 Q 58 22 58 30" fill="#0d0d1a" />
      <circle cx="46" cy="20" r="1" fill="#FFD700" opacity="0.5" />
      <circle cx="54" cy="20" r="1" fill="#FFD700" opacity="0.5" />
      {/* Serene face suggestion */}
      <path d="M 46 33 Q 48 34 50 33" stroke={elemColor} strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M 50 33 Q 52 34 54 33" stroke={elemColor} strokeWidth="0.5" fill="none" opacity="0.4" />
      {/* Arms holding biwa (lute) */}
      <path d="M 38 50 L 32 52 L 30 48 L 34 46 Z" fill="#1a1a2e" />
      <path d="M 62 50 L 66 48 L 68 52 L 64 54 Z" fill="#1a1a2e" />
      {/* Biwa instrument body */}
      <ellipse cx="42" cy="54" rx="8" ry="5" fill="#5D3A1A" opacity="0.7" transform="rotate(-15 42 54)" />
      <ellipse cx="42" cy="54" rx="5" ry="3" fill="#3a2010" opacity="0.5" transform="rotate(-15 42 54)" />
      {/* Biwa neck */}
      <line x1="34" y1="50" x2="26" y2="38" stroke="#5D3A1A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      {/* Biwa strings */}
      <line x1="38" y1="50" x2="30" y2="40" stroke="#FFD700" strokeWidth="0.3" opacity="0.4" />
      <line x1="40" y1="50" x2="32" y2="40" stroke="#FFD700" strokeWidth="0.3" opacity="0.35" />
      {/* Biwa tuning pegs */}
      <circle cx="26" cy="37" r="1" fill="#5D3A1A" opacity="0.6" />
      <circle cx="28" cy="36" r="1" fill="#5D3A1A" opacity="0.6" />
      {elementParticles('Ocean', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function fujinPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Wind spiral effects */}
      <path d="M 10 30 Q 20 24 30 30 Q 40 36 50 30" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.25" />
      <path d="M 50 20 Q 60 14 70 20 Q 80 26 90 20" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M 14 60 Q 20 56 26 60" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.2" />
      <path d="M 74 56 Q 80 52 86 56" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.2" />
      {/* Muscular oni-like body - dynamic pose */}
      <path
        d="M 34 48 L 26 52 L 24 66 L 30 80 L 40 86 L 52 88 L 62 86 L 70 80 L 74 66 L 72 52 L 64 48 L 56 44 L 44 44 Z"
        fill="#1a1a2e"
      />
      {/* Muscular definition */}
      <path d="M 44 52 L 50 50 L 56 52 L 54 58 L 50 60 L 46 58 Z" fill="#2a2a3e" opacity="0.4" />
      {/* Head */}
      <ellipse cx="50" cy="32" rx="8" ry="9" fill="#1a1a2e" />
      {/* Wild wind-blown hair */}
      <path d="M 42 28 L 34 18 L 40 24 Z" fill="#2a1a2a" opacity="0.7" />
      <path d="M 46 26 L 38 14 L 44 22 Z" fill="#2a1a2a" opacity="0.7" />
      <path d="M 50 24 L 48 10 L 54 20 Z" fill="#2a1a2a" opacity="0.7" />
      <path d="M 54 26 L 56 12 L 56 22 Z" fill="#2a1a2a" opacity="0.7" />
      <path d="M 58 28 L 64 16 L 58 24 Z" fill="#2a1a2a" opacity="0.7" />
      {/* Oni features */}
      <circle cx="46" cy="30" r="1.2" fill={elemColor} opacity="0.6" />
      <circle cx="54" cy="30" r="1.2" fill={elemColor} opacity="0.6" />
      {/* Small horns */}
      <path d="M 44 24 L 40 18 L 44 22 Z" fill="#4a2a2a" opacity="0.5" />
      <path d="M 56 24 L 60 18 L 56 22 Z" fill="#4a2a2a" opacity="0.5" />
      {/* Arms raised holding wind bag */}
      <path d="M 34 48 L 26 40 L 22 34 L 24 32 L 28 38 L 36 46 Z" fill="#1a1a2e" />
      <path d="M 64 48 L 72 40 L 76 34 L 74 32 L 70 38 L 62 46 Z" fill="#1a1a2e" />
      {/* Wind bag on shoulders */}
      <path
        d="M 24 28 Q 30 18 50 16 Q 70 18 76 28 Q 72 34 50 36 Q 28 34 24 28 Z"
        fill="#2a3a2a" opacity="0.6"
      />
      <path
        d="M 28 26 Q 40 20 50 18 Q 60 20 72 26"
        stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.3"
      />
      {/* Wind escaping from bag */}
      <path d="M 26 26 Q 18 22 12 24" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M 74 26 Q 82 22 88 24" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.4" />
      {/* Clothes blown by wind */}
      <path d="M 28 66 Q 22 62 18 66" stroke="#2a2a3e" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M 72 64 Q 78 60 82 64" stroke="#2a2a3e" strokeWidth="0.8" fill="none" opacity="0.3" />
      {elementParticles('Storm', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function inariPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`foxfire-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#FF8A65" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FF8A65" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Small torii gate element behind */}
      <line x1="72" y1="18" x2="72" y2="50" stroke="#FF5722" strokeWidth="1.5" opacity="0.4" />
      <line x1="82" y1="18" x2="82" y2="50" stroke="#FF5722" strokeWidth="1.5" opacity="0.4" />
      <path d="M 70 20 Q 77 16 84 20" stroke="#FF5722" strokeWidth="1.5" fill="none" opacity="0.4" />
      <line x1="71" y1="26" x2="83" y2="26" stroke="#FF5722" strokeWidth="1" opacity="0.35" />
      {/* Figure body */}
      <path
        d="M 36 46 Q 30 54 28 70 Q 32 78 40 82 L 50 84 L 60 82 Q 68 78 72 70 Q 70 54 64 46 Q 58 42 54 40 L 50 38 L 46 40 Q 42 42 36 46 Z"
        fill="#1a1a2e"
      />
      {/* Kimono details */}
      <path d="M 44 42 L 50 52 L 56 42" stroke="#FF8A65" strokeWidth="0.6" fill="none" opacity="0.4" />
      <path d="M 38 58 Q 50 62 62 58" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="7" ry="8" fill="#1a1a2e" />
      {/* Hair */}
      <path d="M 42 26 Q 44 20 50 18 Q 56 20 58 26" fill="#0d0d1a" />
      {/* Fox ears */}
      <path d="M 42 22 L 38 10 L 46 20 Z" fill="#1a1a2e" />
      <path d="M 58 22 L 62 10 L 54 20 Z" fill="#1a1a2e" />
      {/* Inner ear color */}
      <path d="M 42 20 L 40 14 L 44 20 Z" fill="#FF8A65" opacity="0.3" />
      <path d="M 58 20 L 60 14 L 56 20 Z" fill="#FF8A65" opacity="0.3" />
      {/* Gentle eyes */}
      <circle cx="47" cy="28" r="1" fill={elemColor} opacity="0.5" />
      <circle cx="53" cy="28" r="1" fill={elemColor} opacity="0.5" />
      {/* Arms holding rice bundle */}
      <path d="M 38 46 L 32 50 L 30 46 L 34 44 Z" fill="#1a1a2e" />
      <path d="M 62 46 L 66 44 L 68 48 L 64 50 Z" fill="#1a1a2e" />
      {/* Rice sheaf bundle */}
      <path d="M 28 36 L 30 46 L 34 46 L 32 36 Z" fill="#FFD700" opacity="0.5" />
      <path d="M 26 34 L 28 36 M 30 34 L 30 36 M 34 34 L 32 36" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Rice grains at top */}
      <circle cx="27" cy="33" r="0.8" fill="#FFD700" opacity="0.4" />
      <circle cx="30" cy="32" r="0.8" fill="#FFD700" opacity="0.4" />
      <circle cx="33" cy="33" r="0.8" fill="#FFD700" opacity="0.4" />
      {/* Fox tail */}
      <path
        d="M 60 72 Q 70 64 76 68 Q 80 72 78 78 Q 74 74 68 76 Q 64 78 60 74 Z"
        fill="#FF8A65" opacity="0.35"
      />
      {/* Fox fire (will-o-wisps) */}
      <circle cx="18" cy="44" r="3" fill={`url(#foxfire-${uid})`} style={{ animation: 'svgGlowPulse 2.5s ease-in-out infinite' }} />
      <circle cx="82" cy="60" r="2.5" fill={`url(#foxfire-${uid})`} style={{ animation: 'svgGlowPulse 2.5s ease-in-out infinite 0.8s' }} />
      <circle cx="22" cy="68" r="2" fill={`url(#foxfire-${uid})`} style={{ animation: 'svgGlowPulse 2.5s ease-in-out infinite 1.6s' }} />
      {elementParticles('Sun', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

// ─── NORSE HERO PORTRAITS ───────────────────────────────────────────────────

function thorPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`mjolnir-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0C0C0" />
          <stop offset="100%" stopColor="#707070" />
        </linearGradient>
      </defs>
      {/* Red cape */}
      <path d="M 30 42 Q 22 52 20 72 Q 26 70 32 74 Q 28 56 33 44 Z" fill="#8B0000" opacity="0.7" />
      <path d="M 70 42 Q 78 52 80 72 Q 74 70 68 74 Q 72 56 67 44 Z" fill="#8B0000" opacity="0.7" />
      {/* Stocky body */}
      <path d="M 36 44 L 28 48 L 26 66 L 32 80 L 42 84 L 50 86 L 58 84 L 68 80 L 74 66 L 72 48 L 64 44 L 56 42 L 44 42 Z" fill="#1a1a2e" />
      {/* Chest armor plate */}
      <path d="M 40 48 L 50 46 L 60 48 L 58 60 L 50 62 L 42 60 Z" fill="#2a2a4a" opacity="0.5" />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="9" ry="10" fill="#1a1a2e" />
      {/* Winged helmet */}
      <path d="M 40 24 L 42 18 L 50 16 L 58 18 L 60 24 L 56 22 L 50 20 L 44 22 Z" fill="#707070" />
      <path d="M 40 22 L 32 12 L 36 18 L 40 20 Z" fill="#C0C0C0" opacity="0.7" />
      <path d="M 60 22 L 68 12 L 64 18 L 60 20 Z" fill="#C0C0C0" opacity="0.7" />
      {/* Beard */}
      <path d="M 43 34 Q 46 42 50 44 Q 54 42 57 34 Q 54 38 50 40 Q 46 38 43 34 Z" fill="#8B4513" opacity="0.6" />
      {/* Right arm raised with Mjolnir */}
      <path d="M 62 46 L 68 38 L 72 28 L 70 26 L 66 36 L 60 44 Z" fill="#1a1a2e" />
      {/* Mjolnir hammer */}
      <rect x="68" y="12" width="10" height="8" rx="1" fill={`url(#mjolnir-${uid})`} />
      <line x1="73" y1="20" x2="73" y2="30" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" />
      {/* Lightning from hammer */}
      <path d="M 72 10 L 70 6 L 74 8 L 72 2" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.8" />
      <path d="M 78 10 L 80 5 L 76 7 L 79 2" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.7" />
      {/* Left arm */}
      <path d="M 38 46 L 32 52 L 28 60 L 31 62 L 34 54 L 40 48 Z" fill="#1a1a2e" />
      {elementParticles('Storm', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function freyaPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`brisingamen-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF8C00" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Valkyrie wings from shoulders */}
      <path d="M 30 40 Q 18 28 12 16 Q 16 24 22 30 Q 20 22 16 14 Q 22 26 28 34 Z" fill="#C0C0C0" opacity="0.5" />
      <path d="M 70 40 Q 82 28 88 16 Q 84 24 78 30 Q 80 22 84 14 Q 78 26 72 34 Z" fill="#C0C0C0" opacity="0.5" />
      {/* Elegant body */}
      <path d="M 38 44 L 32 48 L 30 64 L 34 78 L 42 84 L 50 86 L 58 84 L 66 78 L 70 64 L 68 48 L 62 44 L 56 42 L 44 42 Z" fill="#1a1a2e" />
      {/* Flowing gown detail */}
      <path d="M 34 78 Q 42 82 50 86 Q 58 82 66 78 Q 60 84 50 88 Q 40 84 34 78 Z" fill="#2a1a3e" opacity="0.5" />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="8" ry="9" fill="#1a1a2e" />
      {/* Flowing hair */}
      <path d="M 42 26 Q 38 30 34 44 Q 36 42 40 38 Q 38 32 42 28 Z" fill="#FFD700" opacity="0.3" />
      <path d="M 58 26 Q 62 30 66 44 Q 64 42 60 38 Q 62 32 58 28 Z" fill="#FFD700" opacity="0.3" />
      {/* Tiara */}
      <path d="M 42 24 Q 46 20 50 18 Q 54 20 58 24" stroke="#C0C0C0" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="18" r="1.5" fill={elemColor} opacity="0.8" />
      {/* Brisingamen necklace glow */}
      <ellipse cx="50" cy="44" rx="6" ry="3" fill={`url(#brisingamen-${uid})`} style={{ animation: 'svgGlowPulse 3s ease-in-out infinite' }} />
      <path d="M 44 42 Q 47 46 50 47 Q 53 46 56 42" stroke="#FFD700" strokeWidth="1" fill="none" opacity="0.7" />
      {/* Arms gracefully at sides */}
      <path d="M 38 44 L 32 50 L 28 58 L 31 60 L 34 52 L 40 46 Z" fill="#1a1a2e" />
      <path d="M 62 44 L 68 50 L 72 58 L 69 60 L 66 52 L 60 46 Z" fill="#1a1a2e" />
      {elementParticles('Moon', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function odinPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`gungnir-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="100%" stopColor="#808080" />
        </linearGradient>
      </defs>
      {/* Tall cloak */}
      <path d="M 34 38 Q 24 50 20 76 Q 30 72 40 80 Q 32 56 36 42 Z" fill="#1a1a3a" opacity="0.7" />
      <path d="M 66 38 Q 76 50 80 76 Q 70 72 60 80 Q 68 56 64 42 Z" fill="#1a1a3a" opacity="0.7" />
      {/* Body - tall and robed */}
      <path d="M 38 42 L 30 46 L 28 66 L 34 82 L 44 86 L 50 88 L 56 86 L 66 82 L 72 66 L 70 46 L 62 42 L 54 40 L 46 40 Z" fill="#1a1a2e" />
      {/* Robe trim */}
      <path d="M 34 82 Q 44 86 50 88 Q 56 86 66 82" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Head */}
      <ellipse cx="50" cy="28" rx="8" ry="9" fill="#1a1a2e" />
      {/* Wide-brimmed hat */}
      <path d="M 30 26 L 42 14 L 50 8 L 58 14 L 70 26 Q 60 24 50 24 Q 40 24 30 26 Z" fill="#2a2a3e" />
      <ellipse cx="50" cy="26" rx="20" ry="4" fill="#2a2a3e" />
      {/* One-eye patch */}
      <circle cx="46" cy="28" r="2" fill="#333" stroke="#555" strokeWidth="0.5" />
      <line x1="42" y1="26" x2="38" y2="24" stroke="#555" strokeWidth="0.5" />
      {/* Visible eye */}
      <circle cx="54" cy="28" r="1" fill={elemColor} opacity="0.7" />
      {/* Beard */}
      <path d="M 44 32 Q 47 42 50 46 Q 53 42 56 32 Q 53 38 50 40 Q 47 38 44 32 Z" fill="#888" opacity="0.4" />
      {/* Gungnir spear in right hand */}
      <line x1="72" y1="10" x2="72" y2="50" stroke={`url(#gungnir-${uid})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M 69 14 L 72 6 L 75 14 Z" fill="#E0E0E0" />
      {/* Right arm holding spear */}
      <path d="M 62 42 L 68 44 L 72 46 L 70 48 L 66 46 L 60 44 Z" fill="#1a1a2e" />
      {/* Raven on left shoulder */}
      <path d="M 32 36 Q 28 34 26 36 Q 28 38 30 37 L 32 38 Z" fill="#111" />
      <circle cx="27" cy="35" r="0.8" fill={elemColor} opacity="0.5" />
      <path d="M 26 36 L 22 34 M 26 36 L 22 38" stroke="#222" strokeWidth="0.5" fill="none" />
      {elementParticles('Sun', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function lokiPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Smoke wisps */}
      <path d="M 18 70 Q 16 60 20 50 Q 18 55 22 62" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M 80 68 Q 82 58 78 48 Q 80 53 76 60" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.25" />
      {/* Lean crouched body */}
      <path d="M 40 46 L 34 50 L 32 64 L 36 76 L 44 80 L 50 82 L 56 80 L 64 76 L 68 64 L 66 50 L 60 46 L 54 44 L 46 44 Z" fill="#1a1a2e" />
      {/* Sly leaning posture */}
      <path d="M 42 50 L 50 48 L 58 50 L 56 58 L 50 60 L 44 58 Z" fill="#0d2a0d" opacity="0.4" />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="8" ry="9" fill="#1a1a2e" />
      {/* Curved horns */}
      <path d="M 42 24 Q 38 16 34 8 Q 36 14 40 20" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      <path d="M 58 24 Q 62 16 66 8 Q 64 14 60 20" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      {/* Sly grin */}
      <path d="M 46 34 Q 50 38 54 34" stroke="#444" strokeWidth="0.8" fill="none" />
      {/* Narrow eyes */}
      <path d="M 44 28 L 48 27 L 44 27 Z" fill={elemColor} opacity="0.6" />
      <path d="M 56 28 L 52 27 L 56 27 Z" fill={elemColor} opacity="0.6" />
      {/* Arms with twin daggers */}
      <path d="M 38 46 L 30 42 L 26 36 L 28 34 L 32 40 L 40 44 Z" fill="#1a1a2e" />
      <path d="M 62 46 L 70 42 L 74 36 L 72 34 L 68 40 L 60 44 Z" fill="#1a1a2e" />
      {/* Left dagger */}
      <path d="M 26 36 L 24 28 L 22 36 Z" fill="#C0C0C0" opacity="0.7" />
      {/* Right dagger */}
      <path d="M 74 36 L 76 28 L 78 36 Z" fill="#C0C0C0" opacity="0.7" />
      {/* More smoke wisps around feet */}
      <path d="M 36 78 Q 42 74 50 76 Q 58 74 64 78" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.2" />
      {elementParticles('Underworld', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function fenrirPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Wolf silhouette - not humanoid */}
      {/* Body mass */}
      <path d="M 22 52 Q 24 42 36 38 L 50 36 Q 64 38 72 44 Q 78 50 76 60 Q 74 68 64 72 L 36 72 Q 24 68 22 58 Z" fill="#1a1a2e" />
      {/* Head/snout facing left-forward */}
      <path d="M 22 42 L 12 38 L 10 42 L 16 44 L 22 46 Z" fill="#1a1a2e" />
      {/* Open jaws with teeth */}
      <path d="M 12 38 L 8 36 L 12 40 Z" fill="#1a1a2e" />
      <path d="M 12 42 L 8 44 L 12 40 Z" fill="#2a2a3e" />
      {/* Teeth - upper */}
      <path d="M 10 39 L 11 41 M 12 39 L 13 41 M 14 39 L 14 41" stroke="#ddd" strokeWidth="0.6" />
      {/* Teeth - lower */}
      <path d="M 10 41 L 11 40 M 12 42 L 13 40 M 14 42 L 14 40" stroke="#ddd" strokeWidth="0.6" />
      {/* Wolf ears */}
      <path d="M 20 38 L 16 28 L 22 36 Z" fill="#2a2a3e" />
      <path d="M 26 36 L 24 26 L 28 34 Z" fill="#2a2a3e" />
      {/* Glowing eye */}
      <circle cx="18" cy="38" r="1.5" fill={elemColor} opacity="0.8" />
      {/* Bristled fur along back */}
      <path d="M 30 36 L 28 30 L 34 34 L 32 28 L 38 32 L 36 26 L 42 30 L 40 24 L 46 28 L 48 22 L 52 28" stroke="#2a2a3e" strokeWidth="1" fill="none" />
      {/* Broken chains */}
      <path d="M 30 62 L 26 66 L 22 64 L 18 68 L 14 66" stroke="#707070" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M 64 58 L 68 62 L 72 60 L 76 64 L 80 62" stroke="#707070" strokeWidth="1.5" fill="none" opacity="0.6" />
      {/* Chain break sparks */}
      <circle cx="14" cy="66" r="1" fill={elemColor} opacity="0.5" />
      <circle cx="80" cy="62" r="1" fill={elemColor} opacity="0.5" />
      {/* Tail */}
      <path d="M 72 56 Q 80 50 84 54 Q 86 58 82 62" stroke="#1a1a2e" strokeWidth="3" fill="none" />
      {elementParticles('Underworld', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function tyrPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Noble warrior body */}
      <path d="M 38 44 L 30 48 L 28 66 L 34 80 L 42 84 L 50 86 L 58 84 L 66 80 L 72 66 L 70 48 L 62 44 L 56 42 L 44 42 Z" fill="#1a1a2e" />
      {/* Chest armor */}
      <path d="M 42 48 L 50 46 L 58 48 L 56 58 L 50 60 L 44 58 Z" fill="#2a2a4a" opacity="0.5" />
      <line x1="50" y1="46" x2="50" y2="60" stroke={elemColor} strokeWidth="0.6" opacity="0.3" />
      {/* Head */}
      <ellipse cx="50" cy="30" rx="8" ry="9" fill="#1a1a2e" />
      {/* Helmet */}
      <path d="M 42 26 Q 44 18 50 16 Q 56 18 58 26" fill="#555" />
      <line x1="42" y1="26" x2="58" y2="26" stroke="#777" strokeWidth="1" />
      {/* Eyes */}
      <circle cx="46" cy="28" r="1" fill={elemColor} opacity="0.5" />
      <circle cx="54" cy="28" r="1" fill={elemColor} opacity="0.5" />
      {/* Right arm with sword */}
      <path d="M 62 44 L 68 38 L 72 30 L 70 28 L 66 36 L 60 42 Z" fill="#1a1a2e" />
      {/* Sword in right hand */}
      <line x1="70" y1="10" x2="70" y2="32" stroke="#C0C0C0" strokeWidth="2" strokeLinecap="round" />
      <path d="M 67 10 L 70 4 L 73 10 Z" fill="#E0E0E0" />
      <rect x="67" y="30" width="6" height="2" rx="0.5" fill="#8B7355" />
      {/* Left arm - stump */}
      <path d="M 38 44 L 32 50 L 30 56 L 33 58 L 35 52 L 40 46 Z" fill="#1a1a2e" />
      {/* Stump end with wrap */}
      <circle cx="31" cy="57" r="2" fill="#2a2a3e" />
      <path d="M 29 56 Q 31 58 33 56" stroke="#555" strokeWidth="0.5" fill="none" />
      {elementParticles('Storm', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function heimdallPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`rainbow-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF0000" stopOpacity="0.4" />
          <stop offset="25%" stopColor="#FFFF00" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#00FF00" stopOpacity="0.4" />
          <stop offset="75%" stopColor="#0000FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8B00FF" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Rainbow accent arc at bottom */}
      <path d="M 20 82 Q 50 68 80 82" stroke={`url(#rainbow-${uid})`} strokeWidth="2.5" fill="none" />
      {/* Tall sentinel body */}
      <path d="M 38 42 L 30 46 L 28 66 L 34 82 L 44 86 L 50 88 L 56 86 L 66 82 L 72 66 L 70 46 L 62 42 L 56 40 L 44 40 Z" fill="#1a1a2e" />
      {/* Golden armor trim */}
      <path d="M 42 46 L 50 44 L 58 46 L 56 56 L 50 58 L 44 56 Z" fill="#2a2a4a" opacity="0.5" />
      <path d="M 42 46 L 50 44 L 58 46" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* Head */}
      <ellipse cx="50" cy="28" rx="8" ry="9" fill="#1a1a2e" />
      {/* Horned helmet */}
      <path d="M 42 24 Q 44 16 50 14 Q 56 16 58 24" fill="#FFD700" opacity="0.4" />
      {/* Watchful eyes */}
      <circle cx="46" cy="27" r="1.2" fill={elemColor} opacity="0.7" />
      <circle cx="54" cy="27" r="1.2" fill={elemColor} opacity="0.7" />
      {/* Right arm with sword */}
      <path d="M 62 42 L 68 46 L 72 52 L 70 54 L 66 48 L 60 44 Z" fill="#1a1a2e" />
      <line x1="72" y1="38" x2="72" y2="54" stroke="#C0C0C0" strokeWidth="1.5" strokeLinecap="round" />
      {/* Gjallarhorn at left hip */}
      <path d="M 28 58 Q 24 54 22 48 Q 20 44 18 42" stroke="#8B7355" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="18" cy="41" rx="3" ry="2" fill="#8B7355" opacity="0.6" />
      {/* Left arm */}
      <path d="M 38 42 L 32 48 L 28 56 L 31 58 L 34 50 L 40 44 Z" fill="#1a1a2e" />
      {elementParticles('Sun', elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

// ─── CREATURE PORTRAITS ─────────────────────────────────────────────────────

function goblinPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Small hunched body */}
      <path d="M 40 50 L 34 54 L 32 66 L 38 78 L 46 80 L 50 82 L 54 80 L 62 78 L 68 66 L 66 54 L 60 50 L 54 48 L 46 48 Z" fill="#2a3a1a" />
      {/* Hunched shoulders */}
      <path d="M 36 50 Q 34 46 36 44 L 42 48 Z" fill="#2a3a1a" />
      <path d="M 64 50 Q 66 46 64 44 L 58 48 Z" fill="#2a3a1a" />
      {/* Head - large for body */}
      <ellipse cx="50" cy="36" rx="10" ry="9" fill="#2a3a1a" />
      {/* Big pointy ears */}
      <path d="M 40 34 L 26 26 L 38 36 Z" fill="#3a4a2a" />
      <path d="M 60 34 L 74 26 L 62 36 Z" fill="#3a4a2a" />
      {/* Inner ears */}
      <path d="M 40 34 L 30 28 L 38 35 Z" fill={elemColor} opacity="0.15" />
      <path d="M 60 34 L 70 28 L 62 35 Z" fill={elemColor} opacity="0.15" />
      {/* Beady eyes */}
      <circle cx="46" cy="34" r="2" fill="#111" />
      <circle cx="54" cy="34" r="2" fill="#111" />
      <circle cx="46" cy="33.5" r="0.8" fill={elemColor} opacity="0.8" />
      <circle cx="54" cy="33.5" r="0.8" fill={elemColor} opacity="0.8" />
      {/* Toothy grin */}
      <path d="M 44 40 Q 50 44 56 40" stroke="#111" strokeWidth="0.8" fill="none" />
      <path d="M 46 40 L 47 42 M 53 40 L 52 42" stroke="#ddd" strokeWidth="0.5" />
      {/* Arm with crude dagger */}
      <path d="M 60 50 L 68 46 L 72 40 L 70 38 L 66 44 L 58 48 Z" fill="#2a3a1a" />
      <path d="M 72 40 L 74 32 L 70 40 Z" fill="#8B7355" opacity="0.7" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function skeletonPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Ribcage outline */}
      <path d="M 42 44 L 40 48 L 40 60 L 44 66 L 50 68 L 56 66 L 60 60 L 60 48 L 58 44 Z" fill="none" stroke="#888" strokeWidth="1" />
      <path d="M 42 50 Q 50 52 58 50" stroke="#777" strokeWidth="0.8" fill="none" />
      <path d="M 42 54 Q 50 56 58 54" stroke="#777" strokeWidth="0.8" fill="none" />
      <path d="M 43 58 Q 50 60 57 58" stroke="#777" strokeWidth="0.8" fill="none" />
      <line x1="50" y1="44" x2="50" y2="68" stroke="#888" strokeWidth="0.8" />
      {/* Pelvis */}
      <path d="M 44 68 Q 50 72 56 68" stroke="#777" strokeWidth="1" fill="none" />
      {/* Legs bones */}
      <line x1="44" y1="68" x2="42" y2="84" stroke="#777" strokeWidth="1.2" />
      <line x1="56" y1="68" x2="58" y2="84" stroke="#777" strokeWidth="1.2" />
      {/* Skull */}
      <ellipse cx="50" cy="32" rx="9" ry="10" fill="#ddd" opacity="0.15" stroke="#888" strokeWidth="1" />
      {/* Eye sockets */}
      <ellipse cx="46" cy="30" rx="3" ry="2.5" fill="#111" />
      <ellipse cx="54" cy="30" rx="3" ry="2.5" fill="#111" />
      {/* Eye glow */}
      <circle cx="46" cy="30" r="1" fill={elemColor} opacity="0.6" />
      <circle cx="54" cy="30" r="1" fill={elemColor} opacity="0.6" />
      {/* Nose hole */}
      <path d="M 49 34 L 50 36 L 51 34 Z" fill="#333" />
      {/* Jaw */}
      <path d="M 42 38 Q 50 42 58 38" stroke="#888" strokeWidth="0.8" fill="none" />
      {/* Arm bones with rusty sword */}
      <line x1="58" y1="46" x2="70" y2="38" stroke="#777" strokeWidth="1.2" />
      <line x1="70" y1="16" x2="70" y2="40" stroke="#8B5E3C" strokeWidth="1.5" opacity="0.6" />
      <path d="M 68 18 L 70 12 L 72 18 Z" fill="#8B5E3C" opacity="0.5" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function slimePortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`slimebody-${uid}`} cx="40%" cy="40%" r="50%">
          <stop offset="0%" stopColor={elemColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0.08" />
        </radialGradient>
      </defs>
      {/* Amorphous blob body */}
      <path d="M 28 60 Q 26 44 34 36 Q 42 28 50 28 Q 58 28 66 36 Q 74 44 72 60 Q 70 72 62 76 Q 54 80 50 80 Q 46 80 38 76 Q 30 72 28 60 Z" fill={`url(#slimebody-${uid})`} stroke={elemColor} strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Inner highlight */}
      <ellipse cx="44" cy="46" rx="8" ry="6" fill={elemColor} opacity="0.08" />
      {/* Two eyes */}
      <ellipse cx="42" cy="48" rx="4" ry="5" fill="#fff" opacity="0.2" />
      <ellipse cx="58" cy="48" rx="4" ry="5" fill="#fff" opacity="0.2" />
      <circle cx="43" cy="48" r="2" fill="#111" />
      <circle cx="59" cy="48" r="2" fill="#111" />
      <circle cx="43.5" cy="47" r="0.8" fill="#fff" opacity="0.5" />
      <circle cx="59.5" cy="47" r="0.8" fill="#fff" opacity="0.5" />
      {/* Drip effects */}
      <path d="M 34 74 Q 32 80 34 86" stroke={elemColor} strokeWidth="1.5" fill="none" opacity="0.3" />
      <circle cx="34" cy="86" r="1.5" fill={elemColor} opacity="0.2" />
      <path d="M 62 72 Q 64 78 62 84" stroke={elemColor} strokeWidth="1" fill="none" opacity="0.25" />
      <circle cx="62" cy="84" r="1" fill={elemColor} opacity="0.15" />
      {/* Mouth */}
      <path d="M 46 56 Q 50 58 54 56" stroke="#111" strokeWidth="0.6" fill="none" opacity="0.4" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function impPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Bat wings */}
      <path d="M 34 42 L 18 28 L 22 38 L 14 32 L 20 42 L 16 38 L 24 46 L 34 46 Z" fill="#2a1a1a" opacity="0.6" />
      <path d="M 66 42 L 82 28 L 78 38 L 86 32 L 80 42 L 84 38 L 76 46 L 66 46 Z" fill="#2a1a1a" opacity="0.6" />
      {/* Small body */}
      <path d="M 42 48 L 38 52 L 36 62 L 40 72 L 46 74 L 50 76 L 54 74 L 60 72 L 64 62 L 62 52 L 58 48 L 54 46 L 46 46 Z" fill="#3a1a1a" />
      {/* Head */}
      <ellipse cx="50" cy="36" rx="8" ry="8" fill="#3a1a1a" />
      {/* Horns */}
      <path d="M 44 30 L 40 20 L 44 26 Z" fill="#555" />
      <path d="M 56 30 L 60 20 L 56 26 Z" fill="#555" />
      {/* Big grin */}
      <path d="M 42 38 Q 50 46 58 38" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 44 39 L 45 41 M 55 39 L 56 41" stroke="#ddd" strokeWidth="0.4" />
      {/* Eyes */}
      <circle cx="46" cy="34" r="1.5" fill={elemColor} opacity="0.7" />
      <circle cx="54" cy="34" r="1.5" fill={elemColor} opacity="0.7" />
      {/* Pointed tail */}
      <path d="M 50 74 Q 58 80 66 78 Q 70 76 72 72 L 74 70" stroke="#3a1a1a" strokeWidth="2" fill="none" />
      <path d="M 73 68 L 76 70 L 73 72 Z" fill="#3a1a1a" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function batPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Wide spread bat wings - left */}
      <path d="M 44 44 L 28 26 L 32 38 L 18 22 L 24 36 L 12 28 L 22 42 L 14 38 L 26 48 L 38 48 Z" fill="#1a1a2e" />
      {/* Wide spread bat wings - right */}
      <path d="M 56 44 L 72 26 L 68 38 L 82 22 L 76 36 L 88 28 L 78 42 L 86 38 L 74 48 L 62 48 Z" fill="#1a1a2e" />
      {/* Small body */}
      <ellipse cx="50" cy="52" rx="8" ry="10" fill="#1a1a2e" />
      {/* Head */}
      <ellipse cx="50" cy="38" rx="7" ry="7" fill="#1a1a2e" />
      {/* Pointed ears */}
      <path d="M 44 34 L 40 24 L 46 32 Z" fill="#2a2a3e" />
      <path d="M 56 34 L 60 24 L 54 32 Z" fill="#2a2a3e" />
      {/* Eyes */}
      <circle cx="47" cy="37" r="1.5" fill={elemColor} opacity="0.7" />
      <circle cx="53" cy="37" r="1.5" fill={elemColor} opacity="0.7" />
      {/* Fangs */}
      <path d="M 47 42 L 48 46 M 52 42 L 53 46" stroke="#ddd" strokeWidth="0.6" />
      {/* Small feet */}
      <path d="M 46 62 L 44 66 L 48 64 Z" fill="#1a1a2e" />
      <path d="M 54 62 L 56 66 L 52 64 Z" fill="#1a1a2e" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function wolfPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Wolf body profile */}
      <path d="M 24 54 Q 26 44 38 40 L 54 38 Q 66 40 74 46 Q 80 52 78 60 Q 76 68 66 72 L 38 72 Q 26 68 24 58 Z" fill="#2a2a3e" />
      {/* Head tilted up howling */}
      <path d="M 24 44 L 18 32 L 16 28 L 20 32 L 24 38 Z" fill="#2a2a3e" />
      {/* Open muzzle howling */}
      <path d="M 16 28 L 12 24 L 14 28 L 16 30 Z" fill="#2a2a3e" />
      <path d="M 16 30 L 12 32 L 14 30 Z" fill="#3a3a4e" />
      {/* Ear */}
      <path d="M 22 36 L 18 26 L 24 32 Z" fill="#3a3a4e" />
      {/* Eye */}
      <circle cx="20" cy="36" r="1.2" fill={elemColor} opacity="0.7" />
      {/* Bristled fur along back */}
      <path d="M 32 38 L 30 32 L 36 36 L 34 30 L 40 34 L 38 28 L 44 32 L 42 26 L 48 30" stroke="#3a3a4e" strokeWidth="1" fill="none" />
      {/* Tail */}
      <path d="M 74 50 Q 82 42 86 46 Q 88 50 84 56" stroke="#2a2a3e" strokeWidth="3" fill="none" />
      {/* Legs */}
      <line x1="36" y1="72" x2="34" y2="84" stroke="#2a2a3e" strokeWidth="2.5" />
      <line x1="44" y1="72" x2="42" y2="84" stroke="#2a2a3e" strokeWidth="2.5" />
      <line x1="58" y1="72" x2="60" y2="84" stroke="#2a2a3e" strokeWidth="2.5" />
      <line x1="66" y1="72" x2="68" y2="84" stroke="#2a2a3e" strokeWidth="2.5" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function serpentPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* S-curve serpent body */}
      <path d="M 30 78 Q 24 68 30 58 Q 36 48 50 46 Q 64 44 70 36 Q 76 28 70 22 Q 64 18 56 22" stroke="#1a3a1a" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Scale pattern */}
      <path d="M 28 68 Q 32 66 36 68" stroke={elemColor} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M 38 54 Q 42 52 46 54" stroke={elemColor} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M 56 46 Q 60 44 64 46" stroke={elemColor} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M 66 32 Q 68 30 70 32" stroke={elemColor} strokeWidth="0.5" fill="none" opacity="0.3" />
      {/* Head */}
      <ellipse cx="56" cy="20" rx="6" ry="5" fill="#1a3a1a" />
      {/* Eyes */}
      <circle cx="54" cy="18" r="1.2" fill={elemColor} opacity="0.8" />
      <circle cx="58" cy="18" r="1.2" fill={elemColor} opacity="0.8" />
      {/* Fangs */}
      <path d="M 52 22 L 51 26 M 56 23 L 55 27" stroke="#ddd" strokeWidth="0.6" />
      {/* Forked tongue */}
      <path d="M 50 22 L 46 24 M 50 22 L 46 20" stroke="#cc3333" strokeWidth="0.5" />
      {/* Fin/ridge along back */}
      <path d="M 60 18 L 62 14 L 64 18 M 66 24 L 68 20 L 70 24" stroke="#2a4a2a" strokeWidth="0.8" fill="none" />
      {/* Tail end */}
      <path d="M 30 78 L 26 82 L 28 80 Z" fill="#1a3a1a" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function wraithPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <linearGradient id={`wraith-fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Floating hooded figure - no feet, fades at bottom */}
      <path d="M 34 30 Q 34 20 42 16 Q 50 12 58 16 Q 66 20 66 30 L 68 56 Q 66 72 62 80 Q 56 86 50 86 Q 44 86 38 80 Q 34 72 32 56 Z" fill={`url(#wraith-fade-${uid})`} />
      {/* Hood */}
      <path d="M 36 30 Q 36 18 44 14 Q 50 10 56 14 Q 64 18 64 30 Q 58 28 50 28 Q 42 28 36 30 Z" fill="#0d0d1a" />
      {/* Shadowed face void */}
      <ellipse cx="50" cy="32" rx="8" ry="6" fill="#050510" />
      {/* Glowing eyes in void */}
      <circle cx="46" cy="32" r="1.5" fill={elemColor} opacity="0.8" style={{ animation: 'svgGlowPulse 3s ease-in-out infinite' }} />
      <circle cx="54" cy="32" r="1.5" fill={elemColor} opacity="0.8" style={{ animation: 'svgGlowPulse 3s ease-in-out infinite 0.5s' }} />
      {/* Reaching hands - left */}
      <path d="M 34 50 L 24 46 L 20 42 L 18 44 L 22 48 L 16 46 L 20 50 L 26 52 L 34 54 Z" fill="#1a1a2e" opacity="0.7" />
      {/* Reaching hands - right */}
      <path d="M 66 50 L 76 46 L 80 42 L 82 44 L 78 48 L 84 46 L 80 50 L 74 52 L 66 54 Z" fill="#1a1a2e" opacity="0.7" />
      {/* Wispy trails at bottom */}
      <path d="M 42 82 Q 38 88 36 90" stroke="#1a1a2e" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M 50 86 Q 50 90 48 92" stroke="#1a1a2e" strokeWidth="1" fill="none" opacity="0.2" />
      <path d="M 58 82 Q 62 88 64 90" stroke="#1a1a2e" strokeWidth="1.5" fill="none" opacity="0.3" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function harpyPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Bird wings - left */}
      <path d="M 36 42 L 20 26 L 24 36 L 14 28 L 22 40 L 12 36 L 24 46 L 36 48 Z" fill="#2a2a3e" opacity="0.6" />
      {/* Bird wings - right */}
      <path d="M 64 42 L 80 26 L 76 36 L 86 28 L 78 40 L 88 36 L 76 46 L 64 48 Z" fill="#2a2a3e" opacity="0.6" />
      {/* Feather detail */}
      <path d="M 18 30 L 22 34 M 14 32 L 20 38" stroke={elemColor} strokeWidth="0.4" fill="none" opacity="0.3" />
      <path d="M 82 30 L 78 34 M 86 32 L 80 38" stroke={elemColor} strokeWidth="0.4" fill="none" opacity="0.3" />
      {/* Human upper body */}
      <path d="M 40 44 L 36 48 L 36 58 L 40 64 L 50 66 L 60 64 L 64 58 L 64 48 L 60 44 L 54 42 L 46 42 Z" fill="#1a1a2e" />
      {/* Head */}
      <ellipse cx="50" cy="32" rx="7" ry="8" fill="#1a1a2e" />
      {/* Wild hair / feathered */}
      <path d="M 42 28 Q 40 22 38 18 M 46 26 Q 44 20 44 16 M 54 26 Q 56 20 56 16 M 58 28 Q 60 22 62 18" stroke="#2a2a3e" strokeWidth="1" fill="none" />
      {/* Eyes */}
      <circle cx="47" cy="30" r="1.2" fill={elemColor} opacity="0.6" />
      <circle cx="53" cy="30" r="1.2" fill={elemColor} opacity="0.6" />
      {/* Talon feet */}
      <path d="M 42 66 L 40 74 L 36 78 M 40 74 L 40 80 M 40 74 L 44 78" stroke="#555" strokeWidth="1.2" fill="none" />
      <path d="M 58 66 L 60 74 L 64 78 M 60 74 L 60 80 M 60 74 L 56 78" stroke="#555" strokeWidth="1.2" fill="none" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function golemPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Blocky rocky body */}
      <path d="M 34 42 L 26 46 L 24 68 L 28 80 L 40 86 L 50 88 L 60 86 L 72 80 L 76 68 L 74 46 L 66 42 L 56 40 L 44 40 Z" fill="#3a3a3a" />
      {/* Rock texture cracks */}
      <path d="M 36 50 L 42 56 L 38 62" stroke="#555" strokeWidth="0.6" fill="none" />
      <path d="M 64 52 L 58 58 L 62 64" stroke="#555" strokeWidth="0.6" fill="none" />
      <path d="M 44 70 L 50 74 L 56 70" stroke="#555" strokeWidth="0.6" fill="none" />
      {/* Head - blocky */}
      <rect x="40" y="22" width="20" height="18" rx="2" fill="#3a3a3a" />
      {/* Eyes - narrow slits */}
      <rect x="43" y="28" width="4" height="2" rx="0.5" fill={elemColor} opacity="0.7" />
      <rect x="53" y="28" width="4" height="2" rx="0.5" fill={elemColor} opacity="0.7" />
      {/* Glowing rune on chest */}
      <path d="M 46 52 L 50 46 L 54 52 L 50 58 Z" fill="none" stroke={elemColor} strokeWidth="1.2" opacity="0.7" style={{ animation: 'svgGlowPulse 2.5s ease-in-out infinite' }} />
      <line x1="50" y1="46" x2="50" y2="58" stroke={elemColor} strokeWidth="0.6" opacity="0.5" />
      <line x1="46" y1="52" x2="54" y2="52" stroke={elemColor} strokeWidth="0.6" opacity="0.5" />
      {/* Thick arms */}
      <path d="M 26 46 L 18 50 L 16 60 L 20 64 L 24 56 L 28 48 Z" fill="#3a3a3a" />
      <path d="M 74 46 L 82 50 L 84 60 L 80 64 L 76 56 L 72 48 Z" fill="#3a3a3a" />
      {/* Fist details */}
      <rect x="14" y="58" width="8" height="6" rx="2" fill="#4a4a4a" />
      <rect x="78" y="58" width="8" height="6" rx="2" fill="#4a4a4a" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function minotaurPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Muscular body */}
      <path d="M 34 44 L 26 48 L 24 66 L 28 80 L 40 86 L 50 88 L 60 86 L 72 80 L 76 66 L 74 48 L 66 44 L 56 42 L 44 42 Z" fill="#2a1a1a" />
      {/* Chest muscles */}
      <path d="M 40 48 L 50 46 L 60 48 L 58 58 L 50 60 L 42 58 Z" fill="#3a2a2a" opacity="0.4" />
      {/* Bull head */}
      <path d="M 40 28 Q 40 18 50 16 Q 60 18 60 28 L 58 36 L 42 36 Z" fill="#2a1a1a" />
      {/* Bull snout */}
      <ellipse cx="50" cy="34" rx="5" ry="3" fill="#3a2a2a" />
      <circle cx="48" cy="34" r="0.8" fill="#111" />
      <circle cx="52" cy="34" r="0.8" fill="#111" />
      {/* Horns */}
      <path d="M 40 22 Q 32 16 28 12 Q 30 18 34 22" stroke="#8B7355" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 60 22 Q 68 16 72 12 Q 70 18 66 22" stroke="#8B7355" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="44" cy="26" r="1.5" fill={elemColor} opacity="0.7" />
      <circle cx="56" cy="26" r="1.5" fill={elemColor} opacity="0.7" />
      {/* Right arm with axe */}
      <path d="M 66 44 L 74 38 L 78 30 L 76 28 L 72 36 L 64 42 Z" fill="#2a1a1a" />
      <line x1="76" y1="12" x2="76" y2="32" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" />
      <path d="M 72 14 Q 76 10 80 14 Q 78 18 76 16 Q 74 18 72 14 Z" fill="#707070" />
      {/* Left arm */}
      <path d="M 34 44 L 28 50 L 24 58 L 27 60 L 30 52 L 36 46 Z" fill="#2a1a1a" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function chimeraPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Beast body */}
      <path d="M 24 52 Q 26 44 36 40 L 54 38 Q 64 40 72 46 Q 78 52 76 60 Q 74 68 64 72 L 36 72 Q 26 68 24 58 Z" fill="#2a2a1a" />
      {/* Lion mane */}
      <path d="M 20 36 Q 16 30 18 24 Q 22 20 28 22 Q 24 26 22 32 Z" fill="#8B6914" opacity="0.4" />
      <path d="M 28 34 Q 26 28 28 22 Q 32 18 36 22 Q 32 26 30 32 Z" fill="#8B6914" opacity="0.3" />
      <path d="M 16 40 Q 12 36 14 30 Q 18 28 20 32 Q 16 36 16 40 Z" fill="#8B6914" opacity="0.3" />
      {/* Lion head - main */}
      <ellipse cx="24" cy="38" rx="8" ry="7" fill="#2a2a1a" />
      <path d="M 18 40 L 14 42 L 18 44 Z" fill="#2a2a1a" />
      <circle cx="20" cy="36" r="1.2" fill={elemColor} opacity="0.7" />
      <path d="M 16 40 L 14 42 M 18 41 L 16 43" stroke="#ddd" strokeWidth="0.4" />
      {/* Goat head to side - smaller */}
      <ellipse cx="44" cy="34" rx="5" ry="4" fill="#3a3a2a" />
      <path d="M 40 30 L 38 22 L 42 28 Z" fill="#555" opacity="0.6" />
      <path d="M 48 30 L 50 22 L 46 28 Z" fill="#555" opacity="0.6" />
      <circle cx="42" cy="33" r="0.8" fill={elemColor} opacity="0.5" />
      {/* Snake tail */}
      <path d="M 72 56 Q 80 52 84 48 Q 86 44 84 40 Q 82 38 80 40" stroke="#2a3a2a" strokeWidth="3" fill="none" />
      <circle cx="80" cy="40" r="1" fill={elemColor} opacity="0.6" />
      <path d="M 78 40 L 76 38 M 78 40 L 76 42" stroke="#cc3333" strokeWidth="0.4" />
      {/* Legs */}
      <line x1="36" y1="72" x2="34" y2="84" stroke="#2a2a1a" strokeWidth="2.5" />
      <line x1="48" y1="72" x2="46" y2="84" stroke="#2a2a1a" strokeWidth="2.5" />
      <line x1="58" y1="72" x2="60" y2="84" stroke="#2a2a1a" strokeWidth="2.5" />
      <line x1="66" y1="72" x2="68" y2="84" stroke="#2a2a1a" strokeWidth="2.5" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function hydraPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Body mass */}
      <path d="M 34 58 Q 32 50 38 46 L 50 44 Q 62 46 68 50 Q 72 56 70 64 Q 68 72 60 76 L 40 76 Q 32 72 34 62 Z" fill="#1a2a1a" />
      {/* Neck 1 - left */}
      <path d="M 38 46 Q 30 36 24 26 Q 22 22 24 20" stroke="#1a2a1a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Head 1 */}
      <ellipse cx="24" cy="18" rx="5" ry="4" fill="#1a2a1a" />
      <circle cx="22" cy="17" r="1" fill={elemColor} opacity="0.7" />
      <path d="M 20 20 L 18 22 M 20 20 L 18 18" stroke="#cc3333" strokeWidth="0.4" />
      {/* Neck 2 - center */}
      <path d="M 50 44 Q 50 32 50 22 Q 50 18 50 16" stroke="#1a2a1a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Head 2 */}
      <ellipse cx="50" cy="14" rx="5" ry="4" fill="#1a2a1a" />
      <circle cx="48" cy="13" r="1" fill={elemColor} opacity="0.7" />
      <circle cx="52" cy="13" r="1" fill={elemColor} opacity="0.7" />
      <path d="M 48 17 L 46 20 M 48 17 L 46 14" stroke="#cc3333" strokeWidth="0.4" />
      {/* Neck 3 - right */}
      <path d="M 62 46 Q 70 36 76 26 Q 78 22 76 20" stroke="#1a2a1a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Head 3 */}
      <ellipse cx="76" cy="18" rx="5" ry="4" fill="#1a2a1a" />
      <circle cx="78" cy="17" r="1" fill={elemColor} opacity="0.7" />
      <path d="M 80 20 L 82 22 M 80 20 L 82 18" stroke="#cc3333" strokeWidth="0.4" />
      {/* Scale pattern on body */}
      <path d="M 42 56 Q 46 54 50 56 Q 54 54 58 56" stroke={elemColor} strokeWidth="0.4" fill="none" opacity="0.25" />
      <path d="M 40 64 Q 46 62 50 64 Q 54 62 60 64" stroke={elemColor} strokeWidth="0.4" fill="none" opacity="0.2" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function phoenix_chickPortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`chickglow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Warm glow */}
      <circle cx="50" cy="50" r="20" fill={`url(#chickglow-${uid})`} />
      {/* Small round bird body */}
      <ellipse cx="50" cy="54" rx="12" ry="10" fill="#FF8C00" opacity="0.3" />
      <ellipse cx="50" cy="54" rx="12" ry="10" fill="none" stroke="#FF6B00" strokeWidth="0.8" opacity="0.4" />
      {/* Cute head */}
      <circle cx="50" cy="40" r="8" fill="#FF8C00" opacity="0.3" />
      {/* Flame wings - left */}
      <path d="M 38 50 Q 28 44 24 36 Q 26 42 22 38 Q 26 48 30 52 L 38 54 Z" fill="#FF4500" opacity="0.4" />
      {/* Flame wings - right */}
      <path d="M 62 50 Q 72 44 76 36 Q 74 42 78 38 Q 74 48 70 52 L 62 54 Z" fill="#FF4500" opacity="0.4" />
      {/* Cute eyes */}
      <circle cx="46" cy="38" r="2" fill="#111" />
      <circle cx="54" cy="38" r="2" fill="#111" />
      <circle cx="46.5" cy="37.5" r="0.8" fill="#fff" opacity="0.6" />
      <circle cx="54.5" cy="37.5" r="0.8" fill="#fff" opacity="0.6" />
      {/* Tiny beak */}
      <path d="M 48 42 L 50 44 L 52 42 Z" fill="#FFD700" opacity="0.7" />
      {/* Tail flame */}
      <path d="M 50 64 Q 48 72 44 78 Q 50 74 50 80 Q 50 74 56 78 Q 52 72 50 64 Z" fill="#FF4500" opacity="0.35" style={{ animation: 'svgGlowPulse 2s ease-in-out infinite' }} />
      {/* Tiny feet */}
      <path d="M 46 64 L 44 68 L 46 66 L 48 68" stroke="#8B5E3C" strokeWidth="0.8" fill="none" />
      <path d="M 54 64 L 52 68 L 54 66 L 56 68" stroke="#8B5E3C" strokeWidth="0.8" fill="none" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function shadow_spritePortrait(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`spriteglow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={elemColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Ethereal glow */}
      <circle cx="50" cy="46" r="16" fill={`url(#spriteglow-${uid})`} style={{ animation: 'svgGlowPulse 3s ease-in-out infinite' }} />
      {/* Tiny floating fae body */}
      <ellipse cx="50" cy="48" rx="6" ry="8" fill="#1a1a2e" opacity="0.7" />
      {/* Head */}
      <circle cx="50" cy="36" r="6" fill="#1a1a2e" opacity="0.7" />
      {/* Pointed ears */}
      <path d="M 44 34 L 38 28 L 44 36 Z" fill="#2a2a3e" opacity="0.6" />
      <path d="M 56 34 L 62 28 L 56 36 Z" fill="#2a2a3e" opacity="0.6" />
      {/* Large luminous eyes */}
      <circle cx="47" cy="35" r="2" fill={elemColor} opacity="0.7" />
      <circle cx="53" cy="35" r="2" fill={elemColor} opacity="0.7" />
      <circle cx="47.5" cy="34.5" r="0.6" fill="#fff" opacity="0.5" />
      <circle cx="53.5" cy="34.5" r="0.6" fill="#fff" opacity="0.5" />
      {/* Wispy trails from body */}
      <path d="M 46 56 Q 42 64 38 72 Q 36 78 34 82" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.25" />
      <path d="M 50 56 Q 50 66 48 76 Q 48 80 46 84" stroke={elemColor} strokeWidth="0.6" fill="none" opacity="0.2" />
      <path d="M 54 56 Q 58 64 62 72 Q 64 78 66 82" stroke={elemColor} strokeWidth="0.8" fill="none" opacity="0.25" />
      {/* Tiny arms */}
      <path d="M 44 46 L 38 44 L 36 42" stroke="#1a1a2e" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M 56 46 L 62 44 L 64 42" stroke="#1a1a2e" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Sparkle motes */}
      <circle cx="36" cy="40" r="0.8" fill={elemColor} opacity="0.4" />
      <circle cx="66" cy="38" r="0.6" fill={elemColor} opacity="0.35" />
      <circle cx="40" cy="58" r="0.5" fill={elemColor} opacity="0.3" />
      <circle cx="62" cy="56" r="0.7" fill={elemColor} opacity="0.3" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

// ─── HERO PORTRAIT LOOKUP ────────────────────────────────────────────────────

const HERO_PORTRAITS = {
  zeus: zeusPortrait,
  poseidon: poseidonPortrait,
  hades: hadesPortrait,
  apollo: apolloPortrait,
  ares: aresPortrait,
  athena: athenaPortrait,
  hermes: hermesPortrait,
  hephaestus: hephaestusPortrait,
  anubis: anubisPortrait,
  ra: raPortrait,
  bastet: bastetPortrait,
  isis: isisPortrait,
  set: setPortrait,
  sobek: sobekPortrait,
  thoth: thothPortrait,
  morganLeFay: morganLeFayPortrait,
  merlin: merlinPortrait,
  nimue: nimuePortrait,
  cuChulainn: cuChulainnPortrait,
  brigid: brigidPortrait,
  dianCecht: dianCechtPortrait,
  amaterasu: amaterasuPortrait,
  susanoo: susanooPortrait,
  raijin: raijinPortrait,
  tsukuyomi: tsukuyomiPortrait,
  izanami: izanamiPortrait,
  benzaiten: benzaitenPortrait,
  fujin: fujinPortrait,
  inari: inariPortrait,
  thor: thorPortrait,
  freya: freyaPortrait,
  odin: odinPortrait,
  loki: lokiPortrait,
  fenrir: fenrirPortrait,
  tyr: tyrPortrait,
  heimdall: heimdallPortrait,
  goblin: goblinPortrait,
  skeleton: skeletonPortrait,
  slime: slimePortrait,
  imp: impPortrait,
  bat: batPortrait,
  wolf: wolfPortrait,
  serpent: serpentPortrait,
  wraith: wraithPortrait,
  harpy: harpyPortrait,
  golem: golemPortrait,
  minotaur: minotaurPortrait,
  chimera: chimeraPortrait,
  hydra: hydraPortrait,
  phoenix_chick: phoenix_chickPortrait,
  shadow_sprite: shadow_spritePortrait,
};

// ─── DEFAULT / FALLBACK PORTRAITS ────────────────────────────────────────────

function defaultAttacker(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Warrior with raised sword */}
      <path d="M 40 46 L 34 50 L 32 66 L 36 80 L 44 84 L 50 86 L 56 84 L 64 80 L 68 66 L 66 50 L 60 46 L 54 43 L 46 43 Z" fill="#1a1a2e" />
      <ellipse cx="50" cy="32" rx="8" ry="9" fill="#1a1a2e" />
      <path d="M 60 46 L 66 36 L 70 24 L 68 22 L 64 34 L 58 44 Z" fill="#1a1a2e" />
      <path d="M 68 8 L 70 10 L 68 26 L 66 26 Z" fill={elemColor} opacity="0.7" />
      <rect x="64" y="26" width="8" height="2" rx="1" fill={elemColor} opacity="0.5" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function defaultTank(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Bulky figure with large shield */}
      <path d="M 36 44 L 26 50 L 24 66 L 28 80 L 40 86 L 50 88 L 60 86 L 72 80 L 76 66 L 74 50 L 64 44 L 56 40 L 44 40 Z" fill="#1a1a2e" />
      <ellipse cx="50" cy="30" rx="9" ry="10" fill="#1a1a2e" />
      <path d="M 42 28 Q 42 20 50 18 Q 58 20 58 28" fill="#2a2a3e" />
      <path d="M 36 44 L 26 50 L 20 58 L 24 60 L 28 52 L 38 46 Z" fill="#1a1a2e" />
      <ellipse cx="18" cy="56" rx="10" ry="14" fill={elemColor} opacity="0.35" />
      <ellipse cx="18" cy="56" rx="7" ry="10" fill="none" stroke={elemColor} strokeWidth="0.8" opacity="0.5" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function defaultSupport(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`heal-${uid}`} cx="30%" cy="30%" r="40%">
          <stop offset="0%" stopColor={elemColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Healing aura */}
      <circle cx="30" cy="40" r="16" fill={`url(#heal-${uid})`} />
      {/* Robed figure with staff */}
      <path d="M 38 44 L 32 50 L 30 66 L 34 80 L 42 86 L 50 88 L 58 86 L 66 80 L 70 66 L 68 50 L 62 44 L 56 42 L 44 42 Z" fill="#1a1a2e" />
      <ellipse cx="50" cy="30" rx="8" ry="9" fill="#1a1a2e" />
      <path d="M 42 26 Q 38 30 34 36" stroke="#2a2a3e" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 58 26 Q 62 30 66 36" stroke="#2a2a3e" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Staff */}
      <line x1="28" y1="16" x2="28" y2="70" stroke={elemColor} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <circle cx="28" cy="14" r="3" fill={elemColor} opacity="0.5" />
      <circle cx="28" cy="14" r="5" fill="none" stroke={elemColor} strokeWidth="0.5" opacity="0.3" />
      {portraitOverlay(uid)}
    </>
  );
}

function defaultBruiser(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Bulky figure with axe */}
      <path d="M 34 44 L 26 50 L 24 64 L 28 80 L 38 86 L 50 88 L 62 86 L 72 80 L 76 64 L 74 50 L 66 44 L 56 40 L 44 40 Z" fill="#1a1a2e" />
      <ellipse cx="50" cy="30" rx="9" ry="10" fill="#1a1a2e" />
      {/* Raised arm */}
      <path d="M 62 44 L 70 34 L 74 24 L 72 22 L 68 32 L 60 42 Z" fill="#1a1a2e" />
      {/* Axe handle */}
      <line x1="72" y1="10" x2="72" y2="30" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" />
      {/* Axe head */}
      <path d="M 72 10 Q 82 14 82 20 Q 82 26 72 30 L 72 10 Z" fill={elemColor} opacity="0.6" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

function defaultDebuffer(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      <defs>
        <radialGradient id={`dark-${uid}`} cx="70%" cy="60%" r="30%">
          <stop offset="0%" stopColor={elemColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={elemColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Hooded figure with glowing hand */}
      <path d="M 34 36 Q 28 48 26 68 L 30 84 L 42 88 L 50 90 L 58 88 L 70 84 L 74 68 Q 72 48 66 36 L 58 30 L 50 28 L 42 30 Z" fill="#0e0e1a" />
      {/* Hood */}
      <path d="M 38 32 Q 36 18 44 12 Q 50 8 56 12 Q 64 18 62 32 Q 58 26 50 24 Q 42 26 38 32 Z" fill="#0e0e1a" />
      <ellipse cx="50" cy="28" rx="6" ry="5" fill="#0a0a14" />
      {/* Glowing eyes */}
      <circle cx="47" cy="27" r="1.2" fill={elemColor} opacity="0.8" />
      <circle cx="53" cy="27" r="1.2" fill={elemColor} opacity="0.8" />
      {/* Raised glowing hand */}
      <path d="M 62 42 L 70 36 L 74 30 L 72 28 L 68 34 L 60 40 Z" fill="#0e0e1a" />
      <circle cx="74" cy="28" r="5" fill={`url(#dark-${uid})`} />
      <circle cx="74" cy="28" r="3" fill={elemColor} opacity="0.3" />
      <circle cx="74" cy="28" r="1.5" fill={elemColor} opacity="0.5" />
      {portraitOverlay(uid)}
    </>
  );
}

function defaultCreature(uid, elemColor, gradColors, isActive) {
  return (
    <>
      {portraitBase(uid, elemColor, gradColors, isActive)}
      {/* Monstrous hunched figure with claws */}
      <path d="M 36 42 L 26 48 L 22 62 L 26 78 L 36 86 L 50 88 L 64 86 L 74 78 L 78 62 L 74 48 L 64 42 L 56 38 L 44 38 Z" fill="#1a1a2e" />
      {/* Hunched back */}
      <path d="M 40 38 Q 44 30 50 28 Q 56 30 60 38" fill="#1a1a2e" />
      {/* Monstrous head - no neck, wide */}
      <ellipse cx="50" cy="30" rx="10" ry="8" fill="#1a1a2e" />
      {/* Glowing eyes - wide set */}
      <circle cx="44" cy="28" r="2" fill={elemColor} opacity="0.7" />
      <circle cx="56" cy="28" r="2" fill={elemColor} opacity="0.7" />
      {/* Fangs */}
      <path d="M 44 34 L 46 38" stroke="#888" strokeWidth="1" />
      <path d="M 56 34 L 54 38" stroke="#888" strokeWidth="1" />
      {/* Claw arms */}
      <path d="M 26 48 L 18 42 L 14 38" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
      <path d="M 14 38 L 10 34 M 14 38 L 12 32 M 14 38 L 16 34" stroke={elemColor} strokeWidth="1" opacity="0.5" />
      <path d="M 74 48 L 82 42 L 86 38" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
      <path d="M 86 38 L 90 34 M 86 38 L 88 32 M 86 38 L 84 34" stroke={elemColor} strokeWidth="1" opacity="0.5" />
      {elementParticles(null, elemColor)}
      {portraitOverlay(uid)}
    </>
  );
}

// ─── ROLE LOOKUP FOR DEFAULTS ────────────────────────────────────────────────

const UNIT_ROLE_HINTS = {
  // Norse
  thor: 'attacker', freya: 'support', odin: 'support', loki: 'debuffer', fenrir: 'bruiser', tyr: 'attacker', heimdall: 'tank',
  // Egyptian
  anubis: 'debuffer', ra: 'attacker', bastet: 'attacker', isis: 'support', set: 'bruiser', sobek: 'tank', thoth: 'support',
  // Celtic
  morganLeFay: 'debuffer', merlin: 'support', nimue: 'support', cuChulainn: 'attacker',
  // Japanese
  amaterasu: 'support', susanoo: 'attacker', raijin: 'bruiser', tsukuyomi: 'debuffer', izanami: 'debuffer', benzaiten: 'support',
  // Creatures
  goblin: 'creature', skeleton: 'creature', slime: 'creature', imp: 'creature',
  bat: 'creature', wolf: 'creature', serpent: 'creature', wraith: 'creature',
  harpy: 'creature', golem: 'creature', minotaur: 'creature', chimera: 'creature',
  hydra: 'creature', phoenix_chick: 'creature', shadow_sprite: 'creature',
};

const ROLE_PORTRAIT_MAP = {
  attacker: defaultAttacker,
  tank: defaultTank,
  support: defaultSupport,
  bruiser: defaultBruiser,
  debuffer: defaultDebuffer,
  creature: defaultCreature,
};

function getPortraitRenderer(unitId) {
  if (HERO_PORTRAITS[unitId]) return HERO_PORTRAITS[unitId];
  const roleHint = UNIT_ROLE_HINTS[unitId];
  if (roleHint && ROLE_PORTRAIT_MAP[roleHint]) return ROLE_PORTRAIT_MAP[roleHint];
  return defaultAttacker; // fallback
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function HeroPortrait({
  unitId,
  element,
  faction,
  size = 48,
  isActive = false,
}) {
  const hero = HERO_DATA[unitId];

  useEffect(() => {
    injectKeyframes();
  }, []);

  const elemColor = useMemo(
    () => ELEMENT_COLORS[element] || ELEMENT_COLORS[hero?.element] || '#888',
    [element, hero],
  );

  const factionKey = faction || hero?.faction;
  const gradColors = useMemo(
    () => FACTION_GRADIENTS[factionKey] || DEFAULT_GRADIENT,
    [factionKey],
  );

  const uid = useMemo(
    () => `hp-${unitId}-${unitId + '_' + (element || '').slice(0, 2)}`,
    [unitId],
  );

  const renderer = useMemo(() => getPortraitRenderer(unitId), [unitId]);

  const svgContent = useMemo(
    () => renderer(uid, elemColor, gradColors, isActive),
    [renderer, uid, elemColor, gradColors, isActive],
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${unitId} portrait`}
      style={{
        flexShrink: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'block',
      }}
    >
      {svgContent}
    </svg>
  );
}

// ─── EXPORTS (backward compat) ───────────────────────────────────────────────

export { HERO_DATA, ELEMENT_COLORS, FACTION_COLORS };

HeroPortrait.HERO_DATA = HERO_DATA;
HeroPortrait.ELEMENT_COLORS = ELEMENT_COLORS;
HeroPortrait.FACTION_COLORS = FACTION_COLORS;
