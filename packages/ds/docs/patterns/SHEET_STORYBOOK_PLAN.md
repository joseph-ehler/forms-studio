# Sheet Component - Complete Storybook Story Plan

## **Current Stories (10 total)**

### **Sheet.stories.tsx** (4 stories)
1. ✅ **Desktop** - Basic desktop modal
2. ✅ **Mobile** - Basic mobile sheet
3. ✅ **WithSlots** - Header/Content/Footer demo
4. ✅ **SnapPoints** - Controlled snap with buttons

### **Sheet.canary.stories.tsx** (6 stories)
1. ✅ **DesktopKeyboard** - ESC/keyboard tests
2. ✅ **MobileSheet** - Sheet elements test
3. ✅ **A11yCheck** - Accessibility validation
4. ✅ **RuntimeTelemetry** - Console logs
5. ✅ **CapacitorStub** - Capacitor detection
6. ✅ **ForceModeOverride** - forceMode prop

---

## **Missing Stories (Organized by Feature Category)**

### **1. Core Features (Should Add - 8 stories)**

#### **A. Visual Parity Comparison** ⭐ HIGH PRIORITY
Shows desktop Modal and mobile Drawer side-by-side to verify token bridge parity.

**Story**: `VisualParity`
- Two iframes: one forced desktop, one forced mobile
- Same content in both
- Validates: padding, radius, shadow, borders, colors match

#### **B. Semantic State Visualization** ⭐ HIGH PRIORITY
Live demo of PEEK → WORK → OWNED transitions with visual indicators.

**Story**: `SemanticStates`
- Controlled snap with buttons (0.25, 0.5, 0.9, full)
- Live display of current bucket (peek/work/owned)
- Shows scrim alpha changes
- Shows footer auto-reveal at WORK threshold
- Shows inert underlay at WORK/OWNED

#### **C. Scrim Strategies**
Demonstrates all scrim strategy options.

**Story**: `ScrimStrategies`
- Tabs to switch: `auto`, `always`, `never`, custom function
- Shows scrim behavior at different snap points
- Custom strategy example: only show scrim when snap >= 0.7

#### **D. Footer Modes**
Shows auto-reveal, always-visible, and never-visible footer modes.

**Story**: `FooterModes`
- Toggle between `auto`, `always`, `never`
- With `auto`, drag sheet to see footer reveal at threshold
- Demonstrates `footerRevealAt` customization

#### **E. Backdrop Variants**
Compare dim, blur, and none backdrop options.

**Story**: `BackdropVariants`
- Three columns: dim, blur, none
- Shows underlay content behind sheet
- Validates visual parity between desktop/mobile

#### **F. Modality Comparison**
Side-by-side modal vs modeless behavior.

**Story**: `ModalityComparison`
- Two sheets: one modal, one modeless
- Modal: blocks underlay, shows scrim
- Modeless: allows underlay interaction

#### **G. Non-Dismissible Modal**
Checkout flow pattern where ESC/overlay don't close.

**Story**: `NonDismissible`
- `dismissible={false}`
- Shows "must complete action" pattern
- ESC key does nothing
- Overlay click does nothing
- Must click "Complete" button

#### **H. Keyboard Awareness**
Virtual keyboard detection and footer adjustment.

**Story**: `KeyboardAware`
- Mobile-only (force sheet mode)
- Input field in content
- Footer auto-reveals when keyboard opens
- Shows `keyboardInsets` behavior

---

### **2. Advanced Features (Nice to Have - 6 stories)**

#### **A. UnderlayEffects Showcase** ⭐ HIGH PRIORITY
Demonstrates parallax, blur, scale, and dim effects.

**Story**: `UnderlayEffects`
- Rich underlay content (image grid or cards)
- Toggle effects on/off
- Sliders for blur/scale/dim ranges
- Shows `--ue-blur`, `--ue-scale`, `--ue-dim` in real-time

#### **B. Telemetry Hook**
Shows `onSemanticStateChange` callback in action.

**Story**: `Telemetry`
- Drag sheet through snap points
- Live event log showing bucket changes
- Demonstrates analytics integration pattern

#### **C. Custom Scrim Function**
Type-safe custom scrim strategy example.

**Story**: `CustomScrimFn`
- Shows `ScrimFn` type signature
- Example: Premium scrim (higher alpha, custom thresholds)
- Code snippet in docs panel

#### **D. Nested Sheets & Stacking**
Multiple sheets open simultaneously.

