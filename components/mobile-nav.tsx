"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  const pathname = usePathname()

  // Don't show on shared note pages
  if (pathname.startsWith("/share/")) {
    return null
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
      <Menu className="h-4 w-4" />
      <span className="sr-only">Menu</span>
    </Button>
  )
}
