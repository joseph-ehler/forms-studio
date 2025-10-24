# Sheet Interaction Patterns - Best Practices

**Goal**: Define optimal interaction patterns for SheetDialog (field pickers) vs SheetPanel (app-shell)

---

## 🎯 Core Philosophy

**SheetDialog** = **Modal Task** → Focus, complete, dismiss  
**SheetPanel** = **Persistent Context** → Explore, adjust, keep visible

---

## 📋 Interaction Pattern Matrix

### SheetDialog (Field Pickers)

#### **Context**
- User taps a form field (Select, Date, Color, etc.)
- User needs to pick ONE thing or complete ONE action
- User wants to get back to the form ASAP

#### **Initial State**
```
✅ RECOMMENDED:
- Open at 70-90% height (near-full)
- Show ~8-12 options immediately
- Search/filter visible in header (if applicable)
- Footer with Done/Cancel always visible
```

**Why**: Field pickers are **task-focused**. User has clear intent ("pick a color", "select a date"). They need to see options immediately without extra interaction.

#### **Interaction Flow**
```
1. Tap field
   ↓
2. Sheet opens at 90% (instant, near-full)
   ↓
3. User sees options + search
   ↓
4. User picks option OR searches
   ↓
5. Sheet closes (or Done button)
   ↓
6. Back to form, field populated
```

#### **Snap Behavior**
```
✅ DO:
- Single snap point: 90% (near-full)
- Or two snaps: 70% (default), 90% (expanded)
- Disable drag-to-dismiss (requires explicit Done/Cancel)

❌ DON'T:
- Multiple small snap points (25%, 50%, 70%, 90%)
- Allow background interaction (it's modal!)
- Drag-to-close (too easy to accidentally dismiss)
```

#### **Gesture Handling**
```
✅ DO:
- Swipe down on handle → collapse to 70% (if two snaps)
- Tap Done → close + commit
- Tap Cancel → close + revert
- Tap outside → close + revert (or nothing if modal)
- Esc key → close + revert

❌ DON'T:
- Swipe down to close (requires explicit Done)
- Tap background to close search results (frustrating)
- Auto-close on select (for multi-select, tags, etc.)
```

#### **Real-World Examples**
- **iOS Shortcuts**: Action sheet opens at ~85%, single snap
- **Apple Calendar**: Date picker opens at ~75%, focused on calendar
- **Instagram**: Location picker opens at ~80%, search prominent
- **Slack**: Emoji picker opens at ~70%, single purpose

---

### SheetPanel (App-Shell)

#### **Context**
- User is exploring a map, canvas, or primary content
- Sheet provides contextual information or controls
- User frequently switches focus between content and sheet

#### **Initial State**
```
✅ RECOMMENDED:
- Open at 25-40% height (peek)
- Show summary/preview only
- Primary content (map/canvas) remains visible and interactive
- User can expand when they need details
```

**Why**: Panels are **context-preserving**. User is exploring the map or working on canvas. The panel should enhance, not block, the primary task.

#### **Interaction Flow**
```
1. User interacts with map (tap marker, search location)
   ↓
2. Sheet opens at 30% (peek mode)
   ↓
3. User sees summary: "Coffee Shop - 0.2mi - ⭐ 4.5"
   ↓
4. User continues map exploration OR expands sheet
   ↓
5. If expanded: details, photos, reviews, directions
   ↓
6. Sheet stays open, user can collapse/expand as needed
```

#### **Snap Behavior**
```
✅ DO:
- Three snap points: 25% (peek), 50% (half), 90% (full)
- Allow background interaction at low snaps
- Drag-to-dismiss at lowest snap (flick down = close)
- Smooth transitions between snaps

❌ DON'T:
- Block background when at 25-50% (it's non-modal!)
- Auto-expand without user intent
- Use only one snap (defeats the purpose)
```

#### **Gesture Handling**
```
✅ DO:
- Tap handle → expand to next snap
- Swipe up → expand to next snap
- Swipe down → collapse to previous snap
- Fast swipe down at minimum → close
- Tap map/canvas → sheet stays (non-modal)
- Drag map at 25-50% snap → map pans (gestureRouter)

❌ DON'T:
- Require Done button (it's not a task)
- Block map interaction when sheet is visible
- Auto-close on scroll (panel is persistent)
```

