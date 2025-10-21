/**
 * TextField Component
 * 
 * Basic text input field with RHF integration.
 * Uses typography components with JSON-configurable display.
 * 
 * Typography Control:
 * - All elements visible by default (safe)
 * - Can be hidden via JSON config
 * - Supports variant presets
 */

import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText, FormStack, FormGrid, Stack, Flex, Grid, Section } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig, getAutoCompleteHint, getAutoCapitalize } from './utils/field-json-config'
import { getAriaProps, getLabelProps, getDescriptionProps, getInputMode, getEnterKeyHint } from './utils/a11y-helpers'

export const TextField: React.FC<FieldComponentProps> = ({
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
  // Merge props with JSON config (props take priority)
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
  
  // Extract resolved values
  const label = config.label
  const placeholder = config.placeholder
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  const description = config.description
  
  // Extract typography config from JSON (if provided)
  const jsonTypography = getTypographyFromJSON(json)
  
  // Resolve final display settings (priority: props > JSON > defaults)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  
  // Input attributes (from merged config or defaults)
  const inputType = (config as any).inputType ?? 'text'
  const inputModeValue = (config as any).inputMode || getInputMode(inputType)
  const enterKeyHint = getEnterKeyHint(inputType)
  const autoComplete = getAutoCompleteHint(name, inputType)
  const autoCapitalize = getAutoCapitalize(inputType)
  
  // A11y props
  const ariaProps = getAriaProps(name, { name, label, description, required, disabled, errors })
  const labelProps = getLabelProps(name, { name, label, description, required, disabled, errors })
  const descriptionProps = getDescriptionProps(name, { name, label, description, required, disabled, errors })

  return (
    <Stack spacing="sm">
      {/* Label - controlled by typography.showLabel */}
      {typography.showLabel && label && (
        <FormLabel 
          htmlFor={name} 
          required={typography.showRequired && required}
          optional={typography.showOptional && !required}
        >
          {label}
        </FormLabel>
      )}
      
      {/* Description - controlled by typography.showDescription */}
      {typography.showDescription && description && (
        <FormHelperText>{description}</FormHelperText>
      )}
      
      {/* Input - always visible */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            {...ariaProps}
            type={inputType}
            inputMode={inputModeValue as any}
            enterKeyHint={enterKeyHint as any}
            autoComplete={autoComplete}
            autoCapitalize={autoCapitalize as any}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full min-h-[48px] rounded-md border border-gray-300 px-3 py-2.5 text-base shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
            maxLength={(config as any).validation?.maxLength}
          />
        )}
      />
      
      {/* Error - controlled by typography.showError */}
      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </Stack>
  )
}
