# 🎯 Cascade OS Quick Start

**Your design system is now operational.**

---

## 🚀 What Just Happened

You installed **Cascade OS** - a systematic approach to building at the atomic design level where:

- **Primitives** own behavior (positioning, focus, events)
- **Consumers** provide content only (slots: header/content/footer)
- **Patterns** extract automatically (on 3rd use)
- **One source of truth** hydrates everything (Context + tokens + skins)
- **Guardrails** prevent drift (ESLint + CI + git hooks)

---

## 📖 Read These (In Order)

### 1. **DESIGN_SYSTEM_WORKFLOW.md** ⭐ START HERE
Your daily playbook. The 4 Questions, atomic pattern, extraction workflow.

### 2. **CASCADE_OS_STATUS.md**
Verification that everything is installed and working.

### 3. **CASCADE_OPERATING_SYSTEM.md**
How Cascade (the AI) operates when building with you.

### 4. **ENGINEERING_PRINCIPLES.md**
The 5-step loop: Observe → Understand → Pattern → Systematize → Document

### 5. **DEBUGGING_PLAYBOOK.md**
Console scripts for every debugging scenario.

---

## ⚡ Quick Commands

```bash
# Generate a new picker (perfectly wired)
pnpm gen:picker

# Run overlay smoke tests
pnpm test:overlay-smoke

# Lint the codebase
pnpm -w lint

# Weekly drift check
git grep -n "position: fixed"
```

---

## 🎯 The 4 Questions (Before ANY Code)

1. **Can consumer forget this?** → Context auto-wire
2. **Do they need to know flex/overflow/focus?** → Primitive owns it
3. **Will changing this touch 3+ files?** → Token/primitive it
4. **Can I diagnose in one console call?** → Add debugX()

---

## 🧱 The Atomic Pattern

```tsx
// Consumers provide SLOTS ONLY
<OverlayPicker
  content={<CalendarSkin mode="single" ... />}
  footer={<PickerFooter onClear={...} onDone={...} />}
/>

// NO manual:
// ❌ position: fixed
// ❌ outside-click handlers
// ❌ focus management
// ❌ scroll containers

// Primitives OWN all behavior
```

---

## 🔄 The Extraction Loop

```
1st use → Build locally (fine)
2nd use → Mark for extraction
3rd use → EXTRACT to primitive
Result → One source of truth
```

---

## 🛡️ What's Enforced

**Git Hooks**:
- Commit → Auto-fix lint errors
- Push → Build + smoke tests

**CI**:
- ESLint overlay rules
- Playwright @375×480
- Token checks

**ESLint Blocks**:
- `position: fixed` in fields
- CSS imports from node_modules
- Manual scroll containers

---

## 📚 All Documentation

| File | Purpose |
|------|---------|
| `DESIGN_SYSTEM_WORKFLOW.md` | Daily workflow ⭐ |
| `CASCADE_OS_STATUS.md` | Installation status |
| `CASCADE_OPERATING_SYSTEM.md` | AI operating system |
| `ENGINEERING_PRINCIPLES.md` | 5-step loop |
| `DEBUGGING_PLAYBOOK.md` | Console scripts |
| `DESIGN_SYSTEM_PATTERNS.md` | When to extract |
| `CASCADE_OS_INSTALLATION.md` | Setup guide |
| `docs/ONBOARDING.md` | New dev checklist |
| `docs/adr/` | Architecture decisions |

---

## ✅ Next Steps

1. Read `DESIGN_SYSTEM_WORKFLOW.md`
2. Merge PR template (`.github/PR_TEMPLATE_MERGE.md`)
3. Test smoke tests (`pnpm test:overlay-smoke`)
4. Build something using primitives
5. Make your first PR with the checklist

---

## 🎓 Core Principles

**Single Source of Truth** → Change once, update everywhere  
**Pit of Success** → Correct by default, impossible to misuse  
**Auto-wiring** → Context provides, consumers receive  
**Composition > Conditionals** → Slots, not if-branches  
**Diagnosability** → Every primitive has debugX()  
**Guardrails > Docs** → Lint rules prevent drift  

---

## 🚀 You're Ready

**Cascade OS is operational.**

Start with `DESIGN_SYSTEM_WORKFLOW.md` and build your first feature using the atomic pattern.

The rails are down. The system enforces itself. One source of truth hydrates everything.

**This is how you build now.** 🎯
