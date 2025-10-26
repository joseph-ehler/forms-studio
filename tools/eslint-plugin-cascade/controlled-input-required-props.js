/**
 * ESLint rule: controlled-input-required-props
 * 
 * Ensures Input class components (Checkbox, Radio, Toggle) have either:
 * - Controlled props: checked/value + onChange
 * - OR uncontrolled: defaultChecked/defaultValue
 * 
 * ❌ BAD:
 *   <Checkbox />  // No state management
 *   <Toggle />
 * 
 * ✅ GOOD:
 *   <Checkbox checked={checked} onChange={setChecked} />
 *   <Checkbox defaultChecked />
 *   <input type="text" value={value} onChange={setValue} />
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Require controlled or uncontrolled props on Input components',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingControlledProps: '{{componentName}} must be controlled (checked/value + onChange) or uncontrolled (defaultChecked/defaultValue)',
    },
    schema: [],
  },

  create(context) {
    // Input components that require state management
    const inputComponents = new Set([
      'Checkbox',
      'Radio',
      'Toggle',
      'TextInput',
      'Textarea',
      'Select',
    ]);

    return {
      JSXOpeningElement(node) {
        const elementName = node.name.name;
        
        // Only check DS Input components
        if (!inputComponents.has(elementName)) {
          return;
        }

        const props = node.attributes;
        
        // Check for controlled props
        const hasChecked = props.some(attr => attr.name && attr.name.name === 'checked');
        const hasValue = props.some(attr => attr.name && attr.name.name === 'value');
        const hasOnChange = props.some(attr => attr.name && attr.name.name === 'onChange');
        
        // Check for uncontrolled props
        const hasDefaultChecked = props.some(attr => attr.name && attr.name.name === 'defaultChecked');
        const hasDefaultValue = props.some(attr => attr.name && attr.name.name === 'defaultValue');

        // Must be either controlled or uncontrolled
        const isControlled = (hasChecked || hasValue) && hasOnChange;
        const isUncontrolled = hasDefaultChecked || hasDefaultValue;

        if (!isControlled && !isUncontrolled) {
          context.report({
            node,
            messageId: 'missingControlledProps',
            data: {
              componentName: elementName,
            },
          });
        }
      },
    };
  },
};
