/**
 * BottomSheet - Capability-aware bottom drawer
 * 
 * Desktop: Flowbite Modal (precise, keyboard-friendly)
 * Mobile/Touch: Vaul Drawer (drag-to-dismiss, snap points, haptics)
 * Capacitor: Drawer + haptics
 * 
 * Behavior engine chosen by capabilities; visuals from SKIN tokens.
 * 
 * @public
 */

import { Drawer } from 'vaul';
import { Capacitor } from '@capacitor/core';
import './BottomSheet.css';
import type { ReactNode, ReactElement } from 'react';
import { Children, isValidElement, useState, useMemo, useEffect, useId } from 'react';
import { SheetProvider, type SheetUnderlayValue } from './BottomSheetContext';
import { useKeyboardOpen } from '../../hooks/useKeyboardOpen';

// Capability detection (SSR-safe)
const isCoarsePointer = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
};
const isSmallViewport = () => (typeof window !== 'undefined' ? window.innerWidth < 768 : false);
const isCapacitor = (() => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
})();

// Haptic feedback helper
const hapticFeedback = async (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (isCapacitor) {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      const style = type === 'light' ? ImpactStyle.Light : type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy;
      await Haptics.impact({ style });
    } catch (e) {
      // Haptics not available
    }
  }
};

// Scroll lock refcounting (for nested sheets)
let LOCK_COUNT = 0;

// Get the correct underlay root (never document.body!)
const getUnderlayRoot = (): HTMLElement | null => {
  // Storybook iframe case
  const sb = document.getElementById('storybook-root');
  if (sb) return sb;

  // App case
  const app = document.getElementById('app-root');
  if (app) return app;

  // Return null to avoid making the sheet itself inert
  return null;
};

// inert support detection
const supportsInert = typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype;

// ========================================
// SEMANTIC STATE MACHINE TYPES
// ========================================

/**
 * Context passed to custom scrim strategy function
 */
export type ScrimCtx = {
  snap: number;
  modality: 'modal' | 'modeless';
  keyboardOpen: boolean;
};

/**
 * Result returned by custom scrim strategy function
 */
export type ScrimResult = {
  visible: boolean;
  alpha?: number;
};

/**
 * Custom scrim strategy function
 * @example
 * const customScrim: ScrimFn = ({ snap, modality }) => ({
 *   visible: snap >= 0.5,
 *   alpha: 0.3,
 * });
 */
export type ScrimFn = (ctx: ScrimCtx) => ScrimResult;

export type SheetScrimStrategy =
  | 'auto'        // semantic thresholds (PEEK/WORK/OWNED)
  | 'always'      // scrim always visible
  | 'never'       // no scrim
  | ScrimFn;

export type FooterMode = 'auto' | 'always' | 'never';

// ========================================
// SEMANTIC STATE MACHINE: SCRIM RESOLUTION
// ========================================

function resolveScrim(args: {
  strategy: SheetScrimStrategy;
  snap: number;
  modality: 'modal' | 'modeless';
  keyboardOpen: boolean;
  WORK_MIN: number;
  OWNED_MIN: number;
  alphaMin: number;
  alphaMax: number;
}): { visible: boolean; alpha: number } {
  const { strategy, snap, modality, keyboardOpen, WORK_MIN, OWNED_MIN, alphaMin, alphaMax } = args;

  // Custom function strategy
  if (typeof strategy === 'function') {
    const result = strategy({ snap, modality, keyboardOpen });
    return { visible: result.visible, alpha: result.alpha ?? alphaMax };
  }

  // Never show scrim
  if (strategy === 'never') {
    return { visible: false, alpha: 0 };
  }

  // Always show scrim
  if (strategy === 'always') {
    return { visible: true, alpha: alphaMax };
  }

  // Auto strategy: semantic thresholds
  if (modality === 'modeless') {
    // Modeless scrim is subtle; only when near-owned or keyboard to aid contrast
    if (snap >= WORK_MIN || keyboardOpen) {
      const t = Math.max(0, Math.min(1, (snap - WORK_MIN) / (OWNED_MIN - WORK_MIN)));
      return { visible: true, alpha: alphaMin + t * (alphaMax - alphaMin) * 0.6 };
    }
    return { visible: false, alpha: 0 };
  }

  // Modal: show scrim from WORK_MIN threshold
  if (snap < WORK_MIN && !keyboardOpen) {
    return { visible: false, alpha: 0 };
  }
  
  const t = Math.max(0, Math.min(1, (snap - WORK_MIN) / (OWNED_MIN - WORK_MIN)));
  return { visible: true, alpha: alphaMin + t * (alphaMax - alphaMin) };
}

