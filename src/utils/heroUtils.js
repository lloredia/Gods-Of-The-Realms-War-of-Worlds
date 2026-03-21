// Shared hero utilities — merges save data into hero templates
// Every page that creates teams for battle should use these.

import { heroRoster } from '../data/units';
import { loadSave } from './saveSystem';

/**
 * Get a hero template with save data (level, stars, awakened, relicSet) merged in.
 */
export function getHeroWithSave(heroId) {
  const base = heroRoster[heroId];
  if (!base) return null;
  const save = loadSave();
  const overrides = save.heroData?.[heroId];
  if (!overrides) return { ...base };
  return { ...base, ...overrides };
}

/**
 * Get a full team of heroes with save data merged in.
 */
export function getTeamWithSave(heroIds) {
  return heroIds.map(id => getHeroWithSave(id)).filter(Boolean);
}

/**
 * Get all owned heroes with save data merged in.
 */
export function getAllHeroesWithSave() {
  const save = loadSave();
  return Object.values(heroRoster).map(hero => {
    const overrides = save.heroData?.[hero.id];
    return overrides ? { ...hero, ...overrides } : { ...hero };
  });
}
