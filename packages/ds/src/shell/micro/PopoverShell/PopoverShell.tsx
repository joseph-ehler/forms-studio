/**
 * PopoverShell - Anchored Overlay
 * 
 * Purpose: Light interactions anchored to a trigger (pickers, mini forms, quick actions).
 * Slots: Header (optional), Body (zero padding - your content provides).
 * Behavior: Auto-flip on collision, arrow pointing to anchor, focus return.
 * 
 * This is a shell wrapping the Popover primitive. Use DS tokens + Flowbite for visuals.
 */

import * as React from 'react';
import './PopoverShell.css';
import { useAppEnvironment } from '../../core';
import { captureFocus, restoreFocus } from '../../behavior/focus-policy';

export interface PopoverShellProps {
  /** Is popover open? */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** ARIA label (required for accessibility) */
  ariaLabel: string;
  /** Anchor element (trigger) */
  anchor: HTMLElement | null;
  /** Preferred placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Show arrow? */
  showArrow?: boolean;
  /** Offset from anchor (pixels) */
  offset?: number;
  /** Allow closing by clicking outside? */
  dismissOnOutsideClick?: boolean;
  /** Allow closing by pressing ESC? */
  dismissOnEsc?: boolean;
  /** Child slots (Header, Body) */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * PopoverShell - Anchored popover shell
 * 
 * @example
 * ```tsx
 * <PopoverShell 
 *   open={open} 
 *   onClose={onClose} 
 *   ariaLabel="Date Picker"
 *   anchor={buttonRef.current}
 *   placement="bottom"
 * >
 *   <PopoverShell.Header>
 *     <h3>Select Date</h3>
 *   </PopoverShell.Header>
 *   <PopoverShell.Body>
 *     <Calendar />
 *   </PopoverShell.Body>
 * </PopoverShell>
 * ```
 */
export function PopoverShell({
  open,
  onClose,
  ariaLabel,
  anchor,
  placement = 'bottom',
  showArrow = true,
  offset = 8,
  dismissOnOutsideClick = true,
  dismissOnEsc = true,
  children,
  className = '',
}: PopoverShellProps) {
  const env = useAppEnvironment();
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = React.useState(placement);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Runtime contract: ariaLabel required
  if (process.env.NODE_ENV !== 'production' && !ariaLabel) {
    throw new Error('[PopoverShell] ariaLabel is required for accessibility');
  }

  // Capture focus on mount
  React.useEffect(() => {
    if (open) {
      previousFocusRef.current = captureFocus();
    }
  }, [open]);

  // Restore focus on close
  React.useEffect(() => {
    if (!open && previousFocusRef.current) {
      restoreFocus(previousFocusRef.current);
    }
  }, [open]);

  // Position calculation with auto-flip
  React.useEffect(() => {
    if (!open || !anchor || !popoverRef.current) return;

    const updatePosition = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const popoverRect = popoverRef.current!.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = 0;
      let left = 0;
      let finalPlacement = placement;

      // Calculate position based on placement
      switch (placement) {
        case 'top':
          top = anchorRect.top - popoverRect.height - offset;
          left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2;
          
          // Flip if no space above
          if (top < 0) {
            top = anchorRect.bottom + offset;
            finalPlacement = 'bottom';
          }
          break;

        case 'bottom':
          top = anchorRect.bottom + offset;
          left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2;
          
          // Flip if no space below
          if (top + popoverRect.height > viewportHeight) {
            top = anchorRect.top - popoverRect.height - offset;
            finalPlacement = 'top';
          }
          break;

        case 'left':
          top = anchorRect.top + (anchorRect.height - popoverRect.height) / 2;
          left = anchorRect.left - popoverRect.width - offset;
          
          // Flip if no space left
          if (left < 0) {
            left = anchorRect.right + offset;
            finalPlacement = 'right';
          }
          break;

        case 'right':
          top = anchorRect.top + (anchorRect.height - popoverRect.height) / 2;
          left = anchorRect.right + offset;
          
          // Flip if no space right
          if (left + popoverRect.width > viewportWidth) {
            left = anchorRect.left - popoverRect.width - offset;
            finalPlacement = 'left';
          }
          break;
      }

      // Constrain to viewport
      left = Math.max(8, Math.min(left, viewportWidth - popoverRect.width - 8));
      top = Math.max(8, Math.min(top, viewportHeight - popoverRect.height - 8));

      setPosition({ top, left });
      setActualPlacement(finalPlacement);
    };

    updatePosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, anchor, placement, offset]);

  // Outside click handling
  React.useEffect(() => {
    if (!open || !dismissOnOutsideClick) return;

    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchor &&
        !anchor.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    // Use capture phase to catch clicks before they bubble
    document.addEventListener('mousedown', handleClick, true);

    return () => {
      document.removeEventListener('mousedown', handleClick, true);
    };
  }, [open, dismissOnOutsideClick, anchor, onClose]);

  // ESC handling
  React.useEffect(() => {
    if (!open || !dismissOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Return focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [open, dismissOnEsc, onClose]);

  if (!open || !anchor) return null;

  return (
    <div
      ref={popoverRef}
      className={`popover-shell ${className}`}
      data-placement={actualPlacement}
      data-shell-mode={env.mode}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 'var(--ds-z-popover, 60)',
      }}
      role="dialog"
      aria-label={ariaLabel}
    >
      {showArrow && <div className="popover-shell-arrow" data-placement={actualPlacement} />}
      {children}
    </div>
  );
}

/**
 * PopoverShell.Header - Optional header slot (frame, not skin)
 */
PopoverShell.Header = function PopoverHeader({ children }: { children: React.ReactNode }) {
  return <div className="popover-shell-header" data-slot="header">{children}</div>;
};

/**
 * PopoverShell.Body - Main content slot (frame, not skin)
 */
PopoverShell.Body = function PopoverBody({ children }: { children: React.ReactNode }) {
  return <div className="popover-shell-body" data-slot="body">{children}</div>;
};
