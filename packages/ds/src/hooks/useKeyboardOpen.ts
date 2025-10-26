import { useState, useEffect } from 'react';

/**
 * Detects if virtual keyboard is open on mobile devices
 * Uses Visual Viewport API to detect height changes
 * 
 * @param enabled - Enable keyboard detection (default: true)
 * @param threshold - Minimum pixel difference to consider keyboard open (default: 150)
 * @returns true if keyboard is likely open
 * 
 * @example
 * const keyboardOpen = useKeyboardOpen();
 * // With custom threshold for tablets
 * const keyboardOpen = useKeyboardOpen(true, 120);
 */
export function useKeyboardOpen(enabled: boolean = true, threshold: number = 150): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.visualViewport) {
        // Keyboard is likely open if viewport height is significantly less than window height
        const dy = window.innerHeight - window.visualViewport.height;
        setIsOpen(dy > threshold);
      }
    };

    // Initial check
    handleResize();

    // Listen for viewport changes
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, [enabled, threshold]);

  return isOpen;
}
