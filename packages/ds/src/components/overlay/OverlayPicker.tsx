/**
 * OverlayPicker - THE Root Primitive
 * 
 * Single source of truth for ALL overlay behavior:
 * - Positioning & collision detection (Floating UI)
 * - Event shielding (stops propagation)
 * - Scroll/flex layout (header/content/footer)
 * - Diagnostic attributes (data-overlay, --overlay-max-h)
 * - Visual viewport tracking (mobile keyboard)
 * 
 * Components ONLY pass: content, header, footer
 * NO manual flex classes, NO manual structure, NO manual event handlers
 */

import React, { useMemo, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import {
  useFloating,
  autoUpdate,
  offset as offsetMw,
  flip,
  shift,
  size,
  hide,
  type Middleware,
  type Placement,
  type Strategy,
} from '@floating-ui/react'
import { OVERLAY_TOKENS, getZIndex } from './tokens'
import { debugOverlayCompact } from './debug'
import { useOverlayContext } from './OverlayPickerCore'

export interface OverlayPickerProps {
  // Control
  open: boolean
  anchor: HTMLElement | null
  onOpenChange?: (open: boolean, reason?: 'outside' | 'escape' | 'select' | 'program') => void

  // Positioning (Floating UI)
  presentation?: 'popover' | 'sheet' | 'modal'
  placement?: Placement
  offset?: number
  sameWidth?: boolean
  hardMaxHeight?: number
  collision?: { flip?: boolean; shift?: boolean; size?: boolean; hide?: boolean }
  strategy?: Strategy

  // Behavior
  trapFocus?: boolean
  returnFocus?: boolean
  contentRef?: React.RefObject<HTMLDivElement>

  // SLOTS - The ONLY things consumers provide
  header?: React.ReactNode
  content: React.ReactNode
  footer?: React.ReactNode

  // Styling hooks
  className?: string
  style?: React.CSSProperties

  // Diagnostics
  onComputedLayout?: (info: { maxHeightPx: number; viewportH: number }) => void
}

export const OverlayPicker: React.FC<OverlayPickerProps> = ({
  open,
  anchor,
  onOpenChange,
  placement = 'bottom-start',
  offset = OVERLAY_TOKENS.offset.default,
  strategy = 'fixed',
  sameWidth = true,
  hardMaxHeight = OVERLAY_TOKENS.maxHeight.default,
  collision = { flip: true, shift: true, size: true, hide: true },
  trapFocus = OVERLAY_TOKENS.focus.trapEnabled,
  returnFocus = OVERLAY_TOKENS.focus.returnEnabled,
  contentRef,
  header,
  content,
  footer,
  className = '',
  style = {},
  onComputedLayout,
}) => {
  const maxHRef = useRef<number>(hardMaxHeight)
  const headerId = useId()
  const overlayContext = useOverlayContext()

  // Auto-wire contentRef: explicit prop > Context
  // This prevents manual wiring bugs while maintaining backwards compatibility
  const effectiveContentRef = contentRef || overlayContext?.contentRef

  // Patch 1: SSR-safe portal root with memoization (prevents micro-frontend leaks)
  const portalRoot = React.useMemo(() => {
    if (typeof document === 'undefined') return null
    return document.body
  }, [])

  // Patch 2: Detect reduced motion preference
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  }, [])

  // Patch 3: RTL support - flip placement for right-to-left languages
  const isRTL = React.useMemo(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.dir === 'rtl'
  }, [])
  const effectivePlacement = React.useMemo(() => {
    if (placement) return placement
    return isRTL ? 'bottom-end' : 'bottom-start'
  }, [placement, isRTL])

  const middleware = useMemo<Middleware[]>(() => {
    const mw: Middleware[] = []
    mw.push(offsetMw(offset))
    if (collision.flip) mw.push(flip({ padding: OVERLAY_TOKENS.collision.flipPadding }))
    if (collision.shift) mw.push(shift({ padding: OVERLAY_TOKENS.collision.shiftPadding, crossAxis: true }))
    if (collision.size || sameWidth) {
      mw.push(
        size({
          padding: OVERLAY_TOKENS.collision.padding,
          apply({ rects, availableHeight, elements }) {
            const maxH = Math.max(0, Math.min(hardMaxHeight, availableHeight - 8))
            maxHRef.current = maxH

            // Set regular styles
            Object.assign(elements.floating.style, {
              maxHeight: `${maxH}px`,
              ...(sameWidth ? { width: `${rects.reference.width}px` } : {}),
            })

            // CSS custom properties must use setProperty
            elements.floating.style.setProperty('--overlay-max-h', `${maxH}px`)

            // Diagnostic attributes
            elements.floating.setAttribute('data-overlay', 'picker')
            elements.floating.setAttribute('data-max-h', String(maxH))

            // Notify consumer of computed layout
            if (onComputedLayout) {
              onComputedLayout({ maxHeightPx: maxH, viewportH: window.innerHeight })
            }

            // Auto-debug in dev mode (if enabled in tokens)
            if (OVERLAY_TOKENS.debug.autoLog && process.env.NODE_ENV === 'development') {
              setTimeout(() => {
                const debugInfo = debugOverlayCompact()
                if (debugInfo !== 'No overlay') {
                  console.log(`[OverlayPicker] ${debugInfo}`)
                }
              }, 100)
            }
          },
        })
      )
    }
    if (collision.hide) mw.push(hide())
    return mw
  }, [offset, collision.flip, collision.shift, collision.size, collision.hide, sameWidth, hardMaxHeight, onComputedLayout])

  const { refs, floatingStyles, update } = useFloating({
    placement: effectivePlacement,
    strategy,
    middleware,
    whileElementsMounted: autoUpdate,
    open,
    elements: { reference: anchor ?? undefined },
  })

  // Track viewport & container resizes (mobile keyboard etc.) - throttled with RAF + abort on unmount
  useEffect(() => {
    if (!open) return

    let raf = 0
    let cancelled = false
    const queue = () => {
      if (cancelled) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => update?.())
    }
    const vv = (window as any).visualViewport
    vv?.addEventListener?.('resize', queue)
    vv?.addEventListener?.('scroll', queue)

    const ro = new ResizeObserver(queue)
    if (anchor) ro.observe(anchor)

    return () => {
      cancelled = true
      vv?.removeEventListener?.('resize', queue)
      vv?.removeEventListener?.('scroll', queue)
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [open, anchor, update])

  // Handle outside click - use pointer events for touch/pen support, track down+up to avoid scroll-closes
  useEffect(() => {
    if (!open || !onOpenChange) return

    let downInside = false

    const onPointerDown = (e: PointerEvent) => {
      const f = refs.floating.current
      const a = anchor
      const t = e.target as Node
      downInside = !!(f && f.contains(t)) || !!(a && a.contains(t))
    }

    const onPointerUp = (e: PointerEvent) => {
      if (downInside) return
      const f = refs.floating.current
      const a = anchor
      const t = e.target as Node
      if (f && !f.contains(t) && a && !a.contains(t)) {
        onOpenChange(false, 'outside')
      }
    }

    // Small delay to avoid immediate close on open
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown, true) // capture
      document.addEventListener('pointerup', onPointerUp, true)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('pointerup', onPointerUp, true)
    }
  }, [open, anchor, refs.floating, onOpenChange])

  // Handle escape key
  useEffect(() => {
    if (!open || !onOpenChange) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false, 'escape')
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  // Focus trap + returnFocus - centralized accessibility
  useEffect(() => {
    if (!open || !trapFocus) return
    const root = refs.floating.current
    if (!root) return
    const prev = returnFocus ? (document.activeElement as HTMLElement | null) : null

    // Focus first tabbable
    const tabbables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    tabbables[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = Array.from(tabbables)
      const first = list[0], last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        last?.focus(); e.preventDefault()
      } else if (!e.shiftKey && document.activeElement === last) {
        first?.focus(); e.preventDefault()
      }
    }
    root.addEventListener('keydown', onKey)
    return () => {
      root.removeEventListener('keydown', onKey)
      // return focus
      if (returnFocus) {
        (prev ?? anchor)?.focus?.()
      }
    }
  }, [open, anchor, refs.floating, trapFocus, returnFocus])

  if (!open || !portalRoot) return null

  // Merge computed maxHeight into floatingStyles + add contain for better rendering performance
  const mergedStyles: React.CSSProperties = {
    ...floatingStyles,
    maxHeight: `${maxHRef.current}px`,
    contain: 'layout',
    zIndex: getZIndex('overlay'),
    ...style,
  }

  const node = (
    <div
      ref={(el) => {
        refs.setFloating(el);
        if (effectiveContentRef && el) {
          (effectiveContentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }
      }}
      style={{
        ...mergedStyles,
        backgroundColor: 'var(--ds-color-surface-base)',
        borderRadius: 'var(--ds-radius-md, 6px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--ds-color-border-subtle)'
      }}
      data-overlay="picker"
      role="dialog"
      aria-modal="true"
      aria-labelledby={header ? headerId : undefined}
      className={`flex flex-col overflow-hidden ${className}`}
      // CRITICAL: Only stop propagation on onClick, NOT onPointerDown
      // The outside-click detector NEEDS to see pointerdown events to track downInside flag
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      {/* A11y live region announcement - respects reduced motion */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {prefersReducedMotion 
          ? "Picker opened. Press Escape to close."
          : "Picker opened with animation. Press Escape to close."
        }
      </div>

      {/* Header (optional, sticky) */}
      {header && (
        <div
          id={headerId}
          className="flex-shrink-0 px-4 py-3"
          style={{
            borderBottom: '1px solid var(--ds-color-border-subtle)',
            backgroundColor: 'var(--ds-color-surface-base)'
          }}
          data-role="header"
        >
          {header}
        </div>
      )}

      {/* Content (scrollable) - flex-1 min-h-0 forces it to respect parent flex container */}
      <div
        className="flex-1 min-h-0 overflow-auto"
        data-role="content"
      >
        {content}
      </div>

      {/* Footer (optional, sticky) */}
      {footer && (
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{
            borderTop: '1px solid var(--ds-color-border-subtle)',
            backgroundColor: 'var(--ds-color-surface-base)'
          }}
          data-role="footer"
        >
          {footer}
        </div>
      )}
    </div>
  )

  return createPortal(node, portalRoot)
}
