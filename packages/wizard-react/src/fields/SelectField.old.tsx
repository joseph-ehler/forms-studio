/**
 * SelectField Component
 * 
 * Beautiful searchable dropdown with Combobox UI.
 * Consistent 48px sizing, gorgeous popover.
 * 
 * Features:
 * - Type to search/filter
 * - Keyboard navigation
 * - Checkmark on selected
 * - Create custom option
 * - Multiple selection support
 */

import React, { Fragment, useState } from 'react'
import { Controller } from 'react-hook-form'
import { Combobox, Transition } from '@headlessui/react'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { getAriaProps, getLabelProps, getDescriptionProps } from './utils/a11y-helpers'

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
  variant,
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
  const [query, setQuery] = useState('')
  
  const opts = (config as any).options ?? []
  const multiple = (config as any).multiple ?? false
  const allowCustom = (config as any).allowCustom ?? false

  // Filter options based on search query
  const filteredOptions =
    query === ''
      ? opts
      : opts.filter((option: any) => {
          const label = option.label ?? String(option.value ?? option)
          return label.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <Stack spacing="tight">
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
        render={({ field }) => (
          <Combobox
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            multiple={multiple as any}
          >
            {({ open }) => (
              <div className="relative">
                <div className="relative">
                  {/* Search Icon */}
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <Combobox.Input
                    className="w-full rounded-md border border-gray-300 bg-white py-3 pl-10 pr-10 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 min-h-[48px]"
                    displayValue={(option: any) => {
                      if (multiple && Array.isArray(option)) {
                        return option.map((o: any) => o.label || o).join(', ')
                      }
                      return option?.label ?? option ?? ''
                    }}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={placeholder || 'Type to search...'}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Combobox.Button>
                </div>

                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => setQuery('')}
                >
                  <Combobox.Options className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {filteredOptions.length === 0 && query !== '' ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        {allowCustom ? (
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange({ label: query, value: query })
                              setQuery('')
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Create "{query}"
                          </button>
                        ) : (
                          'Nothing found.'
                        )}
                      </div>
                    ) : (
                      filteredOptions.map((option: any, index: number) => {
                        const value = option.value ?? option
                        const label = option.label ?? String(value)

                        return (
                          <Combobox.Option
                            key={`${value}-${index}`}
                            value={option}
                            className={({ active }) =>
                              `relative cursor-pointer select-none min-h-[48px] py-3 pl-10 pr-4 flex items-center ${
                                active ? 'bg-blue-600 text-white' : 'text-gray-900'
                              }`
                            }
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {label}
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
                          </Combobox.Option>
                        )
                      })
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            )}
          </Combobox>
        )}
      />

      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </Stack>
  )
}
