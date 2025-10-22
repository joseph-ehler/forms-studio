/**
 * Card Component - Flat Surface for Content
 * 
 * Pre-configured Box for card-like layouts. FLAT by default (no shadow!).
 * Uses subtle background and border for separation.
 * 
 * Usage:
 *   <Card>Content</Card>
 *   <Card padding="lg">More padding</Card>
 *   <Card glass>Frosted glass card</Card>
 * 
 * Philosophy: FLAT FIRST
 * - Subtle background (not white on white)
 * - Border for definition (not shadow)
 * - Optional glass variant
 * - 100% theme-aware
 */

import React from 'react'

type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'
type CardVariant = 'default' | 'glass'
type CardBackground = 'base' | 'subtle' | 'elevated' | 'transparent'

interface CardProps {
  padding?: CardPadding
  variant?: CardVariant
  bg?: CardBackground
  border?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const PADDING_MAP = {
  none: '0',
  sm: '3',    // 12px - Compact
  md: '4',    // 16px - Tight
  lg: '6',    // 24px - Beautiful default
  xl: '8',    // 32px - Generous
} as const

const BG_TOKEN_MAP: Record<CardBackground, string> = {
  base: 'var(--ds-color-surface-base)',
  subtle: 'var(--ds-color-surface-subtle)',
  elevated: 'var(--ds-color-surface-raised)',
  transparent: 'transparent',
}

export const Card: React.FC<CardProps> = ({
  padding = 'lg',  // Beautiful default: 24px
  variant = 'default',
  bg,
  border = true,
  children,
  className = '',
  style,
}) => {
  const isGlass = variant === 'glass'
  
  // Background: glass > explicit bg > semantic default (subtle)
  const background = isGlass 
    ? 'var(--ds-color-surface-glass)'
    : bg 
      ? BG_TOKEN_MAP[bg]
      : BG_TOKEN_MAP.subtle
  
  const classes = [
    // Padding
    `ds-p-${PADDING_MAP[padding]}`,
    
    // Border (primary separator in flat design)
    border && 'ds-border',
    
    // Rounded corners
    'ds-rounded-lg',
    
    // NO SHADOW (flat design!)
    'ds-shadow-none',
    
    // Custom classes
    className,
  ].filter(Boolean).join(' ')
  
  const inlineStyles: React.CSSProperties = {
    background,
    backdropFilter: isGlass ? 'blur(12px)' : undefined,
    ...style,
  }
  
  return (
    <div className={classes} style={inlineStyles} data-ds-role="region">
      {children}
    </div>
  )
}
