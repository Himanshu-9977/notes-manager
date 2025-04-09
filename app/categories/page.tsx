import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { CategoryManager } from "@/components/category-manager"
import { getCategories } from "@/lib/actions/category-actions"

export default async function CategoriesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const categories = await getCategories(userId)

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>
      <CategoryManager categories={categories} />
    </div>
  )
}
