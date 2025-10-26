# Sheet Story Debugging Plan

## **Systematic Story Verification**

Let's go through each story and ensure it works correctly.

---

## **Story Checklist**

### **Sheet.stories.tsx** (5 stories)

#### 1. Desktop ✓
**Expected**: Opens modal on desktop
**Check**:
- [ ] Button visible
- [ ] Clicks to open
- [ ] Modal appears (center screen)
- [ ] Backdrop is semi-transparent (not double)
- [ ] ESC closes
- [ ] Content renders

**Potential Issues**:
- Flowbite Modal not importing correctly
- Theme not applied

---

#### 2. Mobile ✓
**Expected**: Opens sheet on mobile
**Check**:
- [ ] Button visible
- [ ] Clicks to open
- [ ] Sheet slides from bottom
- [ ] Drag handle visible
- [ ] Content renders
- [ ] Backdrop matches desktop

**Potential Issues**:
- Vaul not importing correctly
- forceMode="sheet" not working

---

#### 3. WithSlots ✓
**Expected**: Shows Header/Content/Footer slots
**Check**:
- [ ] Opens on mobile (forceMode="sheet")
- [ ] Header visible with title
- [ ] Content scrollable
- [ ] Footer sticky at bottom
- [ ] Snap points work (25/50/90%)

**Potential Issues**:
- Slot detection not working
- Footer not rendering

---

#### 4. VisualParity ⭐
**Expected**: Side-by-side desktop/mobile comparison
**Check**:
- [ ] Two buttons render
- [ ] Backdrop switcher works (Dim/Blur/None)
- [ ] Desktop modal uses forceMode="modal"
- [ ] Mobile sheet uses forceMode="sheet"
- [ ] Can open both simultaneously
- [ ] Backdrops look identical

**Potential Issues**:
- Two sheets conflicting
- State management issues
- Backdrop not matching

---

#### 5. SnapPoints ✓
**Expected**: Controlled snap point demo
**Check**:
- [ ] Sheet opens by default
- [ ] Snap control buttons work (25/50/90/Full)
- [ ] Sheet animates to snap positions
- [ ] Current snap displayed
- [ ] Data attributes update

**Potential Issues**:
- Snap prop not working
- onSnapChange not firing

---

### **Sheet.advanced.stories.tsx** (5 stories)

#### 6. SemanticStates ⭐
**Expected**: PEEK/WORK/OWNED visualization
**Check**:
- [ ] Sheet opens by default
- [ ] Snap buttons work
- [ ] Bucket indicator updates
- [ ] onSemanticStateChange fires
- [ ] PEEK (≤50%), WORK (50-90%), OWNED (≥90%)

**Potential Issues**:
- onSemanticStateChange prop doesn't exist
- Bucket calculation wrong
- Type error on onSnapChange

---

#### 7. BackdropVariants
**Expected**: Dim/Blur/None comparison
**Check**:
- [ ] Backdrop selector works
- [ ] Underlay content visible (grid)
- [ ] Dim: Semi-transparent black
- [ ] Blur: Blur effect applied
- [ ] None: No backdrop, clickable underlay

**Potential Issues**:
- Backdrop prop not working
- UnderlayEffects not rendering

---

#### 8. NonDismissible
**Expected**: Checkout pattern, ESC disabled
**Check**:
- [ ] Opens as modal (forceMode="modal")
- [ ] ESC doesn't close
- [ ] Overlay click doesn't close
- [ ] Only "Pay" button closes
- [ ] dismissible={false} works

**Potential Issues**:
- dismissible prop not working
- modality="modal" not working

---

#### 9. FooterModes
**Expected**: Auto/Always/Never footer
**Check**:
- [ ] Mode buttons work
- [ ] Auto: Footer appears at WORK (50%)
- [ ] Always: Footer always visible
- [ ] Never: Footer never shows
- [ ] footerMode prop works

**Potential Issues**:
- footerMode prop doesn't exist
- Footer auto-reveal not working

---

