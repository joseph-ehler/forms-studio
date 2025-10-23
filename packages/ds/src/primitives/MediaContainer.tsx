/**
 * MediaContainer - Smart Figure for Images/Video
 * 
 * Enforces aspect ratios, provides overlay/caption slots,
 * snaps to layout presets, and guarantees CLS prevention.
 * 
 * @example
 * <MediaContainer ratio="16:9" maxWidth="wide" caption="Product demo">
 *   <Picture alt="Demo" img={{ src: '/demo.jpg' }} />
 * </MediaContainer>
 * 
 * @example
 * // With overlay
 * <MediaContainer ratio="21:9" overlay={<BrandBadge />}>
 *   <VideoPlayer src="/hero.mp4" />
 * </MediaContainer>
 */

import React from 'react'
import { layoutPresets, type LayoutPreset } from '../utils/layoutConfig'

type AspectRatio = '1:1' | '4:3' | '3:2' | '16:9' | '21:9' | 'auto'
type ObjectFit = 'cover' | 'contain'

export interface MediaContainerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /** Aspect ratio (enforced via CSS aspect-ratio) */
  ratio?: AspectRatio
  
  /** Object-fit for children */
  fit?: ObjectFit
  
  /** Max width (snaps to layout presets) */
  maxWidth?: LayoutPreset | 'full'
  
  /** Caption (shows at bottom with gradient overlay) */
  caption?: React.ReactNode
  
  /** Overlay content (badges, actions, gradients) */
  overlay?: React.ReactNode
  
  /** Makes container clickable (adds focus ring, cursor) */
  clickable?: boolean
  
  /** Custom styles */
  style?: React.CSSProperties
  
  /** Children (Picture, VideoPlayer, or img/video) */
  children: React.ReactNode
}

const ASPECT_RATIO_MAP: Record<AspectRatio, string> = {
  '1:1': 'var(--ds-aspect-1-1)',
  '4:3': 'var(--ds-aspect-4-3)',
  '3:2': 'var(--ds-aspect-3-2)',
  '16:9': 'var(--ds-aspect-16-9)',
  '21:9': 'var(--ds-aspect-21-9)',
  'auto': 'auto',
}

export function MediaContainer({
  ratio = 'auto',
  fit = 'cover',
  maxWidth,
  caption,
  overlay,
  clickable = false,
  children,
  className = '',
  style,
  ...props
}: MediaContainerProps) {
  
  // Resolve aspect ratio token
  const aspectRatio = ASPECT_RATIO_MAP[ratio]
  
  // Resolve max width from layout presets
  const resolvedMaxWidth = maxWidth && maxWidth !== 'full'
    ? layoutPresets[maxWidth]
    : maxWidth === 'full' ? '100%' : undefined
  
  // Build container styles
  const containerStyles: React.CSSProperties = {
    maxWidth: resolvedMaxWidth,
    marginInline: resolvedMaxWidth ? 'auto' : undefined,
    border: 'var(--ds-media-border)',
    borderRadius: 'var(--ds-media-radius)',
    background: 'var(--ds-media-bg)',
    boxShadow: 'var(--ds-media-shadow)',
    position: 'relative',
    overflow: 'hidden',
    aspectRatio,
    cursor: clickable ? 'pointer' : undefined,
    ...style,
  }
  
  // Focus ring styles for clickable containers
  const focusStyles: React.CSSProperties | undefined = clickable ? {
    outline: `var(--ds-media-focus-ring-width) solid var(--ds-media-focus-ring)`,
    outlineOffset: 'var(--ds-media-focus-ring-offset)',
  } : undefined
  
  return (
    <figure
      className={`ds-media-container ${className}`}
      style={containerStyles}
      data-ratio={ratio}
      data-max-width={maxWidth}
      data-clickable={clickable ? 'true' : undefined}
      {...(clickable ? { tabIndex: 0, onFocus: (e) => Object.assign(e.currentTarget.style, focusStyles) } : {})}
      {...props}
    >
      {/* Media content (fills container) */}
      <div 
        className="ds-media-container__content"
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        {children}
      </div>      
      {/* Overlay slot (badges, gradients, actions) */}
      {overlay && (
        <div
          className="ds-media-container__overlay"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {overlay}
        </div>
      )}
      
      {/* Caption (bottom with gradient) */}
      {caption && (
        <figcaption
          className="ds-media-container__caption"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 'var(--ds-space-4)',
            color: 'var(--ds-media-caption-color)',
            backgroundImage: 'var(--ds-media-caption-bg)',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

MediaContainer.displayName = 'MediaContainer'
