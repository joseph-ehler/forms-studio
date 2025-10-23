# 🏆 God Tier Factory Architecture

**Status:** Level 1 Complete ✅ | Blueprint Defined

---

## **Philosophy: Manufacturing Experiences, Not Components**

The factory doesn't generate "rudimentary implementations"—it manufactures **complete, production-ready experiences** with:

- ✅ Resilient validation (sync + async)
- ✅ Built-in telemetry (privacy-aware)
- ✅ Accessibility by default (ARIA, keyboard, focus)
- ✅ Performance guarantees (budgets, debounce, abort)
- ✅ I18n ready (messages, formatting)
- ✅ Security hardened (sanitization, allowlists)
- ✅ Self-healing (Refiner continuously corrects)

**"God Tier" = Systematized Excellence**

---

## **Architecture Layers**

```
SPEC (YAML) - Single source of truth
    ↓
FACTORY - Generates multiple artifacts
    ├─ Component.tsx (UI + UX recipe)
    ├─ adapters.ts (ports & impl)
    ├─ events.ts (typed telemetry)
    ├─ a11y.ts (helpers)
    ├─ tests.spec.tsx (golden tests)
    ├─ stories.tsx (Storybook matrix)
    └─ docs.md (auto-generated)
    ↓
REFINER - Continuous quality enforcement
    ↓
CI GATES - Automated verification
    ↓
PRODUCTION - Delightful by default
```

---

## **LEVEL 1: Visual Polish** ✅ COMPLETE

**Shipped:** Generator v2.3

### **What Changed**
- Replaced inline styles with `ds-input` classes
- Tailwind utilities for layout
- DS design tokens automatic
- Zero behavior changes

### **Impact**
- 70-80% visual polish instantly
- Matches DS demo aesthetic
- Fields "feel" professional

### **Files Updated**
- `test-generator.mjs`
- `field-from-spec-v2.mjs`
- `generate-composite-v2.2.mjs`

---

## **LEVEL 2: Extended Spec Schema** 📋 NEXT

Extend YAML spec to capture **non-visual requirements** declaratively.

### **New Spec Blocks**

```yaml
name: EmailField
type: email
specVersion: "1.2"

# ========================================
# VALIDATION (sync + async)
# ========================================
validation:
  sync:
    required: true
    email: true
    minLength: 8
  async:
    - id: unique-address
      debounceMs: 300
      url: /api/users/check-email
      method: GET
      queryKey: email
      onFailMessage: "This email is already in use."
      retryPolicy:
        maxAttempts: 3
        backoffMs: [100, 200, 400]

# ========================================
# UI HINTS (design intent)
# ========================================
ui:
  behavior: async-search | masked | drag-drop | currency
  size: sm | md | lg
  variant: default | quiet | danger
  density: compact | cozy | comfortable
  searchable: true           # for select
  showShortcut: true         # for date
  iconLeft: search           # maps to DS icons
  prefix: "$"                # text prefix
  suffix: "kg"               # text suffix
  fullWidth: true

# ========================================
# TELEMETRY (observability)
# ========================================
telemetry:
  enabled: true
  events: [focus, change, validate, submit]
  pii: redact | hash | allow

# ========================================
# PERFORMANCE (budgets)
# ========================================
perf:
  budgetMs: 50               # max render time
  debounceChangeMs: 50       # change event throttle
  idleValidation: true       # validate on idle

# ========================================
# I18N (localization)
# ========================================
i18n:
  messagesKey: forms.email   # locale bundle key
  numberFormat: null         # for number/currency
  dateFormat: null           # for date/time

# ========================================
# SECURITY (hardening)
# ========================================
security:
  sanitize: true             # XSS protection
  allowListPattern: null     # extra input constraints

# ========================================
# A11Y (accessibility)
# ========================================
a11y:
  live: polite | assertive
  describedBy: helper
  role: null                 # override if needed
```

### **Benefits**
- Quality is **declarative**
- Non-engineers can specify requirements
- Factory enforces consistency
- Refiner validates compliance

---

## **LEVEL 3: Ports & Adapters**

**Decoupling is the Key to Flexibility**

### **Core Ports**

