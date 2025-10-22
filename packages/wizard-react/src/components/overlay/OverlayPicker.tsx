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

import React, { useMemo, useRef, useEffect } from 'react'
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
  offset = 6,
  strategy = 'fixed',
  sameWidth = true,
  hardMaxHeight = 560,
  collision = { flip: true, shift: true, size: true, hide: true },
  header,
  content,
  footer,
  className = '',
  style = {},
  onComputedLayout,
}) => {
  const maxHRef = useRef<number>(hardMaxHeight)

  const middleware = useMemo<Middleware[]>(() => {
    const mw: Middleware[] = []
    mw.push(offsetMw(offset))
    if (collision.flip) mw.push(flip({ padding: 8 }))
    if (collision.shift) mw.push(shift({ padding: 8, crossAxis: true }))
    if (collision.size || sameWidth) {
      mw.push(
        size({
          padding: 8,
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
          },
        })
      )
    }
    if (collision.hide) mw.push(hide())
    return mw
  }, [offset, collision.flip, collision.shift, collision.size, collision.hide, sameWidth, hardMaxHeight, onComputedLayout])

  const { refs, floatingStyles, update } = useFloating({
    placement,
    strategy,
    middleware,
    whileElementsMounted: autoUpdate,
    open,
    elements: { reference: anchor ?? undefined },
  })

  // Track viewport & container resizes (mobile keyboard etc.)
  useEffect(() => {
    if (!open) return

    let raf = 0
    const onVV = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => update?.())
    }
    const vv = (window as any).visualViewport
    vv?.addEventListener?.('resize', onVV)
    vv?.addEventListener?.('scroll', onVV)

    const ro = new ResizeObserver(() => onVV())
    if (anchor) ro.observe(anchor)

    return () => {
      vv?.removeEventListener?.('resize', onVV)
      vv?.removeEventListener?.('scroll', onVV)
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [open, anchor, update])

  // Handle outside click
  useEffect(() => {
    if (!open || !onOpenChange) return

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const floating = refs.floating.current
      const anchorEl = anchor

      if (
        floating &&
        !floating.contains(target) &&
        anchorEl &&
        !anchorEl.contains(target)
      ) {
        onOpenChange(false, 'outside')
      }
    }

    // Small delay to avoid immediate close on open
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleOutside)
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

  if (!open) return null

  // Merge computed maxHeight into floatingStyles
  const mergedStyles: React.CSSProperties = {
    ...floatingStyles,
    maxHeight: `${maxHRef.current}px`,
    ...style,
  }

  return (
    <div
      ref={refs.setFloating as any}
      style={mergedStyles}
      data-overlay="picker"
      className={`z-50 bg-white rounded-md shadow-lg ring-1 ring-black/10 flex flex-col overflow-hidden ${className}`}
      onPointerDown={(e) => {
        e.stopPropagation()
        e.nativeEvent?.stopImmediatePropagation?.()
      }}
      onClick={(e) => {
        e.stopPropagation()
        e.nativeEvent?.stopImmediatePropagation?.()
      }}
    >
      {/* Header (optional, sticky) */}
      {header && (
        <div className="flex-shrink-0" data-role="header">
          {header}
        </div>
      )}

      {/* Content (scrollable) */}
      <div className="flex-1 min-h-0 overflow-auto" data-role="content">
        {content}
      </div>

      {/* Footer (optional, sticky) */}
      {footer && (
        <div className="flex-shrink-0" data-role="footer">
          {footer}
        </div>
      )}
    </div>
  )
}
