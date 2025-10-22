# 🔍 Overlay Debug Scripts - Console Toolkit

Copy-paste these into your browser console to diagnose overlay issues.

---

## 🚨 Quick Diagnostic (Run This First)

```js
// QUICK CHECK - Paste this when overlay is open
(() => {
  const overlay = document.querySelector('[data-overlay="picker"]');
  if (!overlay) {
    console.warn('❌ No overlay found. Open a picker first!');
    return;
  }
  
  const cs = getComputedStyle(overlay);
  const content = overlay.querySelector('[data-role="content"]');
  const footer = overlay.querySelector('[data-role="footer"]');
  const ccs = content ? getComputedStyle(content) : null;
  const rect = overlay.getBoundingClientRect();
  
  console.log('%c🔍 OVERLAY DIAGNOSTIC', 'font-size: 16px; font-weight: bold; color: #2563eb;');
  console.table({
    '✅ Overlay Found': '✓',
    'Max Height (style)': overlay.style.maxHeight || '❌ MISSING',
    'Max Height (computed)': cs.maxHeight,
    'CSS Var --overlay-max-h': cs.getPropertyValue('--overlay-max-h') || '❌ MISSING',
    'Data Attribute': overlay.getAttribute('data-max-h') || '❌ MISSING',
    'Content Overflow': ccs?.overflowY || '❌ NO CONTENT DIV',
    'Content Height': content ? `${content.scrollHeight}px (scroll) / ${content.clientHeight}px (visible)` : '❌ NO CONTENT',
    'Footer Found': footer ? '✓' : '❌ NO FOOTER',
    'Bottom in Viewport': rect.bottom <= window.innerHeight ? '✅ YES' : '❌ EXTENDS BELOW',
    'Viewport Height': `${window.innerHeight}px`,
    'Overlay Bottom': `${Math.round(rect.bottom)}px`,
  });
  
  // Check for common issues
  const issues = [];
  if (!overlay.style.maxHeight) issues.push('⚠️  Size middleware not running');
  if (ccs?.overflowY !== 'auto') issues.push('⚠️  Content overflow broken');
  if (rect.bottom > window.innerHeight) issues.push('⚠️  Overlay extends below viewport');
  if (content && content.scrollHeight === content.clientHeight && window.innerHeight < 600) {
    issues.push('⚠️  Content not scrollable on small viewport');
  }
  
  if (issues.length > 0) {
    console.log('%c⚠️  ISSUES FOUND:', 'font-weight: bold; color: #f59e0b;');
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('%c✅ ALL CHECKS PASSED', 'font-weight: bold; color: #10b981;');
  }
})();
```

---

## 🎯 Outside-Click Detection Debug

```js
// DEBUG OUTSIDE-CLICK - Run this to monitor click detection
(() => {
  console.log('%c🎯 MONITORING OUTSIDE-CLICK DETECTION', 'font-size: 14px; font-weight: bold; color: #8b5cf6;');
  console.log('Click inside or outside the overlay...');
  
  let downInside = false;
  
  const onPointerDown = (e) => {
    const overlay = document.querySelector('[data-overlay="picker"]');
    if (!overlay) return;
    
    const target = e.target;
    downInside = overlay.contains(target);
    
    console.log(`%c⬇️  POINTER DOWN`, 'color: #3b82f6;', {
      downInside,
      target: target.tagName + (target.className ? '.' + target.className.split(' ')[0] : ''),
      inOverlay: overlay.contains(target),
    });
  };
  
  const onPointerUp = (e) => {
    const overlay = document.querySelector('[data-overlay="picker"]');
    if (!overlay) return;
    
    const target = e.target;
    const upInside = overlay.contains(target);
    
    console.log(`%c⬆️  POINTER UP`, 'color: #8b5cf6;', {
      downInside,
      upInside,
      shouldClose: !downInside && !upInside,
      target: target.tagName + (target.className ? '.' + target.className.split(' ')[0] : ''),
    });
    
    if (!downInside && !upInside) {
      console.log('%c🚪 OVERLAY SHOULD CLOSE (outside click)', 'font-weight: bold; color: #ef4444;');
    } else {
      console.log('%c✋ OVERLAY SHOULD STAY OPEN (inside click)', 'font-weight: bold; color: #10b981;');
    }
  };
  
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('pointerup', onPointerUp, true);
  
  console.log('👉 To stop monitoring, run: location.reload()');
})();
```

