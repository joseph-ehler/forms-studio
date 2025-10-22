/**
 * FormLayout - Form-optimized Stack with Width Presets
 * 
 * Choose by form complexity, not tenant.
 * Defaults to narrow (36rem) for focused, scannable forms.
 * 
 * Usage:
 *   <FormLayout>                           // Default: narrow (36rem)
 *     <Heading>Sign Up</Heading>
 *     <TextField label="Email" />
 *     <Button>Submit</Button>
 *   </FormLayout>
 * 
 *   <FormLayout maxWidth="comfy">          // 42rem for label-heavy
 *     <TextField label="Long Label" />
 *   </FormLayout>
 * 
 * Width Presets:
 *   - narrow: 36rem (576px) - Auth, wizards, short forms (default)
 *   - comfy: 42rem (672px) - Label-heavy, multi-step forms
 *   - inherit: No constraint - Use parent width
 */

import React, { useEffect, useState } from 'react'
import { Stack } from './Stack'
import { layoutPresets, type LayoutPreset } from '../lib/layoutConfig'

type FormSpacing = 'tight' | 'normal' | 'relaxed'
type FormWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'narrow' | 'comfy' | 'inherit'

interface FormLayoutProps {
  /** Max content width - defaults to xl (576px, was narrow) */
  maxWidth?: FormWidth
  /** Spacing between fields - defaults to normal (24px) */
  spacing?: FormSpacing
  /** HTML element to render */
  as?: 'form' | 'div' | 'section'
  /** Additional styles */
  style?: React.CSSProperties
  /** Form props (onSubmit, etc.) */
  onSubmit?: (e: React.FormEvent) => void
  children: React.ReactNode
  className?: string
}


export const FormLayout: React.FC<FormLayoutProps> = ({
  maxWidth = 'xl',  // 36rem (576px) - focused forms by default
  spacing = 'normal',   // 24px - beautiful default
  as: Component = 'form',
  style,
  onSubmit,
  children,
  className = '',
}) => {
  // Auto-promote narrow/xl → comfy/2xl when font scale >= 1.25
  const [effectiveWidth, setEffectiveWidth] = useState(maxWidth)
  
  useEffect(() => {
    // Only auto-promote if user selected 'narrow' or 'xl'
    if (maxWidth !== 'narrow' && maxWidth !== 'xl') {
      setEffectiveWidth(maxWidth)
      return
    }
    
    // Check a11y font size scale
    const checkScale = () => {
      const scale = parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--a11y-font-size-scale') || '1'
      )
      
      // Auto-promote to comfy/2xl if scale >= 1.25
      if (scale >= 1.25) {
        setEffectiveWidth(maxWidth === 'narrow' ? 'comfy' : '2xl')
      } else {
        setEffectiveWidth(maxWidth)
      }
    }
    
    checkScale()
    
    // Watch for scale changes
    const observer = new MutationObserver(() => {
      checkScale()
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-a11y-mode'],
    })
    
    return () => observer.disconnect()
  }, [maxWidth])
  
  const containerStyle: React.CSSProperties = effectiveWidth === 'inherit'
    ? { width: '100%', ...style }
    : {
        maxWidth: layoutPresets[effectiveWidth as LayoutPreset],
        width: '100%',
        marginInline: 'auto', // Logical property for RTL support
        ...style,
      }
  
  return (
    <Component 
      style={containerStyle}
      onSubmit={onSubmit}
      className={className}
    >
      <Stack spacing={spacing}>
        {children}
      </Stack>
    </Component>
  )
}

// Named export
FormLayout.displayName = 'FormLayout'
