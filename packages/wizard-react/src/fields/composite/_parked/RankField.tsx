/**
 * RankField Component
 * 
 * Drag-and-drop ranking for survey preferences.
 * Composite: Reorderable list with ranking visualization.
 * 
 * Use cases:
 * - Product preference ranking
 * - Feature prioritization
 * - Survey importance ordering
 * - Competitive analysis
 */

import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from '../types'
import { FormLabel, FormHelperText } from '../../components'
import { Stack } from '../../components/DSShims'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

interface RankOption {
  id: string
  label: string
  description?: string
}

export const RankField: React.FC<FieldComponentProps> = ({
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
  // Extract rank configuration from JSON
  const options: RankOption[] = json?.options ?? []
  const showRankNumbers = json?.showRankNumbers ?? true
  const allowTies = json?.allowTies ?? false
  const instructions = json?.instructions ?? 'Drag to reorder items by preference'

  return (
    <Stack spacing="relaxed">
      {typography.showLabel && label && (
        <Stack spacing="normal">
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

      {/* Instructions */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <svg
          className="h-5 w-5 text-blue-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-blue-800">{instructions}</p>
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RankList
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            options={options}
            showRankNumbers={showRankNumbers}
            allowTies={allowTies}
          />
        )}
      />

      {typography.showError && errors?.[name]?.message && (
        <Stack className="mt-2">
          <FormHelperText variant="error">
            {String(errors[name].message)}
          </FormHelperText>
        </Stack>
      )}
    </Stack>
  )
}

// Internal RankList component
interface RankListProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  options: RankOption[]
  showRankNumbers: boolean
  allowTies: boolean
}

const RankList: React.FC<RankListProps> = ({
  value,
  onChange,
  disabled,
  options,
  showRankNumbers,
  allowTies,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Initialize ranked list
  const rankedItems = value && value.length > 0
    ? value.map(id => options.find(opt => opt.id === id)).filter(Boolean) as RankOption[]
    : options

  // Handle drag start
  const handleDragStart = (index: number) => {
    if (!disabled) {
      setDraggedIndex(index)
    }
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (!disabled && draggedIndex !== null) {
      setDragOverIndex(index)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (disabled || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newRankedItems = [...rankedItems]
    const [draggedItem] = newRankedItems.splice(draggedIndex, 1)
    newRankedItems.splice(dropIndex, 0, draggedItem)

    onChange(newRankedItems.map(item => item.id))
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Handle keyboard navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault()
      const newRankedItems = [...rankedItems]
      const [item] = newRankedItems.splice(index, 1)
      newRankedItems.splice(index - 1, 0, item)
      onChange(newRankedItems.map(item => item.id))
    } else if (e.key === 'ArrowDown' && index < rankedItems.length - 1) {
      e.preventDefault()
      const newRankedItems = [...rankedItems]
      const [item] = newRankedItems.splice(index, 1)
      newRankedItems.splice(index + 1, 0, item)
      onChange(newRankedItems.map(item => item.id))
    }
  }

  return (
    <Stack spacing="normal">
      {rankedItems.map((item, index) => {
        const isDragging = draggedIndex === index
        const isDragOver = dragOverIndex === index

        return (
          <div
            key={item.id}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={() => {
              setDraggedIndex(null)
              setDragOverIndex(null)
            }}
            onKeyDown={(e) => handleKeyDown(index, e)}
            tabIndex={disabled ? -1 : 0}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
              isDragging
                ? 'opacity-50 border-blue-400 bg-blue-50'
                : isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            } ${
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-move'
            }`}
            role="button"
            aria-label={`Rank ${index + 1}: ${item.label}. Use arrow keys to reorder`}
          >
            {/* Drag handle */}
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>

            {/* Rank number */}
            {showRankNumbers && (
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                {index + 1}
              </div>
            )}

            {/* Item content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              {item.description && (
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              )}
            </div>

            {/* Move buttons (keyboard alternative) */}
            {!disabled && (
              <div className="flex-shrink-0 flex gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (index > 0) {
                      const newRankedItems = [...rankedItems]
                      const [item] = newRankedItems.splice(index, 1)
                      newRankedItems.splice(index - 1, 0, item)
                      onChange(newRankedItems.map(item => item.id))
                    }
                  }}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (index < rankedItems.length - 1) {
                      const newRankedItems = [...rankedItems]
                      const [item] = newRankedItems.splice(index, 1)
                      newRankedItems.splice(index + 1, 0, item)
                      onChange(newRankedItems.map(item => item.id))
                    }
                  }}
                  disabled={index === rankedItems.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </Stack>
    </Stack>
  )
}
