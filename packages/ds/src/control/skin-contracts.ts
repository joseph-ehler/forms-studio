/**
 * SKIN Contracts - TypeScript-based validation
 * 
 * Replaces JSON schemas + custom ESLint rule with compile-time type checking.
 * Missing keys fail instantly in your editor.
 */

/**
 * Button SKIN keys
 */
export type ButtonSkinKeys =
  | '--btn-fg'
  | '--btn-bg'
  | '--btn-hover-bg'
  | '--btn-active-bg';

/**
 * Input SKIN keys
 */
export type InputSkinKeys =
  | '--input-fg'
  | '--input-bg'
  | '--input-placeholder'
  | '--input-border'
  | '--input-hover-border'
  | '--input-focus-ring'
  | '--input-disabled-fg'
  | '--input-disabled-bg'
  | '--input-disabled-border'
  | '--input-invalid-border';


/**
 * Textarea skin keys
 */
export type TextareaSkinKeys =
  | '--textarea-fg'
  | '--textarea-bg'
  | '--textarea-border'
  | '--textarea-hover-border'
  | '--textarea-focus-ring';


/**
 * Checkbox skin keys
 */
export type CheckboxSkinKeys =
  | '--checkbox-fg'
  | '--checkbox-bg'
  | '--checkbox-border'
  | '--checkbox-hover-border'
  | '--checkbox-focus-ring';


/**
 * Radio skin keys
 */
export type RadioSkinKeys =
  | '--radio-fg'
  | '--radio-bg'
  | '--radio-border'
  | '--radio-hover-border'
  | '--radio-focus-ring';


/**
 * Toggle skin keys
 */
export type ToggleSkinKeys =
  | '--toggle-fg'
  | '--toggle-bg'
  | '--toggle-border'
  | '--toggle-hover-border'
  | '--toggle-focus-ring';


/**
 * Badge skin keys
 */
export type BadgeSkinKeys =
  | '--badge-fg'
  | '--badge-bg'
  | '--badge-border'
  | '--badge-hover-border'
  | '--badge-focus-ring';

/**
 * Generic SKIN record enforcer
 * 
 * Usage:
 *   const BUTTON_SKIN: SkinRecord<ButtonVariant, ButtonSkinKeys> = { ... }
 * 
 * TypeScript will error if:
 * - A variant is missing
 * - A required key is missing from any variant
 * - An extra key is present
 */
export type SkinRecord<TVariant extends string, TKeys extends string> = Record<
  TVariant,
  Record<TKeys, string>
>;
