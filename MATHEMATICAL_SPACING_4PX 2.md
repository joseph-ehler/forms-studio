# 🎯 Mathematical Spacing System - 4px Foundation

**Updated**: October 22, 2025  
**Status**: ✅ **COMPLETE - All components converted to rem**

---

## **Philosophy: Everything Divides by 4**

Our entire design system is built on a **4px mathematical foundation** using `rem` units.

### **Why 4px?**
- ✅ Aligns with industry standards (Apple HIG, Material Design)
- ✅ Creates visual harmony and rhythm
- ✅ Easy mental math (multiples of 4)
- ✅ Works perfectly with touch targets (44px = 11 × 4)
- ✅ Scales beautifully on all screens

### **Why rem instead of px?**
- ✅ **Accessibility**: Respects user's browser font size
- ✅ **Scalability**: Entire system scales proportionally  
- ✅ **Consistency**: 1rem = 16px (browser default)
- ✅ **Best Practice**: Industry standard

---

## **Core Spacing Scale**

Located in `src/styles/tokens/surface.vars.css`:

```css
--ds-space-0:  0;           /* 0px */
--ds-space-1:  0.25rem;     /* 4px  = 1 × 4 */
--ds-space-2:  0.5rem;      /* 8px  = 2 × 4 */
--ds-space-3:  0.75rem;     /* 12px = 3 × 4 */
--ds-space-4:  1rem;        /* 16px = 4 × 4 */
--ds-space-5:  1.25rem;     /* 20px = 5 × 4 */
--ds-space-6:  1.5rem;      /* 24px = 6 × 4 */
--ds-space-8:  2rem;        /* 32px = 8 × 4 */
--ds-space-10: 2.5rem;      /* 40px = 10 × 4 */
--ds-space-12: 3rem;        /* 48px = 12 × 4 */
--ds-space-16: 4rem;        /* 64px = 16 × 4 */
--ds-space-20: 5rem;        /* 80px = 20 × 4 */
--ds-space-24: 6rem;        /* 96px = 24 × 4 */
```

### **Semantic Aliases**
```css
--ds-space-xs:  var(--ds-space-2);   /* 8px */
--ds-space-sm:  var(--ds-space-3);   /* 12px */
--ds-space-md:  var(--ds-space-4);   /* 16px */
--ds-space-lg:  var(--ds-space-6);   /* 24px */
--ds-space-xl:  var(--ds-space-8);   /* 32px */
--ds-space-2xl: var(--ds-space-12);  /* 48px */
--ds-space-3xl: var(--ds-space-16);  /* 64px */
```

---

## **Component Sizing (✅ All Converted)**

### **Buttons** (`button.vars.css`)
```css
/* Mobile (touch-friendly) */
--ds-button-height-sm: 2.5rem;   /* 40px = 10 × 4 */
--ds-button-height-md: 3rem;     /* 48px = 12 × 4 */
--ds-button-height-lg: 3.5rem;   /* 56px = 14 × 4 */

/* Desktop (mouse-optimized) */
--ds-button-height-sm-desktop: 2rem;    /* 32px = 8 × 4 */
--ds-button-height-md-desktop: 2.5rem;  /* 40px = 10 × 4 */
--ds-button-height-lg-desktop: 3rem;    /* 48px = 12 × 4 */

/* Min widths */
--ds-button-min-width-sm: 4rem;     /* 64px = 16 × 4 */
--ds-button-min-width-md: 5.5rem;   /* 88px = 22 × 4 */
--ds-button-min-width-lg: 7.5rem;   /* 120px = 30 × 4 */
```

### **Touch Targets** (`shell.vars.css`)
```css
--ds-touch-min:         2.75rem;  /* 44px = 11 × 4 (iOS min) */
--ds-touch-comfortable: 3rem;     /* 48px = 12 × 4 (Android min) */
--ds-touch-relaxed:     3.5rem;   /* 56px = 14 × 4 */
--ds-touch-large:       4rem;     /* 64px = 16 × 4 */
```

