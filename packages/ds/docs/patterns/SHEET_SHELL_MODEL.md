# Sheet as Shell - Architecture Model

## **Philosophy: Shell vs Content**

Like `AppShell` or `UiShell`, Sheet is **exclusively a shell** with:
- **Zero styling** in slot frames (Header/Content/Footer)
- **Only structural CSS** (positioning, flexbox, scroll)
- **Slots/frames** where your components plug in
- **Content provides all styling** (padding, colors, typography)

---

## **Current Implementation Analysis**

### **What We Have:**

```
.ds-sheet-content (Vaul's Drawer.Content - THE OUTER CONTAINER)
├── .ds-sheet-handle (drag handle)
├── .ds-sheet-header (Header FRAME - zero styling)
├── .ds-sheet-content-slot (Content FRAME - zero styling)
└── .ds-sheet-footer (Footer FRAME - zero styling)
```

### **Question: Where Does Styling Live?**

**Option A: Pure Shell (Zero Styling Everywhere)**
```css
.ds-sheet-content {
  /* Structure ONLY */
  position: fixed;
  display: flex;
  flex-direction: column;
  /* NO background, radius, shadow */
}

.ds-sheet-header {
  flex-shrink: 0;
  /* NO borders, background, padding */
}
```
**Result:** Your content provides EVERYTHING (background, radius, borders)

**Option B: Outer Shell + Inner Frames**
```css
.ds-sheet-content {
  /* Outer shell: floating card appearance */
  position: fixed;
  display: flex;
  flex-direction: column;
  background: var(--ds-color-surface-base);    /* ← Shell styling */
  border-radius: var(--ds-radius-3);           /* ← Shell styling */
  box-shadow: var(--ds-elevation-sheet);       /* ← Shell styling */
}

.ds-sheet-header {
  /* Inner frame: dividers only */
  flex-shrink: 0;
  border-bottom: 1px solid var(--ds-border);   /* ← Structural */
  /* NO padding, background */
}
```
**Result:** Shell provides "card" look. Your content provides padding/content styling.

**Option C: Completely Unstyled (Headless)**
```css
.ds-sheet-content {
  /* Positioning ONLY */
  position: fixed;
  display: flex;
  flex-direction: column;
}
```
**Result:** You provide ALL styling via className or your content components.

---

## **Current State:**

**We're at Option B:**
- **Outer shell** (`.ds-sheet-content`) has card styling (background, radius, shadow)
- **Inner frames** (`.ds-sheet-header/content-slot/footer`) have NO styling (just structure)
- **Your content** provides padding, typography, colors

---

## **The Question:**

**Should the outer shell (`.ds-sheet-content`) have styling?**

### **Arguments FOR keeping outer shell styling:**
1. **Every sheet looks like a card** - consistent visual language
2. **Common UX pattern** - floating sheet with elevation
3. **Reduces boilerplate** - users don't have to add background/radius every time
4. **Matches Vaul's design** - Vaul expects the drawer to look like a card

### **Arguments AGAINST (pure shell):**
1. **Flexibility** - users might want different backgrounds, no radius, etc.
2. **True shell model** - like AppShell, it provides structure only
3. **Override pain** - if user wants different styling, they fight the defaults
4. **Composition** - users compose their own "card" inside the shell

---

## **My Recommendation:**

**Keep Option B (Outer Shell + Inner Frames)** because:

1. **Sheet is a specialized component** - unlike AppShell (generic container), Sheet has a specific UX pattern (floating card from bottom)
2. **99% use case** - everyone wants the floating card look
3. **Override is easy** - just pass `className` to override
4. **Reduces friction** - users focus on content, not shell styling

**But:** Make it **overrideable** via `className` prop.

---

## **Implementation:**

### **Outer Shell (`.ds-sheet-content`) - Provides Card Appearance**
```css
.ds-sheet-content {
  /* STRUCTURE (always needed) */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  height: 96%;
  z-index: var(--z-sheet);
  
  /* STYLING (opinionated defaults, overrideable) */
  background: var(--ds-color-surface-base);
  border-top-left-radius: var(--ds-radius-3);
  border-top-right-radius: var(--ds-radius-3);
  box-shadow: var(--ds-elevation-sheet);
}
```

**Why these styles?**
- `background` - so content is readable on backdrop
- `border-radius` - premium OS feel
- `box-shadow` - elevation, floating effect

**Override:**
```tsx
<Sheet className="custom-sheet" {...props}>
```
```css
.custom-sheet {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}
```

### **Inner Frames (`.ds-sheet-header/content-slot/footer`) - ZERO Styling**
```css
.ds-sheet-header {
  /* STRUCTURE ONLY */
  flex-shrink: 0;
  border-bottom: 1px solid var(--ds-border); /* Divider - structural */
}

.ds-sheet-content-slot {
  /* STRUCTURE ONLY */
  flex: 1;
  overflow: auto;
}

.ds-sheet-footer {
  /* STRUCTURE ONLY */
  flex-shrink: 0;
  border-top: 1px solid var(--ds-border); /* Divider - structural */
}
```

**No padding, no background, no typography.** Your content owns that.

---

## **Mental Model:**

```
┌─────────────────────────────────────┐
│ OUTER SHELL (.ds-sheet-content)    │  ← Card appearance (bg, radius, shadow)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ FRAME (.ds-sheet-header)        │ │  ← Structure only (flexbox, border)
│ │ ┌─────────────────────────────┐ │ │
│ │ │ YOUR CONTENT (with padding) │ │ │  ← You own styling
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ FRAME (.ds-sheet-content-slot)  │ │  ← Structure only (scroll)
│ │ ┌─────────────────────────────┐ │ │
│ │ │ YOUR CONTENT (with padding) │ │ │  ← You own styling
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ FRAME (.ds-sheet-footer)        │ │  ← Structure only (flexbox, border)
│ │ ┌─────────────────────────────┐ │ │
│ │ │ YOUR CONTENT (with padding) │ │ │  ← You own styling
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## **Comparison to AppShell:**

**AppShell:**
- Generic container for any layout
- Provides structure (header/aside/main/footer positions)
- ZERO styling (no colors, no backgrounds, no borders)
- Users compose their own visual design

**Sheet (Specialized Shell):**
- Specific UX pattern (bottom sheet / modal)
- Provides structure + baseline card appearance
- Opinionated defaults (floating card with elevation)
- Overrideable via className

---

## **Decision:**

**Sheet is a specialized shell, not a generic container.**

- **Outer shell**: Has minimal, opinionated styling (card appearance)
- **Inner frames**: ZERO styling (structure only)
- **Your content**: Owns all content styling (padding, typography, colors)

**This balances:**
- **Convention** - most users get good defaults
- **Flexibility** - power users can override
- **Clarity** - frames are clearly structural, content is clearly yours

---

## **Action Items:**

1. ✅ **Already done**: Removed padding from frames
2. ✅ **Already done**: Removed background from footer frame
3. ✅ **Keep**: Background, radius, shadow on outer shell
4. ✅ **Keep**: Borders on frames (structural dividers)
5. **Document**: Make className override pattern clear

---

**This is the model. Sound right?**
