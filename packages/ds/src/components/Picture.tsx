/**
 * Picture - Responsive Image with Art Direction
 * 
 * Thin wrapper for <picture> with art direction + format support.
 * Prevents hand-rolling srcset/source every time.
 * 
 * @example
 * // Format fallback (AVIF → WebP → JPEG)
 * <Picture
 *   alt="Product shot"
 *   sources={[
 *     { src: '/product.avif', type: 'image/avif' },
 *     { src: '/product.webp', type: 'image/webp' }
 *   ]}
 *   img={{ src: '/product.jpg' }}
 * />
 * 
 * @example
 * // Art direction (different crops per breakpoint)
 * <Picture
 *   alt="Hero image"
 *   sources={[
 *     { src: '/hero-mobile.jpg', media: '(max-width: 767px)' },
 *     { src: '/hero-desktop.jpg', media: '(min-width: 768px)' }
 *   ]}
 *   img={{ src: '/hero-desktop.jpg' }}
 * />
 */

import React from 'react'

interface PictureSource {
  /** Image source URL */
  src: string
  
  /** Media query for art direction */
  media?: string
  
  /** MIME type (e.g., 'image/avif', 'image/webp') */
  type?: string
  
  /** Srcset for responsive sizes */
  srcSet?: string
  
  /** Sizes attribute */
  sizes?: string
}

export interface PictureProps {
  /** Alt text (required for accessibility) */
  alt: string
  
  /** Source elements for art direction/formats */
  sources?: PictureSource[]
  
  /** Fallback img element props (src required) */
  img: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt'> & { src: string }
  
  /** Loading strategy */
  loading?: 'lazy' | 'eager'
  
  /** Decoding hint */
  decoding?: 'sync' | 'async' | 'auto'
  
  /** Fetch priority (for hero images) */
  fetchPriority?: 'high' | 'low' | 'auto'
}

export function Picture({
  alt,
  sources = [],
  img,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
}: PictureProps) {
  
  // Merge loading/decoding/priority into img props
  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    ...img,
    alt,
    loading,
    decoding,
    ...(fetchPriority && { fetchpriority: fetchPriority }), // lowercase for React
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      ...img.style,
    },
  }
  
  return (
    <picture>
      {sources.map((source, index) => (
        <source key={index} {...source} />
      ))}
      <img {...imgProps} />
    </picture>
  )
}

Picture.displayName = 'Picture'
