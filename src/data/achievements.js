const achievements = [
  // Battle
  { id: 'first_blood', name: 'First Blood', desc: 'Win your first battle', category: 'Battle', reward: { gold: 1000 } },
  { id: 'warrior', name: 'Warrior', desc: 'Win 10 battles', category: 'Battle', reward: { gold: 5000 } },
  { id: 'champion', name: 'Champion', desc: 'Win 50 battles', category: 'Battle', reward: { gold: 20000 } },
  { id: 'undefeated', name: 'Undefeated', desc: 'Win 5 battles in a row', category: 'Battle', reward: { essences: 20 } },
  // Collection
  { id: 'collector', name: 'Collector', desc: 'Own 10 heroes', category: 'Collection', reward: { gold: 3000 } },
  { id: 'full_roster', name: 'Full Roster', desc: 'Own all 25 heroes', category: 'Collection', reward: { awakenStones: 10 } },
  { id: 'awakener', name: 'Awakener', desc: 'Awaken a hero', category: 'Collection', reward: { essences: 15 } },
  { id: 'max_level', name: 'Max Power', desc: 'Reach level 40 with any hero', category: 'Collection', reward: { awakenStones: 5 } },
  // Campaign
  { id: 'adventurer', name: 'Adventurer', desc: 'Clear campaign stage 1', category: 'Campaign', reward: { gold: 2000 } },
  { id: 'explorer', name: 'Explorer', desc: 'Clear campaign stage 5', category: 'Campaign', reward: { essences: 10 } },
  { id: 'conqueror', name: 'Conqueror', desc: 'Clear all campaign stages', category: 'Campaign', reward: { awakenStones: 20 } },
  // Summon
  { id: 'first_summon', name: 'Summoner', desc: 'Perform your first summon', category: 'Summon', reward: { gold: 1000 } },
  { id: 'lucky_pull', name: 'Lucky Pull', desc: 'Pull a 5-star hero', category: 'Summon', reward: { essences: 10 } },
  { id: 'mass_summon', name: 'Mass Summoner', desc: 'Perform 50 summons', category: 'Summon', reward: { gold: 10000 } },
  // Arena
  { id: 'arena_debut', name: 'Arena Debut', desc: 'Win an arena battle', category: 'Arena', reward: { gold: 2000 } },
  { id: 'gold_tier', name: 'Gold Rank', desc: 'Reach Gold tier in Arena', category: 'Arena', reward: { awakenStones: 10 } },
];

export default achievements;
