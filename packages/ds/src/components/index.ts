/**
 * Components - Compatibility Barrel
 * 
 * Re-exports from new structure for backward compatibility.
 * Fields and old code can still import from './components'
 * 
 * TODO: Migrate all imports to use new structure directly:
 * - primitives/ (Stack, Grid, Button, etc.)
 * - patterns/ (FormLayout, FieldWrapper)
 * - shell/ (AppShell, TopBar, Drawer)
 */

// Re-export primitives
export * from '../primitives'

// Re-export patterns  
export * from '../patterns'

// Re-export shell
export * from '../shell'

// Legacy components that haven't moved
// NOTE: DSShims intentionally NOT exported - conflicts with real primitives
// Fields should import directly from primitives/ instead
export * from './overlay'
export * from './picker'
export * from './typography'

// ---- Compat exports (temporary; deprecate later) ----
export { Flex, FormStack, FormGrid } from '../compat'
