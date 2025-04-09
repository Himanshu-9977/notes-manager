import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  title: string
  description: string
  showNewNoteButton?: boolean
}

export function EmptyState({ title, description, showNewNoteButton = true }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1 mb-4">{description}</p>

      {showNewNoteButton && (
        <Button asChild>
          <Link href="/notes/new">Create a new note</Link>
        </Button>
      )}
    </div>
  )
}
