/**
 * RatingField Component
 *
 * Star/heart/emoji rating with hover states.
 * Foundation field – visual rating selection.
 *
 * JSON options (optional):
 * - max: number (default 5)
 * - icon: 'star' | 'heart' | 'emoji' (default 'star')
 * - size: 'small' | 'medium' | 'large' (default 'medium')
 * - showLabel: boolean (label under the row, not field label) (default false)
 * - labels: string[] (per-value captions when showLabel=true)
 */

import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'

import { FormLabel, FormHelperText } from '../components'
import { Stack } from '../components/DSShims'

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

  const fieldLabel  = config.label
  const required    = config.required ?? false
  const disabled    = config.disabled ?? false
  const description = config.description ?? undefined

  const ty = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || ty.display,
    config.typographyVariant || ty.variant
  )

  const max       = Number((config as any).max ?? 5)
  const icon      = ((config as any).icon as IconType) ?? 'star'
  const size      = ((config as any).size as 'small' | 'medium' | 'large') ?? 'medium'
  const showLabel = Boolean((config as any).showLabel ?? false)
  const labels    = Array.isArray((config as any).labels) ? (config as any).labels as string[] : []

  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const sizeClasses =
    size === 'small'  ? 'h-6 w-6' :
    size === 'large'  ? 'h-10 w-10' : 'h-8 w-8'

  const emojiSize =
    size === 'small'  ? 'text-xl' :
    size === 'large'  ? 'text-3xl' : 'text-2xl'

  const renderIcon = (indexZeroBased: number, filled: boolean) => {
    if (icon === 'emoji') {
      const idx = Math.min(indexZeroBased, EMOJI_ICONS.length - 1)
      return (
        <span className={`${emojiSize} ${filled ? 'opacity-100' : 'opacity-30'} transition-opacity duration-150`}>
          {EMOJI_ICONS[idx]}
        </span>
      )
    }
    if (icon === 'heart') {
      return (
        <svg
          className={`${sizeClasses} transition-colors duration-150`}
         style={{ color: filled ? 'var(--ds-color-state-danger-text)' : 'var(--ds-color-border-subtle)' }}
          fill={filled ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )
    }
    return (
      <svg
        className={`${sizeClasses} transition-colors duration-150`}
        style={{ color: filled ? '#FCD34D' : 'var(--ds-color-border-subtle)' }}
        fill={filled ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    )
  }

  return (
    <Stack spacing="normal">
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

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const currentValue = Number(field.value) || 0
          const displayValue = hoverValue ?? currentValue

          return (
            <Stack spacing="normal">
              <div
                className="flex gap-1"
                onMouseLeave={() => setHoverValue(null)}
                role="radiogroup"
                aria-label={fieldLabel || 'Rating'}
                aria-required={required}
              >
                {Array.from({ length: max }, (_, i) => {
                  const value = i + 1
                  const isFilled = value <= displayValue

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => !disabled && field.onChange(value)}
                      onMouseEnter={() => !disabled && setHoverValue(value)}
                      disabled={disabled}
                      className="flex items-center justify-center cursor-pointer hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ 
                        minHeight: '44px',
                        minWidth: '44px',
                        transition: 'transform 150ms ease'
                      }}
                      role="radio"
                      aria-checked={value === currentValue}
                      aria-label={`${value} ${icon}${value > 1 ? 's' : ''}`}
                    >
                      {renderIcon(i, isFilled)}
                    </button>
                  )
                })}
              </div>

              {showLabel && labels[displayValue - 1] && (
                <p className="text-sm font-medium text-gray-700">
                  {labels[displayValue - 1]}
                </p>
              )}

              {currentValue > 0 && (
                <p className="text-xs text-gray-500">
                  {currentValue} out of {max}
                </p>
              )}
            </Stack>
          )
        }}
      />

      {typography.showError && errors?.[name]?.message && (
        <div className="mt-2">
          <FormHelperText variant="error">{String(errors[name].message)}</FormHelperText>
        </div>
      )}
    </Stack>
  )
}
