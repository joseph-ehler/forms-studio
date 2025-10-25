import { copyFileSync, mkdirSync } from 'fs';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // Main barrel
    index: 'src/index.ts',
    // Subpath exports
    'fb/index': 'src/fb/index.ts',
    'routes/index': 'src/routes/index.ts',
    'hooks/index': 'src/hooks/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false, // Keep readable for debugging
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    'react-router',
    'react-router-dom',
    'framer-motion',
    'flowbite-react',
    'flowbite-react-icons',
  ],
  onSuccess: async () => {
    // Copy global CSS files to dist/styles
    try {
      mkdirSync('dist/styles', { recursive: true });
      copyFileSync('src/styles/ds-interactions.css', 'dist/styles/ds-interactions.css');
      copyFileSync('src/styles/focus-rings.css', 'dist/styles/focus-rings.css');
      copyFileSync('src/styles/overlay-standards.css', 'dist/styles/overlay-standards.css');
      console.log('✅ Copied global CSS files');
    } catch (err) {
      console.error('❌ Failed to copy CSS:', err);
      throw err;
    }
  },
});
