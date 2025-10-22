# Phase 3: Unified Overlay Rollout Guide

**Status:** ✅ Phase 2 Complete (SelectField + MultiSelectField)  
**Next:** Systematic rollout to all picker fields

---

## 🎯 **Goal**

Every picker-style field uses the same overlay primitives with:
- ✅ Sheet on mobile (<768px)
- ✅ Popover on desktop (>768px)
- ✅ Consistent search pattern
- ✅ Same A11y/keyboard handling
- ✅ Footer always visible (no cut-off!)

---

## 🛠️ **New Utilities (Phase 3a)**

### **overlay-utils.ts** - Prevents Height Issues

```typescript
import { calculateOverlayHeights, getOverlayContentStyles } from '@/components/overlay'

// Calculate heights to ensure footer visibility
const heights = calculateOverlayHeights({
  maxHeight: 560,
  hasSearch: true,
  hasFooter: true,
})

// Returns:
// {
//   containerMaxHeight: 560,
//   contentMaxHeight: 452,  // 560 - 60 (search) - 48 (footer)
//   searchHeight: 60,
//   footerHeight: 48
// }

// Get inline styles for flexbox layout
const styles = getOverlayContentStyles(heights)
```

**Why This Matters:**
- ✅ No more cut-off footers
- ✅ Consistent calculations across all fields
- ✅ Maintainable in one place
- ✅ Validates config and warns about issues

---

## 📋 **Rollout Order**

### **Phase 3b: Date/Time/Range (Fast Win) ⏰**
**Effort:** Low | **Impact:** High | **Risk:** Low

**Current:** Uses Headless UI popovers  
**Target:** OverlayPositioner/Sheet with day picker inside

**Pattern:**
```tsx
<OverlayPickerCore closeOnSelect={true}>
  {({ isOpen, open, close, triggerRef, contentRef }) => (
    <>
      <button ref={triggerRef} onClick={() => isOpen ? close() : open()}>
        {selectedDate || 'Select date...'}
      </button>

      {isOpen && (
        isMobile ? (
          <OverlaySheet
            open={isOpen}
            onClose={close}
            header={<PickerSearch ... />} // Optional month search
          >
            <DayPicker ... />
          </OverlaySheet>
        ) : (
          <OverlayPositioner open={isOpen} anchor={triggerRef.current}>
            {({ refs, floatingStyles }) => (
              <div ref={refs.setFloating} style={{...floatingStyles, ...layoutStyles}}>
                <DayPicker ... />
              </div>
            )}
          </OverlayPositioner>
        )
      )}
    </>
  )}
</OverlayPickerCore>
```

**DateRange Specifics:**
- Add footer: `<div className="flex-shrink-0">{Clear}{Done}</div>`
- `closeOnSelect: false` (need to pick start + end)
- Done button calls `field.onChange([startDate, endDate])`

**Files to Update:**
- `src/fields/DateField.tsx`
- `src/fields/TimeField.tsx`
- `src/fields/DateRangeField.tsx`

---

### **Phase 3c: Phone/Address (Shared Components) 📞**
**Effort:** Medium | **Impact:** High | **Risk:** Low

**Current:** Uses Listbox  
**Target:** PickerList + PickerOption with search

**Shared Components to Create:**

**1. CountryList.tsx**
```tsx
export const CountryList = ({ selected, onSelect, searchable = true }) => {
  const [query, setQuery] = useState('')
  
  const filtered = countries.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      {searchable && <PickerSearch value={query} onChange={setQuery} />}
      <PickerList>
        {filtered.map(country => (
          <PickerOption
            key={country.code}
            value={country.code}
            selected={country.code === selected}
            onClick={() => onSelect(country)}
          >
            <span className="text-xl mr-2">{country.flag}</span>
            {country.name} ({country.dialCode})
          </PickerOption>
        ))}
      </PickerList>
    </>
  )
}
```

**2. StateList.tsx**
```tsx
export const StateList = ({ country, selected, onSelect }) => {
  const states = getStatesForCountry(country)
  const [query, setQuery] = useState('')
  
  // Similar to CountryList
}
```

**PhoneField Pattern:**
```tsx
// Trigger opens country picker
<OverlayPickerCore closeOnSelect={true}>
  {/* ... */}
  <CountryList selected={country} onSelect={setCountry} />
</OverlayPickerCore>
```

