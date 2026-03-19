// Battle system constants for Gods Of The Realms — War of Worlds
// Every tuning knob in one place. No magic numbers in engine code.
// Unity port: these become ScriptableObject fields or static config.

// --- Turn Meter ---
export const TURN_METER_THRESHOLD = 100;      // Turn meter value required to act
export const TURN_METER_TICK_RATE = 20;        // Base gain per tick (scaled by speed ratio)
export const TURN_METER_MAX_ITERATIONS = 1000; // Safety guard against infinite loop

// --- Damage Formula ---
// damage = ATK * multiplier * (DEF_SCALING_BASE / (DEF_SCALING_BASE + DEF * DEF_SCALING_FACTOR)) * crit * variance
export const DEF_SCALING_BASE = 1000;
export const DEF_SCALING_FACTOR = 3;
export const DAMAGE_VARIANCE_MIN = 0.95;       // ±5% random variance
export const DAMAGE_VARIANCE_RANGE = 0.10;
export const MIN_DAMAGE = 1;
export const MIN_HEAL = 1;

// --- Resist System ---
export const MIN_RESIST_CHANCE = 0.15;         // Floor — effects always have at least 15% chance

// --- AI Thresholds ---
export const AI_HEAL_THRESHOLD = 0.5;          // Use heal when any ally below 50% HP
export const AI_BUFF_CHANCE = 0.3;             // 30% chance to prioritize buff skill
export const AI_KILL_ESTIMATE_FACTOR = 0.4;    // Conservative damage estimate for kill check

// --- Default Unit Stats ---
export const DEFAULT_UNIT_STATS = Object.freeze({
  maxHP: 10000,
  attack: 800,
  defense: 500,
  speed: 100,
  critRate: 0.15,
  critDamage: 1.5,
  accuracy: 0.85,
  resistance: 0.15,
});

// --- UI Timing (ms) ---
export const BATTLE_START_DELAY = 300;
export const TURN_TRANSITION_DELAY = 600;
export const AI_THINK_DELAY = 800;

// --- Turn Order Display ---
export const TURN_ORDER_DISPLAY_COUNT = 8;
