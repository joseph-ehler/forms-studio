# Console-First Debugging Playbook

> "I'd be happy to experience a million bugs if we debugged this way - it made things so much easier"

---

## Philosophy: Observe, Don't Guess

**Before fixing anything, make the invisible visible.**

Use targeted console scripts to observe actual runtime behavior. This reveals the precise issue and enables surgical fixes.

---

## The Pattern

```
1. Symptom → 2. Script → 3. Observe → 4. Hypothesis → 5. Next Script → ... → N. Fix
```

**Key**: Don't jump to step N until you've observed enough to be confident.

---

## Script Library

### 1. Event Flow Tracking

**When**: User interaction doesn't behave as expected

```javascript
// Track event sequence and timing
let events = [];

['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click'].forEach(type => {
  document.addEventListener(type, (e) => {
    events.push({
      type,
      target: e.target.tagName + (e.target.className ? '.' + e.target.className.split(' ')[0] : ''),
      timestamp: Date.now()
    });
    console.log(`${type.toUpperCase()} on`, e.target);
  }, true);
});

// Review sequence
setTimeout(() => {
  console.table(events);
  events = [];
}, 5000);
```

---

### 2. Outside-Click Detection Debug

**When**: Overlay closes unexpectedly on internal clicks

```javascript
const overlay = document.querySelector('[data-overlay="picker"]');
const trigger = document.querySelector('[data-trigger]'); // adjust selector

document.addEventListener('pointerdown', (e) => {
  console.log('POINTERDOWN detected');
  console.log('  Target:', e.target);
  console.log('  Inside overlay?', overlay?.contains(e.target));
  console.log('  Inside trigger?', trigger?.contains(e.target));
  console.log('  Overlay ref exists?', !!overlay);
}, true);
```

---

### 3. Ref & Context Verification

**When**: Data doesn't seem to flow through Context/Refs

```javascript
// Check if Context is providing values
const checkContext = () => {
  const overlay = document.querySelector('[data-overlay="picker"]');
  console.log('Overlay element:', overlay);
  
  // Check React internals (dev mode only)
  const fiber = overlay?._reactInternals || overlay?._reactInternalFiber;
  if (fiber) {
    console.log('React fiber found - component is mounted');
  }
  
  // Check refs manually
  console.log('Has ref attribute?', overlay?.getAttribute('ref'));
};

checkContext();
```

---

### 4. Z-Index & Stacking Context

**When**: Clicks going through elements or wrong element receiving events

```javascript
const checkStacking = (selector) => {
  const elements = document.querySelectorAll(selector);
  console.table(Array.from(elements).map((el, i) => ({
    index: i,
    tagName: el.tagName,
    className: el.className.substring(0, 30),
    zIndex: getComputedStyle(el).zIndex,
    position: getComputedStyle(el).position,
    pointerEvents: getComputedStyle(el).pointerEvents
  })));
};

// Usage
checkStacking('[aria-hidden="true"]');
checkStacking('[role="dialog"]');
```

---

### 5. Render Timing & Lifecycle

**When**: State updates don't trigger expected re-renders

```javascript
let renderCount = 0;

// Hook into React DevTools backend (if available)
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  const original = hook.onCommitFiberRoot;
  
  hook.onCommitFiberRoot = function(...args) {
    renderCount++;
    console.log(`Render #${renderCount} at`, new Date().toISOString());
    return original?.apply(this, args);
  };
}
```

---

### 6. Mutation Observer (DOM Changes)

**When**: Elements disappear unexpectedly

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element
          console.log('Element removed:', node.tagName, node.className);
          console.trace(); // Show stack trace
        }
      });
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// Stop observing
// observer.disconnect();
```

---

### 7. Click Target Inspector

**When**: Unsure what element is actually receiving the click

```javascript
document.addEventListener('click', (e) => {
  console.log('%c━━━ CLICK DEBUG ━━━', 'font-weight: bold; color: #f59e0b;');
  console.log('Target:', e.target);
  console.log('CurrentTarget:', e.currentTarget);
  console.log('Path:', e.composedPath().map(el => 
    el.tagName ? `${el.tagName}.${el.className?.split(' ')[0] || ''}` : el
  ));
  console.log('Bubbling:', !e.cancelBubble);
  console.log('Default prevented:', e.defaultPrevented);
}, true); // Capture phase
```

---

### 8. State Snapshot

**When**: Need to capture full state at a moment in time

