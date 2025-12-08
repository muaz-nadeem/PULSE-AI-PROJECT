"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"

interface Task {
  id: number
  title: string
  completed: boolean
  priority: string
  timeEstimate: number
}

interface TaskEditorProps {
  tasks: Task[]
  onAddTask: (task: Task) => void
  onDeleteTask: (id: number) => void
  onUpdateTask: (task: Task) => void
}

const priorityColors = {
  high: "bg-red-500/10 text-red-600 border-red-200",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  low: "bg-green-500/10 text-green-600 border-green-200",
}

export default function TaskEditor({ tasks, onAddTask, onDeleteTask, onUpdateTask }: TaskEditorProps) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("medium")
  const [newTaskTime, setNewTaskTime] = useState(1)

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Math.max(...tasks.map((t) => t.id), 0) + 1,
        title: newTaskTitle,
        completed: false,
        priority: newTaskPriority,
        timeEstimate: newTaskTime,
      }
      onAddTask(newTask)
      setNewTaskTitle("")
      setNewTaskPriority("medium")
      setNewTaskTime(1)
    }
  }

  const groupedTasks = {
    high: tasks.filter((t) => t.priority === "high"),
    medium: tasks.filter((t) => t.priority === "medium"),
    low: tasks.filter((t) => t.priority === "low"),
  }

  return (
    <div className="space-y-4">
      {/* Add task section */}
      <Card className="p-4 bg-card border-border">
        <h3 className="text-sm font-bold text-foreground mb-3">Add New Task</h3>
        <div className="space-y-3">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task description..."
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="px-2 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Input
              type="number"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(Number.parseFloat(e.target.value) || 1)}
              min="0.5"
              step="0.5"
              className="bg-input border-border text-foreground text-sm"
              placeholder="Hours"
            />
            <Button onClick={handleAddTask} className="bg-primary hover:bg-primary/90 gap-1">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Tasks by priority */}
      {(["high", "medium", "low"] as const).map((priority) => {
        const priorityTasks = groupedTasks[priority]
        if (priorityTasks.length === 0) return null

        return (
          <Card key={priority} className="p-4 bg-card border-border overflow-hidden">
            <div className="mb-3 pb-3 border-b border-border">
              <h3 className={`text-sm font-bold capitalize ${priorityColors[priority]}`}>
                {priority} Priority ({priorityTasks.length})
              </h3>
            </div>
            <div className="space-y-2">
              {priorityTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border transition-all ${
                    task.completed ? "bg-secondary/20 border-border/50 opacity-60" : "bg-secondary/30 border-border/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          task.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{task.timeEstimate}h estimate</p>
                    </div>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
