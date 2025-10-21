/**
 * CurrencyField Component
 * 
 * Beautiful currency input with searchable currency picker.
 * Features currency symbols, flags, and smart formatting.
 * 
 * Features:
 * - Searchable currency selector with flags
 * - Popular currencies at top
 * - Auto-formatting with thousand separators
 * - Locale-aware display
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

interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  flag: string
}

// Popular currencies with flags
const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
]

export const CurrencyField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,
  placeholder: propPlaceholder,
  required: propRequired,
  disabled: propDisabled,
  description,
  control,
  errors,
  json,
  typographyDisplay,
  typographyVariant,
}) => {
  const config = mergeFieldConfig(
    { label: propLabel, placeholder: propPlaceholder, required: propRequired, disabled: propDisabled, description, typographyDisplay, typographyVariant },
    json,
    {}
  )
  
  const label = config.label
  const placeholder = config.placeholder
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const defaultCurrency = (config as any).currency ?? 'USD'
  const decimals = (config as any).decimals ?? 2
  const min = (config as any).min ?? 0
  const max = (config as any).max

  // Filter currencies based on search
  const filteredCurrencies = searchQuery
    ? CURRENCIES.filter(curr =>
        curr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curr.symbol.includes(searchQuery)
      )
    : CURRENCIES

  // Format number with thousand separators
  const formatNumber = (value: string | number): string => {
    if (value === '' || value === null || value === undefined) return ''
    
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return ''

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
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
        defaultValue={{ currency: defaultCurrency, amount: '' }}
        render={({ field }) => {
          const value = field.value || { currency: defaultCurrency, amount: '' }
          const selectedCurrency = CURRENCIES.find(c => c.code === value.currency) || CURRENCIES[0]
          
          const [displayValue, setDisplayValue] = useState(
            value.amount ? formatNumber(value.amount) : ''
          )

          const handleCurrencyChange = (currencyCode: string) => {
            field.onChange({ ...value, currency: currencyCode })
          }

          const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '')
            setDisplayValue(raw)
            field.onChange({ ...value, amount: raw ? parseFloat(raw) : '' })
          }

          const handleBlur = () => {
            setIsFocused(false)
            if (value.amount) {
              setDisplayValue(formatNumber(value.amount))
            }
          }

          const handleFocus = () => {
            setIsFocused(true)
            if (value.amount) {
              setDisplayValue(value.amount.toString())
            }
          }

          return (
            <Flex gap="md">
              {/* Currency Selector */}
              <Listbox value={value.currency} onChange={handleCurrencyChange} disabled={disabled}>
                {({ open }) => (
                  <div className="relative w-32">
                    <Listbox.Button className="relative w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-2.5 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{selectedCurrency.flag}</span>
                        <span className="font-medium">{selectedCurrency.code}</span>
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
                              placeholder="Type to search currencies..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Currencies list */}
                        <div className="max-h-60 overflow-auto py-1">
                          {filteredCurrencies.length === 0 ? (
                            <div className="py-2 px-4 text-sm text-gray-500">
                              No currencies found
                            </div>
                          ) : (
                            filteredCurrencies.map((currency) => (
                              <Listbox.Option
                                key={currency.code}
                                value={currency.code}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none min-h-[48px] py-2.5 pl-3 pr-9 flex items-center gap-3 ${
                                    active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                  }`
                                }
                              >
                                {({ selected, active }) => (
                                  <>
                                    <div className="flex items-center gap-3">
                                      <span className="text-lg">{currency.flag}</span>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className={`font-mono font-medium ${selected ? 'font-bold' : ''}`}>
                                            {currency.code}
                                          </span>
                                          <span className={`text-sm ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {currency.symbol}
                                          </span>
                                        </div>
                                        <div className={`text-sm ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                                          {currency.name}
                                        </div>
                                      </div>
                                    </div>
                                    {selected && (
                                      <svg
                                        className={`absolute right-3 h-5 w-5 ${active ? 'text-white' : 'text-blue-600'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
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

              {/* Amount Input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 font-medium text-lg">{selectedCurrency.symbol}</span>
                </div>
                <input
                  id={name}
                  type="text"
                  inputMode="decimal"
                  value={displayValue}
                  onChange={handleAmountChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  placeholder={placeholder || '0.00'}
                  disabled={disabled}
                  className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 min-h-[48px]"
                  aria-invalid={!!errors?.[name]}
                />
              </div>
            </Flex>
          )
        }}
      />

      {/* Min/Max hint */}
      {(min > 0 || max) && (
        <p className="text-xs text-gray-400">
          {min > 0 && max
            ? `Range: ${min} - ${max}`
            : min > 0
            ? `Minimum: ${min}`
            : `Maximum: ${max}`}
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
