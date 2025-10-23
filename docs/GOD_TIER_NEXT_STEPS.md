# 🚀 God Tier Factory - Next Steps

**Current Status:** Level 1 Complete ✅  
**Next Phase:** Spec Extension + Ports

---

## **Immediate Actions (This Session)**

### **1. Extend Spec Schema** (30 min)

Update `specs/_schema.json` to support new blocks:

```json
{
  "type": "object",
  "required": ["name", "type", "specVersion"],
  "properties": {
    "name": { "type": "string" },
    "type": { "type": "string" },
    "specVersion": { "type": "string" },
    
    "validation": {
      "type": "object",
      "properties": {
        "sync": {
          "type": "object",
          "properties": {
            "required": { "type": "boolean" },
            "email": { "type": "boolean" },
            "minLength": { "type": "number" },
            "maxLength": { "type": "number" },
            "pattern": { "type": "string" }
          }
        },
        "async": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "url"],
            "properties": {
              "id": { "type": "string" },
              "debounceMs": { "type": "number", "default": 300 },
              "url": { "type": "string" },
              "method": { "type": "string", "enum": ["GET", "POST"] },
              "queryKey": { "type": "string" },
              "onFailMessage": { "type": "string" }
            }
          }
        }
      }
    },
    
    "ui": {
      "type": "object",
      "properties": {
        "behavior": {
          "type": "string",
          "enum": ["default", "async-search", "drag-drop", "currency", "masked"]
        },
        "size": { "type": "string", "enum": ["sm", "md", "lg"] },
        "variant": { "type": "string", "enum": ["default", "quiet", "danger"] },
        "density": { "type": "string", "enum": ["compact", "cozy", "comfortable"] },
        "searchable": { "type": "boolean" },
        "showShortcut": { "type": "boolean" },
        "iconLeft": { "type": "string" },
        "prefix": { "type": "string" },
        "suffix": { "type": "string" },
        "fullWidth": { "type": "boolean" }
      }
    },
    
    "telemetry": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean", "default": false },
        "events": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["focus", "blur", "change", "validate", "submit"]
          }
        },
        "pii": {
          "type": "string",
          "enum": ["redact", "hash", "allow"],
          "default": "redact"
        }
      }
    },
    
    "perf": {
      "type": "object",
      "properties": {
        "budgetMs": { "type": "number", "default": 50 },
        "debounceChangeMs": { "type": "number", "default": 50 },
        "idleValidation": { "type": "boolean", "default": true }
      }
    },
    
    "i18n": {
      "type": "object",
      "properties": {
        "messagesKey": { "type": "string" },
        "numberFormat": { "type": "string" },
        "dateFormat": { "type": "string" }
      }
    },
    
    "security": {
      "type": "object",
      "properties": {
        "sanitize": { "type": "boolean", "default": true },
        "allowListPattern": { "type": "string" }
      }
    }
  }
}
```

**File:** `specs/_schema.json`

---

### **2. Create Port Interfaces** (45 min)

Create TypeScript port definitions in `packages/forms/src/ports/`:

```typescript
// packages/forms/src/ports/index.ts
export * from './ValidationPort';
export * from './TelemetryPort';
export * from './OptionSourcePort';
export * from './MaskPort';
export * from './SecurityPort';
export * from './I18nPort';
```

```typescript
// packages/forms/src/ports/ValidationPort.ts
export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    message: string;
    path?: string;
  }>;
}

export interface AsyncValidationConfig {
  id: string;
  url: string;
  method: 'GET' | 'POST';
  queryKey: string;
  onFailMessage: string;
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number[];
  };
}

export interface ValidationPort {
  validateSync(value: any, schema: any): ValidationResult;
  validateAsync(
    value: any,
    config: AsyncValidationConfig,
    signal: AbortSignal
  ): Promise<ValidationResult>;
}
```

```typescript
// packages/forms/src/ports/TelemetryPort.ts
export interface FieldEvent {
  schemaPath: string;
  fieldType: string;
  formId?: string;
  valueSample?: string;
  valid?: boolean;
  errorCode?: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
}

export interface TelemetryPort {
  emit(eventName: string, payload: FieldEvent): void;
}
```

```typescript
// packages/forms/src/ports/SecurityPort.ts
export interface SecurityPort {
  sanitize(value: string): string;
  allowListCheck(value: string, pattern?: RegExp): boolean;
}
```

---

### **3. Create Default Adapters** (30 min)

