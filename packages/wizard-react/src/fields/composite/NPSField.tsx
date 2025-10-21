/**
 * NPSField (fixed + simplified)
 * - Mobile-first, touch-friendly (48px)
 * - Two-row mobile (0–5 / 6–10), single-row desktop (0–10)
 * - JSON-config + typography preserved
 * - No mismatched tags; minimal nesting; safe a11y
 */

import React, { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from '../types'

import { FormLabel, FormHelperText } from '../../components'
import { Stack } from '../../components/DSShims'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

type NpsCategory = 'detractor' | 'passive' | 'promoter'
interface NPSValue {
  score?: number
  reason?: string
  category?: NpsCategory
}

const getCategory = (score: number): NpsCategory => {
  if (score <= 6) return 'detractor'
  if (score <= 8) return 'passive'
  return 'promoter'
}

const categoryBadge: Record<NpsCategory, { text: string; className: string }> = {
  detractor: { text: 'Detractor', className: 'bg-red-100 text-red-800' },
  passive:   { text: 'Passive',   className: 'bg-yellow-100 text-yellow-800' },
  promoter:  { text: 'Promoter',  className: 'bg-green-100 text-green-800' },
}

const buttonColor = (score: number, selected: boolean): string => {
  if (!selected) return 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
  const cat = getCategory(score)
  if (cat === 'detractor') return 'border-red-500 bg-red-500 text-white shadow-md'
  if (cat === 'passive')   return 'border-yellow-500 bg-yellow-500 text-white shadow-md'
  return 'border-green-500 bg-green-500 text-white shadow-md'
}

export const NPSField: React.FC<FieldComponentProps> = ({
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
  // Merge config (props → JSON → defaults)
  const config = mergeFieldConfig(
    { label: propLabel, required: propRequired, disabled: propDisabled, description: propDescription, typographyDisplay, typographyVariant },
    json,
    {}
  )

  const label       = config.label
  const required    = config.required ?? false
  const disabled    = config.disabled ?? false
  const description = config.description ?? undefined

  const jsonTy = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTy.display,
    config.typographyVariant || jsonTy.variant
  )

  // JSON-driven copy with safe defaults
  const question          = json?.question          ?? 'How likely are you to recommend us to a friend or colleague?'
  const followUp          = json?.followUp          ?? true
  const followUpThreshold = json?.followUpThreshold ?? 6
  const followUpQuestion  = json?.followUpQuestion  ?? 'What could we do better?'
  const detractorLabel    = json?.detractorLabel    ?? 'Not at all likely'
  const promoterLabel     = json?.promoterLabel     ?? 'Extremely likely'
  const showLabels        = json?.showLabels        ?? true
  const showCategory      = json?.showCategory      ?? false

  const scores = useMemo(() => Array.from({ length: 11 }, (_, i) => i), [])

  return (
    <Stack spacing="xl">
      {/* Label */}
      {typography.showLabel && label && (
        <div className="mb-2">
          <FormLabel required={typography.showRequired && required} optional={typography.showOptional && !required}>
            {label}
          </FormLabel>
        </div>
      )}

      {/* Helper / description */}
      {typography.showDescription && description && (
        <div className="mb-4">
          <FormHelperText>{description}</FormHelperText>
        </div>
      )}

      {/* Question */}
      <p className="text-base font-medium text-gray-900">{question}</p>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const value: NPSValue = field.value || {}
          const currentScore = value.score

          const onPick = (score: number) => {
            const category = getCategory(score)
            field.onChange({ score, category, reason: value.reason })
          }

          const onReason = (reason: string) => {
            field.onChange({ ...value, reason })
          }

          const shouldFollow = followUp && typeof currentScore === 'number' && currentScore <= followUpThreshold

          return (
            <Stack spacing="xl">
              {/* Labels above grid */}
              {showLabels && (
                <div className="flex justify-between text-xs text-gray-600 px-1">
                  <span className="max-w-[40%] text-left">{detractorLabel}</span>
                  <span className="max-w-[40%] text-right">{promoterLabel}</span>
                </div>
              )}

              {/* Desktop: 0–10 in one row */}
              <div className="hidden md:grid grid-cols-11 gap-2">
                {scores.map((score) => {
                  const selected = currentScore === score
                  return (
                    <button
                      key={`d-${score}`}
                      type="button"
                      onClick={() => !disabled && onPick(score)}
                      disabled={disabled}
                      className={[
                        'flex items-center justify-center min-h-[48px] rounded-lg border-2 font-semibold text-lg transition-all',
                        buttonColor(score, selected),
                        selected ? 'scale-105' : '',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      ].join(' ')}
                      aria-label={`Score ${score}`}
                      aria-pressed={selected}
                    >
                      {score}
                    </button>
                  )
                })}
              </div>

              {/* Mobile: two rows (0–5, 6–10) */}
              <div className="md:hidden space-y-2">
                <div className="grid grid-cols-6 gap-2">
                  {scores.slice(0, 6).map((score) => {
                    const selected = currentScore === score
                    return (
                      <button
                        key={`m-a-${score}`}
                        type="button"
                        onClick={() => !disabled && onPick(score)}
                        disabled={disabled}
                        className={[
                          'flex items-center justify-center min-h-[48px] rounded-lg border-2 font-semibold text-lg transition-all',
                          buttonColor(score, selected),
                          selected ? 'scale-105' : '',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        ].join(' ')}
                        aria-label={`Score ${score}`}
                        aria-pressed={selected}
                      >
                        {score}
                      </button>
                    )
                  })}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {scores.slice(6).map((score) => {
                    const selected = currentScore === score
                    return (
                      <button
                        key={`m-b-${score}`}
                        type="button"
                        onClick={() => !disabled && onPick(score)}
                        disabled={disabled}
                        className={[
                          'flex items-center justify-center min-h-[48px] rounded-lg border-2 font-semibold text-lg transition-all',
                          buttonColor(score, selected),
                          selected ? 'scale-105' : '',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        ].join(' ')}
                        aria-label={`Score ${score}`}
                        aria-pressed={selected}
                      >
                        {score}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Category badge (optional) */}
              {showCategory && typeof currentScore === 'number' && (
                <div className="flex justify-center pt-2">
                  {(() => {
                    const cat = getCategory(currentScore)
                    const b = categoryBadge[cat]
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${b.className}`}>
                        {b.text}
                      </span>
                    )
                  })()}
                </div>
              )}

              {/* Follow-up (optional) */}
              {shouldFollow && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <label htmlFor={`${name}-reason`} className="block text-sm font-medium text-gray-700">
                    {followUpQuestion}
                  </label>
                  <textarea
                    id={`${name}-reason`}
                    value={value.reason || ''}
                    onChange={(e) => onReason(e.target.value)}
                    disabled={disabled}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 min-h-[48px]"
                    placeholder="Your feedback helps us improve…"
                    aria-label="NPS follow-up reason"
                  />
                </div>
              )}
            </Stack>
          )
        }}
      />

      {/* Error */}
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
