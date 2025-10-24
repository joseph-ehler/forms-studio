/**
 * AddressField (fixed & simplified)
 * - Mobile-first, touch-friendly (48px)
 * - Searchable state + country selectors (Headless UI Listbox)
 * - Clean markup (no mismatched tags), minimal nesting
 * - JSON + typography preserved
 */

import React, { Fragment, useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { OverlayPickerCore, SheetDialog, OverlayPicker  } from '../../components/overlay'
import { PickerList, PickerOption, PickerSearch, PickerEmptyState } from '../../components/picker'
import { useDeviceType } from '../../hooks/useDeviceType'

import type { FieldComponentProps } from '../types'
import { FormLabel as FormLabelOld, FormHelperText } from '../../components'
import { FormLabel } from '../../components/typography'
import { Stack } from '../../components/DSShims'
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

interface StateDef {
  code: string
  name: string
}

interface CountryDef {
  code: string
  name: string
  flag: string
}

// US states
const US_STATES: StateDef[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
]

// Common countries
const COUNTRIES: CountryDef[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
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

  const label       = config.label
  const required    = config.required ?? false
  const disabled    = config.disabled ?? false
  const description = config.description ?? undefined
  const showStreet2     = (config as any).showStreet2 ?? true
  const showCountry     = (config as any).showCountry ?? false
  const defaultCountry  = (config as any).defaultCountry ?? 'US'

  const jsonTy = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTy.display,
    config.typographyVariant || jsonTy.variant
  )

  const [stateSearchQuery, setStateSearchQuery] = useState('')
  const [countrySearchQuery, setCountrySearchQuery] = useState('')

  const filteredStates = useMemo(() => {
    const q = stateSearchQuery.trim().toLowerCase()
    if (!q) return US_STATES
    return US_STATES.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
  }, [stateSearchQuery])

  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [countrySearchQuery])

  return (
    <Stack spacing="relaxed">
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
          const update = (key: keyof AddressValue, val: string) => {
            field.onChange({ ...value, [key]: val })
          }
          const selectedState = US_STATES.find(s => s.code === value.state)
          const selectedCountry = COUNTRIES.find(c => c.code === (value.country || defaultCountry))

          return (
            <Stack spacing="relaxed">
              <div>
                <FormLabel htmlFor={`${name}-street`} srOnly>Street Address</FormLabel>
                <input
                  id={`${name}-street`}
                  type="text"
                  autoComplete="address-line1"
                  enterKeyHint="next"
                  autoCapitalize="words"
                  value={value.street || ''}
                  onChange={(e) => update('street', e.target.value)}
                  placeholder="Street Address"
                  disabled={disabled}
                  className="ds-input w-full"
                />
              </div>

              {showStreet2 && (
                <div>
                  <FormLabel htmlFor={`${name}-street2`} srOnly>Apartment, suite, etc.</FormLabel>
                  <input
                    id={`${name}-street2`}
                    type="text"
                    autoComplete="address-line2"
                    enterKeyHint="next"
                    autoCapitalize="words"
                    value={value.street2 || ''}
                    onChange={(e) => update('street2', e.target.value)}
                    placeholder="Apartment, suite, etc. (optional)"
                    disabled={disabled}
                    className="ds-input w-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                <div className="sm:col-span-6">
                  <FormLabel htmlFor={`${name}-city`} srOnly>City</FormLabel>
                  <input
                    id={`${name}-city`}
                    type="text"
                    autoComplete="address-level2"
                    enterKeyHint="next"
                    autoCapitalize="words"
                    value={value.city || ''}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="City"
                    disabled={disabled}
                    className="ds-input w-full"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormLabel htmlFor={`${name}-state`} srOnly>State</FormLabel>
                  <OverlayPickerCore closeOnSelect={true}>
                    {({ isOpen, open, close, triggerRef }) => {
                      const { isMobile } = useDeviceType()

                      return (
                        <div className="relative">
                          <button
                            ref={triggerRef as React.RefObject<HTMLButtonElement>}
                            id={`${name}-state`}
                            type="button"
                            onClick={() => isOpen ? close() : open()}
                            disabled={disabled}
                            className="ds-input w-full text-left flex items-center justify-between"
                          >
                            <span
                              className="font-medium"
                              style={{ color: value.state ? 'var(--ds-color-text-primary)' : 'var(--ds-color-text-muted)' }}
                            >
                              {selectedState ? selectedState.code : 'State'}
                            </span>
                            <svg
                              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              style={{ color: 'var(--ds-color-text-muted)' }}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {/* Mobile Sheet */}
                          {isMobile && isOpen && (
                            <SheetDialog
                              open={isOpen}
                              onClose={() => {
                                close('outside')
                                setStateSearchQuery('')
                              }}
                              maxHeight={560}
                              aria-labelledby="address-state-picker"
                            >
                              <PickerSearch
                                value={stateSearchQuery}
                                onChange={setStateSearchQuery}
                                placeholder="Search states..."
                                autoFocus
                              />
                              <PickerList role="listbox" aria-label="Select state">
                                {filteredStates.length === 0 ? (
                                  <PickerEmptyState message="No states found" />
                                ) : (
                                  filteredStates.map((s) => {
                                    const isSelected = s.code === value.state
                                    return (
                                      <PickerOption
                                        key={s.code}
                                        value={s.code}
                                        selected={isSelected}
                                        disabled={disabled}
                                        onClick={() => {
                                          update('state', s.code)
                                          close('select')
                                          setStateSearchQuery('')
                                        }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="font-mono font-medium">{s.code}</span>
                                          <span>{s.name}</span>
                                        </div>
                                      </PickerOption>
                                    )
                                  })
                                )}
                              </PickerList>
                            </SheetDialog>
                          )}

                          {/* Desktop Picker */}
                          {!isMobile && isOpen && (
                            <OverlayPicker
                              open={isOpen}
                              anchor={triggerRef.current}
                              onOpenChange={(o) => {
                                if (!o) {
                                  close('outside')
                                  setStateSearchQuery('')
                                }
                              }}
                              placement="bottom-start"
                              sameWidth={false}
                              hardMaxHeight={560}
                              style={{ width: '256px' }}
                              header={
                                <PickerSearch
                                  value={stateSearchQuery}
                                  onChange={setStateSearchQuery}
                                  placeholder="Search states..."
                                />
                              }
                              content={
                                <PickerList role="listbox" aria-label="Select state">
                                  {filteredStates.length === 0 ? (
                                    <PickerEmptyState message="No states found" />
                                  ) : (
                                    filteredStates.map((s) => {
                                      const isSelected = s.code === value.state
                                      return (
                                        <PickerOption
                                          key={s.code}
                                          value={s.code}
                                          selected={isSelected}
                                          disabled={disabled}
                                          onClick={() => {
                                            update('state', s.code)
                                            close('select')
                                            setStateSearchQuery('')
                                          }}
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className="font-mono font-medium">{s.code}</span>
                                            <span>{s.name}</span>
                                          </div>
                                        </PickerOption>
                                      )
                                    })
                                  )}
                                </PickerList>
                              }
                            />
                          )}
                        </div>
                      )
                    }}
                  </OverlayPickerCore>
                </div>

                <div className="sm:col-span-3">
                  <FormLabel htmlFor={`${name}-zip`} srOnly>ZIP Code</FormLabel>
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
                      update('zip', cleaned)
                    }}
                    placeholder="ZIP"
                    disabled={disabled}
                    maxLength={5}
                    className="ds-input w-full"
                  />
                </div>
              </div>

              {showCountry && (
                <div>
                  <FormLabel htmlFor={`${name}-country`} srOnly>Country</FormLabel>
                  <OverlayPickerCore closeOnSelect={true}>
                    {({ isOpen, open, close, triggerRef }) => {
                      const { isMobile } = useDeviceType()

                      return (
                        <div className="relative">
                          <button
                            ref={triggerRef as React.RefObject<HTMLButtonElement>}
                            id={`${name}-country`}
                            type="button"
                            onClick={() => isOpen ? close() : open()}
                            disabled={disabled}
                            className="ds-input w-full text-left flex items-center justify-between"
                          >
                            <span
                              className="flex items-center gap-2 font-medium"
                              style={{ color: 'var(--ds-color-text-primary)' }}
                            >
                              {selectedCountry && <span>{selectedCountry.flag}</span>}
                              {selectedCountry ? selectedCountry.name : 'Country'}
                            </span>
                            <svg
                              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              style={{ color: 'var(--ds-color-text-muted)' }}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {/* Mobile Sheet */}
                          {isMobile && isOpen && (
                            <SheetDialog
                              open={isOpen}
                              onClose={() => {
                                close('outside')
                                setCountrySearchQuery('')
                              }}
                              maxHeight={560}
                              aria-labelledby="address-country-picker"
                            >
                              <PickerSearch
                                value={countrySearchQuery}
                                onChange={setCountrySearchQuery}
                                placeholder="Search countries..."
                                autoFocus
                              />
                              <PickerList role="listbox" aria-label="Select country">
                                {filteredCountries.length === 0 ? (
                                  <PickerEmptyState message="No countries found" />
                                ) : (
                                  filteredCountries.map((c) => {
                                    const isSelected = c.code === (value.country || defaultCountry)
                                    return (
                                      <PickerOption
                                        key={c.code}
                                        value={c.code}
                                        selected={isSelected}
                                        disabled={disabled}
                                        onClick={() => {
                                          update('country', c.code)
                                          close('select')
                                          setCountrySearchQuery('')
                                        }}
                                      >
                                        <div className="flex items-center gap-3 w-full">
                                          <span className="text-xl">{c.flag}</span>
                                          <span>{c.name}</span>
                                        </div>
                                      </PickerOption>
                                    )
                                  })
                                )}
                              </PickerList>
                            </SheetDialog>
                          )}

                          {/* Desktop Picker */}
                          {!isMobile && isOpen && (
                            <OverlayPicker
                              open={isOpen}
                              anchor={triggerRef.current}
                              onOpenChange={(o) => {
                                if (!o) {
                                  close('outside')
                                  setCountrySearchQuery('')
                                }
                              }}
                              placement="bottom-start"
                              sameWidth={true}
                              hardMaxHeight={560}
                              header={
                                <PickerSearch
                                  value={countrySearchQuery}
                                  onChange={setCountrySearchQuery}
                                  placeholder="Search countries..."
                                />
                              }
                              content={
                                <PickerList role="listbox" aria-label="Select country">
                                  {filteredCountries.length === 0 ? (
                                    <PickerEmptyState message="No countries found" />
                                  ) : (
                                    filteredCountries.map((c) => {
                                      const isSelected = c.code === (value.country || defaultCountry)
                                      return (
                                        <PickerOption
                                          key={c.code}
                                          value={c.code}
                                          selected={isSelected}
                                          disabled={disabled}
                                          onClick={() => {
                                            update('country', c.code)
                                            close('select')
                                            setCountrySearchQuery('')
                                          }}
                                        >
                                          <div className="flex items-center gap-3 w-full">
                                            <span className="text-xl">{c.flag}</span>
                                            <span>{c.name}</span>
                                          </div>
                                        </PickerOption>
                                      )
                                    })
                                  )}
                                </PickerList>
                              }
                            />
                          )}
                        </div>
                      )
                    }}
                  </OverlayPickerCore>
                </div>
              )}
            </Stack>
          )
        }}
      />

      {typography.showError && errors?.[name]?.message && (
        <div className="mt-2">
          <FormHelperText variant="error">
            {String(errors[name].message)}
          </FormHelperText>
        </div>
      )}
    </Stack>
  )
}
