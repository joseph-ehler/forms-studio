/**
 * FormBadge Component
 * 
 * Small status indicators for form fields.
 * 
 * Variants:
 * - required: Red - Required field indicator
 * - optional: Gray - Optional field indicator
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormBadgeProps {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
  json?: any
}

const VARIANT_MAP = {
  info: {
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultText: 'Info'
  },
  success: {
    className: 'bg-green-100 text-green-800 border-green-200',
    defaultText: 'Success'
  },
  warning: {
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    defaultText: 'Warning'
  },
  error: {
    className: 'bg-red-100 text-red-800 border-red-200',
    defaultText: 'Error'
  },
  neutral: {
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    defaultText: 'Neutral'
  }
}

export const FormBadge: React.FC<FormBadgeProps> = ({
  variant: propVariant,
  size: propSize,
  children,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['variant', 'size'])
  const mergedConfig = mergeConfig(
    { variant: propVariant, size: propSize },
    jsonConfig,
    { variant: 'neutral', size: 'md' }
  )
  
  // Ensure variant is valid, fallback to 'neutral'
  const variantValue = mergedConfig.variant as string
  const variant: 'info' | 'success' | 'warning' | 'error' | 'neutral' = 
    (variantValue && variantValue in VARIANT_MAP) 
      ? variantValue as any
      : 'neutral'
      
  const size = (mergedConfig.size || 'md') as 'sm' | 'md'
  const variantConfig = VARIANT_MAP[variant]
  
  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-0.5
        rounded text-xs font-medium
        border
        ${variantConfig.className}
        ${className}
      `}
    >
      {children || variantConfig.defaultText}
    </span>
  )
}
