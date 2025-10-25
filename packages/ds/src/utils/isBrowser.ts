/**
 * SSR-safe browser detection
 * 
 * Use to guard code that accesses window/document.
 * Prevents errors in Next.js/Remix SSR.
 * 
 * @example
 * ```ts
 * if (isBrowser()) {
 *   window.addEventListener('resize', handleResize);
 * }
 * ```
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
