import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { Suspense } from "react"
import { EmptyState } from "@/components/empty-state"
import { NotesList } from "@/components/notes-list"
import { NotesListSkeleton } from "@/components/notes-list-skeleton"
import { SearchAndFilters } from "@/components/search-and-filters"
import { getNotes } from "@/lib/actions/note-actions"

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; category?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const { q, tag, category } = searchParams

  // Log the filters for debugging
  console.log('Applying filters:', { q, tag, category })

  const notes = await getNotes({ userId, searchQuery: q, tag, category })

  return (
    <div className="container py-6 space-y-6">
      <SearchAndFilters />

      <Suspense fallback={<NotesListSkeleton />}>
        {notes.length > 0 ? (
          <NotesList notes={notes} />
        ) : (
          <EmptyState
            title="No notes found"
            description={q || tag || category ? "Try adjusting your filters" : "Create your first note to get started"}
          />
        )}
      </Suspense>
    </div>
  )
}
