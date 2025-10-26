/**
 * ESLint rule: no-children-on-inputs
 * 
 * Prevents passing children to DS Input class components.
 * Input elements (Checkbox, Radio, Toggle, TextInput, etc.) are self-closing
 * and should not accept children.
 * 
 * ❌ BAD:
 *   <Checkbox>Label text</Checkbox>
 *   <Toggle>Enable feature</Toggle>
 * 
 * ✅ GOOD:
 *   <label><Checkbox /><span>Label text</span></label>
 *   <Toggle label="Enable feature" />
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Disallow children prop on DS Input components',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noChildrenOnInput: '{{componentName}} is an Input element and cannot accept children. Wrap in a <label> or use the label prop instead.',
    },
    schema: [],
  },

  create(context) {
    // DS Input components that should not accept children
    const inputComponents = new Set([
      'Checkbox',
      'Radio',
      'Toggle',
      'TextInput',
      'Textarea',
      'Select',
      'FileInput',
      'RangeSlider',
    ]);

    return {
      JSXElement(node) {
        const elementName = node.openingElement.name.name;
        
        // Check if this is a DS Input component
        if (!inputComponents.has(elementName)) {
          return;
        }

        // Check if it has children
        if (node.children && node.children.length > 0) {
          context.report({
            node,
            messageId: 'noChildrenOnInput',
            data: {
              componentName: elementName,
            },
          });
        }
      },

      JSXOpeningElement(node) {
        const elementName = node.name.name;
        
        // Check if this is a DS Input component
        if (!inputComponents.has(elementName)) {
          return;
        }

        // Check if it has a children prop
        const hasChildrenProp = node.attributes.some(
          attr => attr.type === 'JSXAttribute' && attr.name.name === 'children'
        );

        if (hasChildrenProp) {
          context.report({
            node,
            messageId: 'noChildrenOnInput',
            data: {
              componentName: elementName,
            },
          });
        }
      },
    };
  },
};
