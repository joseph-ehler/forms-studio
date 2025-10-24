/**
 * Overlay Primitives - Layout Atoms & Responsive System
 * 
 * Composable building blocks for overlay content.
 * Used by all overlay recipes in the Forms package.
 * 
 * NEW: ResponsiveOverlay - God-tier popover/sheet system
 */

// Layout atoms
export {
  OverlayHeader,
  OverlayContent,
  OverlayFooter,
  OverlayList,
  OverlayGrid
} from './OverlayLayout';

export type {
  OverlayHeaderProps,
  OverlayContentProps,
  OverlayFooterProps,
  OverlayListProps,
  OverlayGridProps
} from './OverlayLayout';

// Option component
export {
  Option,
  OptionGroup
} from './Option';

export type {
  OptionProps,
  OptionGroupProps
} from './Option';

// Supporting hooks (advanced usage)
export { useSheetGestures } from './useSheetGestures';
export { usePopoverPosition } from './usePopoverPosition';
export { useFocusTrap } from './useFocusTrap';

export type {
  UseSheetGesturesOptions,
  UseSheetGesturesResult
} from './useSheetGestures';

export type {
  UsePopoverPositionOptions,
  UsePopoverPositionResult
} from './usePopoverPosition';

export type {
  UseFocusTrapOptions
} from './useFocusTrap';
