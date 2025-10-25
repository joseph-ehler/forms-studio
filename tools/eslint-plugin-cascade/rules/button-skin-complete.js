/**
 * ESLint Rule: button-skin-complete
 * 
 * Ensures SKIN map has all required --btn-* keys for every variant.
 * Build fails if any variant is missing required CSS variables.
 * 
 * Usage in .eslintrc:
 * {
 *   "plugins": ["cascade"],
 *   "rules": {
 *     "cascade/button-skin-complete": "error"
 *   }
 * }
 */

const REQUIRED_SKIN_VARS = [
  '--btn-fg',
  '--btn-bg',
  '--btn-hover-bg',
  '--btn-active-bg'
];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Button SKIN map must define all required --btn-* CSS variables for every variant',
      category: 'Design System',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingVars: '[Button SKIN] Variant "{{variant}}" missing: {{missing}}',
      incompleteSkin: '[Button SKIN] Must define all variants with complete CSS variables',
    },
  },

  create(context) {
    let inSkin = false;
    let skinNode = null;

    return {
      // Match: const SKIN: Record<ButtonVariant, CSSProperties> = { ... }
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.name === 'SKIN' &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          inSkin = true;
          skinNode = node.init;
        }
      },

      'Program:exit'() {
        if (!inSkin || !skinNode) return;

        // Check each variant (property) in the SKIN object
        for (const prop of skinNode.properties) {
          if (prop.type !== 'Property' || prop.value.type !== 'ObjectExpression') {
            continue;
          }

          // Get variant name
          const variant = prop.key.name || prop.key.value;

          // Extract all CSS variable keys from this variant
          const definedKeys = new Set(
            prop.value.properties
              .filter(p => p.type === 'Property' && p.key.type === 'Literal')
              .map(p => p.key.value)
          );

          // Find missing required vars
          const missing = REQUIRED_SKIN_VARS.filter(k => !definedKeys.has(k));

          if (missing.length > 0) {
            context.report({
              node: prop,
              messageId: 'missingVars',
              data: {
                variant,
                missing: missing.join(', '),
              },
            });
          }
        }
      },
    };
  },
};