### **Shell Components** (`shell.vars.css`)
```css
/* TopBar */
--ds-topbar-height-mobile:  3.5rem;  /* 56px = 14 × 4 */
--ds-topbar-height-desktop: 4rem;    /* 64px = 16 × 4 */

/* BottomNav */
--ds-bottomnav-height: 4rem;  /* 64px = 16 × 4 */

/* Drawer */
--ds-drawer-width:      17.5rem;  /* 280px = 70 × 4 */
--ds-drawer-width-wide: 20rem;    /* 320px = 80 × 4 */

/* Sheet */
--ds-sheet-handle-width:   2rem;      /* 32px = 8 × 4 */
--ds-sheet-handle-height:  0.25rem;   /* 4px = 1 × 4 */
--ds-sheet-snap-collapsed: 7.5rem;    /* 120px = 30 × 4 */
--ds-sheet-max-width:      37.5rem;   /* 600px = 150 × 4 (desktop) */
```

---

## **Content Width** (✅ Converted to rem)

### **B2C (Readable Content)**
```css
--ds-content-b2c-text: 50rem;  /* 800px = 200 × 4 - Reading */
--ds-content-b2c-form: 50rem;  /* 800px = 200 × 4 - Forms */
--ds-content-b2c-page: 56rem;  /* 896px = 224 × 4 - Pages */
--ds-content-b2c-max:  80rem;  /* 1280px = 320 × 4 - Max */
```

### **B2B (Dashboards)**
```css
--ds-content-b2b-min:      64rem;   /* 1024px = 256 × 4 */
--ds-content-b2b-standard: 90rem;   /* 1440px = 360 × 4 */
--ds-content-b2b-wide:     120rem;  /* 1920px = 480 × 4 */
--ds-content-b2b-max:      160rem;  /* 2560px = 640 × 4 */
```

---

## **Border Radius** (`surface.vars.css`)

```css
--ds-radius-none: 0;
--ds-radius-sm:   0.25rem;  /* 4px = 1 × 4 */
--ds-radius-md:   0.5rem;   /* 8px = 2 × 4 */
--ds-radius-lg:   0.75rem;  /* 12px = 3 × 4 */
--ds-radius-xl:   1rem;     /* 16px = 4 × 4 */
--ds-radius-2xl:  1.5rem;   /* 24px = 6 × 4 */
--ds-radius-full: 9999px;
```

---

## **Conversion Formula**

```
rem = px ÷ 16
```

**Examples:**
- 4px ÷ 16 = 0.25rem
- 44px ÷ 16 = 2.75rem
- 800px ÷ 16 = 50rem

**4px Count Method:**
1. Count units: `px / 4`
2. Convert to rem: `units / 4`
3. Example: 44px → 11 units → 2.75rem

---

## **Usage**

### **In Tokens**
```css
:root {
  --my-spacing: 2.5rem;  /* 40px = 10 × 4 */
}
```

### **In Components**
```css
.component {
  padding: var(--ds-space-4);        /* 16px */
  margin: var(--ds-space-6);         /* 24px */
  min-height: var(--ds-touch-min);   /* 44px */
  border-radius: var(--ds-radius-md); /* 8px */
}
```

### **Utility Classes**
```tsx
<Card className="ds-p-4 ds-m-6">  {/* 16px padding, 24px margin */}
```

---

## **What Changed (October 2025)**

### **✅ Converted to rem:**
1. All button heights/widths
2. All touch target sizes  
3. All shell component dimensions
4. All content width constraints
5. Form width: **65ch → 50rem (800px)**

### **❌ Kept in px:**
- Border widths (`1px`, `2px`) - sub-pixel rendering issues
- Media queries (`768px`, `1024px`) - browser convention

---

## **Benefits**

✅ **Mathematical Harmony**: Everything on 4px grid  
✅ **Accessibility**: Scales with user font size  
✅ **Consistency**: No random values  
✅ **Maintainability**: Single source of truth  
✅ **Performance**: CSS variables enable theming  
✅ **DX**: Semantic tokens (xs, sm, md, lg)  

---

## **Key Rule**

> **If it's not divisible by 4, it doesn't belong.**

This foundation ensures visual consistency, accessibility, and scalability across all screens and user preferences. 📐✨
