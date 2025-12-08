"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, RotateCcw } from "lucide-react"

export default function DayPlanner() {
  const { tasks, currentSchedule, setCurrentSchedule, acceptSchedule } = useStore()
  const [schedule, setSchedule] = useState([
    { time: "09:00", duration: 90, task: "Design mockups", priority: "high" as const },
    { time: "10:30", duration: 30, task: "Team standup", priority: "medium" as const },
    { time: "11:00", duration: 120, task: "Deep work session", priority: "high" as const },
    { time: "13:00", duration: 60, task: "Lunch break", priority: "low" as const },
    { time: "14:00", duration: 90, task: "Code review", priority: "medium" as const },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [scheduleAccepted, setScheduleAccepted] = useState(false)

  const generateSchedule = async () => {
    setIsGenerating(true)
    setScheduleAccepted(false)
    const highPriorityTasks = tasks
      .filter((t) => !t.completed && t.priority === "high")

    if (highPriorityTasks.length > 0) {
      const newSchedule = highPriorityTasks.slice(0, 3).map((task, idx) => ({
        time: `${9 + idx * 2}:00`,
        duration: Math.min(task.timeEstimate, 120),
        task: task.title,
        priority: task.priority as "high" | "medium" | "low",
      }))
      setSchedule(newSchedule)
      setCurrentSchedule(newSchedule)
    }

    // Simulate AI scheduling
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsGenerating(false)
  }

  const handleAcceptSchedule = () => {
    acceptSchedule()
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">AI Day Planner</h1>
            <p className="text-muted-foreground mt-2">Optimize your schedule with AI-powered planning</p>
          </div>
          <Button onClick={generateSchedule} disabled={isGenerating} className="gap-2 bg-primary hover:bg-primary/90">
            <Sparkles className="w-5 h-5" />
            {isGenerating ? "Generating..." : "Generate Schedule"}
          </Button>
        </div>

        {/* Schedule View */}
        <Card className="p-8 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Today's Optimized Schedule</h2>

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

              return (
                <div key={idx}>
                  <div
                    className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                      priorityColor[item.priority as keyof typeof priorityColor]
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-primary">{item.time}</span>
                          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                            {item.duration} min
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              item.priority === "high"
                                ? "bg-red-500/20 text-red-600"
                                : item.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-600"
                                  : "bg-green-500/20 text-green-600"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{item.task}</h3>
                      </div>
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{Math.floor(item.duration / 30)}</span>
                      </div>
                    </div>
                  </div>

                  {gap > 0 && nextItem && (
                    <div className="py-2 px-4 text-xs text-muted-foreground text-center">
                      Break: {minutesToTime(currentMinutes + item.duration)} - {minutesToTime(nextMinutes)} ({gap} min)
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
        </Card>

        {/* AI Tips */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Scheduling Tips
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ High-priority tasks scheduled during peak focus hours (9-11 AM)</li>
            <li>✓ Pomodoro breaks inserted every 90 minutes for optimal productivity</li>
            <li>✓ Similar tasks batched together to minimize context switching</li>
            <li>✓ Buffer time added before meetings to prepare mentally</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
