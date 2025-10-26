/**
 * ModalShell - Centered Dialog (Desktop-First)
 * 
 * Purpose: Blocking dialog for focused tasks (confirms, forms, settings).
 * Slots: Header, Body, Actions (zero padding - your content provides).
 * Behavior: Focus trap, ESC dismissal, overlay click policy, sizes (sm/md/lg/xl).
 * 
 * This is a shell (structure only). Use DS tokens + Flowbite for visuals.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import './ModalShell.css';
import { useAppEnvironment } from '../../core';
import { pushOverlay } from '../../behavior/overlay-policy';
import { trapFocus, captureFocus, restoreFocus } from '../../behavior/focus-policy';
import { registerShortcut } from '../../behavior/shortcut-broker';

export interface ModalShellProps {
  /** Is modal open? */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** ARIA label (required for accessibility) */
  ariaLabel: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Allow closing by clicking overlay? */
  dismissOnOverlayClick?: boolean;
  /** Allow closing by pressing ESC? */
  dismissOnEsc?: boolean;
  /** Child slots (Header, Body, Actions) */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * ModalShell - Centered dialog shell
 * 
 * @example
 * ```tsx
 * <ModalShell open={open} onClose={onClose} ariaLabel="Confirm Delete" size="sm">
 *   <ModalShell.Header>
 *     <h2>Confirm Delete</h2>
 *   </ModalShell.Header>
 *   <ModalShell.Body>
 *     <p>Are you sure you want to delete this item?</p>
 *   </ModalShell.Body>
 *   <ModalShell.Actions>
 *     <Button onClick={onClose}>Cancel</Button>
 *     <Button color="danger" onClick={onDelete}>Delete</Button>
 *   </ModalShell.Actions>
 * </ModalShell>
 * ```
 */
export function ModalShell({
  open,
  onClose,
  ariaLabel,
  size = 'md',
  dismissOnOverlayClick = true,
  dismissOnEsc = true,
  children,
  className = '',
}: ModalShellProps) {
  const env = useAppEnvironment();
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const modalId = React.useId();
  const headerId = React.useId();

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

  // Register with overlay stack (handles scroll lock + inert)
  React.useEffect(() => {
    if (!open) return;
    
    const handle = pushOverlay({
      id: modalId,
      blocking: true,
      onClose,
    });
    
    return () => handle.close();
  }, [open, modalId, onClose]);

  // Focus trap (uses behavior policy, without ESC handling)
  React.useEffect(() => {
    if (!open || !modalRef.current) return;
    
    return trapFocus(modalRef.current, {
      // ESC handled by shortcut broker below
    });
  }, [open]);
  
  // Register ESC shortcut (uses shortcut broker with 'modal' scope)
  React.useEffect(() => {
    if (!open || !dismissOnEsc) return;
    
    return registerShortcut('Escape', 'modal', onClose);
  }, [open, dismissOnEsc, onClose]);

  // Restore focus on close
  React.useEffect(() => {
    if (!open && previousFocusRef.current) {
      restoreFocus(previousFocusRef.current);
    }
  }, [open]);

  if (!open) return null;

  // Mobile: Full-screen modal
  const isMobile = env.mode === 'mobile';

  const modal = (
    <div 
      className="modal-shell-overlay"
      onClick={(e) => {
        if (dismissOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`modal-shell ${className}`}
        data-size={size}
        data-shell-mode={env.mode}
        data-pointer={env.pointer}
        role="dialog"
        aria-modal="true"
        {...labelProps}
      >
        {React.Children.map(children, (child) => {
          // Pass headerId to Header slot if it's a ModalShell.Header
          if (React.isValidElement(child) && child.type === ModalShell.Header) {
            return React.cloneElement(child, { id: headerId } as any);
          }
          return child;
        })}
      </div>
    </div>
  );

  // Portal to body
  return typeof document !== 'undefined' 
    ? createPortal(modal, document.body)
    : null;
}

/**
 * ModalShell.Header - Optional header slot (frame, not skin)
 */
ModalShell.Header = function ModalHeader({ children, id }: { children: React.ReactNode; id?: string }) {
  return <div id={id} className="modal-shell-header" data-slot="header">{children}</div>;
};

/**
 * ModalShell.Body - Main content slot (scrollable, frame not skin)
 */
ModalShell.Body = function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="modal-shell-body" data-slot="body">{children}</div>;
};

/**
 * ModalShell.Actions - Footer actions slot (frame, not skin)
 */
ModalShell.Actions = function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="modal-shell-actions" data-slot="actions">{children}</div>;
};
