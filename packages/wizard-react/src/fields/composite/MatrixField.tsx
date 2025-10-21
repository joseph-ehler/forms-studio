/**
 * MatrixField Component
 * 
 * Grid of questions (rows) × options (columns).
 * Composite: Survey grid with radio or checkbox selection.
 * 
 * Common use cases:
 * - Likert scales (Strongly Disagree → Strongly Agree)
 * - Agreement matrices
 * - Feature ratings
 * - Multi-question surveys
 */

import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from '../types'
import { FormStack, FormGrid, Stack } from '../../components'
import { FormLabel, FormHelperText } from '../../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

interface MatrixRow {
  id: string
  label: string
  description?: string
}

interface MatrixColumn {
  id: string
  label: string
  value: string | number
}

interface MatrixValue {
  [rowId: string]: string | number | string[] | number[]
}

export const MatrixField: React.FC<FieldComponentProps> = ({
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
  // Extract matrix configuration from JSON
  const rows: MatrixRow[] = json?.rows ?? []
  const columns: MatrixColumn[] = json?.columns ?? []
  const mode = json?.mode ?? 'radio' // 'radio' or 'checkbox'
  const showRowLabels = json?.showRowLabels ?? true
  const showColumnLabels = json?.showColumnLabels ?? true
  const compactMode = json?.compactMode ?? false
  const alternateRows = json?.alternateRows ?? true

  if (rows.length === 0 || columns.length === 0) {
    return (
      <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
        <p className="text-sm text-yellow-800">
          Matrix field requires rows and columns configuration
        </p>
      </div>
    )
  }

  return (
    <Stack spacing="lg">
      {typography.showLabel && label && (
        <div className="mb-2">
          <FormLabel required={typography.showRequired && required} optional={typography.showOptional && !required}>
            {label}
          </FormLabel>
        </div>
      )}
      {typography.showDescription && description && (
        <div className="mb-3">
          <FormHelperText>{description}</FormHelperText>
        </div>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const value: MatrixValue = field.value || {}

          const handleChange = (rowId: string, columnValue: string | number) => {
            if (mode === 'radio') {
              // Single selection per row
              field.onChange({
                ...value,
                [rowId]: columnValue,
              })
            } else {
              // Multiple selection per row (checkbox)
              const currentValues = (value[rowId] as any[]) || []
              const newValues = currentValues.includes(columnValue)
                ? currentValues.filter((v) => v !== columnValue)
                : [...currentValues, columnValue]
              
              field.onChange({
                ...value,
                [rowId]: newValues,
              })
            }
          }

          const isSelected = (rowId: string, columnValue: string | number): boolean => {
            if (mode === 'radio') {
              return value[rowId] === columnValue
            } else {
              const currentValues = (value[rowId] as any[]) || []
              return currentValues.includes(columnValue)
            }
          }

          return (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                {/* Column headers */}
                {showColumnLabels && (
                  <thead className="bg-gray-50">
                    <tr>
                      {/* Empty corner cell */}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-300">
                        {label && !compactMode ? 'Questions' : ''}
                      </th>
                      {/* Column labels */}
                      {columns.map((column) => (
                        <th
                          key={column.id}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-300"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}

                {/* Rows */}
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className={
                        alternateRows && rowIndex % 2 === 0
                          ? 'bg-white'
                          : 'bg-gray-50'
                      }
                      role="radiogroup"
                      aria-label={row.label}
                    >
                      {/* Row label */}
                      {showRowLabels && (
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-300">
                          <div>
                            {row.label}
                            {required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </div>
                          {row.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {row.description}
                            </div>
                          )}
                        </td>
                      )}

                      {/* Column cells */}
                      {columns.map((column) => {
                        const selected = isSelected(row.id, column.value)
                        const inputId = `${name}-${row.id}-${column.id}`

                        return (
                          <td
                            key={column.id}
                            className="px-4 py-3 text-center border-gray-200 border-r last:border-r-0"
                          >
                            <div className="flex items-center justify-center min-h-[44px]">
                              <input
                                id={inputId}
                                type={mode}
                                name={mode === 'radio' ? `${name}-${row.id}` : inputId}
                                checked={selected}
                                onChange={() => !disabled && handleChange(row.id, column.value)}
                                disabled={disabled}
                                className="h-5 w-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                                aria-label={`${row.label}: ${column.label}`}
                              />
                              <label
                                htmlFor={inputId}
                                className="sr-only"
                              >
                                {row.label}: {column.label}
                              </label>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }}
      />

      {/* Required rows hint */}
      {required && (
        <p className="text-xs text-gray-500">
          All questions are required
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
