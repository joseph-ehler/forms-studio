# 🚀 UI SHELL SYSTEM - NATIVE OS EXPERIENCE

**Vision**: Transform the DS into a true cross-platform OS
**Philosophy**: Mobile-first to the point it feels native
**Goal**: Snapping, gestures, sophisticated interactions

---

## 🎯 **CORE PRINCIPLES**

```
MOBILE-FIRST NATIVE OS 📱
├── Snap behaviors (iOS-like precision)
├── Gesture support (swipe, pull, drag)
├── Safe areas (respect notches/navigation)
├── Haptic feedback (when available)
├── Momentum scrolling
├── Native transitions
└── Desktop scales up (not mobile scales down)
```

---

## 📐 **SHELL COMPONENTS NEEDED**

### **1. AppShell** (Root Layout)
- Safe area handling (iOS notch, Android nav)
- Viewport height handling (100vh bugs on mobile)
- Layout composition (header + content + nav)
- Keyboard avoidance (iOS)
- Pull-to-refresh support

### **2. TopBar** (App Header)
- Sticky with blur background (iOS-like)
- Title transitions on scroll
- Action buttons (back, menu, etc.)
- Search integration
- Elevation on scroll

### **3. BottomNav** (Mobile Navigation)
- Fixed bottom navigation (iOS-like)
- Safe area padding
- Active state with smooth transitions
- Badge support
- Haptic feedback on tap

### **4. Drawer** (Side Navigation)
- Swipe-to-open (iOS-like)
- Momentum-based closing
- Overlay with blur
- Snap points (25%, 50%, 100%)
- Gesture velocity detection

### **5. Sheet** (Bottom Sheet)
- Pull handle (iOS-like)
- Snap points (collapsed, half, full)
- Swipe down to dismiss
- Backdrop with blur
- Keyboard pushes up content

### **6. TabBar** (Segmented Control)
- iOS-style segmented control
- Smooth sliding indicator
- Haptic feedback
- Keyboard navigation

---

## 🎨 **MOBILE-FIRST PATTERNS**

### **Safe Areas**
```css
--ds-safe-area-top: env(safe-area-inset-top);
--ds-safe-area-bottom: env(safe-area-inset-bottom);
--ds-safe-area-left: env(safe-area-inset-left);
--ds-safe-area-right: env(safe-area-inset-right);
```

### **Viewport Height (Mobile-Aware)**
```css
/* NOT 100vh (broken on mobile!) */
--ds-viewport-height: 100dvh;  /* Dynamic viewport */
--ds-viewport-height-small: 100svh;  /* Small viewport */
--ds-viewport-height-large: 100lvh;  /* Large viewport */
```

### **Touch Targets**
```css
--ds-touch-target-min: 44px;  /* iOS minimum */
--ds-touch-target-comfortable: 48px;  /* Android minimum */
--ds-touch-target-relaxed: 56px;  /* Generous */
```

### **Snap Points**
```css
--ds-snap-threshold: 0.3;  /* 30% drag to snap */
--ds-snap-velocity: 200;   /* px/s to trigger snap */
```

---

## 🌊 **GESTURE SYSTEM**

### **Swipe Gestures**
- Left/right navigation
- Pull-to-refresh
- Swipe-to-dismiss
- Swipe-to-reveal actions

### **Drag Gestures**
- Bottom sheet dragging
- Drawer sliding
- Reorder lists
- Snap behaviors

### **Pinch Gestures**
- Zoom (where applicable)
- Scale interactions

### **Long Press**
- Context menus
- Haptic feedback
- Action sheets

---

## 🎭 **TRANSITIONS**

### **iOS-Style**
```css
--ds-transition-page: 350ms cubic-bezier(0.4, 0.0, 0.2, 1);
--ds-transition-sheet: 300ms cubic-bezier(0.32, 0.72, 0, 1);
--ds-transition-drawer: 250ms cubic-bezier(0.4, 0.0, 0.6, 1);
```

### **Spring Animations**
```css
--ds-spring-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ds-spring-smooth: cubic-bezier(0.16, 1, 0.3, 1);
```

---

## 📱 **MOBILE PATTERNS**

