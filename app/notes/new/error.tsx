"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function NewNoteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error creating new note:", error)
  }, [error])

  return (
    <div className="container py-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Failed to create note</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn't create a new note. This might be due to a connection issue or a problem with the database.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go to notes</Link>
        </Button>
      </div>
    </div>
  )
}
