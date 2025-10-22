/**
 * Body Component - Content/UI Text
 * 
 * For paragraphs, UI text, and general content in any context.
 * Supports semantic color variants.
 * 
 * Usage:
 *   <Body>Regular paragraph text</Body>
 *   <Body size="lg">Lead paragraph</Body>
 *   <Body size="sm" variant="secondary">Helper text</Body>
 * 
 * Sizes:
 *   - xl: 20px (Lead paragraphs)
 *   - lg: 18px (Large content)
 *   - md: 16px (Default)
 *   - sm: 14px (Dense UIs)
 *   - xs: 12px (Captions)
 * 
 * Variants:
 *   - primary: Main text color
 *   - secondary: Less emphasized
 *   - muted: De-emphasized
 *   - info/success/warning/danger: State colors
 */

import React from 'react'

interface BodyProps {
  size?: 'xl' | 'lg' | 'md' | 'sm' | 'xs'
  variant?: 'primary' | 'secondary' | 'muted' | 'info' | 'success' | 'warning' | 'danger'
  children: React.ReactNode
  className?: string
  as?: 'p' | 'span' | 'div'
}

const SIZE_CLASS_MAP = {
  'xl': 'ds-body-xl',
  'lg': 'ds-body-lg',
  'md': 'ds-body-md',
  'sm': 'ds-body-sm',
  'xs': 'ds-body-xs',
}

const VARIANT_CLASS_MAP = {
  'primary': 'ds-text-primary',
  'secondary': 'ds-text-secondary',
  'muted': 'ds-text-muted',
  'info': 'ds-text-info',
  'success': 'ds-text-success',
  'warning': 'ds-text-warning',
  'danger': 'ds-text-danger',
}

export const Body: React.FC<BodyProps> = ({
  size = 'md',
  variant = 'primary',
  children,
  className = '',
  as: Component = 'p',
}) => {
  return (
    <Component className={`${SIZE_CLASS_MAP[size]} ${VARIANT_CLASS_MAP[variant]} ${className}`}>
      {children}
    </Component>
  )
}
