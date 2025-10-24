/**
 * @fileoverview Disallow modal props on SheetPanel (non-modal panels)
 * @author Design System Team
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Disallow modal-related props on SheetPanel components',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/your-org/forms-studio/blob/main/docs/ds/SHEET_POLICY.md#sheetpanel-contracts',
    },
    fixable: 'code',
    messages: {
      noModalProps: "SheetPanel is non-modal. Remove '{{propName}}' prop. Use <SheetDialog> for modal tasks.",
    },
    schema: [],
  },

  create(context) {
    const MODAL_PROPS = ['modal', 'trapFocus', 'backdrop', 'scrollLock', 'ariaModal']

    return {
      JSXOpeningElement(node) {
        // Check if this is SheetPanel
        if (node.name.name !== 'SheetPanel') {
          return
        }

        // Check each attribute
        node.attributes.forEach(attr => {
          if (attr.type !== 'JSXAttribute') return
          
          const propName = attr.name.name
          
          if (MODAL_PROPS.includes(propName)) {
            context.report({
              node: attr,
              messageId: 'noModalProps',
              data: {
                propName
              },
              fix(fixer) {
                // Auto-fix: remove the prop
                return fixer.remove(attr)
              }
            })
          }
        })
      }
    }
  }
}
