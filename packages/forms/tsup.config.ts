import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  external: [
    'react',
    'react-dom',
    'react-hook-form',
    'lucide-react',
    '@intstudio/ds',
    '@intstudio/core'
  ]
});
