/**
 * @intstudio/ds - Design System Studio
 * 
 * PUBLIC API
 * 
 * This barrel defines what external consumers can import.
 * Keep this minimal and stable. Use internal.ts for test-only exports.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 STYLES (CSS @layer system)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import './styles/layers.css'            // @layer definition
import './styles/tokens/color.vars.css'
import './styles/tokens/typography.vars.css'
import './styles/tokens/surface.vars.css'
import './styles/tokens/button.vars.css'
import './styles/tokens/input.vars.css'
import './styles/tokens/layout.vars.css'
import './styles/tokens/media.vars.css'
import './styles/tokens/section.vars.css'
import './styles/tokens/shell.vars.css'
import './styles/tokens/fab.vars.css'
import './styles/tokens/density.vars.css'
import './styles/tokens/a11y.vars.css'

// Component skins
import './styles/components/ds-typography.css'
import './styles/components/ds-inputs.css'
import './styles/components/ds-grid.css'
import './styles/components/ds-form-layout.css'
import './styles/components/ds-media.css'
import './styles/components/ds-section.css'
import './styles/components/ds-prose.css'
import './styles/components/ds-fab.css'
import './styles/components/ds-icons.css'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 PRIMITIVES (basic building blocks)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './primitives'

// Typography primitives (for form fields)
export { FormLabel, FormHelperText } from './components/typography'
export type { FormLabelProps, FormHelperTextProps } from './components/typography'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📐 PATTERNS (composed layouts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './patterns'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 SHELL (app shell components)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './shell'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ♿ A11Y (accessibility layer)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './a11y'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 WHITE-LABEL (brand system)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './white-label'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 UTILS (public utilities only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// export { type LayoutPreset } from './utils';  // TODO: Add back when utils exports it

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 TOKENS (optional typed tokens map)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// TODO: Create unified tokens object
// export { tokens } from './tokens'
export * from './tokens'  // Export individual token modules for now

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 FIELDS (temporary - will move to @intstudio/forms)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Core renderer
export * from './renderer/FormScreen'

// Field system
export { FieldRegistry, registerFields } from './fields/registry'
export { registerDefaultFields } from './fields/createField'
export type { FieldComponent, FieldComponentProps, FieldFactory } from './fields/types'

// Foundation fields
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

// Composite fields
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

// Validation & RHF
export * from './validation/mapJsonValidationToZod'
export * from './rhf/zodResolver'
