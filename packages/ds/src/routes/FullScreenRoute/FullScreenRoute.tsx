/**
 * FullScreenRoute - Macro-level navigation for focused tasks
 * 
 * Use for: checkout, onboarding, complex setup wizards
 * Behavior: fills viewport, modal-like, guards unsaved changes
 * 
 * @example
 * <Route path="/checkout" element={
 *   <FullScreenRoute ariaLabel="Checkout">
 *     <CheckoutFlow />
 *   </FullScreenRoute>
 * } />
 */

import { FC, PropsWithChildren, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import './full-screen-route.css';

export interface FullScreenRouteProps {
  /**
   * Accessible label for the route dialog
   * Required: each full-screen route must have unique, descriptive label
   */
  ariaLabel: string;
  
  /**
   * Guard unsaved changes
   * Return false to prevent navigation
   */
  onBeforeExit?: () => Promise<boolean> | boolean;
  
  /**
   * Optional class name for custom styling
   */
  className?: string;
  
  /**
   * Return focus element (default: previous activeElement)
   */
  returnFocusTo?: HTMLElement | null;
}

export const FullScreenRoute: FC<PropsWithChildren<FullScreenRouteProps>> = ({
  children,
  ariaLabel,
  onBeforeExit,
  className = '',
  returnFocusTo,
}) => {
  const loc = useLocation();
  const containerRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(
    returnFocusTo ?? (typeof document !== 'undefined' ? document.activeElement as HTMLElement : null)
  );

  // Focus trap
  useFocusTrap(containerRef, { enabled: true });

  // Focus container on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
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

  useEffect(() => {
    const onPop = async (e: PopStateEvent) => {
      if (onBeforeExit) {
        const canExit = await onBeforeExit();
        if (!canExit) {
          // Block navigation, restore state
          window.history.pushState(null, '', loc.pathname + loc.search);
          e.preventDefault();
          return;
        }
      }
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [onBeforeExit, loc]);

  // Keyboard: Esc triggers back (desktop pattern)
  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onBeforeExit) {
          const canExit = await onBeforeExit();
          if (!canExit) return;
        }
        window.history.back();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBeforeExit]);

  // Check reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches 
    : false;

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        ref={containerRef}
        role="dialog"
        aria-label={ariaLabel}
        aria-modal="true"
        tabIndex={-1}
        className={`ds-fullscreen-route ${className}`.trim()}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.aside>
    </AnimatePresence>
  );
};

FullScreenRoute.displayName = 'FullScreenRoute';
