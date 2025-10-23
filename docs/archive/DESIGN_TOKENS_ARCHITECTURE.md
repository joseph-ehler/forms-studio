# 🎨 Design Tokens Architecture

**Philosophy**: Semantic → Alias → Raw (Three-Layer System)  
**Technology**: CSS Custom Properties (CSS Variables)  
**Switching**: Runtime (no rebuild required)

---

## **📐 Three-Layer Architecture**

```
┌──────────────────────────────────────────────────────┐
│  SEMANTIC LAYER (Components use these)              │
│  --ds-color-text-primary                            │
│  --ds-space-6                                       │
│  --ds-heading-xl                                    │
│  ↓ Abstract, theme-aware, swappable                │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  ALIAS LAYER (Theme mapping)                        │
│  --tw-neutral-900                                   │
│  --tw-blue-600                                      │
│  ↓ Tailwind palette, brand-swappable               │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  RAW LAYER (Actual hex values)                      │
│  #171717                                            │
│  #2563eb                                            │
│  ↓ Fixed values, never change                      │
└──────────────────────────────────────────────────────┘
```

---

## **🗂️ Token Categories**

### **1. Spacing Tokens** (`surface.vars.css`)

**File**: `styles/tokens/surface.vars.css`

**Naming Convention**: `--ds-space-{number}`

```css
/* Mathematical 4px scale */
--ds-space-0: 0;
--ds-space-1: 0.25rem;   /* 4px */
--ds-space-2: 0.5rem;    /* 8px */
--ds-space-3: 0.75rem;   /* 12px */
--ds-space-4: 1rem;      /* 16px */
--ds-space-5: 1.25rem;   /* 20px */
--ds-space-6: 1.5rem;    /* 24px - DEFAULT! */
--ds-space-8: 2rem;      /* 32px */
--ds-space-10: 2.5rem;   /* 40px */
--ds-space-12: 3rem;     /* 48px */
--ds-space-16: 4rem;     /* 64px */
--ds-space-20: 5rem;     /* 80px */
--ds-space-24: 6rem;     /* 96px */

/* Semantic aliases */
--ds-space-xs: var(--ds-space-2);    /* 8px */
--ds-space-sm: var(--ds-space-3);    /* 12px */
--ds-space-md: var(--ds-space-4);    /* 16px */
--ds-space-lg: var(--ds-space-6);    /* 24px */
--ds-space-xl: var(--ds-space-8);    /* 32px */
--ds-space-2xl: var(--ds-space-12);  /* 48px */
--ds-space-3xl: var(--ds-space-16);  /* 64px */
```

**Usage in Components**:
```css
.ds-card {
  padding: var(--ds-space-6);  /* 24px */
}

.ds-stack {
  gap: var(--ds-space-6);  /* 24px */
}
```

**Philosophy**: 
- All spacing is multiples of 4px
- Default: 24px (beautiful, professional)
- Components NEVER use raw pixel values

---

### **2. Color Tokens** (`color.vars.css`)

**File**: `styles/tokens/color.vars.css`

**Three-Layer System**:

#### **Layer 1: Raw Values (Tailwind Palette)**
```css
:root {
  /* Never used directly by components! */
  --tw-neutral-50: #fafafa;
  --tw-neutral-900: #171717;
  --tw-blue-600: #2563eb;
  --tw-green-600: #16a34a;
  /* ... full Tailwind palette */
}
```

#### **Layer 2: Alias Layer (Brand Switching)**
```css
/* Theme maps semantic → alias */
:root[data-brand="default"] {
  --ds-color-text-primary: var(--tw-neutral-900);
  --ds-color-text-link: var(--tw-blue-600);
}

:root[data-brand="acme"] {
  --ds-color-text-primary: var(--tw-zinc-900);   /* Different neutral */
  --ds-color-text-link: var(--tw-violet-600);    /* Different brand */
}
```

