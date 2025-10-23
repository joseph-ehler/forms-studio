# 🏗️ Field Development Framework: Two-Lane Model

**Philosophy:** Not all fields are created equal. Balance creative freedom with systematic consistency.

---

## 🎯 Core Principle

```
CheckboxField ≠ TextField ≠ SignaturePad ≠ MatrixPlotter
```

**The factory shouldn't stifle creativity for unique cases.**  
**The factory SHOULD standardize, protect, and scale proven patterns.**

---

## 🛣️ THE TWO LANES

### Lane A: Factory Lane (90% of fields)

**Use when:**
- Field fits a known archetype (text, select, checkbox, etc.)
- UX pattern is standard/proven
- Design can be driven by spec configuration

**Process:**
```
Spec → Overlays → Generator → Refiner → CI
```

**Examples:**
- TextField, EmailField, UrlField
- NumberField, DateField, TimeField
- SelectField, RadioGroupField
- Basic CheckboxField, ToggleField

**Benefits:**
- Consistency across similar fields
- Batch improvements propagate automatically
- QA guardrails always active
- Minimal boilerplate

---

### Lane B: Bespoke Lane (10% - the interesting ones)

**Use when:**
- Field requires truly unique interaction (signature capture, wheel picker)
- Complex multi-part UI (matrix plotter, flight search)
- Advanced canvas/WebGL/custom rendering
- Experimental/innovative UX

**Process:**
```
Design Spike → Analyze → Decide → Promote or Mark Exception
```

**Examples:**
- SignaturePad (canvas-based drawing)
- WheelTimePicker (iOS-style scrolling wheels)
- MatrixPlotter (interactive grid plotting)
- AdvancedSearchCombobox (async search + multi-select + creation)
- FlightMatrix (origin/destination with date ranges)

**Benefits:**
- Design freedom for unique cases
- Prototype before systemizing
- Learn what works before promoting to factory
- Can still use DS primitives & tokens

---

## 📋 WORKFLOW FOR BESPOKE FIELDS

### 1. Design Spike (Freeform)

**Goal:** Get the UX & a11y exactly right without fighting the generator.

**Where:**
```
packages/labs/              # Experimental fields
packages/forms/src/fields/  # Direct implementation
.storybook/sandbox/         # Prototype in Storybook
```

**Guidelines:**
- ✅ Use DS tokens (`var(--ds-space-*)`, `var(--ds-color-*)`)
- ✅ Use DS primitives where applicable (Stack, Button, Input base)
- ✅ Focus on keyboard nav, screen readers, touch targets
- ✅ Test on mobile devices
- ❌ Don't worry about spec compatibility yet
- ❌ Don't fight refiner rules yet

**Example: SignaturePad**
```tsx
// packages/labs/SignaturePad/SignaturePad.tsx

export function SignaturePad({ width = 400, height = 200 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Canvas drawing logic...
  
  return (
    <Stack gap={3}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        role="img"
        aria-label="Signature canvas"
        className="ds-signature-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <Stack direction="row" gap={2}>
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
        <Button onClick={handleSave}>
          Save Signature
        </Button>
      </Stack>
    </Stack>
  );
}
```

---

### 2. Analyze & Capture

**Goal:** Understand how this field differs from standard patterns.

**Commands:**
```bash
# Analyze the spike
pnpm analyze:field packages/labs/SignaturePad/*.tsx > analysis/signature-pad.json

# Compare to archetypes
pnpm analyze:diff signature-pad.json text-input-archetype.json
```

**Analyzer Output (Enhanced):**
```json
{
  "fieldName": "SignaturePad",
  "archetype": "custom",
  "divergence": {
    "usesCanvas": true,
    "customInteraction": ["pointerdown", "pointermove", "pointerup"],
    "requiresStateManagement": true,
    "hasCustomMethods": ["clear", "save", "toDataURL"]
  },
  "dsUsage": {
    "primitives": ["Stack", "Button"],
    "tokens": ["--ds-space-3", "--ds-space-2"],
    "classes": ["ds-signature-canvas"]
  },
  "a11y": {
    "roles": ["img"],
    "ariaAttributes": ["aria-label"],
    "keyboardSupport": false,  // ⚠️ Flag!
    "focusManagement": "manual"
  },
  "recommendation": {
    "action": "createRecipe",
    "reason": "Unique interaction pattern requiring canvas",
    "recipeScaffold": "recipes/SignatureRecipe.ts"
  }
}
```

---

