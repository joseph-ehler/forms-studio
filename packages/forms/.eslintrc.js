/**
 * ESLint Configuration - Forms Package
 * 
 * Enforces design system guardrails and prevents anti-patterns.
 */

module.exports = {
  root: true,
  extends: [
    'plugin:cascade/recommended',
  ],
  plugins: ['cascade'],
  rules: {
    // Migration guardrails (prevent issues from returning)
    'cascade/no-self-package-imports': 'error',
    'cascade/stack-prop-guard': 'error',
    'cascade/no-compat': ['error', {
      banned: ['DSShims', 'compat', 'lib/focus', '@intstudio/ds/fields']
    }],
    
    // Forms-specific: less strict on inline styles (Storybook)
    'cascade/no-inline-styles': 'off',
  },
  overrides: [
    {
      // Allow package imports in type tests
      files: ['**/*.test-d.ts', '**/__tests__/**'],
      rules: {
        'cascade/no-self-package-imports': 'off',
      },
    },
    {
      // Allow inline styles in Storybook stories
      files: ['**/*.stories.tsx'],
      rules: {
        'cascade/no-inline-styles': 'off',
      },
    },
  ],
};
