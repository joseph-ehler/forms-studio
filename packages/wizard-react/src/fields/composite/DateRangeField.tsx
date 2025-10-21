/**
 * DateRangeField Component
 * 
 * Beautiful date range picker with dual calendar popover.
 * Select start and end dates visually with range highlighting.
 * 
 * Features:
 * - Dual calendar view
 * - Range highlighting
 * - Quick presets (Today, This Week, This Month, etc.)
 * - Min/max constraints
 * - Duration validation
 * - 48px input height
 */

import React, { Fragment, useState } from 'react'
import { Controller } from 'react-hook-form'
import { OverlayPickerCore, OverlaySheet, OverlayPositioner, calculateOverlayHeights, getOverlayContentClasses } from '../../components/overlay'
import { useDeviceType } from '../../hooks/useDeviceType'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { FormLabel, FormHelperText } from '../../components'
import { Stack } from '../../components/DSShims'
import type { FieldComponentProps } from '../types'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

interface DateRangeValue {
  start?: string
  end?: string
}

// Local (tz-safe) conversion, no UTC skew
const toLocalDateString = (d?: Date) => {
  if (!d) return undefined
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${da}`
}

const fromLocalDateString = (s?: string) => {
  if (!s) return undefined
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export const DateRangeField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,
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
    { label: propLabel, required: propRequired, disabled: propDisabled, description: propDescription, typographyDisplay, typographyVariant },
    json,
    {}
  )
  
  const label = config.label
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  const description = config.description
  
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  const min = (config as any).min ? new Date((config as any).min) : undefined
  const max = (config as any).max ? new Date((config as any).max) : undefined
  const presets = (config as any).presets ?? ['Today', 'This Week', 'This Month', 'Last 30 Days']

  // Quick preset calculations (local timezone)
  const getPresetRange = (preset: string): DateRangeValue => {
    const today = new Date()

    const wStart = new Date(today)
    wStart.setDate(today.getDate() - today.getDay())
    const wEnd = new Date(wStart)
    wEnd.setDate(wStart.getDate() + 6)

    const mStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const mEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const last30Start = new Date(today)
    last30Start.setDate(today.getDate() - 30)

    switch (preset) {
      case 'Today':
        return { start: toLocalDateString(today), end: toLocalDateString(today) }
      case 'This Week':
        return { start: toLocalDateString(wStart), end: toLocalDateString(wEnd) }
      case 'This Month':
        return { start: toLocalDateString(mStart), end: toLocalDateString(mEnd) }
      case 'Last 30 Days':
        return { start: toLocalDateString(last30Start), end: toLocalDateString(today) }
      default:
        return {}
    }
  }

  return (
    <Stack spacing="sm">
      {typography.showLabel && label && (
        <Stack>
          <div id={`${name}-label`}>
            <FormLabel 
              required={typography.showRequired && required} 
              optional={typography.showOptional && !required}
            >
              {label}
            </FormLabel>
          </div>
        </Stack>
      )}
      {typography.showDescription && description && (
        <div className="mb-3">
          <FormHelperText>{description}</FormHelperText>
        </div>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const value: DateRangeValue = field.value || {}
          
          // Convert string dates to Date objects
          const selectedFrom = fromLocalDateString(value.start)
          const selectedTo = fromLocalDateString(value.end)

          // Hover state for live preview
          const [hoverDate, setHoverDate] = React.useState<Date | undefined>(undefined)

          // Compute preview range (from fixed date to hovered date)
          const previewRange =
            selectedFrom && !selectedTo && hoverDate
              ? {
                  from: hoverDate < selectedFrom ? hoverDate : selectedFrom,
                  to: hoverDate < selectedFrom ? selectedFrom : hoverDate,
                }
              : undefined

          const handleRangeChange = (range: DateRange | undefined) => {
            if (!range) {
              field.onChange({})
              return
            }
            field.onChange({
              start: toLocalDateString(range.from),
              end: toLocalDateString(range.to)
            })
          }

          const handlePreset = (preset: string) => {
            field.onChange(getPresetRange(preset))
          }

          const displayValue = value.start && value.end
            ? `${value.start} → ${value.end}`
            : value.start
            ? `From ${value.start}`
            : 'Select date range...'

          const { isMobile } = useDeviceType()
          const heights = calculateOverlayHeights({
            maxHeight: isMobile ? 560 : 500,
            hasSearch: false,
            hasFooter: true,
            footerHeight: isMobile ? 48 : 56,
          })

          // Common DayPicker props with hover preview
          const dayPickerCommon = {
            mode: 'range' as const,
            selected: { from: selectedFrom, to: selectedTo },
            onSelect: handleRangeChange,
            onDayMouseEnter: (d: Date) => setHoverDate(d),
            onDayMouseLeave: () => setHoverDate(undefined),
            fromDate: min,
            toDate: max,
            modifiers: previewRange ? { preview: previewRange } : undefined,
            modifiersClassNames: previewRange ? { preview: 'rdp-preview' } : undefined,
          }

          return (
            <OverlayPickerCore
              closeOnSelect={false}
            >
              {({ isOpen, open, close, triggerRef, contentRef }) => (
                <>
                  {/* Trigger Button */}
                  <button
                    ref={triggerRef as React.RefObject<HTMLButtonElement>}
                    type="button"
                    onClick={() => isOpen ? close() : open()}
                    disabled={disabled}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    aria-controls={`${name}-dialog`}
                    className="w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-3 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between"
                  >
                    <span className={value.start ? 'text-gray-900' : 'text-gray-400'}>
                      {displayValue}
                    </span>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Mobile Sheet */}
                  {isMobile && isOpen && (
                    <OverlaySheet
                      open={isOpen}
                      onClose={() => close('outside')}
                      maxHeight={560}
                      aria-labelledby={`${name}-label`}
                    >
                      {/* Presets */}
                      {presets.length > 0 && (
                        <div className="px-4 pt-4 pb-2 border-b border-gray-200">
                          <div className="text-xs font-medium text-gray-500 mb-2">
                            Quick Select
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {presets.map((preset: string) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  handlePreset(preset)
                                }}
                                className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Calendar */}
                      <div 
                        className="px-4 py-6 flex justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DayPicker
                          {...dayPickerCommon}
                          numberOfMonths={1}
                        />
                      </div>

                      {/* Footer */}
                      <div className="shrink-0 border-t border-gray-200 p-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange({})
                            }}
                            className="flex-1 min-h-[48px] px-4 text-base text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => close('select')}
                            className="flex-1 min-h-[48px] px-4 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </OverlaySheet>
                  )}

                  {/* Desktop Popover */}
                  {!isMobile && isOpen && (
                    <OverlayPositioner
                      open={isOpen}
                      anchor={triggerRef.current}
                      placement="bottom-start"
                      offset={6}
                      strategy="fixed"
                      sameWidth={false}
                      maxHeight={500}
                      collision={{ flip: true, shift: true, size: true }}
                    >
                      {({ refs, floatingStyles, isPositioned }) => (
                        <div
                          ref={refs.setFloating}
                          style={floatingStyles}
                          id={`${name}-dialog`}
                          role="dialog"
                          aria-labelledby={`${name}-label`}
                          className="z-50 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
                        >
                          {/* Content with Presets + Calendar */}
                          <div
                            ref={contentRef}
                            className={getOverlayContentClasses().content}
                            style={{
                              maxHeight: `${heights.contentMaxHeight}px`,
                            }}
                          >
                            <div className="p-4 flex gap-4">
                              {/* Presets Sidebar */}
                              {presets.length > 0 && (
                                <div className="flex flex-col gap-1 pr-4 border-r border-gray-200">
                                  <div className="text-xs font-medium text-gray-500 mb-1">
                                    Quick Select
                                  </div>
                                  {presets.map((preset: string) => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => {
                                        handlePreset(preset)
                                      }}
                                      className="text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700 whitespace-nowrap transition-colors"
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Dual Calendar */}
                              <div>
                                <DayPicker
                                  {...dayPickerCommon}
                                  numberOfMonths={2}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="shrink-0 border-t border-gray-200 p-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange({})
                                }}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                onClick={() => close('select')}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </OverlayPositioner>
                  )}
                </>
              )}
            </OverlayPickerCore>
          )
        }}
      />

      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </Stack>
  )
}
