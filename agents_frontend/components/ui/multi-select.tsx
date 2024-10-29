"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function MultiSelect({options, handleSetValue, value}:{
    options:{value:string; label:string}[];
    handleSetValue:(val:string)=>void;
    value:string[];
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
        >
            <div className="flex gap-2 justify-start">
                {value?.length ?
                    value.map((val, i) => (
                        <div key={i} className="px-2 py-1 rounded-xl border bg-slate-200 text-xs font-medium">{options.find((option) => option.value === val)?.label}</div>
                    ))
                    : "Select framework..."}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
            <Command>
                <CommandInput placeholder="Search framework..." />
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                    <CommandList>
                        {options.map((option) => (
                            <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                                handleSetValue(option.value);
                            }}>
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    value.includes(option.value) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandList>
                </CommandGroup>
            </Command>
        </PopoverContent>
    </Popover>
  )

}
