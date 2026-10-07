import { describe, expect, it } from 'vitest';
import { DebuffType, SkillTarget, SkillType } from '../src/constants/enums.js';
import { executeTurn } from '../src/engine/battleEngine.js';
import { calculateDamage } from '../src/engine/damageSystem.js';
import { tryApplyEffect } from '../src/engine/effectSystem.js';
import { applyFactionBonuses } from '../src/engine/factionBonusSystem.js';
import { previewStats } from '../src/engine/progressionSystem.js';
import { applyRelicBonuses } from '../src/engine/relicSystem.js';
import { setSeed } from '../src/utils/random.js';
import { makeUnit, withSeed } from './helpers.js';

const basicAttack = {
  id: 'basic',
  name: 'Basic',
  type: SkillType.DAMAGE,
  target: SkillTarget.SINGLE,
  multiplier: 2,
  cooldown: 0,
  effectChance: 0,
  effectType: null,
  effectDuration: 0,
};

describe('damage and relic bonuses', () => {
  it('reduces incoming damage when Fortress damage reduction is present', () => {
    const attacker = makeUnit({ id: 'atk', name: 'Attacker', attack: 2000, critRate: 0 });
    const plain = makeUnit({ id: 'tgt', name: 'Target', defense: 0 });
    const fortified = makeUnit({ id: 'tgt', name: 'Target', defense: 0, damageReduction: 0.15 });

    const plainDamage = withSeed(42, () => calculateDamage(attacker, plain, basicAttack).damage);
    const reducedDamage = withSeed(
      42,
      () => calculateDamage(attacker, fortified, basicAttack).damage,
    );

    expect(reducedDamage).toBeLessThan(plainDamage);
    expect(reducedDamage / plainDamage).toBeGreaterThan(0.8);
    expect(reducedDamage / plainDamage).toBeLessThan(0.9);
  });

  it('applies vitality healing received on heal skills and turn-start heals', () => {
    const caster = makeUnit({
      id: 'healer',
      name: 'Healer',
      attack: 1000,
      skills: [
        {
          id: 'heal',
          name: 'Mend',
          type: SkillType.HEAL,
          target: SkillTarget.ALL_ALLIES,
          multiplier: 1,
          cooldown: 0,
        },
      ],
    });
    const wounded = makeUnit({
      id: 'ally',
      name: 'Ally',
      currentHP: 1000,
      maxHP: 5000,
      healBonus: 0.2,
    });
    const baseline = makeUnit({ id: 'ally', name: 'Ally', currentHP: 1000, maxHP: 5000 });

    const boosted = withSeed(7, () => {
      executeTurn(caster, caster.skills[0], [], [wounded], []);
      return wounded.currentHP;
    });
    const plain = withSeed(7, () => {
      executeTurn(caster, caster.skills[0], [], [baseline], []);
      return baseline.currentHP;
    });

    expect(boosted).toBeGreaterThan(plain);

    const passiveUnit = makeUnit({
      id: 'regen',
      name: 'Regen',
      currentHP: 1000,
      maxHP: 4000,
      healBonus: 0.2,
      skills: [basicAttack],
      passive: {
        name: 'Mend',
        trigger: 'on_turn_start',
        effect: 'self_heal',
        value: 0.1,
      },
    });
    withSeed(3, () => executeTurn(passiveUnit, basicAttack, [], [passiveUnit], []));
    expect(passiveUnit.currentHP).toBe(1000 + Math.floor(4000 * 0.1 * 1.2));
  });

  it('stores and applies the four relic bonus kinds', () => {
    const fortress = makeUnit({ relicSet: 'fortress', defense: 1000 });
    applyRelicBonuses(fortress);
    expect(fortress.damageReduction).toBe(0.15);
    expect(fortress.defense).toBe(1350);

    const vitality = makeUnit({ relicSet: 'vitality', maxHP: 1000, currentHP: 1000 });
    applyRelicBonuses(vitality);
    expect(vitality.healBonus).toBe(0.2);
    expect(vitality.maxHP).toBe(1250);
    expect(vitality.currentHP).toBe(1250);

    const resolve = makeUnit({ relicSet: 'resolve', resistance: 0.1 });
    applyRelicBonuses(resolve);
    expect(resolve.debuffDurationReduce).toBe(1);
    expect(resolve.resistance).toBeCloseTo(0.3);

    const target = makeUnit({ debuffDurationReduce: 1, buffs: [], debuffs: [] });
    const caster = makeUnit({ id: 'caster', accuracy: 1 });
    const shortened = {
      effectType: DebuffType.STUN,
      effectChance: 1,
      effectDuration: 2,
    };
    const negated = { ...shortened, effectDuration: 1 };

    setSeed(1);
    const applied = tryApplyEffect(shortened, caster, target);
    expect(applied.applied).toBe(true);
    expect(target.debuffs[0].duration).toBe(1);

    const empty = makeUnit({ debuffDurationReduce: 1 });
    const missed = tryApplyEffect(negated, caster, empty);
    expect(missed.negated).toBe(true);
    expect(empty.debuffs).toHaveLength(0);
  });
});

describe('defeat and revive', () => {
  it('revives at the passive percent, including kills from debuff skills', () => {
    const attacker = makeUnit({
      id: 'killer',
      name: 'Killer',
      attack: 5000,
      skills: [
        {
          id: 'curse',
          name: 'Curse',
          type: SkillType.DEBUFF,
          target: SkillTarget.SINGLE,
          multiplier: 3,
          cooldown: 0,
          effectChance: 1,
          effectType: DebuffType.HEAL_BLOCK,
          effectDuration: 2,
        },
      ],
    });
    const target = makeUnit({
      id: 'wolf',
      name: 'Fenrir',
      maxHP: 1000,
      currentHP: 100,
      defense: 0,
      passive: {
        name: 'Devouring Hunger',
        trigger: 'on_receive_fatal',
        effect: 'revive',
        value: 0.3,
        usesLeft: 1,
      },
    });

    const logs = withSeed(9, () =>
      executeTurn(attacker, attacker.skills[0], [target], [attacker], [target]),
    );

    expect(target.alive).toBe(true);
    expect(target.currentHP).toBe(300);
    expect(target.passive.usesLeft).toBe(0);
    expect(logs.some((entry) => entry.type === 'revive')).toBe(true);

    withSeed(9, () => executeTurn(attacker, attacker.skills[0], [target], [attacker], [target]));
    expect(target.alive).toBe(false);
    expect(target.currentHP).toBe(0);
  });
});

describe('progression and factions', () => {
  it('scales preview stats by level and leaves natural 4-star level 1 unchanged', () => {
    const base = makeUnit({ maxHP: 1000, attack: 500, defense: 200, speed: 100 });
    expect(previewStats(base, 1, 4, false)).toEqual({
      maxHP: 1000,
      attack: 500,
      defense: 200,
      speed: 100,
    });
    expect(previewStats(base, 2, 4, false).attack).toBe(515);
    expect(previewStats(base, 1, 5, true).attack).toBeGreaterThan(500);
  });

  it('grants the 2-hero pantheon attack bonus', () => {
    const team = [
      makeUnit({ id: 'a', faction: 'The Pantheon', attack: 1000 }),
      makeUnit({ id: 'b', faction: 'The Pantheon', attack: 800 }),
      makeUnit({ id: 'c', faction: null, attack: 700 }),
    ];
    const bonuses = applyFactionBonuses(team);
    expect(bonuses).toHaveLength(1);
    expect(team[0].attack).toBe(1100);
    expect(team[1].attack).toBe(880);
    expect(team[2].attack).toBe(700);
  });
});
