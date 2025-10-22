/**
 * TagInputField - Simple & Working
 * Create tags by pressing Enter or comma
 * Mobile-first: larger touch targets
 */

import React, { Fragment, useState, useRef, KeyboardEvent } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack, Flex } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

export const TagInputField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,
  placeholder: propPlaceholder,
  required,
  disabled,
  description,
  control,
  errors,
  json,
  typographyDisplay,
  typographyVariant,
}) => {
  const config = mergeFieldConfig(
    { label: propLabel, placeholder: propPlaceholder, required, disabled, description, typographyDisplay, typographyVariant },
    json,
    {}
  )
  
  const label = config.label
  const placeholder = config.placeholder
  
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  const [inputValue, setInputValue] = useState('')

  const maxTags = (config as any).maxTags
  const suggestions = (config as any).suggestions ?? []

  // Add tag helper
  const addTag = (tag: string, currentTags: string[], onChange: (tags: string[]) => void) => {
    const trimmed = tag.trim()
    if (!trimmed || currentTags.includes(trimmed)) return
    if (maxTags && currentTags.length >= maxTags) return
    
    onChange([...currentTags, trimmed])
    setInputValue('')
  }

  // Handle key down
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentTags: string[],
    onChange: (tags: string[]) => void
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue, currentTags, onChange)
    } else if (e.key === 'Backspace' && !inputValue && currentTags.length > 0) {
      onChange(currentTags.slice(0, -1))
    }
  }

  return (
    <Stack spacing="tight">
      {typography.showLabel && label && (
        <FormLabel htmlFor={name} required={typography.showRequired && required} optional={typography.showOptional && !required}>
          {label}
        </FormLabel>
      )}
      {typography.showDescription && description && (
        <FormHelperText>{description}</FormHelperText>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const currentTags = field.value || []
          const canAddMore = !maxTags || currentTags.length < maxTags

          return (
            <Stack spacing="normal">
              {/* Tags */}
              {currentTags.length > 0 && (
                <Flex wrap gap="md">
                  {currentTags.map((tag: string, index: number) => (
                    <span
                      key={`${tag}-${index}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-base"
                      style={{
                        borderRadius: 'var(--ds-radius-md, 6px)',
                        backgroundColor: 'color-mix(in oklab, var(--ds-color-primary-bg), transparent 85%)',
                        color: 'var(--ds-color-primary-text, var(--ds-color-primary-bg))'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => field.onChange(currentTags.filter((_: any, i: number) => i !== index))}
                        disabled={disabled}
                        className="disabled:opacity-50"
                        style={{ color: 'inherit' }}
                        onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = '0.7')}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </Flex>
              )}

              {/* Input with search icon */}
              <div className="relative">
                {/* Tag Icon */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, currentTags, field.onChange)}
                  onBlur={() => {
                    if (inputValue.trim()) {
                      addTag(inputValue, currentTags, field.onChange)
                    }
                  }}
                  placeholder={canAddMore ? (placeholder || 'Type to search or create tags...') : 'Max tags reached'}
                  disabled={disabled || !canAddMore}
                  className="ds-input w-full pl-10"
                />
                {/* Helper text inside input when focused */}
                {canAddMore && !inputValue && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-xs text-gray-400">Press Enter or ,</span>
                  </div>
                )}
              </div>

              {/* Tag count */}
              {maxTags && (
                <p className="text-xs text-gray-500">
                  {currentTags.length} / {maxTags} tags
                </p>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && inputValue && canAddMore && (
                <Flex wrap gap="md">
                  {suggestions
                    .filter((s: string) => 
                      s.toLowerCase().includes(inputValue.toLowerCase()) &&
                      !currentTags.includes(s)
                    )
                    .slice(0, 6)
                    .map((suggestion: string) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addTag(suggestion, currentTags, field.onChange)}
                        className="px-3 py-2 font-medium text-base"
                        style={{
                          minHeight: '44px',
                          borderRadius: 'var(--ds-radius-md, 6px)',
                          backgroundColor: 'var(--ds-color-surface-subtle)',
                          color: 'var(--ds-color-text-primary)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--ds-color-surface-subtle), var(--ds-color-text-primary) 10%)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-subtle)'}
                      >
                        + {suggestion}
                      </button>
                    ))}
                </Flex>
              )}
            </Stack>
          )
        }}
      />

      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </Stack>
  )
}
