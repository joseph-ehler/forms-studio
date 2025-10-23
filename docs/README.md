# 📚 Documentation Structure

**Organized, discoverable, enforced.**

---

## 📁 Structure

```
docs/
├── handbook/        # Team-wide guides
│   ├── onboarding.md
│   ├── release-process.md
│   ├── pr-guidelines.md
│   └── troubleshooting.md
│
├── adr/             # Architecture Decision Records
│   ├── 2025-01-15-css-layers.md
│   ├── 2025-01-20-barrel-exports.md
│   └── template.md
│
├── rfc/             # Request for Comments (proposals)
│   ├── 0001-field-extraction.md
│   ├── 0002-visual-regression.md
│   └── template.md
│
├── playbooks/       # Runbooks & procedures
│   ├── incident-response.md
│   ├── release-checklist.md
│   └── theming-guide.md
│
└── styleguides/     # Style & conventions
    ├── code-style.md
    ├── commit-conventions.md
    └── docs-style.md

packages/
├── ds/docs/         # DS-specific guides
│   ├── tokens-reference.md
│   ├── shell-presets.md
│   └── a11y-profiles.md
│
└── forms/docs/      # Forms-specific guides
    ├── field-api.md
    ├── validation.md
    └── rendering.md
```

---

## ✍️ Front Matter (Required)

All docs **must** include YAML front matter:

```yaml
---
title: My Document Title
owner: @joseph-ehler
status: active  # draft|active|deprecated
lastReviewed: 2025-01-22
tags: [design-system, architecture]
---
```

---

## 📝 Document Types

### **Handbook** (`docs/handbook/`)
Team-wide guides, processes, onboarding.

**Example:** `onboarding.md`, `pr-guidelines.md`

### **ADRs** (`docs/adr/`)
Architecture Decision Records. Format: `YYYY-MM-DD-title.md`

**Example:** `2025-01-15-css-layers.md`

### **RFCs** (`docs/rfc/`)
Proposals for major changes. Format: `NNNN-title.md`

**Status:** `draft` → `accepted` → `implemented` (or `rejected`)

**Example:** `0001-field-extraction.md`

### **Playbooks** (`docs/playbooks/`)
Step-by-step procedures, runbooks, checklists.

**Example:** `release-checklist.md`, `incident-response.md`

### **Styleguides** (`docs/styleguides/`)
Conventions for code, commits, docs.

**Example:** `commit-conventions.md`

---

## 🛡️ Enforcement

### **Linting:**
```bash
pnpm docs:lint
```

Checks:
- ✅ Front matter present
- ✅ No broken links
- ✅ Spelling (cspell)
- ✅ Markdown style (markdownlint)

### **Autostow:**
```bash
pnpm docs:autostow
```

Automatically moves misplaced docs from root to correct location.

**Heuristics:**
- `DS_*.md` → `packages/ds/docs/`
- `FORMS_*.md` → `packages/forms/docs/`
- `ADR_*.md` → `docs/adr/`
- `RFC_*.md` → `docs/rfc/`
- `PHASE_*.md` → `docs/handbook/`

---

## 🚀 Creating Docs

### **Using Generators (Recommended):**

```bash
# Create a handbook doc
pnpm new:docs:handbook my-guide

# Create an ADR
pnpm new:docs:adr css-layer-decision

# Create an RFC
pnpm new:docs:rfc field-extraction-proposal
```

Generators automatically:
- ✅ Place file in correct directory
- ✅ Add front matter template
- ✅ Use correct naming convention
- ✅ Open in editor

### **Manual Creation:**

1. Create file in correct directory
2. Add front matter (see template)
3. Write content
4. Run `pnpm docs:lint` to validate

---

## 📖 Templates

### **ADR Template:**
```markdown
---
title: Short decision title
owner: @your-github
status: accepted
lastReviewed: YYYY-MM-DD
---

# Context

What problem are we solving?

# Decision

What did we decide?

# Consequences

What are the trade-offs?
```

### **RFC Template:**
```markdown
---
title: Proposal title
owner: @your-github
status: draft
lastReviewed: YYYY-MM-DD
---

# Summary

One-paragraph explanation.

# Motivation

Why are we doing this?

# Detailed Design

How will this work?

# Drawbacks

What are the downsides?

# Alternatives

What else did we consider?
```

---

## 🔍 Finding Docs

### **By Topic:**
```bash
grep -r "keyword" docs/
```

### **By Owner:**
```bash
grep -r "owner: @joseph" docs/
```

### **Recently Changed:**
```bash
find docs -type f -mtime -7
```

---

## ✅ Best Practices

1. **Use generators** - They enforce structure
2. **Keep front matter updated** - Especially `lastReviewed`
3. **Link between docs** - Use relative paths
4. **Review quarterly** - Update or deprecate old docs
5. **One topic per doc** - Don't create mega-docs

---

## 🚨 Common Mistakes

❌ **Dropping docs at root** → Use `pnpm docs:autostow` or generators  
❌ **Missing front matter** → `pnpm docs:lint` will catch  
❌ **Broken links** → CI will fail  
❌ **Outdated status** → Update `lastReviewed` when editing  

---

**Questions?** See `docs/handbook/documentation-guide.md`
