# ADR: Pivot from Custom Field Factory to Flowbite

**Date:** 2025-10-24  
**Status:** Accepted  
**Decision Makers:** Core Team  
**Tags:** #architecture #pivot #velocity #flowbite

---

## Context

**Goal:** Build platforms quickly (platform for building platforms)

**Problem:** The custom field factory (spec → generator → refiner → CI) added more overhead than velocity:
- Maintaining factory, generator, recipes, refiner
- Fighting "one-size-fits-all" when form fields are inherently diverse
- Slow iteration cycle (spec → generate → refine → test)
- Building infrastructure before building the actual platform

**Reality Check:**
- Form fields are NOT one-size-fits-all
- AI can generate components faster than maintaining a factory
- Pre-built libraries (Flowbite, Shadcn) solve 90% of UI needs
- Factory is right for "100 teams, one form system" — NOT for "build many platforms quickly"

---

## Decision

**Adopt a Hybrid Approach:**

### **KEEP (High Value, Low Overhead)**

1. **DS Tokens** (`--ds-color-*`, `--ds-space-*`, `--ds-z-*`, `--ds-radius-*`)
   - Theme-able, brand DNA
   - Works with ANY component library
   - Low maintenance, high consistency

2. **Route-Level Components** (Application Structure)
   - `FullScreenRoute` — Full-screen modal with focus trap, guards
   - `FlowScaffold` — Multi-step wizards with URL steps
   - `RoutePanel` — Desktop panel, mobile-responsive
   - **Why:** Solve complex navigation/layout problems; unlikely to be matched by Flowbite

3. **Core Behavioral Hooks** (Application Logic)
   - `useFocusTrap` — Auto-wiring focus management
   - `useSubFlow` — Multi-step state & URL sync
   - `useOverlayPolicy` — Context-driven overlay behavior
   - **Why:** High-value, reusable, "pit of success" patterns

4. **Critical ESLint Rules** (Guardrails)
   - `routes-require-aria-label` — ARIA on route shells
   - `sheet-no-panel-on-dialog` — Prevent nesting violations
   - No inline `style` prop (allow Tailwind classes)

5. **Architecture Principles** (Lightweight Enforcement)
   - Component-local CSS for route shells (co-located, tokens only)
   - Token-driven theming (no magic numbers)
   - Accessibility contracts (ARIA, focus, keyboard)

### **ADOPT (Speed Layer)**

1. **Flowbite** (or Shadcn/ui) for all low-level UI:
   - **Form Fields:** Input, Select, Checkbox, Toggle, Textarea, Radio, DatePicker, FileUpload
   - **UI Primitives:** Button, Modal, Dropdown, Tooltip, Card, Badge, Spinner, Tabs
   - **Why:** Battle-tested, accessible, saves 90% of field-building work

2. **Tailwind CSS** (as utility layer)
   - Themed with DS tokens via `tailwind.config.js`
   - Replaces manual CSS for layouts and common patterns
   - **Why:** Fast iteration, integrates with Flowbite

3. **UI Bridge Layer** (Optional Wrapper)
   - Thin wrapper around Flowbite for consistent defaults
   - Re-exports with sane props (label, hint, error)
   - Makes future swaps trivial (single import point)

### **ARCHIVE (Overhead)**

1. **Field Factory/Generator** → `_archive/factory/`
   - Spec-driven generation
   - Recipe system
   - Not deleted, just mothballed

2. **Refiner** → `_archive/refiner/`
   - AST-based field refinement
   - Quality automation

3. **DS Field Primitives** → `_archive/ds-fields-legacy/`
   - Custom `.ds-input`, `.ds-checkbox`, `.ds-select`, etc.
   - Replaced by Flowbite components

4. **Factory-Specific Docs** → Update or archive
   - Generator guides
   - Recipe documentation
   - Refiner rules

---

## Consequences

### **Positive**

✅ **10x Faster Iteration**
- Build forms in minutes, not hours
- AI generates Flowbite components instantly
- No factory overhead

✅ **Flexibility for Bespoke Fields**
- When one-size-doesn't-fit-all, just build it
- No fighting the generator
- AI-assisted custom components

✅ **90% Less Maintenance**
- Maintain ~10 core files (tokens + route shells + hooks)
- Flowbite team maintains field components
- No recipe updates, refiner fixes, generator edge cases

✅ **Still Theme-able & Consistent**
- DS tokens drive Flowbite via Tailwind config
- Route shells enforce UX contracts
- Brand identity maintained

