/**
 * Stylelint Plugin - Design System Rules
 * 
 * Enforces:
 * 1. No raw color values (must use tokens)
 * 2. Spacing values must be multiples of 4px
 */

const stylelint = require('stylelint')

const ruleName = 'plugin/ds/no-raw-color'
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (value) => `Unexpected raw color "${value}". Use --ds-color-* tokens instead.`,
})

// Rule: No raw colors
const noRawColorRule = stylelint.createPlugin(
  ruleName,
  (primaryOption) => {
    return (root, result) => {
      const validOptions = stylelint.utils.validateOptions(result, ruleName, {
        actual: primaryOption,
      })

      if (!validOptions) return

      // Regex patterns for raw colors
      const hexPattern = /#(?:[0-9a-fA-F]{3}){1,2}\b/
      const rgbPattern = /rgba?\([^)]+\)/

      root.walkDecls((decl) => {
        const colorProps = [
          'color',
          'background',
          'background-color',
          'border',
          'border-color',
          'border-top-color',
          'border-right-color',
          'border-bottom-color',
          'border-left-color',
          'outline',
          'outline-color',
          'fill',
          'stroke',
          'box-shadow',
          'text-shadow',
        ]

        if (colorProps.includes(decl.prop)) {
          const value = decl.value

          // Allow specific values
          const allowedValues = [
            'transparent',
            'currentColor',
            'inherit',
            'initial',
            'unset',
            'none',
          ]

          if (allowedValues.includes(value)) return

          // Allow CSS variables
          if (value.includes('var(')) return

          // Check for hex or rgb()
          if (hexPattern.test(value) || rgbPattern.test(value)) {
            stylelint.utils.report({
              message: messages.rejected(value),
              node: decl,
              result,
              ruleName,
            })
          }
        }
      })
    }
  }
)

// Rule: Spacing must be multiples of 4
const spacingRuleName = 'plugin/ds/spacing-multiple-of-4'
const spacingMessages = stylelint.utils.ruleMessages(spacingRuleName, {
  rejected: (value) => `Spacing "${value}" must be a multiple of 4px. Use --ds-space-* tokens.`,
})

const spacingMultipleRule = stylelint.createPlugin(
  spacingRuleName,
  (primaryOption) => {
    return (root, result) => {
      const validOptions = stylelint.utils.validateOptions(result, spacingRuleName, {
        actual: primaryOption,
      })

      if (!validOptions) return

      root.walkDecls((decl) => {
        const spacingProps = [
          'margin',
          'margin-top',
          'margin-right',
          'margin-bottom',
          'margin-left',
          'padding',
          'padding-top',
          'padding-right',
          'padding-bottom',
          'padding-left',
          'gap',
          'row-gap',
          'column-gap',
        ]

        if (spacingProps.includes(decl.prop)) {
          const value = decl.value

          // Allow specific values
          const allowedValues = ['0', 'auto', 'inherit', 'initial', 'unset']
          if (allowedValues.includes(value)) return

          // Allow CSS variables
          if (value.includes('var(')) return

          // Allow calc()
          if (value.includes('calc(')) return

          // Check px values
          const pxMatch = value.match(/^(\d+)px$/)
          if (pxMatch) {
            const pixels = parseInt(pxMatch[1], 10)
            if (pixels % 4 !== 0) {
              stylelint.utils.report({
                message: spacingMessages.rejected(value),
                node: decl,
                result,
                ruleName: spacingRuleName,
              })
            }
          }

          // Check rem values (assuming 1rem = 16px)
          const remMatch = value.match(/^(\d+(?:\.\d+)?)rem$/)
          if (remMatch) {
            const rem = parseFloat(remMatch[1])
            const pixels = rem * 16
            if (pixels % 4 !== 0) {
              stylelint.utils.report({
                message: spacingMessages.rejected(value),
                node: decl,
                result,
                ruleName: spacingRuleName,
              })
            }
          }
        }
      })
    }
  }
)

module.exports = [noRawColorRule, spacingMultipleRule]
module.exports.ruleName = ruleName
