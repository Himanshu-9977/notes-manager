"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { MobileNav } from "@/components/mobile-nav"

export function Header() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  // Don't show header on shared note pages
  if (pathname.startsWith("/share/")) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background h-16">
      <div className="container px-4 sm:px-6 flex h-full items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <MobileNav />
          <span className="font-semibold text-lg truncate">Scriblio</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme toggle only visible on larger screens */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 hidden md:flex"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* New Note button */}
          <Button asChild variant="default" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
            <Link href="/notes/new">
              <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">New</span> Note
            </Link>
          </Button>

          {/* User button only visible on larger screens */}
          <div className="hidden md:block">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  )
}
