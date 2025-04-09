import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { NotePreferences } from "@/components/note-preferences"

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6">
        <NotePreferences />
      </div>
    </div>
  )
}
