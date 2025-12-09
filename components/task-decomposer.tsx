"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { AIProcessing } from "@/components/ui/skeleton"
import { useTaskStore } from "@/lib/store/slices/task-slice"
import {
  Sparkles,
  Split,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Lightbulb,
} from "lucide-react"

interface SubTask {
  title: string
  description?: string
  estimatedMinutes: number
  priority: "high" | "medium" | "low"
  order: number
  selected?: boolean
}

interface DecompositionResult {
  originalTask: string
  subTasks: SubTask[]
  totalEstimatedMinutes: number
  reasoning: string
  tips: string[]
}

interface TaskDecomposerProps {
  onTasksAdded?: () => void
  initialTask?: string
  compact?: boolean
}

export default function TaskDecomposer({ onTasksAdded, initialTask = "", compact = false }: TaskDecomposerProps) {
  const addTask = useTaskStore((state) => state.addTask)
  const [task, setTask] = useState(initialTask)
  const [context, setContext] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DecompositionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedTask, setEditedTask] = useState<SubTask | null>(null)

  const handleDecompose = async () => {
    if (!task.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/ai/decompose-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: task.trim(),
          context: context.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to decompose task")
      }

      const data = await response.json()

      // Add selected flag to all tasks
      data.subTasks = data.subTasks.map((t: SubTask) => ({ ...t, selected: true }))
      setResult(data)
    } catch (err) {
      setError("Failed to break down task. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTask = (index: number) => {
    if (!result) return
    const newSubTasks = [...result.subTasks]
    newSubTasks[index] = { ...newSubTasks[index], selected: !newSubTasks[index].selected }
    setResult({ ...result, subTasks: newSubTasks })
  }

  const handleEditTask = (index: number) => {
    if (!result) return
    setEditingIndex(index)
    setEditedTask({ ...result.subTasks[index] })
  }

  const handleSaveEdit = () => {
    if (!result || editingIndex === null || !editedTask) return
    const newSubTasks = [...result.subTasks]
    newSubTasks[editingIndex] = editedTask
    setResult({ ...result, subTasks: newSubTasks })
    setEditingIndex(null)
    setEditedTask(null)
  }

  const handleDeleteTask = (index: number) => {
    if (!result) return
    const newSubTasks = result.subTasks.filter((_, i) => i !== index)
    setResult({ ...result, subTasks: newSubTasks })
  }

  const handleAddAllTasks = async () => {
    if (!result) return

    const selectedTasks = result.subTasks.filter((t) => t.selected)

    for (const subTask of selectedTasks) {
      await addTask({
        title: subTask.title,
        description: subTask.description,
        priority: subTask.priority,
        timeEstimate: subTask.estimatedMinutes,
      })
    }

    setResult(null)
    setTask("")
    setContext("")
    onTasksAdded?.()
  }

  const selectedCount = result?.subTasks.filter((t) => t.selected).length || 0
  const totalMinutes = result?.subTasks
    .filter((t) => t.selected)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0) || 0

  const priorityColors = {
    high: "bg-error/10 text-error border-error/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-success/10 text-success border-success/20",
  }

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter a complex task to break down..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleDecompose()}
          />
          <Button
            onClick={handleDecompose}
            disabled={!task.trim() || isLoading}
            className="gap-2 gradient-bg text-white"
          >
            <Split className="w-4 h-4" />
            Break Down
          </Button>
        </div>

        {isLoading && <AIProcessing title="Breaking down" description="Breaking down your task..." />}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedCount} of {result.subTasks.length} tasks selected
              </span>
              <Button
                onClick={handleAddAllTasks}
                disabled={selectedCount === 0}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Selected
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {result.subTasks.map((subTask, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={subTask.selected}
                    onCheckedChange={() => handleToggleTask(index)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{subTask.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${priorityColors[subTask.priority]}`}>
                        {subTask.priority}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {subTask.estimatedMinutes}m
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Split className="w-6 h-6 text-primary" />
          AI Task Decomposer
        </h2>
        <p className="text-muted-foreground">Break down complex tasks into manageable sub-tasks</p>
      </div>

      {/* Input Section */}
      <GlassCard variant="vibrant">
        <GlassCardHeader>
          <GlassCardTitle>What's your task?</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Description</label>
            <Textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., Build a landing page for my new product with hero section, features, and signup form"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Context <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., Using React, deadline is Friday"
            />
          </div>

          <Button
            onClick={handleDecompose}
            disabled={!task.trim() || isLoading}
            className="w-full gradient-bg text-white"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Breaking Down Task...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Break Down Task with AI
              </>
            )}
          </Button>
        </GlassCardContent>
      </GlassCard>

      {/* Loading State */}
      {isLoading && <AIProcessing title="Analyzing" description="AI is analyzing your task and creating sub-tasks..." />}

      {/* Error State */}
      {error && (
        <Card className="p-4 border-error/50 bg-error/5">
          <div className="flex items-center gap-2 text-error">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6 fade-slide-in">
          {/* Summary */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold mb-1">Task Breakdown</h3>
                <p className="text-sm text-muted-foreground">"{result.originalTask}"</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono">{result.subTasks.length}</p>
                <p className="text-xs text-muted-foreground">sub-tasks</p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="p-3 rounded-lg bg-muted/50 mb-4">
              <p className="text-sm">{result.reasoning}</p>
            </div>

            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  Tips
                </p>
                <ul className="space-y-1">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Sub-tasks List */}
          <Card variant="default" className="overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Sub-tasks</h3>
                <span className="text-sm text-muted-foreground">
                  ({selectedCount} selected • {Math.round(totalMinutes / 60 * 10) / 10}h total)
                </span>
              </div>
              <Button
                onClick={handleAddAllTasks}
                disabled={selectedCount === 0}
                className="gap-2 gradient-bg text-white"
              >
                <Plus className="w-4 h-4" />
                Add {selectedCount} Tasks to Planner
              </Button>
            </div>

            <div className="divide-y divide-border">
              {result.subTasks.map((subTask, index) => (
                <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
                  {editingIndex === index && editedTask ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <Input
                        value={editedTask.title}
                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                        placeholder="Task title"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={editedTask.priority}
                          onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as "high" | "medium" | "low" })}
                          className="px-3 py-2 rounded-lg border bg-card text-sm"
                        >
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                        <Input
                          type="number"
                          value={editedTask.estimatedMinutes}
                          onChange={(e) => setEditedTask({ ...editedTask, estimatedMinutes: parseInt(e.target.value) || 30 })}
                          min="15"
                          max="240"
                          placeholder="Minutes"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit} size="sm" className="gap-1">
                          <Save className="w-3 h-3" />
                          Save
                        </Button>
                        <Button onClick={() => setEditingIndex(null)} variant="outline" size="sm" className="gap-1">
                          <X className="w-3 h-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={subTask.selected}
                        onCheckedChange={() => handleToggleTask(index)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium ${!subTask.selected ? "text-muted-foreground line-through" : ""}`}>
                            {subTask.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditTask(index)}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-error hover:text-error"
                              onClick={() => handleDeleteTask(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {subTask.description && (
                          <p className="text-sm text-muted-foreground mt-1">{subTask.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${priorityColors[subTask.priority]}`}>
                            {subTask.priority}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {subTask.estimatedMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

