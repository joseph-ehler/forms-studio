# Surface Hierarchy Patterns

## Philosophy

Your design system supports **complete freedom** while providing **semantic guidance** for guaranteed contrast.

### Core Principles

1. **Explicit > Implicit** - You control backgrounds explicitly
2. **Borders > Shadows** - Flat design uses borders for separation
3. **Semantic Tokens Available** - Use when you want guaranteed contrast
4. **Same-on-same is Valid** - With borders or spacing

---

## Surface Tokens

### Semantic Hierarchy (Guaranteed Contrast)

```css
/* Light Mode */
--ds-surface-page:    #ffffff       /* L0: Page background */
--ds-surface-section: #fafafa       /* L1: Section/stripe (gray-50) */
--ds-surface-card:    #ffffff       /* L2: Cards/panels */
--ds-surface-raised:  #f5f5f5       /* L3: Elevated elements (gray-100) */

/* Dark Mode */
--ds-surface-page:    #0b0f14       /* L0: Page background */
--ds-surface-section: #171717       /* L1: Section/stripe (neutral-900) */
--ds-surface-card:    #0b0f14       /* L2: Cards/panels */
--ds-surface-raised:  #262626       /* L3: Elevated elements (neutral-800) */
```

### Component Backgrounds

```tsx
// Section
<Section bg="transparent" | "base" | "subtle" | "elevated" | "primary" | "accent">

// Card
<Card bg="base" | "subtle" | "elevated" | "transparent">

// Or use semantic tokens directly
<Section style={{ background: 'var(--ds-surface-section)' }}>
```

---

## Recommended Patterns

### ✅ Pattern 1: Guaranteed Contrast (Semantic)

Uses semantic tokens for automatic contrast in any theme.

```tsx
{/* Page level - white (light) / dark (dark) */}
<Section bg="base">
  
  {/* Section stripe - gray-50 (light) / neutral-900 (dark) */}
  <Section bg="subtle">
    <Container maxWidth="standard" padding>
      
      {/* Cards contrast - white (light) / dark (dark) */}
      <Card bg="base">
        Content
      </Card>
      
    </Container>
  </Section>
  
</Section>
```

**Result:**
- Light mode: white → gray-50 → white (clear contrast)
- Dark mode: dark → neutral-900 → dark (clear contrast)

---

### ✅ Pattern 2: Same Background + Border

Valid in flat design - borders provide separation.

```tsx
<Section bg="base">
  <Container maxWidth="standard" padding>
    
    {/* Same bg as Section, but border separates */}
    <Card bg="base" border padding="lg">
      Content
    </Card>
    
  </Container>
</Section>
```

**Result:**
- Same background color (white/white or dark/dark)
- Border provides visual separation
- Relies on spacing + border (not bg contrast)

---

### ✅ Pattern 3: Marketing Page (High Contrast)

Mix semantic + explicit for branded sections.

```tsx
{/* Hero - brand color with dark text */}
<Section bg="primary" tone="dark" gradient="bottom" paddingY="xl">
  <Container maxWidth="narrow" padding>
    <Display>Welcome</Display>
  </Container>
</Section>

{/* Features stripe */}
<Section bg="subtle" dividerTop="wave">
  <Container maxWidth="standard" padding>
    <Grid columns={3} gap="lg">
      <Card bg="base">Feature 1</Card>
      <Card bg="base">Feature 2</Card>
      <Card bg="base">Feature 3</Card>
    </Grid>
  </Container>
</Section>

{/* CTA - elevated */}
<Section bg="elevated">
  <Container maxWidth="narrow" padding>
    <Card bg="base" padding="xl">
      <Button>Get Started</Button>
    </Card>
  </Container>
</Section>
```

---

### ✅ Pattern 4: SaaS Dashboard (Low Contrast, Dense)

Same-on-same with borders for density.

```tsx
<Section bg="base">
  <Container maxWidth="max" padding>
    
    <Grid columns={3} gap="md">
      {/* All same bg, borders separate */}
      <Card bg="base" border padding="md">
        Metric 1
      </Card>
      <Card bg="base" border padding="md">
        Metric 2
      </Card>
      <Card bg="base" border padding="md">
        Metric 3
      </Card>
    </Grid>
    
  </Container>
</Section>
```

