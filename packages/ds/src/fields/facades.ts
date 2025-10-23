/**
 * Field Compatibility Façades - Aggregator
 * 
 * All deprecated field re-exports in one place for easier tracking.
 * These redirect to @intstudio/forms and will be removed in v2.0.0.
 * 
 * See docs/COMPAT_FACADES.md for removal schedule and migration plan.
 * 
 * @deprecated Import fields from @intstudio/forms instead:
 * ```ts
 * import { TextField, NumberField } from '@intstudio/forms/fields';
 * ```
 */

// Batch 1-2 Fields (Oct 23, 2025)
// @ts-ignore
export { NumberField } from '@intstudio/forms/fields';
// @ts-ignore
export { TextareaField } from '@intstudio/forms/fields';
// @ts-ignore
export { CheckboxField } from '@intstudio/forms/fields';

// Batch 3 Fields (Oct 23, 2025)
// @ts-ignore
export { TextField } from '@intstudio/forms/fields';
// @ts-ignore
export { SelectField } from '@intstudio/forms/fields';
// @ts-ignore
export { DateField } from '@intstudio/forms/fields';
// @ts-ignore
export { TimeField } from '@intstudio/forms/fields';
// @ts-ignore
export { RatingField } from '@intstudio/forms/fields';

// @ts-ignore
export { SliderField } from '@intstudio/forms/fields';
// @ts-ignore
export { RangeField } from '@intstudio/forms/fields';
// @ts-ignore
export { DateTimeField } from '@intstudio/forms/fields';
// @ts-ignore
export { TagInputField } from '@intstudio/forms/fields';
// @ts-ignore
export { ColorField } from '@intstudio/forms/fields';
// @ts-ignore
export { EmailField } from '@intstudio/forms/fields';
// @ts-ignore
export { TelField } from '@intstudio/forms/fields';
// @ts-ignore
export { UrlField } from '@intstudio/forms/fields';
// @ts-ignore
export { FileField } from '@intstudio/forms/fields';
// @ts-ignore
export { MultiSelectField } from '@intstudio/forms/fields';
// @ts-ignore
export { ToggleField } from '@intstudio/forms/fields';
// @ts-ignore
export { LocationField } from '@intstudio/forms/fields';
// @ts-ignore
export { RangeCompositeField } from '@intstudio/forms/fields';
// @ts-ignore
export { SignatureField } from '@intstudio/forms/fields';
// @ts-ignore
export { EmailEnhancedField } from '@intstudio/forms/fields';
// Future batches will be added here...
// Batch 4: SliderField, RangeField, DateTimeField, TagInputField
// Batch 5: ColorField, FileField, etc.

/**
 * Migration Instructions
 * ======================
 * 
 * Automatic (recommended):
 *   pnpm codemod:fields
 * 
 * Manual:
 *   - Before: import { TextField } from '@intstudio/ds/fields';
 *   - After:  import { TextField } from '@intstudio/forms/fields';
 * 
 * Removal Date: v2.0.0 (see docs/COMPAT_FACADES.md)
 */
