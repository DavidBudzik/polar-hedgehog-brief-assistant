// src/__tests__/unit/stepsOrder.test.ts
import { describe, it, expect } from 'vitest';
import { STEPS_ORDER } from '../../types';
import type { BriefStep } from '../../types';

function nextStep(current: BriefStep): BriefStep {
  const idx = STEPS_ORDER.indexOf(current);
  if (idx < STEPS_ORDER.length - 1) return STEPS_ORDER[idx + 1];
  return current;
}

describe('STEPS_ORDER integrity', () => {
  it('has exactly 9 steps', () => {
    expect(STEPS_ORDER).toHaveLength(9);
  });

  it('has no duplicates', () => {
    const unique = new Set(STEPS_ORDER);
    expect(unique.size).toBe(STEPS_ORDER.length);
  });

  it('starts with setup', () => {
    expect(STEPS_ORDER[0]).toBe('setup');
  });

  it('ends with summary', () => {
    expect(STEPS_ORDER[STEPS_ORDER.length - 1]).toBe('summary');
  });

  it('contains all expected steps in order', () => {
    expect(STEPS_ORDER).toEqual([
      'setup',
      'problem_solution',
      'market_position',
      'product',
      'brand_audit',
      'brand_voice',
      'brand_values_direction',
      'visual_references',
      'summary',
    ]);
  });
});

describe('navigation logic', () => {
  it('advances from setup to problem_solution', () => {
    expect(nextStep('setup')).toBe('problem_solution');
  });

  it('advances from problem_solution to market_position', () => {
    expect(nextStep('problem_solution')).toBe('market_position');
  });

  it('advances from market_position to product', () => {
    expect(nextStep('market_position')).toBe('product');
  });

  it('advances from product to brand_audit', () => {
    expect(nextStep('product')).toBe('brand_audit');
  });

  it('advances from brand_audit to brand_voice', () => {
    expect(nextStep('brand_audit')).toBe('brand_voice');
  });

  it('advances from brand_voice to brand_values_direction', () => {
    expect(nextStep('brand_voice')).toBe('brand_values_direction');
  });

  it('advances from brand_values_direction to visual_references', () => {
    expect(nextStep('brand_values_direction')).toBe('visual_references');
  });

  it('advances from visual_references to summary', () => {
    expect(nextStep('visual_references')).toBe('summary');
  });

  it('stays on summary (last step does not overflow)', () => {
    expect(nextStep('summary')).toBe('summary');
  });
});
