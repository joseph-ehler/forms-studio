/**
 * SignatureField Component
 *
 * Canvas-based signature capture with touch/mouse support.
 * Foundation field — digital signature collection.
 */

import React, { useRef, useState, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'

import { FormLabel, FormHelperText } from '../components'
import { Stack } from '../components/DSShims'

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

  const fieldLabel  = config.label
  const required    = config.required ?? false
  const helperText  = config.description ?? undefined

  const ty = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || ty.display,
    config.typographyVariant || ty.variant
  )

  const width           = Number((config as any).width ?? 500)
  const height          = Number((config as any).height ?? 200)
  const lineColor       = String((config as any).lineColor ?? '#000000')
  const lineWidth       = Number((config as any).lineWidth ?? 2)
  const backgroundColor = String((config as any).backgroundColor ?? '#FFFFFF')
  const clearText       = String((config as any).clearText ?? 'Clear')

  return (
    <Stack spacing="normal">
      {typography.showLabel && fieldLabel && (
        <div className="mb-2">
          <FormLabel required={typography.showRequired && required} optional={typography.showOptional && !required}>
            {fieldLabel}
          </FormLabel>
        </div>
      )}

      {typography.showDescription && helperText && (
        <div className="mb-3">
          <FormHelperText>{helperText}</FormHelperText>
        </div>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <SignatureCanvas
            value={field.value}
            onChange={field.onChange}
            disabled={Boolean(disabled)}
            width={width}
            height={height}
            lineColor={lineColor}
            lineWidth={lineWidth}
            backgroundColor={backgroundColor}
            clearText={clearText}
            ariaLabel={fieldLabel || 'Signature'}
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

interface SignatureCanvasProps {
  value?: string
  onChange: (value: string) => void
  disabled: boolean
  width: number
  height: number
  lineColor: string
  lineWidth: number
  backgroundColor: string
  clearText: string
  ariaLabel: string
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
  ariaLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width
    canvas.height = height
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        setIsEmpty(false)
      }
      img.src = value
    } else {
      setIsEmpty(true)
    }
  }, [value, width, height, lineColor, lineWidth, backgroundColor])

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const t = e.touches[0]
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const begin = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()
    const pt = getCoords(e)
    if (!pt) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    setIsEmpty(false)
    ctx.beginPath()
    ctx.moveTo(pt.x, pt.y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return
    e.preventDefault()
    const pt = getCoords(e)
    if (!pt) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
  }

  const end = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      onChange(canvas.toDataURL('image/png'))
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onChange('')
  }

  return (
    <Stack spacing="normal">
      <div
        className="relative overflow-hidden"
        style={{ 
          maxWidth: '100%',
          border: '2px solid var(--ds-color-border-subtle)',
          backgroundColor: disabled ? 'var(--ds-color-surface-subtle)' : 'var(--ds-color-surface-base)',
          borderRadius: 'var(--ds-radius-md, 8px)'
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={begin}
          onMouseMove={draw}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={begin}
          onTouchMove={draw}
          onTouchEnd={end}
          className="w-full h-auto cursor-crosshair"
          style={{ touchAction: 'none' }}
          role="img"
          aria-label={ariaLabel}
        />

        {isEmpty && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p style={{ color: 'var(--ds-color-text-muted)', fontSize: '14px' }}>Sign here</p>
          </div>
        )}
      </div>

      {!isEmpty && !disabled && (
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium px-4"
          style={{ 
            minHeight: '44px',
            color: 'var(--ds-color-state-danger-text)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ds-color-state-danger-text-hover, var(--ds-color-state-danger-text))'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ds-color-state-danger-text)'}
        >
          {clearText}
        </button>
      )}
    </Stack>
  )
}
