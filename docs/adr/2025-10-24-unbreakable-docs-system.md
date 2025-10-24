# ADR: Unbreakable Documentation & Naming System

**Date:** 2025-10-24  
**Status:** Implemented  
**Decision Makers:** Engineering Team

---

## Context

We had a **strong** documentation system with placement validation, but several refinements were needed to make it truly **unbreakable** while keeping friction near-zero.

**What was already excellent:**
- Clear allowlist for docs locations
- Pre-commit hook + CI validation
- Validator UX with actionable errors
- Naming enforcer for file/folder conventions
- Unit tests for validators

**What needed refinement:**
- Naming convention inconsistency (hooks: camelCase vs kebab-case)
- Exceptions scattered in code (not versioned/reviewable)
- Missing cross-platform safeguards (.editorconfig, .gitattributes)
- No explicit exceptions registry

---

## Decision

### **1. Standardized Naming: kebab-case for Everything (except React components)**

**Rule:**
```
Files:
  ✅ React components (.tsx): PascalCase (Button.tsx)
  ✅ All other files: kebab-case (use-hook.ts, my-util.ts)

Folders:
  ✅ Always kebab-case (my-component/)

Exceptions:
  ✅ Loaded from scripts/validators/.naming-exceptions.json
```

**Rationale:**
- **Consistency:** One rule for 95% of files
- **Cross-platform:** kebab-case avoids case-sensitivity issues
- **Scannable:** Easier to distinguish components from utilities
- **No ambiguity:** Clear decision eliminates flip-flop

**Previous state:**
- Hooks could be `useFocusTrap.ts` (camelCase) ← inconsistent
- Created confusion about "special" files

**New state:**
- Hooks are `use-focus-trap.ts` (kebab-case) ← consistent
- Only React components use PascalCase

---

### **2. Exceptions Registry**

**File:** `scripts/validators/.naming-exceptions.json`

**Format:**
```json
{
  "files": ["CODEOWNERS", ".markdownlintrc.json"],
  "dirs": [".cascade", "__tests__"],
  "patterns": ["SESSION_", "ADR_"]
}
```

**Benefits:**
- **Explicit:** All exceptions in one place
- **Versioned:** Changes show up in diffs
- **Reviewable:** Team can approve/reject exceptions
- **Documented:** Clear record of why exceptions exist

**Previous state:**
- Exceptions hardcoded in validator
- No visibility into what's allowed
- Hard to add/remove exceptions

**New state:**
- JSON file loaded at runtime
- Team-reviewable exceptions
- Easy to extend

---

### **3. Cross-Platform Safeguards**

**Files Created:**
- `.editorconfig` - Consistent formatting across editors
- `.gitattributes` - Normalized line endings & git behavior

**`.editorconfig` enforces:**
```
- LF line endings (not CRLF)
- UTF-8 encoding
- 2-space indents
- Trim trailing whitespace
- Insert final newline
```

**`.gitattributes` enforces:**
```
- Auto line-ending normalization (text=auto eol=lf)
- Markdown diff algorithm
- Binary handling for images/fonts/archives
```

**Benefits:**
- **Prevents:** "Works on my Mac" issues
- **Team-wide:** Consistent formatting
- **Git-safe:** No CRLF/LF diff noise
- **IDE-agnostic:** Works in VS Code, Vim, Sublime, etc.

---

## Consequences

### **Positive**

1. **Unbreakable Naming**
   - Single source of truth (kebab-case)
   - No more debate about hook names
   - Exceptions are explicit and versioned

2. **Cross-Platform Safety**
   - .editorconfig prevents formatting drift
   - .gitattributes prevents line-ending chaos
   - Works on Mac, Windows, Linux

3. **Reviewable Exceptions**
   - Team can see/approve exceptions
   - Clear audit trail
   - Easy to extend or tighten

4. **Zero Friction**
   - Same fast pre-commit hook
   - Clear error messages
   - Quick-fix commands still work

### **Negative (Accepted Trade-offs)**

1. **File Renames Required**
   - Hooks need renaming: `useFocusTrap.ts` → `use-focus-trap.ts`
   - Components need renaming: `FlowScaffold/` → `flow-scaffold/`
   - One-time cost for long-term consistency

2. **Import Path Updates**
   - Renaming files breaks imports
   - Need codemod or manual updates
   - Mitigated by clear validator errors

---

## Alternatives Considered

### **Option B: Keep hook filenames as camelCase**

**Pros:**
- No renames needed now
- Common in some codebases

**Cons:**
- Special case to remember
- Two conventions to maintain
- Ambiguity (is `useHook.ts` correct?)

**Why Rejected:**
- Consistency > convenience
- One-time cost for long-term win
- Simpler mental model

---

## Implementation Plan

### **Completed**

✅ Remove hook exception from naming validator  
✅ Create exceptions registry (`.naming-exceptions.json`)  
✅ Update validator to load exceptions  
✅ Add `.editorconfig` for consistent formatting  
✅ Add `.gitattributes` for line-ending safety  
✅ Document decision (this ADR)  

### **Remaining (Optional)**

🔜 Add `--fix` mode to naming validator (auto-rename + codemod imports)  
🔜 Convert hook installer to Node (cross-platform)  
🔜 Add reviewdog for inline PR comments  
🔜 Add PR template with validation checklist  

---

## Success Metrics

### **Before**
- Naming: Inconsistent (camelCase hooks vs kebab-case files)
- Exceptions: Hardcoded in validator
- Cross-platform: No safeguards
- "Works on my Mac" issues

### **After**
- Naming: Consistent (kebab-case for 95% of files)
- Exceptions: Versioned, reviewable
- Cross-platform: .editorconfig + .gitattributes
- Team-wide consistency

---

## Rollback Plan

If this causes too much disruption:

```bash
# Rollback naming convention
git revert <this-commit>

# Or: Add hook exception back
# Edit scripts/validate-naming.mjs
# Add: HOOK_PATTERN: /^use[A-Z][a-zA-Z]+\.ts$/
```

But given the benefits, this should be **permanent**.

---

## References

- Naming validator: `scripts/validate-naming.mjs`
- Exceptions registry: `scripts/validators/.naming-exceptions.json`
- Complete guide: `docs/guides/docs-system-complete.md`
- Session notes: `docs/sessions/SESSION_2025-10-24-docs-hardening.md`

---

## Summary

We moved from a **strong** system to an **unbreakable** system by:

1. **Standardizing** naming (kebab-case everywhere except components)
2. **Externalizing** exceptions (versioned, reviewable)
3. **Hardening** cross-platform (editorconfig + gitattributes)

**Result:** Consistent, reviewable, unbreakable—with zero added friction.

**Philosophy:** Make the right thing easy, make the wrong thing impossible.
