/**
 * Composite Field Components
 * 
 * Higher-level field components built on foundation fields.
 * Export all composite fields for easy registration.
 */

// ✅ Fixed and working (6)
export { EmailField } from './EmailField'
export { PasswordField } from './PasswordField'
export { SearchField } from './SearchField'
export { PhoneField } from './PhoneField'
export { OTPField } from './OTPField'
export { TableField } from './TableField'

// 🔄 Still parked - will re-export as fixed:
// - MatrixField, RadioGroupField, DateRangeField
// - CurrencyField, NPSField, RankField, AddressField
