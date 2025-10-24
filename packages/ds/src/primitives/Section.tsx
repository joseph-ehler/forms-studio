/**
 * Section - Full-Bleed Background Surface Primitive
 * 
 * Section provides edge-to-edge backgrounds, gradients, media, and dividers.
 * Always pair with Container for content width constraints.
 * 
 * @example
 * // Explicit composition (recommended)
 * <Section bg="primary" gradient="bottom" tone="dark">
 *   <Container maxWidth="narrow" padding>
 *     <Display>Hero Title</Display>
 *   </Container>
 * </Section>
 * 
 * @example
 * // Auto-container convenience
 * <Section bg="subtle" maxWidth="standard" padding>
 *   <Heading>Quick Feature Block</Heading>
 * </Section>
 */

import React, { useEffect, useState } from 'react'
import { Container } from './Container'
import type { LayoutPreset } from '../utils'
import { resolveTone, getToneStyles, type Tone } from '../white-label'

type BgTone = 'transparent' | 'base' | 'subtle' | 'elevated' | 'primary' | 'accent'
type ThemeTone = 'auto' | 'light' | 'dark'
type GradientOverlay = 'none' | 'top' | 'bottom' | 'cover'
type DividerShape = 'none' | 'subtle' | 'strong' | 'wave' | 'diagonal'
type VerticalRhythm = 'sm' | 'md' | 'lg' | 'xl' | 'none'

interface BgImageConfig {
  src: string
  srcSet?: string
  sizes?: string
  position?: string
  repeat?: 'no-repeat' | 'repeat'
  attachment?: 'scroll' | 'fixed'
}

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /** Semantic HTML element */
  as?: 'section' | 'div' | 'header' | 'footer' | 'nav'
  
  /** Background tone (token-based) */
  bg?: BgTone
  
  /** Custom background color (escape hatch for brand splashes) */
  bgColor?: string
  
  /** CSS background image (simple case) */
  bgImage?: BgImageConfig
  
  /** Responsive media slot (Picture, Video, Parallax) */
  bgMedia?: React.ReactNode
  
  /** Gradient overlay */
  gradient?: GradientOverlay
  
  /** Gradient opacity multiplier (0-1) */
  overlayOpacity?: number
  
  /** Text contrast tone (forces safe color tokens) */
  tone?: ThemeTone
  
  /** Top border */
  borderTop?: boolean
  
  /** Bottom border */
  borderBottom?: boolean
  
  /** Top divider shape */
  dividerTop?: DividerShape
  
  /** Bottom divider shape */
  dividerBottom?: DividerShape
  
  /** Vertical padding (rhythm) */
  paddingY?: VerticalRhythm
  
  /** Auto-container: content width preset */
  maxWidth?: LayoutPreset | 'full'
  
  /** Auto-container: horizontal padding */
  padding?: boolean
  
  /** Custom inline styles */
  style?: React.CSSProperties
}

const BG_TOKEN_MAP: Record<BgTone, string> = {
  transparent: 'var(--ds-section-bg-transparent)',
  base: 'var(--ds-section-bg-base)',
  subtle: 'var(--ds-section-bg-subtle)',
  elevated: 'var(--ds-section-bg-elevated)',
  primary: 'var(--ds-section-bg-primary)',
  accent: 'var(--ds-section-bg-accent)',
}

const GRADIENT_TOKEN_MAP: Record<GradientOverlay, string> = {
  none: 'none',
  top: 'var(--ds-section-grad-top)',
  bottom: 'var(--ds-section-grad-bottom)',
  cover: 'var(--ds-section-grad-cover)',
}

const PADDING_Y_TOKEN_MAP: Record<VerticalRhythm, string> = {
  none: '0',
  sm: 'var(--ds-section-py-sm)',
  md: 'var(--ds-section-py-md)',
  lg: 'var(--ds-section-py-lg)',
  xl: 'var(--ds-section-py-xl)',
}

const TONE_CLASS_MAP: Record<ThemeTone, string> = {
  auto: 'ds-tone-auto',
  light: 'ds-tone-light',
  dark: 'ds-tone-dark',
}

