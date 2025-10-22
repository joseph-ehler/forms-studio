# 🎨 Design System Demo

Interactive showcase of the complete design system with white-label theming.

## **🚀 Quick Start**

```bash
# From the demo directory
cd packages/wizard-react/demo

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Then open http://localhost:5173

## **✨ Features**

### **Live White-Label Switching**
- **4 Brands**: Default (Blue), ACME (Violet), TechCorp (Emerald), Sunset (Rose)
- **3 Themes**: Light, Dark, System (tracks OS preference)
- **2 Tenants**: B2C (1280px max), B2B (2560px max)
- **Runtime switching**: <200ms, zero rebuilds

### **Component Showcases**

1. **Typography System**
   - Display, Heading, Body scales
   - All variants and sizes
   - Atoms are neutral (margin: 0)

2. **Layout Primitives**
   - Stack (tight/normal/relaxed spacing)
   - Grid (responsive 2/3/4 columns)
   - FormLayout (576px constrained)
   - Container (tenant-aware widths)
   - 4px mathematical grid

3. **Interactive Components**
   - Button variants (primary, secondary, ghost)
   - State variants (danger, success, warning, info)
   - Sizes (sm, md, lg, xl)
   - Loading & disabled states
   - Flat design (no shadows!)

4. **Form Components**
   - FormLayout with 576px default width
   - Form field states (default, error, success, warning)
   - Single-column by design

5. **Prose Component**
   - THE ONLY place typography gets margins
   - For CMS/markdown content
   - Theme-aware rich text
   - Sizes (sm, md, lg)

6. **Mobile Shell Demo**
   - iOS/Android-native feel
   - Safe area padding
   - Dynamic viewport (100dvh)
   - BottomNav with tabs
   - Swipeable gestures

## **🎯 What to Look For**

### **White-Label Magic**
1. Switch between brands → watch ALL colors update instantly
2. Toggle light/dark theme → see automatic adaptation
3. Change tenant → see max widths adjust (B2C: 1280px, B2B: 2560px)
4. **No rebuild**, **no flash**, **no layout shifts**

### **Flat First Design**
- Notice: NO shadows on any components (except future overlays)
- Borders for separation
- Subtle background color changes for hierarchy
- Clean, modern aesthetic

### **Atoms Are Neutral**
- All typography has `margin: 0`
- Spacing owned by containers (Stack, FormLayout)
- Prose is the exception (CMS content)

### **4px Grid**
- All spacing is multiples of 4px
- Beautiful default: 24px
- Perfect mathematical alignment

### **Theme-Aware Colors**
- Semantic tokens (not raw values)
- Automatic light/dark adaptation
- Brand colors integrate seamlessly

## **🔧 Demo Controls**

The demo includes live controls at the top:

- **Brand Switcher**: 4 white-label brands
- **Theme Mode**: Light/Dark/System
- **Tenant Type**: B2C/B2B (changes max widths)
- **Mobile Shell**: View mobile-native experience

## **📱 Mobile Testing**

1. **Responsive Breakpoints**
   - Grid collapses: Desktop (3-4) → Tablet (2) → Mobile (1)
   - Typography scales down on mobile
   - Touch targets: 44px min (iOS), 48px comfortable

2. **Mobile Shell Demo**
   - Click "Show Mobile Shell Demo" button
   - Experience native mobile UI with:
     - TopBar with safe areas
     - Scrollable content
     - BottomNav with icons
     - 100dvh viewport

## **🎨 Customization Examples**

The demo shows how easy white-labeling is:

### **Create New Brand** (10 minutes)
```css
/* In a new brand CSS file */
:root[data-brand="newco"] {
  --ds-color-primary-bg: #your-color;
  --ds-color-text-link: #your-link;
  --ds-heading-xl-weight: 800;
}
```

Then just:
```typescript
applyBrand({ id: 'newco', theme: 'light', tenantType: 'b2c' })
```

## **🚀 Performance**

- **CSS Size**: 55.29 KB (minified)
- **Brand Switch**: <200ms
- **FOUC**: Prevented (pre-paint script)
- **Zero Rebuilds**: Runtime CSS variable cascade

## **✅ Quality Guarantees**

Automated in the DS:

- ✅ WCAG AA contrast (all brand × theme combinations)
- ✅ Atoms neutral (`margin: 0`)
- ✅ 4px spacing grid
- ✅ Layout stability (no shifts on brand switch)
- ✅ Keyboard navigation
- ✅ Touch targets (44px+ min)

## **📚 Learn More**

From the repo root:

- **Complete Guide**: `DESIGN_SYSTEM_MASTER.md`
- **White-Label**: `WHITE_LABEL_ARCHITECTURE.md`
- **Tokens**: `DESIGN_TOKENS_ARCHITECTURE.md`
- **Ship Checklist**: `SHIP_CHECKLIST.md`

---

**Explore the demo, switch themes, try different brands, and see the design system in action!** 🎯
