import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true, alias: { 'server-only': new URL('./tests/stubs/server-only.ts', import.meta.url).pathname } },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.ts?(x)'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/generated/**'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});
