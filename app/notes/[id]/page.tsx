import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { NoteEditor } from "@/components/note-editor"
import { getNote } from "@/lib/actions/note-actions"

export default async function NotePage({ params }: { params: { id: string } }) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const note = await getNote(params.id)

  if (!note || (note.userId !== userId && !note.isPublic)) {
    notFound()
  }

  const isOwner = note.userId === userId

  return (
    <div className="container py-6">
      <NoteEditor note={note} isOwner={isOwner} />
    </div>
  )
}