export type SheetProps = {
  /**
   * Whether the sheet is open
   */
  open: boolean;

  /**
   * Callback when sheet open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Accessible label (required for a11y)
   */
  ariaLabel: string;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Sheet content
   */
  children?: React.ReactNode;

  /**
   * Snap points for mobile sheet (0-1, ratio of viewport height)
   * @default undefined (no snaps, full expansion)
   * @example [0.25, 0.5, 0.9] - peek, half, full
   */
  snapPoints?: number[];

  /**
   * Default snap point (fraction 0-1, or null for expanded)
   * @default null (expanded)
   */
  defaultSnap?: number | null;

  /**
   * Controlled snap position (fraction 0-1, or null for expanded)
   * If provided, component is controlled - use with onSnapChange
   * @default undefined (uncontrolled)
   * @example
   * const [snap, setSnap] = useState(0.5);
   * <Sheet snap={snap} onSnapChange={setSnap} />
   */
  snap?: number | null;

  /**
   * Callback when snap position changes
   * @param snap - Current snap fraction (0-1) or null (expanded)
   */
  onSnapChange?: (snap: number | null) => void;

  /**
   * Modality behavior
   * @default 'modal'
   */
  modality?: 'modal' | 'modeless';

  /**
   * Allow dismissing via ESC/overlay click
   * @default true (if modal), false (if modeless)
   */
  dismissible?: boolean;

  /**
   * How sheet interacts with underlay
   * @default 'overlay'
   */
  interaction?: 'overlay' | 'push' | 'resize' | 'inline';

  /**
   * Backdrop/scrim styling
   * @default 'dim'
   */
  backdrop?: 'dim' | 'blur' | 'none';

  /**
   * Disable drag gestures on mobile sheet
   * @default false
   */
  disableDrag?: boolean;

  /**
   * Force modal or sheet rendering (for testing/rollback)
   * Overrides automatic capability detection
   * @default undefined (auto-detect)
   */
  forceMode?: 'modal' | 'sheet';

  /**
   * Callback before dismissing (for confirmation)
   * Return false to prevent dismiss
   * @example
   * onBeforeDismiss={() => {
   *   return window.confirm('Unsaved changes. Close anyway?');
   * }}
   */
  onBeforeDismiss?: () => boolean | Promise<boolean>;

  // ========================================
  // SEMANTIC STATE MACHINE (God-Tier UX)
  // ========================================

  /**
   * Scrim behavior strategy
   * - 'auto': semantic thresholds (PEEK/WORK/OWNED)
   * - 'always': scrim always visible
   * - 'never': no scrim
   * - function: custom logic
   * @default 'auto'
   */
  scrimStrategy?: SheetScrimStrategy;

  /**
   * Scrim alpha range [min, max]
   * @default [0.08, 0.48]
   */
  scrimAlphaRange?: [number, number];

  /**
   * Snap threshold for "WORK" state (scrim starts)
   * @default 0.5
   */
  scrimWorkMin?: number;

  /**
   * Snap threshold for "OWNED" state (scrim peaks)
   * @default 0.9
   */
  scrimOwnedMin?: number;

  /**
   * Allow clicking scrim to dismiss
   * @default true (if modal+dismissible)
   */
  scrimClickDismiss?: boolean;

  /**
   * Header density mode
   * - 'compact': minimal height (peek state)
   * - 'regular': standard height
   * - 'auto': adapt to snap position
   * @default 'auto'
   */
  headerDensity?: 'compact' | 'regular' | 'auto';

  /**
   * Footer visibility mode
   * - 'auto': show when snap >= WORK_MIN or keyboard open
   * - 'always': always visible
   * - 'never': never visible
   * @default 'auto'
   */
  footerMode?: FooterMode;

  /**
   * Apply safe-area-inset-bottom to footer (iOS)
   * @default true
   */
  footerSafeArea?: boolean;

  /**
   * Custom snap threshold for footer reveal
   * @default scrimWorkMin (0.5)
   */
  footerRevealAt?: number;

  /**
   * Enable keyboard awareness (mobile)
   * @default true
   */
  keyboardAware?: boolean;

  /**
   * Keyboard insets mode
   * - 'auto': use visual viewport API
   * - 'off': no insets
   * - number: fixed inset px
   * @default 'auto'
   */
  keyboardInsets?: 'auto' | 'off' | number;

  /**
   * Keyboard detection threshold (px difference for keyboard detection)
   * @default 150 (good for phones; use 120 for tablets)
   */
  keyboardThresholdPx?: number;

  /**
   * Force underlay to be inert
   * @default computed (modal + snap >= WORK_MIN)
   */
  inertUnderlay?: boolean;

  /**
   * Haptic feedback options (Capacitor)
   */
  haptics?: {
    onSnap?: boolean;
    onDismiss?: boolean;
  };

  /**
   * Callback when semantic state changes (peek/work/owned)
   * Useful for analytics, telemetry, and targeted haptics
   */
  onSemanticStateChange?: (bucket: 'peek' | 'work' | 'owned') => void;
};

