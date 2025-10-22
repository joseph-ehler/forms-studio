/**
 * RTL (Right-to-Left) Support Utilities
 * 
 * Foundation for i18n and RTL layouts.
 * Uses logical properties by default.
 */

/**
 * Detect if document is in RTL mode
 */
export function isRTL(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dir === 'rtl';
}

/**
 * Get logical direction value
 * Converts physical directions to logical based on RTL
 */
export function getLogicalValue<T>(
  start: T,
  end: T,
  dir?: 'ltr' | 'rtl'
): { start: T; end: T } {
  const direction = dir || (isRTL() ? 'rtl' : 'ltr');
  
  if (direction === 'rtl') {
    return { start: end, end: start };
  }
  
  return { start, end };
}

/**
 * Logical property mapper
 * Converts left/right to start/end
 */
export const logicalProps = {
  marginLeft: 'marginInlineStart',
  marginRight: 'marginInlineEnd',
  paddingLeft: 'paddingInlineStart',
  paddingRight: 'paddingInlineEnd',
  borderLeft: 'borderInlineStart',
  borderRight: 'borderInlineEnd',
  left: 'insetInlineStart',
  right: 'insetInlineEnd',
} as const;

/**
 * Floating UI placement converter
 * Converts left/right to start/end for RTL
 */
export function getLogicalPlacement(
  placement: string,
  dir?: 'ltr' | 'rtl'
): string {
  const direction = dir || (isRTL() ? 'rtl' : 'ltr');
  
  if (direction === 'ltr') return placement;
  
  // Swap left/right for RTL
  return placement
    .replace(/left/g, '__temp__')
    .replace(/right/g, 'left')
    .replace(/__temp__/g, 'right');
}

/**
 * Arrow key direction mapper
 * Swaps arrow behavior in RTL
 */
export function getLogicalArrowKey(key: string, dir?: 'ltr' | 'rtl'): string {
  const direction = dir || (isRTL() ? 'rtl' : 'ltr');
  
  if (direction === 'ltr') return key;
  
  // Swap left/right arrows in RTL
  const keyMap: Record<string, string> = {
    'ArrowLeft': 'ArrowRight',
    'ArrowRight': 'ArrowLeft',
  };
  
  return keyMap[key] || key;
}
