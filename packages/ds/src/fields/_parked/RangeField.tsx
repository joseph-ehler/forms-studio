/**
 * RangeField Component
 * 
 * Dual-handle slider for min/max range selection.
 * Foundation field - numeric range input.
 * 
 * Use cases:
 * - Price ranges ($50 - $500)
 * - Date ranges
 * - Age ranges
 * - Any min/max numeric selection
 */

import React, { useRef, useState, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack, Flex } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

interface RangeValue {
  min: number
  max: number
}

export const RangeField: React.FC<FieldComponentProps> = ({
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
  
  const min = (config as any).min ?? 0
  const max = (config as any).max ?? 100
  const step = (config as any).step ?? 1
  const format = (config as any).format
  const currency = (config as any).currency ?? 'USD'
  const showValues = (config as any).showValues ?? true
  const showTicks = (config as any).showTicks ?? false
  const defaultValue = (config as any).defaultValue ?? { min, max }

  return (
    <Stack spacing="relaxed">
      {typography.showLabel && label && (
        <div className="mb-1">
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
        defaultValue={defaultValue}
        render={({ field }) => (
          <RangeSlider
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            format={format}
            currency={currency}
            showValues={showValues}
            showTicks={showTicks}
          />
        )}
      />

      {typography.showError && errors?.[name]?.message && (
        <div className="mt-2">
          <FormHelperText variant="error">
            {String(errors[name].message)}
          </FormHelperText>
        </div>
      )}
    </div>
  )
}

// Internal RangeSlider component
interface RangeSliderProps {
  value: RangeValue
  onChange: (value: RangeValue) => void
  disabled?: boolean
  min: number
  max: number
  step: number
  format?: string
  currency: string
  showValues: boolean
  showTicks: boolean
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  onChange,
  disabled,
  min,
  max,
  step,
  format,
  currency,
  showValues,
  showTicks,
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)

  const currentMin = value?.min ?? min
  const currentMax = value?.max ?? max

  // Format value for display
  const formatValue = (val: number): string => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val)
    }
    if (format === 'percent') {
      return `${val}%`
    }
    return val.toString()
  }

  // Calculate position percentage
  const getPercent = (val: number): number => {
    return ((val - min) / (max - min)) * 100
  }

  // Handle mouse/touch events
  const handlePointerDown = (handle: 'min' | 'max') => {
    if (!disabled) {
      setIsDragging(handle)
    }
  }

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !trackRef.current || disabled) return

    const rect = trackRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const newValue = Math.round(((percent / 100) * (max - min) + min) / step) * step

    if (isDragging === 'min') {
      onChange({
        min: Math.min(newValue, currentMax - step),
        max: currentMax,
      })
    } else {
      onChange({
        min: currentMin,
        max: Math.max(newValue, currentMin + step),
      })
    }
  }

  const handlePointerUp = () => {
    setIsDragging(null)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove)
      window.addEventListener('mouseup', handlePointerUp)
      window.addEventListener('touchmove', handlePointerMove)
      window.addEventListener('touchend', handlePointerUp)

      return () => {
        window.removeEventListener('mousemove', handlePointerMove)
        window.removeEventListener('mouseup', handlePointerUp)
        window.removeEventListener('touchmove', handlePointerMove)
        window.removeEventListener('touchend', handlePointerUp)
      }
    }
  }, [isDragging, currentMin, currentMax])

  const minPercent = getPercent(currentMin)
  const maxPercent = getPercent(currentMax)

  return (
    <Stack spacing="relaxed">
      {/* Value display */}
      {showValues && (
        <Flex align="center" justify="between">
          <span className="text-sm font-semibold text-blue-600">
            {formatValue(currentMin)}
          </span>
          <span className="text-xs text-gray-500">to</span>
          <span className="text-sm font-semibold text-blue-600">
            {formatValue(currentMax)}
          </span>
        </Stack>
      )}

      {/* Dual-handle slider */}
      <div className="relative pt-2 pb-6">
        {/* Track */}
        <div
          ref={trackRef}
          className="relative h-2 bg-gray-200 rounded-full"
        >
          {/* Selected range */}
          <div
            className="absolute h-2 bg-blue-600 rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />

          {/* Min handle */}
          <button
            type="button"
            onMouseDown={() => handlePointerDown('min')}
            onTouchStart={() => handlePointerDown('min')}
            disabled={disabled}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform z-10"
            style={{ left: `${minPercent}%` }}
            aria-label={`Minimum value: ${formatValue(currentMin)}`}
            aria-valuemin={min}
            aria-valuemax={currentMax}
            aria-valuenow={currentMin}
            role="slider"
          />

          {/* Max handle */}
          <button
            type="button"
            onMouseDown={() => handlePointerDown('max')}
            onTouchStart={() => handlePointerDown('max')}
            disabled={disabled}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform z-10"
            style={{ left: `${maxPercent}%` }}
            aria-label={`Maximum value: ${formatValue(currentMax)}`}
            aria-valuemin={currentMin}
            aria-valuemax={max}
            aria-valuenow={currentMax}
            role="slider"
          />
        </Flex>

        {/* Min/Max labels */}
        {showTicks && (
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
