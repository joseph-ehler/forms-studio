# DS Component Generation Workflow

**Status**: ✅ **CODIFIED & ENFORCED**

---

## **The Rule**

🚨 **NEVER generate a DS component without researching Flowbite first**

**Why?**
- 5 min research → Correct code first time
- No research → 30 min fixing broken components

---

## **Step-by-Step Workflow**

### **Step 1: Research (5 min) - REQUIRED**

```bash
pnpm ds:research <ComponentName>
```

**Outputs:**
- ✅ Component exists in Flowbite
- ✅ Type definition (input vs container)
- ✅ Required props identified
- ✅ Link to Flowbite docs

**Example:**
```bash
$ pnpm ds:research Checkbox

🔍 Researching Flowbite: Checkbox
✅ Found: Checkbox
🎯 Type: INPUT ELEMENT (self-closing)
   → No children prop
   → Needs label wrapper
📚 Flowbite docs: https://flowbite-react.com/docs/components/checkbox
```

---

### **Step 2: Document (2 min) - Optional but Recommended**

Create: `docs/handbook/flowbite-components/<Component>.md`

```markdown
# Flowbite <Component>

**Type**: input | container | composite
**Required Props**: checked, onChange, etc.
**Children**: Yes | No

## Wrapper Strategy
- Needs label? Yes/No
- Controlled? Yes/No
- Self-closing? Yes/No
```

---

### **Step 3: Update Generator Mapping (if needed)**

Edit `scripts/ds-new.mjs`:

```javascript
const flowbiteMap = {
  'Badge': 'Badge',
  'Checkbox': 'Checkbox',
  'Toggle': 'ToggleSwitch',  // ← Name differs!
  // Add new mapping here
};
```

**Only needed if:**
- Flowbite uses different name (Toggle → ToggleSwitch)
- Component doesn't exist in Flowbite (build custom)

---

### **Step 4: Generate (2 min)**

```bash
pnpm ds:new <ComponentName>
```

Generator will:
- ✅ Import Flowbite component (aliased)
- ✅ Wrap with SKIN variables
- ✅ Create stories
- ✅ Update type contracts

---

### **Step 5: Fix Stories (3 min)**

**For Input Elements (Checkbox, Radio, Toggle):**

Update `<Component>.stories.tsx` to wrap in labels:

```tsx
// ❌ WRONG
<Checkbox variant="default">Label</Checkbox>

// ✅ CORRECT
<label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <Checkbox variant="default" />
  <span>Label</span>
</label>
```

**For Controlled Components (Toggle):**

Add required props:

```tsx
<Toggle 
  variant="default" 
  checked={false} 
  onChange={() => {}} 
  label="Label text" 
/>
```

---

### **Step 6: Validate (5 min)**

```bash
pnpm typecheck    # TypeScript compiles
pnpm doctor       # All gates pass
pnpm sb           # View in Storybook
```

---

## **Component Categories**

### **1. Form Inputs** (self-closing, need labels)

**Examples**: Checkbox, Radio, TextInput, Textarea

**Pattern:**
```tsx
import { Checkbox as FlowbiteCheckbox } from 'flowbite-react';

export function Checkbox({ variant, ...rest }: CheckboxProps) {
  const skin = SKIN[variant];
  return <FlowbiteCheckbox style={{ ...skin }} {...rest} />;
}
```

**Story Pattern:**
```tsx
<label>
  <Checkbox variant="default" />
  <span>Label text</span>
</label>
```

---

### **2. Containers** (accept children)

**Examples**: Badge, Button, Card, Modal

**Pattern:**
```tsx
import { Badge as FlowbiteBadge } from 'flowbite-react';

export function Badge({ variant, children, ...rest }: BadgeProps) {
  const skin = SKIN[variant];
  return (
    <FlowbiteBadge style={{ ...skin }} {...rest}>
      {children}
    </FlowbiteBadge>
  );
}
```

**Story Pattern:**
```tsx
<Badge variant="default">Content</Badge>
```

---

### **3. Controlled Components** (require state)

**Examples**: ToggleSwitch, Select, TextInput (with value)

**Pattern:**
```tsx
import { ToggleSwitch as FlowbiteToggleSwitch } from 'flowbite-react';

export function Toggle({ variant, checked, onChange, ...rest }: ToggleProps) {
  const skin = SKIN[variant];
  return (
    <FlowbiteToggleSwitch 
      checked={checked}
      onChange={onChange}
      style={{ ...skin }} 
      {...rest} 
    />
  );
}
```

**Story Pattern:**
```tsx
<Toggle 
  variant="default" 
  checked={false} 
  onChange={() => {}} 
  label="Toggle label" 
/>
```

---

### **4. Custom (not in Flowbite)**

**Examples**: Sheet, Advanced Pickers, Custom Compositions

**Pattern:**
- Build from scratch
- Or compose Flowbite primitives
- Document in `primitives/` folder

---

## **Quick Reference Commands**

```bash
# Research first
pnpm ds:research <Component>

# Generate wrapper
pnpm ds:new <Component>

# Validate
pnpm typecheck
pnpm doctor
pnpm sb

# List all Flowbite components
ls node_modules/flowbite-react/dist/types/components/
```

---

## **Checklist**

Before generating any component:

- [ ] ✅ Ran `pnpm ds:research <Component>`
- [ ] ✅ Confirmed Flowbite has component
- [ ] ✅ Know type (input vs container)
- [ ] ✅ Know required props
- [ ] ✅ Updated generator mapping (if name differs)
- [ ] ✅ Ready to generate with confidence

After generating:

- [ ] ✅ Fixed stories (labels for inputs)
- [ ] ✅ Added required props (controlled components)
- [ ] ✅ TypeScript compiles
- [ ] ✅ Storybook renders without errors
- [ ] ✅ Doctor passes

---

## **Anti-Patterns**

❌ **Don't:**
- Skip research and assume API
- Generate without checking Flowbite
- Treat all components the same
- Use `children` on input elements
- Forget required props on controlled components

✅ **Do:**
- Research first (5 min upfront)
- Understand the actual API
- Adapt stories to component type
- Validate immediately
- Update mapping when names differ

---

## **Time Investment**

**Without Research:**
- Generate: 2 min
- Debug broken code: 30 min
- Fix stories: 10 min
- **Total: 42 min** ❌

**With Research:**
- Research: 5 min
- Generate: 2 min
- Fix stories: 3 min
- Validate: 5 min
- **Total: 15 min** ✅

**Savings: 27 minutes per component**

---

## **Success Rate**

**Before Research Protocol:**
- 5/5 components broken on first generation
- All required manual fixes
- Storybook broken for 15+ minutes

**After Research Protocol:**
- Expected: 5/5 components work first time
- Stories render correctly
- Storybook works immediately

---

## **Documentation**

- **Full Protocol**: `docs/handbook/FLOWBITE_RESEARCH_PROTOCOL.md`
- **This Workflow**: `docs/handbook/DS_GENERATION_WORKFLOW.md`
- **Component Notes**: `docs/handbook/flowbite-components/<Component>.md`

---

**Bottom Line:**

Research first. Generate with context. Stamp with confidence.

**Commands:**
```bash
pnpm ds:research <Component>  # Step 1
pnpm ds:new <Component>       # Step 2
pnpm doctor                   # Step 3
```