#### **Real-World Examples**
- **Uber**: Map + ride options → opens at ~35%, expands to ~70%/90%
- **Apple Maps**: Directions → opens at ~30%, expandable to ~85%
- **Google Maps**: Place details → opens at ~40%, expands to ~90%
- **Lyft**: Ride pricing → opens at ~30%, swipe up for details

---

## 🎨 Detailed Interaction Specs

### SheetDialog: Field Picker Pattern

#### **Height & Snaps**
```typescript
// Single snap (simple pickers)
snap: [0.9]
initialSnap: 0.9

// Two snaps (complex pickers with search)
snap: [0.7, 0.9]
initialSnap: 0.7
```

#### **Open Behavior**
```typescript
// Opens immediately at target snap
transition: 'height 250ms cubic-bezier(0.4, 0, 0.2, 1)'
backdrop: true  // Block background
trapFocus: true  // Keyboard navigation contained
```

#### **Close Behavior**
```typescript
// Explicit close only
onClose: () => {
  if (hasChanges) {
    // Commit changes to field
    commitValue(selectedValue)
  }
  closeSheet()
}

// Cancel behavior
onCancel: () => {
  // Revert to original value
  resetValue(originalValue)
  closeSheet()
}
```

#### **Content Structure**
```
┌─────────────────────────────┐
│   [Handle - optional]       │  ← 48px hit target
├─────────────────────────────┤
│   Header: Title + Search    │  ← Always visible
├─────────────────────────────┤
│                             │
│   Scrollable Options        │  ← Grows to fill
│   (min 8-12 visible)        │
│                             │
├─────────────────────────────┤
│   Footer: [Done] [Cancel]   │  ← Always visible
└─────────────────────────────┘
```

#### **Scroll Behavior**
```typescript
// At 70% or 90%: content scrolls
// NO snap changes during scroll
// Scroll lock on body (modal)
overscrollBehavior: 'contain'
```

---

### SheetPanel: App-Shell Pattern

#### **Height & Snaps**
```typescript
// Three snaps (standard)
snap: [0.25, 0.5, 0.9]
initialSnap: 0.25  // Start small

// Two snaps (simpler cases)
snap: [0.3, 0.7]
initialSnap: 0.3
```

#### **Open Behavior**
```typescript
// Opens at peek height
transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)'
backdrop: false  // No backdrop
trapFocus: false  // Natural tab order
gestureRouter: (ctx) => {
  // Smart routing between sheet and canvas
}
```

#### **Close Behavior**
```typescript
// Closes on:
// 1. Fast swipe down at minimum snap
// 2. Explicit close button
// 3. Navigation away

// Does NOT close on:
// - Slow drag
// - Tap outside (non-modal)
// - Content scroll
```

#### **Content Structure**
```
┌─────────────────────────────┐
│   [Handle - always]         │  ← Drag affordance
├─────────────────────────────┤
│   Header: Context + Status  │  ← Summary info
├─────────────────────────────┤
│                             │
│   Scrollable Content        │  ← Details expand
│   (adapts to snap height)   │
│                             │
├─────────────────────────────┤
│   Footer: Actions (opt)     │  ← Contextual buttons
└─────────────────────────────┘
```

#### **Scroll Behavior**
```typescript
// At 25%: No scroll (fixed height, summary only)
// At 50%: Limited scroll (if content exceeds height)
// At 90%: Full scroll (like modal)

// Background remains interactive at low snaps
gestureRouter decides sheet vs canvas control
```

---

## 🎯 Decision Tree

### "Which interaction pattern should I use?"

```
Is this a form field picker?
├─ YES → SheetDialog pattern
│   ├─ Simple list (< 20 items)?
│   │   └─ Single snap at 70%
│   └─ Complex (search, categories)?
│       └─ Two snaps: 70% + 90%
│
└─ NO → Is this app-shell UI?
    ├─ YES → SheetPanel pattern
    │   ├─ Primarily info display?
    │   │   └─ Two snaps: 30% + 80%
    │   └─ Rich interaction needed?
    │       └─ Three snaps: 25% + 50% + 90%
    │
    └─ Unsure? → Default to SheetDialog
        (Safer: modal, explicit close)
```

---

## 📊 Comparative Behavior

