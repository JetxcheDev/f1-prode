"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Calendar24Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Calendar24({ value, onChange, placeholder = "Seleccionar fecha y hora", className }: Calendar24Props) {
  const [open, setOpen] = React.useState(false)
  
  // Parse the datetime-local string to Date and time components
  const parseDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return { date: undefined, time: "10:30" };
    
    const dateObj = new Date(dateTimeString);
    const time = dateObj.toTimeString().slice(0, 5); // HH:MM format
    return { date: dateObj, time };
  };
  
  const { date: initialDate, time: initialTime } = parseDateTime(value);
  const [date, setDate] = React.useState<Date | undefined>(initialDate)
  const [time, setTime] = React.useState(initialTime)

  // Function to combine date and time into datetime-local format
  const handleDateTimeChange = (newDate?: Date, newTime?: string) => {
    if (newDate && newTime && onChange) {
      const [hours, minutes] = newTime.split(':');
      const combinedDate = new Date(newDate);
      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Format to datetime-local string (YYYY-MM-DDTHH:MM)
      const year = combinedDate.getFullYear();
      const month = String(combinedDate.getMonth() + 1).padStart(2, '0');
      const day = String(combinedDate.getDate()).padStart(2, '0');
      const hour = String(combinedDate.getHours()).padStart(2, '0');
      const minute = String(combinedDate.getMinutes()).padStart(2, '0');
      
      const dateTimeString = `${year}-${month}-${day}T${hour}:${minute}`;
      onChange(dateTimeString);
    }
  };

  // Update internal state when value prop changes
  React.useEffect(() => {
    const { date: newDate, time: newTime } = parseDateTime(value);
    setDate(newDate);
    setTime(newTime);
  }, [value]);

  return (
    <div className={`flex gap-4 ${className || ''}`}>
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Fecha
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString('es-ES') : placeholder}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                setOpen(false);
                handleDateTimeChange(selectedDate, time);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Hora
        </Label>
        <Input
          type="time"
          id="time-picker"
          value={time}
          onChange={(e) => {
            const newTime = e.target.value;
            setTime(newTime);
            handleDateTimeChange(date, newTime);
          }}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}