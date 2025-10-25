/**
 * Stylelint Configuration
 * 
 * Enforces token usage and prevents raw colors/values in CSS.
 */

module.exports = {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    '**/dist/**',
    '**/node_modules/**',
    '**/.next/**',
    '**/storybook-static/**',
  ],
  rules: {
    // Block raw hex and rgba() colors on appearance props
    'declaration-property-value-disallowed-list': {
      '/^(color|background|border|outline|box-shadow)$/': ['/#/', '/rgba?\\(/'],
    },
    // Allow custom properties (CSS variables)
    'custom-property-pattern': null,
    // Allow BEM-style naming
    'selector-class-pattern': null,
  },
};
