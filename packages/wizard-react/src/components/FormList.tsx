/**
 * FormList Component
 * 
 * Styled list for forms.
 * 
 * Variants:
 * - bullet: Bulleted list (default)
 * - numbered: Numbered list
 * - none: No markers
 */

import React from 'react'

interface FormListProps {
  variant?: 'bullet' | 'numbered' | 'none'
  children: React.ReactNode
  className?: string
}

const VARIANT_MAP = {
  bullet: 'list-disc list-inside',
  numbered: 'list-decimal list-inside',
  none: 'list-none'
}

export const FormList: React.FC<FormListProps> = ({
  variant = 'bullet',
  children,
  className = '',
}) => {
  const Component = variant === 'numbered' ? 'ol' : 'ul'

  return (
    <Component className={`space-y-1 text-gray-700 ${VARIANT_MAP[variant]} ${className}`}>
      {children}
    </Component>
  )
}

// List Item component
interface FormListItemProps {
  children: React.ReactNode
  className?: string
}

export const FormListItem: React.FC<FormListItemProps> = ({
  children,
  className = '',
}) => {
  return <li className={className}>{children}</li>
}
