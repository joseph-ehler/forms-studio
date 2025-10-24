/**
 * @fileoverview Disallow manual z-index on overlay components
 * @author Design System Team
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Disallow manual z-index settings on overlay components',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/your-org/forms-studio/blob/main/docs/ds/SHEET_POLICY.md#z-index-lanes',
    },
    messages: {
      noManualZIndex: 'Do not set z-index manually on overlays. Z-index is managed by DS via z-lanes (panel: 700, modal: 900, toast: 1100).',
      noZIndexClass: 'Do not use z-index utility classes on overlays. Z-index is managed by the DS.',
    },
    schema: [],
  },

  create(context) {
    const OVERLAY_COMPONENTS = [
      'SheetDialog',
      'SheetPanel', 
      'OverlaySheet',
      'OverlayPicker',
      'Popover',
      'Dialog',
      'Modal'
    ]

    return {
      JSXOpeningElement(node) {
        const componentName = node.name.name
        
        // Check if this is an overlay component
        if (!OVERLAY_COMPONENTS.includes(componentName)) {
          return
        }

        node.attributes.forEach(attr => {
          if (attr.type !== 'JSXAttribute') return

          // Check 1: style prop with zIndex
          if (attr.name.name === 'style' && attr.value) {
            if (attr.value.type === 'JSXExpressionContainer') {
              const expression = attr.value.expression
              
              // Check for { zIndex: ... }
              if (expression.type === 'ObjectExpression') {
                const hasZIndex = expression.properties.some(prop => {
                  return (
                    prop.type === 'Property' &&
                    prop.key &&
                    (prop.key.name === 'zIndex' || 
                     (prop.key.type === 'Literal' && prop.key.value === 'zIndex'))
                  )
                })

                if (hasZIndex) {
                  context.report({
                    node: attr,
                    messageId: 'noManualZIndex',
                  })
                }
              }
            }
          }

          // Check 2: className with z- utilities
          if (attr.name.name === 'className' && attr.value) {
            let classNameValue = null
            
            if (attr.value.type === 'Literal') {
              classNameValue = attr.value.value
            } else if (attr.value.type === 'JSXExpressionContainer') {
              // Try to evaluate simple string literals
              if (attr.value.expression.type === 'Literal') {
                classNameValue = attr.value.expression.value
              } else if (attr.value.expression.type === 'TemplateLiteral') {
                // Check template literal for z- classes
                const hasZClass = attr.value.expression.quasis.some(
                  quasi => quasi.value.raw.includes('z-')
                )
                if (hasZClass) {
                  context.report({
                    node: attr,
                    messageId: 'noZIndexClass',
                  })
                }
                return
              }
            }

            // Check if className contains z- utilities
            if (classNameValue && typeof classNameValue === 'string' && classNameValue.includes('z-')) {
              context.report({
                node: attr,
                messageId: 'noZIndexClass',
              })
            }
          }
        })
      }
    }
  }
}
