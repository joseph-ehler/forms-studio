/**
 * Box Component - Universal Layout Primitive
 * 
 * The most flexible surface primitive. Use for any container that needs spacing,
 * backgrounds, or borders. 100% flat by default.
 * 
 * Usage:
 *   <Box p="4" bg="base">Content</Box>
 *   <Box p="6" border rounded="md">Card-like</Box>
 *   <Box p="4" glass>Frosted glass effect</Box>
 * 
 * Philosophy: FLAT FIRST
 * - No shadows (use borders for separation)
 * - Optional glass variant for special cases
 * - 100% theme-aware (light/dark)
 */

import React from 'react'

type SpaceScale = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24'
type RadiusScale = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
type Background = 'base' | 'subtle' | 'raised' | 'glass'

interface BoxProps {
  // Spacing
  p?: SpaceScale    // Padding all sides
  px?: SpaceScale   // Padding horizontal
  py?: SpaceScale   // Padding vertical
  m?: SpaceScale    // Margin all sides
  mx?: SpaceScale   // Margin horizontal
  my?: SpaceScale   // Margin vertical
  
  // Background
  bg?: Background
  glass?: boolean   // Frosted glass effect
  
  // Borders
  border?: boolean
  borderTop?: boolean
  borderBottom?: boolean
  rounded?: RadiusScale
  
  // Layout
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'aside' | 'main'
}

export const Box: React.FC<BoxProps> = ({
  p, px, py,
  m, mx, my,
  bg,
  glass,
  border,
  borderTop,
  borderBottom,
  rounded = 'none',
  children,
  className = '',
  as: Component = 'div',
}) => {
  const classes = [
    // Padding
    p && `ds-p-${p}`,
    px && `ds-px-${px}`,
    py && `ds-py-${py}`,
    
    // Margin
    m && `ds-m-${m}`,
    mx && `ds-mx-${mx}`,
    my && `ds-my-${my}`,
    
    // Background
    glass ? 'ds-bg-glass' : bg && `ds-bg-${bg}`,
    
    // Borders (flat design uses borders, not shadows!)
    border && 'ds-border',
    borderTop && 'ds-border-t',
    borderBottom && 'ds-border-b',
    
    // Radius
    rounded !== 'none' && `ds-rounded-${rounded}`,
    
    // Always flat (no shadow)
    'ds-shadow-none',
    
    // Custom classes
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <Component className={classes}>
      {children}
    </Component>
  )
}
