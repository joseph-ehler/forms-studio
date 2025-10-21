/**
 * TableField Component
 * 
 * Inline spreadsheet for structured data entry.
 * Composite: Grid with typed columns and row management.
 * 
 * Use cases:
 * - Line items (SKU, quantity, price)
 * - Contact lists
 * - Budget breakdowns
 * - Inventory management
 */

import React, { useState } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import type { FieldComponentProps } from '../types'
import { FormLabel, FormHelperText } from '../../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

interface TableColumn {
  id: string
  label: string
  type: 'text' | 'number' | 'currency' | 'select'
  options?: string[]
  min?: number
  max?: number
  currency?: string
  required?: boolean
}

interface TableRow {
  [key: string]: any
}

export const TableField: React.FC<FieldComponentProps> = ({
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
  // Extract table configuration from JSON
  const columns: TableColumn[] = json?.columns ?? []
  const minRows = json?.minRows ?? 1
  const maxRows = json?.maxRows ?? 10
  const showRowNumbers = json?.showRowNumbers ?? true
  const allowAddRows = json?.allowAddRows ?? true
  const allowDeleteRows = json?.allowDeleteRows ?? true
  const compute = json?.compute // Computed totals/aggregations

  // Use React Hook Form's useFieldArray for dynamic rows
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  })

  const canAddRow = allowAddRows && fields.length < maxRows
  const canDeleteRow = allowDeleteRows && fields.length > minRows

  return (
    <Stack spacing="lg">
      {typography.showLabel && label && (
        <div className="mb-2">
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

      {/* Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {showRowNumbers && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-12">
                  #
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  {column.label}
                  {column.required && <span className="text-red-500 ml-1">*</span>}
                </th>
              ))}
              {canDeleteRow && (
                <th className="px-3 py-2 w-12"></th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {fields.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showRowNumbers ? 1 : 0) + (canDeleteRow ? 1 : 0)}
                  className="px-3 py-8 text-center text-sm text-gray-500"
                >
                  No rows yet. Click "Add Row" to get started.
                </td>
              </tr>
            ) : (
              fields.map((field, rowIndex) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  {/* Row number */}
                  {showRowNumbers && (
                    <td className="px-3 py-2 text-sm text-gray-500 font-medium">
                      {rowIndex + 1}
                    </td>
                  )}

                  {/* Column cells */}
                  {columns.map((column) => (
                    <td key={column.id} className="px-3 py-2">
                      <Controller
                        name={`${name}.${rowIndex}.${column.id}` as any}
                        control={control}
                        render={({ field: cellField }) => (
                          <TableCell
                            value={cellField.value}
                            onChange={cellField.onChange}
                            column={column}
                            disabled={disabled}
                          />
                        )}
                      />
                    </td>
                  ))}

                  {/* Delete button */}
                  {canDeleteRow && (
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => remove(rowIndex)}
                        disabled={disabled || !canDeleteRow}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                        aria-label={`Delete row ${rowIndex + 1}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>

          {/* Footer with totals */}
          {compute && fields.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={columns.length + (showRowNumbers ? 1 : 0) + (canDeleteRow ? 1 : 0)}
                  className="px-3 py-2 text-sm font-medium text-gray-700"
                >
                  <div className="flex justify-end gap-4">
                    {Object.entries(compute).map(([key, formula]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-semibold">
                          {/* Computed value would go here */}
                          —
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add row button */}
      {canAddRow && !disabled && (
        <button
          type="button"
          onClick={() => append({})}
          className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors min-h-[44px]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </button>
      )}

      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </div>
  )
}

// Internal TableCell component
interface TableCellProps {
  value: any
  onChange: (value: any) => void
  column: TableColumn
  disabled?: boolean
}

const TableCell: React.FC<TableCellProps> = ({ value, onChange, column, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = column.type === 'number' || column.type === 'currency'
      ? parseFloat(e.target.value) || 0
      : e.target.value
    onChange(newValue)
  }

  const inputClasses = "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"

  switch (column.type) {
    case 'select':
      return (
        <select
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">Select...</option>
          {column.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )

    case 'number':
    case 'currency':
      return (
        <input
          type="number"
          inputMode="decimal"
          value={value || ''}
          onChange={handleChange}
          min={column.min}
          max={column.max}
          step={column.type === 'currency' ? '0.01' : '1'}
          disabled={disabled}
          className={inputClasses}
        />
      )

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className={inputClasses}
        />
      )
  }
}
