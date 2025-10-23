# 🚀 Next Session: AsyncSearchSelect Recipe

**Status:** Ready to start  
**Branch:** `feat/unified-overlay-system` (or new branch)  
**Prerequisites:** ✅ All complete

---

## 🏃 Quick Start (Copy-Paste Ready)

```bash
# 1. Verify everything is green
pnpm -w build
pnpm refine:dry
node scripts/analyzer/analyze-batch.mjs --quiet "packages/forms/src/fields/**/*.tsx" | jq '.aggregate.compliance'

# 2. Create the spec
cat > specs/fields/CitySelectField.yaml << 'EOF'
name: CitySelectField
type: select
specVersion: "1.2"
description: Async search select with debounce
ui:
  behavior: async-search
ports:
  - name: optionSource
    type: OptionSourcePort
  - name: telemetry
    type: TelemetryPort
props:
  - name: placeholder
    type: string
    required: false
    default: "Search..."
value:
  default: null
EOF

# 3. Add overlay defaults for select
# (Edit factory-overlays.yaml - see below)

# 4. Generate!
pnpm field:new CitySelectField
pnpm -F @intstudio/forms build
```

---

## 📦 Overlay Defaults to Add

**In `factory-overlays.yaml`:**

```yaml
# Based on batch analysis of 23 fields:
# - 21/23 (91%) are simple text-like inputs
# - 100% use Controller, FormLabel, FormHelperText, Stack
# - 100% have name, control, errors, label, description, required, disabled props
# - 39% have placeholder prop

defaults:
  # All text-like inputs (text, email, tel, url, etc.)
  # Archetype: Simple Text (21 fields, 91% of codebase)
  text:
    ui:
      variant: default
      density: cozy
      size: md
      fullWidth: true
    validation:
      sync:
        required: false
    accessibility:
      label: true
      description: true
      htmlFor: true  # FormLabel must have htmlFor={name}
      ariaDescribedBy: true  # Inputs should link to helper text
      ariaInvalid: true  # Inputs should indicate error state
    performance:
      debounce: 0
      lazy: false
    structure:
      # Every field follows this 3-component pattern
      wrapper: Stack
      label: FormLabel
      control: Controller  # RHF integration
      helper: FormHelperText

  # NEW: Select fields (async search)
  select:
    ui:
      variant: default
      density: cozy
      size: md
      fullWidth: true
      searchable: true  # Enable search by default
    validation:
      sync:
        required: false
    accessibility:
      label: true
      description: true
      htmlFor: true
      ariaDescribedBy: true
      ariaInvalid: true
    performance:
      debounce: 0
      debounceChangeMs: 200  # For async search
      lazy: false
    structure:
      wrapper: Stack
      label: FormLabel
      control: Controller
      helper: FormHelperText
```

---

## 🎯 Generator Changes Needed

### **1. Detect async-search behavior**

```javascript
// In field-from-spec-v2.mjs
const isAsyncSearch = spec.type === 'select' && spec.ui?.behavior === 'async-search';
```

### **2. Generate adapter ports**

```typescript
// adapters.ts (generated when ports specified)
export interface OptionSourcePort {
  fetch(
    query: string,
    options: { pageSize?: number },
    signal: AbortSignal
  ): Promise<Array<{ value: string; label: string }>>;
}

export const defaultOptionSourceAdapter: OptionSourcePort = {
  async fetch(query, { pageSize = 25 }, signal) {
    // Mock implementation for demo
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    const filtered = cities.filter(c => 
      c.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.slice(0, pageSize).map(city => ({
      value: city.toLowerCase().replace(/\s+/g, '-'),
      label: city
    }));
  }
};
```

### **3. Generate component with async logic**

```typescript
// CitySelectField.tsx (sketch)
export function CitySelectField({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  placeholder = 'Search...',
  optionSourcePort = defaultOptionSourceAdapter,
  telemetryAdapter = defaultTelemetryAdapter
}: CitySelectFieldProps) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = useMemo(
    () => debounce(200, async (query: string) => {
      setLoading(true);
      try {
        const items = await optionSourcePort.fetch(
          query, 
          { pageSize: 25 }, 
          new AbortController().signal
        );
        setOptions(items);
      } finally {
        setLoading(false);
      }
    }),
    [optionSourcePort]
  );

  return (
    <Stack spacing="tight">
      {label && (
        <FormLabel htmlFor={name} required={required} size="md">
          {label}
        </FormLabel>
      )}

      <Controller
        name={name as any}
        control={control as any}
        render={({ field }) => (
          <Select
            className="ds-input w-full"
            searchable
            loading={loading}
            placeholder={placeholder}
            onSearch={handleSearch}
            options={options}
            value={field.value}
            onChange={(opt) => {
              field.onChange(opt?.value ?? null);
              telemetryAdapter.emit('field_select', { 
                schemaPath: name as string, 
                fieldType: 'select' 
              });
            }}
            onBlur={field.onBlur}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={description ? `${name}-desc` : undefined}
          />
        )}
      />

      {/* Helper text, error handling... */}
    </Stack>
  );
}
```

---

## 🧪 Testing Checklist

```bash
# 1. Generator test still passes
pnpm generator:test

# 2. Refiner finds no violations
pnpm refine:dry

# 3. Build succeeds
pnpm -F @intstudio/forms build

# 4. Compliance maintained
node scripts/analyzer/analyze-batch.mjs --quiet "packages/forms/src/fields/**/*.tsx" | jq '.aggregate.compliance'

# Expected: All 23 (or 24 with new field) at 100%
```

---

## 📝 Success Criteria

- [ ] Generator detects `ui.behavior: async-search`
- [ ] Generates `adapters.ts` with `OptionSourcePort` + default implementation
- [ ] Generates component with debounced search
- [ ] Component accepts `optionSourcePort` prop for override
- [ ] Falls back to default adapter if not provided
- [ ] Inherits select defaults from `factory-overlays.yaml`
- [ ] All existing tests still pass
- [ ] New field builds without errors
- [ ] Compliance metrics remain 100%

---

## 🎯 The Pattern

This establishes the **Recipe Pattern**:

1. **Detect** via `spec.ui.behavior`
2. **Generate ports** from `spec.ports` array
3. **Provide defaults** so it works out of the box
4. **Allow overrides** via props
5. **Inherit from overlays** (DRY config)

**Future recipes:**
- `DatePicker` (ui.behavior: date-range)
- `DragDropUpload` (ui.behavior: drag-drop)
- `CurrencyInput` (ui.behavior: currency)

---

## 🔄 The Self-Improving Loop (In Action)

```
Batch Analysis
   ↓
Overlays (select defaults)
   ↓
Generator v2.5 (auto-merge)
   ↓
AsyncSearchSelect (inherits everything)
   ↓
Works perfectly out of the box ✨
```

---

## 💡 Key Insight

**Generator v2.5 means:**
- Overlay defaults for `select` → apply to ALL select fields
- Recipe logic → only for `ui.behavior: async-search`
- Adapter defaults → runtime swappable
- Zero boilerplate in specs

**DRY at scale achieved.** 🎯

---

**Ready to make selects sing!** 🎶
