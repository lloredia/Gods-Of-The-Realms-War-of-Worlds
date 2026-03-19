// Shared enums for Gods Of The Realms — War of Worlds
// Single source of truth for all string identifiers across engine, data, and UI.
// Unity port: these map directly to C# enums.

// --- Skill target types ---
export const SkillTarget = Object.freeze({
  SINGLE: 'single',
  ALL_ENEMIES: 'all',
  ALL_ALLIES: 'all_allies',
});

// --- Skill types ---
export const SkillType = Object.freeze({
  DAMAGE: 'damage',
  HEAL: 'heal',
  BUFF: 'buff',
  DEBUFF: 'debuff',
  CLEANSE: 'cleanse',
  STRIP: 'strip',
});

// --- Elements ---
export const Element = Object.freeze({
  STORM: 'Storm',
  OCEAN: 'Ocean',
  UNDERWORLD: 'Underworld',
  SUN: 'Sun',
  MOON: 'Moon',
});

// --- Factions ---
export const Faction = Object.freeze({
  THE_PANTHEON: 'The Pantheon',
  THE_ALLFATHERS_HALL: "The Allfather's Hall",
  THE_ETERNAL_SANDS: 'The Eternal Sands',
  THE_MIST_REALM: 'The Mist Realm',
  THE_RISING_SUN: 'The Rising Sun',
});

// --- Roles ---
export const Role = Object.freeze({
  ATTACKER: 'Attacker',
  TANK: 'Tank',
  SUPPORT: 'Support',
  BRUISER: 'Bruiser',
  DEBUFFER: 'Debuffer',
});

// --- Buff types ---
export const BuffType = Object.freeze({
  ATTACK_UP: 'attack_up',
  DEFENSE_UP: 'defense_up',
  IMMUNITY: 'immunity',
  SPEED_UP: 'speed_up',
});

// --- Debuff types ---
export const DebuffType = Object.freeze({
  STUN: 'stun',
  DEFENSE_BREAK: 'defense_break',
  SLOW: 'slow',
  HEAL_BLOCK: 'heal_block',
});

// --- All effect types (union of buffs + debuffs) ---
export const EffectType = Object.freeze({
  ...BuffType,
  ...DebuffType,
});

// --- Battle phases (UI state machine) ---
export const BattlePhase = Object.freeze({
  READY: 'ready',
  PLAYER_TURN: 'player_turn',
  PLAYER_TARGET: 'player_target',
  AI_TURN: 'ai_turn',
  BATTLE_OVER: 'battle_over',
});

// --- Passive triggers ---
export const PassiveTrigger = Object.freeze({
  ON_TURN_START: 'on_turn_start',
  ON_DEAL_DAMAGE: 'on_deal_damage',
  ON_RECEIVE_FATAL: 'on_receive_fatal',
});

// --- Conditional types for skills ---
export const ConditionType = Object.freeze({
  TARGET_BELOW_HP: 'target_below_hp',
  SELF_BELOW_HP: 'self_below_hp',
});

// --- Log entry types ---
export const LogType = Object.freeze({
  DAMAGE: 'damage',
  HEAL: 'heal',
  DEATH: 'death',
  BUFF_APPLIED: 'buff_applied',
  DEBUFF_APPLIED: 'debuff_applied',
  STUNNED: 'stunned',
  RESISTED: 'resisted',
  BLOCKED: 'blocked',
  EFFECT_EXPIRE: 'effect_expire',
  HEAL_BLOCKED: 'heal_blocked',
  TURN_START: 'turn_start',
  BATTLE_END: 'battle_end',
  INFO: 'info',
  PASSIVE: 'passive',
  REVIVE: 'revive',
  CLEANSE: 'cleanse',
  STRIP: 'strip',
  MULTI_HIT: 'multi_hit',
});
