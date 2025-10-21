/**
 * FormActions Component
 * 
 * Button group for form submission and actions.
 * 
 * Features:
 * - Left/right/center alignment
 * - Responsive stacking on mobile
 * - Consistent button spacing
 * - Primary/secondary button support
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormActionsProps {
  alignment?: 'left' | 'center' | 'right' | 'space-between'
  spacing?: 'tight' | 'normal' | 'relaxed'
  stack?: boolean // Stack on mobile
  children: React.ReactNode
  className?: string
  json?: any
}

const ALIGN_MAP = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  'space-between': 'justify-between'
}

const SPACING_MAP = {
  tight: 'gap-2',
  normal: 'gap-3',
  relaxed: 'gap-4'
}

export const FormActions: React.FC<FormActionsProps> = ({
  alignment: propAlignment,
  spacing: propSpacing,
  stack = true,
  children,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['alignment', 'spacing'])
  const config = mergeConfig(
    { alignment: propAlignment, spacing: propSpacing },
    jsonConfig,
    {}
  )
  const alignment = (config.alignment || 'right') as 'left' | 'center' | 'right' | 'space-between'
  const spacing = (config.spacing || 'normal') as 'tight' | 'normal' | 'relaxed'
  return (
    <div className={`
      flex ${stack ? 'flex-col sm:flex-row' : 'flex-row'}
      ${ALIGN_MAP[alignment]}
      ${SPACING_MAP[spacing]}
      ${className}
    `}>
      {children}
    </div>
  )
}

// Pre-styled button components for consistency
interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
}

const VARIANT_STYLES = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
}

const SIZE_STYLES = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-6 py-3 text-base min-h-[48px]',
  lg: 'px-8 py-4 text-lg min-h-[56px]'
}

export const FormButton: React.FC<FormButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        rounded-lg font-semibold
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
