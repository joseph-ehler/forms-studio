/**
 * SheetPanel
 * 
 * Non-modal app-shell panel for map + panel, filters, canvas controls
 * 
 * Key differences from SheetDialog:
 * - Non-modal: no focus trap, no inert background, no scroll lock
 * - Gesture routing: arbitrates drags with canvas/map
 * - URL binding: persists snap state to route
 * - Back semantics: collapse → close → navigate
 * - Natural tab order: works with underlying content
 * 
 * @example
 * ```tsx
 * <SheetPanel
 *   open={open}
 *   onClose={onClose}
 *   snap={[0.25, 0.5, 0.9]}
 *   gestureRouter={mapGestureRouter}
 *   routeBinding={{ get: readFromURL, set: writeToURL }}
 *   ariaLabel="Ride options"
 * >
 *   <RideOptionsList />
 * </SheetPanel>
 * ```
 */

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { getOverlayZIndex } from './tokens'
import { getTranslateStyle } from './utils/browser-compat'
import { defaultGestureRouter } from './gesture-adapters'

export type Snap = number; // 0..1 representing fraction of viewport height

export interface GestureContext {
  // Sheet state
  currentSnap: Snap
  snaps: Snap[]
  velocity: number          // px/ms (positive = downward)
  dragStartY: number        // screen Y at drag start
  dragDeltaY: number        // current - start (vertical)
  dragDeltaX?: number       // horizontal delta (for angle detection)

  // Content scroll state
  contentScrollTop: number
  contentScrollHeight: number
  contentClientHeight: number
  isAtTop: boolean
  isAtBottom: boolean

  // Environment
  isTouch: boolean
  pointerType: 'touch' | 'mouse' | 'pen'
  viewportHeight: number
}

export interface SheetPanelRouteBinding {
  /** Read current snap from URL or app state */
  get(): Snap | null
  /** Write snap to URL or app state (should be debounced) */
  set(snap: Snap): void
}

export interface SheetPanelProps {
  // Basics
  open: boolean
  onClose: () => void

  // Snapping
  snap: Snap[]                     // e.g. [0.25, 0.5, 0.9]
  initialSnap?: Snap               // default: highest <= 0.5 else min(snap)
  velocityThreshold?: number       // default: 0.9 px/ms
  distanceThreshold?: number       // default: 0.18 (18% of viewport height)

  // Gesture routing
  gestureRouter?: (ctx: GestureContext) => 'sheet' | 'canvas'

  // URL binding (optional)
  routeBinding?: SheetPanelRouteBinding

  // Back button / Esc semantics
  onBackPressure?: () => 'collapse' | 'close' | 'cancel'
  collapseTarget?: 'lower' | 'min' | Snap

  // A11y (non-modal)
  role?: 'complementary' | 'region'
  ariaLabel?: string
  ariaLabelledBy?: string

  // Visual
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}

// defaultGestureRouter is imported from gesture-adapters.ts

