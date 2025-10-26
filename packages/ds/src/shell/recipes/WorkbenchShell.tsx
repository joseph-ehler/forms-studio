/**
 * Workbench Recipe
 * 
 * Header + collapsible Nav + split Main (List|Detail) + right Panels.
 * For content-heavy apps: email, project management, file browsers.
 */

import * as React from 'react';
import { AppShell, type AppShellProps } from '../macro/AppShell/AppShell';

export interface WorkbenchShellProps {
  /** Header content */
  header: React.ReactNode;
  /** Navigation content */
  nav: React.ReactNode;
  /** Main content (routed pages, handles split internally) */
  children: React.ReactNode;
  /** Right panels content (inspector, properties, AI assist) */
  panels?: React.ReactNode;
  /** Nav configuration */
  navConfig?: AppShellProps['nav'];
  /** Panels configuration */
  panelsConfig?: AppShellProps['panels'];
  /** Breakpoints override */
  breakpoints?: AppShellProps['breakpoints'];
}

/**
 * Workbench Shell - For apps with list/detail splits and inspectors
 * 
 * @example
 * ```tsx
 * <WorkbenchShell
 *   header={<Toolbar />}
 *   nav={<ProjectTree />}
 *   panels={<Inspector />}
 * >
 *   <SplitView left={<FileList />} right={<FileDetail />} />
 * </WorkbenchShell>
 * ```
 */
export function WorkbenchShell({
  header,
  nav,
  children,
  panels,
  navConfig,
  panelsConfig,
  breakpoints,
}: WorkbenchShellProps) {
  return (
    <AppShell
      nav={{
        collapsible: true,
        defaultOpen: true,
        persistKey: 'workbench-nav',
        ...navConfig,
      }}
      panels={{
        side: 'right',
        overlayOn: ['mobile', 'tablet'],
        ...panelsConfig,
      }}
      breakpoints={breakpoints}
    >
      <AppShell.Header>{header}</AppShell.Header>
      <AppShell.Nav>{nav}</AppShell.Nav>
      <AppShell.Main>{children}</AppShell.Main>
      {panels && <AppShell.Panels>{panels}</AppShell.Panels>}
    </AppShell>
  );
}
