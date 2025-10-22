/**
 * Grid Component - Responsive Grid Layout
 * 
 * Creates responsive grid layout with automatic mobile stacking.
 * Pure CSS - no Tailwind dependency.
 * 
 * Usage:
 *   <Grid columns={2}>...</Grid>
 *   <Grid columns={3} gap="lg">...</Grid>
 * 
 * Columns:
 * - 1: Full width
 * - 2: Half (mobile: stack, tablet: 2 cols)
 * - 3: Thirds (mobile: stack, tablet: 2, desktop: 3)
 * - 4: Quarters (mobile: stack, tablet: 2, desktop: 4)
 * 
 * Gap:
 * - sm: 12px
 * - md: 16px (default)
 * - lg: 24px
 */

import React from 'react'
import './ds-grid.css'

interface GridProps {
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export const Grid: React.FC<GridProps> = ({
  columns = 2,
  gap = 'md',
  children,
  className = '',
}) => {
  // Build CSS classes (pure CSS, no Tailwind)
  const gridClasses = [
    'ds-grid',
    // Responsive column classes
    columns > 1 && `ds-grid--${columns}`,
    // Gap variants
    gap !== 'md' && `ds-grid--gap-${gap}`,
    // Custom classes
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}
