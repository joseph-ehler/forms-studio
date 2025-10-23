/**
 * @fileoverview Prevent @intstudio/ds imports inside DS package
 * @author Intelligence Studio
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent internal package imports that cause circular build dependencies',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      selfPackageImport:
        'Use relative imports inside DS (not package subpaths). Import "{{moduleSpecifier}}" should be a relative path.',
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const filename = context.getFilename();
        const moduleSpecifier = node.source.value;

        // Only check files inside packages/ds/src/
        const isInsideDS = /packages\/ds\/src\//.test(filename);
        if (!isInsideDS) return;

        // Check if importing from @intstudio/ds
        const isSelfPackageImport = /^@intstudio\/ds(\/|$)/.test(moduleSpecifier);
        if (!isSelfPackageImport) return;

        context.report({
          node: node.source,
          messageId: 'selfPackageImport',
          data: {
            moduleSpecifier,
          },
          // Note: Auto-fix would require path calculation - leave to Import Doctor
        });
      },
    };
  },
};
