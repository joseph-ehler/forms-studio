/**
 * OverlayPicker - Universal Overlay Component
 * 
 * Single primitive for Select, MultiSelect, Date, Time, Phone, Address, Color.
 * Mobile-first with bottom sheet; desktop uses popover/modal via tokens.
 * 
 * Features:
 * - presentation: 'sheet' | 'modal' | 'popover' (defaults to sheet on mobile)
 * - density: 'cozy' | 'compact' (defaults to cozy on mobile)
 * - searchable: boolean (sticky search bar)
 * - Container queries handle desktop scaling (no separate components)
 */

import React, { Fragment, ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export interface OverlayPickerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  
  // UI configuration (JSON-driven)
  presentation?: 'sheet' | 'modal' | 'popover'
  density?: 'cozy' | 'compact'
  searchable?: boolean
  
  // Content
  title?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  
  // Actions
  actions?: ReactNode
  showClear?: boolean
  onClear?: () => void
}

export const OverlayPicker: React.FC<OverlayPickerProps> = ({
  isOpen,
  onClose,
  children,
  presentation = 'sheet',
  density = 'cozy',
  searchable = true,
  title,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  actions,
  showClear,
  onClear,
}) => {
  // Touch-optimized row heights by density
  const rowHeight = density === 'cozy' ? 'min-h-[60px]' : 'min-h-[48px]'
  
  // Container queries handle responsive scaling
  // Mobile: sheet from bottom
  // Tablet: larger sheet
  // Desktop: centered modal or popover
  const containerClass = presentation === 'sheet'
    ? 'fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl @container'
    : presentation === 'modal'
    ? 'fixed inset-0 flex items-center justify-center p-4 @container'
    : 'absolute mt-2 rounded-lg shadow-xl @container'
  
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        
