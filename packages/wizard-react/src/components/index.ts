/**
 * Universal Design System Primitives
 * 
 * Typography and layout primitives that work anywhere (forms, dialogs, cards, etc.)
 * These are universal - not form-specific!
 * 
 * Philosophy: FLAT FIRST
 * - No shadows by default
 * - Borders for separation
 * - Glass variant for special cases
 * - 100% theme-aware (light/dark)
 */

// CSS Cascade Layers (MUST be first!)
import '../styles/layers.css'

// Import Design System CSS (tokens layer)
import '../styles/tokens/color.vars.css'
import '../styles/tokens/typography.vars.css'
import '../styles/tokens/media.vars.css'
import '../styles/tokens/button.vars.css'
import '../styles/tokens/input.vars.css'
import '../styles/tokens/layout.vars.css'
import '../styles/tokens/density.vars.css'
import '../styles/tokens/a11y.vars.css'
import '../styles/tokens/fab.vars.css'
import '../styles/tokens/section.vars.css'
import '../styles/tokens/shell.vars.css'
import '../styles/tokens/surface.vars.css'

// Accessibility Fonts (loaded on-demand)
import '../styles/fonts/opendyslexic.css'
import '../styles/fonts/atkinson-hyperlegible.css'

// Component CSS
import './ds-typography.css'
import './ds-section.css'
import './ds-fab.css'
import './ds-form-layout.css'
import './ds-grid.css'
import './ds-inputs.css'
import './ds-prose.css'
import './ds-icons.css'
import './ds-media.css'

// Brand CSS (optional - for static brands)
// import '../styles/brands/brand-acme.css'
// import '../styles/brands/brand-vertex.css'

// UI Shell - Native OS Experience (TRANSCENDENT!)
// Phase 0: Context (B2C/B2B tenant-aware)
export { AppProvider, useApp, useIsB2B, useIsB2C, useTenantMaxWidth } from './shell'
export type { TenantType, ThemeMode } from './shell'

// White-Label API (Runtime brand switching - no rebuild!)
export {
  applyBrand,
  loadBrandPreferences,
  getCurrentBrand,
  getCurrentTheme,
  getCurrentTenant,
  prePaintScript,
  type BrandManifest,
  type BrandId,
} from './shell'

// Layout Config (Width presets - snapped, governed)
export {
  layoutPresets,
  presetSuggestions,
  getPresetValue,
  type LayoutPreset,
} from '../lib/layoutConfig'

// Accessibility System (Runtime control - no rebuild!)
export {
  applyA11y,
  getCurrentA11y,
  saveA11yPreferences,
  loadA11yPreferences,
  resetA11y,
  generatePrePaintScript,
} from '../lib/applyA11y'
export {
  A11Y_PRESETS,
  getA11yPreset,
  mergeA11yProfiles,
  type A11yProfile,
  type A11yFont,
  type TouchTarget,
} from '../lib/a11yProfiles'
export {
  validateContrast,
  autoFixContrast,
  getContrastBadge,
  getContrastRatio,
  meetsWCAG,
  CONTRAST_MATRIX,
} from '../lib/contrastValidator'
export {
  useContrastGuard,
  type ContrastGuardOptions,
  type ContrastGuardState,
} from '../lib/useContrastGuard'
export { ContrastBadge } from './ContrastBadge'
export type { ContrastBadgeProps } from './ContrastBadge'

// Semantic Sizing System
export {
  type Importance,
  SEMANTIC_SIZES,
  A11Y_IMPORTANCE_MULTIPLIERS,
  getSemanticSize,
  sizeToImportance,
} from '../lib/semanticSizing'

// Tone Resolver System
export {
  type Tone,
  TONE_THRESHOLD,
  detectToneFromColor,
  detectToneFromImage,
  detectToneFromGradient,
  resolveTone,
  getToneStyles,
} from '../lib/toneResolver'

