/**
 * TextareaField - Compatibility Re-export
 * 
 * @deprecated Import from @intstudio/forms instead:
 * ```ts
 * import { TextareaField } from '@intstudio/forms/fields';
 * ```
 * 
 * This re-export will be removed in v2.0.0
 * Migration: pnpm codemod:fields
 */

// Runtime re-export only (types handled separately to avoid circular dependency)
// @ts-ignore - Forms package types not available during DS build
export { TextareaField } from '@intstudio/forms/fields';
