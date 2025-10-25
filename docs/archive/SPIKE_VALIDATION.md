# Spike Validation - Quality Layer

**Prove the pattern works before scaling**

---

## Quick Start

```bash
# 1. Install (expect zero peer warnings)
pnpm install

# 2. Build DS
cd packages/ds && pnpm build

# 3. Start demo
cd ../..
pnpm play

# 4. Open: http://localhost:3000/quality-layer-demo
```

---

## Validation Checklist

Test each behavior:

**Modal**:
- [ ] Click "Create Product" → modal opens
- [ ] Focus goes to first input automatically
- [ ] Press Escape → modal closes
- [ ] Focus returns to button
- [ ] Dev console shows no errors

**Field**:
- [ ] Submit empty → errors show
- [ ] Error text is red
- [ ] Required fields have `*`
- [ ] Inspect input → has `aria-invalid="true"` when error
- [ ] Inspect input → has `aria-describedby` pointing to error/hint

**Button**:
- [ ] Primary button is blue
- [ ] Secondary is gray
- [ ] Variants work without inline theme

**Diagnostics**:
- [ ] Open DevTools → Elements
- [ ] Find modal element
- [ ] Has `data-component="modal"`
- [ ] Has `data-state="open"` when open
- [ ] Console: run `window.__DS_DEBUG = true`
- [ ] Open modal → see debug logs

---

## If All ✅

You're ready to scale:
1. Add 5 more wrappers (Week 1)
2. Create Storybook stories (Week 2)
3. Migrate existing code (Week 3-4)

See NEXT_STEPS.md for full plan.

---

## If Any ❌

Troubleshoot:
- Check `pnpm install` has no peer warnings
- Check `packages/ds/dist/` exists (did build succeed?)
- Check browser console for errors
- Review implementation in `packages/ds/src/fb/`

---

**Goal**: Validate pattern works end-to-end before scaling to 20+ wrappers.
