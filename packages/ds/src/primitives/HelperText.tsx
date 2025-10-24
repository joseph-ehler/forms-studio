/**
 * FormHelperText Component (Standalone)
 * 
 * Simple helper text with variants for different states.
 */

import React from 'react'
import '../styles/components/ds-typography.css'

interface FormHelperTextProps {
  variant?: 'default' | 'error' | 'success' | 'warning'
  children: React.ReactNode
  className?: string
}

export const HelperText: React.FC<FormHelperTextProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const variantClass = variant === 'default' ? 'ds-helper--hint' : `ds-helper--${variant}`;
  
  return (
    <span className={`ds-helper ds-helper--sm ${variantClass} ${className}`}>
      {children}
    </span>
  )
}
