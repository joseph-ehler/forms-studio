/**
 * @intstudio/ds/primitives/BottomSheet
 * 
 * Capability-aware bottom drawer/sheet component.
 * 
 * NOTE: A simplified BottomSheet shell is available in @intstudio/ds/shell/micro
 * that composes the new OverlaySheet primitive. Consider migrating to that version
 * for simpler use cases. This full-featured version (with Vaul, snap points, haptics)
 * will remain available for complex scenarios.
 * 
 * @packageDocumentation
 */

// Primary exports
/** 
 * @deprecated Use `@intstudio/ds/shell/micro/BottomSheet` for new code.
 * This path remains for complex scenarios requiring full Vaul features.
 * Will be reconsidered in v3.0.
 */
export { BottomSheet } from './BottomSheet';

/** @deprecated Use BottomSheetProps from @intstudio/ds/shell/micro/BottomSheet */
export type { SheetProps as BottomSheetProps } from './BottomSheet';
export { BottomSheetProvider } from './BottomSheetContext';
export type { BottomSheetUnderlayValue } from './BottomSheetContext';
export { UnderlayEffects } from './UnderlayEffects';
export type { UnderlayEffectsProps } from './UnderlayEffects';
export { DSModalBackdrop } from './DSModalBackdrop';
export type { DSModalBackdropProps, BackdropVariant } from './DSModalBackdrop';
export { dsFlowbiteTheme } from './flowbiteTheme';

// Deprecated aliases (remove in v3.0.0)
/** @deprecated Use BottomSheet */
export { BottomSheet as Sheet } from './BottomSheet';
/** @deprecated Use BottomSheetProps */
export type { SheetProps } from './BottomSheet';
/** @deprecated Use BottomSheetProvider */
export { BottomSheetProvider as SheetProvider } from './BottomSheetContext';
/** @deprecated Use BottomSheetUnderlayValue */
export type { BottomSheetUnderlayValue as SheetUnderlayValue } from './BottomSheetContext';
