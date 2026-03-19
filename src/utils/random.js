// Seeded random number generator for Gods Of The Realms — War of Worlds
// Enables deterministic battle replays when a seed is provided.
// Unity port: maps directly to System.Random with seed.

let _seed = null;
let _state = null;

/**
 * Initialize the RNG with a seed. If no seed, uses Math.random() (non-deterministic).
 */
export function setSeed(seed) {
  _seed = seed;
  _state = seed;
}

/**
 * Clear the seed — revert to Math.random().
 */
export function clearSeed() {
  _seed = null;
  _state = null;
}

/**
 * Get the current seed (or null if unseeded).
 */
export function getSeed() {
  return _seed;
}

/**
 * Generate a random float in [0, 1). Uses seeded RNG if seed is set, otherwise Math.random().
 * Drop-in replacement for Math.random().
 */
export function random() {
  if (_state === null) return Math.random();

  // Mulberry32 algorithm
  _state |= 0;
  _state = (_state + 0x6D2B79F5) | 0;
  let t = Math.imul(_state ^ (_state >>> 15), 1 | _state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Generate a random integer in [min, max] inclusive.
 */
export function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Generate a random float in [min, max).
 */
export function randomFloat(min, max) {
  return min + random() * (max - min);
}

/**
 * Pick a random element from an array.
 */
export function randomPick(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(random() * array.length)];
}

/**
 * Return true with the given probability (0-1).
 */
export function randomChance(probability) {
  return random() < probability;
}
