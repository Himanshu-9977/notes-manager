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
import { createTag, updateTag, deleteTag } from "@/lib/actions/tag-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingButton } from "@/components/loading-button"
import type { Tag } from "@/lib/types"

interface TagManagerProps {
  tags: Tag[]
}

export function TagManager({ tags: initialTags }: TagManagerProps) {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [newTag, setNewTag] = useState("")
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    try {
      setIsAdding(true)
      setError(null)
      const tag = await createTag({ name: newTag.trim() })
      setTags([...tags, tag])
      setNewTag("")
      toast.success("Tag created successfully")
    } catch (error) {
      console.error("Error creating tag:", error)
      setError("Failed to create tag. Please try again.")
      toast.error("Failed to create tag")
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return

    try {
      const updatedTag = await updateTag(editingTag._id, { name: editingTag.name.trim() })

      setTags(tags.map((tag) => (tag._id === updatedTag._id ? updatedTag : tag)))

      setEditingTag(null)
      toast.success("Tag updated successfully")
    } catch (error) {
      console.error("Error updating tag:", error)
      toast.error("Failed to update tag")
    }
  }

  const confirmDelete = (tag: Tag) => {
    setTagToDelete(tag)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteTag = async () => {
    if (!tagToDelete) return

    try {
      setIsDeleting(true)
      await deleteTag(tagToDelete._id)
      setTags(tags.filter((tag) => tag._id !== tagToDelete._id))
      setTagToDelete(null)
      setDeleteConfirmOpen(false)
      toast.success("Tag deleted successfully")
    } catch (error) {
      console.error("Error deleting tag:", error)
      toast.error("Failed to delete tag")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Create and manage tags to organize your notes</CardDescription>
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
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag name"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              disabled={isAdding}
            />
            <LoadingButton onClick={handleAddTag} isLoading={isAdding} loadingText="Adding...">
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
              {tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                    No tags yet. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag) => (
                  <TableRow key={tag._id}>
                    <TableCell>
                      {editingTag?._id === tag._id ? (
                        <Input
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleUpdateTag()
                            } else if (e.key === "Escape") {
                              setEditingTag(null)
                            }
                          }}
                          onBlur={handleUpdateTag}
                        />
                      ) : (
                        tag.name
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingTag(tag)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(tag)}>
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
              This will delete the tag "{tagToDelete?.name}". This action cannot be undone. Notes with this tag will not
              be deleted, but they will no longer have this tag.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
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
