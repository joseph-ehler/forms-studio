/**
 * SignatureField Component
 * 
 * Canvas-based signature capture with touch/mouse support.
 * Foundation field - digital signature collection.
 */

import React, { useRef, useState, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

export const SignatureField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,
  required: propRequired,
  disabled,
  description,
  control,
  errors,
  json,
  typographyDisplay,
  typographyVariant,
}) => {
  const config = mergeFieldConfig(
    { label: propLabel, required: propRequired, disabled, description, typographyDisplay, typographyVariant },
    json,
    {}
  )
  
  const label = config.label
  const required = config.required ?? false
  
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  
  const width = (config as any).width ?? 500
  const height = (config as any).height ?? 200
  const lineColor = (config as any).lineColor ?? '#000000'
  const lineWidth = (config as any).lineWidth ?? 2
  const backgroundColor = (config as any).backgroundColor ?? '#FFFFFF'
  const clearText = (config as any).clearText ?? 'Clear'

  return (
    <Stack spacing="md">
      {typography.showLabel && label && (
        <div className="mb-2">
          <FormLabel required={required}>
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
          <SignatureCanvas
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            width={width}
            height={height}
            lineColor={lineColor}
            lineWidth={lineWidth}
            backgroundColor={backgroundColor}
            clearText={clearText}
          />
        )}
      />

      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </div>
  )
}

// Internal SignatureCanvas component
interface SignatureCanvasProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  width: number
  height: number
  lineColor: string
  lineWidth: number
  backgroundColor: string
  clearText: string
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  value,
  onChange,
  disabled,
  width,
  height,
  lineColor,
  lineWidth,
  backgroundColor,
  clearText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set drawing style
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Load existing signature if any
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        setIsEmpty(false)
      }
      img.src = value
    }
  }, [value, width, height, lineColor, lineWidth, backgroundColor])

  // Get coordinates relative to canvas
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }
  }

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()

    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setIsEmpty(false)
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
  }

  // Draw
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return
    e.preventDefault()

    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
  }

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    // Save signature as data URL
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      onChange(dataUrl)
    }
  }

  // Clear signature
  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onChange('')
  }

  return (
    <Stack spacing="md">
      <div
        className={`relative border-2 ${
          disabled ? 'border-gray-300 bg-gray-50' : 'border-gray-300 bg-white'
        } rounded-lg overflow-hidden touch-none`}
        style={{ maxWidth: '100%' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-auto cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
        
        {isEmpty && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Sign here</p>
          </Stack>
        )}
      </div>

      {!isEmpty && !disabled && (
        <button
          type="button"
          onClick={clear}
          className="text-sm text-red-600 hover:text-red-700 font-medium min-h-[44px] px-4"
        >
          {clearText}
        </button>
      )}
    </div>
  )
}
