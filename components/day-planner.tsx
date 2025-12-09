"use client"

import { useState, useMemo, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, RotateCcw, AlertCircle, Coffee, Briefcase, Users } from "lucide-react"
import { generateDailySchedule } from "@/lib/ai/schedule-generator"
import type { ScheduleItem } from "@/lib/store"

export default function DayPlanner() {
  const { tasks, currentSchedule, setCurrentSchedule, acceptSchedule, moodEntries, userPreferences, acceptedSchedules } = useStore()

  // Get getTodayClasses if it exists in store, otherwise use empty function
  const getTodayClasses = useStore((state) => (state as any).getTodayClasses) || (() => [])

  const today = new Date().toISOString().split("T")[0]
  const todayAcceptedSchedule = acceptedSchedules.find((s) => s.date === today)
  const [schedule, setSchedule] = useState<ScheduleItem[]>(todayAcceptedSchedule?.schedule || currentSchedule || [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [scheduleAccepted, setScheduleAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update schedule when accepted schedule changes
  useEffect(() => {
    const todaySchedule = acceptedSchedules.find((s) => s.date === today)
    if (todaySchedule && todaySchedule.schedule.length > 0) {
      setSchedule(todaySchedule.schedule)
    } else if (currentSchedule.length > 0 && !todaySchedule) {
      // Show current schedule if no accepted schedule for today
      setSchedule(currentSchedule)
    }
  }, [acceptedSchedules, currentSchedule, today])

  // Check if mood is logged for today
  const todayMood = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return moodEntries.find((entry) => {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === today.getTime()
    })
  }, [moodEntries])

  const generateSchedule = async () => {
    // Check if there are tasks
    const incompleteTasks = tasks.filter((t) => !t.completed)
    if (incompleteTasks.length === 0) {
      setError("No tasks available. Please add some tasks first.")
      return
    }

    setIsGenerating(true)
    setScheduleAccepted(false)
    setError(null)

    try {
      const todayClasses = getTodayClasses()

      // Use logged mood or default to neutral if not yet logged (though global check should catch this)
      const mood = todayMood?.mood || "neutral"
      const moodNotes = todayMood?.notes || ""

      const aiSchedule = await generateDailySchedule({
        tasks: incompleteTasks,
        mood,
        moodNotes,
        focusDuration: userPreferences.focusDuration,
        weeklySchedule: todayClasses,
      })

      if (aiSchedule.length === 0) {
        setError("No schedule could be generated. Please try again.")
        setIsGenerating(false)
        return
      }

      setSchedule(aiSchedule)
      setCurrentSchedule(aiSchedule)
    } catch (err: any) {
      console.error("Error generating schedule:", err)
      setError(err.message || "Failed to generate schedule. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAcceptSchedule = () => {
    acceptSchedule()
    // Schedule will be updated via useEffect when acceptedSchedules changes
    setScheduleAccepted(true)
    setTimeout(() => setScheduleAccepted(false), 3000)
  }

  const handleRegenerateSchedule = () => {
    generateSchedule()
  }

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "break":
        return <Coffee className="w-4 h-4" />
      case "meeting":
        return <Users className="w-4 h-4" />
      default:
        return <Briefcase className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              AI Day Planner
            </h1>
            <p className="text-muted-foreground mt-2">Optimize your schedule with AI-powered planning</p>
            {todayMood && (
              <p className="text-sm text-muted-foreground mt-1">
                Today's mood: <span className="font-medium capitalize">{todayMood.mood}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRegenerateSchedule}
              disabled={isGenerating}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Generating..." : "Regenerate"}
            </Button>
            <Button
              onClick={generateSchedule}
              disabled={isGenerating}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Sparkles className="w-4 h-4" />
              Generate Schedule
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-500/10 border-red-500/30">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </Card>
        )}

        {/* Schedule View */}
        <Card className="p-8 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Today's Optimized Schedule</h2>

          {schedule.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                {tasks.filter((t) => !t.completed).length === 0
                  ? "Add some tasks to generate your schedule"
                  : "Click 'Generate Schedule' to create your AI-optimized daily plan"}
              </p>
              <Button onClick={generateSchedule} disabled={isGenerating} className="gap-2 bg-primary hover:bg-primary/90">
                <Sparkles className="w-4 h-4" />
                Generate AI Schedule
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {schedule.map((item, idx) => {
                  const nextItem = schedule[idx + 1]
                  const currentMinutes = timeToMinutes(item.time)
                  const nextMinutes = nextItem ? timeToMinutes(nextItem.time) : currentMinutes + item.duration
                  const gap = nextMinutes - (currentMinutes + item.duration)

                  const priorityColor = {
                    high: "border-red-500/30 bg-red-500/5",
                    medium: "border-yellow-500/30 bg-yellow-500/5",
                    low: "border-green-500/30 bg-green-500/5",
                  }

                  const isBreak = item.type === "break" || item.task.toLowerCase().includes("break")

                  return (
                    <div key={idx}>
                      <div
                        className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${isBreak ? "border-blue-500/30 bg-blue-500/5" :
                          priorityColor[item.priority as keyof typeof priorityColor]
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="text-sm font-bold text-primary">{item.time}</span>
                              <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                                {item.duration} min
                              </span>
                              {!isBreak && (
                                <span
                                  className={`text-xs px-2 py-1 rounded ${item.priority === "high"
                                    ? "bg-red-500/20 text-red-600"
                                    : item.priority === "medium"
                                      ? "bg-yellow-500/20 text-yellow-600"
                                      : "bg-green-500/20 text-green-600"
                                    }`}
                                >
                                  {item.priority}
                                </span>
                              )}
                              {item.type && (
                                <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded flex items-center gap-1">
                                  {getTypeIcon(item.type)}
                                  {item.type}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">{item.task}</h3>
                          </div>
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${isBreak ? "bg-blue-500/10" : "bg-primary/10"
                            }`}>
                            <span className={`text-2xl font-bold ${isBreak ? "text-blue-500" : "text-primary"}`}>
                              {Math.floor(item.duration / 30) || 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      {gap > 0 && nextItem && (
                        <div className="py-2 px-4 text-xs text-muted-foreground text-center">
                          Buffer: {minutesToTime(currentMinutes + item.duration)} - {minutesToTime(nextMinutes)} ({gap} min)
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 flex gap-4 justify-end">
                <Button
                  onClick={handleRegenerateSchedule}
                  variant="outline"
                  className="gap-2 bg-transparent"
                  disabled={isGenerating}
                >
                  <RotateCcw className="w-4 h-4" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleAcceptSchedule}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  disabled={isGenerating}
                >
                  <Check className="w-4 h-4" />
                  Accept Schedule
                </Button>
              </div>

              {scheduleAccepted && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm font-medium">
                  Schedule accepted and saved to your schedule history!
                </div>
              )}
            </>
          )}
        </Card>

        {/* AI Tips */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            How AI Scheduling Works
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ High-priority tasks scheduled during peak focus hours (9-11 AM)</li>
            <li>✓ Pomodoro breaks inserted every 90 minutes for optimal productivity</li>
            <li>✓ Similar tasks batched together to minimize context switching</li>
            <li>✓ Buffer time added between tasks to prepare mentally</li>
            <li>✓ Schedule adapts to your current mood and energy levels</li>
            <li>✓ Avoids scheduling during your class times</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
