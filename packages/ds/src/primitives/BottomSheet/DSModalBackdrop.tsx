/**
 * DSModalBackdrop - Shared backdrop for desktop modal
 * 
 * Mirrors the backdrop behavior from mobile Sheet (Vaul Drawer).
 * Uses the same CSS variable pipeline (--ue-blur, UnderlayEffects).
 */

export type BackdropVariant = 'dim' | 'blur' | 'none';

export interface DSModalBackdropProps {
  variant: BackdropVariant;
  onClick?: () => void;
}

/**
 * Backdrop component for desktop Modal
 * Achieves visual parity with mobile Drawer backdrop
 */
export function DSModalBackdrop({ variant, onClick }: DSModalBackdropProps) {
  if (variant === 'none') return null;

  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={
        variant === 'blur'
          ? 'fixed inset-0 z-[var(--z-scrim)] bg-[rgba(0,0,0,0.2)] backdrop-blur-[var(--ue-blur,8px)] transition-all duration-200'
          : 'fixed inset-0 z-[var(--z-scrim)] bg-[rgba(0,0,0,0.4)] transition-all duration-200'
      }
      style={{ pointerEvents: onClick ? 'auto' : 'none' }}
    />
  );
}
