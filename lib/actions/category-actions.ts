"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/mongodb"
import { Category } from "@/lib/models/category"

export async function getCategories(userId?: string) {
  try {
    await connectToDatabase()

    const { userId: authUserId } = await auth()

    if (!authUserId) {
      throw new Error("Unauthorized")
    }

    const query = { userId: userId || authUserId }
    const categories = await Category.find(query).sort({ name: 1 }).lean()

    return categories.map((category: any) => ({
      ...category,
      _id: category._id.toString(),
    }))
  } catch (error) {
    console.error("Failed to get categories:", error)
    throw new Error("Failed to get categories. Please try again later.")
  }
}

export async function createCategory(data: { name: string }) {
  try {
    await connectToDatabase()

    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const category = await Category.create({
      ...data,
      userId,
    })

    revalidatePath("/categories")
    revalidatePath("/")

    return {
      ...category.toObject(),
      _id: category._id.toString(),
    }
  } catch (error) {
    console.error("Failed to create category:", error)
    throw new Error("Failed to create category. Please try again later.")
  }
}

export async function updateCategory(id: string, data: { name: string }) {
  try {
    await connectToDatabase()

    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const category = await Category.findOneAndUpdate({ _id: id, userId }, { ...data }, { new: true })

    if (!category) {
      throw new Error("Category not found or unauthorized")
    }

    revalidatePath("/categories")
    revalidatePath("/")

    return {
      ...category.toObject(),
      _id: category._id.toString(),
    }
  } catch (error) {
    console.error("Failed to update category:", error)
    throw new Error("Failed to update category. Please try again later.")
  }
}

export async function deleteCategory(id: string) {
  try {
    await connectToDatabase()

    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const category = await Category.findOneAndDelete({ _id: id, userId })

    if (!category) {
      throw new Error("Category not found or unauthorized")
    }

    // Here you would also update notes to remove this category
    // This would depend on your data model

    revalidatePath("/categories")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete category:", error)
    throw new Error("Failed to delete category. Please try again later.")
  }
}