---

### ✅ Pattern 5: Form on Stripe

Classic pattern - form card on gray background.

```tsx
<Section bg="subtle" paddingY="xl">
  <Container maxWidth="narrow" padding>
    
    {/* White card on gray stripe */}
    <Card bg="base" padding="xl">
      <Stack spacing="normal">
        <Heading>Sign In</Heading>
        <FormLayout>
          {/* Form fields */}
        </FormLayout>
      </Stack>
    </Card>
    
  </Container>
</Section>
```

---

### ✅ Pattern 6: Nested Sections

Sections can nest for layered effects.

```tsx
<Section bg="base">
  <Section bg="primary" tone="dark">
    <Container maxWidth="narrow" padding>
      
      {/* Elevated card floats on brand bg */}
      <Card bg="elevated" padding="lg">
        Highlighted content
      </Card>
      
    </Container>
  </Section>
</Section>
```

---

## Anti-Patterns

### ⚠️ Same-on-same without Border or Spacing

Works but very flat - relies only on spacing.

```tsx
{/* Low contrast - no visual separation */}
<Section bg="base">
  <Card bg="base" border={false}>
    Hard to distinguish from section
  </Card>
</Section>
```

**Fix:** Add `border` or use contrasting `bg`:
```tsx
<Card bg="base" border>...</Card>
{/* OR */}
<Card bg="subtle">...</Card>
```

---

## Component API Reference

### Section

```tsx
interface SectionProps {
  // Background
  bg?: 'transparent' | 'base' | 'subtle' | 'elevated' | 'primary' | 'accent'
  bgColor?: string  // Custom color override
  
  // Text contrast
  tone?: 'auto' | 'light' | 'dark'
  
  // Auto-container
  maxWidth?: LayoutPreset | 'full'
  padding?: boolean
  
  // Visual elements
  gradient?: 'none' | 'top' | 'bottom' | 'cover'
  dividerTop?: 'none' | 'subtle' | 'strong' | 'wave' | 'diagonal'
  dividerBottom?: 'none' | 'subtle' | 'strong' | 'wave' | 'diagonal'
  borderTop?: boolean
  borderBottom?: boolean
  
  // Spacing
  paddingY?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
}
```

### Card

```tsx
interface CardProps {
  // Background
  bg?: 'base' | 'subtle' | 'elevated' | 'transparent'
  
  // Variant
  variant?: 'default' | 'glass'
  
  // Border (primary separator in flat design)
  border?: boolean  // Default: true
  
  // Spacing
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  
  // Custom overrides
  style?: React.CSSProperties
}
```

---

## Decision Tree

**Need guaranteed contrast across themes?**
→ Use semantic `bg` values: `base`, `subtle`, `elevated`

**Building marketing pages with brand colors?**
→ Mix semantic + explicit: `bg="primary"` + `tone="dark"`

**Building dense dashboards?**
→ Same-on-same + `border`: `<Card bg="base" border>`

**Need maximum flexibility?**
→ Use `bgColor` on Section, `style` on Card

---

## Theme Behavior

All semantic tokens automatically adapt:

```tsx
{/* Same code works in light AND dark mode */}
<Section bg="subtle">
  <Card bg="base">
    Auto-adapts to theme
  </Card>
</Section>
```

**Light mode:**
- Section: gray-50
- Card: white
- Result: Subtle contrast

**Dark mode:**
- Section: neutral-900
- Card: dark
- Result: Subtle contrast (inverted)

---

## Summary

✅ **Do:**
- Use semantic `bg` for guaranteed contrast
- Use borders with same-bg for density
- Mix semantic + explicit for brands
- Document your patterns

❌ **Avoid:**
- Same-bg without borders (unless intentional)
- Hardcoded colors (use tokens)
- Fighting the flat design system

**Freedom + Guidance = God-Tier Surface System** 🔥
