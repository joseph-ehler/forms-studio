# Sheet Contract - Canonical Spec

> **Sheet is a shell.** It provides structure, mechanics, and a11y. Your content provides styling.

---

## **What the Shell Owns**

### **Position & Motion**
- Bottom-anchored container
- Open/close transitions
- Drag gestures
- Snap points settle

### **Backdrop**
- Single DS scrim (`dim` | `blur` | `none`)
- No duplicate backdrops

### **Layout Frame**
Vertical flex column with three rails:
- **Header** - Sticky top (zero padding)
- **Content** - Scroll area (zero padding)
- **Footer** - Sticky bottom (zero padding)

### **Underlay Coordination**
Publishes CSS vars for page effects:
- `--sheet-snap` (0..1 or null)
- `--sheet-size` (viewport height)
- `--sheet-offset` (px from top)

### **Interaction Policy**
- Underlay inert when in WORK/OWNED (modal feel)
- Scroll lock on body

### **Keyboard Fit**
- Safe-area handling (`env(safe-area-inset-bottom)`)
- VisualViewport insets
- Footer stays above keyboard

### **A11y**
- `role="dialog"`
- `aria-labelledby` / `aria-describedby`
- `aria-modal` (when in WORK/OWNED)
- Focus return on close

### **Events**
- `onOpenChange(boolean)`
- `onSnapChange(number | null)`
- `onSemanticStateChange('peek' | 'work' | 'owned')`

---

## **What the Shell Does NOT Own**

❌ **Padding** - Your content provides padding  
❌ **Colors** - Your content provides colors  
❌ **Typography** - Your content provides fonts  
❌ **CTA visual style** - Shell only provides sticky footer rail  

---

## **Sticky Footer: When & Why**

Think of footer as the **commit rail** - sticky by design for actions that finalize or dismiss.

### **Visibility Rules**

```tsx
footerMode="auto"     // Show when snap ≥ WORK (0.5) OR keyboard open (DEFAULT)
footerMode="always"   // Always show (checkout, destructive confirm)
footerMode="never"    // Never show (inline flows only)
footerRevealAt={0.7}  // Override WORK threshold
```

### **What Belongs in Footer**
✅ **Primary commit actions:** Apply / Save / Confirm / Continue / Close  
✅ **Supplementary action:** Cancel  
✅ **Limit:** 1-2 buttons max

### **What Belongs in Content**
✅ **Inline/ephemeral actions:** Chip toggles, filters, "Load more"  
✅ **Secondary/tertiary controls:** Help text, links  
✅ **Long forms:** Per-section buttons

**Rule of thumb:** If the action **finalizes the task** (or dismisses), it's a footer CTA. If it **modifies state within the task**, it's content.

---

## **Full-Width Content vs Padding**

### **Shell Frames: Zero Padding**

```css
.ds-sheet-header {
  flex-shrink: 0;
  border-bottom: 1px solid var(--ds-border);
  /* NO padding */
}

.ds-sheet-content-slot {
  flex: 1;
  overflow: auto;
  /* NO padding */
}

.ds-sheet-footer {
  flex-shrink: 0;
  border-top: 1px solid var(--ds-border);
  /* NO padding */
}
```

### **Your Content: Provides Padding**

```tsx
<Sheet.Header>
  <div style={{ padding: '16px 24px' }}>
    <h3>Title</h3>
  </div>
</Sheet.Header>

<Sheet.Content>
  <div style={{ padding: '24px' }}>
    <p>Body...</p>
  </div>
</Sheet.Content>

<Sheet.Footer>
  <div style={{ padding: '16px 24px' }}>
    <button>Close</button>
  </div>
</Sheet.Footer>
```

---

## **Practical Patterns**

### **1. Filters with Commit Rail** (Most Common)

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Filters">
  <Sheet.Content>
    <div style={{ padding: '24px' }}>
      {/* filter chips, checkboxes, etc. */}
    </div>
  </Sheet.Content>
  
  <Sheet.Footer data-footer-safe>
    <div style={{ padding: '16px 24px', display: 'flex', gap: 8 }}>
      <button onClick={() => setOpen(false)}>Cancel</button>
      <button style={{ marginLeft: 'auto' }} onClick={applyFilters}>Apply</button>
    </div>
  </Sheet.Footer>
