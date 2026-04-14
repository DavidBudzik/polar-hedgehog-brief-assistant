// src/__tests__/unit/modelFallback.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let aiGen: (prompt: string, json?: boolean) => Promise<string>;
let mockGenerateContent: ReturnType<typeof vi.fn>;

function make429(): Error {
  const e = new Error('Rate limit exceeded');
  (e as any).status = 429;
  return e;
}

function make404(): Error {
  const e = new Error('Model not found');
  (e as any).status = 404;
  return e;
}

function make500(): Error {
  const e = new Error('Internal error');
  (e as any).status = 500;
  return e;
}

beforeEach(async () => {
  vi.resetModules();
  mockGenerateContent = vi.fn();
  // Must use regular function (not arrow) so `new GoogleGenAI()` works as a constructor
  vi.doMock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockImplementation(function () {
      return {
        models: { generateContent: mockGenerateContent },
        files: { upload: vi.fn(), get: vi.fn() },
      };
    }),
  }));
  const mod = await import('../../shared');
  aiGen = mod.aiGen;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('aiGen model fallback chain', () => {
  it('succeeds on first call with no fallback', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'hello' });
    const result = await aiGen('test prompt');
    expect(result).toBe('hello');
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it('falls back to gemini-2.0-flash on first 429', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(make429())
      .mockResolvedValueOnce({ text: 'fallback result' });

    const result = await aiGen('test prompt');
    expect(result).toBe('fallback result');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(mockGenerateContent.mock.calls[1][0].model).toBe('gemini-2.0-flash');
  });

  it('falls back to gemini-flash-lite-latest on second 429', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(make429())
      .mockRejectedValueOnce(make429())
      .mockResolvedValueOnce({ text: 'lite result' });

    const result = await aiGen('test prompt');
    expect(result).toBe('lite result');
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    expect(mockGenerateContent.mock.calls[2][0].model).toBe('gemini-flash-lite-latest');
  });

  it('re-throws after all fallbacks exhausted', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(make429())
      .mockRejectedValueOnce(make429())
      .mockRejectedValueOnce(make429());

    await expect(aiGen('test prompt')).rejects.toMatchObject({ status: 429 });
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
  });

  it('treats 404 the same as 429 for fallback', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(make404())
      .mockResolvedValueOnce({ text: 'found via fallback' });

    const result = await aiGen('test prompt');
    expect(result).toBe('found via fallback');
    expect(mockGenerateContent.mock.calls[1][0].model).toBe('gemini-2.0-flash');
  });

  it('throws immediately on non-429/404 errors without retry', async () => {
    mockGenerateContent.mockRejectedValueOnce(make500());
    await expect(aiGen('test prompt')).rejects.toMatchObject({ status: 500 });
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });
});
