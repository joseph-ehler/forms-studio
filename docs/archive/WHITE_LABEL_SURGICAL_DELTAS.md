# 🎯 White-Label Surgical Deltas - Implementation Tracker

**Status**: 🚧 In Progress  
**Goal**: Bulletproof white-label system with zero regression risk

---

## **Phase 1: Guard Fixes & Tokenization** ⚡ (Immediate)

### **A. Whitelist Prose Margins + SR-Only** ✅ READY
**Status**: Files created, needs integration

**Created**:
- ✅ `input.vars.css` - Input shadow tokens
- ✅ `ds-calendar.tokens.css` - Calendar color tokens

**Next Steps**:
1. Update Stylelint config to whitelist:
   ```js
   const MARGIN_OK = [/^\.ds-prose\s/, /^\.ds-sr-only$/];
   ```

2. Update `scripts/guard-ds.js` to ignore:
   ```js
   const SAFE_MARGIN_FILES = ['ds-prose.css', 'ds-typography.css'];
   const SAFE_SELECTORS = ['.ds-prose', '.ds-sr-only'];
   ```

**Files to Update**:
- [ ] `.stylelintrc.json` - Add margin whitelist
- [ ] `scripts/guard-ds.js` - Add safe file/selector checks
- [ ] `scripts/guard-atoms.js` - Add Prose exception

---

### **B. Replace Raw rgba() Shadows in Inputs** ✅ DONE
**Status**: Tokens created, needs CSS updates

**Created**:
- ✅ `styles/tokens/input.vars.css` with:
  - `--ds-input-shadow-sm`
  - `--ds-input-shadow-md`
  - `--ds-input-shadow-focus`
  - Input state tokens (bg, border, text)

**Next Steps**:
1. Update `ds-inputs.css` to use tokens:
   ```css
   input, textarea, select {
     box-shadow: var(--ds-input-shadow-sm);
   }
   input:focus {
     box-shadow: var(--ds-input-shadow-focus);
   }
   ```

**Files to Update**:
- [ ] `components/ds-inputs.css` - Replace raw shadows with tokens
- [ ] `components/index.ts` - Import input.vars.css

---

### **C. Tokenize ds-calendar.css Hexes** ✅ DONE
**Status**: Tokens created, needs CSS refactor

**Created**:
- ✅ `components/overlay/ds-calendar.tokens.css` with:
  - `--ds-calendar-bg/fg/accent/border` (12 tokens)
  - Theme-aware dark mode adjustments

**Next Steps**:
1. Replace all `#374151`, `#6b7280`, etc. in `ds-calendar.css` with tokens
2. Import tokens before calendar CSS

**Files to Update**:
- [ ] `components/overlay/ds-calendar.css` - Replace hexes with tokens
- [ ] `components/overlay/index.ts` - Import ds-calendar.tokens.css

---

## **Phase 2: Cascade Layers** 🎨 (Architecture)

### **1. Create Layer Structure** 📋 TODO
**Status**: Not started

**Goal**: Deterministic CSS precedence without !important

**Structure**:
```css
@layer tokens, brand, components, utilities;
```

**Order**:
1. **tokens** - Base design tokens (lowest priority)
2. **brand** - Brand overrides (override tokens)
3. **components** - Component styles (use tokens)
4. **utilities** - Utility classes (highest priority)

**Files to Create**:
- [ ] `styles/layers.css` - Layer declarations + imports

**Example**:
```css
/* styles/layers.css */
@layer tokens, brand, components, utilities;

@layer tokens {
  @import './tokens/color.vars.css';
  @import './tokens/typography.vars.css';
  @import './tokens/surface.vars.css';
  @import './tokens/shell.vars.css';
  @import './tokens/input.vars.css';
}

@layer brand {
  @import './brands/default/brand.css';
  @import './brands/acme/brand.css';
  @import './brands/techcorp/brand.css';
  @import './brands/sunset/brand.css';
}

@layer components {
  @import '../components/ds-typography.css';
  @import '../components/ds-spacing.css';
  @import '../components/ds-inputs.css';
  @import '../components/overlay/ds-calendar.tokens.css';
  @import '../components/overlay/ds-calendar.css';
}

@layer utilities {
  /* Opt-in utilities */
}
```

**Files to Update**:
- [ ] `components/index.ts` - Import layers.css instead of individual files
- [ ] All brand CSS files - Wrap in `@layer brand { }`

---

### **2. Convert Brand Files to Layers** 📋 TODO
**Status**: Not started

**Update all brand CSS files**:
```css
/* Before */
:root[data-brand="acme"] {
  --ds-color-primary-bg: var(--tw-violet-600);
}

/* After */
@layer brand {
  :root[data-brand="acme"] {
    --ds-color-primary-bg: var(--tw-violet-600);
  }
}
```

**Files to Update**:
- [ ] `styles/brands/default/brand.css`
- [ ] `styles/brands/acme/brand.css`
- [ ] `styles/brands/techcorp/brand.css`
- [ ] `styles/brands/sunset/brand.css`

