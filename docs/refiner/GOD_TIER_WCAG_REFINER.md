# God Tier WCAG Refiner Enhancement Plan

**Goal:** Catch 100% of WCAG violations automatically before they reach production.

**Current Coverage:** ~60% (hardcoded colors, text contrast)  
**Target Coverage:** ~95% (everything except subjective perception)

---

## Current Gaps (What We Missed)

### 1. CSS Variable Values ❌
**Problem:** Only checks hardcoded hex/rgb, not `var(--ds-color-*)`  
**Missed:** Light gray hover state (#fafafa on white)  
**Impact:** Critical visual affordance failures

### 2. Interactive States ❌
**Problem:** Only checks static/default state  
**Missed:** Hover, focus, active, disabled states  
**Impact:** Users can't see feedback

### 3. Non-Text Contrast ❌
**Problem:** Only checks text contrast (4.5:1)  
**Missed:** WCAG 1.4.11 - UI components need 3:1  
**Impact:** Borders, focus rings, hover states fail

### 4. Touch Targets ❌
**Problem:** No size validation  
**Missed:** 18px checkbox, 22px toggle (need 44px)  
**Impact:** Mobile users can't tap accurately

### 5. Runtime Validation ❌
**Problem:** Build-time only, no browser checks  
**Missed:** Computed styles, inherited values  
**Impact:** False negatives

---

## God Tier Enhancement: 5 Layers

### Layer 1: Static Analysis (Build Time)
**What:** AST parsing of source code  
**When:** Pre-commit, CI  
**Coverage:** 40%

**Checks:**
- ✅ Hardcoded colors
- ✅ Missing ARIA attributes
- ✅ Duplicate props
- ✅ Invalid HTML
- 🆕 CSS variable usage patterns
- 🆕 Missing hover/focus styles
- 🆕 Touch target declarations

### Layer 2: Token Resolution (Build Time)
**What:** Resolve CSS variables to actual values  
**When:** Pre-commit, CI  
**Coverage:** +30%

**Implementation:**
```javascript
// scripts/refiner/transforms/resolve-css-variables.mjs

export default function resolveCssVariables() {
  return {
    name: 'resolve-css-variables',
    version: '1.0',
    
    async init() {
      // Load design tokens
      this.tokens = await loadTokens('packages/ds/src/styles/tokens/color.vars.css');
    },
    
    JSXElement(path) {
      const styleAttr = findStyleAttr(path.node);
      if (!styleAttr) return;
      
      const bgProp = findProperty(styleAttr, 'background');
      if (!bgProp) return;
      
      const value = extractValue(bgProp);
      
      // Check if it's a CSS variable
      if (value.includes('var(--')) {
        const varName = extractVarName(value);
        const resolvedValue = this.tokens[varName];
        
        if (resolvedValue) {
          // Now check contrast with resolved value
          this.checkContrast(resolvedValue, path);
        }
      }
    },
    
    checkContrast(bgColor, path) {
      // Extract text color from same element
      const textColor = extractTextColor(path.node);
      const ratio = calculateContrast(bgColor, textColor);
      
      if (ratio < 4.5) {
        this.report(path, 
          `Low contrast: ${ratio.toFixed(2)}:1 (need 4.5:1)\n` +
          `   Background: ${bgColor}\n` +
          `   Text: ${textColor}`
        );
      }
    }
  };
}

// Helper: Load tokens from CSS file
async function loadTokens(cssFile) {
  const content = await fs.readFile(cssFile, 'utf-8');
  const tokens = {};
  
  // Parse CSS custom properties
  const regex = /--([a-z-]+):\s*([^;]+);/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const [, name, value] = match;
    tokens[`--${name}`] = value.trim();
  }
  
  return tokens;
}
```

### Layer 3: Interactive State Validation (Build Time)
**What:** Check hover/focus/active patterns  
**When:** Pre-commit, CI  
**Coverage:** +15%

**Implementation:**
```javascript
// scripts/refiner/transforms/validate-interactive-states.mjs

export default function validateInteractiveStates() {
  return {
    name: 'validate-interactive-states',
    version: '1.0',
    
    JSXElement(path) {
      const { node } = path;
      const elementName = node.openingElement.name.name;
      
      // Check interactive elements
      const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
      if (!interactiveElements.includes(elementName)) return;
      
      const styleAttr = findStyleAttr(node);
      if (!styleAttr) return;
      
      const hasHoverStyle = checkForHoverStyle(node);
      const hasFocusStyle = checkForFocusStyle(node);
      
      // Check for hover/focus indicators
      if (!hasHoverStyle && !hasFocusStyle) {
        this.report(path,
          `Interactive element <${elementName}> missing hover/focus state.\n` +
          `   Add hover background or focus ring for visual feedback.`
        );
      }
      
      // If has hover, check visibility
      if (hasHoverStyle) {
        const hoverBg = extractHoverBackground(node);
        if (hoverBg) {
          const visibility = checkVisualAffordance(hoverBg);
          if (visibility < 3.0) {
            this.report(path,
              `Hover state barely visible (${visibility.toFixed(2)}:1).\n` +
              `   Need 3:1 contrast for WCAG 1.4.11 (Non-Text Contrast).\n` +
              `   Consider: var(--ds-color-primary-bg-subtle) or add border.`
            );
          }
        }
      }
    }
  };
}

// Helper: Check if background change is visible
function checkVisualAffordance(hoverBg) {
  // Compare hover background to default container background
  const containerBg = '#ffffff'; // or extract from context
  return calculateContrast(hoverBg, containerBg);
}
```

### Layer 4: Touch Target Validation (Build Time)
**What:** Validate minimum 44×44px interactive area  
**When:** Pre-commit, CI  
**Coverage:** +5%

**Implementation:**
```javascript
// scripts/refiner/transforms/validate-touch-targets.mjs

export default function validateTouchTargets() {
  return {
    name: 'validate-touch-targets',
    version: '1.0',
    
    JSXElement(path) {
      const { node } = path;
      const elementName = node.openingElement.name.name;
      
      // Check interactive elements
      const interactiveElements = ['button', 'a', 'input'];
      if (!interactiveElements.includes(elementName)) return;
      
      const styleAttr = findStyleAttr(node);
      if (!styleAttr) return;
      
      const size = extractSize(styleAttr);
      
      // Check minimum touch target
      if (size.width < 44 || size.height < 44) {
        // Check if wrapped in larger clickable area
        const parentHasLargeTarget = checkParentTouchTarget(path);
        
        if (!parentHasLargeTarget) {
          this.report(path,
            `Touch target too small: ${size.width}×${size.height}px (need 44×44px)\n` +
            `   Add: minHeight: '44px', minWidth: '44px'\n` +
            `   Or wrap in label/button with 44px touch area.\n` +
            `   WCAG 2.5.5 - affects 15% of users (motor disabilities).`
          );
        }
      }
    }
  };
}

// Helper: Extract size from style
function extractSize(styleAttr) {
  const width = extractValue(findProperty(styleAttr, 'width')) || 
                extractValue(findProperty(styleAttr, 'minWidth')) || 
                'auto';
  const height = extractValue(findProperty(styleAttr, 'height')) ||
                 extractValue(findProperty(styleAttr, 'minHeight')) ||
                 'auto';
  
  return {
    width: parsePx(width),
    height: parsePx(height)
  };
}
```

### Layer 5: Runtime Validation (Browser)
**What:** Check actual computed styles in browser  
**When:** Dev mode, E2E tests  
**Coverage:** +5%

**Implementation:**
```javascript
// packages/ds/src/a11y/runtime-wcag-validator.ts

export class RuntimeWcagValidator {
  private violations: Violation[] = [];
  
  // Run on page load
  static init() {
    if (process.env.NODE_ENV !== 'production') {
      const validator = new RuntimeWcagValidator();
      validator.validate();
    }
  }
  
  validate() {
    // Check all interactive elements
    const elements = document.querySelectorAll('button, a, input, select, textarea');
    
    elements.forEach(el => {
      this.validateElement(el as HTMLElement);
    });
    
    if (this.violations.length > 0) {
      console.group('🚨 WCAG Violations');
      this.violations.forEach(v => console.error(v));
      console.groupEnd();
    }
  }
  
  validateElement(el: HTMLElement) {
    // 1. Touch target
    const rect = el.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      this.violations.push({
        element: el,
        rule: 'WCAG 2.5.5 Touch Target',
        severity: 'error',
        message: `Touch target: ${rect.width}×${rect.height}px (need 44×44px)`
      });
    }
    
    // 2. Text contrast
    const computed = window.getComputedStyle(el);
    const bg = computed.backgroundColor;
    const text = computed.color;
    const ratio = this.calculateContrast(bg, text);
    
    if (ratio < 4.5) {
      this.violations.push({
        element: el,
        rule: 'WCAG 1.4.3 Contrast',
        severity: 'error',
        message: `Text contrast: ${ratio.toFixed(2)}:1 (need 4.5:1)`
      });
    }
    
    // 3. Focus indicator
    el.addEventListener('focus', () => {
      const focusStyles = window.getComputedStyle(el);
      const hasOutline = focusStyles.outline !== 'none';
      const hasBoxShadow = focusStyles.boxShadow !== 'none';
      
      if (!hasOutline && !hasBoxShadow) {
        this.violations.push({
          element: el,
          rule: 'WCAG 2.4.7 Focus Visible',
          severity: 'warning',
          message: 'No visible focus indicator'
        });
      }
    }, { once: true });
  }
  
  calculateContrast(bg: string, text: string): number {
    // Implementation...
  }
}
```

---

## Implementation Phases

### Phase 1: Token Resolution (Week 1)
- [ ] Build CSS variable resolver
- [ ] Integrate with existing contrast checker
- [ ] Test with all design tokens
- [ ] Add to refiner pipeline

**Expected Impact:** +30% coverage

### Phase 2: Interactive State Validation (Week 2)
- [ ] Add hover/focus style checker
- [ ] Validate visual affordance (3:1 contrast)
- [ ] Check conditional styling patterns
- [ ] Add to refiner pipeline

**Expected Impact:** +15% coverage

### Phase 3: Touch Target Validation (Week 2)
- [ ] Add size extraction from JSX
- [ ] Check parent wrapper touch targets
- [ ] Validate all interactive elements
- [ ] Add to refiner pipeline

**Expected Impact:** +5% coverage

### Phase 4: Runtime Validation (Week 3)
- [ ] Build browser validator
- [ ] Integrate with dev mode
- [ ] Add to Playwright tests
- [ ] Visual regression integration

**Expected Impact:** +5% coverage

### Phase 5: CI Integration (Week 3)
- [ ] Add all checks to pre-commit
- [ ] Create PR comment bot
- [ ] Block merge on violations
- [ ] Track metrics over time

---

## Refiner Configuration

### Enhanced Config
```yaml
# .refinerrc.yml

transforms:
  # Existing
  - dedupe-jsx-attrs
  - enforce-aria-attrs
  - enforce-ds-primitives
  - no-hardcoded-colors
  
  # NEW: WCAG God Tier
  - resolve-css-variables      # Layer 2
  - validate-interactive-states # Layer 3
  - validate-touch-targets      # Layer 4
  - enforce-hover-visibility    # Layer 3

# WCAG settings
wcag:
  level: AAA              # AA or AAA
  textContrast: 4.5       # 4.5:1 for AA, 7:1 for AAA
  uiContrast: 3.0         # 3:1 for UI components
  touchTarget: 44         # 44×44px minimum
  
  # Token resolution
  tokenFile: packages/ds/src/styles/tokens/color.vars.css
  
  # Runtime validation
  runtime:
    enabled: true
    mode: dev             # dev, test, or production
    failOnViolation: true

# Exemptions (use sparingly)
exemptions:
  - rule: touch-target
    file: packages/forms/src/fields/SignatureField/*
    reason: Canvas requires precise pointer control
```

---

## Expected Results

### Before Enhancement
```
Files scanned: 73
Violations: 0 (missed 5 actual issues)
Coverage: ~60%
```

### After Enhancement
```
Files scanned: 73
Violations: 5 (all actual issues caught)
Coverage: ~95%

Issues Found:
1. ❌ Checkbox touch target: 18×18px (need 44×44px)
2. ❌ Toggle touch target: 40×22px (need 44×44px)
3. ❌ Hover state barely visible: 1.02:1 (need 3:1)
4. ❌ Button contrast: 3.68:1 (need 4.5:1)
5. ❌ Submit button height: 36px (need 44px)
```

---

## Success Metrics

### Coverage Targets
- **Static Analysis:** 95% of objective violations
- **Runtime Validation:** 100% of computed style issues
- **False Positives:** < 2%
- **False Negatives:** < 5%

### Quality Bar
- ✅ All WCAG AA violations caught
- ✅ All WCAG AAA violations warned
- ✅ All touch targets validated
- ✅ All interactive states checked
- ✅ All color combinations tested

### Developer Experience
- Fix suggestions provided
- Auto-fix available when possible
- Clear error messages
- Links to WCAG documentation
- Visual examples in PR comments

---

## The 5% That Stays Manual

**Subjective Perception** (requires human judgment):
- Is the animation smooth?
- Is the microcopy clear?
- Does this feel intuitive?
- Is the visual hierarchy correct?
- Are micro-interactions delightful?

**This is the Factory (95%) + Manual Audit (5%) sweet spot.**

---

## Next Steps

1. **Immediate:** Implement Phase 1 (Token Resolution)
2. **This Week:** Implement Phases 2-3 (Interactive + Touch)
3. **Next Week:** Implement Phases 4-5 (Runtime + CI)
4. **Ongoing:** Monitor metrics, tune thresholds

---

**Result:** God Tier WCAG validation that catches 95% of issues automatically, leaving only subjective quality for human review.
