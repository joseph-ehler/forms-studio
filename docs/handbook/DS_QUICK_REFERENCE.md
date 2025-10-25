# DS Quick Reference Card

**Print this and stick it on your monitor** 📌

---

## 🎯 Where to Edit What

| I want to... | Edit this file | Command to verify |
|-------------|----------------|-------------------|
| **Add a variant** | `control/variants.config.ts` + `registry/skins/<component>.skin.ts` | `pnpm lint && pnpm typecheck` |
| **Change brand color** | `tokens.css` (--ds-primary-h/c) | `pnpm design:contrast` |
| **Adjust role mapping** | `tokens.css` (--ds-role-*) | `pnpm design:contrast` |
| **Fix hover behavior** | `tokens.css` (--ds-ghost-hover-alpha) | `pnpm sb` |
| **Add new component** | `pnpm ds:new <Name>` (coming soon) | `pnpm doctor` |
| **Debug styling** | Browser: `window.__DS_AUDIT = true` | Console output |
| **Lock visual state** | Storybook: `data-dev-force="hover"` | Visual inspection |

---

## 🏗️ Directory Structure (Memorize This)

```
packages/ds/src/
  control/              ← Design decisions
    variants.config.ts
    skin-schemas/
    dashboards.md
    
  registry/             ← Implementation truth
    skins/
    
  components/           ← Consumers (never define truth)
    Button/
    Input/
```

---

## ✅ Pre-Merge Checklist

```bash
pnpm doctor
```

**That's it.** If green → ship it 🚀

---

## 🛠️ Most Common Commands

```bash
# Development
pnpm sb                  # Storybook
pnpm dev                 # Watch mode

# Validation (run before PR)
pnpm doctor              # Everything
pnpm lint                # ESLint + SKIN
pnpm typecheck           # TypeScript
pnpm build               # Compile
pnpm design:contrast     # WCAG

# Maintenance
pnpm barrels             # Regenerate exports
pnpm lint:fix            # Auto-fix
```

---

## 🚨 Emergency Procedures

### Lint failing?
```bash
pnpm lint:fix
pnpm barrels
pnpm lint
```

### Build failing?
```bash
pnpm clean
pnpm install
pnpm build
```

### "Where is X defined?"
1. Check `control/` for design decisions
2. Check `registry/` for SKIN maps
3. Check `components/` for implementation

---

## 📋 Adding a New Variant (30 seconds)

```typescript
// 1. control/variants.config.ts
export const variants = {
  button: [...existing, 'premium'] as const,
};

// 2. registry/skins/button.skin.ts
premium: {
  '--btn-fg': 'var(--ds-role-text)',
  '--btn-bg': 'var(--ds-neutral-2)',
  '--btn-hover-bg': 'var(--ds-neutral-3)',
  '--btn-active-bg': 'var(--ds-neutral-4)',
}

// 3. Verify
pnpm lint && pnpm typecheck && pnpm sb:test
```

**Done!** No CSS changes needed.

---

## 🎨 Token Hierarchy (Remember This)

```
Brand Seeds (2 values)
  ↓
OKLCH Ramps (72 values: 6 colors × 12 steps)
  ↓
Semantic Roles (24 values: primary/success/warning/danger/info/ghost)
  ↓
Component Variables (4 values: --btn-fg/bg/hover/active)
  ↓
Universal CSS (reads component variables)
```

**Change at ANY level propagates down automatically.**

---

## 🔍 Debug Helpers

```javascript
// Browser console
window.__DS_AUDIT = true;  // Enable runtime audit
```

```tsx
// Storybook
<Button data-dev-force="hover">     // Lock hover state
<Button data-dev-force="active">    // Lock active state
<Button data-dev-force="focus">     // Lock focus state
<Button data-dev-force="disabled">  // Lock disabled state
```

---

## 🚫 Never Do This

| ❌ Don't | ✅ Do Instead |
|---------|---------------|
| Define SKIN in component | Import from `registry/skins/` |
| Add variant inline | Add to `control/variants.config.ts` |
| Skip `pnpm doctor` | Run before every PR |
| Use `pnpx eslint` | Use `pnpm lint` |
| Hardcode colors | Use `--ds-*` tokens |
| Inline styles in components | Use Tailwind + tokens |
| Create files in root | Use `docs/`, `scripts/`, `packages/*/docs/` |

---

## 📊 Quality Gates (All Must Pass)

```
✅ Barrels up to date
✅ Lint clean (ESLint + SKIN)
✅ Types valid (TypeScript)
✅ Builds successful
✅ Matrix tests pass
✅ Contrast meets WCAG 3:1
```

**Run:** `pnpm doctor`

---

## 🎯 Golden Rules

1. **Control Panel** = design decisions
2. **Registry** = code truth
3. **Components** = consumers only
4. **Doctor** = green light to ship
5. **Generators** = no hand-rolling (coming soon)

---

## 🆘 Help

- Check: `docs/handbook/CONTROL_PANEL_ARCHITECTURE.md`
- Dashboard: `packages/ds/src/control/dashboards.md`
- Contributing: `CONTRIBUTING.md`
- Team chat: Ask in Slack/Discord

---

**Last Updated**: 2025-01-24  
**Version**: 3.0 (Control Panel + Effortless)