#### **Layer 3: Semantic Tokens (Components Use These)**
```css
/* Text */
--ds-color-text-primary      /* Main content text */
--ds-color-text-secondary    /* Supporting text */
--ds-color-text-muted        /* De-emphasized text */
--ds-color-text-inverted     /* White on dark */
--ds-color-text-link         /* Hyperlinks */
--ds-color-text-link-hover   /* Link hover state */

/* Surface */
--ds-color-surface-base      /* Background/canvas */
--ds-color-surface-subtle    /* Slight elevation */
--ds-color-surface-raised    /* Card/elevated surface */
--ds-color-surface-overlay   /* Modal backdrop */
--ds-color-surface-glass     /* Frosted glass effect */

/* Border */
--ds-color-border-subtle     /* Default borders */
--ds-color-border-strong     /* Emphasized borders */
--ds-color-border-focus      /* Focus rings */
--ds-color-border-error      /* Error borders */

/* State */
--ds-color-state-info        /* Info (blue) */
--ds-color-state-success     /* Success (green) */
--ds-color-state-warning     /* Warning (amber) */
--ds-color-state-danger      /* Error (red) */

/* Interactive */
--ds-color-primary-bg           /* Primary button bg */
--ds-color-primary-bg-hover     /* Hover state */
--ds-color-primary-bg-active    /* Pressed state */
--ds-color-primary-text         /* Button text */

--ds-color-secondary-bg         /* Secondary button bg */
--ds-color-secondary-text       /* Secondary text */

--ds-color-ghost-bg             /* Ghost button bg */
--ds-color-ghost-text           /* Ghost text */
```

**Usage in Components**:
```css
.ds-label {
  color: var(--ds-color-text-primary);
}

.ds-helper--error {
  color: var(--ds-color-state-danger);
}

.ds-label:focus-within {
  outline-color: var(--ds-color-border-focus);
}
```

**Theme Switching**:
```typescript
// Light mode
document.documentElement.setAttribute('data-theme', 'light')

// Dark mode
document.documentElement.setAttribute('data-theme', 'dark')

// Brand switching
document.documentElement.setAttribute('data-brand', 'acme')
```

**Available Brands**:
- `default` - Blue + Neutral
- `acme` - Violet + Zinc
- `techcorp` - Emerald + Slate
- `sunset` - Rose + Neutral

---

### **3. Typography Tokens** (`typography.vars.css`)

**File**: `styles/tokens/typography.vars.css`

**Naming Convention**: `--ds-{scale}-{size}-{property}`

```css
/* Display Scale (Marketing/Hero) */
--ds-display-2xl-size: 4.5rem;        /* 72px */
--ds-display-2xl-size-mobile: 3.75rem; /* 60px */
--ds-display-2xl-line: 1.1;
--ds-display-2xl-weight: 800;
--ds-display-2xl-spacing: -0.02em;

/* Heading Scale (SaaS/App) */
--ds-heading-xl-size: 1.875rem;       /* 30px */
--ds-heading-xl-size-mobile: 1.5rem;  /* 24px */
--ds-heading-xl-line: 1.3;
--ds-heading-xl-weight: 700;
--ds-heading-xl-spacing: -0.01em;

/* Body Scale (Content/UI) */
--ds-body-md-size: 1rem;              /* 16px */
--ds-body-md-line: 1.5;
--ds-body-md-weight: 400;
--ds-body-md-spacing: 0;

/* Font Weights */
--ds-weight-normal: 400;
--ds-weight-medium: 500;
--ds-weight-semibold: 600;
--ds-weight-bold: 700;
--ds-weight-extrabold: 800;
```

**Usage in Components**:
```css
.ds-heading-xl {
  font-size: var(--ds-heading-xl-size);
  line-height: var(--ds-heading-xl-line);
  font-weight: var(--ds-heading-xl-weight);
  letter-spacing: var(--ds-heading-xl-spacing);
}

@media (max-width: 768px) {
  .ds-heading-xl {
    font-size: var(--ds-heading-xl-size-mobile);
  }
}
```

---

### **4. Shell Tokens** (`shell.vars.css`)

**File**: `styles/tokens/shell.vars.css`

**Categories**:

#### **Safe Areas** (iOS Notch, Android Nav)
```css
--ds-safe-top: env(safe-area-inset-top, 0px);
--ds-safe-bottom: env(safe-area-inset-bottom, 0px);
--ds-safe-left: env(safe-area-inset-left, 0px);
--ds-safe-right: env(safe-area-inset-right, 0px);
```

#### **Viewport** (Mobile-Aware Heights)
```css
--ds-viewport-height: 100dvh;  /* Dynamic viewport */
--ds-viewport-height-safe: calc(100dvh - var(--ds-safe-top) - var(--ds-safe-bottom));
```

#### **Touch Targets** (Accessibility)
```css
--ds-touch-min: 2.75rem;        /* 44px - iOS minimum */
--ds-touch-comfortable: 3rem;   /* 48px - Android minimum */
--ds-touch-relaxed: 3.5rem;     /* 56px - Generous */
--ds-touch-large: 4rem;         /* 64px - Extra large */
```

