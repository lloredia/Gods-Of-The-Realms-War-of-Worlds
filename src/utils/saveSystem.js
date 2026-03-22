// Save system for Gods Of The Realms — War of Worlds
// Persists player state to localStorage.

const SAVE_KEY = 'gotr_save_data';

const DEFAULT_SAVE = {
  ownedHeroes: ['zeus', 'poseidon', 'morganLeFay', 'susanoo', 'hades', 'apollo', 'ra', 'freya', 'loki', 'cuChulainn', 'thor', 'anubis', 'bastet', 'amaterasu', 'athena', 'ares', 'odin', 'fenrir', 'isis', 'set', 'merlin', 'nimue', 'tsukuyomi', 'raijin', 'izanami', 'benzaiten'],
  selectedTeam: ['zeus', 'poseidon', 'morganLeFay', 'susanoo'],
  heroData: {}, // overrides per hero: { zeus: { level: 35, stars: 5, awakened: true, relicSet: 'wrath' } }
  resources: { gold: 50000, essences: 100, awakenStones: 20 },
  campaignProgress: { highestStage: 0 },
  stats: { battlesWon: 0, battlesLost: 0, totalDamage: 0 },
  arenaPoints: 500,
};

export function loadSave() {
  if (typeof window === 'undefined') return { ...DEFAULT_SAVE };
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

export function updateSave(partial) {
  const current = loadSave();
  const updated = { ...current };
  for (const [key, value] of Object.entries(partial)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && current[key] && typeof current[key] === 'object') {
      updated[key] = { ...current[key], ...value };
    } else {
      updated[key] = value;
    }
  }
  writeSave(updated);
  return updated;
}

export function resetSave() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SAVE_KEY);
  return { ...DEFAULT_SAVE };
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
