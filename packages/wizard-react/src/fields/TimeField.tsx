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
import { Listbox, Transition } from '@headlessui/react'

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

  // Generate time options based on step
  const generateTimeOptions = (): string[] => {
    const options: string[] = []
    const totalMinutes = 24 * 60
    
    for (let minutes = 0; minutes < totalMinutes; minutes += step) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const time24 = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
      
      // Filter by min/max
      if (min && time24 < min) continue
      if (max && time24 > max) continue
      
      options.push(time24)
    }
    
    return options
  }

  const timeOptions = generateTimeOptions()

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
        render={({ field }) => (
          <Listbox value={field.value || ''} onChange={field.onChange} disabled={disabled}>
            {({ open }) => (
              <div className="relative">
                <Listbox.Button className="relative w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-3 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between">
                  <span className={field.value ? 'text-gray-900' : 'text-gray-400'}>
                    {field.value ? formatTimeDisplay(field.value) : placeholder || 'Select time...'}
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
                </Listbox.Button>

                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {timeOptions.length === 0 ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        No times available
                      </div>
                    ) : (
                      timeOptions.map((time) => (
                        <Listbox.Option
                          key={time}
                          value={time}
                          className={({ active }) =>
                            `relative cursor-pointer select-none min-h-[48px] py-3 pl-10 pr-4 flex items-center ${
                              active ? 'bg-blue-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {({ selected, active }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {formatTimeDisplay(time)}
                              </span>
                              {selected && (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? 'text-white' : 'text-blue-600'
                                  }`}
                                >
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))
                    )}
                  </Listbox.Options>
                </Transition>
              </div>
            )}
          </Listbox>
        )}
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
