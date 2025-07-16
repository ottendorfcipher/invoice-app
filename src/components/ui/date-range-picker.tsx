"use client";

import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "./calendar";
import { CalendarDays } from "lucide-react";

interface DateRangePickerProps {
  onRangeSelect?: (range: { start: Date; end: Date; type: 'day' | 'week' | 'month' }) => void;
  className?: string;
}

export function DateRangePicker({ onRangeSelect, className }: DateRangePickerProps) {
  const [selectedType, setSelectedType] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    let start: Date, end: Date;
    
    switch (selectedType) {
      case 'day':
        start = date;
        end = date;
        break;
      case 'week':
        start = startOfWeek(date);
        end = endOfWeek(date);
        break;
      case 'month':
        start = startOfMonth(date);
        end = endOfMonth(date);
        break;
    }
    
    if (onRangeSelect) {
      onRangeSelect({ start, end, type: selectedType });
    }
  };

  const handleTypeChange = (type: 'day' | 'week' | 'month') => {
    setSelectedType(type);
    handleDateSelect(selectedDate); // Recalculate range with new type
  };

  const getDateRangeDisplay = () => {
    switch (selectedType) {
      case 'day':
        return format(selectedDate, 'MMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Date Range Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Period Type</label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select period type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Selected Range</label>
          <div className="p-2 bg-gray-50 rounded text-sm">
            {getDateRangeDisplay()}
          </div>
        </div>

        <Calendar
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="border-0 shadow-none"
        />
      </CardContent>
    </Card>
  );
}
