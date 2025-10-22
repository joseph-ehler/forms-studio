# Unified Overlay System - Implementation Plan

**Status:** 🚧 In Progress  
**Branch:** `feat/unified-overlay-system`  
**Start Date:** October 21, 2025

---

## 🎯 **Goal**

Create a unified overlay foundation for all picker-style fields:
- SelectField, MultiSelectField
- DateField, TimeField, DateRangeField
- PhoneField (country picker)
- AddressField (state/country)
- ColorField
- TagInputField

**Benefits:**
- One primitive for all pickers (DRY)
- Consistent UX across all fields
- Mobile-first by default
- JSON-configurable
- Bulletproof positioning (Floating UI)
- Better accessibility

---

## 📦 **Architecture**

### **Core Primitives:**

1. **OverlayPickerCore** - State management, focus trap, keyboard handling
2. **OverlayPositioner** - Floating UI integration, collision detection
3. **OverlaySheet** - Mobile sheet with drag, snap points, safe areas
4. **PickerList** - Virtualized list container
5. **PickerOption** - List item with selection states
6. **PickerSearch** - Sticky search bar with debounce
7. **PickerEmptyState** - Empty state messaging

### **Props Interface:**

```typescript
type OverlayPickerProps = {
  // Control
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, reason?: 'select'|'escape'|'outside'|'programmatic') => void

  // Presentation
  presentation?: 'sheet' | 'popover' | 'modal'  // auto: sheet on mobile
  sameWidth?: boolean                           // match trigger width
  maxHeight?: number                            // default ~70vh
  density?: 'cozy' | 'compact'
  elevation?: 'base' | 'raised'

  // Positioning (Floating UI)
  placement?: 'bottom-start' | 'bottom' | 'top-start' | ...
  offset?: number                               // default 6
  strategy?: 'fixed' | 'absolute'               // default 'fixed'
  collision?: { flip?: boolean; shift?: boolean; size?: boolean }

  // Behavior
  closeOnSelect?: boolean                       // true for single, false for multi
  searchable?: boolean
  virtualizeAfter?: number                      // e.g. 50
  trapFocus?: boolean                           // default true
  returnFocus?: boolean                         // default true
  allowOutsideScroll?: boolean                  // default false

  // Slots
  trigger: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  emptyState?: React.ReactNode
  children: React.ReactNode
}
```

### **JSON Configuration:**

```json
{
  "ui": {
    "presentation": "sheet",
    "sameWidth": true,
    "offset": 6,
    "maxHeight": 560,
    "density": "cozy",
    "search": true,
    "virtualizeAfter": 50,
    "closeOnSelect": false,
    "elevation": "raised"
  }
}
```

---

## 🗺️ **Implementation Phases**

### **Phase 1: Foundation** ⏳ In Progress
- [x] Create branch `feat/unified-overlay-system`
- [ ] Install `@floating-ui/react`
- [ ] Create `src/components/overlay/OverlayPickerCore.tsx`
- [ ] Create `src/components/overlay/OverlayPositioner.tsx`
- [ ] Create `src/components/overlay/OverlaySheet.tsx`
- [ ] Create `src/components/picker/PickerList.tsx`
- [ ] Create `src/components/picker/PickerOption.tsx`
- [ ] Create `src/components/picker/PickerSearch.tsx`
- [ ] Create `src/components/picker/PickerEmptyState.tsx`
- [ ] Create barrel exports

### **Phase 2: Pilot** ⏸️ Pending
- [ ] Refactor `SelectField` to use new overlay
- [ ] Refactor `MultiSelectField` to use new overlay
- [ ] Test keyboard navigation (Tab, Enter, Escape, Arrows)
- [ ] Test touch interactions (tap, swipe, scroll)
- [ ] Test screen readers (VoiceOver, NVDA)
- [ ] Test collision detection (viewport edges)
- [ ] Verify build stays green
- [ ] Get feedback on UX/API

### **Phase 3: Rollout** ⏸️ Pending
Apply to remaining fields one by one:
- [ ] DateField
- [ ] TimeField
- [ ] DateRangeField
- [ ] PhoneField (country picker)
- [ ] AddressField (state/country lists)
- [ ] ColorField (palette popover)
- [ ] TagInputField (suggestion popover)

