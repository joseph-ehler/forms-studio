/**
 * Refiner Transform: enforce-overlay-keys-v1.0
 * 
 * Enforces keyboard navigation requirements for overlay components:
 * 
 * Required Key Handlers:
 * - ArrowDown: Move to next item
 * - ArrowUp: Move to previous item
 * - Home: Jump to first item
 * - End: Jump to last item
 * - Enter: Select current item / confirm action
 * - Escape: Close overlay + return focus
 * 
 * Implementation Options:
 * 1. Use useOverlayKeys hook (recommended)
 * 2. Implement handleKeyDown with all required keys
 * 3. Use DS primitive that inherits keyboard behavior
 * 
 * This rule checks for either:
 * - Import of useOverlayKeys hook
 * - onKeyDown handler with all required keys
 * - Comment pragma: // @keyboard-handled-by-primitive
 * 
 * Usage:
 *   pnpm refine --dry-run          # Report only
 *   pnpm refine --check             # Fail on violations
 */

import traverse from '@babel/traverse';

export default function enforceOverlayKeysV1(ast, filePath, { applyFix = false } = {}) {
  const issues = [];
  let changed = false;

  // Track imports and key handler presence
  let hasUseOverlayKeysImport = false;
  let hasHandleKeyDown = false;
  let hasKeyboardPragma = false;
  let keyHandlers = new Set();

  // Check for pragma comment
  const comments = ast.comments || [];
  for (const comment of comments) {
    if (comment.value.includes('@keyboard-handled-by-primitive')) {
      hasKeyboardPragma = true;
      break;
    }
  }

  // Traverse to find imports
  traverse.default(ast, {
    ImportDeclaration(path) {
      const importPath = path.node.source.value;
      
      // Check for useOverlayKeys hook import
      if (importPath.includes('useOverlayKeys') || 
          (importPath.includes('recipes/hooks') && 
           path.node.specifiers.some(s => s.imported?.name === 'useOverlayKeys'))) {
        hasUseOverlayKeysImport = true;
      }
    },
    
    // Find key down handlers
    JSXAttribute(path) {
      if (path.node.name?.name === 'onKeyDown') {
        hasHandleKeyDown = true;
      }
    },
    
    // Analyze handleKeyDown function implementations
    Function(path) {
      const fnName = path.node.id?.name;
      
      if (fnName?.toLowerCase().includes('keydown') || 
          fnName?.toLowerCase().includes('keyboard')) {
        
        // Analyze the function body for key handlers
        traverse.default(path.node, {
          SwitchCase(innerPath) {
            const test = innerPath.node.test;
            if (test?.type === 'StringLiteral') {
              keyHandlers.add(test.value);
            }
          },
          IfStatement(innerPath) {
            const test = innerPath.node.test;
            
            // Check for event.key === 'ArrowDown' patterns
            if (test?.type === 'BinaryExpression' && test.operator === '===') {
              if (test.right?.type === 'StringLiteral') {
                keyHandlers.add(test.right.value);
              }
            }
          }
        }, path.scope, path);
      }
    }
  });

  // Define required keys
  const requiredKeys = new Set([
    'ArrowDown',
    'ArrowUp',
    'Home',
    'End',
    'Enter',
    'Escape'
  ]);

  // Check if file is an overlay component
  const isOverlayComponent = 
    filePath.includes('Recipe.tsx') ||
    filePath.includes('Overlay') ||
    filePath.includes('Select') ||
    filePath.includes('Picker');

  if (!isOverlayComponent) {
    // Not an overlay component - skip checks
    return { changed: false, issues: [] };
  }

  // Validation logic
  if (hasKeyboardPragma) {
    // Explicitly marked as handled by primitive - OK
    return { changed: false, issues: [] };
  }

  if (hasUseOverlayKeysImport) {
    // Using the hook - assume all keys handled
    return { changed: false, issues: [] };
  }

  if (!hasHandleKeyDown) {
    issues.push({
      type: 'error',
      rule: 'missing-keyboard-handler',
      msg: 'Overlay component missing onKeyDown handler. Use useOverlayKeys hook or implement handleKeyDown.',
      file: filePath
    });
    
    return { changed, issues };
  }

  // Check for all required keys
  const missingKeys = [...requiredKeys].filter(key => !keyHandlers.has(key));

  if (missingKeys.length > 0) {
    issues.push({
      type: 'warn',
      rule: 'incomplete-keyboard-navigation',
      msg: `Missing key handlers for: ${missingKeys.join(', ')}. Consider using useOverlayKeys hook for complete keyboard support.`,
      file: filePath
    });
  }

  // Check for recommended patterns
  if (!keyHandlers.has('ArrowDown') && !keyHandlers.has('ArrowUp')) {
    issues.push({
      type: 'error',
      rule: 'missing-arrow-navigation',
      msg: 'Overlay must support ArrowUp/ArrowDown navigation',
      file: filePath
    });
  }

  if (!keyHandlers.has('Escape')) {
    issues.push({
      type: 'error',
      rule: 'missing-escape-close',
      msg: 'Overlay must support Escape key to close',
      file: filePath
    });
  }

  if (!keyHandlers.has('Enter')) {
    issues.push({
      type: 'warn',
      rule: 'missing-enter-select',
      msg: 'Overlay should support Enter key to select/confirm',
      file: filePath
    });
  }

  // Info: suggest using hook for consistency
  if (hasHandleKeyDown && !hasUseOverlayKeysImport && missingKeys.length === 0) {
    issues.push({
      type: 'info',
      rule: 'consider-hook',
      msg: 'Consider using useOverlayKeys hook for standardized keyboard behavior',
      file: filePath
    });
  }

  return {
    changed: false, // This rule doesn't auto-fix (too complex)
    issues
  };
}

/**
 * Helper: Generate keyboard handler code
 * 
 * Can be used by generators to emit proper keyboard handling
 */
export function generateKeyboardHandler() {
  return `
// Keyboard navigation
const handleKeyDown = useOverlayKeys({
  count: filteredOptions.length,
  activeIndex: highlightedIndex,
  setActiveIndex: setHighlightedIndex,
  onSelect: (index) => {
    const option = filteredOptions[index];
    if (!option.disabled) {
      field.onChange(option.value);
      setIsOpen(false);
    }
  },
  onClose: () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  },
  isOpen
});
`.trim();
}