</Sheet>
```

### **2. Inline Actions Only** (No Commit Rail)

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Quick Settings" footerMode="never">
  <Sheet.Content>
    <div style={{ padding: '24px' }}>
      {/* chips, toggles, live-updating UI */}
      <button onClick={() => setOpen(false)}>Done</button> {/* inline dismiss */}
    </div>
  </Sheet.Content>
</Sheet>
```

### **3. Full-Bleed Media with Padded Controls**

```tsx
<Sheet open={open} onOpenChange={setOpen} ariaLabel="Photo">
  <Sheet.Content>
    <div>
      {/* Full-bleed media area */}
      <div style={{ height: 240, background: '#111' }}>
        <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      
      {/* Padded controls */}
      <div style={{ padding: '24px' }}>
        <h3>Photo Details</h3>
        <p>Uploaded on...</p>
      </div>
    </div>
  </Sheet.Content>
  
  <Sheet.Footer data-footer-safe>
    <div style={{ padding: '16px 24px', display: 'flex', gap: 8 }}>
      <button>Cancel</button>
      <button>Save</button>
    </div>
  </Sheet.Footer>
</Sheet>
```

---

## **Best-Practice Checklist**

Use this **every time** you implement a Sheet:

- [ ] **Mount conditionally:** `{open && <Sheet>}` (prevents invisible overlays)
- [ ] **One backdrop:** DS scrim only, never two
- [ ] **Frame padding:** ZERO - your content provides padding
- [ ] **Footer = commit rail:** Use `auto`/`always`/`never` appropriately
- [ ] **Footer CTAs:** Max 1-2 buttons; rest in content
- [ ] **Full-bleed sections:** Structure layout yourself, zero frame padding
- [ ] **Keyboard:** `data-footer-safe` for iOS safe area
- [ ] **`data-bucket`:** Only if you need styling hooks (peek/work/owned)

---

## **Why This Resolves Your Screenshots**

### **Before (Mystery Padding):**
```css
.ds-sheet-content-slot,
.ds-sheet-body {
  padding: 16px; /* ← LEAK! Applied to both */
}
```

**Result:** Content had unexpected 16px padding on all sides.

### **After (Full-Bleed Slots):**
```css
.ds-sheet-content-slot {
  /* NO padding - full-bleed */
}

.ds-sheet-body {
  padding: 16px; /* Only for legacy no-slots mode */
}
```

**Result:** Slots are full-bleed. Your wrapper provides padding exactly where you want it.

### **Footer Stickiness:**
Footer is **always sticky** (by design). Whether it's **visible** is deterministic:
- `auto` → Shows at WORK or keyboard open
- `always` → Always visible
- `never` → Hidden (all CTAs in content)

---

## **Visual Model**

```
┌─────────────────────────────────────┐
│ .ds-sheet-content (outer shell)     │  ← Card appearance (bg, radius, shadow)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ .ds-sheet-handle                │ │  ← Drag handle
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ .ds-sheet-header (ZERO padding) │ │  ← Sticky top rail
│ │ ┌─────────────────────────────┐ │ │
│ │ │ <div style={{padding}}>     │ │ │  ← Your content with padding
│ │ │   <h3>Title</h3>             │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ .ds-sheet-content-slot          │ │  ← Scrollable area (ZERO padding)
│ │ ┌─────────────────────────────┐ │ │
│ │ │ <div style={{padding}}>     │ │ │  ← Your content with padding
│ │ │   <p>Body...</p>             │ │ │
│ │ │   ...scrollable...           │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ .ds-sheet-footer (ZERO padding) │ │  ← Sticky bottom rail
│ │ ┌─────────────────────────────┐ │ │
│ │ │ <div style={{padding}}>     │ │ │  ← Your content with padding
│ │ │   <button>Close</button>    │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## **Quick Reference**

| Concern | Owner |
|---------|-------|
| Position (fixed, bottom) | Shell |
| Snap points, drag | Shell |
| Backdrop | Shell |
| Flexbox layout | Shell |
| Sticky header/footer | Shell |
| Scroll container | Shell |
| Safe area insets | Shell |
| A11y (role, ARIA) | Shell |
| **Padding** | **You** |
| **Colors** | **You** |
| **Typography** | **You** |
| **Content layout** | **You** |

---

**This is the contract. Follow it every time.** 🎯
