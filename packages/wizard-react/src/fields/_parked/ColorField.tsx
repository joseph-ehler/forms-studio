/**
 * ColorField Component
 * 
 * Beautiful color picker with popover palette.
 * Supports HEX, RGB, HSL with tabs for each format.
 * 
 * Features:
 * - Visual color palette grid
 * - HEX/RGB/HSL tabs
 * - Recent colors
 * - Preset swatches
 * - Live preview
 * - 48px input height
 */

import React, { Fragment, useState } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { Popover, Transition, Tab } from '@headlessui/react'

type ColorFormat = 'hex' | 'rgb' | 'hsl'

export const ColorField: React.FC<FieldComponentProps> = ({
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
  
  const format = ((config as any).format as ColorFormat) ?? 'hex'
  const presets = (config as any).presets ?? [
    '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B',
    '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
    '#8B5CF6', '#EC4899', '#F43F5E'
  ]

  return (
    <Stack spacing="sm">
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
        defaultValue="#000000"
        render={({ field }) => (
          <ColorPicker
            value={field.value || '#000000'}
            onChange={field.onChange}
            disabled={disabled}
            format={format}
            presets={presets}
            fieldId={name}
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

// Internal ColorPicker with beautiful popover
interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  format: ColorFormat
  presets: string[]
  fieldId: string
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  disabled,
  format,
  presets,
  fieldId,
}) => {
  const [recentColors, setRecentColors] = useState<string[]>([])

  // Common color palette (Material Design inspired)
  const palette = [
    ['#FFEBEE', '#FCE4EC', '#F3E5F5', '#EDE7F6', '#E8EAF6'],
    ['#E3F2FD', '#E1F5FE', '#E0F7FA', '#E0F2F1', '#E8F5E9'],
    ['#F1F8E9', '#F9FBE7', '#FFFDE7', '#FFF8E1', '#FFF3E0'],
    ['#FBE9E7', '#EFEBE9', '#FAFAFA', '#ECEFF1', '#CFD8DC'],
    
    ['#EF5350', '#EC407A', '#AB47BC', '#7E57C2', '#5C6BC0'],
    ['#42A5F5', '#29B6F6', '#26C6DA', '#26A69A', '#66BB6A'],
    ['#9CCC65', '#D4E157', '#FFEE58', '#FFCA28', '#FFA726'],
    ['#FF7043', '#8D6E63', '#BDBDBD', '#78909C', '#607D8B'],
    
    ['#C62828', '#AD1457', '#6A1B9A', '#4527A0', '#283593'],
    ['#1565C0', '#0277BD', '#00838F', '#00695C', '#2E7D32'],
    ['#558B2F', '#9E9D24', '#F9A825', '#FF8F00', '#EF6C00'],
    ['#D84315', '#4E342E', '#616161', '#455A64', '#37474F'],
  ]

  const handleColorSelect = (color: string) => {
    onChange(color)
    
    // Add to recent colors
    if (!recentColors.includes(color)) {
      setRecentColors([color, ...recentColors.slice(0, 9)])
    }
  }

  const toHex = (color: string): string => {
    if (!color) return '#000000'
    if (color.startsWith('#')) return color
    
    // Parse RGB
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
      return `#${r}${g}${b}`
    }
    
    return '#000000'
  }

  const fromHex = (hex: string, targetFormat: ColorFormat): string => {
    if (!hex || hex.length !== 7) return hex

    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    if (targetFormat === 'rgb') {
      return `rgb(${r}, ${g}, ${b})`
    }

    if (targetFormat === 'hsl') {
      const rNorm = r / 255
      const gNorm = g / 255
      const bNorm = b / 255
      
      const max = Math.max(rNorm, gNorm, bNorm)
      const min = Math.min(rNorm, gNorm, bNorm)
      let h = 0
      let s = 0
      const l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break
          case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break
          case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break
        }
      }

      return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
    }

    return hex
  }

  const currentHex = toHex(value)

  return (
    <Stack spacing="sm">
      <Popover className="relative">
        {({ open }) => (
          <>
            <div className="flex items-center gap-2">
              {/* Color preview button */}
              <Popover.Button
                disabled={disabled}
                className="min-h-[48px] min-w-[48px] rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative"
                style={{ backgroundColor: currentHex }}
              >
                {/* Checkerboard for transparency */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                  }}
                />
              </Popover.Button>

              {/* Text input */}
              <input
                id={fieldId}
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="flex-1 rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 min-h-[48px] font-mono"
                placeholder={format === 'hex' ? '#000000' : format === 'rgb' ? 'rgb(0, 0, 0)' : 'hsl(0, 0%, 0%)'}
              className="min-h-[48px] min-w-[48px] rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative"
              style={{ backgroundColor: currentHex }}
            >
              {/* Checkerboard for transparency */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                }}
              />
            </Popover.Button>

            {/* Text input */}
            <input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="flex-1 rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 min-h-[48px] font-mono"
              placeholder={format === 'hex' ? '#000000' : format === 'rgb' ? 'rgb(0, 0, 0)' : 'hsl(0, 0%, 0%)'}
            />

            {/* Format badge */}
            <span className="text-xs font-semibold text-gray-600 uppercase px-3 py-2 bg-gray-100 rounded-md">
              {format}
            </span>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 mt-2 w-80">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white p-4">
                <Tab.Group>
                  <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-4">
                    <Tab className={({ selected }) =>
                      `w-full rounded-md py-2 text-sm font-medium leading-5 transition-all
                       ${selected 
                         ? 'bg-white text-blue-600 shadow'
                         : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                       }`
                    }>
                      Palette
                    </Tab>
                    <Tab className={({ selected }) =>
                      `w-full rounded-md py-2 text-sm font-medium leading-5 transition-all
                       ${selected 
                         ? 'bg-white text-blue-600 shadow'
                         : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                       }`
                    }>
                      Custom
                    </Tab>
                  </Tab.List>

                  <Tab.Panels>
                    {/* Palette Tab */}
                    <Tab.Panel>
                      <Stack spacing="lg">
                        {/* Presets */}
                        {presets.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-2">Presets</Stack>
                            <div className="grid grid-cols-13 gap-1">
                              {presets.map((color, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleColorSelect(color)}
                                  className="w-6 h-6 rounded border-2 border-gray-200 hover:border-blue-400 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Color Palette Grid */}
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-2">Colors</div>
                          <Stack spacing="sm">
                            {palette.map((row, i) => (
                              <div key={i} className="flex gap-1">
                                {row.map((color, j) => (
                                  <button
                                    key={j}
                                    type="button"
                                    onClick={() => handleColorSelect(color)}
                                    className="w-full h-8 rounded border-2 border-transparent hover:border-blue-400 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </Stack>
                            ))}
                          </div>
                        </div>

                        {/* Recent Colors */}
                        {recentColors.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-2">Recent</div>
                            <div className="flex gap-1 flex-wrap">
                              {recentColors.map((color, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleColorSelect(color)}
                                  className="w-8 h-8 rounded border-2 border-gray-200 hover:border-blue-400 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Tab.Panel>

                    {/* Custom Tab */}
                    <Tab.Panel>
                      <Stack spacing="lg">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pick any color
                          </label>
                          <input
                            type="color"
                            value={currentHex}
                            onChange={(e) => handleColorSelect(fromHex(e.target.value, format))}
                            className="w-full h-32 rounded-md cursor-pointer"
                          />
                        </Stack>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Hex Value
                          </label>
                          <input
                            type="text"
                            value={currentHex}
                            onChange={(e) => handleColorSelect(fromHex(e.target.value, format))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
