# Storybook Architecture Strategy 📚

**Philosophy:** Per-package Storybooks + Root Composition = Zero Tech Debt

---

## TL;DR Recommendation

```
✅ RECOMMENDED ARCHITECTURE:

/
├─ packages/
│  ├─ ds/
│  │  ├─ .storybook/          ← DS-specific Storybook
│  │  └─ src/**/*.stories.tsx
│  ├─ forms/
│  │  ├─ .storybook/          ← Forms-specific Storybook
│  │  └─ src/**/*.stories.tsx
│  └─ core/
│     └─ (no Storybook - utility package)
│
└─ .storybook/                 ← Root Storybook (composition)
   └─ main.ts (refs: ds, forms)
```

**Result:** 3 Storybooks, 2 dev, 1 showcase, zero coupling

---

## Why This Architecture?

### 1. Package Boundaries ✅
**Problem:** Monolithic Storybook breaks package isolation
**Solution:** Each package owns its documentation

```typescript
// packages/ds can develop independently
pnpm --filter @intstudio/ds storybook  // Only DS primitives

// packages/forms can develop independently  
pnpm --filter @intstudio/forms storybook  // Only form fields

// Root can showcase everything
pnpm storybook  // Composed view of all packages
```

**Benefit:** No accidental cross-package coupling in stories

---

### 2. Development Speed ⚡
**Problem:** Single Storybook loads ALL stories → slow HMR
**Solution:** Package-level Storybooks only load relevant stories

**Performance:**
```
Single Storybook (50+ components):
- Cold start: ~15-20 seconds
- HMR: ~3-5 seconds
- Memory: ~800MB

Per-Package (DS: 20 components):
- Cold start: ~5-7 seconds
- HMR: ~1-2 seconds
- Memory: ~300MB

Per-Package (Forms: 30 components):
- Cold start: ~7-10 seconds
- HMR: ~2-3 seconds
- Memory: ~400MB
```

**Benefit:** 2-3x faster dev feedback loop

---

### 3. Versioning & Publishing 📦
**Problem:** Single Storybook can't version per-package
**Solution:** Each package publishes its own Storybook

```json
{
  "@intstudio/ds": {
    "storybook": "https://storybook-ds.intstudio.ai",
    "version": "0.3.0"
  },
  "@intstudio/forms": {
    "storybook": "https://storybook-forms.intstudio.ai",
    "version": "1.2.0"
  }
}
```

**Benefit:** Consumers can browse docs for the exact version they're using

---

### 4. Storybook Composition (v6.5+) 🎨

**Root `.storybook/main.ts`:**
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  
  // No stories at root level
  stories: [],
  
  // Compose from packages
  refs: {
    'ds': {
      title: 'Design System',
      url: 'http://localhost:6006',
      // In production: 'https://storybook-ds.intstudio.ai'
    },
    'forms': {
      title: 'Form Fields',
      url: 'http://localhost:6007',
      // In production: 'https://storybook-forms.intstudio.ai'
    },
  },
  
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
};

export default config;
```

**Result:** Root Storybook shows unified sidebar:
```
📚 Storybook
├─ 🎨 Design System
│  ├─ Primitives
│  │  ├─ Button
│  │  ├─ Checkbox
│  │  └─ ...
│  └─ Recipes
│     ├─ DatePicker
│     └─ ...
└─ 📝 Form Fields
   ├─ TextField
   ├─ CheckboxField
   └─ ...
```

---

## Detailed Structure

### A. DS Storybook (`packages/ds/.storybook/`)

**Purpose:** DS primitive & recipe documentation

**Stories:**
- `/src/primitives/**/*.stories.tsx` - Buttons, inputs, checkboxes
- `/src/recipes/**/*.stories.tsx` - DatePicker, ColorPicker, etc.
- `/src/demos/**/*.stories.tsx` - Composition examples

**Config:**
```typescript
// packages/ds/.storybook/main.ts
export default {
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
};
```

**Run:** `pnpm --filter @intstudio/ds storybook`  
**Port:** `6006`  
**URL:** `http://localhost:6006`

---

### B. Forms Storybook (`packages/forms/.storybook/`)

**Purpose:** Form field documentation & testing

**Stories:**
- `/src/fields/**/*.stories.tsx` - All form fields

**Config:**
```typescript
// packages/forms/.storybook/main.ts
export default {
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions', // For RHF testing
  ],
  framework: '@storybook/react-vite',
};
```

