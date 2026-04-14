// src/__tests__/unit/apiKeyResolution.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(),
}));

import { getStoredApiKey, STORAGE_KEY } from '../../shared';

describe('getStoredApiKey resolution order', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it('returns localStorage value when present', () => {
    localStorage.setItem(STORAGE_KEY, 'local-storage-key');
    vi.stubEnv('VITE_GEMINI_API_KEY', 'env-key');
    expect(getStoredApiKey()).toBe('local-storage-key');
  });

  it('falls back to VITE_GEMINI_API_KEY env when localStorage is empty', () => {
    localStorage.removeItem(STORAGE_KEY);
    vi.stubEnv('VITE_GEMINI_API_KEY', 'env-key');
    expect(getStoredApiKey()).toBe('env-key');
  });

  it('returns empty string when both sources are empty', () => {
    localStorage.removeItem(STORAGE_KEY);
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    expect(getStoredApiKey()).toBe('');
  });
});
