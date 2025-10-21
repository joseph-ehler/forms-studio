/**
 * FileField Component
 * 
 * File upload with drag-and-drop, preview, and validation.
 * Foundation field - file collection and management.
 */

import React, { useState, useRef } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'

interface FileData {
  name: string
  size: number
  type: string
  dataUrl: string
}

export const FileField: React.FC<FieldComponentProps> = ({
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
  
  const accept = (config as any).accept ?? '*/*'
  const multiple = (config as any).multiple ?? false
  const maxSize = (config as any).maxSize ?? 5 * 1024 * 1024
  const maxFiles = (config as any).maxFiles ?? 10
  const showPreview = (config as any).showPreview ?? true

  return (
    <Stack spacing="md">
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
          <FileUploader
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            accept={accept}
            multiple={multiple}
            maxSize={maxSize}
            maxFiles={maxFiles}
            showPreview={showPreview}
          />
        )}
      />

      {/* File constraints hint */}
      <p className="text-xs text-gray-400">
        {accept !== '*/*' && `Accepted: ${accept}`}
        {accept !== '*/*' && ' • '}
        Max size: {formatFileSize(maxSize)} per file
        {multiple && ` • Max ${maxFiles} files`}
      </p>

      {typography.showError && errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </Stack>
  )
}

// Internal FileUploader component
interface FileUploaderProps {
  value?: FileData | FileData[]
  onChange: (value: FileData | FileData[] | null) => void
  disabled?: boolean
  accept: string
  multiple: boolean
  maxSize: number
  maxFiles: number
  showPreview: boolean
  placeholder?: string
}

const FileUploader: React.FC<FileUploaderProps> = ({
  value,
  onChange,
  disabled,
  accept,
  multiple,
  maxSize,
  maxFiles,
  showPreview,
  placeholder,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const files = Array.isArray(value) ? value : value ? [value] : []

  // Read file as data URL
  const readFile = (file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Validate and process files
  const processFiles = async (fileList: FileList | File[]) => {
    setError(null)

    const fileArray = Array.from(fileList)

    // Validate count
    if (multiple && fileArray.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate size
    for (const file of fileArray) {
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds ${formatFileSize(maxSize)}`)
        return
      }
    }

    try {
      const newFiles = await Promise.all(fileArray.map(readFile))

      if (multiple) {
        onChange([...files, ...newFiles])
      } else {
        onChange(newFiles[0])
      }
    } catch (err) {
      setError('Failed to read file')
    }
  }

  // Handle file selection
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (fileList && fileList.length > 0) {
      processFiles(fileList)
    }
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const fileList = e.dataTransfer.files
    if (fileList.length > 0) {
      processFiles(fileList)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  // Remove file
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onChange(newFiles.length > 0 ? (multiple ? newFiles : newFiles[0]) : null)
  }

  // Trigger file input
  const triggerFileInput = () => {
    inputRef.current?.click()
  }

  return (
    <Stack spacing="lg">
      {/* Drop zone */}
      <div
        onClick={!disabled ? triggerFileInput : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer min-h-[120px] flex flex-col items-center justify-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Upload icon */}
        <svg
          className={`mx-auto h-12 w-12 mb-3 ${
            isDragging ? 'text-blue-500' : 'text-gray-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="text-sm text-gray-600">
          {placeholder || (
            <>
              <span className="font-medium text-blue-600">Click to upload</span> or
              drag and drop
            </>
          )}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* File list with previews */}
      {files.length > 0 && (
        <Stack spacing="md">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Preview */}
              {showPreview && file.type.startsWith('image/') ? (
                <img
                  src={file.dataUrl}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="text-red-600 hover:text-red-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Remove ${file.name}`}
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

// Helper: Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
