# Engineering Principles: The Foolproof Framework

**Philosophy**: Make correct behavior automatic and incorrect behavior impossible.

---

## Core Tenets

### 1. Observe Before Acting
**Never guess when you can measure.**

- 🔍 **Debugging**: Use console scripts to observe actual behavior
- 📊 **Performance**: Measure before optimizing
- 🎨 **UX**: Test with real users before redesigning
- 🏗️ **Architecture**: Profile bottlenecks before refactoring

### 2. Make Mistakes Impossible
**If everyone must do X correctly, X shouldn't be their responsibility.**

- ⚙️ **Auto-wire common data** (Context, dependency injection)
- 🛡️ **Type-safe builders** (invalid states unrepresentable)
- 🚫 **ESLint rules** (prevent anti-patterns)
- ✅ **Pit of success** (correct by default)

### 3. Extract Patterns Aggressively
**The second time you do something manually, automate it.**

- 📦 **Design system primitives** (not copy-paste components)
- 🔧 **Code generators** (not boilerplate)
- 🤖 **Scripts and tools** (not manual processes)
- 📚 **Shared libraries** (not duplicated logic)

### 4. Minimize Surface Area
**Fewer ways to do something = fewer ways to do it wrong.**

- 🎯 **Single source of truth** (configuration, styles, logic)
- 🔒 **Encapsulation** (hide implementation details)
- 🎨 **Constrained APIs** (limit valid inputs)
- 📐 **Convention over configuration** (sensible defaults)

### 5. Collaborate on Discovery
**Two brains > one brain, especially when debugging.**

- 🤝 **Pair on diagnosis** (run scripts together)
- 💬 **Explain findings** (rubber duck debugging)
- 📖 **Document decisions** (ADRs, comments)
- 🎓 **Teach techniques** (share knowledge)

---

## Decision Framework

### When Facing Any Problem

```
┌─────────────────────────┐
│   Problem Identified    │
└────────────┬────────────┘
             │
             ▼
    ┌────────────────┐
    │  Can I observe │
    │  it directly?  │
    └───┬────────┬───┘
        │        │
       YES      NO
        │        │
        ▼        ▼
   ┌─────────┐ ┌──────────────┐
   │ Write   │ │ Make it      │
   │ script  │ │ observable   │
   └────┬────┘ └──────┬───────┘
        │             │
        └──────┬──────┘
               │
               ▼
        ┌──────────────┐
        │  Run & Observe│
        └──────┬────────┘
               │
               ▼
        ┌──────────────┐
        │ Root cause   │
        │ clear?       │
        └───┬────┬─────┘
            │    │
           YES   NO
            │    │
            │    └──► (loop back to observe)
            │
            ▼
     ┌──────────────┐
     │ Is this a    │
     │ pattern?     │
     └───┬────┬─────┘
         │    │
        YES   NO
         │    │
         │    └──► Fix once & done
         │
         ▼
  ┌──────────────────┐
  │ Will this recur? │
  └───┬──────────┬───┘
      │          │
     YES        NO
      │          │
      │          └──► Document & fix
      │
      ▼
┌─────────────────────┐
│ Extract to system   │
│ (Context, primitive,│
│  ESLint, etc.)      │
└─────────────────────┘
```

---

## Pattern Recognition Triggers

### 🚨 Signals to Systematize

| Signal | Action | Example |
|--------|--------|---------|
| Copy-paste code | Extract component/util | Repeated `contentRef` wiring → Context |
| "Remember to..." docs | Auto-wire or enforce | "Remember to pass contentRef" → Context |
| Same bug N times | Centralize behavior | Footer clicks broken → OverlayPickerCore owns detection |
| Manual checklist item | Create ESLint rule | "Check z-index stacking" → Design tokens |
| Onboarding gotcha | Redesign API | "contentRef is optional but required" → Auto-wire |
| Code review comment repeated | Lint or pattern | "Did you wire contentRef?" → Context auto-wire |

### ✅ Systematization Checklist

When you see a pattern:

- [ ] Can this be auto-wired? (Context, injection)
- [ ] Can types prevent this? (Make invalid states unrepresentable)
- [ ] Can we centralize this? (Single source of truth)
- [ ] Can we enforce this? (ESLint rule)
- [ ] Should we generate this? (Code generator, builder)

---

## The Debugging Protocol

### Phase 1: Make It Observable

**Goal**: See what's actually happening (not what you think is happening)

