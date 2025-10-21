/**
 * DateField Component
 * 
 * Beautiful date picker with calendar popover.
 * Consistent 48px sizing, no responsive variants.
 * 
 * Features:
 * - Visual calendar picker
 * - Month/year navigation
 * - Disabled dates
 * - Min/max constraints
 * - Clear button
 * - 48px input height
 */

import React, { Fragment } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { getAriaProps, getLabelProps, getDescriptionProps } from './utils/a11y-helpers'
import { DayPicker } from 'react-day-picker'
import { format, isValid } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { OverlayPickerCore, OverlaySheet, OverlayPositioner, calculateOverlayHeights, getOverlayContentClasses } from '../components/overlay'
import { useDeviceType } from '../hooks/useDeviceType'

// Local (tz-safe) conversion helpers
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

export const DateField: React.FC<FieldComponentProps> = ({
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
    { label: propLabel, placeholder: propPlaceholder, required: propRequired, disabled: propDisabled, description: propDescription, typographyDisplay, typographyVariant },
    json,
    {}
  )
  
  const label = config.label
  const placeholder = config.placeholder
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  const description = config.description
  
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  
  const min = (config as any).min
  const max = (config as any).max
  const defaultValue = (config as any).defaultValue
  const disabledDates = (config as any).disabledDates?.map((d: string) => new Date(d)) || []
  
  const minDate = min ? new Date(min) : undefined
  const maxDate = max ? new Date(max) : undefined

  return (
    <Stack spacing="sm">
      {typography.showLabel && label && (
        <FormLabel htmlFor={name} required={typography.showRequired && required} optional={typography.showOptional && !required}>
          {label}
        </FormLabel>
      )}
      {typography.showDescription && description && (
        <FormHelperText>{description}</FormHelperText>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => {
          const selectedDate = fromLocalDateString(field.value)
          const displayValue = field.value
            ? formatDate(field.value)
            : ''

          const handleDateSelect = (date: Date | undefined) => {
            if (date) {
              field.onChange(toLocalDateString(date))
            } else {
              field.onChange('')
            }
          }

          const { isMobile } = useDeviceType()
          const heights = calculateOverlayHeights({
            maxHeight: 560,
            hasSearch: false,
            hasFooter: true,
            footerHeight: 48,
          })

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
                    className="w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-3 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between"
                  >
                    <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
                      {displayValue || placeholder || 'Select date...'}
                    </span>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
                      {/* Calendar Body */}
                      <div className="px-4 py-6 flex justify-center">
                        <DayPicker
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={[
                            ...(disabledDates || []),
                            ...(minDate ? [{ before: minDate }] : []),
                            ...(maxDate ? [{ after: maxDate }] : []),
                          ]}
                          styles={{
                            day: {
                              borderRadius: '50%',
                            },
                            day_button: {
                              borderRadius: '50%',
                            }
                          }}
                        />
                      </div>

                      {/* Footer */}
                      <div className="shrink-0 border-t border-gray-200 p-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange('')
                              close('select')
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
                      sameWidth={true}
                      maxHeight={560}
                      collision={{ flip: true, shift: true, size: true }}
                    >
                      {({ refs, floatingStyles, isPositioned }) => (
                        <div
                          ref={refs.setFloating}
                          style={floatingStyles}
                          className="z-50 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
                        >
                          {/* Calendar Body */}
                          <div
                            ref={contentRef}
                            className={getOverlayContentClasses().content}
                            style={{
                              maxHeight: `${heights.contentMaxHeight}px`,
                            }}
                          >
                            <div className="p-4 flex justify-center">
                              <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={[
                                  ...(disabledDates || []),
                                  ...(minDate ? [{ before: minDate }] : []),
                                  ...(maxDate ? [{ after: maxDate }] : []),
                                ]}
                                styles={{
                                  day: {
                                    borderRadius: '50%',
                                  },
                                  day_button: {
                                    borderRadius: '50%',
                                  }
                                }}
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="shrink-0 border-t border-gray-200 p-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange('')
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

      {/* Min/Max hint */}
      {(min || max) && (
        <p className="text-xs text-gray-400">
          {min && max
            ? `Date range: ${formatDate(min)} - ${formatDate(max)}`
            : min
            ? `Earliest: ${formatDate(min)}`
            : `Latest: ${formatDate(max)}`}
        </p>
      )}

      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </Stack>
  )
}

// Helper function to format date string
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  
  try {
    const date = new Date(dateStr)
    if (!isValid(date)) return dateStr
    return format(date, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}
