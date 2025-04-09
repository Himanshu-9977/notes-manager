"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/mongodb"
import { Tag } from "@/lib/models/tag"

export async function getTags(userId?: string) {
  try {
    await connectToDatabase()

    const { userId: authUserId } = await auth()

    if (!authUserId) {
      throw new Error("Unauthorized")
    }

    const query = { userId: userId || authUserId }
    const tags = await Tag.find(query).sort({ name: 1 }).lean()

    return tags.map((tag: any) => ({
      ...tag,
      _id: tag._id.toString(),
    }))
  } catch (error) {
    console.error("Failed to get tags:", error)
    throw new Error("Failed to get tags. Please try again later.")
  }
}

export async function createTag(data: { name: string }) {
  try {
    await connectToDatabase()

    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const tag = await Tag.create({
      ...data,
      userId,
    })

    revalidatePath("/tags")
    revalidatePath("/")

    return {
      ...tag.toObject(),
      _id: tag._id.toString(),
    }
  } catch (error) {
    console.error("Failed to create tag:", error)
    throw new Error("Failed to create tag. Please try again later.")
  }
}

export async function updateTag(id: string, data: { name: string }) {
  try {
    await connectToDatabase()

    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const tag = await Tag.findOneAndUpdate({ _id: id, userId }, { ...data }, { new: true })

    if (!tag) {
      throw new Error("Tag not found or unauthorized")
    }

    revalidatePath("/tags")
    revalidatePath("/")

    return {
      ...tag.toObject(),
      _id: tag._id.toString(),
    }
  } catch (error) {
    console.error("Failed to update tag:", error)
    throw new Error("Failed to update tag. Please try again later.")
  }
}

export async function deleteTag(id: string) {
  try {
    await connectToDatabase()

    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const tag = await Tag.findOneAndDelete({ _id: id, userId })

    if (!tag) {
      throw new Error("Tag not found or unauthorized")
    }

    // Here you would also update notes to remove this tag
    // This would depend on your data model

    revalidatePath("/tags")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete tag:", error)
    throw new Error("Failed to delete tag. Please try again later.")
  }
}
