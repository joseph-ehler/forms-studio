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
import { RatingField } from './RatingField'
import { RepeaterField } from './RepeaterField'
import { SignatureField } from './SignatureField'
import { FileField } from './FileField'
import { CalculatedField } from './CalculatedField'
import { ColorField } from './ColorField'
import { RangeField } from './RangeField'
// Composite fields (ALL 13 COMPLETE! 🎉)
import { EmailField, PasswordField, SearchField, PhoneField, OTPField, TableField, DateRangeField, RadioGroupField, MatrixField, CurrencyField, NPSField, AddressField, RankField } from './composite'
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
    rating: () => RatingField,
    repeater: () => RepeaterField,
    signature: () => SignatureField,
    file: () => FileField,
    calculated: () => CalculatedField,
    color: () => ColorField,
    range: () => RangeField,
    
    // Composite fields (ALL 13 COMPLETE! 🎉)
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
    rank: () => RankField,
  })
}
