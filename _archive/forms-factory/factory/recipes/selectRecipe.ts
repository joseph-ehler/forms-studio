/**
 * Recipe Selection Logic
 * 
 * Maps field spec → appropriate recipe.
 * Used by the generator to dispatch behavior.
 */

import type { Recipe, FieldSpec } from './types';
import { SimpleListRecipe } from './SimpleListRecipe';

// Future imports:
// import { MultiSelectRecipe } from './MultiSelectRecipe';
// import { AsyncSearchSelectRecipe } from './AsyncSearchSelectRecipe';
// import { DatePickerRecipe } from './DatePickerRecipe';
// import { DateRangeRecipe } from './DateRangeRecipe';

/**
 * Select the appropriate recipe based on field spec
 */
export function selectRecipe(spec: FieldSpec): Recipe | null {
  const { type, ui = {} } = spec;
  const behavior = ui.behavior;
  
  // Date pickers
  if (type === 'date') {
    // TODO: return DatePickerRecipe;
    return null; // Not implemented yet
  }
  
  if (type === 'dateRange') {
    // TODO: return DateRangeRecipe;
    return null; // Not implemented yet
  }
  
  // Select fields
  if (type === 'select') {
    // Multi-select with checkboxes
    if (ui.multiple) {
      // TODO: return MultiSelectRecipe;
      // For now, fall through to simple list
    }
    
    // Async search with virtualization
    if (behavior === 'async-search') {
      // TODO: return AsyncSearchSelectRecipe;
      // For now, fall through to simple list
    }
    
    // Tag selection (chips)
    if (behavior === 'tag-select') {
      // TODO: return TagSelectRecipe;
      // For now, fall through to simple list
    }
    
    // User picker (avatars, presence)
    if (behavior === 'user-picker') {
      // TODO: return UserPickerRecipe;
      // For now, fall through to simple list
    }
    
    // Default: simple list
    return SimpleListRecipe;
  }
  
  // Command palette
  if (type === 'command') {
    // TODO: return CommandPaletteRecipe;
    return null; // Not implemented yet
  }
  
  // No recipe needed (inline controls)
  // Examples: text, checkbox, toggle, radio, slider
  return null;
}

/**
 * Check if a field should render inline (no overlay)
 */
export function shouldRenderInline(spec: FieldSpec): boolean {
  const { type, options = [], ui = {} } = spec;
  
  // Not a select? Check type
  if (type !== 'select') {
    // Inline types: text, checkbox, toggle, radio, slider
    const inlineTypes = ['text', 'email', 'tel', 'url', 'number', 'checkbox', 'toggle', 'radio', 'slider'];
    return inlineTypes.includes(type);
  }
  
  // Select with few options can render inline
  const threshold = ui.inlineThreshold ?? 4;
  return options.length > 0 && options.length <= threshold;
}
