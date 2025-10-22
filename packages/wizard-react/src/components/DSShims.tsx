/**
 * Design System Shims
 * 
 * Compatibility layer for codemod output.
 * Maps Stack/Flex/Grid/Section → FormStack/FormGrid/FormSection
 * 
 * Mobile-first, token-driven, zero duplication.
 * Later: can refactor to use FormStack directly.
 */

import * as React from 'react'
import { Stack as StackPrimitive } from './Stack'
import { Grid as GridPrimitive } from './Grid'

// Map short spacing tokens to DS tokens
const SPACING_MAP = {
  xs: 'tight',
  sm: 'tight', 
  md: 'normal',
  lg: 'relaxed',
  xl: 'relaxed',
  '2xl': 'relaxed',
} as const

/**
 * Stack - Vertical spacing wrapper
 * Maps to FormStack with normalized spacing
 */
type StackProps = {
  spacing?: keyof typeof SPACING_MAP | 'tight' | 'normal' | 'relaxed'
  children: React.ReactNode
  className?: string
}

export function Stack({ spacing = 'sm', children, className }: StackProps) {
  const mappedSpacing = spacing in SPACING_MAP 
    ? SPACING_MAP[spacing as keyof typeof SPACING_MAP]
    : spacing
  
  return (
    <StackPrimitive 
      spacing={mappedSpacing as 'tight' | 'normal' | 'relaxed'} 
      className={className}
    >
      {children}
    </StackPrimitive>
  )
}

/**
 * Flex - Horizontal/row layout wrapper
 * Maps to FormStack with direction="row"
 */
type FlexProps = {
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: keyof typeof SPACING_MAP
  spacing?: keyof typeof SPACING_MAP
  children: React.ReactNode
  className?: string
}

export function Flex({ 
  align, 
  justify, 
  wrap, 
  gap = 'sm',
  spacing,
  children, 
  className 
}: FlexProps) {
  const effectiveSpacing = spacing || gap
  const mappedSpacing = effectiveSpacing in SPACING_MAP
    ? SPACING_MAP[effectiveSpacing as keyof typeof SPACING_MAP]
    : effectiveSpacing
  
  // For now, just use a div with flex classes
  // FormStack doesn't support row direction yet
  const flexClass = `flex ${align ? `items-${align}` : ''} ${justify ? `justify-${justify}` : ''} ${wrap ? 'flex-wrap' : ''} gap-${mappedSpacing === 'tight' ? '2' : mappedSpacing === 'normal' ? '4' : '6'}`
  
  return (
    <div className={`${flexClass} ${className || ''}`.trim()}>
      {children}
    </div>
  )
}

/**
 * Grid - Grid layout wrapper
 * Maps to FormGrid
 */
type GridProps = {
  columns?: number
  cols?: number
  gap?: keyof typeof SPACING_MAP
  children: React.ReactNode
  className?: string
}

export function Grid({ 
  columns, 
  cols,
  gap = 'md', 
  children, 
  className 
}: GridProps) {
  // Convert to FormGrid columns type (1, 2, 3, or 4)
  let effectiveColumns: 1 | 2 | 3 | 4 = 2 // default

  if (typeof columns === 'number') {
    effectiveColumns = Math.min(Math.max(columns, 1), 4) as 1 | 2 | 3 | 4
  } else if (typeof columns === 'string') {
    // Parse responsive strings like "1" "2" "3" "4" or "auto"
    if (columns === 'auto') effectiveColumns = 2
    else effectiveColumns = parseInt(columns, 10) as 1 | 2 | 3 | 4
  } else if (cols) {
    effectiveColumns = Math.min(Math.max(cols, 1), 4) as 1 | 2 | 3 | 4
  }

  return (
    <GridPrimitive 
      columns={effectiveColumns} 
      className={className}
    >
      {children}
    </GridPrimitive>
  )
}

/**
 * Section - REMOVED
 * FormSection component was deleted for later reimplementation.
 * Use FormStack or div for now.
 */
export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
