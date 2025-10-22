/**
 * Layout Configuration - Width Presets
 * 
 * Central config mapping preset names → tokens.
 * Choose by content type, not tenant.
 * 
 * Philosophy:
 * - Flexibility inside bounded choices
 * - No freehand pixels allowed
 * - Nesting works naturally
 */

export const layoutPresets = {
  prose: 'var(--ds-width-prose)',       // 65ch - Reading by measure
  narrow: 'var(--ds-width-narrow)',     // 36rem - Auth, short forms
  comfy: 'var(--ds-width-comfy)',       // 42rem - Label-heavy forms
  standard: 'var(--ds-width-standard)', // 56rem - Typical sections
  wide: 'var(--ds-width-wide)',         // 64rem - Media-rich
  max: 'var(--ds-width-max)',           // 80rem - Page max
  // 'full' = no maxWidth (handled separately)
} as const

export type LayoutPreset = keyof typeof layoutPresets

/**
 * Usage guide for choosing presets:
 * 
 * **Reading content** (blogs, articles, docs):
 *   maxWidth="prose"
 *   → 65ch adapts to font size, optimal reading
 * 
 * **Focused forms** (auth, wizards):
 *   maxWidth="narrow"  // 36rem default
 *   maxWidth="comfy"   // 42rem for label-heavy
 * 
 * **Page sections** (marketing, product pages):
 *   maxWidth="standard" // 56rem typical
 *   maxWidth="wide"     // 64rem media-rich
 *   maxWidth="max"      // 80rem page default
 * 
 * **Dashboards/Canvases** (rare):
 *   maxWidth="full"
 *   → No constraint, use sparingly
 * 
 * **Nesting works**:
 *   <Container maxWidth="max">
 *     <Prose maxWidth="prose">Article</Prose>
 *     <FormLayout maxWidth="narrow">Form</FormLayout>
 *   </Container>
 */

// Suggested uses (for demo/docs)
export const presetSuggestions: Record<LayoutPreset | 'full', string[]> = {
  prose: ['Blog posts', 'Articles', 'Documentation', 'Long-form content'],
  narrow: ['Login forms', 'Sign up', 'Wizards', 'Short surveys'],
  comfy: ['Multi-step forms', 'Settings pages', 'Label-heavy inputs'],
  standard: ['Marketing sections', 'Product features', 'Team pages'],
  wide: ['Media galleries', 'Case studies', 'Rich content'],
  max: ['Page container', 'Full-width sections', 'Default max'],
  full: ['Dashboards', 'Tables', 'Canvases', 'Data-dense UIs'],
}

// Get preset value (for inline styles)
export function getPresetValue(preset: LayoutPreset | 'full' | 'inherit'): string | undefined {
  if (preset === 'full' || preset === 'inherit') return undefined
  return layoutPresets[preset]
}