// Density & Touch Target Adapter
export {
  type DensityPreset,
  TOUCH_TARGETS,
  DENSITY_MULTIPLIERS,
  getDensityFromA11yScale,
  getTouchTargetFromA11yScale,
  scaleDensity,
  getAdaptiveSpacing,
  getAdaptiveTouchTarget,
  useAdaptiveDensity,
  generateDensityCSS,
} from '../lib/densityAdapter'

// Focus Management Primitives
export {
  FocusTrap,
  useFocusTrap,
  type FocusTrapProps,
} from '../lib/focus'
export {
  FocusScope,
  useFocusScope,
  useFocusScopeChain,
  type FocusScopeProps,
} from '../lib/focus'
export {
  RovingFocus,
  useRovingFocus,
  type RovingFocusProps,
} from '../lib/focus'
export {
  FOCUSABLE_SELECTOR,
  getFocusableElements,
  getFirstFocusable,
  getLastFocusable,
  getNextFocusable,
  getPreviousFocusable,
  isFocusable,
  focusElement,
  createFocusStore,
} from '../lib/focus'
export {
  debugFocus,
  debugFocusTraps,
  debugFocusScopes,
  debugRovingFocus,
  watchFocus,
  testFocusTrap,
} from '../lib/focus'

// Phase 1: Foundation
export { AppShell } from './shell'
export { TopBar } from './shell'
export { BottomNav } from './shell'

// Phase 2: Gestures & Interactive
export { Drawer } from './shell'
export { Sheet } from './shell'
export { PullToRefresh } from './shell'
export { useGesture, calculateSnapPoint } from './shell'

// Interactive Primitives (FLAT FIRST!)
export { Button } from './Button'        // Universal button (no shadow!)

// FAB System (Floating Action Buttons)
export { FAB } from './FAB'               // Floating action button
export type { FABProps } from './FAB'
export { FABMenu, FABItem } from './FABMenu' // FAB menu system
export type { FABMenuProps, FABItemProps } from './FABMenu'
export { FABSpeedDial } from './FABSpeedDial' // Speed dial expansion
export type { FABSpeedDialProps, FABSpeedDialAction } from './FABSpeedDial'

// Surface & Layout Primitives (FLAT FIRST!)
export { Box } from './Box'              // Universal container with spacing
export { Card } from './Card'            // Flat card (no shadow!)
export { Container } from './Container'  // Max-width centered wrapper
export { Section } from './Section'      // Full-bleed background surface
export type { SectionProps } from './Section'
export { FormLayout } from './FormLayout' // Form-optimized Stack with width constraints
export { Stack } from './Stack'          // Vertical spacing
export { Grid } from './Grid'            // Responsive grid
export { Divider } from './Divider'      // Border separator
export { Spacer } from './Spacer'        // Explicit spacing

// Media Primitives (Images, Video, Aspect Ratios)
export { MediaContainer } from './MediaContainer' // Smart figure with ratio/caption/overlay
export type { MediaContainerProps } from './MediaContainer'
export { Picture } from './Picture'      // Responsive image with art direction
export type { PictureProps } from './Picture'
export { VideoPlayer } from './VideoPlayer' // Accessible HTML5 video
export type { VideoPlayerProps } from './VideoPlayer'

// Design System Shims (compatibility layer - maps to universal primitives above)
export { Stack as FlexCompat, Flex, Grid as GridCompat } from './DSShims'

// Typography Primitives (Universal - work anywhere!)
export { Display } from './Display'      // Marketing/Hero text
export { Heading } from './Heading'      // SaaS/App headings
export { Body } from './Body'            // Content/UI text
export { Text } from './Text'            // Alias for Body
export { Label } from './Label'          // Input labels
export { HelperText } from './HelperText' // Helper/error text
export { Prose } from './Prose'          // CMS/Markdown content (ONLY place with margins)

// Legacy exports for backwards compatibility (remove in v1.0)
export { Heading as FormHeading } from './Heading'
export { Text as FormText } from './Text'
export { Label as FormLabel } from './Label'
export { HelperText as FormHelperText } from './HelperText'
export { Stack as FormStack } from './Stack'
export { Grid as FormGrid } from './Grid'
