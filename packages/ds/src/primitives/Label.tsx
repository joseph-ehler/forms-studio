/**
 * FormLabel Component (Standalone)
 * 
 * Simple form label component.
 */

import React from 'react'
import '../styles/components/ds-typography.css'

interface FormLabelProps {
  htmlFor?: string
  children: React.ReactNode
  className?: string
  required?: boolean
}

export const Label: React.FC<FormLabelProps> = ({
  htmlFor,
  children,
  className = '',
  required = false,
}) => {
  return (
    <label htmlFor={htmlFor} className={`ds-label ${className}`}>
      {children}
      {required && <span className="ds-label__req" aria-label="required">*</span>}
    </label>
  )
}
