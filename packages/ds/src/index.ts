/**
 * @joseph.ehler/wizard-react
 * 
 * React runtime for Forms Studio wizard engine.
 * Render any JSON field type with React Hook Form + Zod validation.
 * 
 * PLUS: Complete Design System (Typography, Surface, Shell, Buttons)
 */

// Design System Components (NEW!)
export * from './components'

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
export { ColorField } from './fields/ColorField'
export { RangeField } from './fields/RangeField'
export { RatingField } from './fields/RatingField'
export { RepeaterField } from './fields/RepeaterField'
export { SignatureField } from './fields/SignatureField'

// ========================================
// COMPOSITE FIELDS (ALL 13 COMPLETE! 🎉)
// ========================================
export { EmailField } from './fields/composite/EmailField'
export { PasswordField } from './fields/composite/PasswordField'
export { SearchField } from './fields/composite/SearchField'
export { PhoneField } from './fields/composite/PhoneField'
export { OTPField } from './fields/composite/OTPField'
export { TableField } from './fields/composite/TableField'
export { DateRangeField } from './fields/composite/DateRangeField'
export { RadioGroupField } from './fields/composite/RadioGroupField'
export { MatrixField } from './fields/composite/MatrixField'
export { CurrencyField } from './fields/composite/CurrencyField'
export { NPSField } from './fields/composite/NPSField'
export { AddressField } from './fields/composite/AddressField'
export { RankField } from './fields/composite/RankField'

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