```javascript
const snapshot = () => {
  return {
    timestamp: new Date().toISOString(),
    overlays: Array.from(document.querySelectorAll('[data-overlay]')).map(el => ({
      type: el.dataset.overlay,
      visible: getComputedStyle(el).display !== 'none',
      zIndex: getComputedStyle(el).zIndex
    })),
    activeElement: document.activeElement?.tagName,
    scrollPosition: window.scrollY,
    viewport: { width: window.innerWidth, height: window.innerHeight }
  };
};

// Take multiple snapshots
const snapshots = [];
setInterval(() => snapshots.push(snapshot()), 100);

// Review after interaction
setTimeout(() => console.table(snapshots), 2000);
```

---

## Debugging Session Template

### Phase 1: Reproduce & Observe

1. **Reproduce the issue**
2. **What's the symptom?** (overlay closes, button doesn't work, etc.)
3. **Run initial observation script** (event tracking, element inspection)
4. **Report findings** (what actually happens vs. expected)

### Phase 2: Form Hypothesis

1. **What could cause this behavior?**
2. **What data/state would need to be wrong?**
3. **Write verification script** (check that specific data/state)

### Phase 3: Narrow Down

1. **Run verification script**
2. **Does it confirm or reject hypothesis?**
3. **If confirmed**: proceed to fix
4. **If rejected**: form new hypothesis, repeat

### Phase 4: Fix with Confidence

1. **You now know EXACTLY what's wrong**
2. **Implement precise fix**
3. **Re-run verification script to confirm**

---

## Real Example: Footer Click Bug

### Symptom
"Clear button closes overlay without clearing value"

### Script 1: Event Sequence
```javascript
console.log('POINTERDOWN - downInside:', downInside);
console.log('POINTERUP - upInside:', upInside);
```
**Finding**: `downInside: true` but overlay still closes!

### Script 2: Outside-Click Logic
```javascript
console.log('contentRef.current:', contentRef.current);
console.log('contains(clearButton):', contentRef.current?.contains(clearButton));
```
**Finding**: `contentRef.current` is `null` → can't contain anything!

### Script 3: Why is contentRef null?
```javascript
const clearBtn = document.querySelector('[data-testid="clear"]');
const picker = document.querySelector('[data-overlay="picker"]');
console.log('Clear inside picker?:', picker?.contains(clearBtn));
```
**Finding**: Clear button IS inside picker, but `contentRef` never assigned!

### Fix: Auto-wire contentRef via Context
**Confidence**: 100% - we observed the exact issue

---

## Best Practices

### ✅ DO

- Write scripts that show actual runtime behavior
- Start broad, narrow down progressively
- Make user part of the discovery (collaborative)
- Console.table for structured data
- Console.trace for call stacks
- Add visual indicators (%c styling)

### ❌ DON'T

- Guess based on code reading alone
- Jump to fixes without observation
- Write scripts that change state
- Assume behavior from similar bugs
- Skip verification after fix

---

## Script Best Practices

### Make Output Readable

```javascript
// ✅ Good: Structured, scannable
console.log('%c🔍 CLICK DEBUG', 'font-size: 16px; font-weight: bold; color: #3b82f6;');
console.table({ target: e.target, inside: isInside, ref: !!contentRef });

// ❌ Bad: Wall of text
console.log('click detected on', e.target, 'inside:', isInside, 'ref:', contentRef);
```

### Capture Sufficient Context

```javascript
// ✅ Good: Full picture
{
  event: e.type,
  target: e.target.className,
  timestamp: Date.now(),
  overlayExists: !!overlay,
  refConnected: !!contentRef.current
}

// ❌ Bad: Incomplete
{ clicked: true }
```

### Use Appropriate Timing

```javascript
// For immediate observation
document.addEventListener('click', handler, true);

// For state after React render
setTimeout(() => checkState(), 0);

// For animation completion
setTimeout(() => checkState(), 300);
```

---

## When to Stop Debugging and Fix

**You're ready to fix when you can answer**:

1. ✅ What exact data/state is wrong?
2. ✅ Why is it wrong (where should it come from)?
3. ✅ How will the fix change the observed behavior?

**If you can't answer all three → run another script.**

---

## Remember

> **"Never guess when you can observe."**

The console is your microscope. Use it to make the invisible visible, then fix with surgical precision.

---

**This playbook is a living document. Add new scripts as you discover them!**
