# SelectField PRD - End-to-End Implementation

**Status:** Planning  
**Priority:** High  
**Complexity:** High (Overlay + Keyboard + Virtualization)  
**Estimated Effort:** 6-8 hours

---

## 1. Executive Summary

**What**: A production-ready, accessible, mobile-optimized select field with search, keyboard navigation, and virtualization for large option lists.

**Why**: SelectField is a foundational form primitive used across all applications. Current implementation is incomplete (missing options prop, no mobile optimization, no search).

**Success Metrics**:
- WCAG 2.1 AA compliant (100% Axe score)
- Mobile sheet + desktop popover adaptive behavior
- Keyboard navigable (Arrow keys, Enter, Escape, type-ahead)
- Handles 1000+ options with virtualization (60fps scroll)
- Search/filter with < 100ms debounce
- < 5KB gzipped bundle impact

---

## 2. User Stories

### Core Functionality
- **US-1**: As a user, I can click a select field and see available options in an overlay
- **US-2**: As a user, I can search/filter options by typing
- **US-3**: As a keyboard user, I can navigate options with arrow keys
- **US-4**: As a mobile user, I see a bottom sheet instead of a dropdown
- **US-5**: As a user with 1000+ options, I can scroll smoothly without lag

### Accessibility
- **US-6**: As a screen reader user, I hear the selected value and total option count
- **US-7**: As a keyboard user, I can type-ahead to jump to options
- **US-8**: As a user, I see clear focus indicators on the selected option

### Edge Cases
- **US-9**: As a user, I can clear my selection (if optional field)
- **US-10**: As a user, I see a "no results" message when search yields nothing
- **US-11**: As a user, I can select an option with a very long label (truncation)

---

## 3. Technical Architecture

### Component Hierarchy

```
SelectField (RHF wrapper)
  ├── SelectTrigger (button showing current selection)
  ├── OverlayPicker (from DS primitives)
  │   ├── OverlaySheet (mobile)
  │   │   └── SearchInput
  │   │   └── VirtualizedList
  │   │       └── SelectOption[]
  │   └── OverlayPopover (desktop)
  │       └── SearchInput
  │       └── VirtualizedList
  │           └── SelectOption[]
  └── FormHelperText (errors/description)
```

### Data Flow

```typescript
// Props
interface SelectFieldProps {
  name: string;
  control: Control<FieldValues>;
  errors: FieldErrors;
  options: SelectOption[];  // NEW: Required
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;     // NEW: Enable search/filter
  clearable?: boolean;      // NEW: Allow clearing selection
  virtualizeThreshold?: number; // NEW: Virtualize if > N options (default: 50)
}

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;  // For option groups
}
```

### State Management

```typescript
const [isOpen, setIsOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [highlightedIndex, setHighlightedIndex] = useState(-1);

// Derived state
const filteredOptions = useMemo(() => 
  searchQuery 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options
, [options, searchQuery]);

const shouldVirtualize = filteredOptions.length > virtualizeThreshold;
```

---

## 4. Design System Primitives Used

### Existing Primitives
- `OverlayPicker` - Handles mobile/desktop adaptive overlay
- `OverlaySheet` - Mobile bottom sheet
- `OverlayPopover` - Desktop dropdown
- `FormLabel` - Field label with required indicator
- `FormHelperText` - Error/description text

### New Primitives Needed
- `VirtualizedList` - Efficient rendering for large lists (react-window or custom)
- `SearchInput` - Filter input at top of overlay
- `SelectOption` - Individual option with hover/focus states
- `SelectTrigger` - Button showing current value (chevron icon)

### CSS Classes
- `.ds-select-trigger` - Button with chevron
- `.ds-select-option` - Option row
- `.ds-select-option--highlighted` - Keyboard highlight
- `.ds-select-option--selected` - Current selection
- `.ds-select-search` - Search input styling
- `.ds-select-empty` - No results message

---

## 5. Keyboard Interactions

| Key | Action |
|-----|--------|
| **Space/Enter** | Open overlay (when trigger focused) |
| **Escape** | Close overlay |
| **Arrow Down** | Highlight next option |
| **Arrow Up** | Highlight previous option |
| **Enter** | Select highlighted option & close |
| **Home** | Jump to first option |
| **End** | Jump to last option |
| **Type ahead** | Jump to option starting with typed letter(s) |
| **Tab** | Close overlay (if open), move to next field |

---

## 6. Mobile Optimization

### Adaptive Behavior
- **Desktop** (`min-width: 768px`):
  - Popover positioned below/above trigger
  - Max height: 300px
  - Scrollable list
  
- **Mobile** (`< 768px`):
  - Bottom sheet (slides up)
  - Full-width
  - Max height: 80vh
  - Safe area insets respected

