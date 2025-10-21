/**
 * FormAccordion Component
 * 
 * Collapsible section for optional or advanced fields.
 * Click title to expand/collapse.
 * 
 * Features:
 * - Smooth animations
 * - Chevron indicator
 * - Default open/closed
 * - Accessible
 */

import React, { useState } from 'react'

interface FormAccordionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export const FormAccordion: React.FC<FormAccordionProps> = ({
  title,
  defaultOpen = false,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        <span className="text-base font-medium text-gray-900">{title}</span>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  )
}
