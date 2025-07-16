"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, isWithinInterval, isBefore, isAfter } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selected?: Date | { start: Date; end: Date } | null;
  onSelect?: (date: Date | { start: Date; end: Date }) => void;
  className?: string;
  mode?: "single" | "range";
}

export function Calendar({ selected, onSelect, className, mode = "single" }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    if (mode === "range") {
      if (!rangeStart) {
        // First click - set start date
        setRangeStart(date);
      } else {
        // Second click - complete the range
        const start = isBefore(date, rangeStart) ? date : rangeStart;
        const end = isBefore(date, rangeStart) ? rangeStart : date;
        
        if (onSelect) {
          onSelect({ start, end });
        }
        setRangeStart(null);
      }
    } else {
      if (onSelect) {
        onSelect(date);
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (mode !== "range") return false;
    
    if (selected && typeof selected === "object" && "start" in selected) {
      return isWithinInterval(date, { start: selected.start, end: selected.end });
    }
    
    if (rangeStart && hoveredDate) {
      const start = isBefore(hoveredDate, rangeStart) ? hoveredDate : rangeStart;
      const end = isBefore(hoveredDate, rangeStart) ? rangeStart : hoveredDate;
      return isWithinInterval(date, { start, end });
    }
    
    return false;
  };

  const isRangeStart = (date: Date) => {
    if (mode !== "range") return false;
    
    if (selected && typeof selected === "object" && "start" in selected) {
      return isSameDay(date, selected.start);
    }
    
    return rangeStart && isSameDay(date, rangeStart);
  };

  const isRangeEnd = (date: Date) => {
    if (mode !== "range") return false;
    
    if (selected && typeof selected === "object" && "end" in selected) {
      return isSameDay(date, selected.end);
    }
    
    return false;
  };

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={prevMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-sm font-medium">
            {format(currentDate, "MMMM yyyy")}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="p-2 text-gray-500 font-medium">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = mode === "single" ? (selected && isSameDay(day, selected as Date)) : false;
            const isTodayDate = isToday(day);
            const inRange = isDateInRange(day);
            const isStart = isRangeStart(day);
            const isEnd = isRangeEnd(day);

            return (
              <Button
                key={day.toISOString()}
                variant={isSelected || isStart || isEnd ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 text-sm",
                  !isCurrentMonth && "text-gray-400 opacity-50",
                  isTodayDate && !isSelected && !isStart && !isEnd && "bg-blue-100 text-blue-600",
                  (isSelected || isStart || isEnd) && "bg-blue-600 text-white hover:bg-blue-700",
                  inRange && !isStart && !isEnd && "bg-blue-200 text-blue-800 hover:bg-blue-300",
                  rangeStart && isSameDay(day, rangeStart) && "bg-blue-500 text-white"
                )}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {format(day, "d")}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
