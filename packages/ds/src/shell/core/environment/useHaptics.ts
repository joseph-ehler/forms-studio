/**
 * Haptics Adapter (Layer 3: Environment)
 * 
 * Provides tactile feedback on native platforms (Capacitor).
 * No-op on web (silent fallback).
 * 
 * @example
 * ```tsx
 * function BottomSheet() {
 *   const haptics = useHaptics();
 *   
 *   const handleBucketSettle = () => {
 *     haptics.impact('light');
 *   };
 *   
 *   const handleConfirm = () => {
 *     haptics.notify('success');
 *   };
 * }
 * ```
 */

import { Capacitor } from '@capacitor/core';

export interface HapticsAPI {
  /**
   * Impact feedback (collision feel)
   * @param style - Intensity: light (tap), medium (click), heavy (thud)
   */
  impact: (style: 'light' | 'medium' | 'heavy') => void;
  
  /**
   * Selection feedback (scrolling through list)
   */
  selection: () => void;
  
  /**
   * Notification feedback (completion state)
   * @param type - Outcome: success, warning, error
   */
  notify: (type: 'success' | 'warning' | 'error') => void;
}

// Check if we're on native platform
const isNative = (() => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
})();

// Lazy-load Haptics module
let hapticsModule: any = null;
let hapticsPromise: Promise<any> | null = null;

async function getHaptics() {
  if (hapticsModule) return hapticsModule;
  if (!hapticsPromise) {
    hapticsPromise = import('@capacitor/haptics').then((mod) => {
      hapticsModule = mod;
      return mod;
    });
  }
  return hapticsPromise;
}

/**
 * Impact feedback implementation
 */
async function triggerImpact(style: 'light' | 'medium' | 'heavy'): Promise<void> {
  if (!isNative) return;
  
  try {
    const { Haptics, ImpactStyle } = await getHaptics();
    
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    
    await Haptics.impact({ style: styleMap[style] });
  } catch (error) {
    // Silently fail - haptics not available
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Haptics] Impact feedback failed:', error);
    }
  }
}

/**
 * Selection feedback implementation
 */
async function triggerSelection(): Promise<void> {
  if (!isNative) return;
  
  try {
    const { Haptics } = await getHaptics();
    await Haptics.selectionStart();
    // Note: selectionEnd() would be called when selection stops
    // For now, we just trigger the selection feel once
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Haptics] Selection feedback failed:', error);
    }
  }
}

/**
 * Notification feedback implementation
 */
async function triggerNotify(type: 'success' | 'warning' | 'error'): Promise<void> {
  if (!isNative) return;
  
  try {
    const { Haptics, NotificationType } = await getHaptics();
    
    const typeMap = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    };
    
    await Haptics.notification({ type: typeMap[type] });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Haptics] Notification feedback failed:', error);
    }
  }
}

/**
 * Hook to access haptics API
 * 
 * Provides tactile feedback on native platforms.
 * Safe to call on web - will no-op silently.
 * 
 * @returns Haptics API with impact, selection, and notify methods
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const haptics = useHaptics();
 *   
 *   const handleClick = () => {
 *     haptics.impact('light');
 *     // ... action
 *   };
 *   
 *   return <button onClick={handleClick}>Tap me</button>;
 * }
 * ```
 */
export function useHaptics(): HapticsAPI {
  return {
    impact: (style) => {
      triggerImpact(style);
    },
    selection: () => {
      triggerSelection();
    },
    notify: (type) => {
      triggerNotify(type);
    },
  };
}

/**
 * Direct haptics API (non-hook version)
 * 
 * Use this outside React components or in callbacks.
 * 
 * @example
 * ```tsx
 * import { haptics } from '@ds/shell/core/environment';
 * 
 * function handleAction() {
 *   haptics.impact('medium');
 * }
 * ```
 */
export const haptics: HapticsAPI = {
  impact: (style) => {
    triggerImpact(style);
  },
  selection: () => {
    triggerSelection();
  },
  notify: (type) => {
    triggerNotify(type);
  },
};
