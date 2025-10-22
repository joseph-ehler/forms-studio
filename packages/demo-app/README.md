# 🎨 Design System Demo - B2C Experience

**Live demonstration of our GOD-TIER design system!**

---

## 🚀 **Quick Start**

```bash
# From repo root
pnpm install
pnpm --filter demo-app dev
```

Open http://localhost:3000 🎉

---

## 📱 **What You'll See**

### **B2C Experience**
A content-focused app showcasing:

**🏠 Home Tab**
- Hero section with Display typography
- Feature cards grid
- Button variants showcase
- Pull-to-refresh (drag down at top)

**📦 Components Tab**
- Surface system (Cards, Stacks, Grid)
- Button sizes and states
- Responsive layouts
- Loading states

**✍️ Typography Tab**
- Complete type scale (Display, Heading, Body)
- Text variants (primary, secondary, muted, semantic colors)
- Optimal reading width (65ch)
- Font size examples

### **Interactive Features**

**Gestures**:
- 👆 **Pull-to-refresh** - Drag down at top of any tab
- 👈 **Swipe drawer** - Tap menu icon, swipe from edge
- 👆 **Bottom sheet** - Tap "Learn More", drag handle to resize
- 🔄 **Snap points** - Sheet snaps to 120px, 50%, 90%

**Navigation**:
- 🔽 **Bottom tabs** - Switch between Home, Components, Typography
- ☰ **Side drawer** - Menu with navigation
- 🌓 **Theme toggle** - Switch light/dark mode
- 📱 **Mobile-first** - Resize browser to see responsive behavior

---

## 💡 **Components Demonstrated**

### **UI Shell** (Phase 1 & 2)
- ✅ AppProvider (B2C tenant-aware)
- ✅ AppShell (Root layout)
- ✅ TopBar (iOS-style header with blur)
- ✅ BottomNav (Tab bar with badges)
- ✅ Drawer (Swipeable side navigation)
- ✅ Sheet (Bottom sheet with snap points)
- ✅ PullToRefresh (Native pull gesture)

### **Typography**
- ✅ Display (Marketing hero text)
- ✅ Heading (App headings, 5 sizes)
- ✅ Body (Content text, 5 sizes, 7 variants)
- ✅ Label (Form labels)

### **Surface**
- ✅ Container (Tenant-aware max-width)
- ✅ Card (Flat + glass variants)
- ✅ Stack (Vertical spacing: compact, normal, loose)
- ✅ Grid (Responsive columns)
- ✅ Box (Flexible container)
- ✅ Divider (Horizontal separator)
- ✅ Spacer (Explicit spacing)

### **Buttons**
- ✅ 8 variants (primary, secondary, ghost, danger, success, warning, info, link)
- ✅ 3 sizes (sm, md, lg)
- ✅ States (normal, disabled, loading)
- ✅ Icons (left, right)
- ✅ Full-width option

---

## 🎯 **Design Principles Showcased**

### **FLAT FIRST** ⬜
- No shadows on surfaces
- Borders for separation
- Subtle background changes
- Elevation ONLY for overlays (drawer, sheet)

### **Tenant-Aware** 🧠
- B2C: Readable widths (65ch-1280px)
- Container auto-adapts to tenant type
- Typography optimized for content

### **Theme Support** 🌓
- Light and dark modes
- Theme-aware elevation
- Semantic color variants
- Auto-adaptation

### **Mobile-First** 📱
- Touch targets (44px minimum)
- Gesture support
- Safe area handling
- iOS/Android feel

### **Responsive** 📐
- Mobile → Tablet → Desktop
- Grid columns adapt
- BottomNav hidden on desktop
- Container widths scale

---

## 🧪 **Try These Interactions**

1. **Pull to Refresh**:
   - Scroll to top of any tab
   - Pull down
   - See spring animation + loading

2. **Bottom Sheet**:
   - Tap "Learn More" button
   - Drag the handle up/down
   - Feel it snap to 120px, 50%, 90%
   - Swipe down fast to dismiss

3. **Side Drawer**:
   - Tap menu icon (top left)
   - Swipe from left edge (on mobile)
   - Tap overlay to close
   - On desktop (1024px+), becomes persistent sidebar

4. **Theme Toggle**:
   - Tap sun/moon icon (top right)
   - Watch entire app adapt
   - Notice elevation changes in dark mode

5. **Responsive**:
   - Resize browser window
   - Watch grid columns adapt
   - See BottomNav hide at 1024px+
   - Notice touch targets scale down

6. **Typography**:
   - Go to Typography tab
   - See all text sizes in context
   - Notice 65ch reading width
   - Compare variants

---

## 📊 **What's Under the Hood**

### **Tech Stack**
- React 18
- TypeScript 5
- Vite 5
- @joseph-ehler/wizard-react (our design system)

### **Design System Stats**
- 30+ components
- 100% theme-aware
- B2C/B2B tenant support
- Zero dependencies (except React)
- 38.58 KB CSS
- 380.06 KB JS

---

## 🎨 **Design Tokens Used**

```tsx
// Tenant-aware (auto-adapts)
<Container maxWidth="auto">  // B2C: 1280px | B2B: 2560px

// B2C explicit
<Container maxWidth="b2c-text">  // 65ch reading width
<Container maxWidth="b2c-max">   // 1280px

// Typography
<Display size="lg">
<Heading size="md">
<Body size="md" variant="primary">

// Buttons
<Button variant="primary" size="lg">
<Button variant="ghost" loading>

// Spacing
<Stack spacing="loose">
<Grid gap="normal">
<Spacer size="md">
```

---

## 🔥 **Next Steps**

Want to see the **B2B experience**?
- Change `tenantType="b2c"` to `"b2b"` in App.tsx
- See wider layouts (up to 2560px ultrawide)
- Dashboard-optimized spacing

Want to add your own views?
- Copy `HomeView` pattern
- Add to `activeTab` switch
- Add BottomNav.Item

Want to customize?
- Design tokens in `wizard-react/src/styles/tokens/`
- Components in `wizard-react/src/components/`
- Full TypeScript support

---

## 💫 **Experience the Magic**

This demo proves our design system is:
- ✅ Production-ready
- ✅ Mobile-native feel
- ✅ Gesture-driven
- ✅ Theme-aware
- ✅ Tenant-intelligent
- ✅ Fully responsive
- ✅ Accessible
- ✅ Beautiful

**Now go build something amazing!** 🚀