/**
 * Sheet component - adapts to context
 * 
 * @example
 * ```tsx
 * import { Sheet } from '@intstudio/ds/primitives';
 * 
 * function MyComponent() {
 *   const [open, setOpen] = useState(false);
 *   return (
 *     <>
 *       <button onClick={() => setOpen(true)}>Open</button>
 *       <Sheet open={open} onOpenChange={setOpen} ariaLabel="Settings">
 *         <h2>Settings</h2>
 *         <p>Your settings here...</p>
 *       </Sheet>
 *     </>
 *   );
 * }
 * ```
 */

export function BottomSheet({
  open,
  onOpenChange,
  ariaLabel,
  className,
  children,
  snapPoints,
  defaultSnap = null,
  snap: controlledSnap,
  onSnapChange,
  modality = 'modal',
  dismissible = (modality === 'modal'),
  interaction = 'overlay',
  backdrop = 'dim',
  disableDrag,
  forceMode,
  onBeforeDismiss,
  // Semantic state machine props
  scrimStrategy = 'auto',
  scrimAlphaRange = [0.08, 0.48],
  scrimWorkMin = 0.5,
  scrimOwnedMin = 0.9,
  scrimClickDismiss = true,
  headerDensity = 'auto',
  footerMode = 'auto',
  footerSafeArea = true,
  footerRevealAt,
  keyboardAware = true,
  keyboardInsets = 'auto',
  keyboardThresholdPx = 150,
  inertUnderlay,
  haptics,
  onSemanticStateChange,
}: SheetProps) {
  // DEPRECATED: Modal mode removed - Sheet is bottom-sheet only
  if (forceMode === 'modal' && process.env.NODE_ENV !== 'production') {
    console.warn('[Sheet] `forceMode="modal"` is deprecated. Sheet is bottom-sheet only. Use <Modal> in v2.');
  }

  // Always render as bottom sheet (Vaul drawer)
  const useDrawer = true;

  // Viewport height tracking (for rotation/PWA chrome) with debounce
  const [vh, setVh] = useState(() => typeof window !== 'undefined' ? window.innerHeight : 0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timer: any;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setVh(window.innerHeight), 60); // 60ms debounce for Android
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Focus return target (a11y gold star)
  const openerRef = useMemo(() => ({ current: null as HTMLElement | null }), []);
  useEffect(() => {
    if (open) {
      openerRef.current = (document.activeElement as HTMLElement) ?? null;
    }
  }, [open]);

  // Controlled snap point state (support both controlled and uncontrolled)
  const isControlled = controlledSnap !== undefined;
  const [internalSnap, setInternalSnap] = useState<number | null>(defaultSnap);
  const activeSnap = isControlled ? controlledSnap : internalSnap;
  const setActiveSnap = (snap: number | null) => {
    if (isControlled) {
      onSnapChange?.(snap);
    } else {
      setInternalSnap(snap);
    }
  };

  // ========================================
  // SEMANTIC STATE MACHINE
  // ========================================

  // Keyboard detection (mobile)
  const keyboardOpen = useKeyboardOpen(keyboardAware, keyboardThresholdPx);

  // Compute semantic state thresholds
  const [alphaMin, alphaMax] = scrimAlphaRange;
  const WORK_MIN = scrimWorkMin;
  const OWNED_MIN = scrimOwnedMin;
  const snapValue = activeSnap ?? 1; // treat null (expanded) as 1

  // Semantic states
  const isPeek = snapValue < WORK_MIN;
  const isWork = snapValue >= WORK_MIN && snapValue < OWNED_MIN;
  const isOwned = snapValue >= OWNED_MIN;

  // Resolve scrim visibility & alpha (short-circuit if backdrop=none)
  const scrim = backdrop === 'none'
    ? { visible: false, alpha: 0 }
    : resolveScrim({
        strategy: scrimStrategy,
        snap: snapValue,
        modality,
        keyboardOpen,
        WORK_MIN,
        OWNED_MIN,
        alphaMin,
        alphaMax,
      });

  // Compute footer visibility
  const footerShouldShow =
    footerMode === 'always' ? true :
    footerMode === 'never' ? false :
    keyboardOpen || snapValue >= (footerRevealAt ?? WORK_MIN);

  // Compute underlay inert state
  const shouldInertUnderlay =
    typeof inertUnderlay === 'boolean' ? inertUnderlay :
    (modality !== 'modeless') && (isWork || isOwned || keyboardOpen);

  // Header density (for future use)
  const computedHeaderDensity =
    headerDensity !== 'auto' ? headerDensity :
    isPeek ? 'compact' : 'regular';

  // Semantic state telemetry + targeted haptics
  const [lastBucket, setLastBucket] = useState<'peek' | 'work' | 'owned' | null>(null);
  useEffect(() => {
    const bucket = isOwned ? 'owned' : isWork ? 'work' : 'peek';
    if (bucket !== lastBucket) {
      setLastBucket(bucket);
      onSemanticStateChange?.(bucket);
      if (haptics?.onSnap && open) {
        hapticFeedback(bucket === 'owned' ? 'medium' : 'light');
      }
    }
  }, [isPeek, isWork, isOwned, lastBucket, onSemanticStateChange, haptics?.onSnap, open]);

  // Publish snap changes (uncontrolled mode only)
  // Note: Haptics now fire via semantic bucket changes (above)
  useEffect(() => {
    if (!isControlled) {
      onSnapChange?.(activeSnap);
    }
  }, [activeSnap, onSnapChange, isControlled]);

  // Calculate reserved size for underlay coordination (convert fraction to pixels)
  const reservedPx = useMemo(() => {
    if (activeSnap == null) return vh; // expanded = full height
    return Math.round(activeSnap * vh);
  }, [activeSnap, vh]);

  // Context value for underlay coordination
  const contextValue: SheetUnderlayValue = {
    isOpen: open,
    snap: activeSnap,
    reservedPx,
    modality,
    interaction,
  };

  // CSS variable publishing (push/resize/overlay coordination)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Always publish snap (0..1 or 1 if expanded)
    root.style.setProperty('--sheet-snap', String(activeSnap ?? 1));

    // Interaction-specific variables
    if (interaction === 'push') {
      root.style.setProperty('--sheet-offset', `${reservedPx}px`);
      root.style.removeProperty('--sheet-size');
    } else if (interaction === 'resize') {
      root.style.setProperty('--sheet-size', `${reservedPx}px`);
      root.style.removeProperty('--sheet-offset');
    } else {
      // overlay/inline
      root.style.removeProperty('--sheet-offset');
      root.style.removeProperty('--sheet-size');
    }

    return () => {
      root.style.removeProperty('--sheet-snap');
      if (interaction !== 'push') root.style.removeProperty('--sheet-offset');
      if (interaction !== 'resize') root.style.removeProperty('--sheet-size');
    };
  }, [interaction, activeSnap, reservedPx]);

  // Modal scroll lock & inert (CRITICAL: refcounted for stacking)
  useEffect(() => {
    if (!useDrawer || !open) return;
    if (typeof document === 'undefined') return;

    const underlay = getUnderlayRoot();

    // Scroll lock with refcounting (for nested sheets)
    if (modality === 'modal' && LOCK_COUNT++ === 0) {
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'contain';
    }

    // Make underlay inert based on semantic state (with fallback)
    if (shouldInertUnderlay && underlay) {
      underlay.setAttribute('inert', '');
      if (!supportsInert) {
        underlay.setAttribute('aria-hidden', 'true');
      }
    }

    return () => {
      const u = getUnderlayRoot();
      if (u) {
        u.removeAttribute('inert');
        u.removeAttribute('aria-hidden');
      }
      if (modality === 'modal' && --LOCK_COUNT === 0) {
        document.body.style.overflow = '';
        document.body.style.overscrollBehavior = '';
      }
    };
  }, [open, modality, useDrawer, shouldInertUnderlay]);

  // ESC key gating (double-sure if Vaul doesn't handle it)
  useEffect(() => {
    if (!open || !dismissible || modality !== 'modal') return;
    if (typeof window === 'undefined') return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissible, modality]);

  // Handle before dismiss confirmation + focus return
  const handleDismiss = async () => {
    if (onBeforeDismiss) {
      const shouldDismiss = await onBeforeDismiss();
      if (!shouldDismiss) return;
    }
    await hapticFeedback('light');
    onOpenChange(false);
    // Restore focus to opener (a11y gold star)
    setTimeout(() => openerRef.current?.focus?.(), 50);
  };

  // ========================================
  // SHARED SLOT EXTRACTION (HMR-safe)
  // ========================================
  
  // Parse children to extract header/content/footer slots (shared by both branches)
  let headerNode: ReactNode = null;
  let contentNode: ReactNode = null;
  let footerNode: ReactNode = null;
  let hasSlots = false;

  Children.forEach(children, (child) => {
    const slot = (isValidElement(child) && (child.type as any)?.$$slot) || null;
    if (slot === 'sheet-header') {
      headerNode = child;
      hasSlots = true;
    } else if (slot === 'sheet-content') {
      contentNode = child;
      hasSlots = true;
    } else if (slot === 'sheet-footer') {
      footerNode = child;
      hasSlots = true;
    }
  });

  // If no slots, treat all children as content
  if (!hasSlots) {
    contentNode = <div className="ds-sheet-body">{children}</div>;
  }

  // Data attributes for semantic state (styling + tests)
  const dataBucket = isOwned ? 'owned' : isWork ? 'work' : 'peek';
  const dataAttrs = {
    'data-testid': 'sheet',
    'data-bucket': dataBucket,
    'data-modality': modality,
    'data-snap': String(snapValue),
    'aria-modal': (modality === 'modal' && (isWork || isOwned || keyboardOpen)) ? true : undefined,
  };

  // Generate stable IDs for ARIA (SR compatibility)
  const titleId = useId();
  const descId = useId();

  // Render Vaul drawer on mobile/touch
  if (useDrawer) {

    return (
      <SheetProvider value={contextValue}>
        <Drawer.Root 
          open={open} 
          onOpenChange={onOpenChange}
          modal={modality === 'modal'}
          dismissible={dismissible}
          snapPoints={snapPoints}
          activeSnapPoint={activeSnap}
          setActiveSnapPoint={(snap) => setActiveSnap(typeof snap === 'number' ? snap : null)}
        >
        <Drawer.Portal>
          <Drawer.Overlay 
            className={`ds-sheet-overlay ds-sheet-overlay--${backdrop}`}
            style={{
              opacity: scrim.visible ? scrim.alpha : 0,
              pointerEvents: scrim.visible && scrimClickDismiss && dismissible ? 'auto' : 'none',
            }}
            onClick={() => {
              if (scrim.visible && scrimClickDismiss && dismissible) {
                handleDismiss();
              }
            }}
          />
          <Drawer.Content 
            className={`ds-sheet-content ${className ?? ''}`}
            role="dialog"
            aria-labelledby={titleId}
            aria-describedby={descId}
            {...dataAttrs}
          >
            <Drawer.Title id={titleId} className="sr-only">{ariaLabel}</Drawer.Title>
            <Drawer.Description id={descId} className="sr-only">
              {ariaLabel}
            </Drawer.Description>
            
            {/* Drag handle */}
            <div className="ds-sheet-handle" />
            
            {/* Slotted layout */}
            {headerNode}
            {contentNode}
            {footerShouldShow && footerNode}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      </SheetProvider>
    );
  } // Close if (useDrawer)
} // Close Sheet function

