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

import { FormLabel as FormLabelOld, FormHelperText } from '../../components'
import { FormLabel } from '../../components/typography'
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

const categoryBadge: Record<NpsCategory, { text: string; bg: string; text_color: string }> = {
  detractor: { text: 'Detractor', bg: 'var(--ds-color-state-danger-bg)', text_color: 'var(--ds-color-state-danger-text)' },
  passive:   { text: 'Passive',   bg: 'var(--ds-color-state-warning-bg)', text_color: 'var(--ds-color-state-warning-text)' },
  promoter:  { text: 'Promoter',  bg: 'var(--ds-color-state-success-bg)', text_color: 'var(--ds-color-state-success-text)' },
}

const getButtonStyle = (score: number, selected: boolean) => {
  if (!selected) {
    return {
      border: '2px solid var(--ds-color-border-subtle)',
      backgroundColor: 'var(--ds-color-surface-base)',
      color: 'var(--ds-color-text-primary)',
    }
  }
  const cat = getCategory(score)
  if (cat === 'detractor') {
    return {
      border: '2px solid var(--ds-color-state-danger-border)',
      backgroundColor: 'var(--ds-color-state-danger-bg)',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }
  }
  if (cat === 'passive') {
    return {
      border: '2px solid var(--ds-color-state-warning-border)',
      backgroundColor: 'var(--ds-color-state-warning-bg)',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }
  }
  return {
    border: '2px solid var(--ds-color-state-success-border)',
    backgroundColor: 'var(--ds-color-state-success-bg)',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }
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
    <Stack spacing="relaxed">
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
      <p className="text-base font-medium" style={{ color: 'var(--ds-color-text-primary)' }}>{question}</p>

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
            <Stack spacing="relaxed">
              {/* Labels above grid */}
              {showLabels && (
                <div className="flex justify-between text-xs px-1" style={{ color: 'var(--ds-color-text-secondary)' }}>
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
                      className="flex items-center justify-center font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        minHeight: '48px',
                        borderRadius: 'var(--ds-radius-md, 8px)',
                        transition: 'all 150ms ease',
                        transform: selected ? 'scale(1.05)' : 'scale(1)',
                        ...getButtonStyle(score, selected)
                      }}
                      onMouseEnter={(e) => !selected && !disabled && (
                        e.currentTarget.style.borderColor = 'var(--ds-color-border-focus)',
                        e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--ds-color-primary-bg), transparent 95%)'
                      )}
                      onMouseLeave={(e) => !selected && (
                        e.currentTarget.style.borderColor = 'var(--ds-color-border-subtle)',
                        e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-base)'
                      )}
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
                        className="flex items-center justify-center font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          minHeight: '48px',
                          borderRadius: 'var(--ds-radius-md, 8px)',
                          transition: 'all 150ms ease',
                          transform: selected ? 'scale(1.05)' : 'scale(1)',
                          ...getButtonStyle(score, selected)
                        }}
                        onMouseEnter={(e) => !selected && !disabled && (
                          e.currentTarget.style.borderColor = 'var(--ds-color-border-focus)',
                          e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--ds-color-primary-bg), transparent 95%)'
                        )}
                        onMouseLeave={(e) => !selected && (
                          e.currentTarget.style.borderColor = 'var(--ds-color-border-subtle)',
                          e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-base)'
                        )}
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
                        className="flex items-center justify-center font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          minHeight: '48px',
                          borderRadius: 'var(--ds-radius-md, 8px)',
                          transition: 'all 150ms ease',
                          transform: selected ? 'scale(1.05)' : 'scale(1)',
                          ...getButtonStyle(score, selected)
                        }}
                        onMouseEnter={(e) => !selected && !disabled && (
                          e.currentTarget.style.borderColor = 'var(--ds-color-border-focus)',
                          e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--ds-color-primary-bg), transparent 95%)'
                        )}
                        onMouseLeave={(e) => !selected && (
                          e.currentTarget.style.borderColor = 'var(--ds-color-border-subtle)',
                          e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-base)'
                        )}
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
                      <span
                        className="inline-flex items-center px-3 py-1 text-sm font-medium"
                        style={{
                          borderRadius: '9999px',
                          backgroundColor: b.bg,
                          color: b.text_color
                        }}
                      >
                        {b.text}
                      </span>
                    )
                  })()}
                </div>
              )}

              {/* Follow-up (optional) */}
              {shouldFollow && (
                <div className="pt-4 space-y-2" style={{ borderTop: '1px solid var(--ds-color-border-subtle)' }}>
                  <FormLabel htmlFor={`${name}-reason`} size="sm">
                    {followUpQuestion}
                  </FormLabel>
                  <textarea
                    id={`${name}-reason`}
                    value={value.reason || ''}
                    onChange={(e) => onReason(e.target.value)}
                    disabled={disabled}
                    rows={3}
                    className="ds-input ds-textarea w-full"
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
