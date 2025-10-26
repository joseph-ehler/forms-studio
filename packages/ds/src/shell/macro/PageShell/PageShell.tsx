/**
 * PageShell - Page-Level Structure
 * 
 * Provides consistent page chrome (title, breadcrumbs, toolbar, content, footer)
 * inside AppShell.Main. Handles page-level responsive behaviors.
 */

import * as React from 'react';
import './PageShell.css';
import { useAppEnvironment } from '../../core';

export interface PageShellProps {
  /** Child slots */
  children: React.ReactNode;
  /** Page layout variant */
  layout?: 'default' | 'wide' | 'narrow';
  /** Make toolbar sticky on scroll */
  stickyToolbar?: boolean;
  /** Page gutter (padding) */
  gutter?: 'none' | 'compact' | 'default' | 'comfortable';
  /** Callback when layout state changes */
  onLayoutChange?: (state: PageLayoutState) => void;
}

export interface PageLayoutState {
  layout: 'default' | 'wide' | 'narrow';
  toolbarSticky: boolean;
  asideVisible: boolean;
  scrolled: boolean;
}

interface PageShellContextValue {
  layout: 'default' | 'wide' | 'narrow';
  gutter: string;
}

const PageShellContext = React.createContext<PageShellContextValue | null>(null);

/**
 * PageShell - Consistent page structure
 * 
 * Provides page-level chrome with slots for header, toolbar, content, aside, and footer.
 * Handles sticky toolbar, layout variants, and responsive gutter.
 */
export function PageShell({
  children,
  layout = 'default',
  stickyToolbar = false,
  gutter = 'default',
  onLayoutChange,
}: PageShellProps) {
  const env = useAppEnvironment();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [asideVisible, setAsideVisible] = React.useState(false);

  // Map gutter to CSS value
  const gutterMap = {
    none: '0px',
    compact: '16px',
    default: '24px',
    comfortable: '32px',
  };

  // Publish CSS variables
  React.useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    el.style.setProperty('--page-gutter', gutterMap[gutter]);

    // Adjust gutter for mobile
    if (env.mode === 'mobile') {
      el.style.setProperty('--page-gutter', '16px');
    }
  }, [gutter, env.mode]);

  // Track scroll for sticky toolbar
  React.useEffect(() => {
    if (!stickyToolbar || !containerRef.current) return;

    const el = containerRef.current;
    const handleScroll = () => {
      const isScrolled = el.scrollTop > 0;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [stickyToolbar, scrolled]);

  // Notify layout changes
  React.useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange({
        layout,
        toolbarSticky: stickyToolbar,
        asideVisible,
        scrolled,
      });
    }
  }, [layout, stickyToolbar, asideVisible, scrolled, onLayoutChange]);

  const contextValue = React.useMemo(
    () => ({ layout, gutter: gutterMap[gutter] }),
    [layout, gutter]
  );

  return (
    <PageShellContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="page-shell"
        data-page-layout={layout}
        data-toolbar-sticky={stickyToolbar}
        data-scrolled={scrolled}
      >
        {children}
      </div>
    </PageShellContext.Provider>
  );
}

/**
 * PageShell.PageHeader - Page title, breadcrumbs, actions
 */
function PageHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell-header" data-slot="page-header">
      {children}
    </div>
  );
}

/**
 * PageShell.Toolbar - Filters, search, view toggles
 */
function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell-toolbar" data-slot="toolbar">
      {children}
    </div>
  );
}

/**
 * PageShell.Content - Main page content
 */
function Content({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell-content" data-slot="content">
      {children}
    </div>
  );
}

/**
 * PageShell.PageAside - Secondary info rail (optional)
 */
function PageAside({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell-aside" data-slot="page-aside">
      {children}
    </div>
  );
}

/**
 * PageShell.PageFooter - Page-level actions, pagination
 */
function PageFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell-footer" data-slot="page-footer">
      {children}
    </div>
  );
}

// Attach slots
PageShell.PageHeader = PageHeader;
PageShell.Toolbar = Toolbar;
PageShell.Content = Content;
PageShell.PageAside = PageAside;
PageShell.PageFooter = PageFooter;

/**
 * Access page context from anywhere in PageShell
 */
export function usePageShell(): PageShellContextValue {
  const ctx = React.useContext(PageShellContext);
  if (!ctx) {
    throw new Error('usePageShell must be used within PageShell');
  }
  return ctx;
}
