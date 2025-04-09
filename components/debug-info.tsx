"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { connectToDatabase } from "@/lib/mongodb"

export function DebugInfo() {
  const [isVisible, setIsVisible] = useState(false)
  const [dbStatus, setDbStatus] = useState<string>("Not checked")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [testNoteResult, setTestNoteResult] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<{[key: string]: string | undefined}>({})

  // Check environment variables on mount
  useEffect(() => {
    // Client-side environment variables
    setEnvVars({
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set',
      'NODE_ENV': process.env.NODE_ENV,
    })

    // Fetch server-side environment variables
    const fetchServerEnv = async () => {
      try {
        const response = await fetch('/api/debug')
        if (response.ok) {
          const data = await response.json()
          setEnvVars(prev => ({
            ...prev,
            'MONGODB_URI (server)': data.envStatus.MONGODB_URI ? 'Set' : 'Not set',
            'CLERK_SECRET_KEY (server)': data.envStatus.CLERK_SECRET_KEY ? 'Set' : 'Not set',
          }))
        }
      } catch (error) {
        console.error('Failed to fetch server environment:', error)
      }
    }

    fetchServerEnv()
  }, [])

  const checkDbConnection = async () => {
    setIsLoading(true)
    try {
      await connectToDatabase()
      setDbStatus("Connected successfully")
    } catch (error) {
      setDbStatus(`Connection failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const createTestNote = async () => {
    setIsCreatingNote(true)
    setTestNoteResult(null)

    try {
      const response = await fetch('/api/debug/test-note', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setTestNoteResult(`Success! Created note with ID: ${data.note._id}`)
      } else {
        setTestNoteResult(`Error: ${data.error} - ${data.message || ''}`)
      }
    } catch (error) {
      setTestNoteResult(`Failed to create test note: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsCreatingNote(false)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="opacity-50 hover:opacity-100"
        >
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-background border rounded-lg shadow-lg max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Debug Information</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
          Close
        </Button>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <p className="font-medium mb-1">MongoDB Connection:</p>
          <p className={`${dbStatus.includes("failed") ? "text-destructive" : "text-green-500"}`}>
            {dbStatus}
          </p>

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkDbConnection}
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check DB Connection"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={createTestNote}
              disabled={isCreatingNote}
            >
              {isCreatingNote ? "Creating..." : "Create Test Note"}
            </Button>
          </div>

          {testNoteResult && (
            <div className={`mt-2 text-xs p-2 border rounded ${testNoteResult.includes('Success') ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-red-500 bg-red-50 dark:bg-red-950/20'}`}>
              {testNoteResult}
            </div>
          )}
        </div>

        <div>
          <p className="font-medium mb-1">Environment Variables:</p>
          <div className="space-y-1">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className={value === 'Not set' ? 'text-destructive' : ''}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-medium mb-1">System:</p>
          <p>Node.js: {process.versions.node}</p>
          <p>Next.js: 15.2.5</p>
        </div>
      </div>
    </div>
  )
}