### **1. Full-Screen App**
```tsx
<AppShell>
  <TopBar title="Dashboard" />
  <AppShell.Content>
    {/* Your content */}
  </AppShell.Content>
  <BottomNav>
    <BottomNav.Item icon={<Home />}>Home</BottomNav.Item>
    <BottomNav.Item icon={<Search />}>Search</BottomNav.Item>
  </BottomNav>
</AppShell>
```

### **2. Pull-to-Refresh**
```tsx
<AppShell>
  <TopBar />
  <PullToRefresh onRefresh={handleRefresh}>
    <AppShell.Content>
      {/* Content */}
    </AppShell.Content>
  </PullToRefresh>
</AppShell>
```

### **3. Bottom Sheet**
```tsx
<Sheet
  snapPoints={['100px', '50%', '100%']}
  defaultSnap="100px"
  onSnapChange={handleSnap}
>
  <Sheet.Handle />
  <Sheet.Content>
    {/* Sheet content */}
  </Sheet.Content>
</Sheet>
```

### **4. Swipeable Drawer**
```tsx
<Drawer
  swipeToOpen
  snapPoints={[0.25, 0.5, 1.0]}
  onSwipeStart={handleStart}
>
  <Drawer.Content>
    {/* Navigation */}
  </Drawer.Content>
</Drawer>
```

---

## 🖥️ **DESKTOP SCALES UP**

### **Responsive AppShell**
```tsx
<AppShell>
  {/* Mobile: Hidden */}
  {/* Desktop: Persistent sidebar */}
  <AppShell.Sidebar>
    <Navigation />
  </AppShell.Sidebar>
  
  <AppShell.Main>
    {/* Mobile: TopBar + BottomNav */}
    {/* Desktop: TopBar only */}
    <TopBar />
    <AppShell.Content />
  </AppShell.Main>
</AppShell>
```

### **Breakpoint Behavior**
- **Mobile** (< 768px): Bottom nav, swipe drawer, sheets
- **Tablet** (768-1024px): Persistent drawer, bottom nav optional
- **Desktop** (> 1024px): Sidebar, top navigation, no bottom nav

---

## 🎯 **IMPLEMENTATION PRIORITY**

### **Phase 1: Foundation** (Week 1)
1. AppShell with safe areas
2. TopBar with scroll behavior
3. Mobile viewport fixes
4. Touch target system

### **Phase 2: Navigation** (Week 2)
5. BottomNav component
6. Drawer with gestures
7. TabBar/segmented control

### **Phase 3: Sheets & Gestures** (Week 3)
8. Bottom Sheet with snap points
9. Pull-to-refresh
10. Swipe gestures
11. Haptic feedback integration

### **Phase 4: Polish** (Week 4)
12. Transitions & springs
13. Keyboard handling
14. Performance optimization
15. Accessibility

---

## 🔧 **TECHNICAL REQUIREMENTS**

### **Gesture Library**
- `@use-gesture/react` for touch handling
- Velocity tracking
- Momentum calculation
- Snap point logic

### **Viewport Detection**
- `visualViewport` API
- Dynamic viewport units (dvh, svh, lvh)
- Safe area env variables
- Resize observers

### **Haptics** (Optional Enhancement)
```ts
// Haptic feedback on supported devices
if ('vibrate' in navigator) {
  navigator.vibrate(10)  // Light tap
}
```

### **Scroll Behavior**
- `overscroll-behavior` for pull-to-refresh
- `-webkit-overflow-scrolling: touch` for iOS
- Scroll snap points
- Momentum preservation

---

## 📊 **SUCCESS METRICS**

**Feels Native When**:
- ✅ Swipe gestures feel iOS-smooth
- ✅ Snap behaviors are crisp
- ✅ Transitions match OS timing
- ✅ No layout shift on scroll
- ✅ Safe areas properly respected
- ✅ Keyboard doesn't break layout
- ✅ Pull-to-refresh feels natural
- ✅ 60fps on all interactions

---

## 🚀 **READY TO BUILD?**

This will create a **true cross-platform OS experience** with:
- Native mobile feel
- Sophisticated gestures
- Snap behaviors
- Desktop that scales up naturally
- FLAT design throughout

**Should I start building the UI Shell system?** 🔥
