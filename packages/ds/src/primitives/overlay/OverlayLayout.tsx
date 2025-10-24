/**
 * Overlay Layout Components
 * 
 * Composable layout atoms for overlay content structure.
 * These handle sticky positioning, scrolling, and spacing.
 * Used by all overlay recipes (selects, dates, commands, etc.)
 */

import React from 'react';

/* ===== OverlayHeader ===== */

export interface OverlayHeaderProps {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export const OverlayHeader: React.FC<OverlayHeaderProps> = ({ 
  children, 
  sticky = true,
  className = ''
}) => (
  <header
    className={`ds-overlay-header ${className}`.trim()}
    style={{
      position: sticky ? 'sticky' : 'relative',
      top: 0,
      zIndex: 10,
      background: 'var(--ds-color-surface-base)',
      borderBottom: '1px solid var(--ds-color-border-subtle)',
      padding: 'var(--ds-space-3, 12px) var(--ds-space-4, 16px)'
    }}
  >
    {children}
  </header>
);

/* ===== OverlayContent ===== */

export interface OverlayContentProps {
  children: React.ReactNode;
  className?: string;
}

export const OverlayContent: React.FC<OverlayContentProps> = ({ 
  children,
  className = ''
}) => (
  <section
    className={`ds-overlay-content ${className}`.trim()}
    style={{
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      // Smooth scrolling
      scrollBehavior: 'smooth',
      // Better scroll performance
      WebkitOverflowScrolling: 'touch'
    }}
  >
    {children}
  </section>
);

/* ===== OverlayFooter ===== */

export interface OverlayFooterProps {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export const OverlayFooter: React.FC<OverlayFooterProps> = ({ 
  children,
  sticky = true,
  className = ''
}) => (
  <footer
    className={`ds-overlay-footer ${className}`.trim()}
    style={{
      position: sticky ? 'sticky' : 'relative',
      bottom: 0,
      zIndex: 10,
      background: 'var(--ds-color-surface-base)',
      borderTop: '1px solid var(--ds-color-border-subtle)',
      padding: 'var(--ds-space-3, 12px) var(--ds-space-4, 16px)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--ds-space-2, 8px)'
    }}
  >
    {children}
  </footer>
);

/* ===== OverlayList ===== */

export interface OverlayListProps {
  children: React.ReactNode;
  role?: 'listbox' | 'menu' | 'list';
  'aria-label'?: string;
  className?: string;
}

export const OverlayList: React.FC<OverlayListProps> = ({ 
  children,
  role = 'listbox',
  'aria-label': ariaLabel,
  className = ''
}) => (
  <div
    role={role}
    aria-label={ariaLabel}
    className={`ds-option-list ${className}`.trim()}
  >
    {children}
  </div>
);

/* ===== OverlayGrid ===== */

export interface OverlayGridProps {
  children: React.ReactNode;
  columns?: number;
  role?: 'grid' | 'list';
  className?: string;
}

export const OverlayGrid: React.FC<OverlayGridProps> = ({ 
  children,
  columns = 6,
  role = 'grid',
  className = ''
}) => (
  <div
    role={role}
    className={className}
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 'var(--ds-space-2, 8px)',
      padding: 'var(--ds-space-3, 12px)'
    }}
  >
    {children}
  </div>
);
