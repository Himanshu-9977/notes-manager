import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { TagManager } from "@/components/tag-manager"
import { getTags } from "@/lib/actions/tag-actions"

export default async function TagsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const tags = await getTags(userId)

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Manage Tags</h1>
      <TagManager tags={tags} />
    </div>
  )
}
