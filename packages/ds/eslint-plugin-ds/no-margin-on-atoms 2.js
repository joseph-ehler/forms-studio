/**
 * ESLint Rule: no-margin-on-atoms
 * 
 * Prevents adding margin styles to atom components.
 * Atoms must be neutral (margin: 0). Layout owns spacing.
 * 
 * Usage:
 * {
 *   "rules": {
 *     "@ds/no-margin-on-atoms": "error"
 *   }
 * }
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow margin styles on atom components',
      category: 'Design System',
      recommended: true,
    },
    messages: {
      noMargin: 'Atoms must be margin: 0. Layout components (Stack, Box, FormLayout) own spacing.',
    },
    schema: [],
  },

  create(context) {
    // Atoms that must remain neutral
    const ATOMS = new Set([
      'Display',
      'Heading',
      'Body',
      'Text',
      'Label',
      'HelperText',
      'Caption',
      'Button',
    ])

    return {
      JSXOpeningElement(node) {
        const componentName = node.name.name

        // Only check atom components
        if (!ATOMS.has(componentName)) return

        // Check for style prop
        const styleAttr = node.attributes.find(
          attr => attr.type === 'JSXAttribute' && attr.name?.name === 'style'
        )

        if (!styleAttr) return

        // Check if style contains margin properties
        if (styleAttr.value?.type === 'JSXExpressionContainer') {
          const expression = styleAttr.value.expression

          if (expression?.type === 'ObjectExpression') {
            const hasMargin = expression.properties.some(prop => {
              if (prop.type !== 'Property') return false
              const key = prop.key.name || prop.key.value
              return /^margin/.test(key) && key !== 'margin' // Allow margin: 0
            })

            if (hasMargin) {
              context.report({
                node: styleAttr,
                messageId: 'noMargin',
              })
            }
          }
        }
      },
    }
  },
}
