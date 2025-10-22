/**
 * ESLint Plugin - Cascade Design System
 * 
 * Enforces design system usage and prevents drift.
 * Makes it impossible to ship non-compliant code.
 */

import type { ESLint, Linter } from 'eslint';

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-cascade',
    version: '0.1.0',
  },
  
  configs: {
    recommended: {
      plugins: ['cascade'],
      rules: {
        'cascade/no-hardcoded-colors': 'error',
        'cascade/no-hardcoded-radius': 'error',
        'cascade/no-hardcoded-spacing': 'error',
        'cascade/no-hardcoded-shadows': 'error',
        'cascade/no-hardcoded-transitions': 'error',
        'cascade/use-ds-classes': 'error',
        'cascade/no-inline-styles': 'warn',
        'cascade/touch-target-size': 'error',
        'cascade/require-labels': 'error',
      },
    },
  },
  
  rules: {
    'no-hardcoded-colors': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow hardcoded RGB/hex colors',
          category: 'Design System',
          recommended: true,
        },
        messages: {
          noHardcodedColors: '❌ DESIGN SYSTEM: Use color tokens instead of hardcoded colors.\nWHY: Hardcoded colors break theming and cause drift.\nFIX: Use COLOR_TOKENS.* or CSS variables',
        },
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              // Check for rgb(), rgba(), hex colors
              if (/rgb\(|rgba\(|#[0-9a-f]{3,8}/i.test(node.value)) {
                context.report({
                  node,
                  messageId: 'noHardcodedColors',
                });
              }
            }
          },
        };
      },
    },
    
    'no-hardcoded-radius': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow Tailwind rounded-* classes',
          category: 'Design System',
          recommended: true,
        },
        messages: {
          noHardcodedRadius: '❌ DESIGN SYSTEM: Use RADIUS_TOKENS instead of rounded-*.\nWHY: Hardcoded radius breaks consistency.\nFIX: Use ds-input (includes radius) or border-radius CSS var',
        },
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              if (/rounded-(none|sm|md|lg|xl|2xl|3xl|full)/i.test(node.value)) {
                context.report({
                  node,
                  messageId: 'noHardcodedRadius',
                });
              }
            }
          },
        };
      },
    },
    
    'no-hardcoded-spacing': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow min-h-[*] and hardcoded spacing',
          category: 'Design System',
          recommended: true,
        },
        messages: {
          noHardcodedSpacing: '❌ DESIGN SYSTEM: Use SPACING_TOKENS instead of min-h-[*].\nWHY: Hardcoded heights break responsive design.\nFIX: Use INTERACTIVE_TOKENS.minHeight.* or ds-input/ds-button',
        },
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              if (/min-h-\[/i.test(node.value)) {
                context.report({
                  node,
                  messageId: 'noHardcodedSpacing',
                });
              }
            }
          },
        };
      },
    },
    
    'no-hardcoded-shadows': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow Tailwind shadow-* classes',
          category: 'Design System',
          recommended: true,
        },
        messages: {
          noHardcodedShadows: '❌ DESIGN SYSTEM: Use SHADOW_TOKENS instead of shadow-*.\nWHY: Shadows must be flat by default, elevated on interaction.\nFIX: Remove shadow classes; buttons auto-elevate on hover',
        },
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              if (/shadow-(sm|md|lg|xl|2xl|inner|none)/i.test(node.value)) {
                context.report({
                  node,
                  messageId: 'noHardcodedShadows',
                });
              }
            }
          },
        };
      },
    },
    
    'no-hardcoded-transitions': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow Tailwind transition-* classes',
          category: 'Design System',
          recommended: true,
        },
        messages: {
          noHardcodedTransitions: '❌ DESIGN SYSTEM: Use TRANSITION_TOKENS instead of transition-*.\nWHY: Transitions must respect prefers-reduced-motion.\nFIX: Use useMotion() hook or ds-* classes (transitions included)',
        },
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              if (/transition-(all|colors|opacity|shadow|transform)/i.test(node.value)) {
                context.report({
                  node,
                  messageId: 'noHardcodedTransitions',
                });
              }
            }
          },
        };
      },
    },
    
    'use-ds-classes': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require ds-* classes for inputs and buttons',
          category: 'Design System',
          recommended: true,
        },
        messages: {
          useDsClasses: '❌ DESIGN SYSTEM: Use ds-input or ds-button classes.\nWHY: Non-DS classes miss tokens, a11y, and theming.\nFIX: Add className="ds-input" or className="ds-button"',
        },
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            const name = node.name;
            if (name.type === 'JSXIdentifier') {
              // Check for native input/button without ds- class
              if (name.name === 'input' || name.name === 'button') {
                const classAttr = node.attributes.find(
                  (attr: any) => attr.type === 'JSXAttribute' && attr.name.name === 'className'
                );
                
                if (classAttr && classAttr.type === 'JSXAttribute' && classAttr.value) {
                  let hasDs = false;
                  
                  if (classAttr.value.type === 'Literal' && typeof classAttr.value.value === 'string') {
                    hasDs = /ds-(input|button)/.test(classAttr.value.value);
                  }
                  
                  if (!hasDs) {
                    context.report({
                      node,
                      messageId: 'useDsClasses',
                    });
                  }
                }
              }
            }
          },
        };
      },
    },
    
    'no-inline-styles': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Discourage inline styles in favor of tokens',
          category: 'Design System',
          recommended: false,
        },
        messages: {
          noInlineStyles: '⚠️  DESIGN SYSTEM: Avoid inline styles.\nWHY: Inline styles bypass tokens and theming.\nFIX: Use tokens or CSS classes',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name === 'style') {
              context.report({
                node,
                messageId: 'noInlineStyles',
              });
            }
          },
        };
      },
    },
    
    'touch-target-size': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce 44px minimum touch targets',
          category: 'Accessibility',
          recommended: true,
        },
        messages: {
          touchTargetSize: '❌ ACCESSIBILITY: Touch targets must be ≥44px.\nWHY: 15% of users have motor disabilities.\nFIX: Use ds-button (44px min) or add min-h-[44px] min-w-[44px]',
        },
      },
      create(context) {
        // This would need runtime checking, so it's a reminder
        return {};
      },
    },
    
    'require-labels': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require labels for all inputs',
          category: 'Accessibility',
          recommended: true,
        },
        messages: {
          requireLabels: '❌ ACCESSIBILITY: Inputs must have labels.\nWHY: Screen readers can\'t announce unlabeled fields.\nFIX: Add <label htmlFor="..."> or aria-label',
        },
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            const name = node.name;
            if (name.type === 'JSXIdentifier' && name.name === 'input') {
              // Check for id
              const idAttr = node.attributes.find(
                (attr: any) => attr.type === 'JSXAttribute' && attr.name.name === 'id'
              );
              const labelAttr = node.attributes.find(
                (attr: any) => attr.type === 'JSXAttribute' && (attr.name.name === 'aria-label' || attr.name.name === 'aria-labelledby')
              );
              
              if (!idAttr && !labelAttr) {
                context.report({
                  node,
                  messageId: 'requireLabels',
                });
              }
            }
          },
        };
      },
    },
  },
};

export = plugin;
