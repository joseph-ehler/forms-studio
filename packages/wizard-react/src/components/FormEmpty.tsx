/**
 * FormEmpty Component
 * 
 * Empty state message for forms.
 * Shows when no data or forms exist.
 * 
 * Features:
 * - Icon support
 * - Title + description
 * - Optional action button
 * - Centered layout
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormEmptyProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
  json?: any
}

export const FormEmpty: React.FC<FormEmptyProps> = ({
  title: propTitle,
  description: propDescription,
  icon,
  action,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['title', 'description'])
  const config = mergeConfig(
    { title: propTitle, description: propDescription },
    jsonConfig,
    {}
  )
  const title = config.title || 'No data'
  const description = config.description
  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Icon */}
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}
