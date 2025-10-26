/**
 * GlobalProgressBar - Top progress indicator for AppShell
 * 
 * Automatically shown/hidden based on global loading state.
 * Render in AppShell.Header for global loading indication.
 * 
 * @example
 * ```tsx
 * <AppShell.Header>
 *   <GlobalProgressBar />
 *   <YourHeaderContent />
 * </AppShell.Header>
 * ```
 */

import { useGlobalLoadingState } from '../../core/state/useLoadingState';
import './GlobalProgressBar.css';

export interface GlobalProgressBarProps {
  /** Custom color (defaults to theme primary) */
  color?: string;
  /** Height in pixels (defaults to 2) */
  height?: number;
  /** Custom className */
  className?: string;
}

/**
 * GlobalProgressBar component
 * 
 * 2px bar at top of viewport that shows global loading progress.
 * Automatically controlled by `useLoadingState()` calls anywhere in app.
 */
export function GlobalProgressBar({
  color,
  height = 2,
  className = '',
}: GlobalProgressBarProps = {}) {
  const { active, progress } = useGlobalLoadingState();
  
  if (!active) return null;
  
  return (
    <div
      className={`global-progress-bar ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Loading"
      style={{
        '--progress-height': `${height}px`,
        '--progress-color': color || 'var(--ds-color-primary, #3b82f6)',
        '--progress-width': `${progress}%`,
      } as React.CSSProperties}
    >
      <div className="global-progress-bar__fill" />
    </div>
  );
}
