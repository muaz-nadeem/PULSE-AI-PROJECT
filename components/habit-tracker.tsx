"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Calendar, Flame, Target, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const HABIT_COLORS = [
  { name: "Blue", value: "bg-blue-500", border: "border-blue-500" },
  { name: "Green", value: "bg-green-500", border: "border-green-500" },
  { name: "Purple", value: "bg-purple-500", border: "border-purple-500" },
  { name: "Orange", value: "bg-orange-500", border: "border-orange-500" },
  { name: "Pink", value: "bg-pink-500", border: "border-pink-500" },
  { name: "Teal", value: "bg-teal-500", border: "border-teal-500" },
]

export default function HabitTracker() {
  const { habits, addHabit, deleteHabit, toggleHabitCompletion, tasks, focusSessions } = useStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    frequency: "daily" as "daily" | "weekly",
    color: "bg-blue-500",
  })
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isDateCompleted = (habitId: string, date: Date) => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return false
    const dateStr = formatDate(date)
    return habit.completedDates.includes(dateStr)
  }

  const handleAddHabit = () => {
    if (newHabit.name.trim()) {
      addHabit({
        name: newHabit.name.trim(),
        description: newHabit.description.trim() || undefined,
        frequency: newHabit.frequency,
        color: newHabit.color,
      })
      setNewHabit({ name: "", description: "", frequency: "daily", color: "bg-blue-500" })
      setShowAddForm(false)
    }
  }

  const handleToggleDate = (habitId: string, date: Date) => {
    toggleHabitCompletion(habitId, formatDate(date))
  }

  const getDaysInMonthArray = () => {
    const daysInMonth = getDaysInMonth(selectedMonth)
    const firstDay = getFirstDayOfMonth(selectedMonth)
    const days: (Date | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day))
    }

    return days
  }

  const getCompletionStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = formatDate(today)

    return habits.map((habit) => {
      const completedToday = habit.completedDates.includes(todayStr)
      const thisWeek = getWeekDates(today)
      const weekCompleted = thisWeek.filter((dateStr) => habit.completedDates.includes(dateStr)).length
      const weekTotal = habit.frequency === "daily" ? 7 : 1

      return {
        ...habit,
        completedToday,
        weekProgress: (weekCompleted / weekTotal) * 100,
      }
    })
  }

  const getWeekDates = (date: Date) => {
    const week: string[] = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay()) // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(formatDate(day))
    }
    return week
  }

  const stats = getCompletionStats()
  const totalStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0)
  const activeHabits = habits.filter((h) => h.currentStreak > 0).length

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Habit Tracker</h1>
            <p className="text-muted-foreground mt-2">Build consistency and track your daily routines</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Add Habit
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Habits</p>
                <p className="text-3xl font-bold text-primary">{habits.length}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Streaks</p>
                <p className="text-3xl font-bold text-accent">{activeHabits}</p>
              </div>
              <Flame className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Streak Days</p>
                <p className="text-3xl font-bold text-foreground">{totalStreaks}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Progress</p>
                <p className="text-3xl font-bold text-foreground">
                  {habits.length > 0
                    ? Math.round((stats.filter((s) => s.completedToday).length / habits.length) * 100)
                    : 0}
                  %
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Add Habit Form */}
        {showAddForm && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Create New Habit</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Habit Name</label>
                <Input
                  placeholder="e.g., Morning Exercise, Read 30 min"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description (optional)</label>
                <Input
                  placeholder="Add a description for this habit"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Frequency</label>
                  <Select
                    value={newHabit.frequency}
                    onValueChange={(value) => setNewHabit({ ...newHabit, frequency: value as "daily" | "weekly" })}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {HABIT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewHabit({ ...newHabit, color: color.value })}
                        className={`w-8 h-8 rounded-full ${color.value} border-2 ${
                          newHabit.color === color.value ? "border-foreground scale-110" : "border-transparent"
                        } transition-all`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddHabit} className="flex-1 bg-primary hover:bg-primary/90">
                  Create Habit
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Habits List with Calendar */}
        <div className="space-y-6">
          {habits.length === 0 ? (
            <Card className="p-12 bg-card border-border text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-4">Start building consistency by adding your first habit!</p>
              <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Add Your First Habit
              </Button>
            </Card>
          ) : (
            habits.map((habit) => {
              const habitStats = stats.find((s) => s.id === habit.id)
              const days = getDaysInMonthArray()
              const today = new Date()
              today.setHours(0, 0, 0, 0)

              return (
                <Card key={habit.id} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-4 h-4 rounded-full ${habit.color}`} />
                        <h3 className="text-xl font-bold text-foreground">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-sm text-muted-foreground">{habit.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="font-semibold text-foreground">{habit.currentStreak}</span>
                          <span>day streak</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Best: <span className="font-semibold text-foreground">{habit.longestStreak}</span> days
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">{habit.frequency}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHabit(habit.id)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground">
                        {selectedMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const prevMonth = new Date(selectedMonth)
                            prevMonth.setMonth(prevMonth.getMonth() - 1)
                            setSelectedMonth(prevMonth)
                          }}
                        >
                          ←
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMonth(new Date())}
                        >
                          Today
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const nextMonth = new Date(selectedMonth)
                            nextMonth.setMonth(nextMonth.getMonth() + 1)
                            setSelectedMonth(nextMonth)
                          }}
                        >
                          →
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {days.map((date, idx) => {
                        if (!date) {
                          return <div key={`empty-${idx}`} className="aspect-square" />
                        }

                        const isCompleted = isDateCompleted(habit.id, date)
                        const isToday = formatDate(date) === formatDate(today)
                        const isPast = date < today

                        return (
                          <button
                            key={formatDate(date)}
                            onClick={() => handleToggleDate(habit.id, date)}
                            className={`aspect-square rounded-lg border-2 transition-all ${
                              isCompleted
                                ? `${habit.color} border-foreground/20 text-white font-bold`
                                : isToday
                                  ? "bg-primary/10 border-primary text-primary"
                                  : isPast
                                    ? "bg-secondary/30 border-border/50 text-muted-foreground hover:border-primary/50"
                                    : "bg-secondary/20 border-border/30 text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Week Progress */}
                  {habitStats && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">This Week</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(habitStats.weekProgress)}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary/30 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${habit.color}`}
                          style={{ width: `${habitStats.weekProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>

        {/* Integration Info */}
        {(tasks.length > 0 || focusSessions.length > 0) && (
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Integration with Your Productivity
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Your habits are connected to your focus sessions and tasks. Completing focus sessions and tasks can
              help you maintain your habit streaks!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Focus Sessions</p>
                <p className="text-lg font-semibold text-foreground">{focusSessions.length} completed</p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Tasks Completed</p>
                <p className="text-lg font-semibold text-foreground">
                  {tasks.filter((t) => t.completed).length} / {tasks.length}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}


