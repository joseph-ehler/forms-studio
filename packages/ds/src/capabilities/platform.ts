/**
 * Platform Capabilities - Device/context detection
 * 
 * Provides capability switches for routing behavior:
 * - pointer type (coarse vs fine)
 * - viewport size (mobile vs desktop)
 * - Capacitor presence (native container)
 * - haptics adapter (safe no-op on web)
 * 
 * Used by DS primitives to adapt behavior without consumers knowing.
 */

/**
 * Detect if running in Capacitor native container
 */
export const isCapacitor =
  typeof globalThis !== 'undefined' && !!(globalThis as any).Capacitor;

/**
 * Detect pointer type (coarse = touch, fine = mouse/trackpad)
 */
export const pointer: 'coarse' | 'fine' =
  typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
    ? 'coarse'
    : 'fine';

/**
 * Check if viewport is small (mobile-sized)
 */
export const isSmallViewport = (): boolean =>
  typeof window !== 'undefined' ? window.innerWidth < 768 : false;

/**
 * Haptic feedback adapter
 * 
 * Provides haptic feedback on Capacitor; safe no-op on web.
 * Always wrapped in try/catch to prevent errors on unsupported platforms.
 * 
 * @param type - Haptic intensity
 * 
 * @example
 * ```tsx
 * import { haptic } from '@intstudio/ds/capabilities';
 * 
 * function MyButton() {
 *   return <button onClick={() => haptic('light')}>Tap me</button>;
 * }
 * ```
 */
export async function haptic(
  type: 'light' | 'medium' | 'heavy' = 'light'
): Promise<void> {
  try {
    if (!isCapacitor) return;
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const style =
      type === 'heavy'
        ? ImpactStyle.Heavy
        : type === 'medium'
        ? ImpactStyle.Medium
        : ImpactStyle.Light;
    await Haptics.impact({ style });
  } catch {
    /* no-op on web or unsupported platforms */
  }
}
