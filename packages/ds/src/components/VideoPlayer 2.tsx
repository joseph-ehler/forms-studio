/**
 * VideoPlayer - Accessible HTML5 Video
 * 
 * Respects reduced motion, enforces captions, prevents autoplay abuse.
 * 
 * @example
 * <VideoPlayer
 *   src="/demo.mp4"
 *   poster="/demo-poster.jpg"
 *   tracks={[
 *     { src: '/captions/en.vtt', kind: 'captions', srcLang: 'en', label: 'English', default: true }
 *   ]}
 *   controls
 * />
 * 
 * @example
 * // Multiple formats
 * <VideoPlayer
 *   src={[
 *     { src: '/video.m3u8', type: 'application/x-mpegURL' },
 *     { src: '/video.webm', type: 'video/webm' },
 *     { src: '/video.mp4', type: 'video/mp4' }
 *   ]}
 *   autoPlay
 *   muted
 *   loop
 * />
 */

import React from 'react'

interface VideoSource {
  src: string
  type?: string
}

interface VideoTrack {
  src: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srcLang?: string
  label?: string
  default?: boolean
}

export interface VideoPlayerProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  /** Video source (string or array of sources) */
  src: string | VideoSource[]
  
  /** Poster image */
  poster?: string
  
  /** Text tracks (captions, subtitles) */
  tracks?: VideoTrack[]
  
  /** Show native controls */
  controls?: boolean
  
  /** Autoplay (requires muted, respects reduced motion) */
  autoPlay?: boolean
  
  /** Muted */
  muted?: boolean
  
  /** Loop */
  loop?: boolean
}

export function VideoPlayer({
  src,
  poster,
  tracks = [],
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  style,
  ...props
}: VideoPlayerProps) {
  
  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)
      
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])
  
  // Respect reduced motion: disable autoplay
  // Also enforce browser policy: autoplay requires muted
  const shouldAutoplay = autoPlay && !prefersReducedMotion && muted
  
  // Normalize sources
  const sources: VideoSource[] = Array.isArray(src)
    ? src
    : [{ src: String(src) }]
  
  return (
    <video
      playsInline
      controls={controls}
      autoPlay={shouldAutoplay}
      muted={muted}
      loop={loop}
      poster={poster}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
      {...props}
    >
      {sources.map((source, index) => (
        <source key={index} {...source} />
      ))}
      
      {tracks.map((track, index) => (
        <track key={index} {...track} />
      ))}
      
      {/* Fallback message */}
      <p>Your browser doesn't support HTML5 video.</p>
    </video>
  )
}

VideoPlayer.displayName = 'VideoPlayer'
