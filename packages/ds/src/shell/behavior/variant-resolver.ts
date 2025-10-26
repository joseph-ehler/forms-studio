/**
 * Variant Resolver (Layer 4: Behavior)
 * 
 * Translates shell props (variants) → data-* attributes + --shell-* CSS variables.
 * This is the "contract publisher" that shells use to communicate with CSS.
 * 
 * Rules:
 * - Never sets inline styles (only data-* + CSS vars)
 * - Boolean attrs: true → data-x="true", false → remove attr
 * - Number vars: auto-append px (e.g., 280 → "280px")
 * - String vars: pass through as-is
 * - Batch writes in single RAF tick (avoid thrashing)
 * - RAF flood guard: Coalesce multiple applyContract calls per frame
 */

// RAF flood guard: Shared state for coalescing
let pendingRAF: number | null = null;
const pendingUpdates = new Map<HTMLElement, {
  attrs?: Record<string, string | boolean>;
  vars?: Record<string, string | number>;
}>();

/**
 * Normalize variable value (numbers → px, unless suffix present)
 */
function normalizeVarValue(value: string | number): string {
  if (typeof value === 'number') return `${value}px`;
  // If string already has suffix (%, fr, em, rem, etc.), pass through
  return value;
}

/**
 * Apply contract (attrs + vars) to element
 * 
 * Batches writes in single RAF tick for performance
 * Coalesces attribute changes (removals in same tick as additions)
 * 
 * @example
 * ```tsx
 * applyContract(rootEl, {
 *   attrs: { 
 *     'shell-mode': 'desktop',
 *     'nav-open': true,
 *     'panels-overlay': false 
 *   },
 *   vars: { 
 *     'nav-w': 280,
 *     'panels-w': 360,
 *     'header-h': '56px' 
 *   }
 * });
 * ```
 */
export function applyContract(
  element: HTMLElement,
  contract: {
    attrs?: Record<string, string | boolean>;
    vars?: Record<string, string | number>;
  }
): void {
  // Store update for this element (merges with any existing pending update)
  const existing = pendingUpdates.get(element);
  pendingUpdates.set(element, {
    attrs: { ...existing?.attrs, ...contract.attrs },
    vars: { ...existing?.vars, ...contract.vars },
  });
  
  // Schedule RAF only if one isn't already pending (flood guard)
  if (pendingRAF === null) {
    pendingRAF = requestAnimationFrame(() => {
      // Process all pending updates in a single frame
      pendingUpdates.forEach((update, el) => {
        // Apply attributes (coalesce adds and removals)
        if (update.attrs) {
          Object.entries(update.attrs).forEach(([key, value]) => {
            const attrName = key.startsWith('data-') ? key : `data-${key}`;
            
            if (typeof value === 'boolean') {
              if (value) {
                el.setAttribute(attrName, 'true');
              } else {
                el.removeAttribute(attrName);
              }
            } else {
              el.setAttribute(attrName, value);
            }
          });
        }
        
        // Apply CSS variables (normalized)
        if (update.vars) {
          Object.entries(update.vars).forEach(([key, value]) => {
            const varName = key.startsWith('--') ? key : `--shell-${key}`;
            const varValue = normalizeVarValue(value);
            el.style.setProperty(varName, varValue);
          });
        }
      });
      
      // Clear state for next frame
      pendingUpdates.clear();
      pendingRAF = null;
    });
  }
}

/**
 * Publish CSS variables for shell layout
 * 
 * Batched in single RAF tick
 */
export function publishShellVars(
  root: HTMLElement, 
  vars: Record<string, string | number>
): void {
  requestAnimationFrame(() => {
    Object.entries(vars).forEach(([key, value]) => {
      const varName = key.startsWith('--') ? key : `--shell-${camelToKebab(key)}`;
      const varValue = typeof value === 'number' ? `${value}px` : value;
      root.style.setProperty(varName, varValue);
    });
  });
}

/**
 * Publish data attributes for shell state
 * 
 * Batched in single RAF tick
 */
export function publishShellAttrs(
  root: HTMLElement, 
  attrs: Record<string, string | boolean>
): void {
  requestAnimationFrame(() => {
    Object.entries(attrs).forEach(([key, value]) => {
      const attrName = `data-${camelToKebab(key)}`;
      
      if (typeof value === 'boolean') {
        if (value) {
          root.setAttribute(attrName, 'true');
        } else {
          root.removeAttribute(attrName);
        }
      } else {
        root.setAttribute(attrName, value);
      }
    });
  });
}

/**
 * Helper: Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
