/**
 * Dev-only diagnostics helpers for debugging DS components
 * Query components by data-component attribute and log state
 */

/**
 * Query and log modal state
 * @param id - Optional specific modal ID to debug
 */
export function debugModal(id?: string) {
  if (typeof window === 'undefined') return;
  
  const selector = id 
    ? `[data-component="modal"][data-modal-id="${id}"]`
    : '[data-component="modal"]';
  
  const modals = document.querySelectorAll(selector);
  
  console.group(`🔍 Modal Debug (found: ${modals.length})`);
  modals.forEach((modal, idx) => {
    const state = modal.getAttribute('data-state');
    const label = modal.getAttribute('data-label') || modal.getAttribute('aria-label');
    const zIndex = window.getComputedStyle(modal).zIndex;
    
    console.log(`Modal ${idx + 1}:`, {
      state,
      label,
      zIndex,
      focusableCount: modal.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').length,
      element: modal,
    });
  });
  console.groupEnd();
}

/**
 * Query and log drawer state
 * @param id - Optional specific drawer ID to debug
 */
export function debugDrawer(id?: string) {
  if (typeof window === 'undefined') return;
  
  const selector = id
    ? `[data-component="drawer"][data-drawer-id="${id}"]`
    : '[data-component="drawer"]';
  
  const drawers = document.querySelectorAll(selector);
  
  console.group(`🔍 Drawer Debug (found: ${drawers.length})`);
  drawers.forEach((drawer, idx) => {
    const state = drawer.getAttribute('data-state');
    const label = drawer.getAttribute('data-label') || drawer.getAttribute('aria-label');
    const position = drawer.getAttribute('data-position');
    
    console.log(`Drawer ${idx + 1}:`, {
      state,
      label,
      position,
      element: drawer,
    });
  });
  console.groupEnd();
}

/**
 * Query and log field state (error/hint wiring)
 * @param id - Optional specific field ID to debug
 */
export function debugField(id?: string) {
  if (typeof window === 'undefined') return;
  
  const selector = id ? `#${id}` : '[data-component="field"]';
  const fields = document.querySelectorAll(selector);
  
  console.group(`🔍 Field Debug (found: ${fields.length})`);
  fields.forEach((field, idx) => {
    const input = field.querySelector('input, select, textarea');
    const invalid = input?.getAttribute('aria-invalid');
    const describedBy = input?.getAttribute('aria-describedby');
    const required = input?.getAttribute('aria-required') || input?.hasAttribute('required');
    
    console.log(`Field ${idx + 1}:`, {
      id: input?.id,
      invalid: invalid === 'true',
      describedBy: describedBy?.split(' '),
      required: required === 'true' || required === true,
      element: field,
    });
  });
  console.groupEnd();
}

/**
 * Global debug mode toggle
 * Set window.__DS_DEBUG = true to enable verbose logging
 */
declare global {
  interface Window {
    __DS_DEBUG?: boolean;
    debugModal: typeof debugModal;
    debugDrawer: typeof debugDrawer;
    debugField: typeof debugField;
  }
}

// Expose helpers globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  window.debugModal = debugModal;
  window.debugDrawer = debugDrawer;
  window.debugField = debugField;
}