| Aspect | SheetDialog (Field) | SheetPanel (App) |
|--------|-------------------|------------------|
| **Initial Height** | 70-90% (near-full) | 25-40% (peek) |
| **Snap Points** | 1-2 (focused) | 2-3 (flexible) |
| **Modal** | Yes (backdrop) | No (transparent) |
| **Focus Trap** | Yes | No |
| **Scroll Lock** | Yes (body) | No (background scrolls) |
| **Drag to Close** | No (explicit Done) | Yes (at min snap) |
| **Tap Outside** | Closes (or blocked) | No effect |
| **Background** | Dimmed | Visible & interactive |
| **Footer** | Always (Done/Cancel) | Optional (actions) |
| **Search** | Prominent in header | Optional |
| **Auto-close** | On selection (if single) | Never |
| **Esc Key** | Closes + reverts | Collapses → closes |
| **Purpose** | Complete a task | Explore context |

---

## 🎨 Ergonomic Considerations

### **Thumb Zones** (Critical for Mobile)

```
┌─────────────────────────────┐  ← Top: Hard to reach
│                             │
│        Hard Zone            │  ← Requires hand shift
│                             │
├─────────────────────────────┤  ← 50%: Comfortable
│                             │
│      Comfort Zone           │  ← Easy thumb reach
│                             │
├─────────────────────────────┤  ← 25%: Optimal
│                             │
│      Natural Zone           │  ← Best for frequent actions
│                             │
└─────────────────────────────┘  ← Bottom: Easiest reach
```

#### **Design Implications**

**SheetDialog (70-90%)**:
- ✅ Main action button at bottom (Done)
- ✅ Cancel at top (less frequent)
- ✅ Search at top (requires two-hand anyway)
- ✅ Most options visible (8-12)

**SheetPanel (25-50%)**:
- ✅ Summary info at top (visible at peek)
- ✅ Drag handle at top (easy to reach from 25%)
- ✅ Quick actions at bottom (when expanded)
- ✅ Details require expansion (intentional)

---

## 🎯 Specific Use Cases

### Use Case 1: Select Field (Simple List)

**Pattern**: SheetDialog with single snap

```typescript
<SheetDialog
  snap={[0.7]}
  initialSnap={0.7}
  closeOnSelect={true}  // Auto-close after selection
  footer={<PickerFooter onDone={close} onCancel={close} />}
>
  <OverlayList>
    {colors.map(color => (
      <Option
        key={color.id}
        value={color.id}
        onClick={() => selectAndClose(color)}
      >
        {color.name}
      </Option>
    ))}
  </OverlayList>
</SheetDialog>
```

**Behavior**:
- Opens at 70% immediately
- User sees 10-12 colors
- Tap color → sheet closes + value selected
- Or tap Cancel → sheet closes + no change

---

### Use Case 2: Multi-Select Field (Complex)

**Pattern**: SheetDialog with two snaps + search

```typescript
<SheetDialog
  snap={[0.7, 0.9]}
  initialSnap={0.7}
  closeOnSelect={false}  // Don't auto-close
  header={<PickerSearch value={query} onChange={setQuery} />}
  footer={<PickerFooter onDone={commitSelection} onCancel={close} />}
>
  <OverlayList>
    {filteredTags.map(tag => (
      <Option
        key={tag.id}
        selected={selected.includes(tag.id)}
        onClick={() => toggleTag(tag.id)}
      >
        {tag.name}
      </Option>
    ))}
  </OverlayList>
</SheetDialog>
```

**Behavior**:
- Opens at 70% with search visible
- User can swipe up to 90% for more options
- Tap tags to select multiple
- Tap Done → sheet closes + values committed
- Tap Cancel → sheet closes + selection reverted

---

### Use Case 3: Map + Ride Options

**Pattern**: SheetPanel with three snaps

```typescript
<SheetPanel
  snap={[0.25, 0.5, 0.9]}
  initialSnap={0.5}  // Open at half
  gestureRouter={(ctx) => {
    if (ctx.currentSnap < 0.5) return 'sheet'
    if (!ctx.isAtTop) return 'sheet'
    return 'canvas'  // Allow map pan
  }}
  header={<RideHeader route={route} />}
  footer={<Button>Request Ride</Button>}
>
  <RideOptionsList
    options={rides}
    selected={selectedRide}
    onSelect={setSelectedRide}
  />
</SheetPanel>
```

