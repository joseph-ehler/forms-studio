/**
 * FormTooltip Component
 * 
 * Contextual help tooltip for form fields.
 * Appears on hover/focus.
 * 
 * Features:
 * - Hover trigger
 * - Multiple positions
 * - Info icon included
 * - Accessible
 */

import React, { useState } from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormTooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: React.ReactNode
  className?: string
  json?: any
}

const POSITION_MAP = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2'
}

const ARROW_MAP = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
}

export const FormTooltip: React.FC<FormTooltipProps> = ({
  content: propContent,
  position: propPosition,
  children,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['content', 'position'])
  const config = mergeConfig(
    { content: propContent, position: propPosition },
    jsonConfig,
    {}
  )
  const content = config.content || ''
  const position = (config.position || 'top') as 'top' | 'bottom' | 'left' | 'right'
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
        aria-label="More information"
      >
        {children || (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {isVisible && (
        <div
          className={`
            absolute z-50 ${POSITION_MAP[position]}
            px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            max-w-xs
            pointer-events-none
          `}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${ARROW_MAP[position]}`}
          />
        </div>
      )}
    </div>
  )
}
