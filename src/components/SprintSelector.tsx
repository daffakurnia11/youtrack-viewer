"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppStore } from "@/store"
import { Sprint } from "@/types"

interface SprintSelectorProps {
  sprints: Sprint[]
  selectedSprint: string | null
  onSprintChange: (sprintName: string) => void
  loading: boolean
}

export function SprintSelector({
  sprints,
  selectedSprint,
  onSprintChange,
  loading,
}: SprintSelectorProps) {
  const { queryUsername, setQueryUsername } = useAppStore()
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const sortedSprints = [...sprints].sort(
    (a, b) => (b.ordinal || 0) - (a.ordinal || 0)
  )

  return (
    <div className="space-y-4">
      {/* Query Username Input */}
      <div className="space-y-2">
        <label htmlFor="query-username" className="text-sm font-medium">
          Query Username
        </label>
        <Input
          id="query-username"
          type="text"
          value={queryUsername}
          onChange={(e) => setQueryUsername(e.target.value)}
          placeholder="daffakurniaf11"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Enter your username (e.g., daffakurniaf11)
        </p>
      </div>

      {/* Sprint Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Sprint</label>
        <Select
          value={selectedSprint || ""}
          onValueChange={onSprintChange}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loading ? "Loading..." : "Select a sprint"} />
          </SelectTrigger>
          <SelectContent>
            {sortedSprints.map((sprint) => (
              <SelectItem key={sprint.id} value={sprint.name}>
                {sprint.name} ({formatDate(sprint.start)} - {formatDate(sprint.finish)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
