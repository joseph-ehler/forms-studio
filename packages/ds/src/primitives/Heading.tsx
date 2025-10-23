/**
 * Heading Component - Semantic SaaS/App Headings
 * 
 * For page titles, section headers, and content structure in SaaS applications.
 * Supports both traditional sizes AND semantic importance levels.
 * 
 * Usage:
 *   <Heading importance="critical">Hero Title</Heading>
 *   <Heading importance="primary">Page Title</Heading>
 *   <Heading level="h2">Section Title</Heading>
 *   <Heading size="xl">Custom Size</Heading>
 * 
 * Importance Levels (NEW - Recommended):
 *   - critical: Hero headlines, alerts, CTAs (auto-scales 1.5x at lowVision)
 *   - primary: Page titles, main headings (auto-scales 1.3x)
 *   - secondary: Section titles (auto-scales 1.15x)
 *   - tertiary: Card titles (auto-scales 1.0x)
 *   - minor: Captions (auto-scales 0.95x)
 * 
 * Sizes (Legacy - Still supported):
 *   - xl, lg, md, sm, xs
 */

import React, { useEffect, useState } from 'react'
import { type Importance, SEMANTIC_SIZES, A11Y_IMPORTANCE_MULTIPLIERS, sizeToImportance } from '../utils/semanticSizing'

interface HeadingProps {
  /** Semantic importance (recommended) */
  importance?: Importance
  /** Legacy size prop (deprecated - use importance instead) */
  size?: 'xl' | 'lg' | 'md' | 'sm' | 'xs'
  /** HTML heading level */
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: React.ReactNode
  className?: string
}

const SIZE_CLASS_MAP = {
  'xl': 'ds-heading-xl',
  'lg': 'ds-heading-lg',
  'md': 'ds-heading-md',
  'sm': 'ds-heading-sm',
  'xs': 'ds-heading-xs',
}

// Default size per semantic level (can be overridden with size prop)
const LEVEL_TO_SIZE = {
  h1: 'xl',
  h2: 'lg',
  h3: 'md',
  h4: 'sm',
  h5: 'xs',
  h6: 'xs',
} as const

export const Heading: React.FC<HeadingProps> = ({
  importance,
  size,
  level = 'h2',
  children,
  className = '',
}) => {
  const Component = level
  const [a11yScale, setA11yScale] = useState(1)
  
  // Watch for A11Y scale changes
  useEffect(() => {
    const updateScale = () => {
      const scale = parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--a11y-font-size-scale') || '1'
      )
      setA11yScale(scale)
    }
    
    updateScale()
    
    const observer = new MutationObserver(updateScale)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-a11y-mode'],
    })
    
    return () => observer.disconnect()
  }, [])
  
  // If importance is provided, use semantic sizing
  if (importance) {
    const base = SEMANTIC_SIZES[importance]
    const multiplier = A11Y_IMPORTANCE_MULTIPLIERS[importance]
    const totalScale = multiplier * a11yScale
    
    // Parse base font size
    const baseSize = parseFloat(base.fontSize)
    const unit = base.fontSize.replace(/[\d.]/g, '')
    
    const semanticStyle: React.CSSProperties = {
      fontSize: `${baseSize * totalScale}${unit}`,
      lineHeight: base.lineHeight,
      fontWeight: base.fontWeight,
      letterSpacing: base.letterSpacing,
      margin: 0,
      fontFamily: 'var(--ds-font-heading)',
      color: 'var(--ds-color-text-primary)',
    }
    
    return (
      <Component 
        style={semanticStyle}
        className={className}
        data-ds-role="heading"
        data-ds-importance={importance}
      >
        {children}
      </Component>
    )
  }
  
  // Legacy: use traditional size classes
  const effectiveSize = size || LEVEL_TO_SIZE[level]
  
  return (
    <Component 
      className={`${SIZE_CLASS_MAP[effectiveSize]} ${className}`}
      data-ds-role="heading"
    >
      {children}
    </Component>
  )
}
