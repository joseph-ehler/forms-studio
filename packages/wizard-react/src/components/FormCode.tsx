/**
 * FormCode Component
 * 
 * Inline or block code display.
 * 
 * Variants:
 * - inline: Small inline code
 * - block: Multi-line code block
 */

import React from 'react'

interface FormCodeProps {
  variant?: 'inline' | 'block'
  children: React.ReactNode
  className?: string
}

export const FormCode: React.FC<FormCodeProps> = ({
  variant = 'inline',
  children,
  className = '',
}) => {
  if (variant === 'block') {
    return (
      <pre
        className={`bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono ${className}`}
      >
        <code>{children}</code>
      </pre>
    )
  }

  return (
    <code
      className={`bg-gray-100 text-gray-900 rounded px-1.5 py-0.5 text-sm font-mono ${className}`}
    >
      {children}
    </code>
  )
}
