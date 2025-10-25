import { Modal as FlowbiteModal, ModalProps as FlowbiteModalProps } from 'flowbite-react';
import { useCallback,useEffect, useRef } from 'react';

import { devAssert, isBrowser } from '../utils';

export type ModalProps = Omit<FlowbiteModalProps, 'show' | 'onClose'> & {
  /**
   * ARIA label for screen readers (REQUIRED)
   * Throws in dev mode if missing
   */
  ariaLabel: string;
  
  /**
   * Whether modal is open
   */
  open: boolean;
  
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  
  /**
   * Enable debug logging (overrides window.__DS_DEBUG)
   * @default false
   */
  debug?: boolean;
};

/**
 * Modal - Flowbite Modal with quality layer
 * 
 * Adds:
 * - Required ariaLabel (throws in dev if missing)
 * - Auto-focus first element
 * - Return focus on close
 * - Escape key handling
 * - Diagnostics (data-* attributes)
 * 
 * @example
 * ```tsx
 * const modal = useModal();
 * 
 * <Button onClick={modal.onOpen}>Create</Button>
 * <Modal ariaLabel="Create Item" {...modal.props}>
 *   <Modal.Header>Create Item</Modal.Header>
 *   <Modal.Body>
 *     <Field label="Name" id="name" required>
 *       <Input id="name" />
 *     </Field>
 *   </Modal.Body>
 * </Modal>
 * ```
 */
export function Modal({
  ariaLabel,
  open,
  onClose,
  debug,
  children,
  ...props
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Runtime contract (dev mode only)
  devAssert(ariaLabel, '[DS.Modal] ariaLabel is required for accessibility');

  // Debug logging (prop wins over global)
  useEffect(() => {
    const shouldDebug = debug ?? (isBrowser() && (window as any).__DS_DEBUG);
    if (shouldDebug) {
      console.log('[DS.Modal]', {
        ariaLabel,
        open,
        element: modalRef.current,
        zIndex: modalRef.current ? getComputedStyle(modalRef.current).zIndex : null,
      });
    }
  }, [ariaLabel, open, debug]);

  // Focus management
  useEffect(() => {
    if (!open) return;

    // Save previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element after a tick (let modal render)
    const timeoutId = setTimeout(() => {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 100);

    // Return focus on unmount
    return () => {
      clearTimeout(timeoutId);
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    };
  }, [open]);

  // Keyboard handling (Escape to close)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    if (!isBrowser()) return;
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={modalRef}
      data-component="modal"
      data-state={open ? 'open' : 'closed'}
      data-label={ariaLabel}
    >
      <FlowbiteModal
        show={open}
        onClose={onClose}
        dismissible
        {...props}
      >
        <div role="dialog" aria-label={ariaLabel} aria-modal="true">
          {children}
        </div>
      </FlowbiteModal>
    </div>
  );
}

// Re-export sub-components
Modal.Body = FlowbiteModal.Body;
Modal.Header = FlowbiteModal.Header;
Modal.Footer = FlowbiteModal.Footer;