```typescript
// packages/forms/src/adapters/defaultValidationAdapter.ts
import type { ValidationPort } from '../ports';

export const defaultValidationAdapter: ValidationPort = {
  validateSync: (value, schema) => {
    const result = schema.safeParse(value);
    return result.success
      ? { valid: true }
      : { valid: false, errors: result.error.errors };
  },
  
  validateAsync: async (value, config, signal) => {
    try {
      const response = await fetch(
        `${config.url}?${config.queryKey}=${encodeURIComponent(value)}`,
        { signal, method: config.method }
      );
      
      if (!response.ok) {
        return {
          valid: false,
          errors: [{ message: config.onFailMessage }],
        };
      }
      
      return { valid: true };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error; // Re-throw abort errors
      }
      
      return {
        valid: false,
        errors: [{ message: 'Validation service unavailable' }],
      };
    }
  },
};
```

```typescript
// packages/forms/src/adapters/defaultTelemetryAdapter.ts
import type { TelemetryPort } from '../ports';

export const defaultTelemetryAdapter: TelemetryPort = {
  emit: (eventName, payload) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry] ${eventName}`, payload);
    }
    
    // In production, integrate with your analytics service
    // Example: window.analytics?.track(eventName, payload);
  },
};
```

```typescript
// packages/forms/src/adapters/defaultSecurityAdapter.ts
import type { SecurityPort } from '../ports';

export const defaultSecurityAdapter: SecurityPort = {
  sanitize: (value) => {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;');
  },
  
  allowListCheck: (value, pattern) => {
    if (!pattern) return true;
    return pattern.test(value);
  },
};
```

---

### **4. Update Generator to Generate Adapters** (1 hour)

Modify `field-from-spec-v2.mjs` to create `adapters.ts`:

```javascript
// In generateField function, add:
function generateAdapters(spec) {
  const { name, validation, telemetry, security } = spec;
  
  const hasAsync = validation?.async?.length > 0;
  const hasTelemetry = telemetry?.enabled;
  const hasSecurity = security?.sanitize;
  
  if (!hasAsync && !hasTelemetry && !hasSecurity) {
    return null; // No adapters needed
  }
  
  const imports = [];
  const adapters = [];
  
  if (hasAsync) {
    imports.push("import type { ValidationPort } from '../../ports';");
    imports.push("import { defaultValidationAdapter } from '../../adapters';");
    adapters.push('export const validationAdapter = defaultValidationAdapter;');
  }
  
  if (hasTelemetry) {
    imports.push("import type { TelemetryPort } from '../../ports';");
    imports.push("import { defaultTelemetryAdapter } from '../../adapters';");
    adapters.push('export const telemetryAdapter = defaultTelemetryAdapter;');
  }
  
  if (hasSecurity) {
    imports.push("import type { SecurityPort } from '../../ports';");
    imports.push("import { defaultSecurityAdapter } from '../../adapters';");
    adapters.push('export const securityAdapter = defaultSecurityAdapter;');
  }
  
  return `/**
 * ${name} Adapters
 * 
 * Auto-generated from spec
 * Generator v2.4
 */

${imports.join('\n')}

${adapters.join('\n\n')}
`;
}

// After writing field file:
const adaptersContent = generateAdapters(spec);
if (adaptersContent) {
  fs.writeFileSync(
    path.join(fieldDir, 'adapters.ts'),
    adaptersContent
  );
}
```

---

### **5. Add Telemetry to Generated Fields** (1 hour)

Update generator template to emit events:

```javascript
// In field template, add telemetry wrapper
const fieldTemplate = `
import { telemetryAdapter } from './adapters';

export function ${name}<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
}: ${name}Props<T>) {
  const err = (errors as any)?.[name];
  const hasError = Boolean(err);
  const errorMessage = err?.message as string | undefined;
  
  ${spec.telemetry?.enabled ? `
  // Telemetry tracking
  const handleFocus = () => {
    telemetryAdapter.emit('field_focus', {
      schemaPath: name as string,
      fieldType: '${spec.type}',
    });
  };
  
  const handleBlur = () => {
    telemetryAdapter.emit('field_blur', {
      schemaPath: name as string,
      fieldType: '${spec.type}',
    });
  };
  ` : ''}
  
  return (
    <Stack spacing="tight">
      {/* ... existing JSX ... */}
      
      <Controller
        name={name as any}
        control={control as any}
        render={({ field }) => (
          <input
            className="ds-input w-full"
            ${spec.telemetry?.enabled ? 'onFocus={handleFocus}' : ''}
            ${spec.telemetry?.enabled ? 'onBlur={(e) => { field.onBlur(e); handleBlur(); }}' : 'onBlur={field.onBlur}'}
            {...field}
          />
        )}
      />
    </Stack>
  );
}
`;
```

---

### **6. Create Example Enhanced Spec** (15 min)

```yaml
# specs/fields/EmailFieldEnhanced.yaml
name: EmailField
type: email
specVersion: "1.2"
description: Email input with async validation and telemetry

