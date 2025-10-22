/**
 * Transition Tokens - Animation & Motion
 * 
 * ALL transition/animation values live here.
 * Consistent timing creates polished UX.
 */

export const TRANSITION_TOKENS = {
  // Duration
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy
  },
  
  // Common transitions (property + duration + easing)
  common: {
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'background-color 150ms ease-in-out, border-color 150ms ease-in-out, color 150ms ease-in-out',
    opacity: 'opacity 200ms ease-in-out',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 150ms ease-in-out',
  },
} as const;

export type DurationKey = keyof typeof TRANSITION_TOKENS.duration;
export type EasingKey = keyof typeof TRANSITION_TOKENS.easing;
export type CommonTransitionKey = keyof typeof TRANSITION_TOKENS.common;

export const getDuration = (key: DurationKey): string => TRANSITION_TOKENS.duration[key];
export const getEasing = (key: EasingKey): string => TRANSITION_TOKENS.easing[key];
export const getTransition = (key: CommonTransitionKey): string => TRANSITION_TOKENS.common[key];
