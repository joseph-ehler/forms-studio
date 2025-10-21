/**
 * OverlayPositioner
 * 
 * Wraps Floating UI to handle positioning, collision detection, and sizing.
 * Provides consistent positioning behavior for all overlay pickers.
 */

import React, { useMemo } from 'react'
import {
  useFloating,
  autoUpdate,
  offset as offsetMiddleware,
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
  collision = { flip: true, shift: true, size: true },
  sameWidth = false,
  maxHeight = 560,
  children,
}) => {
  // Build middleware array based on options
  const middleware = useMemo<Middleware[]>(() => {
    const mw: Middleware[] = []

    // Offset from anchor
    mw.push(offsetMiddleware(offset))

    // Flip to stay in viewport
    if (collision.flip) {
      mw.push(flip({ padding: 8 }))
    }

    // Shift to stay in viewport
    if (collision.shift) {
      mw.push(shift({ padding: 8 }))
    }

    // Size constraints
    if (collision.size || sameWidth) {
      mw.push(
        size({
          apply({ rects, elements, availableHeight }) {
            // Apply same width as trigger
            if (sameWidth) {
              Object.assign(elements.floating.style, {
                width: `${rects.reference.width}px`,
              })
            }

            // Constrain max height
            const maxH = Math.min(maxHeight, availableHeight - 16)
            Object.assign(elements.floating.style, {
              maxHeight: `${maxH}px`,
            })
          },
        })
      )
    }

    // Hide when detached
    if (collision.hide) {
      mw.push(hide())
    }

    return mw
  }, [offset, collision, sameWidth, maxHeight])

  // Floating UI hook
  const { refs, floatingStyles, isPositioned } = useFloating({
    placement,
    strategy,
    middleware,
    whileElementsMounted: autoUpdate,
    open,
    elements: {
      reference: anchor,
    },
  })

  // Don't render if not open
  if (!open) return null

  // Provide positioning data to children
  return <>{children({ refs, floatingStyles, isPositioned })}</>
}
