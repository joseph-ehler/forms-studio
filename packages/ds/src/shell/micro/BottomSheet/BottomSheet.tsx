/**
 * BottomSheet Shell (Simplified v2)
 * 
 * Composes OverlaySheet primitive + behavior policies.
 * Provides slots (Header, Content, Footer) and shell-level structure.
 * 
 * NOTE: This is a simplified version. The full-featured BottomSheet
 * (with Vaul, snap points, haptics) remains in primitives/ for now.
 * Gradual migration path.
 */

import { OverlaySheet } from '../../../primitives/overlay/OverlaySheet';
import { useAppEnvironment } from '../../core/environment';
import './BottomSheet.css';

export interface BottomSheetProps {
  /** Unique ID for overlay stack */
  id: string;
  /** Is sheet open? */
  open: boolean;
  /** Open state change handler */
  onOpenChange: (open: boolean) => void;
  /** ARIA label (required) */
  ariaLabel: string;
  /** Child slots (Header, Content, Footer) */
  children?: React.ReactNode;
}

/**
 * BottomSheet - Simplified bottom drawer shell
 * 
 * Composes OverlaySheet primitive for mechanics,
 * adds slots for structure.
 * 
 * @example
 * ```tsx
 * <BottomSheet 
 *   id="settings"
 *   open={open}
 *   onOpenChange={setOpen}
 *   ariaLabel="Settings"
 * >
 *   <BottomSheet.Header>
 *     <h2>Settings</h2>
 *   </BottomSheet.Header>
 *   <BottomSheet.Content>
 *     <SettingsForm />
 *   </BottomSheet.Content>
 *   <BottomSheet.Footer>
 *     <Button onClick={() => setOpen(false)}>Close</Button>
 *   </BottomSheet.Footer>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  id,
  open,
  onOpenChange,
  ariaLabel,
  children,
}: BottomSheetProps) {
  const { mode } = useAppEnvironment();

  return (
    <OverlaySheet
      id={id}
      open={open}
      onClose={() => onOpenChange(false)}
      blocking={true}
      ariaLabel={ariaLabel}
    >
      <div 
        className="bottom-sheet-shell" 
        role="document" 
        data-shell="bottom-sheet"
        data-shell-mode={mode}
      >
        {/* Drag handle for mobile */}
        {mode === 'mobile' && (
          <div className="bottom-sheet-shell__handle" aria-hidden="true" />
        )}
        
        {children}
      </div>
    </OverlaySheet>
  );
}

/**
 * BottomSheet.Header - Header slot
 */
BottomSheet.Header = function BottomSheetHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bottom-sheet-shell__header" data-slot="header">
      {children}
    </div>
  );
};

/**
 * BottomSheet.Content - Main content slot (scrollable)
 */
BottomSheet.Content = function BottomSheetContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="bottom-sheet-shell__content" data-slot="content">
      {children}
    </div>
  );
};

/**
 * BottomSheet.Footer - Footer slot (sticky)
 */
BottomSheet.Footer = function BottomSheetFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="bottom-sheet-shell__footer" data-slot="footer">
      {children}
    </div>
  );
};
