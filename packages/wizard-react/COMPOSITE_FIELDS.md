# Composite Field Components

Composite fields are higher-level components built on top of foundation fields, providing enhanced UX and specialized functionality for common form patterns.

## Architecture

```
Foundation Fields (Basic building blocks)
├── TextField
├── TextareaField
├── NumberField
├── SelectField
├── ChipsField
└── ToggleField

Composite Fields (Enhanced components)
├── EmailField (TextField + email validation + icon)
├── PasswordField (TextField + visibility toggle + strength meter)
├── PhoneField (TextField + formatting + country code)
├── SearchField (TextField + clear button + search icon)
├── RadioGroupField (Enhanced select with visual cards)
└── AddressField (Multi-field composite with validation)
```

## Philosophy

1. **Composability**: Built on foundation components
2. **Specialization**: Optimized for specific use cases
3. **Progressive Enhancement**: Add features without bloating base components
4. **Accessibility First**: ARIA labels, keyboard navigation, screen readers
5. **Mobile Optimized**: Touch targets, input modes, formatting

## Foundation vs Composite

### Foundation Fields
- **Purpose**: Generic, reusable building blocks
- **Complexity**: Simple, minimal features
- **Size**: Small bundle impact
- **Use Case**: General-purpose inputs

### Composite Fields
- **Purpose**: Specialized, opinionated experiences
- **Complexity**: Enhanced UX with multiple features
- **Size**: Larger (icons, formatting, validation)
- **Use Case**: Common patterns (email, password, phone, address)

## Composite Field Reference

### EmailField

**Built on**: TextField  
**Features**:
- Email icon prefix
- Email input type & validation
- Auto-complete="email"
- Mobile email keyboard

**Usage**:
```json
{
  "id": "email",
  "type": "email",
  "label": "Email Address",
  "validation": {
    "required": true,
    "pattern": "^[^@]+@[^@]+\\.[^@]+$"
  }
}
```

---

### PasswordField

**Built on**: TextField  
**Features**:
- Show/hide password toggle
- Optional strength meter (5-level)
- Auto-complete hints
- Secure input masking

**Usage**:
```json
{
  "id": "password",
  "type": "password",
  "label": "Password",
  "showStrength": true,
  "autoComplete": "new-password",
  "validation": {
    "required": true,
    "minLength": 8
  }
}
```

**Strength Algorithm**:
- Length ≥8: +1 point
- Length ≥12: +1 point
- Mixed case: +1 point
- Contains numbers: +1 point
- Contains special chars: +1 point

**Levels**: Weak (≤2), Fair (3), Good (4), Strong (5)

---

### PhoneField

**Built on**: TextField  
**Features**:
- Auto-formatting: (555) 123-4567
- Country code prefix
- Phone icon
- Numeric keyboard on mobile
- Input sanitization

**Usage**:
```json
{
  "id": "phone",
  "type": "phone",
  "label": "Phone Number",
  "defaultCountryCode": "+1",
  "validation": {
    "required": true,
    "pattern": "^\\(\\d{3}\\) \\d{3}-\\d{4}$"
  }
}
```

---

### SearchField

**Built on**: TextField  
**Features**:
- Search icon prefix
- Clear button (X)
- Search input type
- Auto-clears on X click

**Usage**:
```json
{
  "id": "search",
  "type": "search",
  "placeholder": "Search products..."
}
```

---

### RadioGroupField

**Built on**: Custom (radio inputs)  
**Features**:
- Visual card selection
- Optional descriptions per option
- Horizontal or vertical layout
- Accessible keyboard navigation
- Disabled state per option

**Usage**:
```json
{
  "id": "plan",
  "type": "radio",
  "label": "Select a Plan",
  "layout": "vertical",
  "options": [
    {
      "value": "free",
      "label": "Free",
      "description": "Perfect for getting started"
    },
    {
      "value": "pro",
      "label": "Pro",
      "description": "$10/month - Advanced features"
    }
  ],
  "validation": {
    "required": true
  }
}
```

---

### AddressField

**Built on**: Multiple TextFields + SelectField  
**Features**:
- Street address (line 1 & 2)
- City, State, ZIP
- Optional country selector
- US state dropdown
- ZIP auto-formatting (numeric only)
- Compound field value

