/**
 * Z-Index Coordination System
 * 
 * Fixed numerical slots prevent z-index wars.
 * Published map ensures everyone knows the hierarchy.
 * 
 * Philosophy:
 * - Base content: 0-99
 * - Sticky elements: 100-199
 * - Dropdowns/Popovers: 200-299
 * - Overlays/Modals: 300-399
 * - Toasts/Notifications: 400-499
 * - Tooltips: 500-599
 * - Onboarding/Tours: 600-699
 */

export const Z_INDEX_TOKENS = {
  // Base layer (0-99)
  base: 0,
  
  // Sticky elements (100-199)
  stickyHeader: 100,
  stickyFooter: 101,
  stickyNav: 102,
  
  // Dropdowns & Popovers (200-299)
  dropdown: 200,
  popover: 201,
  autocomplete: 202,
  
  // Overlays & Modals (300-399)
  overlayBackdrop: 300,
  overlay: 301,
  modal: 302,
  drawer: 303,
  
  // Toasts & Notifications (400-499)
  toast: 400,
  notification: 401,
  snackbar: 402,
  
  // Tooltips (500-599)
  tooltip: 500,
  
  // Onboarding & Tours (600-699)
  spotlight: 600,
  tour: 601,
  
  // Emergency/Debug (700+)
  debug: 999,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX_TOKENS;

/**
 * Get z-index value by semantic name
 */
export const getZIndex = (key: ZIndexKey): number => Z_INDEX_TOKENS[key];

/**
 * Portal Stack Coordinator
 * Assigns z-index slots and prevents overlaps
 */
export class PortalStackCoordinator {
  private activeStacks: Map<string, number> = new Map();
  private stackCounter = 0;
  
  /**
   * Register a new portal and get its z-index
   */
  register(id: string, baseLayer: ZIndexKey): number {
    const baseZ = Z_INDEX_TOKENS[baseLayer];
    const offset = this.stackCounter++;
    const finalZ = baseZ + offset;
    
    this.activeStacks.set(id, finalZ);
    return finalZ;
  }
  
  /**
   * Unregister a portal
   */
  unregister(id: string): void {
    this.activeStacks.delete(id);
    
    // Reset counter if all stacks cleared
    if (this.activeStacks.size === 0) {
      this.stackCounter = 0;
    }
  }
  
  /**
   * Get current z-index for a portal
   */
  get(id: string): number | undefined {
    return this.activeStacks.get(id);
  }
  
  /**
   * Get the topmost z-index
   */
  getTopmost(): number {
    const values = Array.from(this.activeStacks.values());
    return values.length > 0 ? Math.max(...values) : 0;
  }
}

// Global coordinator instance
export const portalStack = new PortalStackCoordinator();

/**
 * React hook for coordinated z-index
 */
export function useCoordinatedZIndex(baseLayer: ZIndexKey, id?: string): number {
  const portalId = id || `portal-${Math.random().toString(36).substr(2, 9)}`;
  
  // Register on mount, unregister on unmount
  const zIndex = portalStack.register(portalId, baseLayer);
  
  return zIndex;
}