### Touch Targets
- Trigger button: 48px min height
- Options: 48px min height
- Search input: 48px min height
- Clear button: 44px × 44px touch target

---

## 7. Search/Filter

### Behavior
- Debounced input: 100ms delay
- Case-insensitive matching
- Highlights matched portion (optional)
- Shows "No results for '{query}'" when empty
- Resets highlight index to 0 on new search

### UX Flow
1. Overlay opens → search input auto-focused
2. User types → options filter in real-time
3. User presses Arrow Down → first result highlighted
4. User presses Enter → selection made, overlay closes

---

## 8. Virtualization

### When to Virtualize
- Threshold: > 50 options (configurable)
- Library: `react-window` (FixedSizeList)
- Item height: 48px
- Overscan: 3 items

### Implementation
```typescript
import { FixedSizeList } from 'react-window';

const VirtualizedList = ({ options, onSelect, selectedValue, highlightedIndex }) => (
  <FixedSizeList
    height={300}
    itemCount={options.length}
    itemSize={48}
    overscanCount={3}
  >
    {({ index, style }) => (
      <SelectOption
        key={options[index].value}
        option={options[index]}
        selected={options[index].value === selectedValue}
        highlighted={index === highlightedIndex}
        onSelect={() => onSelect(options[index])}
        style={style}
      />
    )}
  </FixedSizeList>
);
```

---

## 9. Accessibility Requirements

### ARIA Attributes
- Trigger: `role="combobox"` `aria-haspopup="listbox"` `aria-expanded`
- Listbox: `role="listbox"` `aria-label="Options"`
- Options: `role="option"` `aria-selected` `aria-disabled`
- Search: `role="searchbox"` `aria-label="Filter options"`

### Screen Reader Announcements
- On open: "{label} select, {count} options available"
- On navigate: "{option label}, {index} of {total}"
- On select: "{option label} selected"
- On search: "{count} results found"

### Focus Management
- Overlay opens → search input focused (if searchable)
- Overlay closes → trigger regains focus
- Escape → closes & returns focus
- Tab → closes & moves to next field

---

## 10. Error States

### Validation
- Required field: "This field is required"
- Custom validation: From Zod schema
- Invalid state: Red border on trigger, error text below

### Visual Indicators
- Error trigger: `border: 2px solid var(--ds-color-state-danger)`
- Error icon: Exclamation in trigger (optional)
- ARIA: `aria-invalid="true"` `aria-describedby="error-id"`

---

## 11. Edge Cases & Handling

| Scenario | Behavior |
|----------|----------|
| **Empty options array** | Show "No options available" message |
| **All options disabled** | Trigger disabled, gray state |
| **Search no results** | Show "No results for '{query}'" |
| **Very long option label** | Truncate with ellipsis, show full in title attribute |
| **Duplicate values** | Throw error in dev mode |
| **Option groups** | Render `<optgroup>` equivalent with headers |
| **Clearable + required** | Clear button hidden when required |
| **Disabled option selected** | Still show in trigger (but gray) |

---

## 12. Performance Budgets

### Bundle Size
- SelectField component: < 3KB gzipped
- VirtualizedList (react-window): ~2KB gzipped
- Total impact: < 5KB

### Runtime Performance
- Render 1000 options: < 50ms initial
- Scroll 60fps with virtualization
- Search debounce: 100ms
- Filter 10k options: < 100ms

---

## 13. Testing Strategy

### Unit Tests (Vitest)
- Renders with options
- Opens/closes overlay
- Filters options on search
- Keyboard navigation (Arrow, Enter, Escape)
- Selects option and updates form value
- Shows validation errors
- Handles clearable state

### Integration Tests (Playwright)
- Mobile: Bottom sheet opens, options selectable
- Desktop: Popover opens, positioned correctly
- Keyboard: Full navigation flow
- Screen reader: Announces correctly
- Large list: Virtualization works

### Accessibility Tests
- Axe: 100% score
- Keyboard: All interactions accessible
- Screen reader: VoiceOver/NVDA tested

---

## 14. Implementation Phases

### Phase 1: Core Functionality (2-3 hours)
- [ ] Create SelectTrigger component
- [ ] Wire up OverlayPicker
- [ ] Render basic option list
- [ ] Handle selection & close
- [ ] Connect to RHF

### Phase 2: Search & Filter (1-2 hours)
- [ ] Add SearchInput to overlay
- [ ] Implement filter logic
- [ ] Debounce input
- [ ] Show "no results" state

### Phase 3: Keyboard Navigation (2 hours)
- [ ] Arrow key navigation
- [ ] Enter to select
- [ ] Escape to close
- [ ] Type-ahead search
- [ ] Focus management

