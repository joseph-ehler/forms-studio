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
// Composite fields (12 working, 1 parked)
import { EmailField, PasswordField, SearchField, PhoneField, OTPField, TableField, DateRangeField, RadioGroupField, MatrixField, CurrencyField, NPSField, AddressField } from './composite'
// Parked: RankField (drag & drop complexity)
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
    
    // Composite fields (12 working)
    email: () => EmailField,
    password: () => PasswordField,
    search: () => SearchField,
    phone: () => PhoneField,
    otp: () => OTPField,
    table: () => TableField,
    daterange: () => DateRangeField,
    radiogroup: () => RadioGroupField,
    matrix: () => MatrixField,
    currency: () => CurrencyField,
    nps: () => NPSField,
    address: () => AddressField,
    // Parked: rank (drag & drop)
  })
}