---

## 📏 Event Propagation Tracker

```js
// TRACK EVENT PROPAGATION - See which handlers are blocking events
(() => {
  console.log('%c📡 TRACKING EVENT PROPAGATION', 'font-size: 14px; font-weight: bold; color: #ec4899;');
  
  const trackEvent = (eventName, color) => {
    document.addEventListener(eventName, (e) => {
      console.log(
        `%c${eventName.toUpperCase()} (capture)`,
        `color: ${color}; font-weight: bold;`,
        {
          target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
          phase: 'CAPTURE',
          propagationStopped: e.cancelBubble,
        }
      );
    }, true); // capture
    
    document.addEventListener(eventName, (e) => {
      console.log(
        `%c${eventName.toUpperCase()} (bubble)`,
        `color: ${color};`,
        {
          target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
          phase: 'BUBBLE',
          propagationStopped: e.cancelBubble,
        }
      );
    }, false); // bubble
  };
  
  trackEvent('pointerdown', '#3b82f6');
  trackEvent('pointerup', '#8b5cf6');
  trackEvent('click', '#10b981');
  
  console.log('👉 Click something in the overlay...');
  console.log('👉 To stop, run: location.reload()');
})();
```

---

## 🧪 Button Click Test

```js
// TEST BUTTON CLICKS - Verify Clear/Done buttons work
(() => {
  const overlay = document.querySelector('[data-overlay="picker"]');
  if (!overlay) {
    console.warn('❌ No overlay found. Open a picker first!');
    return;
  }
  
  const footer = overlay.querySelector('[data-role="footer"]');
  if (!footer) {
    console.warn('❌ No footer found in overlay');
    return;
  }
  
  const buttons = footer.querySelectorAll('button');
  console.log(`%c🔘 FOUND ${buttons.length} BUTTONS`, 'font-weight: bold; color: #2563eb;');
  
  buttons.forEach((btn, i) => {
    const originalHandler = btn.onclick;
    
    btn.onclick = function(e) {
      console.log(`%c✓ BUTTON ${i + 1} CLICKED`, 'color: #10b981; font-weight: bold;', {
        text: btn.textContent.trim(),
        propagationStopped: e.cancelBubble,
        defaultPrevented: e.defaultPrevented,
      });
      
      // Call original handler
      if (originalHandler) {
        return originalHandler.call(this, e);
      }
    };
    
    console.log(`Button ${i + 1}: "${btn.textContent.trim()}" - click handler ${btn.onclick ? '✓' : '❌'}`);
  });
  
  console.log('👉 Now click the buttons and watch the console...');
})();
```

---

## 🔍 Inspect All Event Listeners

```js
// LIST ALL EVENT LISTENERS on overlay
(() => {
  const overlay = document.querySelector('[data-overlay="picker"]');
  if (!overlay) {
    console.warn('❌ No overlay found');
    return;
  }
  
  console.log('%c🎧 OVERLAY EVENT LISTENERS', 'font-size: 14px; font-weight: bold; color: #06b6d4;');
  
  // This only works in some browsers
  if (typeof getEventListeners === 'function') {
    const listeners = getEventListeners(overlay);
    console.table(Object.keys(listeners).map(type => ({
      Event: type,
      Count: listeners[type].length,
      Capture: listeners[type].filter(l => l.useCapture).length,
      Bubble: listeners[type].filter(l => !l.useCapture).length,
    })));
  } else {
    console.warn('getEventListeners() not available in this browser');
    console.log('Try using Chrome DevTools → Elements → Event Listeners panel');
  }
})();
```

---

## 📊 Live Height Monitor

