/**
 * @fileoverview Ban usage of retired/compat modules
 * @author Intelligence Studio
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent usage of deprecated compat modules',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          banned: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of banned module patterns (supports glob)',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      bannedModule:
        'Module "{{moduleSpecifier}}" is deprecated. {{suggestion}}',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const bannedPatterns = options.banned || [
      'DSShims',
      'compat',
      'lib/focus', // Moved to a11y/focus
    ];

    // Suggestion map for common cases
    const SUGGESTIONS = {
      DSShims: 'Import from @intstudio/ds/primitives instead',
      'compat': 'Use the current API from @intstudio/ds',
      'lib/focus': 'Import from @intstudio/ds/a11y instead',
    };

    function isBanned(moduleSpecifier) {
      return bannedPatterns.some(pattern => {
        if (pattern.includes('*')) {
          // Simple glob support
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(moduleSpecifier);
        }
        return moduleSpecifier.includes(pattern);
      });
    }

    function getSuggestion(moduleSpecifier) {
      for (const [pattern, suggestion] of Object.entries(SUGGESTIONS)) {
        if (moduleSpecifier.includes(pattern)) {
          return suggestion;
        }
      }
      return 'Consult MIGRATION_PLAYBOOK.md for alternatives';
    }

    return {
      ImportDeclaration(node) {
        const moduleSpecifier = node.source.value;

        if (isBanned(moduleSpecifier)) {
          context.report({
            node: node.source,
            messageId: 'bannedModule',
            data: {
              moduleSpecifier,
              suggestion: getSuggestion(moduleSpecifier),
            },
          });
        }
      },
    };
  },
};
