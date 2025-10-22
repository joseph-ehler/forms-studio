/**
 * ESLint Plugin: Cascade OS
 * 
 * Enforces design system patterns and prevents anti-patterns.
 */

module.exports = {
  rules: {
    /**
     * no-manual-scroll-containers
     * 
     * Prevents manual flex-1 min-h-0 overflow-auto containers.
     * Use OverlayPicker's content/header/footer slots instead.
     */
    'no-manual-scroll-containers': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow manual scroll containers; use OverlayPicker slots',
          category: 'Design System',
          recommended: true,
        },
        messages: {
          useSlots: 'Use OverlayPicker content slot; no manual scroll containers (flex-1 min-h-0 overflow-auto).',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (
              node.name?.name === 'className' &&
              node.value &&
              typeof node.value.value === 'string'
            ) {
              const className = node.value.value;
              // Check for the manual scroll container pattern
              if (
                className.includes('flex-1') &&
                className.includes('min-h-0') &&
                className.includes('overflow-auto')
              ) {
                context.report({
                  node,
                  messageId: 'useSlots',
                });
              }
            }
          },
        };
      },
    },

    /**
     * require-design-tokens
     * 
     * Warns on magic numbers that should use design tokens.
     */
    'require-design-tokens': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require design tokens for z-index, maxHeight, timing',
          category: 'Design System',
          recommended: true,
        },
        messages: {
          useTokens: 'Use design tokens (getZIndex()/getMaxHeight()) instead of magic number {{value}}.',
        },
      },
      create(context) {
        const MAGIC_NUMBERS = [1000, 1001, 1002, 560, 480, 720, 300, 150, 200];
        
        return {
          Literal(node) {
            if (
              typeof node.value === 'number' &&
              MAGIC_NUMBERS.includes(node.value)
            ) {
              context.report({
                node,
                messageId: 'useTokens',
                data: { value: node.value },
              });
            }
          },
        };
      },
    },

    /**
     * prefer-pointer-events
     * 
     * Recommends pointer events over mouse events for touch/pen support.
     */
    'prefer-pointer-events': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prefer pointer events over mouse events',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          usePointer: 'Use {{replacement}} instead of {{current}} for better touch/pen support.',
        },
      },
      create(context) {
        const MOUSE_TO_POINTER = {
          onMouseDown: 'onPointerDown',
          onMouseUp: 'onPointerUp',
          onMouseMove: 'onPointerMove',
        };

        return {
          JSXIdentifier(node) {
            const replacement = MOUSE_TO_POINTER[node.name];
            if (replacement) {
              context.report({
                node,
                messageId: 'usePointer',
                data: {
                  current: node.name,
                  replacement,
                },
              });
            }
          },
        };
      },
    },
  },
};
