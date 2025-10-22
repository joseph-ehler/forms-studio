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
    <Stack spacing="normal">
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
                  className="relative flex p-4 active:scale-[0.98]"
                  style={{
                    cursor: optionDisabled ? 'not-allowed' : 'pointer',
                    borderRadius: 'var(--ds-radius-md, 8px)',
                    border: `2px solid ${
                      isSelected
                        ? 'var(--ds-color-border-focus)'
                        : 'var(--ds-color-border-subtle)'
                    }`,
                    backgroundColor: isSelected
                      ? 'color-mix(in oklab, var(--ds-color-primary-bg), transparent 90%)'
                      : 'var(--ds-color-surface-base)',
                    boxShadow: isSelected
                      ? `0 0 0 3px color-mix(in oklab, var(--ds-color-border-focus), transparent 85%)`
                      : 'none',
                    minHeight: '44px',
                    transition: 'all 150ms ease',
                    opacity: optionDisabled ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !isSelected && !optionDisabled && (e.currentTarget.style.borderColor = 'var(--ds-color-border-strong)')}
                  onMouseLeave={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--ds-color-border-subtle)')}
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
                        style={{
                          height: '20px',
                          width: '20px',
                          borderRadius: '50%',
                          border: `2px solid ${
                            isSelected
                              ? 'var(--ds-color-primary-bg)'
                              : 'var(--ds-color-border-subtle)'
                          }`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected ? 'var(--ds-color-primary-bg)' : 'transparent'
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: 'white'
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <Stack>
                      <span
                        className="block text-sm font-medium"
                        style={{
                          color: 'var(--ds-color-text-primary)'
                        }}
                      >
                        {optionLabel}
                      </span>
                      {optionDescription && (
                        <p className="text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>{optionDescription}</p>
                      )}
                    </Stack>
                  </Flex>
                </label>
              )
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
