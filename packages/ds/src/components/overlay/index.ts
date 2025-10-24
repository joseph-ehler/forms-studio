/**
 * Overlay System - Barrel Exports
 * 
 * Unified overlay foundation for all picker-style fields and app-shell panels.
 */

// Core overlay components
export * from './OverlayPicker'
export * from './OverlayPositioner'
export * from './PickerFooter'
export * from './OverlayPickerCore'
export * from './CalendarSkin'

// Sheet components (Dialog = modal, Panel = non-modal)
export * from './SheetDialog'
export * from './SheetPanel'

// Device-aware routing
export * from './ResponsiveOverlay'
export * from './device-resolver'
export * from './gesture-adapters'

// Coordination & management
export * from './OverlayManager'
export * from './OverlayLiveRegion'

// Utilities, hooks, tokens
export * from './types'
export * from './tokens'
export * from './debug'
export * from './utils'
export * from './hooks'
