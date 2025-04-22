"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function CalendarExamplesPage() {
  // Single date selection
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  
  // Date range selection
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })

  // Multiple dates selection
  const [selectedDays, setSelectedDays] = React.useState<Date[]>([new Date()])

  // Disabled dates example
  const disabledDays = [
    new Date(2024, 3, 15), // April 15, 2024
    { from: new Date(2024, 3, 20), to: new Date(2024, 3, 25) }, // April 20-25, 2024
  ]

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Calendar Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Single Date Selection */}
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-4 block">Single Date Selection</Label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Selected date: {date ? format(date, "PPP") : "None"}
          </p>
        </Card>

        {/* Date Range Selection */}
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-4 block">Date Range Selection</Label>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            className="rounded-md border"
            numberOfMonths={2}
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Selected range: {dateRange?.from ? (
              <>
                {format(dateRange.from, "PPP")} -{" "}
                {dateRange.to ? format(dateRange.to, "PPP") : "..."}
              </>
            ) : "None"}
          </p>
        </Card>

        {/* Multiple Dates Selection */}
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-4 block">Multiple Dates Selection</Label>
          <Calendar
            mode="multiple"
            selected={selectedDays}
            onSelect={setSelectedDays}
            className="rounded-md border"
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Selected dates: {selectedDays.length > 0 
              ? selectedDays.map(date => format(date, "PP")).join(", ")
              : "None"}
          </p>
        </Card>

        {/* Disabled Dates */}
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-4 block">Disabled Dates Example</Label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabledDays}
            className="rounded-md border"
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Some dates are disabled (April 15 and April 20-25, 2024)
          </p>
        </Card>
      </div>
    </div>
  )
} 