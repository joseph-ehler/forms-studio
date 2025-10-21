/**
 * FormCard Component
 * 
 * Container with border, shadow, and padding for visual grouping.
 * Perfect for creating distinct sections in forms.
 * 
 * Variants:
 * - default: White background with shadow
 * - outlined: White with border only
 * - filled: Light gray background
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormCardProps {
  variant?: 'default' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  json?: any
}

interface FormCardConfig {
  variant?: 'default' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const VARIANT_MAP = {
  default: 'bg-white shadow-sm border border-gray-200',
  outlined: 'bg-white border-2 border-gray-300',
  filled: 'bg-gray-50 border border-gray-200'
}

const PADDING_MAP = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

export const FormCard: React.FC<FormCardProps> = ({
  variant: propVariant,
  padding: propPadding,
  children,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON<FormCardConfig>(json, ['variant', 'padding'])
  const config = mergeConfig(
    { variant: propVariant, padding: propPadding },
    jsonConfig,
    { variant: 'default', padding: 'md' }
  )
  const variant = (config.variant || 'default') as 'default' | 'outlined' | 'filled'
  const padding = (config.padding || 'md') as 'none' | 'sm' | 'md' | 'lg'
  return (
    <div className={`rounded-lg ${VARIANT_MAP[variant]} ${PADDING_MAP[padding]} ${className}`}>
      {children}
    </div>
  )
}
