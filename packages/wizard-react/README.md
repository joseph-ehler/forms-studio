# @joseph.ehler/wizard-react

React runtime for Forms Studio: render any JSON field type with React Hook Form + Zod validation.

## Installation

```bash
npm install @joseph.ehler/wizard-react react react-dom react-hook-form zod
```

## Quick Start

```tsx
import { WizardRenderer } from '@joseph.ehler/wizard-react'

function App() {
  const flow = {
    chapters: [{
      steps: [{
        id: 'step1',
        type: 'form',
        fields: [
          { id: 'name', type: 'text', label: 'Name', validation: { required: true } },
          { id: 'age', type: 'number', label: 'Age', validation: { min: 18 } },
        ]
      }]
    }]
  }

  return (
    <WizardRenderer
      flow={flow}
      onSubmitStep={(payload) => {
        console.log('Step submitted:', payload)
      }}
    />
  )
}
```

## Features

- **JSON-driven**: Define forms in JSON, render in React
- **Field Registry**: Extensible system for custom field types
- **React Hook Form**: Battle-tested form management
- **Zod Validation**: Type-safe validation from JSON rules
- **Zero config**: Default fields work out of the box
- **Accessible**: ARIA labels, error messages, keyboard navigation

## Built-in Field Types

All field types include:
- ✅ Full validation support
- ✅ Error messages with ARIA
- ✅ Required indicators
- ✅ Description text
- ✅ Disabled state
- ✅ Keyboard navigation
- ✅ Focus management

### Available Fields

- **`text`** - Single-line text input with type support (email, tel, url, etc.)
- **`textarea`** - Multiline text with character count and auto-resize
- **`number`** - Numeric input with min/max/step and range display
- **`select`** - Dropdown select (single or multi-select)
- **`chips`** - Multi-select with visual tags and inline display
- **`toggle`** - Boolean switch with accessible keyboard controls

## Custom Fields

Register your own field types:

```tsx
import { FieldRegistry } from '@joseph.ehler/wizard-react'

// Custom currency field
const CurrencyField = ({ name, label, control, errors }) => (
  <div>
    <label>{label}</label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <input {...field} type="number" step="0.01" />
      )}
    />
  </div>
)

// Register it
FieldRegistry.register('currency', () => CurrencyField)

// Use in JSON
const field = {
  id: 'amount',
  type: 'currency',
  label: 'Amount',
  validation: { required: true, min: 0 }
}
```

## Complete Example

Here's a form using all field types:

```tsx
const flow = {
  chapters: [{
    steps: [{
      id: 'registration',
      type: 'form',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          placeholder: 'John Doe',
          description: 'Your legal name',
          validation: { required: true, minLength: 2 }
        },
        {
          id: 'bio',
          type: 'textarea',
          label: 'Bio',
          rows: 4,
          validation: { maxLength: 500 }
        },
        {
          id: 'age',
          type: 'number',
          label: 'Age',
          step: 1,
          validation: { required: true, min: 18, max: 120 }
        },
        {
          id: 'country',
          type: 'select',
          label: 'Country',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' }
          ],
          validation: { required: true }
        },
        {
          id: 'interests',
          type: 'chips',
          label: 'Interests',
          options: ['Sports', 'Music', 'Tech', 'Art'],
          validation: { minItems: 1, maxItems: 3 }
        },
        {
          id: 'terms',
          type: 'toggle',
          label: 'I accept the terms',
          description: 'Required to continue',
          validation: { required: true, mustBeTrue: true }
        }
      ]
    }]
  }]
}

<WizardRenderer flow={flow} onSubmitStep={(data) => console.log(data)} />
```

## Validation

JSON validation rules automatically map to Zod schemas:

```json
{
  "id": "email",
  "type": "text",
  "inputType": "email",
  "validation": {
    "required": true,
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "minLength": 5,
    "maxLength": 100
  }
}
```

## API

### `<WizardRenderer>`

Main component to render a wizard flow.

**Props:**
- `flow` - Validated flow JSON
- `currentStepIndex?` - Current step (default: 0)
- `onSubmitStep?` - Called when step is submitted

### `<FormScreen>`

Lower-level component to render a single form step.

**Props:**
- `fields` - Array of field definitions
- `defaultValues?` - Initial form values
- `onSubmit` - Submit handler
- `onChange?` - Change handler

### `FieldRegistry`

Central registry for field types.

**Methods:**
- `register(type, factory)` - Register a field type
- `resolve(type)` - Get field factory
- `list()` - List registered types

## Roadmap

- [ ] Chips/multi-select field
- [ ] Toggle/switch field
- [ ] Date picker field
- [ ] File upload field
- [ ] Phone number field
- [ ] Address field
- [ ] Async validation
- [ ] Theme system
- [ ] Storybook docs

## License

Apache-2.0

## Links

- [GitHub](https://github.com/joseph-ehler/forms-studio)
- [npm](https://www.npmjs.com/package/@joseph.ehler/wizard-react)
- [Core Package](https://www.npmjs.com/package/@joseph.ehler/wizard-core)