---

## **Phase 3: Scoped Branding** 🎯 (Power Feature)

### **1. Low-Specificity Scoping with :where()** 📋 TODO
**Status**: Not started

**Goal**: Per-subtree branding without cascade fights

**Pattern**:
```css
@layer brand {
  :where([data-brand="acme"]) {
    --ds-color-primary-bg: var(--tw-violet-600);
    /* ... */
  }
}
```

**Why :where()**:
- Keeps specificity at 0
- Scoping doesn't cause cascade conflicts
- Components continue using `var(--ds-...)` normally

**Files to Update**:
- [ ] All brand CSS files - Wrap selectors in `:where()`

**Demo to Add**:
```tsx
<div data-brand="acme">
  <AppShell />  {/* ACME brand */}
  
  <div data-brand="techcorp">
    <PartnerWidget />  {/* TechCorp brand */}
  </div>
</div>
```

---

## **Phase 4: Testing & Quality Gates** ✅ (Bulletproof)

### **1. Token Contract Tests (JSDOM)** 📋 TODO
**Status**: Not started

**Goal**: Catch bad brand packs in CI

**Test Structure**:
```typescript
// tokens-contract.spec.ts
const REQUIRED_TOKENS = [
  '--ds-color-text-primary',
  '--ds-color-primary-bg',
  '--ds-color-border-subtle',
  '--ds-content-b2c-form',
  // ... 20-30 core tokens
];

test.each(['default','acme','techcorp','sunset'])(
  '%s has required tokens',
  (brand) => {
    document.documentElement.setAttribute('data-brand', brand);
    const styles = getComputedStyle(document.documentElement);
    
    for (const token of REQUIRED_TOKENS) {
      const value = styles.getPropertyValue(token).trim();
      expect(value).not.toBe('');
      expect(value).not.toBe('initial');
    }
  }
);
```

**Files to Create**:
- [ ] `tests/tokens-contract.spec.ts` - Token presence tests
- [ ] `tests/setup/jsdom.ts` - JSDOM + CSS loading

---

### **2. Contrast Matrix (Playwright)** ✅ DONE
**Status**: Already created (brand-contrast.spec.ts)

**Coverage**:
- ✅ 4 brands × 2 themes = 8 combinations
- ✅ Text/surface contrast (≥4.5:1)
- ✅ Button contrast (≥4.5:1)
- ✅ State colors (≥3:1)
- ✅ Focus rings (≥3:1)

---

### **3. DS CLI Skeleton** 📋 TODO
**Status**: Not started

**Goal**: Dev joy + governance commands

**Commands**:
```bash
ds brand new <id>           # Scaffold new brand from template
ds brand validate <id>      # Run token presence + contrast tests
ds brand preview <id>       # Open browser preview with brand
ds tokens diff <a> <b>      # Show token differences
```

**Structure**:
```
packages/ds-cli/
├── package.json
├── bin/
│   └── ds                  # #!/usr/bin/env node
└── src/
    ├── index.ts           # CLI entry (commander)
    ├── commands/
    │   ├── brand-new.ts
    │   ├── brand-validate.ts
    │   ├── brand-preview.ts
    │   └── tokens-diff.ts
    └── lib/
        ├── template.ts    # Brand template
        └── validate.ts    # Token checker
```

**Files to Create**:
- [ ] `packages/ds-cli/package.json`
- [ ] `packages/ds-cli/bin/ds`
- [ ] `packages/ds-cli/src/index.ts`
- [ ] `packages/ds-cli/src/commands/*.ts`

---

## **Phase 5: Polish & Future-Proofing** 🚀 (Optional)

### **1. Focus Tokens** 📋 TODO
**Status**: Not started

**Add to `surface.vars.css`**:
```css
:root {
  --ds-focus-ring-width: 2px;
  --ds-focus-offset: 2px;
  --ds-focus-ring-color: var(--ds-color-border-focus);
}
```

**Apply everywhere**:
```css
.focusable:focus-visible {
  outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
  outline-offset: var(--ds-focus-offset);
}
```

---

### **2. RTL Support (Logical Properties)** 📋 TODO
**Status**: Not started

**Migration**:
- `margin-left` → `margin-inline-start`
- `margin-right` → `margin-inline-end`
- `padding-left` → `padding-inline-start`
- `padding-right` → `padding-inline-end`

**Files to Update**:
- [ ] All component CSS files

---

### **3. Motion Safety** 📋 TODO
**Status**: Not started

**Add to `surface.vars.css`**:
```css
:root {
  --ds-motion-scale: 1;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --ds-motion-scale: 0;
  }
}
```

**Apply to animations**:
```css
.transition {
  transition-duration: calc(200ms * var(--ds-motion-scale));
}
```

---

### **4. OKLCH Palette Generator** 📋 TODO
**Status**: Future enhancement

**Goal**: Perceptually uniform colors with guaranteed AA contrast

