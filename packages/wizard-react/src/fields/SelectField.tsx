/**
 * SelectField Component (v2 - Unified Overlay System)
 * 
 * Refactored to use the new unified overlay primitives:
 * - Desktop: Popover with Floating UI positioning
 * - Mobile: Bottom sheet with drag & swipe
 * - Consistent search, keyboard nav, a11y
 * 
 * Features:
 * - Type to search/filter
 * - Keyboard navigation
 * - Checkmark on selected
 * - JSON-configurable UI (presentation, sameWidth, offset, etc.)
 * - Mobile-first by default
 */

import React, { useState, useMemo, useRef } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { useDeviceType } from '../hooks/useDeviceType'
import { OverlayPickerCore, useOverlayContext } from '../components/overlay/OverlayPickerCore'
import { OverlayPositioner } from '../components/overlay/OverlayPositioner'
import { OverlaySheet } from '../components/overlay/OverlaySheet'
import { PickerList } from '../components/picker/PickerList'
import { PickerOption } from '../components/picker/PickerOption'
import { PickerSearch } from '../components/picker/PickerSearch'
import { PickerEmptyState } from '../components/picker/PickerEmptyState'

export const SelectField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,
  placeholder: propPlaceholder,
  required: propRequired,
  disabled: propDisabled,
  description: propDescription,
  control,
  errors,
  json,
  typographyDisplay,
  typographyVariant,
}) => {
  const config = mergeFieldConfig(
    { 
      label: propLabel, 
      placeholder: propPlaceholder, 
      required: propRequired, 
      disabled: propDisabled, 
      description: propDescription,
      typographyDisplay,
      typographyVariant 
    },
    json,
    {}
  )

  const label = config.label
  const placeholder = config.placeholder || 'Select...'
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  const description = config.description

  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )

  // Options & UI config
  const options = (config as any).options ?? []
  const ui = (config as any).ui ?? {}
  const allowSearch = ui.search ?? true

  // Device detection
  const { isMobile } = useDeviceType()
  const presentation = ui.presentation ?? (isMobile ? 'sheet' : 'popover')

  // Search state
  const [query, setQuery] = useState('')

  // Filter options
  const filteredOptions = useMemo(() => {
    if (!allowSearch || !query) return options
    const q = query.toLowerCase()
    return options.filter((opt: any) => {
      const optLabel = opt.label ?? String(opt.value ?? opt)
      return optLabel.toLowerCase().includes(q)
    })
  }, [options, allowSearch, query])

  return (
    <Stack spacing="sm">
      {/* Label */}
      {typography.showLabel && label && (
        <FormLabel 
          htmlFor={name} 
          required={typography.showRequired && required} 
          optional={typography.showOptional && !required}
        >
          {label}
        </FormLabel>
      )}

      {/* Description */}
      {typography.showDescription && description && (
        <FormHelperText>{description}</FormHelperText>
      )}

      {/* Field */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedOption = options.find((opt: any) => 
            (opt.value ?? opt) === field.value
          )
          const displayValue = selectedOption?.label ?? selectedOption ?? ''

          return (
            <OverlayPickerCore
              closeOnSelect={ui.closeOnSelect ?? true}
              trapFocus={true}
              returnFocus={true}
              allowOutsideScroll={false}
              aria-label={label ?? name}
            >
              {({ isOpen, open, close, triggerRef, contentRef }: any) => (
                <>
                  {/* Trigger Button */}
                  <button
                    ref={triggerRef as any}
                    type="button"
                    disabled={disabled}
                    onClick={() => isOpen ? close() : open()}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-controls={`${name}-listbox`}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-base shadow-sm min-h-[48px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
                      {displayValue || placeholder}
                    </span>
                    <svg 
                      className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </button>

                  {/* Content: Sheet on mobile, Popover on desktop */}
                  {isOpen && (
                    presentation === 'sheet' || isMobile ? (
                      <OverlaySheet
                        open={isOpen}
                        onClose={() => close('outside')}
                        maxHeight={ui.maxHeight ?? 560}
                        aria-labelledby={`${name}-label`}
                      >
                        {/* Search */}
                        {allowSearch && (
                          <PickerSearch 
                            value={query} 
                            onChange={setQuery}
                            placeholder="Search..."
                            autoFocus
                          />
                        )}

                        {/* List */}
                        <div ref={contentRef}>
                          <PickerList
                            role="listbox"
                            aria-label={label ?? name}
                          >
                            {filteredOptions.length === 0 ? (
                              <PickerEmptyState message="No results found" />
                            ) : (
                              filteredOptions.map((opt: any, idx: number) => {
                                const optValue = opt.value ?? opt
                                const optLabel = opt.label ?? String(optValue)
                                const isSelected = optValue === field.value

                                return (
                                  <PickerOption
                                    key={`${optValue}-${idx}`}
                                    value={optValue}
                                    selected={isSelected}
                                    disabled={disabled}
                                    onClick={() => {
                                      field.onChange(optValue)
                                      if (ui.closeOnSelect ?? true) {
                                        close('select')
                                      }
                                    }}
                                  >
                                    {optLabel}
                                  </PickerOption>
                                )
                              })
                            )}
                          </PickerList>
                        </div>
                      </OverlaySheet>
                    ) : (
                      <OverlayPositioner
                        open={isOpen}
                        anchor={triggerRef.current}
                        placement={ui.placement ?? 'bottom-start'}
                        offset={ui.offset ?? 6}
                        strategy="fixed"
                        sameWidth={ui.sameWidth ?? true}
                        maxHeight={ui.maxHeight ?? 560}
                        collision={ui.collision ?? { flip: true, shift: true, size: true }}
                      >
                        {({ refs, floatingStyles, isPositioned }) => (
                          <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className="z-50 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
                          >
                            {/* Search */}
                            {allowSearch && (
                              <PickerSearch 
                                value={query} 
                                onChange={setQuery}
                                placeholder="Search..."
                              />
                            )}

                            {/* List */}
                            <div 
                              ref={contentRef}
                              className="overflow-y-auto"
                              style={{ maxHeight: ui.maxHeight ?? 560 }}
                            >
                              <PickerList
                                role="listbox"
                                aria-label={label ?? name}
                              >
                                {filteredOptions.length === 0 ? (
                                  <PickerEmptyState message="No results found" />
                                ) : (
                                  filteredOptions.map((opt: any, idx: number) => {
                                    const optValue = opt.value ?? opt
                                    const optLabel = opt.label ?? String(optValue)
                                    const isSelected = optValue === field.value

                                    return (
                                      <PickerOption
                                        key={`${optValue}-${idx}`}
                                        value={optValue}
                                        selected={isSelected}
                                        disabled={disabled}
                                        onClick={() => {
                                          field.onChange(optValue)
                                          if (ui.closeOnSelect ?? true) {
                                            close('select')
                                          }
                                        }}
                                      >
                                        {optLabel}
                                      </PickerOption>
                                    )
                                  })
                                )}
                              </PickerList>
                            </div>
                          </div>
                        )}
                      </OverlayPositioner>
                    )
                  )}
                </>
              )}
            </OverlayPickerCore>
          )
        }}
      />

      {/* Error */}
      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </Stack>
  )
}
