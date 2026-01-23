import { CardHeader, CardTitle } from "@/components/ui/card"

export function BoardHeader() {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">YouTrack Issues Viewer</CardTitle>
      <p className="text-sm text-muted-foreground">Board Employer Kanban</p>
    </CardHeader>
  )
}