### 3. Decide: General vs Specific

**Questions to ask:**

#### Is the pattern reusable?
- ✅ **YES** → Promote to Recipe
  - SignaturePad → SignatureRecipe (any signature capture field)
  - WheelTimePicker → WheelTimePickerRecipe (any wheel picker)
  - MatrixPlotter → MatrixRecipe (any grid-based plotter)

- ❌ **NO** → Keep bespoke, mark exception
  - One-off dashboard widget
  - Client-specific custom field
  - Experimental/prototype

#### Are there new defaults or variants?
- Does `type: time` need a new `ui.behavior: wheel` option?
- Should `type: signature` become a first-class spec type?
- Do overlays need new density/platform hints?

#### Is it truly a one-off?
- Mark in spec with `ui.recipe: custom`
- Document why it's unique
- Still run core refiner rules (prop filtering, basic a11y)

---

### 4. Promote to Factory (If Reusable)

**A. Create Recipe Module**

```typescript
// packages/forms/src/factory/recipes/SignatureRecipe.ts

import type { FieldSpec } from '../types';
import { generatePorts } from '../ports';

export function SignatureRecipe(spec: FieldSpec) {
  const ports = generatePorts(spec, {
    // Custom ports for signature
    onClear: spec.validation?.clearOnReset ?? true,
    onSave: spec.telemetry?.events?.includes('save') ?? true,
    format: spec.ui?.format ?? 'png', // png, svg, webp
  });
  
  return {
    element: 'SignaturePad',
    props: {
      id: spec.name,
      name: spec.name,
      width: spec.ui?.width ?? 400,
      height: spec.ui?.height ?? 200,
      penColor: spec.ui?.penColor ?? 'var(--ds-color-text-primary)',
      backgroundColor: spec.ui?.backgroundColor ?? 'var(--ds-color-surface-base)',
      ...ports,
    },
    imports: [
      "import { SignaturePad } from '@intstudio/forms/signature';"
    ],
    wrappers: spec.ui?.label ? ['FieldWrapper'] : [],
  };
}
```

**B. Update Generator Dispatch**

```typescript
// packages/forms/src/factory/field-from-spec-v2.mjs

function selectRecipe(spec) {
  const { type, ui } = spec;
  
  // Recipe dispatch based on type + behavior
  if (type === 'signature') return SignatureRecipe;
  if (type === 'time' && ui?.behavior === 'wheel') return WheelTimePickerRecipe;
  if (type === 'location' && ui?.behavior === 'composite') return LocationCompositeRecipe;
  
  // Standard archetypes
  if (type === 'text' || type === 'email' || type === 'url') return TextInputRecipe;
  if (type === 'select') return SelectRecipe;
  if (type === 'checkbox') return CheckboxRecipe;
  
  // Fallback
  return DefaultInputRecipe;
}
```

**C. Add Refiner Guardrails**

```javascript
// packages/forms/src/factory/refiner/transforms/signature-contract-v1.0.mjs

export const signatureContractV1 = {
  name: 'signature-contract-v1.0',
  description: 'Enforce SignaturePad contract (canvas, clear, save methods)',
  
  run(ast, spec) {
    if (spec.type !== 'signature') return { changed: false };
    
    const errors = [];
    
    // Must have canvas element
    const hasCanvas = ast.find({ tag: 'canvas' });
    if (!hasCanvas) {
      errors.push('SignaturePad must contain a <canvas> element');
    }
    
    // Must have clear method
    const hasClear = ast.find({ handler: /handleClear|onClear/ });
    if (!hasClear) {
      errors.push('SignaturePad must implement clear functionality');
    }
    
    // Must have role="img" and aria-label on canvas
    const canvas = ast.find({ tag: 'canvas' });
    if (canvas && (!canvas.role || !canvas['aria-label'])) {
      errors.push('Canvas must have role="img" and aria-label');
    }
    
    if (errors.length > 0) {
      console.error('❌ SignaturePad contract violations:', errors);
      return { changed: false, errors };
    }
    
    return { changed: false };
  }
};
```

**D. Add Spec Schema Extension**

```yaml
# packages/forms/src/factory/schema/field-spec.schema.yaml

type:
  enum:
    - text
    - email
    - signature  # NEW!
    - time
    # ... etc

ui:
  properties:
    behavior:
      enum:
        - default
        - wheel      # For WheelTimePicker
        - composite  # For multi-part fields
    
    # Signature-specific
    width:
      type: number
      default: 400
    height:
      type: number
      default: 200
    penColor:
      type: string
      default: 'var(--ds-color-text-primary)'
```

