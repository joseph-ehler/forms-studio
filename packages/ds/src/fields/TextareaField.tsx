/**
 * TextareaField Component
 * 
 * Multiline text input with character count and resize.
 */

import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

export const TextareaField: React.FC<FieldComponentProps> = ({
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
    {
      label: propLabel,
      placeholder: propPlaceholder,
      required: propRequired,
      disabled: propDisabled,
      description: propDescription,
      typographyDisplay,
      typographyVariant,
    },
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
  
  const maxLength = (config as any).validation?.maxLength
  const rows = (config as any).rows ?? 4

  return (
    <Stack spacing="tight">
      {typography.showLabel && label && (
        <FormLabel 
          htmlFor={name} 
          required={typography.showRequired && required}
          optional={typography.showOptional && !required}
        >
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
            <textarea
              id={name}
              {...field}
              rows={rows}
              enterKeyHint="enter"
              autoCapitalize="sentences"
              autoCorrect="on"
              spellCheck={true}
              className="ds-input ds-textarea w-full resize-y"
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              aria-invalid={!!errors?.[name]}
              aria-describedby={errors?.[name] ? `${name}-error` : description ? `${name}-description` : undefined}
              style={{ minHeight: '88px' }}
            />
            {maxLength && (
              <div className="absolute bottom-2 right-2 text-xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                {field.value?.length || 0}/{maxLength}
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