**Behavior**:
- Opens at 50% (user sees map + 2-3 ride options)
- User can drag down to 25% (peek at ETA)
- User can drag up to 90% (see all details)
- Map remains interactive at 25-50%
- Request Ride button always visible

---

### Use Case 4: Canvas + Tool Panel

**Pattern**: SheetPanel with two snaps

```typescript
<SheetPanel
  snap={[0.3, 0.7]}
  initialSnap={0.3}
  gestureRouter={(ctx) => {
    if (isDrawing) return 'canvas'
    return defaultGestureRouter(ctx)
  }}
  header={<ToolsHeader activetool={tool} />}
>
  <DrawingTools
    tools={tools}
    activeTool={tool}
    onSelect={setTool}
  />
</SheetPanel>
```

**Behavior**:
- Opens at 30% (tools visible, canvas not blocked)
- Drawing mode → canvas owns all gestures
- Panel collapsed → easy to expand for tool details
- No footer (tools are the content)

---

## ✅ Best Practices Summary

### SheetDialog (Field Pickers)

**DO**:
- ✅ Open at 70-90% (show options immediately)
- ✅ Use explicit Done/Cancel buttons
- ✅ Include search for >15 items
- ✅ Show 8-12 options without scroll
- ✅ Auto-close on selection (if single-select)
- ✅ Revert on Cancel
- ✅ Block background interaction
- ✅ Dim backdrop
- ✅ Trap focus

**DON'T**:
- ❌ Open at 25% (forces extra tap)
- ❌ Drag-to-close (accidental dismissal)
- ❌ Multiple snap points (confusing)
- ❌ Allow background interaction
- ❌ Skip Done button (unclear state)

---

### SheetPanel (App-Shell)

**DO**:
- ✅ Open at 25-40% (preserve context)
- ✅ Use 2-3 snap points
- ✅ Allow background interaction at low snaps
- ✅ Implement gesture routing
- ✅ Persist state (don't auto-close)
- ✅ Show summary at peek
- ✅ Fast swipe to close
- ✅ Natural tab order

**DON'T**:
- ❌ Open at 90% (blocks content)
- ❌ Require Done button (not a task)
- ❌ Block background always
- ❌ Auto-close on interaction
- ❌ Use backdrop
- ❌ Trap focus

---

## 🎓 Mental Model

**Think of it this way**:

**SheetDialog** = **iOS Action Sheet / Alert**
- User must complete action before continuing
- Explicit choice + explicit dismiss
- Focused, task-oriented
- "Pick one, then move on"

**SheetPanel** = **Apple Maps / Uber Panel**
- User explores, adjusts, iterates
- Implicit interaction, flexible height
- Context-aware, supportive
- "Available when needed, out of way otherwise"

---

## 📐 Technical Implementation

### Snap Point Recommendations

```typescript
// SheetDialog (Field Pickers)
const FIELD_PICKER_SNAPS = {
  simple: [0.7],           // Single list
  complex: [0.7, 0.9],     // List + search
  calendar: [0.75],        // Date picker
  color: [0.65],           // Color grid
}

// SheetPanel (App-Shell)
const APP_PANEL_SNAPS = {
  minimal: [0.25, 0.8],    // Peek + full
  standard: [0.25, 0.5, 0.9],  // Peek + half + full
  rich: [0.15, 0.4, 0.7, 0.95],  // Multiple levels (rare)
}
```

---

## 🎯 Recommendation Summary

**For your question specifically**:

> "For a sheet panel when clicked should extend to 70-90% automatically - no scroll"

**Answer**: **It depends on the type**:

1. **Field Picker (SheetDialog)**: YES ✅
   - Open at 70-90% automatically
   - Show options immediately
   - User completes task quickly

2. **App Panel (SheetPanel)**: NO ❌
   - Open at 25-40% (peek)
   - Preserve background context
   - User expands when they want details

The key insight: **Field pickers are tasks, panels are tools.**

---

**Bottom line**: Your instinct is correct—field pickers should behave more like dialogs (focused, near-full), while app panels should behave more like persistent UI (subtle, expandable). The interaction patterns should reflect this fundamental difference in purpose.
