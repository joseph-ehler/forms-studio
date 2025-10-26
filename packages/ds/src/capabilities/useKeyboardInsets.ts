/**
 * Keyboard Insets Hook
 * 
 * Returns bottom inset (in pixels) when virtual keyboard is open.
 * Used to adjust sheet/overlay positioning when keyboard appears.
 * 
 * Web: Always returns 0 (no insets needed)
 * Capacitor: Listens to keyboard show/hide events
 */

import { useEffect, useState } from 'react';

type Insets = { bottom: number };

/**
 * Hook that tracks virtual keyboard insets
 * 
 * @returns Insets object with bottom padding in pixels
 * 
 * @example
 * ```tsx
 * import { useKeyboardInsets } from '@intstudio/ds/capabilities';
 * 
 * function MySheet() {
 *   const { bottom } = useKeyboardInsets();
 *   return <div style={{ paddingBottom: bottom }}>Content</div>;
 * }
 * ```
 */
export function useKeyboardInsets(): Insets {
  const [bottom, setBottom] = useState(0);

  useEffect(() => {
    let subShow: any;
    let subHide: any;

    async function wire() {
      try {
        const { Keyboard } = await import('@capacitor/keyboard');
        subShow = await Keyboard.addListener('keyboardWillShow', (e) => {
          setBottom(e.keyboardHeight ?? 0);
        });
        subHide = await Keyboard.addListener('keyboardWillHide', () => {
          setBottom(0);
        });
      } catch {
        /* no-op on web */
      }
    }

    wire();
    return () => {
      subShow?.remove?.();
      subHide?.remove?.();
    };
  }, []);

  return { bottom };
}
