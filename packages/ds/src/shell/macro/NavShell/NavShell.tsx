/**
 * NavShell - Navigation Coordinator
 * 
 * Thin adapter that wraps Flowbite Sidebar (or any nav content)
 * and coordinates open/collapse/overlay behaviors.
 * 
 * Used inside AppShell.Nav slot.
 */

import * as React from 'react';
import './NavShell.css';
import { useNav } from '../AppShell/AppShell';
import { useAppEnvironment } from '../../core';

export interface NavShellProps {
  /** Navigation content (Flowbite Sidebar, custom menu, etc.) */
  children: React.ReactNode;
  /** Optional header (logo, title, close button) */
  header?: React.ReactNode;
  /** Optional footer (user profile, settings link) */
  footer?: React.ReactNode;
  /** Width when expanded */
  width?: number;
  /** Custom className */
  className?: string;
}

/**
 * NavShell - Wraps navigation content with coordinator behaviors
 * 
 * Automatically:
 * - Reads nav state from AppShell (useNav hook)
 * - Adapts to mode (persistent vs off-canvas)
 * - Handles backdrop/overlay on mobile/tablet
 * - Provides slots for header/body/footer
 * 
 * Usage:
 * ```tsx
 * <AppShell>
 *   <AppShell.Nav>
 *     <NavShell>
 *       <Sidebar>
 *         <Sidebar.Items>
 *           <Sidebar.Item href="/">Home</Sidebar.Item>
 *         </Sidebar.Items>
 *       </Sidebar>
 *     </NavShell>
 *   </AppShell.Nav>
 * </AppShell>
 * ```
 */
export function NavShell({
  children,
  header,
  footer,
  width = 280,
  className = '',
}: NavShellProps) {
  const { open, toggle } = useNav();
  const env = useAppEnvironment();
  const navRef = React.useRef<HTMLDivElement>(null);

  // Publish width as CSS var
  React.useEffect(() => {
    if (!navRef.current) return;
    navRef.current.style.setProperty('--nav-shell-w', `${width}px`);
  }, [width]);

  // Handle ESC key to close nav (mobile/tablet only)
  React.useEffect(() => {
    if (env.mode === 'desktop') return;
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggle();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, env.mode, toggle]);

  return (
    <div
      ref={navRef}
      className={`nav-shell ${className}`}
      data-nav-open={open}
      data-shell-mode={env.mode}
      aria-label="Main navigation"
      role="navigation"
    >
      {header && (
        <div className="nav-shell-header" data-slot="nav-header">
          {header}
        </div>
      )}

      <div className="nav-shell-body" data-slot="nav-body">
        {children}
      </div>

      {footer && (
        <div className="nav-shell-footer" data-slot="nav-footer">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * NavShell.NavHeader - Optional header slot
 */
NavShell.NavHeader = function NavHeader({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};

/**
 * NavShell.NavBody - Main navigation content
 */
NavShell.NavBody = function NavBody({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};

/**
 * NavShell.NavFooter - Optional footer slot
 */
NavShell.NavFooter = function NavFooter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};