```javascript
// Template for observation scripts
const observe = {
  what: () => {
    // What is the current state?
    console.log('State:', getCurrentState());
  },
  when: () => {
    // When does X happen relative to Y?
    console.log('Timestamp:', Date.now());
  },
  where: () => {
    // Where is the data coming from?
    console.trace();
  },
  why: () => {
    // Why is this value what it is?
    console.log('Calculation:', showDerivation());
  }
};
```

**Run script → Report findings → Form hypothesis → Next script**

### Phase 2: Understand the Root Cause

**Questions to answer**:

1. What specific data/state is wrong?
2. Where should it come from?
3. Why isn't it coming from there?
4. Is this a one-off bug or a pattern?

**Don't proceed to fix until you can answer all four.**

### Phase 3: Fix Systemically

**Decision tree**:

```
Can this bug happen again?
├─ YES: Systematize (Context, type, lint, etc.)
└─ NO: Fix once & document
```

---

## The Pattern Extraction Protocol

### When to Extract a Pattern

**Rule of Thumb**: If you've done it manually twice, automate it the third time.

**Extraction Levels** (choose the right level):

| Level | When to Use | Example |
|-------|-------------|---------|
| **Function** | Simple logic reuse | `formatDate()` |
| **Hook** | React state/effect reuse | `useDeviceType()` |
| **Component** | UI pattern reuse | `<PickerFooter>` |
| **Context** | Auto-wire common data | `OverlayContext` |
| **Primitive** | Core building block | `OverlayPicker` |
| **System** | Cross-cutting concern | Overlay design system |
| **Tool** | Build-time generation | Form field generator |

### Extraction Checklist

Before extracting:

- [ ] Used manually 2+ times?
- [ ] Clear boundaries/interface?
- [ ] Stable requirements?
- [ ] Will reduce future work?

After extracting:

- [ ] Documented why it exists
- [ ] Tests cover common cases
- [ ] Examples show usage
- [ ] Migration path from manual

---

## Anti-Patterns to Avoid

### ❌ Premature Abstraction
```tsx
// Bad: Abstracting before you understand the pattern
<SuperGenericComponent config={complexConfig} />

// Good: Extract after you've seen the pattern 3 times
<DateField ... />
```

### ❌ Guess-Driven Development
```javascript
// Bad: Changing code without understanding why
- onClick={handleClick}
+ onClick={handleClick()} // Guessing this will fix it

// Good: Observe, understand, then fix
console.log('Is handleClick a function?', typeof handleClick);
// Output: "function" → Ah, I'm calling it too early!
```

### ❌ Copy-Paste Engineering
```tsx
// Bad: Copy entire component, change a few lines
<DateFieldCopy ...> {/* 90% same as DateField */}

// Good: Extract the 90% to a primitive
<DateField type="range" />
```

### ❌ "It Works On My Machine" Shipping
```javascript
// Bad: Manually testing once and shipping
Works in Chrome desktop ✓ → Ship it!

// Good: Systematically verify
- [ ] Chrome desktop
- [ ] Safari mobile
- [ ] Small viewport
- [ ] Touch interaction
```

### ❌ Silent Failures
```tsx
// Bad: Optional prop that breaks things if forgotten
interface Props {
  criticalData?: Data; // Missing = silent bug
}

// Good: Required prop OR auto-wire via Context
interface Props {
  criticalData: Data; // Type error if forgotten
}
// OR
const data = useCriticalData(); // Context auto-provides
```

---

## Success Metrics

### How to Know It's Working

| Metric | Target | Signal |
|--------|--------|--------|
| **Time to diagnose** | <30 min | Console scripts reveal issue quickly |
| **Bugs per feature** | <2 | Pit of success prevents common errors |
| **Code review rounds** | 1-2 | Less "did you remember to..." |
| **Onboarding time** | <2 days | System is self-explanatory |
| **Repeat bugs** | 0 | Systematized prevention works |
| **Lines of boilerplate** | Trending ↓ | Automation/Context reduces manual work |

---

## Implementation Ladder

### Start Here (Easy wins)

1. **Console debugging scripts** (immediate value, no code changes)
2. **Shared constants** (eliminate magic numbers)
3. **Utility functions** (DRY up repeated logic)

### Then Move to (Medium effort)

4. **Custom hooks** (share React patterns)
5. **Component library** (standardize UI)
6. **Type-safe builders** (prevent invalid states)

### Eventually Build (High value)

