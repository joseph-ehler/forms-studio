/**
 * DrawerShell - Side Panel (Left/Right Off-Canvas)
 * 
 * Purpose: Side reveals for filters, settings, navigation, shopping cart.
 * Slots: Header, Body, Footer (zero padding - your content provides).
 * Behavior: Desktop pushes content or overlays; Mobile always overlays with backdrop.
 * 
 * This is a shell (structure only). Use DS tokens + Flowbite for visuals.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import './DrawerShell.css';
import { useAppEnvironment } from '../../core';
import { pushOverlay } from '../../behavior/overlay-policy';
import { trapFocus, captureFocus, restoreFocus } from '../../behavior/focus-policy';
import { registerShortcut } from '../../behavior/shortcut-broker';

export interface DrawerShellProps {
  /** Is drawer open? */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** ARIA label (required for accessibility) */
  ariaLabel: string;
  /** Which side? */
  side?: 'left' | 'right';
  /** Width in pixels */
  width?: number;
  /** Desktop behavior: push content or overlay? */
  desktopBehavior?: 'push' | 'overlay';
  /** Allow closing by clicking overlay? */
  dismissOnOverlayClick?: boolean;
  /** Allow closing by pressing ESC? */
  dismissOnEsc?: boolean;
  /** Child slots (Header, Body, Footer) */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * DrawerShell - Side panel shell
 * 
 * @example
 * ```tsx
 * <DrawerShell open={open} onClose={onClose} ariaLabel="Filters" side="left">
 *   <DrawerShell.Header>
 *     <h2>Filters</h2>
 *     <button onClick={onClose}>Close</button>
 *   </DrawerShell.Header>
 *   <DrawerShell.Body>
 *     <FilterForm />
 *   </DrawerShell.Body>
 *   <DrawerShell.Footer>
 *     <Button onClick={applyFilters}>Apply</Button>
 *   </DrawerShell.Footer>
 * </DrawerShell>
 * ```
 */
export function DrawerShell({
  open,
  onClose,
  ariaLabel,
  side = 'right',
  width = 400,
  desktopBehavior = 'overlay',
  dismissOnOverlayClick = true,
  dismissOnEsc = true,
  children,
  className = '',
}: DrawerShellProps) {
  const env = useAppEnvironment();
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const drawerId = React.useId();
  const headerId = React.useId();

  // Determine if overlay mode
  const shouldOverlay = env.mode !== 'desktop' || desktopBehavior === 'overlay';
  
  // ARIA label: Use ariaLabel if provided, otherwise wire to header via aria-labelledby
  const labelProps = ariaLabel
    ? { 'aria-label': ariaLabel }
    : { 'aria-labelledby': headerId };

  // Capture focus on mount
  React.useEffect(() => {
    if (open) {
      previousFocusRef.current = captureFocus();
    }
  }, [open]);

  // Register with overlay stack (only in overlay mode)
  React.useEffect(() => {
    if (!open || !shouldOverlay) return;
    
    const handle = pushOverlay({
      id: drawerId,
      blocking: true,
      onClose,
    });
    
    return () => handle.close();
  }, [open, shouldOverlay, drawerId, onClose]);

  // Focus trap (only in overlay mode, without ESC handling)
  React.useEffect(() => {
    if (!open || !shouldOverlay || !drawerRef.current) return;
    
    return trapFocus(drawerRef.current, {
      // ESC handled by shortcut broker below
    });
  }, [open, shouldOverlay]);
  
  // Register ESC shortcut (only in overlay mode, uses 'drawer' scope)
  React.useEffect(() => {
    if (!open || !shouldOverlay || !dismissOnEsc) return;
    
    return registerShortcut('Escape', 'drawer', onClose);
  }, [open, shouldOverlay, dismissOnEsc, onClose]);

  // Restore focus on close
  React.useEffect(() => {
    if (!open && previousFocusRef.current) {
      restoreFocus(previousFocusRef.current);
    }
  }, [open]);

  if (!open) return null;

  const drawer = (
    <>
      {/* Backdrop (only for overlay mode) */}
      {shouldOverlay && (
        <div 
          className="drawer-shell-backdrop"
          onClick={() => {
            if (dismissOnOverlayClick) {
              onClose();
            }
          }}
        />
      )}
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`drawer-shell ${className}`}
        data-side={side}
        data-behavior={shouldOverlay ? 'overlay' : 'push'}
        data-shell-mode={env.mode}
        style={{
          '--drawer-width': `${width}px`,
        } as React.CSSProperties}
        role="complementary"
        {...labelProps}
      >
        {React.Children.map(children, (child) => {
          // Pass headerId to Header slot if it's a DrawerShell.Header
          if (React.isValidElement(child) && child.type === DrawerShell.Header) {
            return React.cloneElement(child, { id: headerId } as any);
          }
          return child;
        })}
      </div>
    </>
  );

  // Portal to body for overlay mode
  return shouldOverlay && typeof document !== 'undefined'
    ? createPortal(drawer, document.body)
    : drawer;
}

/**
 * DrawerShell.Header - Optional header slot (frame, not skin)
 */
DrawerShell.Header = function DrawerHeader({ children, id }: { children: React.ReactNode; id?: string }) {
  return <div id={id} className="drawer-shell-header" data-slot="header">{children}</div>;
};

/**
 * DrawerShell.Body - Main content slot (scrollable, frame not skin)
 */
DrawerShell.Body = function DrawerBody({ children }: { children: React.ReactNode }) {
  return <div className="drawer-shell-body" data-slot="body">{children}</div>;
};

/**
 * DrawerShell.Footer - Footer slot (frame, not skin)
 */
DrawerShell.Footer = function DrawerFooter({ children }: { children: React.ReactNode }) {
  return <div className="drawer-shell-footer" data-slot="footer">{children}</div>;
};
