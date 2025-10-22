# 📋 Overlay System - Field Authors Guide

**Paste this in `CONTRIBUTING.md`. These rules are enforced by ESLint.**

---

## ✅ Do

### 1. Use OverlayPicker with Slots Only
```tsx
// ✅ CORRECT
import { OverlayPicker, PickerFooter } from '../components/overlay'

<OverlayPicker
  open={open}
  anchor={triggerRef.current}
  onOpenChange={setOpen}
  header={<PickerSearch value={query} onChange={setQuery} />}
  content={<YourListComponent />}
  footer={<PickerFooter onClear={clear} onDone={done} />}
/>
```

**Why**: The primitive owns ALL positioning, events, focus, and layout. You only provide content.

### 2. Use CalendarSkin for Anything DayPicker-Related
```tsx
// ✅ CORRECT
import { CalendarSkin } from '../components/overlay'

<CalendarSkin
  mode="single"
  selected={value}
  onSelect={setValue}
/>
```

**Why**: CalendarSkin imports `ds-calendar.css` once. No class guessing, no manual styling.

### 3. Use PickerFooter (No Custom Clear/Done)
```tsx
// ✅ CORRECT
import { PickerFooter } from '../components/overlay'

<PickerFooter
  onClear={() => field.onChange(null)}
  onDone={() => setOpen(false)}
/>
```

**Why**: Consistent button layout, event shielding, and a11y are baked in.

### 4. Emit Updates, Let Caller Close
```tsx
// ✅ CORRECT
<PickerOption
  value={optValue}
  onClick={() => {
    field.onChange(optValue)
    // Let OverlayPickerCore handle closing via closeOnSelect
  }}
>
  {label}
</PickerOption>
```

**Why**: Separation of concerns. Field updates state, overlay manages visibility.

### 5. Keep Triggers Simple
```tsx
// ✅ CORRECT
<button
  ref={triggerRef}
  type="button"
  onClick={() => setOpen(!open)}
  aria-haspopup="listbox"
  aria-expanded={open}
>
  {displayValue || placeholder}
</button>
```

**Why**: OverlayPicker handles the overlay. Trigger is just a button.

---

## ❌ Don't

### 1. Don't Import DayPicker CSS Anywhere
```tsx
// ❌ WRONG
import 'react-day-picker/dist/style.css'
import './custom-calendar.css'

<DayPicker classNames={{ day: 'my-custom-class' }} />
```

**Why**: Creates CSS conflicts, breaks calendar skin centralization.  
**Fix**: Use `<CalendarSkin>` which imports `ds-calendar.css` once.

### 2. Don't Mount Your Own Fixed/Absolute Overlays
```tsx
// ❌ WRONG
<div
  className="fixed top-0 left-0 z-50"
  style={{ 
    top: `${anchorRect.bottom}px`,
    left: `${anchorRect.left}px`
  }}
>
  {content}
</div>
```

**Why**: Breaks portal, z-index, collision detection, event handling.  
**Fix**: Use `<OverlayPicker>` which handles positioning via Floating UI.

### 3. Don't Add Manual Flex Wrappers
```tsx
// ❌ WRONG
<div className="flex flex-col max-h-[560px]">
  <div className="flex-shrink-0">Header</div>
  <div className="flex-1 min-h-0 overflow-auto">Content</div>
  <div className="flex-shrink-0">Footer</div>
</div>
```

**Why**: OverlayPicker already does this. Duplicating creates bugs.  
**Fix**: Pass `header`, `content`, `footer` props to OverlayPicker.

### 4. Don't Attach Your Own Outside-Click Logic
```tsx
// ❌ WRONG
useEffect(() => {
  const handleClick = (e) => {
    if (!containerRef.current?.contains(e.target)) {
      setOpen(false)
    }
  }
  document.addEventListener('mousedown', handleClick)
  return () => document.removeEventListener('mousedown', handleClick)
}, [])
```

**Why**: Conflicts with OverlayPicker's pointer events, causes double-close bugs.  
**Fix**: Use `onOpenChange` prop on OverlayPicker.

### 5. Don't Rely on mousedown - Always Pointer Events
```tsx
// ❌ WRONG
<div onMouseDown={handleClick}>

// ✅ CORRECT
<div onPointerDown={handleClick}>
```

**Why**: Touch devices and pen inputs don't fire mouse events.  
**Fix**: OverlayPicker uses pointer events internally. If you need custom handlers, use pointer events.

### 6. Don't Override Event Propagation Inside Slots
```tsx
// ❌ WRONG
<div
  onClick={(e) => {
    e.stopPropagation() // Don't do this!
    handleClick()
  }}
>
```

**Why**: OverlayPicker's event shielding is already in place.  
**Fix**: Just call your handler. The primitive handles propagation.

### 7. Don't Hardcode Z-Index Values
```tsx
// ❌ WRONG
<div style={{ zIndex: 9999 }}>

// ✅ CORRECT
import { getZIndex } from '../components/overlay/tokens'

<div style={{ zIndex: getZIndex('overlay') }}>
```

