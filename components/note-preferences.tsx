"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

// Define the preferences interface
interface NotePreferences {
  autosave: boolean
  publicByDefault: boolean
}

// Local storage key for preferences
const PREFERENCES_KEY = 'note-manager-preferences'

export function NotePreferences() {
  const { theme, setTheme } = useTheme()
  const [preferences, setPreferences] = useState<NotePreferences>({
    autosave: true,
    publicByDefault: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Load preferences from local storage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY)
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences(parsed)
      } catch (error) {
        console.error('Failed to parse preferences:', error)
      }
    }
  }, [])

  // Save preferences to local storage
  const savePreferences = () => {
    setIsSaving(true)
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
      toast.success('Preferences saved successfully')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Note Preferences</CardTitle>
        <CardDescription>Manage your note creation and editing preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autosave">Autosave</Label>
              <p className="text-sm text-muted-foreground">Automatically save notes while editing</p>
            </div>
            <Switch
              id="autosave"
              checked={preferences.autosave}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autosave: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-by-default">Public by default</Label>
              <p className="text-sm text-muted-foreground">Make new notes public by default</p>
            </div>
            <Switch
              id="public-by-default"
              checked={preferences.publicByDefault}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, publicByDefault: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme">Theme</Label>
              <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="icon"
                onClick={() => setTheme("light")}
                className="h-8 w-8"
              >
                <Sun className="h-4 w-4" />
                <span className="sr-only">Light</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="icon"
                onClick={() => setTheme("dark")}
                className="h-8 w-8"
              >
                <Moon className="h-4 w-4" />
                <span className="sr-only">Dark</span>
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={savePreferences}
          disabled={isSaving}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