```typescript
// ValidationPort - sync + async validation
interface ValidationPort {
  validateSync(value: any, schema: ZodSchema): ValidationResult;
  validateAsync(
    value: any,
    config: AsyncValidationConfig,
    signal: AbortSignal
  ): Promise<ValidationResult>;
}

// OptionSourcePort - data fetching for selects
interface OptionSourcePort {
  fetch(
    query: string,
    pagination: PaginationConfig,
    signal: AbortSignal
  ): Promise<Option[]>;
}

// MaskPort - formatting (currency, phone)
interface MaskPort {
  formatOnBlur(value: string): string;
  rawOnFocus(value: string): string;
}

// TelemetryPort - analytics events
interface TelemetryPort {
  emit(eventName: string, payload: FieldEvent): void;
}

// SecurityPort - input sanitization
interface SecurityPort {
  sanitize(value: string): string;
  allowListCheck(value: string, pattern?: RegExp): boolean;
}

// I18nPort - translations
interface I18nPort {
  t(key: string, params?: Record<string, any>): string;
  formatNumber(value: number, locale?: string): string;
  formatDate(value: Date, format?: string): string;
}
```

### **Default Adapters**

Factory generates **default adapters** with sensible impl:

```typescript
// adapters.ts (generated per field)
import { ValidationPort } from '@intstudio/forms/ports';

export const defaultValidationAdapter: ValidationPort = {
  validateSync: (value, schema) => {
    const result = schema.safeParse(value);
    return result.success
      ? { valid: true }
      : { valid: false, errors: result.error.errors };
  },
  
  validateAsync: async (value, config, signal) => {
    const response = await fetch(
      `${config.url}?${config.queryKey}=${encodeURIComponent(value)}`,
      { signal }
    );
    
    if (!response.ok) {
      return {
        valid: false,
        errors: [{ message: config.onFailMessage }],
      };
    }
    
    return { valid: true };
  },
};
```

**Consumers can swap adapters** at app level without touching generated fields.

---

## **LEVEL 4: UX Recipes**

**Recipes = Codified Delightful Patterns**

### **Recipe Library**

| Recipe | Description | Ports Used |
|--------|-------------|------------|
| **AsyncSearchSelect** | Search-as-you-type, debounced, keyboard nav | OptionSource, Telemetry |
| **DatePicker** | Calendar popover, presets ("Today"), min/max | I18n, Telemetry |
| **DragDropUpload** | Drag & drop, paste, progress, preview | Security, Telemetry |
| **CurrencyInput** | Thousands separator, blur format, focus raw | Mask, I18n |
| **Rating** | Half-steps, custom icons, keyboard, preview | Telemetry |
| **Location** | Lat/Lng with map picker (optional) | Telemetry |
| **AddressComposite** | Multi-part with suggestions, country-aware | OptionSource, I18n |
| **Repeater** | Add/remove rows, focus management, validation summary | Validation, Telemetry |

### **How Recipes Work**

```typescript
// Recipe selector in generator
function selectRecipe(spec) {
  const { type, ui } = spec;
  
  if (type === 'select' && ui?.behavior === 'async-search') {
    return AsyncSearchSelectRecipe;
  }
  
  if (type === 'date' && ui?.showShortcut) {
    return DatePickerRecipe;
  }
  
  if (type === 'file' && ui?.behavior === 'drag-drop') {
    return DragDropUploadRecipe;
  }
  
  // Default recipe
  return SimpleInputRecipe;
}

// Recipe generates enhanced JSX
const AsyncSearchSelectRecipe = (spec, ports) => `
<SelectField
  {...baseProps}
  searchable={true}
  onSearch={debounce(300, ports.optionSource.fetch)}
  onSelect={(option) => {
    field.onChange(option.value);
    ports.telemetry.emit('field_select', {
      schemaPath: name,
      optionValue: option.value,
    });
  }}
/>
`;
```

---

## **LEVEL 5: Validation Pipeline**

**Full Lifecycle Coverage**

### **On Change**
```typescript
1. sanitize(value)              // Security
2. debounce(perf.debounceMs)    // Performance
3. validateSync(zod)            // Quick check
4. emit('field_change')         // Telemetry
5. Don't flash error (unless touched)
```

