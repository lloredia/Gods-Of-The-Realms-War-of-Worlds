// Save system for Gods Of The Realms — War of Worlds
// Persists player state to localStorage.

const SAVE_KEY = 'gotr_save_data';

const DEFAULT_SAVE = {
  ownedHeroes: [
    'zeus',
    'poseidon',
    'morganLeFay',
    'susanoo',
    'hades',
    'apollo',
    'ra',
    'freya',
    'loki',
    'cuChulainn',
    'thor',
    'anubis',
    'bastet',
    'amaterasu',
    'athena',
    'ares',
    'odin',
    'fenrir',
    'isis',
    'set',
    'merlin',
    'nimue',
    'tsukuyomi',
    'raijin',
    'izanami',
    'benzaiten',
  ],
  selectedTeam: ['zeus', 'poseidon', 'morganLeFay', 'susanoo'],
  heroData: {}, // overrides per hero: { zeus: { level: 35, stars: 5, awakened: true, relicSet: 'wrath' } }
  resources: { gold: 50000, essences: 100, awakenStones: 20 },
  campaignProgress: { highestStage: 0 },
  stats: { battlesWon: 0, battlesLost: 0, totalDamage: 0 },
  arenaPoints: 500,
};

function cloneSave(data) {
  return JSON.parse(JSON.stringify(data));
}

function storage() {
  if (typeof globalThis.localStorage === 'undefined') return null;
  return globalThis.localStorage;
}

function mergeWithDefaults(saved) {
  const base = cloneSave(DEFAULT_SAVE);
  if (!saved || typeof saved !== 'object') return base;
  const merged = { ...base, ...saved };
  for (const key of Object.keys(base)) {
    const baseValue = base[key];
    const savedValue = saved[key];
    if (
      baseValue &&
      savedValue &&
      typeof baseValue === 'object' &&
      typeof savedValue === 'object' &&
      !Array.isArray(baseValue) &&
      !Array.isArray(savedValue)
    ) {
      merged[key] = { ...baseValue, ...savedValue };
    }
  }
  return merged;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

deepFreeze(DEFAULT_SAVE);

export function loadSave() {
  const store = storage();
  if (!store) return cloneSave(DEFAULT_SAVE);
  try {
    const raw = store.getItem(SAVE_KEY);
    if (!raw) return cloneSave(DEFAULT_SAVE);
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return cloneSave(DEFAULT_SAVE);
  }
}

export function writeSave(data) {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

export function updateSave(partial) {
  const current = loadSave();
  const updated = { ...current };
  for (const [key, value] of Object.entries(partial)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      current[key] &&
      typeof current[key] === 'object'
    ) {
      updated[key] = { ...current[key], ...value };
    } else {
      updated[key] = value;
    }
  }
  writeSave(updated);
  return updated;
}

export function resetSave() {
  const store = storage();
  if (store) store.removeItem(SAVE_KEY);
  return cloneSave(DEFAULT_SAVE);
}

export function addHero(heroId) {
  const save = loadSave();
  if (!save.ownedHeroes.includes(heroId)) {
    save.ownedHeroes.push(heroId);
  }
  writeSave(save);
  return save;
}

export function setSelectedTeam(heroIds) {
  return updateSave({ selectedTeam: heroIds });
}

export function spendResources(cost) {
  const save = loadSave();
  for (const [key, amount] of Object.entries(cost)) {
    if ((save.resources[key] || 0) < amount) return null; // Can't afford
  }
  for (const [key, amount] of Object.entries(cost)) {
    save.resources[key] -= amount;
  }
  writeSave(save);
  return save;
}

export { DEFAULT_SAVE };
