import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { NoteEditor } from "@/components/note-editor"

export default async function NewNotePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="container py-6">
      <NoteEditor isOwner={true} />
    </div>
  )
}