```js
// MONITOR HEIGHT CHANGES - Track overlay resizing
(() => {
  const overlay = document.querySelector('[data-overlay="picker"]');
  if (!overlay) {
    console.warn('❌ No overlay found');
    return;
  }
  
  console.log('%c📊 MONITORING OVERLAY HEIGHT', 'font-weight: bold; color: #f59e0b;');
  
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const rect = entry.target.getBoundingClientRect();
      const cs = getComputedStyle(entry.target);
      
      console.log('%c📏 HEIGHT CHANGED', 'color: #f59e0b;', {
        styleMaxH: entry.target.style.maxHeight,
        computedMaxH: cs.maxHeight,
        actualHeight: Math.round(rect.height) + 'px',
        bottomPosition: Math.round(rect.bottom) + 'px',
        viewportHeight: window.innerHeight + 'px',
        fitsInViewport: rect.bottom <= window.innerHeight ? '✅' : '❌',
      });
    }
  });
  
  observer.observe(overlay);
  
  window._overlayHeightObserver = observer;
  console.log('👉 Resize window or change content to see updates...');
  console.log('👉 To stop: window._overlayHeightObserver.disconnect()');
})();
```

---

## 🎨 Visual Debug Overlay

```js
// ADD VISUAL DEBUG OVERLAY - Highlights problem areas
(() => {
  const overlay = document.querySelector('[data-overlay="picker"]');
  if (!overlay) {
    console.warn('❌ No overlay found');
    return;
  }
  
  // Add visual indicators
  overlay.style.outline = '3px solid #ef4444';
  overlay.style.outlineOffset = '-3px';
  
  const content = overlay.querySelector('[data-role="content"]');
  if (content) {
    content.style.outline = '2px solid #3b82f6';
    content.style.outlineOffset = '-2px';
  }
  
  const footer = overlay.querySelector('[data-role="footer"]');
  if (footer) {
    footer.style.outline = '2px solid #10b981';
    footer.style.outlineOffset = '-2px';
  }
  
  const header = overlay.querySelector('[data-role="header"]');
  if (header) {
    header.style.outline = '2px solid #f59e0b';
    header.style.outlineOffset = '-2px';
  }
  
  console.log('%c🎨 VISUAL DEBUG APPLIED', 'font-weight: bold; color: #ec4899;');
  console.log('🔴 Red = Overlay container');
  console.log('🔵 Blue = Content area');
  console.log('🟢 Green = Footer');
  console.log('🟡 Yellow = Header');
  console.log('👉 Refresh page to remove');
})();
```

---

## 🧹 Clear Button Specific Debug

```js
// DEBUG CLEAR BUTTON - Track why Clear might not work
(() => {
  const overlay = document.querySelector('[data-overlay="picker"]');
  if (!overlay) {
    console.warn('❌ No overlay found');
    return;
  }
  
  const footer = overlay.querySelector('[data-role="footer"]');
  const clearBtn = footer?.querySelector('button');
  
  if (!clearBtn) {
    console.warn('❌ No Clear button found');
    return;
  }
  
  console.log('%c🧹 DEBUGGING CLEAR BUTTON', 'font-weight: bold; color: #ec4899;');
  
  // Track all events on Clear button
  ['pointerdown', 'pointerup', 'click', 'mousedown', 'mouseup'].forEach(eventType => {
    clearBtn.addEventListener(eventType, (e) => {
      console.log(`%c${eventType.toUpperCase()}`, 'color: #8b5cf6; font-weight: bold;', {
        propagationStopped: e.cancelBubble,
        defaultPrevented: e.defaultPrevented,
        bubbles: e.bubbles,
        eventPhase: e.eventPhase === 1 ? 'CAPTURE' : e.eventPhase === 2 ? 'TARGET' : 'BUBBLE',
      });
    }, true); // capture
  });
  
  console.log('👉 Click the Clear button and watch what happens...');
})();
```

---

## 🎯 Complete Health Check

