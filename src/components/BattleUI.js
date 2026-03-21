'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { initUnits, advanceTurnMeters, executeTurn, isTeamDefeated, getTurnOrder } from '../engine/battleEngine';
import { isStunned } from '../engine/effectSystem';
import { decideAction } from '../engine/aiSystem';
import { teamATemplates, teamBTemplates, heroRoster } from '../data/units';
import { BattlePhase, SkillTarget } from '../constants/enums';
import { BATTLE_START_DELAY, TURN_TRANSITION_DELAY, AI_THINK_DELAY, TURN_ORDER_DISPLAY_COUNT } from '../constants/battleConstants';
import { getElementMultiplier } from '../constants/elementTable';
import { setSeed, clearSeed } from '../utils/random';
import { SFX } from '../utils/soundSystem';
import UnitCard from './UnitCard';
import SkillButtons from './SkillButtons';
import CombatLog from './CombatLog';
import BattleResults from './BattleResults';
import SkillEffect from './SkillEffect';

const PHASE = BattlePhase;

export default function BattleUI({ playerTeam, enemyTeam, onExit, stageInfo }) {
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [phase, setPhase] = useState(PHASE.READY);
  const [activeUnit, setActiveUnit] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [logs, setLogs] = useState([]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [winner, setWinner] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [autoBattle, setAutoBattle] = useState(false);
  const [battleSpeed, setBattleSpeed] = useState(1);
  const [animations, setAnimations] = useState({});
  const [skillEffect, setSkillEffect] = useState(null);

  // Ref for mutable state in callbacks
  const stateRef = useRef({ teamA: [], teamB: [] });
  const autoBattleRef = useRef(false);
  const speedRef = useRef(1);
  const animTimersRef = useRef({});
  const skillEffectTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const turnTimerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
      Object.values(animTimersRef.current).forEach(t => clearTimeout(t));
    };
  }, []);

  useEffect(() => { autoBattleRef.current = autoBattle; }, [autoBattle]);
  useEffect(() => { speedRef.current = battleSpeed; }, [battleSpeed]);

  const speedMultiplier = battleSpeed;

  const addLogs = useCallback((newLogs) => {
    setLogs(prev => [...prev, ...newLogs]);
  }, []);

  const updateState = useCallback(() => {
    setTeamA([...stateRef.current.teamA]);
    setTeamB([...stateRef.current.teamB]);
    setTurnOrder(getTurnOrder([...stateRef.current.teamA, ...stateRef.current.teamB]));
  }, []);

  const triggerAnimation = useCallback((unitId, animClass, duration = 500) => {
    if (animTimersRef.current[unitId]) clearTimeout(animTimersRef.current[unitId]);
    setAnimations(prev => ({ ...prev, [unitId]: animClass }));
    animTimersRef.current[unitId] = setTimeout(() => {
      setAnimations(prev => { const next = { ...prev }; delete next[unitId]; return next; });
    }, duration);
  }, []);

  const processAnimations = useCallback((turnLogs, attackerId) => {
    let effectTriggered = false;
    for (const log of turnLogs) {
      if (log.type === 'damage' || log.type === 'multi_hit') {
        if (attackerId) triggerAnimation(attackerId, log.isCrit ? 'anim-crit' : 'anim-attack', 400);
        if (log.targetId) triggerAnimation(log.targetId, 'anim-damage', 500);
        if (!effectTriggered) {
          const attackerInA = stateRef.current.teamA.some(u => u.id === attackerId);
          const attacker = [...stateRef.current.teamA, ...stateRef.current.teamB].find(u => u.id === attackerId);
          setSkillEffect({ skillType: 'damage', element: attacker?.element, position: attackerInA ? 'right' : 'left' });
          if (skillEffectTimerRef.current) clearTimeout(skillEffectTimerRef.current);
          skillEffectTimerRef.current = setTimeout(() => setSkillEffect(null), 600);
          effectTriggered = true;
        }
      } else if (log.type === 'heal') {
        if (log.targetId) triggerAnimation(log.targetId, 'anim-heal', 600);
        if (!effectTriggered) {
          const casterInA = stateRef.current.teamA.some(u => u.id === attackerId);
          setSkillEffect({ skillType: 'heal', element: null, position: casterInA ? 'left' : 'right' });
          if (skillEffectTimerRef.current) clearTimeout(skillEffectTimerRef.current);
          skillEffectTimerRef.current = setTimeout(() => setSkillEffect(null), 600);
          effectTriggered = true;
        }
      } else if (log.type === 'buff_applied') {
        if (log.targetId) triggerAnimation(log.targetId, 'anim-buff', 500);
      } else if (log.type === 'debuff_applied') {
        if (log.targetId) triggerAnimation(log.targetId, 'anim-debuff', 500);
      } else if (log.type === 'death') {
        if (log.targetId) triggerAnimation(log.targetId, 'anim-death', 600);
      } else if (log.type === 'revive') {
        if (log.targetId) triggerAnimation(log.targetId, 'anim-revive', 700);
      } else if (log.type === 'stunned') {
        if (attackerId) triggerAnimation(attackerId, 'anim-stun', 600);
      }
    }
  }, [triggerAnimation]);

  // --- Start Battle ---
  const startBattle = useCallback(() => {
    // Set seed for deterministic battles (optional — use null for random)
    const seed = Date.now();
    setSeed(seed);

    const templates = playerTeam || teamATemplates;
    const a = initUnits(templates);

    // AI team: use provided enemyTeam, or random from roster, or default
    let enemyTemplates;
    if (enemyTeam) {
      enemyTemplates = enemyTeam;
    } else if (playerTeam) {
      const playerIds = new Set(playerTeam.map(u => u.id));
      const available = Object.values(heroRoster).filter(u => !playerIds.has(u.id));
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      enemyTemplates = shuffled.slice(0, 4);
    } else {
      enemyTemplates = teamBTemplates;
    }
    const b = initUnits(enemyTemplates);

    stateRef.current = { teamA: a, teamB: b };
    setTeamA(a);
    setTeamB(b);
    setLogs([{ type: 'info', message: '═══ GODS OF THE REALMS — WAR OF WORLDS ═══' }]);
    setWinner(null);
    setTurnCount(0);
    setPhase(PHASE.READY);
    SFX.battleStart();

    // Start first turn
    turnTimerRef.current = setTimeout(() => { if (mountedRef.current) nextTurn(a, b); }, BATTLE_START_DELAY / speedRef.current);
  }, [playerTeam, enemyTeam, nextTurn]);

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
      SFX.defeat();
      return;
    }
    if (isTeamDefeated(b)) {
      setWinner('Team A');
      setPhase(PHASE.BATTLE_OVER);
      addLogs([{ type: 'battle_end', message: 'Team A (Player) wins!' }]);
      SFX.victory();
      return;
    }

    // Advance turn meters
    const unit = advanceTurnMeters(all);
    if (!unit) return;

    setActiveUnit(unit);
    setTurnCount(prev => prev + 1);
    SFX.turnStart();
    setTurnOrder(getTurnOrder(all));
    updateState();

    addLogs([{ type: 'turn_start', unit: unit.name }]);

    // Check if stunned — skip turn
    if (isStunned(unit)) {
      const stunLogs = executeTurn(unit, unit.skills[0], [], a, b);
      addLogs(stunLogs);
      processAnimations(stunLogs, unit.id);
      updateState();
      turnTimerRef.current = setTimeout(() => { if (mountedRef.current) nextTurn(); }, TURN_TRANSITION_DELAY / speedRef.current);
      return;
    }

    // Determine if player or AI
    const isPlayer = a.some(u => u.id === unit.id);
    if (isPlayer) {
      setPhase(PHASE.PLAYER_TURN);
      if (autoBattleRef.current) {
        turnTimerRef.current = setTimeout(() => { if (mountedRef.current) autoPlayTurn(unit, a, b); }, AI_THINK_DELAY / speedRef.current);
        return;
      }
    } else {
      setPhase(PHASE.AI_TURN);
      turnTimerRef.current = setTimeout(() => { if (mountedRef.current) executeAITurn(unit, a, b); }, AI_THINK_DELAY / speedRef.current);
    }
  }, [addLogs, updateState, processAnimations]);

  // --- AI Turn ---
  const executeAITurn = useCallback((unit, tA, tB) => {
    const a = tA || stateRef.current.teamA;
    const b = tB || stateRef.current.teamB;
    const action = decideAction(unit, b, a); // AI allies = teamB, enemies = teamA
    if (!action) return;

    const turnLogs = executeTurn(unit, action.skill, action.targets, b, a);
    addLogs(turnLogs);
    processAnimations(turnLogs, unit.id);
    updateState();
    turnTimerRef.current = setTimeout(() => { if (mountedRef.current) nextTurn(); }, TURN_TRANSITION_DELAY / speedRef.current);
  }, [addLogs, updateState, nextTurn, processAnimations]);

  // --- Auto-Play Turn (for auto-battle mode) ---
  const autoPlayTurn = useCallback((unit, tA, tB) => {
    const a = tA || stateRef.current.teamA;
    const b = tB || stateRef.current.teamB;
    const action = decideAction(unit, a, b); // Player allies = teamA, enemies = teamB
    if (!action) return;

    const turnLogs = executeTurn(unit, action.skill, action.targets, a, b);
    addLogs(turnLogs);
    processAnimations(turnLogs, unit.id);
    setSelectedSkill(null);
    setPhase(PHASE.READY);
    updateState();
    turnTimerRef.current = setTimeout(() => { if (mountedRef.current) nextTurn(); }, TURN_TRANSITION_DELAY / speedRef.current);
  }, [addLogs, updateState, nextTurn, processAnimations]);

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
      processAnimations(turnLogs, activeUnit.id);
      setSelectedSkill(null);
      setPhase(PHASE.READY);
      updateState();
      turnTimerRef.current = setTimeout(() => { if (mountedRef.current) nextTurn(); }, TURN_TRANSITION_DELAY / speedRef.current);
    } else if (skill.target === SkillTarget.ALL_ALLIES) {
      const targets = a.filter(u => u.alive);
      const turnLogs = executeTurn(activeUnit, skill, targets, a, b);
      addLogs(turnLogs);
      processAnimations(turnLogs, activeUnit.id);
      setSelectedSkill(null);
      setPhase(PHASE.READY);
      updateState();
      turnTimerRef.current = setTimeout(() => { if (mountedRef.current) nextTurn(); }, TURN_TRANSITION_DELAY / speedRef.current);
    } else {
      // Need target selection
      setPhase(PHASE.PLAYER_TARGET);
    }
  }, [activeUnit, addLogs, updateState, nextTurn, processAnimations]);

  // --- Player Target Selection ---
  const handleTargetSelect = useCallback((target) => {
    if (!selectedSkill || !activeUnit) return;

    const a = stateRef.current.teamA;
    const b = stateRef.current.teamB;

    const turnLogs = executeTurn(activeUnit, selectedSkill, [target], a, b);
    addLogs(turnLogs);
    processAnimations(turnLogs, activeUnit.id);
    setSelectedSkill(null);
    setPhase(PHASE.READY);
    updateState();
    turnTimerRef.current = setTimeout(() => { if (mountedRef.current) nextTurn(); }, TURN_TRANSITION_DELAY / speedRef.current);
  }, [selectedSkill, activeUnit, addLogs, updateState, nextTurn, processAnimations]);

  // --- Auto-battle: if toggled on during a player turn, auto-play immediately ---
  useEffect(() => {
    if (autoBattle && activeUnit && (phase === PHASE.PLAYER_TURN || phase === PHASE.PLAYER_TARGET)) {
      setSelectedSkill(null);
      setPhase(PHASE.AI_TURN);
      const a = stateRef.current.teamA;
      const b = stateRef.current.teamB;
      turnTimerRef.current = setTimeout(() => { if (mountedRef.current) autoPlayTurn(activeUnit, a, b); }, AI_THINK_DELAY / speedRef.current);
    }
  }, [autoBattle, activeUnit, phase, autoPlayTurn]);

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
          {stageInfo ? stageInfo.name : 'War of Worlds'}
        </div>
        {onExit && ((phase === PHASE.READY && teamA.length === 0) || phase === PHASE.BATTLE_OVER) && (
          <button onClick={() => onExit(winner === 'Team A')} style={{
            marginTop: 8,
            padding: '6px 20px',
            fontSize: 12,
            backgroundColor: '#333',
            color: '#ccc',
            border: '1px solid #555',
            borderRadius: 4,
            cursor: 'pointer',
          }}>
            ← Back to Team Select
          </button>
        )}
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
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              <button onClick={() => setAutoBattle(prev => !prev)} style={{
                padding: '4px 12px', fontSize: 11, fontWeight: 'bold',
                backgroundColor: autoBattle ? '#4CAF50' : '#333',
                color: autoBattle ? '#fff' : '#888',
                border: `1px solid ${autoBattle ? '#4CAF50' : '#555'}`,
                borderRadius: 4, cursor: 'pointer',
              }}>
                {autoBattle ? 'AUTO: ON' : 'AUTO: OFF'}
              </button>
              <button onClick={() => setBattleSpeed(prev => prev >= 3 ? 1 : prev + 1)} style={{
                padding: '4px 12px', fontSize: 11, fontWeight: 'bold',
                backgroundColor: battleSpeed > 1 ? '#FF9800' : '#333',
                color: battleSpeed > 1 ? '#fff' : '#888',
                border: `1px solid ${battleSpeed > 1 ? '#FF9800' : '#555'}`,
                borderRadius: 4, cursor: 'pointer',
              }}>
                {battleSpeed === 1 ? 'x1' : battleSpeed === 2 ? 'x2' : 'x3'}
              </button>
            </div>
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
                  animClass={activeUnit?.id === unit.id ? (animations[unit.id] || 'anim-active') : animations[unit.id]}
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
              {teamB.map(unit => {
                let elementHint = null;
                if (phase === PHASE.PLAYER_TARGET && activeUnit && unit.alive) {
                  const { advantage } = getElementMultiplier(activeUnit.element, unit.element);
                  if (advantage !== 'neutral') elementHint = advantage;
                }
                return (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    isActive={activeUnit?.id === unit.id}
                    animClass={activeUnit?.id === unit.id ? (animations[unit.id] || 'anim-active') : animations[unit.id]}
                    elementHint={elementHint}
                    onClick={
                      phase === PHASE.PLAYER_TARGET && unit.alive
                        ? () => handleTargetSelect(unit)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
      {skillEffect && <SkillEffect {...skillEffect} onDone={() => setSkillEffect(null)} />}
      {phase === PHASE.BATTLE_OVER && winner && teamA.length > 0 && (
        <BattleResults
          winner={winner}
          teamA={teamA}
          teamB={teamB}
          logs={logs}
          turnCount={turnCount}
          onClose={() => onExit?.(winner === 'Team A')}
        />
      )}
    </div>
  );
}
