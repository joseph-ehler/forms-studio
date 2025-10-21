/**
 * FormHeading Component
 * 
 * Semantic heading component with size variants.
 * 
 * Levels:
 * - h1: Page title (2xl, 32px)
 * - h2: Section title (xl, 24px)
 * - h3: Subsection title (lg, 20px)
 * - h4: Group title (base, 16px)
 * - h5: Small title (sm, 14px)
 * - h6: Tiny title (xs, 12px)
 */

import React from 'react'

interface FormHeadingProps {
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: React.ReactNode
  className?: string
}

const LEVEL_STYLES = {
  h1: 'text-3xl font-bold text-gray-900',       // 30px
  h2: 'text-2xl font-bold text-gray-900',       // 24px
  h3: 'text-xl font-semibold text-gray-900',    // 20px
  h4: 'text-lg font-semibold text-gray-900',    // 18px
  h5: 'text-base font-semibold text-gray-800',  // 16px
  h6: 'text-sm font-semibold text-gray-800'     // 14px
}

export const FormHeading: React.FC<FormHeadingProps> = ({
  level = 'h2',
  children,
  className = '',
}) => {
  const Component = level
  
  return (
    <Component className={`${LEVEL_STYLES[level]} ${className}`}>
      {children}
    </Component>
  )
}
