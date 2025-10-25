/**
 * Input Modality Detection
 * 
 * Tracks whether user is interacting via keyboard, pointer, or touch.
 * Sets `data-input` attribute on <html> for CSS targeting.
 * 
 * Complements :focus-visible for more granular control.
 * 
 * @example
 * ```ts
 * // In your app entry point
 * import { installModalityFlag } from '@intstudio/ds/utils';
 * 
 * if (typeof window !== 'undefined') {
 *   installModalityFlag();
 * }
 * ```
 * 
 * ```css
 * // In your CSS
 * :root[data-input="kbd"] [data-interactive]:focus {
 *   // Keyboard-specific focus treatment
 * }
 * ```
 */

export type InputModality = 'kbd' | 'ptr' | 'touch';

let currentModality: InputModality = 'ptr';

/**
 * Get current input modality
 */
export function getModality(): InputModality {
  return currentModality;
}

/**
 * Set input modality
 * Updates <html data-input> attribute
 */
function setModality(modality: InputModality): void {
  if (currentModality === modality) return;
  
  currentModality = modality;
  
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.input = modality;
  }
}

/**
 * Install modality detection listeners
 * 
 * Call once in your app entry point.
 * SSR-safe (no-op if window is undefined).
 */
export function installModalityFlag(): void {
  if (typeof window === 'undefined') return;
  
  // Keyboard modality
  function onKeyDown(e: KeyboardEvent): void {
    // Only switch to keyboard mode for navigation keys
    if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'Space' || e.key.startsWith('Arrow')) {
      setModality('kbd');
    }
  }
  
  // Pointer modality
  function onPointer(e: PointerEvent): void {
    if (e.pointerType === 'mouse') {
      setModality('ptr');
    } else if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      setModality('touch');
    }
  }
  
  // Legacy touch events
  function onTouch(): void {
    setModality('touch');
  }
  
  // Install listeners (capture phase for early detection)
  window.addEventListener('keydown', onKeyDown, { capture: true });
  window.addEventListener('pointerdown', onPointer, { capture: true });
  window.addEventListener('mousedown', () => setModality('ptr'), { capture: true });
  window.addEventListener('touchstart', onTouch, { capture: true, passive: true });
  
  // Set initial modality
  setModality('ptr');
}

/**
 * Check if current modality is keyboard
 */
export function isKeyboardModality(): boolean {
  return currentModality === 'kbd';
}

/**
 * Check if current modality is touch
 */
export function isTouchModality(): boolean {
  return currentModality === 'touch';
}

/**
 * React hook for modality detection
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const modality = useModality();
 *   
 *   return (
 *     <div data-modality={modality}>
 *       Input method: {modality}
 *     </div>
 *   );
 * }
 * ```
 */
export function useModality(): InputModality {
  const [modality, setModalityState] = React.useState<InputModality>(getModality);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      const current = getModality();
      setModalityState(current);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return modality;
}

// React import (for hook)
import * as React from 'react';
