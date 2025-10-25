/**
 * FlowScaffold - Meso-level sub-flow navigator (wizard)
 * 
 * Use for: multi-step tasks within a single route context
 * Examples: Create project, Setup wizard, Multi-page form
 * 
 * @example
 * const flow = useSubFlow(['name', 'details', 'invite']);
 * 
 * <FlowScaffold
 *   title="Create project"
 *   step={flow.index + 1}
 *   total={3}
 *   onBack={flow.prev ? () => flow.go(flow.prev) : undefined}
 * >
 *   {flow.current === 'name' && <NameStep />}
 *   {flow.current === 'details' && <DetailsStep />}
 * </FlowScaffold>
 */

import './flow-scaffold.css';

import { FC, PropsWithChildren } from 'react';

export interface FlowScaffoldProps {
  /**
   * Flow title (e.g., "Create project")
   */
  title: string;
  
  /**
   * Current step (1-indexed for display)
   */
  step: number;
  
  /**
   * Total number of steps
   */
  total: number;
  
  /**
   * Back button handler (undefined = no back button)
   */
  onBack?: () => void;
  
  /**
   * Footer content (e.g., Next/Cancel buttons)
   */
  footer?: React.ReactNode;
  
  /**
   * Optional class name
   */
  className?: string;
}

export const FlowScaffold: FC<PropsWithChildren<FlowScaffoldProps>> = ({
  title,
  step,
  total,
  onBack,
  footer,
  children,
  className = '',
}) => {
  if (process.env.NODE_ENV !== 'production') {
    if (step < 1 || step > total) {
      console.warn(
        `[FlowScaffold] Invalid step: ${step} (must be 1-${total})`
      );
    }
  }

  return (
    <section
      className={`ds-flow ${className}`.trim()}
      role="document"
      aria-labelledby="flow-title"
    >
      <header className="ds-flow__header">
        {onBack ? (
          <button
            type="button"
            className="ds-flow__back ds-icon-btn"
            onClick={onBack}
            aria-label="Back"
          >
            ←
          </button>
        ) : (
          <span className="ds-flow__back-spacer" />
        )}
        
        <h1 id="flow-title" className="ds-flow__title ds-h2">
          {title}
        </h1>
        
        <div className="ds-flow__progress ds-meta" aria-live="polite">
          Step {step} of {total}
        </div>
      </header>

      <main className="ds-flow__content">
        {children}
      </main>

      {footer && (
        <footer className="ds-flow__footer">
          {footer}
        </footer>
      )}
    </section>
  );
};

FlowScaffold.displayName = 'FlowScaffold';
