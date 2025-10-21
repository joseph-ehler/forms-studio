/**
 * ToggleField Component
 * 
 * Boolean toggle switch with accessible keyboard controls.
 */

import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack, Flex } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { getAriaProps, getLabelProps, getDescriptionProps } from './utils/a11y-helpers'

export const ToggleField: React.FC<FieldComponentProps> = ({
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
  return (
    <Stack spacing="sm">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="min-h-[44px]">
            <div className="flex items-center justify-center h-[44px]">
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                aria-labelledby={`${name}-label`}
                aria-describedby={description ? `${name}-description` : undefined}
                onClick={() => field.onChange(!field.value)}
                disabled={disabled}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${field.value ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span className="sr-only">{label || 'Toggle'}</span>
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${field.value ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
            <div className="ml-3 text-sm">
              <label id={`${name}-label`} htmlFor={name} className="font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {description && (
                <p id={`${name}-description`} className="text-gray-500">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      />
      {typography.showError && errors?.[name]?.message && (
        <div className="ml-14">
          <FormHelperText variant="error">
            {String(errors[name].message)}
          </FormHelperText>
        </div>
      )}
    </Stack>
  )
}