**Story**: `NestedSheets`
- Open Sheet A → Open Sheet B from A
- Shows refcounted scroll lock
- Close B → body still locked
- Close A → body unlocks

#### **E. Data Attributes Styling**
Custom CSS using data-bucket/snap/modality hooks.

**Story**: `DataAttributes`
- Shows custom styling per bucket
- Example: Different shadows for peek/work/owned
- Demonstrates stable Playwright selectors

#### **F. Safe Area Handling**
iOS safe-area-inset-bottom demonstration.

**Story**: `SafeArea`
- Mobile-only story
- Footer with `data-footer-safe={true}`
- Simulates iOS notch
- Shows proper padding calculation

---

### **3. Hero Recipe Stories (Should Add - 4 stories)**

These demonstrate real-world usage patterns.

#### **A. Filters Drawer** ⭐ HIGH PRIORITY
E-commerce filter sheet with async search + multiselect.

**Story**: `FilterDrawer`
- Search input with debounce
- Checkbox groups (categories, price ranges)
- Auto scrim + footer
- "Apply Filters" button in footer
- Shows PEEK → WORK interaction

#### **B. Quick Switcher**
Command palette / Cmd+K pattern.

**Story**: `QuickSwitcher`
- Keyboard shortcut to open (Cmd+K)
- Fuzzy search
- Arrow keys to navigate
- Enter to select
- Shows keyboard-first navigation

#### **C. Now Playing**
Media player sheet with parallax effects.

**Story**: `NowPlaying`
- Album art underlay with UnderlayEffects
- Drag handle subtle
- Snap to PEEK (controls only) vs WORK (playlist)
- Shows parallax scale/blur

#### **D. Checkout Flow**
Non-dismissible payment flow.

**Story**: `CheckoutFlow`
- Multi-step: Cart → Shipping → Payment
- `dismissible={false}`
- `modality="modal"`
- Footer safe-area for "Pay $99" button
- Shows "must complete" pattern

---

### **4. Edge Cases & Polish (Nice to Have - 4 stories)**

#### **A. Rotation & Viewport Changes**
Sheet adapts to device rotation.

**Story**: `RotationAdaptive`
- Shows resize debounce in action
- CSS vars (`--sheet-size`, `--sheet-offset`) update
- No layout jump

#### **B. Reduced Motion**
Respects `prefers-reduced-motion`.

**Story**: `ReducedMotion`
- Toggle via Storybook addon
- Shows instant transitions (no animation)
- UnderlayEffects disabled

#### **C. Long Content Scrolling**
Sheet with very long scrollable content.

**Story**: `LongContent`
- 100+ paragraphs
- Tests scroll chain guard (iOS)
- No rubber-band bleed
- Header stays fixed

#### **D. Empty States**
Sheet with minimal content at different snap points.

**Story**: `EmptyStates`
- PEEK: Just a message
- WORK: Loading spinner
- OWNED: Empty state illustration
- Shows how layout adapts

---

## **Recommended Story Structure**

```
DS/Primitives/Sheet/
├── 1. Getting Started/
│   ├── Desktop (existing)
│   ├── Mobile (existing)
│   ├── WithSlots (existing)
│   └── VisualParity (NEW ⭐)
│
├── 2. Core Features/
│   ├── SemanticStates (NEW ⭐)
│   ├── SnapPoints (existing)
│   ├── ScrimStrategies (NEW)
│   ├── FooterModes (NEW)
│   ├── BackdropVariants (NEW)
│   ├── ModalityComparison (NEW)
│   └── NonDismissible (NEW)
│
├── 3. Advanced/
│   ├── UnderlayEffects (NEW ⭐)
│   ├── Telemetry (NEW)
│   ├── CustomScrimFn (NEW)
│   ├── NestedSheets (NEW)
│   ├── DataAttributes (NEW)
│   ├── SafeArea (NEW)
│   └── KeyboardAware (NEW)
│
├── 4. Hero Recipes/
│   ├── FilterDrawer (NEW ⭐)
│   ├── QuickSwitcher (NEW ⭐)
│   ├── NowPlaying (NEW ⭐)
│   └── CheckoutFlow (NEW ⭐)
│
├── 5. Edge Cases/
│   ├── RotationAdaptive (NEW)
│   ├── ReducedMotion (NEW)
│   ├── LongContent (NEW)
│   └── EmptyStates (NEW)
│
└── 6. QA/Canaries/
    ├── DesktopKeyboard (existing)
    ├── MobileSheet (existing)
    ├── A11yCheck (existing)
    ├── RuntimeTelemetry (existing)
    ├── CapacitorStub (existing)
    └── ForceModeOverride (existing)
```

