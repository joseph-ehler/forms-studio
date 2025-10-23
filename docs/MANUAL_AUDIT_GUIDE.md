# 🧐 Manual Field Audit Guide: The Artisanal Finish

**Philosophy:** The factory ensures correctness. Humans ensure excellence.

---

## 🎯 The God Tier Quality Equation

```
Factory (90%) + Manual Audit (10%) = God Tier ✨

Factory: Objective correctness (ARIA, structure, tokens, consistency)
Humans: Subjective excellence (delight, feel, nuance, empathy)
```

**The factory frees you from checking basics, so your valuable human judgment can focus on what matters: ensuring the final product is not just correct, but truly excellent.**

---

## 🔍 WHEN TO AUDIT

### High Priority (Always Audit)

1. **New Recipe First Use**
   - First field generated with a new recipe
   - Example: First SignaturePad after creating SignatureRecipe
   
2. **Major Factory Upgrades**
   - After generator/refiner changes affecting multiple fields
   - After DS primitive updates
   
3. **Complex/Bespoke Fields**
   - SignaturePad, WheelTimePicker, MatrixPlotter
   - Any field using `ui.recipe: custom`

4. **Before Major Releases**
   - Pre-launch quality sweep
   - User-facing critical paths

### Medium Priority (Periodic Spot Checks)

5. **Quarterly Quality Review**
   - Sample 10-15 fields across all types
   - Ensure patterns still feel right
   - Check for subtle degradation

6. **After User Feedback**
   - User reports "feels clunky" or "hard to use"
   - Even if no objective errors exist

7. **High-Traffic Fields**
   - Login form fields
   - Checkout fields
   - Frequently-used search/filters

---

## 📋 THE AUDIT CHECKLIST

### 1. First Impressions (30 seconds)

**Gut Check:**
- [ ] Does it look professional?
- [ ] Is the purpose immediately clear?
- [ ] Does it feel modern & polished?
- [ ] Any visual glitches or oddities?

**Quick Test:**
- [ ] Click/tap the field
- [ ] Type a few characters
- [ ] Submit or trigger validation
- [ ] Does it feel right?

**Red Flags:**
- Hesitation: "Hmm, is this...?"
- Confusion: "What am I supposed to do?"
- Awkwardness: "That felt weird"
- Visual jank: Flashing, jumping, misalignment

---

### 2. Interaction Feel (2-3 minutes)

**Focus State:**
- [ ] Does the focus ring appear immediately?
- [ ] Is it highly visible?
- [ ] Does it feel responsive?
- [ ] Any lag or delay?

**Hover Feedback:**
- [ ] Subtle, not distracting?
- [ ] Clear affordance (I can interact)?
- [ ] Smooth transition?
- [ ] Works on both desktop & touch?

**Typing/Input:**
- [ ] Feels responsive (no input lag)?
- [ ] Cursor behavior natural?
- [ ] Placeholder text helpful?
- [ ] Character restrictions clear?

**Animations:**
- [ ] Smooth, not janky?
- [ ] Duration feels right (150-250ms)?
- [ ] Easing natural (not linear)?
- [ ] Doesn't distract or annoy?

**Error States:**
- [ ] Error appears promptly?
- [ ] Clear what's wrong?
- [ ] Actionable guidance?
- [ ] Not accusatory tone?

**Success States:**
- [ ] Positive reinforcement?
- [ ] Not over-the-top?
- [ ] Clear field is valid?

---

### 3. Edge Cases (3-5 minutes)

**Long Input:**
- [ ] Type 200+ characters
- [ ] Does it scroll/truncate properly?
- [ ] Layout doesn't break?

**Empty State:**
- [ ] Clear what to do?
- [ ] Placeholder helpful?
- [ ] No awkward empty space?

**Disabled State:**
- [ ] Visually distinct?
- [ ] Tooltip explains why?
- [ ] Can't accidentally interact?

**Loading State:**
- [ ] Spinner/skeleton present?
- [ ] Doesn't block other interactions?
- [ ] Clear progress indication?

**Multi-line Text:**
- [ ] Textareas resize naturally?
- [ ] Line breaks preserved?
- [ ] Scroll behavior smooth?

**Special Characters:**
- [ ] Emoji support? (if applicable)
- [ ] Accented characters? (é, ñ, ü)
- [ ] CJK characters? (中文, 日本語, 한글)

---

### 4. Mobile Experience (5-7 minutes)

