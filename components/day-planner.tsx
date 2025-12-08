"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { aiAPI } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, RotateCcw, ThumbsUp, ThumbsDown, Coffee, Briefcase, Users, AlertCircle } from "lucide-react"

interface ScheduleItem {
  time: string
  duration: number
  task: string
  priority: "high" | "medium" | "low"
  taskId?: string
  type?: "work" | "break" | "meeting"
}

interface AIPlan {
  id: string
  plan_date: string
  schedule: ScheduleItem[]
  explanation: string | null
  reasoning: Record<string, unknown> | null
  status: "pending" | "accepted" | "rejected" | "edited" | "expired"
  generated_at: string
}

export default function DayPlanner() {
  const { tasks, currentSchedule, setCurrentSchedule, acceptSchedule } = useStore()
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Load today's AI plan on mount
  useEffect(() => {
    loadTodaysPlan()
  }, [])

  async function loadTodaysPlan() {
    setIsLoading(true)
    setError(null)
    try {
      const today = new Date().toISOString().split("T")[0]
      const plan = await aiAPI.getDailyPlan(today)
      setAiPlan(plan)
      if (plan?.schedule) {
        setCurrentSchedule(plan.schedule)
      }
    } catch (err) {
      console.error("Failed to load plan:", err)
      setError("Failed to load today's plan")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAccept() {
    if (!aiPlan) return
    try {
      await aiAPI.acceptPlan(aiPlan.id)
      setAiPlan({ ...aiPlan, status: "accepted" })
      acceptSchedule()
      setFeedbackMessage("Schedule accepted! Let's have a productive day.")
      setTimeout(() => setFeedbackMessage(null), 3000)
    } catch (err) {
      console.error("Failed to accept plan:", err)
      setError("Failed to accept plan")
    }
  }

  async function handleReject() {
    if (!aiPlan) return
    try {
      await aiAPI.rejectPlan(aiPlan.id)
      setAiPlan({ ...aiPlan, status: "rejected" })
      setFeedbackMessage("Plan rejected. You can regenerate or create your own schedule.")
      setTimeout(() => setFeedbackMessage(null), 3000)
    } catch (err) {
      console.error("Failed to reject plan:", err)
      setError("Failed to reject plan")
    }
  }

  async function handleRegenerate() {
    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch("/api/ai/generate-plan", { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to generate plan")
      }
      const data = await response.json()
      setAiPlan(data.plan)
      if (data.plan?.schedule) {
        setCurrentSchedule(data.plan.schedule)
      }
      setFeedbackMessage("New schedule generated!")
      setTimeout(() => setFeedbackMessage(null), 3000)
    } catch (err) {
      console.error("Failed to regenerate:", err)
      setError("Failed to generate new plan. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Fallback schedule generation (original logic)
  async function handleFallbackGenerate() {
    setIsGenerating(true)
    const highPriorityTasks = tasks.filter((t) => !t.completed && t.priority === "high")

    if (highPriorityTasks.length > 0) {
      const newSchedule = highPriorityTasks.slice(0, 5).map((task, idx) => ({
        time: `${9 + idx * 2}:00`.padStart(5, "0"),
        duration: Math.min(task.timeEstimate || 30, 120),
        task: task.title,
        priority: task.priority as "high" | "medium" | "low",
        taskId: task.id,
        type: "work" as const,
      }))
      setCurrentSchedule(newSchedule)
      setAiPlan({
        id: "local",
        plan_date: new Date().toISOString().split("T")[0],
        schedule: newSchedule,
        explanation: "Schedule generated from your high-priority tasks.",
        reasoning: null,
        status: "pending",
        generated_at: new Date().toISOString(),
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsGenerating(false)
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your AI-powered schedule...</p>
        </div>
      </div>
    )
  }

  const schedule = aiPlan?.schedule || currentSchedule || []
  const isPending = aiPlan?.status === "pending"
  const isAccepted = aiPlan?.status === "accepted"
  const isRejected = aiPlan?.status === "rejected"

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
            <p className="text-muted-foreground mt-2">Your personalized schedule powered by Gemini AI</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRegenerate}
              disabled={isGenerating}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Generating..." : "Regenerate"}
            </Button>
            {!aiPlan && (
              <Button
                onClick={handleFallbackGenerate}
                disabled={isGenerating}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Sparkles className="w-4 h-4" />
                Quick Generate
              </Button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Card className="p-4 bg-red-500/10 border-red-500/30">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Feedback message */}
        {feedbackMessage && (
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <p className="text-green-600 font-medium">{feedbackMessage}</p>
          </Card>
        )}

        {/* AI Explanation */}
        {aiPlan?.explanation && (
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-2">Why this schedule?</p>
                <p className="text-sm text-muted-foreground">{aiPlan.explanation}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Schedule View */}
        <Card className="p-8 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Today's Optimized Schedule</h2>
            {aiPlan && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isAccepted ? "bg-green-500/20 text-green-600" :
                isRejected ? "bg-red-500/20 text-red-600" :
                "bg-yellow-500/20 text-yellow-600"
              }`}>
                {aiPlan.status.charAt(0).toUpperCase() + aiPlan.status.slice(1)}
              </span>
            )}
          </div>

          {schedule.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No schedule available yet.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleRegenerate} disabled={isGenerating} className="gap-2 bg-primary hover:bg-primary/90">
                  <Sparkles className="w-4 h-4" />
                  Generate AI Schedule
                </Button>
                <Button onClick={handleFallbackGenerate} disabled={isGenerating} variant="outline" className="gap-2">
                  Quick Generate
                </Button>
              </div>
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

                  const isBreak = item.type === "break"

                  return (
                    <div key={idx}>
                      <div
                        className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                          isBreak ? "border-blue-500/30 bg-blue-500/5" :
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
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                            isBreak ? "bg-blue-500/10" : "bg-primary/10"
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

              {/* Action Buttons */}
              {isPending && (
                <div className="mt-8 flex gap-4 justify-end flex-wrap">
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    className="gap-2"
                    disabled={isGenerating}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Not Today
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    disabled={isGenerating}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Accept Schedule
                  </Button>
                </div>
              )}

              {isAccepted && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Schedule accepted! Good luck with your day.
                </div>
              )}

              {isRejected && (
                <div className="mt-6 p-4 bg-muted border border-border rounded-lg text-muted-foreground text-sm">
                  Schedule rejected. Click "Regenerate" for a new AI-powered schedule, or create your own.
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
            <li>✓ Analyzes your productivity patterns from past focus sessions</li>
            <li>✓ Schedules demanding tasks during your peak performance hours</li>
            <li>✓ Includes breaks based on your optimal focus duration</li>
            <li>✓ Learns from your feedback to improve future schedules</li>
            <li>✓ Considers task priorities and upcoming deadlines</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
