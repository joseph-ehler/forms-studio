/**
 * ESLint Configuration - Monorepo Root
 * 
 * Applies to all packages and apps.
 * Enforces migration boundaries: fields ONLY in @intstudio/forms.
 * Enforces token usage: NO hard-coded colors/shadows/radii.
 */

module.exports = {
  root: true,
  extends: [
    './.eslintrc.token-enforcement.json'
  ],
  rules: {
    // Belt + suspenders: block DS fields imports everywhere
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['@intstudio/ds/fields', '@intstudio/ds/fields/*'],
          message: '❌ MIGRATION: Fields moved to @intstudio/forms.\n' +
                   'WHY: @intstudio/ds/fields is deprecated and will be removed in v2.0.\n' +
                   'FIX: import { TextField } from \'@intstudio/forms/fields\'\n' +
                   'CODEMOD: pnpm codemod:fields'
        }
      ]
    }],
  },
  overrides: [
    {
      // Allow DS compat façade to re-export (temporary)
      files: ['packages/ds/src/fields/**'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};
