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
import { Popover, Transition } from '@headlessui/react'
import { DayPicker } from 'react-day-picker'
import { format, isValid } from 'date-fns'
import 'react-day-picker/dist/style.css'

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
          const selectedDate = field.value ? new Date(field.value) : undefined
          const displayValue = field.value
            ? formatDate(field.value)
            : ''

          const handleDateSelect = (date: Date | undefined) => {
            if (date) {
              field.onChange(format(date, 'yyyy-MM-dd'))
            } else {
              field.onChange('')
            }
          }

          return (
            <Popover className="relative">
              {({ open, close }) => (
                <>
                  <Popover.Button
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
                        <DayPicker
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={[
                            ...(disabledDates || []),
                            ...(minDate ? [{ before: minDate }] : []),
                            ...(maxDate ? [{ after: maxDate }] : []),
                          ]}
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
                              field.onChange('')
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
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
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
