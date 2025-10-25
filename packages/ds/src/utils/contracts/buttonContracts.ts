/**
 * Button Contracts - Dev-mode validation
 * 
 * Ensures button props are valid and skin variables are present.
 * These run ONLY in development and throw/warn if contracts are violated.
 */

import { CSSProperties } from 'react';

const VALID_VARIANTS = ['primary', 'secondary', 'ghost', 'success', 'warning', 'danger', 'info'] as const;
const REQUIRED_SKIN_VARS = ['--btn-fg', '--btn-bg', '--btn-hover-bg', '--btn-active-bg'] as const;

/**
 * Contract: Variant must be one of the allowed values
 * Throws in dev if invalid variant is passed
 */
export function requireValidVariant<P extends { variant?: string }>(props: P): void {
  if (process.env.NODE_ENV === 'production') return;
  
  if (props.variant && !VALID_VARIANTS.includes(props.variant as any)) {
    throw new Error(
      `[Button Contract] Invalid variant "${props.variant}". ` +
      `Must be one of: ${VALID_VARIANTS.join(', ')}`
    );
  }
}

/**
 * Contract: All required skin variables must be present in style
 * Warns in dev if any are missing (non-blocking for flexibility)
 */
export function requireSkinVars<P extends { style?: CSSProperties }>(props: P): void {
  if (process.env.NODE_ENV === 'production') return;
  
  const style = props.style || {};
  const missing = REQUIRED_SKIN_VARS.filter(varName => !(varName in style));
  
  if (missing.length > 0) {
    console.warn(
      '[Button Contract] Missing skin variables:',
      missing.join(', '),
      '\nButton may not render correctly. Check the SKIN mapping.'
    );
  }
}

/**
 * Contract: Forbid raw style overrides (except skin vars)
 * This prevents developers from bypassing the skin system
 */
export function forbidRawStyle<P extends { style?: CSSProperties; className?: string }>(
  props: P
): void {
  if (process.env.NODE_ENV === 'production') return;
  
  const style = props.style || {};
  const skinVarKeys = Object.keys(style).filter(k => k.startsWith('--btn-'));
  const otherStyleKeys = Object.keys(style).filter(k => !k.startsWith('--'));
  
  if (otherStyleKeys.length > 0) {
    console.warn(
      '[Button Contract] Direct style overrides detected:',
      otherStyleKeys.join(', '),
      '\nUse className or extend the SKIN mapping instead.'
    );
  }
}

/**
 * Apply all button contracts
 * Call this in the component's render path (dev-only overhead)
 */
export function applyButtonContracts<P extends { variant?: string; style?: CSSProperties }>(
  props: P
): void {
  if (process.env.NODE_ENV === 'production') return;
  
  requireValidVariant(props);
  requireSkinVars(props);
  // forbidRawStyle is optional - might be too strict for real-world usage
}
