// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/__tests__/unit/**/*.test.ts'],
    globals: true,
  },
});
