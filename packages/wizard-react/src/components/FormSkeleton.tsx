/**
 * FormSkeleton Component
 * 
 * Loading state placeholder for forms.
 * Shows animated skeleton of form fields.
 * 
 * Features:
 * - Pulsing animation
 * - Configurable field count
 * - Different field types
 * - 48px consistent sizing
 * - JSON compatibility
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormSkeletonProps {
  fields?: number
  showLabels?: boolean
  showActions?: boolean
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
  json?: any
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 3,
  showLabels = true,
  showActions = true,
  variant: propVariant,
  width: propWidth,
  height: propHeight,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['variant', 'width', 'height', 'fields', 'showLabels', 'showActions'])
  const config = mergeConfig(
    { variant: propVariant, width: propWidth, height: propHeight, fields, showLabels, showActions },
    jsonConfig,
    {}
  )
  const variant = (config.variant || 'text') as 'text' | 'circular' | 'rectangular'
  const width = config.width || '100%'
  const height = config.height
  const fieldsCount = config.fields || 3
  const showLabelsValue = config.showLabels !== undefined ? config.showLabels : true
  const showActionsValue = config.showActions !== undefined ? config.showActions : true
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fieldsCount }).map((_, index) => (
        <div key={index} className="space-y-2 animate-pulse">
          {/* Label skeleton */}
          {showLabelsValue && (
            <div className="h-4 bg-gray-200 rounded w-24" />
          )}
          
          {/* Input skeleton */}
          <div className="h-12 bg-gray-200 rounded-md" />
        </div>
      ))}

      {/* Actions skeleton */}
      {showActions && (
        <div className="flex justify-end gap-3 pt-4 animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg w-24" />
          <div className="h-12 bg-gray-200 rounded-lg w-32" />
        </div>
      )}
    </div>
  )
}