/**
 * BottomSheet.Header - Optional header slot (frame, not skin)
 */
(BottomSheet as any).Header = function BottomSheetHeader({ children }: { children: ReactNode }) {
  return <div className="ds-sheet-header">{children}</div>;
};

/**
 * BottomSheet.Content - Scrollable body (frame, not skin)
 */
(BottomSheet as any).Content = function BottomSheetContent({ children }: { children: ReactNode }) {
  return <div className="ds-sheet-content-slot">{children}</div>;
};

/**
 * BottomSheet.Footer - Sticky bottom rail (frame, not skin)
 */
(BottomSheet as any).Footer = function BottomSheetFooter({ children, 'data-footer-safe': footerSafe }: { children: ReactNode; 'data-footer-safe'?: boolean }) {
  return <div className="ds-sheet-footer" data-footer-safe={footerSafe ? 'true' : undefined}>{children}</div>;
};

/**
 * @deprecated Use BottomSheet instead. Sheet will be removed in v3.0.0
 */
export function Sheet(props: SheetProps) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[DS] Sheet is deprecated. Use BottomSheet instead. Sheet will be removed in v3.0.0');
  }
  return BottomSheet(props);
}

// Attach deprecated slot aliases
(Sheet as any).Header = (BottomSheet as any).Header;
(Sheet as any).Content = (BottomSheet as any).Content;
(Sheet as any).Footer = (BottomSheet as any).Footer;
