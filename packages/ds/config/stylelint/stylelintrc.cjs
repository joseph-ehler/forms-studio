/**
 * Stylelint Configuration - Design System Guardrails
 * 
 * Enforces:
 * - Color tokens only (no raw hex/rgb)
 * - 4px spacing grid
 * - CSS variable usage
 */

module.exports = {
  plugins: [
    './stylelint-plugin-ds',
  ],
  rules: {
    // Custom DS rules
    'plugin/ds/no-raw-color': true,
    'plugin/ds/spacing-multiple-of-4': true,

    // Enforce color tokens
    'scale-unlimited/declaration-strict-value': [
      [
        '/color/',
        'fill',
        'stroke',
        'background',
        'background-color',
        'border-color',
        'outline-color',
      ],
      {
        ignoreValues: ['currentColor', 'transparent', 'inherit', 'initial', 'unset', 'none'],
        ignoreFunctions: false,
      },
    ],

    // Allow CSS variables
    'custom-property-pattern': '^(ds|tw)-[a-z0-9-]+$',
    
    // Prevent unknown custom properties
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['/^--/'], // Allow all custom properties
      },
    ],
  },
}
