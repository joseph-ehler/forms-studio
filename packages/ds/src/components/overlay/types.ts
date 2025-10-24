/**
 * Unified Overlay System - Type Definitions
 * 
 * Central types for all picker-style overlays (Select, Date, Color, etc.)
 */

import type { ReactNode, RefObject } from 'react'
import type { Placement, Strategy } from '@floating-ui/react'

export type OverlayPresentation = 'sheet' | 'popover' | 'modal'
export type OverlayDensity = 'cozy' | 'compact'
export type OverlayElevation = 'base' | 'raised'
export type OverlayCloseReason = 'select' | 'escape' | 'outside' | 'programmatic'

export interface OverlayCollisionOptions {
  flip?: boolean
  shift?: boolean
  size?: boolean
  hide?: boolean
}

export interface OverlayPickerCoreProps {
  // Control
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, reason?: OverlayCloseReason) => void

  // Presentation
  presentation?: OverlayPresentation
  sameWidth?: boolean
  maxHeight?: number
  density?: OverlayDensity
  elevation?: OverlayElevation

  // Positioning (Floating UI)
  placement?: Placement
  offset?: number
  strategy?: Strategy
  collision?: OverlayCollisionOptions

  // Behavior
  closeOnSelect?: boolean
  searchable?: boolean
  virtualizeAfter?: number
  trapFocus?: boolean
  returnFocus?: boolean
  allowOutsideScroll?: boolean

  // Slots
  trigger?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  emptyState?: ReactNode
  children?: ReactNode

  // Accessibility
  'aria-label'?: string
  'aria-labelledby'?: string
}

export interface OverlayPositionerProps {
  open: boolean
  anchor: HTMLElement | null
  placement?: Placement
  offset?: number
  strategy?: Strategy
  collision?: OverlayCollisionOptions
  sameWidth?: boolean
  maxHeight?: number
  children: (props: OverlayPositionData) => ReactNode
}

export interface OverlayPositionData {
  refs: {
    setFloating: (node: HTMLElement | null) => void
  }
  floatingStyles: React.CSSProperties
  isPositioned: boolean
  maxHeightPx: number
  EventWrapper: React.FC<React.HTMLAttributes<HTMLDivElement>>
}

export interface SheetDialogProps {
  open: boolean
  onClose: () => void
  maxHeight?: number
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  allowOutsideScroll?: boolean
  contentRef?: RefObject<HTMLDivElement>
  'aria-label'?: string
  'aria-labelledby'?: string
}

export interface PickerListProps {
  role?: 'listbox' | 'menu'
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-multiselectable'?: boolean
  children: ReactNode
  virtualizeAfter?: number
  itemHeight?: number
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export interface PickerOptionProps {
  value: string
  selected?: boolean
  disabled?: boolean
  active?: boolean
  children: ReactNode
  onClick?: () => void
  onMouseEnter?: () => void
}

export interface PickerSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounce?: number
  autoFocus?: boolean
}

export interface PickerEmptyStateProps {
  message?: string
  icon?: ReactNode
}
