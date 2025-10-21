/**
 * MultiSelectField Component (v2 - Unified Overlay System)
 * 
 * Refactored to use the new unified overlay primitives:
 * - Desktop: Popover with Floating UI positioning
 * - Mobile: Bottom sheet with sticky footer (Done/Clear)
 * - Chips display in trigger (with +N more)
 * - closeOnSelect: false (stays open for multiple selections)
 * 
 * Features:
 * - Type to search/filter
 * - Checkboxes for selection state
 * - Keyboard navigation
 * - Chips with × remove
 * - Done/Clear footer buttons
 * - JSON-configurable UI
 * - Mobile-first by default
 */

import React, { useState, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { useDeviceType } from '../hooks/useDeviceType'
import { OverlayPickerCore } from '../components/overlay/OverlayPickerCore'
import { OverlayPositioner } from '../components/overlay/OverlayPositioner'
import { OverlaySheet } from '../components/overlay/OverlaySheet'
import { PickerList } from '../components/picker/PickerList'
import { PickerOption } from '../components/picker/PickerOption'
import { PickerSearch } from '../components/picker/PickerSearch'
import { PickerEmptyState } from '../components/picker/PickerEmptyState'

export const MultiSelectField: React.FC<FieldComponentProps> = ({
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
  const placeholder = config.placeholder || 'Select options...'
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
  const maxChipsDisplay = ui.maxChipsDisplay ?? 3

  // Device detection
  const { isMobile } = useDeviceType()
  const presentation = ui.presentation ?? (isMobile ? 'sheet' : 'popover')

  // Search state
  const [query, setQuery] = useState('')

  // Normalize options
  const normalizedOptions = useMemo(() => 
    options.map((opt: any) => 
      typeof opt === 'string' ? { label: opt, value: opt } : opt
    ), [options])

  // Filter options
  const filteredOptions = useMemo(() => {
    if (!allowSearch || !query) return normalizedOptions
    const q = query.toLowerCase()
    return normalizedOptions.filter((opt: any) => {
      const optLabel = opt.label ?? String(opt.value ?? opt)
      return optLabel.toLowerCase().includes(q)
    })
  }, [normalizedOptions, allowSearch, query])

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
          const selectedValues = Array.isArray(field.value) ? field.value : []
          const selectedOptions = normalizedOptions.filter((opt: any) =>
            selectedValues.includes(opt.value)
          )

          // Toggle selection
          const toggleSelection = (value: string) => {
            const newValues = selectedValues.includes(value)
              ? selectedValues.filter((v: string) => v !== value)
              : [...selectedValues, value]
            field.onChange(newValues)
          }

          // Clear all
          const clearAll = () => {
            field.onChange([])
          }

          return (
            <OverlayPickerCore
              closeOnSelect={ui.closeOnSelect ?? false} // Stay open for multi-select
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
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm min-h-[48px] flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    {/* Chips display */}
                    {selectedOptions.length === 0 ? (
                      <span className="text-gray-400">{placeholder}</span>
                    ) : (
                      <div className="flex flex-1 flex-wrap gap-1 items-center">
                        {selectedOptions.slice(0, maxChipsDisplay).map((opt: any) => (
                          <span
                            key={opt.value}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSelection(opt.value)
                            }}
                          >
                            {opt.label}
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </span>
                        ))}
                        {selectedOptions.length > maxChipsDisplay && (
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                            +{selectedOptions.length - maxChipsDisplay} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Arrow */}
                    <svg 
                      className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
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
                        footer={
                          <div className="flex justify-between items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                clearAll()
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                            >
                              Clear All
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {selectedOptions.length} selected
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  close('select')
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 min-h-[44px]"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        }
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
                            aria-multiselectable={true}
                          >
                            {filteredOptions.length === 0 ? (
                              <PickerEmptyState message="No results found" />
                            ) : (
                              filteredOptions.map((opt: any, idx: number) => {
                                const optValue = opt.value
                                const optLabel = opt.label ?? String(optValue)
                                const isSelected = selectedValues.includes(optValue)

                                return (
                                  <div
                                    key={`${optValue}-${idx}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => toggleSelection(optValue)}
                                    className="flex items-center gap-3 px-3 py-2.5 min-h-[48px] text-sm text-gray-900 cursor-pointer hover:bg-gray-50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      readOnly
                                      className="h-5 w-5 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="flex-1">{optLabel}</span>
                                  </div>
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
                        {({ refs, floatingStyles }) => (
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
                              style={{ maxHeight: ui.maxHeight ?? 400 }}
                            >
                              <PickerList
                                role="listbox"
                                aria-label={label ?? name}
                                aria-multiselectable={true}
                              >
                                {filteredOptions.length === 0 ? (
                                  <PickerEmptyState message="No results found" />
                                ) : (
                                  filteredOptions.map((opt: any, idx: number) => {
                                    const optValue = opt.value
                                    const optLabel = opt.label ?? String(optValue)
                                    const isSelected = selectedValues.includes(optValue)

                                    return (
                                      <div
                                        key={`${optValue}-${idx}`}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => toggleSelection(optValue)}
                                        className="flex items-center gap-3 px-3 py-2 min-h-[44px] text-sm text-gray-900 cursor-pointer hover:bg-gray-50"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          readOnly
                                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                        />
                                        <span className="flex-1">{optLabel}</span>
                                      </div>
                                    )
                                  })
                                )}
                              </PickerList>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 px-3 py-2 flex justify-between items-center bg-gray-50">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  clearAll()
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900"
                              >
                                Clear All
                              </button>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {selectedOptions.length} selected
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    close('select')
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                  Done
                                </button>
                              </div>
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
