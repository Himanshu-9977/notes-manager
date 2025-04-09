"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { getTags } from "@/lib/actions/tag-actions"
import { getCategories } from "@/lib/actions/category-actions"
import type { Tag, Category } from "@/lib/types"

export function SearchAndFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const loadData = async () => {
      const tagsData = await getTags()
      const categoriesData = await getCategories()
      setTags(tagsData)
      setCategories(categoriesData)
    }

    loadData()
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (selectedTag && selectedTag !== 'all') params.set("tag", selectedTag)
    if (selectedCategory && selectedCategory !== 'all') params.set("category", selectedCategory)

    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedTag("")
    setSelectedCategory("")
    router.push("/")
  }

  const hasActiveFilters = search || selectedTag || selectedCategory

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
          />
        </div>

        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag._id} value={tag._id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} className="w-full md:w-auto">Search</Button>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {search}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
              </Badge>
            )}

            {selectedTag && selectedTag !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tag: {tags.find((t) => t._id === selectedTag)?.name || selectedTag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedTag("")} />
              </Badge>
            )}

            {selectedCategory && selectedCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categories.find((c) => c._id === selectedCategory)?.name || selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
              </Badge>
            )}

            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2">
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
