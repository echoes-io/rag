import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'json-summary'],
    },
    setupFiles: ['./test/setup.ts'],
    teardownTimeout: 10000,
    hookTimeout: 30000,
  },
});
