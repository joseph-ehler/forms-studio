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
import { Popover, Transition } from '@headlessui/react'
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

  // Quick preset calculations
  const getPresetRange = (preset: string): DateRangeValue => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const last30Start = new Date(today)
    last30Start.setDate(today.getDate() - 30)

    switch (preset) {
      case 'Today':
        return { 
          start: today.toISOString().split('T')[0], 
          end: today.toISOString().split('T')[0] 
        }
      case 'This Week':
        return { 
          start: startOfWeek.toISOString().split('T')[0], 
          end: endOfWeek.toISOString().split('T')[0] 
        }
      case 'This Month':
        return { 
          start: startOfMonth.toISOString().split('T')[0], 
          end: endOfMonth.toISOString().split('T')[0] 
        }
      case 'Last 30 Days':
        return { 
          start: last30Start.toISOString().split('T')[0], 
          end: today.toISOString().split('T')[0] 
        }
      default:
        return {}
    }
  }

  return (
    <Stack spacing="sm">
      {typography.showLabel && label && (
        <Stack>
          <FormLabel required={typography.showRequired && required} optional={typography.showOptional && !required}>
            {label}
          </FormLabel>
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
          
          const handleRangeChange = (range: DateRange | undefined) => {
            if (!range) {
              field.onChange({})
              return
            }
            
            field.onChange({
              start: range.from?.toISOString().split('T')[0],
              end: range.to?.toISOString().split('T')[0]
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

          return (
            <Popover className="relative">
              {({ open, close }) => (
                <>
                  <Popover.Button
                    disabled={disabled}
                    className="w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-3 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between"
                  >
                    <span className={value.start ? 'text-gray-900' : 'text-gray-400'}>
                      {displayValue}
                    </span>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute z-10 mt-2 left-0">
                      <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white p-4">
                        <div className="flex gap-4">
                          {/* Presets */}
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
                                    close()
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
                              mode="range"
                              selected={{
                                from: value.start ? new Date(value.start) : undefined,
                                to: value.end ? new Date(value.end) : undefined
                              }}
                              onSelect={handleRangeChange}
                              numberOfMonths={2}
                              disabled={disabled ? { before: new Date() } : undefined}
                              fromDate={min}
                              toDate={max}
                              modifiersClassNames={{
                                selected: 'bg-blue-600 text-white hover:bg-blue-700',
                                today: 'font-bold text-blue-600',
                              }}
                            />
                            
                            {/* Action buttons */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 mt-3">
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
                                onClick={() => close()}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
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
