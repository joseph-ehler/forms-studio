/**
 * Global Loading State (Layer 5: AppShell)
 * 
 * Centralized loading state for global progress indication.
 * Automatically shown in AppShell.Header progress bar.
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   const loading = useLoadingState();
 *   
 *   useEffect(() => {
 *     loading.start();
 *     fetchData().finally(() => loading.stop());
 *   }, []);
 * }
 * ```
 */

import { useState, useEffect } from 'react';

interface LoadingState {
  active: boolean;
  progress: number; // 0-100
}

// Global loading state
let globalState: LoadingState = {
  active: false,
  progress: 0,
};

// Subscribers
const subscribers = new Set<() => void>();

// Active loading count (ref-counted)
let activeLoadingCount = 0;

/**
 * Notify all subscribers of state change
 */
function notifySubscribers() {
  subscribers.forEach((callback) => {
    try {
      callback();
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[LoadingState] Subscriber error:', error);
      }
    }
  });
}

/**
 * Start loading indicator
 */
function startLoading(): void {
  activeLoadingCount++;
  
  if (!globalState.active) {
    globalState = { active: true, progress: 0 };
    notifySubscribers();
    
    // Auto-increment progress
    const interval = setInterval(() => {
      if (globalState.active && globalState.progress < 90) {
        globalState = { ...globalState, progress: globalState.progress + 10 };
        notifySubscribers();
      }
    }, 200);
    
    // Store interval ID for cleanup
    (globalState as any)._interval = interval;
  }
}

/**
 * Stop loading indicator
 */
function stopLoading(): void {
  activeLoadingCount = Math.max(0, activeLoadingCount - 1);
  
  if (activeLoadingCount === 0 && globalState.active) {
    // Complete progress
    globalState = { active: true, progress: 100 };
    notifySubscribers();
    
    // Clear interval
    if ((globalState as any)._interval) {
      clearInterval((globalState as any)._interval);
      delete (globalState as any)._interval;
    }
    
    // Hide after brief delay
    setTimeout(() => {
      globalState = { active: false, progress: 0 };
      notifySubscribers();
    }, 200);
  }
}

/**
 * Set progress manually (0-100)
 */
function setProgress(value: number): void {
  if (globalState.active) {
    globalState = { ...globalState, progress: Math.max(0, Math.min(100, value)) };
    notifySubscribers();
  }
}

/**
 * Hook to control loading state
 * 
 * Returns API to start/stop loading and set progress.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const loading = useLoadingState();
 *   
 *   const handleAction = async () => {
 *     loading.start();
 *     try {
 *       await doSomething();
 *     } finally {
 *       loading.stop();
 *     }
 *   };
 * }
 * ```
 */
export function useLoadingState() {
  return {
    active: globalState.active,
    progress: globalState.progress,
    start: startLoading,
    stop: stopLoading,
    setProgress,
  };
}

/**
 * Hook to observe global loading state
 * 
 * Re-renders when loading state changes.
 * Use this in AppShell.Header to show/hide progress bar.
 * 
 * @example
 * ```tsx
 * function GlobalProgressBar() {
 *   const { active, progress } = useGlobalLoadingState();
 *   
 *   if (!active) return null;
 *   
 *   return <div style={{ width: `${progress}%` }} />;
 * }
 * ```
 */
export function useGlobalLoadingState(): LoadingState {
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    const callback = () => {
      forceUpdate((n) => n + 1);
    };
    
    subscribers.add(callback);
    
    return () => {
      subscribers.delete(callback);
    };
  }, []);
  
  return {
    active: globalState.active,
    progress: globalState.progress,
  };
}

/**
 * Non-hook API for use outside React
 */
export const loadingState = {
  start: startLoading,
  stop: stopLoading,
  setProgress,
  getState: () => ({ ...globalState }),
};
