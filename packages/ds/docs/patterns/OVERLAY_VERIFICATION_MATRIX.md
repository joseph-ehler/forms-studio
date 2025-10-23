# 🧪 Overlay Verification Matrix

**Run this every time you touch overlay code. Takes 5–7 minutes. No exceptions.**

---

## ✅ Pre-Flight (30 seconds)

Open browser console and run:
```js
// Quick diagnostic check
(() => {
  const el = document.querySelector('[data-overlay="picker"]');
  if (!el) { console.warn('❌ No overlay open'); return; }
  const cs = getComputedStyle(el);
  const content = el.querySelector('[data-role="content"]');
  const ccs = content ? getComputedStyle(content) : null;

  console.table({
    styleMaxH: el.style.maxHeight || '(none)',
    computedMaxH: cs.maxHeight,
    cssVar: cs.getPropertyValue('--overlay-max-h') || '(none)',
    dataMaxH: el.getAttribute('data-max-h') || '(none)',
    contentOverflow: ccs?.overflowY || '(none)',
    contentScroll: content?.scrollHeight,
    contentClient: content?.clientHeight,
  });

  const rect = el.getBoundingClientRect();
  console.log('✅ Bottom within viewport?', rect.bottom <= window.innerHeight);
})();
```

**Expected output:**
- `styleMaxH`: A px value (e.g., `480px`)
- `computedMaxH`: Same as styleMaxH
- `cssVar`: Same px value
- `dataMaxH`: Number without px (e.g., `480`)
- `contentOverflow`: `auto`
- `contentScroll` > `contentClient` when viewport is small
- Bottom within viewport: `true`

---

## 1. Load Order & Portal (1 minute)

### Test
1. Open any picker (Date, Select, MultiSelect)
2. Run `debugOverlay()` in console

### Pass Criteria
✅ `Overlay Style maxHeight` is a px value (not empty)  
✅ `Computed maxH` matches `style`  
✅ `--overlay-max-h` and `data-max-h` present  
✅ `content overflow-y: auto`  
✅ `scrollHeight > clientHeight` when viewport < 600px  

### Fail Indicators
❌ `styleMaxH` is `(none)` → Size middleware not running  
❌ `contentOverflow` ≠ `auto` → Someone overrode content wrapper  
❌ `scrollHeight === clientHeight` on small viewport → `min-h-0` missing  

---

## 2. Viewport Constraints (2 minutes)

### Test Desktop
1. Resize browser to **1920×1080**
2. Open DateField
3. Measure overlay bottom vs viewport bottom

**Pass**: Overlay bottom ≤ viewport bottom  
**Fail**: Overlay extends below fold → collision padding too small or portal not working

### Test Tablet
1. Resize to **768×1024**
2. Open MultiSelectField with 20+ options
3. Check footer visibility

**Pass**: Footer visible, content scrolls  
**Fail**: Footer cut off → flexbox broken

### Test Mobile
1. Resize to **375×667**
2. Open DateRangeField (dual calendar)
3. Check footer + content

**Pass**: Footer visible, both calendars fit  
**Fail**: Content overflows → `hardMaxHeight` not constraining

### Test Tiny
1. Resize to **375×480** (worst case)
2. Open SelectField with search
3. Check all three slots

**Pass**: Header (search), scrollable content, footer all visible  
**Fail**: Any slot cut off → This is the regression we had before

---

## 3. Events (2 minutes)

### Inside Clicks
1. Open picker
2. Click header (if present)
3. Click content area
4. Click footer (if present)
5. Click scrollbar

**Pass**: All clicks do NOT close overlay  
**Fail**: Any click closes → Event shielding broken (check capture-phase handlers)

### Outside Click
1. Open picker
2. Click body at (10, 10)

**Pass**: Overlay closes immediately  
**Fail**: Stays open → Outside-click logic broken

### Escape Key
1. Open picker
2. Press `Escape`
3. Check focus location

**Pass**: Overlay closes, focus returns to trigger  
**Fail**: Stays open or focus lost → Escape handler or returnFocus broken

### Scroll Start Inside
1. Open picker with scrollable content
2. Start scroll gesture INSIDE content
3. Drag outside content area

