// Achievement tracker for Gods Of The Realms — War of Worlds
// Checks game state and unlocks achievements.

import achievements from '../data/achievements';

const ACH_KEY = 'gotr_achievements';

function loadAchievements() {
  if (typeof window === 'undefined') return { completed: [], claimedRewards: [] };
  try {
    const raw = localStorage.getItem(ACH_KEY);
    if (!raw) return { completed: [], claimedRewards: [] };
    return JSON.parse(raw);
  } catch {
    return { completed: [], claimedRewards: [] };
  }
}

function saveAchievements(data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACH_KEY, JSON.stringify(data));
}

export function unlockAchievement(id) {
  const data = loadAchievements();
  if (data.completed.includes(id)) return false;
  data.completed.push(id);
  saveAchievements(data);
  return true; // newly unlocked
}

export function checkBattleAchievements(won, stats) {
  const unlocked = [];
  if (won) {
    if (unlockAchievement('first_blood')) unlocked.push('first_blood');
    if (stats.battlesWon >= 10 && unlockAchievement('warrior')) unlocked.push('warrior');
    if (stats.battlesWon >= 50 && unlockAchievement('champion')) unlocked.push('champion');
  }
  return unlocked;
}

export function checkCollectionAchievements(ownedCount, heroData) {
  const unlocked = [];
  if (ownedCount >= 10 && unlockAchievement('collector')) unlocked.push('collector');
  if (ownedCount >= 25 && unlockAchievement('full_roster')) unlocked.push('full_roster');
  // Check for any awakened hero
  if (heroData) {
    const hasAwakened = Object.values(heroData).some(h => h.awakened);
    if (hasAwakened && unlockAchievement('awakener')) unlocked.push('awakener');
    const hasMaxLevel = Object.values(heroData).some(h => h.level >= 40);
    if (hasMaxLevel && unlockAchievement('max_level')) unlocked.push('max_level');
  }
  return unlocked;
}

export function checkCampaignAchievements(highestStage) {
  const unlocked = [];
  if (highestStage >= 1 && unlockAchievement('adventurer')) unlocked.push('adventurer');
  if (highestStage >= 5 && unlockAchievement('explorer')) unlocked.push('explorer');
  if (highestStage >= 10 && unlockAchievement('conqueror')) unlocked.push('conqueror');
  return unlocked;
}

export function checkSummonAchievements(totalSummons, gotFiveStar) {
  const unlocked = [];
  if (totalSummons >= 1 && unlockAchievement('first_summon')) unlocked.push('first_summon');
  if (gotFiveStar && unlockAchievement('lucky_pull')) unlocked.push('lucky_pull');
  if (totalSummons >= 50 && unlockAchievement('mass_summon')) unlocked.push('mass_summon');
  return unlocked;
}

export function checkArenaAchievements(won, arenaPoints) {
  const unlocked = [];
  if (won && unlockAchievement('arena_debut')) unlocked.push('arena_debut');
  if (arenaPoints >= 2000 && unlockAchievement('gold_tier')) unlocked.push('gold_tier');
  return unlocked;
}

export function getUnlockedCount() {
  return loadAchievements().completed.length;
}
