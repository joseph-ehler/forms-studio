/**
 * ChipsField Component
 * 
 * Multi-select with visual chips/tags display.
 */

import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

export const ChipsField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,
  description: propDescription,
  required: propRequired,
  disabled: propDisabled,
  control,
  errors,
  json,
  typographyDisplay,
  typographyVariant,
}) => {
  const config = mergeFieldConfig(
    { label: propLabel, description: propDescription, required: propRequired, disabled: propDisabled, typographyDisplay, typographyVariant },
    json,
    {}
  )
  
  const label = config.label
  const description = config.description
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(config.typographyDisplay || jsonTypography.display, config.typographyVariant || jsonTypography.variant)
  
  const options = (config as any).options ?? []

  return (
    <Stack spacing="normal">
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
          const selectedValues = Array.isArray(field.value) ? field.value : []

          const toggleOption = (optionValue: string) => {
            if (disabled) return
            const newValue = selectedValues.includes(optionValue)
              ? selectedValues.filter((v) => v !== optionValue)
              : [...selectedValues, optionValue]
            field.onChange(newValue)
          }

          return (
            <Stack spacing="relaxed">
              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {options.map((option: any) => {
                  const optionValue = option.value ?? option
                  const optionLabel = option.label ?? String(option)
                  const isSelected = selectedValues.includes(optionValue)

                  return (
                    <button
                      key={optionValue}
                      type="button"
                      onClick={() => toggleOption(optionValue)}
                      disabled={disabled}
                      className="relative flex items-center justify-center px-4 py-3 text-base font-medium active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        minHeight: '44px',
                        borderRadius: 'var(--ds-radius-md, 8px)',
                        border: '2px solid',
                        borderColor: isSelected
                          ? 'var(--ds-color-border-focus)'
                          : 'var(--ds-color-border-subtle)',
                        backgroundColor: isSelected
                          ? 'color-mix(in oklab, var(--ds-color-primary-bg), transparent 90%)'
                          : 'var(--ds-color-surface-base)',
                        color: isSelected
                          ? 'var(--ds-color-primary-text, var(--ds-color-primary-bg))'
                          : 'var(--ds-color-text-primary)',
                        boxShadow: isSelected
                          ? `0 0 0 1px var(--ds-color-border-focus)`
                          : 'none',
                        transition: 'all 150ms ease-in-out'
                      }}
                      onMouseEnter={(e) => !isSelected && !disabled && (
                        e.currentTarget.style.borderColor = 'var(--ds-color-border-strong)',
                        e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-subtle)'
                      )}
                      onMouseLeave={(e) => !isSelected && (
                        e.currentTarget.style.borderColor = 'var(--ds-color-border-subtle)',
                        e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-base)'
                      )}
                      aria-pressed={isSelected}
                    >
                      {optionLabel}
                      {isSelected && (
                        <svg
                          className="ml-2 h-4 w-4"
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
                    </button>
                  )
                })}
              </div>

              {/* Selected Chips Display */}
              {selectedValues.length > 0 && (
                <div
                  className="flex flex-wrap gap-2 p-3"
                  style={{
                    borderRadius: 'var(--ds-radius-md, 6px)',
                    backgroundColor: 'var(--ds-color-surface-subtle)'
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: 'var(--ds-color-text-secondary)' }}>
                    Selected ({selectedValues.length}):
                  </span>
                  {selectedValues.map((value) => {
                    const option = options.find(
                      (o: any) => (o.value ?? o) === value
                    )
                    const displayLabel = option?.label ?? String(value)

                    return (
                      <span
                        key={value}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium"
                        style={{
                          borderRadius: '9999px',
                          backgroundColor: 'color-mix(in oklab, var(--ds-color-primary-bg), transparent 85%)',
                          color: 'var(--ds-color-primary-text, var(--ds-color-primary-bg))'
                        }}
                      >
                        {displayLabel}
                        <button
                          type="button"
                          onClick={() => toggleOption(value)}
                          disabled={disabled}
                          className="ml-1 inline-flex h-6 w-6 items-center justify-center active:scale-90"
                          style={{
                            borderRadius: '9999px',
                            outline: 'none'
                          }}
                          onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--ds-color-primary-bg), transparent 75%)')}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px color-mix(in oklab, var(--ds-color-border-focus), transparent 85%)`}
                          onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                          aria-label={`Remove ${displayLabel}`}
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </Stack>
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
