import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Determinism (docs/testing.md): fixed time zone and locale for every test run.
process.env.TZ = 'UTC';
process.env.LANG = 'tr_TR.UTF-8';

export default defineConfig({
  test: {
    // resource hygiene: run mode only; never watch inside scripts/check
    watch: false,
    projects: [
      { test: { name: 'api', environment: 'node', include: ['apps/api/src/**/*.test.ts'] } },
      { test: { name: 'shared', environment: 'node', include: ['packages/shared/src/**/*.test.ts'] } },
      { test: { name: 'tooling', environment: 'node', include: ['tooling/**/*.test.ts'] } },
      {
        plugins: [react()],
        test: { name: 'web', environment: 'jsdom', include: ['apps/web/src/**/*.test.tsx'] },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['apps/api/src/domain/**/*.ts'],
      exclude: ['**/*.test.ts'],
      thresholds: { lines: 90, branches: 90 },
    },
  },
});
