# 🏗️ Complete Design System Reference

**Package**: `@joseph-ehler/wizard-react` v0.3.0  
**Philosophy**: Flat First, Tenant-Aware, Mobile-Native, Atoms Are Neutral

---

## **📋 Quick Stats**

- **Components**: 44 total
- **CSS Size**: 55.29 KB
- **Spacing**: 4px mathematical grid
- **Themes**: Light/Dark/System + 4 brand variants
- **Tenant Support**: B2C (1280px) / B2B (2560px)

---

## **🏛️ Three-Layer Architecture**

```
FOUNDATION (Tokens)
  ↓ CSS Variables: spacing, colors, typography, widths
COMPONENTS (Primitives)
  ↓ Layout, Typography, Interactive, Shell, Overlays
FIELDS (Composites)
  ↓ 13 form fields using primitives
```

---

## **📁 File Structure**

```
packages/wizard-react/src/
├── components/          # All components + CSS
│   ├── shell/          # AppProvider, AppShell, TopBar, etc.
│   ├── overlay/        # OverlayPicker, CalendarSkin
│   ├── picker/         # Picker internals
│   ├── ds-*.css        # Centralized skins
│   └── *.tsx           # Component files
├── fields/             # 13 composite form fields
├── styles/tokens/      # Design tokens (CSS variables)
│   ├── color.vars.css
│   ├── surface.vars.css
│   ├── shell.vars.css
│   └── typography.vars.css
└── index.ts            # Main export
```

---

## **🎨 Foundation Tokens**

### **Spacing** (`surface.vars.css`)
```css
--ds-space-1: 4px    --ds-space-6: 24px (default!)
--ds-space-2: 8px    --ds-space-8: 32px
--ds-space-3: 12px   --ds-space-12: 48px
--ds-space-4: 16px   --ds-space-16: 64px
```
**Philosophy**: 4px grid, 24px beautiful default

### **Colors** (`color.vars.css`)
```css
--ds-color-text-primary/secondary/muted/inverted
--ds-color-surface-base/subtle/raised
--ds-color-border-subtle/strong/focus
--ds-color-state-danger/success/warning/info
```
**Themes**: Light, Dark, System (tracks OS)  
**Brands**: Default, Acme, TechCorp, Sunset

### **Typography** (`typography.vars.css`)
```css
Display: 72px→24px (2xl→md, responsive)
Heading: 30px→14px (xl→xs, responsive)
Body: 20px→12px (xl→xs)
```
**Weights**: 400/500/600/700/800

### **Layout** (`shell.vars.css`)
```css
/* B2C */
--ds-content-b2c-text: 800px   --ds-content-b2c-max: 1280px
--ds-content-b2c-form: 576px   

/* B2B */
--ds-content-b2b-standard: 1440px  --ds-content-b2b-max: 2560px
--ds-content-b2b-wide: 1920px
```
**Auto-adapts**: `data-tenant="b2c|b2b"`

### **Shell** (`shell.vars.css`)
```css
--ds-safe-top/bottom/left/right: iOS notch padding
--ds-viewport-height: 100dvh (dynamic)
--ds-touch-min: 44px (iOS), --ds-touch-comfortable: 48px
--ds-z-topbar: 100, --ds-z-overlay: 400, --ds-z-modal: 700
```

---

## **🧩 Component Inventory**

