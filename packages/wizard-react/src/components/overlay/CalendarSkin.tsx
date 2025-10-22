/**
 * CalendarSkin - Centralized DayPicker Wrapper
 * 
 * Single source of truth for all calendar styling.
 * Fields ONLY pass state - no classNames, no CSS imports.
 * 
 * Future calendar changes (colors, spacing, animations) happen HERE.
 */

import React from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'

export interface CalendarSkinProps {
  mode: 'single' | 'range'
  selected: Date | DateRange | undefined
  onSelect: (value: any) => void
  disabled?: any
  fromDate?: Date
  toDate?: Date
  numberOfMonths?: 1 | 2
  
  // Range preview hooks (for hover effects)
  onPreviewEnter?: (date: Date) => void
  onPreviewLeave?: () => void
}

export const CalendarSkin: React.FC<CalendarSkinProps> = ({
  mode,
  selected,
  onSelect,
  disabled,
  fromDate,
  toDate,
  numberOfMonths = 1,
  onPreviewEnter,
  onPreviewLeave,
}) => {
  // Centralized classNames for DayPicker
  const classNames = {
    day: 'fs-day',
    day_selected: 'fs-selected',
    day_today: 'fs-today',
    day_disabled: 'fs-disabled',
    day_range_start: 'fs-range-start',
    day_range_end: 'fs-range-end',
    day_range_middle: 'fs-range-middle',
  }

  if (mode === 'single') {
    return (
      <div className="ds-calendar flex justify-center">
        <DayPicker
          mode="single"
          selected={selected as Date}
          onSelect={onSelect}
          disabled={disabled}
          fromDate={fromDate}
          toDate={toDate}
          numberOfMonths={numberOfMonths}
          classNames={classNames}
        />
      </div>
    )
  }

  return (
    <div className="ds-calendar flex justify-center">
      <DayPicker
        mode="range"
        selected={selected as DateRange}
        onSelect={onSelect}
        disabled={disabled}
        fromDate={fromDate}
        toDate={toDate}
        numberOfMonths={numberOfMonths}
        classNames={classNames}
        // @ts-ignore - DayPicker types don't expose these but they work
        onDayMouseEnter={onPreviewEnter}
        onDayMouseLeave={onPreviewLeave}
      />
    </div>
  )
}