✅ **Battle-Tested Components**
- Flowbite is used by thousands
- Accessibility built-in
- Regular updates & bug fixes

### **Negative (Accepted Trade-offs)**

⚠️ **No Systematic Field Refinement**
- Can't push improvements to all fields automatically
- Manual spot-checks instead of automated refiner
- **Mitigation:** ESLint for critical rules, manual audits for quality

⚠️ **Less Deterministic Standardization**
- Fields may diverge if not careful
- **Mitigation:** UI bridge layer + periodic audits + AI prompts with standards

⚠️ **Tailwind in Markup** (vs. co-located CSS)
- Utility classes in JSX instead of CSS files
- **Mitigation:** Route shells still use co-located CSS; accept Tailwind for forms

⚠️ **Dependency on External Library**
- Flowbite updates may require adaptation
- **Mitigation:** UI bridge layer isolates changes

---

## Implementation Plan

### **Phase 1: Preflight & Baseline** (Today)
- ✅ Write this ADR
- ✅ Create migration plan
- ✅ Git baseline: `git tag pivot-baseline-2025-10-24`
- ✅ Snapshot current build status

### **Phase 2: Add Speed Layer** (Day 1)
- Install Flowbite + Tailwind
- Configure `tailwind.config.js` with DS tokens
- Create UI bridge layer (`packages/ui-bridge/`)
- Update ESLint rules (soften `no-inline-appearance`)

### **Phase 3: Archive Factory** (Day 1)
- Move factory → `_archive/factory/`
- Move recipes → `_archive/recipes/`
- Move DS fields → `_archive/ds-fields-legacy/`
- Update documentation

### **Phase 4: Proof of Concept** (Day 2)
- Convert one simple form to Flowbite
- Verify route shells work with Flowbite forms
- Run axe accessibility scan
- Compare velocity: old vs. new

### **Phase 5: Gradual Migration** (Week 1-2)
- Convert forms opportunistically (no rush)
- Keep route shells unchanged
- AI generates new forms with Flowbite
- Document patterns in UI bridge

---

## Success Metrics

**Velocity:**
- Time to build new form: < 30 min (vs. hours)
- Time to customize field: < 15 min (vs. fighting factory)

**Quality:**
- Route shells: Keep 40 E2E tests (focus, ARIA, keyboard)
- Forms: Axe scan per page (spot-check)
- Critical ESLint rules: 100% pass

**Maintenance:**
- Files to maintain: ~10 (tokens + shells + hooks)
- Factory maintenance time: 0
- Developer onboarding: < 1 day (vs. weeks)

---

## Alternatives Considered

### **Option A: Keep Factory, Make it Flexible**
- **Rejected:** Still requires maintaining factory infrastructure
- Would add complexity to support bespoke cases
- Overhead remains high

### **Option B: Full Custom (No Library)**
- **Rejected:** Reinventing the wheel for every field
- Loses battle-tested accessibility
- Slow iteration

### **Option C: Shadcn/ui Instead of Flowbite**
- **Viable Alternative:** Copy-paste components, more control
- **Trade-off:** More code in your repo vs. npm package
- **Decision:** Start with Flowbite, can switch to Shadcn later (UI bridge makes this trivial)

---

## Rollback Plan

**If this doesn't work:**

1. **Restore factory:**
   ```bash
   git checkout pivot-baseline-2025-10-24
   mv _archive/factory scripts/
   mv _archive/recipes packages/forms/src/
   ```

2. **Uninstall Flowbite:**
   ```bash
   pnpm remove flowbite flowbite-react tailwindcss
   ```

3. **Restore ESLint rules** (stricter `no-inline-appearance`)

**Safety Net:**
- Factory code is archived, not deleted
- Git tag allows instant rollback
- UI bridge layer makes swapping libraries trivial

---

## References

- [Flowbite React Documentation](https://flowbite-react.com/)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Custom Properties](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- [Migration Playbook Memory](MEMORY[05958d53-ac73-403c-991b-1107b4178135])

---

## Sign-Off

**Decision:** Adopt Flowbite + DS Tokens hybrid approach  
**Rationale:** Velocity > perfection for "platform to build platforms"  
**Risk:** Low (rollback plan, gradual migration, UI bridge isolation)  
**Expected Outcome:** 10x faster iteration, 90% less maintenance

**Status:** ✅ Accepted — Ready to Execute
