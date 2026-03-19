'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { initUnits, advanceTurnMeters, executeTurn, isTeamDefeated, getTurnOrder } from '../engine/battleEngine';
import { isStunned } from '../engine/effectSystem';
import { decideAction } from '../engine/aiSystem';
import { teamATemplates, teamBTemplates } from '../data/units';
import { BattlePhase, SkillTarget } from '../constants/enums';
import { BATTLE_START_DELAY, TURN_TRANSITION_DELAY, AI_THINK_DELAY, TURN_ORDER_DISPLAY_COUNT } from '../constants/battleConstants';
import UnitCard from './UnitCard';
import SkillButtons from './SkillButtons';
import CombatLog from './CombatLog';

const PHASE = BattlePhase;

export default function BattleUI() {
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [phase, setPhase] = useState(PHASE.READY);
  const [activeUnit, setActiveUnit] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [logs, setLogs] = useState([]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [winner, setWinner] = useState(null);
  const [turnCount, setTurnCount] = useState(0);

  // Ref for mutable state in callbacks
  const stateRef = useRef({ teamA: [], teamB: [] });

  const addLogs = useCallback((newLogs) => {
    setLogs(prev => [...prev, ...newLogs]);
  }, []);

  const updateState = useCallback(() => {
    setTeamA([...stateRef.current.teamA]);
    setTeamB([...stateRef.current.teamB]);
    setTurnOrder(getTurnOrder([...stateRef.current.teamA, ...stateRef.current.teamB]));
  }, []);

  // --- Start Battle ---
  const startBattle = useCallback(() => {
    const a = initUnits(teamATemplates);
    const b = initUnits(teamBTemplates);
    stateRef.current = { teamA: a, teamB: b };
    setTeamA(a);
    setTeamB(b);
    setLogs([{ type: 'info', message: '═══ GODS OF THE REALMS — WAR OF WORLDS ═══' }]);
    setWinner(null);
    setTurnCount(0);
    setPhase(PHASE.READY);

    // Start first turn
    setTimeout(() => nextTurn(a, b), BATTLE_START_DELAY);
  }, []);

  // --- Next Turn ---
  const nextTurn = useCallback((tA, tB) => {
    const a = tA || stateRef.current.teamA;
    const b = tB || stateRef.current.teamB;
    const all = [...a, ...b];

    // Check for battle end
    if (isTeamDefeated(a)) {
      setWinner('Team B');
      setPhase(PHASE.BATTLE_OVER);
      addLogs([{ type: 'battle_end', message: 'Team B (Enemy) wins!' }]);
      return;
    }
    if (isTeamDefeated(b)) {
      setWinner('Team A');
      setPhase(PHASE.BATTLE_OVER);
      addLogs([{ type: 'battle_end', message: 'Team A (Player) wins!' }]);
      return;
    }

    // Advance turn meters
    const unit = advanceTurnMeters(all);
    if (!unit) return;

    setActiveUnit(unit);
    setTurnCount(prev => prev + 1);
    setTurnOrder(getTurnOrder(all));
    updateState();

    addLogs([{ type: 'turn_start', unit: unit.name }]);

    // Check if stunned — skip turn
    if (isStunned(unit)) {
      const stunLogs = executeTurn(unit, unit.skills[0], [], a, b);
      addLogs(stunLogs);
      updateState();
      setTimeout(() => nextTurn(), TURN_TRANSITION_DELAY);
      return;
    }

    // Determine if player or AI
    const isPlayer = a.some(u => u.id === unit.id);
    if (isPlayer) {
      setPhase(PHASE.PLAYER_TURN);
    } else {
      setPhase(PHASE.AI_TURN);
      setTimeout(() => executeAITurn(unit, a, b), AI_THINK_DELAY);
    }
  }, [addLogs, updateState]);

  // --- AI Turn ---
  const executeAITurn = useCallback((unit, tA, tB) => {
    const a = tA || stateRef.current.teamA;
    const b = tB || stateRef.current.teamB;
    const action = decideAction(unit, b, a); // AI allies = teamB, enemies = teamA
    if (!action) return;

    const turnLogs = executeTurn(unit, action.skill, action.targets, b, a);
    addLogs(turnLogs);
    updateState();
    setTimeout(() => nextTurn(), TURN_TRANSITION_DELAY);
  }, [addLogs, updateState, nextTurn]);

  // --- Player Skill Selection ---
  const handleSkillSelect = useCallback((skill) => {
    setSelectedSkill(skill);

    const a = stateRef.current.teamA;
    const b = stateRef.current.teamB;

    // Auto-target for AoE and team skills
    if (skill.target === SkillTarget.ALL_ENEMIES) {
      const targets = b.filter(u => u.alive);
      const turnLogs = executeTurn(activeUnit, skill, targets, a, b);
      addLogs(turnLogs);
      setSelectedSkill(null);
      setPhase(PHASE.READY);
      updateState();
      setTimeout(() => nextTurn(), TURN_TRANSITION_DELAY);
    } else if (skill.target === SkillTarget.ALL_ALLIES) {
      const targets = a.filter(u => u.alive);
      const turnLogs = executeTurn(activeUnit, skill, targets, a, b);
      addLogs(turnLogs);
      setSelectedSkill(null);
      setPhase(PHASE.READY);
      updateState();
      setTimeout(() => nextTurn(), TURN_TRANSITION_DELAY);
    } else {
      // Need target selection
      setPhase(PHASE.PLAYER_TARGET);
    }
  }, [activeUnit, addLogs, updateState, nextTurn]);

  // --- Player Target Selection ---
  const handleTargetSelect = useCallback((target) => {
    if (!selectedSkill || !activeUnit) return;

    const a = stateRef.current.teamA;
    const b = stateRef.current.teamB;

    const turnLogs = executeTurn(activeUnit, selectedSkill, [target], a, b);
    addLogs(turnLogs);
    setSelectedSkill(null);
    setPhase(PHASE.READY);
    updateState();
    setTimeout(() => nextTurn(), TURN_TRANSITION_DELAY);
  }, [selectedSkill, activeUnit, addLogs, updateState, nextTurn]);

  // --- Render ---
  const isPlayerTurn = phase === PHASE.PLAYER_TURN || phase === PHASE.PLAYER_TARGET;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a1a',
      color: '#eee',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: 20,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#FFD700', letterSpacing: 2 }}>
          GODS OF THE REALMS
        </h1>
        <div style={{ color: '#999', fontSize: 14, marginTop: 4, letterSpacing: 4, textTransform: 'uppercase' }}>
          War of Worlds
        </div>
        {phase === PHASE.READY && teamA.length === 0 && (
          <button
            onClick={startBattle}
            style={{
              marginTop: 16,
              padding: '12px 32px',
              fontSize: 16,
              fontWeight: 'bold',
              backgroundColor: '#FFD700',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            START BATTLE
          </button>
        )}
        {teamA.length > 0 && (
          <div style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
            Turn {turnCount}
            {winner && ` • Winner: ${winner}`}
            {phase === PHASE.BATTLE_OVER && (
              <button
                onClick={startBattle}
                style={{
                  marginLeft: 12,
                  padding: '4px 16px',
                  fontSize: 12,
                  backgroundColor: '#FFD700',
                  color: '#000',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                REMATCH
              </button>
            )}
          </div>
        )}
      </div>

      {teamA.length > 0 && (
        <>
          {/* Turn Order Bar */}
          <div style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
          }}>
            <span style={{ color: '#666', fontSize: 11, alignSelf: 'center', marginRight: 4 }}>NEXT →</span>
            {turnOrder.slice(0, TURN_ORDER_DISPLAY_COUNT).map((u, i) => (
              <span key={u.id} style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: i === 0 ? '#2a2a4a' : '#111',
                color: i === 0 ? '#FFD700' : '#888',
                border: `1px solid ${i === 0 ? '#FFD700' : '#333'}`,
              }}>
                {u.name} ({u.turnMeter}%)
              </span>
            ))}
          </div>

          {/* Main Battle Layout */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Team A */}
            <div style={{ flex: '1 1 240px', maxWidth: 280 }}>
              <h3 style={{ color: '#4CAF50', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
                TEAM A (Player)
              </h3>
              {teamA.map(unit => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  isActive={activeUnit?.id === unit.id}
                />
              ))}
            </div>

            {/* Center — Combat Log + Skills */}
            <div style={{ flex: '2 1 400px', maxWidth: 520 }}>
              {/* Player Action Panel */}
              {isPlayerTurn && activeUnit && (
                <div style={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #FFD700',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#FFD700', fontSize: 13, marginBottom: 8 }}>
                    {phase === PHASE.PLAYER_TARGET
                      ? `Select a target for ${selectedSkill?.name}`
                      : `${activeUnit.name}'s turn — Choose a skill`
                    }
                  </div>
                  {phase === PHASE.PLAYER_TURN && (
                    <SkillButtons
                      unit={activeUnit}
                      onSkillSelect={handleSkillSelect}
                      disabled={false}
                    />
                  )}
                </div>
              )}

              {/* AI acting indicator */}
              {phase === PHASE.AI_TURN && activeUnit && (
                <div style={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #F44336',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  textAlign: 'center',
                  color: '#F44336',
                  fontSize: 13,
                }}>
                  {activeUnit.name} is thinking...
                </div>
              )}

              <CombatLog logs={logs} />
            </div>

            {/* Team B */}
            <div style={{ flex: '1 1 240px', maxWidth: 280 }}>
              <h3 style={{ color: '#F44336', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
                TEAM B (Enemy)
              </h3>
              {teamB.map(unit => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  isActive={activeUnit?.id === unit.id}
                  onClick={
                    phase === PHASE.PLAYER_TARGET && unit.alive
                      ? () => handleTargetSelect(unit)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
