/**
 * Spacer Component - Explicit Spacing Element
 * 
 * Creates explicit vertical or horizontal space.
 * More semantic than margin utilities.
 * 
 * Usage:
 *   <Spacer size="4" />
 *   <Spacer size="8" orientation="horizontal" />
 * 
 * Use when you need explicit spacing between elements
 * rather than relying on margin/padding.
 */

import React from 'react'

type SpaceSize = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24'
type Orientation = 'vertical' | 'horizontal'

interface SpacerProps {
  size?: SpaceSize
  orientation?: Orientation
  className?: string
}

export const Spacer: React.FC<SpacerProps> = ({
  size = '6',  // Beautiful default: 24px
  orientation = 'vertical',
  className = '',
}) => {
  const isVertical = orientation === 'vertical'
  
  const style: React.CSSProperties = isVertical
    ? { height: `var(--ds-space-${size})`, width: '100%' }
    : { width: `var(--ds-space-${size})`, height: '100%' }
  
  return (
    <div 
      className={className}
      style={style}
      aria-hidden="true"
    />
  )
}
