/**
 * Device Detection Hook
 * 
 * Detects device type and capabilities to determine
 * whether to use native or custom field variants.
 */

import { useEffect, useState } from 'react'

export interface DeviceType {
  isTouchDevice: boolean    // Has touch screen
  isMobile: boolean          // Small screen (< 768px)
  isTablet: boolean          // Medium screen (768-1024px)
  isDesktop: boolean         // Large screen (> 1024px)
  isIOS: boolean             // iOS device
  isAndroid: boolean         // Android device
  preferNative: boolean      // Should use native inputs
  supportsHover: boolean     // Has hover capability
}

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => getDeviceType())

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceType
}

function getDeviceType(): DeviceType {
  // Check if running in browser (SSR safety)
  if (typeof window === 'undefined') {
    return {
      isTouchDevice: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isIOS: false,
      isAndroid: false,
      preferNative: false,
      supportsHover: true,
    }
  }

  // Touch detection
  const isTouchDevice = 
    window.matchMedia('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0

  // Screen size detection
  const width = window.innerWidth
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const isDesktop = width >= 1024

  // Platform detection
  const userAgent = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
  const isAndroid = /Android/.test(userAgent)

  // Hover support
  const supportsHover = window.matchMedia('(hover: hover)').matches

  // Determine if we should prefer native inputs
  // Use native on mobile devices for better UX
  const preferNative = isMobile || (isTouchDevice && !isDesktop)

  return {
    isTouchDevice,
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    preferNative,
    supportsHover,
  }
}
