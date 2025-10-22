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
import { OverlayPickerCore, OverlaySheet, OverlayPicker } from '../../components/overlay'
import { PickerList, PickerOption, PickerSearch, PickerEmptyState } from '../../components/picker'
import { useDeviceType } from '../../hooks/useDeviceType'
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

          const { isMobile } = useDeviceType()

          return (
            <Flex gap="md">
              {/* Currency Selector */}
              <OverlayPickerCore closeOnSelect={true}>
                {({ isOpen, open, close, triggerRef }) => (
                  <div className="relative w-32">
                    <button
                      ref={triggerRef as React.RefObject<HTMLButtonElement>}
                      type="button"
                      onClick={() => isOpen ? close() : open()}
                      disabled={disabled}
                      className="ds-input relative w-full text-left flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{selectedCurrency.flag}</span>
                        <span className="font-medium">{selectedCurrency.code}</span>
                      </span>
                      <svg
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--ds-color-text-muted)' }}
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
                        aria-labelledby="currency-picker"
                      >
                        <PickerSearch
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="Search currencies..."
                          autoFocus
                        />
                        <PickerList role="listbox" aria-label="Select currency">
                          {filteredCurrencies.length === 0 ? (
                            <PickerEmptyState message="No currencies found" />
                          ) : (
                            filteredCurrencies.map((currency) => {
                              const isSelected = currency.code === value.currency
                              return (
                                <PickerOption
                                  key={currency.code}
                                  value={currency.code}
                                  selected={isSelected}
                                  disabled={disabled}
                                  onClick={() => {
                                    handleCurrencyChange(currency.code)
                                    close('select')
                                    setSearchQuery('')
                                  }}
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <span className="text-xl">{currency.flag}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-medium">{currency.code}</span>
                                        <span className="text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>{currency.symbol}</span>
                                      </div>
                                      <div className="text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>{currency.name}</div>
                                    </div>
                                  </div>
                                </PickerOption>
                              )
                            })
                          )}
                        </PickerList>
                      </OverlaySheet>
                    )}

                    {/* Desktop Picker */}
                    {!isMobile && isOpen && (
                      <OverlayPicker
                        open={isOpen}
                        anchor={triggerRef.current}
                        onOpenChange={(o) => {
                          if (!o) {
                            close('outside')
                            setSearchQuery('')
                          }
                        }}
                        placement="bottom-start"
                        sameWidth={false}
                        hardMaxHeight={560}
                        style={{ width: '288px' }}
                        header={
                          <PickerSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search currencies..."
                          />
                        }
                        content={
                          <PickerList role="listbox" aria-label="Select currency">
                            {filteredCurrencies.length === 0 ? (
                              <PickerEmptyState message="No currencies found" />
                            ) : (
                              filteredCurrencies.map((currency) => {
                                const isSelected = currency.code === value.currency
                                return (
                                  <PickerOption
                                    key={currency.code}
                                    value={currency.code}
                                    selected={isSelected}
                                    disabled={disabled}
                                    onClick={() => {
                                      handleCurrencyChange(currency.code)
                                      close('select')
                                      setSearchQuery('')
                                    }}
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <span className="text-xl">{currency.flag}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-medium">{currency.code}</span>
                                          <span className="text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>{currency.symbol}</span>
                                        </div>
                                        <div className="text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>{currency.name}</div>
                                      </div>
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
                )}
              </OverlayPickerCore>

              {/* Amount Input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="font-medium text-lg" style={{ color: 'var(--ds-color-text-secondary)' }}>{selectedCurrency.symbol}</span>
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
                  className="ds-input w-full pl-10"
                  aria-invalid={!!errors?.[name]}
                />
              </div>
            </Flex>
          )
        }}
      />

      {/* Min/Max hint */}
      {(min > 0 || max) && (
        <p className="text-xs" style={{ color: 'var(--ds-color-text-muted)' }}>
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
