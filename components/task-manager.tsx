"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Flag, X, Plus, Calendar } from "lucide-react"

export default function TaskManager() {
  const { tasks, addTask, deleteTask, toggleTask } = useStore()
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState<{
    title: string
    category: string
    priority: "high" | "medium" | "low"
    dueDate: string
    focusMode: boolean
  }>({
    title: "",
    category: "Work",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    focusMode: false,
  })

  const handleAddTask = () => {
    if (formData.title.trim()) {
      addTask({
        title: formData.title,
        priority: formData.priority,
        timeEstimate: 1, // Default time estimate
        category: formData.category,
        dueDate: formData.dueDate,
        focusMode: formData.focusMode,
      })
      setFormData({
        title: "",
        category: "Work",
        priority: "medium",
        dueDate: new Date().toISOString().split("T")[0],
        focusMode: false,
      })
      setShowAddTask(false)
    }
  }

  const priorityColors = {
    high: "text-red-500 bg-red-500/10 border-red-500/30",
    medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
    low: "text-green-500 bg-green-500/10 border-green-500/30",
  }

  const categoryColors = {
    Work: "bg-blue-500/10 text-blue-500",
    Study: "bg-purple-500/10 text-purple-500",
    Habit: "bg-green-500/10 text-green-500",
    Personal: "bg-pink-500/10 text-pink-500",
  }

  // Normalize date to YYYY-MM-DD format
  const normalizeDate = (date: string | Date | undefined): string | undefined => {
    if (!date) return undefined
    if (typeof date === "string") {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
      // Otherwise, try to parse it
      const parsed = new Date(date)
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0]
      }
    }
    if (date instanceof Date) {
      return date.toISOString().split("T")[0]
    }
    return undefined
  }

  const today = new Date().toISOString().split("T")[0]
  // Show tasks that are due today OR have no due date (treat as today's tasks)
  const todaysTasks = tasks.filter((task) => {
    if (!task.dueDate) return true // Tasks without due date show in today's list
    const normalizedDueDate = normalizeDate(task.dueDate)
    // Debug: uncomment to see what's happening
    // console.log("Task:", task.title, "dueDate:", task.dueDate, "normalized:", normalizedDueDate, "today:", today)
    return normalizedDueDate === today
  })
  const completedCount = todaysTasks.filter((task) => task.completed).length

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate)
    const firstDay = getFirstDayOfMonth(selectedDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayTasks = tasks.filter((task) => {
        if (!task.dueDate) return false
        const normalizedDueDate = normalizeDate(task.dueDate)
        return normalizedDueDate === dateStr
      })
      const isToday = dateStr === today

      days.push(
        <div
          key={`date-${dateStr}`}
          className={`text-center py-2 rounded cursor-pointer transition-colors ${
            isToday
              ? "bg-primary/20 border border-primary"
              : dayTasks.length > 0
                ? "bg-secondary/30 border border-border"
                : "border border-border/30 hover:border-border"
          }`}
        >
          <div className="text-sm font-medium text-foreground">{day}</div>
          {dayTasks.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Task Manager</h1>
        <p className="text-muted-foreground">Organize and track all your tasks in one place</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tasks Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Today */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Tasks Today</h2>
                <p className="text-sm text-muted-foreground">
                  {completedCount}/{todaysTasks.length} completed
                </p>
              </div>
              <Button onClick={() => setShowAddTask(true)} className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>

            {todaysTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tasks for today. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                      task.completed
                        ? "bg-secondary/20 border-border/50 opacity-60"
                        : "bg-secondary/30 border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <Checkbox 
                      checked={task.completed} 
                      onCheckedChange={() => toggleTask(task.id)} 
                      className="mt-1"
                      aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          task.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-1 rounded ${categoryColors[task.category as keyof typeof categoryColors]}`}
                        >
                          {task.category}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                            priorityColors[task.priority as keyof typeof priorityColors]
                          }`}
                        >
                          <Flag className="w-3 h-3" />
                          {task.priority}
                        </span>
                        {task.focusMode && (
                          <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">Focus Required</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-red-500 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Add Task Dialog */}
          {showAddTask && (
            <Card className="p-6 bg-card border-border border-accent">
              <h3 className="text-lg font-bold text-foreground mb-4">Add New Task</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                  <Input
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border text-foreground text-sm"
                    >
                      {["Work", "Study", "Habit", "Personal"].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as "high" | "medium" | "low" })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border text-foreground text-sm"
                    >
                      {["low", "medium", "high"].map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="bg-secondary/30 border-border text-foreground"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.focusMode}
                    onCheckedChange={(checked) => setFormData({ ...formData, focusMode: checked === true })}
                  />
                  <label className="text-sm font-medium text-foreground">Focus Mode Required</label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddTask} className="flex-1 bg-primary hover:bg-primary/90">
                    Save Task
                  </Button>
                  <Button onClick={() => setShowAddTask(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Calendar Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Calendar</h3>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                >
                  {"<"}
                </Button>
                <h4 className="font-semibold text-foreground">
                  {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                >
                  {">"}
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                  <div key={`day-${idx}`} className="text-xs font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>
          </Card>

          {/* Daily Tasks for Selected Date */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">
              Daily Tasks for {selectedDate.toLocaleDateString("default", { month: "short", day: "numeric" })}
            </h3>
            <div className="space-y-2">
              {tasks
                .filter((task) => {
                  if (!task.dueDate) return false // Tasks without due date don't show in calendar
                  const normalizedDueDate = normalizeDate(task.dueDate)
                  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
                  return normalizedDueDate === selectedDateStr
                })
                .slice(0, 5)
                .map((task) => (
                  <div key={task.id} className="flex items-start gap-2 p-2 rounded bg-secondary/20">
                    <Checkbox 
                      checked={task.completed} 
                      onCheckedChange={() => toggleTask(task.id)} 
                      className="mt-0.5"
                      aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
                    />
                    <p
                      className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {task.title}
                    </p>
                  </div>
                ))}
              {tasks.filter((task) => {
                if (!task.dueDate) return false
                const normalizedDueDate = normalizeDate(task.dueDate)
                const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
                return normalizedDueDate === selectedDateStr
              }).length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks on this date</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
