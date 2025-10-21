/**
 * AddressField Component
 * 
 * Beautiful multi-part address input with searchable state selector.
 * Features search, full state names, and clean layout.
 * 
 * Features:
 * - Searchable state selector with popover
 * - Full state names + abbreviations
 * - Auto-capitalization
 * - ZIP code validation
 * - 48px consistent sizing
 */

import React, { Fragment, useState } from 'react'
import { Controller } from 'react-hook-form'
import { Listbox, Transition } from '@headlessui/react'
import type { FieldComponentProps } from '../types'
import { FormStack, FormGrid, Stack } from '../../components'
import { FormLabel, FormHelperText } from '../../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

interface AddressValue {
  street?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

interface State {
  code: string
  name: string
}

// US States with full names
const US_STATES: State[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

export const AddressField: React.FC<FieldComponentProps> = ({
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
  const [searchQuery, setSearchQuery] = useState('')
  const showStreet2 = (config as any).showStreet2 ?? true
  const showCountry = (config as any).showCountry ?? false
  const defaultCountry = (config as any).defaultCountry ?? 'US'

  // Filter states based on search
  const filteredStates = searchQuery
    ? US_STATES.filter(state =>
        state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        state.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : US_STATES

  return (
    <Stack spacing="lg">
      {typography.showLabel && label && (
        <div className="mb-2">
          <FormLabel required={typography.showRequired && required} optional={typography.showOptional && !required}>
            {label}
          </FormLabel>
        </div>
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
          const value: AddressValue = field.value || {}
          const selectedState = US_STATES.find(s => s.code === value.state)

          const updateField = (key: keyof AddressValue, val: string) => {
            field.onChange({ ...value, [key]: val })
          }

          return (
            <Stack spacing="lg">
              {/* Street Address */}
              <div>
                <label htmlFor={`${name}-street`} className="sr-only">
                  Street Address
                </label>
                <input
                  id={`${name}-street`}
                  type="text"
                  autoComplete="address-line1"
                  enterKeyHint="next"
                  autoCapitalize="words"
                  value={value.street || ''}
                  onChange={(e) => updateField('street', e.target.value)}
                  placeholder="Street Address"
                  disabled={disabled}
                  className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 min-h-[48px]"
                />
              </Stack>

              {/* Street Address Line 2 */}
              {showStreet2 && (
                <div>
                  <label htmlFor={`${name}-street2`} className="sr-only">
                    Apartment, suite, etc.
                  </label>
                  <input
                    id={`${name}-street2`}
                    type="text"
                    autoComplete="address-line2"
                    enterKeyHint="next"
                    autoCapitalize="words"
                    value={value.street2 || ''}
                    onChange={(e) => updateField('street2', e.target.value)}
                    placeholder="Apartment, suite, etc. (optional)"
                    disabled={disabled}
                    className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 min-h-[48px]"
                  />
                </div>
              )}

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                {/* City */}
                <div className="sm:col-span-6">
                  <label htmlFor={`${name}-city`} className="sr-only">
                    City
                  </label>
                  <input
                    id={`${name}-city`}
                    type="text"
                    autoComplete="address-level2"
                    enterKeyHint="next"
                    autoCapitalize="words"
                    value={value.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="City"
                    disabled={disabled}
                    className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 min-h-[48px]"
                  />
                </div>

                {/* State - Beautiful Searchable Popover */}
                <div className="sm:col-span-3">
                  <label htmlFor={`${name}-state`} className="sr-only">
                    State
                  </label>
                  <Listbox value={value.state || ''} onChange={(val) => updateField('state', val)} disabled={disabled}>
                    {({ open }) => (
                      <div className="relative">
                        <Listbox.Button className="relative w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-2.5 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between">
                          <span className={value.state ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                            {selectedState ? selectedState.code : 'State'}
                          </span>
                          <svg
                            className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
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
                          afterLeave={() => setSearchQuery('')}
                        >
                          <Listbox.Options className="absolute z-10 mt-1 max-h-80 w-64 rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                            {/* Search input */}
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
                                  placeholder="Type to search states..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>

                            {/* States list */}
                            <div className="max-h-60 overflow-auto py-1">
                              {filteredStates.length === 0 ? (
                                <div className="py-2 px-4 text-sm text-gray-500">
                                  No states found
                                </div>
                              ) : (
                                filteredStates.map((state) => (
                                  <Listbox.Option
                                    key={state.code}
                                    value={state.code}
                                    aria-invalid={!!errors?.[name]}
                                    className={({ active }) =>
                                      `relative cursor-pointer select-none min-h-[44px] py-2.5 pl-3 pr-9 flex items-center ${
                                        active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                      }`
                                    }
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <div className="flex items-center gap-3">
                                          <span className={`font-mono font-medium ${selected ? 'font-bold' : ''}`}>
                                            {state.code}
                                          </span>
                                          <span className={`${selected ? 'font-medium' : ''}`}>
                                            {state.name}
                                          </span>
                                        </div>
                                        {selected && (
                                          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
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
                            </div>
                          </Listbox.Options>
                        </Transition>
                      </div>
                    )}
                  </Listbox>
                </div>

                {/* ZIP */}
                <div className="sm:col-span-3">
                  <label htmlFor={`${name}-zip`} className="sr-only">
                    ZIP Code
                  </label>
                  <input
                    id={`${name}-zip`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="postal-code"
                    enterKeyHint="done"
                    value={value.zip || ''}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 5)
                      updateField('zip', cleaned)
                    }}
                    placeholder="ZIP"
                    disabled={disabled}
                    maxLength={5}
                    className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 min-h-[48px]"
                  />
                </div>
              </div>

              {/* Country (optional) */}
              {showCountry && (
                <div>
                  <label htmlFor={`${name}-country`} className="sr-only">
                    Country
                  </label>
                  <select
                    id={`${name}-country`}
                    autoComplete="country"
                    value={value.country || defaultCountry}
                    onChange={(e) => updateField('country', e.target.value)}
                    disabled={disabled}
                    className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 bg-white min-h-[48px]"
                  >
                    <option value="US">🇺🇸 United States</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="MX">🇲🇽 Mexico</option>
                  </select>
                </div>
              )}
            </div>
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
