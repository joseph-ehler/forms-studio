/**
 * FormDivider Component
 * 
 * Visual separator for form sections.
 * 
 * Variants:
 * - solid: Standard 1px line
 * - dashed: Dashed line for subtle separation
 * - dotted: Dotted line for lighter separation
 * - thick: 2px line for strong separation
 * 
 * With optional label in the center.
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormDividerProps {
  text?: string
  spacing?: 'tight' | 'normal' | 'relaxed'
  variant?: 'solid' | 'dashed' | 'dotted' | 'thick'
  className?: string
  json?: any
}

const VARIANT_MAP = {
  solid: 'border-t border-gray-200',
  dashed: 'border-t border-dashed border-gray-300',
  dotted: 'border-t border-dotted border-gray-300',
  thick: 'border-t-2 border-gray-300'
}

const SPACING_MAP = {
  tight: 'my-3',
  normal: 'my-6',
  relaxed: 'my-8'
}

export const FormDivider: React.FC<FormDividerProps> = ({
  text: propText,
  spacing: propSpacing,
  variant: propVariant,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['text', 'spacing', 'variant'])
  const config = mergeConfig(
    { text: propText, spacing: propSpacing, variant: propVariant },
    jsonConfig,
    {}
  )
  const text = config.text
  const spacing = (config.spacing || 'normal') as 'tight' | 'normal' | 'relaxed'
  const variant = (config.variant || 'solid') as 'solid' | 'dashed' | 'dotted' | 'thick'
  if (text) {
    return (
      <div className={`relative ${SPACING_MAP[spacing]} ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full ${VARIANT_MAP[variant]}`} />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm font-medium text-gray-500">
            {text}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`${VARIANT_MAP[variant]} ${SPACING_MAP[spacing]} ${className}`} />
  )
}
