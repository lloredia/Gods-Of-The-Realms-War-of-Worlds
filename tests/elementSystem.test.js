import { describe, expect, it } from 'vitest';
import { Element } from '../src/constants/enums.js';
import {
  ELEMENT_ADVANTAGE,
  ELEMENT_DISADVANTAGE,
  ELEMENT_MUTUAL,
  ELEMENT_NEUTRAL,
  getElementMultiplier,
} from '../src/constants/elementTable.js';
import { calculateElementModifier } from '../src/engine/elementSystem.js';

describe('element matrix', () => {
  it('uses the storm > ocean > sun triangle', () => {
    expect(getElementMultiplier(Element.STORM, Element.OCEAN)).toEqual({
      multiplier: ELEMENT_ADVANTAGE,
      advantage: 'advantage',
    });
    expect(getElementMultiplier(Element.OCEAN, Element.SUN).advantage).toBe('advantage');
    expect(getElementMultiplier(Element.SUN, Element.STORM).advantage).toBe('advantage');
    expect(getElementMultiplier(Element.OCEAN, Element.STORM)).toEqual({
      multiplier: ELEMENT_DISADVANTAGE,
      advantage: 'disadvantage',
    });
  });

  it('treats moon and underworld as a mutual clash', () => {
    expect(getElementMultiplier(Element.MOON, Element.UNDERWORLD)).toEqual({
      multiplier: ELEMENT_MUTUAL,
      advantage: 'mutual',
    });
    expect(getElementMultiplier(Element.UNDERWORLD, Element.MOON).advantage).toBe('mutual');
  });

  it('is neutral for mirrors and unrelated pairs', () => {
    expect(getElementMultiplier(Element.STORM, Element.STORM).multiplier).toBe(ELEMENT_NEUTRAL);
    expect(getElementMultiplier(Element.STORM, Element.MOON).advantage).toBe('neutral');
    expect(getElementMultiplier(null, Element.SUN).advantage).toBe('neutral');
  });

  it('labels modifiers for the combat log', () => {
    const attacker = { element: Element.STORM };
    const target = { element: Element.OCEAN };
    expect(calculateElementModifier(attacker, target).label).toBe('Element Advantage');
    expect(calculateElementModifier(attacker, attacker).label).toBeNull();
  });
});
