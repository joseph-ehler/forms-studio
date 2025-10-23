# Composite Field Quickstart

**Generator v2.2+** supports composite fields with multiple input parts.

---

## **Minimal Working Example**

```yaml
name: RangeCompositeField
type: composite
specVersion: "1.0"
description: Min/Max range selector
metadata:
  batch: 6
  difficulty: complex
  added: "2025-10-23"
composite:
  layout: row      # row | stack | grid
  gap: tight       # none | tight | normal | loose
  separator: "to"  # Optional text between parts
  parts:
    - name: min
      type: number
      label: Min
      props:
        - name: placeholder
          type: string
          default: "0"
    - name: max
      type: number
      label: Max
      props:
        - name: placeholder
          type: string
          default: "100"
value:
  default: "{ min: 0, max: 100 }"
  structure: composite
aria:
  live: polite
  invalid: hasError
  describedby: description
facade:
  enabled: true
  removal: v2.0.0
  codemod: pnpm codemod:fields
```

---

## **Supported Part Types**

All standard HTML input types:
- `text`, `email`, `number`, `tel`, `url`
- `date`, `time`, `datetime-local`
- `checkbox`, `radio`
- And more...

---

## **Layout Options**

### `row` (default)
Parts displayed horizontally side-by-side.

### `stack`
Parts displayed vertically.

### `grid`
Parts displayed in a grid (auto-flow).

---

## **Gap Options**

- `none` - No spacing
- `tight` - 8px
- `normal` - 12px
- `loose` - 16px

---

## **Generate & Use**

```bash
# 1. Create your spec
vim specs/fields/MyCompositeField.yaml

# 2. Generate
pnpm field:new MyCompositeField

# 3. Build
pnpm -F @intstudio/forms build

# 4. Use
import { MyCompositeField } from '@intstudio/forms/fields';

<MyCompositeField
  name="myField"
  control={control}
  errors={errors}
  label="My Composite"
  description="Enter values"
/>
```

---

## **Common Patterns**

### Date Range
```yaml
name: DateRangeCompositeField
type: composite
composite:
  layout: row
  gap: normal
  separator: "to"
  parts:
    - { name: start, type: date, label: Start }
    - { name: end, type: date, label: End }
```

### Address
```yaml
name: AddressCompositeField
type: composite
composite:
  layout: stack
  gap: normal
  parts:
    - { name: street, type: text, label: Street }
    - { name: city, type: text, label: City }
    - { name: zip, type: text, label: ZIP }
```

### Lat/Long
```yaml
name: LocationField
type: composite
composite:
  layout: row
  gap: normal
  parts:
    - { name: lat, type: number, label: Latitude }
    - { name: lng, type: number, label: Longitude }
```

---

## **Troubleshooting**

### Missing Base Props
**Error:** `required` or `disabled` undefined

**Fix:** Ensure Generator v2.1+ which includes base props by default.

### Invalid DOM Props
**Error:** Props like `multiple` on wrong input type

**Fix:** Run Refiner to auto-correct:
```bash
pnpm refine:run --scope="packages/forms/src/fields/MyField/**/*.tsx"
```

### Duplicate Attributes
**Error:** Same JSX attribute twice

**Fix:** Refiner v1.2 auto-detects and removes. Run:
```bash
pnpm refine:dry --scope="packages/forms/src/fields/**/*.tsx"
```

### TypeScript Errors
**Error:** Path type mismatch for nested fields

**Fix:** Generator uses `as any` cast for composite Controller names. This is expected.

---

## **Schema Reference**

See `specs/_schema.json` for the complete composite spec schema.

Key composite-specific properties:
- `composite.layout` - Layout direction
- `composite.gap` - Spacing between parts
- `composite.separator` - Text between parts (optional)
- `composite.parts[]` - Array of part definitions
  - `name` - Part identifier (becomes `${name}.${partName}`)
  - `type` - HTML input type
  - `label` - Part-specific label
  - `props` - Part-specific props (optional)

---

**Generated with God Tier Factory v2.2** 🏆
