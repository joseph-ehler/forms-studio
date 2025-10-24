/**
 * ResponsiveOverlay - God-Tier Responsive Overlay System
 * 
 * Automatically switches between popover (desktop) and sheet (mobile)
 * based on viewport size, available space, and collision detection.
 * 
 * Features:
 * - Smart mode detection (auto/popover/sheet)
 * - Collision detection with flip/shift/resize
 * - Snap points with gesture support
 * - Keyboard avoidance (mobile)
 * - Safe area handling (notches, etc.)
 * - Sticky header/footer with scrollable content
 * - Focus trap + return focus
 * - Full a11y compliance
 * 
 * Usage in recipes:
 * ```tsx
 * <ResponsiveOverlay
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   triggerRef={triggerRef}
 *   {...ctx.spec.ui?.overlay}
 * >
 *   <OverlayHeader>Search</OverlayHeader>
 *   <OverlayContent>Options</OverlayContent>
 *   <OverlayFooter>Actions</OverlayFooter>
 * </ResponsiveOverlay>
 * ```
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSheetGestures } from './useSheetGestures';
import { usePopoverPosition } from './usePopoverPosition';
import { useFocusTrap } from './useFocusTrap';

export interface ResponsiveOverlayProps {
  /** Whether overlay is visible */
  open: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Ref to trigger element (for positioning and focus return) */
  triggerRef: React.RefObject<HTMLElement>;
  
  /** Mode selection */
  mode?: 'auto' | 'popover' | 'sheet';
  
  /** Breakpoint (px) - below this uses sheet, above uses popover */
  breakpoint?: number;
  
  /** Fit popover width to trigger width */
  fitTrigger?: boolean;
  
  /** Collision detection strategy for popover */
  collision?: 'flip' | 'shift' | 'resize' | 'flip-shift-resize';
  
  /** Padding around trigger when placing popover */
  anchorPadding?: number;
  
  /** Minimum usable height for popover (px) - falls back to sheet if less */
  minPopoverHeight?: number;
  
  /** Snap points for sheet (fractions of viewport height) */
  snap?: number[];
  
  /** Initial snap index */
  initialSnap?: number;
  
  /** Show drag handle on sheet */
  dragHandle?: boolean;
  
  /** Allow content scroll when sheet is at max snap */
  allowContentScroll?: boolean;
  
  /** Lift sheet when keyboard appears */
  keyboardAvoidance?: boolean;
  
  /** ARIA role (dialog or listbox) */
  role?: 'dialog' | 'listbox';
  
  /** ARIA label */
  ariaLabel?: string;
  
  /** ARIA labelledby */
  ariaLabelledBy?: string;
  
  /** For listbox: is multi-selectable */
  ariaMultiselectable?: boolean;
  
  /** Children (should be OverlayHeader/Content/Footer) */
  children: React.ReactNode;
}

export const ResponsiveOverlay: React.FC<ResponsiveOverlayProps> = ({
  open,
  onClose,
  triggerRef,
  mode = 'auto',
  breakpoint = 768,
  fitTrigger = true,
  collision = 'flip-shift-resize',
  anchorPadding = 8,
  minPopoverHeight = 280,
  snap = [0.4, 0.7, 1.0],
  initialSnap = 2,
  dragHandle = true,
  allowContentScroll = true,
  keyboardAvoidance = true,
  role = 'dialog',
  ariaLabel,
  ariaLabelledBy,
  ariaMultiselectable,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Viewport size detection
  const [viewportWidth, setViewportWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Decide: popover or sheet
  const useSheet = useMemo(() => {
    if (mode === 'sheet') return true;
    if (mode === 'popover') return false;
    // Auto mode: use sheet if below breakpoint
    return viewportWidth < breakpoint;
  }, [mode, viewportWidth, breakpoint]);
  
  // Popover positioning (only when !useSheet)
  const popoverPosition = usePopoverPosition({
    enabled: !useSheet && open,
    triggerRef,
    containerRef,
    fitTrigger,
    collision,
    anchorPadding,
    minHeight: minPopoverHeight
  });
  
  // Sheet gestures (only when useSheet)
  const sheetGestures = useSheetGestures({
    enabled: useSheet && open,
    contentRef,
    snap,
    initialSnap,
    onClose,
    allowContentScroll,
    keyboardAvoidance
  });
  
  // Focus trap
  useFocusTrap({
    enabled: open,
    containerRef,
    onEscape: onClose,
    returnFocusRef: triggerRef
  });
  
  // Don't render if not open
  if (!open) return null;
  
  // Check if popover positioning failed (auto mode fallback to sheet)
  const shouldFallbackToSheet = mode === 'auto' && 
    !useSheet && 
    popoverPosition.availableHeight < minPopoverHeight;
  
  const actuallyUseSheet = useSheet || shouldFallbackToSheet;
  
  // Render based on mode
  if (actuallyUseSheet) {
    return createPortal(
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--ds-color-backdrop)',
            zIndex: 1000,
            opacity: sheetGestures.backdropOpacity,
            transition: 'opacity 200ms ease'
          }}
        />
        
        {/* Sheet */}
        <div
          ref={containerRef}
          role={role}
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-multiselectable={ariaMultiselectable}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1001,
            background: 'var(--ds-color-surface-base)',
            borderTopLeftRadius: 'var(--ds-radius-xl)',
            borderTopRightRadius: 'var(--ds-radius-xl)',
            boxShadow: 'var(--ds-shadow-overlay-lg)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            transform: `translateY(${sheetGestures.translateY}px)`,
            transition: sheetGestures.isAnimating ? 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
            paddingBottom: `max(env(safe-area-inset-bottom), ${sheetGestures.keyboardOffset}px)`
          }}
        >
          {/* Drag handle */}
          {dragHandle && (
            <div
              aria-label="Drag to expand or collapse"
              onPointerDown={sheetGestures.onPointerDown}
              onPointerMove={sheetGestures.onPointerMove}
              onPointerUp={sheetGestures.onPointerUp}
              onPointerCancel={sheetGestures.onPointerCancel}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: 'var(--ds-space-3) 0',
                cursor: 'grab',
                touchAction: 'none'
              }}
            >
              <div style={{
                width: '32px',
                height: 'var(--ds-space-1)',
                borderRadius: 'var(--ds-radius-sm)',
                background: 'var(--ds-color-border-strong)'
              }} />
            </div>
          )}
          
          {/* Children (Header/Content/Footer) */}
          <div ref={contentRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {children}
          </div>
        </div>
      </>,
      document.body
    );
  }
  
  // Popover mode
  return createPortal(
    <>
      {/* Backdrop (lighter for popover) */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999
        }}
      />
      
      {/* Popover */}
      <div
        ref={containerRef}
        role={role}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-multiselectable={ariaMultiselectable}
        style={{
          position: 'absolute',
          zIndex: 1000,
          background: 'var(--ds-color-surface-base)',
          border: '1px solid var(--ds-color-border-subtle)',
          borderRadius: 'var(--ds-radius-md)',
          boxShadow: 'var(--ds-shadow-overlay-md)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          ...popoverPosition.style
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
};
