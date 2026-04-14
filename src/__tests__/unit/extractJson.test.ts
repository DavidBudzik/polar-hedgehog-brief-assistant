// src/__tests__/unit/extractJson.test.ts
import { describe, it, expect } from 'vitest';
import { extractJson } from '../../shared';

describe('extractJson', () => {
  it('parses a bare JSON object string', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('extracts JSON embedded in prose', () => {
    expect(extractJson('Here is the result: {"a":1} done')).toEqual({ a: 1 });
  });

  it('extracts JSON from a markdown code block', () => {
    const input = '```json\n{"a":1}\n```';
    expect(extractJson(input)).toEqual({ a: 1 });
  });

  it('returns null for malformed JSON', () => {
    expect(extractJson('{a:1}')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractJson('')).toBeNull();
  });

  it('handles nested objects', () => {
    expect(extractJson('{"a":{"b":2}}')).toEqual({ a: { b: 2 } });
  });
});
