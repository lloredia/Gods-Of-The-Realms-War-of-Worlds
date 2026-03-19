// Element advantage matrix for Gods Of The Realms — War of Worlds
//
// Triangle: Storm > Ocean > Sun > Storm
// Dual:     Moon <-> Underworld (mutual advantage)
// All other matchups: neutral
//
// Unity port: maps to a ScriptableObject lookup table.

import { Element } from './enums';

// Multiplier values — tune these to adjust element impact
export const ELEMENT_ADVANTAGE = 1.15;      // 15% bonus damage
export const ELEMENT_DISADVANTAGE = 0.85;   // 15% penalty
export const ELEMENT_MUTUAL = 1.20;         // 20% bonus (Moon <-> Underworld)
export const ELEMENT_NEUTRAL = 1.0;

// Advantage lookup: ADVANTAGE_MAP[attacker] = set of elements they beat
const ADVANTAGE_MAP = {
  [Element.STORM]: new Set([Element.OCEAN]),
  [Element.OCEAN]: new Set([Element.SUN]),
  [Element.SUN]: new Set([Element.STORM]),
  [Element.MOON]: new Set([Element.UNDERWORLD]),
  [Element.UNDERWORLD]: new Set([Element.MOON]),
};

/**
 * Get the element damage multiplier for attacker vs target.
 * Returns { multiplier, advantage } where advantage is 'advantage', 'disadvantage', 'mutual', or 'neutral'.
 */
export function getElementMultiplier(attackerElement, targetElement) {
  if (!attackerElement || !targetElement || attackerElement === targetElement) {
    return { multiplier: ELEMENT_NEUTRAL, advantage: 'neutral' };
  }

  const attackerAdvantage = ADVANTAGE_MAP[attackerElement];
  const targetAdvantage = ADVANTAGE_MAP[targetElement];

  // Check mutual (Moon <-> Underworld)
  const isMutualPair =
    (attackerElement === Element.MOON && targetElement === Element.UNDERWORLD) ||
    (attackerElement === Element.UNDERWORLD && targetElement === Element.MOON);

  if (isMutualPair) {
    return { multiplier: ELEMENT_MUTUAL, advantage: 'mutual' };
  }

  // Check advantage
  if (attackerAdvantage && attackerAdvantage.has(targetElement)) {
    return { multiplier: ELEMENT_ADVANTAGE, advantage: 'advantage' };
  }

  // Check disadvantage
  if (targetAdvantage && targetAdvantage.has(attackerElement)) {
    return { multiplier: ELEMENT_DISADVANTAGE, advantage: 'disadvantage' };
  }

  return { multiplier: ELEMENT_NEUTRAL, advantage: 'neutral' };
}
