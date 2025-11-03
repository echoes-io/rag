import { afterAll } from 'vitest';

// Global cleanup to prevent worker hanging
afterAll(async () => {
  // Give transformers.js workers time to cleanup
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Force exit if needed
  if (process.env.CI) {
    process.exit(0);
  }
});