**AddressField Pattern:**
```tsx
// State field opens state picker
<OverlayPickerCore closeOnSelect={true}>
  {/* ... */}
  <StateList country="US" selected={state} onSelect={setState} />
</OverlayPickerCore>
```

**Files to Update:**
- `src/fields/PhoneField.tsx`
- `src/fields/AddressField.tsx`
- `src/components/picker/CountryList.tsx` (new)
- `src/components/picker/StateList.tsx` (new)

---

### **Phase 3d: Color/TagInput (Advanced) 🎨**
**Effort:** Medium | **Impact:** Medium | **Risk:** Medium

**ColorField Pattern:**
```tsx
<OverlayPickerCore closeOnSelect={false}>
  {/* ... */}
  <OverlaySheet header={<ColorPreview color={selected} />}>
    <Tabs>
      <TabPanel id="palette">
        <PaletteGrid 
          colors={presets} 
          onClick={(c) => { 
            e.stopPropagation() // CRITICAL!
            setColor(c) 
          }} 
        />
      </TabPanel>
      <TabPanel id="custom">
        <Input 
          type="color" 
          onClick={e => e.stopPropagation()} // CRITICAL!
          onChange={e => setColor(e.target.value)}
        />
      </TabPanel>
    </Tabs>
    
    <div className="flex-shrink-0">{Done}</div>
  </OverlaySheet>
</OverlayPickerCore>
```

**TagInputField Pattern:**
```tsx
<OverlayPickerCore closeOnSelect={false}>
  {/* ... */}
  <OverlayPositioner>
    <PickerSearch value={query} onChange={setQuery} />
    <PickerList>
      {suggestions.map(tag => (
        <PickerOption onClick={() => addTag(tag)}>
          {tag}
        </PickerOption>
      ))}
    </PickerList>
  </OverlayPositioner>
</OverlayPickerCore>
```

**Files to Update:**
- `src/fields/ColorField.tsx`
- `src/fields/TagInputField.tsx`

---

## 🔧 **Migration Checklist (Per Field)**

Use this for **EVERY** field you migrate:

### **Layout & Height**
- [ ] Import `calculateOverlayHeights` utility
- [ ] Calculate heights based on config: `const heights = calculateOverlayHeights({...})`
- [ ] Apply flexbox layout:
  - Container: `flex flex-col` with `maxHeight`
  - Search: `flex-shrink-0`
  - Content: `flex-1 overflow-y-auto min-h-0` with calculated `maxHeight`
  - Footer: `flex-shrink-0`

### **Mobile (Sheet)**
- [ ] Opens as full/half-screen sheet
- [ ] Footer visible at ALL scroll positions
- [ ] Drag handle works
- [ ] Safe area insets respected (`paddingBottom: env(safe-area-inset-bottom)`)
- [ ] Virtual keyboard doesn't hide footer

### **Desktop (Popover)**
- [ ] Floating UI collision works (top/bottom/left/right edges)
- [ ] `sameWidth` matches trigger width
- [ ] Content scrollable
- [ ] Footer fixed at bottom
- [ ] `maxHeight` respected

