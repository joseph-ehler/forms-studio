/**
 * @intstudio/ds - Design System Studio
 * 
 * PUBLIC API
 * 
 * This barrel defines what external consumers can import.
 * Keep this minimal and stable. Use internal.ts for test-only exports.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 STYLES (CSS @layer system)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import './styles/layers.css'            // @layer definition
import './styles/tokens/color.vars.css'
import './styles/tokens/typography.vars.css'
import './styles/tokens/spacing.vars.css'
import './styles/tokens/surface.vars.css'
import './styles/tokens/button.vars.css'
import './styles/tokens/input.vars.css'
import './styles/tokens/layout.vars.css'
import './styles/tokens/media.vars.css'
import './styles/tokens/section.vars.css'
import './styles/tokens/shell.vars.css'
import './styles/tokens/fab.vars.css'
import './styles/tokens/density.vars.css'
import './styles/tokens/a11y.vars.css'

// Component skins
import './styles/components/ds-typography.css'
import './styles/components/ds-inputs.css'
import './styles/components/ds-grid.css'
import './styles/components/ds-form-layout.css'
import './styles/components/ds-media.css'
import './styles/components/ds-section.css'
import './styles/components/ds-prose.css'
import './styles/components/ds-fab.css'
import './styles/components/ds-icons.css'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 PRIMITIVES (basic building blocks)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './primitives'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📐 PATTERNS (composed layouts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './patterns'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 SHELL (app shell components)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './shell'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ♿ A11Y (accessibility layer)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './a11y'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 WHITE-LABEL (brand system)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './white-label'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 UTILS (public utilities only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { type LayoutPreset } from './utils'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 TOKENS (optional typed tokens map)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { tokens } from './tokens'
