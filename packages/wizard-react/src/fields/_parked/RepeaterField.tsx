/**
 * RepeaterField Component
 * 
 * Dynamic list of repeatable field groups.
 * Foundation field - complex list management.
 * 
 * Note: This is a simplified version that renders field groups.
 * Full integration with field registry would require recursive rendering.
 */

import React from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
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
  
  const label = config.label
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  const description = config.description
  
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  
  const minItems = (config as any).minItems ?? 0
  const maxItems = (config as any).maxItems ?? 10
  const addButtonText = (config as any).addButtonText ?? 'Add Item'
  const removeButtonText = (config as any).removeButtonText ?? 'Remove'
  const itemSchema = (config as any).itemSchema ?? [] // Array of field definitions

  // Use React Hook Form's useFieldArray for dynamic lists
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  })

  const canAdd = fields.length < maxItems
  const canRemove = fields.length > minItems

  return (
    <Stack spacing="relaxed">
      {typography.showLabel && label && (
        <Stack spacing="tight">
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

      {/* List of items */}
      <Stack spacing="relaxed">
        {fields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">
              No items yet. Click "{addButtonText}" to add one.
            </p>
          </div>
        )}

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative border border-gray-300 rounded-lg p-4 space-y-3 bg-white"
          >
            {/* Item header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Item {index + 1}
              </span>
              {canRemove && !disabled && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium min-h-[44px] px-3"
                  aria-label={`${removeButtonText} item ${index + 1}`}
                >
                  {removeButtonText}
                </button>
              )}
            </div>

            {/* Item fields - Placeholder for field rendering */}
            <Stack spacing="relaxed">
              {itemSchema.map((fieldDef: any, fieldIndex: number) => (
                <div key={fieldDef.id || fieldIndex}>
                  <Controller
                    name={`${name}.${index}.${fieldDef.id}`}
                    control={control}
                    render={({ field: itemField }) => (
                      <Stack spacing="tight">
                        {fieldDef.label && (
                          <label
                            htmlFor={`${name}.${index}.${fieldDef.id}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            {fieldDef.label}
                            {fieldDef.validation?.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                        )}
                        <input
                          id={`${name}.${index}.${fieldDef.id}`}
                          type={fieldDef.type || 'text'}
                          {...itemField}
                          placeholder={fieldDef.placeholder}
                          disabled={disabled}
                          className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 min-h-[44px]"
                        />
                      </Stack>
                    )}
                  />
                </div>
              ))}
            </Stack>
          </div>
        ))}
      </Stack>

      {/* Add button */}
      {canAdd && !disabled && (
        <button
          type="button"
          onClick={() => append({})}
          className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors min-h-[44px] active:scale-[0.98]"
          aria-label={addButtonText}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {addButtonText}
        </button>
      )}

      {/* Validation error */}
      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}

      {/* Min/Max hints */}
      {(minItems > 0 || maxItems < 100) && (
        <p className="text-xs text-gray-400">
          {minItems > 0 && `Minimum: ${minItems} item${minItems > 1 ? 's' : ''}`}
          {minItems > 0 && maxItems < 100 && ' • '}
          {maxItems < 100 && `Maximum: ${maxItems} items`}
        </p>
      )}
    </Stack>
  )
}
