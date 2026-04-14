// src/__tests__/unit/aiAnalyzeFile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({ text: 'result' });
const mockFilesUpload = vi.fn().mockResolvedValue({
  name: 'files/test-123',
  state: 'ACTIVE',
  uri: 'gs://bucket/test-123',
});
const mockFilesGet = vi.fn().mockResolvedValue({
  name: 'files/test-123',
  state: 'ACTIVE',
  uri: 'gs://bucket/test-123',
});

vi.mock('@google/genai', () => ({
  // Must use regular function (not arrow) so `new GoogleGenAI()` works as a constructor
  GoogleGenAI: vi.fn().mockImplementation(function () {
    return {
      models: { generateContent: mockGenerateContent },
      files: { upload: mockFilesUpload, get: mockFilesGet },
    };
  }),
}));

import { aiAnalyzeFile } from '../../shared';

function makeFile(mimeType: string): File {
  return new File(['content'], 'test-file', { type: mimeType });
}

describe('aiAnalyzeFile routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockResolvedValue({ text: 'result' });
    mockFilesUpload.mockResolvedValue({
      name: 'files/test-123',
      state: 'ACTIVE',
      uri: 'gs://bucket/test-123',
    });
    mockFilesGet.mockResolvedValue({
      name: 'files/test-123',
      state: 'ACTIVE',
      uri: 'gs://bucket/test-123',
    });
  });

  const imageMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ];

  imageMimeTypes.forEach(mimeType => {
    it(`routes ${mimeType} via inline base64 (aiAnalyzeImage)`, async () => {
      await aiAnalyzeFile(makeFile(mimeType), 'describe this');
      expect(mockFilesUpload).not.toHaveBeenCalled();
      expect(mockGenerateContent).toHaveBeenCalledOnce();
      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents[0].parts[0]).toHaveProperty('inlineData');
    });
  });

  const docMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  docMimeTypes.forEach(mimeType => {
    it(`routes ${mimeType} via Files API (aiAnalyzeDocument)`, async () => {
      await aiAnalyzeFile(makeFile(mimeType), 'describe this');
      expect(mockFilesUpload).toHaveBeenCalledOnce();
      expect(mockGenerateContent).toHaveBeenCalledOnce();
      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents[0].parts[0]).toHaveProperty('fileData');
    });
  });
});
