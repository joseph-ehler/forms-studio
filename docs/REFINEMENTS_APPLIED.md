# Quality Layer Refinements - Applied

**Sharp tactical improvements completed**

---

## ✅ Implemented

### 1. Version Check Script
**File**: `scripts/check-versions.mjs`

Validates locked versions match overrides:
```bash
pnpm versions:check
```

Output shows ✅/❌ for each dependency. CI fails if mismatch.

### 2. Dev Assert Helper
**File**: `packages/ds/src/utils/devAssert.ts`

Consistent error format for runtime contracts:
```typescript
devAssert(ariaLabel, '[DS.Modal] ariaLabel is required');
```

Benefits:
- Searchable stack traces (`[DS.*]`)
- Stripped in production
- Clean error messages

### 3. SSR Guard Helper
**File**: `packages/ds/src/utils/isBrowser.ts`

Safe browser detection:
```typescript
if (isBrowser()) {
  window.addEventListener('resize', handleResize);
}
```

Prevents Next.js/Remix SSR errors.

### 4. Diagnostics Toggle (Prop Wins)
Updated Modal to honor prop over global:
```typescript
const shouldDebug = debug ?? (isBrowser() && window.__DS_DEBUG);
```

Prevents surprise logs when global is set.

### 5. Type Ergonomics
Added `as const` to useModal props:
```typescript
props: { open, onClose } as const
```

Preserves literal types for better intellisense.

### 6. Package Scripts
Added to root `package.json`:
```json
{
  "scripts": {
    "versions:check": "node scripts/check-versions.mjs",
    "guard": "pnpm barrels:check && pnpm fix:imports && pnpm typecheck"
  }
}
```

### 7. Documentation
Created:
- `docs/handbook/quality-layer-definition.md` - Complete definition + acceptance checklist
- `docs/handbook/version-policy.md` - Version matrix + upgrade playbook

---

## 📋 Open Questions - Answered

### Tokens Naming
**Q**: Keep `--ds-*` forever?  
**A**: ✅ YES - No alias churn. Permanent convention.

### Dark Mode Strategy  
**Q**: Class strategy (`.dark`) not media query?  
**A**: ✅ YES - Controlled, SSR-safe, user preference override.

### Icons
**Q**: Prefer `flowbite-react-icons`?  
**A**: ✅ YES - Consistent with ecosystem, tree-shakeable, typed.

### Drawer Behavior
**Q**: Non-modal by default (no trap), Esc closes?  
**A**: ✅ YES - Panel UX pattern. Modal mode when needed.

### Select
**Q**: First pass uses Flowbite native `<select>`?  
**A**: ✅ YES - Start simple. Advanced searchable later if needed.

All answers documented in `docs/handbook/version-policy.md`.

---

## 🎯 First Commits (Ready to Land)

### Commit 1: Foundation
```bash
git add package.json
git add pnpm-lock.yaml  # After pnpm install
git commit -m "chore: lock dependency versions (TW 3.4.14, TS 5.8.2, Flowbite 0.10.2/2.5.2)"
```

### Commit 2: Utilities
```bash
git add packages/ds/src/utils/
git add packages/ds/src/fb/Modal.tsx  # Uses devAssert + isBrowser
git add packages/ds/src/fb/Field.tsx  # Uses devAssert
git commit -m "feat(ds): add devAssert and isBrowser utilities"
```

### Commit 3: Version Check
```bash
git add scripts/check-versions.mjs
git add package.json  # versions:check script
git commit -m "chore: add version check script"
```

### Commit 4: Documentation
```bash
git add docs/handbook/quality-layer-definition.md
git add docs/handbook/version-policy.md
git commit -m "docs: add quality layer definition and version policy"
```

### Commit 5: First Wrappers
```bash
git add packages/ds/src/fb/
git add packages/ds/src/hooks/
git add packages/demo-app/src/pages/quality-layer-demo.tsx
git commit -m "feat(ds): add Modal, Field, Button wrappers + useModal hook"
```

---

## ⏭️ Next Steps

### Immediate (validate)
```bash
# 1. Install with locked versions
pnpm install

# 2. Check versions match
pnpm versions:check

# 3. Build DS
cd packages/ds && pnpm build

# 4. Start demo
cd ../.. && pnpm play
# Open: http://localhost:3000/quality-layer-demo
```

### Week 1 (expand)
- Add 5 more wrappers (Drawer, Input, Select, TableRowActions, Stack)
- Add hooks (useDrawer, usePagination)
- Create Storybook stories

### Week 2 (polish)
- Size limit config (35KB gzip budget)
- Debug helpers (debugModal, debugField)
- Migration codemod

---

## 📊 Storybook Content Scope

**Important**: Add to `tailwind.config.js`:

```javascript
export default {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './.storybook/**/*.{ts,tsx,mdx}',      // ADD
    './**/*.stories.@(tsx|mdx)',            // ADD
  ],
  // ...
}
```

**Why**: Tailwind needs to see story files to include utilities used there.

---

## 🧪 Test Plan (Minimal)

### Unit Tests
- `useModal` - open/close/toggle state
- `Field` - ARIA wiring (describedby, invalid)

### A11y Tests (CI)
- Axe scans on Modal, Field, Button stories

### E2E Smoke (Playwright)
One test that:
1. Opens modal
2. Tabs through focusable elements
3. Hits Escape
4. Asserts focus returned
5. Checks `data-state="closed"`

---

## 🎁 Size Budget (Starter)

Add to `packages/ds/package.json`:

```json
{
  "size-limit": [
    {
      "name": "@intstudio/ds (all)",
      "path": "dist/index.js",
      "limit": "35 KB"
    },
    {
      "name": "@intstudio/ds/fb",
      "path": "dist/fb/index.js",
      "limit": "30 KB"
    }
  ]
}
```

Run: `pnpm size-limit`

Start generous, tighten over time.

---

## ✅ Checklist

Before calling Phase 1 done:

- [x] pnpm overrides locked (Tailwind, TS, Flowbite)
- [x] versions:check script added
- [x] devAssert + isBrowser utilities created
- [x] Modal uses devAssert + isBrowser
- [x] Field uses devAssert
- [x] useModal has `as const` on props
- [x] Diagnostics honor prop over global
- [x] Documentation (definition + version policy)
- [ ] Validate demo page works end-to-end
- [ ] Storybook content globs added to Tailwind config
- [ ] ESLint integrated (block direct flowbite imports)
- [ ] Size limit configured
- [ ] First 3 wrappers validated

---

## 🎯 Success Criteria

**Foundation solid when**:
- Zero peer warnings on `pnpm install`
- `pnpm versions:check` passes
- Modal throws if ariaLabel missing (dev mode)
- Focus returns after modal close
- Field auto-wires aria-describedby
- Demo page validates full flow

**Ready to scale when**:
- All above ✅
- Storybook configured
- ESLint blocking direct imports
- First 3 wrappers shipped

---

**Status**: Refinements applied, ready for validation spike ✅
