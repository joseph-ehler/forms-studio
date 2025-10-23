/**
 * @fileoverview Validate Stack component props
 * @author Intelligence Studio
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Only allow supported props on Stack component',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      unsupportedProp:
        'Stack prop "{{propName}}" is not supported. Use spacing/direction/wrap instead.',
      deprecatedGap: 'Use "spacing" instead of "gap" on Stack component.',
    },
  },

  create(context) {
    // Allowed Stack props
    const ALLOWED_PROPS = new Set([
      'direction',
      'spacing',
      'wrap',
      'className',
      'style',
      'children',
      'as',
      'ref',
      // Data attributes
      'data-testid',
      // Spread props are allowed (can't validate statically)
    ]);

    return {
      JSXOpeningElement(node) {
        const elementName = node.name.name;

        // Only check Stack components
        if (elementName !== 'Stack') return;

        // Check each attribute
        for (const attr of node.attributes) {
          // Skip spread attributes
          if (attr.type === 'JSXSpreadAttribute') continue;

          const propName = attr.name?.name;
          if (!propName) continue;

          // Allow data-* attributes
          if (propName.startsWith('data-')) continue;

          // Special case: gap is deprecated
          if (propName === 'gap') {
            context.report({
              node: attr,
              messageId: 'deprecatedGap',
            });
            continue;
          }

          // Check if prop is allowed
          if (!ALLOWED_PROPS.has(propName)) {
            context.report({
              node: attr,
              messageId: 'unsupportedProp',
              data: {
                propName,
              },
            });
          }
        }
      },
    };
  },
};
