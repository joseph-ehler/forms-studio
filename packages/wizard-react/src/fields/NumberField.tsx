/**
 * NumberField Component
 * 
 * Numeric input field with proper type coercion.
 */

import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { getAriaProps, getLabelProps, getDescriptionProps } from './utils/a11y-helpers'

export const NumberField: React.FC<FieldComponentProps> = ({
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
  const typography = resolveTypographyDisplay(config.typographyDisplay || jsonTypography.display, config.typographyVariant || jsonTypography.variant)
  
  const min = (config as any).validation?.min
  const max = (config as any).validation?.max
  const step = (config as any).step ?? 1

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
        render={({ field }) => (
          <div className="relative">
            <input
              id={name}
              type="number"
              inputMode={step && step < 1 ? 'decimal' : 'numeric'}
              pattern={step && step < 1 ? '[0-9]*\\.?[0-9]*' : '[0-9]*'}
              enterKeyHint="next"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              {...field}
              onChange={(e) =>
                field.onChange(e.target.value === '' ? '' : Number(e.target.value))
              }
              min={min}
              max={max}
              step={step}
              className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 min-h-[44px]"
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={!!errors?.[name]}
              aria-describedby={errors?.[name] ? `${name}-error` : description ? `${name}-description` : undefined}
            />
            {(min !== undefined || max !== undefined) && (
              <div className="mt-1 text-xs text-gray-400">
                {min !== undefined && max !== undefined
                  ? `Range: ${min} - ${max}`
                  : min !== undefined
                  ? `Min: ${min}`
                  : `Max: ${max}`}
              </div>
            )}
          </div>
        )}
      />
      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </Stack>
  )
}
