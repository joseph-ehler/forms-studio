/**
 * AppShell - Headless Layout Coordinator
 * 
 * Owns macro structure (regions, responsive behavior, layout state).
 * Does NOT own component visuals (colors/typography) - that's your tokens + Flowbite.
 * 
 * Publishes CSS vars (--shell-*) and data-* attributes for adaptive UIs.
 * Slots: Header, Nav, Main, Panels, Dock, Footer.
 */

import * as React from 'react';
import { useAppEnvironment, type Breakpoints, type DensityLevel } from '../../core';
import { setUnderlayRoot } from '../../behavior/overlay-policy';
import { GlobalProgressBar } from './GlobalProgressBar';
import './AppShell.css';

export interface NavConfig {
  /** Can nav be collapsed? */
  collapsible?: boolean;
  /** Is nav open by default? */
  defaultOpen?: boolean;
  /** Nav width in pixels */
  width?: number;
  /** LocalStorage key for persistence */
  persistKey?: string;
}

export interface PanelsConfig {
  /** Which side do panels appear? */
  side?: 'left' | 'right';
  /** Panel width in pixels */
  width?: number;
  /** Overlay on these modes (vs inline) */
  overlayOn?: Array<'mobile' | 'tablet'>;
}

export interface DockConfig {
  /** Dock position */
  position?: 'bottom' | 'left' | 'right';
  /** Visibility per mode */
  visible?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  };
  /** Dock height (for bottom) or width (for sides) */
  size?: number;
}

export interface HeaderConfig {
  /** Header height in pixels */
  height?: number;
  /** Sticky header? */
  sticky?: boolean;
}

export interface AppShellProps {
  children: React.ReactNode;
  nav?: NavConfig;
  panels?: PanelsConfig;
  dock?: DockConfig;
  header?: HeaderConfig;
  breakpoints?: Breakpoints;
  density?: DensityLevel;
  /** Callback when layout state changes */
  onLayoutChange?: (state: LayoutState) => void;
}

export interface LayoutState {
  mode: 'mobile' | 'tablet' | 'desktop';
  navOpen: boolean;
  activePanels: string[];
}

/**
 * AppShell - Headless layout frame with slots
 * 
 * @example
 * ```tsx
 * <AppShell
 *   nav={{ collapsible: true, defaultOpen: true }}
 *   panels={{ side: 'right', overlayOn: ['tablet', 'mobile'] }}
 *   dock={{ position: 'bottom', visible: { mobile: true } }}
 * >
 *   <AppShell.Header>
 *     <DSNavbar />
 *   </AppShell.Header>
 *   <AppShell.Nav>
 *     <DSSidebar />
 *   </AppShell.Nav>
 *   <AppShell.Main>
 *     <Outlet />
 *   </AppShell.Main>
 * </AppShell>
 * ```
 */
