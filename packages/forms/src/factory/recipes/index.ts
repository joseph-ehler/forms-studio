/**
 * Recipe Registry
 * 
 * Export all available recipes and their metadata.
 * The generator uses this to dispatch spec → recipe.
 */

export * from './types';
export { SimpleListRecipe } from './SimpleListRecipe';

// Future recipes (to be implemented):
// export { MultiSelectRecipe } from './MultiSelectRecipe';
// export { AsyncSearchSelectRecipe } from './AsyncSearchSelectRecipe';
// export { DatePickerRecipe } from './DatePickerRecipe';
// export { DateRangeRecipe } from './DateRangeRecipe';
// export { TagSelectRecipe } from './TagSelectRecipe';
// export { UserPickerRecipe } from './UserPickerRecipe';
// export { CommandPaletteRecipe } from './CommandPaletteRecipe';
