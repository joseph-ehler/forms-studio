# ADR: Component Taxonomy & Class-Based Factory

**Date**: 2025-01-25  
**Status**: ✅ **ACCEPTED & IMPLEMENTED**  
**Deciders**: Engineering Team

---

## **Context**

During Core Six DS primitive generation, we encountered systematic failures:

1. **Checkboxes/Radios didn't toggle** - Generated as containers, not controlled inputs
2. **Toggle switches broken** - Missing required `checked`/`onChange` props
3. **Sheet/Modal confusion** - Conflated overlay types (desktop dialog vs mobile sheet)
4. **30+ minutes fixing each component** - Generator produced broken code

**Root Cause**: Name-based stamping without behavioral classification.

We generated components by name (Checkbox, Sheet) without understanding their behavioral class (Input, Dialog, Sheet).

---

## **Decision**

Adopt a **Class-Based Factory** with mandatory classification before generation.

### **The 7 Component Classes**

1. **Input** - Controlled form elements (Checkbox, Radio, Toggle)
2. **Container** - Passive display (Badge, Chip)
3. **Dialog** - Modal overlays (Modal, AlertDialog)
4. **Sheet** - Gesture overlays (BottomSheet, Drawer)
5. **Positioned** - Anchored floating (Popover, Tooltip)
6. **Virtualized** - Large lists (VirtualList)
7. **CompositeWidget** - Complex stateful (Combobox, DatePicker)

### **The Decision Ladder (Flowbite-First)**

Before stamping ANY component:

1. **Does Flowbite have it?** → Wrap it
2. **Can we compose from Flowbite parts?** → Build pattern
3. **Is headless engine justified?** → Use adapter
4. **None of the above?** → Write ADR, defer

---

## **Implementation**

### **1. Central Registry**

Created `packages/ds/src/control/components.classmap.json`:

```json
{
  "Checkbox": {
    "class": "Input",
    "engine": "Flowbite",
    "flowbiteName": "Checkbox",
    "controlledProps": ["checked", "onChange"],
    "acceptsChildren": false
  }
}
```

### **2. Research Gate (Hard)**

Generator now **refuses** to run without:
- Research snapshot (`pnpm ds:research <Name>`)
- Classmap entry

### **3. Class-Specific Templates**

Generator reads classmap and uses class-appropriate template:
- **Input** → Controlled props, no children, label wrapper examples
- **Container** → Children prop, passthrough
- **Dialog** → Focus trap, ESC close, aria-label
- **Sheet** → Gestures opt-in, mobile-optimized

### **4. ESLint Rule**

Added `no-children-on-inputs` rule:

```javascript
// ❌ Forbidden
<Checkbox>Label</Checkbox>

// ✅ Required
<label><Checkbox /><span>Label</span></label>
```

### **5. Class Canaries**

Added class-specific tests:
- **Input**: Click toggles state, radio grouping
- **Dialog**: ESC closes, focus returns
- **Sheet**: Drag dismiss, `onBeforeDismiss`

---

## **Consequences**

### **Positive**

1. **Correctness by default** - Generator produces working code first time
2. **Clarity** - Developers know what each component does
3. **No surprises** - Can't generate broken components
4. **Flowbite-first** - Reuse battle-tested components
5. **Fast for 80%** - Inputs/Containers/Dialogs stamp in 2 minutes
6. **Deliberate for 20%** - CompositeWidgets require ADR (intentional)

### **Negative** (Acceptable Tradeoffs)

1. **Upfront classification** - Must classify before stamping (5 min research)
2. **Classmap maintenance** - Must update registry for new components
3. **Template divergence** - Different templates per class (but this is the point!)

### **Risks Mitigated**

1. ✅ **Can't forget to classify** - Generator refuses without classmap entry
2. ✅ **Can't use wrong template** - Generator reads class from classmap
3. ✅ **Can't skip research** - Research snapshot required
4. ✅ **Can't add children to inputs** - ESLint rule enforces
5. ✅ **Can't ship broken** - Class canaries must pass

---

## **Alternatives Considered**

### **Alt 1: Keep Name-Based Generation**

**Rejected**: This is what caused the problem. Name doesn't encode behavior.

### **Alt 2: One Smart Template**

**Rejected**: Tried to be too clever. Different classes have fundamentally different APIs.

### **Alt 3: Manual Classification Per Generation**

**Rejected**: Too error-prone. Developers would forget or misclassify.

**Chosen**: Centralized classmap + mandatory research gate.

---

## **Metrics**

### **Before**

- 0/5 components worked first time
- 30+ min per component to fix
- Repeated mistakes (same bugs)

### **After (Expected)**

- 5/5 components work first time
- 2-15 min per component (depends on class)
- Mistakes impossible (hard gates)

---

## **Open Questions**

1. **How to handle hybrid components?**
   - **Decision**: Force to single class. If ambiguous, write ADR.

2. **What about non-Flowbite components?**
   - **Decision**: Follow decision ladder. Flowbite first, headless engine behind adapter if justified.

3. **How to evolve classes over time?**
   - **Decision**: Classmap is versioned. Breaking changes go through ADR.

---

## **References**

- `docs/handbook/COMPONENT_TAXONOMY.md` - Full taxonomy
- `docs/handbook/DS_GENERATION_WORKFLOW.md` - Workflow
- `docs/handbook/FLOWBITE_RESEARCH_PROTOCOL.md` - Research process
- `packages/ds/src/control/components.classmap.json` - Registry
- `tools/eslint-plugin-cascade/no-children-on-inputs.js` - ESLint rule

---

## **Approval**

**Approved by**: Engineering Team  
**Date**: 2025-01-25  
**Implementation**: ✅ Complete

---

## **Post-Implementation Review** (30 days)

- [ ] Review component generation success rate
- [ ] Measure time to generate per class
- [ ] Survey developer satisfaction
- [ ] Identify new classes if needed
- [ ] Update decision ladder if Flowbite patterns emerge

---

**Bottom Line**: Class first, then stamp. Flowbite first, then headless. Research mandatory. No surprises.