export function AppShell({
  children,
  nav,
  panels,
  dock,
  header,
  breakpoints,
  density: densityOverride,
  onLayoutChange,
}: AppShellProps) {
  const env = useAppEnvironment(breakpoints, densityOverride);
  const mainRef = React.useRef<HTMLElement>(null);

  // Set underlay root for safe inert targeting
  React.useEffect(() => {
    if (mainRef.current) {
      setUnderlayRoot(mainRef.current);
    }
    return () => setUnderlayRoot(null);
  }, []);

  // Nav state (collapsible/open)
  const [navOpen, setNavOpen] = React.useState(() => {
    if (!nav?.collapsible) return true;
    if (nav.persistKey && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(nav.persistKey);
      if (stored !== null) return stored === 'true';
    }
    return nav.defaultOpen ?? true;
  });

  // Persist nav state
  React.useEffect(() => {
    if (nav?.persistKey && typeof localStorage !== 'undefined') {
      localStorage.setItem(nav.persistKey, String(navOpen));
    }
  }, [navOpen, nav?.persistKey]);

  // Computed sizing
  const navWidth = nav?.width ?? 280;
  const panelWidth = panels?.width ?? 360;
  const headerHeight = header?.height ?? 56;
  
  // Dock size based on visibility and position
  const dockVisible =
    dock?.visible?.mobile === true && env.mode === 'mobile' ||
    dock?.visible?.tablet === true && env.mode === 'tablet' ||
    dock?.visible?.desktop === true && env.mode === 'desktop';
  const dockSize = dockVisible ? (dock?.size ?? 56) : 0;

  // Publish CSS vars and data-* attributes
  React.useEffect(() => {
    const root = document.documentElement;
    
    // Data attributes
    root.setAttribute('data-shell-mode', env.mode);
    root.setAttribute('data-pointer', env.pointer);
    root.setAttribute('data-density', env.density);
    root.setAttribute('data-nav-open', String(navOpen));
    
    // CSS variables
    root.style.setProperty('--shell-nav-w', `${navWidth}px`);
    root.style.setProperty('--shell-panels-w', `${panelWidth}px`);
    root.style.setProperty('--shell-header-h', `${headerHeight}px`);
    root.style.setProperty('--shell-dock-size', `${dockSize}px`);
    root.style.setProperty('--shell-safe-top', `${env.safeArea.top}px`);
    root.style.setProperty('--shell-safe-bottom', `${env.safeArea.bottom}px`);
    root.style.setProperty('--shell-safe-left', `${env.safeArea.left}px`);
    root.style.setProperty('--shell-safe-right', `${env.safeArea.right}px`);
    
    return () => {
      // Cleanup on unmount
      root.removeAttribute('data-shell-mode');
      root.removeAttribute('data-pointer');
      root.removeAttribute('data-density');
      root.removeAttribute('data-nav-open');
      root.style.removeProperty('--shell-nav-w');
      root.style.removeProperty('--shell-panels-w');
      root.style.removeProperty('--shell-header-h');
      root.style.removeProperty('--shell-dock-size');
      root.style.removeProperty('--shell-safe-top');
      root.style.removeProperty('--shell-safe-bottom');
      root.style.removeProperty('--shell-safe-left');
      root.style.removeProperty('--shell-safe-right');
    };
  }, [
    env.mode,
    env.pointer,
    env.density,
    env.safeArea,
    navOpen,
    navWidth,
    panelWidth,
    headerHeight,
    dockSize,
  ]);

  // Notify layout changes
  React.useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange({
        mode: env.mode,
        navOpen,
        activePanels: [], // TODO: track active panels
      });
    }
  }, [env.mode, navOpen, onLayoutChange]);

  // Provide nav toggle context
  const navContext = React.useMemo(
    () => ({ open: navOpen, toggle: () => setNavOpen((prev) => !prev) }),
    [navOpen]
  );

  return (
    <NavContext.Provider value={navContext}>
      {/* Global loading progress bar */}
      <GlobalProgressBar />
      
      <div className="app-shell" data-dock-position={dock?.position ?? 'bottom'}>
        {React.Children.map(children, (child) => {
          // Pass mainRef to AppShell.Main
          if (React.isValidElement(child) && child.type === AppShell.Main) {
            return React.cloneElement(child, { ref: mainRef } as any);
          }
          return child;
        })}
      </div>
    </NavContext.Provider>
  );
}

// ============================================
// SLOTS (Headless Frames)
// ============================================

AppShell.Header = function Header({ children }: { children: React.ReactNode }) {
  return (
    <header data-slot="header" className="app-shell-header">
      {children}
    </header>
  );
};

AppShell.Nav = function Nav({ children }: { children: React.ReactNode }) {
  return (
    <aside data-slot="nav" className="app-shell-nav">
      {children}
    </aside>
  );
};

AppShell.Main = React.forwardRef<HTMLElement, { children: React.ReactNode }>(function Main({ children }, ref) {
  return (
    <main ref={ref} id="app-main" data-slot="main" data-cq="main" className="app-shell-main">
      {children}
    </main>
  );
});

AppShell.Panels = function Panels({ children }: { children: React.ReactNode }) {
  return (
    <section data-slot="panels" className="app-shell-panels">
      {children}
    </section>
  );
};

AppShell.Dock = function Dock({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="dock" className="app-shell-dock">
      {children}
    </div>
  );
};

AppShell.Footer = function Footer({ children }: { children: React.ReactNode }) {
  return (
    <footer data-slot="footer" className="app-shell-footer">
      {children}
    </footer>
  );
};

// ============================================
// CONTEXT (Nav State)
// ============================================

interface NavContextValue {
  open: boolean;
  toggle: () => void;
}

const NavContext = React.createContext<NavContextValue | null>(null);

/**
 * Access nav state (open/toggle) from anywhere in the shell
 * 
 * @example
 * ```tsx
 * const { open, toggle } = useNav();
 * <button onClick={toggle}>Toggle Nav</button>
 * ```
 */
export function useNav(): NavContextValue {
  const ctx = React.useContext(NavContext);
  if (!ctx) {
    throw new Error('useNav must be used within AppShell');
  }
  return ctx;
}
