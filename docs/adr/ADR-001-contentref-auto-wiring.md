# ADR-001: Auto-wire contentRef via Context

**Date**: 2025-10-22  
**Status**: ✅ Accepted  
**Deciders**: Team  

---

## Context

Footer buttons inside overlay pickers (Clear, Done) were closing the overlay before their onClick handlers could execute.

**Root Cause**: OverlayPickerCore's outside-click detection checked `contentRef.current?.contains(target)`, but `contentRef` was never connected to the overlay container. Fields were expected to manually pass `contentRef` to OverlaySheet and OverlayPicker, but:

- No TypeScript error if forgotten (prop was optional)
- No runtime warning
- Bug was silent until footer interaction
- Every field required manual boilerplate

---

## Decision

**Auto-wire `contentRef` via React Context.**

### Implementation

1. **OverlayPickerCore** provides `contentRef` via `OverlayContext`
2. **OverlaySheet** and **OverlayPicker** auto-consume from Context
3. **Fields** no longer pass `contentRef` (can't forget!)

### Fallback Chain

```tsx
const effectiveRef = explicitProp || context?.contentRef || internalRef
```

- Backwards compatible (explicit props still work)
- Automatic for new code (Context provides)
- Always has a default (never undefined)

---

## Consequences

### Positive ✅

- **Impossible to forget**: Context flows automatically
- **Zero boilerplate**: -2 lines per field
- **Self-healing**: All existing fields auto-fixed
- **Future-proof**: New fields can't break
- **Pit of success**: Correct by default

### Negative ⚠️

- Requires React 16.3+ (Context API)
- Additional indirection (Context Provider)

### Mitigations

- Document pattern in `DESIGN_SYSTEM_PATTERNS.md`
- Export `useOverlayContext` hook for explicit consumption
- Maintain fallback chain for flexibility

---

## Related

- **PR**: #[number]
- **Issue**: Overlay footer clicks close overlay (#[number])
- **Pattern**: `DESIGN_SYSTEM_PATTERNS.md` → Auto-wiring
- **Debug**: `DEBUGGING_PLAYBOOK.md` → Outside-click detection

---

## Verification

```javascript
// Console verification script
const overlay = document.querySelector('[data-overlay="picker"]');
const clearBtn = document.querySelector('[data-testid="clear"]');
console.log('Clear inside overlay?:', overlay?.contains(clearBtn)); // Should be true
```

**Expected**: Footer clicks no longer close overlay automatically.

---

## Lessons Learned

**When you see**:
- Copy-paste boilerplate across files
- "Remember to..." documentation
- Same bug in multiple places

**Then**:
- Auto-wire via Context
- Make mistakes impossible
- Extract to design system primitive

---

**Version**: 1.0  
**Last Updated**: 2025-10-22
