// Element system for Gods Of The Realms — War of Worlds
// Wraps the element table for use by the engine.
// Framework-agnostic (Unity-portable).

import { getElementMultiplier } from '../constants/elementTable';

/**
 * Calculate element damage modifier between attacker and target.
 * Returns { multiplier, advantage, label }
 */
export function calculateElementModifier(attacker, target) {
  const result = getElementMultiplier(attacker.element, target.element);

  const labels = {
    advantage: 'Element Advantage',
    disadvantage: 'Element Disadvantage',
    mutual: 'Elemental Clash',
    neutral: null,
  };

  return {
    ...result,
    label: labels[result.advantage],
  };
}