### **On Blur**
```typescript
1. validateSync(zod)            // Full sync
2. mark touched
3. kickoff async validators     // With AbortController
4. show "validating..." state
5. emit('field_validate_async')
6. cancel prior in-flight
```

### **On Submit**
```typescript
1. validateSync all fields
2. await all async results
3. focus first invalid field
4. emit('field_submit')
5. aggregate errors
```

### **Generated Validation Logic**

```typescript
// EmailField.tsx (generated snippet)
const handleBlur = async () => {
  field.onBlur();
  setTouched(true);
  
  // Sync validation
  const syncResult = validationAdapter.validateSync(
    field.value,
    zodSchema
  );
  
  if (!syncResult.valid) {
    setError(syncResult.errors[0].message);
    return;
  }
  
  // Async validation
  if (spec.validation?.async) {
    setValidating(true);
    abortControllerRef.current?.abort();
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const asyncResult = await validationAdapter.validateAsync(
        field.value,
        spec.validation.async[0],
        controller.signal
      );
      
      if (!asyncResult.valid) {
        setError(asyncResult.errors[0].message);
        telemetryPort.emit('field_validate_fail', {
          schemaPath: name,
          errorCode: 'async_fail',
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Validation failed. Please try again.');
      }
    } finally {
      setValidating(false);
    }
  }
};
```

---

## **LEVEL 6: Telemetry Events**

**Privacy-Aware, Structured, Typed**

### **Event Schema**

```typescript
type FieldEvent = {
  schemaPath: string;        // "user.email"
  fieldType: string;         // "email"
  formId?: string;
  valueSample?: string;      // redacted/hash per spec
  valid?: boolean;
  errorCode?: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
};
```

### **Event Types**

| Event | Fired When | Payload |
|-------|-----------|---------|
| `field_focus` | Input gains focus | schemaPath, fieldType |
| `field_blur` | Input loses focus | schemaPath, durationMs |
| `field_change` | Value changes (debounced) | schemaPath (no value) |
| `field_validate_sync` | Sync validation runs | schemaPath, valid, errorCode |
| `field_validate_async` | Async validation runs | schemaPath, valid, durationMs |
| `field_validate_fail` | Validation fails | schemaPath, errorCode, errorMessage (hashed) |
| `field_submit` | Form submitted | formId, fieldCount, invalidCount |

### **Generated Telemetry**

```typescript
// events.ts (generated)
import { TelemetryPort } from '@intstudio/forms/ports';

export function emitFieldEvent(
  port: TelemetryPort,
  eventName: string,
  payload: FieldEvent
) {
  // Privacy filter
  const sanitized = { ...payload };
  
  if (spec.telemetry.pii === 'redact') {
    delete sanitized.valueSample;
  } else if (spec.telemetry.pii === 'hash') {
    sanitized.valueSample = sha256(payload.valueSample || '');
  }
  
  port.emit(eventName, sanitized);
}
```

---

## **LEVEL 7: Refiner Rules** (Self-Healing)

**Continuous Quality Enforcement**

### **New Rules**

```javascript
// refiner/transforms/no-inline-styles-v1.0.mjs
export function checkInlineStyles(ast) {
  const violations = [];
  
  traverse(ast, {
    JSXAttribute(path) {
      if (path.node.name.name === 'style') {
        violations.push({
          line: path.node.loc.start.line,
          message: 'Inline styles forbidden. Use DS classes.',
        });
      }
    },
  });
  
  return violations;
}

// refiner/transforms/label-contract-v1.0.mjs
export function checkLabelContract(ast) {
  const violations = [];
  
  traverse(ast, {
    JSXElement(path) {
      const name = path.node.openingElement.name.name;
      
      if (name === 'FormLabel') {
        const attrs = path.node.openingElement.attributes;
        const hasHtmlFor = attrs.some(
          a => a.name?.name === 'htmlFor'
        );
        
        if (!hasHtmlFor) {
          violations.push({
            line: path.node.loc.start.line,
            message: 'FormLabel must have htmlFor prop',
          });
        }
      }
    },
  });
  
  return violations;
}

// refiner/transforms/telemetry-presence-v1.0.mjs
export function checkTelemetryPresence(ast, spec) {
  if (!spec.telemetry?.enabled) return [];
  
  const violations = [];
  const hasEmitImport = ast.program.body.some(
    node =>
      node.type === 'ImportDeclaration' &&
      node.specifiers.some(s => s.imported?.name === 'emitFieldEvent')
  );
  
  if (!hasEmitImport) {
    violations.push({
      message: 'Telemetry enabled but emitFieldEvent not imported',
    });
  }
  
  return violations;
}
```