### **Layout (8)**
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Stack` | Vertical/horizontal spacing | `spacing`, `direction`, `align` |
| `FormLayout` | Form container (576px) | `maxWidth`, `spacing` |
| `Container` | Width constraints (tenant-aware) | `maxWidth`, `padding` |
| `Grid` | Responsive grid (pure CSS) | `columns`, `gap` |
| `Box` | Universal container | `p`, `bg`, `border`, `rounded` |
| `Card` | Pre-configured surface | `padding`, `variant` |
| `Spacer` | Explicit space | `size`, `orientation` |
| `Divider` | Border separator | `spacing`, `orientation` |

### **Typography (7)**
| Component | Use Case | Sizes |
|-----------|----------|-------|
| `Display` | Marketing/hero | 2xl, xl, lg, md |
| `Heading` | App headings | xl, lg, md, sm, xs |
| `Body` / `Text` | Content/UI | xl, lg, md, sm, xs |
| `Label` | Form labels | xs, sm, md, lg, xl |
| `HelperText` | Helper/error | xs, sm, md |
| `Caption` | Small text | xs, sm |
| `Prose` | CMS content (only place with margins!) | sm, md, lg |

**Rule**: All `margin: 0` except Prose

### **Interactive (1)**
| Component | Variants | Features |
|-----------|----------|----------|
| `Button` | primary, secondary, ghost, danger, success, warning, link | Loading, icons, full-width, sizes (sm/md/lg/xl) |

### **Shell (7)**
| Component | Purpose | Features |
|-----------|---------|----------|
| `AppProvider` | Root context | Tenant type, theme, hooks |
| `AppShell` | App layout | TopBar, Content, BottomNav slots |
| `TopBar` | Native header | Title, actions, blur, safe areas |
| `BottomNav` | Mobile nav | Icons, labels, active state |
| `Drawer` | Side navigation | Left/right, overlay, persistent |
| `Sheet` | Bottom sheet | Snap points, gestures, drag handle |
| `PullToRefresh` | Pull gesture | Loading state, threshold |

### **Overlay (5)**
| Component | Purpose | Features |
|-----------|---------|----------|
| `OverlayPicker` | Root primitive | Portal, focus trap, outside-click, A11y |
| `OverlaySheet` | Mobile surface | Scroll lock, safe areas, full-height |
| `OverlayPopover` | Desktop surface | Positioned popover |
| `CalendarSkin` | Calendar styling | Theme-aware, modifiers |
| `PickerFooter` | Picker actions | Cancel/confirm, event shielding |

**Hardening**: 14+ improvements (documented)

### **Form Fields (13)**
`TextField`, `TextAreaField`, `EmailField`, `PasswordField`, `NumberField`, `TelField`, `UrlField`, `SelectField`, `CheckboxField`, `RadioGroupField`, `SwitchField`, `DateField`, `DateRangeField`

**Pattern**: All use primitives, provide slots only, no CSS imports

---

## **📐 System Rules**

### **Spacing Ownership**
- ✅ **Containers** own spacing (Stack, Box, Card use `gap`)
- ✅ **Atoms** are neutral (`margin: 0`)
- ✅ **Exception**: Prose (CMS content)

### **4px Grid**
- All spacing multiples of 4px
- Lint enforced (`.stylelintrc.spacing.json`)
- Default: 24px

### **Color System**
- No hardcoded RGB values
- Semantic tokens only
- Theme/brand swappable

### **Typography**
- Atoms: `margin: 0`
- Prose: The only exception
- Fluid responsive sizing

### **Tenant Awareness**
- B2C: 1280px max (readable)
- B2B: 2560px max (ultrawide)
- Auto via `data-tenant`

### **Theme System**
- Light/Dark/System
- Real-time OS tracking
- Brand switching

### **No Framework Lock-In**
- Pure CSS (no Tailwind)
- Self-contained
- Portable

---

## **🎯 Usage Patterns**

### **Simple Form**
```tsx
<AppProvider tenantType="b2c">
  <FormLayout>
    <Heading>Sign Up</Heading>
    <TextField label="Email" />
    <Button>Submit</Button>
  </FormLayout>
</AppProvider>
```

### **B2B Dashboard**
```tsx
<AppProvider tenantType="b2b">
  <Container maxWidth="b2b-wide">
    <Grid columns={3} gap="lg">
      <Card>...</Card>
    </Grid>
  </Container>
</AppProvider>
```

### **Mobile App**
```tsx
<AppProvider tenantType="b2c">
  <AppShell>
    <AppShell.TopBar><TopBar title="App" /></AppShell.TopBar>
    <AppShell.Content>{content}</AppShell.Content>
    <AppShell.BottomNav><BottomNav items={nav} /></AppShell.BottomNav>
  </AppShell>
</AppProvider>
```

### **CMS Content**
```tsx
<Prose size="lg">
  <article dangerouslySetInnerHTML={{ __html }} />
</Prose>
```

---

## **📚 Key Documentation**

- `SPACING_AND_FORMS.md` - Spacing system guide
- `SURGICAL_FIXES_2025.md` - Recent improvements
- `SPACING_AUDIT_VIOLATIONS.md` - Fixes audit
- `DESIGN_SYSTEM_COMPLETE.md` - This file

---

## **✅ Design Principles**

1. **Flat First** - No shadows (except overlays)
2. **Atoms Are Neutral** - Typography: `margin: 0`
3. **Containers Own Spacing** - Use `gap` property
4. **4px Grid** - Mathematical rhythm
5. **Tenant-Aware** - B2C vs B2B contexts
6. **Theme-Aware** - Light/Dark/Brand swappable
7. **Mobile-Native** - Safe areas, touch targets
8. **Portable** - No framework dependencies
9. **Explicit > Magic** - No hidden heuristics
10. **Pit of Success** - Correct by default

---

**System Status**: Clean, parallel layers. Foundation → Components → Fields. Foolproof.
