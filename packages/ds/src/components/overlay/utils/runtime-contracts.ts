/**
 * Runtime Contract Validation
 * 
 * Throws in development when overlays are misconfigured
 * Prevents common a11y and usage mistakes
 */

/**
 * Validate dialog has accessible name
 * Dialogs MUST have aria-label or aria-labelledby
 */
export function validateDialogAccessibility(
  role: 'dialog' | 'listbox' | undefined,
  ariaLabel: string | undefined,
  ariaLabelledBy: string | undefined
): void {
  if (process.env.NODE_ENV === 'production') return
  
  if (role === 'dialog' && !ariaLabel && !ariaLabelledBy) {
    throw new Error(
      '[ResponsiveOverlay] Dialog requires accessible name.\n' +
      'Add ariaLabel="..." or ariaLabelledBy="header-id".\n' +
      'Example: <ResponsiveOverlay role="dialog" ariaLabel="Select color" ...>'
    )
  }
}

/**
 * Validate listbox has options
 * Warns if listbox is empty (likely a bug)
 */
export function validateListboxOptions(
  role: 'dialog' | 'listbox' | undefined,
  hasOptions: boolean
): void {
  if (process.env.NODE_ENV === 'production') return
  
  if (role === 'listbox' && !hasOptions) {
    console.warn(
      '[ResponsiveOverlay] Listbox has no options.\n' +
      'Did you forget to render <Option> components?'
    )
  }
}

/**
 * Validate multiselectable attribute
 * aria-multiselectable should only be true for multi-select lists
 */
export function validateMultiselectable(
  ariaMultiselectable: boolean | undefined,
  isMulti: boolean
): void {
  if (process.env.NODE_ENV === 'production') return
  
  if (ariaMultiselectable && !isMulti) {
    console.warn(
      '[OverlayList] aria-multiselectable="true" but not a multi-select.\n' +
      'Remove aria-multiselectable or set isMulti=true.'
    )
  }
  
  if (!ariaMultiselectable && isMulti) {
    console.warn(
      '[OverlayList] Multi-select list missing aria-multiselectable="true".\n' +
      'Add aria-multiselectable to OverlayList for proper a11y.'
    )
  }
}

/**
 * Validate nested overlay depth
 * Warns if too many overlays are stacked (likely a UX issue)
 */
export function validateOverlayDepth(depth: number): void {
  if (process.env.NODE_ENV === 'production') return
  
  if (depth > 3) {
    console.warn(
      `[OverlayManager] ${depth} overlays stacked.\n` +
      'Consider redesigning UX - deeply nested overlays are hard to use.'
    )
  }
}

/**
 * Validate z-index usage
 * Throws if component tries to set z-index manually
 */
export function validateNoManualZIndex(style: React.CSSProperties | undefined): void {
  if (process.env.NODE_ENV === 'production') return
  
  if (style && 'zIndex' in style) {
    throw new Error(
      '[Overlay] Do not set z-index manually.\n' +
      'Use OverlayManager levels or design tokens instead.\n' +
      'Remove: style={{ zIndex: ... }}'
    )
  }
}