validation:
  sync:
    required: true
    email: true
    minLength: 8
  async:
    - id: unique-email
      debounceMs: 300
      url: /api/users/check-email
      method: GET
      queryKey: email
      onFailMessage: "This email is already registered."

ui:
  size: md
  density: cozy
  iconLeft: mail

telemetry:
  enabled: true
  events: [focus, blur, validate]
  pii: hash

perf:
  budgetMs: 50
  debounceChangeMs: 100

security:
  sanitize: true

i18n:
  messagesKey: forms.email

aria:
  live: polite
  invalid: hasError
  describedby: description
```

---

## **Quick Wins (Next 2 Hours)**

### **Win 1: Wrap Field Showcase in AppProvider** (15 min)

```typescript
// packages/demo-app/src/FieldShowcase.tsx
import { AppProvider } from '@intstudio/ds';

export function FieldShowcase() {
  // ... existing code ...
  
  return (
    <AppProvider tenant="showcase" theme="light" density="cozy">
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* ... existing form ... */}
      </div>
    </AppProvider>
  );
}
```

**Result:** Typography, spacing, focus rings all activated! 🎨

---

### **Win 2: Add Refiner Rule - No Inline Styles** (30 min)

```javascript
// scripts/refiner/transforms/no-inline-styles-v1.0.mjs
import traverse from '@babel/traverse';

export function refineNoInlineStyles(ast) {
  const fixes = [];
  
  traverse.default(ast, {
    JSXAttribute(path) {
      if (path.node.name.name === 'style') {
        fixes.push({
          type: 'remove',
          path: path,
          reason: 'Inline styles forbidden. Use DS classes.',
        });
      }
    },
  });
  
  return fixes;
}
```

Add to refiner config:
```javascript
// scripts/refiner/refiner.mjs
import { refineNoInlineStyles } from './transforms/no-inline-styles-v1.0.mjs';

const transforms = [
  filterDomProps,
  dedupeJSXAttrs,
  refineNoInlineStyles, // NEW
];
```

---

### **Win 3: Test Enhanced Spec** (30 min)

```bash
# Generate field with telemetry
pnpm field:new EmailFieldEnhanced

# Verify adapters.ts created
cat packages/forms/src/fields/EmailFieldEnhanced/adapters.ts

# Test in Field Showcase
# Should see telemetry events in console on focus/blur
```

---

## **Success Criteria**

After this session, you should have:

- ✅ Extended spec schema with validation/telemetry/perf/i18n blocks
- ✅ Port interfaces defined (`ValidationPort`, `TelemetryPort`, etc.)
- ✅ Default adapters implemented
- ✅ Generator creates `adapters.ts` for fields with telemetry
- ✅ One example field with full telemetry working
- ✅ Field Showcase wrapped in AppProvider (instant visual upgrade!)
- ✅ Refiner rule: no inline styles

---

## **Next Sprint Targets**

### **Sprint B: Recipes** (Next Week)

1. **AsyncSearchSelect Recipe**
   - Debounced search
   - Keyboard navigation
   - Option caching
   - Loading states

2. **DatePicker Recipe**
   - Calendar popover
   - Presets ("Today", "This week")
   - Min/max constraints
   - Keyboard shortcuts

3. **DragDropUpload Recipe**
   - Drag & drop zone
   - Paste from clipboard
   - Progress indicators
   - File type/size validation
   - Preview thumbnails

---

## **Copy-Paste Commands**

```bash
# 1. Extend schema
vim specs/_schema.json

# 2. Create ports
mkdir -p packages/forms/src/ports
touch packages/forms/src/ports/{ValidationPort,TelemetryPort,SecurityPort,I18nPort}.ts

# 3. Create adapters
mkdir -p packages/forms/src/adapters
touch packages/forms/src/adapters/{defaultValidationAdapter,defaultTelemetryAdapter,defaultSecurityAdapter}.ts

# 4. Create enhanced spec
touch specs/fields/EmailFieldEnhanced.yaml

# 5. Generate field
pnpm field:new EmailFieldEnhanced

# 6. Wrap showcase
vim packages/demo-app/src/FieldShowcase.tsx

# 7. Add refiner rule
touch scripts/refiner/transforms/no-inline-styles-v1.0.mjs

# 8. Test
pnpm generator:test
pnpm refine:dry --scope="packages/forms/src/fields/**/*.tsx"
pnpm --filter demo-app dev
```

---

**Let's build the future! 🚀**
