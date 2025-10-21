/**
 * FormLink Component
 * 
 * Styled link for forms.
 * 
 * Features:
 * - Hover underline
 * - External link indicator
 * - Consistent styling
 */

import React from 'react'

interface FormLinkProps {
  href: string
  external?: boolean
  children: React.ReactNode
  className?: string
}

export const FormLink: React.FC<FormLinkProps> = ({
  href,
  external,
  children,
  className = '',
}) => {
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <a
      href={href}
      {...externalProps}
      className={`text-blue-600 hover:text-blue-700 hover:underline font-medium inline-flex items-center gap-1 ${className}`}
    >
      {children}
      {external && (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </a>
  )
}
