/**
 * Focus Policy (Layer 4: Behavior)
 * 
 * Manages focus trap, Tab loop, and focus return.
 * 
 * Rules:
 * - Only topmost modal should trap focus
 * - Tab loops within container (wraps at edges)
 * - ESC optionally breaks trap (calls onEscape callback)
 * - Returns cleanup function for shell useEffect
 */

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Trap focus within a container (Tab loop)
 * 
 * Returns cleanup function
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   if (!open) return;
 *   
 *   return trapFocus(modalRef.current, { 
 *     onEscape: onClose 
 *   });
 * }, [open, onClose]);
 * ```
 */
export function trapFocus(
  root: HTMLElement | null,
  options?: { onEscape?: () => void }
): () => void {
  if (!root || typeof document === 'undefined') {
    return () => {}; // No-op cleanup for SSR or null ref
  }
  
  const { onEscape } = options || {};
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // ESC to break
    if (e.key === 'Escape' && onEscape) {
      e.preventDefault();
      onEscape();
      return;
    }
    
    // Tab loop
    if (e.key === 'Tab') {
      const focusable = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector))
        .filter(el => !el.hasAttribute('disabled') && !el.hasAttribute('hidden'));
      
      if (focusable.length === 0) return;
      
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      
      // Shift+Tab on first → focus last
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } 
      // Tab on last → focus first
      else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  // Focus first focusable element
  const firstFocusable = root.querySelector<HTMLElement>(focusableSelector);
  firstFocusable?.focus();
  
  // Return cleanup
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Capture current focus for later restoration
 * 
 * Call before opening modal
 * 
 * @example
 * ```tsx
 * const previousFocus = useRef<HTMLElement | null>(null);
 * 
 * useEffect(() => {
 *   if (open) {
 *     previousFocus.current = captureFocus();
 *   }
 * }, [open]);
 * ```
 */
export function captureFocus(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.activeElement as HTMLElement;
}

/**
 * Restore focus to previously captured element
 * 
 * Call after closing modal. Handles edge cases:
 * - Element no longer in document → fallback to app root
 * - Element hidden/inert → find closest focusable ancestor
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   if (!open && previousFocus.current) {
 *     restoreFocus(previousFocus.current);
 *   }
 * }, [open]);
 * ```
 */
export function restoreFocus(element?: HTMLElement | null): void {
  if (!element || typeof document === 'undefined') return;
  
  // Small delay to ensure modal is fully removed from DOM
  requestAnimationFrame(() => {
    // Check if element still in document and not hidden/inert
    if (!document.contains(element) || element.hasAttribute('inert') || element.hasAttribute('hidden')) {
      // Fallback: try app root or first focusable
      const root = document.getElementById('app-root') ?? document.getElementById('storybook-root') ?? document.body;
      const fallback = root.querySelector<HTMLElement>(
        '[tabindex],button,a,input,select,textarea,[role="button"]'
      );
      
      try {
        fallback?.focus();
      } catch (e) {
        // Silently fail
      }
      return;
    }
    
    // Element is valid, restore focus
    try {
      element.focus();
    } catch (e) {
      // Silently fail
    }
  });
}
