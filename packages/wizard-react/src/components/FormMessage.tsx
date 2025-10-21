/**
 * FormMessage Component
 * 
 * Feedback message box for forms.
 * 
 * Types:
 * - info: Blue - Informational messages
 * - success: Green - Success confirmation
 * - warning: Yellow - Warnings
 * - error: Red - Error messages
 * 
 * Features:
 * - Icon on left
 * - Dismissible option
 * - Title + description support
 * - 48px minimum height
 */

import React, { useState } from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormMessageProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  json?: any
}

interface FormMessageConfig {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  dismissible?: boolean
}

const TYPE_STYLES = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'text-blue-500',
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    )
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-900',
    icon: 'text-green-500',
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    )
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    icon: 'text-yellow-500',
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    )
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: 'text-red-500',
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    )
  }
}

export const FormMessage: React.FC<FormMessageProps> = ({
  type: propType,
  title: propTitle,
  children,
  dismissible: propDismissible,
  onDismiss,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON<FormMessageConfig>(json, ['type', 'title', 'dismissible'])
  const config = mergeConfig(
    { type: propType, title: propTitle, dismissible: propDismissible },
    jsonConfig,
    { type: 'info', dismissible: false }
  )
  const type = (config.type || 'info') as 'info' | 'success' | 'warning' | 'error'
  const title = config.title
  const dismissible = config.dismissible ?? false
  const [visible, setVisible] = useState(true)
  const styles = TYPE_STYLES[type]

  if (!visible) return null

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg
            className={`h-6 w-6 ${styles.icon}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {styles.svg}
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-semibold mb-1">
              {title}
            </h4>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