**Pass**: Overlay stays open (scroll was inside)  
**Fail**: Closes → `downInside` flag not working (pointer events issue)

---

## 4. Focus Trap (1 minute)

### Tab Loop
1. Open picker with header + footer
2. Press `Tab` repeatedly
3. Count cycle: header inputs → content items → footer buttons → back to header

**Pass**: Focus loops within overlay  
**Fail**: Focus escapes to body → Focus trap broken

### Shift+Tab Reverse
1. Open picker
2. Press `Shift+Tab` repeatedly

**Pass**: Focus loops in reverse  
**Fail**: Focus escapes → Reverse trap broken

### Return Focus
1. Focus trigger button
2. Open picker (Space or Click)
3. Close with `Escape`

**Pass**: Focus returns to trigger button  
**Fail**: Focus goes to body or wrong element → `returnFocus` broken

---

## 5. Mobile (iOS Safari - 2 minutes)

**Required**: Real device or BrowserStack. Simulator NOT sufficient.

### Keyboard Resize
1. Open iOS Safari on iPhone
2. Tap a text input elsewhere on page to show keyboard
3. Open picker while keyboard visible

**Pass**: Overlay repositions, bottom ≤ visible viewport bottom  
**Fail**: Overlay extends under keyboard → VisualViewport listener broken

### Background Scroll Lock
1. Open picker (sheet on mobile)
2. Try to scroll page behind sheet

**Pass**: Page does NOT scroll/bounce  
**Fail**: Page scrolls → iOS scroll lock broken (check `overscroll-behavior` + touchmove)

### Sheet Drag
1. Open sheet
2. Drag handle down 50px

**Pass**: Sheet follows finger  
**Fail**: Sheet stuck → Drag handlers broken

### Sheet Dismiss
1. Open sheet
2. Drag down >100px
3. Release

**Pass**: Sheet closes smoothly  
**Fail**: Sheet stays open or glitches → Dismiss threshold broken

---

## 6. Calendar Skin (Single vs Range - 1 minute)

### Single Mode
1. Open DateField
2. Click today's date

**Visual Pass Criteria**:
✅ Selected day: Dark blue fill, white text  
✅ Today (unselected): Accent text only (light blue background)  
✅ Hover ring on unselected days  
✅ No class-name classes visible in DOM (only `.ds-calendar .data-*`)

### Range Mode
1. Open DateRangeField
2. Select start date
3. Hover middle dates
4. Select end date

**Visual Pass Criteria**:
✅ Start + End: Dark blue fill, white text  
✅ Middle band: Light blue background  
✅ Middle dates have subtle background fill connecting start/end  
✅ If start === end (same day): No middle band extension

### CSS Verification
Inspect element → Computed styles:
**Pass**: All styles come from `.ds-calendar [role="gridcell"]` or `.data-today` classes  
**Fail**: Inline styles or `.fs-*` classes → CalendarSkin not using ds-calendar.css

---

## 7. Repeat for All Pickers (3 minutes total)

Run checks 1–6 on each picker type:
- [ ] DateField
- [ ] DateRangeField
- [ ] TimeField
- [ ] SelectField
- [ ] MultiSelectField
- [ ] ColorField (if uses overlay)

**Expected**: Identical behavior across all pickers  
**Actual Difference = Bug**

---

## 🚨 Triage Script (If Anything Fails)

