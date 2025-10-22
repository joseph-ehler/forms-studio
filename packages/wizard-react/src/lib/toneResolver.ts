/**
 * Tone Resolver - Auto-detect background luminance
 * 
 * Analyzes background colors, gradients, and images to determine
 * optimal text tone (light/dark) for accessibility.
 * 
 * Philosophy:
 * - Marketing gets loud backgrounds
 * - Low vision gets guaranteed legibility
 * - Auto-detection = no guessing
 */

/**
 * Tone types
 */
export type Tone = 'light' | 'dark' | 'auto'

/**
 * Threshold for light vs dark (0-1, where 1 is white)
 * Default: 0.54 (WCAG recommendation)
 */
export const TONE_THRESHOLD = 0.54

/**
 * Get relative luminance from RGB (WCAG formula)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Parse color string to RGB
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const num = parseInt(hex, 16)
    
    if (hex.length === 3) {
      return {
        r: ((num >> 8) & 0xf) * 17,
        g: ((num >> 4) & 0xf) * 17,
        b: (num & 0xf) * 17,
      }
    } else if (hex.length === 6) {
      return {
        r: (num >> 16) & 0xff,
        g: (num >> 8) & 0xff,
        b: num & 0xff,
      }
    }
  }
  
  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    }
  }
  
  // Handle named colors via canvas
  if (typeof document !== 'undefined') {
    const ctx = document.createElement('canvas').getContext('2d')
    if (ctx) {
      ctx.fillStyle = color
      const computed = ctx.fillStyle
      return parseColor(computed)
    }
  }
  
  return null
}

/**
 * Detect tone from solid color
 */
export function detectToneFromColor(color: string, threshold: number = TONE_THRESHOLD): Tone {
  const rgb = parseColor(color)
  if (!rgb) return 'dark' // Default to dark if parsing fails
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > threshold ? 'dark' : 'light'
}

/**
 * Sample image to detect dominant luminance
 * Uses canvas to analyze pixel data
 */
export async function detectToneFromImage(
  imageUrl: string,
  threshold: number = TONE_THRESHOLD
): Promise<Tone> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        // Create canvas and draw image (scaled down for performance)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve('dark')
          return
        }
        
        // Sample at smaller size for performance
        const sampleSize = 50
        canvas.width = sampleSize
        canvas.height = sampleSize
        
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize)
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
        const data = imageData.data
        
        // Calculate average luminance
        let totalLuminance = 0
        const pixelCount = sampleSize * sampleSize
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          totalLuminance += getLuminance(r, g, b)
        }
        
        const avgLuminance = totalLuminance / pixelCount
        resolve(avgLuminance > threshold ? 'dark' : 'light')
      } catch (error) {
        console.warn('[ToneResolver] Failed to analyze image:', error)
        resolve('dark')
      }
    }
    
    img.onerror = () => {
      console.warn('[ToneResolver] Failed to load image:', imageUrl)
      resolve('dark')
    }
    
    img.src = imageUrl
  })
}

/**
 * Detect tone from gradient
 * Samples multiple points and averages
 */
export function detectToneFromGradient(gradient: string, threshold: number = TONE_THRESHOLD): Tone {
  // Extract colors from gradient string
  const colorMatches = gradient.match(/#[0-9a-f]{3,6}|rgba?\([^)]+\)/gi)
  if (!colorMatches || colorMatches.length === 0) {
    return 'dark'
  }
  
  // Average luminance of all colors
  let totalLuminance = 0
  let validColors = 0
  
  colorMatches.forEach(color => {
    const rgb = parseColor(color)
    if (rgb) {
      totalLuminance += getLuminance(rgb.r, rgb.g, rgb.b)
      validColors++
    }
  })
  
  if (validColors === 0) return 'dark'
  
  const avgLuminance = totalLuminance / validColors
  return avgLuminance > threshold ? 'dark' : 'light'
}

/**
 * Auto-detect tone from any background value
 */
export async function resolveTone(
  background: string | undefined,
  explicitTone: Tone = 'auto',
  threshold: number = TONE_THRESHOLD
): Promise<Tone> {
  // If explicit tone provided, use it
  if (explicitTone !== 'auto') {
    return explicitTone
  }
  
  // No background, default to light text on dark
  if (!background) {
    return 'light'
  }
  
  // Detect type of background
  if (background.includes('gradient')) {
    return detectToneFromGradient(background, threshold)
  }
  
  // Check if it's an image URL
  if (background.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) || background.startsWith('http')) {
    return await detectToneFromImage(background, threshold)
  }
  
  // Solid color
  return detectToneFromColor(background, threshold)
}

/**
 * Get CSS variables for tone
 */
export function getToneStyles(tone: Tone): {
  color: string
  '--section-tone': Tone
} {
  return {
    color: tone === 'dark' 
      ? 'var(--ds-color-text-primary)' 
      : 'var(--ds-color-text-inverted, #fafafa)',
    '--section-tone': tone,
  }
}
