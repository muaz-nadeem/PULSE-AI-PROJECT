"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Shield } from "lucide-react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

export default function BlockingSettings() {
  const { blockingSettings, setBlockingMode, addBlockedApp, removeBlockedApp } = useStore()
  const [newAppName, setNewAppName] = useState("")

  const handleAddApp = () => {
    if (newAppName.trim() && !blockingSettings.blockedApps.includes(newAppName.trim())) {
      addBlockedApp(newAppName.trim())
      setNewAppName("")
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Blocking Settings</h1>
          <p className="text-muted-foreground mt-2">Manage app blocking during focus sessions</p>
        </div>

        {/* Blocking Mode */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Blocking Mode</h2>
          </div>

          <RadioGroupPrimitive.Root
            value={blockingSettings.blockingMode}
            onValueChange={(value) => setBlockingMode(value as "strict" | "standard" | "relaxed")}
            className="space-y-4"
          >
            <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
              <RadioGroupPrimitive.Item
                value="strict"
                id="strict"
                className="w-5 h-5 rounded-full border-2 border-border bg-background flex items-center justify-center mt-0.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              >
                <RadioGroupPrimitive.Indicator className="w-3 h-3 rounded-full bg-white" />
              </RadioGroupPrimitive.Item>
              <label htmlFor="strict" className="flex-1 cursor-pointer">
                <div className="font-semibold text-foreground mb-1">Strict</div>
                <div className="text-sm text-muted-foreground">No overrides - Apps are blocked with no exceptions.</div>
              </label>
            </div>

            <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
              <RadioGroupPrimitive.Item
                value="standard"
                id="standard"
                className="w-5 h-5 rounded-full border-2 border-border bg-background flex items-center justify-center mt-0.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              >
                <RadioGroupPrimitive.Indicator className="w-3 h-3 rounded-full bg-white" />
              </RadioGroupPrimitive.Item>
              <label htmlFor="standard" className="flex-1 cursor-pointer">
                <div className="font-semibold text-foreground mb-1">Standard</div>
                <div className="text-sm text-muted-foreground">Warn + block - Users get a warning before access is blocked.</div>
              </label>
            </div>

            <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
              <RadioGroupPrimitive.Item
                value="relaxed"
                id="relaxed"
                className="w-5 h-5 rounded-full border-2 border-border bg-background flex items-center justify-center mt-0.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              >
                <RadioGroupPrimitive.Indicator className="w-3 h-3 rounded-full bg-white" />
              </RadioGroupPrimitive.Item>
              <label htmlFor="relaxed" className="flex-1 cursor-pointer">
                <div className="font-semibold text-foreground mb-1">Relaxed</div>
                <div className="text-sm text-muted-foreground">10s delay wall - Users can access blocked apps after 10 second delay.</div>
              </label>
            </div>
          </RadioGroupPrimitive.Root>
        </Card>

        {/* Blocked Apps */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Blocked Apps</h2>

          <div className="space-y-3 mb-4">
            {blockingSettings.blockedApps.length > 0 ? (
              blockingSettings.blockedApps.map((app) => (
                <div
                  key={app}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50"
                >
                  <span className="font-medium text-foreground">{app}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlockedApp(app)}
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center text-muted-foreground">
                No apps blocked. Add apps to block them during focus sessions.
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter app name"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddApp()
                }
              }}
              className="flex-1 bg-secondary/50 border-border"
            />
            <Button
              onClick={handleAddApp}
              className="bg-primary hover:bg-primary/90 gap-2"
              disabled={!newAppName.trim() || blockingSettings.blockedApps.includes(newAppName.trim())}
            >
              <Plus className="w-4 h-4" />
              Add New App
            </Button>
          </div>
        </Card>

        {/* Chrome Extension Info */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Chrome Extension</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Install the PULSE AI Chrome extension to automatically block distracting websites during your scheduled study times.
                The extension will track your browsing and log distractions automatically.
              </p>
              <p className="text-xs text-muted-foreground">
                To install: Load the extension from the <code className="bg-secondary/50 px-1 py-0.5 rounded">chrome-extension</code> folder in developer mode.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

