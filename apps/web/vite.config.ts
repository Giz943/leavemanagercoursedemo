import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The API reads the repo-root .env (apps/api/package.json); read the same file so PORT matches.
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, '');
  const apiPort = env.PORT ?? '3000';
  return {
    plugins: [react()],
    server: {
      // Local development only: forward API calls to the Hono server.
      proxy: { '/api': `http://localhost:${apiPort}` },
    },
  };
});
