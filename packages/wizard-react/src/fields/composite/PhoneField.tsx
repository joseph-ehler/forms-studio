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
import { OverlayPickerCore, OverlaySheet, OverlayPositioner, calculateOverlayHeights, getOverlayContentClasses } from '../../components/overlay'
import { PickerList, PickerOption, PickerSearch, PickerEmptyState } from '../../components/picker'
import { useDeviceType } from '../../hooks/useDeviceType'
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

          const { isMobile } = useDeviceType()
          const heights = calculateOverlayHeights({
            maxHeight: 560,
            hasSearch: true,
            hasFooter: false,
            searchHeight: 60,
          })

          return (
            <Flex gap="md">
              {/* Country Selector with Flags */}
              <OverlayPickerCore
                closeOnSelect={true}
              >
                {({ isOpen, open, close, triggerRef, contentRef }) => (
                  <div className="relative w-32">
                    <button
                      ref={triggerRef as React.RefObject<HTMLButtonElement>}
                      type="button"
                      onClick={() => isOpen ? close() : open()}
                      disabled={disabled}
                      className="relative w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-2.5 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span className="font-medium">{selectedCountry.dialCode}</span>
                      </span>
                      <svg
                        className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Mobile Sheet */}
                    {isMobile && isOpen && (
                      <OverlaySheet
                        open={isOpen}
                        onClose={() => {
                          close('outside')
                          setSearchQuery('')
                        }}
                        maxHeight={560}
                        aria-labelledby="phone-country-picker"
                      >
                        {/* Search */}
                        <PickerSearch
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="Search countries..."
                          autoFocus
                        />

                        {/* Countries List */}
                        <div ref={contentRef}>
                          <PickerList
                            role="listbox"
                            aria-label="Select country"
                          >
                            {filteredCountries.length === 0 ? (
                              <PickerEmptyState message="No countries found" />
                            ) : (
                              filteredCountries.map((country) => {
                                const isSelected = country.dialCode === value.countryCode
                                return (
                                  <PickerOption
                                    key={country.code}
                                    value={country.dialCode}
                                    selected={isSelected}
                                    disabled={disabled}
                                    onClick={() => {
                                      handleCountryChange(country.dialCode)
                                      close('select')
                                      setSearchQuery('')
                                    }}
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <span className="text-xl">{country.flag}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium">{country.name}</div>
                                        <div className="text-sm text-gray-500">{country.dialCode}</div>
                                      </div>
                                    </div>
                                  </PickerOption>
                                )
                              })
                            )}
                          </PickerList>
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
                        sameWidth={false}
                        maxHeight={560}
                        collision={{ flip: true, shift: true, size: true }}
                      >
                        {({ refs, floatingStyles, isPositioned }) => (
                          <div
                            ref={refs.setFloating}
                            style={{ ...floatingStyles, width: '288px' }}
                            className="z-50 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
                          >
                            {/* Search */}
                            <PickerSearch
                              value={searchQuery}
                              onChange={setSearchQuery}
                              placeholder="Search countries..."
                            />

                            {/* Countries List */}
                            <div
                              ref={contentRef}
                              className={getOverlayContentClasses().content}
                              style={{
                                maxHeight: `${heights.contentMaxHeight}px`,
                              }}
                            >
                              <PickerList
                                role="listbox"
                                aria-label="Select country"
                              >
                                {filteredCountries.length === 0 ? (
                                  <PickerEmptyState message="No countries found" />
                                ) : (
                                  filteredCountries.map((country) => {
                                    const isSelected = country.dialCode === value.countryCode
                                    return (
                                      <PickerOption
                                        key={country.code}
                                        value={country.dialCode}
                                        selected={isSelected}
                                        disabled={disabled}
                                        onClick={() => {
                                          handleCountryChange(country.dialCode)
                                          close('select')
                                          setSearchQuery('')
                                        }}
                                      >
                                        <div className="flex items-center gap-3 w-full">
                                          <span className="text-xl">{country.flag}</span>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium">{country.name}</div>
                                            <div className="text-sm text-gray-500">{country.dialCode}</div>
                                          </div>
                                        </div>
                                      </PickerOption>
                                    )
                                  })
                                )}
                              </PickerList>
                            </div>
                          </div>
                        )}
                      </OverlayPositioner>
                    )}
                  </div>
                )}
              </OverlayPickerCore>

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
