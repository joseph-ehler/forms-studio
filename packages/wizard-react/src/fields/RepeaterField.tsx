/**
 * RepeaterField Component
 *
 * Dynamic list of repeatable field groups.
 * Foundation field — complex list management.
 *
 * NOTE: This simplified version renders basic <input/>s from itemSchema.
 * Full registry-driven recursive rendering can be layered later.
 */

import React from 'react'
import { useFieldArray, Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'

import { FormLabel, FormHelperText } from '../components'
import { Stack } from '../components/DSShims'

import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

export const RepeaterField: React.FC<FieldComponentProps> = ({
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

  const fieldLabel  = config.label
  const required    = config.required ?? false
  const disabled    = config.disabled ?? false
  const description = config.description ?? undefined

  const ty = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || ty.display,
    config.typographyVariant || ty.variant
  )

  const minItems         = Number((config as any).minItems ?? 0)
  const maxItems         = Number((config as any).maxItems ?? 10)
  const addButtonText    = String((config as any).addButtonText ?? 'Add Item')
  const removeButtonText = String((config as any).removeButtonText ?? 'Remove')
  const itemSchema       = Array.isArray((config as any).itemSchema) ? (config as any).itemSchema : []

  const { fields, append, remove } = useFieldArray({ control, name })
  const canAdd    = !disabled && fields.length < maxItems
  const canRemove = !disabled && fields.length > minItems

  return (
    <Stack spacing="relaxed">
      {typography.showLabel && fieldLabel && (
        <div className="mb-1">
          <FormLabel
            required={typography.showRequired && required}
            optional={typography.showOptional && !required}
          >
            {fieldLabel}
          </FormLabel>
        </div>
      )}

      {typography.showDescription && description && (
        <div className="mb-3">
          <FormHelperText>{description}</FormHelperText>
        </div>
      )}

      <Stack spacing="relaxed">
        {fields.length === 0 && (
          <div
            className="text-center py-8"
            style={{
              border: '2px dashed var(--ds-color-border-subtle)',
              borderRadius: 'var(--ds-radius-md, 8px)',
              backgroundColor: 'var(--ds-color-surface-base)'
            }}
          >
            <p className="text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              No items yet. Click "{addButtonText}" to add one.
            </p>
          </div>
        )}

        {fields.map((row, index) => (
          <div
            key={row.id}
            className="relative p-4"
            style={{
              border: '1px solid var(--ds-color-border-subtle)',
              borderRadius: 'var(--ds-radius-md, 8px)',
              backgroundColor: 'var(--ds-color-surface-base)'
            }}
            aria-label={`Item ${index + 1}`}
          >
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--ds-color-border-subtle)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--ds-color-text-primary)' }}>Item {index + 1}</span>
              {canRemove && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm font-medium px-3"
                  style={{
                    minHeight: '44px',
                    color: 'var(--ds-color-state-danger-text)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  aria-label={`${removeButtonText} item ${index + 1}`}
                >
                  {removeButtonText}
                </button>
              )}
            </div>

            <Stack spacing="relaxed" className="mt-3">
              {itemSchema.map((fieldDef: any, fieldIndex: number) => {
                const fieldId   = String(fieldDef.id ?? `field_${fieldIndex}`)
                const fieldPath = `${name}.${index}.${fieldId}`

                return (
                  <div key={fieldId}>
                    <Controller
                      name={fieldPath}
                      control={control}
                      render={({ field: itemField }) => (
                        <Stack spacing="tight">
                          {fieldDef.label && (
                            <label
                              htmlFor={fieldPath}
                              className="block text-sm font-medium"
                              style={{ color: 'var(--ds-color-text-primary)' }}
                            >
                              {fieldDef.label}
                              {fieldDef.validation?.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                          )}
                          <input
                            id={fieldPath}
                            type={fieldDef.type || 'text'}
                            {...itemField}
                            placeholder={fieldDef.placeholder}
                            disabled={disabled}
                            className="ds-input w-full"
                            aria-required={Boolean(fieldDef.validation?.required)}
                          />
                        </Stack>
                      )}
                    />
                  </div>
                )
              })}
            </Stack>
          </div>
        ))}
      </Stack>

      {canAdd && (
        <button
          type="button"
          onClick={() => append({})}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium active:scale-[0.98]"
          style={{
            minHeight: '44px',
            borderRadius: 'var(--ds-radius-md, 8px)',
            border: '2px dashed var(--ds-color-border-subtle)',
            color: 'var(--ds-color-text-primary)',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--ds-color-border-focus)';
            e.currentTarget.style.color = 'var(--ds-color-primary-text, var(--ds-color-primary-bg))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--ds-color-border-subtle)';
            e.currentTarget.style.color = 'var(--ds-color-text-primary)';
          }}
          aria-label={addButtonText}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {addButtonText}
        </button>
      )}

      {typography.showError && errors?.[name]?.message && (
        <div className="mt-2">
          <FormHelperText variant="error">{String(errors[name].message)}</FormHelperText>
        </div>
      )}

      {(minItems > 0 || maxItems < Number.POSITIVE_INFINITY) && (
        <p className="text-xs" style={{ color: 'var(--ds-color-text-muted)' }}>
          {minItems > 0 && `Minimum: ${minItems} item${minItems > 1 ? 's' : ''}`}
          {minItems > 0 && maxItems < Number.POSITIVE_INFINITY && ' • '}
          {maxItems < Number.POSITIVE_INFINITY && `Maximum: ${maxItems} items`}
        </p>
      )}
    </Stack>
  )
}