**API Sketch**:
```typescript
export type OKLCH = { l: number; c: number; h: number };

export function oklchToSRGBHex({ l, c, h }: OKLCH): string {
  // TODO: Implement conversion
  return '#000000';
}

export function ramp(
  base: OKLCH,
  steps: number,
  deltaL: number
): string[] {
  return Array.from({ length: steps }, (_, i) =>
    oklchToSRGBHex({
      l: base.l + (i - steps / 2) * deltaL,
      c: base.c,
      h: base.h,
    })
  );
}
```

---

### **5. Brand Studio (MVP)** 📋 TODO
**Status**: Future enhancement

**Features**:
- Left: Token controls (primary hue, neutral hue, radius, motion)
- Right: Live preview tabs (Form, Dashboard, Prose)
- Footer: AA status lights + "Export brand.css / brand.json"

**Implementation**:
```tsx
function BrandStudio() {
  const [primaryHue, setPrimaryHue] = useState(262); // Violet
  const [neutralHue, setNeutralHue] = useState(240); // Slate
  
  // Live apply
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--ds-color-primary-bg',
      `hsl(${primaryHue}, 70%, 50%)`
    );
  }, [primaryHue]);
  
  return (
    <Grid columns={2}>
      <TokenControls
        primaryHue={primaryHue}
        onPrimaryHueChange={setPrimaryHue}
        // ...
      />
      <LivePreview />
    </Grid>
  );
}
```

---

## **Priority Order** 🎯

### **Week 1** (Immediate)
1. ✅ A. Whitelist Prose margins in guards
2. ✅ B. Tokenize input shadows
3. ✅ C. Tokenize calendar colors
4. Update CSS files to use new tokens

### **Week 2** (Architecture)
5. Create cascade layer structure
6. Convert brand files to layers
7. Implement :where() scoping

### **Week 3** (Quality Gates)
8. Token contract tests (JSDOM)
9. DS CLI skeleton
10. Focus tokens

### **Future** (Polish)
11. RTL support (logical properties)
12. Motion safety
13. OKLCH generator
14. Brand Studio MVP

---

## **Success Metrics** 📊

**After Phase 1-3**:
- ✅ Guard violations: 0
- ✅ Raw colors in CSS: 0
- ✅ Raw shadows in CSS: 0
- ✅ Brand switch time: <200ms
- ✅ WCAG AA compliance: 100%
- ✅ Scoped branding: Working
- ✅ Cascade conflicts: 0

**After Phase 4**:
- ✅ Token contract: Enforced in CI
- ✅ Bad brand packs: Blocked
- ✅ Dev CLI: Available
- ✅ Brand creation: 10 minutes

**After Phase 5**:
- ✅ RTL support: Complete
- ✅ Motion safety: Enforced
- ✅ Focus system: Unified
- ✅ Brand Studio: Functional

---

## **Files to Create** 📝

**Tokens**:
- ✅ `styles/tokens/input.vars.css`
- ✅ `components/overlay/ds-calendar.tokens.css`
- [ ] `styles/layers.css`

**Tests**:
- [ ] `tests/tokens-contract.spec.ts`
- [ ] `tests/setup/jsdom.ts`

**CLI**:
- [ ] `packages/ds-cli/package.json`
- [ ] `packages/ds-cli/bin/ds`
- [ ] `packages/ds-cli/src/index.ts`
- [ ] `packages/ds-cli/src/commands/*.ts`

**Docs**:
- [ ] `CASCADE_LAYERS.md`
- [ ] `SCOPED_BRANDING.md`
- [ ] `DS_CLI.md`

---

## **Files to Update** ✏️

**CSS** (Token replacements):
- [ ] `components/ds-inputs.css`
- [ ] `components/overlay/ds-calendar.css`

**Guardrails**:
- [ ] `.stylelintrc.json`
- [ ] `scripts/guard-ds.js`
- [ ] `scripts/guard-atoms.js`

**Brand Files** (Layers + :where()):
- [ ] `styles/brands/default/brand.css`
- [ ] `styles/brands/acme/brand.css`
- [ ] `styles/brands/techcorp/brand.css`
- [ ] `styles/brands/sunset/brand.css`

**Exports**:
- [ ] `components/index.ts`
- [ ] `components/overlay/index.ts`

---

## **Next Immediate Actions** ⚡

**Do Now** (30 minutes):
1. Update `.stylelintrc.json` - Add Prose/sr-only whitelist
2. Update `scripts/guard-ds.js` - Add safe file checks
3. Update `components/ds-inputs.css` - Use input tokens
4. Update `components/overlay/ds-calendar.css` - Use calendar tokens

**Do Next** (2 hours):
5. Create `styles/layers.css` with @layer structure
6. Update all brand files with @layer + :where()
7. Update main exports to use layers.css

**Do After** (4 hours):
8. Create token contract tests
9. Create DS CLI skeleton
10. Update docs

---

**This tracker will be updated as each phase completes.** 🎯
