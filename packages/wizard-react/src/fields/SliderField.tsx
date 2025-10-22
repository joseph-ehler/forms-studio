/**
 * SliderField Component
 * 
 * Range slider with visual value display.
 * Foundation field - numeric selection via slider.
 */

import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack, Flex } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

export const SliderField: React.FC<FieldComponentProps> = ({
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
  const typography = resolveTypographyDisplay(config.typographyDisplay || jsonTypography.display, config.typographyVariant || jsonTypography.variant)
  
  const min = (config as any).min ?? 0
  const max = (config as any).max ?? 100
  const step = (config as any).step ?? 1
  const showValue = (config as any).showValue ?? true
  const showTicks = (config as any).showTicks ?? false
  const format = (config as any).format
  const currency = (config as any).currency ?? 'USD'
  const defaultValue = (config as any).defaultValue ?? min

  // Format value for display
  const formatValue = (value: number): string => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    }
    if (format === 'percent') {
      return `${value}%`
    }
    return value.toString()
  }

  return (
    <Stack spacing="relaxed">
      <Flex align="center" justify="between">
        {typography.showLabel && label && (
          <div className="mb-1">
            <FormLabel required={typography.showRequired && required} optional={typography.showOptional && !required}>
              {label}
            </FormLabel>
          </div>
        )}
        {showValue && (
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field }) => (
              <span className="text-base font-semibold text-blue-600">
                {formatValue(Number(field.value) || min)}
              </span>
            )}
          />
        )}
      </Flex>
      
      {typography.showDescription && description && (
        <div className="mb-3">
          <FormHelperText>{description}</FormHelperText>
        </div>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Stack spacing="normal">
            {/* Slider input */}
            <input
              id={name}
              type="range"
              {...field}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className="w-full h-2 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              data-ds="slider"
              style={{
                borderRadius: 'var(--ds-radius-md, 8px)',
                background: disabled
                  ? 'var(--ds-color-border-subtle)'
                  : `linear-gradient(to right, var(--ds-color-primary-bg) 0%, var(--ds-color-primary-bg) ${
                      ((Number(field.value) - min) / (max - min)) * 100
                    }%, var(--ds-color-border-subtle) ${
                      ((Number(field.value) - min) / (max - min)) * 100
                    }%, var(--ds-color-border-subtle) 100%)`,
                accentColor: 'var(--ds-color-primary-bg)',
              }}
              aria-invalid={!!errors?.[name]}
              aria-describedby={errors?.[name] ? `${name}-error` : description ? `${name}-description` : undefined}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={Number(field.value) || min}
            />

            {/* Min/Max labels */}
            {showTicks && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatValue(min)}</span>
                <span>{formatValue(max)}</span>
              </div>
            )}
          </Stack>
        )}
      />

      {typography.showError && errors?.[name]?.message && (
        <Stack spacing="normal">
          <FormHelperText variant="error">
            {String(errors[name].message)}
          </FormHelperText>
        </Stack>
      )}
    </Stack>
  )
}
