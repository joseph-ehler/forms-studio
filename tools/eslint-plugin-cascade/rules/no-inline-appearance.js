/**
 * ESLint Rule: no-inline-appearance
 * 
 * Forbids inline appearance styles in JSX
 * Allows only runtime-computed positioning/transforms
 * 
 * Why: Appearance must be in DS CSS (tokens only)
 * Inline styles bypass token system and break consistency
 * 
 * @example
 * // ❌ Bad - appearance in inline styles
 * <div style={{ padding: '16px', background: '#fff' }}>
 * 
 * // ✅ Good - use DS classes
 * <div className="ds-input">
 * 
 * // ✅ OK - runtime-computed positioning
 * <div style={{ transform: `translateY(${offset}px)` }}>
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Disallow inline appearance styles in JSX',
      category: 'Design System',
      recommended: true,
    },
    messages: {
      noInlineAppearance:
        'Inline style property "{{property}}" is not allowed. ' +
        'Use DS classes (.ds-*) or CSS custom properties (--ds-*) instead. ' +
        'Only runtime-computed positioning/transforms are permitted inline.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedProperties: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional properties to allow (e.g., transform, opacity for animations)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // Appearance properties that MUST be in CSS
    const FORBIDDEN_PROPERTIES = [
      // Spacing
      'padding',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'paddingInline',
      'paddingBlock',
      'paddingInlineStart',
      'paddingInlineEnd',
      'paddingBlockStart',
      'paddingBlockEnd',
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'marginInline',
      'marginBlock',
      'marginInlineStart',
      'marginInlineEnd',
      'marginBlockStart',
      'marginBlockEnd',
      'gap',
      'rowGap',
      'columnGap',
      
      // Colors
      'background',
      'backgroundColor',
      'backgroundImage',
      'color',
      'borderColor',
      'outlineColor',
      'fill',
      'stroke',
      
      // Borders & Shadows
      'border',
      'borderTop',
      'borderRight',
      'borderBottom',
      'borderLeft',
      'borderWidth',
      'borderStyle',
      'borderRadius',
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
      'boxShadow',
      'textShadow',
      
      // Sizing (except runtime-computed)
      'width',
      'height',
      'minWidth',
      'minHeight',
      'maxWidth',
      'maxHeight',
      'inlineSize',
      'blockSize',
      'minInlineSize',
      'minBlockSize',
      'maxInlineSize',
      'maxBlockSize',
      
      // Typography
      'fontSize',
      'fontWeight',
      'fontFamily',
      'lineHeight',
      'letterSpacing',
      'textAlign',
      'textDecoration',
      'textTransform',
      
      // Layout (use CSS classes)
      'display',
      'flexDirection',
      'flexWrap',
      'justifyContent',
      'alignItems',
      'alignContent',
      'gridTemplateColumns',
      'gridTemplateRows',
      'gridGap',
    ];

    const options = context.options[0] || {};
    const allowedProperties = new Set(options.allowedProperties || []);

    // Always allow these (runtime positioning)
    const RUNTIME_ALLOWED = new Set([
      'transform',
      'translate',
      'rotate',
      'scale',
      'opacity', // for fade animations
      'zIndex', // when computed from depth
      'position', // when absolute/fixed for popovers
      'top',
      'right',
      'bottom',
      'left',
      'inset',
      'insetInline',
      'insetBlock',
    ]);

    function checkStyleProp(node) {
      if (node.type !== 'JSXAttribute') return;
      if (node.name.name !== 'style') return;
      
      const value = node.value;
      if (!value || value.type !== 'JSXExpressionContainer') return;
      
      const expression = value.expression;
      if (expression.type !== 'ObjectExpression') return;

      expression.properties.forEach(prop => {
        if (prop.type !== 'Property') return;
        
        const key = prop.key.type === 'Identifier' 
          ? prop.key.name 
          : prop.key.value;
        
        if (!key) return;

        // Check if forbidden
        if (FORBIDDEN_PROPERTIES.includes(key) && !allowedProperties.has(key)) {
          context.report({
            node: prop,
            messageId: 'noInlineAppearance',
            data: { property: key },
          });
        }
      });
    }

    return {
      JSXAttribute: checkStyleProp,
    };
  },
};
