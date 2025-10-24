# When to Use SheetDialog vs SheetPanel

**TL;DR**: Use **SheetDialog** for field pickers/forms (modal). Use **SheetPanel** for app-shell UI (non-modal map+panel).

---

## SheetDialog (Micro/Field Overlays)

### Use for:
- ✅ Field pickers (Select, MultiSelect, Date, Color)
- ✅ Forms and dialogs
- ✅ Emoji/icon selectors
- ✅ Short-lived, focused tasks
- ✅ Content that needs user's full attention

### Characteristics:
- **Modal**: Focus trapped, background inert, scroll locked
- **Simple gestures**: Drag handle, swipe-to-close
- **Esc behavior**: Closes immediately
- **Z-index**: Modal lane (900)
- **Recipes use this**: All field recipes exclusively use SheetDialog

### Example:
```tsx
import { SheetDialog } from '@intstudio/ds/overlay'

<SheetDialog
  open={open}
  onClose={onClose}
  ariaLabel="Select color"
  header={<PickerSearch />}
  footer={<PickerFooter />}
>
  <OverlayList>
    {colors.map(color => <Option ... />)}
  </OverlayList>
</SheetDialog>
```

---

## SheetPanel (Macro/App-Shell)

### Use for:
- ✅ Map + ride options (Uber/Lyft-style)
- ✅ Canvas + filter panel
- ✅ Video player + comments
- ✅ Primary UI surface (not auxiliary)
- ✅ Long-lived, persistent panels

### Characteristics:
- **Non-modal**: Natural tab order, no focus trap, no scroll lock
- **Rich gestures**: Gesture routing (sheet vs canvas), snap points, velocity
- **Esc/Back behavior**: Collapse → close → navigate
- **URL binding**: Persists snap state to route
- **Z-index**: Panel lane (700, below modals)

### Example:
```tsx
import { SheetPanel } from '@intstudio/ds/overlay'

<SheetPanel
  open={open}
  onClose={onClose}
  snap={[0.25, 0.5, 0.9]}
  initialSnap={0.5}
  gestureRouter={(ctx) => {
    if (ctx.currentSnap < 0.5) return 'sheet'
    if (!ctx.isAtTop) return 'sheet'
    return 'canvas'  // Allow map panning
  }}
  routeBinding={{
    get: () => parseFloat(new URLSearchParams(location.search).get('panel') || ''),
    set: (snap) => {
      const url = new URL(location.href)
      url.searchParams.set('panel', snap.toFixed(2))
      history.replaceState({}, '', url)
    }
  }}
  onBackPressure={() => 'collapse'}
  ariaLabel="Ride options"
>
  <RideOptionsList />
</SheetPanel>
```

---

## Quick Decision Tree

```
Is this a field picker or form?
  ├─ YES → SheetDialog (modal, simple)
  └─ NO
      └─ Is this a primary app surface (map+panel, canvas+tools)?
          ├─ YES → SheetPanel (non-modal, gestures, URL)
          └─ NO → Probably SheetDialog (or use Popover for desktop-only)
```

---

## Side-by-Side Comparison

| Feature | SheetDialog | SheetPanel |
|---------|-------------|------------|
| **Use Case** | Field pickers, forms | Map+panel, canvas+tools |
| **Modal** | Yes (focus trap, scroll lock) | No |
| **Background** | Inert | Interactive |
| **Gestures** | Simple drag/swipe | Gesture routing |
| **Esc/Back** | Close immediately | Collapse → close |
| **URL Binding** | No | Optional |
| **Snap Points** | Fixed (peek/full) | Configurable array |
| **Z-Index** | Modal lane (900) | Panel lane (700) |
| **Recipes** | All fields use this | App shells only |

---

## Stacking Behavior

### Multiple SheetDialogs
```
SheetDialog (Color picker)      Z: 902
  SheetDialog (Recent colors)   Z: 901
    Background                   Inert
```
- Only topmost handles Esc
- Scroll lock refcounted
- All are modal

### SheetPanel + SheetDialog
```
SheetDialog (Login form)         Z: 900  Modal
  SheetPanel (Ride options)      Z: 700  Panel (still visible behind)
    Map                          Interactive when panel at low snap
```
- Dialog is modal (blocks panel interaction)
- Panel remains visible but non-interactive
- Close dialog → panel becomes interactive again

### Multiple SheetPanels
Not recommended. Use tabs/segmented control within one panel instead.

---

## Migration from Legacy

### If you have manual sheets:
```tsx
// OLD (manual)
<div className="fixed bottom-0 inset-x-0 ...">
  {/* lots of manual gesture/focus code */}
</div>

// NEW (SheetDialog for field)
<SheetDialog open={open} onClose={onClose}>
  {content}
</SheetDialog>

// NEW (SheetPanel for app shell)
<SheetPanel open={open} onClose={onClose} snap={[0.3, 0.6, 0.95]}>
  {content}
</SheetPanel>
```

---

## Best Practices

### SheetDialog
- ✅ Keep content focused (one task)
- ✅ Use footer for actions (Done, Cancel)
- ✅ Provide search if >10 options
- ❌ Don't nest multiple dialogs (Esc closes all)
- ❌ Don't put long-form content (use Panel or scrollable page)

### SheetPanel
- ✅ Define clear snap points (25%, 50%, 90%)
- ✅ Implement gesture router for canvas handoff
- ✅ Bind snap to URL for back button support
- ✅ Handle unsaved changes in `onBackPressure`
- ❌ Don't use for quick pickers (use Dialog)
- ❌ Don't stack multiple panels (use tabs)

---

## Real-World Examples

### SheetDialog
- Select field picker (colors, fonts, users)
- Date picker calendar
- Emoji selector
- Color picker
- Multi-select tags
- Confirmation dialog
- Quick filters

### SheetPanel
- Uber: Map + ride options
- Lyft: Map + driver details
- Figma: Canvas + comments panel
- YouTube: Video + description
- Spotify: Player + queue
- Maps: Map + directions
- Photos: Gallery + details

---

## Questions?

**Q: Can I use SheetPanel for a date picker?**  
A: No. Date pickers are modal, focused tasks → SheetDialog.

**Q: Can I use SheetDialog for a map panel?**  
A: No. Map panels are persistent, non-modal → SheetPanel.

**Q: What if I need both?**  
A: Use SheetPanel for the main UI, SheetDialog for sub-tasks (e.g., filter panel uses SheetPanel, "Add filter" dialog uses SheetDialog).

**Q: How do I choose snap points?**  
A: Start with [0.25, 0.5, 0.9]. Adjust based on content:
- 0.25 = Peek (show summary)
- 0.5 = Half (browsable list)
- 0.9 = Full (detailed view)

**Q: Can SheetPanel be used on desktop?**  
A: Yes, but consider using a sidebar instead. SheetPanel works but is optimized for mobile.

---

**Need help?** Ask in #design-system or see `/docs/ds/OVERLAY_SYSTEM_MAP.md`
