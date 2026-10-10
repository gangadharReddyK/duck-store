import { describe, expect, it } from 'vitest';
import { Money } from './money.js';

describe('Money', () => {
  describe('percentOf', () => {
    it('rounds half away from zero (positive, exact .5)', () => {
      expect(new Money(5).percentOf(1000).cents).toBe(1);
      expect(new Money(25).percentOf(200).cents).toBe(1);
      expect(new Money(100).percentOf(1850).cents).toBe(19);
      expect(new Money(100).percentOf(1750).cents).toBe(18);
    });

    it('rounds half away from zero (negative, exact .5)', () => {
      expect(new Money(-5).percentOf(1000).cents).toBe(-1);
      expect(new Money(-25).percentOf(200).cents).toBe(-1);
      expect(new Money(-100).percentOf(1850).cents).toBe(-19);
      expect(new Money(-100).percentOf(1750).cents).toBe(-18);
    });

    it('handles a negative amount with percent', () => {
      expect(new Money(-1000).percentOf(2000).cents).toBe(-200);
      expect(new Money(-100).percentOf(5000).cents).toBe(-50);
    });

    it('rounds toward zero for sub-half remainders', () => {
      expect(new Money(100).percentOf(5).cents).toBe(0);
      expect(new Money(3).percentOf(100).cents).toBe(0);
    });
  });
});