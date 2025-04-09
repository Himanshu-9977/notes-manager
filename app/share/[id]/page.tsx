import { notFound } from "next/navigation"
import { NoteViewer } from "@/components/note-viewer"
import { getNote } from "@/lib/actions/note-actions"

export default async function SharedNotePage({ params }: { params: { id: string } }) {
  const note = await getNote(params.id)

  // Log the note and its public status to help debug
  console.log('Shared note page:', params.id, note ? `isPublic: ${note.isPublic}` : 'Note not found')

  if (!note) {
    console.log('Note not found, redirecting to 404')
    notFound()
  }

  if (note.isPublic !== true) {
    console.log('Note is not public, redirecting to 404')
    notFound()
  }

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <NoteViewer note={note} />
    </div>
  )
}