**Why**: Z-index tokens are centralized. Hardcoding creates stacking bugs.  
**Fix**: Use `tokens.ts` helpers.

### 8. Don't Import Overlay Primitives Piecemeal
```tsx
// ❌ WRONG
import { OverlayPicker } from '../components/overlay/OverlayPicker'
import { PickerFooter } from '../components/overlay/PickerFooter'

// ✅ CORRECT
import { OverlayPicker, PickerFooter } from '../components/overlay'
```

**Why**: Barrel export ensures correct bundling and tree-shaking.  
**Fix**: Import from `../components/overlay` index.

---

## 🔧 Common Patterns

### Pattern: Select Field with Search
```tsx
import { OverlayPicker, PickerSearch, PickerList, PickerOption } from '../components/overlay'

<OverlayPicker
  open={open}
  anchor={triggerRef.current}
  onOpenChange={(o) => setOpen(o)}
  header={
    <PickerSearch
      value={query}
      onChange={setQuery}
      placeholder="Type to search..."
    />
  }
  content={
    <PickerList>
      {filteredOptions.map(opt => (
        <PickerOption
          key={opt.value}
          value={opt.value}
          selected={opt.value === field.value}
          onClick={() => {
            field.onChange(opt.value)
            setOpen(false)
          }}
        >
          {opt.label}
        </PickerOption>
      ))}
    </PickerList>
  }
/>
```

### Pattern: Date Picker
```tsx
import { OverlayPicker, CalendarSkin, PickerFooter } from '../components/overlay'

<OverlayPicker
  open={open}
  anchor={triggerRef.current}
  onOpenChange={setOpen}
  content={
    <CalendarSkin
      mode="single"
      selected={field.value}
      onSelect={(date) => {
        field.onChange(date)
        setOpen(false)
      }}
    />
  }
  footer={
    <PickerFooter
      onClear={() => field.onChange(null)}
      onDone={() => setOpen(false)}
    />
  }
/>
```

### Pattern: Date Range Picker
```tsx
import { OverlayPicker, CalendarSkin, PickerFooter } from '../components/overlay'

<OverlayPicker
  open={open}
  anchor={triggerRef.current}
  onOpenChange={setOpen}
  content={
    <CalendarSkin
      mode="range"
      selected={field.value} // { from, to }
      onSelect={field.onChange}
      numberOfMonths={2}
    />
  }
  footer={
    <PickerFooter
      onClear={() => field.onChange({ from: null, to: null })}
      onDone={() => setOpen(false)}
    />
  }
/>
```

### Pattern: Color Picker
```tsx
import { OverlayPicker } from '../components/overlay'
import { HexColorPicker } from 'react-colorful'

<OverlayPicker
  open={open}
  anchor={triggerRef.current}
  onOpenChange={setOpen}
  content={
    <HexColorPicker
      color={field.value}
      onChange={field.onChange}
    />
  }
/>
```

---

## 🧪 Testing Your Field

Before submitting a PR:

1. **Run debugOverlay()** in console
   ```js
   import { debugOverlay } from '../components/overlay'
   debugOverlay()
   ```

2. **Test tiny viewport** (375×480)
   - Footer must be visible
   - Content must scroll
   - Overlay bottom ≤ viewport bottom

3. **Test events**
   - Click inside: stays open
   - Click outside: closes
   - Escape: closes + returns focus
   - Tab: loops within overlay

4. **Test mobile** (real device or BrowserStack)
   - iOS scroll lock works
   - Keyboard doesn't hide overlay bottom
   - Sheet drag & dismiss works

5. **Verify no ESLint errors**
   ```bash
   npm run lint
   ```

---

## 🚫 ESLint Will Block

These violations fail CI:

❌ `import 'react-day-picker/dist/style.css'` outside CalendarSkin  
❌ `import { DayPicker }` directly (use CalendarSkin)  
❌ Manual `position: fixed` overlays  
❌ Manual `.flex-1.min-h-0.overflow-auto` scroll containers  
⚠️  `mousedown` listeners (should be `pointerdown`)

---

## 📖 Reference

- **Tokens**: `src/components/overlay/tokens.ts`
- **Primitives**: `src/components/overlay/`
- **Debug**: `src/components/overlay/debug.ts`
- **Verification Matrix**: `OVERLAY_VERIFICATION_MATRIX.md`
- **Hardening Docs**: `OVERLAY_1000_PERCENT.md`

---

## 💡 When in Doubt

**Ask yourself**: "Am I recreating something OverlayPicker already does?"

If yes → use the primitive.  
If no → you probably still need the primitive, you just haven't read the docs yet.

**The rule**: Fields provide content, OverlayPicker handles everything else.

---

## 🎯 One-Liner Summary

> **Use OverlayPicker with slots. Use CalendarSkin for calendars. Use PickerFooter for footers. Don't manually position, style, or handle events. Ever.**