**Touch Targets:**
- [ ] 48px minimum (use inspector)?
- [ ] Easy to tap accurately?
- [ ] No accidental taps?

**Virtual Keyboard:**
- [ ] Correct keyboard type? (email, tel, numeric)
- [ ] Return key label appropriate? (Next, Go, Send)
- [ ] Field scrolls into view above keyboard?

**Gestures:**
- [ ] Tap to focus works?
- [ ] Swipe to navigate (if applicable)?
- [ ] Pinch to zoom allowed on page?

**Orientation Changes:**
- [ ] Landscape mode works?
- [ ] No clipping or overflow?
- [ ] Focus state preserved?

**iOS Safari:**
- [ ] No 16px zoom issue (font-size: 16px)?
- [ ] Date/time pickers native or overlay?
- [ ] Select dropdowns native or custom?

**Android Chrome:**
- [ ] Input types respected?
- [ ] Autocomplete suggestions work?

---

### 5. Keyboard Navigation (3-5 minutes)

**Tab Order:**
- [ ] Logical tab sequence?
- [ ] No tab traps?
- [ ] Skip to next field works?

**Shortcuts:**
- [ ] Enter submits (if appropriate)?
- [ ] Escape cancels/closes?
- [ ] Arrow keys work (select, date picker)?

**Screen Reader (Quick Test):**
- [ ] VoiceOver/NVDA announces field label?
- [ ] Error messages read aloud?
- [ ] Instructions provided?
- [ ] Role correctly announced?

---

### 6. Contextual Appropriateness (2-3 minutes)

**Field Type Match:**
- [ ] Right input for the job? (not text for date)
- [ ] Specialized behavior appropriate?
- [ ] Native controls vs custom (when to use each)?

**Microcopy:**
- [ ] Label clear & concise?
- [ ] Placeholder helpful (not redundant)?
- [ ] Helper text adds value?
- [ ] Error messages empathetic?

**Example Good Microcopy:**
```
❌ BAD: "Email" → [empty]
✅ GOOD: "Email address" → "you@example.com"

❌ BAD: "Invalid email"
✅ GOOD: "Please enter a valid email address (e.g., you@example.com)"

❌ BAD: "Password must be 8 characters"
✅ GOOD: "Create a password (at least 8 characters)"
```

**Visual Hierarchy:**
- [ ] Label prominence correct?
- [ ] Required indicator clear?
- [ ] Optional fields less prominent?
- [ ] Grouping makes sense?

---

### 7. Performance Feel (1-2 minutes)

**Initial Render:**
- [ ] Appears quickly (no flash of unstyled)?
- [ ] No layout shift after load?
- [ ] Skeleton/loading state smooth?

**Interaction Response:**
- [ ] Input lag <100ms?
- [ ] Validation feels instant?
- [ ] No janky animations?

**Large Lists (if applicable):**
- [ ] Virtualization working?
- [ ] Scroll smooth?
- [ ] No stutter with 1000+ items?

---

## 🎨 SUBJECTIVE QUALITY CHECKLIST

### Does It Feel...

**Professional?**
- [ ] Clean, polished, no rough edges
- [ ] Consistent with design system
- [ ] Appropriate level of formality

**Modern?**
- [ ] Current design trends (not dated)
- [ ] Appropriate use of motion
- [ ] Contemporary interaction patterns

**Intuitive?**
- [ ] Zero learning curve
- [ ] Behaves as expected
- [ ] No surprises

**Delightful?**
- [ ] Subtle moments of delight
- [ ] Smooth, fluid interactions
- [ ] Positive reinforcement

**Trustworthy?**
- [ ] Secure-looking (password fields)
- [ ] Clear data handling
- [ ] No sketchy patterns

**Accessible?**
- [ ] Works without mouse
- [ ] Works without vision
- [ ] Works with limited dexterity

---

## 📝 AUDIT DOCUMENTATION

### Audit Report Template

