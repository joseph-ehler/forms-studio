/**
 * Composite Field Components
 * 
 * Higher-level field components built on foundation fields.
 * Export all composite fields for easy registration.
 */

// ✅ Fixed and working (9)
export { EmailField } from './EmailField'
export { PasswordField } from './PasswordField'
export { SearchField } from './SearchField'
export { PhoneField } from './PhoneField'
export { OTPField } from './OTPField'
export { TableField } from './TableField'
export { DateRangeField } from './DateRangeField'
export { RadioGroupField } from './RadioGroupField'
export { MatrixField } from './MatrixField'

// 🔄 Still parked - will re-export as fixed:
// - CurrencyField, NPSField, RankField, AddressField
