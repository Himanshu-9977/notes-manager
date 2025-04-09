import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { AppSidebar } from "@/components/app-sidebar"
import { DebugInfo } from "@/components/debug-info"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import "./globals.css"
import "./responsive.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Personal Notes Manager",
  description: "Manage your notes with tags, categories, and sharing options",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col w-full overflow-hidden">
              <Header />
              <div className="flex w-full overflow-hidden">
                <AppSidebar />
                <main className="flex-1 w-full p-4 pb-20 md:p-6 md:pb-6 bg-muted/20 overflow-auto">{children}</main>
              </div>
              <MobileBottomNav />
              <Toaster position="top-center" richColors />
              {/* <DebugInfo /> */}
            </div>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
  )
}


import './globals.css'