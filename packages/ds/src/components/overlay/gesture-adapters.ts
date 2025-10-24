/**
 * Gesture Routing Adapters
 * 
 * Pre-built adapters for common scenarios:
 * - Map interactions (Mapbox, Leaflet, Google Maps)
 * - Canvas interactions (drawing, editing)
 * - Custom gesture routing logic
 */

import type { GestureContext } from './SheetPanel'

export type GestureRouter = (ctx: GestureContext) => 'sheet' | 'canvas'

/**
 * Default gesture router with angle-aware detection
 * 
 * Logic:
 * - Low snap (< 50%): Sheet always owns vertical drags
 * - High snap + scrolled content: Sheet owns (scroll first)
 * - High snap + at top + horizontal drag (< 30°): Canvas owns
 * - Otherwise: Sheet owns
 * 
 * This prevents accidental closes when panning map/canvas horizontally.
 */
export const defaultGestureRouter: GestureRouter = (ctx) => {
  // Calculate drag angle (0° = horizontal, 90° = vertical)
  const angle = Math.abs(
    Math.atan2(ctx.dragDeltaY, Math.abs(ctx.dragDeltaX || 1)) * (180 / Math.PI)
  )
  
  // Low snap: sheet always owns
  if (ctx.currentSnap < 0.5) {
    return 'sheet'
  }
  
  // High snap: if content is scrolled, sheet owns (scroll first)
  if (!ctx.isAtTop) {
    return 'sheet'
  }
  
  // High snap + at top + near-horizontal drag: canvas owns
  if (angle < 30) {
    return 'canvas'
  }
  
  // Vertical drag at top: sheet owns
  return 'sheet'
}

/**
 * Mapbox gesture adapter
 * 
 * Enables/disables map panning based on sheet state
 * 
 * @example
 * ```typescript
 * const mapRef = useRef<mapboxgl.Map>()
 * const gestureRouter = createMapboxGestureAdapter(() => mapRef.current)
 * 
 * <SheetPanel gestureRouter={gestureRouter}>
 *   <RideOptions />
 * </SheetPanel>
 * ```
 */
export function createMapboxGestureAdapter(
  getMap: () => any // mapboxgl.Map (external dependency)
): GestureRouter {
  return (ctx) => {
    const map = getMap()
    if (!map) return 'sheet'
    
    // Handoff conditions:
    // 1. High snap (≥ 50%)
    // 2. Content at top
    // 3. Small vertical movement (< 12px)
    const shouldHandoffToMap = 
      ctx.currentSnap >= 0.5 &&
      ctx.isAtTop &&
      Math.abs(ctx.dragDeltaY) < 12
    
    if (shouldHandoffToMap) {
      // Enable map panning
      map.dragPan.enable()
      return 'canvas'
    } else {
      // Disable map panning, sheet owns
      map.dragPan.disable()
      return 'sheet'
    }
  }
}

/**
 * Leaflet gesture adapter
 * 
 * @example
 * ```typescript
 * const mapRef = useRef<L.Map>()
 * const gestureRouter = createLeafletGestureAdapter(() => mapRef.current)
 * ```
 */
export function createLeafletGestureAdapter(
  getMap: () => any // L.Map (external dependency)
): GestureRouter {
  return (ctx) => {
    const map = getMap()
    if (!map) return 'sheet'
    
    const shouldHandoffToMap = 
      ctx.currentSnap >= 0.5 &&
      ctx.isAtTop &&
      Math.abs(ctx.dragDeltaY) < 12
    
    if (shouldHandoffToMap) {
      map.dragging.enable()
      return 'canvas'
    } else {
      map.dragging.disable()
      return 'sheet'
    }
  }
}

/**
 * Google Maps gesture adapter
 * 
 * @example
 * ```typescript
 * const mapRef = useRef<google.maps.Map>()
 * const gestureRouter = createGoogleMapsGestureAdapter(() => mapRef.current)
 * ```
 */
export function createGoogleMapsGestureAdapter(
  getMap: () => any // google.maps.Map (external dependency)
): GestureRouter {
  return (ctx) => {
    const map = getMap()
    if (!map) return 'sheet'
    
    const shouldHandoffToMap = 
      ctx.currentSnap >= 0.5 &&
      ctx.isAtTop &&
      Math.abs(ctx.dragDeltaY) < 12
    
    if (shouldHandoffToMap) {
      map.setOptions({ draggable: true })
      return 'canvas'
    } else {
      map.setOptions({ draggable: false })
      return 'sheet'
    }
  }
}