```markdown
# Field Audit: [FieldName]

**Date:** YYYY-MM-DD  
**Auditor:** [Your Name]  
**Recipe/Type:** [Recipe name or "custom"]  
**Version:** [Field version or spec version]

## Summary
[2-3 sentence overview of field quality]

## First Impressions
- **Visual Quality:** ⭐⭐⭐⭐⭐ (1-5 stars)
- **Interaction Feel:** ⭐⭐⭐⭐⭐
- **Gut Reaction:** [Immediate thoughts]

## Findings

### ✅ Strengths
- [What's working well]
- [Delightful moments]
- [Best practices observed]

### ⚠️ Minor Issues
- [Small improvements]
- [Subjective preferences]
- [Nice-to-haves]

### 🔴 Critical Issues
- [Blockers or serious UX problems]
- [Accessibility violations]
- [Broken interactions]

## Edge Cases Tested
- [ ] Long input (200+ chars)
- [ ] Empty state
- [ ] Disabled state
- [ ] Loading state
- [ ] Error state
- [ ] Success state
- [ ] Mobile (iOS/Android)
- [ ] Keyboard nav
- [ ] Special characters

## Subjective Assessment

**Professional:** ⭐⭐⭐⭐⭐  
**Modern:** ⭐⭐⭐⭐⭐  
**Intuitive:** ⭐⭐⭐⭐⭐  
**Delightful:** ⭐⭐⭐⭐⭐  
**Trustworthy:** ⭐⭐⭐⭐⭐  
**Accessible:** ⭐⭐⭐⭐⭐  

**Overall:** ⭐⭐⭐⭐⭐

## Recommendations

### Immediate (This PR/Release)
1. [Critical fixes]
2. [High-impact improvements]

### Short-term (Next Sprint)
1. [Polish items]
2. [Nice-to-haves]

### Long-term (System Improvements)
1. [Factory recipe updates]
2. [DS primitive enhancements]
3. [New refiner rules]

## Feedback Loop

**Teach the Factory:**
- [ ] Update Recipe: [Which recipe? What changes?]
- [ ] Add Refiner Rule: [What to enforce?]
- [ ] Update Overlays: [New defaults?]
- [ ] Improve DS Primitive: [Which primitive? How?]

**Pattern Discovery:**
- [ ] New recipe opportunity? [Describe pattern]
- [ ] Bespoke treatment needed? [Why?]
- [ ] Document in handbook? [What lesson?]
```

---

## 🔄 FEEDBACK LOOP PROCESS

### 1. Collect Findings

Document all issues found during audit:
- Screenshot/video of issues
- Steps to reproduce
- Expected vs actual behavior
- Subjective assessment

### 2. Categorize Issues

**Objective (Factory Can Fix):**
- Missing ARIA attribute → Add refiner rule
- Wrong DS class used → Update recipe template
- Inconsistent spacing → Update factory overlays

**Subjective (Requires Design Decision):**
- Animation too fast → Update DS tokens or recipe
- Microcopy unclear → Update content guidelines
- Interaction feels awkward → Redesign pattern

**Bespoke (Field-Specific):**
- Unique requirement for this field only
- Mark exception in spec
- Document rationale

### 3. Improve the Factory

**Update Generator/Recipe:**
```typescript
// Before audit:
return {
  element: 'input',
  props: { type: 'text' }
};

// After audit (found animation issue):
return {
  element: 'input',
  props: { 
    type: 'text',
    className: 'ds-input ds-input--smooth-focus' // New class!
  }
};
```

**Add Refiner Rule:**
```javascript
// New rule from audit finding:
export const enforceHelpTextV1 = {
  name: 'enforce-help-text-v1.0',
  description: 'Ensure complex fields have helper text',
  
  run(ast, spec) {
    if (spec.validation?.complex && !spec.ui?.helperText) {
      return {
        changed: true,
        ast: addHelperText(ast, generateDefaultHelper(spec))
      };
    }
  }
};
```

**Update Factory Overlays:**
```yaml
# Based on audit findings:
- when:
    type: email
  merge:
    ui:
      placeholder: 'you@example.com'  # Better placeholder!
      helperText: 'We'll never share your email'  # Reassurance!
```

**Improve DS Primitive:**
```css
/* Add to ds-inputs.css based on audit feedback */
.ds-input--smooth-focus {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1); /* Smoother! */
}
```

### 4. Validate Improvements

- Re-audit after factory changes
- Verify improvements propagated to all affected fields
- Check for unintended side effects
- Document in changelog/ADR

---

## 📊 AUDIT METRICS

### Quality Scorecard

Track audit scores over time:

```
Field: EmailField
Audit History:
- 2025-01-15: ⭐⭐⭐⭐☆ (4.0) - Initial
- 2025-02-20: ⭐⭐⭐⭐⭐ (4.5) - After focus improvements
- 2025-03-10: ⭐⭐⭐⭐⭐ (5.0) - After microcopy update

Trend: ↗️ Improving
```

### Factory Effectiveness