export function Section({
  as: Tag = 'section',
  bg = 'transparent',
  bgColor,
  bgImage,
  bgMedia,
  gradient = 'none',
  overlayOpacity = 1,
  tone = 'auto',
  borderTop,
  borderBottom,
  dividerTop = 'none',
  dividerBottom = 'none',
  paddingY = 'lg',
  maxWidth,
  padding,
  children,
  style,
  className = '',
  ...rest
}: SectionProps) {
  const [resolvedTone, setResolvedTone] = useState<Tone>(tone === 'auto' ? 'light' : tone)
  
  // Auto-resolve tone from background
  useEffect(() => {
    if (tone !== 'auto') {
      setResolvedTone(tone)
      return
    }
    
    const detectTone = async () => {
      // Get background value to analyze
      const bgValue = bgColor || 
                      (bgImage?.src) || 
                      (bg !== 'transparent' ? BG_TOKEN_MAP[bg] : undefined)
      
      const detected = await resolveTone(bgValue, tone)
      setResolvedTone(detected)
    }
    
    detectTone()
  }, [bg, bgColor, bgImage, tone])
  
  // Resolve background from tokens or custom color
  const bgToken = BG_TOKEN_MAP[bg]
  const background = bgColor ?? bgToken
  
  // Resolve gradient overlay
  const gradientStyle = GRADIENT_TOKEN_MAP[gradient]
  
  // Resolve vertical padding
  const pyVar = PADDING_Y_TOKEN_MAP[paddingY]
  
  // Resolve tone class and styles
  const toneClass = TONE_CLASS_MAP[resolvedTone]
  const toneStyles = getToneStyles(resolvedTone)
  
  // Build base styles with tone
  const baseStyles: React.CSSProperties = {
    position: 'relative',
    width: '100vw',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
    background,
    paddingTop: pyVar,
    paddingBottom: pyVar,
    ...(bgImage && {
      backgroundImage: `url(${bgImage.src})`,
      backgroundSize: 'cover',
      backgroundRepeat: bgImage.repeat ?? 'no-repeat',
      backgroundPosition: bgImage.position ?? 'center',
      backgroundAttachment: bgImage.attachment ?? 'scroll',
    }),
    ...toneStyles,
    ...style,
  }
  
  // Build class names
  const classNames = ['ds-section', toneClass, className].filter(Boolean).join(' ')
  
  // Content (auto-wrapped in Container if maxWidth provided)
  const content = maxWidth ? (
    <Container maxWidth={maxWidth} padding={padding}>
      {children}
    </Container>
  ) : (
    children
  )
  
  return (
    <Tag className={classNames} style={baseStyles} {...rest}>
      {/* Background media layer (Picture, Video) */}
      {bgMedia && (
        <div className="ds-section__media" aria-hidden="true">
          {bgMedia}
        </div>
      )}
      
      {/* Gradient overlay */}
      {gradient !== 'none' && (
        <div
          className="ds-section__overlay"
          aria-hidden="true"
          style={{
            opacity: overlayOpacity,
            backgroundImage: gradientStyle,
          }}
        />
      )}
      
      {/* Top border */}
      {borderTop && (
        <div className="ds-section__border ds-section__border--top" aria-hidden="true" />
      )}
      
      {/* Top divider */}
      {dividerTop !== 'none' && (
        <div className={`ds-section__divider ds-section__divider--top ds-section__divider--${dividerTop}`} aria-hidden="true" />
      )}
      
      {/* Content */}
      <div className="ds-section__content">
        {content}
      </div>
      
      {/* Bottom divider */}
      {dividerBottom !== 'none' && (
        <div className={`ds-section__divider ds-section__divider--bottom ds-section__divider--${dividerBottom}`} aria-hidden="true" />
      )}
      
      {/* Bottom border */}
      {borderBottom && (
        <div className="ds-section__border ds-section__border--bottom" aria-hidden="true" />
      )}
    </Tag>
  )
}

Section.displayName = 'Section'
