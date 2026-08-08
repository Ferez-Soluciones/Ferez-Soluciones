/**
 * Vite configuration for the Vertex Studio client.
 *
 * The dev server proxies `/api` to the Express server so the browser always
 * talks to a single origin. That way `fetch('/api/services')` is written the
 * same in development and in production, where Express serves both the built
 * bundle and the API — no environment-specific base URL anywhere in the code.
 */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
