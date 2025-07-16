"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"

interface Calendar04Props {
  selected?: DateRange | undefined
  onSelect?: (range: DateRange | undefined) => void
  className?: string
}

export default function Calendar04({ selected, onSelect, className }: Calendar04Props) {
  return (
    <Calendar
      mode="range"
      defaultMonth={selected?.from || new Date()}
      selected={selected}
      onSelect={onSelect}
      numberOfMonths={1}
      className={className}
    />
  )
}
