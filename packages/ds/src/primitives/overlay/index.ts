/**
 * Overlay Primitives - Layout Atoms & Option Component
 * 
 * Composable building blocks for overlay content.
 * Used by all overlay recipes in the Forms package.
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
