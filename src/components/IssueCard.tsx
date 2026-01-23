"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Issue } from "@/types"

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  const fields = issue.fields || []

  // Helper to safely get field value
  const getFieldValue = (index: number) => {
    const field = fields[index]
    return field?.value
  }

  // Get story point value - it can be a number directly or an object
  const getStoryPointValue = (index: number): string | number => {
    const value = getFieldValue(index)
    if (typeof value === "number") {
      return value
    }
    if (value && typeof value === "object" && "presentation" in value) {
      return value.presentation ?? "N/A"
    }
    if (value && typeof value === "object" && "name" in value) {
      return value.name ?? "N/A"
    }
    return "N/A"
  }

  // Get values based on issue type
  const isAJTI = issue.idReadable.startsWith("AJTI")
  const storyPoint = getStoryPointValue(isAJTI ? 9 : 6)
  const state = getFieldValue(1)
  const subTribe = getFieldValue(isAJTI ? 11 : 12)

  // Extract state name
  const stateName =
    state && typeof state === "object" && "name" in state ? state.name : "N/A"

  // Extract subtribe name
  const subTribeName =
    subTribe && typeof subTribe === "object" && "name" in subTribe
      ? subTribe.name
      : "N/A"

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="px-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {issue.idReadable || "N/A"}
            </span>
          </div>
        </div>

        <h3 className="text-base font-medium mb-3 leading-relaxed">
          {issue.summary || "No summary"}
        </h3>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">Story Point:</span>
            <span>{storyPoint}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">State:</span>
            <span>{stateName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">SubTribe:</span>
            <span>{subTribeName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Reporter:</span>
            <span>{issue.reporter?.fullName || issue.reporter?.name || "N/A"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
