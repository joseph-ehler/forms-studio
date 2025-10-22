# Onboarding Checklist

Welcome! This checklist gets you productive with the Cascade OS design system in <2 days.

## Day 1: Understand the System

### Morning (2 hours)
- [ ] Read `CASCADE_OPERATING_SYSTEM.md` (the OS)
- [ ] Read `ENGINEERING_PRINCIPLES.md` (the loop)
- [ ] Read `DESIGN_SYSTEM_PATTERNS.md` (when to extract)
- [ ] Read `DEBUGGING_PLAYBOOK.md` (console scripts)

### Afternoon (3 hours)
- [ ] Run `pnpm gen:picker` to create TimeField
- [ ] Open overlay, run `debugOverlay()` in console
- [ ] Add a console.log, trigger the picker, observe
- [ ] Run Playwright tests: `npx playwright test tests/overlay.spec.ts`

## Day 2: Break It (Safely)

### Morning (2 hours)
- [ ] Try to add `position: fixed` → ESLint should block it
- [ ] Try to import `react-day-picker/dist/style.css` → ESLint blocks
- [ ] Make a PR without filling Cascade OS checklist → CI fails
- [ ] Add a magic z-index number → Lint warns

### Afternoon (3 hours)
- [ ] Fix a real bug using console-first debugging
- [ ] Submit a PR following the 5-step loop
- [ ] Get code review feedback
- [ ] Ship it!

## Resources

- Cascade OS: `CASCADE_OPERATING_SYSTEM.md`
- Principles: `ENGINEERING_PRINCIPLES.md`
- Patterns: `DESIGN_SYSTEM_PATTERNS.md`
- Debug Scripts: `DEBUGGING_PLAYBOOK.md`
- ADRs: `docs/adr/`

## Success Criteria

You're ready when you can:
- ✅ Generate a picker with zero bugs
- ✅ Debug with console scripts (no guessing)
- ✅ Know when to extract a pattern
- ✅ Explain the 4 Questions before coding
