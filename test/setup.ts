import { afterAll } from 'vitest';

// Global cleanup to prevent worker hanging
afterAll(async () => {
  // Give transformers.js workers time to cleanup
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Cleanup transformers workers properly
  if (globalThis.gc) {
    globalThis.gc();
  }
});
