import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const stubs = { 'server-only': new URL('./tests/stubs/server-only.ts', import.meta.url).pathname };

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      // Request-scoped and third-party modules; Playwright covers them.
      exclude: [
        'lib/generated/**',
        'lib/**/*actions.ts',
        'lib/auth/guards.ts',
        'lib/auth/session.ts',
        'lib/cron.ts',
        'lib/env.ts',
        'lib/ai/provider.ts',
        'lib/stripe/client.ts',
        'lib/email/send.ts',
      ],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
    projects: [
      {
        plugins: [react()],
        resolve: { tsconfigPaths: true, alias: stubs },
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          include: ['tests/unit/**/*.test.ts?(x)'],
        },
      },
      {
        resolve: { tsconfigPaths: true, alias: stubs },
        test: {
          name: 'integration',
          environment: 'node',
          globals: true,
          include: ['tests/integration/**/*.test.ts'],
          setupFiles: ['tests/integration/env.ts', 'tests/integration/setup.ts'],
          fileParallelism: false,
          testTimeout: 30_000,
        },
      },
    ],
  },
});
