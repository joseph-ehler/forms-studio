/**
 * ESLint Rule: no-raw-spacing-values
 * 
 * Prevents hardcoded spacing values in JSX.
 * Enforces use of design tokens via props.
 * 
 * ❌ Bad:
 *   <div style={{ margin: '16px' }} />
 *   <Stack style={{ gap: '24px' }} />
 * 
 * ✅ Good:
 *   <Stack spacing="normal" />
 *   <Box padding="4" />
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent raw spacing values in JSX - use design tokens via props',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      rawSpacing: 'Avoid raw spacing values. Use spacing prop: {{ suggestion }}',
    },
  },

  create(context) {
    const spacingProperties = [
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'padding',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'gap',
      'rowGap',
      'columnGap',
    ];

    function isRawSpacingValue(value) {
      if (typeof value !== 'string') return false;
      
      // Match pixel values (8px, 16px, etc.)
      // Match rem values (1rem, 2rem, etc.)
      return /^\d+(?:px|rem)$/.test(value);
    }

    function suggestToken(property, value) {
      // Parse numeric value
      const numMatch = value.match(/^(\d+)/);
      if (!numMatch) return '';
      
      const pixels = parseInt(numMatch[1], 10);
      
      // Map to spacing scale (0-12)
      const tokenMap = {
        0: '0',
        4: '1',
        8: '2',
        12: '3',
        16: '4',
        20: '5',
        24: '6',
        32: '8',
        40: '10',
        48: '12',
      };
      
      const token = tokenMap[pixels];
      
      if (token) {
        if (property === 'gap') {
          return `spacing="${token}" or gap="${token}"`;
        }
        if (property.startsWith('padding')) {
          return `padding="${token}"`;
        }
        if (property.startsWith('margin')) {
          return `margin="${token}"`;
        }
      }
      
      return 'spacing token prop';
    }

    return {
      JSXAttribute(node) {
        // Check style prop
        if (node.name.name === 'style' && node.value?.expression) {
          const expression = node.value.expression;
          
          if (expression.type === 'ObjectExpression') {
            for (const prop of expression.properties) {
              if (
                prop.type === 'Property' &&
                prop.key.type === 'Identifier' &&
                spacingProperties.includes(prop.key.name)
              ) {
                const value = prop.value.value || prop.value.raw;
                
                if (isRawSpacingValue(value)) {
                  const suggestion = suggestToken(prop.key.name, value);
                  
                  context.report({
                    node: prop.value,
                    messageId: 'rawSpacing',
                    data: { suggestion },
                  });
                }
              }
            }
          }
        }
      },
    };
  },
};
