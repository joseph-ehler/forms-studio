/**
 * PullToRefresh - Native Pull-to-Refresh
 * 
 * iOS-style pull-to-refresh with spring animation.
 * 
 * Features:
 * - Pull gesture detection
 * - Loading spinner
 * - Spring animation
 * - Haptic feedback
 * - Resistance (rubber band effect)
 * 
 * Usage:
 *   <PullToRefresh onRefresh={async () => {
 *     await fetchData()
 *   }}>
 *     <div>Scrollable content</div>
 *   </PullToRefresh>
 */

import React, { useRef, useState, useEffect } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  threshold?: number
  resistance?: number
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  threshold = 80,
  resistance = 0.55,
  disabled = false,
  children,
  className = '',
}) => {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)
  
  // Check if container is scrolled to top
  const isAtTop = () => {
    if (!containerRef.current) return false
    return containerRef.current.scrollTop === 0
  }
  
  useEffect(() => {
    if (disabled || !containerRef.current) return
    
    const container = containerRef.current
    
    const handleTouchStart = (e: TouchEvent) => {
      if (!isAtTop() || isRefreshing) return
      
      startYRef.current = e.touches[0].clientY
      currentYRef.current = e.touches[0].clientY
      setIsDragging(true)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || isRefreshing) return
      
      currentYRef.current = e.touches[0].clientY
      const delta = currentYRef.current - startYRef.current
      
      // Only track pulls downward when at top
      if (delta > 0 && isAtTop()) {
        // Apply resistance (rubber band effect)
        const distance = Math.pow(delta, resistance)
        setPullDistance(distance)
        
        // Prevent default scroll when pulling
        if (distance > 0) {
          e.preventDefault()
        }
      } else {
        setPullDistance(0)
      }
    }
    
    const handleTouchEnd = async () => {
      if (!isDragging) return
      
      setIsDragging(false)
      
      // If pulled past threshold, trigger refresh
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        setPullDistance(threshold) // Snap to threshold height
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(10)
        }
        
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
          setPullDistance(0)
        }
      } else {
        // Spring back
        setPullDistance(0)
      }
    }
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('touchcancel', handleTouchEnd)
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [disabled, isDragging, isRefreshing, pullDistance, threshold, resistance, onRefresh])
  
  const progress = Math.min(1, pullDistance / threshold)
  const spinnerOpacity = progress
  const spinnerRotation = progress * 360
  
  return (
    <div
      ref={containerRef}
      className={`ds-pull-to-refresh ${className}`}
      style={{
        height: '100%',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
      }}
    >
      {/* Pull indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: pullDistance,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 'var(--ds-space-2)',
          overflow: 'hidden',
          pointerEvents: 'none',
          transition: isDragging ? 'none' : 'height 300ms var(--ds-spring-smooth)',
        }}
      >
        {/* Spinner */}
        <div
          style={{
            width: 24,
            height: 24,
            opacity: spinnerOpacity,
            transform: isRefreshing 
              ? 'rotate(0deg)' 
              : `rotate(${spinnerRotation}deg)`,
            transition: isRefreshing 
              ? 'none'
              : 'opacity 200ms, transform 200ms',
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="var(--ds-color-primary-bg)" 
              strokeWidth="3" 
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset={isRefreshing ? undefined : 60 - (60 * progress)}
              style={{
                transition: 'stroke-dashoffset 200ms',
              }}
            />
          </svg>
        </div>
      </div>
      
      {/* Content with offset */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging ? 'none' : 'transform 300ms var(--ds-spring-smooth)',
        }}
      >
        {children}
      </div>
      
      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