### **Refiner v1.3 Checks**

1. ✅ Prop allowlist (v1.1)
2. ✅ Duplicate JSX attrs (v1.2)
3. 🆕 No inline styles (v1.3)
4. 🆕 Label contract (v1.3)
5. 🆕 Telemetry presence (v1.3)

---

## **LEVEL 8: CI Gates**

**Quality You Can Trust**

### **PR Checks** (`.github/workflows/factory-quality.yml`)

```yaml
name: Factory Quality Gates

on: [pull_request]

jobs:
  factory-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      
      - name: Generator Self-Tests
        run: pnpm generator:test
      
      - name: Refiner Scan
        run: pnpm refine:dry --scope="packages/forms/src/fields/**/*.tsx"
      
      - name: Axe A11y Tests
        run: pnpm test:a11y
      
      - name: Size Budget
        run: pnpm size:check
      
      - name: Telemetry Schema Validation
        run: pnpm telemetry:validate
      
      - name: Build
        run: pnpm -F @intstudio/forms build
```

### **Nightly Sweeper**

```yaml
name: Nightly Factory Maintenance

on:
  schedule:
    - cron: '0 2 * * *'

jobs:
  auto-heal:
    runs-on: ubuntu-latest
    steps:
      - name: Run Refiner (auto-fix)
        run: pnpm refine:run --scope="packages/forms/src/fields/**/*.tsx"
      
      - name: Regenerate Stories
        run: pnpm stories:generate
      
      - name: Update Snapshots
        run: pnpm test:update-snapshots
      
      - name: Create PR
        if: changes detected
        uses: peter-evans/create-pull-request@v5
        with:
          title: '🤖 Nightly Factory Maintenance'
          body: |
            - Refiner fixes applied
            - Stories regenerated
            - Snapshots updated
```

---

## **LEVEL 9: Generated Artifacts**

**One Spec → Multiple Files**

```
packages/forms/src/fields/EmailField/
├── EmailField.tsx              # Component (UI + recipe)
├── adapters.ts                 # Port implementations
├── events.ts                   # Typed telemetry events
├── a11y.ts                     # ARIA helpers
├── schema.ts                   # Zod validation schema
├── __tests__/
│   ├── EmailField.spec.tsx     # Unit tests
│   ├── EmailField.a11y.spec.tsx # Axe tests
│   └── EmailField.e2e.spec.ts  # Playwright
├── stories/
│   └── EmailField.stories.tsx  # Storybook matrix
├── docs/
│   └── EmailField.md           # Auto-generated docs
└── index.ts                    # Exports
```

### **Example: `adapters.ts` (Generated)**

```typescript
/**
 * EmailField Adapters
 * 
 * Auto-generated from spec/fields/EmailField.yaml
 * Generator v2.3
 */

import type {
  ValidationPort,
  TelemetryPort,
  SecurityPort,
} from '@intstudio/forms/ports';

// ========================================
// Validation Adapter
// ========================================
export const validationAdapter: ValidationPort = {
  validateSync: (value, schema) => {
    const result = schema.safeParse(value);
    return result.success
      ? { valid: true }
      : { valid: false, errors: result.error.errors };
  },
  
  validateAsync: async (value, config, signal) => {
    const response = await fetch(
      `${config.url}?${config.queryKey}=${encodeURIComponent(value)}`,
      { signal }
    );
    
    if (!response.ok) {
      return {
        valid: false,
        errors: [{ message: config.onFailMessage }],
      };
    }
    
    return { valid: true };
  },
};

// ========================================
// Telemetry Adapter
// ========================================
export const telemetryAdapter: TelemetryPort = {
  emit: (eventName, payload) => {
    // Default: console logging in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry] ${eventName}`, payload);
    }
    
    // Production: Send to analytics service
    // window.analytics?.track(eventName, payload);
  },
};

