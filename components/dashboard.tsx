"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { usersAPI } from "@/lib/api"
import TodayPlan from "./today-plan"
import FocusSession from "./focus-session"
import QuickStats from "./quick-stats"
import TaskList from "./task-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings } from "lucide-react"
import WeeklyClassSchedule from "./weekly-class-schedule"

export default function Dashboard() {
  const { tasks, toggleTask, userPreferences, setSettings, userName, userData } = useStore()
  const [userNameFromAPI, setUserNameFromAPI] = useState<string>("")
  const [showFocusTimeEdit, setShowFocusTimeEdit] = useState(false)
  const [focusTimeInput, setFocusTimeInput] = useState(userPreferences.focusDuration.toString())

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = await usersAPI.getCurrentUser() as { name: string }
        setUserNameFromAPI(user.name || "")
      } catch (error) {
        console.error("Failed to fetch user name:", error)
      }
    }
    fetchUserName()
  }, [])

  const displayName = userName || userData?.name || userNameFromAPI || "User"

  const completedCount = tasks.filter((t) => t.completed).length
  const totalTime = tasks.reduce((sum, t) => sum + t.timeEstimate, 0)
  const remainingTime = tasks.filter((t) => !t.completed).reduce((sum, t) => sum + t.timeEstimate, 0)

  const handleFocusTimeChange = () => {
    const newFocusTime = parseInt(focusTimeInput)
    if (!isNaN(newFocusTime) && newFocusTime > 0 && newFocusTime <= 120) {
      setSettings({ focusDuration: newFocusTime })
      setShowFocusTimeEdit(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome {displayName}!
              </h1>
              <p className="text-muted-foreground mt-1">Let's make today productive</p>
            </div>
            <div className="flex items-center gap-4">
              {showFocusTimeEdit ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={focusTimeInput}
                    onChange={(e) => setFocusTimeInput(e.target.value)}
                    className="w-20"
                    placeholder="25"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                  <Button
                    onClick={handleFocusTimeChange}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setShowFocusTimeEdit(false)
                      setFocusTimeInput(userPreferences.focusDuration.toString())
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Focus Time: <span className="font-semibold text-foreground">{userPreferences.focusDuration} min</span>
                  </span>
                  <Button
                    onClick={() => setShowFocusTimeEdit(true)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats section */}
          <QuickStats
            tasksCompleted={completedCount}
            totalTasks={tasks.length}
            totalTime={totalTime}
            remainingTime={remainingTime}
          />

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Focus and today's plan */}
            <div className="lg:col-span-2 space-y-6">
              <FocusSession />
              <TodayPlan />
              <WeeklyClassSchedule />
            </div>

            {/* Right column - Tasks */}
            <div>
              <TaskList tasks={tasks} onToggleTask={toggleTask} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
