/**
 * Container Component - Width Preset Wrapper
 * 
 * FLEXIBLE: Choose by content type, not tenant.
 * Presets are snapped, governed, and nesting-friendly.
 * 
 * Usage:
 *   <Container>Content</Container>              // Default: max (80rem)
 *   <Container maxWidth="standard">Section</Container>  // 56rem
 *   <Container maxWidth="full">Dashboard</Container>    // No limit
 * 
 * Width Presets (choose by content type):
 *   - prose: 65ch - Reading by measure (adapts to font size)
 *   - narrow: 36rem (576px) - Auth, short forms, wizards
 *   - comfy: 42rem (672px) - Label-heavy forms
 *   - standard: 56rem (896px) - Typical sections, marketing
 *   - wide: 64rem (1024px) - Media-rich sections
 *   - max: 80rem (1280px) - Page default (single-column max)
 *   - full: 100% - Dashboards, canvases (rare)
 * 
 * Nesting Works:
 *   <Container maxWidth="max">
 *     <Prose maxWidth="prose">Article</Prose>
 *     <FormLayout maxWidth="narrow">Form</FormLayout>
 *   </Container>
 */

import React from 'react'
import { layoutPresets, type LayoutPreset } from '../utils/layoutConfig'

interface ContainerProps {
  maxWidth?: LayoutPreset | 'full'
  padding?: boolean
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'main'
}


export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'max', // Default: 80rem page max
  padding = true,
  children,
  className = '',
  as: Component = 'div',
}) => {
  const style: React.CSSProperties = maxWidth === 'full' 
    ? { width: '100%' }
    : { 
        maxWidth: layoutPresets[maxWidth],
        marginInline: 'auto', // Logical property for RTL support
      }
  
  const classes = [
    // Responsive padding (mobile comfort, desktop centered)
    padding && 'ds-px-4',
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <Component 
      className={classes}
      style={style}
    >
      {children}
    </Component>
  )
}
