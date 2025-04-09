"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderOpen, Tag, Settings, User } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const pathname = usePathname()

  // Don't show on shared note pages
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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden h-16 safe-area-bottom">
      <div className="flex items-center justify-around h-full px-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          )
        })}
        <div className="flex flex-col items-center justify-center py-1 px-2">
          <div className="h-5 w-5 flex items-center justify-center">
            <UserButton afterSignOutUrl="/" />
          </div>
          <span className="text-xs mt-1">Profile</span>
        </div>
      </div>
    </div>
  )
}
