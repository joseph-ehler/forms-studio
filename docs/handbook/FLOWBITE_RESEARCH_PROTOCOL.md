# Flowbite Research Protocol

**Purpose**: Understand Flowbite's actual API before stamping DS wrappers  
**When**: **ALWAYS** run this BEFORE `pnpm ds:new <Component>`

---

## **Why This Matters**

**Without Research:**
- ❌ Stamp generic `<div>` wrappers
- ❌ Treat inputs like containers
- ❌ Miss required props
- ❌ Break in Storybook

**With Research:**
- ✅ Wrap actual Flowbite components
- ✅ Know the real API
- ✅ Use correct props
- ✅ Work first time

---

## **Pre-Flight Research Checklist**

### **Step 1: Verify Component Exists**

```bash
# Check if Flowbite has this component
ls node_modules/flowbite-react/dist/types/components/ | grep -i <ComponentName>
```

**Questions:**
- Does Flowbite have this component?
- What's it called in Flowbite? (might differ from our name)

**Mapping:**
- Toggle → ToggleSwitch ✅
- Checkbox → Checkbox ✅
- Radio → Radio ✅
- Sheet → ❌ (doesn't exist - use Modal/our custom)
- Drawer → Drawer ✅

---

### **Step 2: Read the Type Definition**

```bash
# Read Flowbite's TypeScript definition
cat node_modules/flowbite-react/dist/types/components/<Component>/<Component>.d.ts
```

**Extract:**
1. **Component type** - Is it an input? Container? Composite?
2. **Required props** - What must be provided?
3. **Children** - Does it accept children? Or is it self-closing?
4. **Special props** - color? sizing? checked? onChange?

**Example: Checkbox**
```typescript
// From Checkbox.d.ts:
export interface CheckboxProps extends Omit<ComponentProps<"input">, "type" | "ref" | "color"> {
    theme?: DeepPartial<FlowbiteCheckboxTheme>;
    color?: DynamicStringEnumKeysOf<FlowbiteColors>;
}
// ✅ It's an INPUT element
// ✅ Extends input props (no children!)
// ✅ Optional: theme, color
```

---

### **Step 3: Check Flowbite Docs**

Visit: https://flowbite-react.com/docs/components/<component>

**Look for:**
- Example usage
- Required vs optional props
- Does it need labels?
- Does it have internal state?
- Any gotchas or warnings?

---

### **Step 4: Document Findings**

Create research notes in `docs/handbook/flowbite-components/<component>.md`:

```markdown
# Flowbite <Component> Research

**Date**: YYYY-MM-DD  
**Flowbite Name**: <ActualName>  
**Type**: input | container | composite

## API Summary

**Props:**
- Required: checked, onChange, etc.
- Optional: theme, color, sizing

**Children**: Yes | No

**Special Notes:**
- Needs label wrapper
- Controlled component
- Self-closing
- etc.

## Example Usage

\`\`\`tsx
// From Flowbite docs
<Checkbox checked={true} onChange={() => {}} />
\`\`\`

## Our Wrapper Strategy

- Import as: `import { Checkbox as FlowbiteCheckbox } from 'flowbite-react'`
- Wrap in: label element (separate)
- SKIN via: style prop
- Pass through: all Flowbite props
```

---

### **Step 5: Update Generator Mapping**

Before running generator, update `scripts/ds-new.mjs`:

```javascript
const flowbiteMap = {
  'Badge': 'Badge',
  'Checkbox': 'Checkbox',
  'Radio': 'Radio',
  'Textarea': 'Textarea',
  'Toggle': 'ToggleSwitch',  // ← Different name!
  'Select': 'Select',
  // Add new component here
};
```

---

### **Step 6: Run Generator With Context**

Now you can run:
```bash
pnpm ds:new <Component>
```

Generator will:
- ✅ Import correct Flowbite component
- ✅ Alias to avoid naming conflict
- ✅ Pass through props correctly

---

## **Quick Research Commands**

```bash
# 1. List all Flowbite components
ls node_modules/flowbite-react/dist/types/components/

# 2. Check specific component
cat node_modules/flowbite-react/dist/types/components/Checkbox/Checkbox.d.ts | head -20

# 3. Grep for key info
grep -A 5 "export interface.*Props" node_modules/flowbite-react/dist/types/components/Checkbox/Checkbox.d.ts

# 4. Check what's exported
grep "export.*from" node_modules/flowbite-react/dist/types/components/Checkbox/index.d.ts
```

---

## **Component Categories**

### **Form Inputs (self-closing, need labels)**
- Checkbox ✅
- Radio ✅
- Toggle (ToggleSwitch) ✅
- TextInput
- Textarea ✅
- Select

**Pattern:**
```tsx
<label>
  <FlowbiteCheckbox {...props} />
  <span>Label text</span>
</label>
```

### **Containers (accept children)**
- Badge ✅
- Button
- Card
- Modal

**Pattern:**
```tsx
<FlowbiteBadge {...props}>
  Content
</FlowbiteBadge>
```

### **Controlled Components (require state)**
- ToggleSwitch (checked, onChange)
- Select (value, onChange)
- TextInput (value, onChange)

**Pattern:**
```tsx
<FlowbiteToggle
  checked={state}
  onChange={setState}
  {...props}
/>
```

### **Not in Flowbite (build custom)**
- Sheet (capability-aware Modal/BottomSheet)
- Advanced pickers
- Custom compositions

**Pattern:**
Build from scratch or compose Flowbite primitives

---

## **Failure Post-Mortem**

### **What Went Wrong (This Session)**

1. **Skipped research** → assumed all components are containers
2. **Generic template** → generated `<div>` instead of Flowbite import
3. **No type checking** → didn't know Toggle requires checked/onChange
4. **Wrong stories** → treated inputs as containers

### **Cost of Skipping Research**

- 5 components generated incorrectly
- All had to be manually fixed
- Storybook broken for 10+ minutes
- Multiple iteration cycles

### **With Research (5 min upfront)**

- Would have known:
  - Checkbox/Radio/Toggle are inputs (self-closing)
  - Toggle requires checked + onChange
  - Need label wrappers
  - Correct naming (Toggle → ToggleSwitch)
- Generator would produce correct code first time
- Storybook would work immediately

---

## **Integration with Generator**

### **Proposed: Research-First Generator**

```bash
# New command that enforces research first
pnpm ds:research <Component>   # Step 1: Research + document
pnpm ds:new <Component>         # Step 2: Generate (only if researched)
```

**Research command would:**
1. Check if Flowbite has component
2. Extract type definition
3. Generate research template
4. Ask: "Ready to generate? (y/n)"

### **Alternative: Manual Checklist**

Keep research as manual step (current):
1. Developer runs research commands
2. Documents findings
3. Updates generator mapping if needed
4. Runs `pnpm ds:new`

---

## **Reference: Flowbite Component Inventory**

**Available in Flowbite:**
- Accordion
- Alert
- Avatar
- Badge ✅
- Banner
- Blockquote
- Breadcrumb
- Button ✅
- Card
- Carousel
- Checkbox ✅
- Clipboard
- DarkThemeToggle
- Datepicker
- Drawer
- Dropdown
- FileInput
- Footer
- HR
- Kbd
- Label
- List
- ListGroup
- MegaMenu
- Modal
- Navbar
- Pagination
- Popover (Floating UI)
- Progress
- Radio ✅
- RangeSlider
- Rating
- Select ✅
- Sidebar
- Spinner
- Table
- Tabs
- Textarea ✅
- TextInput
- Timeline
- Toast
- ToggleSwitch ✅
- Tooltip

**Not in Flowbite:**
- Sheet (our custom capability-aware)
- Advanced date pickers
- Rich text editors
- Custom compositions

---

## **Success Criteria**

✅ **Before generating any DS component:**
1. Flowbite component existence confirmed
2. Type definition read and understood
3. Required props identified
4. Children acceptance verified
5. Example usage documented
6. Generator mapping updated (if needed)

✅ **After generating:**
1. Component imports actual Flowbite component
2. Props pass through correctly
3. Stories render without errors
4. TypeScript compiles
5. Storybook works first time

---

## **Next Steps**

**For each remaining Core Six:**
1. Run research checklist
2. Document in `docs/handbook/flowbite-components/`
3. Update generator if needed
4. Generate with confidence

**Future generators:**
- Consider adding research step to generator itself
- Auto-extract type definitions
- Validate against Flowbite docs
- Generate research notes automatically

---

**Bottom Line:**

**5 minutes of research upfront** →  
**Saves 30 minutes of fixing broken components**

Always research first. Always stamp with context.
