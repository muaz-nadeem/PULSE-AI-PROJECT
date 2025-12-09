"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Flag, X } from "lucide-react"
import { useTaskStore } from "@/lib/store/slices/task-slice"
import type { Task } from "@/lib/domain"

interface TaskListProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
}

const priorityColors = {
  high: "text-red-500 bg-red-500/10",
  medium: "text-yellow-500 bg-yellow-500/10",
  low: "text-green-500 bg-green-500/10",
}

export default function TaskList({ tasks, onToggleTask }: TaskListProps) {
  const deleteTask = useTaskStore((state) => state.deleteTask)

  return (
    <Card className="p-6 bg-card border-border h-fit sticky top-24">
      <h2 className="text-lg font-bold text-foreground mb-4">Tasks</h2>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${task.completed
              ? "bg-secondary/20 border-border/50 opacity-60"
              : "bg-secondary/30 border-border/50 hover:border-primary/50"
              }`}
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleTask(task.id)}
              className="mt-1"
              aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{task.timeEstimate}h</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${priorityColors[task.priority as keyof typeof priorityColors]
                    }`}
                >
                  <Flag className="w-3 h-3" />
                  {task.priority}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTask(task.id)}
              className="h-6 w-6 text-muted-foreground hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
