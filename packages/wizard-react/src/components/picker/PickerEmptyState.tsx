/**
 * PickerEmptyState
 * 
 * Empty state messaging when no results are found.
 */

import React from 'react'
import type { PickerEmptyStateProps } from '../overlay/types'

export const PickerEmptyState: React.FC<PickerEmptyStateProps> = ({
  message = 'No results found',
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      {icon || (
        <svg
          className="h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}

      {/* Message */}
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}
