/**
 * FormStack Component
 * 
 * Vertical spacing container for form elements.
 * Consistent spacing system with responsive support.
 * 
 * Sizes:
 * - xs: 8px (0.5rem)
 * - sm: 12px (0.75rem)
 * - md: 16px (1rem)
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormStackProps {
  spacing?: 'tight' | 'normal' | 'relaxed'
  children: React.ReactNode
  className?: string
  json?: any
}

const SPACING_MAP = {
  tight: 'space-y-2',    // 8px
  normal: 'space-y-4',    // 16px
  relaxed: 'space-y-6',    // 24px
}

export const FormStack: React.FC<FormStackProps> = ({
  spacing: propSpacing,
  children,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['spacing'])
  const config = mergeConfig(
    { spacing: propSpacing },
    jsonConfig,
    {}
  )
  const spacing = (config.spacing || 'normal') as 'tight' | 'normal' | 'relaxed'
  return (
    <div className={`${SPACING_MAP[spacing]} ${className}`}>
      {children}
    </div>
  )
}
