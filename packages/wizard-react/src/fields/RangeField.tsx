/**
 * RangeField Component
 *
 * Dual-handle slider for min/max range selection.
 * Foundation field – numeric range input.
 *
 * JSON options (optional):
 * - min: number (default 0)
 * - max: number (default 100)
 * - step: number (default 1)
 * - format: 'currency' | 'percent' | undefined
 * - currency: string (default 'USD')
 * - showValues: boolean (default true)
 * - showTicks: boolean (default false)
 * - defaultValue: { min: number; max: number }
 */

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'

import { FormLabel, FormHelperText } from '../components'
import { Stack, Flex } from '../components/DSShims'

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

  const label       = config.label
  const required    = config.required ?? false
  const disabled    = config.disabled ?? false
  const description = config.description ?? undefined

  const ty = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || ty.display,
    config.typographyVariant || ty.variant
  )

  const min         = Number((config as any).min ?? 0)
  const max         = Number((config as any).max ?? 100)
  const step        = Number((config as any).step ?? 1)
  const format      = (config as any).format as 'currency' | 'percent' | undefined
  const currency    = String((config as any).currency ?? 'USD')
  const showValues  = Boolean((config as any).showValues ?? true)
  const showTicks   = Boolean((config as any).showTicks ?? false)
  const defaultValue: RangeValue = (config as any).defaultValue ?? { min, max }

  return (
    <Stack spacing="lg">
      {typography.showLabel && label && (
        <div className="mb-1">
          <FormLabel
            required={typography.showRequired && required}
            optional={typography.showOptional && !required}
          >
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
            value={(field.value as RangeValue) || defaultValue}
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
          <FormHelperText variant="error">{String(errors[name].message)}</FormHelperText>
        </div>
      )}
    </Stack>
  )
}

interface RangeSliderProps {
  value: RangeValue
  onChange: (value: RangeValue) => void
  disabled?: boolean
  min: number
  max: number
  step: number
  format?: 'currency' | 'percent'
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
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)

  const currentMin = clampToStep(value?.min ?? min, min, max, step)
  const currentMax = clampToStep(value?.max ?? max, min, max, step)

  const formatValue = useCallback((val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val)
    }
    if (format === 'percent') return `${val}%`
    return String(val)
  }, [format, currency])

  const getPercent = (val: number) => ((val - min) / (max - min)) * 100

  const toValue = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = min + percent * (max - min)
    return clampToStep(raw, min, max, step)
  }

  const startDrag = (handle: 'min' | 'max') => {
    if (!disabled) setDragging(handle)
  }

  const pointerMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging || !trackRef.current || disabled) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const newVal = toValue(clientX)

    if (dragging === 'min') {
      const nextMin = Math.min(newVal, currentMax - step)
      onChange({ min: nextMin, max: currentMax })
    } else {
      const nextMax = Math.max(newVal, currentMin + step)
      onChange({ min: currentMin, max: nextMax })
    }
  }

  const endDrag = () => setDragging(null)

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('mousemove', pointerMove)
    window.addEventListener('mouseup', endDrag)
    window.addEventListener('touchmove', pointerMove)
    window.addEventListener('touchend', endDrag)
    return () => {
      window.removeEventListener('mousemove', pointerMove)
      window.removeEventListener('mouseup', endDrag)
      window.removeEventListener('touchmove', pointerMove)
      window.removeEventListener('touchend', endDrag)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, currentMin, currentMax])

  const keyAdjust = (dir: -1 | 1, handle: 'min' | 'max') => {
    const delta = dir * step
    if (handle === 'min') {
      const nextMin = clampToStep(Math.min(currentMin + delta, currentMax - step), min, max, step)
      onChange({ min: nextMin, max: currentMax })
    } else {
      const nextMax = clampToStep(Math.max(currentMax + delta, currentMin + step), min, max, step)
      onChange({ min: currentMin, max: nextMax })
    }
  }

  const onKeyDown = (e: React.KeyboardEvent, handle: 'min' | 'max') => {
    if (disabled) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      keyAdjust(-1, handle)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      keyAdjust(1, handle)
    } else if (e.key === 'Home') {
      e.preventDefault()
      handle === 'min' ? onChange({ min, max: currentMax }) : onChange({ min: currentMin, max })
    } else if (e.key === 'End') {
      e.preventDefault()
      handle === 'min' ? onChange({ min: currentMax - step, max: currentMax }) : onChange({ min: currentMin, max })
    }
  }

  const minPct = getPercent(currentMin)
  const maxPct = getPercent(currentMax)

  return (
    <Stack spacing="xl">
      {showValues && (
        <Flex align="center" justify="between">
          <span className="text-sm font-semibold text-blue-600">{formatValue(currentMin)}</span>
          <span className="text-xs text-gray-500">to</span>
          <span className="text-sm font-semibold text-blue-600">{formatValue(currentMax)}</span>
        </Flex>
      )}

      <div className="relative pt-2 pb-6">
        <div ref={trackRef} className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-2 bg-blue-600 rounded-full"
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />

          <button
            type="button"
            onMouseDown={() => startDrag('min')}
            onTouchStart={() => startDrag('min')}
            onKeyDown={(e) => onKeyDown(e, 'min')}
            disabled={disabled}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform z-10"
            style={{ left: `${minPct}%` }}
            aria-label={`Minimum value: ${formatValue(currentMin)}`}
            aria-valuemin={min}
            aria-valuemax={currentMax}
            aria-valuenow={currentMin}
            role="slider"
          />

          <button
            type="button"
            onMouseDown={() => startDrag('max')}
            onTouchStart={() => startDrag('max')}
            onKeyDown={(e) => onKeyDown(e, 'max')}
            disabled={disabled}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform z-10"
            style={{ left: `${maxPct}%` }}
            aria-label={`Maximum value: ${formatValue(currentMax)}`}
            aria-valuemin={currentMin}
            aria-valuemax={max}
            aria-valuenow={currentMax}
            role="slider"
          />
        </div>

        {showTicks && (
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        )}
      </div>
    </Stack>
  )
}

function clampToStep(value: number, min: number, max: number, step: number) {
  const clamped = Math.max(min, Math.min(max, value))
  const snapped = Math.round((clamped - min) / step) * step + min
  return Math.max(min, Math.min(max, snapped))
}
