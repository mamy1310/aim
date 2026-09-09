import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true, alias: { 'server-only': new URL('./tests/stubs/server-only.ts', import.meta.url).pathname } },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['tests/integration/env.ts', 'tests/integration/setup.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
