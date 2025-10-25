/**
 * RoutePanel - Desktop-first persistent panel
 * 
 * Use for: filters, details, split views on desktop
 * Behavior: non-modal, keeps main area visible, deep-linkable
 * 
 * @example
 * <Route path="/products" element={
 *   <>
 *     <ProductList />
 *     {showFilters && (
 *       <RoutePanel ariaLabel="Filter products">
 *         <FilterForm />
 *       </RoutePanel>
 *     )}
 *   </>
 * } />
 */

import './route-panel.css';

import { FC, PropsWithChildren, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

export interface RoutePanelProps {
  /**
   * Accessible label for the panel
   * Required: describes panel purpose
   */
  ariaLabel: string;
  
  /**
   * Panel title (optional, shown in header)
   */
  title?: string;
  
  /**
   * Show close button (default: true)
   */
  showClose?: boolean;
  
  /**
   * Custom close handler (default: history.back())
   */
  onClose?: () => void;
  
  /**
   * Optional class name
   */
  className?: string;
  
  /**
   * Panel position (default: 'right')
   */
  position?: 'left' | 'right';
}

export const RoutePanel: FC<PropsWithChildren<RoutePanelProps>> = ({
  children,
  ariaLabel,
  title,
  showClose = true,
  onClose,
  className = '',
  position = 'right',
}) => {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLElement>(null);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1); // history.back()
    }
  };

  // Keyboard: Esc closes panel
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Store return focus element
  const returnFocusRef = useRef<HTMLElement | null>(
    typeof document !== 'undefined' ? document.activeElement as HTMLElement : null
  );

  // Auto-focus panel on mount (screen reader discoverability)
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.focus();
    }
  }, []);

  // Return focus on unmount
  useEffect(() => {
    return () => {
      if (returnFocusRef.current && typeof returnFocusRef.current.focus === 'function') {
        returnFocusRef.current.focus();
      }
    };
  }, []);

  return (
    <aside
      ref={panelRef}
      role="complementary"
      aria-label={ariaLabel}
      tabIndex={-1}
      className={`ds-route-panel ds-route-panel--${position} ${className}`.trim()}
    >
      {(title || showClose) && (
        <header className="ds-route-panel__header">
          {title && <h2 className="ds-route-panel__title ds-h4">{title}</h2>}
          {showClose && (
            <button
              type="button"
              className="ds-route-panel__close ds-icon-btn"
              onClick={handleClose}
              aria-label="Close panel"
            >
              ✕
            </button>
          )}
        </header>
      )}

      <div className="ds-route-panel__content">
        {children}
      </div>
    </aside>
  );
};

RoutePanel.displayName = 'RoutePanel';
