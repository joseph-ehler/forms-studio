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

interface FormLayoutProps {
  /** Max content width - defaults to narrow (36rem) */
  maxWidth?: 'narrow' | 'comfy' | 'inherit'
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
  maxWidth = 'narrow',  // 36rem - focused forms by default
  spacing = 'normal',   // 24px - beautiful default
  as: Component = 'form',
  style,
  onSubmit,
  children,
  className = '',
}) => {
  // Auto-promote narrow → comfy when font scale >= 1.25
  const [effectiveWidth, setEffectiveWidth] = useState(maxWidth)
  
  useEffect(() => {
    // Only auto-promote if user selected 'narrow'
    if (maxWidth !== 'narrow') {
      setEffectiveWidth(maxWidth)
      return
    }
    
    // Check a11y font size scale
    const checkScale = () => {
      const scale = parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--a11y-font-size-scale') || '1'
      )
      
      // Auto-promote to comfy if scale >= 1.25
      if (scale >= 1.25) {
        setEffectiveWidth('comfy')
      } else {
        setEffectiveWidth('narrow')
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
        maxWidth: layoutPresets[effectiveWidth as 'narrow' | 'comfy'],
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