---

## **Priority Tiers**

### **Tier 1: Must Have Before v1.0** (5 stories)
1. ⭐ **VisualParity** - Validates token bridge works
2. ⭐ **SemanticStates** - Core feature showcase
3. ⭐ **UnderlayEffects** - Differentiator feature
4. ⭐ **FilterDrawer** - Real-world recipe
5. ⭐ **NonDismissible** - Critical use case

### **Tier 2: Should Have Soon** (8 stories)
6. ScrimStrategies
7. FooterModes
8. BackdropVariants
9. QuickSwitcher
10. NowPlaying
11. CheckoutFlow
12. Telemetry
13. CustomScrimFn

### **Tier 3: Nice to Have** (9 stories)
14. ModalityComparison
15. KeyboardAware
16. NestedSheets
17. DataAttributes
18. SafeArea
19. RotationAdaptive
20. ReducedMotion
21. LongContent
22. EmptyStates

---

## **Story Template (Copy-Paste)**

```tsx
export const StoryName: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setOpen(true)}>
          Open Sheet
        </button>
        
        <Sheet
          open={open}
          onOpenChange={setOpen}
          ariaLabel="Story Title"
          // ... props
        >
          <Sheet.Header>
            <h3>Title</h3>
          </Sheet.Header>
          
          <Sheet.Content>
            <p>Content...</p>
          </Sheet.Content>
          
          <Sheet.Footer data-footer-safe>
            <button onClick={() => setOpen(false)}>
              Close
            </button>
          </Sheet.Footer>
        </Sheet>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Description of what this story demonstrates...',
      },
    },
  },
};
```

---

## **Testing Integration**

### **Playwright Tests (from Stories)**
Use Storybook's `play` functions for automated tests:

```typescript
export const VisualParity: Story = {
  // ... render
  play: async ({ canvasElement }) => {
    // 1. Open sheet
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    
    // 2. Verify data attributes
    const sheet = within(canvasElement).getByTestId('sheet');
    await expect(sheet).toHaveAttribute('data-bucket', 'peek');
    
    // 3. Change snap
    await userEvent.click(within(canvasElement).getByText('Work (50%)'));
    await expect(sheet).toHaveAttribute('data-bucket', 'work');
  },
};
```

### **Axe A11y Checks**
Add to all stories:

```typescript
parameters: {
  a11y: {
    config: {
      rules: [
        { id: 'color-contrast', enabled: true },
        { id: 'aria-required-attr', enabled: true },
      ],
    },
  },
}
```

---

## **Documentation Panel Content**

Each story should include in `parameters.docs`:

1. **What it demonstrates**
2. **Key props used**
3. **When to use this pattern**
4. **Code snippet** (copy-pasteable)
5. **Related stories** (cross-links)

Example:

```tsx
parameters: {
  docs: {
    description: {
      story: `
**Demonstrates**: Non-dismissible modal pattern for checkout flows.

**Key Props**:
- \`dismissible={false}\` - Prevents ESC/overlay dismiss
- \`modality="modal"\` - Blocks underlay interaction
- \`data-footer-safe\` - iOS safe-area padding

**When to Use**:
- Payment/checkout flows
- Critical multi-step forms
- Required onboarding

**See Also**: ModalityComparison, CheckoutFlow recipe
      `,
    },
  },
}
```

---

## **Total Story Count**

- **Current**: 10 stories
- **Tier 1 (Must Have)**: +5 stories
- **Tier 2 (Should Have)**: +8 stories
- **Tier 3 (Nice to Have)**: +9 stories

**Grand Total**: **32 stories** (comprehensive showcase)

---

## **Next Steps**

1. ✅ Create story plan (this doc)
2. 🔄 **Implement Tier 1 stories** (5 stories)
3. 🔄 Add Playwright tests to key stories
4. 🔄 Add docs panel descriptions
5. 🔄 Implement Tier 2 stories (8 stories)
6. 🔄 Polish & screenshot all stories
7. 🔄 Add to README: "See 32 stories in Storybook"

---

**Status**: ✅ **PLAN COMPLETE**  
**Next**: Implement Tier 1 stories (VisualParity, SemanticStates, UnderlayEffects, FilterDrawer, NonDismissible)
