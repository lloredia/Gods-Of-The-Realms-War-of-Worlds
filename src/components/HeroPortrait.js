'use client';

import { useMemo } from 'react';

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

const HERO_DATA = {
  // The Pantheon (Greek)
  zeus:        { symbol: '\u26A1',     element: 'Storm',      faction: 'Pantheon' },
  poseidon:    { symbol: '\uD83D\uDD31', element: 'Ocean',   faction: 'Pantheon' },
  hades:       { symbol: '\uD83D\uDC80', element: 'Underworld', faction: 'Pantheon' },
  apollo:      { symbol: '\u2600',     element: 'Sun',        faction: 'Pantheon' },
  ares:        { symbol: '\u2694',     element: 'Storm',      faction: 'Pantheon' },
  athena:      { symbol: '\uD83D\uDEE1', element: 'Moon',    faction: 'Pantheon' },

  // The Allfather's Hall (Norse)
  thor:        { symbol: '\uD83D\uDD28', element: 'Storm',   faction: 'Norse' },
  freya:       { symbol: '\uD83E\uDEB6', element: 'Moon',    faction: 'Norse' },
  odin:        { symbol: '\uD83D\uDC41', element: 'Sun',     faction: 'Norse' },
  loki:        { symbol: '\uD83D\uDC0D', element: 'Underworld', faction: 'Norse' },
  fenrir:      { symbol: '\uD83D\uDC3A', element: 'Underworld', faction: 'Norse' },

  // The Eternal Sands (Egyptian)
  anubis:      { symbol: '\u2625',     element: 'Underworld', faction: 'Egyptian' },
  ra:          { symbol: '\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8\uFE0F', element: 'Sun', faction: 'Egyptian', fallbackSymbol: '\u2609' },
  bastet:      { symbol: '\uD83D\uDC31', element: 'Moon',    faction: 'Egyptian' },
  isis:        { symbol: '\uD83E\uDEBD', element: 'Ocean',   faction: 'Egyptian' },
  set:         { symbol: '\uD83C\uDF2A', element: 'Storm',   faction: 'Egyptian' },

  // The Mist Realm (Celtic)
  morganLeFay: { symbol: '\uD83C\uDF19', element: 'Moon',    faction: 'Celtic' },
  merlin:      { symbol: '\u2726',     element: 'Sun',        faction: 'Celtic' },
  nimue:       { symbol: '\uD83C\uDF0A', element: 'Ocean',   faction: 'Celtic' },
  cuChulainn:  { symbol: '\uD83D\uDDE1', element: 'Storm',   faction: 'Celtic' },

  // The Rising Sun (Japanese)
  amaterasu:   { symbol: '\uD83C\uDF05', element: 'Sun',     faction: 'Japanese' },
  susanoo:     { symbol: '\u26E9',     element: 'Ocean',      faction: 'Japanese' },
  raijin:      { symbol: '\uD83E\uDD41', element: 'Storm',   faction: 'Japanese' },
  tsukuyomi:   { symbol: '\uD83C\uDF11', element: 'Moon',    faction: 'Japanese' },
  izanami:     { symbol: '\uD83D\uDC7B', element: 'Underworld', faction: 'Japanese' },
  benzaiten:   { symbol: '\uD83C\uDFB5', element: 'Ocean',   faction: 'Japanese' },
};

const PULSE_KEYFRAMES = `
@keyframes heroPortraitPulse {
  0%, 100% {
    box-shadow:
      0 0 4px var(--glow-color),
      0 0 8px var(--glow-color),
      inset 0 0 4px rgba(0, 0, 0, 0.5);
  }
  50% {
    box-shadow:
      0 0 8px var(--glow-color),
      0 0 18px var(--glow-color),
      0 0 28px color-mix(in srgb, var(--glow-color) 40%, transparent),
      inset 0 0 4px rgba(0, 0, 0, 0.5);
  }
}
`;

let stylesInjected = false;

function injectKeyframes() {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = PULSE_KEYFRAMES;
  document.head.appendChild(style);
  stylesInjected = true;
}

export default function HeroPortrait({
  unitId,
  element,
  faction,
  size = 48,
  isActive = false,
}) {
  const hero = HERO_DATA[unitId];

  const elementColor = useMemo(
    () => ELEMENT_COLORS[element] || ELEMENT_COLORS[hero?.element] || '#888',
    [element, hero],
  );

  const factionColor = useMemo(
    () => FACTION_COLORS[faction] || FACTION_COLORS[hero?.faction] || '#555',
    [faction, hero],
  );

  const symbol = hero?.symbol ?? '?';
  const fontSize = Math.round(size * 0.57);

  // Inject keyframes on first render in the browser
  if (typeof document !== 'undefined') {
    injectKeyframes();
  }

  const containerStyle = {
    '--glow-color': elementColor,
    position: 'relative',
    width: size,
    height: size,
    borderRadius: '50%',
    border: `2px solid ${elementColor}`,
    background: `radial-gradient(circle at 35% 35%, ${factionColor}33 0%, ${factionColor}18 40%, #0a0a0f 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isActive
      ? undefined
      : `0 0 4px ${elementColor}, 0 0 8px ${elementColor}, inset 0 0 4px rgba(0, 0, 0, 0.5)`,
    animation: isActive ? 'heroPortraitPulse 2s ease-in-out infinite' : 'none',
    cursor: 'default',
    userSelect: 'none',
    flexShrink: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  const symbolStyle = {
    fontSize,
    lineHeight: 1,
    textAlign: 'center',
    color: '#fff',
    textShadow: `0 0 4px ${elementColor}, 0 0 8px ${elementColor}80`,
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
    pointerEvents: 'none',
  };

  // Subtle inner vignette overlay for depth
  const vignetteStyle = {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background:
      'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.45) 100%)',
    pointerEvents: 'none',
  };

  // Small highlight dot in the upper-left for a glass-like sheen
  const sheenStyle = {
    position: 'absolute',
    top: '14%',
    left: '18%',
    width: '18%',
    height: '18%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 100%)',
    pointerEvents: 'none',
  };

  return (
    <div
      style={containerStyle}
      role="img"
      aria-label={`${unitId} portrait`}
      title={unitId}
    >
      <div style={vignetteStyle} />
      <div style={sheenStyle} />
      <span style={symbolStyle}>{symbol}</span>
    </div>
  );
}

HeroPortrait.HERO_DATA = HERO_DATA;
HeroPortrait.ELEMENT_COLORS = ELEMENT_COLORS;
HeroPortrait.FACTION_COLORS = FACTION_COLORS;
