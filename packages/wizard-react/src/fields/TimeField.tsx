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
            if (!time24) return { hour: 0, minute: 0 }
            const [h, m] = time24.split(':').map(Number)
            return { hour: h, minute: m }
          }

          const currentTime = parseTime(field.value)
          const [use24Hour, setUse24Hour] = React.useState(format24)
          const [hour, setHour] = React.useState(currentTime.hour)
          const [minute, setMinute] = React.useState(currentTime.minute)

          // Convert 24h to display format
          const getDisplayHour = (h24: number): number => {
            if (use24Hour) return h24
            return h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
          }

          const getPeriod = (h24: number): string => {
            return h24 >= 12 ? 'PM' : 'AM'
          }

          const updateFieldValue = (newHour: number, newMinute: number) => {
            setHour(newHour)
            setMinute(newMinute)
            const time24 = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`
            field.onChange(time24)
          }

          const handleHourInput = (value: string) => {
            const num = parseInt(value) || 0
            const max = use24Hour ? 23 : 23
            const clamped = Math.max(0, Math.min(max, num))
            updateFieldValue(clamped, minute)
          }

          const handleMinuteInput = (value: string) => {
            const num = parseInt(value) || 0
            const clamped = Math.max(0, Math.min(59, num))
            updateFieldValue(hour, clamped)
          }

          const incrementHour = () => {
            const max = use24Hour ? 23 : 23
            const newHour = hour >= max ? 0 : hour + 1
            updateFieldValue(newHour, minute)
          }

          const decrementHour = () => {
            const max = use24Hour ? 23 : 23
            const newHour = hour <= 0 ? max : hour - 1
            updateFieldValue(newHour, minute)
          }

          const incrementMinute = () => {
            const newMinute = minute + step >= 60 ? 0 : minute + step
            updateFieldValue(hour, newMinute)
          }

          const decrementMinute = () => {
            const newMinute = minute - step < 0 ? 60 - step : minute - step
            updateFieldValue(hour, newMinute)
          }

          const setPeriod = (isPM: boolean) => {
            const currentIsPM = hour >= 12
            if (isPM === currentIsPM) return
            const newHour = isPM ? (hour < 12 ? hour + 12 : hour) : (hour >= 12 ? hour - 12 : hour)
            updateFieldValue(newHour, minute)
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

                  {/* Time Picker Popover */}
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
                            {/* Format Toggle */}
                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                              <span className="text-sm font-medium text-gray-700">Time Format</span>
                              <button
                                type="button"
                                onClick={() => setUse24Hour(!use24Hour)}
                                className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
                              >
                                {use24Hour ? '24hr' : '12hr'}
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </button>
                            </div>

                            {/* Time Inputs with Steppers */}
                            <div className="flex items-center justify-center gap-1">
                              {/* Hour Input with Steppers */}
                              <div className="flex flex-col items-center">
                                <button
                                  type="button"
                                  onClick={incrementHour}
                                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={String(getDisplayHour(hour)).padStart(2, '0')}
                                  onChange={(e) => handleHourInput(e.target.value)}
                                  onBlur={(e) => handleHourInput(e.target.value)}
                                  className="w-16 text-4xl font-bold text-gray-900 text-center border-2 border-gray-200 rounded-md focus:border-blue-500 focus:outline-none my-2"
                                  maxLength={2}
                                />
                                <button
                                  type="button"
                                  onClick={decrementHour}
                                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>

                              {/* Colon */}
                              <div className="text-4xl font-bold text-gray-400 mx-1 mb-6">:</div>

                              {/* Minute Input with Steppers */}
                              <div className="flex flex-col items-center">
                                <button
                                  type="button"
                                  onClick={incrementMinute}
                                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={String(minute).padStart(2, '0')}
                                  onChange={(e) => handleMinuteInput(e.target.value)}
                                  onBlur={(e) => handleMinuteInput(e.target.value)}
                                  className="w-16 text-4xl font-bold text-gray-900 text-center border-2 border-gray-200 rounded-md focus:border-blue-500 focus:outline-none my-2"
                                  maxLength={2}
                                />
                                <button
                                  type="button"
                                  onClick={decrementMinute}
                                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* AM/PM Segmented Control (12hr only) */}
                            {!use24Hour && (
                              <div className="flex items-center justify-center mt-2">
                                <div className="inline-flex rounded-md shadow-sm border border-gray-300" role="group">
                                  <button
                                    type="button"
                                    onClick={() => setPeriod(false)}
                                    className={`px-6 py-2 text-sm font-medium rounded-l-md transition-colors ${
                                      getPeriod(hour) === 'AM'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    AM
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPeriod(true)}
                                    className={`px-6 py-2 text-sm font-medium rounded-r-md border-l transition-colors ${
                                      getPeriod(hour) === 'PM'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                    }`}
                                  >
                                    PM
                                  </button>
                                </div>
                              </div>
                            )}

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
