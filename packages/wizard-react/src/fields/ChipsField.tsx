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
    <Stack spacing="md">
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
            <Stack spacing="lg">
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
                      className={`
                        relative flex items-center justify-center rounded-lg border-2 px-4 py-3 text-base font-medium min-h-[44px]
                        transition-all duration-150 ease-in-out active:scale-95
                        disabled:cursor-not-allowed disabled:opacity-50
                        ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }
                      `}
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
                <div className="flex flex-wrap gap-2 rounded-md bg-gray-50 p-3">
                  <span className="text-xs font-medium text-gray-500">
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
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {displayLabel}
                        <button
                          type="button"
                          onClick={() => toggleOption(value)}
                          disabled={disabled}
                          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-90"
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
