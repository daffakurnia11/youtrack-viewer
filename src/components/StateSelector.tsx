"use client"

import { Check, ChevronDown, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { State } from "@/types"

interface StateSelectorProps {
  states: State[]
  selectedStateIds: string[]
  onStateChange: (stateIds: string[]) => void
}

export function StateSelector({
  states,
  selectedStateIds,
  onStateChange,
}: StateSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedStates = states.filter((s) => selectedStateIds.includes(s.id))
  const allSelected = states.length > 0 && selectedStateIds.length === states.length

  const handleToggleState = (stateId: string) => {
    const newSelected = selectedStateIds.includes(stateId)
      ? selectedStateIds.filter((id) => id !== stateId)
      : [...selectedStateIds, stateId]
    onStateChange(newSelected)
  }

  const handleToggleAll = () => {
    onStateChange(allSelected ? [] : states.map((s) => s.id))
  }

  const handleRemoveState = (stateId: string) => {
    onStateChange(selectedStateIds.filter((id) => id !== stateId))
  }

  const getDisplayText = () => {
    if (selectedStates.length === 0) return "All States"
    if (selectedStates.length === 1) return selectedStates[0].name
    return `${selectedStates.length} states selected`
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Filter by State</label>

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="w-full justify-between h-10 px-3 py-2 text-sm"
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ml-2 ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
              <div className="p-1">
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm"
                >
                  <div className="w-4 h-4 border rounded flex items-center justify-center">
                    {allSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span>
                    {allSelected ? "Clear All" : "Select All"}
                  </span>
                </button>

                <div className="my-1 border-t" />

                {states.map((state) => {
                  const isSelected = selectedStateIds.includes(state.id)
                  return (
                    <button
                      key={state.id}
                      type="button"
                      onClick={() => handleToggleState(state.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm"
                    >
                      <div className="w-4 h-4 border rounded flex items-center justify-center">
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span>{state.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedStates.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedStates.map((state) => (
            <span
              key={state.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
            >
              {state.name}
              <button
                type="button"
                onClick={() => handleRemoveState(state.id)}
                className="hover:bg-secondary-50 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
