/**
 * Dashboard Recipe
 * 
 * Persistent Header + Sidenav + Main grid + optional Footer.
 * Classic app layout for dashboards, analytics, admin panels.
 */

import * as React from 'react';
import { AppShell, type AppShellProps } from '../macro/AppShell/AppShell';

export interface DashboardShellProps {
  /** Header content (logo, search, user menu) */
  header: React.ReactNode;
  /** Navigation content (menu items, sections) */
  nav: React.ReactNode;
  /** Main content (routed pages) */
  children: React.ReactNode;
  /** Footer content (optional) */
  footer?: React.ReactNode;
  /** Nav configuration */
  navConfig?: AppShellProps['nav'];
  /** Breakpoints override */
  breakpoints?: AppShellProps['breakpoints'];
}

/**
 * Dashboard Shell - Ready-to-use layout for dashboard apps
 * 
 * @example
 * ```tsx
 * <DashboardShell
 *   header={<MyNavbar />}
 *   nav={<MySidebar />}
 * >
 *   <DashboardContent />
 * </DashboardShell>
 * ```
 */
export function DashboardShell({
  header,
  nav,
  children,
  footer,
  navConfig,
  breakpoints,
}: DashboardShellProps) {
  return (
    <AppShell
      nav={{
        collapsible: true,
        defaultOpen: true,
        persistKey: 'dashboard-nav',
        ...navConfig,
      }}
      breakpoints={breakpoints}
    >
      <AppShell.Header>{header}</AppShell.Header>
      <AppShell.Nav>{nav}</AppShell.Nav>
      <AppShell.Main>{children}</AppShell.Main>
      {footer && <AppShell.Footer>{footer}</AppShell.Footer>}
    </AppShell>
  );
}
