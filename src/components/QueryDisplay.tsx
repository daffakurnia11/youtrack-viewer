"use client"

import { Check,Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface QueryDisplayProps {
  query: string
}

export function QueryDisplay({ query }: QueryDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(query)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (!query) {
    return null
  }

  return (
    <Card className="mb-4">
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Query Payload</h3>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="bg-muted p-3 rounded-md font-mono text-xs break-all">
          {query}
        </div>
      </CardContent>
    </Card>
  )
}
