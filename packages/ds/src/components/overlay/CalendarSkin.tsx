/**
 * CalendarSkin - Centralized DayPicker Wrapper
 * 
 * Single source of truth for all calendar styling.
 * Fields ONLY pass state - no classNames, no CSS imports.
 * 
 * Uses ds-calendar.css with ARIA/role/data selectors.
 * Future calendar changes (colors, spacing, animations) happen in ONE CSS file.
 */

import React from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import './ds-calendar.tokens.css'
import './ds-calendar.css'

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
  // Modifiers to add data attributes for CSS targeting
  // DayPicker will apply these as classes, which we target with [class*="data-"] selectors
  const rangeSelection = mode === 'range' && selected && 'from' in selected ? selected : null
  
  const modifiers = {
    today: new Date(),
    rangeStart: rangeSelection?.from,
    rangeEnd: rangeSelection?.to,
    // rangeMiddle requires both dates to be defined
    rangeMiddle: rangeSelection?.from && rangeSelection?.to
      ? { after: rangeSelection.from, before: rangeSelection.to }
      : undefined,
  }

  const modifiersClassNames = {
    today: 'data-today',
    rangeStart: 'data-range-start',
    rangeEnd: 'data-range-end', 
    rangeMiddle: 'data-range-middle',
  }

  if (mode === 'single') {
    return (
      <div className="ds-calendar" data-months={numberOfMonths}>
        <DayPicker
          mode="single"
          selected={selected as Date}
          onSelect={onSelect}
          disabled={disabled}
          fromDate={fromDate}
          toDate={toDate}
          numberOfMonths={numberOfMonths}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
        />
      </div>
    )
  }

  return (
    <div className="ds-calendar" data-months={numberOfMonths}>
      <DayPicker
        mode="range"
        selected={selected as DateRange}
        onSelect={onSelect}
        disabled={disabled}
        fromDate={fromDate}
        toDate={toDate}
        numberOfMonths={numberOfMonths}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        // @ts-ignore - DayPicker types don't expose these but they work
        onDayMouseEnter={onPreviewEnter}
        onDayMouseLeave={onPreviewLeave}
      />
    </div>
  )
}
