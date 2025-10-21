/**
 * FormText Component
 * 
 * Body text with size and color variants.
 * 
 * Sizes:
 * - xs: 12px
 * - sm: 14px
 * - base: 16px (default)
 * - lg: 18px
 * - xl: 20px
 * 
 * Variants:
 * - body: Standard text (gray-900)
 * - muted: Lighter text (gray-600)
 * - subtle: Very light (gray-500)
 * - error: Error message (red-600)
 * - success: Success message (green-600)
 * - warning: Warning message (yellow-700)
 */

import React from 'react'

interface FormTextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  variant?: 'body' | 'muted' | 'subtle' | 'error' | 'success' | 'warning'
  children: React.ReactNode
  className?: string
  as?: 'p' | 'span' | 'div'
}

const SIZE_MAP = {
  xs: 'text-xs',     // 12px
  sm: 'text-sm',     // 14px
  base: 'text-base', // 16px
  lg: 'text-lg',     // 18px
  xl: 'text-xl'      // 20px
}

const VARIANT_MAP = {
  body: 'text-gray-900',
  muted: 'text-gray-600',
  subtle: 'text-gray-500',
  error: 'text-red-600',
  success: 'text-green-600',
  warning: 'text-yellow-700'
}

export const FormText: React.FC<FormTextProps> = ({
  size = 'base',
  variant = 'body',
  children,
  className = '',
  as: Component = 'p',
}) => {
  return (
    <Component className={`${SIZE_MAP[size]} ${VARIANT_MAP[variant]} ${className}`}>
      {children}
    </Component>
  )
}
