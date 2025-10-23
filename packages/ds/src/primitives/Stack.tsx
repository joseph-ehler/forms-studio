/**
 * Stack Component - Vertical Layout Primitive
 * 
 * Creates vertical spacing between child elements.
 * Uses CSS variables for theme-aware, consistent spacing.
 * 
 * Usage:
 *   <Stack spacing="normal">...</Stack>      // 24px (default)
 *   <Stack spacing="tight">...</Stack>       // 12px
 *   <Stack spacing="relaxed">...</Stack>     // 32px
 *   <Stack direction="row">...</Stack>       // Horizontal
 *   <Stack align="center">...</Stack>        // Centered items
 * 
 * Spacing (Beautiful by Default):
 * - tight: 12px (related items, compact)
 * - normal: 24px (default, beautiful)
 * - relaxed: 32px (section breaks, generous)
 */

import React from 'react'

type StackSpacing = 'tight' | 'normal' | 'relaxed'
type StackDirection = 'column' | 'row'
type StackAlign = 'start' | 'center' | 'end' | 'stretch'

interface StackProps {
  spacing?: StackSpacing
  direction?: StackDirection
  align?: StackAlign
  wrap?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Stack: React.FC<StackProps> = ({
  spacing = 'normal',
  direction = 'column',
  align = 'stretch',
  wrap = false,
  children,
  className = '',
  style = {},
}) => {
  // Map spacing values to tokens (explicit, no aliases)
  const gapValue = spacing === 'tight'
    ? 'var(--ds-space-3)'   // 12px - Related items
    : spacing === 'relaxed'
    ? 'var(--ds-space-8)'   // 32px - Section breaks
    : 'var(--ds-space-6)'   // 24px - Beautiful default (normal)
  
  const mergedStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    gap: gapValue,
    ...style,
  }
  
  return (
    <div 
      className={className}
      style={mergedStyle}
      data-stack-spacing={spacing}
      data-stack-direction={direction}
    >
      {children}
    </div>
  )
}