**E. Update Factory Overlays**

```yaml
# packages/forms/src/factory/factory-overlays.yaml

# Signature field defaults
- when:
    type: signature
  merge:
    ui:
      density: comfortable
      width: 400
      height: 200
      behavior: canvas
    a11y:
      role: img
      describedBy: '${name}-signature-desc'
    telemetry:
      events: [clear, save, validate]
```

**F. Add CI Checks**

```typescript
// packages/forms/src/fields/SignaturePad/SignaturePad.test.ts

import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SignaturePad } from './SignaturePad';

describe('SignaturePad', () => {
  it('should pass axe accessibility checks', async () => {
    const { container } = render(<SignaturePad />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should have canvas with proper ARIA', () => {
    render(<SignaturePad />);
    const canvas = screen.getByRole('img');
    expect(canvas).toHaveAttribute('aria-label');
  });
  
  it('should support clear and save actions', () => {
    const handleClear = jest.fn();
    const handleSave = jest.fn();
    render(<SignaturePad onClear={handleClear} onSave={handleSave} />);
    
    screen.getByText('Clear').click();
    expect(handleClear).toHaveBeenCalled();
    
    screen.getByText('Save Signature').click();
    expect(handleSave).toHaveBeenCalled();
  });
});
```

**G. Add Storybook Stories**

```tsx
// packages/forms/src/fields/SignaturePad/SignaturePad.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { SignaturePad } from './SignaturePad';

const meta: Meta<typeof SignaturePad> = {
  title: 'Fields/SignaturePad',
  component: SignaturePad,
  parameters: {
    a11y: { config: { rules: [/* custom rules */] } },
  },
};

export default meta;
type Story = StoryObj<typeof SignaturePad>;

export const Default: Story = {
  args: {
    width: 400,
    height: 200,
  },
};

export const Mobile: Story = {
  args: {
    width: 320,
    height: 150,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
```

---

### 5. Mark Exceptions (If Truly Bespoke)

**Option A: Pragma Comments**

```tsx
// @factory:refiner-ignore enforce-primitive
// @factory:refiner-ignore visual-enhancement
// Bespoke canvas rendering - SignaturePad recipe handles validation

export function CustomSignatureWidget() {
  // ... truly one-off implementation
}
```

**Option B: Spec Flags**

```yaml
# specs/fields/client-custom-signature.field.yaml

name: ClientCustomSignature
type: signature
specVersion: "1.3"

factory:
  ignoreTransforms:
    - enforce-primitive    # Custom canvas, not DS input
    - visual-enhancement   # Has bespoke styling
  reason: "Client-specific signature widget with custom branding"

ui:
  recipe: custom
  componentPath: '@client/fields/BrandedSignature'
```

**Option C: Custom Recipe Flag**

```yaml
# specs/fields/experimental-signature.field.yaml

name: ExperimentalSignature
type: signature

ui:
  recipe: custom  # Bypass factory, use componentPath
  componentPath: '@app/labs/ExperimentalSignature/ExperimentalSignature'

telemetry:
  enabled: true
  events: [mount, unmount, error]  # Still get telemetry!

a11y:
  enforceContracts: true  # Still run a11y checks!
```

**The analyzer will still:**
- Report divergence from standard patterns
- Flag missing a11y attributes
- Suggest when pattern appears reusable
- Track exceptions for future review

---

## 🔍 ENHANCED ANALYZER RESPONSIBILITIES

### Current (v1.x)
- ✅ Extract field props, imports, structure
- ✅ Detect DS class usage
- ✅ Report basic patterns

### Future (v2.x - Recommended)
- ✅ **Classify by archetype + recipe**
  - Group: TextField, EmailField, UrlField → TextInputRecipe
  - Group: SignaturePad variants → SignatureRecipe
  
- ✅ **Flag divergence from contracts**
  - SignaturePad missing `<canvas>` → ERROR
  - Missing required ARIA attributes → WARNING
  - Using wrong DS primitives → SUGGESTION
  
- ✅ **Cluster outliers → suggest new recipes**
  ```
  📊 Analyzer Report:
  Found 3 fields with similar wheel-picker pattern:
    - TimeWheelPicker
    - DateWheelPicker  
    - DurationWheelPicker
  
  💡 SUGGESTION: Extract WheelPickerRecipe
  
  Scaffold: pnpm factory:scaffold recipe WheelPicker
  ```

