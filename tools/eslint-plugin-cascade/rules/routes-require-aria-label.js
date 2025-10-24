/**
 * ESLint Rule: routes/require-aria-label
 * 
 * Requires ariaLabel or ariaLabelledBy on RoutePanel and FullScreenRoute
 * 
 * Why: Screen readers need descriptive labels for landmarks and dialogs
 * Each route component must have unique, meaningful label
 * 
 * @example
 * // ❌ Bad
 * <FullScreenRoute>
 *   <Checkout />
 * </FullScreenRoute>
 * 
 * // ✅ Good
 * <FullScreenRoute ariaLabel="Checkout">
 *   <Checkout />
 * </FullScreenRoute>
 * 
 * // ✅ Also good
 * <FullScreenRoute ariaLabelledBy="checkout-title">
 *   <h1 id="checkout-title">Checkout</h1>
 *   <Checkout />
 * </FullScreenRoute>
 */

module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Require ariaLabel or ariaLabelledBy on route components',
      category: 'Accessibility',
      recommended: true,
    },
    messages: {
      missingAriaLabel:
        '{{componentName}} requires ariaLabel or ariaLabelledBy for accessibility. ' +
        'Each route must have a unique, descriptive label.',
    },
    schema: [],
  },

  create(context) {
    const ROUTE_COMPONENTS = ['FullScreenRoute', 'RoutePanel'];

    function checkAriaLabel(node, componentName) {
      const attributes = node.openingElement.attributes;
      
      const hasAriaLabel = attributes.some(
        attr =>
          attr.type === 'JSXAttribute' &&
          attr.name.name === 'ariaLabel'
      );
      
      const hasAriaLabelledBy = attributes.some(
        attr =>
          attr.type === 'JSXAttribute' &&
          attr.name.name === 'ariaLabelledBy'
      );

      if (!hasAriaLabel && !hasAriaLabelledBy) {
        context.report({
          node: node.openingElement.name,
          messageId: 'missingAriaLabel',
          data: { componentName },
        });
      }
    }

    return {
      JSXElement(node) {
        const componentName = node.openingElement.name.name;
        
        if (ROUTE_COMPONENTS.includes(componentName)) {
          checkAriaLabel(node, componentName);
        }
      },
    };
  },
};
