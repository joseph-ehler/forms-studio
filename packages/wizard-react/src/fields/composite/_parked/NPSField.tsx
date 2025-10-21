/**
 * NPSField Component
 * 
 * Net Promoter Score (0-10) with responsive layout.
 * Works beautifully at all screen sizes.
 * 
 * NPS Categories:
 * - 0-6: Detractors (red)
 * - 7-8: Passives (yellow)
 * - 9-10: Promoters (green)
 * 
 * Features:
 * - Responsive grid (6 cols mobile, 11 cols desktop)
 * - Touch-friendly 48px buttons
 * - Color-coded feedback
 * - Optional follow-up
 */

import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from '../types'
import { FormLabel, FormHelperText } from '../../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

interface NPSValue {
  score?: number
  reason?: string
  category?: 'detractor' | 'passive' | 'promoter'
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
  const [selectedScore, setSelectedScore] = useState<number | null>(null)

  // Extract NPS configuration from JSON
  const question = json?.question ?? 'How likely are you to recommend us to a friend or colleague?'
  const followUp = json?.followUp ?? true
  const followUpThreshold = json?.followUpThreshold ?? 6
  const followUpQuestion = json?.followUpQuestion ?? 'What could we do better?'
  const detractorLabel = json?.detractorLabel ?? 'Not at all likely'
  const promoterLabel = json?.promoterLabel ?? 'Extremely likely'
  const showLabels = json?.showLabels ?? true
  const showCategory = json?.showCategory ?? false

  // Calculate category from score
  const getCategory = (score: number): 'detractor' | 'passive' | 'promoter' => {
    if (score <= 6) return 'detractor'
    if (score <= 8) return 'passive'
    return 'promoter'
  }

  // Get color for score button
  const getScoreColor = (score: number, isSelected: boolean): string => {
    if (!isSelected) return 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
    
    const category = getCategory(score)
    if (category === 'detractor') return 'border-red-500 bg-red-500 text-white shadow-md'
    if (category === 'passive') return 'border-yellow-500 bg-yellow-500 text-white shadow-md'
    return 'border-green-500 bg-green-500 text-white shadow-md'
  }

  // Get category badge
  const getCategoryBadge = (category: 'detractor' | 'passive' | 'promoter'): React.ReactNode => {
    const badges = {
      detractor: { label: 'Detractor', className: 'bg-red-100 text-red-800' },
      passive: { label: 'Passive', className: 'bg-yellow-100 text-yellow-800' },
      promoter: { label: 'Promoter', className: 'bg-green-100 text-green-800' },
    }
    const badge = badges[category]
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <Stack spacing="xl">
      {typography.showLabel && label && (
        <div className="mb-2">
          <FormLabel required={typography.showRequired && required} optional={typography.showOptional && !required}>
            {label}
          </FormLabel>
        </Stack>
      )}
      {typography.showDescription && description && (
        <div className="mb-4">
          <FormHelperText>{description}</FormHelperText>
        </div>
      )}

      {/* NPS Question */}
      <p className="text-base font-medium text-gray-900">{question}</p>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const value: NPSValue = field.value || {}
          const currentScore = value.score ?? selectedScore

          const handleScoreChange = (score: number) => {
            const category = getCategory(score)
            setSelectedScore(score)
            field.onChange({
              score,
              category,
              reason: value.reason,
            })
          }

          const handleReasonChange = (reason: string) => {
            field.onChange({
              ...value,
              reason,
            })
          }

          const shouldShowFollowUp = followUp && currentScore !== null && currentScore !== undefined && currentScore <= followUpThreshold

          return (
            <Stack spacing="xl">
              {/* Score buttons (0-10) */}
              <Stack spacing="lg">
                {/* Labels */}
                {showLabels && (
                  <div className="flex justify-between text-xs text-gray-600 px-1">
                    <span className="max-w-[40%] text-left">{detractorLabel}</span>
                    <span className="max-w-[40%] text-right">{promoterLabel}</span>
                  </Stack>
                )}

                {/* Responsive Score Grid */}
                {/* Mobile: 2 rows of 6 columns (0-5, 6-10) */}
                {/* Desktop: 1 row of 11 columns */}
                <Stack spacing="md">
                  {/* First row: 0-5 (mobile) or 0-10 (desktop) */}
                  <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    {Array.from({ length: 11 }, (_, i) => {
                      const score = i
                      const isSelected = currentScore === score
                      
                      // Hide 6-10 on mobile (show in second row)
                      const hiddenOnMobile = score >= 6

                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => !disabled && handleScoreChange(score)}
                          disabled={disabled}
                          className={`
                            ${hiddenOnMobile ? 'hidden md:flex' : 'flex'}
                            items-center justify-center
                            min-h-[48px] rounded-lg border-2 font-semibold text-lg
                            transition-all
                            ${getScoreColor(score, isSelected)}
                            ${isSelected ? 'scale-105' : ''}
                            disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          `}
                          aria-label={`Score ${score}`}
                          aria-pressed={isSelected}
                        >
                          {score}
                        </button>
                      )
                    })}
                  </Stack>
                  
                  {/* Second row: 6-10 (mobile only) */}
                  <div className="grid grid-cols-5 gap-2 md:hidden">
                    {Array.from({ length: 5 }, (_, i) => {
                      const score = i + 6
                      const isSelected = currentScore === score

                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => !disabled && handleScoreChange(score)}
                          disabled={disabled}
                          className={`
                            flex items-center justify-center
                            min-h-[48px] rounded-lg border-2 font-semibold text-lg
                            transition-all
                            ${getScoreColor(score, isSelected)}
                            ${isSelected ? 'scale-105' : ''}
                            disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          `}
                          aria-label={`Score ${score}`}
                          aria-pressed={isSelected}
                        >
                          {score}
                        </button>
                      )
                    })}
                  </Stack>
                </div>
                  </div>
                </Stack>
              </Stack>

              {/* Category badge */}
              {showCategory && currentScore !== null && currentScore !== undefined && (
                <div className="flex justify-center pt-2">
                  {getCategoryBadge(getCategory(currentScore))}
                </div>
              </Stack>
              )}

              {/* Follow-up question */}
              {shouldShowFollowUp && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <label htmlFor={`${name}-reason`} className="block text-sm font-medium text-gray-700">
                  {followUpQuestion}
                </label>
                <textarea
                  id={`${name}-reason`}
                  value={value.reason || ''}
                  onChange={(e) => handleReasonChange(e.target.value)}
                  disabled={disabled}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 min-h-[48px]"
                  placeholder="Your feedback helps us improve..."
                />
              </div>
            </Stack>
          )
        }}
      />

      {typography.showError && errors?.[name]?.message && (
        <div className="mt-2">
          <FormHelperText variant="error">
            {String(errors[name].message)}
          </FormHelperText>
        </div>
      </Stack>
    </div>
  )
}
