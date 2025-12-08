"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  X,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Trophy,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const GOAL_CATEGORIES = ["Career", "Health", "Learning", "Personal", "Financial", "Creative", "Other"]
const GOAL_COLORS = [
  { name: "Blue", value: "bg-blue-500", border: "border-blue-500", light: "bg-blue-500/10" },
  { name: "Green", value: "bg-green-500", border: "border-green-500", light: "bg-green-500/10" },
  { name: "Purple", value: "bg-purple-500", border: "border-purple-500", light: "bg-purple-500/10" },
  { name: "Orange", value: "bg-orange-500", border: "border-orange-500", light: "bg-orange-500/10" },
  { name: "Pink", value: "bg-pink-500", border: "border-pink-500", light: "bg-pink-500/10" },
  { name: "Teal", value: "bg-teal-500", border: "border-teal-500", light: "bg-teal-500/10" },
]

export default function Goals() {
  const {
    goals,
    addGoal,
    deleteGoal,
    updateGoal,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    toggleMilestone,
    getAISuggestions,
    tasks,
    habits,
  } = useStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Personal",
    targetDate: "",
    color: "bg-blue-500",
    milestones: [] as { title: string; description: string; dueDate: string }[],
  })
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
  })

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const totalProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      addGoal({
        title: newGoal.title.trim(),
        description: newGoal.description.trim() || undefined,
        category: newGoal.category,
        targetDate: newGoal.targetDate || undefined,
        color: newGoal.color,
        milestones: newGoal.milestones.map((m, idx) => ({
          id: "",
          title: m.title,
          description: m.description || undefined,
          completed: false,
          dueDate: m.dueDate || undefined,
          order: idx,
        })),
      })
      setNewGoal({
        title: "",
        description: "",
        category: "Personal",
        targetDate: "",
        color: "bg-blue-500",
        milestones: [],
      })
      setShowAddForm(false)
    }
  }

  const handleAddMilestone = (goalId: string) => {
    if (newMilestone.title.trim()) {
      addMilestone(goalId, {
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim() || undefined,
        completed: false,
        dueDate: newMilestone.dueDate || undefined,
      })
      setNewMilestone({ title: "", description: "", dueDate: "" })
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getDaysRemaining = (dateStr?: string) => {
    if (!dateStr) return null
    const targetDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Goals & Milestones</h1>
            <p className="text-muted-foreground mt-2">Set long-term goals and track your progress</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Goals</p>
                <p className="text-3xl font-bold text-primary">{activeGoals.length}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-accent">{completedGoals.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Progress</p>
                <p className="text-3xl font-bold text-foreground">{totalProgress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Milestones</p>
                <p className="text-3xl font-bold text-foreground">
                  {goals.reduce((sum, g) => sum + g.milestones.length, 0)}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Create New Goal</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Goal Title</label>
                <Input
                  placeholder="e.g., Learn React, Run Marathon, Start Business"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description (optional)</label>
                <Input
                  placeholder="Describe your goal in detail"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Target Date (optional)</label>
                  <Input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {GOAL_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewGoal({ ...newGoal, color: color.value })}
                        className={`w-8 h-8 rounded-full ${color.value} border-2 ${
                          newGoal.color === color.value ? "border-foreground scale-110" : "border-transparent"
                        } transition-all`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Initial Milestones */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Initial Milestones (optional)</label>
                <div className="space-y-2">
                  {newGoal.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(e) => {
                          const updated = [...newGoal.milestones]
                          updated[idx].title = e.target.value
                          setNewGoal({ ...newGoal, milestones: updated })
                        }}
                        className="flex-1 bg-secondary/50 border-border"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = newGoal.milestones.filter((_, i) => i !== idx)
                          setNewGoal({ ...newGoal, milestones: updated })
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewGoal({ ...newGoal, milestones: [...newGoal.milestones, { title: "", description: "", dueDate: "" }] })}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddGoal} className="flex-1 bg-primary hover:bg-primary/90">
                  Create Goal
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Active Goals</h2>
            {activeGoals.map((goal) => {
              const suggestions = getAISuggestions(goal.id)
              const daysRemaining = getDaysRemaining(goal.targetDate)
              const colorConfig = GOAL_COLORS.find((c) => c.value === goal.color) || GOAL_COLORS[0]

              return (
                <Card key={goal.id} className={`p-6 border-2 ${colorConfig.border} ${colorConfig.light}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-4 h-4 rounded-full ${goal.color}`} />
                        <h3 className="text-2xl font-bold text-foreground">{goal.title}</h3>
                        <span className="px-2 py-1 text-xs font-semibold bg-card rounded">{goal.category}</span>
                      </div>
                      {goal.description && <p className="text-muted-foreground mb-2">{goal.description}</p>}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {goal.targetDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(goal.targetDate)}</span>
                            {daysRemaining !== null && (
                              <span className={daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : ""}>
                                ({daysRemaining > 0 ? `${daysRemaining} days left` : daysRemaining === 0 ? "Due today" : `${Math.abs(daysRemaining)} days overdue`})
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{goal.progress}% Complete</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="w-full bg-secondary/30 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${goal.color}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {goal.milestones.filter((m) => m.completed).length} of {goal.milestones.length} milestones
                      </span>
                      <span>{goal.progress}%</span>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">Milestones</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Milestone
                      </Button>
                    </div>

                    {selectedGoal === goal.id && (
                      <Card className="p-4 mb-3 bg-card border-border">
                        <div className="space-y-3">
                          <Input
                            placeholder="Milestone title"
                            value={newMilestone.title}
                            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                            className="bg-secondary/50 border-border"
                          />
                          <Input
                            placeholder="Description (optional)"
                            value={newMilestone.description}
                            onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                            className="bg-secondary/50 border-border"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="date"
                              placeholder="Due date (optional)"
                              value={newMilestone.dueDate}
                              onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                              className="flex-1 bg-secondary/50 border-border"
                            />
                            <Button onClick={() => handleAddMilestone(goal.id)} className="bg-primary hover:bg-primary/90">
                              Add
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedGoal(null)
                                setNewMilestone({ title: "", description: "", dueDate: "" })
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}

                    <div className="space-y-2">
                      {goal.milestones.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No milestones yet. Add your first milestone to get started!
                        </p>
                      ) : (
                        goal.milestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${
                              milestone.completed
                                ? "bg-secondary/20 border-border/50 opacity-75"
                                : "bg-secondary/30 border-border hover:border-primary/50"
                            }`}
                          >
                            <Checkbox
                              checked={milestone.completed}
                              onCheckedChange={() => toggleMilestone(goal.id, milestone.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {milestone.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span
                                  className={`font-medium ${milestone.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                                >
                                  {milestone.title}
                                </span>
                              </div>
                              {milestone.description && (
                                <p className="text-sm text-muted-foreground mt-1 ml-6">{milestone.description}</p>
                              )}
                              {milestone.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 ml-6">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due: {formatDate(milestone.dueDate)}</span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMilestone(goal.id, milestone.id)}
                              className="h-6 w-6 text-muted-foreground hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  {suggestions.length > 0 && (
                    <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h5 className="font-semibold text-foreground">AI Suggestions</h5>
                      </div>
                      <ul className="space-y-1">
                        {suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Completed Goals</h2>
            {completedGoals.map((goal) => {
              const colorConfig = GOAL_COLORS.find((c) => c.value === goal.color) || GOAL_COLORS[0]
              return (
                <Card key={goal.id} className={`p-6 border-2 ${colorConfig.border} ${colorConfig.light} opacity-75`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-xl font-bold text-foreground">{goal.title}</h3>
                        <span className="px-2 py-1 text-xs font-semibold bg-card rounded">{goal.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Completed {goal.milestones.filter((m) => m.completed).length} of {goal.milestones.length} milestones
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Set your first long-term goal and break it down into achievable milestones!
            </p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Create Your First Goal
            </Button>
          </Card>
        )}

        {/* Integration Info */}
        {(tasks.length > 0 || habits.length > 0) && (
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Connect Goals with Daily Actions
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Link your daily tasks and habits to your goals. Each completed task and maintained habit brings you
              closer to achieving your milestones!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Tasks Completed</p>
                <p className="text-lg font-semibold text-foreground">
                  {tasks.filter((t) => t.completed).length} / {tasks.length}
                </p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Active Habits</p>
                <p className="text-lg font-semibold text-foreground">
                  {habits.filter((h) => h.currentStreak > 0).length} / {habits.length}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}