7. **Context-based auto-wiring** (eliminate boilerplate)
8. **ESLint rules** (enforce patterns)
9. **Code generators** (automate scaffolding)
10. **Design system** (unified primitives)

---

## Real-World Application

### Example 1: Footer Click Bug

**Symptom**: Footer buttons close overlay

**Observe**:
```javascript
console.log('contentRef:', contentRef.current); // null!
```

**Pattern Recognition**:
- Every field passes `contentRef` manually ❌
- Easy to forget, silent failure ❌
- "Don't forget to..." documentation ❌

**Systematize**:
- Context auto-provides `contentRef` ✅
- Primitives auto-consume ✅
- Impossible to forget ✅

**Result**: Bug class eliminated, not just instance fixed.

---

### Example 2: Z-Index Issues

**Symptom**: Elements render in wrong stacking order

**Observe**:
```javascript
console.table(Array.from(overlays).map(el => ({
  element: el.className,
  zIndex: getComputedStyle(el).zIndex
})));
// Output: Mix of 1000, 1001, magic numbers everywhere
```

**Pattern Recognition**:
- Magic z-index numbers scattered ❌
- No clear stacking order ❌
- Hard to reason about ❌

**Systematize**:
```typescript
// Design tokens
export const OVERLAY_TOKENS = {
  zIndex: {
    backdrop: 1000,
    sheet: 1001,
    overlay: 1002,
  }
}

// Type-safe accessor
export const getZIndex = (layer: keyof typeof OVERLAY_TOKENS.zIndex) => 
  OVERLAY_TOKENS.zIndex[layer];
```

**Result**: Single source of truth, predictable stacking.

---

### Example 3: Repeated Validation Logic

**Symptom**: Same email validation in 5 files

**Observe**:
```bash
$ grep -r "emailRegex" src/
# 5 files with slightly different regex
```

**Pattern Recognition**:
- Copy-paste validation ❌
- Inconsistent rules ❌
- Hard to update ❌

**Systematize**:
```typescript
// validators.ts
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Form field
<EmailField validate={isValidEmail} />
```

**Result**: One source of truth, consistent validation.

---

## Daily Habits

### Morning
- [ ] Review yesterday's patterns (any systematization opportunities?)
- [ ] Check for duplicate code (grep, ESLint)

### During Work
- [ ] Observe before fixing (console scripts first)
- [ ] Ask: "Will this recur?" (if yes, systematize)
- [ ] Extract on third use (not first or second)

### Code Review
- [ ] Look for copy-paste (suggest extraction)
- [ ] Look for magic values (suggest constants)
- [ ] Look for manual wiring (suggest Context/auto-wire)

### End of Week
- [ ] Update ENGINEERING_PRINCIPLES.md (new patterns discovered)
- [ ] Update pattern libraries (new reusable code)
- [ ] Document decisions (ADRs for significant changes)

---

## Questions to Ask Yourself

### Before Writing Code
1. Has someone solved this before? (search codebase, npm, docs)
2. Will I need this pattern again? (if yes, design for reuse)
3. Can types prevent misuse? (make invalid states unrepresentable)

### During Debugging
1. Can I observe this directly? (console script)
2. What's the actual behavior vs expected? (don't assume)
3. Is this root cause or symptom? (keep digging)

### After Fixing a Bug
1. Could this happen again? (if yes, systematize)
2. How can I prevent this class of bug? (Context, types, lint)
3. Should this be documented? (if it surprised you, document it)

### When Reviewing Code
1. Is there a simpler way? (fewer concepts, less code)
2. Is this pattern used elsewhere? (DRY)
3. Will future developers understand why? (comments, docs)

---

## Living Document

**This is not set in stone.** Update this document when you:

- ✅ Discover a new pattern worth systematizing
- ✅ Find a better way to debug
- ✅ Learn a technique that saves time
- ✅ Encounter a new anti-pattern

**Date of last update**: 2025-10-22

---

## Summary: The Foolproof Loop

```
┌────────────────────────────────────────┐
│  1. Observe (console scripts)          │
│  2. Understand (root cause analysis)   │
│  3. Pattern? (will this recur?)        │
│  4. Systematize (make it automatic)    │
│  5. Document (update this doc)         │
└────────────┬───────────────────────────┘
             │
             └──► Repeat for next problem
```

**Motto**: 
> "Work smarter, not harder. Make the design system foolproof."

**Mantra**:
> "Observe, don't guess. Systematize, don't repeat."
