/**
 * Focus Management Primitives
 * 
 * Reusable focus management for keyboard navigation.
 * 
 * Primitives:
 * - FocusTrap: Lock focus in modal/dialog (Tab cycling, Escape, return focus)
 * - FocusScope: Define focus boundaries (nested scopes, restore focus)
 * - RovingFocus: Arrow key navigation for lists/menus
 * 
 * Utilities:
 * - focusUtils: Shared helpers (getFocusableElements, etc.)
 * - debug: Console debugging tools (debugFocus, watchFocus, etc.)
 */

// Primitives
export { FocusTrap, useFocusTrap } from './FocusTrap'
export type { FocusTrapProps } from './FocusTrap'

export { FocusScope, useFocusScope, useFocusScopeChain } from './FocusScope'
export type { FocusScopeProps } from './FocusScope'

export { RovingFocus, useRovingFocus } from './RovingFocus'
export type { RovingFocusProps } from './RovingFocus'

// Utilities
export {
  FOCUSABLE_SELECTOR,
  getFocusableElements,
  getFirstFocusable,
  getLastFocusable,
  getNextFocusable,
  getPreviousFocusable,
  isFocusable,
  focusElement,
  createFocusStore,
  generateScopeId,
} from './focusUtils'

// Debug
export {
  debugFocus,
  debugFocusTraps,
  debugFocusScopes,
  debugRovingFocus,
  watchFocus,
  testFocusTrap,
} from './debug'
