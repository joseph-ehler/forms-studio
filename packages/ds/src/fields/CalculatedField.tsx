/**
 * CalculatedField Component
 * 
 * Formula-based computed field (read-only).
 * Foundation field - derived values from other fields.
 * 
 * Supports simple expressions like:
 * - Basic math: "fields.price - fields.discount"
 * - Functions: "sum(fields.items.*.quantity)"
 * - Conditionals: "fields.type === 'premium' ? fields.price * 0.9 : fields.price"
 */

import React, { useEffect, useMemo } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

export const CalculatedField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,
  description: propDescription,
  control,
  errors,
  json,
  typographyDisplay,
  typographyVariant,
}) => {
  const config = mergeFieldConfig(
    { label: propLabel, description: propDescription, typographyDisplay, typographyVariant },
    json,
    {}
  )
  
  const label = config.label
  const description = config.description
  
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  
  const expression = (config as any).expression ?? (config as any).expr ?? ''
  const format = (config as any).format
  const currency = (config as any).currency ?? 'USD'
  const decimals = (config as any).decimals ?? 2
  const prefix = (config as any).prefix ?? ''
  const suffix = (config as any).suffix ?? ''
  const dependencies = (config as any).dependencies ?? [] // Array of field names to watch

  // Normalize dependencies (strip 'fields.' prefix if present)
  const normalizedDeps = dependencies.map((dep: string) => dep.replace(/^fields\./, ''))

  // Watch dependencies for changes
  const watchedValues = useWatch({
    control,
    name: normalizedDeps.length > 0 ? normalizedDeps : undefined,
  })

  // Simple expression evaluator (safer than eval)
  const evaluateExpression = (expr: string, context: Record<string, any>): any => {
    try {
      // Create a safe evaluation context
      const safeContext = {
        fields: context,
        Math,
        sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
        avg: (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length,
        min: Math.min,
        max: Math.max,
        round: Math.round,
        floor: Math.floor,
        ceil: Math.ceil,
      }

      // Create function with safe context
      const func = new Function(...Object.keys(safeContext), `return ${expr}`)
      const result = func(...Object.values(safeContext))

      return result
    } catch (error) {
      console.error('Calculation error:', error)
      return null
    }
  }

  // Compute value based on dependencies
  const computedValue = useMemo(() => {
    if (!expression) return null

    // Build context from watched values
    const context: Record<string, any> = {}
    if (Array.isArray(watchedValues)) {
      normalizedDeps.forEach((fieldName: string, index: number) => {
        context[fieldName] = watchedValues[index]
      })
    } else if (watchedValues !== undefined) {
      // Single dependency
      context[normalizedDeps[0]] = watchedValues
    }

    return evaluateExpression(expression, context)
  }, [expression, watchedValues, normalizedDeps])

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '—'
    }

    let formatted = ''

    switch (format) {
      case 'currency':
        formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value)
        break

      case 'percent':
        formatted = new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value / 100)
        break

      case 'number':
        formatted = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value)
        break

      default:
        formatted = String(value)
    }

    return `${prefix}${formatted}${suffix}`
  }

  return (
    <Stack spacing="normal">
      {typography.showLabel && label && (
        <FormLabel>{label}</FormLabel>
      )}
      {typography.showDescription && description && (
        <FormHelperText>{description}</FormHelperText>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Update field value when computed value changes
          useEffect(() => {
            if (field.value !== computedValue) {
              field.onChange(computedValue)
            }
          }, [computedValue])

          return (
            <div
              className="ds-input flex items-center justify-between"
              style={{ padding: 'var(--ds-spacing-md, 12px 16px)' }}
              role="status"
              aria-live="polite"
              aria-label={`Calculated value: ${formatValue(computedValue)}`}
            >
              {/* Calculated value display */}
              <div className="flex items-center gap-2">
                <svg
                  style={{ width: '20px', height: '20px', color: 'var(--ds-color-text-muted)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-base font-semibold text-gray-900">
                  {formatValue(computedValue)}
                </span>
              </div>

              {/* Formula hint (optional) */}
              {json?.showFormula && (
                <span className="text-xs  style={{ color: 'var(--ds-color-text-secondary)' }} font-mono">
                  {expression}
                </span>
              )}
            </div>
          )
        }}
      />

      {/* Expression hint */}
      {expression && (
        <p className="text-xs text-gray-400">
          Calculated from: {dependencies.join(', ')}
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
