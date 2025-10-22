/**
 * Display Component - Marketing/Hero Typography
 * 
 * For large, attention-grabbing text in marketing sections, landing pages, and heroes.
 * Fluid responsive sizing (mobile → desktop).
 * 
 * Usage:
 *   <Display size="2xl">Launch your product faster</Display>
 *   <Display size="xl">Beautiful forms in minutes</Display>
 * 
 * Sizes:
 *   - 2xl: 36-72px (Hero titles)
 *   - xl:  32-60px (Landing sections)
 *   - lg:  30-48px (Page heroes)
 *   - md:  28-36px (Section heroes)
 */

import React from 'react'

interface DisplayProps {
  size?: '2xl' | 'xl' | 'lg' | 'md'
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'div' | 'p'
}

const SIZE_CLASS_MAP = {
  '2xl': 'ds-display-2xl',
  'xl': 'ds-display-xl',
  'lg': 'ds-display-lg',
  'md': 'ds-display-md',
}

export const Display: React.FC<DisplayProps> = ({
  size = 'xl',
  children,
  className = '',
  as: Component = 'h1',
}) => {
  return (
    <Component className={`${SIZE_CLASS_MAP[size]} ${className}`}>
      {children}
    </Component>
  )
}
