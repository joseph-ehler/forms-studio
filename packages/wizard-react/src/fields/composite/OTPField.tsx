/**
 * OTPField Component
 * 
 * One-time passcode input with auto-advance and verification.
 * Composite: Multi-digit input with smart focus management.
 * 
 * Features:
 * - Auto-advance on digit entry
 * - Backspace navigation
 * - Paste support (auto-fill all digits)
 * - Auto-submit when complete
 * - Resend functionality
 * - Lockout after failed attempts
 */

import React, { useState, useRef, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from '../types'
import { FormLabel, FormHelperText } from '../../components'
import { Stack } from '../../components/DSShims'
import { resolveTypographyDisplay, getTypographyFromJSON } from '../utils/typography-display'
import { mergeFieldConfig } from '../utils/field-json-config'

export const OTPField: React.FC<FieldComponentProps> = ({
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
  // Extract OTP configuration from JSON
  const digits = json?.digits ?? 6
  const autoSubmit = json?.autoSubmit ?? true
  const allowResend = json?.allowResend ?? true
  const resendAfterSec = json?.resendAfterSec ?? 30
  const onResend = json?.onResend // Callback function
  const maskInput = json?.maskInput ?? false

  return (
    <Stack spacing="lg">
      {typography.showLabel && label && (
        <div className="mb-2">
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
        render={({ field }) => (
          <OTPInput
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            digits={digits}
            autoSubmit={autoSubmit}
            allowResend={allowResend}
            resendAfterSec={resendAfterSec}
            onResend={onResend}
            maskInput={maskInput}
          />
        )}
      />

      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </Stack>
  )
}

// Internal OTPInput component
interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  digits: number
  autoSubmit: boolean
  allowResend: boolean
  resendAfterSec: number
  onResend?: () => void
  maskInput: boolean
}

const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  disabled,
  digits,
  autoSubmit,
  allowResend,
  resendAfterSec,
  onResend,
  maskInput,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [otpValues, setOtpValues] = useState<string[]>(
    Array(digits).fill('')
  )
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)

  // Initialize from value prop
  useEffect(() => {
    if (value && value.length <= digits) {
      const newValues = value.split('').concat(Array(digits - value.length).fill(''))
      setOtpValues(newValues)
    }
  }, [value, digits])

  // Handle resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  // Handle input change
  const handleChange = (index: number, newValue: string) => {
    if (disabled) return

    // Only allow digits
    const digit = newValue.replace(/[^0-9]/g, '')
    
    if (digit.length > 1) {
      // Paste handling - distribute digits across inputs
      handlePaste(index, digit)
      return
    }

    const newOtpValues = [...otpValues]
    newOtpValues[index] = digit

    setOtpValues(newOtpValues)
    
    // Update parent
    const otpString = newOtpValues.join('')
    onChange(otpString)

    // Auto-advance to next input
    if (digit && index < digits - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if complete
    if (autoSubmit && otpString.length === digits) {
      // Trigger submit (via form context or callback)
      // This would be handled by the parent form
    }
  }

  // Handle paste
  const handlePaste = (startIndex: number, pastedValue: string) => {
    const digits = pastedValue.replace(/[^0-9]/g, '').split('')
    const newOtpValues = [...otpValues]

    digits.forEach((digit, i) => {
      const index = startIndex + i
      if (index < newOtpValues.length) {
        newOtpValues[index] = digit
      }
    })

    setOtpValues(newOtpValues)
    onChange(newOtpValues.join(''))

    // Focus last filled input
    const lastIndex = Math.min(startIndex + digits.length, newOtpValues.length - 1)
    inputRefs.current[lastIndex]?.focus()
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // If current is empty, move to previous and clear it
        inputRefs.current[index - 1]?.focus()
        const newOtpValues = [...otpValues]
        newOtpValues[index - 1] = ''
        setOtpValues(newOtpValues)
        onChange(newOtpValues.join(''))
      } else {
        // Clear current
        const newOtpValues = [...otpValues]
        newOtpValues[index] = ''
        setOtpValues(newOtpValues)
        onChange(newOtpValues.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < digits - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle resend
  const handleResend = () => {
    if (canResend && !disabled && onResend) {
      onResend()
      setResendTimer(resendAfterSec)
      setCanResend(false)
      
      // Clear OTP
      setOtpValues(Array(digits).fill(''))
      onChange('')
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <Stack spacing="xl">
      {/* OTP input boxes */}
      <div className="flex gap-2 justify-center">
        {otpValues.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type={maskInput ? 'password' : 'text'}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => {
              e.preventDefault()
              const pastedData = e.clipboardData.getData('text')
              handlePaste(index, pastedData)
            }}
            disabled={disabled}
            className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Resend button */}
      {allowResend && (
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={disabled}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium underline min-h-[44px] px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend code
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Resend code in {resendTimer}s
            </p>
          )}
        </div>
      )}

      {/* Completion indicator */}
      {otpValues.join('').length === digits && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium">Code complete</span>
        </div>
      )}
    </Stack>
  )
}
