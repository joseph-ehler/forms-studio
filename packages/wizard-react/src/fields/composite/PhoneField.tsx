/**
 * PhoneField Component
 * 
 * Beautiful phone input with country selector popover.
 * Features country flags, search, and phone formatting.
 * 
 * Features:
 * - Country flags (emoji)
 * - Searchable country list
 * - Popular countries at top
 * - Auto phone formatting
 * - 48px consistent sizing
 */

import React, { Fragment, useState } from 'react'
import { Controller } from 'react-hook-form'
import { Listbox, Transition } from '@headlessui/react'
import type { FieldComponentProps } from '../types'
import { FormStack, FormGrid, Stack, Flex } from '../../components'
import { FormLabel, FormHelperText } from '../../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

interface PhoneValue {
  countryCode: string
  number: string
}

interface Country {
  code: string
  dialCode: string
  name: string
  flag: string
}

// Popular countries + comprehensive list
const COUNTRIES: Country[] = [
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', dialCode: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: 'RU', dialCode: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: 'KR', dialCode: '+82', name: 'South Korea', flag: '🇰🇷' },
]

export const PhoneField: React.FC<FieldComponentProps> = ({
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
  
  const [searchQuery, setSearchQuery] = useState('')
  const defaultCountryCode = (config as any).defaultCountryCode ?? '+1'

  // Filter countries based on search
  const filteredCountries = searchQuery
    ? COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dialCode.includes(searchQuery) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : COUNTRIES

  // Format phone number (US format)
  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
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
        defaultValue={{ countryCode: defaultCountryCode, number: '' }}
        render={({ field }) => {
          const value: PhoneValue = field.value || { countryCode: defaultCountryCode, number: '' }
          const selectedCountry = COUNTRIES.find(c => c.dialCode === value.countryCode) || COUNTRIES[0]

          const handleCountryChange = (code: string) => {
            field.onChange({ ...value, countryCode: code })
          }

          const handleNumberChange = (num: string) => {
            const formatted = formatPhoneNumber(num)
            field.onChange({ ...value, number: formatted })
          }

          return (
            <Flex gap="md">
              {/* Country Selector with Flags */}
              <Listbox value={value.countryCode} onChange={handleCountryChange} disabled={disabled}>
                {({ open }) => (
                  <div className="relative w-32">
                    <Listbox.Button className="relative w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-2.5 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span className="font-medium">{selectedCountry.dialCode}</span>
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
                      <Listbox.Options className="absolute z-10 mt-1 max-h-80 w-72 rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
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
                              placeholder="Type to search countries..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Countries list */}
                        <div className="max-h-60 overflow-auto py-1">
                          {filteredCountries.length === 0 ? (
                            <div className="py-2 px-4 text-sm text-gray-500">
                              No countries found
                            </div>
                          ) : (
                            filteredCountries.map((country) => (
                              <Listbox.Option
                                key={country.code}
                                value={country.dialCode}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none min-h-[48px] py-2.5 pl-3 pr-4 flex items-center gap-3 ${
                                    active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                  }`
                                }
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span className="text-xl">{country.flag}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className={`font-medium ${selected ? 'font-semibold' : ''}`}>
                                        {country.name}
                                      </div>
                                      <div className={`text-sm ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {country.dialCode}
                                      </div>
                                    </div>
                                    {selected && (
                                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
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

              {/* Phone Number Input */}
              <input
                id={name}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="next"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={value.number}
                onChange={(e) => handleNumberChange(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 min-h-[48px]"
                placeholder={placeholder || '(555) 123-4567'}
                disabled={disabled}
                maxLength={14}
                aria-invalid={!!errors?.[name]}
              />
            </Flex>
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