#### 10. UnderlayEffectsDemo ⭐
**Expected**: Parallax effects
**Check**:
- [ ] Rich underlay content (grid)
- [ ] UnderlayEffects component renders
- [ ] Dragging sheet blurs underlay
- [ ] Scale effect works
- [ ] Dim effect works
- [ ] backdrop="none" required

**Potential Issues**:
- UnderlayEffects not imported
- CSS variables not working
- Snap not tied to effects

---

### **Sheet.recipes.stories.tsx** (4 stories)

#### 11. FilterDrawer ⭐
**Expected**: E-commerce filter UI
**Check**:
- [ ] Product grid renders
- [ ] Opens with snapPoints
- [ ] Checkboxes work
- [ ] Price range slider works
- [ ] Footer auto-reveals at 50%
- [ ] Apply button works

**Potential Issues**:
- footerMode="auto" not working
- State management issues

---

#### 12. QuickSwitcher ⭐
**Expected**: Command palette (Cmd+K)
**Check**:
- [ ] Cmd+K opens sheet
- [ ] Search input focused
- [ ] Filtering works
- [ ] Keyboard navigation
- [ ] backdrop="blur" applied

**Potential Issues**:
- useEffect keyboard listener not working
- forceMode="modal" required
- Input focus issues

---

#### 13. NowPlaying ⭐
**Expected**: Media player with parallax
**Check**:
- [ ] Album grid renders (underlay)
- [ ] UnderlayEffects renders
- [ ] Opens at 15% (mini player)
- [ ] Drag to expand
- [ ] Parallax on drag
- [ ] backdrop="none"

**Potential Issues**:
- UnderlayEffects not rendering
- Snap points not working
- Parallax not visible

---

#### 14. CheckoutFlow ⭐
**Expected**: Multi-step wizard
**Check**:
- [ ] Opens as modal
- [ ] Step indicator updates
- [ ] Step 1/2: dismissible
- [ ] Step 3: non-dismissible (ESC disabled)
- [ ] Back/Continue buttons work
- [ ] Progress bar updates

**Potential Issues**:
- dismissible conditional not working
- State management

---

## **Common Issues to Check**

### **1. Import Issues**
```tsx
import { Sheet } from './Sheet';
import { UnderlayEffects } from './UnderlayEffects';
```
- Are all imports correct?
- Is UnderlayEffects exported?

### **2. Prop Issues**
- `onSemanticStateChange` - Does this prop exist?
- `footerMode` - Does this prop exist?
- `onSnapChange` - Type signature correct?

### **3. Type Issues**
```tsx
onSnapChange={(s) => setSnap(s ?? 0.5)}
```
- null handling required?

### **4. Theme Issues**
- Is dsFlowbiteTheme applied?
- Is Flowbite provider wrapping stories?

### **5. CSS Issues**
- Is ds-bridge.css imported?
- Are backdrop overrides working?

---

## **Debugging Steps**

### **For Each Broken Story**:

1. **Check Console**
   - Open browser DevTools
   - Look for errors
   - Note prop warnings

2. **Check Props**
   - Verify prop exists in Sheet component
   - Check type signature
   - Confirm default values

3. **Check Rendering**
   - Does component render at all?
   - Is content visible?
   - Are styles applied?

4. **Check Interactions**
   - Do buttons work?
   - Do snaps work?
   - Does state update?

5. **Fix & Verify**
   - Apply fix
   - Test in Storybook
   - Verify no regressions

---

## **Priority Order**

### **Fix First** (Critical for v1.0):
1. VisualParity - Validates backdrop fix
2. Desktop/Mobile - Basic functionality
3. WithSlots - Slot API demo

### **Fix Next** (Core features):
4. SemanticStates - State machine
5. BackdropVariants - Backdrop demo
6. NonDismissible - Critical pattern

### **Fix Last** (Nice to have):
7. Recipes (FilterDrawer, etc.)
8. Advanced features

---

## **Next Steps**

1. **Tell me which stories are failing**
2. **Share any console errors**
3. **I'll fix them systematically**
4. **We'll verify each one works**

---

**Let's go story by story and get them all working!** 🔧
