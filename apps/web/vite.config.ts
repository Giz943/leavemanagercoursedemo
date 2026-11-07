import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = process.env.PORT ?? '3000';

export default defineConfig({
  plugins: [react()],
  server: {
    // Local development only: forward API calls to the Hono server.
    proxy: { '/api': `http://localhost:${apiPort}` },
  },
});
