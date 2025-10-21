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
    <Stack spacing="lg">
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
          <Stack spacing="md">
            {/* Slider input */}
            <input
              id={name}
              type="range"
              {...field}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: disabled
                  ? undefined
                  : `linear-gradient(to right, #2563eb 0%, #2563eb ${
                      ((Number(field.value) - min) / (max - min)) * 100
                    }%, #e5e7eb ${
                      ((Number(field.value) - min) / (max - min)) * 100
                    }%, #e5e7eb 100%)`,
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
        <Stack spacing="md">
          <FormHelperText variant="error">
            {String(errors[name].message)}
          </FormHelperText>
        </Stack>
      )}
    </Stack>
  )
}
