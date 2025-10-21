/**
 * MultiSelectField - Simple & Working
 * Mobile-first responsive multi-select with search
 */

import React, { useState, useRef, useEffect, Fragment } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { Listbox, Transition } from '@headlessui/react'

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
  const [searchQuery, setSearchQuery] = useState('')
  const options = (config as any).options ?? []
  const allowSearch = (config as any).allowSearch ?? true // Default to true for better UX
  
  // Normalize options
  const normalizedOptions = options.map((opt: any) => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )

  // Filter options based on search
  const filteredOptions = allowSearch && searchQuery
    ? normalizedOptions.filter((opt: any) => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions

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
        render={({ field }) => {
          const selectedValues = field.value || []
          const selectedCount = selectedValues.length

          return (
            <Listbox value={selectedValues} onChange={field.onChange} multiple disabled={disabled}>
              {({ open }) => (
                <div className="relative">
                  <Listbox.Button
                    className="relative w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-2.5 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    {selectedCount === 0 ? (
                      <span className="text-gray-400">{placeholder || 'Select options...'}</span>
                    ) : (
                      <span className="font-medium">{selectedCount} selected</span>
                    )}
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </Listbox.Button>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setSearchQuery('')}
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-80 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                      {/* Search input */}
                      {allowSearch && (
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                          <div className="relative">
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
                            <input
                              type="text"
                              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Type to search..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Options list */}
                      <div className="max-h-60 overflow-auto py-1">
                        {filteredOptions.length === 0 ? (
                          <div className="py-2 px-4 text-sm text-gray-500">
                            No options found
                          </div>
                        ) : (
                          filteredOptions.map((option: any) => (
                        <Listbox.Option
                          key={option.value}
                          value={option.value}
                          className={({ active }) =>
                            `relative cursor-pointer select-none min-h-[44px] py-2 pl-10 pr-4 flex items-center ${
                              active ? 'bg-blue-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <input
                                type="checkbox"
                                checked={selected}
                                readOnly
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded border-gray-300"
                              />
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {option.label}
                              </span>
                            </>
                          )}
                        </Listbox.Option>
                          ))
                        )}
                      </div>
                    </Listbox.Options>
                  </Transition>
                </div>
              )}
            </Listbox>
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