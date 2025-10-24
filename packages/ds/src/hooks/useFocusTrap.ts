/**
 * useFocusTrap - Trap focus within a container
 * 
 * Handles:
 * - Tab cycling (forward/backward)
 * - Honors prefers-reduced-motion (no jank on mount)
 * - Auto-focuses first focusable element
 * 
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useFocusTrap(ref, { enabled: isOpen });
 */

import { useEffect, RefObject } from 'react';

interface UseFocusTrapOptions {
  /** Enable/disable trap */
  enabled: boolean;
  
  /** Auto-focus first element on mount */
  autoFocus?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  options: UseFocusTrapOptions
) {
  const { enabled, autoFocus = true } = options;

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    
    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(el => {
        // Filter out elements that are not visible
        return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
      });
    };

    // Auto-focus first element (respecting reduced motion)
    if (autoFocus) {
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const delay = prefersReducedMotion ? 0 : 100; // Small delay for smooth mount
      
      const timer = setTimeout(() => {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }

    // Tab trap handler
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      // Shift+Tab on first element → focus last
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
        return;
      }

      // Tab on last element → focus first
      if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
        return;
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [enabled, containerRef, autoFocus]);
}
