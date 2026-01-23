'use client'

import { Card, CardContent } from "@/components/ui/card"

export function EmptyState() {
  return (
    <Card>
      <CardContent className="py-16">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            No Issues Found
          </h2>
          <p className="text-sm text-muted-foreground">
            This sprint has no issues yet
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
