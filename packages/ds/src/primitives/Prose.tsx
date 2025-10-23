/**
 * Prose Component - CMS/Markdown Content Container
 * 
 * THE ONLY PLACE where typography gets external margins.
 * For rich text content (blogs, articles, CMS, markdown).
 * 
 * Usage:
 *   <Prose>                                // Default: prose (65ch)
 *     <article dangerouslySetInnerHTML={{ __html: html }} />
 *   </Prose>
 * 
 *   <Prose maxWidth="standard">           // 56rem for sections
 *     <h1>Marketing Content</h1>
 *   </Prose>
 * 
 * Width Presets:
 *   - prose: 65ch - Reading by measure (default, adapts to font size)
 *   - standard: 56rem - Typical sections
 *   - wide: 64rem - Media-rich content
 *   - max: 80rem - Full width
 * 
 * Philosophy:
 * - Atoms (Heading, Body, etc.) remain neutral everywhere else
 * - Prose creates a "content mode" where HTML gets vertical rhythm
 * - Scoped to .ds-prose so it can't leak
 */

import React from 'react'
import { layoutPresets, type LayoutPreset } from '@intstudio/ds/utils'
import '../styles/components/ds-prose.css'

interface ProseProps {
  size?: 'sm' | 'md' | 'lg'
  maxWidth?: LayoutPreset
  children: React.ReactNode
  className?: string
}

export const Prose: React.FC<ProseProps> = ({
  size = 'md',
  maxWidth = 'prose', // Default: 65ch measure-based reading
  children,
  className = '',
}) => {
  const classes = [
    'ds-prose',
    size !== 'md' && `ds-prose--${size}`,
    className,
  ].filter(Boolean).join(' ')
  
  const style: React.CSSProperties = {
    maxWidth: layoutPresets[maxWidth],
    marginInline: 'auto', // Center + RTL support
  }
  
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  )
}

Prose.displayName = 'Prose'
