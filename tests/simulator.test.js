import { describe, expect, it } from 'vitest';
import { teamATemplates, teamBTemplates } from '../src/data/units.js';
import { simulateBattle } from '../src/engine/battleSimulator.js';

function fingerprint(result) {
  return {
    winner: result.winner,
    turns: result.turns,
    seed: result.seed,
    teamAFinal: result.teamAFinal,
    teamBFinal: result.teamBFinal,
    events: result.logs.map((entry) => [
      entry.type,
      entry.damage ?? null,
      entry.amount ?? null,
      entry.targetId ?? null,
    ]),
  };
}

describe('battle simulator', () => {
  it('replays the same battle from the same seed, including seed 0', () => {
    const first = fingerprint(simulateBattle(teamATemplates, teamBTemplates, { seed: 0xc0ffee }));
    const second = fingerprint(simulateBattle(teamATemplates, teamBTemplates, { seed: 0xc0ffee }));
    expect(second).toEqual(first);
    expect(first.winner === 'A' || first.winner === 'B' || first.winner === 'DRAW').toBe(true);
    expect(first.turns).toBeGreaterThan(0);

    const zeroA = fingerprint(simulateBattle(teamATemplates, teamBTemplates, { seed: 0 }));
    const zeroB = fingerprint(simulateBattle(teamATemplates, teamBTemplates, { seed: 0 }));
    expect(zeroB).toEqual(zeroA);
    expect(zeroA.seed).toBe(0);
  });
});
