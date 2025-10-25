/**
 * useTheme Hook - Production-grade theme management
 * 
 * Features:
 * - Persists to localStorage
 * - Detects system preference as default
 * - Updates <html data-theme> attribute
 * - SSR-safe
 * - Type-safe
 */

import { useCallback,useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'ds-theme';

/**
 * Get system theme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get stored theme preference
 */
function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return null;
}

/**
 * Resolve theme to actual light/dark value
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

/**
 * Apply theme to document
 */
function applyTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  
  // Also set color-scheme for native controls
  document.documentElement.style.colorScheme = resolvedTheme;
}

/**
 * Theme management hook
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { theme, resolvedTheme, setTheme } = useTheme();
 *   
 *   return (
 *     <div>
 *       <p>Current: {theme} (resolved: {resolvedTheme})</p>
 *       <button onClick={() => setTheme('dark')}>Dark</button>
 *       <button onClick={() => setTheme('light')}>Light</button>
 *       <button onClick={() => setTheme('system')}>System</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme() {
  // Initialize from storage or default to 'system'
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return getStoredTheme() ?? 'system';
  });

  // Resolved theme (light/dark)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    return resolveTheme(theme);
  });

  // Update theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
    
    // Resolve and apply
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Apply theme on mount and listen for system changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply current theme
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    // Listen for system theme changes (only if theme is 'system')
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
      // Legacy browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [theme]);

  return {
    /** Current theme setting ('light' | 'dark' | 'system') */
    theme,
    
    /** Resolved theme ('light' | 'dark') */
    resolvedTheme,
    
    /** Update theme */
    setTheme,
    
    /** Check if dark mode is active */
    isDark: resolvedTheme === 'dark',
    
    /** Check if light mode is active */
    isLight: resolvedTheme === 'light',
  };
}
