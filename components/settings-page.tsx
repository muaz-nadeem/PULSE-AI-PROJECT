"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Clock, Palette, Lock, LogOut } from "lucide-react"

export default function SettingsPage() {
  const { userData, userPreferences, setSettings, setUserData, logout, auth } = useStore()
  const [settings, setSettingsLocal] = useState({
    focusTime: userPreferences.focusDuration,
    breakTime: userPreferences.breakDuration,
    dailyGoal: userPreferences.dailyGoal,
    notifications: true,
    soundEnabled: userPreferences.soundEnabled,
    darkMode: userPreferences.theme === "dark",
    theme: "ocean",
  })
  const [userForm, setUserForm] = useState({
    name: userData?.name || "",
    role: userData?.role || "",
  })

  const handleSave = () => {
    setSettings({
      focusDuration: settings.focusTime,
      breakDuration: settings.breakTime,
      dailyGoal: settings.dailyGoal,
      soundEnabled: settings.soundEnabled,
      theme: settings.darkMode ? "dark" : "light",
    })
    setUserData(userForm.name, [], userForm.role)
    console.log("Settings saved:", settings)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Customize your Pulse experience</p>
        </div>

        {/* Focus Settings */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Focus Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Focus Time (minutes)</label>
                <Input
                  type="number"
                  value={settings.focusTime}
                  onChange={(e) => setSettingsLocal({ ...settings, focusTime: Number.parseInt(e.target.value) })}
                  className="bg-secondary/50 border-border"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Break Time (minutes)</label>
                <Input
                  type="number"
                  value={settings.breakTime}
                  onChange={(e) => setSettingsLocal({ ...settings, breakTime: Number.parseInt(e.target.value) })}
                  className="bg-secondary/50 border-border"
                  min="1"
                  max="30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Daily Goal (sessions)</label>
                <Input
                  type="number"
                  value={settings.dailyGoal}
                  onChange={(e) => setSettingsLocal({ ...settings, dailyGoal: Number.parseInt(e.target.value) })}
                  className="bg-secondary/50 border-border"
                  min="1"
                  max="12"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div>
                <p className="font-semibold text-foreground">Focus Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified when it's time to focus</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettingsLocal({ ...settings, notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div>
                <p className="font-semibold text-foreground">Sound Effects</p>
                <p className="text-sm text-muted-foreground">Play sounds when sessions complete</p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => setSettingsLocal({ ...settings, soundEnabled: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Theme Settings */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Theme</label>
              <Select value={settings.theme} onValueChange={(value) => setSettingsLocal({ ...settings, theme: value })}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ocean">Ocean Blue</SelectItem>
                  <SelectItem value="forest">Forest Green</SelectItem>
                  <SelectItem value="sunset">Sunset Orange</SelectItem>
                  <SelectItem value="midnight">Midnight Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div>
                <p className="font-semibold text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme by default</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettingsLocal({ ...settings, darkMode: checked })}
              />
            </div>
          </div>
        </Card>

        {/* User Profile */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Account</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Name</label>
              <Input
                type="text"
                placeholder="Your name"
                className="bg-secondary/50 border-border"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Role</label>
              <Input
                type="text"
                placeholder="Your role"
                className="bg-secondary/50 border-border"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Account Section with Logout and Email Display */}
        <Card className="p-6 bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
              <p className="font-semibold text-foreground mb-2">Current Account</p>
              <p className="text-sm text-muted-foreground mb-4">{auth.userEmail}</p>
              <Button
                onClick={logout}
                variant="outline"
                className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
            Save Changes
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
