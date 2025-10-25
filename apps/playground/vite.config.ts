import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    // Prefer source subpath exports in dev for instant HMR
    conditions: ['source', 'module', 'browser', 'development'],
    // Preserve symlinks for pnpm workspace packages
    preserveSymlinks: true,
    // Shim server-only deps that leak into browser bundle
    alias: {
      cookie: path.resolve(__dirname, 'src/shims/cookie.ts'),
      'set-cookie-parser': path.resolve(__dirname, 'src/shims/set-cookie-parser.ts'),
    },
  },
  optimizeDeps: {
    // Don't prebundle these (they cause resolution churn)
    exclude: ['cookie', 'set-cookie-parser', '@remix-run/router', 'react-router', 'react-router-dom'],
  },
});
