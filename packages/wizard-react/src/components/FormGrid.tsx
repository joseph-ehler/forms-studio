/**
 * FormGrid Component
 * 
 * Responsive grid layout for form fields.
 * Automatically stacks on mobile, columns on desktop.
 * 
 * Columns:
 * - 1: Full width
 * - 2: Half width (mobile: stacked, desktop: 50/50)
 * - 3: Third width (mobile: stacked, desktop: 33/33/33)
 * - 4: Quarter width (mobile: stacked, desktop: 25/25/25/25)
 * 
 * Gap sizes match FormStack spacing system.
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormGridProps {
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  json?: any
}

const COLUMN_MAP = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
}

const GAP_MAP = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
}

export const FormGrid: React.FC<FormGridProps> = ({
  columns: propColumns,
  gap: propGap,
  children,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['columns', 'gap'])
  const config = mergeConfig(
    { columns: propColumns, gap: propGap },
    jsonConfig,
    {}
  )
  const columns = (config.columns || 2) as 1 | 2 | 3 | 4
  const gap = (config.gap || 'md') as 'sm' | 'md' | 'lg'
  return (
    <div className={`grid ${COLUMN_MAP[columns]} ${GAP_MAP[gap]} ${className}`}>
      {children}
    </div>
  )
}