export const SheetPanel: React.FC<SheetPanelProps> = ({
  open,
  onClose,
  snap: snaps,
  initialSnap,
  velocityThreshold = 0.9,
  distanceThreshold = 0.18,
  gestureRouter = defaultGestureRouter,
  routeBinding,
  onBackPressure,
  collapseTarget = 'lower',
  role = 'complementary',
  ariaLabel,
  ariaLabelledBy,
  className = '',
  header,
  footer,
  children,
  ...restProps
}) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // ⚠️ RUNTIME CONTRACTS (dev-only validation)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // 1. Require accessibility label
      if (!ariaLabel && !ariaLabelledBy) {
        throw new Error(
          '[SheetPanel] Missing accessibility label.\n' +
          'Panels need accessible names for screen readers.\n' +
          'Fix: Add ariaLabel="Ride options" or ariaLabelledBy="panel-title"\n' +
          'See: docs/ds/SHEET_POLICY.md#sheetpanel-contracts'
        )
      }
      
      // 2. Verify role is non-modal (skipped - TypeScript types already enforce this)
      
      // 3. Check for modal props (common mistake)
      const modalProps = ['modal', 'trapFocus', 'backdrop', 'ariaModal', 'scrollLock']
      const foundModalProps = modalProps.filter(prop => prop in restProps)
      if (foundModalProps.length > 0) {
        throw new Error(
          `[SheetPanel] Panels are non-modal.\n` +
          `Remove props: ${foundModalProps.join(', ')}\n` +
          `Use <SheetDialog> for modal tasks.\n` +
          `See: docs/ds/SHEET_POLICY.md#sheetpanel-contracts`
        )
      }
      
      // 4. Warn if missing gestureRouter (nice-to-have)
      if (!gestureRouter || gestureRouter === defaultGestureRouter) {
        console.info(
          '[SheetPanel] Using default gesture router.\n' +
          'Consider providing custom gestureRouter for map/canvas interactions.\n' +
          'See: docs/ds/gesture-adapters.ts for pre-built adapters\n' +
          '(createMapboxGestureAdapter, createCanvasGestureAdapter, etc.)'
        )
      }
    }
  }, [ariaLabel, ariaLabelledBy, role, gestureRouter, restProps])

  // Validate & sort snaps
  const sortedSnaps = useMemo(() => {
    return [...snaps].sort((a, b) => a - b)
  }, [snaps])

  // Determine initial snap
  const defaultInitialSnap = useMemo(() => {
    if (initialSnap !== undefined) return initialSnap
    // Highest snap <= 0.5, else lowest
    const mid = sortedSnaps.filter(s => s <= 0.5)
    return mid.length > 0 ? mid[mid.length - 1] : sortedSnaps[0]
  }, [initialSnap, sortedSnaps])

  // Current snap state (can be overridden by URL binding)
  const [currentSnap, setCurrentSnap] = useState(defaultInitialSnap)
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [dragOwner, setDragOwner] = useState<'sheet' | 'canvas'>('sheet')

  // Sync with URL binding on mount
  useEffect(() => {
    if (!open || !routeBinding) return
    const urlSnap = routeBinding.get()
    if (urlSnap !== null && sortedSnaps.includes(urlSnap)) {
      setCurrentSnap(urlSnap)
    }
  }, [open, routeBinding, sortedSnaps])

  // Write to URL when snap changes
  useEffect(() => {
    if (!open || !routeBinding) return
    routeBinding.set(currentSnap)
  }, [currentSnap, open, routeBinding])

  // Back/Esc handler (TODO: implement useSheetBackHandler hook)
  // useSheetBackHandler({
  //   snaps: sortedSnaps,
  //   currentSnap,
  //   setSnap: setCurrentSnap,
  //   onClose,
  //   collapseTarget,
  //   onBackPressure,
  // })

  // Gesture handling
  const handlePointerDown = (e: React.PointerEvent) => {
    const content = contentRef.current
    if (!content) return

    const ctx: GestureContext = {
      currentSnap,
      snaps: sortedSnaps,
      velocity: 0,
      dragStartY: e.clientY,
      dragDeltaY: 0,
      contentScrollTop: content.scrollTop,
      contentScrollHeight: content.scrollHeight,
      contentClientHeight: content.clientHeight,
      isAtTop: content.scrollTop === 0,
      isAtBottom: content.scrollTop + content.clientHeight >= content.scrollHeight,
      isTouch: e.pointerType === 'touch',
      pointerType: e.pointerType as 'touch' | 'mouse' | 'pen',
      viewportHeight: window.innerHeight,
    }

    const owner = gestureRouter(ctx)
    setDragOwner(owner)

    if (owner === 'sheet') {
      setIsDragging(true)
      setDragStartY(e.clientY)
      setDragCurrentY(e.clientY)
      setDragStartTime(Date.now())
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || dragOwner !== 'sheet') return
    setDragCurrentY(e.clientY)
  }

  const handlePointerUp = () => {
    if (!isDragging) return

    const deltaY = dragCurrentY - dragStartY
    const deltaTime = Date.now() - dragStartTime
    const velocity = Math.abs(deltaY) / Math.max(deltaTime, 1)

    // Velocity-based snap
    if (velocity > velocityThreshold) {
      const direction = deltaY > 0 ? 'down' : 'up'
      const currentIdx = sortedSnaps.findIndex(s => Math.abs(s - currentSnap) < 0.01)
      
      if (direction === 'down' && currentIdx > 0) {
        setCurrentSnap(sortedSnaps[currentIdx - 1])
      } else if (direction === 'up' && currentIdx < sortedSnaps.length - 1) {
        setCurrentSnap(sortedSnaps[currentIdx + 1])
      } else if (direction === 'down' && currentIdx === 0) {
        onClose() // Flick down at lowest → close
      }
    } else {
      // Distance-based snap
      const threshold = window.innerHeight * distanceThreshold
      if (Math.abs(deltaY) > threshold) {
        const direction = deltaY > 0 ? 'down' : 'up'
        const currentIdx = sortedSnaps.findIndex(s => Math.abs(s - currentSnap) < 0.01)
        
        if (direction === 'down' && currentIdx > 0) {
          setCurrentSnap(sortedSnaps[currentIdx - 1])
        } else if (direction === 'up' && currentIdx < sortedSnaps.length - 1) {
          setCurrentSnap(sortedSnaps[currentIdx + 1])
        }
      }
    }

    setIsDragging(false)
  }

  // Calculate translate offset (only during drag)
  const translateOffset = isDragging ? dragCurrentY - dragStartY : 0
  const translateStyle = translateOffset !== 0 ? getTranslateStyle(0, translateOffset) : {}

  if (!open) return null

  const portalRoot = typeof document !== 'undefined' ? document.body : null
  if (!portalRoot) return null

  const content = (
    <div
      ref={sheetRef}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-testid="sheet-panel"
      data-snap={currentSnap.toFixed(2)}
      className={`flex flex-col ${className}`}
      style={{
        position: 'fixed',
        insetInline: 0,
        insetBlockEnd: 0,
        height: `${currentSnap * 100}vh`,
        maxHeight: '100vh',
        zIndex: getOverlayZIndex('panel'),
        ...translateStyle,
        transition: isDragging ? 'none' : 'height 300ms cubic-bezier(0.4, 0, 0.2, 1), translate 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: 'var(--ds-color-surface-base)',
        borderRadius: 'var(--ds-radius-xl, 16px) var(--ds-radius-xl, 16px) 0 0',
        boxShadow: 'var(--ds-shadow-overlay-lg)',
        overscrollBehavior: 'contain',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center flex-shrink-0"
        style={{
          minHeight: '48px',  // WCAG AAA hit target
          padding: '22px 0', // Centers 4px bar in 48px area
        }}
      >
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: 'var(--ds-color-border-strong)',
          borderRadius: '2px',
        }} />
      </div>

      {/* Header (sticky) */}
      {header && (
        <div style={{
          flexShrink: 0,
          borderBottom: '1px solid var(--ds-color-border-subtle)',
          padding: '12px 16px',
        }}>
          {header}
        </div>
      )}

      {/* Content (scrollable) */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{ overscrollBehavior: 'contain' }}
      >
        {children}
      </div>

      {/* Footer (sticky) */}
      {footer && (
        <div style={{
          flexShrink: 0,
          borderTop: '1px solid var(--ds-color-border-subtle)',
          padding: '12px 16px',
        }}>
          {footer}
        </div>
      )}
    </div>
  )

  return createPortal(content, portalRoot)
}