/**
 * Canvas gesture adapter
 * 
 * Routes gestures based on drawing/editing mode
 * 
 * @example
 * ```typescript
 * const [isDrawing, setIsDrawing] = useState(false)
 * const canvasRef = useRef<HTMLCanvasElement>()
 * 
 * const gestureRouter = createCanvasGestureAdapter({
 *   isDrawing,
 *   getCanvas: () => canvasRef.current
 * })
 * ```
 */
export function createCanvasGestureAdapter({
  isDrawing,
  getCanvas,
}: {
  isDrawing: boolean
  getCanvas: () => HTMLCanvasElement | null | undefined
}): GestureRouter {
  return (ctx) => {
    const canvas = getCanvas()
    
    // Drawing mode: canvas owns everything
    if (isDrawing) {
      if (canvas) {
        canvas.style.pointerEvents = 'auto'
      }
      return 'canvas'
    }
    
    // Not drawing: use default routing
    if (canvas) {
      canvas.style.pointerEvents = ctx.currentSnap < 0.5 ? 'none' : 'auto'
    }
    return defaultGestureRouter(ctx)
  }
}

/**
 * Velocity-based gesture router
 * 
 * Routes based on gesture velocity (fast gestures go to canvas)
 * 
 * @example
 * ```typescript
 * const gestureRouter = createVelocityGestureAdapter({
 *   velocityThreshold: 1.5  // px/ms
 * })
 * ```
 */
export function createVelocityGestureAdapter({
  velocityThreshold = 1.5,
}: {
  velocityThreshold?: number
} = {}): GestureRouter {
  return (ctx) => {
    // Fast gesture: likely a map pan or canvas interaction
    if (ctx.velocity > velocityThreshold) {
      return ctx.currentSnap >= 0.5 && ctx.isAtTop ? 'canvas' : 'sheet'
    }
    
    // Slow gesture: use default routing
    return defaultGestureRouter(ctx)
  }
}

/**
 * Combine multiple gesture routers
 * 
 * Tries each router in order, uses first non-'sheet' result
 * 
 * @example
 * ```typescript
 * const combined = combineGestureRouters([
 *   createMapboxGestureAdapter(getMap),
 *   createVelocityGestureAdapter({ velocityThreshold: 2.0 })
 * ])
 * ```
 */
export function combineGestureRouters(
  routers: GestureRouter[]
): GestureRouter {
  return (ctx) => {
    for (const router of routers) {
      const result = router(ctx)
      if (result === 'canvas') {
        return 'canvas'
      }
    }
    return 'sheet'
  }
}

/**
 * Create custom gesture router with threshold tuning
 * 
 * @example
 * ```typescript
 * const custom = createCustomGestureRouter({
 *   snapThreshold: 0.6,      // Hand off at 60% instead of 50%
 *   angleThreshold: 45,      // More forgiving horizontal threshold
 *   scrollTolerance: 20,     // Pixels of scroll before locking to sheet
 * })
 * ```
 */
export function createCustomGestureRouter({
  snapThreshold = 0.5,
  angleThreshold = 30,
  scrollTolerance = 12,
}: {
  snapThreshold?: number
  angleThreshold?: number
  scrollTolerance?: number
} = {}): GestureRouter {
  return (ctx) => {
    const angle = Math.abs(
      Math.atan2(ctx.dragDeltaY, Math.abs(ctx.dragDeltaX || 1)) * (180 / Math.PI)
    )
    
    if (ctx.currentSnap < snapThreshold) {
      return 'sheet'
    }
    
    if (!ctx.isAtTop || ctx.contentScrollTop > scrollTolerance) {
      return 'sheet'
    }
    
    if (angle < angleThreshold) {
      return 'canvas'
    }
    
    return 'sheet'
  }
}

/**
 * Debug gesture router
 * 
 * Logs all gesture decisions to console (dev mode only)
 * 
 * @example
 * ```typescript
 * const router = debugGestureRouter(createMapboxGestureAdapter(getMap))
 * ```
 */
export function debugGestureRouter(
  baseRouter: GestureRouter
): GestureRouter {
  return (ctx) => {
    const result = baseRouter(ctx)
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[GestureRouter]', {
        result,
        snap: ctx.currentSnap,
        velocity: ctx.velocity.toFixed(2),
        deltaY: ctx.dragDeltaY,
        isAtTop: ctx.isAtTop,
      })
    }
    
    return result
  }
}

// Type exports for external use
export type { GestureContext }
