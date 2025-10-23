/**
 * ESLint Configuration - Design System Package
 * 
 * Enforces design system guardrails to prevent regressions.
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
      banned: ['DSShims', 'compat', 'lib/focus']
    }],
  },
  overrides: [
    {
      // Allow package imports in type tests
      files: ['**/*.test-d.ts', '**/__tests__/**'],
      rules: {
        'cascade/no-self-package-imports': 'off',
      },
    },
  ],
};
