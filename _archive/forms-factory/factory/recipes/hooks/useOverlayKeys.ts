/**
 * Overlay Keyboard Navigation Hook
 * 
 * Provides standardized keyboard behavior for all overlay recipes.
 * Handles: ↑↓ navigation, Home/End jumps, Enter selection, Esc close.
 * 
 * Usage in recipes:
 *   const handleKeyDown = useOverlayKeys({
 *     count: filteredOptions.length,
 *     activeIndex: highlightedIndex,
 *     setActiveIndex: setHighlightedIndex,
 *     onSelect: (index) => selectOption(filteredOptions[index]),
 *     onClose: () => { setIsOpen(false); triggerRef.current?.focus(); }
 *   });
 * 
 *   <input onKeyDown={handleKeyDown} />
 */

import { useCallback } from 'react';

export interface UseOverlayKeysOptions {
  /** Total number of items in the list */
  count: number;
  
  /** Currently highlighted/active index */
  activeIndex: number;
  
  /** Update the active index */
  setActiveIndex: (index: number) => void;
  
  /** Called when Enter is pressed on active item */
  onSelect: (index: number) => void;
  
  /** Called when Escape is pressed */
  onClose: () => void;
  
  /** Whether the overlay is currently open */
  isOpen?: boolean;
  
  /** Additional key handlers */
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export function useOverlayKeys({
  count,
  activeIndex,
  setActiveIndex,
  onSelect,
  onClose,
  isOpen = true,
  onKeyDown: customHandler
}: UseOverlayKeysOptions) {
  
  return useCallback((event: React.KeyboardEvent) => {
    // Call custom handler first (allows override)
    customHandler?.(event);
    
    // Only handle if overlay is open
    if (!isOpen) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(Math.min(activeIndex + 1, count - 1));
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(Math.max(activeIndex - 1, 0));
        break;
      
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      
      case 'End':
        event.preventDefault();
        setActiveIndex(count - 1);
        break;
      
      case 'Enter':
        if (count > 0 && activeIndex >= 0 && activeIndex < count) {
          event.preventDefault();
          onSelect(activeIndex);
        }
        break;
      
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  }, [count, activeIndex, setActiveIndex, onSelect, onClose, isOpen, customHandler]);
}

/**
 * Focus Return Hook
 * 
 * Ensures focus returns to trigger when overlay closes.
 * Stores the previously focused element and restores it.
 * 
 * Usage in recipes:
 *   const triggerRef = useRef<HTMLButtonElement>(null);
 *   useFocusReturn(triggerRef, isOpen);
 */

import { useEffect, useRef } from 'react';

export function useFocusReturn(
  triggerRef: React.RefObject<HTMLElement>,
  isOpen: boolean
) {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Store currently focused element when opening
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
    }
    // Restore focus when closing
    else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  }, [isOpen]);
  
  // Fallback: return to trigger if no previous focus
  useEffect(() => {
    if (!isOpen && !previouslyFocusedRef.current && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen, triggerRef]);
}

/**
 * Scroll Active Item Into View Hook
 * 
 * Ensures the active/highlighted item is visible in scrollable lists.
 * 
 * Usage in recipes:
 *   const listRef = useRef<HTMLDivElement>(null);
 *   useScrollActiveIntoView(listRef, activeIndex);
 */

export function useScrollActiveIntoView(
  containerRef: React.RefObject<HTMLElement>,
  activeIndex: number
) {
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const activeElement = container.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement;
    
    if (activeElement) {
      // Check if element is out of view
      const containerRect = container.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();
      
      if (elementRect.bottom > containerRect.bottom) {
        // Scroll down
        activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else if (elementRect.top < containerRect.top) {
        // Scroll up
        activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [containerRef, activeIndex]);
}
