'use client';

import { useMemo } from 'react';

// Leveling constants
const MAX_LEVEL = 40;
const MAX_STARS = 6;
const AWAKEN_COST = 20;
const AWAKEN_MIN_STARS = 5;

// Level cap per star tier: stars 1->10, 2->15, 3->20, 4->25, 5->30, 6->40
function maxLevelForStars(stars) {
  if (stars >= 6) return MAX_LEVEL;
  return 5 + stars * 5;
}

// Stat growth per level (percentage of base)
const STAT_GROWTH_PER_LEVEL = 0.03; // 3% per level
const STAR_MULTIPLIER = 0.12; // 12% per star
const AWAKEN_BONUS = 0.15; // 15% flat bonus

function calcStatMultiplier(level, stars, awakened) {
  return 1 + (level - 1) * STAT_GROWTH_PER_LEVEL + (stars - 1) * STAR_MULTIPLIER + (awakened ? AWAKEN_BONUS : 0);
}

export default function LevelUpPanel({ hero, resources, onLevelUp, onStarUp, onAwaken }) {
  const level = hero.level || 1;
  const stars = hero.stars || 1;
  const awakened = hero.awakened || false;

  const gold = resources?.gold ?? 0;
  const essences = resources?.essences ?? 0;
  const awakenStones = resources?.awakenStones ?? 0;

  // Costs
  const levelUpCost = 100 * level;
  const starUpCost = 10 * stars;
  const levelCap = maxLevelForStars(stars);

  // Can perform actions?
  const canLevelUp = level < levelCap && gold >= levelUpCost;
  const atLevelCap = level >= levelCap;
  const canStarUp = stars < MAX_STARS && atLevelCap && essences >= starUpCost;
  const canAwaken = !awakened && stars >= AWAKEN_MIN_STARS && awakenStones >= AWAKEN_COST;

  // Stat preview
  const preview = useMemo(() => {
    const baseHP = hero.maxHP || 8000;
    const baseATK = hero.attack || 700;
    const baseDEF = hero.defense || 450;
    const baseSPD = hero.speed || 100;

    const currentMult = calcStatMultiplier(level, stars, awakened);

    // After level up
    const nextLevelMult = level < levelCap ? calcStatMultiplier(level + 1, stars, awakened) : null;
    // After star up
    const nextStarMult = stars < MAX_STARS && atLevelCap ? calcStatMultiplier(1, stars + 1, awakened) : null;
    // After awaken
    const awakenMult = !awakened && stars >= AWAKEN_MIN_STARS ? calcStatMultiplier(level, stars, true) : null;

    function applyMult(base, mult) {
      return Math.round(base * mult);
    }

    return {
      current: { hp: applyMult(baseHP, currentMult), atk: applyMult(baseATK, currentMult), def: applyMult(baseDEF, currentMult), spd: applyMult(baseSPD, currentMult) },
      afterLevel: nextLevelMult ? { hp: applyMult(baseHP, nextLevelMult), atk: applyMult(baseATK, nextLevelMult), def: applyMult(baseDEF, nextLevelMult), spd: applyMult(baseSPD, nextLevelMult) } : null,
      afterStar: nextStarMult ? { hp: applyMult(baseHP, nextStarMult), atk: applyMult(baseATK, nextStarMult), def: applyMult(baseDEF, nextStarMult), spd: applyMult(baseSPD, nextStarMult) } : null,
      afterAwaken: awakenMult ? { hp: applyMult(baseHP, awakenMult), atk: applyMult(baseATK, awakenMult), def: applyMult(baseDEF, awakenMult), spd: applyMult(baseSPD, awakenMult) } : null,
    };
  }, [hero, level, stars, awakened, levelCap, atLevelCap]);

  const panelStyle = {
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    color: '#eee',
    fontFamily: 'inherit',
  };

  const headerStyle = {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  };

  const statusRowStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    fontSize: 13,
  };

  const resourceBarStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 14,
    fontSize: 11,
    color: '#aaa',
  };

  function actionBtnStyle(enabled) {
    return {
      flex: 1,
      padding: '8px 6px',
      fontSize: 11,
      fontWeight: 'bold',
      border: 'none',
      borderRadius: 6,
      cursor: enabled ? 'pointer' : 'not-allowed',
      backgroundColor: enabled ? '#2a5a1a' : '#2a2a3a',
      color: enabled ? '#7fff5a' : '#555',
      transition: 'background-color 0.15s',
      textAlign: 'center',
      lineHeight: 1.4,
    };
  }

  function awakenBtnStyle(enabled) {
    return {
      flex: 1,
      padding: '8px 6px',
      fontSize: 11,
      fontWeight: 'bold',
      border: 'none',
      borderRadius: 6,
      cursor: enabled ? 'pointer' : 'not-allowed',
      backgroundColor: enabled ? '#5a4a0a' : '#2a2a3a',
      color: enabled ? '#FFD700' : '#555',
      transition: 'background-color 0.15s',
      textAlign: 'center',
      lineHeight: 1.4,
    };
  }

  const statPreviewStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 4,
    fontSize: 10,
    color: '#aaa',
    marginTop: 10,
    padding: '8px 10px',
    backgroundColor: '#12122a',
    borderRadius: 6,
  };

  function renderDelta(current, next) {
    if (next == null) return null;
    const diff = next - current;
    if (diff === 0) return null;
    return (
      <span style={{ color: diff > 0 ? '#4CAF50' : '#F44336', fontSize: 9, marginLeft: 4 }}>
        {diff > 0 ? '+' : ''}{diff}
      </span>
    );
  }

  // Determine which preview to show (prioritize the most relevant action)
  const activePreview = canLevelUp ? 'level' : canStarUp ? 'star' : canAwaken ? 'awaken' : null;
  const nextStats = activePreview === 'level' ? preview.afterLevel
    : activePreview === 'star' ? preview.afterStar
    : activePreview === 'awaken' ? preview.afterAwaken
    : null;
  const previewLabel = activePreview === 'level' ? 'After Level Up'
    : activePreview === 'star' ? 'After Star Up'
    : activePreview === 'awaken' ? 'After Awaken'
    : null;

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>Hero Advancement</div>

      {/* Current status */}
      <div style={statusRowStyle}>
        <span style={{ color: '#FFD740' }}>{'★'.repeat(stars)}{'☆'.repeat(MAX_STARS - stars)}</span>
        <span>Lv <strong>{level}</strong> / {levelCap}</span>
        {awakened && <span style={{ color: '#E040FB', fontSize: 11 }}>AWAKENED</span>}
      </div>

      {/* Resources */}
      <div style={resourceBarStyle}>
        <span>Gold: <strong style={{ color: '#FFD700' }}>{gold.toLocaleString()}</strong></span>
        <span>Essences: <strong style={{ color: '#CE93D8' }}>{essences}</strong></span>
        <span>Awaken Stones: <strong style={{ color: '#E040FB' }}>{awakenStones}</strong></span>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <button
          style={actionBtnStyle(canLevelUp)}
          disabled={!canLevelUp}
          onClick={() => canLevelUp && onLevelUp?.(hero.id)}
        >
          Level Up<br />
          <span style={{ fontSize: 9, opacity: 0.8 }}>
            {level >= levelCap ? (stars >= MAX_STARS ? 'MAX' : 'Star Up First') : `${levelUpCost.toLocaleString()} Gold`}
          </span>
        </button>

        <button
          style={actionBtnStyle(canStarUp)}
          disabled={!canStarUp}
          onClick={() => canStarUp && onStarUp?.(hero.id)}
        >
          Star Up<br />
          <span style={{ fontSize: 9, opacity: 0.8 }}>
            {stars >= MAX_STARS ? 'MAX' : !atLevelCap ? `Reach Lv ${levelCap}` : `${starUpCost} Essences`}
          </span>
        </button>

        <button
          style={awakenBtnStyle(canAwaken)}
          disabled={!canAwaken}
          onClick={() => canAwaken && onAwaken?.(hero.id)}
        >
          Awaken<br />
          <span style={{ fontSize: 9, opacity: 0.8 }}>
            {awakened ? 'DONE' : stars < AWAKEN_MIN_STARS ? `Need ${AWAKEN_MIN_STARS}★` : `${AWAKEN_COST} Stones`}
          </span>
        </button>
      </div>

      {/* Stat preview */}
      {nextStats && (
        <div>
          <div style={{ fontSize: 10, color: '#888', textAlign: 'center', marginTop: 8, marginBottom: 2 }}>
            {previewLabel}
          </div>
          <div style={statPreviewStyle}>
            <span>HP {preview.current.hp}{renderDelta(preview.current.hp, nextStats.hp)}</span>
            <span>ATK {preview.current.atk}{renderDelta(preview.current.atk, nextStats.atk)}</span>
            <span>DEF {preview.current.def}{renderDelta(preview.current.def, nextStats.def)}</span>
            <span>SPD {preview.current.spd}{renderDelta(preview.current.spd, nextStats.spd)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
