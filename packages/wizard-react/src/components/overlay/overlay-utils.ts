/**
 * Overlay Layout Utilities
 * 
 * Reusable helpers for calculating heights and preventing footer cut-off issues.
 * These utilities ensure consistent overlay layouts across all picker fields.
 */

export interface OverlayLayoutConfig {
  /** Total max height of overlay */
  maxHeight?: number
  /** Whether search is enabled */
  hasSearch?: boolean
  /** Whether footer is present */
  hasFooter?: boolean
  /** Whether header is present */
  hasHeader?: boolean
  /** Custom search height (default: 60px) */
  searchHeight?: number
  /** Custom footer height (default: 48px) */
  footerHeight?: number
  /** Custom header height (default: 56px) */
  headerHeight?: number
}

export interface OverlayLayoutHeights {
  /** Total container max height */
  containerMaxHeight: number
  /** Calculated list/content max height */
  contentMaxHeight: number
  /** Search bar height (0 if not present) */
  searchHeight: number
  /** Footer height (0 if not present) */
  footerHeight: number
  /** Header height (0 if not present) */
  headerHeight: number
}

/**
 * Calculate overlay layout heights to ensure footer is always visible
 * 
 * @example
 * const heights = calculateOverlayHeights({ maxHeight: 560, hasSearch: true, hasFooter: true })
 * // Returns: { containerMaxHeight: 560, contentMaxHeight: 452, searchHeight: 60, footerHeight: 48 }
 */
export function calculateOverlayHeights(config: OverlayLayoutConfig): OverlayLayoutHeights {
  const {
    maxHeight = 560,
    hasSearch = false,
    hasFooter = false,
    hasHeader = false,
    searchHeight: customSearchHeight,
    footerHeight: customFooterHeight,
    headerHeight: customHeaderHeight,
  } = config

  // Default heights (can be customized)
  const searchHeight = hasSearch ? (customSearchHeight ?? 60) : 0
  const footerHeight = hasFooter ? (customFooterHeight ?? 48) : 0
  const headerHeight = hasHeader ? (customHeaderHeight ?? 56) : 0

  // Calculate remaining space for content
  const contentMaxHeight = maxHeight - searchHeight - footerHeight - headerHeight

  return {
    containerMaxHeight: maxHeight,
    contentMaxHeight: Math.max(contentMaxHeight, 100), // Minimum 100px for content
    searchHeight,
    footerHeight,
    headerHeight,
  }
}

/**
 * Get overlay content layout styles for flexbox
 * Ensures header/search/footer are fixed and content scrolls
 */
export function getOverlayContentStyles(heights: OverlayLayoutHeights) {
  return {
    container: {
      display: 'flex' as const,
      flexDirection: 'column' as const,
      maxHeight: `${heights.containerMaxHeight}px`,
      overflow: 'hidden' as const,
    },
    header: {
      flexShrink: 0,
    },
    search: {
      flexShrink: 0,
    },
    content: {
      flexShrink: 1,
      flexGrow: 1,
      overflowY: 'auto' as const,
      minHeight: 0,
      maxHeight: `${heights.contentMaxHeight}px`,
    },
    footer: {
      flexShrink: 0,
    },
  }
}

/**
 * Get overlay content class names for Tailwind
 */
export function getOverlayContentClasses() {
  return {
    container: 'flex flex-col overflow-hidden',
    header: 'flex-shrink-0',
    search: 'flex-shrink-0',
    content: 'flex-1 overflow-y-auto min-h-0',
    footer: 'flex-shrink-0',
  }
}

/**
 * Validate overlay config and warn about common issues
 */
export function validateOverlayConfig(config: OverlayLayoutConfig): string[] {
  const warnings: string[] = []

  const heights = calculateOverlayHeights(config)

  // Warn if content height is too small
  if (heights.contentMaxHeight < 200) {
    warnings.push(
      `Content height (${heights.contentMaxHeight}px) is very small. ` +
      `Consider increasing maxHeight or reducing header/footer sizes.`
    )
  }

  // Warn if maxHeight is too large
  if (heights.containerMaxHeight > 800) {
    warnings.push(
      `Container height (${heights.containerMaxHeight}px) is very large. ` +
      `Consider using a smaller maxHeight for better UX on mobile.`
    )
  }

  return warnings
}
