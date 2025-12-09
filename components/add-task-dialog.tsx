"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"

interface AddTaskDialogProps {
  onAddTask: (task: { title: string; description?: string; priority: string; timeEstimate: number }) => void
}

export default function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [timeEstimate, setTimeEstimate] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onAddTask({ title, description: description.trim() || undefined, priority, timeEstimate })
      setTitle("")
      setDescription("")
      setPriority("medium")
      setTimeEstimate(1)
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full bg-primary hover:bg-primary/90 gap-2">
        <Plus className="w-4 h-4" />
        Add Task
      </Button>
    )
  }

  return (
    <Card className="p-6 bg-card border-border absolute inset-0 z-50 flex flex-col m-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Create New Task</h2>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Task Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description (optional)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details, links, or requirements"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[90px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Time (hours)</label>
            <Input
              type="number"
              value={timeEstimate}
              onChange={(e) => setTimeEstimate(Number.parseFloat(e.target.value) || 1)}
              min="0.5"
              max="8"
              step="0.5"
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
            Create Task
          </Button>
        </div>
      </form>
    </Card>
  )
}
