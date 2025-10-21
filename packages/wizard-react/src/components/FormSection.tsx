/**
 * FormSection Component
 * 
 * Logical section of a form with optional title, description, and divider.
 * Perfect for organizing multi-step or complex forms.
 * 
 * Features:
 * - Optional title and description
 * - Top/bottom dividers
 * - Consistent spacing
 * - 48px padding
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormSectionProps {
  title?: string
  description?: string
  divider?: 'top' | 'bottom' | 'both' | 'none'
  spacing?: 'tight' | 'normal' | 'relaxed'
  children: React.ReactNode
  className?: string
  json?: any // JSON configuration
}

interface FormSectionConfig {
  title?: string
  description?: string
  divider?: 'top' | 'bottom' | 'both' | 'none'
  spacing?: 'tight' | 'normal' | 'relaxed'
}

const SPACING_MAP = {
  tight: 'space-y-3',
  normal: 'space-y-4',
  relaxed: 'space-y-6'
}

export const FormSection: React.FC<FormSectionProps> = ({
  title: propTitle,
  description: propDescription,
  divider: propDivider,
  spacing: propSpacing,
  children,
  className = '',
  json,
}) => {
  // Extract config from JSON
  const jsonConfig = getConfigFromJSON<FormSectionConfig>(json, [
    'title',
    'description',
    'divider',
    'spacing',
  ])
  
  // Merge with props (props take priority)  
  const config = mergeConfig(
    { title: propTitle, description: propDescription, divider: propDivider, spacing: propSpacing },
    jsonConfig,
    {} // No defaults needed for optional fields
  )
  
  const title = config.title
  const description = config.description
  const divider = config.divider || 'none'
  const spacing = config.spacing || 'normal'
  const showTopDivider = divider === 'top' || divider === 'both'
  const showBottomDivider = divider === 'bottom' || divider === 'both'

  return (
    <div className={className}>
      {showTopDivider && (
        <div className="border-t border-gray-200 mb-6" />
      )}
      
      <div className={SPACING_MAP[spacing]}>
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className={SPACING_MAP[spacing]}>
          {children}
        </div>
      </div>

      {showBottomDivider && (
        <div className="border-t border-gray-200 mt-6" />
      )}
    </div>
  )
}
