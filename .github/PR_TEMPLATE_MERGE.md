# MERGE THIS INTO YOUR EXISTING .github/pull_request_template.md

Add this block anywhere in your existing PR template (recommended: at the top):

---

## 🔁 Cascade OS Checklist (do not delete)

### 1) OBSERVE → evidence
- Evidence (logs/console/recording/benchmarks): …

### 2) UNDERSTAND → root cause
- What/when/where/why: …

### 3) PATTERN?
- Will this recur? Where else? …

### 4) SYSTEMATIZE (check all that apply)
- [ ] Primitive/Hook extracted
- [ ] Context auto-wire (no "remember to…")
- [ ] Tokens (no magic numbers)
- [ ] `debugX()` helper
- [ ] ESLint rule / Playwright smoke

### 5) DOCUMENT
- Updated: ENGINEERING_PRINCIPLES / DESIGN_SYSTEM_PATTERNS / DEBUGGING_PLAYBOOK

### Tests
- [ ] Playwright @overlay-smoke (375×480)
- [ ] Unit tests (Context/tokens)
- [ ] Visual (storybook/chromatic)

### Risk / Rollback
- Blast radius: …  •  Kill switch/flag: …

---
