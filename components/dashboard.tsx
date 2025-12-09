"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { authService } from "@/lib/services"
import TodayPlan from "./today-plan"
import FocusSession from "./focus-session"
import QuickStats from "./quick-stats"
import TaskList from "./task-list"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { AnimatedCounter, EnergyIndicator } from "@/components/ui/animated-counter"
import { Confetti, useConfetti } from "@/components/ui/confetti"
import {
  Settings,
  Sparkles,

  Quote,
  ChevronRight,
  Flame,
} from "lucide-react"


// Motivational quotes
const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Your future is created by what you do today.", author: "Robert Kiyosaki" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
]

export default function Dashboard() {
  const {
    tasks,
    toggleTask,
    userPreferences,
    setSettings,
    userName,
    userData,
    focusSessions,

    analytics,
  } = useStore()

  const [userNameFromAPI, setUserNameFromAPI] = useState<string>("")
  const [showFocusTimeEdit, setShowFocusTimeEdit] = useState(false)
  const [focusTimeInput, setFocusTimeInput] = useState(userPreferences.focusDuration.toString())
  const [dailyQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])
  const [currentEnergy, setCurrentEnergy] = useState(3)
  const { isActive: showConfetti, fire: fireConfetti, reset: resetConfetti } = useConfetti()

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const result = await authService.getCurrentUser()
        if (result.data) {
          setUserNameFromAPI(result.data.name || "")
        }
      } catch (error) {
        console.error("Failed to fetch user name:", error)
      }
    }
    fetchUserName()
  }, [])

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const displayName = userName || userData?.name || userNameFromAPI || "there"

  const completedCount = tasks.filter((t) => t.completed).length
  const totalTime = Math.round(tasks.reduce((sum, t) => sum + t.timeEstimate, 0) / 60)
  const remainingTime = Math.round(tasks.filter((t) => !t.completed).reduce((sum, t) => sum + t.timeEstimate, 0) / 60)
  const focusMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0)
  const streak = analytics?.streakDays || 0

  const handleFocusTimeChange = () => {
    const newFocusTime = parseInt(focusTimeInput)
    if (!isNaN(newFocusTime) && newFocusTime > 0 && newFocusTime <= 120) {
      setSettings({ focusDuration: newFocusTime })
      setShowFocusTimeEdit(false)
    }
  }

  // Celebrate when all tasks are completed
  useEffect(() => {
    if (tasks.length > 0 && completedCount === tasks.length) {
      fireConfetti()
    }
  }, [completedCount, tasks.length, fireConfetti])

  return (
    <div className="min-h-screen bg-background">
      <Confetti active={showConfetti} onComplete={resetConfetti} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8 stagger-children">

          {/* Welcome Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold">
                {getGreeting()}, <span className="gradient-text">{displayName}</span>!
              </h1>
              <p className="text-muted-foreground">
                Let's make today productive. You have{" "}
                <span className="font-medium text-foreground">{tasks.length - completedCount}</span>{" "}
                tasks remaining.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Energy indicator */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border">
                <span className="text-xs text-muted-foreground">Energy</span>
                <EnergyIndicator level={currentEnergy} size="sm" showLabel={false} />
              </div>

              {/* Focus time settings */}
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
                  <span className="text-sm text-muted-foreground">min</span>
                  <Button
                    onClick={handleFocusTimeChange}
                    size="sm"
                    className="gradient-bg text-white"
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
                <Button
                  onClick={() => setShowFocusTimeEdit(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-mono">{userPreferences.focusDuration}m</span> Focus
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats
            tasksCompleted={completedCount}
            totalTasks={tasks.length}
            totalTime={totalTime}
            remainingTime={remainingTime}
            streak={streak}
            focusMinutes={focusMinutes}
          />

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Main Content - Left Column */}
            <div className="lg:col-span-8 space-y-6">

              {/* Focus Session - Large card */}
              <GlassCard variant="vibrant" className="overflow-hidden">
                <FocusSession />
              </GlassCard>

              {/* Today's Plan */}
              <Card variant="elevated" hover className="overflow-hidden">
                <TodayPlan />
              </Card>
            </div>

            {/* Sidebar - Right Column */}
            <div className="lg:col-span-4 space-y-6">

              {/* Daily Quote */}
              <GlassCard variant="subtle" hover="none" className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Quote className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm italic text-foreground leading-relaxed">
                      "{dailyQuote.text}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      — {dailyQuote.author}
                    </p>
                  </div>
                </div>
              </GlassCard>



              {/* Task List */}
              <Card variant="default" className="overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold">Today's Tasks</h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    {completedCount}/{tasks.length}
                  </span>
                </div>
                <div className="max-h-[400px] overflow-y-auto scrollbar-custom">
                  <TaskList tasks={tasks} onToggleTask={toggleTask} />
                </div>
              </Card>

              {/* AI Quick Actions */}
              <Card variant="gradient" hover className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl gradient-bg text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Quick actions</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between hover:bg-primary/5 group"
                    onClick={() => useStore.getState().setCurrentPage("coach")}
                  >
                    <span className="text-sm">Ask AI Coach</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-between hover:bg-primary/5 group"
                    onClick={() => useStore.getState().setCurrentPage("planner")}
                  >
                    <span className="text-sm">Generate AI Schedule</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </Card>

              {/* Streak Card */}
              {streak > 0 && (
                <Card
                  variant="elevated"
                  className="p-5 relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20"
                >
                  <div className="absolute -right-6 -bottom-6 opacity-10">
                    <Flame className="w-32 h-32 text-orange-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium">Current Streak</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold font-mono">
                        <AnimatedCounter value={streak} />
                      </span>
                      <span className="text-muted-foreground">days</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {streak >= 30
                        ? "🏆 Legendary streak!"
                        : streak >= 7
                          ? "🔥 You're on fire!"
                          : "Keep it going!"}
                    </p>
                  </div>
                </Card>
              )}


            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
