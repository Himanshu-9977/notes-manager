"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Share2, Save, Trash2, Plus, AlertCircle } from "lucide-react"
import { createNote, updateNote, deleteNote } from "@/lib/actions/note-actions"
import { getTags } from "@/lib/actions/tag-actions"
import { getCategories } from "@/lib/actions/category-actions"
import { ShareDialog } from "@/components/share-dialog"
import { LoadingButton } from "@/components/loading-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Note, Tag, Category } from "@/lib/types"

const AUTOSAVE_DELAY = 2000 // 2 seconds

interface NoteEditorProps {
  note?: Note
  isOwner: boolean
}

// Preferences key for local storage
const PREFERENCES_KEY = 'note-manager-preferences'

export function NoteEditor({ note, isOwner }: NoteEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  // Initialize isPublic from note or from preferences for new notes
  const [isPublic, setIsPublic] = useState<boolean>(() => {
    if (note?.isPublic !== undefined) {
      return note.isPublic
    }
    // For new notes, check preferences
    try {
      const savedPrefs = typeof window !== 'undefined' ? localStorage.getItem(PREFERENCES_KEY) : null
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs)
        return prefs.publicByDefault || false
      }
    } catch (e) {
      console.error('Error reading preferences:', e)
    }
    return false // Default to private if no preferences
  })
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags?.map((t) => t._id) || [])
  const [selectedCategory, setSelectedCategory] = useState<string>(note?.category?._id || "")
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  // Track if autosave is enabled from preferences
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(() => {
    try {
      const savedPrefs = typeof window !== 'undefined' ? localStorage.getItem(PREFERENCES_KEY) : null
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs)
        return prefs.autosave !== undefined ? prefs.autosave : true
      }
    } catch (e) {
      console.error('Error reading preferences:', e)
    }
    return true // Default to enabled if no preferences
  })

  useEffect(() => {
    const loadData = async () => {
      if (isOwner) {
        try {
          setIsLoading(true)
          setError(null)
          const [tagsData, categoriesData] = await Promise.all([getTags(), getCategories()])
          setTags(tagsData)
          setCategories(categoriesData)
        } catch (err) {
          console.error("Failed to load data:", err)
          setError("Failed to load tags and categories. Please refresh the page.")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [isOwner])

  // Effect to check for preference changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedPrefs = localStorage.getItem(PREFERENCES_KEY)
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs)
          setAutosaveEnabled(prefs.autosave !== undefined ? prefs.autosave : true)
        }
      } catch (e) {
        console.error('Error reading preferences:', e)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Autosave effect
  useEffect(() => {
    if (!isOwner) return

    // Only enable autosave for existing notes and if autosave is enabled in preferences
    if (isDirty && note?._id && autosaveEnabled) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }

      autosaveTimerRef.current = setTimeout(() => {
        // Only autosave if we have an existing note
        if (note?._id) {
          console.log('Autosaving note...')
          handleSave(false) // Pass false to indicate this is an autosave
        }
      }, AUTOSAVE_DELAY)
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [title, content, isPublic, selectedTags, selectedCategory, isDirty, note?._id, autosaveEnabled])

  const handleContentChange = (value: string) => {
    setContent(value)
    setIsDirty(true)
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    setIsDirty(true)
  }

  const handleTagsChange = (tagId: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
    setIsDirty(true)
  }

  const handleCategoryChange = (categoryId: string) => {
    // If 'none' is selected, set to empty string
    setSelectedCategory(categoryId === 'none' ? '' : categoryId)
    setIsDirty(true)
  }

  const handlePublicChange = (checked: boolean) => {
    console.log('Setting isPublic to:', checked)
    setIsPublic(checked)
    setIsDirty(true)

    // If we have an existing note, update it immediately to ensure visibility changes are saved
    if (note?._id) {
      // Create a minimal update with just the visibility change
      updateNote(note._id, { isPublic: checked })
        .then(updatedNote => {
          console.log('Visibility updated successfully:', updatedNote.isPublic)
          toast.success(`Note is now ${checked ? 'public' : 'private'}`)
        })
        .catch(error => {
          console.error('Failed to update visibility:', error)
          toast.error('Failed to update visibility')
          // Revert the UI state if the update failed
          setIsPublic(!checked)
        })
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    try {
      // Import the createTag function if not already imported
      // import { createTag } from "@/lib/actions/tag-actions";

      // For now, just simulate adding a tag locally
      const tempTag = { _id: `new-${Date.now()}`, name: newTag.trim(), userId: "" }
      setTags([...tags, tempTag])

      // Also add it to selected tags
      setSelectedTags([...selectedTags, tempTag._id])

      setNewTag("")
      setIsDirty(true)
    } catch (error) {
      console.error("Error adding tag:", error)
      toast.error("Failed to create tag")
    }
  }

  const handleSave = async (shouldRedirect: boolean = true) => {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const noteData = {
        title: title.trim(),
        content,
        isPublic,
        tags: selectedTags.filter(tag => tag && !tag.startsWith('new-')),
        category: selectedCategory && selectedCategory !== 'none' ? selectedCategory : undefined,
      }

      console.log('Saving note with data:', noteData)

      if (note?._id) {
        // Update existing note
        const updatedNote = await updateNote(note._id, noteData)
        console.log('Note updated successfully:', updatedNote)

        // Make sure isPublic was properly updated
        if (updatedNote && updatedNote.isPublic !== isPublic) {
          console.log('Visibility mismatch, updating state:', updatedNote.isPublic)
          setIsPublic(updatedNote.isPublic)
        }

        toast.success("Note updated successfully")
      } else {
        // Only create a new note if this is an explicit save (not autosave)
        try {
          const newNote = await createNote(noteData)
          console.log('New note created:', newNote)
          if (newNote && newNote._id) {
            // Only redirect if shouldRedirect is true (manual save)
            if (shouldRedirect) {
              router.push(`/notes/${newNote._id}`)
            }
            toast.success("Note created successfully")
          } else {
            throw new Error('Failed to get new note ID')
          }
        } catch (createError) {
          console.error('Error in createNote:', createError)
          setError(createError instanceof Error ? createError.message : 'Failed to create note')
          throw createError
        }
      }

      setIsDirty(false)
    } catch (error) {
      console.error("Error saving note:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save note")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!note?._id) return

    try {
      setIsDeleting(true)
      await deleteNote(note._id)
      router.push("/")
      toast.success("Note deleted successfully")
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Failed to delete note")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOwner) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{note?.title}</h1>
        <div className="prose dark:prose-invert max-w-none">{note?.content}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title"
          className="text-2xl font-bold border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
        />

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {note?._id && (
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
              disabled={!isPublic || isSaving || isDeleting}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </LoadingButton>
          )}

          <LoadingButton
            variant="default"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Saving..."
            disabled={!isDirty || isDeleting}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </LoadingButton>

          {note?._id && (
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              loadingText="Deleting..."
              disabled={isSaving}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </LoadingButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4 md:gap-6">
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing your note..."
            className="min-h-[300px] sm:min-h-[400px] resize-none"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="public">Public Note</Label>
              <Switch id="public" checked={isPublic} onCheckedChange={handlePublicChange} />
            </div>
            <p className="text-sm text-muted-foreground">Public notes can be shared with anyone</p>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="animate-pulse">
                  Loading tags...
                </Badge>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag._id}
                    variant={selectedTags.includes(tag._id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagsChange(tag._id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <LoadingButton variant="outline" size="icon" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      {note?._id && (
        <ShareDialog
          noteId={note._id}
          isOpen={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          isPublic={isPublic}
        />
      )}
    </div>
  )
}
