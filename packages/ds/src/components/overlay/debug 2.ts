/**
 * debugOverlay - Diagnostic utility for OverlayPicker
 * 
 * Run this in the browser console to inspect computed layout values:
 * 
 * ```js
 * import { debugOverlay } from '@your-package/wizard-react'
 * debugOverlay()
 * ```
 * 
 * Or in dev mode, it can be called automatically on overlay open.
 */

export interface OverlayDebugInfo {
  found: boolean
  styleMaxHeight?: string
  computedMaxHeight?: string
  cssVarOverlayMaxH?: string
  dataMaxH?: string
  contentOverflowY?: string
  contentScrollHeight?: number
  contentClientHeight?: number
  viewportHeight?: number
  isScrollable?: boolean
}

/**
 * Debug the currently open overlay picker
 * Logs a table with all diagnostic information
 */
export function debugOverlay(): OverlayDebugInfo {
  const el = document.querySelector('[data-overlay="picker"]') as HTMLElement
  
  if (!el) {
    console.warn('❌ No overlay found. Make sure a picker is open.')
    return { found: false }
  }

  const cs = getComputedStyle(el)
  const content = el.querySelector('[data-role="content"]') as HTMLElement | null
  const ccs = content ? getComputedStyle(content) : null

  const info: OverlayDebugInfo = {
    found: true,
    styleMaxHeight: el.style.maxHeight || '(none)',
    computedMaxHeight: cs.maxHeight,
    cssVarOverlayMaxH: cs.getPropertyValue('--overlay-max-h') || '(none)',
    dataMaxH: el.getAttribute('data-max-h') || '(none)',
    contentOverflowY: ccs?.overflowY || '(none)',
    contentScrollHeight: content?.scrollHeight,
    contentClientHeight: content?.clientHeight,
    viewportHeight: window.innerHeight,
    isScrollable: content ? content.scrollHeight > content.clientHeight : false,
  }

  console.log('🔍 Overlay Debug Info')
  console.table({
    'Overlay Style maxHeight': info.styleMaxHeight,
    'Overlay Computed maxHeight': info.computedMaxHeight,
    'CSS Var --overlay-max-h': info.cssVarOverlayMaxH,
    'Data Attribute data-max-h': info.dataMaxH,
    'Content overflow-y': info.contentOverflowY,
    'Content scrollHeight': info.contentScrollHeight,
    'Content clientHeight': info.contentClientHeight,
    'Viewport height': info.viewportHeight,
    'Is scrollable?': info.isScrollable ? '✅ Yes' : '❌ No',
  })

  return info
}

/**
 * Log a compact debug string (useful for automated logging)
 */
export function debugOverlayCompact(): string {
  const info = debugOverlay()
  if (!info.found) return 'No overlay'
  
  return `maxH=${info.dataMaxH} computed=${info.computedMaxHeight} scrollable=${info.isScrollable ? 'Y' : 'N'}`
}

/**
 * Auto-debug: call on every overlay open in dev mode
 * Add this to OverlayPicker if needed:
 * 
 * ```tsx
 * useEffect(() => {
 *   if (open && process.env.NODE_ENV === 'development') {
 *     setTimeout(() => debugOverlayCompact(), 100)
 *   }
 * }, [open])
 * ```
 */
