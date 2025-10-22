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

import React, { Fragment, useState } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { getAriaProps, getLabelProps, getDescriptionProps } from './utils/a11y-helpers'
import { DayPicker } from 'react-day-picker'
import { format, isValid } from 'date-fns'
import { OverlayPickerCore, OverlaySheet, OverlayPositioner, PickerFooter } from '../components/overlay'
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

  // Overlay state at component level so it persists across Controller re-renders
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  
  console.log('[DateField] Component render - isOverlayOpen:', isOverlayOpen)

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
          console.log('[DateField] Controller render - field.value:', field.value, 'isOverlayOpen:', isOverlayOpen)
          
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

          return (
            <OverlayPickerCore
              open={isOverlayOpen}
              onOpenChange={(newOpen) => {
                console.log('[DateField] onOpenChange called:', newOpen)
                setIsOverlayOpen(newOpen)
              }}
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
                      footer={
                        <PickerFooter
                          onClear={() => field.onChange(null)}
                          onDone={() => close('select')}
                          size="default"
                        />
                      }
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
                          classNames={{
                            day: 'fs-day',
                            day_selected: 'fs-selected',
                            day_today: 'fs-today',
                            day_disabled: 'fs-disabled',
                          }}
                        />
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
                      {({ refs, floatingStyles, EventWrapper, maxHeightPx }) => (
                        <div
                          ref={refs.setFloating as any}
                          style={floatingStyles}
                          data-overlay="picker"
                          className="z-50 bg-white rounded-md shadow-lg ring-1 ring-black/10 flex flex-col overflow-hidden"
                        >
                          <EventWrapper className="flex-1 flex flex-col min-h-0">
                            {/* Calendar Body */}
                            <div
                              ref={contentRef}
                              className="flex-1 min-h-0 overflow-auto p-4"
                            >
                            <div className="flex justify-center">
                              <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={[
                                  ...(disabledDates || []),
                                  ...(minDate ? [{ before: minDate }] : []),
                                  ...(maxDate ? [{ after: maxDate }] : []),
                                ]}
                                classNames={{
                                  day: 'fs-day',
                                  day_selected: 'fs-selected',
                                  day_today: 'fs-today',
                                  day_disabled: 'fs-disabled',
                                }}
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex-shrink-0 border-t border-gray-200 p-3">
                            <PickerFooter
                              onClear={() => field.onChange(null)}
                              onDone={() => close('select')}
                              size="small"
                            />
                          </div>
                        </EventWrapper>
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
