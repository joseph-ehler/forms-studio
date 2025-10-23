/**
 * ESLint Rule: no-deep-ds-imports
 * 
 * Prevents deep imports into @intstudio/ds internals.
 * Enforces use of public barrel exports only.
 * 
 * ❌ Bad:
 *   import { Button } from '@intstudio/ds/src/primitives/Button'
 *   import { useDeviceType } from '@intstudio/ds/src/hooks/useDeviceType'
 * 
 * ✅ Good:
 *   import { Button } from '@intstudio/ds/primitives'
 *   import { useDeviceType } from '@intstudio/ds/utils'
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent deep imports into @intstudio/ds package internals',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      deepImport: 'Deep import from @intstudio/ds/src/* detected. Use barrel export: {{ suggestion }}',
    },
  },

  create(context) {
    // Map of deep import patterns to barrel exports
    const barrelMappings = {
      '/src/primitives/': '/primitives',
      '/src/patterns/': '/patterns',
      '/src/shell/': '/shell',
      '/src/a11y/': '/a11y',
      '/src/white-label/': '/white-label',
      '/src/utils/': '/utils',
      '/src/hooks/': '/utils',
      '/src/fields/': '',  // Main barrel
      '/src/components/': '',  // Main barrel
      '/src/': '',  // Fallback to main barrel
    };

    function getBarrelPath(source) {
      for (const [pattern, barrel] of Object.entries(barrelMappings)) {
        if (source.includes(pattern)) {
          return '@intstudio/ds' + barrel;
        }
      }
      return '@intstudio/ds';
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        
        // Check for deep imports
        if (source.startsWith('@intstudio/ds/src/')) {
          const suggestion = getBarrelPath(source);
          
          context.report({
            node: node.source,
            messageId: 'deepImport',
            data: { suggestion },
            fix(fixer) {
              return fixer.replaceText(
                node.source,
                `'${suggestion}'`
              );
            },
          });
        }
      },
      
      // Also check dynamic imports
      CallExpression(node) {
        if (
          node.callee.type === 'Import' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Literal'
        ) {
          const source = node.arguments[0].value;
          
          if (source.startsWith('@intstudio/ds/src/')) {
            const suggestion = getBarrelPath(source);
            
            context.report({
              node: node.arguments[0],
              messageId: 'deepImport',
              data: { suggestion },
              fix(fixer) {
                return fixer.replaceText(
                  node.arguments[0],
                  `'${suggestion}'`
                );
              },
            });
          }
        }
      },
    };
  },
};
