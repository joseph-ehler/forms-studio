/**
 * ThemeToggle Component - Production UI for theme switching
 * 
 * Features:
 * - Three-way toggle (light/dark/system)
 * - Icons for each state
 * - Keyboard accessible
 * - Shows current state
 * - Minimal, clean design
 */

import { useTheme } from '../hooks/useTheme';

type ThemeToggleProps = {
  /** Show labels (default: false) */
  showLabels?: boolean;
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Custom className */
  className?: string;
};

/**
 * Theme toggle component
 * 
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle showLabels size="lg" />
 * ```
 */
export function ThemeToggle({ showLabels = false, size = 'md', className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'text-xs p-1.5',
    md: 'text-sm p-2',
    lg: 'text-base p-2.5',
  };

  const iconSize = {
    sm: '16',
    md: '20',
    lg: '24',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 ${className}`}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {/* Light */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        data-interactive
        data-variant="ghost"
        data-size={size}
        className={`
          ${sizeClasses[size]}
          rounded-md transition-all
          ${theme === 'light' 
            ? 'bg-white dark:bg-gray-700 shadow-sm' 
            : ''
          }
        `}
        aria-label="Light theme"
        role="radio"
        aria-checked={theme === 'light'}
      >
        <svg
          width={iconSize[size]}
          height={iconSize[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        {showLabels && <span className="ml-1.5">Light</span>}
      </button>

      {/* Dark */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        data-interactive
        data-variant="ghost"
        data-size={size}
        className={`
          ${sizeClasses[size]}
          rounded-md transition-all
          ${theme === 'dark' 
            ? 'bg-white dark:bg-gray-700 shadow-sm' 
            : ''
          }
        `}
        aria-label="Dark theme"
        role="radio"
        aria-checked={theme === 'dark'}
      >
        <svg
          width={iconSize[size]}
          height={iconSize[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        {showLabels && <span className="ml-1.5">Dark</span>}
      </button>

      {/* Auto (System) */}
      <button
        type="button"
        onClick={() => setTheme('system')}
        data-interactive
        data-variant="ghost"
        data-size={size}
        className={`
          ${sizeClasses[size]}
          rounded-md transition-all
          ${theme === 'system' 
            ? 'bg-white dark:bg-gray-700 shadow-sm' 
            : ''
          }
        `}
        aria-label="System theme"
        role="radio"
        aria-checked={theme === 'system'}
      >
        <svg
          width={iconSize[size]}
          height={iconSize[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        {showLabels && <span className="ml-1.5">Auto</span>}
      </button>
    </div>
  );
}
