/**
 * ResponsiveOverlay - Device-Aware Overlay Router
 * 
 * Automatically renders the correct overlay component based on:
 * - Device (mobile/tablet/desktop)
 * - Kind (field/dialog/panel)
 * - User override (optional)
 * 
 * Single component, correct mode automatically.
 * No device conditionals in consumer code.
 * 
 * @example
 * ```tsx
 * // Automatic resolution
 * <ResponsiveOverlay kind="field" mode="auto">
 *   <ColorPicker />
 * </ResponsiveOverlay>
 * 
 * // Explicit override (for testing)
 * <ResponsiveOverlay kind="field" mode="sheet">
 *   <ColorPicker />
 * </ResponsiveOverlay>
 * ```
 */

import React from 'react'
import { useDS } from '../../DSProvider'
import { OverlayPicker } from './OverlayPicker'
import { SheetDialog } from './SheetDialog'
import { SheetPanel } from './SheetPanel'
import type { OverlayKind, UserMode } from './device-resolver'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ResponsiveOverlayProps {
  /** What kind of overlay is this? */
  kind: OverlayKind
  
  /** User mode override (default: 'auto') */
  mode?: UserMode
  
  /** Is overlay open? */
  open: boolean
  
  /** Close handler */
  onClose: () => void
  
  /** Accessibility label */
  ariaLabel?: string
  
  /** Accessibility label ID */
  ariaLabelledBy?: string
  
  /** Header content */
  header?: React.ReactNode
  
  /** Footer content */
  footer?: React.ReactNode
  
  /** Main content */
  children: React.ReactNode
  
  /** Snap points for panels (default: [0.25, 0.5, 0.9]) */
  snap?: number[]
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ResponsiveOverlay: React.FC<ResponsiveOverlayProps> = ({
  kind,
  mode: userMode = 'auto',
  open,
  onClose,
  ariaLabel,
  ariaLabelledBy,
  header,
  footer,
  children,
  snap = [0.25, 0.5, 0.9],
}) => {
  const { resolveMode } = useDS()
  
  // Single source of truth for mode resolution
  const resolvedMode = resolveMode(kind, userMode)
  
  // Dev-only logging
  if (process.env.NODE_ENV !== 'production' && open) {
    console.debug(
      '[ResponsiveOverlay]',
      { kind, userMode, resolvedMode }
    )
  }
  
  // Render appropriate component based on resolved mode
  switch (resolvedMode) {
    case 'popover':
      // Desktop: Use SheetDialog in dialog mode
      // (OverlayPicker requires anchor element, not suitable for this API)
      return (
        <SheetDialog
          open={open}
          onClose={onClose}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          header={header}
          footer={footer}
        >
          {children}
        </SheetDialog>
      )
    
    case 'sheet':
      // Mobile: Sheet for everything
      if (kind === 'panel') {
        // Non-modal panel
        return (
          <SheetPanel
            open={open}
            onClose={onClose}
            ariaLabel={ariaLabel}
            ariaLabelledBy={ariaLabelledBy}
            snap={snap}
            header={header}
            footer={footer}
          >
            {children}
          </SheetPanel>
        )
      } else {
        // Modal dialog (field/dialog)
        return (
          <SheetDialog
            open={open}
            onClose={onClose}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            header={header}
            footer={footer}
          >
            {children}
          </SheetDialog>
        )
      }
    
    case 'dialog':
      // Desktop: Modal dialog
      return (
        <SheetDialog
          open={open}
          onClose={onClose}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          header={header}
          footer={footer}
        >
          {children}
        </SheetDialog>
      )
    
    case 'docked-panel':
      // Desktop: Docked panel (sidebar)
      // TODO: Implement DockedPanel component
      console.warn('[ResponsiveOverlay] docked-panel mode not yet implemented, falling back to SheetPanel')
      return (
        <SheetPanel
          open={open}
          onClose={onClose}
          ariaLabel={ariaLabel}
          ariaLabelledBy={ariaLabelledBy}
          snap={snap}
          header={header}
          footer={footer}
        >
          {children}
        </SheetPanel>
      )
    
    default:
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[ResponsiveOverlay] Unknown mode: ${resolvedMode}`)
      }
      return null
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Convenience Wrappers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Convenience Wrappers (optional - saves typing 'kind' prop)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type FieldOverlayProps = Omit<ResponsiveOverlayProps, 'kind'>
export type DialogOverlayProps = Omit<ResponsiveOverlayProps, 'kind'>
export type PanelOverlayProps = Omit<ResponsiveOverlayProps, 'kind'>

/**
 * Field picker overlay (auto-resolves to popover on desktop, sheet on mobile)
 */
export const FieldOverlay: React.FC<FieldOverlayProps> = (props) => (
  <ResponsiveOverlay kind="field" {...props} />
)

/**
 * Dialog overlay (auto-resolves based on device)
 */
export const DialogOverlay: React.FC<DialogOverlayProps> = (props) => (
  <ResponsiveOverlay kind="dialog" {...props} />
)

/**
 * Panel overlay (auto-resolves to docked on desktop, sheet on mobile)
 */
export const PanelOverlay: React.FC<PanelOverlayProps> = (props) => (
  <ResponsiveOverlay kind="panel" {...props} />
)
