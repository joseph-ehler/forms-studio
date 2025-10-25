/**
 * Type-safe token access helpers
 * 
 * Forces consumers to use tokens instead of magic values.
 * Provides autocomplete and prevents typos.
 */

export type DSColorSurface = 'base' | 'raised' | 'sunken' | 'overlay';
export type DSColorText = 'default' | 'subtle' | 'muted' | 'inverse';
export type DSColorBrand = 'primary' | 'danger' | 'success' | 'warning' | 'info';
export type DSColorBrandVariant = 'hover' | 'active' | 'subtle';
export type DSColorBorder = 'subtle' | 'medium' | 'strong';

export type DSColor =
  | `surface.${DSColorSurface}`
  | `text.${DSColorText}`
  | DSColorBrand
  | `${DSColorBrand}.${DSColorBrandVariant}`
  | `border.${DSColorBorder}`;

export type DSSpace = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
export type DSRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'control';
export type DSTransition = 'fast' | 'base' | 'slow';
export type DSShadow = 'none' | 'overlay-sm' | 'overlay-md' | 'overlay-lg';
export type DSZIndex = 'base' | 'dropdown' | 'sticky' | 'fixed' | 'sheet' | 'panel' | 'overlay' | 'modal' | 'popover' | 'toast' | 'tooltip';

/**
 * Generate CSS var() reference from token path
 * 
 * @example
 * ```ts
 * dsVar('color-primary') // => 'var(--ds-color-primary)'
 * dsVar('space-4') // => 'var(--ds-space-4)'
 * ```
 */
export const dsVar = (path: string): string => 
  `var(--ds-${path.replace(/\./g, '-')})`;

/**
 * Type-safe color token accessor
 * 
 * @example
 * ```ts
 * dsColor('primary') // => 'var(--ds-color-primary)'
 * dsColor('surface.base') // => 'var(--ds-color-surface-base)'
 * dsColor('primary.hover') // => 'var(--ds-color-primary-hover)'
 * ```
 */
export const dsColor = (c: DSColor): string => 
  dsVar(`color-${c}`);

/**
 * Type-safe spacing token accessor
 * 
 * @example
 * ```ts
 * dsSpace(4) // => 'var(--ds-space-4)'
 * dsSpace(12) // => 'var(--ds-space-12)'
 * ```
 */
export const dsSpace = (n: DSSpace): string => 
  dsVar(`space-${n}`);

/**
 * Type-safe radius token accessor
 * 
 * @example
 * ```ts
 * dsRadius('lg') // => 'var(--ds-radius-lg)'
 * dsRadius('control') // => 'var(--ds-radius-control)'
 * ```
 */
export const dsRadius = (r: DSRadius): string => 
  dsVar(`radius-${r}`);

/**
 * Type-safe transition token accessor
 * 
 * @example
 * ```ts
 * dsTransition('fast') // => 'var(--ds-transition-fast)'
 * ```
 */
export const dsTransition = (t: DSTransition): string => 
  dsVar(`transition-${t}`);

/**
 * Type-safe shadow token accessor
 * 
 * @example
 * ```ts
 * dsShadow('overlay-md') // => 'var(--ds-shadow-overlay-md)'
 * ```
 */
export const dsShadow = (s: DSShadow): string => 
  dsVar(`shadow-${s}`);

/**
 * Type-safe z-index token accessor
 * 
 * @example
 * ```ts
 * dsZIndex('modal') // => 'var(--ds-z-modal)'
 * ```
 */
export const dsZIndex = (z: DSZIndex): string => 
  dsVar(`z-${z}`);

/**
 * Get RGB triplet for alpha composition
 * 
 * @example
 * ```ts
 * dsColorRGB('primary') // => 'var(--ds-color-primary-rgb)'
 * // Use: rgba(var(--ds-color-primary-rgb), 0.4)
 * ```
 */
export const dsColorRGB = (c: DSColorBrand): string => 
  dsVar(`color-${c}-rgb`);

/**
 * State token accessors
 */
export const dsState = {
  hoverBg: () => dsVar('state-hover-bg'),
  activeBg: () => dsVar('state-active-bg'),
  focusRing: () => dsVar('state-focus-ring'),
  disabledFg: () => dsVar('state-disabled-fg'),
  disabledBg: () => dsVar('state-disabled-bg'),
} as const;

/**
 * Control tokens (density/ergonomics)
 */
export const dsControl = {
  spaceX: () => dsVar('space-control-x'),
  spaceY: () => dsVar('space-control-y'),
  radius: () => dsVar('radius-control'),
} as const;

/**
 * Typography tokens
 */
export const dsTypo = {
  fontSans: () => dsVar('font-sans'),
  fontMono: () => dsVar('font-mono'),
  weightNormal: () => dsVar('weight-normal'),
  weightMedium: () => dsVar('weight-medium'),
  weightBold: () => dsVar('weight-bold'),
  leadingTight: () => dsVar('leading-tight'),
  leadingNormal: () => dsVar('leading-normal'),
  leadingRelaxed: () => dsVar('leading-relaxed'),
} as const;
