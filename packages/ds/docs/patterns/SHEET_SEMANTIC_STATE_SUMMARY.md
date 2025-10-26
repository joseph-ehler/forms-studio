# Sheet Semantic State Machine: Implementation Summary

## 🎯 **What We're Building**

A God-Tier sheet system with semantic states that drive scrim behavior, footer visibility, and underlay inertness **automatically** based on user intent.

---

## 🧠 **The Three Semantic States**

### **PEEK** (snap < 0.5)
- **Intent**: Lightweight glance, keep context visible
- **Scrim**: OFF (no visual separation needed)
- **Underlay**: Interactive (user can still interact with main content)
- **Footer**: Hidden (keep it minimal)
- **Example**: Mini player bar, quick info peek

### **WORK** (0.5 ≤ snap < 0.9)
- **Intent**: Focused task, but still contextual
- **Scrim**: Visible, ramping alpha (0.08 → 0.48)
- **Underlay**: Inert (modal mode prevents interaction)
- **Footer**: Visible (actions available)
- **Example**: Filter panel, compose form, search

### **OWNED** (snap ≥ 0.9)
- **Intent**: Committed interaction, owns the screen
- **Scrim**: Strong (alpha ≈ 0.48)
- **Underlay**: Inert (modal focus)
- **Footer**: Visible and prominent
- **Example**: Full-screen form, media player expanded

---

## 🔧 **Implementation Status**

### ✅ **Completed (Phase 1)**
1. Type definitions (`SheetScrimStrategy`, `FooterMode`)
2. Scrim resolution logic (`resolveScrim` function)
3. Props API (all semantic props documented)
4. Keyboard detection hook (`useKeyboardOpen`)

### 🚧 **In Progress (Phase 2)**
1. Integrate scrim logic into Sheet component
2. Apply computed states to overlay rendering
3. Conditional footer visibility
4. Compute inert underlay state

### 📋 **Planned (Phase 3+)**
1. Storybook scenarios (7 flagship patterns)
2. UnderlayEffects component (blur/scale)
3. Keyboard insets (iOS safe area)
4. Sheet stacking (z-index management)

---

## 📦 **Key Props**

### **Scrim Control**
```typescript
scrimStrategy?: 'auto' | 'always' | 'never' | ((ctx) => { visible, alpha })
scrimAlphaRange?: [number, number]  // default: [0.08, 0.48]
scrimWorkMin?: number                // default: 0.5
scrimOwnedMin?: number               // default: 0.9
scrimClickDismiss?: boolean          // default: true (if modal+dismissible)
```

### **Footer Control**
```typescript
footerMode?: 'auto' | 'always' | 'never'  // default: 'auto'
footerSafeArea?: boolean                    // default: true (iOS)
footerRevealAt?: number                     // override threshold
```

### **Keyboard Awareness**
```typescript
keyboardAware?: boolean                     // default: true
keyboardInsets?: 'auto' | 'off' | number    // default: 'auto'
```

---

## 🎨 **Example Usage**

### Modal Filter Drawer
```typescript
<Sheet
  modality="modal"
  snapPoints={[0.25, 0.5, 0.9]}
  initialSnap={0.25}
  scrimStrategy="auto"           // Scrim ramps as sheet grows
  footerMode="auto"              // Footer shows at 0.5+
>
  <Sheet.Header>Filters</Sheet.Header>
  <Sheet.Content>{/* filter options */}</Sheet.Content>
  <Sheet.Footer>
    <button>Apply</button>
  </Sheet.Footer>
</Sheet>
```

### Modeless Inspector
```typescript
<Sheet
  modality="modeless"
  snapPoints={[0.25, 0.5]}
  scrimStrategy="auto"           // Subtle scrim only near-owned
  footerMode="never"
  inertUnderlay={false}          // Allow underlay interaction
>
  <Sheet.Content>{/* inspection data */}</Sheet.Content>
</Sheet>
```

### Custom Scrim (Media Player)
```typescript
<Sheet
  modality="modeless"
  snapPoints={[0.2, 0.55, 0.95]}
  scrimStrategy={({ snap }) => ({
    visible: snap >= 0.55,
    alpha: 0.36,
  })}
>
  <Sheet.Content>{/* media controls */}</Sheet.Content>
</Sheet>
```

---

## 🧪 **Testing Strategy**

### Automated Tests
1. **Unit**: Scrim resolution logic for all strategies
2. **Integration**: Footer visibility at thresholds
3. **E2E**: Full interaction flows (drag, keyboard, dismiss)

### Manual QA
1. **Visual**: Scrim alpha ramps smoothly during drag
2. **Interaction**: Underlay correctly inert/interactive
3. **Keyboard**: Layout adjusts when virtual keyboard opens

---

## 🚀 **Next Steps**

1. ✅ Complete Phase 2 integration (30 min)
2. ✅ Add Storybook scenarios (30 min)
3. ✅ Run tests & verify (15 min)
4. 🎉 Ship Phase 2!

---

**This is the blueprint for a world-class sheet system.** 🌟
