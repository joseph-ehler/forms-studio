/**
 * RatingField Component
 * 
 * Star/heart/emoji rating with hover states.
 * Foundation field - visual rating selection.
 */

import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

type IconType = 'star' | 'heart' | 'emoji'

const EMOJI_ICONS = ['😞', '😐', '🙂', '😊', '🤩']

export const RatingField: React.FC<FieldComponentProps> = ({
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
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const max = (config as any).max ?? 5
  const icon = ((config as any).icon as IconType) ?? 'star'
  const size = ((config as any).size as 'small' | 'medium' | 'large') ?? 'medium'
  const allowHalf = (config as any).allowHalf ?? false
  const showLabel = (config as any).showLabel ?? false
  const labels = (config as any).labels ?? []

  // Size classes
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-10 w-10',
  }[size]

  const iconSize = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
  }[size]

  // Render icon based on type
  const renderIcon = (index: number, filled: boolean, isHover: boolean) => {
    const fillClass = filled || isHover ? 'text-yellow-400' : 'text-gray-300'

    if (icon === 'star') {
      return (
        <svg
          className={`${sizeClasses} ${fillClass} transition-colors duration-150`}
          fill={filled || isHover ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )
    }

    if (icon === 'heart') {
      return (
        <svg
          className={`${sizeClasses} ${filled || isHover ? 'text-red-500' : 'text-gray-300'} transition-colors duration-150`}
          fill={filled || isHover ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )
    }

    // Emoji
    const emojiIndex = Math.min(index, EMOJI_ICONS.length - 1)
    return (
      <span
        className={`${iconSize} ${
          filled || isHover ? 'opacity-100' : 'opacity-30'
        } transition-opacity duration-150`}
      >
        {EMOJI_ICONS[emojiIndex]}
      </span>
    )
  }

  return (
    <Stack spacing="md">
      {typography.showLabel && label && (
        <Stack>
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

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const currentValue = Number(field.value) || 0
          const displayValue = hoverValue ?? currentValue

          return (
            <Stack spacing="md">
              {/* Rating icons */}
              <div
                className="flex gap-1"
                onMouseLeave={() => setHoverValue(null)}
                role="radiogroup"
                aria-label={label || 'Rating'}
                aria-required={required}
              >
                {Array.from({ length: max }, (_, i) => {
                  const value = i + 1
                  const isFilled = value <= displayValue

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      onMouseEnter={() => !disabled && setHoverValue(value)}
                      disabled={disabled}
                      className="cursor-pointer hover:scale-110 transition-transform disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={`${value} ${icon}${value > 1 ? 's' : ''}`}
                      aria-checked={value === currentValue}
                      role="radio"
                    >
                      {renderIcon(i, isFilled, false)}
                    </button>
                  )
                })}
              </Stack>

              {/* Label for current rating */}
              {showLabel && labels[displayValue - 1] && (
                <p className="text-sm font-medium text-gray-700">
                  {labels[displayValue - 1]}
                </p>
              )}

              {/* Current value display */}
              {currentValue > 0 && (
                <p className="text-xs text-gray-500">
                  {currentValue} out of {max}
                </p>
              )}
            </div>
          )
        }}
      />

      {typography.showError && errors?.[name]?.message && (
        <div className="mt-2">
          <FormHelperText variant="error">
            {String(errors[name].message)}
          </FormHelperText>
        </div>
      )}
    </Stack>
  )
}
