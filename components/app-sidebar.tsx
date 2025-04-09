"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderOpen, Tag, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()

  // Don't show sidebar on shared note pages
  if (pathname.startsWith("/share/")) {
    return null
  }

  const links = [
    { href: "/", label: "Notes", icon: Home },
    { href: "/categories", label: "Categories", icon: FolderOpen },
    { href: "/tags", label: "Tags", icon: Tag },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-56 lg:w-64 border-r bg-background h-[calc(100vh-4rem)] overflow-y-auto hidden md:block">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Notes Manager</h2>
      </div>
      <nav className="p-2 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 lg:gap-3 rounded-md px-2 lg:px-3 py-2 text-sm font-medium truncate",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
