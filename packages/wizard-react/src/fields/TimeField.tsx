/**
 * TimeField Component
 * 
 * Beautiful time picker with interval list popover.
 * Consistent 48px sizing, no responsive variants.
 * 
 * Features:
 * - Interval-based selection (15/30/60 min)
 * - 12/24 hour format
 * - Min/max constraints
 * - Scrollable list
 * - Keyboard navigation
 * - 48px input height
 * - Typography system
 */

import React, { Fragment } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { OverlayPickerCore, OverlaySheet, OverlayPositioner, calculateOverlayHeights, getOverlayContentClasses } from '../components/overlay'
import { PickerList, PickerOption, PickerEmptyState } from '../components/picker'
import { useDeviceType } from '../hooks/useDeviceType'

export const TimeField: React.FC<FieldComponentProps> = ({
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
  const step = (config as any).step ?? 30
  const format = (config as any).format ?? '24'
  const format24 = format !== '12'
  const defaultValue = (config as any).defaultValue

  // Generate hour and minute options
  const generateHours = (): number[] => {
    return format24 ? Array.from({ length: 24 }, (_, i) => i) : Array.from({ length: 12 }, (_, i) => i + 1)
  }

  const generateMinutes = (): number[] => {
    const minutes: number[] = []
    for (let i = 0; i < 60; i += step) {
      minutes.push(i)
    }
    return minutes
  }

  const hours = generateHours()
  const minutes = generateMinutes()

  // Format time for display
  const formatTimeDisplay = (time24: string): string => {
    if (!time24) return ''
    
    if (format24) return time24
    
    const [hours, mins] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${String(mins).padStart(2, '0')} ${period}`
  }

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
          // Parse current time value
          const parseTime = (time24: string) => {
            if (!time24) return { hour: format24 ? 0 : 12, minute: 0, period: 'AM' }
            const [h, m] = time24.split(':').map(Number)
            return {
              hour: format24 ? h : (h % 12 || 12),
              minute: m,
              period: h >= 12 ? 'PM' : 'AM'
            }
          }

          const currentTime = parseTime(field.value)
          const [selectedHour, setSelectedHour] = React.useState(currentTime.hour)
          const [selectedMinute, setSelectedMinute] = React.useState(currentTime.minute)
          const [selectedPeriod, setSelectedPeriod] = React.useState<'AM' | 'PM'>(currentTime.period as 'AM' | 'PM')

          const updateFieldValue = (hour: number, minute: number, period: 'AM' | 'PM') => {
            let hour24 = hour
            if (!format24) {
              if (period === 'PM' && hour !== 12) hour24 = hour + 12
              if (period === 'AM' && hour === 12) hour24 = 0
            }
            const time24 = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
            field.onChange(time24)
          }

          return (
            <OverlayPickerCore closeOnSelect={false}>
              {({ isOpen, open, close, triggerRef, contentRef }) => (
                <>
                  {/* Trigger Button */}
                  <button
                    ref={triggerRef as React.RefObject<HTMLButtonElement>}
                    type="button"
                    onClick={() => isOpen ? close() : open()}
                    disabled={disabled}
                    className="relative w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-3 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between"
                  >
                    <span className={field.value ? 'text-gray-900' : 'text-gray-400'}>
                      {field.value ? formatTimeDisplay(field.value) : placeholder || 'Select time...'}
                    </span>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Mobile & Desktop: Same compact picker */}
                  {isOpen && (
                    <OverlayPositioner
                      open={isOpen}
                      anchor={triggerRef.current}
                      placement="bottom-start"
                      offset={6}
                      strategy="fixed"
                      sameWidth={true}
                      maxHeight={400}
                      collision={{ flip: true, shift: true, size: true }}
                    >
                      {({ refs, floatingStyles }) => (
                        <div
                          ref={refs.setFloating}
                          style={floatingStyles}
                          className="z-50 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-4"
                        >
                          <div ref={contentRef} className="space-y-4">
                            {/* Time Selectors */}
                            <div className="flex items-center gap-2">
                              {/* Hour */}
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Hour</label>
                                <select
                                  value={selectedHour}
                                  onChange={(e) => {
                                    const h = Number(e.target.value)
                                    setSelectedHour(h)
                                    updateFieldValue(h, selectedMinute, selectedPeriod)
                                  }}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {hours.map(h => (
                                    <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="text-2xl font-bold text-gray-400 pt-6">:</div>

                              {/* Minute */}
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Minute</label>
                                <select
                                  value={selectedMinute}
                                  onChange={(e) => {
                                    const m = Number(e.target.value)
                                    setSelectedMinute(m)
                                    updateFieldValue(selectedHour, m, selectedPeriod)
                                  }}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {minutes.map(m => (
                                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                                  ))}
                                </select>
                              </div>

                              {/* AM/PM for 12-hour */}
                              {!format24 && (
                                <div className="flex-1">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Period</label>
                                  <select
                                    value={selectedPeriod}
                                    onChange={(e) => {
                                      const p = e.target.value as 'AM' | 'PM'
                                      setSelectedPeriod(p)
                                      updateFieldValue(selectedHour, selectedMinute, p)
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Done Button */}
                            <button
                              type="button"
                              onClick={() => close('select')}
                              className="w-full min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                              Done
                            </button>
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

      {/* Time format hint */}
      {(min || max || format === '12') && (
        <p className="text-xs text-gray-400">
          {format === '12' && 'Format: 12-hour (AM/PM)'}
          {format === '24' && 'Format: 24-hour'}
          {(min || max) && ` • `}
          {min && max
            ? `Range: ${formatTimeDisplay(min)} - ${formatTimeDisplay(max)}`
            : min
            ? `Earliest: ${formatTimeDisplay(min)}`
            : max
            ? `Latest: ${formatTimeDisplay(max)}`
            : ''}
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
