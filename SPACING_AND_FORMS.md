# 📐 Spacing & Forms Guide

**TL;DR**: Use `Stack` for spacing. Default is 24px. Forms use `FormLayout` at ~576px width.

---

## **Quick Start**

### **Basic Form**
```tsx
import { FormLayout, Heading, TextField, Button } from '@joseph-ehler/wizard-react'

function SignupForm() {
  return (
    <FormLayout>
      <Heading size="lg">Create Account</Heading>
      <TextField label="Email" />
      <TextField label="Password" type="password" />
      <Button variant="primary">Sign Up</Button>
    </FormLayout>
  )
}
```

**Result**: 
- ✅ 24px spacing between elements
- ✅ 576px max width (constrained on desktop)
- ✅ Centered
- ✅ Full width on mobile

---

## **Components**

### **FormLayout** - Form-Optimized Container
```tsx
<FormLayout 
  maxWidth="xl"      // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  spacing="normal"   // 'tight' | 'normal' | 'relaxed'
>
  {fields}
</FormLayout>
```

**Defaults**:
- `maxWidth="xl"` (576px) - optimal form width
- `spacing="normal"` (24px) - beautiful spacing

**When to use**: Any form (signup, settings, checkout)

---

### **Stack** - General Spacing
```tsx
<Stack 
  spacing="normal"   // 'tight' | 'normal' | 'relaxed'
  direction="column" // 'column' | 'row'
  align="stretch"    // 'start' | 'center' | 'end' | 'stretch'
>
  {children}
</Stack>
```

**Spacing Options**:
- `tight`: 12px (related items)
- `normal`: 24px (default, beautiful)
- `relaxed`: 32px (section breaks)

**When to use**: Any vertical/horizontal spacing

---

## **Desktop Constraints**

### **Policy**: 
**Constrain typical forms and single-column content to ~576px by default.**

### **Why**:
- ✅ Prevents forms from sprawling across wide screens
- ✅ Maintains optimal line length for readability
- ✅ Professional, focused appearance
- ✅ Works perfectly on mobile (full width)

### **When to expand**:
- Dashboards (data tables, charts)
- Marketing pages (hero sections)
- Multi-column layouts

---

## **Spacing Scale**

### **4px Mathematical Grid**
All spacing is a multiple of 4px:

| Token | Value | Use Case |
|-------|-------|----------|
| `--ds-space-2` | 8px | Label→Input |
| `--ds-space-3` | **12px** | **Tight groups** |
| `--ds-space-4` | 16px | Compact sections |
| `--ds-space-6` | **24px** | **Default (beautiful!)** |
| `--ds-space-8` | **32px** | **Section breaks** |
| `--ds-space-12` | 48px | Major dividers |

### **Why 4px**:
- Creates visual rhythm
- Prevents arbitrary spacing
- Industry standard
- Works at all screen sizes

---

## **Examples**

### **Tight Group (Label + Input)**
```tsx
<Stack spacing="tight">
  <Label>Email Address</Label>
  <Input type="email" />
  <HelperText>We'll never share your email</HelperText>
</Stack>
```
**Result**: 12px between elements (visually connected)

---

### **Normal Form**
```tsx
<FormLayout>
  <Heading>Settings</Heading>
  <TextField label="Name" />
  <TextField label="Email" />
  <TextField label="Phone" />
  <Button>Save Changes</Button>
</FormLayout>
```
**Result**: 24px between fields (clean, professional)

---

### **Section Breaks**
```tsx
<Stack spacing="relaxed">
  <Section1 />
  <Divider />
  <Section2 />
</Stack>
```
**Result**: 32px between sections (clear separation)

---

## **Typography Has No Margins**

All typography components have `margin: 0`:

```css
.ds-heading-xl, .ds-body-md {
  margin: 0;  /* Containers own spacing */
}
```

**Why**: Prevents double-spacing. Containers (Stack, FormLayout) control all spacing via `gap`.

---

## **Utility Classes**

For edge cases:

```tsx
<div className="ds-p-6">      {/* 24px padding */}
<div className="ds-gap-4">    {/* 16px gap */}
<div className="ds-my-8">     {/* 32px vertical margin */}
```

**Prefer**: Components (Stack, Box) over utilities when possible.

---

## **Lint Rules**

### **Off-Grid Spacing Prevention**

`.stylelintrc.spacing.json` enforces 4px grid:

**❌ Not Allowed**:
```css
padding: 10px;
margin: 14px;
gap: 18px;
```

**✅ Allowed**:
```css
padding: var(--ds-space-6);
margin: 0;
gap: var(--ds-space-4);
```

---

## **Container Widths**

Used by `FormLayout` and `Container`:

| Name | Token | Width | Use Case |
|------|-------|-------|----------|
| `sm` | `--ds-container-sm` | 384px | Narrow forms |
| `md` | `--ds-container-md` | 448px | Compact forms |
| `lg` | `--ds-container-lg` | 512px | Standard forms |
| **`xl`** | `--ds-container-xl` | **576px** | **Optimal (default)** |
| `2xl` | `--ds-container-2xl` | 672px | Wide forms |

---

## **Philosophy**

### **Beautiful by Default**
- 24px spacing feels professional, not cramped
- Generous touch targets for mobile
- Calm, readable interfaces

### **Explicit Over Magic**
- No hidden heuristics
- No automatic classification
- You say `spacing="normal"`, you get 24px
- Predictable, debuggable

### **Containers Own Rhythm**
- Stack controls spacing (via `gap`)
- Typography has no margins
- No double-spacing bugs
- Single source of truth

### **Desktop Constraints**
- Forms default to 576px max width
- Prevents sprawl across wide screens
- Still responsive on mobile
- Professional appearance

---

## **Decision Tree**

**Q**: Need a form?  
**A**: Use `<FormLayout>`

**Q**: Need vertical spacing?  
**A**: Use `<Stack spacing="normal">`

**Q**: Need tight grouping?  
**A**: Use `<Stack spacing="tight">`

**Q**: Need section breaks?  
**A**: Use `<Stack spacing="relaxed">`

**Q**: Need custom padding?  
**A**: Use `<Box p="6">` or `<Card padding="lg">`

**Q**: Need explicit space?  
**A**: Use `<Spacer size="6" />`

---

## **Testing**

### **Snapshot Tests**
Canonical layouts locked in:
- Signup form (24px gaps, 576px width)
- Address block (12px tight groups)
- Settings panel (32px section breaks)

### **Visual Regression**
Playwright asserts:
- Field gaps are 24px
- Form width ≤ 576px on desktop
- Full width on mobile

---

## **Summary**

1. **Use FormLayout** for forms → automatic 576px constraint + 24px spacing
2. **Use Stack** for general spacing → explicit tight/normal/relaxed
3. **4px grid** enforced by lint → no arbitrary values
4. **Typography has no margins** → containers own rhythm
5. **Simple, predictable, explicit** → no magic

---

**That's it. Simple, foolproof spacing.** ✅
