/**
 * @fileoverview Disallow drag-to-dismiss on SheetDialog (modal dialogs)
 * @author Design System Team
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Disallow allowDragDismiss prop on SheetDialog components',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/your-org/forms-studio/blob/main/docs/ds/SHEET_POLICY.md#sheetdialog-contracts',
    },
    fixable: 'code',
    messages: {
      noDragDismiss: 'SheetDialog does not support drag-to-dismiss. Use explicit Done/Cancel buttons for modal clarity.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        // Check if this is SheetDialog or OverlaySheet (legacy name)
        const componentName = node.name.name
        if (componentName !== 'SheetDialog' && componentName !== 'OverlaySheet') {
          return
        }

        // Look for allowDragDismiss prop
        const dragDismissProp = node.attributes.find(
          attr => 
            attr.type === 'JSXAttribute' && 
            attr.name.name === 'allowDragDismiss'
        )

        if (dragDismissProp) {
          context.report({
            node: dragDismissProp,
            messageId: 'noDragDismiss',
            fix(fixer) {
              // Auto-fix: remove the prop entirely
              const sourceCode = context.getSourceCode()
              const propText = sourceCode.getText(dragDismissProp)
              
              // Find if there's a comma/space before or after
              const tokenBefore = sourceCode.getTokenBefore(dragDismissProp)
              const tokenAfter = sourceCode.getTokenAfter(dragDismissProp)
              
              // Remove prop and any trailing/leading whitespace
              return fixer.removeRange([
                dragDismissProp.range[0],
                dragDismissProp.range[1]
              ])
            }
          })
        }
      }
    }
  }
}
