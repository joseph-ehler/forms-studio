/**
 * ESLint Rule: sheet/no-panel-on-dialog
 * 
 * Prevents SheetPanel from being opened on top of SheetDialog
 * 
 * Why: SheetPanel is non-modal; SheetDialog is modal
 * Opening panel on dialog would de-modalize the flow (breaks UX)
 * 
 * @example
 * // ❌ Bad
 * function MyDialog() {
 *   return (
 *     <SheetDialog>
 *       <SheetPanel>...</SheetPanel>
 *     </SheetDialog>
 *   );
 * }
 * 
 * // ✅ Good
 * function MyDialog() {
 *   return (
 *     <SheetDialog>
 *       <SheetDialog>...</SheetDialog> // Nested dialog OK
 *     </SheetDialog>
 *   );
 * }
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Disallow SheetPanel as descendant of SheetDialog',
      category: 'Sheet System',
      recommended: true,
    },
    messages: {
      noPanelOnDialog:
        'SheetPanel cannot be opened on top of SheetDialog. ' +
        'Use another SheetDialog instead to maintain modal context.',
    },
    schema: [],
  },

  create(context) {
    let dialogAncestors = [];

    return {
      // Track when entering a SheetDialog
      'JSXElement[openingElement.name.name="SheetDialog"]'(node) {
        dialogAncestors.push(node);
      },

      // Check SheetPanel for dialog ancestors
      'JSXElement[openingElement.name.name="SheetPanel"]'(node) {
        if (dialogAncestors.length > 0) {
          context.report({
            node: node.openingElement.name,
            messageId: 'noPanelOnDialog',
          });
        }
      },

      // Clean up when exiting SheetDialog
      'JSXElement[openingElement.name.name="SheetDialog"]:exit'() {
        dialogAncestors.pop();
      },
    };
  },
};
