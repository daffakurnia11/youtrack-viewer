'use client'

import { Alert, AlertDescription } from "@/components/ui/alert"

interface ErrorStateProps {
  error: string
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        {error}
      </AlertDescription>
    </Alert>
  )
}
