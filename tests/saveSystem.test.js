import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_SAVE, addHero, loadSave, resetSave } from '../src/utils/saveSystem.js';

const SAVE_KEY = 'gotr_save_data';

function installStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
  return store;
}

afterEach(() => {
  delete globalThis.localStorage;
});

describe('save system', () => {
  it('returns a fresh default when storage is unavailable', () => {
    const first = loadSave();
    first.ownedHeroes.push('goblin');
    first.resources.gold = 1;
    expect(loadSave().resources.gold).toBe(DEFAULT_SAVE.resources.gold);
    expect(loadSave().ownedHeroes).not.toContain('goblin');
  });

  it('does not mutate the default roster when a new hero is added', () => {
    installStorage();
    const before = [...DEFAULT_SAVE.ownedHeroes];
    const saved = addHero('goblin');
    expect(saved.ownedHeroes).toContain('goblin');
    expect(DEFAULT_SAVE.ownedHeroes).toEqual(before);
    expect(loadSave().ownedHeroes).toContain('goblin');

    resetSave();
    expect(loadSave().ownedHeroes).not.toContain('goblin');
  });

  it('keeps missing nested defaults when a save is partial', () => {
    const store = installStorage();
    store.set(SAVE_KEY, JSON.stringify({ resources: { gold: 5 }, stats: { battlesWon: 2 } }));
    const save = loadSave();
    expect(save.resources.gold).toBe(5);
    expect(save.resources.essences).toBe(DEFAULT_SAVE.resources.essences);
    expect(save.stats.battlesWon).toBe(2);
    expect(save.stats.battlesLost).toBe(0);
    expect(save.ownedHeroes).toEqual(DEFAULT_SAVE.ownedHeroes);
  });
});
