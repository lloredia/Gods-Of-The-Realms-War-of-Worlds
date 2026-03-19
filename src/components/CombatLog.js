'use client';

import { useEffect, useRef } from 'react';
import { LogType } from '../constants/enums';

const LOG_COLORS = {
  [LogType.DAMAGE]: '#FF7043',
  [LogType.HEAL]: '#66BB6A',
  [LogType.DEATH]: '#F44336',
  [LogType.BUFF_APPLIED]: '#42A5F5',
  [LogType.DEBUFF_APPLIED]: '#AB47BC',
  [LogType.STUNNED]: '#FFB300',
  [LogType.RESISTED]: '#78909C',
  [LogType.BLOCKED]: '#78909C',
  [LogType.EFFECT_EXPIRE]: '#607D8B',
  [LogType.HEAL_BLOCKED]: '#E57373',
  [LogType.TURN_START]: '#00BCD4',
  [LogType.BATTLE_END]: '#FFD700',
  [LogType.INFO]: '#9E9E9E',
  [LogType.PASSIVE]: '#80CBC4',
  [LogType.REVIVE]: '#FFD740',
  [LogType.CLEANSE]: '#4DD0E1',
  [LogType.STRIP]: '#FF80AB',
  [LogType.MULTI_HIT]: '#FF7043',
};

export default function CombatLog({ logs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  // Track whether we've seen the first turn_start
  let seenFirstTurn = false;

  return (
    <div style={{
      backgroundColor: '#0d0d1a',
      border: '1px solid #333',
      borderRadius: 8,
      padding: 12,
      height: 360,
      overflowY: 'auto',
      fontSize: 12,
      fontFamily: 'monospace',
    }}>
      <div style={{ color: '#666', marginBottom: 8, fontWeight: 'bold', fontSize: 13 }}>
        COMBAT LOG
      </div>
      {logs.map((log, i) => {
        const isTurnStart = log.type === 'turn_start';
        const showSeparator = isTurnStart && seenFirstTurn;
        if (isTurnStart) seenFirstTurn = true;

        return (
          <div key={i}>
            {showSeparator && (
              <hr style={{
                border: 'none',
                borderTop: '1px solid #2a2a3a',
                margin: '6px 0',
              }} />
            )}
            <div style={{ color: LOG_COLORS[log.type] || '#ccc', marginBottom: 3, lineHeight: 1.4 }}>
              {formatLog(log)}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

function formatLog(log) {
  switch (log.type) {
    case 'turn_start':
      return `▶ ${log.unit}'s turn`;
    case 'damage': {
      const elemTag = log.elementAdvantage === 'advantage' ? ' ▲ELM' : log.elementAdvantage === 'disadvantage' ? ' ▼ELM' : log.elementAdvantage === 'mutual' ? ' ⚡ELM' : '';
      const hitsTag = log.hits > 1 ? ` (${log.hits} hits)` : '';
      return `⚔ ${log.attacker} → ${log.target} [${log.skill}] ${log.isCrit ? 'CRIT! ' : ''}${log.damage} dmg${elemTag}${hitsTag} (${log.remainingHP} HP left)`;
    }
    case 'heal':
      return `✚ ${log.caster} heals ${log.target} [${log.skill}] +${log.amount} HP (${log.remainingHP} HP)`;
    case 'death':
      return `☠ ${log.unit} has been defeated!`;
    case 'buff_applied':
      return `↑ ${log.target} gains ${log.effect}`;
    case 'debuff_applied':
      return `↓ ${log.message}`;
    case 'stunned':
      return `⊘ ${log.message}`;
    case 'resisted':
      return `⊗ ${log.target} resisted ${log.effect}`;
    case 'blocked':
      return `🛡 ${log.target} blocked ${log.effect} (Immunity)`;
    case 'effect_expire':
      return `○ ${log.unit}'s ${log.effect} expired`;
    case 'heal_blocked':
      return `✘ ${log.message}`;
    case 'battle_end':
      return `★ ${log.message}`;
    case 'passive':
      return `✦ ${log.message}`;
    case 'revive':
      return `✟ ${log.message}`;
    case 'cleanse':
      return `◇ ${log.message}`;
    case 'strip':
      return `◆ ${log.message}`;
    case 'info':
      return `  ${log.message}`;
    default:
      return log.message || JSON.stringify(log);
  }
}
