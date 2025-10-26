/**
 * Flowbite Theme Configuration for DS Token Parity
 * 
 * Maps Flowbite Modal components to DS token utilities.
 * Ensures desktop Modal matches mobile Drawer visual language.
 */

import type { CustomFlowbiteTheme } from 'flowbite-react';

export const dsFlowbiteTheme: CustomFlowbiteTheme = {
  modal: {
    root: {
      base: 'fixed inset-0 z-[var(--z-sheet)] overflow-y-auto',
      show: {
        on: 'flex',
        off: 'hidden',
      },
      sizes: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-3xl',
        '2xl': 'max-w-4xl',
        '3xl': 'max-w-5xl',
        '4xl': 'max-w-6xl',
        '5xl': 'max-w-7xl',
        '6xl': 'max-w-8xl',
        '7xl': 'max-w-screen-2xl',
      },
      positions: {
        'top-left': 'items-start justify-start',
        'top-center': 'items-start justify-center',
        'top-right': 'items-start justify-end',
        'center-left': 'items-center justify-start',
        'center': 'items-center justify-center',
        'center-right': 'items-center justify-end',
        'bottom-right': 'items-end justify-end',
        'bottom-center': 'items-end justify-center',
        'bottom-left': 'items-end justify-start',
      },
    },
    content: {
      base: 'bg-surface-base rounded-ds-3 shadow-ds-sheet w-full',
      inner: 'relative flex flex-col',
    },
    header: {
      base: 'px-ds-6 py-ds-4 border-b border-subtle',
      popup: 'px-ds-6 py-ds-4',
      title: 'text-base font-medium text-gray-900 dark:text-white',
      close: {
        base: 'ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white',
        icon: 'h-5 w-5',
      },
    },
    body: {
      base: 'px-ds-6 py-ds-6 flex-1 overflow-auto',
      popup: 'p-ds-6',
    },
    footer: {
      base: 'px-ds-6 py-ds-4 border-t border-subtle bg-surface-raised',
      popup: 'border-t border-gray-200 dark:border-gray-600',
    },
  },
};
