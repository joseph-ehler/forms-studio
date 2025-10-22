/**
 * TimeField Component
 * 
 * Beautiful time picker with interval list popover.
 * Consistent 48px sizing, no responsive variants.
 * 
 * Features:
 * - Interval-based selection (15/30/60 min)
 * - 12/24 hour format
 * - Min/max constraints
 * - Scrollable list
 * - Keyboard navigation
 * - 48px input height
 * - Typography system
 */

import React, { Fragment } from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'
import { FormStack, FormGrid, Stack } from '../components'
import { resolveTypographyDisplay, getTypographyFromJSON } from './utils/typography-display'
import { mergeFieldConfig } from './utils/field-json-config'
import { OverlayPickerCore, OverlayPositioner, OverlaySheet, PickerFooter } from '../components/overlay'
import { useDeviceType } from '../hooks/useDeviceType'

export const TimeField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,
  placeholder: propPlaceholder,
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
    { label: propLabel, placeholder: propPlaceholder, required: propRequired, disabled: propDisabled, description: propDescription, typographyDisplay, typographyVariant },
    json,
    {}
  )
  
  const label = config.label
  const placeholder = config.placeholder
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  const description = config.description
  
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  
  const format = (config as any).format ?? '24'
  const format24 = format !== '12'
  const defaultValue = (config as any).defaultValue

  // Format time for display
  const formatTimeDisplay = (time24: string): string => {
    if (!time24) return ''
    
    if (format24) return time24
    
    const [hours, mins] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${String(mins).padStart(2, '0')} ${period}`
  }

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
        defaultValue={defaultValue}
        render={({ field }) => {
          const { isMobile } = useDeviceType()
          
          // Parse current time value
          const parseTime = (time24: string) => {
            if (!time24) return { hour: 0, minute: 0 }
            const [h, m] = time24.split(':').map(Number)
            return { hour: h, minute: m }
          }

          const currentTime = parseTime(field.value)
          const [use24Hour, setUse24Hour] = React.useState(format24)
          const [hour, setHour] = React.useState(currentTime.hour)
          const [minute, setMinute] = React.useState(currentTime.minute)

          // Convert 24h to display format
          const getDisplayHour = (h24: number): number => {
            if (use24Hour) return h24
            return h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
          }

          const getPeriod = (h24: number): string => {
            return h24 >= 12 ? 'PM' : 'AM'
          }

          const updateFieldValue = (newHour: number, newMinute: number) => {
            setHour(newHour)
            setMinute(newMinute)
            const time24 = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`
            field.onChange(time24)
          }

          const setPeriod = (isPM: boolean) => {
            const currentIsPM = hour >= 12
            if (isPM === currentIsPM) return
            const newHour = isPM ? (hour < 12 ? hour + 12 : hour) : (hour >= 12 ? hour - 12 : hour)
            updateFieldValue(newHour, minute)
          }

          const handleClear = () => {
            setHour(0)
            setMinute(0)
            field.onChange('00:00')
          }

          // Wheel Picker Component with Momentum Physics
          const WheelPicker = ({ value, onChange, max, label }: { value: number; onChange: (v: number) => void; max: number; label: string }) => {
            const [isDragging, setIsDragging] = React.useState(false)
            const [scrollOffset, setScrollOffset] = React.useState(0)
            const containerRef = React.useRef<HTMLDivElement>(null)
            
            // Physics state
            const velocityRef = React.useRef(0)
            const lastYRef = React.useRef(0)
            const lastTimeRef = React.useRef(0)
            const animationRef = React.useRef<number | null>(null)
            const momentumRef = React.useRef(false)
            const scrollOffsetRef = React.useRef(0)

            const itemHeight = 48
            const visibleItems = 5
            const centerIndex = Math.floor(visibleItems / 2)
            
            // Physics constants
            const friction = 0.95 // Deceleration factor
            const snapThreshold = 0.5 // Velocity below which we snap
            const minVelocity = 0.1 // Stop animation below this

            const normalizeValue = (v: number) => {
              let normalized = v
              while (normalized < 0) normalized += (max + 1)
              while (normalized > max) normalized -= (max + 1)
              return normalized
            }

            const getVisibleNumbers = () => {
              const numbers: number[] = []
              // Show more numbers for smoother scrolling
              for (let i = -5; i <= 5; i++) {
                let num = value + i
                num = normalizeValue(num)
                numbers.push(num)
              }
              return numbers
            }

            // Momentum animation loop
            const animate = React.useCallback(() => {
              if (!momentumRef.current) return

              // Apply friction
              velocityRef.current *= friction

              // Update scroll offset
              scrollOffsetRef.current += velocityRef.current
              setScrollOffset(scrollOffsetRef.current)

              // Check if we should stop
              if (Math.abs(velocityRef.current) < minVelocity) {
                momentumRef.current = false
                
                // Snap to nearest item
                const offsetSteps = scrollOffsetRef.current / itemHeight
                const targetValue = value + offsetSteps
                const snappedValue = Math.round(targetValue)
                const finalValue = normalizeValue(snappedValue)
                onChange(finalValue)
                scrollOffsetRef.current = 0
                setScrollOffset(0)
                
                return
              }

              // Check if we crossed a threshold during momentum
              const currentOffset = scrollOffsetRef.current / itemHeight
              const steps = Math.floor(Math.abs(currentOffset))
              
              if (steps >= 1) {
                const direction = currentOffset > 0 ? 1 : -1
                const newValue = normalizeValue(value + (direction * steps))
                onChange(newValue)
                scrollOffsetRef.current = scrollOffsetRef.current - (direction * steps * itemHeight)
                setScrollOffset(scrollOffsetRef.current)
              }

              animationRef.current = requestAnimationFrame(animate)
            }, [value, onChange, max])

            // Start momentum
            const startMomentum = () => {
              if (momentumRef.current) return
              momentumRef.current = true
              animationRef.current = requestAnimationFrame(animate)
            }

            // Stop momentum
            const stopMomentum = () => {
              momentumRef.current = false
              if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
              }
            }

            const handlePointerDown = (e: React.PointerEvent) => {
              stopMomentum()
              setIsDragging(true)
              lastYRef.current = e.clientY
              lastTimeRef.current = Date.now()
              velocityRef.current = 0
              e.currentTarget.setPointerCapture(e.pointerId)
            }

            const handlePointerMove = (e: React.PointerEvent) => {
              if (!isDragging) return
              
              const currentY = e.clientY
              const currentTime = Date.now()
              const deltaY = currentY - lastYRef.current
              const deltaTime = currentTime - lastTimeRef.current
              
              // Calculate velocity
              if (deltaTime > 0) {
                velocityRef.current = deltaY / deltaTime * 16 // Scale to ~60fps
              }
              
              // Update scroll offset smoothly (no value changes during drag)
              scrollOffsetRef.current += deltaY
              setScrollOffset(scrollOffsetRef.current)
              
              lastYRef.current = currentY
              lastTimeRef.current = currentTime
            }

            const handlePointerUp = (e: React.PointerEvent) => {
              setIsDragging(false)
              e.currentTarget.releasePointerCapture(e.pointerId)
              
              // Start momentum if velocity is significant
              if (Math.abs(velocityRef.current) > snapThreshold) {
                startMomentum()
              } else {
                // Snap to nearest - figure out which number is visually closest to center
                // The visually centered number is: value + (scrollOffset / itemHeight)
                const offsetSteps = scrollOffsetRef.current / itemHeight
                const targetValue = value + offsetSteps
                const snappedValue = Math.round(targetValue)
                const finalValue = normalizeValue(snappedValue)
                onChange(finalValue)
                scrollOffsetRef.current = 0
                setScrollOffset(0)
              }
            }

            // Cleanup
            React.useEffect(() => {
              return () => {
                stopMomentum()
              }
            }, [])

            const numbers = getVisibleNumbers()

            return (
              <div className="flex flex-col items-center">
                <div className="text-xs font-medium text-gray-500 mb-2">{label}</div>
                <div
                  ref={containerRef}
                  className="relative h-60 w-20 overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* Top fade */}
                  <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                  
                  {/* Numbers */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {numbers.map((num, idx) => {
                      // Calculate position: base position of this number relative to center value
                      const numberOffset = num - value
                      // Adjust for wrapping (e.g., 59 -> 0 or 0 -> 59)
                      let adjustedOffset = numberOffset
                      if (adjustedOffset > max / 2) adjustedOffset -= (max + 1)
                      if (adjustedOffset < -max / 2) adjustedOffset += (max + 1)
                      
                      // Apply scroll offset
                      const position = adjustedOffset - (scrollOffset / itemHeight)
                      const distance = Math.abs(position)
                      const opacity = distance < 0.5 ? 1 : distance < 1.5 ? 0.4 : distance < 2.5 ? 0.15 : 0.05
                      const scale = distance < 0.5 ? 1 : 0.75
                      const translateY = position * itemHeight

                      if (Math.abs(translateY) > 180) return null // Don't render far items

                      return (
                        <div
                          key={`${num}-${idx}`}
                          className="absolute flex items-center justify-center w-full"
                          style={{
                            height: `${itemHeight}px`,
                            transform: `translateY(${translateY}px) scale(${scale})`,
                            opacity,
                            pointerEvents: 'none',
                            transition: isDragging || momentumRef.current ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out',
                          }}
                        >
                          <span className="text-3xl font-bold text-gray-900">
                            {String(num).padStart(2, '0')}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Selection indicator */}
                  <div className="absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 border-y-2 border-blue-500 pointer-events-none" />
                  
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
                </div>
              </div>
            )
          }

          return (
            <OverlayPickerCore closeOnSelect={false}>
              {({ isOpen, open, close, triggerRef, contentRef }) => (
                <>
                  {/* Trigger Button */}
                  <button
                    ref={triggerRef as React.RefObject<HTMLButtonElement>}
                    type="button"
                    onClick={() => isOpen ? close() : open()}
                    disabled={disabled}
                    className="relative w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-3 text-left text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 flex items-center justify-between"
                  >
                    <span className={field.value ? 'text-gray-900' : 'text-gray-400'}>
                      {field.value ? formatTimeDisplay(field.value) : placeholder || 'Select time...'}
                    </span>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Mobile Sheet */}
                  {isMobile && isOpen && (
                    <OverlaySheet
                      open={isOpen}
                      onClose={() => close('outside')}
                      maxHeight={560}
                      aria-labelledby={`${name}-label`}
                      footer={
                        <PickerFooter
                          onClear={handleClear}
                          onDone={() => close('select')}
                          size="default"
                        />
                      }
                    >
                      <div ref={contentRef} className="p-4 space-y-4">
                        {/* Format Toggle */}
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                          <span className="text-sm font-medium text-gray-700">Time Format</span>
                          <button
                            type="button"
                            onClick={() => setUse24Hour(!use24Hour)}
                            className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
                          >
                            {use24Hour ? '24hr' : '12hr'}
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                        </div>

                        {/* Wheel Pickers */}
                        <div className="flex items-center justify-center gap-2">
                          <WheelPicker
                            value={use24Hour ? hour : getDisplayHour(hour)}
                            onChange={(v) => {
                              const newHour = use24Hour ? v : (getPeriod(hour) === 'PM' ? (v === 12 ? 12 : v + 12) : (v === 12 ? 0 : v))
                              updateFieldValue(newHour, minute)
                            }}
                            max={use24Hour ? 23 : 12}
                            label="Hour"
                          />
                          <div className="text-4xl font-bold text-gray-400 mt-6">:</div>
                          <WheelPicker
                            value={minute}
                            onChange={(v) => updateFieldValue(hour, v)}
                            max={59}
                            label="Minute"
                          />
                          {!use24Hour && (
                            <div className="flex flex-col items-center mt-6 ml-2">
                              <div className="inline-flex flex-col rounded-md shadow-sm border border-gray-300" role="group">
                                <button
                                  type="button"
                                  onClick={() => setPeriod(false)}
                                  className={`px-4 py-3 text-sm font-medium rounded-t-md transition-colors ${
                                    getPeriod(hour) === 'AM'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  AM
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPeriod(true)}
                                  className={`px-4 py-3 text-sm font-medium rounded-b-md border-t transition-colors ${
                                    getPeriod(hour) === 'PM'
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                  }`}
                                >
                                  PM
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </OverlaySheet>
                  )}

                  {/* Desktop Popover */}
                  {!isMobile && isOpen && (
                    <OverlayPositioner
                      open={isOpen}
                      anchor={triggerRef.current}
                      placement="bottom-start"
                      offset={6}
                      strategy="fixed"
                      sameWidth={false}
                      maxHeight={480}
                      collision={{ flip: true, shift: true, size: false }}
                    >
                      {({ refs, floatingStyles, EventWrapper }) => (
                        <div ref={refs.setFloating} style={floatingStyles}>
                          <EventWrapper 
                            className="z-50 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 flex flex-col overflow-hidden"
                            style={{ width: 'auto', minWidth: '320px' }}
                          >
                          <div ref={contentRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Format Toggle */}
                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                              <span className="text-sm font-medium text-gray-700">Time Format</span>
                              <button
                                type="button"
                                onClick={() => setUse24Hour(!use24Hour)}
                                className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
                              >
                                {use24Hour ? '24hr' : '12hr'}
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </button>
                            </div>

                            {/* Wheel Pickers */}
                            <div className="flex items-center justify-center gap-2">
                              <WheelPicker
                                value={use24Hour ? hour : getDisplayHour(hour)}
                                onChange={(v) => {
                                  const newHour = use24Hour ? v : (getPeriod(hour) === 'PM' ? (v === 12 ? 12 : v + 12) : (v === 12 ? 0 : v))
                                  updateFieldValue(newHour, minute)
                                }}
                                max={use24Hour ? 23 : 12}
                                label="Hour"
                              />
                              <div className="text-4xl font-bold text-gray-400 mt-6">:</div>
                              <WheelPicker
                                value={minute}
                                onChange={(v) => updateFieldValue(hour, v)}
                                max={59}
                                label="Minute"
                              />
                              {!use24Hour && (
                                <div className="flex flex-col items-center mt-6 ml-2">
                                  <div className="inline-flex flex-col rounded-md shadow-sm border border-gray-300" role="group">
                                    <button
                                      type="button"
                                      onClick={() => setPeriod(false)}
                                      className={`px-4 py-3 text-sm font-medium rounded-t-md transition-colors ${
                                        getPeriod(hour) === 'AM'
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-white text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      AM
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setPeriod(true)}
                                      className={`px-4 py-3 text-sm font-medium rounded-b-md border-t transition-colors ${
                                        getPeriod(hour) === 'PM'
                                          ? 'bg-blue-600 text-white border-blue-600'
                                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                      }`}
                                    >
                                      PM
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="shrink-0 border-t border-gray-200 p-4">
                            <PickerFooter
                              onClear={handleClear}
                              onDone={() => close('select')}
                              size="default"
                            />
                          </div>
                          </EventWrapper>
                        </div>
                      )}
                    </OverlayPositioner>
                  )}
                </>
              )}
            </OverlayPickerCore>
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