Measure how well factory catches issues:

```
Last 10 Audits:
- Issues found: 47 total
  - Objective (factory could catch): 38 (81%)
  - Subjective (human judgment): 9 (19%)
  
Factory Coverage: 81% (Good! Aim for >80%)
```

### Improvement Velocity

Track feedback loop speed:

```
Issue → Factory Improvement → Re-audit:
- Avg time: 3.5 days
- Target: <5 days

Pattern Discovery → Recipe Promotion:
- Avg time: 2 weeks
- Target: <3 weeks
```

---

## 🎯 QUICK AUDIT (5-MINUTE VERSION)

When time is limited, focus on these:

1. **30-Second Gut Check**
   - Does it look/feel right immediately?

2. **1-Minute Interaction Test**
   - Click, type, submit
   - Any weirdness?

3. **1-Minute Mobile Test**
   - Pull up on phone
   - Tap, type, test keyboard

4. **1-Minute Keyboard Nav**
   - Tab through
   - Try shortcuts

5. **1-Minute Edge Case**
   - Test one edge case (long input or error)

6. **30-Second Assessment**
   - Stars rating (1-5)
   - Go/No-Go decision

**Total: 5 minutes = Quick confidence check ✅**

---

## 🏆 GOD TIER FIELD CRITERIA

A field achieves "God Tier" when:

### Objective (Factory-Enforced)
- ✅ WCAG 2.1 Level AA compliant
- ✅ Correct ARIA attributes
- ✅ Proper semantic HTML
- ✅ DS primitives/tokens used
- ✅ No inline styles
- ✅ Keyboard accessible
- ✅ Touch target ≥44px

### Subjective (Manual Audit)
- ✅ Feels professional & polished
- ✅ Modern interaction patterns
- ✅ Intuitive (zero learning curve)
- ✅ Delightful moments present
- ✅ Trustworthy appearance
- ✅ Empathetic microcopy
- ✅ Smooth, fluid animations
- ✅ No awkward edge cases
- ✅ Works beautifully on mobile
- ✅ Keyboard nav feels natural

### Performance
- ✅ Input lag <100ms
- ✅ Initial render <200ms
- ✅ Smooth 60fps animations
- ✅ No layout shift

### Overall
- ✅ 5-star rating on all subjective criteria
- ✅ Zero critical issues
- ✅ < 3 minor issues
- ✅ Would proudly showcase to users

---

## 🚀 GETTING STARTED

### First Audit Session

1. **Pick a field type** (start with TextField - most common)
2. **Set timer for 15 minutes**
3. **Follow full checklist** above
4. **Document findings** in audit report
5. **Identify 1-2 factory improvements**
6. **Implement & validate**

### Build the Habit

- **Weekly:** Audit 1-2 fields (20-30 min)
- **Monthly:** Spot check 5-10 fields (2 hours)
- **Quarterly:** Full audit sweep (1 day)
- **Pre-Release:** Critical path audit (4 hours)

### Celebrate Wins

Track your progress:
- Fields audited: 127
- Issues found & fixed: 342
- Factory improvements: 23
- Avg quality score: 4.7/5.0 ⭐

**Your manual audits make the entire system better!** 🎉

---

## 📚 RESOURCES

**Tools:**
- `scripts/debug/inspect-field-styles.js` - Browser console inspector
- Chrome DevTools → Lighthouse → Accessibility audit
- axe DevTools browser extension
- VoiceOver (macOS) / NVDA (Windows)

**Documentation:**
- `docs/FIELD_TYPE_BEAUTIFICATION.md` - Visual design guidelines
- `docs/FIELD_DEVELOPMENT_FRAMEWORK.md` - Two-lane model
- `packages/ds/docs/patterns/` - DS primitive usage

**Checklists:**
- WCAG 2.1 Quick Reference
- Touch Target Guidelines (44px min)
- Keyboard Interaction Patterns

---

## 🎓 CONCLUSION

**The factory is your industrial precision.**  
**Manual audits are your artisanal finish.**

Together, they create God Tier quality:
- Factory ensures no field is broken
- Humans ensure every field is delightful

**Remember:**
- Audit liberally (it's fast with the checklist!)
- Document findings thoroughly
- Feed improvements back to factory
- Celebrate subjective excellence

**Your taste and judgment are irreplaceable.** The factory amplifies your craft—it doesn't replace it. 🏭👨‍🎨✨

---

**Happy Auditing!** 🧐
