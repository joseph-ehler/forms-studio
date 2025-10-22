# Design System Studio - Extraction Strategy

**Goal**: Create `@design-system/overlay` without duplication or breaking changes.

**Strategy**: One truth + one proxy → Strangler Fig migration

---

## 🎯 The "One Truth + One Proxy" Model

### Option A: Form Studio Truth (Recommended Now)

**Truth**: Lives in Form Studio (where it works today)  
**Proxy**: Create `@design-system/overlay` that re-exports from Form Studio

```typescript
// packages/design-system/overlay/src/index.ts
export * from '@joseph-ehler/wizard-react/src/components/overlay';
```

Consumers import from `@design-system/overlay`, but there's **only one implementation**.

When ready to extract, move files and flip the proxy.

---

### Option B: DS Studio Truth (Future)

**Truth**: Move primitives into Design-System Studio  
**Proxy**: Form Studio re-exports from DS

```typescript
// packages/wizard-react/src/components/overlay/index.ts
export * from '@design-system/overlay';
```

---

## 🌳 Strangler Fig Migration

### Today
- Truth = Form Studio
- Create `@design-system/overlay` facade (re-exports)

### When Ready
- Move `overlay/`, `ds-calendar.css`, `tokens.ts`, `debug.ts` to DS
- Change Form Studio barrel to re-export from DS (flip proxy)

### Cutover
- Consumers switch imports at their own pace
- Both paths point to same code (no breaking changes)

---

## 📦 What Moves to DS (Eventually)

| Layer | Where | Why |
|-------|-------|-----|
| **Tokens** (z-index, spacing) | Design-System | Brand/system constants |
| **Skins** (ds-calendar.css) | Design-System | Visual language |
| **Root Primitives** | Design-System | OverlayPicker, OverlaySheet, etc. |
| **Context** (auto-wiring) | Design-System | Cross-cutting infrastructure |
| **debugX() utils** | Design-System | Diagnostics are part of primitive |
| **Field consumers** | Form Studio | Product composition/behavior |
| **Form-specific tokens** | Form Studio | Product-specific (if any) |

**Rule of thumb**: Brand/system/cross-cutting → DS. Business logic/composition → Form Studio.

---

## 🏗️ Monorepo Structure (Future)

```
/packages
  /design-system
    /overlay
      src/
        OverlayPicker.tsx
        OverlaySheet.tsx
        CalendarSkin.tsx
        ds-calendar.css
        tokens.ts
        debug.ts
        index.ts          # Official DS barrel
      package.json
      
  /wizard-react
    src/
      components/
        overlay/
          index.ts        # Re-export from DS (proxy)
      fields/
        DateField.tsx     # Uses @design-system/overlay
    package.json
```

---

## 🛡️ Guardrails to Prevent Drift

### ESLint Rules

In `wizard-react/src/fields/**`:
- 🚫 Ban `position: fixed`
- 🚫 Ban `text-*`/`font-*`/`leading-*`
- 🚫 Ban importing `react-day-picker/dist/style.css`
- 🚫 Ban direct path imports to overlay internals (must use barrel)

In `design-system/overlay/**`:
- ✅ Enforce tokens import for z-index, colors, timing

### CI Checks

```bash
# Only one overlay implementation
git ls-files | grep -E "/overlay/OverlayPicker.tsx$" | wc -l | xargs test 1 -eq

# No duplicate CSS skins
git ls-files | grep -E "ds-calendar\.css$" | wc -l | xargs test 1 -eq

# No deep imports
git grep -nE "from.*wizard-react.*overlay/Overlay" packages/ \
  && echo "❌ Deep import found. Use barrel." && exit 1
```

---

## 🚀 How to Introduce DS Now (No Refactor)

### Step 1: Create DS Facade Package

```bash
mkdir -p packages/design-system/overlay/src
```

```typescript
// packages/design-system/overlay/src/index.ts
// Re-export from Form Studio (proxy)
export * from '@joseph-ehler/wizard-react/src/components/overlay';
```

```json
// packages/design-system/overlay/package.json
{
  "name": "@design-system/overlay",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@joseph-ehler/wizard-react": "workspace:*"
  }
}
```

### Step 2: Switch Consumer Imports Gradually

```typescript
// FROM
import { OverlayPicker } from '@joseph-ehler/wizard-react/src/components/overlay';

// TO
import { OverlayPicker } from '@design-system/overlay';
```

### Step 3: Lock in Guardrails

```javascript
// .eslintrc.js
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          "@joseph-ehler/wizard-react/src/components/overlay/*",
          "!@joseph-ehler/wizard-react/overlay"
        ],
        "message": "Import from @design-system/overlay or use the barrel"
      }
    ]
  }
}
```

---

## ⚡ Lightweight "Do It Later" Plan

If you want to postpone DS Studio:

### 1. Canonical Import Path (Now)

```json
// packages/wizard-react/package.json
{
  "exports": {
    ".": "./dist/index.js",
    "./overlay": "./src/components/overlay/index.ts"
  }
}
```

Usage:
```typescript
import { OverlayPicker } from '@joseph-ehler/wizard-react/overlay';
```

### 2. TypeScript Path Alias (Optional)

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "paths": {
      "@ds/overlay": ["packages/wizard-react/src/components/overlay/index.ts"]
    }
  }
}
```

Usage:
```typescript
import { OverlayPicker } from '@ds/overlay';
```

Later, point `@ds/overlay` to actual DS package.

### 3. Guardrails

- ESLint: Block deep imports
- CI: Check for duplicates
- PR: "Import from .../overlay only"

---

## 🎯 Benefits

### Today
- ✅ One truth in Form Studio (works, tested)
- ✅ One public surface (consistent imports)
- ✅ Zero duplication
- ✅ Clear extraction path

### Future
- ✅ Extract = flip a proxy
- ✅ No breaking changes
- ✅ Gradual migration
- ✅ Still one source of truth

---

## ❓ FAQ

### Q: Is it okay to "live in both"?
**A**: Yes - but only as one truth + one proxy. Two copies = drift.

### Q: What about tokens and skins?
**A**: Promote them to DS early. Least risky, most leverage.

### Q: How ensure fields stop hardcoding?
**A**: ESLint + CI grep + contract tests + generators (we have this).

---

## 📋 Checklist

### Now (No Extraction)
- [x] One canonical import (wizard-react/overlay)
- [ ] TypeScript path alias (@ds/overlay)
- [ ] ESLint ban deep imports
- [ ] CI check for duplicates
- [ ] Document in PR template

### Later (DS Extraction)
- [ ] Create @design-system/overlay package
- [ ] Move files (primitives, skins, tokens, debug)
- [ ] Flip proxy in wizard-react
- [ ] Update imports gradually
- [ ] Deprecate old paths

---

**One source of truth. One re-export. Zero drift.** 🎯
