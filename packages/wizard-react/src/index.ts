/**
 * @joseph.ehler/wizard-react
 * 
 * React runtime for Forms Studio wizard engine.
 * Render any JSON field type with React Hook Form + Zod validation.
 */

// Core renderer
export * from './renderer/FormScreen'

// Field system
export { FieldRegistry, registerFields } from './fields/registry'
export { registerDefaultFields } from './fields/createField'

// ========================================
// FOUNDATION FIELDS (Working)
// ========================================
export * from './fields/TextField'
export * from './fields/TextareaField'
export * from './fields/NumberField'
export * from './fields/SelectField'
export * from './fields/MultiSelectField'
export * from './fields/TagInputField'
export * from './fields/ChipsField'
export * from './fields/ToggleField'
export * from './fields/DateField'
export * from './fields/TimeField'
export * from './fields/DateTimeField'
export * from './fields/FileField'
export * from './fields/CalculatedField'
export { SliderField } from './fields/SliderField'

// ========================================
// COMPOSITE FIELDS (Working - 6)
// ========================================
export { EmailField } from './fields/composite/EmailField'
export { PasswordField } from './fields/composite/PasswordField'
export { SearchField } from './fields/composite/SearchField'
export { PhoneField } from './fields/composite/PhoneField'
export { OTPField } from './fields/composite/OTPField'
export { TableField } from './fields/composite/TableField'

// ========================================
// PARKED FIELDS (Being Fixed)
// ========================================
// Moved to src/fields/_parked/ and src/fields/composite/_parked/
// Will re-introduce one at a time after fixing:
// Foundation: ColorField, RatingField, RangeField, RepeaterField, SignatureField
// Composite: EmailField, SearchField, MatrixField, PasswordField, OTPField, TableField
//           PhoneField, DateRangeField, CurrencyField, AddressField, NPSField, 
//           RankField, RadioGroupField

// ========================================
// INFRASTRUCTURE & UTILITIES
// ========================================
export * from './components'
export * from './validation/mapJsonValidationToZod'
export * from './rhf/zodResolver'
export type { FieldComponent, FieldComponentProps, FieldFactory } from './fields/types'
