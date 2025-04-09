"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/category-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingButton } from "@/components/loading-button"
import type { Category } from "@/lib/types"

interface CategoryManagerProps {
  categories: Category[]
}

export function CategoryManager({ categories: initialCategories }: CategoryManagerProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return

    try {
      setIsAdding(true)
      setError(null)
      const category = await createCategory({ name: newCategory.trim() })
      setCategories([...categories, category])
      setNewCategory("")
      toast.success("Category created successfully")
    } catch (error) {
      console.error("Error creating category:", error)
      setError("Failed to create category. Please try again.")
      toast.error("Failed to create category")
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return

    try {
      const updatedCategory = await updateCategory(editingCategory._id, { name: editingCategory.name.trim() })

      setCategories(categories.map((cat) => (cat._id === updatedCategory._id ? updatedCategory : cat)))

      setEditingCategory(null)
      toast.success("Category updated successfully")
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("Failed to update category")
    }
  }

  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      setIsDeleting(true)
      await deleteCategory(categoryToDelete._id)
      setCategories(categories.filter((cat) => cat._id !== categoryToDelete._id))
      setCategoryToDelete(null)
      setDeleteConfirmOpen(false)
      toast.success("Category deleted successfully")
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Create and manage categories to organize your notes</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2 mb-6">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddCategory()
                }
              }}
              disabled={isAdding}
            />
            <LoadingButton onClick={handleAddCategory} isLoading={isAdding} loadingText="Adding...">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </LoadingButton>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                    No categories yet. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      {editingCategory?._id === category._id ? (
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleUpdateCategory()
                            } else if (e.key === "Escape") {
                              setEditingCategory(null)
                            }
                          }}
                          onBlur={handleUpdateCategory}
                        />
                      ) : (
                        category.name
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(category)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the category "{categoryToDelete?.name}". This action cannot be undone. Notes in this
              category will not be deleted, but they will no longer be categorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
