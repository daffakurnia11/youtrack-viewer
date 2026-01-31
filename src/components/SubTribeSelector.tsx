"use client"

import { Check, ChevronDown, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { SubTribe } from "@/types"

interface SubTribeSelectorProps {
  subtribes: SubTribe[]
  selectedSubtribeIds: string[]
  onSubtribeChange: (subtribeIds: string[]) => void
}

export function SubTribeSelector({
  subtribes,
  selectedSubtribeIds,
  onSubtribeChange,
}: SubTribeSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedSubtribes = subtribes.filter((s) => selectedSubtribeIds.includes(s.id))
  const allSelected =
    subtribes.length > 0 && selectedSubtribeIds.length === subtribes.length

  const handleToggleSubtribe = (subtribeId: string) => {
    const newSelected = selectedSubtribeIds.includes(subtribeId)
      ? selectedSubtribeIds.filter((id) => id !== subtribeId)
      : [...selectedSubtribeIds, subtribeId]
    onSubtribeChange(newSelected)
  }

  const handleToggleAll = () => {
    onSubtribeChange(allSelected ? [] : subtribes.map((s) => s.id))
  }

  const handleRemoveSubtribe = (subtribeId: string) => {
    onSubtribeChange(selectedSubtribeIds.filter((id) => id !== subtribeId))
  }

  const getDisplayText = () => {
    if (selectedSubtribes.length === 0) return "All SubTribes"
    if (selectedSubtribes.length === 1) return selectedSubtribes[0].name
    return `${selectedSubtribes.length} subtribes selected`
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Filter by SubTribe</label>

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

                {subtribes.map((subtribe) => {
                  const isSelected = selectedSubtribeIds.includes(subtribe.id)
                  return (
                    <button
                      key={subtribe.id}
                      type="button"
                      onClick={() => handleToggleSubtribe(subtribe.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm"
                    >
                      <div className="w-4 h-4 border rounded flex items-center justify-center">
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span>{subtribe.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedSubtribes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedSubtribes.map((subtribe) => (
            <span
              key={subtribe.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
            >
              {subtribe.name}
              <button
                type="button"
                onClick={() => handleRemoveSubtribe(subtribe.id)}
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
