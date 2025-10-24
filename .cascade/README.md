# .cascade/ - AI Operating Instructions

This directory contains **mandatory operating instructions** for Cascade AI when working on this codebase.

---

## 📋 Files in This Directory

### **COMPONENT_WORK_PROTOCOL.md**
**Purpose**: Canonical architecture pattern for ALL DS & Forms components  
**Status**: ✅ **MANDATORY - NON-NEGOTIABLE**

Cascade MUST:
- Run pre-flight checklist before ANY component work
- Follow DS vs Forms layer rules exactly
- Use templates provided (no deviation)
- Verify with tests/lint before proposing

**Deviation allowed ONLY if**: User explicitly says "this is an exception"

---

## 🎯 How Cascade Uses These Files

### **Before Starting Work**
1. Read user request
2. Check if component work involved
3. If YES → Open COMPONENT_WORK_PROTOCOL.md
4. Run mandatory pre-flight checklist
5. Classify layer (DS vs Forms)
6. Verify using correct template

### **During Work**
- Follow rules in COMPONENT_WORK_PROTOCOL.md
- Self-check against red flags
- Use exact templates provided
- Add tests as specified

### **Before Proposing Changes**
- Verify all checklist items ✅
- Confirm lint passes
- Confirm tests pass
- Update docs as needed

---

## 🚨 Critical Rules

**NEVER**:
- Skip the pre-flight checklist
- Mix DS and Forms layer concerns
- Use magic numbers in DS CSS
- Create .css files in Forms layer
- Skip ARIA contracts
- Deviate "just this once"

**ALWAYS**:
- Co-locate CSS with DS components
- Use --ds-* tokens only
- Use DS primitives in Forms recipes
- Add runtime validation (dev mode)
- Add shape + A11y + E2E tests
- Ask user if uncertain

---

## 📚 Related Documentation

- `/docs/CONTRIBUTING.md` - Component patterns
- `/docs/COMPLETE_SYSTEM_REFERENCE.md` - API reference
- `/docs/CSS_OVERRIDE_VARS.md` - Safe customization
- `/docs/ADOPTION_GUIDE.md` - Migration recipes

---

**These protocols ensure consistent, accessible, tested components across the entire codebase.**