#### **Content Widths** (Tenant-Aware)
```css
/* B2C: Readable content */
--ds-content-b2c-text: 50rem;   /* 800px */
--ds-content-b2c-form: 36rem;   /* 576px */
--ds-content-b2c-page: 56rem;   /* 896px */
--ds-content-b2c-max: 80rem;    /* 1280px */

/* B2B: Wide dashboards */
--ds-content-b2b-min: 64rem;        /* 1024px */
--ds-content-b2b-standard: 90rem;   /* 1440px */
--ds-content-b2b-wide: 120rem;      /* 1920px */
--ds-content-b2b-max: 160rem;       /* 2560px */

/* Auto (adapts to tenant) */
--ds-content-default-max: var(--ds-content-b2c-max);
```

**Tenant Switching**:
```css
:root[data-tenant="b2c"] {
  --ds-content-default-max: var(--ds-content-b2c-max);  /* 1280px */
}

:root[data-tenant="b2b"] {
  --ds-content-default-max: var(--ds-content-b2b-max);  /* 2560px */
}
```

#### **Z-Index System** (Layering)
```css
--ds-z-base: 0;
--ds-z-content: 1;
--ds-z-topbar: 100;
--ds-z-bottomnav: 100;
--ds-z-drawer: 200;
--ds-z-sheet: 300;
--ds-z-overlay: 400;
--ds-z-toast: 500;
--ds-z-tooltip: 600;
--ds-z-modal: 700;
```

---

### **5. Surface Tokens** (`surface.vars.css`)

**File**: `styles/tokens/surface.vars.css`

#### **Border Radius**
```css
--ds-radius-none: 0;
--ds-radius-sm: 0.25rem;   /* 4px */
--ds-radius-md: 0.5rem;    /* 8px */
--ds-radius-lg: 0.75rem;   /* 12px */
--ds-radius-xl: 1rem;      /* 16px */
--ds-radius-2xl: 1.5rem;   /* 24px */
--ds-radius-full: 9999px;
```

#### **Shadows** (Flat First!)
```css
--ds-shadow-none: none;

/* ONLY for overlays/modals */
--ds-shadow-overlay-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
--ds-shadow-overlay-md: 0 4px 16px rgba(0, 0, 0, 0.12);
--ds-shadow-overlay-lg: 0 8px 24px rgba(0, 0, 0, 0.16);
```

#### **Glass Effect**
```css
--ds-glass-bg: rgba(255, 255, 255, 0.7);
--ds-glass-blur: blur(12px);
--ds-glass-border: 1px solid rgba(255, 255, 255, 0.2);
```

#### **Container Max-Widths** (Generic)
```css
--ds-container-xs: 20rem;    /* 320px */
--ds-container-sm: 24rem;    /* 384px */
--ds-container-md: 28rem;    /* 448px */
--ds-container-lg: 32rem;    /* 512px */
--ds-container-xl: 36rem;    /* 576px */
--ds-container-2xl: 42rem;   /* 672px */
--ds-container-3xl: 48rem;   /* 768px */
--ds-container-4xl: 56rem;   /* 896px */
--ds-container-5xl: 64rem;   /* 1024px */
--ds-container-6xl: 72rem;   /* 1152px */
--ds-container-7xl: 80rem;   /* 1280px */
```

---

### **6. Button Tokens** (`button.vars.css`)

**File**: `styles/tokens/button.vars.css`

**Structure**: Per-variant color sets

```css
/* Primary Button */
--ds-button-primary-bg: var(--tw-blue-600);
--ds-button-primary-bg-hover: var(--tw-blue-700);
--ds-button-primary-bg-active: var(--tw-blue-800);
--ds-button-primary-text: #ffffff;
--ds-button-primary-border: transparent;

/* Secondary Button */
--ds-button-secondary-bg: var(--tw-neutral-100);
--ds-button-secondary-bg-hover: var(--tw-neutral-200);
--ds-button-secondary-text: var(--tw-neutral-900);

/* Ghost Button */
--ds-button-ghost-bg: transparent;
--ds-button-ghost-text: var(--tw-neutral-700);

/* State Variants */
--ds-button-danger-bg: var(--ds-color-state-danger);
--ds-button-success-bg: var(--ds-color-state-success);
--ds-button-warning-bg: var(--ds-color-state-warning);

/* Disabled State */
--ds-button-disabled-bg: var(--ds-color-surface-subtle);
--ds-button-disabled-text: var(--ds-color-text-muted);
--ds-button-disabled-opacity: 0.6;
```

---

## **📝 Naming Conventions**

### **Pattern**: `--ds-{category}-{subcategory}-{property}-{modifier}`

