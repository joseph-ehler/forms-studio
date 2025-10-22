/**
 * OverlayPositioner - Hardened Implementation
 * 
 * Battle-tested overlay positioning with:
 * - Exposes exact maxHeight as number, CSS var, and data attribute
 * - Handles visualViewport + ResizeObserver for mobile keyboard/resize
 * - EventWrapper stops native bubbling (pointerdown + click)
 * - Diagnostic attributes for DevTools verification
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
} from '@floating-ui/react'
import type { OverlayPositionerProps } from './types'

export const OverlayPositioner: React.FC<OverlayPositionerProps> = ({
  open,
  anchor,
  placement = 'bottom-start',
  offset = 6,
  strategy = 'fixed',
  collision = { flip: true, shift: true, size: true, hide: true },
  sameWidth = false,
  maxHeight = 560,
  children,
}) => {
  const maxHRef = useRef<number>(maxHeight)
  const floatingElRef = useRef<HTMLElement | null>(null)

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
            const maxH = Math.max(0, Math.min(maxHeight, availableHeight - 8))
            maxHRef.current = maxH

            const style: Partial<CSSStyleDeclaration> = {
              maxHeight: `${maxH}px`,
              // @ts-ignore - expose as CSS var for content
              '--overlay-max-h': `${maxH}px`,
            }
            if (sameWidth) style.width = `${rects.reference.width}px`

            Object.assign(elements.floating.style, style)
            elements.floating.setAttribute('data-overlay', 'picker')
            elements.floating.setAttribute('data-max-h', String(maxH))
          },
        })
      )
    }
    if (collision.hide) mw.push(hide())
    return mw
  }, [offset, collision.flip, collision.shift, collision.size, collision.hide, sameWidth, maxHeight])

  const { refs, floatingStyles, isPositioned, update } = useFloating({
    placement,
    strategy,
    middleware,
    whileElementsMounted: autoUpdate,
    open,
    elements: { reference: anchor ?? undefined },
  })

  // Retain handle to real DOM node
  useEffect(() => {
    floatingElRef.current = refs.floating.current
  }, [refs.floating])

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

  // Make computed maxHeight available to children via returned styles too
  const mergedStyles: React.CSSProperties = {
    ...floatingStyles,
    maxHeight: `${maxHRef.current}px`,
  }

  // Stops native bubbling to outside-click handlers
  const EventWrapper: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...rest }) => (
    <div
      {...rest}
      onPointerDown={(e) => {
        e.stopPropagation()
        // @ts-ignore
        e.nativeEvent?.stopImmediatePropagation?.()
        // @ts-ignore
        rest.onPointerDown?.(e)
      }}
      onClick={(e) => {
        e.stopPropagation()
        // @ts-ignore
        e.nativeEvent?.stopImmediatePropagation?.()
        // @ts-ignore
        rest.onClick?.(e)
      }}
      style={{ height: '100%', ...rest.style }}
    >
      {children}
    </div>
  )

  if (!open) return null

  return (
    <>
      {children({
        refs,
        floatingStyles: mergedStyles,
        isPositioned,
        maxHeightPx: maxHRef.current,
        EventWrapper,
      })}
    </>
  )
}
