/**
 * FormLabel Component
 * 
 * Form field label with required indicator.
 * 
 * Features:
 * - Required asterisk
 * - Optional badge
 * - Tooltip support
 * - Consistent styling
 */

import React from 'react'

interface FormLabelProps {
  htmlFor?: string
  required?: boolean
  optional?: boolean
  children: React.ReactNode
  tooltip?: React.ReactNode
  className?: string
}

export const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  required,
  optional,
  children,
  tooltip,
  className = '',
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 ${className}`}
    >
      <span className="flex items-center gap-2">
        {children}
        {required && <span className="text-red-500">*</span>}
        {optional && (
          <span className="text-xs font-normal text-gray-500">(Optional)</span>
        )}
        {tooltip && <span className="ml-1">{tooltip}</span>}
      </span>
    </label>
  )
}
