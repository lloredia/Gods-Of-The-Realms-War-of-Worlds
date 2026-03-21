// Headless battle simulation utility for Gods Of The Realms — War of Worlds
// Used for automated testing, balance tuning, and replay verification.

import { initUnits, advanceTurnMeters, executeTurn, isTeamDefeated, getTurnOrder, getTurnCounter } from './battleEngine';
import { isStunned } from './effectSystem';
import { decideAction } from './aiSystem';
import { setSeed, clearSeed, getSeed, getState } from '../utils/random';

/**
 * Run a complete headless battle simulation.
 * Returns { winner, logs, turns, seed, duration, teamAFinal, teamBFinal }
 */
export function simulateBattle(teamATemplates, teamBTemplates, options = {}) {
  const seed = options.seed || Date.now();
  const maxTurns = options.maxTurns || 200;

  setSeed(seed);
  const startTime = performance.now();

  const teamA = initUnits(teamATemplates);
  const teamB = initUnits(teamBTemplates);
  const all = [...teamA, ...teamB];
  const logs = [];
  let winner = null;
  let turns = 0;

  while (turns < maxTurns) {
    if (isTeamDefeated(teamA)) { winner = 'B'; break; }
    if (isTeamDefeated(teamB)) { winner = 'A'; break; }

    const unit = advanceTurnMeters(all);
    if (!unit) break;

    turns++;
    const isTeamAUnit = teamA.some(u => u.id === unit.id);
    const allies = isTeamAUnit ? teamA : teamB;
    const enemies = isTeamAUnit ? teamB : teamA;

    if (isStunned(unit)) {
      const turnLogs = executeTurn(unit, unit.skills[0], [], allies, enemies);
      logs.push(...turnLogs);
      continue;
    }

    const action = decideAction(unit, allies, enemies);
    if (!action) continue;

    const turnLogs = executeTurn(unit, action.skill, action.targets, allies, enemies);
    logs.push(...turnLogs);
  }

  if (!winner) winner = 'DRAW';

  const duration = performance.now() - startTime;
  clearSeed();

  return {
    winner,
    logs,
    turns,
    seed,
    duration: Math.round(duration),
    teamAFinal: teamA.map(u => ({ id: u.id, name: u.name, alive: u.alive, hp: u.currentHP, maxHP: u.maxHP })),
    teamBFinal: teamB.map(u => ({ id: u.id, name: u.name, alive: u.alive, hp: u.currentHP, maxHP: u.maxHP })),
  };
}

/**
 * Run N simulations and return aggregate stats.
 */
export function batchSimulate(teamATemplates, teamBTemplates, count = 100) {
  const results = { aWins: 0, bWins: 0, draws: 0, avgTurns: 0, avgDuration: 0 };

  for (let i = 0; i < count; i++) {
    const result = simulateBattle(teamATemplates, teamBTemplates, { seed: 1000 + i });
    if (result.winner === 'A') results.aWins++;
    else if (result.winner === 'B') results.bWins++;
    else results.draws++;
    results.avgTurns += result.turns;
    results.avgDuration += result.duration;
  }

  results.avgTurns = Math.round(results.avgTurns / count);
  results.avgDuration = Math.round(results.avgDuration / count);
  results.aWinRate = Math.round((results.aWins / count) * 100);
  results.bWinRate = Math.round((results.bWins / count) * 100);

  return results;
}
