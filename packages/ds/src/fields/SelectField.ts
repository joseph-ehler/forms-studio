/**
 * SelectField - Compatibility Re-export
 * 
 * @deprecated Import from @intstudio/forms instead:
 * ```ts
 * import { SelectField } from '@intstudio/forms/fields';
 * ```
 * 
 * This re-export will be removed in v2.0.0
 * Migration: pnpm codemod:fields
 * Removal: see docs/COMPAT_FACADES.md
 */

// Runtime re-export only (types handled separately to avoid circular dependency)
// @ts-ignore - Forms package types not available during DS build
export { SelectField } from '@intstudio/forms/fields';
