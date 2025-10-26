/**
 * OverlaySheet Primitive (Layer 2: Mechanics)
 * 
 * Bottom-anchored overlay with portal, backdrop, focus trap, and stack coordination.
 * 
 * This is a TRUE primitive:
 * - NO slots (just children)
 * - NO responsive logic
 * - NO CSS vars published
 * - NO footer modes or semantic buckets
 * 
 * Shells compose this + add their own structure/policy.
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { pushOverlay } from '../../shell/behavior/overlay-policy';
import { trapFocus } from '../../shell/behavior/focus-policy';
import './OverlaySheet.css';

export interface OverlaySheetProps {
  /** Is overlay open? */
  open: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Is this a blocking overlay (modal-like)? */
  blocking?: boolean;
  /** Unique ID for stack coordination (required) */
  id: string;
  /** ARIA label for dialog */
  ariaLabel?: string;
  /** Child content */
  children?: React.ReactNode;
}

/**
 * OverlaySheet - Bottom-anchored overlay primitive
 * 
 * Provides:
 * - Portal to document.body
 * - Overlay stack coordination (via pushOverlay)
 * - Focus trap (via trapFocus)
 * - Basic backdrop
 * - Bottom-anchored positioning
 * 
 * Does NOT provide:
 * - Slots (Header/Content/Footer)
 * - Responsive behavior
 * - Snap points
 * - Footer modes
 * - Semantic buckets
 * 
 * @example
 * ```tsx
 * <OverlaySheet 
 *   id="my-sheet" 
 *   open={open} 
 *   onClose={onClose}
 *   blocking={true}
 *   ariaLabel="Settings"
 * >
 *   <div>Your content here</div>
 * </OverlaySheet>
 * ```
 */
export function OverlaySheet({
  open,
  onClose,
  blocking = true,
  id,
  ariaLabel,
  children,
}: OverlaySheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // SSR safety
  if (typeof document === 'undefined') return null;

  // Register with overlay stack (single scrim owner)
  useEffect(() => {
    if (!open) return;
    
    const handle = pushOverlay({ 
      id, 
      blocking, 
      onClose 
    });
    
    return () => handle.close();
  }, [open, id, blocking, onClose]);

  // Focus trap while open
  useEffect(() => {
    if (!open || !contentRef.current) return;
    
    return trapFocus(contentRef.current, { 
      onEscape: onClose 
    });
  }, [open, onClose]);

  // Don't render if closed
  if (!open) return null;

  // Backdrop (minimal - shells can override)
  const backdrop = (
    <div
      className="overlay-sheet-backdrop"
      data-overlay-backdrop
      aria-hidden="true"
      onClick={onClose}
    />
  );

  // Content (bottom-anchored)
  const content = (
    <div
      className="overlay-sheet"
      role="dialog"
      aria-modal={blocking}
      aria-label={ariaLabel}
      ref={contentRef}
      data-overlay-sheet
    >
      {children}
    </div>
  );

  // Portal to document.body
  return createPortal(
    <>
      {backdrop}
      {content}
    </>,
    document.body
  );
}
