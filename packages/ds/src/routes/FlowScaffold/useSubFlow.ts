/**
 * useSubFlow - URL-bound step management for sub-flow navigators
 * 
 * Manages step state in URL query params for:
 * - Shareable URLs (send link to specific step)
 * - Browser back/forward navigation
 * - Deep linking
 * 
 * @example
 * const steps = ['name', 'details', 'invite'] as const;
 * const flow = useSubFlow(steps);
 * 
 * // Current step
 * flow.current // 'name' | 'details' | 'invite'
 * flow.index   // 0 | 1 | 2
 * 
 * // Navigation
 * flow.go('details')
 * flow.go(flow.next)
 * flow.go(flow.prev)
 * 
 * // State
 * flow.isFirst // boolean
 * flow.isLast  // boolean
 */

import { useSearchParams } from 'react-router-dom';
import { useMemo, useRef } from 'react';

export interface SubFlowState<T extends string> {
  /** Current step */
  current: T;
  
  /** Current step index (0-based) */
  index: number;
  
  /** Navigate to a step */
  go: (step: T) => void;
  
  /** Next step (undefined if last) */
  next: T | undefined;
  
  /** Previous step (undefined if first) */
  prev: T | undefined;
  
  /** Is this the first step? */
  isFirst: boolean;
  
  /** Is this the last step? */
  isLast: boolean;
  
  /** Total number of steps */
  total: number;
}

export function useSubFlow<T extends string>(
  steps: readonly T[],
  options: {
    /** Initial step (default: first step) */
    initial?: T;
    /** Query param key (default: 'step') */
    paramKey?: string;
    /** Replace history instead of push (default: false) */
    replace?: boolean;
  } = {}
): SubFlowState<T> {
  const {
    initial = steps[0],
    paramKey = 'step',
    replace = false,
  } = options;

  const [params, setParams] = useSearchParams();
  
  // Current step from URL or initial
  const current = (params.get(paramKey) as T) ?? initial;
  
  // Validate and get index
  const index = useMemo(() => {
    const idx = steps.indexOf(current);
    
    if (idx === -1 && process.env.NODE_ENV !== 'production') {
      console.warn(
        `[useSubFlow] Invalid step "${current}". ` +
        `Valid steps: ${steps.join(', ')}`
      );
      return 0;
    }
    
    return Math.max(0, idx);
  }, [current, steps]);

  // Debounce for URL updates (prevent history thrash)
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Navigate to step
  const go = useMemo(
    () => (step: T) => {
      if (!steps.includes(step)) {
        console.error(
          `[useSubFlow] Cannot navigate to invalid step "${step}"`
        );
        return;
      }
      
      // Debounce URL updates by 150ms
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        params.set(paramKey, step);
        setParams(params, { replace });
      }, 150);
    },
    [params, setParams, paramKey, replace, steps]
  );

  // Next/prev steps
  const next = steps[index + 1];
  const prev = steps[index - 1];

  return {
    current: steps[index], // Ensure valid step
    index,
    go,
    next,
    prev,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    total: steps.length,
  };
}
