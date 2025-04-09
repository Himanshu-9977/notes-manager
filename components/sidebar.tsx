"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, FolderOpen, Tag, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

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
    <aside
      className={cn(
        "bg-background border-r transition-all duration-300 ease-in-out h-[calc(100vh-4rem)] sticky top-16",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <Button variant="ghost" size="icon" className="self-end m-2" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
