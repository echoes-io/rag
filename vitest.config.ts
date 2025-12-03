import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'], // Only TypeScript tests
    coverage: {
      reporter: ['text', 'json', 'json-summary'],
    },
    globalSetup: ['./test/global-setup.ts'],
    setupFiles: ['./test/setup.ts'],
    teardownTimeout: 10000,
    hookTimeout: 60000, // 60s for model loading in beforeAll
  },
});
