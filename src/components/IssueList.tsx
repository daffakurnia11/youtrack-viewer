import { Issue } from "@/types"

import { EmptyState } from "./EmptyState"
import { IssueCard } from "./IssueCard"

interface IssueListProps {
  issues: Issue[]
  selectedSprint: string | null
}

export function IssueList({ issues, selectedSprint }: IssueListProps) {
  if (issues.length === 0 && selectedSprint) {
    return <EmptyState />
  }

  if (issues.length === 0) return null

  return (
    <div className="grid gap-4">
      {issues.map((issue) => (
        <IssueCard key={issue.idReadable || issue.id} issue={issue} />
      ))}
    </div>
  )
}