// ========================================
// Security Adapter
// ========================================
export const securityAdapter: SecurityPort = {
  sanitize: (value) => {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  
  allowListCheck: (value, pattern) => {
    if (!pattern) return true;
    return pattern.test(value);
  },
};
```

---

## **LEVEL 10: Developer Experience**

**Make It Easy to Verify**

### **New Commands**

```bash
# Preview field in isolated sandbox
pnpm field:preview EmailField

# Measure performance
pnpm field:perf EmailField

# Validate telemetry events
pnpm field:telemetry EmailField

# Generate comprehensive docs
pnpm field:docs EmailField
```

### **`field:preview` Implementation**

```javascript
// scripts/preview-field.mjs
import { spawn } from 'child_process';
import fs from 'fs';

const fieldName = process.argv[2];

// Create temp sandbox
const sandbox = `
import React from 'react';
import { useForm } from 'react-hook-form';
import { ${fieldName} } from '@intstudio/forms/fields';
import { AppProvider } from '@intstudio/ds';

export function Preview() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <AppProvider tenant="preview" theme="light">
      <form onSubmit={handleSubmit(console.log)}>
        <${fieldName}
          name="test"
          control={control}
          errors={errors}
          label="Test Field"
          description="Preview mode"
        />
      </form>
    </AppProvider>
  );
}
`;

fs.writeFileSync('/tmp/field-preview.tsx', sandbox);

// Launch dev server
spawn('vite', ['--open', '/tmp/field-preview.tsx'], { stdio: 'inherit' });
```

---

## **Rollout Plan**

### **Sprint A** (This Week)
- [x] ✅ Level 1: DS classes + visual polish
- [ ] 📝 Extend spec schema (validation, telemetry, perf, i18n)
- [ ] 🔌 Create port interfaces
- [ ] 🧪 Add Refiner rules (no inline styles, label contract)

### **Sprint B** (Next Week)
- [ ] 🎨 Implement 3 recipes (AsyncSearchSelect, DatePicker, DragDropUpload)
- [ ] 📊 Generate telemetry events
- [ ] 🔒 Generate security adapters
- [ ] ✅ Self-test per recipe

### **Sprint C** (Week After)
- [ ] 🔁 Repeater recipe
- [ ] 💵 Currency recipe
- [ ] 📍 Location composite
- [ ] 📈 Size budget CI gate
- [ ] 🌐 I18n adapters

---

## **Success Metrics**

| Metric | Target | Current |
|--------|--------|---------|
| Visual Polish | 90%+ match DS demos | 70% (Level 1) |
| Refiner Issues | 0 | 0 ✅ |
| Generator Tests | 100% pass | 100% ✅ |
| A11y (Axe) | 0 violations | TBD |
| Time to Add Field | <5 min | 5 min ✅ |
| Manual Fixes per Field | 0% | 0% ✅ |
| Telemetry Coverage | 100% of events | 0% |

---

## **Why This is God Tier**

### **For Solo Founders**
- **Velocity:** Ship features 10x faster
- **Quality:** Guaranteed consistency
- **Confidence:** CI gates prevent regressions
- **Maintainability:** Single source of truth
- **Observability:** Built-in analytics

### **For Users**
- **Delightful UX:** Recipes encode best practices
- **Accessible:** WCAG AA by default
- **Fast:** Performance budgets enforced
- **Secure:** Sanitization automatic
- **Localized:** I18n ready

### **For the Codebase**
- **DRY:** Zero duplication
- **Evolvable:** Refiner heals drift
- **Testable:** Ports enable mocking
- **Documented:** Auto-generated
- **Monitorable:** Telemetry everywhere

---

## **The Compounding Asset**

Every improvement to the factory benefits **every generated field**:

- Add a new Refiner rule → All 22 fields heal automatically
- Improve a recipe → All fields using that recipe upgrade
- Update a port → Swap implementation once, everywhere benefits
- Enhance telemetry → All fields emit richer events

**This is the difference between:**
- ❌ 22 files you manually maintain
- ✅ A self-improving system that manufactures excellence

---

**Next Step:** Extend spec schema + create port interfaces

**Vision:** Push-button God Tier components with zero manual effort

🏆 **Let's ship it.**