**Usage**:
```json
{
  "id": "address",
  "type": "address",
  "label": "Shipping Address",
  "showStreet2": true,
  "showCountry": false,
  "defaultCountry": "US",
  "validation": {
    "required": true
  }
}
```

**Value Structure**:
```typescript
{
  street: string
  street2?: string
  city: string
  state: string  // 2-letter code
  zip: string    // 5 digits
  country?: string
}
```

---

## Registration

Composite fields can be registered alongside foundation fields:

```tsx
import { FieldRegistry, EmailField, PasswordField } from '@joseph.ehler/wizard-react'

// Register composite fields
FieldRegistry.register('email', () => EmailField)
FieldRegistry.register('password', () => PasswordField)
FieldRegistry.register('phone', () => PhoneField)
FieldRegistry.register('search', () => SearchField)
FieldRegistry.register('radio', () => RadioGroupField)
FieldRegistry.register('address', () => AddressField)
```

---

## Building Custom Composites

Create your own composite fields following this pattern:

```tsx
import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from '@joseph.ehler/wizard-react'

export const CurrencyField: React.FC<FieldComponentProps> = ({
  name, label, required, control, errors, json
}) => {
  const currency = json?.currency ?? 'USD'
  const symbol = currency === 'USD' ? '$' : '€'

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
              {symbol}
            </span>
            <input
              type="number"
              step="0.01"
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
              className="w-full rounded-md border pl-8 pr-3 py-2"
            />
          </div>
        )}
      />
      {errors?.[name] && (
        <p className="text-sm text-red-600">{String(errors[name].message)}</p>
      )}
    </div>
  )
}

// Register it
FieldRegistry.register('currency', () => CurrencyField)
```

---

## Bundle Impact

| Field Type | Approx Size | Dependencies |
|-----------|-------------|--------------|
| Foundation | 2-3 KB | React, RHF |
| Email | +1 KB | SVG icon |
| Password | +2 KB | SVG icons, strength logic |
| Phone | +1.5 KB | Formatting logic |
| Search | +1 KB | SVG icons |
| Radio | +2 KB | Card styling |
| Address | +3 KB | State list, multi-inputs |

**Tree-shaking**: Import only what you need!

```tsx
// ✅ Good - imports only EmailField
import { EmailField } from '@joseph.ehler/wizard-react'

// ⚠️ Less optimal - imports everything
import * as WizardReact from '@joseph.ehler/wizard-react'
```

---

## Best Practices

### 1. Use Composites for Common Patterns
❌ Don't rebuild email validation everywhere  
✅ Use EmailField for consistent UX

### 2. Foundation for Custom Needs
❌ Don't extend composites (complexity)  
✅ Build custom composites from foundation

### 3. Keep JSON Config Simple
❌ Don't expose every internal prop  
✅ Provide sensible defaults, minimal config

### 4. Accessibility Always
❌ Don't skip ARIA labels  
✅ Every field has proper semantics

### 5. Mobile Optimization
❌ Don't use generic text inputs  
✅ Use appropriate input types & modes

---

## Future Composites (Roadmap)

### Week 1
- [x] EmailField
- [x] PasswordField
- [x] PhoneField
- [x] SearchField
- [x] RadioGroupField
- [x] AddressField

### Week 2
- [ ] DateField (picker + validation)
- [ ] TimeField (12/24hr support)
- [ ] DateTimeField (combined)
- [ ] RangeField (dual number inputs)

### Week 3
- [ ] FileField (drag & drop, preview)
- [ ] ColorField (picker + hex input)
- [ ] SliderField (visual range selector)
- [ ] RatingField (star rating)

### Week 4
- [ ] SignatureField (canvas signature)
- [ ] LocationField (map picker)
- [ ] TagsField (autocomplete chips)
- [ ] MarkdownField (editor + preview)

---

## Testing Composites

Each composite should have:
1. **Rendering tests**: Mounts correctly
2. **Interaction tests**: User input works
3. **Validation tests**: Errors display
4. **Accessibility tests**: ARIA + keyboard
5. **Visual regression tests**: Snapshot matching

Example test:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { EmailField } from './EmailField'

test('EmailField validates email format', async () => {
  const { rerender } = render(<EmailField name="email" control={mockControl} />)
  
  const input = screen.getByLabelText('Email')
  fireEvent.change(input, { target: { value: 'invalid' } })
  
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
})
```

---

## License

Apache-2.0 - Same as core package
