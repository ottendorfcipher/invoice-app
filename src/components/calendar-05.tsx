"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import styles from "./calendar-05.module.css"

interface Calendar05Props {
  selected?: DateRange | undefined
  onSelect?: (range: DateRange | undefined) => void
  className?: string
}

export default function Calendar05({ selected, onSelect, className }: Calendar05Props) {
  const handleSelect = (range: DateRange | undefined) => {
    // If clicking on the same date that's already selected as 'from', deselect it
    if (selected?.from && range?.from && !range?.to && 
        selected.from.toDateString() === range.from.toDateString()) {
      onSelect?.(undefined)
      return
    }
    
    // If clicking on the same date that's already selected as 'to', deselect the range
    if (selected?.to && range?.from && !range?.to && 
        selected.to.toDateString() === range.from.toDateString()) {
      onSelect?.(undefined)
      return
    }
    
    onSelect?.(range)
  }

  return (
    <div className={styles.calendar}>
      <Calendar
        mode="range"
        defaultMonth={selected?.from || new Date()}
        selected={selected}
        onSelect={handleSelect}
        numberOfMonths={2}
        className={`rounded-lg border shadow-sm ${className || ''}`}
      classNames={{
        day_range_start: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
        day_range_end: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
        day_range_middle: "bg-blue-200 text-blue-900 hover:bg-blue-300",
        day_selected: "bg-blue-500 text-white hover:bg-blue-600 border-blue-500",
        day: "hover:bg-gray-100 focus:bg-white focus:outline-none focus:ring-0 focus:border-none active:outline-none",
        day_today: "bg-gray-100 text-gray-900 font-medium",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-400 opacity-50",
        day_hidden: "invisible"
      }}
      style={{
        '--rdp-cell-size': '40px',
        '--rdp-accent-color': 'transparent',
        '--rdp-background-color': 'transparent'
      } as React.CSSProperties}
      />
    </div>
  )
}
