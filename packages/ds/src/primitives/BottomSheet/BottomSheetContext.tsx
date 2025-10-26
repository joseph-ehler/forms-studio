/**
 * Sheet Underlay Context
 * 
 * Coordinates sheet state with underlay for advanced interactions
 * (push, resize, effects, etc.)
 */

import { createContext, useContext } from 'react';

export type BottomSheetUnderlayValue = {
  /** Whether sheet is open */
  isOpen: boolean;
  
  /** Current snap position (0-1 fraction, or null for expanded) */
  snap: number | null;
  
  /** Pixels occupied by sheet (for push/resize modes) */
  reservedPx: number;
  
  /** Modal blocks underlay, modeless keeps it interactive */
  modality: 'modal' | 'modeless';
  
  /** How sheet affects underlay layout */
  interaction: 'overlay' | 'push' | 'resize' | 'inline';
};

const BottomSheetContext = createContext<BottomSheetUnderlayValue | null>(null);

export const BottomSheetProvider = BottomSheetContext.Provider;

/**
 * Access sheet underlay state for coordinated effects
 * 
 * @example
 * const { isOpen, snap, reservedPx } = useSheetUnderlay();
 * 
 * @throws {Error} If used outside <Sheet> component
 */
export const useSheetUnderlay = (): BottomSheetUnderlayValue => {
  const value = useContext(BottomSheetContext);
  if (!value) {
    throw new Error('useSheetUnderlay must be used within a <Sheet> component');
  }
  return value;
};

// @deprecated Use BottomSheetProvider
export { BottomSheetProvider as SheetProvider };
// @deprecated Use BottomSheetUnderlayValue
export type { BottomSheetUnderlayValue as SheetUnderlayValue };