### **Search**
- [ ] Clickable (doesn't close overlay)
- [ ] Clearable (× button works)
- [ ] `stopPropagation()` on all events
- [ ] Filters options quickly
- [ ] Debounced (300ms)

### **A11y**
- [ ] Trigger: `role="combobox"`, `aria-expanded`, `aria-controls`
- [ ] List: `role="listbox"`, multi → `aria-multiselectable="true"`
- [ ] Options: `role="option"`, `aria-selected`
- [ ] Focus trap enabled
- [ ] Return focus on close
- [ ] ESC closes overlay
- [ ] Keyboard navigation (arrows)

### **JSON Config**
- [ ] `ui.presentation` drives behavior
- [ ] `ui.search` enables/disables search
- [ ] `ui.closeOnSelect` works correctly
- [ ] `ui.sameWidth` applies on desktop
- [ ] `ui.offset` adjusts spacing
- [ ] `ui.maxHeight` constrains size
- [ ] Defaults work without JSON

### **Events**
- [ ] All buttons have `stopPropagation()` on `onClick` and `onMouseDown`
- [ ] Search input has `stopPropagation()`
- [ ] Clear button has `stopPropagation()`
- [ ] Done button has `stopPropagation()`
- [ ] Custom inputs (color picker, etc.) have `stopPropagation()`

---

## 🧪 **Testing Protocol**

### **Visual Test**
1. Open field at **top** of page → Footer visible?
2. Open field at **bottom** of page → Footer visible?
3. Open field in **middle** → Footer visible?
4. **Resize window** smaller → Footer still visible?
5. Open virtual keyboard (mobile) → Footer visible?

### **Interaction Test**
1. Click search → Can type?
2. Click clear → Clears?
3. Click option → Selects?
4. Click Done → Closes?
5. Click outside → Closes?
6. Press ESC → Closes?

### **A11y Test**
1. Tab to trigger → Focus visible?
2. Enter/Space → Opens?
3. Arrow keys → Navigate options?
4. ESC → Closes and returns focus?
5. Screen reader → Announces properly?

---

## 📦 **Commit Strategy**

### **Commit 1: Phase 3a - Utilities**
```bash
git add src/components/overlay/overlay-utils.ts
git add src/components/overlay/index.ts
git commit -m "feat: Phase 3a - Add overlay height calculation utilities

Prevents footer cut-off issues by:
- calculateOverlayHeights() - Explicit height math
- getOverlayContentStyles() - Flexbox layout helpers
- validateOverlayConfig() - Warn about issues

These utilities ensure consistent overlay layouts across
all picker fields and prevent the flexbox height bugs
we encountered in Phase 2.

Phase 3a: ✅ COMPLETE"
```

### **Commit 2: Phase 3b - Date/Time/Range**
```bash
git add src/fields/DateField.tsx
git add src/fields/TimeField.tsx  
git add src/fields/DateRangeField.tsx
git commit -m "feat: Phase 3b - Migrate Date/Time/Range to unified overlays

- DateField: Sheet on mobile, popover on desktop
- TimeField: Same pattern as DateField
- DateRangeField: Footer with Clear/Done buttons
- All use calculateOverlayHeights()

Phase 3b: ✅ COMPLETE"
```

### **Commit 3: Phase 3c - Phone/Address**
```bash
git add src/fields/PhoneField.tsx
git add src/fields/AddressField.tsx
git add src/components/picker/CountryList.tsx
git add src/components/picker/StateList.tsx
git commit -m "feat: Phase 3c - Migrate Phone/Address to unified overlays

New shared components:
- CountryList: Flags + names + dial codes
- StateList: States/provinces by country

Both fields now use:
- PickerList + PickerOption
- PickerSearch with debounce
- Mobile-first responsive

Phase 3c: ✅ COMPLETE"
```

### **Commit 4: Phase 3d - Color/TagInput**
```bash
git add src/fields/ColorField.tsx
git add src/fields/TagInputField.tsx
git commit -m "feat: Phase 3d - Migrate Color/TagInput to unified overlays

ColorField:
- Tabs: Palette | Custom
- stopPropagation on all inputs
- Preview swatch in header

TagInputField:
- Suggestion popover
- Enter/comma adds chip
- Done button applies

Phase 3d: ✅ COMPLETE
Phase 3: ✅ ALL PICKER FIELDS MIGRATED!"
```

---

## 🎯 **Success Metrics**

**Code:**
- ✅ All picker fields use unified overlay
- ✅ No Headless UI left in fields
- ✅ Consistent height calculations
- ✅ DRY (no duplicated overlay logic)

**UX:**
- ✅ Footer always visible (0 cut-off reports)
- ✅ Native OS feel on all devices
- ✅ Smooth animations (300ms)
- ✅ Fast search (<100ms filter)

**Bundle:**
- Target: <350KB ESM (currently 304KB)
- Removing Headless UI may save ~20-30KB

**A11y:**
- ✅ WCAG 2.1 AA compliant
- ✅ Screen reader friendly
- ✅ Keyboard navigable
- ✅ Focus management correct

---

## 🚀 **Next: Phase 4**

Once Phase 3 is complete, move to:
- Skeletons (loading states)
- Virtualization (1000+ items)
- SR announcer (selection feedback)
- Analytics hooks
- Autosave (opt-in)

**Ready to roll! Let's migrate these fields systematically.** 🎯
