/**
 * Motion Hook
 * 
 * Respects prefers-reduced-motion for accessibility.
 * Provides consistent motion tokens across the app.
 * 
 * Philosophy:
 * - Motion enhances UX for most users
 * - But causes nausea/discomfort for some (vestibular disorders)
 * - Always respect user preference
 */

import { useState, useEffect } from 'react';
// import * as transitions from '../utils'; // TODO: Fix TRANSITION_TOKENS export

interface MotionConfig {
  duration: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    slower: number;
  };
  easing: any; // typeof transitions.TRANSITION_TOKENS.easing;
  prefersReduced: boolean;
}

/**
 * Hook to get motion configuration
 * Automatically respects prefers-reduced-motion
 */
export function useMotion(): MotionConfig {
  const [prefersReduced, setPrefersReduced] = useState(false);
  
  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    
    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);
  
  // If reduced motion, use instant/fast only
  const duration = prefersReduced
    ? {
        instant: 0,
        fast: 0,
        normal: 0,
        slow: 0,
        slower: 0,
      }
    : {
        instant: 0, // TODO: Use TRANSITION_TOKENS.duration.instant
        fast: 150,
        normal: 250,
        slow: 350,
        slower: 500,
      };
  
  return {
    duration,
    easing: {}, // TODO: Use TRANSITION_TOKENS.easing
    prefersReduced,
  };
}

/**
 * Get CSS transition value
 */
export function getTransition(
  property: string,
  duration: keyof MotionConfig['duration'],
  easing: keyof MotionConfig['easing'] = 'easeInOut',
): string {
  const motion = useMotion();
  
  if (motion.prefersReduced) {
    return 'none';
  }
  
  return `${property} ${motion.duration[duration]}ms ${motion.easing[easing]}`;
}

/**
 * Motion-aware class helper
 */
export function motionClass(baseClass: string, motionClass: string): string {
  const motion = useMotion();
  
  if (motion.prefersReduced) {
    return baseClass;
  }
  
  return `${baseClass} ${motionClass}`;
}
