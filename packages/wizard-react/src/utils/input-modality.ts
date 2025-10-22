/**
 * Input Modality Tracker
 * 
 * Tracks whether user is using pointer (mouse/touch) or keyboard.
 * Enables smart focus-visible behavior: only show focus rings for keyboard users.
 * 
 * Philosophy:
 * - Mouse click → no focus ring (user can see where they clicked)
 * - Keyboard nav → focus ring (user needs visual indicator)
 * - Touch → no focus ring (finger is the indicator)
 */

type InputModality = 'pointer' | 'keyboard' | 'touch';

class InputModalityTracker {
  private modality: InputModality = 'keyboard'; // Default to keyboard (safest)
  private listeners: Set<(modality: InputModality) => void> = new Set();
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }
  
  private init(): void {
    // Pointer events
    window.addEventListener('pointerdown', this.handlePointerDown, true);
    window.addEventListener('mousedown', this.handlePointerDown, true);
    
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown, true);
    
    // Touch events
    window.addEventListener('touchstart', this.handleTouchStart, true);
  }
  
  private handlePointerDown = (e: Event): void => {
    // Ignore if it's a touch event (handled separately)
    if ((e as PointerEvent).pointerType === 'touch') return;
    
    this.setModality('pointer');
  };
  
  private handleKeyDown = (e: KeyboardEvent): void => {
    // Only Tab, arrows, and Enter/Space indicate keyboard navigation
    const navKeys = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '];
    
    if (navKeys.includes(e.key)) {
      this.setModality('keyboard');
    }
  };
  
  private handleTouchStart = (): void => {
    this.setModality('touch');
  };
  
  private setModality(modality: InputModality): void {
    if (this.modality === modality) return;
    
    this.modality = modality;
    
    // Update data attribute on html element
    document.documentElement.setAttribute('data-input-modality', modality);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(modality));
  }
  
  public getModality(): InputModality {
    return this.modality;
  }
  
  public subscribe(listener: (modality: InputModality) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  public cleanup(): void {
    window.removeEventListener('pointerdown', this.handlePointerDown, true);
    window.removeEventListener('mousedown', this.handlePointerDown, true);
    window.removeEventListener('keydown', this.handleKeyDown, true);
    window.removeEventListener('touchstart', this.handleTouchStart, true);
  }
}

// Global singleton
export const inputModality = new InputModalityTracker();

/**
 * React hook for input modality
 */
export function useInputModality(): InputModality {
  const [modality, setModality] = React.useState<InputModality>(inputModality.getModality());
  
  React.useEffect(() => {
    return inputModality.subscribe(setModality);
  }, []);
  
  return modality;
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Add CSS to hide focus rings for pointer/touch
  const style = document.createElement('style');
  style.textContent = `
    /* Only show focus rings for keyboard navigation */
    [data-input-modality="pointer"] *:focus:not(:focus-visible),
    [data-input-modality="touch"] *:focus:not(:focus-visible) {
      outline: none;
    }
    
    /* Force focus-visible for keyboard */
    [data-input-modality="keyboard"] *:focus {
      outline: auto;
    }
  `;
  document.head.appendChild(style);
}

// React import (for hook)
import * as React from 'react';
