/**
 * useFocusTrap - Focus Management for Overlays
 * 
 * Handles:
 * - Focus trap (Tab loops within overlay)
 * - Escape key to close
 * - Return focus to trigger on close
 * - Prevents focus leaving overlay
 * 
 * Works for both popover and sheet modes.
 */

import { useEffect, useCallback } from 'react';

export interface UseFocusTrapOptions {
  enabled: boolean;
  containerRef: React.RefObject<HTMLElement>;
  onEscape: () => void;
  returnFocusRef: React.RefObject<HTMLElement>;
}

export function useFocusTrap({
  enabled,
  containerRef,
  onEscape,
  returnFocusRef
}: UseFocusTrapOptions): void {
  // Store previously focused element
  const previouslyFocusedRef = useCallback(() => {
    if (typeof document === 'undefined') return null;
    return document.activeElement as HTMLElement;
  }, []);
  
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    
    const container = containerRef.current;
    const previouslyFocused = previouslyFocusedRef();
    
    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ');
      
      return Array.from(container.querySelectorAll(selector));
    };
    
    // Focus first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure element is rendered
      setTimeout(() => {
        focusableElements[0]?.focus();
      }, 10);
    }
    
    // Handle Tab key for focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
        return;
      }
      
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          // Shift+Tab: if on first element, go to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: if on last element, go to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };
    
    // Handle clicks outside (for additional enforcement)
    const handleClickOutside = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside, true);
    
    // Return focus on unmount
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside, true);
      
      // Return focus to trigger or previously focused element
      if (returnFocusRef.current) {
        returnFocusRef.current.focus();
      } else if (previouslyFocused && document.body.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [enabled, containerRef, onEscape, returnFocusRef, previouslyFocusedRef]);
}
