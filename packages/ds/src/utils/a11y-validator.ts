/**
 * Runtime Accessibility Validator
 * 
 * Runs in development to catch accessibility issues live.
 * Provides helpful error messages that explain WHY, not just WHAT.
 * 
 * Philosophy:
 * - Catch issues before they ship
 * - Educate developers on WHY accessibility matters
 * - Make violations loud and impossible to ignore
 */

interface A11yViolation {
  type: 'error' | 'warning';
  rule: string;
  element: HTMLElement;
  message: string;
  why: string;
  fix: string;
  impact: string;
  affectedUsers: string;
}

class A11yValidator {
  private violations: A11yViolation[] = [];
  private observer: MutationObserver | null = null;
  
  /**
   * Start validation
   */
  start(): void {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log('🔍 A11y Validator: Running...');
    
    // Initial check
    this.validateDocument();
    
    // Watch for changes
    this.observer = new MutationObserver(() => {
      this.validateDocument();
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'aria-labelledby', 'role', 'tabindex'],
    });
  }
  
  /**
   * Stop validation
   */
  stop(): void {
    this.observer?.disconnect();
  }
  
  /**
   * Validate entire document
   */
  private validateDocument(): void {
    this.violations = [];
    
    // Check all rules
    this.checkInputLabels();
    this.checkTouchTargets();
    this.checkColorContrast();
    this.checkFocusVisible();
    this.checkHeadingHierarchy();
    this.checkARIA();
    this.checkKeyboardAccessible();
    
    // Report violations
    this.report();
  }
  
  /**
   * Check: All inputs have labels
   */
  private checkInputLabels(): void {
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    
    inputs.forEach((input) => {
      const hasLabel = this.hasAssociatedLabel(input as HTMLElement);
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel) {
        this.violations.push({
          type: 'error',
          rule: 'input-has-label',
          element: input as HTMLElement,
          message: `Input without label: ${input.getAttribute('name') || input.getAttribute('type')}`,
          why: 'Screen readers cannot announce what this field is for without a label',
          fix: 'Add <label htmlFor="..."> or aria-label="..."',
          impact: 'CRITICAL - Field is unusable for blind users',
          affectedUsers: '8% of users (blind/low-vision)',
        });
      }
    });
  }
  
  /**
   * Check: Touch targets are 44x44px minimum
   */
  private checkTouchTargets(): void {
    const interactive = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [onclick]');
    
    interactive.forEach((el) => {
      const rect = el.getBoundingClientRect();
      
      if (rect.width < 44 || rect.height < 44) {
        this.violations.push({
          type: 'error',
          rule: 'min-touch-target',
          element: el as HTMLElement,
          message: `Touch target too small: ${Math.round(rect.width)}×${Math.round(rect.height)}px (need 44×44px)`,
          why: 'Users with motor impairments (Parkinson\'s, arthritis) cannot accurately tap small targets',
          fix: 'Increase padding or min-height/min-width to 44px',
          impact: 'HIGH - Element is hard to tap on mobile',
          affectedUsers: '15% of users (motor disabilities, elderly)',
        });
      }
    });
  }
  
  /**
   * Check: Color contrast meets WCAG AA (4.5:1)
   */
  private checkColorContrast(): void {
    const text = document.querySelectorAll('p, span, div, label, button, a, h1, h2, h3, h4, h5, h6');
    
    text.forEach((el) => {
      if (!el.textContent?.trim()) return;
      
      const style = getComputedStyle(el);
      const color = style.color;
      const bg = this.getBackgroundColor(el as HTMLElement);
      
      if (!bg) return;
      
      const contrast = this.getContrastRatio(color, bg);
      
      if (contrast < 4.5) {
        this.violations.push({
          type: 'error',
          rule: 'color-contrast',
          element: el as HTMLElement,
          message: `Low contrast: ${contrast.toFixed(2)}:1 (need 4.5:1)`,
          why: 'Low-vision users cannot read text with poor contrast. Like reading gray text on white paper.',
          fix: 'Darken text color or lighten background',
          impact: 'CRITICAL - Text is unreadable for low-vision users',
          affectedUsers: '4% of users (low vision, color blindness)',
        });
      }
    });
  }
  
  /**
   * Check: Focus is visible
   */
  private checkFocusVisible(): void {
    const focusable = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusable.forEach((el) => {
      const style = getComputedStyle(el);
      const outline = style.outline;
      const boxShadow = style.boxShadow;
      
      // Very simplified check
      if (outline === 'none' && boxShadow === 'none') {
        this.violations.push({
          type: 'warning',
          rule: 'focus-visible',
          element: el as HTMLElement,
          message: 'Element may not show focus indicator',
          why: 'Keyboard users cannot see where they are on the page without focus indicators',
          fix: 'Add :focus-visible styles with outline or box-shadow',
          impact: 'HIGH - Keyboard users get lost',
          affectedUsers: '20% of users (keyboard-only)',
        });
      }
    });
  }
  
  /**
   * Check: Heading hierarchy
   */
  private checkHeadingHierarchy(): void {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1));
      
      if (level - lastLevel > 1) {
        this.violations.push({
          type: 'warning',
          rule: 'heading-hierarchy',
          element: heading as HTMLElement,
          message: `Skipped heading level: ${lastLevel} → ${level}`,
          why: 'Screen reader users navigate by headings. Skipping levels breaks navigation flow.',
          fix: `Use h${lastLevel + 1} instead of h${level}`,
          impact: 'MEDIUM - Makes page hard to navigate',
          affectedUsers: '8% of users (screen readers)',
        });
      }
      
      lastLevel = level;
    });
  }
  
  /**
   * Check: ARIA usage
   */
  private checkARIA(): void {
    const withAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    
    withAria.forEach((el) => {
      // Check aria-labelledby points to existing ID
      const labelledBy = el.getAttribute('aria-labelledby');
      if (labelledBy && !document.getElementById(labelledBy)) {
        this.violations.push({
          type: 'error',
          rule: 'aria-labelledby-exists',
          element: el as HTMLElement,
          message: `aria-labelledby="${labelledBy}" references non-existent ID`,
          why: 'Screen readers cannot find the label, so they announce nothing',
          fix: `Ensure element with id="${labelledBy}" exists, or use aria-label instead`,
          impact: 'CRITICAL - Element has no accessible name',
          affectedUsers: '8% of users (screen readers)',
        });
      }
      
      // Check role is valid
      const role = el.getAttribute('role');
      const validRoles = ['button', 'dialog', 'menu', 'menuitem', 'tab', 'tabpanel', 'option', 'listbox', 'alert'];
      if (role && !validRoles.includes(role)) {
        this.violations.push({
          type: 'warning',
          rule: 'valid-aria-role',
          element: el as HTMLElement,
          message: `Uncommon or invalid role: "${role}"`,
          why: 'Screen readers may not recognize this role, breaking semantic meaning',
          fix: 'Use standard ARIA roles or native HTML elements',
          impact: 'MEDIUM - Semantic meaning lost',
          affectedUsers: '8% of users (screen readers)',
        });
      }
    });
  }
  
  /**
   * Check: Keyboard accessible
   */
  private checkKeyboardAccessible(): void {
    const clickable = document.querySelectorAll('[onclick], [onpointerdown]');
    
    clickable.forEach((el) => {
      const role = el.getAttribute('role');
      const tabindex = el.getAttribute('tabindex');
      const tagName = el.tagName.toLowerCase();
      
      // Native interactive elements are fine
      if (['button', 'a', 'input', 'select', 'textarea'].includes(tagName)) return;
      
      // Must have role="button" and tabindex="0"
      if (role !== 'button' || tabindex !== '0') {
        this.violations.push({
          type: 'error',
          rule: 'keyboard-accessible',
          element: el as HTMLElement,
          message: 'Clickable element is not keyboard accessible',
          why: '20% of users use keyboard only (motor disabilities, power users). They cannot activate this element.',
          fix: 'Add role="button" and tabindex="0", or use <button> element instead',
          impact: 'CRITICAL - Element unusable for keyboard users',
          affectedUsers: '20% of users (keyboard-only)',
        });
      }
    });
  }
  
  /**
   * Helper: Check if input has associated label
   */
  private hasAssociatedLabel(input: HTMLElement): boolean {
    const id = input.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return true;
    }
    
    // Check if wrapped in label
    return input.closest('label') !== null;
  }
  
  /**
   * Helper: Get background color (walking up tree)
   */
  private getBackgroundColor(el: HTMLElement): string | null {
    let current: HTMLElement | null = el;
    
    while (current && current !== document.body) {
      const bg = getComputedStyle(current).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }
      current = current.parentElement;
    }
    
    return 'rgb(255, 255, 255)'; // Default to white
  }
  
  /**
   * Helper: Calculate contrast ratio
   */
  private getContrastRatio(fg: string, bg: string): number {
    const l1 = this.getLuminance(fg);
    const l2 = this.getLuminance(bg);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  /**
   * Helper: Get relative luminance
   */
  private getLuminance(color: string): number {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(Number).map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  
  /**
   * Report violations
   */
  private report(): void {
    if (this.violations.length === 0) {
      console.log('✅ A11y Validator: No violations found!');
      return;
    }
    
    const errors = this.violations.filter(v => v.type === 'error');
    const warnings = this.violations.filter(v => v.type === 'warning');
    
    console.group(`🚨 A11y Validator: ${errors.length} errors, ${warnings.length} warnings`);
    
    errors.forEach((v, i) => {
      console.group(`${i + 1}. ❌ ${v.rule}`);
      console.log(`WHAT: ${v.message}`);
      console.log(`WHY: ${v.why}`);
      console.log(`FIX: ${v.fix}`);
      console.log(`IMPACT: ${v.impact}`);
      console.log(`AFFECTS: ${v.affectedUsers}`);
      console.log('ELEMENT:', v.element);
      console.groupEnd();
    });
    
    if (warnings.length > 0) {
      console.group('⚠️ Warnings');
      warnings.forEach((v, i) => {
        console.log(`${i + 1}. ${v.rule}: ${v.message}`);
        console.log(`   WHY: ${v.why}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
  
  /**
   * Get current violations
   */
  getViolations(): A11yViolation[] {
    return this.violations;
  }
}

// Global instance
export const a11yValidator = new A11yValidator();

// Auto-start in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  a11yValidator.start();
}
