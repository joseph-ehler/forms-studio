/**
 * useStackPolicy - Enforce nested sheet rules
 * 
 * Rules:
 * - Max depth: 2
 * - SheetDialog → SheetDialog ✅
 * - SheetPanel → SheetDialog ✅
 * - SheetDialog → SheetPanel ❌ (throws in dev)
 * - SheetPanel → SheetPanel ⚠️ (warns)
 */

import { type RefObject,useLayoutEffect } from 'react';

export interface StackPolicyConfig {
  type: 'dialog' | 'panel';
  parentType?: 'dialog' | 'panel';
  depth: number;
}

export function useStackPolicy({
  type,
  parentType,
  depth,
}: StackPolicyConfig): boolean {
  if (process.env.NODE_ENV !== 'production') {
    // Block SheetDialog → SheetPanel
    if (parentType === 'dialog' && type === 'panel') {
      throw new Error(
        '[SheetPolicy] Cannot open SheetPanel on top of SheetDialog. ' +
        'Use another SheetDialog instead to maintain modal context.'
      );
    }
    
    // Warn on SheetPanel → SheetPanel
    if (parentType === 'panel' && type === 'panel') {
      console.warn(
        '[SheetPolicy] SheetPanel → SheetPanel is discouraged. ' +
        'Prefer route replacement or inline navigation within the panel.'
      );
    }
    
    // Block depth > 2
    if (depth >= 2) {
      console.error(
        '[SheetPolicy] Maximum stack depth (2) exceeded. ' +
        'Use full-screen route for deeper flows. Current depth: ' + depth
      );
      return false; // Prevent opening
    }
  }
  
  return true; // Allow
}

/**
 * useStackDepthClass - Automatically apply depth-based classes
 */
export function useStackDepthClass(
  ref: RefObject<HTMLElement>,
  depth: number
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    el.dataset.sheetDepth = String(depth);
    el.classList.toggle('ds-sheet--underlay', depth > 0);
    
    return () => {
      delete el.dataset.sheetDepth;
      el.classList.remove('ds-sheet--underlay');
    };
  }, [depth]);
}

/**
 * useStackedDialogA11y - Enforce accessibility for nested dialogs
 */
export function useStackedDialogA11y({
  role,
  ariaLabel,
  ariaLabelledBy,
  depth,
}: {
  role: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  depth: number;
}) {
  if (process.env.NODE_ENV !== 'production') {
    if (role !== 'dialog') {
      throw new Error(
        '[SheetDialog] must render role="dialog" for proper accessibility'
      );
    }
    
    if (!ariaLabel && !ariaLabelledBy) {
      throw new Error(
        '[SheetDialog] requires ariaLabel or ariaLabelledBy for accessibility. ' +
        'Each stacked dialog must have a unique, descriptive label.'
      );
    }
    
    if (depth > 1) {
      console.warn(
        '[SheetDialog] depth > 2 discouraged for UX. ' +
        'Consider a full-screen route for complex flows.'
      );
    }
  }
}

/**
 * getZIndexFromDepth - Calculate z-index based on stack depth
 */
export function getZIndexFromDepth(depth: number, type: 'sheet' | 'backdrop'): number {
  const baseSheet = 10;
  const baseBackdrop = 9;
  const increment = 10;
  
  if (type === 'sheet') {
    return baseSheet + (depth * increment);
  }
  
  return baseBackdrop + (depth * increment);
}

/**
 * getBackdropIntensity - Get backdrop color for depth
 */
export function getBackdropIntensity(depth: number): string {
  const intensities = [
    'rgba(0, 0, 0, 0.45)', // depth 0
    'rgba(0, 0, 0, 0.55)', // depth 1
    'rgba(0, 0, 0, 0.65)', // depth 2
  ];
  
  return intensities[Math.min(depth, 2)] || intensities[0];
}