- ✅ **Generate promotion scaffolds**
  ```bash
  pnpm factory:promote packages/labs/SignaturePad
  
  ✅ Created:
    - packages/forms/src/factory/recipes/SignatureRecipe.ts
    - packages/forms/src/factory/refiner/transforms/signature-contract-v1.0.mjs
    - packages/forms/src/fields/SignaturePad/SignaturePad.test.ts
    - packages/forms/src/fields/SignaturePad/SignaturePad.stories.tsx
    - Updated: factory-overlays.yaml
    - Updated: field-spec.schema.yaml
  
  Next: Review, test, commit!
  ```

---

## 📊 BATCH VS PER-FIELD HANDLING

### Batch Improvements (Factory Lane)

**Scenario:** Add enhanced focus states to all text inputs.

**Process:**
1. Update `ds-inputs.css` in Design System
2. Update `TextInputRecipe` if logic needed
3. Optionally add refiner transform to enforce
4. Run `pnpm factory:generate:all`

**Result:** ALL text inputs get the enhancement automatically! ✨

**Affected:**
- TextField
- EmailField
- UrlField
- TelField
- NumberField
- DateField
- etc.

**Time:** ~30 minutes, touches 1-2 files, affects 15+ fields

---

### Per-Field Tweaks (Bespoke Lane)

**Scenario:** SignaturePad needs pressure sensitivity.

**Process:**
1. Update `packages/forms/src/fields/SignaturePad/SignaturePad.tsx`
2. Add pressure detection logic
3. Update tests & stories
4. Mark in spec if needed:
   ```yaml
   ui:
     features: [pressure-sensitivity]
   factory:
     note: "Pressure support is SignaturePad-specific"
   ```

**Result:** Only SignaturePad gets the feature.

**Time:** ~1 hour, touches 1 file, affects 1 field

---

## 🎯 DECISION MATRIX

| Question | Factory Lane | Bespoke Lane |
|----------|-------------|--------------|
| **Does it fit a known archetype?** | YES | NO |
| **Will other fields need this?** | YES | MAYBE |
| **Is the UX novel/experimental?** | NO | YES |
| **Can spec config drive it?** | YES | NO |
| **Requires custom rendering?** | NO | YES (canvas, WebGL, etc.) |
| **Time to implement** | 30min-2hrs | 2hrs-2days |
| **Propagates to similar fields?** | ✅ Auto | ❌ Manual |
| **QA/CI enforcement** | ✅ Full | ⚠️ Partial |

---

## 🏆 SUCCESS EXAMPLES

### Example 1: CheckboxField (Factory Lane)

**Before:** Using `.ds-input` (text input styling) ❌

**After (via factory):**
1. Created `.ds-checkbox` primitive in DS
2. Created `CheckboxRecipe` in factory
3. Updated generator dispatch for `type: checkbox`
4. Added refiner rule to enforce checkbox structure
5. Re-generated all checkbox fields

**Impact:** 5 checkbox fields fixed in 1 batch! ✅

---

### Example 2: SignaturePad (Bespoke → Promoted)

**Phase 1 - Design Spike:**
- Built in `packages/labs/SignaturePad`
- Canvas-based drawing with touch/pointer support
- Clear & save actions
- Proper ARIA for accessibility

**Phase 2 - Analyze:**
```bash
pnpm analyze:field packages/labs/SignaturePad/*.tsx
→ Unique interaction: canvas
→ Recommendation: Create SignatureRecipe
```

**Phase 3 - Promote:**
- Created `SignatureRecipe`
- Added `type: signature` to spec schema
- Added refiner contract enforcement
- Added tests & stories
- Added to factory overlays

**Phase 4 - Use:**
```yaml
# Now users can generate signature fields via spec!
name: UserSignature
type: signature
ui:
  width: 500
  height: 250
  penColor: '#2563eb'
```

**Impact:** Unique pattern → Reusable recipe! 🎉

---

### Example 3: ClientCustomWidget (Exception)

**Scenario:** Client needs one-off branded widget that doesn't fit any pattern.

**Approach:**
1. Build directly in `packages/client/fields/BrandedWidget.tsx`
2. Mark exception in spec:
   ```yaml
   ui:
     recipe: custom
     componentPath: '@client/fields/BrandedWidget'
   factory:
     ignoreTransforms: [enforce-primitive, visual-enhancement]
     reason: "Client-specific branding requirements"
   ```
