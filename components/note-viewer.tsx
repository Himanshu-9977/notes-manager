"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Copy, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Note } from "@/lib/types"

interface NoteViewerProps {
  note: Note
}

export function NoteViewer({ note }: NoteViewerProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success("Link copied to clipboard")

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{note.title}</h1>

        <Button size="sm" variant="outline" onClick={copyToClipboard}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{note.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span>{note.user?.name || "Anonymous"}</span>
        </div>

        <div>
          {note.updatedAt && (
            <time dateTime={note.updatedAt}>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</time>
          )}
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none">{note.content}</div>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <Badge key={tag._id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
