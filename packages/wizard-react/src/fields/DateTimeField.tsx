/**
 * DateTimeField Component
 * 
 * Combined date and time picker.
 * Foundation field - datetime selection.
 */

import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

export const DateTimeField: React.FC<FieldComponentProps> = ({
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
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  
  const min = (config as any).min
  const max = (config as any).max
  const step = (config as any).step ?? 60
  const defaultValue = (config as any).defaultValue

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
        defaultValue={defaultValue}
        render={({ field }) => (
          <input
            id={name}
            type="datetime-local"
            {...field}
            min={min}
            max={max}
            step={step}
            enterKeyHint="next"
            autoComplete="off"
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 min-h-[44px]"
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!errors?.[name]}
            aria-describedby={errors?.[name] ? `${name}-error` : description ? `${name}-description` : undefined}
          />
        )}
      />
      {/* DateTime range hint */}
      {(min || max) && (
        <p className="text-xs text-gray-400">
          {min && max
            ? `Range: ${formatDateTime(min)} - ${formatDateTime(max)}`
            : min
            ? `Earliest: ${formatDateTime(min)}`
            : `Latest: ${formatDateTime(max)}`}
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

// Helper: Format datetime for display
function formatDateTime(datetimeString: string): string {
  try {
    const date = new Date(datetimeString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return datetimeString
  }
}
