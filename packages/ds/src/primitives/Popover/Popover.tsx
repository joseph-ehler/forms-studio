/**
 * Popover - Floating UI under Flowbite/token skin
 * 
 * Provides industrial-grade positioning (flip, shift, collision detection)
 * with consistent DS visuals.
 * 
 * @public
 */

import { cloneElement, isValidElement, ReactElement, ReactNode, useState } from 'react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import type { Placement } from '@floating-ui/react';
import './Popover.css';

export type PopoverProps = {
  /**
   * Trigger element (receives onClick, ref, aria-* props)
   */
  trigger: ReactElement;

  /**
   * Controlled open state (optional)
   */
  open?: boolean;

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Popover content
   */
  content: ReactNode;

  /**
   * Placement relative to trigger
   * @default 'bottom-start'
   */
  placement?: Placement;

  /**
   * Padding from viewport edges (prevents clipping)
   * @default 8
   */
  collisionPadding?: number;
};

/**
 * Popover component with Floating UI positioning
 * 
 * @example
 * ```tsx
 * import { Popover } from '@intstudio/ds/primitives';
 * 
 * function MyComponent() {
 *   return (
 *     <Popover
 *       trigger={<button>Options</button>}
 *       content={<div>Menu items...</div>}
 *       placement="bottom-end"
 *     />
 *   );
 * }
 * ```
 */
export function Popover({
  trigger,
  open: controlledOpen,
  onOpenChange,
  content,
  placement = 'bottom-start',
  collisionPadding = 8,
}: PopoverProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;

  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [
      offset(8), // Space between trigger and popover
      flip(), // Flip to opposite side if no space
      shift({ padding: collisionPadding }), // Shift to stay in viewport
    ],
    whileElementsMounted: autoUpdate, // Update position on scroll/resize
  });

  if (!isValidElement(trigger)) return null;

  const handleTriggerClick = () => setOpen(!open);

  return (
    <>
      {cloneElement(trigger, {
        ref: refs.setReference as any, // Floating UI ref compatibility
        onClick: handleTriggerClick,
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
      } as any)}
      {open && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="ds-popover"
          role="dialog"
        >
          {content}
        </div>
      )}
    </>
  );
}
