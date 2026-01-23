"use client"

import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SortDirection,SortField, SortOption } from "@/types"

interface SortSelectorProps {
  sorts: SortOption[]
  onSortsChange: (sorts: SortOption[]) => void
}

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: "SubTribe", label: "SubTribe" },
  { value: "{issue id}", label: "Issue ID" },
  { value: "{Story Points}", label: "Story Points" },
  { value: "State", label: "State" },
]

const MAX_SORTS = 4

export function SortSelector({ sorts, onSortsChange }: SortSelectorProps) {
  const handleAddSort = () => {
    if (sorts.length >= MAX_SORTS) return
    onSortsChange([...sorts, { field: "SubTribe", direction: "asc" }])
  }

  const handleRemoveSort = (index: number) => {
    onSortsChange(sorts.filter((_, i) => i !== index))
  }

  const handleUpdateSort = (
    index: number,
    updates: Partial<SortOption>
  ) => {
    const newSorts = [...sorts]
    newSorts[index] = { ...newSorts[index], ...updates }
    onSortsChange(newSorts)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Sort By</label>

      <div className="space-y-2">
        {sorts.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2 border rounded-md">
            No sorts applied
          </div>
        ) : (
          sorts.map((sort, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={sort.field}
                onValueChange={(value) =>
                  handleUpdateSort(index, { field: value as SortField })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sort.direction}
                onValueChange={(value) =>
                  handleUpdateSort(index, { direction: value as SortDirection })
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveSort(index)}
                className="h-10 w-10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}

        {sorts.length < MAX_SORTS && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSort}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sort
          </Button>
        )}
      </div>
    </div>
  )
}
