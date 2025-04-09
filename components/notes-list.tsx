"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2, Share2, FolderOpen, Lock, Unlock, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { deleteNote, updateNote } from "@/lib/actions/note-actions"
import { toast } from "sonner"
import { ShareDialog } from "@/components/share-dialog"
import type { Note } from "@/lib/types"
import { NotesListSkeleton } from "./notes-list-skeleton"

interface NotesListProps {
  notes: Note[]
  isLoading?: boolean
}

export function NotesList({ notes, isLoading = false }: NotesListProps) {
  const router = useRouter()
  const [shareDialogNote, setShareDialogNote] = useState<Note | null>(null)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [updatingNoteId, setUpdatingNoteId] = useState<string | null>(null)

  const handleDelete = async (noteId: string) => {
    try {
      setDeletingNoteId(noteId)
      await deleteNote(noteId)
      toast.success("Note deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete note")
      console.error("Error deleting note:", error)
    } finally {
      setDeletingNoteId(null)
    }
  }

  const togglePublic = async (note: Note) => {
    try {
      setUpdatingNoteId(note._id)
      await updateNote(note._id, { isPublic: !note.isPublic })
      toast.success(`Note is now ${!note.isPublic ? "public" : "private"}`)
      router.refresh()
    } catch (error) {
      toast.error("Failed to update note")
      console.error("Error updating note:", error)
    } finally {
      setUpdatingNoteId(null)
    }
  }

  if (isLoading) {
    return <NotesListSkeleton />
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card key={note._id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-1 text-lg">
                  <Link href={`/notes/${note._id}`} className="hover:underline">
                    {note.title}
                  </Link>
                </CardTitle>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2">
                      {updatingNoteId === note._id || deletingNoteId === note._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => togglePublic(note)}
                      disabled={updatingNoteId === note._id || deletingNoteId === note._id}
                    >
                      {note.isPublic ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Make Public
                        </>
                      )}
                    </DropdownMenuItem>
                    {note.isPublic && (
                      <DropdownMenuItem
                        onClick={() => setShareDialogNote(note)}
                        disabled={updatingNoteId === note._id || deletingNoteId === note._id}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(note._id)}
                      disabled={updatingNoteId === note._id || deletingNoteId === note._id}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pb-2 flex-1">
              <p className="text-muted-foreground line-clamp-3">{note.content || "No content"}</p>
            </CardContent>

            <CardFooter className="flex flex-col items-start pt-2 space-y-2">
              <div className="flex flex-wrap gap-1">
                {note.tags?.map((tag) => (
                  <Badge key={tag._id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  {note.isPublic ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  <span>{note.isPublic ? "Public" : "Private"}</span>
                </div>

                <div className="flex items-center gap-1">
                  {note.category && (
                    <div className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      <span>{note.category.name}</span>
                    </div>
                  )}
                </div>

                <div>{note.updatedAt && formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {shareDialogNote && (
        <ShareDialog
          noteId={shareDialogNote._id}
          isOpen={!!shareDialogNote}
          onOpenChange={() => setShareDialogNote(null)}
          isPublic={shareDialogNote.isPublic}
        />
      )}
    </>
  )
}
