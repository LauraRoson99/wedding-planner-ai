import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Integration tests share one Postgres database, so run test files serially
    // to avoid cross-file interference.
    fileParallelism: false,
    include: ['src/**/*.test.ts'],
    testTimeout: 20000,
  },
});