3. Still enforce core rules (prop filtering, basic a11y)
4. Analyzer tracks but doesn't flag as error

**Impact:** Flexibility for true exceptions! ✅

---

## 📐 GUARDRAILS FOR BOTH LANES

**Even bespoke fields should:**
- ✅ Use DS tokens for spacing, colors, typography
- ✅ Use DS primitives where applicable (Stack, Button, etc.)
- ✅ Pass Axe accessibility tests
- ✅ Have keyboard support
- ✅ Have 44px minimum touch targets
- ✅ Provide proper ARIA attributes
- ✅ Support dark mode (via DS tokens)
- ✅ Be tested (unit + integration)
- ✅ Be documented (Storybook stories)

**Factory still acts as QA gate:**
- Refiner runs core rules (even on exceptions)
- CI runs build, tests, Axe checks
- Analyzer tracks divergence & suggests improvements
- Pragma/spec flags make exceptions visible & traceable

---

## 🎓 WHEN TO USE EACH LANE

### Use Factory Lane When:
- ✅ Field is standard (text, select, checkbox, radio)
- ✅ UX pattern is proven/familiar
- ✅ You want consistency with other fields
- ✅ You want automatic updates from DS improvements
- ✅ Time to market is important
- ✅ Team prefers declarative (spec-driven) approach

### Use Bespoke Lane When:
- ✅ Field requires unique interaction (signature, drawing, plotting)
- ✅ Complex multi-part UI (flight search, location composite)
- ✅ Custom rendering (canvas, SVG, WebGL)
- ✅ Experimental/innovative UX
- ✅ Prototyping new patterns
- ✅ Client-specific requirements
- ✅ Need full control over implementation

### Transition Bespoke → Factory When:
- ✅ Pattern proves reusable (used 3+ times)
- ✅ UX is stable/validated
- ✅ Team wants to standardize it
- ✅ Analyzer suggests promotion
- ✅ Cost of maintaining bespoke > cost of recipe

---

## 🚀 RECOMMENDED WORKFLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│ NEW FIELD REQUIREMENT                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
            Does it fit known archetype?
                     │
         ┌───────────┴───────────┐
         │                       │
        YES                     NO
         │                       │
         ▼                       ▼
    FACTORY LANE            BESPOKE LANE
         │                       │
         │                       ├─ 1. Design Spike
         │                       ├─ 2. Analyze
         │                       ├─ 3. Decide
         │                       │
         │                       ├─ Reusable? ──YES──┐
         │                       │                    │
         │                       └─ NO ───────────────┤
         │                                            │
         ▼                                            ▼
    Use Existing Recipe                       Promote to Recipe
         │                                            │
         ├─ Write Spec                                ├─ Create Recipe Module
         ├─ Generate Field                            ├─ Add Schema Extension
         ├─ Refiner Checks                            ├─ Add Refiner Rules
         ├─ CI Validates                              ├─ Add Tests & Stories
         │                                            │
         └──────────────┬─────────────────────────────┘
                        │
                        ▼
                   DONE! ✅
                   Field is:
                   - Generated or Hand-crafted
                   - QA-checked
                   - Documented
                   - Reusable (if promoted)
```

---

## 🎯 KEY TAKEAWAYS

1. **Two lanes for two needs:**
   - Factory = consistency & scale
   - Bespoke = creativity & innovation

2. **Bespoke can graduate:**
   - Design spike → analyze → promote to recipe
   - One-off today, reusable tomorrow

3. **Analyzer is your guide:**
   - Spots patterns
   - Suggests promotions
   - Tracks exceptions

4. **Guardrails always active:**
   - Even exceptions get QA checked
   - Core a11y/quality rules still enforced
   - CI gates protect quality

5. **Freedom with accountability:**
   - Design freely when needed
   - Mark exceptions explicitly
   - Systematize when proven

---

## 🏁 CONCLUSION

**The factory shouldn't stifle creativity.**  
**The factory SHOULD standardize, protect, and scale the craft.**

With this two-lane model, you get:
- ✅ Creative freedom for unique experiences
- ✅ Systematic consistency for standard patterns
- ✅ Clear path to promote bespoke → reusable
- ✅ Guardrails that protect quality always
- ✅ A system that evolves with your needs

**Motto:** _"Design freely when needed, systematize when proven, protect with guardrails always."_

---

**Document Status:** ✅ Framework Defined  
**Ready to Build:** 🚀 YES  
**Next Steps:** Choose your lane and start building!
