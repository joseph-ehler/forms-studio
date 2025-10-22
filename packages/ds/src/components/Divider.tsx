/**
 * Divider Component - Visual Separator
 * 
 * Creates a subtle border line for visual separation.
 * Flat design philosophy - borders, not shadows!
 * 
 * Usage:
 *   <Divider />
 *   <Divider spacing="lg" />
 *   <Divider orientation="vertical" />
 * 
 * Spacing adds margin above/below (or left/right for vertical).
 * 100% theme-aware (border color adapts to light/dark).
 */

import React from 'react'

type Orientation = 'horizontal' | 'vertical'
type Spacing = 'none' | 'sm' | 'md' | 'lg' | 'xl'

interface DividerProps {
  orientation?: Orientation
  spacing?: Spacing
  className?: string
}

const SPACING_MAP = {
  none: '0',
  sm: '2',    // 8px
  md: '4',    // 16px
  lg: '6',    // 24px
  xl: '8',    // 32px
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
}) => {
  const isHorizontal = orientation === 'horizontal'
  
  const classes = [
    // Border (theme-aware color)
    isHorizontal ? 'ds-border-b' : 'ds-border-r',
    
    // Spacing
    isHorizontal 
      ? `ds-my-${SPACING_MAP[spacing]}`
      : `ds-mx-${SPACING_MAP[spacing]}`,
    
    // Size
    isHorizontal ? 'w-full' : 'h-full',
    
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <div 
      className={classes}
      role="separator"
      aria-orientation={orientation}
    />
  )
}
