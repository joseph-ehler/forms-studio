/**
 * OverlayLiveRegion
 * 
 * Announces dynamic content changes to screen readers
 * Use for result counts, loading states, etc.
 */

import React from 'react'

export interface OverlayLiveRegionProps {
  /** Message to announce */
  message: string
  /** Politeness level */
  mode?: 'polite' | 'assertive'
  /** Only announce if condition is true */
  when?: boolean
  /** Additional className */
  className?: string
}

/**
 * Live region for announcing changes
 * 
 * @example
 * ```tsx
 * <OverlayLiveRegion
 *   message={`${filteredCount} results`}
 *   when={filteredCount > 0}
 * />
 * ```
 */
export const OverlayLiveRegion: React.FC<OverlayLiveRegionProps> = ({
  message,
  mode = 'polite',
  when = true,
  className = '',
}) => {
  if (!when || !message) return null
  
  return (
    <span
      className={`sr-only ${className}`}
      aria-live={mode}
      aria-atomic="true"
      role="status"
    >
      {message}
    </span>
  )
}

/**
 * Hook to generate result count announcements
 * 
 * @example
 * ```tsx
 * const announcement = useResultAnnouncement(filteredOptions.length, query)
 * return <OverlayLiveRegion message={announcement} />
 * ```
 */
export function useResultAnnouncement(
  count: number,
  query?: string
): string {
  if (!query) return ''
  
  if (count === 0) {
    return 'No results found'
  }
  
  if (count === 1) {
    return '1 result'
  }
  
  return `${count} results`
}
