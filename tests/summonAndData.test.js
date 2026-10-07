import { describe, expect, it } from 'vitest';
import skills from '../src/data/skills.js';
import { SUMMON_POOL, SUMMON_RATES, simulateSummon } from '../src/data/summonPool.js';
import { creatureRoster, heroRoster } from '../src/data/units.js';

describe('summon pool', () => {
  it('keeps published rates that sum to 1', () => {
    const total = Object.values(SUMMON_RATES).reduce((sum, rate) => sum + rate, 0);
    expect(total).toBeCloseTo(1, 8);
  });

  it('draws the rarity bucket selected by the injected roll', () => {
    const rolls = [0.99, 0];
    let index = 0;
    const pull = simulateSummon(() => rolls[index++]);
    expect(pull.stars).toBe(5);
    expect(pull.heroId).toBe(SUMMON_POOL[5][0]);
  });
});

describe('roster integrity', () => {
  it('has 51 units, 15 creatures, and a summon entry for every id', () => {
    expect(Object.keys(heroRoster)).toHaveLength(51);
    expect(Object.keys(creatureRoster)).toHaveLength(15);
    expect(Object.keys(skills).length).toBeGreaterThan(100);

    for (const pool of Object.values(SUMMON_POOL)) {
      for (const id of pool) {
        expect(heroRoster[id], id).toBeTruthy();
        expect(heroRoster[id].skills.length).toBeGreaterThan(0);
      }
    }

    for (const unit of Object.values(heroRoster)) {
      expect(unit.id).toBeTruthy();
      expect(unit.name).toBeTruthy();
      expect(unit.element).toBeTruthy();
      expect(unit.maxHP).toBeGreaterThan(0);
      expect(unit.attack).toBeGreaterThan(0);
    }
  });
});