```js
// COMPLETE HEALTH CHECK - Run all diagnostics
(() => {
  console.clear();
  console.log('%c🏥 OVERLAY HEALTH CHECK', 'font-size: 18px; font-weight: bold; color: #2563eb; background: #eff6ff; padding: 8px;');
  
  const overlay = document.querySelector('[data-overlay="picker"]');
  
  if (!overlay) {
    console.error('❌ CRITICAL: No overlay found. Open a picker first!');
    return;
  }
  
  const content = overlay.querySelector('[data-role="content"]');
  const footer = overlay.querySelector('[data-role="footer"]');
  const header = overlay.querySelector('[data-role="header"]');
  const rect = overlay.getBoundingClientRect();
  const cs = getComputedStyle(overlay);
  const ccs = content ? getComputedStyle(content) : null;
  
  const checks = {
    '1. Overlay Rendered': !!overlay ? '✅' : '❌',
    '2. Max Height Set': !!overlay.style.maxHeight ? '✅' : '❌',
    '3. CSS Var Present': !!cs.getPropertyValue('--overlay-max-h') ? '✅' : '❌',
    '4. Data Attribute': !!overlay.getAttribute('data-max-h') ? '✅' : '❌',
    '5. Content Area Exists': !!content ? '✅' : '❌',
    '6. Content Scrollable': ccs?.overflowY === 'auto' ? '✅' : '❌',
    '7. Fits in Viewport': rect.bottom <= window.innerHeight ? '✅' : '❌',
    '8. Footer Exists': !!footer ? '✅' : '❌',
    '9. Role=dialog': overlay.getAttribute('role') === 'dialog' ? '✅' : '❌',
    '10. Aria-modal': overlay.getAttribute('aria-modal') === 'true' ? '✅' : '❌',
  };
  
  console.table(checks);
  
  const failedChecks = Object.entries(checks).filter(([_, v]) => v === '❌');
  
  if (failedChecks.length === 0) {
    console.log('%c✅ ALL CHECKS PASSED - OVERLAY IS HEALTHY', 'font-size: 14px; font-weight: bold; color: #10b981; background: #f0fdf4; padding: 8px;');
  } else {
    console.log('%c⚠️  FAILED CHECKS:', 'font-size: 14px; font-weight: bold; color: #ef4444; background: #fef2f2; padding: 8px;');
    failedChecks.forEach(([check, _]) => console.log(`  ${check}`));
  }
})();
```

---

## 📋 Quick Copy Commands

```js
// 1. QUICK DIAGNOSTIC
// (() => { /* paste Quick Diagnostic script */ })();

// 2. OUTSIDE-CLICK DEBUG  
// (() => { /* paste Outside-Click Detection script */ })();

// 3. HEALTH CHECK
// (() => { /* paste Complete Health Check script */ })();

// 4. VISUAL DEBUG
// (() => { /* paste Visual Debug Overlay script */ })();
```

---

## 🆘 Common Issues & Solutions

### Issue: "No overlay found"
**Solution**: Open a picker first (Date, Select, etc.), then run the script

### Issue: Clear button closes overlay
**Check**:
```js
// Run this
const overlay = document.querySelector('[data-overlay="picker"]');
console.log('stopPropagation on container?', 
  overlay.onpointerdown ? '❌ YES - THIS IS THE BUG!' : '✅ No'
);
```
**Fix**: Container should NOT have `onPointerDown` with `stopPropagation`

### Issue: Overlay extends below viewport
**Check**:
```js
const overlay = document.querySelector('[data-overlay="picker"]');
const rect = overlay.getBoundingClientRect();
console.log({
  overlayBottom: rect.bottom,
  viewportHeight: window.innerHeight,
  overflow: rect.bottom - window.innerHeight,
});
```
**Fix**: Check `maxHeight` computation in size middleware

### Issue: Content not scrollable
**Check**:
```js
const content = document.querySelector('[data-role="content"]');
const cs = getComputedStyle(content);
console.log({
  overflow: cs.overflowY,
  flex: cs.flex,
  minHeight: cs.minHeight,
  scrollHeight: content.scrollHeight,
  clientHeight: content.clientHeight,
});
```
**Fix**: Content needs `flex-1 min-h-0 overflow-auto`

---

## 💾 Save These Scripts

Bookmark this file or save these scripts in your browser's snippets (DevTools → Sources → Snippets).

**Pro Tip**: Create snippets named:
- `overlay-quick-check`
- `overlay-click-debug`
- `overlay-health-check`

Then you can run them with `Cmd+P` → `!snippet-name` in Chrome DevTools!
