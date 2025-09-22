"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Pilot } from "@/lib/firestore"

interface PilotSearchComboboxProps {
  pilots: Pilot[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  className?: string
  includeNoneOption?: boolean
  noneOptionLabel?: string
  noneOptionValue?: string
}

export function PilotSearchCombobox({
  pilots,
  value,
  onValueChange,
  placeholder,
  className,
  includeNoneOption = false,
  noneOptionLabel = "Ninguno",
  noneOptionValue = "none"
}: PilotSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const getPilotDisplayName = (pilotId: string) => {
    if (includeNoneOption && pilotId === noneOptionValue) {
      return noneOptionLabel
    }
    const pilot = pilots.find(p => p.id === pilotId)
    return pilot ? `${pilot.name} (#${pilot.number}) - ${pilot.team}` : ''
  }

  const getDisplayValue = () => {
    if (!value) return placeholder
    return getPilotDisplayName(value)
  }

  // Filter pilots based on input value (autocomplete behavior)
  const filteredPilots = React.useMemo(() => {
    if (!inputValue) return pilots
    
    const searchTerm = inputValue.toLowerCase()
    return pilots.filter(pilot => 
      pilot.name.toLowerCase().includes(searchTerm) ||
      pilot.team.toLowerCase().includes(searchTerm) ||
      pilot.number.toString().includes(searchTerm)
    )
  }, [pilots, inputValue])

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setOpen(false)
    setInputValue("") // Clear input after selection
  }

  // Handle input change
  const handleInputChange = (newInputValue: string) => {
    setInputValue(newInputValue)
    if (!open) {
      setOpen(true) // Open dropdown when typing
    }
  }

  // Handle open change
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setInputValue("") // Clear input when closing
    }
  }

  // Clear selection
  const handleClear = () => {
    onValueChange("")
    setInputValue("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          onClick={() => setOpen(!open)}
        >
          <span className={cn(
            "truncate",
            !value && "text-muted-foreground"
          )}>
            {getDisplayValue()}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar piloto..." 
            value={inputValue}
            onValueChange={handleInputChange}
            className="h-9"
          />
          <CommandList className="max-h-[200px] overflow-auto">
            <CommandEmpty>
              {inputValue ? 
                `No se encontraron pilotos que coincidan con "${inputValue}"` : 
                "No se encontró ningún piloto."
              }
            </CommandEmpty>
            <CommandGroup>
              {includeNoneOption && (
                (!inputValue || noneOptionLabel.toLowerCase().includes(inputValue.toLowerCase())) && (
                  <CommandItem
                    value={noneOptionValue}
                    onSelect={() => handleSelect(noneOptionValue)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === noneOptionValue ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {noneOptionLabel}
                  </CommandItem>
                )
              )}
              {filteredPilots.map((pilot) => (
                <CommandItem
                  key={pilot.id}
                  value={pilot.id!}
                  onSelect={() => handleSelect(pilot.id!)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === pilot.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">#{pilot.number} - {pilot.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {pilot.team}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {value && (
            <div className="border-t p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                Limpiar selección
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}