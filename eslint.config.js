// ESLint v9 Flat Config (Minimal God Tier Setup)
// Silences pre-commit noise while keeping high-signal rules

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Base recommended config
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  {
    files: ['packages/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // High-signal rules only
      '@typescript-eslint/no-explicit-any': 'off', // Allow any for migration
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-console': 'off', // Allow console in scripts
    },
  },
  
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      'docs/**', // Markdown examples may have syntax issues
      'scripts/**', // Scripts have looser rules
      'examples/**', // Examples are for demonstration
      '**/*.config.{js,mjs,cjs}', // Config files
      '**/.eslintrc.{js,cjs}', // Legacy ESLint configs
    ],
  }
);