**Run:** `pnpm --filter @intstudio/forms storybook`  
**Port:** `6007`  
**URL:** `http://localhost:6007`

---

### C. Root Storybook (`.storybook/`)

**Purpose:** Unified showcase (composition only)

**No Local Stories:** Uses `refs` to compose DS + Forms

**Config:**
```typescript
// .storybook/main.ts
export default {
  stories: [], // No local stories
  refs: {
    ds: { title: 'Design System', url: 'http://localhost:6006' },
    forms: { title: 'Forms', url: 'http://localhost:6007' },
  },
  addons: ['@storybook/addon-essentials'],
};
```

**Run:** `pnpm storybook` (root-level script)  
**Port:** `6008`  
**URL:** `http://localhost:6008` (shows composed view)

---

## Development Workflows

### Daily Dev: Per-Package
```bash
# Working on DS primitives
cd packages/ds
pnpm storybook
# → Fast, focused, only DS stories

# Working on form fields
cd packages/forms
pnpm storybook
# → Fast, focused, only form stories
```

**Benefits:**
- ✅ Instant HMR (small scope)
- ✅ No distractions from other packages
- ✅ Full dev tools (Axe, viewport, etc.)

---

### QA/Review: Root Composition
```bash
# Start all Storybooks
pnpm run storybook:all

# View composed showcase
open http://localhost:6008
```

**Benefits:**
- ✅ See full system in one view
- ✅ Test cross-package interactions
- ✅ Share single URL for design review

---

### CI/CD: Static Builds
```yaml
# .github/workflows/storybook-deploy.yml
- name: Build DS Storybook
  run: pnpm --filter @intstudio/ds build-storybook
  
- name: Build Forms Storybook
  run: pnpm --filter @intstudio/forms build-storybook
  
- name: Deploy to Chromatic (or Netlify)
  run: |
    # Deploy DS to storybook-ds.intstudio.ai
    # Deploy Forms to storybook-forms.intstudio.ai
```

---

## Migration Plan (From Current State)

**Current:** Single Storybook in `packages/ds`

**Step 1: Create Forms Storybook**
```bash
cd packages/forms
mkdir .storybook
```

**`packages/forms/.storybook/main.ts`:**
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react-vite',
};

export default config;
```

**`packages/forms/package.json`:**
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6007",
    "build-storybook": "storybook build"
  },
  "devDependencies": {
    "@storybook/addon-a11y": "^8.6.14",
    "@storybook/addon-essentials": "^8.6.14",
    "@storybook/addon-interactions": "^8.6.14",
    "@storybook/react": "^8.6.14",
    "@storybook/react-vite": "^8.6.14",
    "storybook": "^8.6.14"
  }
}
```

**Move stories:**
```bash
# If any form field stories exist in packages/ds
mv packages/ds/src/**/Field*.stories.tsx packages/forms/src/fields/
```

---

**Step 2: Create Root Composition**
```bash
mkdir .storybook
```

**`.storybook/main.ts`:**
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [],
  
  refs: {
    ds: {
      title: 'Design System',
      url: process.env.DS_STORYBOOK_URL || 'http://localhost:6006',
    },
    forms: {
      title: 'Form Fields',
      url: process.env.FORMS_STORYBOOK_URL || 'http://localhost:6007',
    },
  },
  
  addons: ['@storybook/addon-essentials'],
  framework: '@storybook/react-vite',
};

export default config;
```

**Root `package.json`:**
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6008",
    "storybook:all": "concurrently \"pnpm --filter @intstudio/ds storybook\" \"pnpm --filter @intstudio/forms storybook\" \"pnpm storybook\"",
    "build-storybook": "pnpm --filter @intstudio/ds build-storybook && pnpm --filter @intstudio/forms build-storybook && storybook build"
  },
  "devDependencies": {
    "@storybook/react-vite": "^8.6.14",
    "storybook": "^8.6.14",
    "concurrently": "^8.0.0"
  }
}
```

---

**Step 3: Update Docs & Workflows**
```markdown
<!-- README.md -->
## 📚 Storybook

**Local Development:**
- DS Primitives: `pnpm --filter @intstudio/ds storybook`
- Form Fields: `pnpm --filter @intstudio/forms storybook`
- Full Showcase: `pnpm storybook:all`

**Published Docs:**
- DS: https://storybook-ds.intstudio.ai
- Forms: https://storybook-forms.intstudio.ai
```

---

## Tech Debt Prevention ✅

### 1. No Cross-Package Story Dependencies
**Rule:** Stories can ONLY import from their own package + published peer deps

