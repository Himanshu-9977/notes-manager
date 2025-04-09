"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/mongodb"
import { Note } from "@/lib/models/note"

export async function getNotes({
  userId,
  searchQuery,
  tag,
  category,
}: {
  userId: string
  searchQuery?: string
  tag?: string
  category?: string
}) {
  try {
    await connectToDatabase()

    const query: any = { userId }

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ]
    }

    if (tag) {
      // Convert string ID to ObjectId for proper querying
      const mongoose = await import('mongoose')
      const ObjectId = mongoose.Types.ObjectId
      try {
        // Check if it's a valid ObjectId
        if (mongoose.isValidObjectId(tag)) {
          query.tags = { $in: [new ObjectId(tag)] }
        }
      } catch (error) {
        console.error('Invalid tag ID format:', error)
      }
    }

    if (category) {
      // Convert string ID to ObjectId for proper querying
      const mongoose = await import('mongoose')
      const ObjectId = mongoose.Types.ObjectId
      try {
        // Check if it's a valid ObjectId
        if (mongoose.isValidObjectId(category)) {
          query.category = new ObjectId(category)
        }
      } catch (error) {
        console.error('Invalid category ID format:', error)
      }
    }

    const notes = await Note.find(query).populate("tags").populate("category").sort({ updatedAt: -1 }).lean()

    return notes.map((note: any) => ({
      ...note,
      _id: note._id.toString(),
      tags:
        note.tags?.map((tag: any) => ({
          ...tag,
          _id: tag._id.toString(),
        })) || [],
      category: note.category
        ? {
            ...note.category,
            _id: note.category._id.toString(),
          }
        : null,
    }))
  } catch (error) {
    console.error("Failed to get notes:", error)
    throw new Error("Failed to get notes. Please try again later.")
  }
}

export async function getNote(id: string) {
  try {
    await connectToDatabase()

    // Validate the ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid note ID format:", id)
      return null
    }

    // Remove the invalid user population
    const note = await Note.findById(id).populate("tags").populate("category").lean()

    if (!note) {
      console.log(`Note not found with ID: ${id}`)
      return null
    }

    return {
      ...note,
      _id: note._id.toString(),
      tags:
        note.tags?.map((tag: any) => ({
          ...tag,
          _id: tag._id.toString(),
        })) || [],
      category: note.category
        ? {
            ...note.category,
            _id: note.category._id.toString(),
          }
        : null,
      // User is not populated, so we don't need to transform it
    }
  } catch (error) {
    console.error("Failed to get note:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to get note: ${error.message}`)
    } else {
      throw new Error("Failed to get note. Please try again later.")
    }
  }
}

export async function createNote(data: {
  title: string
  content: string
  isPublic: boolean
  tags?: string[]
  category?: string
}) {
  try {
    console.log('Creating note with data:', JSON.stringify(data))
    await connectToDatabase()

    const { userId } = await auth()
    console.log('User ID:', userId)

    if (!userId) {
      throw new Error("Unauthorized")
    }

    // Validate required fields
    if (!data.title || !data.title.trim()) {
      throw new Error("Title is required")
    }

    // Prepare tags and category
    const noteData = {
      ...data,
      userId,
      // Handle temporary tags created in the UI
      tags: data.tags?.length ? data.tags.filter(tag => tag && !tag.startsWith('new-')) : [],
      // Set category to undefined if it's 'none' or empty
      category: data.category && data.category !== 'none' && data.category.trim() !== '' ? data.category : undefined
    }

    // If there are no valid tags, set to empty array to avoid MongoDB validation errors
    if (!noteData.tags || noteData.tags.length === 0) {
      noteData.tags = [];
    }

    console.log('Creating note with processed data:', JSON.stringify(noteData))
    const note = await Note.create(noteData)
    console.log('Note created successfully:', note._id.toString())

    revalidatePath("/")

    return {
      ...note.toObject(),
      _id: note._id.toString(),
    }
  } catch (error) {
    console.error("Failed to create note:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to create note: ${error.message}`)
    } else {
      throw new Error("Failed to create note. Please try again later.")
    }
  }
}

export async function updateNote(
  id: string,
  data: {
    title?: string
    content?: string
    isPublic?: boolean
    tags?: string[]
    category?: string
  },
) {
  try {
    console.log('Updating note with data:', JSON.stringify(data))
    await connectToDatabase()

    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    // Prepare update data
    const updateData = { ...data }

    // Explicitly handle isPublic flag to ensure it's properly set
    if (typeof updateData.isPublic === 'boolean') {
      console.log('Setting isPublic to:', updateData.isPublic)
    }

    // Handle tags and category
    if (updateData.tags && updateData.tags.length === 0) {
      updateData.tags = []
    }

    if (updateData.category === 'none' || updateData.category === '') {
      updateData.category = undefined
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    )

    if (!note) {
      throw new Error("Note not found or unauthorized")
    }

    console.log('Note updated successfully:', note._id.toString(), 'isPublic:', note.isPublic)

    revalidatePath("/")
    revalidatePath(`/notes/${id}`)
    revalidatePath(`/share/${id}`)

    return {
      ...note.toObject(),
      _id: note._id.toString(),
    }
  } catch (error) {
    console.error("Failed to update note:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to update note: ${error.message}`)
    } else {
      throw new Error("Failed to update note. Please try again later.")
    }
  }
}

export async function deleteNote(id: string) {
  try {
    await connectToDatabase()

    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const note = await Note.findOneAndDelete({ _id: id, userId })

    if (!note) {
      throw new Error("Note not found or unauthorized")
    }

    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete note:", error)
    throw new Error("Failed to delete note. Please try again later.")
  }
}
