# Sheet Content Areas - Implementation Guide

## **Architecture Overview**

Sheet uses **Vaul Drawer** (Emil Kowalski's drawer library) as the underlying engine and adds:
- Slot-based layout (Header/Content/Footer)
- Semantic state machine (peek/work/owned)
- Design token styling
- Footer auto-reveal logic

---

## **How Content Flows Through Sheet**

### **1. You Pass Children**

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Example">
  <Sheet.Header>
    <div style={{ padding: '16px 24px' }}>
      <h3>Title</h3>
    </div>
  </Sheet.Header>
  
  <Sheet.Content>
    <div style={{ padding: '24px' }}>
      <p>Body text...</p>
    </div>
  </Sheet.Content>
  
  <Sheet.Footer>
    <div style={{ padding: '16px 24px' }}>
      <button>Action</button>
    </div>
  </Sheet.Footer>
</Sheet>
```

### **2. Sheet Detects Slots**

**Code:** `Sheet.tsx` lines 650-667

```tsx
let headerNode: ReactNode = null;
let contentNode: ReactNode = null;
let footerNode: ReactNode = null;
let hasSlots = false;

Children.forEach(children, (child) => {
  const slot = (isValidElement(child) && (child.type as any)?.$$slot) || null;
  if (slot === 'sheet-header') {
    headerNode = child;
    hasSlots = true;
  } else if (slot === 'sheet-content') {
    contentNode = child;
    hasSlots = true;
  } else if (slot === 'sheet-footer') {
    footerNode = child;
    hasSlots = true;
  }
});

// Fallback: If no slots detected, wrap all children as content
if (!hasSlots) {
  contentNode = <div className="ds-sheet-body">{children}</div>;
}
```

**How it works:**
- Each slot component (`Sheet.Header`, `Sheet.Content`, `Sheet.Footer`) has a `$$slot` marker
- Sheet loops through children and detects these markers
- If NO slots found → wraps everything in `.ds-sheet-body` (legacy mode)

### **3. Sheet Renders Structure**

**Code:** `Sheet.tsx` lines 686-733

```tsx
<Drawer.Root {...vaulProps}>
  <Drawer.Portal>
    <Drawer.Overlay className="ds-sheet-overlay" />
    
    <Drawer.Content className="ds-sheet-content">
      {/* Hidden ARIA labels */}
      <Drawer.Title className="sr-only">{ariaLabel}</Drawer.Title>
      <Drawer.Description className="sr-only">{ariaLabel}</Drawer.Description>
      
      {/* Drag handle */}
      <div className="ds-sheet-handle" />
      
      {/* Your content slots */}
      {headerNode}
      {contentNode}
      {footerShouldShow && footerNode}
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
```

**Structure:**
```
Drawer.Root (Vaul state machine)
├── Drawer.Portal (renders to document.body)
│   ├── Drawer.Overlay (backdrop)
│   └── Drawer.Content (.ds-sheet-content - the visible sheet)
│       ├── Drawer.Title (sr-only - for screen readers)
│       ├── Drawer.Description (sr-only)
│       ├── .ds-sheet-handle (drag handle)
│       ├── {headerNode} → Your <Sheet.Header> content
│       ├── {contentNode} → Your <Sheet.Content> content
│       └── {footerNode} → Your <Sheet.Footer> content (conditional)
```

---

## **CSS Layout**

### **The Container: `.ds-sheet-content`**

**File:** `Sheet.css` lines 104-118

```css
.ds-sheet-content {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;           /* ← Flexbox container */
  flex-direction: column;  /* ← Stack children vertically */
  height: 96%;
  background: var(--ds-color-surface-base);
  border-top-left-radius: var(--ds-radius-3, 16px);
  border-top-right-radius: var(--ds-radius-3, 16px);
  z-index: var(--z-sheet);
  box-shadow: var(--ds-elevation-sheet);
}
```

**Key:** `display: flex; flex-direction: column` creates a vertical stack.

### **The Slots: Header, Content, Footer**

**File:** `Sheet.css` lines 162-187

```css
/* Header: Sticky top rail (frame only) */
.ds-sheet-header {
  flex-shrink: 0;  /* ← Don't shrink if space is tight */
  border-bottom: 1px solid var(--ds-color-border-subtle);
}

/* Content: Scrollable body (frame only) */
.ds-sheet-content-slot {
  flex: 1;         /* ← Take all available space */
  overflow: auto;  /* ← Scroll if content overflows */
}

/* Footer: Sticky bottom rail (frame only) */
.ds-sheet-footer {
  flex-shrink: 0;  /* ← Don't shrink */
  border-top: 1px solid var(--ds-color-border-subtle);
  background: var(--ds-color-surface-raised);
}

/* iOS safe area */
.ds-sheet-footer[data-footer-safe="true"] {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## **How Flexbox Layout Works**

```
┌─────────────────────────────────────┐
│ .ds-sheet-content                   │  ← Container (flex column)
│ (flex-direction: column)            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ .ds-sheet-handle                │ │  ← Drag handle (fixed height)
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ .ds-sheet-header                │ │  ← Header (flex-shrink: 0)
│ │ (your content with padding)     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ .ds-sheet-content-slot          │ │  ← Content (flex: 1, overflow: auto)
│ │ (your content with padding)     │ │  ← Grows to fill, scrolls if needed
│ │ ...scrollable...                │ │
│ │ ...scrollable...                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ .ds-sheet-footer                │ │  ← Footer (flex-shrink: 0)
│ │ (your content with padding)     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Behavior:**
1. **Header** is sticky at top (doesn't scroll away)
2. **Content** takes all remaining space and scrolls if needed
3. **Footer** is sticky at bottom (doesn't scroll away)

---

## **Footer Auto-Reveal Logic**

**Code:** `Sheet.tsx` lines 633-641

```tsx
const footerShouldShow = useMemo(() => {
  if (!footerNode) return false;
  if (footerMode === 'never') return false;
  if (footerMode === 'always') return true;
  
  // Auto mode: show at WORK or when keyboard open
  const workThreshold = footerRevealAt ?? WORK_MIN;
  return snapValue >= workThreshold || keyboardOpen;
}, [footerNode, footerMode, snapValue, footerRevealAt, keyboardOpen]);
```

**Modes:**
- `footerMode="never"` → Never show footer
- `footerMode="always"` → Always show footer
- `footerMode="auto"` → Show footer when:
  - Snap >= `footerRevealAt` (default: `WORK_MIN` = 0.5)
  - OR keyboard is open

**Why:** On mobile, footer buttons are hidden at PEEK (collapsed) state to save space. When user drags to WORK, footer appears.

---

## **Slot Markers ($$slot)**

**Code:** `Sheet.tsx` lines 740-756

```tsx
(Sheet as any).Header = function SheetHeader({ children }) {
  return <div className="ds-sheet-header">{children}</div>;
};

(Sheet as any).Content = function SheetContent({ children }) {
  return <div className="ds-sheet-content-slot">{children}</div>;
};

(Sheet as any).Footer = function SheetFooter({ children, 'data-footer-safe': footerSafe }) {
  return <div className="ds-sheet-footer" data-footer-safe={footerSafe ? 'true' : undefined}>{children}</div>;
};
```

**Note:** The `$$slot` markers are attached during the function definition (not shown in snippet, but they're there).

---

## **What Sheet Owns vs What You Own**

### **Sheet Owns (The Shell)**

✅ **Structure:**
- Vaul Drawer integration
- Portal rendering
- Backdrop
- Drag handle

✅ **Layout:**
- Flexbox container (`.ds-sheet-content`)
- Sticky positioning (header/footer)
- Scrollable area (content)
- Border between sections

✅ **Behavior:**
- Snap points
- Drag gestures
- Keyboard handling
- Inert/scroll-lock
- Footer auto-reveal

✅ **A11y:**
- `role="dialog"`
- ARIA labels
- Focus management

✅ **State:**
- `data-bucket` (peek/work/owned)
- `data-snap`
- `data-modality`

### **You Own (The Content)**

✅ **Your UI:**
- Forms, lists, buttons, text
- Typography, colors, spacing
- **Padding inside slots**

✅ **Your Logic:**
- Form validation
- API calls
- Business logic

✅ **Your Styling:**
- Component-specific styles
- Layout within your content areas

---

## **Expected Behavior**

### **✅ Correct Usage**

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Settings">
  <Sheet.Header>
    <div style={{ padding: '16px 24px' }}>
      <h3>Settings</h3>
    </div>
  </Sheet.Header>
  
  <Sheet.Content>
    <div style={{ padding: '24px' }}>
      <form>...</form>
    </div>
  </Sheet.Content>
  
  <Sheet.Footer data-footer-safe>
    <div style={{ padding: '16px 24px', display: 'flex', gap: 8 }}>
      <button onClick={() => setOpen(false)}>Cancel</button>
      <button onClick={handleSave}>Save</button>
    </div>
  </Sheet.Footer>
</Sheet>
```

**Why:** Your content provides padding. Sheet provides structure.

### **❌ Incorrect Usage**

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Settings">
  <Sheet.Header>
    {/* NO PADDING - content will touch edges */}
    <h3>Settings</h3>
  </Sheet.Header>
  
  <Sheet.Content>
    {/* NO PADDING - content will touch edges */}
    <form>...</form>
  </Sheet.Content>
</Sheet>
```

**Problem:** Content touches edges. Not visually polished.

---

## **Legacy Mode (No Slots)**

If you don't use slots, Sheet wraps everything in `.ds-sheet-body`:

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Simple">
  <h3>Title</h3>
  <p>Content</p>
</Sheet>
```

**Rendered as:**
```tsx
<Drawer.Content>
  <div className="ds-sheet-body">
    <h3>Title</h3>
    <p>Content</p>
  </div>
</Drawer.Content>
```

**Note:** `.ds-sheet-body` has default padding. But **use slots** for proper header/footer behavior.

---

## **Common Patterns**

### **Pattern 1: Form with Actions**

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Edit Profile">
  <Sheet.Header>
    <div style={{ padding: '16px 24px' }}>
      <h2>Edit Profile</h2>
    </div>
  </Sheet.Header>
  
  <Sheet.Content>
    <div style={{ padding: '24px' }}>
      <form>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
      </form>
    </div>
  </Sheet.Content>
  
  <Sheet.Footer>
    <div style={{ padding: '16px 24px', display: 'flex', gap: 8 }}>
      <button onClick={() => setOpen(false)}>Cancel</button>
      <button onClick={handleSave}>Save</button>
    </div>
  </Sheet.Footer>
</Sheet>
```

### **Pattern 2: List with Header**

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Filters">
  <Sheet.Header>
    <div style={{ padding: '16px 24px' }}>
      <h2>Filters</h2>
    </div>
  </Sheet.Header>
  
  <Sheet.Content>
    <div style={{ padding: '24px' }}>
      {filters.map(filter => (
        <label key={filter.id}>
          <input type="checkbox" />
          {filter.label}
        </label>
      ))}
    </div>
  </Sheet.Content>
  
  <Sheet.Footer>
    <div style={{ padding: '16px 24px' }}>
      <button onClick={applyFilters}>Apply Filters</button>
    </div>
  </Sheet.Footer>
</Sheet>
```

### **Pattern 3: Content Only (No Header/Footer)**

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Info">
  <Sheet.Content>
    <div style={{ padding: '24px' }}>
      <h2>Information</h2>
      <p>Some text...</p>
    </div>
  </Sheet.Content>
</Sheet>
```

---

## **Key Takeaways**

1. **Sheet = Frame** → Provides structure, scrolling, sticky rails
2. **Your Content = Skin** → Provides padding, styling, UI
3. **Flexbox Layout** → Header/Footer sticky, Content scrollable
4. **Slot Detection** → `$$slot` markers identify Header/Content/Footer
5. **Footer Auto-Reveal** → Shows at WORK snap or when keyboard open
6. **Always Conditional Render** → `{open && <Sheet>}` prevents invisible blockers

---

## **Debugging Tips**

### **Content Not Scrolling?**
- Check that `Sheet.Content` wraps your scrollable area
- Content slot has `overflow: auto` and `flex: 1`

### **Footer Not Showing?**
- Check `footerMode` prop (default: `"auto"`)
- If auto, footer shows at snap >= 0.5 or keyboard open
- Use `footerMode="always"` to always show

### **Header/Footer Look Cramped?**
- Sheet slots have NO padding (by design)
- Wrap your content in a div with padding: `<div style={{ padding: '16px 24px' }}>`

### **Content Touching Edges?**
- Same issue - add padding to your content wrapper

---

**Summary:** Sheet is a **shell/interaction layer**. It owns mechanics (snaps, drag, a11y, layout structure). You own content (UI, padding, styling).