### **Examples**:
```css
--ds-space-6                     /* spacing */
--ds-color-text-primary          /* color > text */
--ds-heading-xl-size-mobile      /* typography > heading > size > mobile */
--ds-button-primary-bg-hover     /* button > primary > bg > hover */
--ds-content-b2c-form            /* content width > B2C > form */
--ds-safe-top                    /* safe area > top */
--ds-z-overlay                   /* z-index > overlay */
```

### **Prefix Rules**:
- `--ds-*` - Design System tokens (public API)
- `--tw-*` - Tailwind palette (internal, never used by components)

---

## **🔄 Runtime Switching**

### **Theme Switching**

**How It Works**:
```typescript
// AppProvider sets data-theme attribute
document.documentElement.setAttribute('data-theme', 'dark')

// CSS responds automatically
:root[data-theme="dark"] {
  --ds-color-text-primary: var(--tw-neutral-50);  /* Light text */
  --ds-color-surface-base: #0b0f14;               /* Dark bg */
}
```

**System Theme Tracking**:
```typescript
// Tracks OS preference changes in real-time
const mql = window.matchMedia('(prefers-color-scheme: dark)')
mql.addEventListener('change', () => {
  const theme = mql.matches ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
})
```

### **Tenant Switching**

**How It Works**:
```typescript
// AppProvider sets data-tenant attribute
document.documentElement.setAttribute('data-tenant', 'b2b')

// CSS responds automatically
:root[data-tenant="b2b"] {
  --ds-content-default-max: var(--ds-content-b2b-max);  /* 2560px */
}
```

### **Brand Switching**

**How It Works**:
```typescript
// Change brand via data-brand attribute
document.documentElement.setAttribute('data-brand', 'acme')

// CSS remaps tokens
:root[data-brand="acme"] {
  --ds-color-text-primary: var(--tw-zinc-900);     /* Zinc instead of Neutral */
  --ds-color-text-link: var(--tw-violet-600);      /* Violet instead of Blue */
}
```

---

## **🛠️ Component Consumption**

### **Rule**: Components NEVER use raw values

**❌ Wrong**:
```css
.ds-card {
  padding: 24px;
  background: #ffffff;
  color: #171717;
}
```

**✅ Correct**:
```css
.ds-card {
  padding: var(--ds-space-6);
  background: var(--ds-color-surface-base);
  color: var(--ds-color-text-primary);
}
```

### **Token Priority**:
1. **Semantic tokens** (preferred) - `--ds-color-text-primary`
2. **Alias tokens** (never) - `--tw-neutral-900`
3. **Raw values** (never) - `#171717`

---

## **📦 Token File Organization**

```
styles/tokens/
├── color.vars.css         # 3-layer color system
├── surface.vars.css       # Spacing, radius, shadows, containers
├── typography.vars.css    # Typography scale, weights
├── shell.vars.css         # Safe areas, viewport, widths, z-index
└── button.vars.css        # Button-specific color tokens
```

### **Import Order** (in `components/index.ts`):
```typescript
import './ds-typography.css'
import '../styles/tokens/color.vars.css'
import '../styles/tokens/typography.vars.css'
import '../styles/tokens/surface.vars.css'
import '../styles/tokens/button.vars.css'
import '../styles/tokens/shell.vars.css'
```

---

## **✅ Token System Guarantees**

1. **Runtime Switching** - No rebuild required for themes/brands/tenants
2. **Type Safety** - CSS variables are checked by browser
3. **Single Source of Truth** - Change token, update everywhere
4. **Semantic API** - Components use meaning, not implementation
5. **Theme-Aware** - Light/dark automatic
6. **Brand-Swappable** - 4 brands out-of-box, unlimited possible
7. **Tenant-Aware** - B2C/B2B auto-adapts
8. **4px Grid** - All spacing mathematically aligned
9. **Flat First** - Shadows only for overlays
10. **Mobile-Native** - Safe areas, touch targets, dynamic viewport

---

## **🎯 Key Principles**

1. **Three Layers**: Semantic → Alias → Raw
2. **Semantic API**: Components use `--ds-*` only
3. **Runtime Switching**: data-theme/data-brand/data-tenant
4. **No Raw Values**: All values via tokens
5. **Mathematical Scale**: 4px spacing grid
6. **Theme-Aware**: Automatic light/dark adaptation
7. **Brand-Swappable**: Unlimited brands via Tailwind palette

---

**Your token system is a three-layer architecture that enables runtime theme/brand/tenant switching without rebuilds. Components consume semantic tokens only, which map to swappable alias tokens, which point to raw Tailwind palette values.** 🎨
