/**
 * Field Registration
 * 
 * Register default field types with the registry.
 */

import { TextField } from './TextField'
import { TextareaField } from './TextareaField'
import { NumberField } from './NumberField'
import { SelectField } from './SelectField'
import { ChipsField } from './ChipsField'
import { ToggleField } from './ToggleField'
import { DateField } from './DateField'
import { TimeField } from './TimeField'
import { DateTimeField } from './DateTimeField'
import { SliderField } from './SliderField'
// import { RatingField } from './RatingField'  // Temporarily disabled
// import { RepeaterField } from './RepeaterField'  // Temporarily disabled
// import { SignatureField } from './SignatureField'  // Temporarily disabled
import { FileField } from './FileField'
import { CalculatedField } from './CalculatedField'
// import { ColorField } from './ColorField'  // Temporarily disabled
// import { RangeField } from './RangeField'  // Temporarily disabled
// Composite fields (3 fixed, rest still parked)
import { EmailField, PasswordField, SearchField } from './composite'
// Still parked: PhoneField, DateRangeField, MatrixField, OTPField, TableField
import { registerFields } from './registry'

export function registerDefaultFields() {
  registerFields({
    // Foundation fields
    text: () => TextField,
    textarea: () => TextareaField,
    number: () => NumberField,
    select: () => SelectField,
    chips: () => ChipsField,
    toggle: () => ToggleField,
    date: () => DateField,
    time: () => TimeField,
    datetime: () => DateTimeField,
    slider: () => SliderField,
    // rating: () => RatingField,  // Temporarily disabled
    // repeater: () => RepeaterField,  // Temporarily disabled
    // signature: () => SignatureField,  // Temporarily disabled
    file: () => FileField,
    calculated: () => CalculatedField,
    // color: () => ColorField,  // Temporarily disabled
    // range: () => RangeField,  // Temporarily disabled
    
    // Composite fields (3 working, rest parked)
    email: () => EmailField,
    password: () => PasswordField,
    search: () => SearchField,
    // Still parked:
    // phone: () => PhoneField,
    // daterange: () => DateRangeField,
    // matrix: () => MatrixField,
    // otp: () => OTPField,
    // table: () => TableField,
  })
}
