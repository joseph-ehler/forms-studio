/**
 * RadioGroupField Component
 * 
 * Radio button group with accessible keyboard navigation.
 * Composite: Enhanced selection with visual styling.
 */

import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from '../types'
import { FormStack, FormGrid, Stack, Flex } from '../../components'
import { FormLabel, FormHelperText } from '../../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

export const RadioGroupField: React.FC<FieldComponentProps> = ({
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
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  
  const options = (config as any).options ?? []
  const layout = (config as any).layout ?? 'vertical'

  return (
    <Stack spacing="md">
      {typography.showLabel && label && (
        <Stack>
          <FormLabel required={typography.showRequired && required} optional={typography.showOptional && !required}>
            {label}
          </FormLabel>
        </Stack>
      )}
      {typography.showDescription && description && (
        <div className="mb-3">
          <FormHelperText>{description}</FormHelperText>
        </div>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div
            role="radiogroup"
            aria-labelledby={`${name}-label`}
            className={layout === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
          >
            {options.map((option: any) => {
              const optionValue = option.value ?? option
              const optionLabel = option.label ?? String(option)
              const optionDescription = option.description
              const optionDisabled = disabled || option.disabled
              const isSelected = field.value === optionValue

              return (
                <label
                  key={optionValue}
                  className={`
                    relative flex cursor-pointer rounded-lg border-2 p-4 transition-all min-h-[44px] active:scale-[0.98]
                    ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                    ${optionDisabled ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  <input
                    type="radio"
                    {...field}
                    value={optionValue}
                    checked={isSelected}
                    onChange={() => field.onChange(optionValue)}
                    disabled={optionDisabled}
                    className="sr-only"
                  />
                  <Flex align="start">
                    {/* Radio Circle */}
                    <div className="flex h-5 items-center">
                      <div
                        className={`
                          h-5 w-5 rounded-full border-2 flex items-center justify-center
                          ${
                            isSelected
                              ? 'border-blue-600 bg-white'
                              : 'border-gray-300 bg-white'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                        )}
                      </Flex>
                    </div>
                    {/* Label & Description */}
                    <div className="ml-3 flex-1">
                      <span
                        className={`block text-sm font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        {optionLabel}
                      </span>
                      {optionDescription && (
                        <span
                          className={`block text-sm ${
                            isSelected ? 'text-blue-700' : 'text-gray-500'
                          }`}
                        >
                          {optionDescription}
                        </span>
                      )}
                    </div>
                  </Flex>
                </label>
            })}
          </div>
        )}
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