```js
(() => {
  const el = document.querySelector('[data-overlay="picker"]');
  if (!el) { 
    console.error('❌ FAIL: No overlay found');
    console.log('Check: Is overlay open? Is data-overlay="picker" set?');
    return; 
  }

  const cs = getComputedStyle(el);
  const content = el.querySelector('[data-role="content"]');
  const ccs = content ? getComputedStyle(content) : null;
  const rect = el.getBoundingClientRect();

  const results = {
    styleMaxH: el.style.maxHeight || '❌ MISSING',
    computedMaxH: cs.maxHeight || '❌ MISSING',
    cssVar: cs.getPropertyValue('--overlay-max-h') || '❌ MISSING',
    dataMaxH: el.getAttribute('data-max-h') || '❌ MISSING',
    contentOverflow: ccs?.overflowY || '❌ MISSING',
    contentScroll: content?.scrollHeight || '❌ MISSING',
    contentClient: content?.clientHeight || '❌ MISSING',
    bottomInView: rect.bottom <= window.innerHeight ? '✅ PASS' : '❌ FAIL',
    viewportH: window.innerHeight,
    overlayBottom: rect.bottom,
  };

  console.table(results);

  // Diagnosis
  if (!el.style.maxHeight) {
    console.error('🔍 DIAGNOSIS: Size middleware not running');
    console.log('Check: middleware array, open flag, elements reference');
  }

  if (ccs?.overflowY !== 'auto') {
    console.error('🔍 DIAGNOSIS: Content overflow broken');
    console.log('Check: .flex-1.min-h-0.overflow-auto classes on content div');
  }

  if (content && content.scrollHeight === content.clientHeight && window.innerHeight < 600) {
    console.error('🔍 DIAGNOSIS: Content not scrollable on small viewport');
    console.log('Check: min-h-0 on content div, parent flex-col');
  }

  if (rect.bottom > window.innerHeight) {
    console.error('🔍 DIAGNOSIS: Overlay extends below viewport');
    console.log('Check: Portal rendering, collision padding, transform/ancestor issues');
  }

  console.log('\n💡 Next Steps:');
  if (!el.style.maxHeight) console.log('1. Check OverlayPicker middleware setup');
  if (ccs?.overflowY !== 'auto') console.log('2. Check content div classes');
  if (rect.bottom > window.innerHeight) console.log('3. Check portal mounting to document.body');
})();
```

---

## ✅ Sign-Off Checklist

Before merging ANY overlay change:

- [ ] Ran `debugOverlay()` - all values present
- [ ] Tested 375×480 viewport - footer visible
- [ ] Tested inside clicks - overlay stays open
- [ ] Tested outside click - overlay closes
- [ ] Tested Escape - closes + returns focus
- [ ] Tested Tab loop - focus stays in overlay
- [ ] Tested on real iOS device - scroll lock works
- [ ] Verified all pickers behave identically
- [ ] Pasted `debugOverlay()` output in PR description
- [ ] No ESLint errors from overlay rules

**Time estimate**: 5–7 minutes total  
**Frequency**: Every overlay code change  
**No exceptions**: Even "trivial" CSS tweaks must pass this matrix

---

## 📝 Recording Results

Create `OVERLAY_TEST_RESULTS.md` in your PR:

```markdown
## Overlay Verification Results

**Date**: 2025-10-21  
**Changed files**: OverlayPicker.tsx  
**Change summary**: Fixed contain property

### Pre-Flight
\```
styleMaxH: 480px ✅
computedMaxH: 480px ✅
cssVar: 480px ✅
dataMaxH: 480 ✅
contentOverflow: auto ✅
contentScroll: 1200 ✅
contentClient: 480 ✅
Bottom within viewport: true ✅
\```

### Viewport Tests
- 1920×1080: ✅ PASS
- 768×1024: ✅ PASS
- 375×667: ✅ PASS
- 375×480: ✅ PASS

### Event Tests
- Inside clicks: ✅ PASS
- Outside click: ✅ PASS
- Escape key: ✅ PASS
- Scroll inside: ✅ PASS

### Focus Tests
- Tab loop: ✅ PASS
- Shift+Tab: ✅ PASS
- Return focus: ✅ PASS

### Mobile (iOS 17.5 Safari)
- Keyboard resize: ✅ PASS
- Scroll lock: ✅ PASS
- Sheet drag: ✅ PASS
- Sheet dismiss: ✅ PASS

### Calendar Skin
- Single mode: ✅ PASS
- Range mode: ✅ PASS
- CSS source: ✅ ds-calendar.css only

### All Pickers
- DateField: ✅ PASS
- DateRangeField: ✅ PASS
- TimeField: ✅ PASS
- SelectField: ✅ PASS
- MultiSelectField: ✅ PASS

**Overall**: ✅ ALL TESTS PASS
```

---

**This matrix is law. No overlay change ships without passing every check.**
