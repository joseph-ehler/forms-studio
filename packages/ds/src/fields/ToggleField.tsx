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
    <Stack spacing="tight">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div style={{ minHeight: '44px' }}>
            <div className="flex items-center justify-center" style={{ height: '44px' }}>
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                aria-labelledby={`${name}-label`}
                aria-describedby={description ? `${name}-description` : undefined}
                onClick={() => field.onChange(!field.value)}
                disabled={disabled}
                className="relative inline-flex h-6 w-11 items-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderRadius: '9999px',
                  backgroundColor: field.value
                    ? 'var(--ds-color-primary-bg)'
                    : 'var(--ds-color-border-strong)',
                  transition: 'all 150ms ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 3px color-mix(in oklab, var(--ds-color-border-focus), transparent 85%), 0 0 0 1px var(--ds-color-surface-base)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span className="sr-only">{label || 'Toggle'}</span>
                <span
                  className="inline-block h-4 w-4 transform"
                  style={{
                    borderRadius: '9999px',
                    backgroundColor: 'white',
                    transition: 'transform 150ms ease',
                    transform: field.value ? 'translateX(24px)' : 'translateX(4px)'
                  }}
                />
              </button>
            </div>
            <div className="ml-3 text-sm">
              <div id={`${name}-label`} className="font-medium" style={{ color: 'var(--ds-color-text-primary)' }}>
                {label}
                {required && <span style={{ color: 'var(--ds-color-state-danger-text)' }} className="ml-1">*</span>}
              </div>
              {description && (
                <p id={`${name}-description`} style={{ color: 'var(--ds-color-text-secondary)' }}>
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