```typescript
// ✅ GOOD (packages/forms/src/fields/TextField/TextField.stories.tsx)
import { TextField } from './TextField';
import { Button } from '@intstudio/ds'; // Published peer dep

// ❌ BAD
import { Button } from '../../../ds/src/primitives/Button'; // Direct import
```

**Enforcement:**
- Import Doctor catches violations
- Dependency cruiser enforces boundaries
- ESLint `no-restricted-imports` blocks deep imports

---

### 2. Shared Stories Config
**Problem:** Config duplication across `.storybook` folders

**Solution:** Shared presets

**`packages/storybook-config/preset.ts`:**
```typescript
export const storybookPreset = {
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
  docs: { autodocs: 'tag' },
};
```

**Consume:**
```typescript
// packages/ds/.storybook/main.ts
import { storybookPreset } from '@intstudio/storybook-config';

export default {
  ...storybookPreset,
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
};
```

---

### 3. Story Testing (Prevent Stale Stories)
**Problem:** Stories break when components change

**Solution:** Playwright + Storybook interaction tests

**`tests/storybook.spec.ts`:**
```typescript
import { test, expect } from '@playwright/test';

test('DS Storybook loads', async ({ page }) => {
  await page.goto('http://localhost:6006');
  await expect(page.locator('text=Button')).toBeVisible();
});

test('Forms Storybook loads', async ({ page }) => {
  await page.goto('http://localhost:6007');
  await expect(page.locator('text=TextField')).toBeVisible();
});
```

**CI:**
```yaml
- name: Test Storybooks
  run: pnpm test:storybook
```

---

## Decision Matrix

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Single Root Storybook** | Simple | Slow HMR, breaks boundaries, couples packages | ❌ |
| **Per-Package Only** | Fast, isolated | No unified view | ⚠️ Missing showcase |
| **Per-Package + Root Composition** | Fast dev, unified showcase, clear boundaries | 3 configs to maintain | ✅ RECOMMENDED |

---

## Success Metrics

**Before (Single Storybook):**
- ❌ 15-20s cold start
- ❌ 3-5s HMR
- ❌ All packages coupled
- ❌ One version for all

**After (Per-Package + Composition):**
- ✅ 5-7s cold start (per package)
- ✅ 1-2s HMR (per package)
- ✅ Zero coupling (boundaries enforced)
- ✅ Per-package versioning
- ✅ Unified showcase still available

**Savings:** ~3x faster dev feedback, cleaner architecture

---

## FAQs

**Q: Why not a single root Storybook with all stories?**  
A: Breaks package boundaries, slow HMR, couples development

**Q: Why not just package-level Storybooks?**  
A: Missing unified showcase for design review

**Q: How do composed refs work?**  
A: Storybook composition loads remote Storybooks in iframes, stitches sidebar

**Q: What if I want to run just one Storybook?**  
A: Run per-package for dev, root for showcase

**Q: How does this scale with more packages?**  
A: Add more `refs` in root config, no performance impact

---

## Implementation Checklist

**Phase 1: Forms Storybook**
- [ ] Create `packages/forms/.storybook/`
- [ ] Add Storybook deps to `packages/forms/package.json`
- [ ] Move/create form field stories
- [ ] Test: `pnpm --filter @intstudio/forms storybook`

**Phase 2: Root Composition**
- [ ] Create `.storybook/` at root
- [ ] Configure composition refs
- [ ] Add `storybook:all` script
- [ ] Test: `pnpm storybook:all`

**Phase 3: CI/CD**
- [ ] Update deploy workflows
- [ ] Publish to separate URLs
- [ ] Add story smoke tests

**Phase 4: Docs**
- [ ] Update README
- [ ] Add Storybook architecture docs
- [ ] Document per-package dev workflow

**Time Estimate:** 2-3 hours

---

## Conclusion

**Per-Package Storybooks + Root Composition** gives you:

✅ **Fast dev loops** (package isolation)  
✅ **Clear boundaries** (no coupling)  
✅ **Unified showcase** (design review)  
✅ **Per-package versioning** (consumer docs)  
✅ **Zero tech debt** (scales indefinitely)

**Motto:** "Develop in isolation, showcase together"

---

**Next Steps:**
1. Create `packages/forms/.storybook/`
2. Test: `pnpm --filter @intstudio/forms storybook`
3. Create `.storybook/` at root with composition
4. Update scripts & docs

**Ready to implement?** Start with Phase 1 (Forms Storybook) and validate the architecture.