### Phase 4: Virtualization (1 hour)
- [ ] Integrate react-window
- [ ] Handle highlighted index with virtual scroll
- [ ] Test with 1000+ options

### Phase 5: Polish & Accessibility (1-2 hours)
- [ ] ARIA attributes
- [ ] Screen reader testing
- [ ] Error states
- [ ] Clearable button
- [ ] Option groups
- [ ] Storybook stories

---

## 15. API Design

### Minimal Example
```tsx
<SelectField
  name="country"
  control={control}
  errors={errors}
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
/>
```

### Full-Featured Example
```tsx
<SelectField
  name="category"
  control={control}
  errors={errors}
  label="Product Category"
  description="Choose the primary category"
  placeholder="Select a category..."
  required
  searchable
  clearable
  virtualizeThreshold={100}
  options={categories}
/>
```

### With Option Groups
```tsx
<SelectField
  name="timezone"
  control={control}
  errors={errors}
  label="Timezone"
  searchable
  options={[
    { value: 'est', label: 'Eastern Time', group: 'North America' },
    { value: 'pst', label: 'Pacific Time', group: 'North America' },
    { value: 'gmt', label: 'Greenwich Mean Time', group: 'Europe' },
    { value: 'cet', label: 'Central European Time', group: 'Europe' },
  ]}
/>
```

---

## 16. Storybook Stories

1. **Basic** - Simple select with 5 options
2. **Searchable** - With filter input
3. **Clearable** - With clear button
4. **Required** - With validation
5. **Disabled** - Entire field disabled
6. **With Error** - Showing validation error
7. **Long List** - 100 options (virtualized)
8. **Option Groups** - Grouped categories
9. **Custom Placeholder** - Custom text when empty
10. **Mobile Sheet** - Force mobile view

---

## 17. Success Criteria

### Functional
- ✅ Renders options in mobile sheet / desktop popover
- ✅ Search filters options in real-time
- ✅ Keyboard navigation works (all keys)
- ✅ Virtualizes large lists (1000+ options)
- ✅ Integrates with React Hook Form

### Accessibility
- ✅ Axe score: 100%
- ✅ All ARIA attributes correct
- ✅ Keyboard-only navigation possible
- ✅ Screen reader announces correctly

### Performance
- ✅ Bundle size < 5KB gzipped
- ✅ 60fps scroll with virtualization
- ✅ Search debounce < 100ms

### Design
- ✅ Matches DS design tokens
- ✅ Flat design (no shadows except overlay)
- ✅ Touch targets 44px minimum
- ✅ Responsive (mobile + desktop)

---

## 18. Dependencies

### New Dependencies
- `react-window` - Virtualization (~2KB)
- OR custom virtualization (if lighter weight needed)

### DS Primitives (Existing)
- OverlayPicker
- OverlaySheet
- OverlayPopover
- FormLabel
- FormHelperText

---

## 19. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Virtualization complexity** | High | Use battle-tested react-window |
| **Mobile keyboard blocking overlay** | High | Use VisualViewport API (already in OverlayPicker) |
| **Large option lists (10k+) slow** | Medium | Add search debounce, limit rendered items |
| **Option groups complicate virtualization** | Medium | Flatten list with headers, adjust indices |
| **Type-ahead conflicts with search** | Low | Disable type-ahead if searchable |

---

## 20. Open Questions

1. **Should we support multi-select in this component or separate?**
   - Decision: Separate MultiSelectField (next PRD)

2. **Custom option rendering (icons, badges)?**
   - Decision: Phase 2 - add `renderOption` prop

3. **Async options (API fetch)?**
   - Decision: Phase 3 - add `AsyncSelectField` variant

4. **Native select fallback for SEO/forms?**
   - Decision: Hidden native select for progressive enhancement

---

## 21. Rollout Plan

1. **Dev Complete**: Implement all phases
2. **Internal Testing**: QA team tests all scenarios
3. **Accessibility Audit**: External audit (if possible)
4. **Storybook Publish**: Document all variants
5. **Migration Guide**: Update existing SelectField usage
6. **Deprecate Old**: Remove incomplete implementation after 1 sprint

---

## 22. Future Enhancements (Post-v1)

- [ ] Multi-select variant (checkboxes in overlay)
- [ ] Async select (fetch options on open/search)
- [ ] Custom option templates (icons, badges, descriptions)
- [ ] Recent selections (show at top)
- [ ] Keyboard shortcuts (Cmd+K to open search)
- [ ] Option virtualization with dynamic heights
- [ ] Inline autocomplete (as-you-type suggestions)

---

**Approved By:** [TBD]  
**Start Date:** [TBD]  
**Target Completion:** [TBD]  
**Assigned To:** [TBD]