### **Phase 4: Polish** ⏸️ Pending
- [ ] Virtualization for large lists (>50 items)
- [ ] Global SR announcer for selection feedback
- [ ] Body scroll lock utility
- [ ] Performance testing (1000+ items)
- [ ] Reduced motion support
- [ ] Documentation
- [ ] Commit & merge to main

---

## 🔧 **Technical Details**

### **Dependencies:**
- `@floating-ui/react` - Positioning engine
- Existing: `react`, `react-dom`, `react-hook-form`

### **Integration Points:**
- **DS Shims:** Use existing `Stack`, `Flex` for layout
- **Typography:** Respect existing typography system
- **RHF:** No changes, overlay only affects presentation
- **JSON:** Extend field JSON with `ui.*` keys

### **Defaults (Mobile-First):**
```typescript
const defaults = {
  presentation: 'sheet',      // on <768px
  offset: 6,
  strategy: 'fixed',
  closeOnSelect: false,       // for multi-select
  searchable: true,
  trapFocus: true,
  returnFocus: true,
  allowOutsideScroll: false,
  collision: { flip: true, shift: true, size: true }
}
```

### **Device Detection:**
```typescript
// Use existing hook
const { isMobile } = useDeviceType()

const presentation = props.presentation ?? (isMobile ? 'sheet' : 'popover')
```

---

## 🧪 **Testing Matrix**

### **Interactions:**
- [ ] Open via click
- [ ] Open via keyboard (Enter/Space)
- [ ] Close via select (if closeOnSelect)
- [ ] Close via Escape
- [ ] Close via outside click
- [ ] Return focus after close

### **Positioning:**
- [ ] Collision at top edge
- [ ] Collision at bottom edge
- [ ] Collision at left/right edges
- [ ] sameWidth matches trigger
- [ ] maxHeight constrains content

### **Mobile:**
- [ ] Sheet slides in from bottom
- [ ] Drag handle visible
- [ ] Swipe to dismiss works
- [ ] Keyboard doesn't break layout (visualViewport)
- [ ] Safe area insets respected

### **Accessibility:**
- [ ] Trigger has role="combobox"
- [ ] List has role="listbox"
- [ ] Options have role="option"
- [ ] aria-selected on selected items
- [ ] aria-expanded on trigger
- [ ] Screen reader announces selections
- [ ] Keyboard navigation works

### **Performance:**
- [ ] Virtualization at 50+ items
- [ ] Smooth scrolling
- [ ] No layout thrashing
- [ ] Fast open/close (<16ms)

---

## 📝 **Files Created**

### **Core:**
- `src/components/overlay/OverlayPickerCore.tsx` (state, focus trap)
- `src/components/overlay/OverlayPositioner.tsx` (Floating UI)
- `src/components/overlay/OverlaySheet.tsx` (mobile sheet)
- `src/components/overlay/index.ts` (exports)

### **Picker Primitives:**
- `src/components/picker/PickerList.tsx`
- `src/components/picker/PickerOption.tsx`
- `src/components/picker/PickerSearch.tsx`
- `src/components/picker/PickerEmptyState.tsx`
- `src/components/picker/index.ts` (exports)

### **Utilities:**
- `src/utils/scroll-lock.ts` (body scroll locking)
- `src/utils/sr-announcer.ts` (screen reader announcements)

### **Documentation:**
- `OVERLAY_SYSTEM_PLAN.md` (this file)
- `docs/OVERLAY_SYSTEM.md` (user-facing docs)

---

## 🎯 **Success Criteria**

**Phase 1:**
- All primitives compile
- No TypeScript errors
- Exports work correctly

**Phase 2:**
- SelectField & MultiSelectField work perfectly
- All tests pass
- Build stays green
- UX feels consistent

**Phase 3:**
- All picker fields migrated
- No regressions
- Bundle size reasonable (<10KB increase)

**Phase 4:**
- Virtualization works
- Performance metrics good
- Documentation complete
- Ready for v0.4.0

---

## 📊 **Progress Tracking**

**Overall:** 5% (Branch created, plan documented)

**Phase 1:** 10% (Branch + plan)  
**Phase 2:** 0%  
**Phase 3:** 0%  
**Phase 4:** 0%

---

## 🚀 **Next Steps**

1. Install `@floating-ui/react`
2. Create `OverlayPickerCore.tsx`
3. Create `OverlayPositioner.tsx`
4. Create `OverlaySheet.tsx`
5. Create picker primitives
6. Test in isolation
7. Integrate with SelectField

**Let's build this!** 🎯
